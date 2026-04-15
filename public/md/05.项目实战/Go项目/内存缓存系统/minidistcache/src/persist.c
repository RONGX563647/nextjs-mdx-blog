//
// Created by rongx on 2025/10/2.
//
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