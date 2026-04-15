# 理论

# 计算机网络（传输层，Transport Layer）深度课程笔记

## 一、传输层的核心定位与边界

传输层（Transport Layer）是 OSI 七层模型的第 4 层，位于**网络层（Layer 3）** 与**应用层（Layer 5）** 之间，是 “端到端通信” 的核心载体。其核心边界与职责可概括为：

- **向下**：依赖网络层提供的 “主机到主机” 分组交付服务（如 IP 协议的尽力而为交付），但不关心底层网络的具体实现（如是否经过路由、链路类型）。
- **向上**：为应用层进程提供 “进程到进程” 的通信服务，屏蔽底层网络的不可靠性（如丢包、延迟、乱序），提供不同质量的传输服务（可靠 / 不可靠、有序 / 无序、流 / 报文）。

**核心价值**：将 “主机级通信” 提升为 “进程级通信”，是用户可见的 “最底层服务”（应用程序直接通过套接字与传输层交互）。

## 二、传输层的核心服务与原语

传输层通过**服务原语（Service Primitives）** 向应用层提供服务，不同协议的服务原语差异显著，核心服务包括：

| 服务类型          | 描述                                                         | UDP 支持 | TCP 支持 |
| ----------------- | ------------------------------------------------------------ | -------- | -------- |
| 无连接 / 面向连接 | 通信前是否需要建立连接（如 TCP 需握手，UDP 直接发送）        | 无连接   | 面向连接 |
| 可靠性            | 保证数据无丢失、无重复、按序交付（通过重传、确认等机制）     | 不支持   | 支持     |
| 流量控制          | 避免发送方速率超过接收方处理能力（通过窗口机制）             | 不支持   | 支持     |
| 拥塞控制          | 避免发送方速率超过网络承载能力（通过感知网络拥塞调整速率）   | 不支持   | 支持     |
| 报文边界保留      | 是否保留应用层发送的 “消息边界”（如 UDP 保留，TCP 视为字节流） | 支持     | 不支持   |
| 全双工 / 半双工   | 能否双向同时传输数据                                         | 全双工   | 全双工   |

**服务原语示例**（以 TCP 为例）：

- `LISTEN`：服务器准备接收连接；
- `CONNECT`：客户端发起连接请求；
- `SEND`：发送数据；
- `RECEIVE`：接收数据；
- `CLOSE`：释放连接。

## 三、复用与分用：进程通信的基石

传输层通过**端口号（Port Number）** 实现 “复用（Multiplexing）” 与 “分用（Demultiplexing）”，是进程通信的核心机制。

### 1. 端口号的定义与范围

端口号是 16 位无符号整数（范围 0~65535），用于唯一标识主机上的应用进程，分为三类：

- **知名端口（Well-known Ports）**：0~1023，由 IANA 分配，绑定固定服务（如 80 对应 HTTP，443 对应 HTTPS，53 对应 DNS）；
- **注册端口（Registered Ports）**：1024~49151，由应用程序注册使用（如 3306 对应 MySQL）；
- **动态端口（Dynamic Ports）**：49152~65535，临时分配给客户端进程（通信结束后释放）。

**注意**：端口号仅在单台主机内有意义，“IP 地址 + 端口号” 构成全局唯一的 “套接字（Socket）” 标识（如 `192.168.1.1:8080`）。

### 2. 分用（Demultiplexing）过程

当传输层收到网络层的分组（如 IP 数据报）时，需按以下步骤将数据交付给正确的应用进程：

1. 解析分组的传输层头部（提取源端口、目的端口）；
2. 检查本机的 “传输层端口 - 进程” 映射表（由操作系统维护）；
3. 根据**目的端口**找到对应的应用进程，将数据交付给它。

**示例**：收到一个 TCP 段，目的端口为 80 → 交付给本机的 HTTP 服务器进程。

### 3. 复用（Multiplexing）过程

多个应用进程的数据通过传输层发送时，需按以下步骤共享网络层资源：

1. 每个应用进程通过套接字绑定一个端口号；
2. 传输层为每个进程的数据添加传输层头部（含源端口、目的端口）；
3. 将封装后的分组交给网络层，由网络层路由到目标主机。

**示例**：本机的浏览器（端口 50000）和邮件客户端（端口 50001）同时发送数据，传输层分别添加源端口 50000 和 50001，网络层统一路由。

## 四、用户数据报协议（UDP）

UDP（User Datagram Protocol）是**无连接、不可靠、轻量级**的传输层协议，RFC 768 定义，核心设计目标是 “最小化传输层开销”。

### 1. UDP 数据报结构（8 字节头部 + 数据）

| 字段     | 长度（字节） | 详细说明                                                     |
| -------- | ------------ | ------------------------------------------------------------ |
| 源端口   | 2            | 可选（若不需要回复，可设为 0），标识发送进程的端口号。       |
| 目的端口 | 2            | 必选，标识接收进程的端口号（如 DNS 用 53）。                 |
| 长度     | 2            | UDP 数据报总长度（头部 + 数据），最小值为 8（仅头部），最大值 65535 字节（受 16 位限制）。 |
| 校验和   | 2            | 用于检测数据报在传输中的错误（包括头部、数据、伪头部），可选但建议启用。 |

**伪头部（Pseudo-Header）**：UDP 校验和计算时需引入 “伪头部”（仅用于校验，不实际传输），包含源 IP、目的 IP、协议类型（UDP 为 17）、UDP 长度，目的是确保数据报被交付到正确的主机和协议。
伪头部结构（12 字节）：

plaintext











```plaintext
源 IP 地址（4 字节） + 目的 IP 地址（4 字节） + 保留（1 字节，0） + 协议（1 字节，17） + UDP 长度（2 字节）
```

### 2. UDP 校验和计算步骤

1. 将 UDP 头部、数据、伪头部拼接成二进制流；
2. 若总长度为奇数，末尾补一个 0 字节（使总长度为偶数）；
3. 按 16 位分组，计算所有分组的反码和（即每个 16 位值相加，超过 16 位则进位累加）；
4. 对结果取反码，得到校验和，存入 UDP 头部的 “校验和” 字段。

**接收方验证**：将伪头部、头部、数据（含校验和）按同样方法计算，若结果为全 1（16 位），则无错误；否则丢弃或交付应用层（由应用决定是否处理）。

### 3. UDP 的核心特性与适用场景

#### （1）核心特性

- **无连接**：无需握手 / 挥手，发送方直接封装数据报发送，延迟极低（适合实时场景）；
- **不可靠**：不保证交付（丢包不重传）、不保证按序（接收方可能乱序）、不保证无重复（可能因网络重传导致重复）；
- **保留报文边界**：应用层发送的每个 “消息” 被封装为一个 UDP 数据报，接收方按原边界交付（TCP 无此特性）；
- **无拥塞控制**：发送速率不受网络状态限制（可能加剧网络拥塞，但适合需要固定速率的场景）。

#### （2）典型适用场景

- **实时音视频**（如 Zoom、抖音直播）：允许少量丢包（可通过编码容错补偿），但延迟必须低（UDP 无握手 / 重传延迟）；
- **在线游戏**（如王者荣耀）：位置更新、操作指令需实时到达（延迟 >100ms 影响体验），丢包可通过预测补偿；
- **域名解析（DNS）**：查询请求小（通常 <512 字节），需快速响应（UDP 比 TCP 少一次 RTT 握手）；
- **物联网（IoT）**：传感器数据（如温度、湿度）通常小而频繁，容忍丢包（可周期性重传）。

## 五、传输控制协议（TCP）

TCP（Transmission Control Protocol）是**面向连接、可靠、字节流**的传输层协议（RFC 793 及后续扩展），核心设计目标是 “在不可靠的网络上提供可靠的字节流传输”。

