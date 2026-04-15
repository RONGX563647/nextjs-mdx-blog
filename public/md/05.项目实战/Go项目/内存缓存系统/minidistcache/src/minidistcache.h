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