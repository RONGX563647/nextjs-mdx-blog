#include "minidistcache.h"
#include <ctype.h>

// 修剪字符串前后空格
static void trim(char* str) {
    if (!str || !str[0]) return;

    // 修剪前导空格
    char* start = str;
    while (isspace((unsigned char)*start)) start++;

    // 修剪尾随空格
    char* end = str + strlen(str) - 1;
    while (end > start && isspace((unsigned char)*end)) end--;

    // 重新赋值（包含终止符）
    memmove(str, start, end - start + 1);
    str[end - start + 1] = '\0';
}

// 解析一行配置（格式：key=value）
static void parse_line(char* line, Config* config) {
    if (!line || !config) return;

    // 跳过注释和空行
    if (line[0] == '#' || line[0] == '\0' || isspace((unsigned char)line[0])) return;

    // 分割key和value
    char* eq = strchr(line, '=');
    if (!eq) return;
    *eq = '\0'; // 分割key和value

    char* key = line;
    char* value = eq + 1;
    trim(key);
    trim(value);

    // 匹配配置项
    if (strcmp(key, "key_len") == 0) {
        config->key_len = atoi(value);
        if (config->key_len < 16) config->key_len = DEFAULT_KEY_LEN; // 最小16字节
    } else if (strcmp(key, "value_len") == 0) {
        config->value_len = atoi(value);
        if (config->value_len < 64) config->value_len = DEFAULT_VALUE_LEN; // 最小64字节
    } else if (strcmp(key, "cache_size") == 0) {
        config->cache_size = atoi(value);
        if (config->cache_size < 16) config->cache_size = DEFAULT_CACHE_SIZE; // 最小16个节点
    } else if (strcmp(key, "port") == 0) {
        config->port = atoi(value);
        if (config->port < 1024 || config->port > 65535) config->port = DEFAULT_PORT; // 合法端口范围
    } else if (strcmp(key, "persist_interval") == 0) {
        config->persist_interval = atoi(value);
        if (config->persist_interval < 60) config->persist_interval = DEFAULT_PERSIST_INTERVAL; // 最小60秒
    } else if (strcmp(key, "log_file") == 0) {
        strncpy(config->log_file, value, sizeof(config->log_file)-1);
    } else if (strcmp(key, "persist_file") == 0) {
        strncpy(config->persist_file, value, sizeof(config->persist_file)-1);
    }
}

// 初始化配置（加载ini文件或使用默认值）
Config* config_init(const char* conf_path) {
    Config* config = CACHE_MALLOC(sizeof(Config));
    if (!config) return NULL;

    // 设置默认值
    config->key_len = DEFAULT_KEY_LEN;
    config->value_len = DEFAULT_VALUE_LEN;
    config->cache_size = DEFAULT_CACHE_SIZE;
    config->port = DEFAULT_PORT;
    config->persist_interval = DEFAULT_PERSIST_INTERVAL;
    strcpy(config->log_file, DEFAULT_LOG_FILE);
    strcpy(config->persist_file, DEFAULT_PERSIST_FILE);

    // 加载配置文件（若路径有效）
    if (conf_path && conf_path[0]) {
        FILE* fp = fopen(conf_path, "r");
        if (!fp) {
            log_error("配置文件打开失败：%s，使用默认配置", conf_path);
            return config;
        }

        char line[256];
        while (fgets(line, sizeof(line), fp)) {
            // 移除换行符
            char* nl = strchr(line, '\n');
            if (nl) *nl = '\0';
            parse_line(line, config);
        }

        fclose(fp);
        log_info("配置文件加载成功：%s", conf_path);
    } else {
        log_info("未指定配置文件，使用默认配置");
    }

    // 打印配置信息
    log_info("当前配置：key_len=%d, value_len=%d, cache_size=%d, port=%d, persist_interval=%d, log_file=%s, persist_file=%s",
             config->key_len, config->value_len, config->cache_size, config->port,
             config->persist_interval, config->log_file, config->persist_file);

    return config;
}

// 释放配置
void config_free(Config* config) {
    if (config) {
        free(config);
        log_debug("配置内存释放成功");
    }
}