### 1. TCP 段结构（最小 20 字节头部 + 数据）

TCP 头部结构复杂，包含 10 个基础字段和可选字段，核心字段如下：

| 字段                            | 长度      | 详细说明                                                     |
| ------------------------------- | --------- | ------------------------------------------------------------ |
| 源端口 / 目的端口               | 各 2 字节 | 同 UDP，标识收发进程（如 HTTP 客户端用动态端口，服务器用 80）。 |
| 序列号（Sequence Number）       | 4 字节    | 本报文段中**第一个数据字节**在整个字节流中的序号（初始序号 ISN 随机生成，避免历史数据干扰）。 |
| 确认号（Acknowledgment Number） | 4 字节    | 期望接收的**下一个字节的序号**（表明确认到该序号前的所有字节已正确接收，即 “累积确认”）。 |
| 数据偏移（Data Offset）         | 4 位      | TCP 头部长度（以 4 字节为单位，即 “32 位字”），范围 5~15（对应 20~60 字节头部）。 |
| 保留（Reserved）                | 6 位      | 预留未来使用（必须为 0）。                                   |
| 控制位（Control Flags）         | 6 位      | 共 6 个标志位，关键标志： - `SYN`：同步序号（用于建立连接，初始化 ISN）； - `ACK`：确认号有效（大部分段都置位）； - `FIN`：发送方无数据要发送（请求关闭连接）； - `RST`：重置连接（用于错误恢复，如收到无效段）； - `PSH`：接收方应立即将数据推送给应用层（不缓存）； - `URG`：紧急数据（配合紧急指针使用）。 |
| 窗口大小（Window Size）         | 2 字节    | 接收方的**接收窗口大小**（单位：字节），用于流量控制（告知发送方可发送的最大字节数）。 |
| 校验和（Checksum）              | 2 字节    | 检测 TCP 段错误（含头部、数据、伪头部，计算方法类似 UDP）。  |
| 紧急指针（Urgent Pointer）      | 2 字节    | 仅 `URG` 置位时有效，指向紧急数据在段中的末尾（紧急数据优先处理）。 |
| 选项（Options）                 | 0~40 字节 | 可选扩展字段，常见选项： - `MSS`（最大段大小）：协商每个段的最大数据长度（通常 = MTU - 40 字节）； - `SACK`（选择性确认）：允许接收方确认非连续的段； - `窗口扩大因子`：将窗口大小扩展为 32 位（突破 65535 字节限制）； - `时间戳`：用于计算 RTT（往返时间）和避免序号回绕。 |

### 2. TCP 连接管理：三次握手与四次挥手

TCP 是 “面向连接” 的协议，通信前需建立连接（三次握手），结束后需释放连接（四次挥手）。

#### （1）三次握手（建立连接）

目的：同步双方的初始序列号（ISN），确保双方都准备好接收数据。
步骤：

1. **客户端 → 服务器**：发送 `SYN` 段（`SYN=1`，`seq=x`，`x` 为客户端 ISN），进入 `SYN_SENT` 状态；
2. **服务器 → 客户端**：回复 `SYN+ACK` 段（`SYN=1`，`ACK=1`，`seq=y`（服务器 ISN），`ack=x+1`（确认客户端的 SYN 段）），进入 `SYN_RCVD` 状态；
3. **客户端 → 服务器**：发送 `ACK` 段（`ACK=1`，`seq=x+1`，`ack=y+1`（确认服务器的 SYN 段）），双方进入 `ESTABLISHED` 状态，连接建立。

**为何需要三次握手？**

- 第一次握手：客户端告知服务器 “我要连接，我的 ISN 是 x”；
- 第二次握手：服务器告知客户端 “我收到了，我的 ISN 是 y，准备好接收”；
- 第三次握手：客户端告知服务器 “我收到了你的 ISN，我也准备好接收”。
  三次握手可避免 “已失效的连接请求” 被服务器误接收（如客户端的旧 SYN 段延迟到达，服务器若直接建立连接会浪费资源，第三次握手可验证客户端是否仍需连接）。

#### （2）四次挥手（释放连接）

目的：确保双方数据都已传输完毕，有序释放资源。
步骤（假设客户端主动关闭）：

1. **客户端 → 服务器**：发送 `FIN` 段（`FIN=1`，`seq=u`），表示 “客户端无数据发送”，进入 `FIN_WAIT_1` 状态；
2. **服务器 → 客户端**：回复 `ACK` 段（`ACK=1`，`seq=v`，`ack=u+1`），表示 “收到客户端的关闭请求”，进入 `CLOSE_WAIT` 状态（客户端进入 `FIN_WAIT_2` 状态）；
3. **服务器 → 客户端**：若服务器也无数据发送，发送 `FIN` 段（`FIN=1`，`ACK=1`，`seq=w`，`ack=u+1`），表示 “服务器无数据发送”，进入 `LAST_ACK` 状态；
4. **客户端 → 服务器**：回复 `ACK` 段（`ACK=1`，`seq=u+1`，`ack=w+1`），进入 `TIME_WAIT` 状态（等待 2MSL 后关闭）；服务器收到 ACK 后进入 `CLOSED` 状态。

**关键细节**：

- `TIME_WAIT` 状态：客户端需等待 2 倍最大段生命周期（MSL，通常 1~2 分钟），确保最后一个 ACK 被服务器收到（若服务器未收到会重发 FIN 段），且避免旧段干扰新连接；
- 四次挥手的原因：服务器收到 FIN 后，可能还有数据未发送，因此先回复 ACK（第二步），待数据发送完毕后再发送 FIN（第三步），因此需分两次回复。

### 3. TCP 可靠传输机制

TCP 通过一系列机制保证 “字节流的可靠交付”（无丢失、无重复、按序），核心机制包括：

#### （1）序列号与确认（ACK）

- **序列号**：每个字节在字节流中都有唯一序号（如客户端发送的第一个字节序号为 ISN+1，后续字节依次递增），用于标识数据位置；
- **累积确认**：接收方的确认号 `ack = N` 表示 “所有序号 < N 的字节已正确接收”，发送方可据此判断哪些数据需要重传；
- **重复 ACK**：若接收方收到乱序段（如期望序号 100，但收到 120），会重复发送 `ack=100`，提示发送方 “100 之前的段可能丢失”。

#### （2）超时重传（Timeout Retransmission）

发送方为每个已发送但未确认的段设置**超时定时器**，若超时未收到 ACK，则重传该段。

- 超时时间（RTO）

  ：动态计算，基于往返时间（RTT）调整（RFC 6298 标准）：

  1. 测量样本 RTT（某段从发送到收到 ACK 的时间）；
  2. 计算平滑 RTT（SRTT）：`SRTT = (1 - α) × SRTT + α × 样本 RTT`（α 通常为 0.125）；
  3. 计算 RTT 偏差（RTTVAR）：`RTTVAR = (1 - β) × RTTVAR + β × |样本 RTT - SRTT|`（β 通常为 0.25）；
  4. RTO = SRTT + 4×RTTVAR（确保覆盖大多数 RTT 波动）。

#### （3）快速重传（Fast Retransmit）

当发送方收到**3 个重复 ACK**（如连续收到 3 个 `ack=100`），无需等待超时，立即重传期望序号的段（如序号 100 开始的段）。

- 原理：3 个重复 ACK 通常意味着该段已丢失（而非延迟），快速重传可减少重传延迟。

#### （4）选择性确认（SACK，RFC 2018）

标准累积确认只能确认连续的字节，若中间段丢失（如收到 1-100、151-200，但 101-150 丢失），接收方无法告知发送方 “151-200 已收到”。
SACK 机制通过选项字段让接收方明确标识 “已正确接收的非连续字节范围”，发送方仅重传丢失的段（如 101-150），减少冗余重传。

