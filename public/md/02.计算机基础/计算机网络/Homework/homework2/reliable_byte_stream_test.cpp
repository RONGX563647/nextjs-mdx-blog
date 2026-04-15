#include <gtest/gtest.h>
#include "reliable_byte_stream.h"

// 测试1：基本读写功能（写入完整数据，读取部分数据）
TEST(ReliableByteStreamTest, BasicReadWrite) {
    ReliableByteStream stream(100);  // 容量100字节的缓冲区
    std::string data = "hello world";  // 待写入数据（11字节）

    // 测试写入：应写入全部11字节
    size_t written = stream.write(data);
    EXPECT_EQ(written, data.size());  // 验证写入字节数
    EXPECT_EQ(stream.size(), data.size());  // 验证缓冲区存储量
    EXPECT_EQ(stream.available(), data.size());  // 验证可用字节数

    // 测试读取：读取前5字节
    std::string out;
    size_t read = stream.read(out, 5);
    EXPECT_EQ(read, 5);  // 验证读取字节数
    EXPECT_EQ(out, "hello");  // 验证读取内容
    EXPECT_EQ(stream.size(), data.size() - 5);  // 验证剩余字节数
}

// 测试2：写入超过缓冲区容量（部分写入，读取后再写入）
TEST(ReliableByteStreamTest, WriteBeyondCapacity) {
    ReliableByteStream stream(5);  // 容量仅5字节
    std::string data = "hello world";  // 待写入数据（11字节，超过容量）

    // 第一次写入：仅能写入5字节（缓冲区满）
    size_t written = stream.write(data);
    EXPECT_EQ(written, 5);  // 验证写入5字节
    EXPECT_TRUE(stream.is_full());  // 验证缓冲区已满
    EXPECT_EQ(stream.size(), 5);  // 验证存储量

    // 读取3字节：释放缓冲区空间
    std::string out;
    stream.read(out, 3);
    EXPECT_EQ(stream.size(), 2);  // 验证剩余2字节

    // 第二次写入：最多可写入3字节（5-2=3）
    written = stream.write(data);
    EXPECT_EQ(written, 3);  // 验证写入3字节
    EXPECT_TRUE(stream.is_full());  // 验证缓冲区再次满
    EXPECT_EQ(stream.size(), 5);  // 验证存储量回到5字节
}

// 测试3：读取超过可用数据（仅读取当前可用的全部数据）
TEST(ReliableByteStreamTest, ReadBeyondAvailable) {
    ReliableByteStream stream(10);  // 容量10字节
    std::string data = "hello";  // 写入5字节数据

    stream.write(data);
    // 尝试读取10字节（超过可用的5字节）
    std::string out;
    size_t read = stream.read(out, 10);
    EXPECT_EQ(read, 5);  // 验证实际读取5字节
    EXPECT_EQ(out, "hello");  // 验证读取内容
    EXPECT_EQ(stream.size(), 0);  // 验证缓冲区为空
}

// 测试4：输入结束与EOF判断（end_input后，缓冲区空才为EOF）
TEST(ReliableByteStreamTest, EndInputAndEof) {
    ReliableByteStream stream(10);
    std::string data = "hello";

    stream.write(data);
    EXPECT_FALSE(stream.eof());  // 输入未结束，EOF为false

    stream.end_input();  // 标记输入结束
    EXPECT_FALSE(stream.eof());  // 输入结束但缓冲区非空，EOF仍为false

    // 读取全部数据
    std::string out;
    stream.read(out, 10);
    EXPECT_TRUE(stream.eof());  // 输入结束且缓冲区空，EOF为true
}

// 测试5：空数据写入（写入0字节，缓冲区无变化）
TEST(ReliableByteStreamTest, EmptyDataWrite) {
    ReliableByteStream stream(10);
    std::string data = "";  // 空数据

    size_t written = stream.write(data);
    EXPECT_EQ(written, 0);  // 验证写入0字节
    EXPECT_EQ(stream.size(), 0);  // 验证缓冲区无数据
}

// 测试6：清空缓冲区（修复私有成员访问：用is_input_ended()替代input_ended_）
TEST(ReliableByteStreamTest, ClearBuffer) {
    ReliableByteStream stream(10);
    std::string data = "hello";

    stream.write(data);
    stream.end_input();
    EXPECT_EQ(stream.size(), 5);  // 验证存储5字节
    EXPECT_TRUE(stream.is_input_ended());  // 用公有接口判断输入状态（修复点）

    stream.clear();  // 清空缓冲区
    EXPECT_EQ(stream.size(), 0);  // 验证缓冲区为空
    EXPECT_FALSE(stream.is_input_ended());  // 验证输入状态重置（修复点）
    EXPECT_FALSE(stream.eof());  // 验证EOF为false
}

// 测试7：部分读取（分多次读取，直至缓冲区空）
TEST(ReliableByteStreamTest, PartialRead) {
    ReliableByteStream stream(20);
    std::string data = "abcdefghij";  // 10字节数据

    stream.write(data);
    EXPECT_EQ(stream.size(), 10);  // 验证存储10字节

    // 分3次读取
    std::string out1, out2, out3;
    stream.read(out1, 3);  // 第一次读3字节（"abc"）
    stream.read(out2, 5);  // 第二次读5字节（"defgh"）
    stream.read(out3, 4);  // 第三次尝试读4字节，实际仅2字节（"ij"）

    EXPECT_EQ(out1, "abc");
    EXPECT_EQ(out2, "defgh");
    EXPECT_EQ(out3, "ij");
    EXPECT_EQ(stream.size(), 0);  // 验证缓冲区空
}

// 测试8：输入结束后禁止写入（end_input后写入返回0）
TEST(ReliableByteStreamTest, NoWriteAfterEndInput) {
    ReliableByteStream stream(10);
    std::string data = "hello";

    stream.write(data);
    stream.end_input();  // 标记输入结束

    // 尝试写入新数据（应拒绝）
    size_t written = stream.write("world");
    EXPECT_EQ(written, 0);  // 验证写入0字节
    EXPECT_EQ(stream.size(), 5);  // 验证缓冲区数据无变化
}

// 程序入口：运行所有测试用例
int main(int argc, char **argv) {
    testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}