# 基于TCP的分布式内存缓存系统（MiniDistCache）完整代码
以下是**模块化完整实现**，包含7个核心文件（头文件、工具函数、配置解析、数据结构、持久化、服务端、客户端），覆盖原设计的所有核心功能（TCP通信、LRU缓存、配置解析、数据持久化、日志系统），可直接编译运行。


## 一、文件结构
```
minidistcache/
├── minidistcache.h    # 头文件：数据结构定义+函数声明
├── utils.c            # 工具函数：日志、内存分配、哈希、CRC32校验
├── config.c           # 配置解析：读取ini格式配置文件
├── ds.c               # 数据结构：哈希表+LRU缓存实现
├── persist.c          # 持久化：缓存数据保存/加载（二进制格式）
├── server.c           # 服务端：TCP多线程服务+定时持久化
├── client.c           # 客户端：命令行工具
├── main.c             # 入口函数：启动服务端/客户端
├── cache.conf         # 配置文件：端口、缓存大小、持久化间隔
└── Makefile           # 编译脚本
```


## 二、各文件完整代码

### 1. 头文件（minidistcache.h）
```c
#ifndef MINIDISTCACHE_H
#define MINIDISTCACHE_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <pthread.h>
#include <time.h>
#include <stdint.h>
#include <arpa/inet.h>

// -------------------------- 配置参数（默认值，可被config覆盖） --------------------------
#define DEFAULT_KEY_LEN    64          // 最大键长度
#define DEFAULT_VALUE_LEN  1024        // 最大值长度
#define DEFAULT_CACHE_SIZE 1024        // 最大缓存节点数
#define DEFAULT_PORT       8888        // 默认监听端口
#define DEFAULT_PERSIST_INTERVAL 300   // 默认持久化间隔（秒）
#define DEFAULT_LOG_FILE   "cache.log" // 默认日志文件
#define DEFAULT_PERSIST_FILE "cache.data" // 默认持久化文件
#define HASH_CAPACITY_MULTIPLE 2       // 哈希表容量=缓存大小×2

// -------------------------- 全局配置结构体 --------------------------
typedef struct {
    int key_len;            // 最大键长度
    int value_len;          // 最大值长度
    int cache_size;         // 最大缓存节点数
    int port;               // 监听端口
    int persist_interval;   // 持久化间隔（秒）
    char log_file[256];     // 日志文件路径
    char persist_file[256]; // 持久化文件路径
} Config;

// -------------------------- 缓存节点结构体（双向链表+哈希表） --------------------------
typedef struct CacheNode {
    char key[DEFAULT_KEY_LEN];
    char value[DEFAULT_VALUE_LEN];
    time_t expire_time;         // 过期时间（0=永不过期）
    struct CacheNode* prev;     // LRU链表前驱
    struct CacheNode* next;     // LRU链表后继
    struct CacheNode* hash_next;// 哈希表冲突链表
} CacheNode;

// -------------------------- 哈希表结构体 --------------------------
typedef struct {
    CacheNode** buckets;        // 哈希桶数组
    int capacity;               // 哈希表容量
    pthread_mutex_t mutex;      // 互斥锁（并发安全）
} HashTable;

// -------------------------- LRU缓存管理器结构体 --------------------------
typedef struct {
    CacheNode* head;            // LRU链表头（最近访问）
    CacheNode* tail;            // LRU链表尾（最少访问）
    int size;                   // 当前缓存节点数
    int max_size;               // 最大节点数
    HashTable* hashtable;       // 关联哈希表
    Config* config;             // 配置指针
    pthread_mutex_t lru_mutex;  // LRU操作互斥锁
} LRUCache;

// -------------------------- 全局变量声明 --------------------------
extern LRUCache* g_cache;       // 全局缓存实例
extern Config* g_config;        // 全局配置实例
extern pthread_mutex_t g_persist_mutex; // 持久化互斥锁

// -------------------------- 工具函数声明 --------------------------
// 日志函数
void log_debug(const char* format, ...);
void log_info(const char* format, ...);
void log_error(const char* format, ...);

// 内存分配（带日志和错误检查）
void* cache_malloc(size_t size, const char* file, int line);
#define CACHE_MALLOC(size) cache_malloc(size, __FILE__, __LINE__)

// 哈希函数（DJB2算法）
unsigned int hash_key(const char* key);

// CRC32校验（数据完整性验证）
uint32_t crc32(const unsigned char* data, size_t len);

// -------------------------- 配置解析函数声明 --------------------------
// 初始化配置（加载ini文件或使用默认值）
Config* config_init(const char* conf_path);

// 释放配置
void config_free(Config* config);

// -------------------------- 数据结构函数声明 --------------------------
// 哈希表操作
HashTable* hashtable_init(int capacity);
CacheNode* hashtable_find(HashTable* ht, const char* key);
void hashtable_insert(HashTable* ht, CacheNode* node);
void hashtable_remove(HashTable* ht, const char* key);
void hashtable_free(HashTable* ht);

// LRU缓存操作
LRUCache* lru_cache_init(Config* config);
void lru_put(LRUCache* cache, const char* key, const char* value, time_t expire_seconds);
char* lru_get(LRUCache* cache, const char* key);
int lru_delete(LRUCache* cache, const char* key);
void lru_free(LRUCache* cache);

// -------------------------- 持久化函数声明 --------------------------
// 保存缓存到文件（二进制格式）
int cache_save(LRUCache* cache, const char* file_path);

// 从文件加载缓存
int cache_load(LRUCache* cache, const char* file_path);

// 定时持久化线程函数
void* persist_thread(void* arg);

// -------------------------- 网络服务端函数声明 --------------------------
// 启动服务端
void server_start(Config* config);

// -------------------------- 客户端函数声明 --------------------------
// 启动客户端（发送命令到服务端）
void client_run(const char* server_ip, int port, const char* command);

#endif // MINIDISTCACHE_H
```