### 4. 流量控制（Flow Control）

流量控制用于**避免发送方速率超过接收方的处理能力**（防止接收方缓存溢出），核心机制是 “滑动窗口”。

#### （1）接收窗口（Receive Window，rwnd）

接收方通过 TCP 头部的 “窗口大小” 字段告知发送方自己的**剩余缓存空间**（`rwnd = 接收缓存总大小 - 已接收未交付应用层的字节数`）。

- 发送方的 “发送窗口” 上限受 `rwnd` 限制（即发送方最多发送 `rwnd` 字节的数据）；
- 若接收方缓存已满（`rwnd=0`），发送方会定期发送 “窗口探查段”（1 字节数据），接收方在缓存有空间时回复新的 `rwnd`。

#### （2）滑动窗口机制

发送窗口是发送方维护的 “可发送但未确认” 字节范围，随 ACK 动态滑动：

- 窗口左侧：已确认的字节（可释放资源）；
- 窗口右侧：未发送的字节（超过 `rwnd` 限制）；
- 窗口内：可发送但未确认的字节（最多 `rwnd` 字节）。

**示例**：发送方窗口为 [100, 200)（序号 100~199 可发送），收到 `ack=150` 且 `rwnd=100` 后，窗口滑动为 [150, 250)。

### 5. 拥塞控制（Congestion Control）

拥塞控制用于**避免发送方速率超过网络的承载能力**（防止网络拥塞导致丢包），核心思想是 “通过网络反馈（如丢包、延迟）动态调整发送速率”。
TCP 拥塞控制由四个核心算法组成（以传统 TCP 为例）：

#### （1）慢启动（Slow Start）

- 初始状态：拥塞窗口（cwnd，发送方感知的网络承载能力）设为 1~4 个 MSS（最大段大小）；
- 规则：每收到一个 ACK，`cwnd = cwnd + 1`（以 MSS 为单位），即 cwnd 按**指数级**增长（如 1→2→4→8...）；
- 终止条件：cwnd 达到 “慢启动阈值（ssthresh）” 时，进入拥塞避免阶段。

#### （2）拥塞避免（Congestion Avoidance）

- 规则：每收到一个 ACK，`cwnd = cwnd + 1/cwnd`（近似线性增长，如 8→9→10...）；
- 目的：缓慢增加发送速率，避免网络拥塞。

#### （3）快速重传与快速恢复（Fast Recovery）

当收到 3 个重复 ACK（视为 “轻微拥塞”）：

1. 快速重传丢失的段；
2. 调整阈值：`ssthresh = cwnd / 2`；
3. 进入快速恢复：`cwnd = ssthresh + 3`（补偿 3 个重复 ACK 已确认的段），之后每收到一个重复 ACK，`cwnd += 1`；收到新的 ACK 后，`cwnd = ssthresh`，进入拥塞避免。

#### （4）超时重传（视为 “严重拥塞”）

- 调整阈值：`ssthresh = cwnd / 2`；
- 重置 cwnd：`cwnd = 1`（重新进入慢启动）。

### 6. TCP 性能优化机制

#### （1）Nagle 算法

解决 “小分组泛滥” 问题（如多次发送 1 字节数据，导致头部占比过高）：

- 规则：若发送方有未确认的数据，则缓存小分组，直到收到 ACK 或缓存数据达到 MSS 再发送；
- 关闭场景：低延迟场景（如 SSH）可通过 `TCP_NODELAY` 选项关闭，避免交互延迟。

#### （2）延迟确认（Delayed ACK）

接收方不立即发送 ACK，而是延迟 200ms 左右，若期间有数据要发送，可将 ACK 与数据合并（减少 ACK 分组数量）。

#### （3）窗口扩大选项（Window Scaling）

突破 16 位窗口大小的限制（最大 65535 字节），通过 “窗口扩大因子（shift count）” 将窗口大小扩展为 `实际窗口 = 头部窗口值 × 2^shift count`（最大支持 1GB）。

## 六、TCP 与 UDP 的对比及应用选择

| 特性     | TCP                                    | UDP                             |
| -------- | -------------------------------------- | ------------------------------- |
| 连接类型 | 面向连接（三次握手 / 四次挥手）        | 无连接（直接发送）              |
| 可靠性   | 可靠（无丢失、无重复、按序）           | 不可靠（可能丢包、乱序、重复）  |
| 头部开销 | 20~60 字节                             | 8 字节                          |
| 拥塞控制 | 有（避免网络拥塞）                     | 无（可能加剧拥塞）              |
| 流量控制 | 有（滑动窗口）                         | 无（需应用层处理）              |
| 报文边界 | 无（视为字节流）                       | 有（保留消息边界）              |
| 适用场景 | 文件传输、网页浏览、邮件（可靠性优先） | 音视频、游戏、DNS（实时性优先） |

## 七、传输层的挑战与发展

### 1. 核心挑战

- **队头阻塞（Head-of-Line Blocking）**：TCP 中一个段丢失会导致后续所有段被阻塞（即使已正确到达），影响吞吐量（如 HTTP/1.1 基于 TCP 的队头阻塞）；
- **移动网络适配**：TCP 拥塞控制对高延迟、高丢包的移动网络不友好（易误判拥塞）；
- **安全性**：TCP/UDP 本身不加密，需依赖上层协议（如 TLS）提供安全保障。

### 2. 现代传输层协议：QUIC

QUIC（Quick UDP Internet Connections，RFC 9000）是基于 UDP 的新型传输协议，融合了 TCP 的可靠性与 UDP 的灵活性：

- 无队头阻塞（每个流独立传输）；
- 0-RTT 建立连接（复用 TLS 会话）；
- 自适应拥塞控制（更适合移动网络）；
- 内置加密（无需额外 TLS 层）。
  目前已被 HTTP/3 采用，成为主流浏览器支持的传输协议。

## 八、总结

传输层是 “端到端通信” 的核心，通过 UDP 和 TCP 提供差异化服务：

- UDP 以 “最小开销” 满足实时性需求，适合音视频、游戏等场景；
- TCP 以 “复杂机制” 提供可靠传输，适合文件传输、网页等场景。

理解传输层的机制（如复用分用、连接管理、可靠传输、拥塞控制）是设计高性能网络应用的基础，而 QUIC 等新型协议的发展也在重新定义传输层的边界。







# 实验

# 传输层（TCP/UDP）Go 语言实验

## 实验一：UDP 回声服务器与客户端

### 实验目标

- 理解 UDP 协议的无连接特性
- 掌握 Go 语言中 UDP 套接字的创建与使用
- 实践端口复用与分用机制

### 核心代码实现

```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"time"
)

// UDP客户端：向服务器发送数据并接收回声
func main() {
	// 检查命令行参数
	if len(os.Args) < 3 {
		fmt.Println("使用方法: ./udp_client 服务器地址 端口")
		fmt.Println("示例: ./udp_client localhost 8080")
		os.Exit(1)
	}

	serverAddr := os.Args[1]
	port := os.Args[2]

	// 解析服务器地址
	addr, err := net.ResolveUDPAddr("udp", fmt.Sprintf("%s:%s", serverAddr, port))
	if err != nil {
		log.Fatalf("无法解析服务器地址: %v", err)
	}

	// 创建UDP连接
	conn, err := net.DialUDP("udp", nil, addr)
	if err != nil {
		log.Fatalf("无法连接到服务器: %v", err)
	}
	defer conn.Close()

	// 设置读取超时
	err = conn.SetReadDeadline(time.Now().Add(5 * time.Second))
	if err != nil {
		log.Fatalf("设置超时错误: %v", err)
	}

	// 从标准输入读取用户输入
	scanner := bufio.NewScanner(os.Stdin)
	fmt.Println("请输入要发送的消息（输入exit退出）:")

	for {
		fmt.Print("> ")
		if !scanner.Scan() {
			break
		}

		message := scanner.Text()
		if message == "exit" {
			break
		}

		// 发送数据到服务器
		_, err := conn.Write([]byte(message))
		if err != nil {
			log.Printf("发送数据错误: %v", err)
			continue
		}

		// 接收服务器的回声
		buffer := make([]byte, 1024)
		n, _, err := conn.ReadFromUDP(buffer)
		if err != nil {
			log.Printf("接收数据错误: %v", err)
			continue
		}

		fmt.Printf("服务器回声: %s\n", string(buffer[:n]))
	}

	if err := scanner.Err(); err != nil {
		log.Printf("输入错误: %v", err)
	}
}

```



