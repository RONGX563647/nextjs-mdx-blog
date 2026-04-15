#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <pthread.h>  // 类Unix原生多线程接口（系统库，非第三方）
#include <time.h>
#include <stdint.h>
#include <arpa/inet.h>
#include <stdarg.h>
#include <signal.h>   // 用于信号处理（程序退出释放资源）

// -------------------------- 配置参数（可修改） --------------------------
#define MAX_KEY_LEN     64          // 最大键长度
#define MAX_VALUE_LEN   1024        // 最大值长度
#define MAX_CACHE_SIZE  1024        // 最大缓存节点数（LRU淘汰阈值）
#define LISTEN_PORT     8888        // 服务端监听端口
#define BUFFER_SIZE     4096        // 网络缓冲区大小
#define LOG_FILE        "cache.log" // 日志文件路径
#define HASH_CAPACITY   (MAX_CACHE_SIZE * 2) // 哈希表容量（负载因子≈0.5）

// -------------------------- 数据结构定义 --------------------------
// 缓存节点（双向链表+哈希表共用）
typedef struct CacheNode {
    char key[MAX_KEY_LEN];
    char value[MAX_VALUE_LEN];
    time_t expire_time;         // 0=永不过期
    struct CacheNode* prev;     // LRU链表前驱
    struct CacheNode* next;     // LRU链表后继
    struct CacheNode* hash_next;// 哈希表冲突链表
} CacheNode;

// 哈希表（快速查找）
typedef struct {
    CacheNode** buckets;        // 哈希桶数组
    int capacity;               // 容量
    pthread_mutex_t mutex;      // 互斥锁（并发安全）
} HashTable;

// LRU缓存管理器（淘汰策略）
typedef struct {
    CacheNode* head;            // 最近访问节点
    CacheNode* tail;            // 最少访问节点
    int size;                   // 当前节点数
    int max_size;               // 最大节点数
    HashTable* hashtable;       // 关联哈希表
    pthread_mutex_t list_mutex; // LRU链表互斥锁（独立锁，减少竞争）
} LRUCache;

// 全局缓存实例（需在退出时销毁）
LRUCache* g_cache = NULL;
// 服务端监听socket（需在退出时关闭）
int g_server_fd = -1;

// -------------------------- 工具函数 --------------------------
/**
 * @brief 日志函数（支持DEBUG/INFO/ERROR三级）
 * @param level 日志级别（"DEBUG"/"INFO"/"ERROR"）
 * @param format 日志格式串
 * @param ... 可变参数
 */
void log_message(const char* level, const char* format, ...) {
    FILE* fp = fopen(LOG_FILE, "a");
    if (!fp) {
        fprintf(stderr, "[ERROR] 日志文件打开失败：%s\n", LOG_FILE);
        return;
    }

    // 时间戳（格式：2025-10-05 16:30:45）
    time_t now = time(NULL);
    struct tm* tm = localtime(&now);
    char time_buf[32] = {0};
    strftime(time_buf, sizeof(time_buf)-1, "%Y-%m-%d %H:%M:%S", tm);

    // 写入日志
    fprintf(fp, "[%s] [%s] ", time_buf, level);
    va_list args;
    va_start(args, format);
    vfprintf(fp, format, args);
    va_end(args);
    fprintf(fp, "\n");

    fclose(fp);
    // ERROR级日志同时输出到终端
    if (strcmp(level, "ERROR") == 0) {
        fprintf(stderr, "[%s] [%s] ", time_buf, level);
        va_start(args, format);
        vfprintf(stderr, format, args);
        va_end(args);
        fprintf(stderr, "\n");
    }
}

/**
 * @brief DJB2哈希函数（字符串哈希，冲突率低）
 * @param key 输入键（字符串）
 * @return 哈希值
 */
unsigned int hash_key(const char* key) {
    if (!key || *key == '\0') return 0;
    unsigned int hash = 5381;
    int c;
    while ((c = *key++)) {
        hash = ((hash << 5) + hash) + c; // hash * 33 + c（高效计算）
    }
    return hash;
}

