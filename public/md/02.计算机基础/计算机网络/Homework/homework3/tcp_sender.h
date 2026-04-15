#ifndef TCP_SENDER_H
#define TCP_SENDER_H

#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>
#include <time.h>

// 最大段大小（MSS），实际中由协商决定
#define MSS 1024
// 初始超时时间（毫秒）
#define INITIAL_TIMEOUT 1000
// 最大重传次数
#define MAX_RETRANSMISSIONS 5

// TCP状态枚举
typedef enum {
    CLOSED,
    SYN_SENT,
    ESTABLISHED,
    FIN_WAIT_1,
    FIN_WAIT_2,
    TIME_WAIT,
    CLOSED_WAIT
} TCPState;

// TCP报文段结构（修复：data改为const uint8_t*，避免const丢弃警告）
typedef struct {
    uint32_t seq_num;      // 序列号
    uint32_t ack_num;      // 确认号
    bool syn;              // SYN标志
    bool ack;              // ACK标志
    bool fin;              // FIN标志
    uint16_t window_size;  // 窗口大小
    const uint8_t *data;   // 数据（改为const，因为发送时不修改数据）
    size_t data_len;       // 数据长度
} TCPSegment;

// 重传队列节点
typedef struct RetransmissionNode {
    TCPSegment segment;    // 报文段
    time_t send_time;      // 发送时间
    int retrans_count;     // 重传次数
    struct RetransmissionNode *next;  // 下一个节点
} RetransmissionNode;

// 重传队列
typedef struct {
    RetransmissionNode *head;  // 队头
    RetransmissionNode *tail;  // 队尾
    size_t size;               // 队列大小
} RetransmissionQueue;

// TCP发送端结构（内部成员视为"私有"，通过接口访问）
typedef struct {
    TCPState state;               // TCP状态
    uint32_t seq_num;             // 当前序列号
    uint32_t ack_num;             // 当前确认号
    uint32_t initial_seq;         // 初始序列号
    uint16_t window_size;         // 接收窗口大小
    RetransmissionQueue *retrans_queue;  // 重传队列

    // 拥塞控制参数（私有，通过接口访问）
    uint32_t cwnd;                // 拥塞窗口大小（MSS为单位）
    uint32_t ssthresh;            // 慢启动阈值
    bool in_slow_start;           // 是否处于慢启动阶段

    // 超时重传参数（私有，通过接口访问）
    int timeout;                  // 当前超时时间（毫秒）
    time_t last_activity;         // 最后活动时间

    // 回调函数 - 用于发送报文到网络
    void (*send_segment)(const TCPSegment *seg, void *user_data);
    void *user_data;              // 用户数据，用于回调函数
} TCPSender;

// -------------------------- 核心功能接口 --------------------------
// 创建TCP发送端
TCPSender* tcp_sender_create(void (*send_segment)(const TCPSegment*, void*), void *user_data);

// 销毁TCP发送端
void tcp_sender_destroy(TCPSender *sender);

// 启动TCP连接（发送SYN，三次握手第一步）
void tcp_sender_connect(TCPSender *sender);

// 发送数据
size_t tcp_sender_send(TCPSender *sender, const void *data, size_t len);

// 处理接收到的ACK
void tcp_sender_process_ack(TCPSender *sender, const TCPSegment *ack_segment);

// 处理超时事件
void tcp_sender_handle_timeout(TCPSender *sender);

// 关闭TCP连接
void tcp_sender_close(TCPSender *sender);

// 检查连接是否已建立
bool tcp_sender_is_connected(const TCPSender *sender);

// 获取当前TCP状态
TCPState tcp_sender_get_state(const TCPSender *sender);

// -------------------------- 私有成员访问接口（供测试用） --------------------------
// 获取当前拥塞窗口大小（MSS为单位）
uint32_t tcp_sender_get_cwnd(const TCPSender *sender);

// 获取慢启动阈值
uint32_t tcp_sender_get_ssthresh(const TCPSender *sender);

// 判断是否处于慢启动阶段
bool tcp_sender_is_in_slow_start(const TCPSender *sender);

// 获取当前超时时间（毫秒）
int tcp_sender_get_timeout(const TCPSender *sender);

#endif // TCP_SENDER_H
// 修复：文件末尾添加换行符