```go
package main

import (
	"log"
	"net"
	"os"
)

// UDP回声服务器：接收客户端数据并原样返回
func main() {
	// 解析命令行参数获取端口，默认使用8080
	port := ":8080"
	if len(os.Args) > 1 {
		port = ":" + os.Args[1]
	}

	// 创建UDP地址
	addr, err := net.ResolveUDPAddr("udp", port)
	if err != nil {
		log.Fatalf("无法解析地址: %v", err)
	}

	// 监听UDP端口
	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		log.Fatalf("无法监听端口: %v", err)
	}
	defer conn.Close()

	log.Printf("UDP回声服务器启动，监听端口 %s", port)

	// 缓冲区用于接收数据
	buffer := make([]byte, 1024)

	for {
		// 读取客户端发送的数据
		n, clientAddr, err := conn.ReadFromUDP(buffer)
		if err != nil {
			log.Printf("读取数据错误: %v", err)
			continue
		}

		// 打印接收信息
		log.Printf("从 %s 接收数据: %s", clientAddr.String(), string(buffer[:n]))

		// 将接收到的数据原样返回给客户端
		_, err = conn.WriteToUDP(buffer[:n], clientAddr)
		if err != nil {
			log.Printf("发送数据错误: %v", err)
			continue
		}
	}
}

```

UDP回声服务器与客户端

V1

创建时间：09:26



### 实验步骤

1. 启动 UDP 服务器：`go run udp_server.go 8080`
2. 启动多个 UDP 客户端连接同一服务器：`go run udp_client.go localhost 8080`
3. 在客户端输入消息，观察服务器回声和端口复用情况
4. 测试异常情况：关闭服务器后客户端发送数据，观察错误处理

### 思考题

1. 为什么 UDP 客户端不需要像 TCP 那样建立连接？
2. 如果多个客户端同时向服务器发送数据，服务器如何区分不同的客户端？
3. 尝试在服务器中修改代码，使它对不同客户端返回不同的响应，而不是简单的回声

## 实验二：TCP 文件传输工具

### 实验目标

- 理解 TCP 的面向连接和可靠传输特性
- 掌握 Go 语言中 TCP 套接字的使用
- 实践 TCP 的流控制和错误处理

### 核心代码实现



```go
package main

import (
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"path/filepath"
)

// TCP文件客户端：向服务器请求文件并保存到本地
func main() {
	// 检查命令行参数
	if len(os.Args) < 4 {
		fmt.Println("使用方法: ./tcp_file_client 服务器地址 端口 文件名")
		fmt.Println("示例: ./tcp_file_client localhost 8080 example.txt")
		os.Exit(1)
	}

	serverAddr := os.Args[1]
	port := os.Args[2]
	filename := os.Args[3]

	// 连接到服务器
	conn, err := net.Dial("tcp", fmt.Sprintf("%s:%s", serverAddr, port))
	if err != nil {
		log.Fatalf("无法连接到服务器: %v", err)
	}
	defer conn.Close()

	// 发送请求的文件名
	_, err = conn.Write([]byte(filename))
	if err != nil {
		log.Fatalf("发送文件名错误: %v", err)
	}

	// 读取文件大小（8字节）
	fileSizeBuf := make([]byte, 8)
	_, err = io.ReadFull(conn, fileSizeBuf)
	if err != nil {
		log.Fatalf("读取文件大小错误: %v", err)
	}
	fileSize := binary.LittleEndian.Uint64(fileSizeBuf)

	// 读取文件名
	remoteFilename, err := readLine(conn)
	if err != nil {
		log.Fatalf("读取文件名错误: %v", err)
	}

	// 确定本地保存路径
	localPath := filepath.Join(".", remoteFilename)
	if _, err := os.Stat(localPath); err == nil {
		fmt.Printf("文件 %s 已存在，是否覆盖? (y/n): ", localPath)
		var response string
		fmt.Scanln(&response)
		if response != "y" && response != "Y" {
			log.Println("用户取消操作")
			return
		}
	}

	// 创建本地文件
	file, err := os.Create(localPath)
	if err != nil {
		log.Fatalf("创建文件错误: %v", err)
	}
	defer file.Close()

	// 接收文件内容
	buffer := make([]byte, 4096)
	bytesReceived := 0
	log.Printf("开始接收文件 %s，大小: %d 字节", remoteFilename, fileSize)

	for bytesReceived < int(fileSize) {
		// 计算剩余字节数，避免读取超出文件大小的数据
		remaining := int(fileSize) - bytesReceived
		if remaining < len(buffer) {
			buffer = buffer[:remaining]
		}

		n, err := conn.Read(buffer)
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Fatalf("接收文件数据错误: %v", err)
		}

		// 写入文件
		_, err = file.Write(buffer[:n])
		if err != nil {
			log.Fatalf("写入文件错误: %v", err)
		}

		bytesReceived += n
		
		// 每接收1MB打印一次进度
		if bytesReceived%1024 == 0 {
			progress := float64(bytesReceived) / float64(fileSize) * 100
			fmt.Printf("\r接收进度: %.2f%%", progress)
		}
	}

	fmt.Println() // 换行

	// 读取服务器响应
	response := make([]byte, 1024)
	n, _ := conn.Read(response)
	log.Printf("服务器响应: %s", string(response[:n]))
	log.Printf("文件已保存到: %s", localPath)
}

// 从连接中读取一行数据
func readLine(conn net.Conn) (string, error) {
	var line []byte
	buffer := make([]byte, 1)

	for {
		n, err := conn.Read(buffer)
		if err != nil {
			return "", err
		}

		if n == 1 && buffer[0] == '\n' {
			break
		}

		line = append(line, buffer[0])
	}

	return string(line), nil
}

```