/**
 * @brief 安全内存分配（初始化0+日志+错误处理）
 * @param size 分配大小（字节）
 * @param file 调用文件（__FILE__）
 * @param line 调用行号（__LINE__）
 * @return 分配的内存指针（NULL=失败）
 */
void* safe_malloc(size_t size, const char* file, int line) {
    void* ptr = malloc(size);
    if (!ptr) {
        log_message("ERROR", "内存分配失败：%zu字节（%s:%d）", size, file, line);
        return NULL;
    }
    memset(ptr, 0, size); // 初始化0，避免脏内存
    log_message("DEBUG", "内存分配成功：%p（%zu字节，%s:%d）", ptr, size, file, line);
    return ptr;
}
#define MALLOC(size) safe_malloc(size, __FILE__, __LINE__)

// -------------------------- 哈希表实现（含销毁） --------------------------
/**
 * @brief 初始化哈希表
 * @param capacity 哈希表容量
 * @return 哈希表指针（NULL=失败）
 */
HashTable* hashtable_init(int capacity) {
    HashTable* ht = (HashTable*)MALLOC(sizeof(HashTable));
    if (!ht) return NULL;

    ht->capacity = capacity;
    ht->buckets = (CacheNode**)MALLOC(sizeof(CacheNode*) * capacity);
    if (!ht->buckets) {
        free(ht);
        return NULL;
    }

    // 初始化互斥锁（默认属性）
    if (pthread_mutex_init(&ht->mutex, NULL) != 0) {
        log_message("ERROR", "哈希表互斥锁初始化失败");
        free(ht->buckets);
        free(ht);
        return NULL;
    }

    log_message("DEBUG", "哈希表初始化成功：容量=%d", capacity);
    return ht;
}

/**
 * @brief 哈希表查找（线程安全）
 * @param ht 哈希表指针
 * @param key 查找键
 * @return 节点指针（NULL=未找到）
 */
CacheNode* hashtable_find(HashTable* ht, const char* key) {
    if (!ht || !key) return NULL;

    pthread_mutex_lock(&ht->mutex);
    unsigned int idx = hash_key(key) % ht->capacity;
    CacheNode* node = ht->buckets[idx];
    while (node) {
        if (strcmp(node->key, key) == 0) {
            pthread_mutex_unlock(&ht->mutex);
            return node;
        }
        node = node->hash_next;
    }
    pthread_mutex_unlock(&ht->mutex);
    return NULL;
}

/**
 * @brief 哈希表插入（线程安全，头插法）
 * @param ht 哈希表指针
 * @param node 待插入节点
 * @return 0=成功，-1=失败
 */
int hashtable_insert(HashTable* ht, CacheNode* node) {
    if (!ht || !node || !node->key[0]) return -1;

    pthread_mutex_lock(&ht->mutex);
    unsigned int idx = hash_key(node->key) % ht->capacity;
    node->hash_next = ht->buckets[idx]; // 头插（效率高）
    ht->buckets[idx] = node;
    pthread_mutex_unlock(&ht->mutex);
    return 0;
}

/**
 * @brief 哈希表删除（线程安全）
 * @param ht 哈希表指针
 * @param key 待删除键
 * @return 0=成功，-1=未找到/失败
 */
int hashtable_remove(HashTable* ht, const char* key) {
    if (!ht || !key) return -1;

    pthread_mutex_lock(&ht->mutex);
    unsigned int idx = hash_key(key) % ht->capacity;
    CacheNode* prev = NULL;
    CacheNode* node = ht->buckets[idx];

    while (node) {
        if (strcmp(node->key, key) == 0) {
            if (prev) {
                prev->hash_next = node->hash_next;
            } else {
                ht->buckets[idx] = node->hash_next;
            }
            pthread_mutex_unlock(&ht->mutex);
            return 0;
        }
        prev = node;
        node = node->hash_next;
    }

    pthread_mutex_unlock(&ht->mutex);
    return -1; // 未找到
}

/**
 * @brief 销毁哈希表（释放所有资源）
 * @param ht 哈希表指针（会被置NULL）
 */
