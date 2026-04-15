#include "minidistcache.h"

// 全局变量初始化
LRUCache* g_cache = NULL;
Config* g_config = NULL;

// 信号处理函数（优雅退出：释放资源）
static void sig_handler(int sig) {
    log_info("接收到信号%d，服务端准备退出...", sig);

    // 保存缓存到文件
    if (g_cache && g_config) {
        cache_save(g_cache, g_config->persist_file);
    }

    // 释放缓存
    if (g_cache) {
        lru_free(g_cache);
        g_cache = NULL;
    }

    // 释放配置
    if (g_config) {
        config_free(g_config);
        g_config = NULL;
    }

    // 释放持久化互斥锁
    pthread_mutex_destroy(&g_persist_mutex);

    log_info("服务端优雅退出完成");
    exit(0);
}

int main(int argc, char* argv[]) {
    // 注册信号处理（Ctrl+C、终止信号）
    signal(SIGINT, sig_handler);
    signal(SIGTERM, sig_handler);

    // 解析命令行参数
    // 用法：
    // 服务端：./minidistcache -s [config_path]
    // 客户端：./minidistcache -c server_ip port "command"
    if (argc < 2) {
        fprintf(stderr, "用法：\n");
        fprintf(stderr, "  服务端：%s -s [配置文件路径（可选）]\n", argv[0]);
        fprintf(stderr, "  客户端：%s -c <服务器IP> <端口> <命令>\n", argv[0]);
        fprintf(stderr, "  命令示例：SET name Alice 300（300秒过期）、GET name、DELETE name、STAT\n");
        return 1;
    }

    // 初始化全局配置（默认配置或加载文件）
    const char* conf_path = (argc >= 3 && strcmp(argv[1], "-s") == 0) ? argv[2] : NULL;
    g_config = config_init(conf_path);
    if (!g_config) {
        fprintf(stderr, "主函数失败：配置初始化失败\n");
        return 1;
    }

    // 启动服务端或客户端
    if (strcmp(argv[1], "-s") == 0) {
        // 服务端模式
        server_start(g_config);
    } else if (strcmp(argv[1], "-c") == 0) {
        // 客户端模式（需要4个参数：-c ip port command）
        if (argc != 5) {
            fprintf(stderr, "客户端参数错误：%s -c <服务器IP> <端口> <命令>\n", argv[0]);
            config_free(g_config);
            return 1;
        }
        const char* server_ip = argv[2];
        int port = atoi(argv[3]);
        const char* command = argv[4];
        client_run(server_ip, port, command);
        config_free(g_config);
    } else {
        fprintf(stderr, "无效模式：支持-s（服务端）或-c（客户端）\n");
        config_free(g_config);
        return 1;
    }

    return 0;
}