```go
package main

import (
	"io"
	"log"
	"net"
	"os"
	"path/filepath"
)

// TCP文件服务器：接收客户端的文件请求并发送文件内容
func main() {
	// 解析命令行参数获取端口，默认使用8080
	port := ":8080"
	if len(os.Args) > 1 {
		port = ":" + os.Args[1]
	}

	// 监听TCP端口
	listener, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("无法监听端口: %v", err)
	}
	defer listener.Close()

	log.Printf("TCP文件服务器启动，监听端口 %s", port)

	for {
		// 接受客户端连接
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("接受连接错误: %v", err)
			continue
		}

		// 为每个连接启动一个goroutine处理
		go handleConnection(conn)
	}
}

// 处理客户端连接
func handleConnection(conn net.Conn) {
	defer conn.Close()
	log.Printf("新连接: %s", conn.RemoteAddr().String())

	// 读取客户端请求的文件名（最多1024字节）
	buffer := make([]byte, 1024)
	n, err := conn.Read(buffer)
	if err != nil {
		log.Printf("读取文件名错误: %v", err)
		return
	}
	filename := string(buffer[:n])
	log.Printf("客户端 %s 请求文件: %s", conn.RemoteAddr().String(), filename)

	// 打开文件
	file, err := os.Open(filename)
	if err != nil {
		log.Printf("打开文件错误: %v", err)
		conn.Write([]byte("ERROR: 无法打开文件"))
		return
	}
	defer file.Close()

	// 获取文件信息
	fileInfo, err := file.Stat()
	if err != nil {
		log.Printf("获取文件信息错误: %v", err)
		conn.Write([]byte("ERROR: 无法获取文件信息"))
		return
	}

	// 发送文件大小（8字节，uint64）
	fileSize := make([]byte, 8)
	for i := 0; i < 8; i++ {
		fileSize[i] = byte(fileInfo.Size() >> (8 * i))
	}
	_, err = conn.Write(fileSize)
	if err != nil {
		log.Printf("发送文件大小错误: %v", err)
		return
	}

	// 发送文件名（不含路径）
	baseName := filepath.Base(filename)
	_, err = conn.Write([]byte(baseName + "\n"))
	if err != nil {
		log.Printf("发送文件名错误: %v", err)
		return
	}

	// 发送文件内容
	bytesSent := 0
	buffer = make([]byte, 4096)
	for {
		n, err := file.Read(buffer)
		if err != nil {
			if err == io.EOF {
				break
			}
			log.Printf("读取文件错误: %v", err)
			return
		}

		// 发送数据
		_, err = conn.Write(buffer[:n])
		if err != nil {
			log.Printf("发送文件数据错误: %v", err)
			return
		}

		bytesSent += n
		// 每发送1MB打印一次进度
		if bytesSent%1024 == 0 {
			log.Printf("发送 %s: %.2f%%", filename, float64(bytesSent)/float64(fileInfo.Size())*100)
		}
	}

	log.Printf("文件 %s 发送完成，共 %d 字节", filename, bytesSent)
	conn.Write([]byte("SUCCESS"))
}

```

TCP文件传输工具

V1

创建时间：09:26



### 实验步骤

1. 启动 TCP 文件服务器：`go run tcp_file_server.go 8080`
2. 运行客户端请求文件：`go run tcp_file_client.go localhost 8080 test.txt`
3. 尝试传输不同大小的文件（小文本文件、大二进制文件）
4. 在传输过程中断开连接，观察错误处理和重连机制
5. 同时启动多个客户端，观察服务器的并发处理能力

### 思考题

1. 对比实验一的 UDP 服务器，TCP 服务器在处理多个客户端时有什么不同？
2. 如果传输大文件时网络中断，客户端如何检测并恢复？
3. 尝试修改代码，实现断点续传功能（即从上次中断的位置继续传输）

## 实验三：简易 HTTP 服务器

### 实验目标

- 理解 TCP 在应用层协议中的应用
- 掌握基于 TCP 的文本协议设计与实现
- 实践 HTTP 协议的基本原理

### 核心代码实现



```go
package main

import (
	"bufio"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// HTTP请求结构
type HttpRequest struct {
	Method  string // GET, POST等
	Path    string // 请求路径
	Version string // HTTP版本
	Headers map[string]string
	Body    string
}

// 简易HTTP服务器
func main() {
	// 解析命令行参数获取端口，默认使用8080
	port := ":8080"
	if len(os.Args) > 1 {
		port = ":" + os.Args[1]
	}

	// 监听TCP端口
	listener, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("无法监听端口: %v", err)
	}
	defer listener.Close()

	log.Printf("简易HTTP服务器启动，监听端口 %s", port)
	log.Printf("访问 http://localhost%s 测试", port)

	for {
		// 接受客户端连接
		conn, err := listener.Accept()
		if err != nil {
			log.Printf("接受连接错误: %v", err)
			continue
		}

		// 为每个连接启动一个goroutine处理
		go handleHttpRequest(conn)
	}
}

// 处理HTTP请求
func handleHttpRequest(conn net.Conn) {
	defer conn.Close()
	startTime := time.Now()
	clientAddr := conn.RemoteAddr().String()

	// 读取请求
	reader := bufio.NewReader(conn)
	request, err := parseHttpRequest(reader)
	if err != nil {
		log.Printf("解析请求错误: %v", err)
		sendHttpResponse(conn, 400, "Bad Request", "请求格式错误")
		return
	}

	// 打印请求信息
	log.Printf(
		"[%s] %s %s %s",
		startTime.Format("2006-01-02 15:04:05"),
		request.Method,
		request.Path,
		clientAddr,
	)

	// 路由处理
	switch {
	case request.Method == "GET" && request.Path == "/":
		handleRoot(conn)
	case request.Method == "GET" && strings.HasPrefix(request.Path, "/files/"):
		filename := strings.TrimPrefix(request.Path, "/files/")
		handleFileRequest(conn, filename)
	case request.Method == "GET" && request.Path == "/info":
		handleInfo(conn, request, clientAddr)
	default:
		sendHttpResponse(conn, 404, "Not Found", "请求的资源不存在")
	}

	// 记录请求处理时间
	duration := time.Since(startTime)
	log.Printf(
		"[%s] 处理完成 %s %s %s 耗时: %v",
		time.Now().Format("2006-01-02 15:04:05"),
		request.Method,
		request.Path,
		clientAddr,
		duration,
	)
}

// 解析HTTP请求
func parseHttpRequest(reader *bufio.Reader) (*HttpRequest, error) {
	// 读取请求行
	requestLine, err := reader.ReadString('\n')
	if err != nil {
		return nil, err
	}
	requestLine = strings.TrimSpace(requestLine)
	parts := strings.Split(requestLine, " ")
	if len(parts) != 3 {
		return nil, fmt.Errorf("无效的请求行: %s", requestLine)
	}

	// 读取请求头
	headers := make(map[string]string)
	for {
		line, err := reader.ReadString('\n')
		if err != nil {
			return nil, err
		}
		line = strings.TrimSpace(line)
		if line == "" { // 空行表示头部结束
			break
		}

		headerParts := strings.SplitN(line, ":", 2)
		if len(headerParts) == 2 {
			key := strings.TrimSpace(headerParts[0])
			value := strings.TrimSpace(headerParts[1])
			headers[key] = value
		}
	}

	// 构建请求对象
	request := &HttpRequest{
		Method:  parts[0],
		Path:    parts[1],
		Version: parts[2],
		Headers: headers,
	}

	// 对于POST等有body的请求，可以在这里读取body
	// 简化实现，这里忽略body处理

	return request, nil
}

// 发送HTTP响应
func sendHttpResponse(conn net.Conn, statusCode int, statusText, body string) error {
	// 响应头部
	headers := fmt.Sprintf(
		"HTTP/1.1 %d %s\r\n"+
			"Content-Type: text/plain; charset=utf-8\r\n"+
			"Content-Length: %d\r\n"+
			"Connection: close\r\n"+
			"Date: %s\r\n\r\n",
		statusCode,
		statusText,
		len(body),
		time.Now().UTC().Format(time.RFC1123),
	)

	// 发送响应
	_, err := conn.Write([]byte(headers + body))
	return err
}

// 处理根路径请求
func handleRoot(conn net.Conn) {
	html := `<html>
