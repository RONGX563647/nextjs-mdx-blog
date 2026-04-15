#include "reliable_byte_stream.h"
#include <algorithm>  // 提供std::min等算法函数


/**
 * @brief 构造函数：初始化字节流缓冲区的核心参数
 *
 * 为字节流缓冲区分配指定的容量，并初始化输入状态为“未结束”。
 * 缓冲区初始为空，等待后续写入数据。
 *
 * @param capacity 缓冲区的最大容量（单位：字节），决定了最多可存储的字节数
 */
ReliableByteStream::ReliableByteStream(size_t capacity)
    : capacity_(capacity),  // 初始化缓冲区总容量
      input_ended_(false)   // 初始化输入状态为“未结束”（可继续写入数据）
{}

/**
 * @brief 向缓冲区写入数据，处理缓冲区满和输入结束的边界情况
 *
 * 仅当输入未结束且缓冲区有剩余空间时，才会写入数据。
 * 若数据量超过剩余空间，仅写入部分数据（最多写入剩余空间能容纳的字节数）。
 *
 * @param data 待写入的字符串数据（以字节为单位）
 * @return 实际写入的字节数（0表示写入失败，可能因输入已结束或缓冲区满）
 */
size_t ReliableByteStream::write(const std::string& data) {
    // 若输入已结束（调用过end_input()），不再接受新数据，返回0
    if (input_ended_) {
        return 0;
    }

    // 计算缓冲区剩余可用空间 = 总容量 - 当前已存储的字节数
    size_t available_space = capacity_ - buffer_.size();
    // 实际可写入的字节数 = 待写入数据长度与剩余空间的较小值（避免溢出）
    size_t write_size = std::min(data.size(), available_space);

    // 逐字节将数据写入缓冲区（尾部追加，符合流的顺序性）
    for (size_t i = 0; i < write_size; ++i) {
        buffer_.push_back(data[i]);  // 向双端队列尾部添加字节
    }

    return write_size;  // 返回实际写入的字节数
}

/**
 * @brief 从缓冲区读取数据到字符串，支持部分读取
 *
 * 从缓冲区头部读取数据（保证顺序性），若请求读取的字节数超过可用数据，
 * 则仅返回当前所有可用数据，不会阻塞等待新数据。
 *
 * @param out 输出参数：存储读取到的数据的字符串
 * @param len 请求读取的字节数
 * @return 实际读取的字节数（0表示缓冲区为空）
 */
size_t ReliableByteStream::read(std::string& out, size_t len) {
    // 实际可读取的字节数 = 请求长度与当前缓冲区存储量的较小值
    size_t read_size = std::min(len, buffer_.size());

    out.clear();  // 清空输出字符串，避免残留旧数据
    // 从缓冲区头部逐个读取字节（保证FIFO顺序）
    for (size_t i = 0; i < read_size; ++i) {
        out += buffer_.front();  // 取头部字节添加到输出字符串
        buffer_.pop_front();     // 移除已读取的头部字节，释放空间
    }

    return read_size;  // 返回实际读取的字节数
}

/**
 * @brief 从缓冲区读取数据到字符数组，支持C风格输出
 *
 * 与字符串版本的read功能一致，但输出到字符数组，需手动保证数组容量充足。
 * 若输入数组为空或长度为0，直接返回0。
 *
 * @param out 输出参数：存储读取到的数据的字符数组（需提前分配内存）
 * @param len 字符数组的长度（或请求读取的字节数）
 * @return 实际读取的字节数（0表示缓冲区为空或参数无效）
 */
size_t ReliableByteStream::read(char* out, size_t len) {
    // 参数合法性检查：若数组为空或长度为0，返回0（避免空指针访问）
    if (out == nullptr || len == 0) {
        return 0;
    }

    // 实际可读取的字节数 = 请求长度与当前缓冲区存储量的较小值
    size_t read_size = std::min(len, buffer_.size());
    // 从缓冲区头部逐个读取字节到字符数组
    for (size_t i = 0; i < read_size; ++i) {
        out[i] = buffer_.front();  // 取头部字节写入数组
        buffer_.pop_front();       // 移除已读取的头部字节
    }

    return read_size;  // 返回实际读取的字节数
}

/**
 * @brief 标记输入结束，后续写入操作将被拒绝
 *
 * 调用此方法后，缓冲区不再接受新数据（write()返回0），
 * 但已写入的数据仍可正常读取，直到缓冲区为空时触发eof()。
 */
void ReliableByteStream::end_input() {
    input_ended_ = true;  // 设置输入结束标记为true
}

/**
 * @brief 判断是否到达字节流末尾（EOF）
 *
 * EOF的判定条件：输入已结束（调用过end_input()）且缓冲区中已无数据可读取。
 * 仅当两者同时满足时，才认为到达流的末尾。
 *
 * @return 若到达EOF则返回true，否则返回false
 */
bool ReliableByteStream::eof() const {
    // 输入已结束且缓冲区为空 → 到达EOF
    return input_ended_ && buffer_.empty();
}

/**
 * @brief 获取当前缓冲区中可读取的字节数
 *
 * 等价于缓冲区中已存储的字节总数，反映了当前可读取的数据量。
 *
 * @return 可读取的字节数（0表示缓冲区为空）
 */
size_t ReliableByteStream::available() const {
    return buffer_.size();  // 双端队列的大小即为已存储的字节数
}

/**
 * @brief 获取缓冲区的总容量（初始化时指定的最大字节数）
 *
 * 总容量是固定的，不会因数据的写入/读取而改变，反映了缓冲区的最大存储能力。
 *
 * @return 缓冲区的总容量（字节数）
 */
size_t ReliableByteStream::capacity() const {
    return capacity_;  // 返回初始化时设置的总容量
}

/**
 * @brief 获取当前缓冲区中已存储的字节数
 *
 * 与available()功能一致，用于直观反映缓冲区的当前填充量。
 *
 * @return 已存储的字节数
 */
size_t ReliableByteStream::size() const {
    return buffer_.size();  // 双端队列的大小即为已存储的字节数
}

/**
 * @brief 判断缓冲区是否已满
 *
 * 当已存储的字节数等于总容量时，缓冲区已满，无法再写入新数据（直到有数据被读取）。
 *
 * @return 若缓冲区已满则返回true，否则返回false
 */
bool ReliableByteStream::is_full() const {
    // 已存储字节数 == 总容量 → 缓冲区满
    return buffer_.size() == capacity_;
}

/**
 * @brief 清空缓冲区并重置输入状态
 *
 * 清除所有已存储的数据，同时将输入结束标记重置为false（允许重新写入数据），
 * 使缓冲区恢复到初始状态。
 */
void ReliableByteStream::clear() {
    buffer_.clear();       // 清空双端队列中的所有数据
    input_ended_ = false;  // 重置输入状态为“未结束”
}

/**
 * @brief 检查输入是否已结束（判断是否调用过end_input()）
 *
 * 用于外部获取输入状态，辅助判断后续是否还能写入数据。
 *
 * @return 若输入已结束则返回true，否则返回false
 */
bool ReliableByteStream::is_input_ended() const {
    return input_ended_;  // 返回输入结束标记的当前值
}
