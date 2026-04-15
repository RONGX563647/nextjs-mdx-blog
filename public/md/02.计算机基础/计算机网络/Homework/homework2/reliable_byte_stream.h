#ifndef RELIABLE_BYTE_STREAM_H
#define RELIABLE_BYTE_STREAM_H

#include <string>
#include <cstddef>
#include <deque>

/**
 * @brief 可靠字节流缓冲区，支持有序的字节读写操作
 *
 * 该类实现了一个有界缓冲区，支持写入数据、读取数据和标记输入结束等操作。
 * 当缓冲区满时，写入操作会受到限制；当读取超过可用数据时，只会返回当前可用的数据。
 */
class ReliableByteStream {
public:
    /**
     * @brief 构造函数，初始化指定容量的字节流缓冲区
     * @param capacity 缓冲区的最大容量（字节数）
     */
    explicit ReliableByteStream(size_t capacity);

    /**
     * @brief 写入数据到缓冲区
     * @param data 要写入的数据
     * @return 实际写入的字节数（可能小于请求写入的字节数，当缓冲区空间不足时）
     */
    size_t write(const std::string& data);

    /**
     * @brief 从缓冲区读取数据
     * @param out 用于存储读取数据的字符串
     * @param len 希望读取的字节数
     * @return 实际读取的字节数（可能小于请求读取的字节数，当可用数据不足时）
     */
    size_t read(std::string& out, size_t len);

    /**
     * @brief 从缓冲区读取数据到字符数组
     * @param out 用于存储读取数据的字符数组
     * @param len 字符数组的长度/希望读取的字节数
     * @return 实际读取的字节数
     */
    size_t read(char* out, size_t len);

    /**
     * @brief 标记输入结束，之后不能再写入数据
     */
    void end_input();

    /**
     * @brief 判断是否到达输入末尾（输入已结束且缓冲区为空）
     * @return 若到达末尾则返回true，否则返回false
     */
    bool eof() const;

    /**
     * @brief 获取当前可读取的字节数
     * @return 缓冲区中可用的字节数
     */
    size_t available() const;

    /**
     * @brief 获取缓冲区的总容量
     * @return 缓冲区的最大容量
     */
    size_t capacity() const;

    /**
     * @brief 获取当前缓冲区中已存储的字节数
     * @return 已使用的字节数
     */
    size_t size() const;

    /**
     * @brief 判断缓冲区是否已满
     * @return 若缓冲区已满则返回true，否则返回false
     */
    bool is_full() const;

    /**
     * @brief 清空缓冲区并重置状态
     */
    void clear();

    /**
     * @brief 新增：判断输入是否已结束（供外部获取input_ended_状态）
     * @return 若输入已结束则返回true，否则返回false
     */
    bool is_input_ended() const;

private:
    std::deque<char> buffer_;  // 存储字节流的缓冲区（私有）
    size_t capacity_;          // 缓冲区的最大容量（私有）
    bool input_ended_;         // 标记输入是否已结束（私有，通过is_input_ended()暴露）
};

#endif // RELIABLE_BYTE_STREAM_H