void hashtable_destroy(HashTable** ht) {
    if (!ht || !*ht) return;

    HashTable* tmp = *ht;
    // 销毁所有节点（需先加锁）
    pthread_mutex_lock(&tmp->mutex);
    for (int i = 0; i < tmp->capacity; i++) {
        CacheNode* node = tmp->buckets[i];
        while (node) {
            CacheNode* next = node->hash_next;
            free(node);
            node = next;
        }
    }
    pthread_mutex_unlock(&tmp->mutex);

    // 释放桶数组+互斥锁+哈希表
    free(tmp->buckets);
    pthread_mutex_destroy(&tmp->mutex);
    free(tmp);
    *ht = NULL;
    log_message("DEBUG", "哈希表销毁成功");
}

// -------------------------- LRU缓存实现（含销毁） --------------------------
/**
 * @brief 将LRU节点移到头部（标记最近访问，线程安全）
 * @param cache LRU缓存指针
 * @param node 待移动节点
 */
static void lru_move_to_head(LRUCache* cache, CacheNode* node) {
    if (!cache || !node || node == cache->head) return;

    pthread_mutex_lock(&cache->list_mutex);
    // 1. 从原位置移除节点
    if (node->prev) {
        node->prev->next = node->next;
    }
    if (node->next) {
        node->next->prev = node->prev;
    }
    // 若节点是尾节点，更新尾指针
    if (node == cache->tail) {
        cache->tail = node->prev;
    }

    // 2. 插入到头部
    node->prev = NULL;
    node->next = cache->head;
    if (cache->head) {
        cache->head->prev = node;
    }
    cache->head = node;
    // 若链表为空，尾指针也指向该节点
    if (!cache->tail) {
        cache->tail = node;
    }
    pthread_mutex_unlock(&cache->list_mutex);
}

/**
 * @brief 淘汰LRU尾部节点（最少访问，线程安全）
 * @param cache LRU缓存指针
 * @return 0=成功，-1=无节点可淘汰
 */
static int lru_evict_tail(LRUCache* cache) {
    if (!cache || !cache->tail) return -1;

    pthread_mutex_lock(&cache->list_mutex);
    CacheNode* tail = cache->tail;

    // 1. 从LRU链表删除
    if (tail->prev) {
        tail->prev->next = NULL;
    } else {
        cache->head = NULL; // 仅剩一个节点
    }
    cache->tail = tail->prev;
    cache->size--;
    pthread_mutex_unlock(&cache->list_mutex);

    // 2. 从哈希表删除
    if (hashtable_remove(cache->hashtable, tail->key) != 0) {
        log_message("WARN", "淘汰节点时哈希表删除失败：key=%s", tail->key);
    }

    // 3. 释放节点内存
    log_message("INFO", "LRU淘汰节点：key=%s", tail->key);
    free(tail);
    return 0;
}

/**
 * @brief 初始化LRU缓存
 * @param max_size 最大节点数（超过淘汰）
 * @param hash_capacity 关联哈希表容量
 * @return LRU缓存指针（NULL=失败）
 */
LRUCache* lru_cache_init(int max_size, int hash_capacity) {
    LRUCache* cache = (LRUCache*)MALLOC(sizeof(LRUCache));
    if (!cache) return NULL;

    // 初始化关联哈希表
    cache->hashtable = hashtable_init(hash_capacity);
    if (!cache->hashtable) {
        free(cache);
        return NULL;
    }

    // 初始化LRU链表互斥锁
    if (pthread_mutex_init(&cache->list_mutex, NULL) != 0) {
        log_message("ERROR", "LRU链表互斥锁初始化失败");
        hashtable_destroy(&cache->hashtable);
        free(cache);
        return NULL;
    }

    cache->head = NULL;
    cache->tail = NULL;
    cache->size = 0;
    cache->max_size = max_size;
    log_message("DEBUG", "LRU缓存初始化成功：最大节点数=%d", max_size);
    return cache;
}

/**
 * @brief 插入/更新缓存（线程安全）
 * @param cache LRU缓存指针
 * @param key 键
 * @param value 值
 * @param expire_seconds 过期时间（秒，0=永不过期）
 * @return 0=成功，-1=失败
 */
