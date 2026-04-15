#include "minidistcache.h"

// 解析客户端请求（格式："SET key value [expire]"/"GET key"/"DELETE key"/"STAT"）
static void parse_request(const char* buffer, char* method, char* key, char* value, time_t* expire) {
    if (!buffer || !method) return;

    // 初始化默认值
    *expire = 0;
    method[0] = key[0] = value[0] = '\0';

    // 分割请求（最多4个字段：method key value expire）
    char buf[1024];
    strncpy(buf, buffer, sizeof(buf)-1);
    char* token = strtok(buf, " \t\n\r");
    if (!token) return;

    // 解析method
    strncpy(method, token, 15); // method最大长度15
    token = strtok(NULL, " \t\n\r");
    if (!token) return;

    // 解析key
    strncpy(key, token, g_config->key_len-1);
    token = strtok(NULL, " \t\n\r");
    if (!token) return;

    // 解析value（仅SET命令需要）
    if (strcmp(method, "SET") == 0) {
        strncpy(value, token, g_config->value_len-1);
        token = strtok(NULL, " \t\n\r");
        if (token) {
            // 解析expire（可选）
            *expire = atol(token);
        }
    }
}

// 处理客户端请求
static void handle_client(int client_fd, struct sockaddr_in client_addr) {
    if (client_fd < 0) return;

    char buffer[4096] = {0};
    ssize_t n = read(client_fd, buffer, sizeof(buffer)-1);
    if (n <= 0) {
        log_error("客户端读取失败：%s:%d", inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port));
        close(client_fd);
        return;
    }

    // 解析请求
    char method[16], key[DEFAULT_KEY_LEN], value[DEFAULT_VALUE_LEN];
    time_t expire;
    parse_request(buffer, method, key, value, &expire);

    // 处理请求并生成响应
    char response[4096] = {0};
    if (strcmp(method, "SET") == 0) {
        lru_put(g_cache, key, value, expire);
        snprintf(response, sizeof(response)-1, "OK: SET key=%s, value=%s, expire=%ld", key, value, expire);
    } else if (strcmp(method, "GET") == 0) {
        char* val = lru_get(g_cache, key);
        if (val) {
            snprintf(response, sizeof(response)-1, "OK: GET key=%s, value=%s", key, val);
        } else {
            snprintf(response, sizeof(response)-1, "ERROR: GET failed (key not found or expired)");
        }
    } else if (strcmp(method, "DELETE") == 0) {
        int ret = lru_delete(g_cache, key);
        if (ret) {
            snprintf(response, sizeof(response)-1, "OK: DELETE key=%s", key);
        } else {
            snprintf(response, sizeof(response)-1, "ERROR: DELETE failed (key not found)");
        }
    } else if (strcmp(method, "STAT") == 0) {
        // 统计信息：缓存大小、最大容量、命中率（简化：此处命中率为0，实际需维护访问计数）
        snprintf(response, sizeof(response)-1, "OK: STAT size=%d, max_size=%d, hit_rate=0%%",
                 g_cache->size, g_cache->max_size);
    } else {
        snprintf(response, sizeof(response)-1, "ERROR: Unknown method (support: SET/GET/DELETE/STAT)");
    }

    // 发送响应
    write(client_fd, response, strlen(response));
    log_info("客户端请求处理完成：%s:%d -> 请求=%s，响应=%s",
             inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port), buffer, response);

    // 关闭客户端连接
    close(client_fd);
}

// 客户端处理线程
static void* client_thread(void* arg) {
    // arg存储client_fd和client_addr
    typedef struct {
        int client_fd;
        struct sockaddr_in client_addr;
    } ClientArg;

    ClientArg* arg_ptr = (ClientArg*)arg;
    if (!arg_ptr) return NULL;

    // 处理客户端请求
    handle_client(arg_ptr->client_fd, arg_ptr->client_addr);

    // 释放参数内存
    free(arg_ptr);
    pthread_exit(NULL);
}

// 启动服务端
void server_start(Config* config) {
    if (!config) return;

    // 初始化全局缓存
    g_cache = lru_cache_init(config);
    if (!g_cache) {
        log_error("服务端启动失败：缓存初始化失败");
        return;
    }

    // 从持久化文件加载缓存
    cache_load(g_cache, config->persist_file);

    // 创建定时持久化线程
    pthread_t persist_tid;
    if (pthread_create(&persist_tid, NULL, persist_thread, g_cache) != 0) {
        log_error("定时持久化线程创建失败");
    } else {
        pthread_detach(persist_tid); // 分离线程，自动回收资源
    }

    // 创建TCP socket
    int server_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (server_fd < 0) {
        log_error("服务端启动失败：socket创建失败");
        lru_free(g_cache);
        return;
    }

    // 设置端口复用（避免服务重启时端口占用）
    int opt = 1;
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) != 0) {
        log_error("服务端警告：端口复用设置失败");
    }

    // 绑定地址和端口
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY; // 监听所有网卡
    server_addr.sin_port = htons(config->port);

    if (bind(server_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        log_error("服务端启动失败：绑定端口%d失败", config->port);
        close(server_fd);
        lru_free(g_cache);
        return;
    }

    // 开始监听（最大等待队列10）
    if (listen(server_fd, 10) < 0) {
        log_error("服务端启动失败：监听端口%d失败", config->port);
        close(server_fd);
        lru_free(g_cache);
        return;
    }

    log_info("服务端启动成功：监听端口%d，等待客户端连接...", config->port);

    // 循环接受客户端连接
    while (1) {
        struct sockaddr_in client_addr;
        socklen_t client_len = sizeof(client_addr);
        int client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);
        if (client_fd < 0) {
            log_error("服务端警告：接受客户端连接失败");
            continue;
        }

        log_info("新客户端连接：%s:%d，client_fd=%d",
                 inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port), client_fd);

        // 创建线程处理客户端请求
        ClientArg* arg = CACHE_MALLOC(sizeof(ClientArg));
        if (!arg) {
            log_error("服务端警告：客户端参数内存分配失败，关闭连接");
            close(client_fd);
            continue;
        }
        arg->client_fd = client_fd;
        arg->client_addr = client_addr;

        pthread_t tid;
        if (pthread_create(&tid, NULL, client_thread, arg) != 0) {
            log_error("服务端警告：客户端线程创建失败，关闭连接");
            free(arg);
            close(client_fd);
            continue;
        }
        pthread_detach(tid); // 分离线程，避免内存泄漏
    }

    // （理论上不会执行到这里）释放资源
    close(server_fd);
    lru_free(g_cache);
}