<head><title>简易HTTP服务器</title></head>
<body>
<h1>欢迎使用简易HTTP服务器</h1>
<p>支持的路径:</p>
<ul>
<li><a href="/">/ - 首页</a></li>
<li><a href="/info">/info - 查看请求信息</a></li>
<li>/files/[文件名] - 查看服务器上的文件</li>
</ul>
</body>
</html>`
	
	sendHttpResponse(conn, 200, "OK", html)
}

// 处理文件请求
func handleFileRequest(conn net.Conn, filename string) {
	// 安全检查：防止路径遍历攻击
	if strings.Contains(filename, "..") {
		sendHttpResponse(conn, 403, "Forbidden", "不允许访问该文件")
		return
	}

	// 尝试打开文件
	file, err := os.Open(filename)
	if err != nil {
		sendHttpResponse(conn, 404, "Not Found", "文件不存在")
		return
	}
	defer file.Close()

	// 获取文件信息
	fileInfo, err := file.Stat()
	if err != nil {
		sendHttpResponse(conn, 500, "Internal Server Error", "无法获取文件信息")
		return
	}

	// 读取文件内容
	content := make([]byte, fileInfo.Size())
	_, err = file.Read(content)
	if err != nil {
		sendHttpResponse(conn, 500, "Internal Server Error", "无法读取文件内容")
		return
	}

	// 确定Content-Type
	contentType := "application/octet-stream"
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".txt", ".go", ".html", ".css", ".js":
		contentType = "text/plain; charset=utf-8"
	case ".jpg", ".jpeg":
		contentType = "image/jpeg"
	case ".png":
		contentType = "image/png"
	}

	// 构建响应
	response := fmt.Sprintf(
		"HTTP/1.1 200 OK\r\n"+
			"Content-Type: %s\r\n"+
			"Content-Length: %d\r\n"+
			"Connection: close\r\n"+
			"Date: %s\r\n\r\n",
		contentType,
		fileInfo.Size(),
		time.Now().UTC().Format(time.RFC1123),
	)

	// 发送响应头和内容
	conn.Write([]byte(response))
	conn.Write(content)
}

// 处理信息请求
func handleInfo(conn net.Conn, request *HttpRequest, clientAddr string) {
	// 获取服务器信息
	host, _ := os.Hostname()
	info := fmt.Sprintf("请求信息:\n\n")
	info += fmt.Sprintf("方法: %s\n", request.Method)
	info += fmt.Sprintf("路径: %s\n", request.Path)
	info += fmt.Sprintf("HTTP版本: %s\n", request.Version)
	info += fmt.Sprintf("客户端地址: %s\n", clientAddr)
	info += fmt.Sprintf("服务器主机名: %s\n", host)
	info += fmt.Sprintf("当前时间: %s\n\n", time.Now().Format("2006-01-02 15:04:05"))
	
	info += "请求头:\n"
	for key, value := range request.Headers {
		info += fmt.Sprintf("  %s: %s\n", key, value)
	}
	
	sendHttpResponse(conn, 200, "OK", info)
}

```

简易HTTP服务器

V1

创建时间：09:26



### 实验步骤

1. 启动简易 HTTP 服务器：`go run simple_http_server.go 8080`

2. 使用浏览器访问 `http://localhost:8080` 查看首页

3. 访问 `http://localhost:8080/info` 查看请求信息

4. 放置一些测试文件在服务器目录，访问 `http://localhost:8080/files/文件名` 查看文件内容

5. 使用 curl 工具发送不同的 HTTP 请求，观察服务器响应：

   bash

   

   ```bash
   curl http://localhost:8080
   curl -v http://localhost:8080/info
   curl http://localhost:8080/files/test.txt
   ```

### 思考题

1. 这个简易 HTTP 服务器基于 TCP 实现，它如何体现 TCP 的可靠传输特性？
2. 尝试扩展服务器功能，添加对 POST 方法的支持，能够接收并存储客户端发送的数据
3. 实现一个简单的负载均衡器，能够将请求分发到多个后端 HTTP 服务器实例

## 实验总结

通过以上三个实验，我们实践了传输层的核心协议 UDP 和 TCP 的使用：

1. UDP 实验展示了无连接协议的特点，适用于对实时性要求高但可容忍少量丢包的场景
2. TCP 实验展示了面向连接、可靠传输的特性，适用于文件传输等需要数据完整性的场景
3. HTTP 服务器实验展示了如何在 TCP 基础上构建应用层协议，体现了 TCP 作为可靠传输层协议的价值

这些实验帮助我们理解了传输层在网络协议栈中的关键作用，以及如何根据应用场景选择合适的传输层协议。



# 问答

以下是 10 道按难度递增排列的传输层理论题及详细答案，涵盖核心概念、协议机制、场景分析等内容：

### 题目 1（基础概念）

**问题**：请简述传输层的核心作用，并说明它与网络层的本质区别。

**答案**：

- 传输层的核心作用：为应用层进程提供 “端到端的逻辑通信服务”，实现 “进程到进程” 的精准通信（通过端口号区分同一主机上的不同应用进程）。
- 与网络层的本质区别：
  - 网络层负责 “主机到主机” 的分组交付（通过 IP 地址标识主机）；
  - 传输层负责 “进程到进程” 的通信（通过端口号标识主机上的应用进程）；
  - 传输层依赖网络层提供的底层服务，但会进一步处理可靠性、流量控制等问题，为应用层屏蔽底层网络的复杂性。

### 题目 2（端口与复用）

**问题**：传输层的端口号分为哪几类？请分别说明其范围和典型用途，并解释 “复用” 与 “分用” 的含义。

**答案**：

- 端口号分类及用途：
  1. 知名端口（Well-known Ports）：范围 0~1023，由 IANA 分配给固定服务（如 80 对应 HTTP，443 对应 HTTPS，53 对应 DNS）。
  2. 注册端口（Registered Ports）：范围 1024~49151，由应用程序注册使用（如 3306 对应 MySQL，8080 常用于 Web 服务器测试）。
  3. 动态端口（Dynamic Ports）：范围 49152~65535，临时分配给客户端进程（通信结束后释放，避免端口冲突）。
- 复用与分用：
  - 复用（Multiplexing）：多个应用进程的数据流通过同一传输层协议（如 TCP）共享网络层资源，发送到目标主机（如浏览器和邮件客户端同时通过 TCP 发送数据）。
  - 分用（Demultiplexing）：传输层接收网络层的分组后，根据 “目的端口号” 将数据交付给对应的应用进程（如将端口 80 的分组交给 HTTP 服务器）。

### 题目 3（UDP 协议特性）

**问题**：UDP 协议被称为 “无连接、不可靠” 协议，具体体现在哪些方面？为什么 DNS 协议选择使用 UDP 而非 TCP？

**答案**：

- UDP“无连接、不可靠” 的具体体现：
  1. 无连接：通信前无需建立连接（无握手），通信后无需释放连接（无挥手），直接发送数据报。
  2. 不可靠：不保证数据的可靠交付（可能丢失、乱序、重复），不提供重传、确认、流量控制或拥塞控制机制。
  3. 保留报文边界：应用层发送的每个 “消息” 被封装为一个 UDP 数据报，接收方按原边界交付（与 TCP 的字节流不同）。
- DNS 选择 UDP 的原因：
  1. DNS 查询请求通常很小（<512 字节），可通过一个 UDP 数据报传输，无需分段。
  2. 低延迟需求：UDP 无需握手（比 TCP 少一次 RTT），适合域名解析的快速响应场景。
  3. 丢包容忍性：DNS 查询是短请求，若丢包可快速重传，成本远低于建立 TCP 连接的开销。

### 题目 4（TCP 三次握手）

**问题**：TCP 建立连接的 “三次握手” 过程是什么？为什么需要第三次握手？若省略第三次握手，可能导致什么问题？

**答案**：

- 三次握手过程：
  1. 客户端→服务器：发送`SYN`段（`SYN=1`，`seq=x`，`x`为客户端初始序列号 ISN），进入`SYN_SENT`状态。
  2. 服务器→客户端：回复`SYN+ACK`段（`SYN=1`，`ACK=1`，`seq=y`（服务器 ISN），`ack=x+1`），进入`SYN_RCVD`状态。
  3. 客户端→服务器：发送`ACK`段（`ACK=1`，`seq=x+1`，`ack=y+1`），双方进入`ESTABLISHED`状态，连接建立。