int lru_put(LRUCache* cache, const char* key, const char* value, time_t expire_seconds) {
    if (!cache || !key || !key[0] || !value) return -1;

    // 1. 检查是否已存在（存在则更新）
    CacheNode* node = hashtable_find(cache->hashtable, key);
    if (node) {
        pthread_mutex_lock(&cache->hashtable->mutex);
        strncpy(node->value, value, MAX_VALUE_LEN-1); // 留1字节存'\0'
        node->expire_time = expire_seconds > 0 ? time(NULL) + expire_seconds : 0;
        pthread_mutex_unlock(&cache->hashtable->mutex);
        lru_move_to_head(cache, node); // 标记最近访问
        log_message("INFO", "缓存更新成功：key=%s，过期时间=%ld", key, node->expire_time);
        return 0;
    }

    // 2. 新建节点
    node = (CacheNode*)MALLOC(sizeof(CacheNode));
    if (!node) return -1;
    strncpy(node->key, key, MAX_KEY_LEN-1);
    strncpy(node->value, value, MAX_VALUE_LEN-1);
    node->expire_time = expire_seconds > 0 ? time(NULL) + expire_seconds : 0;
    node->prev = node->next = node->hash_next = NULL;

    // 3. 插入哈希表和LRU链表
    if (hashtable_insert(cache->hashtable, node) != 0) {
        log_message("ERROR", "缓存插入哈希表失败：key=%s", key);
        free(node);
        return -1;
    }

    pthread_mutex_lock(&cache->list_mutex);
    lru_move_to_head(cache, node);
    cache->size++;
    pthread_mutex_unlock(&cache->list_mutex);

    // 4. 超过最大容量，淘汰尾部节点
    while (cache->size > cache->max_size) {
        if (lru_evict_tail(cache) != 0) {
            log_message("ERROR", "LRU淘汰节点失败（无节点可淘汰）");
            break;
        }
    }

    log_message("INFO", "缓存插入成功：key=%s，过期时间=%ld", key, node->expire_time);
    return 0;
}

/**
 * @brief 获取缓存（线程安全，自动清理过期节点）
 * @param cache LRU缓存指针
 * @param key 键
 * @return 值指针（NULL=未找到/过期）
 */
char* lru_get(LRUCache* cache, const char* key) {
    if (!cache || !key || !key[0]) return NULL;

    // 1. 查找节点
    CacheNode* node = hashtable_find(cache->hashtable, key);
    if (!node) {
        log_message("DEBUG", "缓存未找到：key=%s", key);
        return NULL;
    }

    // 2. 检查是否过期
    time_t now = time(NULL);
    pthread_mutex_lock(&cache->hashtable->mutex);
    int is_expired = (node->expire_time > 0) && (node->expire_time < now);
    pthread_mutex_unlock(&cache->hashtable->mutex);

    if (is_expired) {
        // 过期：从LRU和哈希表删除
        pthread_mutex_lock(&cache->list_mutex);
        if (node->prev) node->prev->next = node->next;
        if (node->next) node->next->prev = node->prev;
        if (node == cache->head) cache->head = node->next;
        if (node == cache->tail) cache->tail = node->prev;
        cache->size--;
        pthread_mutex_unlock(&cache->list_mutex);

        hashtable_remove(cache->hashtable, key);
        log_message("INFO", "缓存已过期并删除：key=%s", key);
        free(node);
        return NULL;
    }

    // 3. 未过期：标记最近访问
    lru_move_to_head(cache, node);
    log_message("DEBUG", "缓存获取成功：key=%s，value=%s", key, node->value);
    return node->value;
}

/**
 * @brief 删除缓存（线程安全）
 * @param cache LRU缓存指针
 * @param key 键
 * @return 0=成功，-1=未找到/失败
 */
