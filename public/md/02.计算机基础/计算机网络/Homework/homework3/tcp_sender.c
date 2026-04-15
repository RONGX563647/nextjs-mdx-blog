#include "tcp_sender.h"
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <time.h>

// -------------------------- 无参数函数加void（已修复） --------------------------
// 生成随机初始序列号
static uint32_t generate_initial_seq(void) {
    return (uint32_t)time(NULL) % 0x7FFFFFFF;
}

// 创建重传队列
static RetransmissionQueue* retransmission_queue_create(void) {
    RetransmissionQueue *queue = (RetransmissionQueue*)malloc(sizeof(RetransmissionQueue));
    if (queue) {
        queue->head = NULL;
        queue->tail = NULL;
        queue->size = 0;
    }
    return queue;
}

// -------------------------- 内部辅助函数（不变） --------------------------
// 销毁重传队列
static void retransmission_queue_destroy(RetransmissionQueue *queue) {
    if (!queue) return;

    RetransmissionNode *current = queue->head;
    while (current) {
        RetransmissionNode *next = current->next;
        // 修复：data改为const后，无需free（数据来自外部，由外部管理）
        current->segment.data = NULL; // 避免野指针
        free(current);
        current = next;
    }
    free(queue);
}

// 向重传队列添加报文段
static void retransmission_queue_add(RetransmissionQueue *queue, const TCPSegment *seg) {
    if (!queue || !seg) return;

    RetransmissionNode *node = (RetransmissionNode*)malloc(sizeof(RetransmissionNode));
    if (!node) return;

    // 复制报文段（data为const，直接赋值，不深拷贝）
    node->segment = *seg;
    node->send_time = time(NULL);
    node->retrans_count = 0;
    node->next = NULL;

    // 添加到队列尾部
    if (!queue->head) {
        queue->head = node;
        queue->tail = node;
    } else {
        queue->tail->next = node;
        queue->tail = node;
    }
    queue->size++;
}

// 从队列中移除已确认的报文段
static void retransmission_queue_remove_confirmed(RetransmissionQueue *queue, uint32_t ack_num) {
    if (!queue || queue->size == 0) return;

    RetransmissionNode *current = queue->head;
    RetransmissionNode *prev = NULL;

    while (current) {
        const TCPSegment *seg = &current->segment;
        size_t seg_length = seg->data_len + (seg->syn ? 1 : 0) + (seg->fin ? 1 : 0);
        uint32_t seg_end = seg->seq_num + seg_length;

        // 如果报文段完全被确认，则移除
        if (seg_end <= ack_num) {
            RetransmissionNode *to_remove = current;
            current = current->next;

            if (prev) {
                prev->next = current;
                if (!current) {
                    queue->tail = prev;
                }
            } else {
                queue->head = current;
                if (!current) {
                    queue->tail = NULL;
                }
            }

            free(to_remove);
            queue->size--;
        } else {
            prev = current;
            current = current->next;
        }
    }
}

// 检查超时的报文段并重新发送
static void retransmission_queue_check_timeouts(RetransmissionQueue *queue, int timeout,
                                               void (*send_segment)(const TCPSegment*, void*),
                                               void *user_data, int *max_retrans_exceeded) {
    if (!queue || queue->size == 0 || !send_segment) return;

    *max_retrans_exceeded = 0;
    time_t now = time(NULL);

    RetransmissionNode *current = queue->head;
    while (current) {
        // 检查是否超时（转换为毫秒）
        double elapsed = difftime(now, current->send_time) * 1000;
        if (elapsed >= timeout) {
            // 重传次数过多，认为连接已断开
            if (current->retrans_count >= MAX_RETRANSMISSIONS) {
                *max_retrans_exceeded = 1;
                break;
            }

            // 重新发送报文段
            send_segment(&current->segment, user_data);

            // 更新发送时间和重传计数
            current->send_time = now;
            current->retrans_count++;
        }
        current = current->next;
    }
}

// 发送TCP报文段（内部辅助函数）
static void send_tcp_segment(TCPSender *sender, const TCPSegment *seg) {
    if (!sender || !seg || !sender->send_segment) return;

    // 调用回调函数发送报文
    sender->send_segment(seg, sender->user_data);

    // 更新最后活动时间
    sender->last_activity = time(NULL);

    // 除了纯ACK报文外，其他报文加入重传队列
    if (!seg->ack || seg->syn || seg->fin || (seg->data_len > 0)) {
        retransmission_queue_add(sender->retrans_queue, seg);
    }
}

