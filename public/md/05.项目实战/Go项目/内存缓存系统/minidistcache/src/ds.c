//
// Created by rongx on 2025/10/2.
#include "minidistcache.h"

// -------------------------- 哈希表实现 --------------------------
HashTable* hashtable_init(int capacity){
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