int lru_delete(LRUCache* cache, const char* key) {
    if (!cache || !key || !key[0]) return -1;

    // 1. 查找节点
    CacheNode* node = hashtable_find(cache->hashtable, key);
    if (!node) {
        log_message("DEBUG", "缓存删除失败：key=%s（未找到）", key);
        return -1;
    }

    // 2. 从LRU链表删除
    pthread_mutex_lock(&cache->list_mutex);
    if (node->prev) node->prev->next = node->next;
    if (node->next) node->next->prev = node->prev;
    if (node == cache->head) cache->head = node->next;
    if (node == cache->tail) cache->tail = node->prev;
    cache->size--;
    pthread_mutex_unlock(&cache->list_mutex);

    // 3. 从哈希表删除
    if (hashtable_remove(cache->hashtable, key) != 0) {
        log_message("WARN", "缓存删除时哈希表操作失败：key=%s", key);
    }

    // 4. 释放节点
    log_message("INFO", "缓存删除成功：key=%s", key);
    free(node);
    return 0;
}

/**
 * @brief 销毁LRU缓存（释放所有资源）
 * @param cache LRU缓存指针（会被置NULL）
 */
void lru_cache_destroy(LRUCache** cache) {
    if (!cache || !*cache) return;

    LRUCache* tmp = *cache;
    // 1. 销毁哈希表（已包含节点释放）
    hashtable_destroy(&tmp->hashtable);
    // 2. 销毁LRU链表互斥锁
    pthread_mutex_destroy(&tmp->list_mutex);
    // 3. 释放缓存结构体
    free(tmp);
    *cache = NULL;
    log_message("DEBUG", "LRU缓存销毁成功");
}

// -------------------------- 网络服务端（多线程处理） --------------------------
/**
 * @brief 解析客户端请求（格式：SET key value [expire]/GET key/DELETE key）
 * @param buffer 客户端请求缓冲区
 * @param method 输出：请求方法（SET/GET/DELETE）
 * @param key 输出：键
 * @param value 输出：值（仅SET有效）
 * @param expire 输出：过期时间（秒，仅SET有效，默认0）
 */
static void parse_request(const char* buffer, char* method, char* key, char* value, time_t* expire) {
    *expire = 0;
    method[0] = key[0] = value[0] = '\0';
    // 按空格分割参数（最多4个：SET key value expire）
    sscanf(buffer, "%15s %63s %1023s %ld", method, key, value, expire);
    // 确保方法大写（兼容客户端输入）
    for (int i = 0; method[i]; i++) {
        method[i] = toupper(method[i]);
    }
}

/**
 * @brief 处理单个客户端请求（线程函数）
 * @param arg 客户端socket文件描述符（需手动释放）
 * @return NULL
 */
static void* handle_client(void* arg) {
    int client_fd = *(int*)arg;
    free(arg); // 释放传递的socket指针（避免内存泄漏）

    char buffer[BUFFER_SIZE] = {0};
    // 读取客户端请求（最多读BUFFER_SIZE-1字节，留1字节存'\0'）
    ssize_t recv_len = read(client_fd, buffer, BUFFER_SIZE-1);
    if (recv_len <= 0) {
        log_message("ERROR", "读取客户端数据失败：fd=%d", client_fd);
        close(client_fd);
        pthread_exit(NULL);
    }

    // 解析请求
    char method[16] = {0}, key[MAX_KEY_LEN] = {0}, value[MAX_VALUE_LEN] = {0};
    time_t expire = 0;
    parse_request(buffer, method, key, value, &expire);
    log_message("DEBUG", "收到客户端请求：fd=%d，method=%s，key=%s", client_fd, method, key);

    // 处理请求并构建响应
    char response[BUFFER_SIZE] = {0};
    if (strcmp(method, "SET") == 0) {
        if (lru_put(g_cache, key, value, expire) == 0) {
            snprintf(response, BUFFER_SIZE-1, "OK: SET %s SUCCESS", key);
        } else {
            snprintf(response, BUFFER_SIZE-1, "ERROR: SET %s FAILED", key);
        }
    } else if (strcmp(method, "GET") == 0) {
        char* val = lru_get(g_cache, key);
        if (val) {
            snprintf(response, BUFFER_SIZE-1, "OK: GET %s = %s", key, val);
        } else {
            snprintf(response, BUFFER_SIZE-1, "ERROR: GET %s NOT FOUND/EXPIRED", key);
        }
    } else if (strcmp(method, "DELETE") == 0) {
        if (lru_delete(g_cache, key) == 0) {
            snprintf(response, BUFFER_SIZE-1, "OK: DELETE %s SUCCESS", key);
        } else {
            snprintf(response, BUFFER_SIZE-1, "ERROR: DELETE %s NOT FOUND", key);
        }
    } else {
        snprintf(response, BUFFER_SIZE-1, "ERROR: UNKNOWN METHOD %s", method);
    }

    // 发送响应给客户端
    ssize_t send_len = write(client_fd, response, strlen(response));
    if (send_len <= 0) {
        log_message("ERROR", "发送响应失败：fd=%d", client_fd);
    } else {
        log_message("INFO", "处理请求完成：fd=%d，请求=%s，响应=%s", client_fd, buffer, response);
    }

    // 关闭客户端socket（TCP四次挥手）
    close(client_fd);
    pthread_exit(NULL);
}