- 第三次握手的必要性：
  防止 “已失效的连接请求” 被服务器误接收。例如，客户端的旧`SYN`段因网络延迟未及时到达，客户端已超时重发并建立新连接，而旧`SYN`段后续到达服务器，若省略第三次握手，服务器会直接建立无效连接，浪费资源。
- 省略第三次握手的问题：服务器可能为不存在的客户端分配资源（如缓存、端口），导致资源耗尽，影响正常连接。

### 题目 5（TCP 可靠传输）

**问题**：TCP 通过哪些机制保证数据的可靠传输？请详细说明 “序列号” 与 “累积确认” 的作用。

**答案**：

- TCP 保证可靠传输的核心机制：
  1. 序列号与确认应答（ACK）；2. 超时重传；3. 快速重传；4. 选择性确认（SACK）；5. 流量控制（滑动窗口）。
- 序列号的作用：
  每个字节在 TCP 字节流中都有唯一序号（如客户端发送的第一个字节序号为 ISN+1，后续字节依次递增）。序列号解决了三个问题：
  1. 标识数据位置，确保接收方按序重组；
  2. 避免重复接收（接收方可丢弃重复序号的段）；
  3. 同步双方的字节流（三次握手时同步初始序列号 ISN）。
- 累积确认的作用：
  接收方的确认号`ack=N`表示 “所有序号 < N 的字节已正确接收”。这种机制的优势是：
  1. 减少 ACK 数量（无需对每个段单独确认），降低网络开销；
  2. 明确告知发送方哪些数据已被接收，发送方可据此判断需重传的范围（如未收到`ack=N`，则重传序号≥N 的段）。

### 题目 6（TCP 重传机制）

**问题**：TCP 的 “超时重传” 与 “快速重传” 有何区别？请说明两种机制的触发条件和优缺点。

**答案**：

| 机制     | 触发条件                                                    | 优点                                         | 缺点                                                         |
| -------- | ----------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| 超时重传 | 发送方为段设置的超时定时器（RTO）到期，仍未收到对应 ACK。   | 覆盖所有丢包场景（包括后续段也丢失的情况）。 | 延迟大（需等待 RTO，通常为数百毫秒），可能加剧网络拥塞。     |
| 快速重传 | 发送方收到 3 个连续的重复 ACK（如连续收到 3 个`ack=100`）。 | 无需等待超时，重传延迟小（通常为几十毫秒）。 | 仅适用于 “丢失段的后续段已到达” 的场景（若后续段也丢失，则无法触发）。 |

- 补充说明：
  超时重传通常被视为 “严重拥塞” 的信号，触发后 TCP 会重置拥塞窗口（cwnd=1）；
  快速重传被视为 “轻微拥塞” 的信号，触发后进入快速恢复阶段，拥塞窗口调整更温和。

### 题目 7（TCP 流量控制）

**问题**：TCP 的 “流量控制” 目的是什么？如何通过 “滑动窗口” 机制实现？若接收方缓存已满（窗口大小 = 0），发送方如何处理？

**答案**：

- 流量控制的目的：避免发送方的发送速率超过接收方的处理能力，防止接收方缓存溢出（导致数据丢失）。
- 滑动窗口机制的实现：
  1. 接收方通过 TCP 头部的 “窗口大小” 字段，告知发送方自己的 “剩余缓存空间”（`rwnd = 接收缓存总大小 - 已接收未交付应用层的字节数`）。
  2. 发送方的 “发送窗口” 上限受`rwnd`限制（即最多发送`rwnd`字节的数据）。
  3. 发送窗口是一个动态范围：左侧为已确认的字节（可释放资源），右侧为未发送的字节（超过`rwnd`限制），窗口内为 “可发送但未确认” 的字节。
  4. 随着接收方确认数据（发送 ACK），发送窗口向右滑动（如收到`ack=150`，窗口从 [100,200) 滑动到 [150,250)）。
- 接收方窗口为 0 时的处理：
  发送方会定期发送 “窗口探查段”（含 1 字节数据），接收方在缓存有空间时，会回复新的窗口大小（`rwnd>0`），发送方据此恢复数据传输。

### 题目 8（TCP 拥塞控制）

**问题**：TCP 的 “拥塞控制” 与 “流量控制” 有何本质区别？请描述传统 TCP 拥塞控制中 “慢启动” 和 “拥塞避免” 阶段的核心策略。

**答案**：

- 本质区别：
  - 流量控制：针对 “发送方与接收方” 的速率匹配，解决 “接收方缓存不足” 的问题（通过接收窗口`rwnd`控制）。
  - 拥塞控制：针对 “发送方与网络” 的速率匹配，解决 “网络链路 / 路由器带宽不足” 的问题（通过拥塞窗口`cwnd`控制）。
- 慢启动阶段策略：
  1. 初始状态：`cwnd`（拥塞窗口）设为 1~4 个 MSS（最大段大小），`ssthresh`（慢启动阈值）设为较大值（如 65535 字节）。
  2. 增长规则：每收到一个 ACK，`cwnd`按指数级增长（如`cwnd=1→2→4→8...`）。
  3. 终止条件：当`cwnd`达到`ssthresh`时，进入拥塞避免阶段。
- 拥塞避免阶段策略：
  1. 增长规则：每收到一个 ACK，`cwnd`按线性增长（如每次 + 1 MSS，`cwnd=8→9→10...`）。
  2. 目的：缓慢增加发送速率，避免网络拥塞（若检测到拥塞，`ssthresh`会调整为`cwnd/2`，`cwnd`重置为 1 或进入快速恢复）。

### 题目 9（TCP 连接释放）

**问题**：TCP 释放连接的 “四次挥手” 过程是什么？为什么需要 “TIME_WAIT” 状态？该状态的持续时间（2MSL）有何意义？

**答案**：

- 四次挥手过程（假设客户端主动关闭）：
  1. 客户端→服务器：发送`FIN`段（`FIN=1`，`seq=u`），表示 “客户端无数据发送”，进入`FIN_WAIT_1`状态。
  2. 服务器→客户端：回复`ACK`段（`ACK=1`，`seq=v`，`ack=u+1`），表示 “收到关闭请求”，进入`CLOSE_WAIT`状态（客户端进入`FIN_WAIT_2`状态）。
  3. 服务器→客户端：若服务器无数据发送，发送`FIN`段（`FIN=1`，`ACK=1`，`seq=w`，`ack=u+1`），进入`LAST_ACK`状态。
  4. 客户端→服务器：回复`ACK`段（`ACK=1`，`seq=u+1`，`ack=w+1`），进入`TIME_WAIT`状态（服务器收到后进入`CLOSED`状态）。
- TIME_WAIT 状态的必要性：
  1. 确保最后一个 ACK 被服务器收到（若服务器未收到，会重发 FIN 段，客户端在 TIME_WAIT 状态可重传 ACK）。
  2. 防止旧段干扰新连接（确保网络中所有属于该连接的旧段已消失，避免被新连接误接收）。
- 2MSL 的意义：
  MSL（Maximum Segment Lifetime）是 “段在网络中的最大存活时间”（通常 1~2 分钟）。2MSL 确保：
  1. 客户端发送的最后一个 ACK 有足够时间到达服务器；
  2. 服务器重发的 FIN 段（若未收到 ACK）有足够时间返回客户端；
  3. 所有旧段已从网络中消失。

### 题目 10（协议对比与场景选择）