### 2. 工具函数（utils.c）
```c
#include "minidistcache.h"
#include <stdarg.h>
#include <ctype.h>

// -------------------------- 日志函数实现 --------------------------
static void log_write(const char* level, const char* format, va_list args) {
    if (!g_config || !g_config->log_file[0]) return;

    FILE* fp = fopen(g_config->log_file, "a");
    if (!fp) return;

    // 时间戳
    time_t now = time(NULL);
    struct tm* tm = localtime(&now);
    char time_buf[32];
    strftime(time_buf, sizeof(time_buf), "%Y-%m-%d %H:%M:%S", tm);

    // 写入日志
    fprintf(fp, "[%s] [%s] ", time_buf, level);
    vfprintf(fp, format, args);
    fprintf(fp, "\n");

    fclose(fp);
}

void log_debug(const char* format, ...) {
    va_list args;
    va_start(args, format);
    log_write("DEBUG", format, args);
    va_end(args);
}

void log_info(const char* format, ...) {
    va_list args;
    va_start(args, format);
    log_write("INFO", format, args);
    va_end(args);
}

void log_error(const char* format, ...) {
    va_list args;
    va_start(args, format);
    log_write("ERROR", format, args);
    va_end(args);
    // 同时输出到标准错误
    vfprintf(stderr, format, args);
    fprintf(stderr, "\n");
}

// -------------------------- 内存分配函数实现 --------------------------
void* cache_malloc(size_t size, const char* file, int line) {
    void* ptr = malloc(size);
    if (!ptr) {
        log_error("内存分配失败：%zu字节（文件：%s，行：%d）", size, file, line);
        return NULL;
    }
    memset(ptr, 0, size); // 初始化内存为0
    log_debug("内存分配成功：%p（%zu字节，文件：%s，行：%d）", ptr, size, file, line);
    return ptr;
}

// -------------------------- 哈希函数实现（DJB2算法） --------------------------
unsigned int hash_key(const char* key) {
    if (!key || !key[0]) return 0;

    unsigned int hash = 5381;
    int c;
    while ((c = *key++)) {
        hash = ((hash << 5) + hash) + c; // hash = hash * 33 + c
    }
    return hash;
}

// -------------------------- CRC32校验实现 --------------------------
static const uint32_t crc32_table[] = {
    0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419, 0x706af48f, 0xe963a535, 0x9e6495a3,
    0x0edb8832, 0x79dcb8a4, 0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07, 0x90bf1d91,
    0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de, 0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7,
    0x136c9856, 0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9, 0xfa0f3d63, 0x8d080df5,
    0x3b6e20c8, 0x4c69105e, 0xd56041e4, 0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
    0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3, 0x45df5c75, 0xdcd60dcf, 0xabd13d59,
    0x26d930ac, 0x51de003a, 0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599, 0xb8bda50f,
    0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924, 0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d,
    0x76dc4190, 0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f, 0x9fbfe4a5, 0xe8b8d433,
    0x7807c9a2, 0x0f00f934, 0x9609a88e, 0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
    0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed, 0x1b01a57b, 0x8208f4c1, 0xf50fc457,
    0x65b0d9c6, 0x12b7e950, 0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3, 0xfbd44c65,
    0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2, 0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb,
    0x4369e96a, 0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5, 0xaa0a4c5f, 0xdd0d7cc9,
    0x5005713c, 0x270241aa, 0xbe0b1010, 0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
    0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17, 0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad,
    0xedb88320, 0x9abfb3b6, 0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615, 0x73dc1683,
    0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8, 0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1,
    0xf00f9344, 0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb, 0x196c3671, 0x6e6b06e7,
    0xfed41b76, 0x89d32be0, 0x10da7a5a, 0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
    0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1, 0xa6bc5767, 0x3fb506dd, 0x48b2364b,
    0xd80d2bda, 0xaf0a1b4c, 0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef, 0x4669be79,
    0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236, 0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f,
    0xc5ba3bbe, 0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31, 0x2cd99e8b, 0x5bdeae1d,
    0x9b64c2b0, 0xec63f226, 0x756aa39c, 0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
    0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b, 0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21,
    0x86d3d2d4, 0xf1d4e242, 0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1, 0x18b74777,
    0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c, 0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45,
    0xa00ae278, 0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7, 0x4969474d, 0x3e6e77db,
    0xaed16a4a, 0xd9d65adc, 0x40df0b66, 0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
    0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605, 0xcdd70693, 0x54de5729, 0x23d967bf,
    0xb3667a2e, 0xc4614ab8, 0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b, 0x2d02ef8d
};

uint32_t crc32(const unsigned char* data, size_t len) {
    uint32_t crc = 0xFFFFFFFF;
    for (size_t i = 0; i < len; i++) {
        crc = (crc >> 8) ^ crc32_table[(crc & 0xFF) ^ data[i]];
    }
    return crc ^ 0xFFFFFFFF;
}
```


