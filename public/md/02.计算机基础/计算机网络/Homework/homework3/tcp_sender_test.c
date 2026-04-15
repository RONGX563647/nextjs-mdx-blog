#include "tcp_sender.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

// 测试结果统计
static int total_tests = 0;
static int passed_tests = 0;

// 测试中捕获的发送报文
static TCPSegment last_sent_segment;
static bool segment_was_sent = false;

// 模拟发送回调函数（处理未使用参数）
static void test_send_segment(const TCPSegment *seg, void *user_data) {
    (void)user_data; // 消除"未使用参数"警告

    // 复制发送的报文段用于验证
    last_sent_segment = *seg;
    segment_was_sent = true;
}

// 重置测试状态（无参数加void）
static void reset_test_state(void) {
    last_sent_segment.data = NULL; // 清除指针，避免野指针
    last_sent_segment.data_len = 0;
    segment_was_sent = false;
}

// TEST_ASSERT支持可变参数（处理格式化字符串）
#define TEST_ASSERT(condition, fmt, ...) do { \
    total_tests++; \
    if (!(condition)) { \
        printf("❌ 测试失败: " fmt "\n", ##__VA_ARGS__); \
    } else { \
        printf("✅ 测试通过\n"); \
        passed_tests++; \
    } \
} while(0)

// 测试1: 创建和销毁TCP发送端
static void test_creation_destruction(void) {
    printf("\n测试1: 创建和销毁TCP发送端\n");

    TCPSender *sender = tcp_sender_create(test_send_segment, NULL);
    TEST_ASSERT(sender != NULL, "创建TCP发送端失败");
    TEST_ASSERT(tcp_sender_get_state(sender) == CLOSED, "初始状态应为CLOSED");

    tcp_sender_destroy(sender);
}

// 测试2: 三次握手过程
static void test_three_way_handshake(void) {
    printf("\n测试2: 三次握手过程\n");

    TCPSender *sender = tcp_sender_create(test_send_segment, NULL);
    TEST_ASSERT(sender != NULL, "创建TCP发送端失败");

    // 发送SYN报文（第一次握手）
    tcp_sender_connect(sender);
    TEST_ASSERT(segment_was_sent, "未发送SYN报文");
    TEST_ASSERT(last_sent_segment.syn && !last_sent_segment.ack && !last_sent_segment.fin,
               "发送的不是SYN报文");
    TEST_ASSERT(tcp_sender_get_state(sender) == SYN_SENT, "状态应变为SYN_SENT");

    uint32_t syn_seq = last_sent_segment.seq_num;
    reset_test_state();

    // 模拟接收SYN-ACK报文（第二次握手）
    TCPSegment syn_ack;
    memset(&syn_ack, 0, sizeof(syn_ack));
    syn_ack.syn = true;
    syn_ack.ack = true;
    syn_ack.ack_num = syn_seq + 1;  // ACK SYN消耗的序列号
    syn_ack.seq_num = 12345;        // 接收端初始序列号

    tcp_sender_process_ack(sender, &syn_ack);
    TEST_ASSERT(segment_was_sent, "未发送ACK报文（第三次握手）");
    TEST_ASSERT(!last_sent_segment.syn && last_sent_segment.ack && !last_sent_segment.fin,
               "发送的不是纯ACK报文");
    TEST_ASSERT(last_sent_segment.ack_num == syn_ack.seq_num + 1, "ACK号应等于接收端SYN序列号+1（实际：%u，预期：%u）",
               last_sent_segment.ack_num, syn_ack.seq_num + 1);
    TEST_ASSERT(tcp_sender_get_state(sender) == ESTABLISHED, "状态应变为ESTABLISHED");
    TEST_ASSERT(tcp_sender_is_connected(sender), "连接状态判断错误");

    reset_test_state();
    tcp_sender_destroy(sender);
}

// 测试3: 数据发送功能
static void test_data_transmission(void) {
    printf("\n测试3: 数据发送功能\n");

    TCPSender *sender = tcp_sender_create(test_send_segment, NULL);
    TEST_ASSERT(sender != NULL, "创建TCP发送端失败");

    // 先完成三次握手
    tcp_sender_connect(sender);
    uint32_t syn_seq = last_sent_segment.seq_num;
    reset_test_state();

    TCPSegment syn_ack;
    memset(&syn_ack, 0, sizeof(syn_ack));
    syn_ack.syn = true;
    syn_ack.ack = true;
    syn_ack.ack_num = syn_seq + 1;
    syn_ack.seq_num = 12345;
    syn_ack.window_size = 4096;  // 设置足够大的接收窗口

    tcp_sender_process_ack(sender, &syn_ack);
    reset_test_state();

    // 测试发送数据
    const char *test_data = "Hello, TCP!";
    size_t data_len = strlen(test_data);

    size_t sent = tcp_sender_send(sender, test_data, data_len);
    TEST_ASSERT(sent == data_len, "数据未完全发送（实际发送：%zu，预期：%zu）", sent, data_len);
    TEST_ASSERT(segment_was_sent, "未发送数据报文");
    TEST_ASSERT(last_sent_segment.data_len == data_len, "发送数据长度不匹配（实际：%zu，预期：%zu）",
               last_sent_segment.data_len, data_len);
    TEST_ASSERT(memcmp(last_sent_segment.data, test_data, data_len) == 0, "发送数据内容不匹配");
    TEST_ASSERT(last_sent_segment.seq_num == syn_seq + 1, "数据报文序列号应为SYN序列号+1（实际：%u，预期：%u）",
               last_sent_segment.seq_num, syn_seq + 1);

    reset_test_state();
    tcp_sender_destroy(sender);
}