**问题**：请对比 TCP、UDP、QUIC 三种传输协议的核心特性，并分析以下场景应选择哪种协议及其原因：
（1）实时视频通话（如 Zoom）；（2）大文件传输（如 FTP）；（3）域名解析（DNS）；（4）现代浏览器网页加载（如 HTTP/3）。

**答案**：

- 三种协议核心特性对比：

| 特性     | TCP                             | UDP              | QUIC（基于 UDP）                 |
| -------- | ------------------------------- | ---------------- | -------------------------------- |
| 连接类型 | 面向连接（三次握手 / 四次挥手） | 无连接           | 面向连接（0-RTT 建立）           |
| 可靠性   | 可靠（无丢失、按序、无重复）    | 不可靠           | 可靠（类似 TCP，支持重传、确认） |
| 拥塞控制 | 有（慢启动、拥塞避免等）        | 无               | 有（自适应算法，更适合移动网络） |
| 队头阻塞 | 有（一个段丢失阻塞后续所有段）  | 无（数据报独立） | 无（每个流独立传输）             |
| 加密     | 无（需依赖 TLS）                | 无               | 内置加密（无需额外 TLS 层）      |

- 场景选择及原因：
  1. 实时视频通话：选择**UDP 或 QUIC**。
     原因：低延迟优先，可容忍少量丢包（视频编码可通过冗余数据补偿）；QUIC 还能解决 UDP 的可靠性问题，同时避免 TCP 的队头阻塞。
  2. 大文件传输：选择**TCP**。
     原因：需可靠传输（文件不能丢失或损坏），TCP 的流量控制和拥塞控制可适配网络状态，确保大文件完整交付。
  3. 域名解析（DNS）：选择**UDP**。
     原因：查询请求小（<512 字节），需快速响应（UDP 无握手延迟），丢包可快速重传（成本远低于 TCP 握手）。
  4. 现代浏览器网页加载：选择**QUIC（HTTP/3）**。
     原因：网页包含多个资源（HTML、CSS、图片等），QUIC 的 “无队头阻塞” 特性可并行传输，避免 TCP 中一个资源丢失阻塞整个页面；同时内置加密和 0-RTT 连接，提升安全性和加载速度。



以下是 5 道结合 Go 开发的传输层协议场景题，按难度递增设计，涵盖 UDP/TCP 基础使用、粘包处理、并发控制、协议选择等核心场景，贴合实际开发需求：

### 题目 1（基础：UDP 通信）

**场景**：实现一个基于 UDP 的 “客户端 - 服务器” 消息广播系统。
**需求**：

1. 服务器端：监听 UDP 端口，接收客户端发送的消息后，将消息广播给所有已连接的客户端（需维护客户端地址列表）。
2. 客户端：向服务器发送消息，并接收服务器广播的其他客户端消息（输入 “exit” 退出）。
3. 用 Go 的`net`包实现，核心函数包括`net.ListenUDP`、`net.DialUDP`、`ReadFromUDP`、`WriteToUDP`。

**提示**：

- 服务器需通过`ReadFromUDP`获取客户端地址，并存入`map`维护连接；
- 广播时遍历地址列表，用`WriteToUDP`逐个发送消息；
- 客户端需异步接收广播消息（用 goroutine），避免阻塞输入。

### 题目 2（入门：TCP 基础通信）

**场景**：实现一个基于 TCP 的 “时间服务器”。
**需求**：

1. 服务器端：监听 TCP 端口，接受客户端连接后，每隔 1 秒向客户端发送当前时间（格式：`2006-01-02 15:04:05`），客户端断开后服务器需释放资源。
2. 客户端：连接服务器，持续接收并打印时间，输入 “stop” 后主动断开连接。
3. 用 Go 的`net`包实现，核心处理`net.Listen`、`Accept`、`Dial`，以及连接的`Read`/`Write`。

**提示**：

- 服务器需为每个客户端连接启动 goroutine，避免阻塞；
- 客户端需处理服务器的主动发送（用`bufio.NewReader`读取）；
- 注意优雅关闭连接（`defer conn.Close()`），避免资源泄漏。

### 题目 3（中级：TCP 粘包处理）

**场景**：基于 TCP 实现一个 “消息收发系统”，解决 TCP 粘包问题。
**需求**：

1. 客户端发送消息时，需在消息前添加 “长度前缀”（4 字节无符号整数，大端序），表示消息字节数（如 “hello” 需编码为`0x00000005hello`）。
2. 服务器接收消息时，先读取 4 字节长度，再根据长度读取完整消息，确保消息边界正确。
3. 测试用例：客户端连续发送短消息（如 “a”“b”）和长消息（如 1024 字节随机字符串），服务器需准确拆分。

**提示**：

- 用`binary.BigEndian.PutUint32`编码长度前缀；
- 服务器需循环读取：先读 4 字节长度，再读对应字节数的消息内容；
- 处理半包情况（如第一次只读到 2 字节长度，需缓存剩余部分）。

### 题目 4（高级：并发 TCP 文件传输）

**场景**：实现一个支持并发的 TCP 文件传输服务器。
**需求**：

1. 服务器端：
   - 监听 TCP 端口，支持多客户端同时连接（用 goroutine 处理每个连接）；
   - 接收客户端发送的 “文件名”，读取本地文件并发送给客户端（格式：先发送 4 字节文件长度，再发送文件内容）。
2. 客户端：
   - 连接服务器后，输入本地文件名（需存在），发送给服务器请求文件；
   - 接收服务器发送的文件内容，保存到本地（文件名加 “_recv” 后缀）。
3. 限制：单个文件大小不超过 100MB，需处理大文件传输时的缓冲区优化（如 4KB 缓冲区循环读写）。

**提示**：

- 服务器用`sync.WaitGroup`管理并发连接，避免主线程退出；
- 文件传输前用`os.Stat`获取文件大小，作为长度前缀发送；
- 客户端和服务器需通过`io.CopyBuffer`或循环`Read`/`Write`处理大文件，避免内存溢出。

### 题目 5（综合：协议选择与容错设计）

**场景**：设计一个 “简易聊天系统”，需权衡实时性与可靠性。
**需求**：

1. 功能：支持用户登录（用户名）、发送消息、查看在线用户，消息需包含发送者、时间、内容。
2. 协议选择：
   - 登录 / 退出 / 在线用户查询：用 TCP（需可靠传输，避免指令丢失）；
   - 聊天消息：用 UDP（追求实时性，允许偶尔丢包）。
3. 容错处理：
   - TCP 连接断开时，服务器需从在线列表移除用户；
   - UDP 消息发送失败（如客户端离线）时，服务器需记录日志但不阻塞。
4. 用 Go 实现，需设计简单的协议格式（如 TCP 指令用 “类型 + 内容”，UDP 消息用 “用户名 | 时间 | 内容”）。

**提示**：

- 服务器用`map`维护在线用户（TCP 连接 + UDP 地址），用`sync.Mutex`保证并发安全；
- TCP 指令解析用`strings.Split`按约定格式拆分（如 “login:alice”）；
- UDP 消息广播时，过滤发送者自身地址，避免自己收到自己的消息。

### 难度梯度说明

1. **题目 1**：掌握 UDP 无连接特性及地址管理，入门级网络编程；
2. **题目 2**：理解 TCP 面向连接的通信模式，掌握基本连接管理；
3. **题目 3**：深入 TCP 字节流特性，解决实际开发中的粘包问题，核心考点；
4. **题目 4**：结合并发、文件 IO、大数据传输，考察 Go 的 goroutine 和资源控制能力；
5. **题目 5**：综合协议选择、容错设计、并发安全，贴近生产级系统的简化模型，考察架构思维。

这些题目覆盖了大厂 Go 开发中传输层协议的高频场景，需结合`net`包 API、并发控制、协议特性综合解决。

编辑