/**
 * @brief 启动TCP服务端（监听+接受连接+创建线程处理）
 * @return 0=成功（不会返回，除非出错），-1=失败
 */
int start_server() {
    // 1. 创建TCP socket（SOCK_STREAM=流式socket，IPPROTO_TCP=TCP协议）
    g_server_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (g_server_fd < 0) {
        log_message("ERROR", "创建socket失败：%m"); // %m=输出系统错误信息
        return -1;
    }

    // 2. 设置端口复用（避免服务重启时"地址已在使用"错误）
    int opt = 1;
    if (setsockopt(g_server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) != 0) {
        log_message("WARN", "设置端口复用失败：%m");
    }

    // 3. 绑定IP和端口（INADDR_ANY=监听所有网卡）
    struct sockaddr_in server_addr = {0};
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = htonl(INADDR_ANY); // 主机字节序转网络字节序
    server_addr.sin_port = htons(LISTEN_PORT);        // 短整型转网络字节序

    if (bind(g_server_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) != 0) {
        log_message("ERROR", "绑定端口失败：%d（%m）", LISTEN_PORT);
        close(g_server_fd);
        g_server_fd = -1;
        return -1;
    }

    // 4. 开始监听（等待队列大小10，超过则拒绝新连接）
    if (listen(g_server_fd, 10) != 0) {
        log_message("ERROR", "监听端口失败：%d（%m）", LISTEN_PORT);
        close(g_server_fd);
        g_server_fd = -1;
        return -1;
    }

    log_message("INFO", "服务端启动成功：监听端口 %d（fd=%d）", LISTEN_PORT, g_server_fd);

    // 5. 循环接受客户端连接（阻塞式）
    while (1) {
        struct sockaddr_in client_addr = {0};
        socklen_t client_addr_len = sizeof(client_addr);
        // 接受连接（返回客户端socket fd）
        int client_fd = accept(g_server_fd, (struct sockaddr*)&client_addr, &client_addr_len);
        if (client_fd < 0) {
            log_message("ERROR", "接受连接失败：%m");
            continue;
        }

        // 打印客户端信息（inet_ntoa=网络字节序IP转字符串）
        log_message("INFO", "新客户端连接：%s:%d（fd=%d）",
                   inet_ntoa(client_addr.sin_addr), ntohs(client_addr.sin_port), client_fd);

        // 6. 创建线程处理客户端请求（分离线程，自动回收资源）
        pthread_t tid;
        int* p_client_fd = (int*)MALLOC(sizeof(int));
        *p_client_fd = client_fd;
        if (pthread_create(&tid, NULL, handle_client, p_client_fd) != 0) {
            log_message("ERROR", "创建线程失败：fd=%d", client_fd);
            free(p_client_fd);
            close(client_fd);
            continue;
        }
        // 分离线程（无需pthread_join，线程退出后自动释放资源）
        pthread_detach(tid);
    }

    // 理论上不会走到这里（循环是死循环）
    close(g_server_fd);
    g_server_fd = -1;
    return 0;
}

// -------------------------- 客户端工具（可选，用于测试） --------------------------
/**
 * @brief 启动客户端（发送命令到服务端）
 * @param server_ip 服务端IP（如"127.0.0.1"）
 * @param command 命令（如"SET name Alice 300"）
 * @return 0=成功，-1=失败
 */