// -------------------------- 核心功能实现（修复指针赋值） --------------------------
// 创建TCP发送端
TCPSender* tcp_sender_create(void (*send_segment)(const TCPSegment*, void*), void *user_data) {
    TCPSender *sender = (TCPSender*)malloc(sizeof(TCPSender));
    if (!sender) return NULL;

    // 初始化状态和序列号
    sender->state = CLOSED;
    sender->initial_seq = generate_initial_seq();
    sender->seq_num = sender->initial_seq;
    sender->ack_num = 0;
    sender->window_size = 0;

    // 初始化重传队列
    sender->retrans_queue = retransmission_queue_create();
    if (!sender->retrans_queue) {
        free(sender);
        return NULL;
    }

    // 初始化拥塞控制参数
    sender->cwnd = 1;                  // 初始拥塞窗口：1个MSS
    sender->ssthresh = 65535;          // 初始慢启动阈值：65535字节
    sender->in_slow_start = true;      // 初始处于慢启动阶段

    // 初始化超时重传参数
    sender->timeout = INITIAL_TIMEOUT; // 初始超时时间：1000ms
    sender->last_activity = time(NULL);

    // 初始化回调函数
    sender->send_segment = send_segment;
    sender->user_data = user_data;

    return sender;
}

// 销毁TCP发送端
void tcp_sender_destroy(TCPSender *sender) {
    if (!sender) return;

    // 销毁重传队列
    retransmission_queue_destroy(sender->retrans_queue);
    free(sender);
}

// 启动TCP连接（发送SYN，三次握手第一步）
void tcp_sender_connect(TCPSender *sender) {
    if (!sender || sender->state != CLOSED) return;

    // 构造SYN报文（无数据，SYN标志置位）
    TCPSegment syn_segment = {
        .seq_num = sender->seq_num,
        .ack_num = 0,
        .syn = true,
        .ack = false,
        .fin = false,
        .window_size = 0,
        .data = NULL,
        .data_len = 0
    };

    // 发送SYN报文
    send_tcp_segment(sender, &syn_segment);

    // 更新状态和序列号（SYN报文消耗1个序列号）
    sender->state = SYN_SENT;
    sender->seq_num++;
}

// 发送数据（仅在ESTABLISHED状态下有效）
size_t tcp_sender_send(TCPSender *sender, const void *data, size_t len) {
    if (!sender || !data || len == 0 || sender->state != ESTABLISHED) {
        return 0;
    }

    size_t total_sent = 0;
    const uint8_t *data_ptr = (const uint8_t*)data;

    // 有效窗口 = 接收窗口与拥塞窗口的较小值（字节数）
    uint32_t effective_window = (sender->window_size < sender->cwnd * MSS) ?
                               sender->window_size : sender->cwnd * MSS;

    // 分块发送（每次最多发送1个MSS）
    while (total_sent < len && effective_window > 0) {
        size_t send_len = len - total_sent;
        if (send_len > MSS) {
            send_len = MSS; // 单次发送不超过MSS
        }

        // 构造数据报文（修复：data_ptr是const，直接赋值给const uint8_t*）
        TCPSegment segment = {
            .seq_num = sender->seq_num,
            .ack_num = sender->ack_num,
            .syn = false,
            .ack = true,
            .fin = false,
            .window_size = 0, // 实际场景应设置发送窗口，此处简化
            .data = data_ptr + total_sent, // 无需强制转换，类型匹配
            .data_len = send_len
        };

        // 发送报文
        send_tcp_segment(sender, &segment);

        // 更新统计和状态
        total_sent += send_len;
        sender->seq_num += send_len;
        effective_window -= send_len;
    }

    return total_sent;
}