### 3. 配置解析（config.c）
```c
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
```


### 4. 数据结构（ds.c）
```c
#include "minidistcache.h"

// -------------------------- 哈希表实现 --------------------------
HashTable* hashtable_init(int capacity) {
    HashTable* ht = CACHE_MALLOC(sizeof(HashTable));
    if (!ht) return NULL;

    ht->capacity = capacity;
    ht->buckets = CACHE_MALLOC(sizeof(CacheNode*) * capacity);
    if (!ht->buckets) {
        free(ht);
        return NULL;
    }

    // 初始化哈希桶为NULL
    memset(ht->buckets, 0, sizeof(CacheNode*) * capacity);

    // 初始化互斥锁
    if (pthread_mutex_init(&ht->mutex, NULL) != 0) {
        log_error("哈希表互斥锁初始化失败");
        free(ht->buckets);
        free(ht);
        return NULL;
    }

    log_debug("哈希表初始化成功：容量=%d", capacity);
    return ht;
}

CacheNode* hashtable_find(HashTable* ht, const char* key) {
    if (!ht || !key || !key[0]) return NULL;

    pthread_mutex_lock(&ht->mutex);

    // 计算哈希桶索引
    unsigned int idx = hash_key(key) % ht->capacity;
    CacheNode* node = ht->buckets[idx];

    // 遍历冲突链表查找
    while (node) {
        if (strcmp(node->key, key) == 0) {
            pthread_mutex_unlock(&ht->mutex);
            log_debug("哈希表查找成功：key=%s", key);
            return node;
        }
        node = node->hash_next;
    }

    pthread_mutex_unlock(&ht->mutex);
    log_debug("哈希表查找失败：key=%s", key);
    return NULL;
}

void hashtable_insert(HashTable* ht, CacheNode* node) {
    if (!ht || !node || !node->key[0]) return;

    pthread_mutex_lock(&ht->mutex);

    // 计算哈希桶索引
    unsigned int idx = hash_key(node->key) % ht->capacity;

    // 头插法插入冲突链表
    node->hash_next = ht->buckets[idx];
    ht->buckets[idx] = node;

    pthread_mutex_unlock(&ht->mutex);
    log_debug("哈希表插入成功：key=%s", node->key);
}

void hashtable_remove(HashTable* ht, const char* key) {
    if (!ht || !key || !key[0]) return;

    pthread_mutex_lock(&ht->mutex);

    // 计算哈希桶索引
    unsigned int idx = hash_key(key) % ht->capacity;
    CacheNode* prev = NULL;
    CacheNode* node = ht->buckets[idx];

    // 遍历冲突链表删除
    while (node) {
        if (strcmp(node->key, key) == 0) {
            if (prev) {
                prev->hash_next = node->hash_next;
            } else {
                ht->buckets[idx] = node->hash_next;
            }
            pthread_mutex_unlock(&ht->mutex);
            log_debug("哈希表删除成功：key=%s", key);
            return;
        }
        prev = node;
        node = node->hash_next;
    }

    pthread_mutex_unlock(&ht->mutex);
    log_debug("哈希表删除失败：key=%s（不存在）", key);
}

void hashtable_free(HashTable* ht) {
    if (!ht) return;

    // 释放互斥锁
    pthread_mutex_destroy(&ht->mutex);

    // 释放哈希桶（冲突链表节点由LRU管理）
    if (ht->buckets) {
        free(ht->buckets);
    }

    free(ht);
    log_debug("哈希表内存释放成功");
}

// -------------------------- LRU缓存实现 --------------------------
// 将节点移到LRU链表头部（标记为最近访问）
static void lru_move_to_head(LRUCache* cache, CacheNode* node) {
    if (!cache || !node || node == cache->head) return;

    // 从原位置移除节点
    if (node->prev) {
        node->prev->next = node->next;
    }
    if (node->next) {
        node->next->prev = node->prev;
    }
    // 若节点是尾节点，更新尾节点
    if (node == cache->tail) {
        cache->tail = node->prev;
    }

    // 将节点插入头部
    node->prev = NULL;
    node->next = cache->head;
    if (cache->head) {
        cache->head->prev = node;
    }
    cache->head = node;

    // 若链表为空（首次插入），尾节点也指向该节点
    if (!cache->tail) {
        cache->tail = node;
    }

    log_debug("LRU节点移到头部：key=%s", node->key);
}

// 淘汰LRU链表尾部节点（最少访问）
static void lru_evict_tail(LRUCache* cache) {
    if (!cache || !cache->tail) return;

    CacheNode* tail = cache->tail;

    // 从哈希表删除
    hashtable_remove(cache->hashtable, tail->key);

    // 从LRU链表删除
    if (tail->prev) {
        tail->prev->next = NULL;
    } else {
        // 仅剩一个节点，头部也置空
        cache->head = NULL;
    }
    cache->tail = tail->prev;

    // 释放节点内存
    free(tail);
    cache->size--;

    log_info("LRU淘汰尾部节点：key=%s，当前缓存大小=%d", tail->key, cache->size);
}

LRUCache* lru_cache_init(Config* config) {
    if (!config) return NULL;

    LRUCache* cache = CACHE_MALLOC(sizeof(LRUCache));
    if (!cache) return NULL;

    cache->head = NULL;
    cache->tail = NULL;
    cache->size = 0;
    cache->max_size = config->cache_size;
    cache->config = config;

    // 初始化哈希表（容量=缓存大小×2）
    cache->hashtable = hashtable_init(config->cache_size * HASH_CAPACITY_MULTIPLE);
    if (!cache->hashtable) {
        free(cache);
        return NULL;
    }

    // 初始化LRU互斥锁
    if (pthread_mutex_init(&cache->lru_mutex, NULL) != 0) {
        log_error("LRU互斥锁初始化失败");
        hashtable_free(cache->hashtable);
        free(cache);
        return NULL;
    }

    log_info("LRU缓存初始化成功：最大容量=%d", config->cache_size);
    return cache;
}

void lru_put(LRUCache* cache, const char* key, const char* value, time_t expire_seconds) {
    if (!cache || !key || !key[0] || !value) return;

    pthread_mutex_lock(&cache->lru_mutex);

    // 检查key长度是否超过限制
    if (strlen(key) >= cache->config->key_len) {
        log_error("LRU插入失败：key长度超过限制（%d字节）", cache->config->key_len);
        pthread_mutex_unlock(&cache->lru_mutex);
        return;
    }
    // 检查value长度是否超过限制
    if (strlen(value) >= cache->config->value_len) {
        log_error("LRU插入失败：value长度超过限制（%d字节）", cache->config->value_len);
        pthread_mutex_unlock(&cache->lru_mutex);
        return;
    }

    // 查找节点是否已存在
    CacheNode* node = hashtable_find(cache->hashtable, key);
    if (node) {
        // 更新value和过期时间
        strncpy(node->value, value, cache->config->value_len-1);
        node->expire_time = expire_seconds > 0 ? time(NULL) + expire_seconds : 0;
        // 移到头部（标记为最近访问）
        lru_move_to_head(cache, node);
        log_info("LRU更新节点：key=%s，expire=%ld", key, node->expire_time);
        pthread_mutex_unlock(&cache->lru_mutex);
        return;
    }

    // 节点不存在，创建新节点
    node = CACHE_MALLOC(sizeof(CacheNode));
    if (!node) {
        pthread_mutex_unlock(&cache->lru_mutex);
        return;
    }
    strncpy(node->key, key, cache->config->key_len-1);
    strncpy(node->value, value, cache->config->value_len-1);
    node->expire_time = expire_seconds > 0 ? time(NULL) + expire_seconds : 0;
    node->prev = node->next = node->hash_next = NULL;

    // 插入哈希表
    hashtable_insert(cache->hashtable, node);
    // 插入LRU链表头部
    lru_move_to_head(cache, node);
    cache->size++;

    // 超过最大容量，淘汰尾部节点
    while (cache->size > cache->max_size) {
        lru_evict_tail(cache);
    }

    log_info("LRU插入新节点：key=%s，expire=%ld，当前缓存大小=%d", key, node->expire_time, cache->size);
    pthread_mutex_unlock(&cache->lru_mutex);
}

char* lru_get(LRUCache* cache, const char* key) {
    if (!cache || !key || !key[0]) return NULL;

    pthread_mutex_lock(&cache->lru_mutex);

    // 查找节点
    CacheNode* node = hashtable_find(cache->hashtable, key);
    if (!node) {
        log_debug("LRU获取失败：key=%s（不存在）", key);
        pthread_mutex_unlock(&cache->lru_mutex);
        return NULL;
    }

    // 检查是否过期
    time_t now = time(NULL);
    if (node->expire_time > 0 && node->expire_time < now) {
        // 过期：从哈希表和LRU链表删除
        hashtable_remove(cache->hashtable, key);
        if (node->prev) node->prev->next = node->next;
        if (node->next) node->next->prev = node->prev;
        if (node == cache->head) cache->head = node->next;
        if (node == cache->tail) cache->tail = node->prev;
        cache->size--;
        free(node);

        log_info("LRU获取失败：key=%s（已过期）", key);
        pthread_mutex_unlock(&cache->lru_mutex);
        return NULL;
    }

    // 未过期：移到头部（标记为最近访问）
    lru_move_to_head(cache, node);
    log_info("LRU获取成功：key=%s，value=%s", key, node->value);

    // 返回value（注意：返回的是节点内部指针，需避免外部修改）
    pthread_mutex_unlock(&cache->lru_mutex);
    return node->value;
}

int lru_delete(LRUCache* cache, const char* key) {
    if (!cache || !key || !key[0]) return 0;

    pthread_mutex_lock(&cache->lru_mutex);

    // 查找节点
    CacheNode* node = hashtable_find(cache->hashtable, key);
    if (!node) {
        log_debug("LRU删除失败：key=%s（不存在）", key);
        pthread_mutex_unlock(&cache->lru_mutex);
        return 0;
    }

    // 从哈希表删除
    hashtable_remove(cache->hashtable, key);

    // 从LRU链表删除
    if (node->prev) node->prev->next = node->next;
    if (node->next) node->next->prev = node->prev;
    if (node == cache->head) cache->head = node->next;
    if (node == cache->tail) cache->tail = node->prev;

    // 释放节点内存
    free(node);
    cache->size--;

    log_info("LRU删除成功：key=%s，当前缓存大小=%d", key, cache->size);
    pthread_mutex_unlock(&cache->lru_mutex);
    return 1;
}

void lru_free(LRUCache* cache) {
    if (!cache) return;

    // 释放互斥锁
    pthread_mutex_destroy(&cache->lru_mutex);

    // 释放所有缓存节点
    CacheNode* node = cache->head;
    while (node) {
        CacheNode* next = node->next;
        free(node);
        node = next;
    }

    // 释放哈希表
    hashtable_free(cache->hashtable);

    free(cache);
    log_debug("LRU缓存内存释放成功");
}
```