int start_client(const char* server_ip, const char* command) {
    if (!server_ip || !command) return -1;

    // 1. 创建客户端socket
    int sock_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
    if (sock_fd < 0) {
        printf("ERROR: 创建socket失败\n");
        return -1;
    }

    // 2. 配置服务端地址
    struct sockaddr_in server_addr = {0};
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(LISTEN_PORT);
    // 字符串IP转网络字节序（inet_pton支持IPv4/IPv6）
    if (inet_pton(AF_INET, server_ip, &server_addr.sin_addr) <= 0) {
        printf("ERROR: 无效的IP地址：%s\n", server_ip);
        close(sock_fd);
        return -1;
    }

    // 3. 连接服务端（阻塞式，直到连接成功或失败）
    if (connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) != 0) {
        printf("ERROR: 连接服务端失败：%s:%d\n", server_ip, LISTEN_PORT);
        close(sock_fd);
        return -1;
    }

    // 4. 发送命令
    ssize_t send_len = write(sock_fd, command, strlen(command));
    if (send_len <= 0) {
        printf("ERROR: 发送命令失败\n");
        close(sock_fd);
        return -1;
    }

    // 5. 接收响应
    char buffer[BUFFER_SIZE] = {0};
    ssize_t recv_len = read(sock_fd, buffer, BUFFER_SIZE-1);
    if (recv_len <= 0) {
        printf("ERROR: 接收响应失败\n");
    } else {
        printf("服务端响应：%s\n", buffer);
    }

    // 6. 关闭socket
    close(sock_fd);
    return 0;
}

// -------------------------- 信号处理（程序退出释放资源） --------------------------
/**
 * @brief 信号处理函数（捕获SIGINT（Ctrl+C），释放资源后退出）
 * @param sig 信号值（此处为SIGINT）
 */
static void sig_handler(int sig) {
    if (sig != SIGINT) return;

    log_message("INFO", "收到退出信号（Ctrl+C），开始释放资源...");
    // 1. 关闭服务端监听socket
    if (g_server_fd >= 0) {
        close(g_server_fd);
        g_server_fd = -1;
        log_message("DEBUG", "服务端socket已关闭");
    }
    // 2. 销毁LRU缓存（含哈希表和节点）
    lru_cache_destroy(&g_cache);
    log_message("INFO", "所有资源释放完成，程序退出");
    exit(0);
}

// -------------------------- 主函数（入口） --------------------------
int main(int argc, char* argv[]) {
    // 1. 注册信号处理（捕获Ctrl+C，避免内存泄漏）
    if (signal(SIGINT, sig_handler) == SIG_ERR) {
        log_message("WARN", "信号处理函数注册失败：%m");
    }

    // 2. 初始化全局LRU缓存
    g_cache = lru_cache_init(MAX_CACHE_SIZE, HASH_CAPACITY);
    if (!g_cache) {
        log_message("ERROR", "LRU缓存初始化失败，程序退出");
        return 1;
    }

    // 3. 区分服务端/客户端模式
    if (argc == 1) {
        // 服务端模式（无参数）
        if (start_server() != 0) {
            log_message("ERROR", "服务端启动失败，程序退出");
            lru_cache_destroy(&g_cache);
            return 1;
        }
    } else if (argc == 3) {
        // 客户端模式（参数：./program 服务端IP 命令）
        int ret = start_client(argv[1], argv[2]);
        lru_cache_destroy(&g_cache); // 客户端无需缓存，直接销毁
        return ret == 0 ? 0 : 1;
    } else {
        // 参数错误，打印用法
        printf("用法：\n");
        printf("  服务端：%s\n", argv[0]);
        printf("  客户端：%s <服务端IP> <命令>\n", argv[0]);
        printf("命令示例：\n");
        printf("  SET：%s 127.0.0.1 \"SET name Alice 300\" （300秒后过期）\n", argv[0]);
        printf("  GET：%s 127.0.0.1 \"GET name\"\n", argv[0]);
        printf("  DELETE：%s 127.0.0.1 \"DELETE name\"\n", argv[0]);
        lru_cache_destroy(&g_cache);
        return 1;
    }

    return 0;
}