// 测试4: 拥塞控制 - 慢启动阶段
static void test_congestion_control_slow_start(void) {
    printf("\n测试4: 拥塞控制 - 慢启动阶段\n");

    TCPSender *sender = tcp_sender_create(test_send_segment, NULL);
    TEST_ASSERT(sender != NULL, "创建TCP发送端失败");

    // 完成三次握手
    tcp_sender_connect(sender);
    uint32_t syn_seq = last_sent_segment.seq_num;
    reset_test_state();

    TCPSegment syn_ack;
    memset(&syn_ack, 0, sizeof(syn_ack));
    syn_ack.syn = true;
    syn_ack.ack = true;
    syn_ack.ack_num = syn_seq + 1;
    syn_ack.seq_num = 12345;
    syn_ack.window_size = 10 * MSS;  // 足够大的窗口（避免接收窗口限制）

    tcp_sender_process_ack(sender, &syn_ack);
    reset_test_state();

    // 初始拥塞窗口应为1个MSS，且处于慢启动阶段
    TEST_ASSERT(tcp_sender_get_cwnd(sender) == 1, "初始拥塞窗口应为1（实际：%u）", tcp_sender_get_cwnd(sender));
    TEST_ASSERT(tcp_sender_is_in_slow_start(sender), "初始应处于慢启动阶段");

    // 第一次发送数据并处理ACK → 拥塞窗口+1（变为2）
    const char *test_data = "Test Slow Start";
    size_t data_len = strlen(test_data);

    tcp_sender_send(sender, test_data, data_len);
    uint32_t data_seq = last_sent_segment.seq_num;
    reset_test_state();

    // 模拟ACK（确认数据已接收）
    TCPSegment ack;
    memset(&ack, 0, sizeof(ack));
    ack.ack = true;
    ack.ack_num = data_seq + data_len;
    ack.window_size = 10 * MSS;

    tcp_sender_process_ack(sender, &ack);
    TEST_ASSERT(tcp_sender_get_cwnd(sender) == 2, "慢启动第一次ACK后，拥塞窗口应为2（实际：%u）", tcp_sender_get_cwnd(sender));

    // 第二次发送数据并处理ACK → 拥塞窗口+1（变为3）
    tcp_sender_send(sender, test_data, data_len);
    data_seq = last_sent_segment.seq_num;
    reset_test_state();

    ack.ack_num = data_seq + data_len;
    tcp_sender_process_ack(sender, &ack);
    TEST_ASSERT(tcp_sender_get_cwnd(sender) == 3, "慢启动第二次ACK后，拥塞窗口应为3（实际：%u）", tcp_sender_get_cwnd(sender));

    reset_test_state();
    tcp_sender_destroy(sender);
}

// 测试5: 超时重传机制
static void test_retransmission(void) {
    printf("\n测试5: 超时重传机制\n");

    TCPSender *sender = tcp_sender_create(test_send_segment, NULL);
    TEST_ASSERT(sender != NULL, "创建TCP发送端失败");

    // 完成三次握手
    tcp_sender_connect(sender);
    uint32_t syn_seq = last_sent_segment.seq_num;
    reset_test_state();

    TCPSegment syn_ack;
    memset(&syn_ack, 0, sizeof(syn_ack));
    syn_ack.syn = true;
    syn_ack.ack = true;
    syn_ack.ack_num = syn_seq + 1;
    syn_ack.seq_num = 12345;
    syn_ack.window_size = 4096;

    tcp_sender_process_ack(sender, &syn_ack);
    reset_test_state();

    // 发送数据（未收到ACK，后续触发超时）
    const char *test_data = "Test Retransmission";
    size_t data_len = strlen(test_data);
    tcp_sender_send(sender, test_data, data_len);
    uint32_t data_seq = last_sent_segment.seq_num;
    reset_test_state();

    // 模拟超时：修改重传队列中报文的发送时间（提前timeout+1秒）
    if (sender->retrans_queue && sender->retrans_queue->head) {
        sender->retrans_queue->head->send_time = time(NULL) - (tcp_sender_get_timeout(sender) / 1000 + 1);
    }

    // 处理超时事件
    int initial_timeout = tcp_sender_get_timeout(sender);
    tcp_sender_handle_timeout(sender);

    TEST_ASSERT(segment_was_sent, "超时后未重传报文");
    TEST_ASSERT(last_sent_segment.seq_num == data_seq, "重传报文序列号不匹配（实际：%u，预期：%u）",
               last_sent_segment.seq_num, data_seq);
    TEST_ASSERT(tcp_sender_get_timeout(sender) == initial_timeout * 2, "超时时间应指数退避（×2）（实际：%d，预期：%d）",
               tcp_sender_get_timeout(sender), initial_timeout * 2);
    TEST_ASSERT(tcp_sender_get_cwnd(sender) == 1, "超时后拥塞窗口应重置为1（实际：%u）", tcp_sender_get_cwnd(sender));
    TEST_ASSERT(tcp_sender_is_in_slow_start(sender), "超时后应回到慢启动阶段");

    reset_test_state();
    tcp_sender_destroy(sender);
}