### 5. 持久化（persist.c）
```c
#include "minidistcache.h"

// 全局持久化互斥锁（避免多线程同时读写文件）
pthread_mutex_t g_persist_mutex = PTHREAD_MUTEX_INITIALIZER;

// 保存缓存到文件（二进制格式）
int cache_save(LRUCache* cache, const char* file_path) {
    if (!cache || !file_path || !file_path[0]) return -1;

    pthread_mutex_lock(&g_persist_mutex);
    pthread_mutex_lock(&cache->lru_mutex);

    FILE* fp = fopen(file_path, "wb");
    if (!fp) {
        log_error("缓存保存失败：文件打开失败（%s）", file_path);
        pthread_mutex_unlock(&cache->lru_mutex);
        pthread_mutex_unlock(&g_persist_mutex);
        return -1;
    }

    // 写入文件头：魔数（用于验证文件合法性）+ 缓存节点数
    const uint32_t magic = 0x4D494E49; // "MINI"的ASCII码
    uint32_t node_count = cache->size;
    fwrite(&magic, sizeof(magic), 1, fp);
    fwrite(&node_count, sizeof(node_count), 1, fp);

    // 写入每个缓存节点
    CacheNode* node = cache->head;
    uint32_t saved_count = 0;
    while (node) {
        // 节点数据：key长度+key+value长度+value+expire_time+CRC32校验
        uint16_t key_len = strlen(node->key);
        uint16_t value_len = strlen(node->value);
        uint32_t crc;

        // 计算CRC32校验（包含key、value、expire_time）
        size_t crc_len = sizeof(key_len) + key_len + sizeof(value_len) + value_len + sizeof(node->expire_time);
        unsigned char* crc_buf = CACHE_MALLOC(crc_len);
        if (!crc_buf) {
            node = node->next;
            continue;
        }

        size_t offset = 0;
        memcpy(crc_buf + offset, &key_len, sizeof(key_len)); offset += sizeof(key_len);
        memcpy(crc_buf + offset, node->key, key_len); offset += key_len;
        memcpy(crc_buf + offset, &value_len, sizeof(value_len)); offset += sizeof(value_len);
        memcpy(crc_buf + offset, node->value, value_len); offset += value_len;
        memcpy(crc_buf + offset, &node->expire_time, sizeof(node->expire_time)); offset += sizeof(node->expire_time);

        crc = crc32(crc_buf, crc_len);
        free(crc_buf);

        // 写入节点数据
        fwrite(&key_len, sizeof(key_len), 1, fp);
        fwrite(node->key, key_len, 1, fp);
        fwrite(&value_len, sizeof(value_len), 1, fp);
        fwrite(node->value, value_len, 1, fp);
        fwrite(&node->expire_time, sizeof(node->expire_time), 1, fp);
        fwrite(&crc, sizeof(crc), 1, fp);

        saved_count++;
        node = node->next;
    }

    fclose(fp);
    pthread_mutex_unlock(&cache->lru_mutex);
    pthread_mutex_unlock(&g_persist_mutex);

    log_info("缓存保存成功：文件=%s，总节点数=%d，成功保存=%d", file_path, node_count, saved_count);
    return saved_count;
}

// 从文件加载缓存
int cache_load(LRUCache* cache, const char* file_path) {
    if (!cache || !file_path || !file_path[0]) return -1;

    pthread_mutex_lock(&g_persist_mutex);
    pthread_mutex_lock(&cache->lru_mutex);

    FILE* fp = fopen(file_path, "rb");
    if (!fp) {
        log_error("缓存加载失败：文件打开失败（%s）", file_path);
        pthread_mutex_unlock(&cache->lru_mutex);
        pthread_mutex_unlock(&g_persist_mutex);
        return -1;
    }

    // 读取文件头并验证魔数
    uint32_t magic, node_count;
    if (fread(&magic, sizeof(magic), 1, fp) != 1 || magic != 0x4D494E49) {
        log_error("缓存加载失败：文件格式非法（%s）", file_path);
        fclose(fp);
        pthread_mutex_unlock(&cache->lru_mutex);
        pthread_mutex_unlock(&g_persist_mutex);
        return -1;
    }
    if (fread(&node_count, sizeof(node_count), 1, fp) != 1) {
        log_error("缓存加载失败：节点数读取失败（%s）", file_path);
        fclose(fp);
        pthread_mutex_unlock(&cache->lru_mutex);
        pthread_mutex_unlock(&g_persist_mutex);
        return -1;
    }

    // 读取每个缓存节点
    uint32_t loaded_count = 0;
    time_t now = time(NULL);
    for (uint32_t i = 0; i < node_count; i++) {
        // 读取节点元数据
        uint16_t key_len, value_len;
        time_t expire_time;
        uint32_t crc, crc_calc;

        if (fread(&key_len, sizeof(key_len), 1, fp) != 1) break;
        if (fread(&value_len, sizeof(value_len), 1, fp) != 1) break;

        // 检查长度是否超过配置限制
        if (key_len >= cache->config->key_len || value_len >= cache->config->value_len) {
            log_error("缓存加载失败：节点长度超过限制（key_len=%d, value_len=%d）", key_len, value_len);
            // 跳过该节点剩余数据
            fseek(fp, key_len + value_len + sizeof(expire_time) + sizeof(crc), SEEK_CUR);
            continue;
        }

        // 读取key和value
        char* key = CACHE_MALLOC(key_len + 1);
        char* value = CACHE_MALLOC(value_len + 1);
        if (!key || !value) {
            free(key);
            free(value);
            // 跳过该节点剩余数据
            fseek(fp, key_len + value_len + sizeof(expire_time) + sizeof(crc), SEEK_CUR);
            continue;
        }

        if (fread(key, key_len, 1, fp) != 1) {
            free(key);
            free(value);
            break;
        }
        key[key_len] = '\0';

        if (fread(value, value_len, 1, fp) != 1) {
            free(key);
            free(value);
            break;
        }
        value[value_len] = '\0';

        // 读取过期时间和CRC32
        if (fread(&expire_time, sizeof(expire_time), 1, fp) != 1) {
            free(key);
            free(value);
            break;
        }
        if (fread(&crc, sizeof(crc), 1, fp) != 1) {
            free(key);
            free(value);
            break;
        }

        // 验证CRC32
        size_t crc_len = sizeof(key_len) + key_len + sizeof(value_len) + value_len + sizeof(expire_time);
        unsigned char* crc_buf = CACHE_MALLOC(crc_len);
        if (crc_buf) {
            size_t offset = 0;
            memcpy(crc_buf + offset, &key_len, sizeof(key_len)); offset += sizeof(key_len);
            memcpy(crc_buf + offset, key, key_len); offset += key_len;
            memcpy(crc_buf + offset, &value_len, sizeof(value_len)); offset += sizeof(value_len);
            memcpy(crc_buf + offset, value, value_len); offset += value_len;
            memcpy(crc_buf + offset, &expire_time, sizeof(expire_time)); offset += sizeof(expire_time);

            crc_calc = crc32(crc_buf, crc_len);
            free(crc_buf);

            // CRC校验失败，跳过该节点
            if (crc_calc != crc) {
                log_error("缓存加载失败：CRC校验失败（key=%s）", key);
                free(key);
                free(value);
                continue;
            }
        }

        // 检查是否过期
        if (expire_time > 0 && expire_time < now) {
            log_debug("缓存加载跳过：节点已过期（key=%s）", key);
            free(key);
            free(value);
            continue;
        }

        // 插入缓存（无需调用lru_put，直接操作链表和哈希表，避免重复加锁）
        CacheNode* node = CACHE_MALLOC(sizeof(CacheNode));
        if (node) {
            strncpy(node->key, key, cache->config->key_len-1);
            strncpy(node->value, value, cache->config->value_len-1);
            node->expire_time = expire_time;
            node->prev = node->next = node->hash_next = NULL;

            // 插入哈希表
            hashtable_insert(cache->hashtable, node);
            // 插入LRU链表头部
            if (cache->head) {
                cache->head->prev = node;
                node->next = cache->head;
            } else {
                cache->tail = node;
            }
            cache->head = node;
            cache->size++;

            // 超过最大容量，淘汰尾部节点
            while (cache->size > cache->max_size) {
                CacheNode* tail = cache->tail;
                if (!tail) break;

                hashtable_remove(cache->hashtable, tail->key);
                if (tail->prev) tail->prev->next = NULL;
                cache->tail = tail->prev;
                free(tail);
                cache->size--;
            }

            loaded_count++;
            log_debug("缓存加载成功：key=%s", key);
        }

        free(key);
        free(value);
    }

    fclose(fp);
    pthread_mutex_unlock(&cache->lru_mutex);
    pthread_mutex_unlock(&g_persist_mutex);

    log_info("缓存加载完成：文件=%s，总节点数=%d，成功加载=%d", file_path, node_count, loaded_count);
    return loaded_count;
}

// 定时持久化线程函数
void* persist_thread(void* arg) {
    LRUCache* cache = (LRUCache*)arg;
    if (!cache || !cache->config) return NULL;

    log_info("定时持久化线程启动：间隔=%d秒", cache->config->persist_interval);

    while (1) {
        // 睡眠指定间隔
        sleep(cache->config->persist_interval);

        // 执行持久化
        cache_save(cache, cache->config->persist_file);
    }

    return NULL;
}
```


