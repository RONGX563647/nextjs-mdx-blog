# TCP发送端（TCPSender）实现

本项目实现了TCP协议发送端的核心逻辑，包括三次握手、带序列号的数据传输、超时重传机制和拥塞控制算法。

## 功能特点

- 完整的TCP连接建立（三次握手）和关闭过程
- 带序列号的数据报文段发送
- 超时重传机制，处理网络丢包情况
- 拥塞控制，实现慢启动算法
- 状态管理，遵循TCP有限状态机

## 数据结构说明

1. **TCPSegment**: TCP报文段结构，包含序列号、确认号、控制标志、窗口大小和数据。
2. **RetransmissionQueue**: 重传队列，用于管理已发送但未确认的报文段。
3. **TCPSender**: TCP发送端主体结构，包含当前状态、序列号、拥塞控制参数等。

## 核心算法实现

### 1. 三次握手

- 第一步：发送SYN报文，状态变为SYN_SENT
- 第二步：收到SYN-ACK报文后，发送ACK报文，状态变为ESTABLISHED
- 实现代码：`tcp_sender_connect`函数和`tcp_sender_process_ack`函数中的SYN_SENT状态处理

### 2. 超时重传机制

- 已发送但未确认的报文段保存在重传队列中
- 每个报文段都记录发送时间和重传次数
- 超时发生时，重新发送超时的报文段，并采用指数退避策略调整超时时间
- 重传次数超过最大值时，认为连接已断开
- 实现代码：`retransmission_queue_check_timeouts`函数和`tcp_sender_handle_timeout`函数

### 3. 拥塞控制

- 初始拥塞窗口（cwnd）为1个MSS
- 慢启动阶段：每收到一个确认，cwnd值加1（指数增长）
- 当cwnd超过慢启动阈值（ssthresh），进入拥塞避免阶段
- 超时发生时，ssthresh设为当前cwnd的一半，cwnd重置为1，重新进入慢启动
- 实现代码：`tcp_sender_process_ack`函数和`tcp_sender_handle_timeout`函数中的拥塞控制部分

## 使用方法

1. 创建TCP发送端实例，提供发送回调函数
   ```c
   TCPSender *sender = tcp_sender_create(send_callback, user_data);
   ```

2. 建立TCP连接（发送SYN报文）
   ```c
   tcp_sender_connect(sender);
   ```

3. 连接建立后发送数据
   ```c
   if (tcp_sender_is_connected(sender)) {
       const char *data = "Hello, TCP!";
       size_t sent = tcp_sender_send(sender, data, strlen(data));
   }
   ```

4. 处理接收到的ACK报文
   ```c
   // 假设收到了一个ack_segment
   tcp_sender_process_ack(sender, ack_segment);
   ```

5. 定期处理超时事件
   ```c
   tcp_sender_handle_timeout(sender);
   ```

6. 关闭连接
   ```c
   tcp_sender_close(sender);
   ```

7. 销毁TCP发送端实例
   ```c
   tcp_sender_destroy(sender);
   ```

## 测试要点

1. 三次握手过程是否正常完成
2. 数据传输是否正确，序列号是否正确递增
3. 丢包场景下，超时重传机制是否生效
4. 拥塞控制是否正常工作：
    - 慢启动阶段cwnd是否指数增长
    - 超时后cwnd是否重置为1，ssthresh是否正确调整
5. 连接关闭过程是否正确

## 参考文档

- RFC 793: Transmission Control Protocol
- RFC 5681: TCP Congestion Control
    