// 处理接收到的ACK报文
void tcp_sender_process_ack(TCPSender *sender, const TCPSegment *ack_segment) {
    if (!sender || !ack_segment || !ack_segment->ack) return;

    // 更新确认号和接收窗口
    sender->ack_num = ack_segment->ack_num;
    sender->window_size = ack_segment->window_size;

    // 移除重传队列中已确认的报文段
    retransmission_queue_remove_confirmed(sender->retrans_queue, ack_segment->ack_num);

    // 根据当前状态处理逻辑
    switch (sender->state) {
        case SYN_SENT:
            // 收到SYN-ACK → 完成三次握手
            if (ack_segment->syn && ack_segment->ack_num == sender->seq_num) {
                sender->state = ESTABLISHED;

                // 重设拥塞控制参数
                sender->cwnd = 1;
                sender->ssthresh = 65535;
                sender->in_slow_start = true;

                // 发送第三次握手的ACK（纯ACK，无数据）
                TCPSegment ack = {
                    .seq_num = sender->seq_num,
                    .ack_num = ack_segment->seq_num + 1, // ACK消耗1个序列号
                    .syn = false,
                    .ack = true,
                    .fin = false,
                    .window_size = 0,
                    .data = NULL,
                    .data_len = 0
                };
                send_tcp_segment(sender, &ack);
            }
            break;

        case ESTABLISHED:
            // 处理数据ACK → 更新拥塞控制
            if (sender->in_slow_start) {
                // 慢启动：拥塞窗口指数增长（每次ACK+1）
                sender->cwnd++;

                // 超过阈值 → 进入拥塞避免阶段
                if (sender->cwnd >= sender->ssthresh) {
                    sender->in_slow_start = false;
                }
            } else {
                // 拥塞避免：拥塞窗口线性增长（每次ACK+1/cwnd）
                sender->cwnd += 1 / sender->cwnd;
            }

            // 重传队列为空 → 重置超时时间
            if (sender->retrans_queue->size == 0) {
                sender->timeout = INITIAL_TIMEOUT;
            }
            break;

        case FIN_WAIT_1:
            // 收到FIN的ACK → 进入FIN_WAIT_2
            if (ack_segment->ack_num == sender->seq_num) {
                sender->state = FIN_WAIT_2;
            }
            break;

        case FIN_WAIT_2:
            // 收到对方FIN → 发送ACK并进入TIME_WAIT
            if (ack_segment->fin) {
                TCPSegment ack = {
                    .seq_num = sender->seq_num,
                    .ack_num = ack_segment->seq_num + 1, // ACK FIN消耗1个序列号
                    .syn = false,
                    .ack = true,
                    .fin = false,
                    .window_size = 0,
                    .data = NULL,
                    .data_len = 0
                };
                send_tcp_segment(sender, &ack);
                sender->state = TIME_WAIT;
                sender->seq_num++;
            }
            break;

        default:
            break;
    }
}

// 处理超时事件
void tcp_sender_handle_timeout(TCPSender *sender) {
    if (!sender) return;

    int max_retrans_exceeded = 0;

    // 检查并重传超时报文段
    retransmission_queue_check_timeouts(sender->retrans_queue, sender->timeout,
                                       sender->send_segment, sender->user_data,
                                       &max_retrans_exceeded);

    // 重传次数过多 → 关闭连接
    if (max_retrans_exceeded) {
        sender->state = CLOSED;
        retransmission_queue_destroy(sender->retrans_queue);
        sender->retrans_queue = retransmission_queue_create();
        return;
    }

    // 仍有未确认报文 → 超时时间指数退避（×2）
    if (sender->retrans_queue->size > 0) {
        sender->timeout *= 2;

        // 超时后重置拥塞控制：进入慢启动
        sender->ssthresh = sender->cwnd / 2;
        sender->cwnd = 1;
        sender->in_slow_start = true;
    }
}

// 关闭TCP连接（发送FIN）
void tcp_sender_close(TCPSender *sender) {
    if (!sender || sender->state != ESTABLISHED) return;

    // 构造FIN报文（无数据，FIN标志置位）
    TCPSegment fin_segment = {
        .seq_num = sender->seq_num,
        .ack_num = sender->ack_num,
        .syn = false,
        .ack = true,
        .fin = true,
        .window_size = 0,
        .data = NULL,
        .data_len = 0
    };

    // 发送FIN报文
    send_tcp_segment(sender, &fin_segment);

    // 更新状态和序列号（FIN报文消耗1个序列号）
    sender->state = FIN_WAIT_1;
    sender->seq_num++;
}

// 检查连接是否已建立
bool tcp_sender_is_connected(const TCPSender *sender) {
    return sender && sender->state == ESTABLISHED;
}

// 获取当前TCP状态
TCPState tcp_sender_get_state(const TCPSender *sender) {
    return sender ? sender->state : CLOSED;
}

// -------------------------- 私有成员访问接口实现 --------------------------
// 获取当前拥塞窗口大小
uint32_t tcp_sender_get_cwnd(const TCPSender *sender) {
    return sender ? sender->cwnd : 0;
}

// 获取慢启动阈值
uint32_t tcp_sender_get_ssthresh(const TCPSender *sender) {
    return sender ? sender->ssthresh : 0;
}

// 判断是否处于慢启动阶段
bool tcp_sender_is_in_slow_start(const TCPSender *sender) {
    return sender && sender->in_slow_start;
}

// 获取当前超时时间
int tcp_sender_get_timeout(const TCPSender *sender) {
    return sender ? sender->timeout : 0;
}

// 修复：文件末尾添加换行符