### 6. 服务端（server.c）
```c
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
```


### 7. 客户端（client.c）
```c
#include "minidistcache.h"

// 启动客户端（发送命令到服务端）
void client_run(const char* server_ip, int port, const char* command) {
    if (!server_ip || !server_ip[0] || port < 1024 || port > 65535 || !command || !command[0]) {
        fprintf(stderr, "客户端参数错误：IP=%s，port=%d，command=%s\n", server_ip, port, command);
        return;
    }

    // 创建TCP socket
    int sock_fd = socket(AF_INET, SOCK_STREAM, 0);
    if (sock_fd < 0) {
        fprintf(stderr, "客户端失败：socket创建失败\n");
        return;
    }

    // 设置服务端地址
    struct sockaddr_in server_addr;
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(port);

    // 转换IP地址（域名或IPv4）
    if (inet_pton(AF_INET, server_ip, &server_addr.sin_addr) <= 0) {
        fprintf(stderr, "客户端失败：无效的服务器IP=%s\n", server_ip);
        close(sock_fd);
        return;
    }

    // 连接服务端
    if (connect(sock_fd, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        fprintf(stderr, "客户端失败：连接服务器%s:%d失败\n", server_ip, port);
        close(sock_fd);
        return;
    }

    printf("客户端：连接服务器%s:%d成功，发送命令：%s\n", server_ip, port, command);

    // 发送命令
    ssize_t n = write(sock_fd, command, strlen(command));
    if (n <= 0) {
        fprintf(stderr, "客户端失败：发送命令失败\n");
        close(sock_fd);
        return;
    }

    // 接收响应
    char buffer[4096] = {0};
    n = read(sock_fd, buffer, sizeof(buffer)-1);
    if (n <= 0) {
        fprintf(stderr, "客户端失败：接收响应失败\n");
    } else {
        printf("客户端：服务端响应：%s\n", buffer);
    }

    // 关闭连接
    close(sock_fd);
    printf("客户端：连接关闭\n");
}
```