// 测试6: 连接关闭过程（核心修复：模拟对方FIN时设置ack=true）
static void test_connection_close(void) {
    printf("\n测试6: 连接关闭过程\n");

    TCPSender *sender = tcp_sender_create(test_send_segment, NULL);
    TEST_ASSERT(sender != NULL, "创建TCP发送端失败");

    // 完成三次握手
    tcp_sender_connect(sender);
    uint32_t syn_seq = last_sent_segment.seq_num;
    reset_test_state();

    TCPSegment syn_ack;
    memset(&syn_ack, 0, sizeof(syn_ack));
    syn_ack.syn = true;
    syn_ack.ack = true;
    syn_ack.ack_num = syn_seq + 1;
    syn_ack.seq_num = 12345;
    syn_ack.window_size = 4096;

    tcp_sender_process_ack(sender, &syn_ack);
    reset_test_state();

    // 发送FIN报文（关闭第一步）
    tcp_sender_close(sender);
    TEST_ASSERT(segment_was_sent, "未发送FIN报文");
    TEST_ASSERT(last_sent_segment.fin, "发送的不是FIN报文");
    TEST_ASSERT(tcp_sender_get_state(sender) == FIN_WAIT_1, "状态应变为FIN_WAIT_1（实际：%d，预期：%d）",
               tcp_sender_get_state(sender), FIN_WAIT_1);

    uint32_t fin_seq = last_sent_segment.seq_num;
    reset_test_state();

    // 模拟收到FIN的ACK（关闭第二步）
    TCPSegment fin_ack;
    memset(&fin_ack, 0, sizeof(fin_ack));
    fin_ack.ack = true;
    fin_ack.ack_num = fin_seq + 1;  // ACK FIN消耗的序列号
    tcp_sender_process_ack(sender, &fin_ack);
    TEST_ASSERT(tcp_sender_get_state(sender) == FIN_WAIT_2, "状态应变为FIN_WAIT_2（实际：%d，预期：%d）",
               tcp_sender_get_state(sender), FIN_WAIT_2);

    // 核心修复：模拟对方FIN报文时，必须设置ack=true（TCP FIN报文通常捎带ACK）
    TCPSegment peer_fin;
    memset(&peer_fin, 0, sizeof(peer_fin));
    peer_fin.ack = true;  // 关键修复：添加ACK标志，确保进入处理逻辑
    peer_fin.fin = true;   // 对方发送FIN
    peer_fin.seq_num = syn_ack.seq_num + 1;  // 对方的FIN序列号（基于其初始序列号递增）
    peer_fin.ack_num = sender->seq_num;      // 捎带确认发送端已发数据（可选，不影响核心逻辑）

    // 处理对方FIN报文
    reset_test_state();  // 重置发送状态，确保能检测到新发送的ACK
    tcp_sender_process_ack(sender, &peer_fin);

    // 验证发送了FIN的ACK
    TEST_ASSERT(segment_was_sent, "未发送FIN的ACK报文");
    TEST_ASSERT(last_sent_segment.ack, "发送的不是ACK报文");
    TEST_ASSERT(last_sent_segment.ack_num == peer_fin.seq_num + 1, "ACK号应等于对方FIN序列号+1（实际：%u，预期：%u）",
               last_sent_segment.ack_num, peer_fin.seq_num + 1);

    // 验证状态切换到TIME_WAIT
    TEST_ASSERT(tcp_sender_get_state(sender) == TIME_WAIT, "状态应变为TIME_WAIT（实际：%d，预期：%d）",
               tcp_sender_get_state(sender), TIME_WAIT);

    reset_test_state();
    tcp_sender_destroy(sender);
}

// 主函数
int main(void) {
    printf("==================== TCP发送端测试程序 ====================\n");

    // 运行所有测试用例
    test_creation_destruction();
    test_three_way_handshake();
    test_data_transmission();
    test_congestion_control_slow_start();
    test_retransmission();
    test_connection_close();

    // 输出测试总结
    printf("\n==================== 测试总结 ====================\n");
    printf("总测试用例数: %d\n", total_tests);
    printf("通过测试数:   %d\n", passed_tests);
    printf("失败测试数:   %d\n", total_tests - passed_tests);

    // 所有测试通过返回0，否则返回1
    return (total_tests == passed_tests) ? 0 : 1;
}