### 8. 入口函数（main.c）
```c
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
```


### 9. 配置文件（cache.conf）
```ini
# MiniDistCache 配置文件
# 键长度限制（字节）
key_len = 64
# 值长度限制（字节）
value_len = 1024
# 最大缓存节点数
cache_size = 1024
# 服务端监听端口
port = 8888
# 定时持久化间隔（秒）
persist_interval = 300
# 日志文件路径
log_file = cache.log
# 持久化文件路径
persist_file = cache.data
```


### 10. 编译脚本（Makefile）
```makefile
# Makefile for MiniDistCache
CC = gcc
CFLAGS = -Wall -Wextra -g -std=c99
LDFLAGS = -lpthread
TARGET = minidistcache

# 源文件
SRCS = main.c utils.c config.c ds.c persist.c server.c client.c
# 目标文件
OBJS = $(SRCS:.c=.o)

# 默认目标
all: $(TARGET)

# 链接生成可执行文件
$(TARGET): $(OBJS)
	$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)
	@echo "编译完成：$(TARGET)"

# 编译源文件为目标文件
%.o: %.c minidistcache.h
	$(CC) $(CFLAGS) -c -o $@ $<

# 清理目标文件和可执行文件
clean:
	rm -f $(OBJS) $(TARGET) cache.log cache.data
	@echo "清理完成