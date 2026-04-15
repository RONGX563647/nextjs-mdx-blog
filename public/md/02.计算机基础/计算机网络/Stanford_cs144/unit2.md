![image-20250925122642125](assetsmage-20250925122642125.png)

[IPV6 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/6160eebfe0b34d06f3e0b33a)

[图解网络 — TCP 篇 思维导图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/630b7020f346fb0714c45ffe)

[TCP原理 流程图模板_ProcessOn思维导图、流程图](https://www.processon.com/view/614c268b7d9c08198c60d480)

# 思考

# 以问答引导思考：斯坦福 CS144 传输层及相关协议（2 - 系列）

通过 “核心问题→场景化思考→逻辑拆解→结论 + 实验关联” 的流程，带你穿透传输层协议的 “设计权衡”（如可靠 vs 效率、复杂 vs 扩展），每个问题都对应 2 - 系列的核心考点，同时关联后续 “实现 TCP” 的实验需求。

## 一、TCP vs UDP：为什么需要两种完全不同的传输协议？

### 问题 1：TCP 已经能保证可靠传输了，为什么还要 UDP？直接用 TCP 适配所有应用不行吗？

先别急着看答案，先思考：

- 直播、在线游戏这类应用，“偶尔丢包” 和 “延迟增加 100ms”，哪个对体验影响更大？
- 如果用 TCP 传输实时音视频，遇到网络拥塞时，TCP 的重传和拥塞控制会导致什么问题？

#### 场景化思考：

假设你用 TCP 打网游：

1. 游戏每隔 100ms 发送一次 “玩家位置” 数据包，若某个数据包丢了，TCP 会触发重传 —— 等重传的数据包到达时，已经过去 200ms，此时玩家位置早已更新，重传的数据包完全没用，反而导致 “画面卡顿”。
2. 网络拥塞时，TCP 会缩小拥塞窗口（慢启动），减少发送速率 —— 这会让游戏数据包 “发不出去”，延迟从 100ms 飙升到 500ms，根本没法玩。

而用 UDP 打网游：

- 丢了一个 “位置包”，直接忽略，下一个 100ms 的新包会覆盖旧状态，玩家几乎感觉不到卡顿；
- UDP 没有拥塞控制的 “降速” 逻辑，能以稳定速率发送数据包，延迟更可控。

#### 逻辑拆解：

TCP 和 UDP 的本质是 “**针对不同应用需求的设计取舍**”：

| 设计维度 | TCP（可靠）                    | UDP（高效）                        |
| -------- | ------------------------------ | ---------------------------------- |
| 连接开销 | 三次握手建立连接，开销高       | 无连接，直接发送，开销低           |
| 丢包处理 | 重传 + 确认，确保 100% 到达    | 不重传，丢包由应用层处理（或容忍） |
| 延迟     | 重传、拥塞控制可能增加延迟     | 无额外延迟，实时性好               |
| 适用场景 | 文件传输、网页（需 100% 可靠） | 直播、游戏、DNS（需低延迟）        |

#### 结论 + 实验关联：

UDP 不是 “TCP 的简化版”，而是 “为实时场景量身定制的协议”—— 你后续实现 UDP 应用（如简易 DNS 客户端）时会发现：**UDP 代码只需 “封装数据报→发送”，无需处理三次握手、重传，代码量比 TCP 少 50%**，这正是其 “低开销、高实时” 的落地体现。

### 问题 2：UDP 的校验和能检测错误，为什么不直接在 UDP 里加 “重传” 机制，让它也可靠？

![image-20250925122857243](assetsmage-20250925122857243.png)

先思考：

- 如果 UDP 加了重传，还需要加 “确认应答”“序列号”（防止乱序）吗？加完这些，UDP 会变成什么样子？
- 不同应用对 “重传时机” 的需求不同：文件传输需要 “立即重传”，直播可以 “等 100ms 再重传”——UDP 如果内置重传，能适配所有场景吗？

#### 逻辑拆解：

“给 UDP 加可靠机制” 本质是 “把 UDP 改成 TCP”，会失去 UDP 的核心优势：

1. **复杂度上升**：重传需要确认应答，确认需要序列号，序列号需要字节序转换 —— 加完这些，UDP 的首部会从 8 字节变成 20 + 字节，代码复杂度和 TCP 几乎一致，失去 “轻量” 特性。

2. 灵活性丧失

   ：不同应用对 “可靠” 的定义不同：

   - 文件传输需要 “100% 重传，直到成功”；
   - 直播只需要 “重传 1 次，失败就算了”；
   - 如果 UDP 内置重传逻辑，无法满足所有应用的个性化需求，反而不如让应用层自己实现（如 QUIC 协议在 UDP 上自定义可靠机制）。

#### 结论 + 实验关联：

UDP 的设计哲学是 “**最小功能集**”—— 只做 “端口复用 + 校验和”，把 “可靠、重传” 等复杂逻辑交给应用层，这正是 “端到端原则” 的体现（后续实验中，你可能需要在 UDP 基础上实现简单的重传，会深刻体会 “应用层定制可靠逻辑” 的灵活性）。

## 二、TCP 连接管理：三次握手、四次挥手为什么要这么设计？

### 问题 3：TCP 三次握手为什么不能改成两次？两次握手会有什么风险？

先思考：

- 假设两次握手：客户端发 SYN→服务器发 SYN+ACK，连接就建立了。如果客户端的 “旧 SYN 报文”（比如网络延迟导致滞留）突然到达服务器，会发生什么？
- 服务器收到旧 SYN 后，会建立连接并发送数据，但客户端根本不需要这个连接 —— 服务器的资源会被浪费吗？

#### 场景化思考：

举个具体例子：

1. 客户端第一次发 SYN（ Seq=100 ），但网络拥堵，报文滞留了；
2. 客户端以为 SYN 丢了，重新发 SYN（ Seq=200 ），这次成功，和服务器建立连接、传输数据、关闭连接；
3. 30 秒后，之前滞留的旧 SYN（ Seq=100 ）到达服务器 —— 如果是两次握手，服务器会认为这是新的连接请求，发 SYN+ACK（ Seq=300，ACK=101 ），然后建立连接，等待客户端发数据；
4. 客户端收到这个陌生的 SYN+ACK，根本不知道是什么，会忽略 —— 但服务器会一直维持这个 “无效连接”，直到超时（通常几分钟），浪费内存和端口资源。

如果是三次握手：

- 服务器发 SYN+ACK 后，需要等客户端的第三次 ACK 才能建立连接；
- 客户端收到旧 SYN 对应的 SYN+ACK，会发现 Seq=100 不是自己当前的序列号，拒绝发 ACK—— 服务器没收到第三次 ACK，不会建立连接，避免资源浪费。

#### 逻辑拆解：

三次握手的核心目的是 “**验证客户端的‘当前接收能力’，防止旧连接报文干扰新连接**”：

- 第一次握手（客户端→服务器）：服务器知道 “客户端能发”；
- 第二次握手（服务器→客户端）：客户端知道 “服务器能发也能收”；
- 第三次握手（客户端→服务器）：服务器知道 “客户端当前能收”（排除旧报文）。

两次握手缺少第三步，服务器无法确认 “客户端当前是否需要这个连接”，会导致 “无效连接” 占用资源。

#### 结论 + 实验关联：

你后续实现 TCP 服务器时，会在代码中处理 “收到 SYN 后发 SYN+ACK，再等 ACK 才能进入 ESTABLISHED 状态”—— 如果没收到第三次 ACK，服务器会超时重传 SYN+ACK（通常重传 3 次），然后放弃，这正是三次握手的容错机制。

### 问题 4：TCP 四次挥手为什么不能改成三次？服务器收到 FIN 后，为什么不直接发 FIN+ACK，非要分两次发？

先思考：

- 服务器收到客户端的 FIN（请求关闭连接）时，可能还有 “未发送完的数据”（比如客户端发完 FIN 后，服务器还有最后一段数据要传）—— 这时候能直接发 FIN+ACK 吗？
- 如果服务器直接发 FIN+ACK，意味着 “同时关闭发送和接收”，但未发完的数据还没传，会丢失吗？

#### 场景化思考：

假设客户端和服务器传文件，客户端先传完数据，发 FIN（表示 “我不发了，但还能收”）：

1. 服务器收到 FIN 后，还有最后 100 字节数据没发 —— 如果直接发 FIN+ACK，会关闭自己的 “发送通道”，这 100 字节就传不出去了；
2. 所以服务器必须先发 ACK（确认 “收到你的 FIN，我知道你不发了”），然后继续发剩下的 100 字节数据；
3. 数据发完后，服务器再发 FIN（表示 “我也不发了，你可以关了”），客户端回 ACK，连接关闭 —— 这就是四次挥手的必要性。

#### 逻辑拆解：

四次挥手的核心是 “**服务器可能有未完成的数据传输，需要分‘确认关闭请求’和‘发起关闭请求’两步**”：

- 第一次挥手（客户端→服务器）：客户端 “关闭发送”，但还能收；
- 第二次挥手（服务器→客户端）：服务器 “确认收到关闭请求”，仍能发和收；
- 第三次挥手（服务器→客户端）：服务器 “关闭发送”，数据已传完；
- 第四次挥手（客户端→服务器）：客户端 “确认收到关闭请求”，连接关闭。

如果改成三次，服务器必须在收到 FIN 后立即关闭发送通道，会导致未传完的数据丢失。

#### 结论 + 实验关联：

你实现 TCP 关闭逻辑时，会在服务器代码中处理 “收到 FIN 后，先回 ACK，再等数据发完后发 FIN”—— 这个过程中，服务器会进入 CLOSE-WAIT 状态（等待数据发完），这正是四次挥手的关键状态。

## 三、TCP 可靠传输：滑动窗口和重传策略是怎么解决 “效率” 和 “可靠” 的矛盾？

### 问题 5：停止等待协议（发一帧等一帧）效率太低，滑动窗口为什么能大幅提升效率？它的核心设计是什么？

先思考：

- 假设网络往返时间（RTT）是 200ms，发送一帧数据需要 1ms—— 停止等待协议的 1 秒能发多少帧？滑动窗口大小为 100 时，1 秒能发多少帧？
- 滑动窗口允许 “连续发多个帧”，怎么保证 “不丢帧、不乱序”？

#### 场景化计算：

- 停止等待协议：1 秒内有 5 个 RTT（200ms / 次），每次发 1 帧，1 秒发 5 帧；
- 滑动窗口（大小 100）：1 个 RTT 内可以发 100 帧，1 秒发 5×100=500 帧 —— 效率提升 100 倍！

#### 逻辑拆解：

滑动窗口的核心是 “**用‘窗口’管理‘可发送’和‘可接收’的帧，实现‘流水线式传输’**”：

1. **发送窗口**：发送方可连续发送 “窗口内” 的帧（无需等待确认），窗口大小由 “接收窗口（对方缓冲区大小）” 和 “拥塞窗口（网络拥堵程度）” 决定 —— 避免 “发太快导致对方缓冲区溢出” 或 “网络拥塞”。
2. **接收窗口**：接收方告诉发送方 “我还能收多少帧”（流量控制），同时缓存 “乱序到达的帧”（比如期望帧 3，先收到帧 4，缓存起来，等帧 3 到了再一起交付应用层）。
3. **窗口滑动**：发送方收到 “累计确认”（比如收到帧 3 的 ACK），窗口向右滑动 3 个位置，允许发送新的帧（如帧 4-6）。

#### 结论 + 实验关联：

你实现 TCP 滑动窗口时，会维护`send_base`（已发送未确认的最小帧序号）和`next_seq`（下一个要发送的帧序号），窗口大小 = next_seq - send_base—— 当收到 ACK 时，更新 send_base，窗口滑动，这正是 “流水线传输” 的代码落地。

### 问题 6：TCP 为什么需要 “快重传”？超时重传不够用吗？

先思考：

- 假设 RTT 是 200ms，超时时间是 500ms—— 如果帧 3 丢了，超时重传需要等 500ms 才能重传；快重传能多久检测到丢包并重传？
- 接收方收到乱序帧（如期望帧 3，收到帧 4），为什么要发 “重复 ACK”（ACK=3），而不是直接忽略？

#### 场景化对比：

- 超时重传：帧 3 丢了，发送方要等 500ms 才重传，期间帧 4-6 即使正确到达，也无法滑动窗口，浪费 500ms 带宽；
- 快重传：接收方收到帧 4，发现帧 3 丢了，立即发 ACK=3（重复 ACK）；发送方收到 3 个重复 ACK 后，不用等超时，直接重传帧 3—— 整个过程只需 200ms（1 个 RTT），比超时重传快 2.5 倍。

#### 逻辑拆解：

快重传的核心是 “**用‘重复 ACK’快速检测丢包，避免超时等待的长延迟**”：

1. 接收方的 “乱序帧检测”：收到序号大于 “期望序号” 的帧（如期望 3，收到 4），说明中间有帧丢了，立即发 “重复 ACK”（确认号 = 期望序号），告诉发送方 “你丢帧了”。
2. 发送方的 “3 次重复 ACK 触发”：收到 3 个重复 ACK，基本可以确定 “对应帧丢了”（偶尔乱序不会连续 3 次），立即重传，无需等超时。

#### 结论 + 实验关联：

你实现 TCP 重传逻辑时，会在 “收到 ACK” 的代码中统计 “重复 ACK 次数”，当次数达到 3 时，调用重传函数 —— 这就是快重传的核心逻辑，比单纯的超时重传能让 TCP 在丢包场景下的吞吐量提升 30% 以上。

## 四、端到端原则：为什么复杂功能要放在端系统，而不是路由器？

### 问题 7：如果让路由器实现 “TCP 重传”，帮端系统处理丢包，不是能减少端系统的负担吗？为什么端到端原则不允许这么做？

先思考：

- 路由器需要处理全球百亿级数据包，如果每个路由器都要记录 “哪个数据包发给了谁”“是否需要重传”，路由器的内存和 CPU 会撑爆吗？
- 不同应用对 “重传” 的需求不同：文件传输需要 “立即重传”，直播可以 “不重传”—— 路由器能适配所有应用的需求吗？

#### 逻辑拆解：

端到端原则的核心是 “**将复杂功能放在端系统，让网络核心（路由器）保持极简，保障可扩展性**”：

1. **路由器的 “无状态” 需求**：路由器只需 “看目的 IP→查路由表→转发”，无状态、高性能 —— 如果加了重传，路由器需要维护 “连接状态表”（记录每个连接的未确认数据包），全球百亿级连接会让路由器内存直接瘫痪。
2. **应用需求的 “个性化”**：端系统（如主机）最了解应用需求 —— 比如视频应用可以 “丢包不重传”，而文件应用必须 “重传直到成功”；如果路由器统一处理重传，会让视频应用 “被迫重传，增加延迟”，文件应用 “重传次数不够，丢数据”。
3. **故障恢复的 “低成本”**：如果路由器故障，所有依赖它的 “未确认数据包” 都要重新处理 —— 而端系统故障只影响单个主机，不影响全局网络。

#### 结论 + 实验关联：

你实现 TCP 时，所有重传、确认、拥塞控制的代码都在 “端系统（你的主机程序）” 中，路由器完全不关心这些逻辑 —— 这正是端到端原则的落地：**路由器只需转发 IP 数据包，复杂的可靠传输逻辑由你写的 TCP 代码（端系统）处理**。

## 五、总结：传输层协议的 “设计权衡” 闭环

最后用一个问题串联所有知识点：

**TCP 的 “可靠” 是靠哪些机制实现的？这些机制分别解决了什么问题？为什么 UDP 不需要这些机制？**

#### 思考拆解：

1. TCP 的可靠机制及解决的问题：
   - 三次握手：解决 “旧连接报文干扰” 和 “双方收发能力验证”；
   - 序列号 + 确认：解决 “丢包” 和 “乱序”；
   - 滑动窗口：解决 “停止等待协议效率低”；
   - 快重传 + 超时重传：解决 “丢包后的快速恢复”；
   - 拥塞控制：解决 “网络过载导致的大面积丢包”。
2. UDP 不需要这些机制的原因：
   - UDP 面向 “实时场景”，可以容忍丢包，无需重传、确认；
   - 无连接设计，无需三次握手；
   - 不需要滑动窗口，直接 “发完就走”，低延迟。

这个问题的本质是 “**TCP 的每一个机制都是为了解决‘可靠传输’的某个痛点，而 UDP 的‘极简’是为了适配‘低延迟’场景**”—— 理解这种 “设计权衡”，是掌握传输层协议的关键，也是后续实现 TCP 实验的核心思路。

# 总结

以下是斯坦福计算机网络课程 “2 - 系列”（传输层及相关协议）核心知识点总结，按逻辑层次梳理：

### 一、传输层核心定位与功能

传输层是**应用层与网络层的桥梁**，核心功能是为**应用进程间**提供**端到端通信服务**，通过 “端口机制” 区分同一主机上的不同应用（如 HTTP 用 80 端口，DNS 用 53 端口）。

- 核心协议：TCP（可靠、面向连接）与 UDP（不可靠、无连接），分别适配 “可靠性优先” 与 “实时性优先” 的应用需求。

### 二、TCP 服务模型（面向连接、可靠传输）

#### 1. 核心特性

- **面向连接**：数据传输前需通过**三次握手**建立逻辑连接，确保双方 “能发能收” 并同步序列号。

- 可靠传输

  ：通过四大机制保障数据准确、有序到达：

  - **序列号与确认应答**：每个字节分配唯一序列号，接收方回送 “期望下一字节的确认号”，未确认则重传。
  - **滑动窗口**：发送方可连续发送 “窗口内” 数据（无需等待逐个确认），提升效率（流量控制核心）。
  - **拥塞控制**：通过慢启动、拥塞避免、快重传、快恢复等策略，防止网络过载（保障全局稳定性）。
  - **超时重传**：超时未收到确认则重传，超时时间基于往返时间（RTT）动态调整。

- **字节流服务**：将应用数据视为无结构字节流，接收方按序列号重组，保证有序性。

### 三、UDP 服务模型（无连接、不可靠传输）

#### 1. 核心特性

- **无连接**：无需建立连接，直接发送 UDP 数据报，开销低。
- **不可靠传输**：不保证到达性、有序性，无重传 / 确认机制，丢包由应用层处理。
- **数据报服务**：应用数据封装为独立数据报（首部 + 数据），长度受 MTU 限制。

#### 2. 首部与应用场景

- 首部仅 8 字节（源端口、目的端口、长度、校验和），校验和用于基本错误检测。
- 适合**实时性要求高、容忍少量丢包**的场景：在线游戏、实时音视频、DNS 查询。

### 四、ICMP 协议（网络层控制报文）

- **功能**：在 IP 主机 / 路由器间传递控制消息或差错报告。

- 报文类型

  ：

  - 差错报告：目的不可达（如端口不可达）、超时（TTL 耗尽，用于`traceroute`）。
  - 查询报文：回显请求 / 应答（`ping`命令核心，检测连通性）。

- 典型应用：`ping`（检测主机在线性）、`traceroute`（追踪路径）。

### 五、端到端原则（设计哲学）

- **核心思想**：复杂功能（如可靠传输、加密）应在**端系统**（主机 / 服务器）实现，而非网络中间节点（路由器）。

- 原因

  ：

  - 端系统更了解应用需求（如文件传输需 100% 可靠，直播可容忍丢包）。
  - 简化路由器，降低复杂度，提升网络扩展性。

### 六、错误检测机制

- **奇偶校验**：通过 1 个校验位使 “1 的个数” 为奇 / 偶数，仅能检测奇数个比特错误，局限性大。
- **CRC（循环冗余校验）**：基于生成多项式通过模 2 运算生成校验码（FCS），能检测绝大多数错误（突发错误、多位错误），被以太网、TCP 等广泛采用。

### 七、有限状态机（FSM）与 TCP 状态转移

- **TCP 状态机**：用状态（如`CLOSED`、`ESTABLISHED`）、转移条件、动作描述连接生命周期。

- 关键状态转移

  ：

  - 连接建立（三次握手）：`CLOSED→SYN-SENT→ESTABLISHED`（客户端）；`CLOSED→SYN-RECEIVED→ESTABLISHED`（服务器）。
  - 连接关闭（四次挥手）：`ESTABLISHED→FIN-WAIT-1→FIN-WAIT-2→TIME-WAIT→CLOSED`（客户端）。

- **TIME-WAIT 状态**：客户端需等待 2 倍 MSL（报文最大生存时间），确保服务器收到最后 ACK，避免旧报文干扰新连接。

### 八、可靠传输协议（基础机制）

#### 1. 停止等待协议

- 最简单可靠传输：发送一帧→等待确认→再发下一帧，**效率极低**（信道利用率≈0.5%），仅适合低带宽、高延迟网络。
- 特殊情况处理：确认丢失（超时重传，接收方重发 ACK）；数据出错（接收方丢弃，不发 ACK，发送方超时重传）。

#### 2. 滑动窗口协议（高效可靠传输）

- **核心**：允许连续发送 “窗口内” 多个帧，无需等待逐个确认，提升信道利用率。

- 关键概念

  ：

  - 发送窗口：可连续发送的帧数量上限（受接收窗口和拥塞窗口共同限制）。
  - 接收窗口：接收方可接收的帧数量（用于流量控制）。

- 实现方式

  ：

  - GBN（回退 N 帧）：某帧出错则重传该帧及之后所有帧，实现简单但效率低。
  - SR（选择重传）：仅重传出错帧，效率高但需更大缓冲区。
  - TCP 滑动窗口：SR 改进版，接收方确认每个正确分段，发送方仅重传未确认分段。

### 九、TCP 重传策略

- 超时重传

  ：超时未收到 ACK 则重传，超时时间基于 RTT 动态计算：

  - `EstimatedRTT = (1-α)×旧RTT + α×新RTT`（α=0.125）
  - `Timeout = EstimatedRTT + 4×DevRTT`（DevRTT 为 RTT 偏差）。

- **快重传**：收到 3 个重复 ACK（指示某帧丢失），无需等待超时直接重传，提升效率。

### 十、TCP 首部与连接管理

#### 1. TCP 首部（固定 20 字节）

- 核心字段：序列号（首字节序号）、确认号（期望下一字节）、标志位（`SYN`/`ACK`/`FIN`等）、窗口（接收窗口大小，用于流量控制）。
- 可选字段：如 MSS（最大分段大小，协商最大数据段长度）。

#### 2. 连接建立与拆除

- **三次握手**：同步序列号，确认双方收发能力，防止旧连接报文干扰新连接。
- **四次挥手**：有序释放连接，因服务器可能需先发送剩余数据，故需四次交互（FIN→ACK→FIN→ACK）。

### 十一、传输层核心对比

- **TCP vs UDP**：TCP 可靠但开销高，适合文件传输、网页；UDP 实时性好但不可靠，适合音视频、游戏。
- **端到端 vs 逐跳**：传输层负责 “端到端进程通信”，网络层（IP）负责 “逐跳路由”（路由器到路由器）。

以上知识点覆盖传输层核心协议（TCP/UDP/ICMP）、可靠传输机制、设计原则及实践细节，是理解网络通信的关键基础。

# 理论

# 斯坦福大学计算机网络课程（2 - 系列）深度笔记

## 一、传输层概述（2-0 Transport (intro)）

传输层是**应用层与网络层的 “桥梁”**，核心作用是为**应用进程间**提供 ** 端到端（End-to-End）** 的通信服务。

- **端口机制**：通过**端口号**区分同一主机上的不同应用进程（如 HTTP 用 80 端口，HTTPS 用 443 端口，DNS 用 53 端口（UDP 为主））。应用层通过 “端口号” 将数据交付给传输层对应的协议（TCP/UDP）。
- **协议分工**：TCP 提供 “可靠、面向连接” 的服务；UDP 提供 “不可靠、无连接” 的服务，适配不同应用对**可靠性**与**实时性**的需求。

## 二、TCP 服务模型（2-1 TCP service model）

TCP（Transmission Control Protocol）是**面向连接、可靠的字节流传输协议**，核心设计围绕 “确保数据准确、有序到达” 展开。

### （一）核心特性

1. **面向连接（Connection-Oriented）** 数据传输前需通过 ** 三次握手（Three-Way Handshake）** 建立逻辑连接，确保通信双方 “准备就绪”。
   - 例子：浏览器访问网页时，会先与 Web 服务器建立 TCP 连接，再传输 HTML 数据。
2. **可靠传输（Reliable Delivery）** 依赖四大机制保障：
   - **序列号（Sequence Number）与确认应答（Acknowledgment, ACK）**： 发送方为每个字节分配唯一序列号；接收方收到数据后，回送 “期望下一个字节的序列号” 作为确认。若发送方未收到确认，认为数据丢失并**重传**。
   - **滑动窗口（Sliding Window）**： 发送方与接收方各自维护 “窗口”，发送方可连续发送 “窗口内” 的多个数据段（无需等待每个段的确认），提升传输效率（流量控制核心）。
   - **拥塞控制（Congestion Control）**： 防止网络因 “数据过多” 而拥塞，包含**慢启动（Slow Start）**、**拥塞避免（Congestion Avoidance）**、**快重传（Fast Retransmit）**、** 快恢复（Fast Recovery）** 等策略（后续章节深入，此处需明确：TCP 通过拥塞控制保障 “网络全局稳定”）。
   - **超时重传（Timeout Retransmission）**： 若发送方在 “超时时间” 内未收到确认，重传对应数据段。超时时间基于 ** 往返时间（RTT）** 动态调整（见 “2-9 重传策略”）。
3. **字节流服务（Byte Stream Service）** TCP 将应用层数据视为 “无结构的字节流”，接收方按序列号**重组字节**，保证数据的 “有序性”。
   - 例子：FTP 传输大文件时，TCP 会将文件拆分为连续字节流，即使中间分段乱序到达，接收方也能按序列号重组为完整文件。

## 三、UDP 服务模型（2-2 UDP service model）

UDP（User Datagram Protocol）是**无连接、不可靠的数据报传输协议**，核心设计围绕 “低开销、高实时性” 展开。

### （一）核心特性

1. **无连接（Connectionless）** 无需像 TCP 那样先建立连接，发送方可直接封装数据为 “UDP 数据报” 并发送。
   - 例子：DNS 查询时，客户端直接向 DNS 服务器发送 UDP 数据报，无需提前 “握手”。
2. **不可靠传输（Unreliable Delivery）** 不保证数据的 “到达性、有序性”，也不提供 “重传、确认” 机制，丢包由应用层自行处理（或容忍）。
3. **数据报服务（Datagram Service）** 应用层数据被 UDP 封装为 “独立的数据报”（含首部 + 数据），每个数据报相互独立，长度受限于网络 MTU（最大传输单元）。

### （二）UDP 首部结构（补充）

UDP 首部仅 8 字节，包含：

- 源端口（16 位）、目的端口（16 位）：标识应用进程。
- 长度（16 位）：UDP 数据报总长度（首部 + 数据）。
- 校验和（16 位）：对 “UDP 首部、数据、IP 伪首部（含源目 IP、协议号、UDP 长度）” 计算校验和，用于**基本错误检测**（但不重传错误数据）。

### （三）应用场景

适合**实时性要求高、能容忍少量丢包**的场景，如：

- 在线游戏：玩家位置、操作指令的传输（丢包可通过 “下一个数据包” 快速覆盖）。
- 实时音视频：视频会议、直播（丢包对体验的影响小于延迟）。

## 四、ICMP 服务模型（2-3 ICMP service model）

ICMP（Internet Control Message Protocol）是**网络层的 “控制报文协议”**，用于 IP 主机 / 路由器间传递 “控制消息” 或 “差错报告”。

### （一）报文类型

1. **差错报告报文**：
   - **目的不可达（Type 3）**：如 “网络不可达”“端口不可达”，告知源主机 “数据无法到达目的”。
   - **超时（Type 11）**：如 “TTL（生存时间）耗尽”，常见于`traceroute`命令（通过故意设置小 TTL，让路由器返回超时报文，从而追踪路径）。
2. **查询报文**：
   - **回显请求 / 应答（Type 8/0）**：`ping`命令的核心：发送方发 “回显请求”，接收方回 “回显应答”，用于检测网络连通性。

### （二）典型应用

- `ping`：检测主机是否在线、网络延迟。
- `traceroute`（Linux）/`tracert`（Windows）：追踪数据包到达目的的路径（利用 “TTL 超时” 与 “目的不可达” 报文）。

## 五、端到端原则（2-4 End to End Principle）

**核心思想**：**复杂功能（如可靠传输、加密、流量控制）应在 “端系统”（用户计算机、服务器）实现，而非网络中间节点（路由器）**。

### （一）原因

- 只有端系统 “真正了解应用需求”：不同应用对可靠性、实时性的要求不同（如 “文件传输” 需 100% 可靠，“视频直播” 可容忍少量丢包），中间节点无法通用适配。
- 简化中间节点：路由器只需负责 “尽力转发数据”，降低复杂度与成本，提升网络扩展性。

### （二）例子

- 数据加密：在**发送端加密、接收端解密**，而非依赖路由器加密。若路由器加密，会导致：① 路由器需处理密钥，增加安全风险；② 不同应用加密需求不同，路由器无法灵活支持。
- 可靠传输：TCP 在端系统实现重传、确认，路由器无需关心数据是否丢失，只需转发。

## 六、错误检测（2-5 Error detection）

数据传输中，需检测 “比特错误”（如传输过程中 0 变 1，1 变 0），常用方法有：

### （一）奇偶校验（Parity Check）

- 原理：在数据后加 1 个 “奇偶校验位”，使数据中 “1 的个数” 为**奇数（奇校验）\**或\**偶数（偶校验）**。
- 局限性：只能检测 “奇数个比特错误”，无法检测偶数个错误；且无法纠正错误。

### （二）循环冗余校验（CRC, Cyclic Redundancy Check）

- 原理：基于 “生成多项式（如 CRC-32 的生成多项式：`x³² + x²⁶ + x²³ + x²² + x¹⁶ + x¹² + x¹¹ + x¹⁰ + x⁸ + x⁷ + x⁵ + x⁴ + x² + x + 1`）”，通过**模 2 运算**（异或操作）生成 “校验码（FCS，帧校验序列）”。发送方将校验码与数据一同发送，接收方用同样的生成多项式计算校验码并对比，若不一致则判定 “数据出错”。
- 优势：能检测**绝大多数错误模式**（如突发错误、多位错误），是以太网、TCP 等协议的核心错误检测手段（如以太网帧的 FCS 字段用 CRC）。

## ？？？七、有限状态机（2-6a/2-6b/2-6c/2-6d Finite State Machines, FSM）

有限状态机是描述 “系统状态、状态转移条件、状态动作” 的数学模型，网络协议（如 TCP）的行为可通过 FSM 精确刻画。

### （一）TCP 的状态转移（核心示例）

TCP 连接的生命周期可分为 “建立、传输、关闭” 三个阶段，对应多个状态（如`CLOSED`、`SYN-SENT`、`ESTABLISHED`、`FIN-WAIT-1`等）。

1. **连接建立（三次握手）的状态转移**：
   - 客户端：`CLOSED` → `SYN-SENT`（发送`SYN`） → `ESTABLISHED`（收到服务器的`SYN+ACK`，并回送`ACK`）。
   - 服务器：`CLOSED` → `SYN-RECEIVED`（收到客户端`SYN`，回送`SYN+ACK`） → `ESTABLISHED`（收到客户端`ACK`）。
2. **连接关闭（四次挥手）的状态转移**：
   - 客户端：`ESTABLISHED` → `FIN-WAIT-1`（发送`FIN`） → `FIN-WAIT-2`（收到服务器`ACK`） → `TIME-WAIT`（收到服务器`FIN`，回送`ACK`） → `CLOSED`（等待 2MSL 后）。
   - 服务器：`ESTABLISHED` → `CLOSE-WAIT`（收到客户端`FIN`，回送`ACK`） → `LAST-ACK`（发送`FIN`） → `CLOSED`（收到客户端`ACK`）。

### （二）关键状态解析

- **TIME-WAIT**：客户端发送最后一个`ACK`后，需等待**2 倍 MSL（Maximum Segment Lifetime，报文最大生存时间，通常为 2 分钟）**。目的是：① 确保服务器收到最后一个`ACK`（若服务器没收到，会重发`FIN`，客户端可在 TIME-WAIT 内重发`ACK`）；② 让本连接的 “旧报文” 自然过期，避免干扰后续新连接。

## 八、停止等待协议（2-7 Stop and wait）

**最简单的可靠传输协议**，核心逻辑：“发送一帧，等待确认，再发下一帧”。

### （一）工作流程

1. 发送方发送数据帧`Frame 1`，然后**暂停发送**，等待接收方的`ACK`。
2. 接收方收到`Frame 1`后，回送`ACK`。
3. 发送方收到`ACK`后，发送`Frame 2`，重复上述过程。
4. 若发送方**超时未收到 ACK**，则重传`Frame 1`。

### （二）效率分析（局限性）

假设**数据发送时间为`T`**，**往返时间（RTT）为`200T`**（如卫星链路，RTT 长），则**信道利用率**为： \(\text{利用率} = \frac{T}{T + RTT} \approx \frac{T}{201T} \approx 0.5\%\) 可见，停止等待协议**信道利用率极低**，仅适合 “低带宽、高延迟” 的网络（如早期卫星通信）。

### （三）特殊情况处理

- **确认丢失**：发送方发`Frame 1`，接收方收到后发`ACK`，但`ACK`丢失。发送方超时后重传`Frame 1`，接收方收到重复帧后，**丢弃数据但重发 ACK**（确保发送方知道 “已收到”）。
- **数据出错**：接收方收到错误帧（通过 CRC 检测），直接丢弃，不发 ACK。发送方超时后重传。

## 九、滑动窗口协议（2-8 Sliding window）

为解决 “停止等待协议效率低” 的问题，滑动窗口允许**连续发送多个帧**，无需等待每个帧的确认，大幅提升信道利用率。

### （一）核心概念

- **发送窗口**：发送方可连续发送的 “帧数量上限”，由 ** 接收窗口（接收方缓冲区大小）**和**拥塞窗口（网络拥塞程度）** 共同决定（TCP 中，发送窗口是两者的最小值）。
- **接收窗口**：接收方当前 “可接收的帧数量”，用于流量控制（告知发送方 “我还能收多少”）。

### （二）工作流程

1. 发送方 “窗口内” 的帧可**连续发送**（如窗口大小为 4，可同时发`Frame 1-4`）。
2. 接收方收到帧后，回送 “累计确认”（如收到`Frame 1-3`，则回送 “期望`Frame 4`” 的 ACK）。
3. 发送方收到 ACK 后，“窗口滑动”（如收到`Frame 3`的 ACK，窗口可滑动 3 个位置，允许发送`Frame 5-7`）。

### （三）两种实现：GBN 与 SR

- **回退 N 帧（Go-Back-N, GBN）**：若某帧（如`Frame 3`）出错，发送方需**重传`Frame 3`及之后所有帧**（即使`Frame 4-5`正确）。优点：实现简单；缺点：效率低（正确帧被重传）。
- **选择重传（Selective Repeat, SR）**：若某帧（如`Frame 3`）出错，仅重传`Frame 3`，`Frame 4-5`可正常接收。优点：效率高；缺点：需要更大的缓冲区（接收方需缓存乱序的正确帧）、更多序号空间。
- **TCP 的滑动窗口**：属于 “SR 的改进版”，接收方会为每个正确的分段发送确认，发送方仅重传 “未被确认” 的分段。

## 十、可靠通信 - 重传策略（2-9 Reliable comm --- Retransmission strategies）

重传是 “可靠传输” 的核心手段，TCP 通过**超时重传**和**快重传**两种策略，平衡 “可靠性” 与 “传输效率”。

### （一）超时重传（Timeout Retransmission）

#### 1. 超时时间的动态调整

TCP 的超时时间并非固定，而是基于 ** 往返时间（RTT）** 动态计算，公式如下：

- 估计 RTT（`EstimatedRTT`）： \(\text{EstimatedRTT} = (1 - \alpha) \times \text{EstimatedRTT} + \alpha \times \text{SampleRTT}\) （`SampleRTT`为 “实际测量的往返时间”，`α`通常取 0.125，即加权平均，让新的 RTT 更影响估计值）。
- RTT 偏差（`DevRTT`）： \(\text{DevRTT} = (1 - \beta) \times \text{DevRTT} + \beta \times |\text{SampleRTT} - \text{EstimatedRTT}|\) （`β`通常取 0.25，衡量 RTT 的波动程度）。
- 最终超时时间（`Timeout`）： \(\text{Timeout} = \text{EstimatedRTT} + 4 \times \text{DevRTT}\) （加 4 倍 DevRTT 是为了 “覆盖绝大多数 RTT 波动”，降低不必要的重传）。

#### 2. 超时重传的触发

若发送方在`Timeout`内未收到 ACK，则重传对应数据段。

### （二）快重传（Fast Retransmit）

#### 1. 触发条件

当接收方收到**失序的报文段**时（如期望`Seq=5`，却收到`Seq=6`），会**立即发送 “重复的 ACK”**（即仍回送 “期望 Seq=5” 的 ACK）。若发送方收到**3 个重复的 ACK**，则判定 “对应数据段（如`Seq=5`）已丢失”，**无需等待超时**，直接重传该段。

#### 2. 优势

相比 “超时重传”，快重传能**更快检测丢包**，减少等待时间，提升传输效率。

## 十一、可靠通信 - TCP 首部（2-10 Reliable comm --- TCP header）

TCP 首部是 “TCP 实现可靠传输、流量控制、连接管理” 的核心载体，分为**20 字节固定部分**和**可选部分**。

### （一）固定字段解析（20 字节）

1. **源端口（16 位）、目的端口（16 位）**：标识通信的应用进程（如 HTTP 的 80 端口）。

2. **序列号（32 位）**：本报文段中 “第一个字节” 的序号。用于标识数据的 “顺序”，接收方据此重组字节流。

3. **确认号（32 位）**：期望**下一个字节**的序列号。若确认号为`N`，表示 “已正确收到前 N-1 字节”。

4. **数据偏移（4 位）**：TCP 首部长度（以 “4 字节” 为单位）。因首部有可选字段，需用该字段明确 “数据从何处开始”。

5. **保留（6 位）**：备用，置 0。

6. 标志位（6 位）

   ：

   - `URG`（Urgent）：紧急数据标志，与 “紧急指针” 配合使用。
   - `ACK`（Acknowledgment）：确认标志，`ACK=1`时 “确认号” 字段有效。
   - `PSH`（Push）：推送标志，要求接收方立即将数据交付应用层（不缓存）。
   - `RST`（Reset）：重置连接，用于处理错误或异常（如强制关闭连接）。
   - `SYN`（Synchronize）：同步序列号，用于**建立连接**（三次握手的核心标志）。
   - `FIN`（Finish）：结束标志，用于**关闭连接**（四次挥手的核心标志）。

7. **窗口（16 位）**：接收方的 “接收窗口大小”，用于**流量控制**（告知发送方 “我当前能接收的字节数”）。

8. **校验和（16 位）**：对 “TCP 首部、数据、IP 伪首部（含源目 IP、协议号、TCP 长度）” 计算的校验和，用于检测传输错误。

9. **紧急指针（16 位）**：与`URG`配合，指向 “紧急数据” 的末尾（仅`URG=1`时有效）。

### （二）可选字段（最多 40 字节）

用于传递额外信息，如**MSS（Maximum Segment Size，最大分段大小）**：协商双方能接收的 “最大 TCP 数据段长度”，避免分片过多影响效率。

## 十二、可靠通信 - 连接建立与拆除（2-11 Reliable comm --- Connection setup and teardown）

TCP 通过 “三次握手” 建立连接，“四次挥手” 拆除连接，确保 “连接的可靠性” 与 “资源的有序释放”。

### （一）三次握手（Connection Setup）

**目的**：让通信双方同步 “序列号”，并确认彼此 “能发能收”。

| 步骤 | 发送方（客户端）                       | 接收方（服务器）                         | 状态变化                       |
| ---- | -------------------------------------- | ---------------------------------------- | ------------------------------ |
| 1    | 发送 `SYN`（序列号`x`）                | -                                        | `CLOSED` → `SYN-SENT`          |
| 2    | -                                      | 回复 `SYN+ACK`（序列号`y`，确认号`x+1`） | `CLOSED` → `SYN-RECEIVED`      |
| 3    | 回复 `ACK`（确认号`y+1`，序列号`x+1`） | -                                        | `SYN-SENT` → `ESTABLISHED`     |
| 4    | -                                      | 收到`ACK`后                              | `SYN-RECEIVED` → `ESTABLISHED` |

**为什么需要三次？** 防止 “旧连接的残留报文” 干扰新连接。假设两次握手：若旧的`SYN`报文（属于已关闭的连接）滞留，服务器收到后直接建立新连接，会浪费资源；三次握手则确保 “双方都确认最新的连接请求”。

### （二）四次挥手（Connection Teardown）

**目的**：有序释放连接，确保 “双方数据都传输完毕”。

| 步骤 | 发送方（客户端）                       | 接收方（服务器）          | 状态变化                                      |
| ---- | -------------------------------------- | ------------------------- | --------------------------------------------- |
| 1    | 发送 `FIN`（序列号`u`）                | -                         | `ESTABLISHED` → `FIN-WAIT-1`                  |
| 2    | -                                      | 回复 `ACK`（确认号`u+1`） | `ESTABLISHED` → `CLOSE-WAIT`                  |
| 3    | -                                      | 发送 `FIN`（序列号`v`）   | `CLOSE-WAIT` → `LAST-ACK`                     |
| 4    | 回复 `ACK`（确认号`v+1`，序列号`u+1`） | -                         | `FIN-WAIT-1` → `TIME-WAIT`                    |
| 5    | 等待 2MSL 后                           | 收到`ACK`后               | `TIME-WAIT` → `CLOSED`；`LAST-ACK` → `CLOSED` |

**为什么需要四次？** 因为服务器收到`FIN`后，可能仍有 “未发送完的数据”，需先回`ACK`确认 “收到关闭请求”，等数据发完后再发`FIN`请求关闭，因此需要四次交互。

## 十三、传输层回顾（2-12 Transport (recap)）

### （一）核心总结

- **TCP**：面向连接、可靠、字节流传输，适合 “对可靠性要求高” 的场景（如文件传输、邮件、网页浏览）。
- **UDP**：无连接、不可靠、数据报传输，适合 “对实时性要求高” 的场景（如实时音视频、在线游戏、DNS）。
- **端到端 vs 逐跳（Hop-by-Hop）**：网络层（IP）负责 “逐跳路由”（从一个路由器到下一个路由器），传输层（TCP/UDP）负责 “端到端的进程通信”（从一个主机的应用到另一个主机的应用）。

通过以上深度拆解，可全面掌握斯坦福大学计算机网络第二节课中 “2 - 系列” 主题的技术细节、原理与应用场景。



# 问答

# 斯坦福计算机网络 2 - 系列核心知识点测试题（10 道，难度递增）

以下题目围绕传输层（TCP/UDP）、ICMP、端到端原则、可靠传输协议等核心内容设计，每题包含题目、考察点及详细答案，便于自查巩固。

## 1. 基础概念题（UDP vs TCP 特性区分）

**题目**：请列举 TCP 与 UDP 的 3 个核心差异，并分别说明两种协议适合的典型应用场景（各举 1 例）。 **考察点**：2-1 TCP 服务模型、2-2 UDP 服务模型核心特性 **答案**：

- 核心差异：
  1. 连接性：TCP 面向连接（需三次握手建立连接）；UDP 无连接（直接发送数据报）。
  2. 可靠性：TCP 可靠（通过序列号、确认应答、重传等保障数据准确有序到达）；UDP 不可靠（不保证到达、不重传、不排序）。
  3. 传输单位：TCP 是字节流服务（将应用数据视为无结构字节流）；UDP 是数据报服务（每个数据报独立封装发送）。
- 应用场景：
  - TCP：文件传输（如 FTP）、网页浏览（HTTP/HTTPS），需确保数据完整。
  - UDP：在线游戏（如王者荣耀操作指令）、实时直播，可容忍少量丢包，优先保证实时性。

## 2. 基础应用题（ICMP 功能识别）

**题目**：当用户执行`ping baidu.com`命令时，底层依赖 ICMP 协议的哪种报文类型？若出现 “Request timed out”，可能是 ICMP 的哪种差错报文导致？ **考察点**：2-3 ICMP 服务模型（查询报文 / 差错报告报文） **答案**：

- `ping`依赖的 ICMP 报文：回显请求报文（Type 8）和回显应答报文（Type 0）。客户端发送回显请求，目标主机回复回显应答，实现连通性检测。
- “Request timed out” 的可能原因：
  1. 路由器返回**ICMP 超时报文（Type 11）**：数据包在传输中 TTL（生存时间）耗尽，路由器丢弃数据并发送超时报文。
  2. 路由器返回**ICMP 目的不可达报文（Type 3）**：目标主机或网络不可达，路由器无法转发数据，发送目的不可达报文。

## 3. 原理理解题（端到端原则判断）

**题目**：某网络设计方案提出 “在路由器中实现数据加密功能，以简化端系统负担”，该方案是否符合 “端到端原则”？请说明理由。 **考察点**：2-4 端到端原则核心思想 **答案**：

- 不符合端到端原则。
- 理由：端到端原则的核心是 “复杂功能（如加密、可靠传输）应在端系统（用户计算机、服务器）实现，而非网络中间节点（路由器）”。
  1. 路由器不了解应用需求：不同应用加密需求不同（如对称加密、非对称加密），路由器无法通用适配。
  2. 安全风险：加密需密钥，路由器存储或处理密钥会增加泄露风险；端系统加密仅需通信双方掌握密钥，安全性更高。
  3. 简化中间节点：路由器核心职责是 “尽力转发数据”，实现加密会增加其复杂度，降低转发效率。

## 4. 技术对比题（错误检测方法优劣）

**题目**：对比 “奇偶校验” 与 “循环冗余校验（CRC）” 的检错能力差异，说明为何以太网帧的 FCS 字段选择 CRC 而非奇偶校验？ **考察点**：2-5 错误检测（奇偶校验 / CRC） **答案**：

- 检错能力差异：
  1. 奇偶校验：仅能检测 “奇数个比特错误”，无法检测偶数个比特错误（如 2 个、4 个比特翻转），检错能力有限。
  2. CRC：基于生成多项式的模 2 运算，可检测 “绝大多数错误模式”，包括突发错误（连续多个比特错误）、任意奇数个比特错误、双比特错误等，检错能力远强于奇偶校验。
- 以太网选择 CRC 的原因：以太网传输环境复杂（如电磁干扰易导致突发错误），需强检错能力保障数据完整性；CRC 能满足 “几乎不遗漏错误” 的需求，而奇偶校验无法应对以太网中的常见错误，因此 FCS（帧校验序列）字段采用 CRC。

## 5. 状态机分析题（TCP 三次握手状态转移）

**题目**：TCP 客户端从 “CLOSED” 状态发起连接时，发送`SYN`报文后进入什么状态？若此时服务器回复`SYN+ACK`，客户端需发送什么报文，之后进入什么状态？ **考察点**：2-6 有限状态机（TCP 连接建立状态转移） **答案**：

- 客户端发送`SYN`报文后，从 “CLOSED” 状态进入**SYN-SENT**状态（表示 “同步报文已发送，等待服务器确认”）。
- 客户端收到服务器的`SYN+ACK`报文后，需发送**ACK（确认）报文**（确认号为服务器`SYN`报文的序列号 + 1），发送完成后，客户端从 “SYN-SENT” 状态进入**ESTABLISHED**状态（表示 “连接已建立，可开始传输数据”）。

## 6. 效率计算题（停止等待协议利用率）

**题目**：假设某链路的 “数据发送时间” 为 1ms，“往返时间（RTT）” 为 100ms，采用停止等待协议传输数据，求该链路的信道利用率（保留 2 位小数）。若要提升利用率，可采用什么协议替代？ **考察点**：2-7 停止等待协议（效率分析） **答案**：

- 信道利用率计算： 停止等待协议的利用率公式为：\(\text{利用率} = \frac{\text{数据发送时间}}{\text{数据发送时间} + \text{往返时间（RTT）}}\) 代入数据：\(\text{利用率} = \frac{1}{1 + 100} \approx 0.0099 \rightarrow 0.99\%\)
- 替代协议：滑动窗口协议（如回退 N 帧 GBN、选择重传 SR），通过 “连续发送多个帧无需等待单个确认”，大幅提升信道利用率。

## 7. 协议对比题（滑动窗口协议差异）

**题目**：回退 N 帧（GBN）与选择重传（SR）均为滑动窗口协议，若某帧（如 Seq=3）传输丢失，两种协议的重传策略有何不同？哪种协议对信道带宽的利用率更高？ **考察点**：2-8 滑动窗口协议（GBN/SR 实现差异） **答案**：

- 重传策略差异：
  1. GBN 协议：若 Seq=3 丢失，发送方需**重传 Seq=3 及之后所有未确认的帧**（即使 Seq=4、5 已正确到达接收方）。接收方仅接收 “按序的帧”，对失序帧直接丢弃，不发送确认（仅确认已按序接收的最大序列号）。
  2. SR 协议：若 Seq=3 丢失，发送方仅**重传 Seq=3 这一丢失帧**；接收方会缓存 “失序但正确的帧”（如 Seq=4、5），待 Seq=3 重传成功后，按序交付应用层，并发送 “累计确认”。
- 带宽利用率：SR 协议更高。因 GBN 需重传已正确接收的后续帧，浪费信道带宽；SR 仅重传丢失帧，且缓存失序帧，减少无效重传，带宽利用率更优。

## 8. 深入分析题（TCP 四次挥手 TIME-WAIT 状态）

**题目**：TCP 客户端在四次挥手的最后一步发送`ACK`后，为何需要进入 “TIME-WAIT” 状态并等待 2MSL（报文最大生存时间）？若客户端直接进入 “CLOSED” 状态，可能导致什么问题？ **考察点**：2-11 TCP 连接拆除（TIME-WAIT 状态作用） **答案**：

- TIME-WAIT 状态的核心目的：
  1. 确保服务器收到最后一个`ACK`：客户端发送的最后一个`ACK`可能丢失，服务器未收到会重传`FIN`报文。客户端在 TIME-WAIT 内可接收重传的`FIN`，并重新发送`ACK`，避免服务器因未收`ACK`一直滞留 “LAST-ACK” 状态。
  2. 让连接的 “旧报文” 自然过期：网络中可能残留本连接的旧报文（如延迟的`DATA`或`ACK`），2MSL 是报文在网络中能存活的最大时间，等待 2MSL 可确保旧报文消失，避免其干扰后续使用相同 “源 IP + 源端口 + 目的 IP + 目的端口” 的新 TCP 连接（如新连接误将旧报文当作自身数据）。
- 直接进入 CLOSED 的问题：
  1. 服务器可能因未收`ACK`持续重传`FIN`，浪费资源；
  2. 旧报文干扰新连接，导致新连接数据错误或异常中断。

## 9. 策略分析题（TCP 重传触发条件）

**题目**：TCP 的 “超时重传” 与 “快重传” 分别在什么条件下触发？为何快重传比超时重传更能提升传输效率？ **考察点**：2-9 可靠通信（重传策略） **答案**：

- 触发条件：
  1. 超时重传：发送方维护 “动态超时时间（Timeout）”，该时间基于往返时间（RTT）计算：\(\text{EstimatedRTT} = (1-\alpha) \times \text{EstimatedRTT} + \alpha \times \text{SampleRTT}\)（α=0.125）\(\text{DevRTT} = (1-\beta) \times \text{DevRTT} + \beta \times |\text{SampleRTT} - \text{EstimatedRTT}|\)（β=0.25）\(\text{Timeout} = \text{EstimatedRTT} + 4 \times \text{DevRTT}\) 若发送方在 Timeout 内未收到对应帧的 ACK，触发超时重传。
  2. 快重传：接收方收到 “失序帧”（如期望 Seq=5，却收到 Seq=6）时，立即发送 “重复 ACK”（仍确认 Seq=5）；若发送方连续收到**3 个重复 ACK**，判定对应帧（Seq=5）丢失，无需等待超时，直接触发快重传。
- 快重传效率更高的原因：超时重传需等待 “数百毫秒级” 的 Timeout，而快重传通过 3 个重复 ACK “即时检测丢包”，可在几十毫秒内触发重传，减少等待时间，尤其在高带宽低延迟网络中，能显著提升传输效率。

## 10. 综合设计题（滑动窗口协议应用）

**题目**：某实时视频传输系统采用 UDP 传输，但需保证 “关键帧（如 I 帧）不丢失”。请基于 “滑动窗口协议” 设计一个轻量级可靠传输方案，要求说明：①发送方 / 接收方的核心逻辑；②如何平衡 “可靠性” 与 “实时性”（提示：可限制窗口大小、简化确认机制）。 **考察点**：2-8 滑动窗口协议（综合应用设计）、2-2 UDP 特性适配 **答案**：

### ① 核心逻辑设计（基于简化版 SR 协议）

- 发送方逻辑：
  1. 划分帧类型：将视频帧分为 “关键帧（I 帧）” 和 “非关键帧（P/B 帧）”，仅对 I 帧启用可靠传输，P/B 帧仍用 UDP 裸传（容忍丢包）。
  2. 小窗口控制：设置滑动窗口大小 = 2（仅允许连续发送 2 个 I 帧，避免窗口过大导致重传延迟），每个 I 帧分配唯一序列号（1 字节，0-255 循环）。
  3. 发送与重传：连续发送窗口内的 I 帧；若收到 “单个帧确认” 或 “超时（设为 50ms，适配实时性）”，滑动窗口（未确认的 I 帧超时后重传 1 次，仍失败则放弃，避免无限重传影响后续帧）。
- 接收方逻辑：
  1. 帧接收与缓存：接收 I 帧后，通过 CRC 检测错误，正确帧缓存至 “有序帧队列”，失序 I 帧暂存（不丢弃）；错误帧直接丢弃，不发确认。
  2. 简化确认：对 “按序接收的最大序列号 I 帧” 发送 “单字节确认（ACK = 最大序列号 + 1）”，无需对每个 I 帧单独确认（减少确认开销）；若检测到 I 帧丢失，发送 “丢失帧序列号的 NACK（否定确认）”，触发发送方针对性重传。

### ② 可靠性与实时性平衡策略

1. 窗口大小限制：窗口 = 2，减少并发发送的 I 帧数，降低重传时的带宽占用和延迟。
2. 短超时 + 有限重传：超时设为 50ms（远小于视频帧间隔，如 200ms / 帧），重传仅 1 次，避免因反复重传阻塞后续 I 帧，保障实时性。
3. 区分帧类型：仅对关键 I 帧可靠传输，P/B 帧裸传，在保证 “画面完整性”（I 帧不丢）的同时，减少可靠传输的开销。
4. 轻量确认：用单字节 ACK/NACK 替代 TCP 复杂首部，减少确认报文大小，降低网络延迟。



# 场景题

# 基于 Go 开发的计算机网络 2 - 系列场景题（5 题，难度递增）

以下题目结合传输层核心知识点（TCP/UDP、可靠传输、滑动窗口等）与 Go 开发实战，从基础工具实现到复杂协议优化逐步升级，需结合代码逻辑与协议原理解决实际场景问题。

## 1. 场景题（基础工具开发）：UDP 版简易 “Ping” 工具

### 场景描述

某嵌入式设备仅支持 UDP 协议，无法使用基于 ICMP 的标准`ping`命令。需用 Go 开发一个**UDP 版简易 Ping 工具**：客户端向目标服务器发送 UDP 探测包，服务器收到后立即回显；客户端计算 “发送到接收” 的往返时间（RTT），若超时（3 秒）则判定 “目标不可达”。

### 核心需求

1. 客户端：发送 UDP 探测包（含当前时间戳），接收回显并计算 RTT，超时处理。
2. 服务器：监听 UDP 端口，收到探测包后立即回显原数据。
3. 输出格式：客户端需打印 “RTT: 12ms” 或 “Request timed out”。

### 考察点

- UDP 无连接特性（2-2 UDP 服务模型）、超时重传基础（2-7 停止等待）
- Go 的`net/UDP`包使用（`DialUDP`、`ReadFromUDP`、`SetReadDeadline`）

### 参考答案（核心代码片段）

#### 服务器端（udp_ping_server.go）

go

```go
package main

import (
	"log"
	"net"
)

func main() {
	addr, _ := net.ResolveUDPAddr("udp", ":8080")
	conn, _ := net.ListenUDP("udp", addr)
	defer conn.Close()
	log.Println("UDP Ping Server started on :8080")

	buf := make([]byte, 1024)
	for {
		n, clientAddr, err := conn.ReadFromUDP(buf)
		if err != nil {
			log.Printf("Read error: %v", err)
			continue
		}
		// 立即回显数据
		_, _ = conn.WriteToUDP(buf[:n], clientAddr)
	}
}
```

#### 客户端（udp_ping_client.go）

go

```go
package main

import (
	"log"
	"net"
	"os"
	"time"
)

func main() {
	if len(os.Args) != 2 {
		log.Fatal("Usage: go run udp_ping_client.go <server_ip>")
	}
	serverIP := os.Args[1]
	serverAddr, _ := net.ResolveUDPAddr("udp", serverIP+":8080")

	conn, _ := net.DialUDP("udp", nil, serverAddr)
	defer conn.Close()

	// 发送探测包（含时间戳）
	sendTime := time.Now().UnixNano()
	sendData := []byte(time.Now().Format(time.RFC3339Nano))
	_, _ = conn.Write(sendData)

	// 3秒超时接收
	conn.SetReadDeadline(time.Now().Add(3 * time.Second))
	buf := make([]byte, 1024)
	n, _, err := conn.ReadFromUDP(buf)
	if err != nil {
		if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
			log.Println("Request timed out")
			return
		}
		log.Printf("Error: %v", err)
		return
	}

	// 计算RTT
	recvTime := time.Now().UnixNano()
	rtt := time.Duration(recvTime - sendTime)
	log.Printf("Reply from %s: RTT: %v", serverIP, rtt)
}
```

## 2. 场景题（TCP 连接管理）：TCP 服务器的连接复用与状态监控

### 场景描述

某 Go 开发的 TCP 文件服务器，近期出现 “大量 TIME-WAIT 状态连接占用端口” 的问题，导致新客户端无法建立连接。需优化服务器：① 实现 TCP 连接的 “优雅关闭”，减少 TIME-WAIT 时长；② 开发一个状态监控模块，实时打印当前连接的 TCP 状态（如 ESTABLISHED、TIME-WAIT 数量）。

### 核心需求

1. 连接优雅关闭：服务器处理完文件传输后，主动发起四次挥手，避免客户端异常断开导致的 TIME-WAIT 堆积。
2. 状态监控：每 10 秒遍历当前所有连接，统计各 TCP 状态的数量（基于 Go 的`net.Conn`和系统状态解析）。
3. 优化 TIME-WAIT：通过设置`SO_LINGER`选项，合理调整 TIME-WAIT 时长（需说明调整依据）。

### 考察点

- TCP 四次挥手与 TIME-WAIT 状态（2-11 连接拆除）、TCP 状态机（2-6）
- Go 的`net`包连接管理、`syscall`设置 socket 选项

### 参考答案（核心代码片段）

#### 1. 优雅关闭与 SO_LINGER 设置

go

```go
package main

import (
	"log"
	"net"
	"os"
	"syscall"
	"time"
)

// 自定义TCP连接，支持设置SO_LINGER
type LingerConn struct {
	net.TCPConn
}

func DialTCPWithLinger(network, addr string) (*LingerConn, error) {
	conn, err := net.DialTCP(network, nil, func() *net.TCPAddr {
		tcpAddr, _ := net.ResolveTCPAddr(network, addr)
		return tcpAddr
	}())
	if err != nil {
		return nil, err
	}
	// 设置SO_LINGER：超时2秒，关闭时发送FIN，减少TIME-WAIT
	linger := syscall.Linger{Onoff: 1, Linger: 2}
	if err := conn.SetLinger(2); err != nil { // Go 1.16+ 直接支持SetLinger
		return nil, err
	}
	return &LingerConn{*conn}, nil
}

// 服务器处理连接（优雅关闭）
func handleConn(conn net.Conn) {
	defer func() {
		// 优雅关闭：先关闭写端，等待读端EOF，再关闭连接
		if tcpConn, ok := conn.(*net.TCPConn); ok {
			_ = tcpConn.CloseWrite() // 发送FIN，进入FIN-WAIT-1
			buf := make([]byte, 1024)
			for {
				n, err := tcpConn.Read(buf)
				if n == 0 || err != nil {
					break // 收到客户端FIN+ACK，进入TIME-WAIT
				}
			}
		}
		_ = conn.Close()
		log.Printf("Connection closed: %s", conn.RemoteAddr())
	}()

	// 处理文件传输（省略，参考之前TCP文件传输代码）
	log.Printf("Handling connection: %s", conn.RemoteAddr())
	time.Sleep(5 * time.Second) // 模拟文件传输
}
```

#### 2. 连接状态监控（基于`netstat`解析）

go

```go
import (
	"bytes"
	"os/exec"
	"strings"
	"time"
)

// 统计TCP连接状态
func monitorConnStates() {
	ticker := time.NewTicker(10 * time.Second)
	defer ticker.Stop()
	for range ticker.C {
		// 执行netstat命令解析状态（跨平台需调整，此处以Linux为例）
		cmd := exec.Command("netstat", "-an", "-t")
		var out bytes.Buffer
		cmd.Stdout = &out
		_ = cmd.Run()

		stateCount := make(map[string]int)
		lines := strings.Split(out.String(), "\n")
		for _, line := range lines {
			if strings.Contains(line, ":8080") && strings.Contains(line, "TCP") {
				parts := strings.Fields(line)
				if len(parts) >= 6 {
					state := parts[5]
					stateCount[state]++
				}
			}
		}

		log.Println("\nTCP Connection States (port 8080):")
		for state, count := range stateCount {
			log.Printf("%s: %d", state, count)
		}
	}
}

// main函数启动监控
func main() {
	go monitorConnStates()
	listener, _ := net.Listen("tcp", ":8080")
	defer listener.Close()
	log.Println("TCP File Server started")
	for {
		conn, _ := listener.Accept()
		go handleConn(conn)
	}
}
```

## 3. 场景题（可靠传输实现）：基于 UDP 的停止等待协议文件传输

### 场景描述

某工业设备需通过 UDP 传输日志文件（约 10KB），但链路存在 10% 的丢包率。需用 Go 实现基于**停止等待协议**的可靠文件传输工具：客户端将文件分片为固定大小帧（1KB / 帧），带序列号和 CRC 校验；服务器接收后验证帧完整性，发送 ACK 确认，确保文件无丢失、无错误。

### 核心需求

1. 帧结构设计：包含 “序列号（1 字节）+ CRC 校验码（4 字节）+ 数据（1020 字节）”，总大小 1KB。
2. 客户端：按序发送帧，超时（1 秒）重传未确认帧，直至所有帧发送完成。
3. 服务器：接收帧后用 CRC 校验，正确则发送 ACK（确认号 = 序列号 + 1），错误则丢弃；所有帧接收完后重组为文件。

### 考察点

- 停止等待协议原理（2-7）、CRC 错误检测（2-5）
- Go 的二进制数据封装 / 解析、CRC 计算（`github.com/sigurn/crc16`）

### 参考答案（核心代码片段）

#### 1. 帧结构与 CRC 工具

go

```go
package main

import (
	"encoding/binary"
	"log"

	"github.com/sigurn/crc16"
)

const (
	frameSize    = 1024 // 1KB帧
	seqSize      = 1    // 序列号1字节
	crcSize      = 2    // CRC16校验码2字节（简化为2字节）
	dataSize     = frameSize - seqSize - crcSize // 1021字节数据
	timeout      = 1 * time.Second
	crcPoly      = crc16.CRC16_XMODEM // CRC多项式
)

// Frame 帧结构
type Frame struct {
	Seq  uint8
	CRC  uint16
	Data []byte
}

// 计算CRC16校验码
func calcCRC(data []byte) uint16 {
	table := crc16.MakeTable(crcPoly)
	return crc16.Checksum(data, table)
}

// 帧序列化（Seq + CRC + Data）
func (f *Frame) Marshal() []byte {
	buf := make([]byte, frameSize)
	buf[0] = f.Seq
	binary.BigEndian.PutUint16(buf[seqSize:seqSize+crcSize], f.CRC)
	copy(buf[seqSize+crcSize:], f.Data)
	return buf
}

// 帧反序列化
func unmarshalFrame(buf []byte) *Frame {
	return &Frame{
		Seq:  buf[0],
		CRC:  binary.BigEndian.Uint16(buf[seqSize:seqSize+crcSize]),
		Data: buf[seqSize+crcSize:],
	}
}
```

#### 2. 客户端发送逻辑

go

```go
func sendFile(clientConn *net.UDPConn, serverAddr *net.UDPAddr, filePath string) {
	file, _ := os.Open(filePath)
	defer file.Close()

	// 文件分片为帧
	var frames []*Frame
	buf := make([]byte, dataSize)
	seq := uint8(0)
	for {
		n, err := file.Read(buf)
		if n == 0 || err != nil {
			break
		}
		// 计算CRC（包含序列号和数据）
		crcData := append([]byte{seq}, buf[:n]...)
		crc := calcCRC(crcData)
		frames = append(frames, &Frame{
			Seq:  seq,
			CRC:  crc,
			Data: buf[:n],
		})
		seq++
	}

	// 停止等待发送
	for i, frame := range frames {
		for {
			// 发送帧
			_ = clientConn.WriteToUDP(frame.Marshal(), serverAddr)
			log.Printf("Sent frame %d (seq=%d)", i, frame.Seq)

			// 等待ACK
			clientConn.SetReadDeadline(time.Now().Add(timeout))
			ackBuf := make([]byte, 1)
			n, _, err := clientConn.ReadFromUDP(ackBuf)
			if err != nil {
				log.Printf("Timeout, retransmit frame %d", i)
				continue
			}

			// 验证ACK（确认号=seq+1）
			ackSeq := ackBuf[0]
			if ackSeq == (frame.Seq+1)%256 {
				log.Printf("Received ACK for frame %d\n", i)
				break
			}
		}
	}
	log.Println("File sent completely")
}
```

#### 3. 服务器接收逻辑

go

```go
func recvFile(serverConn *net.UDPConn, savePath string) {
	file, _ := os.Create(savePath)
	defer file.Close()

	expectedSeq := uint8(0)
	frameBuf := make([]byte, frameSize)

	for {
		n, clientAddr, _ := serverConn.ReadFromUDP(frameBuf)
		if n != frameSize {
			log.Println("Invalid frame size, discard")
			continue
		}

		frame := unmarshalFrame(frameBuf)
		// CRC校验（重新计算并对比）
		crcData := append([]byte{frame.Seq}, frame.Data...)
		if calcCRC(crcData) != frame.CRC {
			log.Printf("Frame seq=%d CRC error, discard", frame.Seq)
			continue
		}

		// 按序接收
		if frame.Seq != expectedSeq {
			log.Printf("Out of order (expected=%d, got=%d), discard", expectedSeq, frame.Seq)
			// 重发上一个ACK
			_ = serverConn.WriteToUDP([]byte{(expectedSeq - 1) % 256}, clientAddr)
			continue
		}

		// 写入文件并发送ACK
		_, _ = file.Write(frame.Data)
		ackSeq := (frame.Seq + 1) % 256
		_ = serverConn.WriteToUDP([]byte{ackSeq}, clientAddr)
		log.Printf("Received frame seq=%d, sent ACK=%d", frame.Seq, ackSeq)
		expectedSeq = ackSeq

		// 检测文件结束（假设最后一帧数据长度<dataSize）
		if len(frame.Data) < dataSize {
			log.Println("File received completely")
			break
		}
	}
}
```

## 4. 场景题（滑动窗口优化）：GBN 协议的实时日志传输优化

### 场景描述

某分布式系统需用 Go 实现基于**回退 N 帧（GBN）协议**的实时日志传输：日志服务器（发送方）向监控中心（接收方）传输实时日志（每 100ms 产生 1 帧，100 字节 / 帧），链路 RTT 约 200ms，丢包率 5%。当前 GBN 窗口大小设为 5，存在 “频繁超时重传” 导致的日志延迟。需优化协议参数，平衡传输效率与实时性。

### 核心需求

1. 问题分析：当前窗口大小 = 5 时，为何频繁超时？计算当前信道利用率。
2. 优化方案：调整窗口大小与超时时间（基于 RTT 动态计算），减少无效重传。
3. 代码实现：修改 GBN 发送方逻辑，支持动态窗口和超时时间，打印优化前后的 “日志延迟” 对比。

### 考察点

- GBN 协议原理（2-8）、TCP 超时时间计算（2-9）、信道利用率分析（2-7）
- Go 的定时器动态调整、并发日志处理

### 参考答案（核心代码片段）

#### 1. 问题分析与利用率计算

go

```go
// 信道利用率计算（GBN）：U = (N * Ttrans) / (Ttrans + RTT)
// 已知：Ttrans（单帧发送时间）= 100字节 / 10Mbps（假设带宽）≈ 0.08ms
// RTT=200ms，N=5（原窗口）
// U = (5 * 0.08) / (0.08 + 200) ≈ 0.00199 → 0.2%（极低，因窗口过小）
// 问题：窗口=5 < RTT/Ttrans +1 ≈ 200/0.08 +1=2501，导致发送方频繁等待ACK，丢包后重传窗口内所有帧，加剧延迟

// 优化思路：窗口大小设为 RTT/Ttrans +1 ≈ 2500（但需考虑带宽限制，实际设为100）；超时时间基于RTT动态计算
```

#### 2. 动态窗口与超时的 GBN 发送方

go

```go
package main

import (
	"log"
	"net"
	"time"
)

const (
	frameSize    = 100    // 日志帧大小
	initialN     = 100    // 优化后窗口大小
	rttEstimate  = 200 * time.Millisecond // 初始RTT估计
	alpha        = 0.125 // EstimatedRTT权重
	beta         = 0.25  // DevRTT权重
)

var (
	estimatedRTT = rttEstimate
	devRTT       = rttEstimate / 4
	timeout      = estimatedRTT + 4*devRTT // 动态超时时间
)

// 动态更新RTT和超时时间
func updateRTT(sampleRTT time.Duration) {
	estimatedRTT = time.Duration((1-alpha)*float64(estimatedRTT) + alpha*float64(sampleRTT))
	devRTT = time.Duration((1-beta)*float64(devRTT) + beta*math.Abs(float64(sampleRTT-estimatedRTT)))
	timeout = estimatedRTT + 4*devRTT
	log.Printf("Updated RTT: %v, Timeout: %v", estimatedRTT, timeout)
}

// GBN发送方（动态窗口+超时）
func gbnSender(conn *net.UDPConn, serverAddr *net.UDPAddr, logChan <-chan []byte) {
	base := 0          // 窗口左边界
	nextSeq := 0       // 下一个要发送的序列号
	windowSize := initialN
	timer := time.NewTimer(timeout)
	defer timer.Stop()

	for logData := range logChan {
		// 1. 发送窗口内所有帧
		for nextSeq < base+windowSize {
			frame := &Frame{ // 复用之前的Frame结构，Seq用int
				Seq:  uint8(nextSeq % 256),
				Data: logData,
				CRC:  calcCRC(append([]byte{uint8(nextSeq % 256)}, logData...)),
			}
			sendTime := time.Now()
			_ = conn.WriteToUDP(frame.Marshal(), serverAddr)
			log.Printf("Sent log frame %d (seq=%d), window [%d, %d)", nextSeq, frame.Seq, base, base+windowSize)
			// 记录发送时间（用于计算SampleRTT）
			sendTimes[nextSeq] = sendTime
			nextSeq++
		}

		// 2. 等待ACK或超时
		timer.Reset(timeout)
		select {
		case <-timer.C:
			// 超时重传窗口内所有帧
			log.Printf("Timeout, retransmit frames from %d", base)
			for seq := base; seq < nextSeq; seq++ {
				frame := &Frame{
					Seq:  uint8(seq % 256),
					Data: logCache[seq], // 缓存已发送的日志数据
					CRC:  calcCRC(append([]byte{uint8(seq % 256)}, logCache[seq]...)),
				}
				_ = conn.WriteToUDP(frame.Marshal(), serverAddr)
				log.Printf("Retransmitted frame %d", seq)
			}

		case ackSeq := <-ackChan: // 接收方的ACK通道
			// 计算SampleRTT（最后一个确认帧的发送时间）
			if sendTime, ok := sendTimes[ackSeq-1]; ok {
				sampleRTT := time.Since(sendTime)
				updateRTT(sampleRTT)
			}

			// 更新窗口
			if ackSeq > base {
				log.Printf("Received ACK %d, window updated to [%d, %d)", ackSeq, ackSeq, ackSeq+windowSize)
				base = ackSeq
			}
		}
	}
}

// 模拟日志产生（每100ms一帧）
func generateLogs(logChan chan<- []byte) {
	defer close(logChan)
	for i := 0; ; i++ {
		logData := []byte(fmt.Sprintf("Log %d: system status normal", i))
		logChan <- logData
		time.Sleep(100 * time.Millisecond)
	}
}

func main() {
	logChan := make(chan []byte, 100)
	ackChan := make(chan int, 100)

	// 启动日志生成
	go generateLogs(logChan)

	// 启动ACK接收协程（省略，参考之前GBN服务器代码，将ACK发送到ackChan）
	go recvACK(ackChan)

	// 启动GBN发送方
	serverAddr, _ := net.ResolveUDPAddr("udp", "127.0.0.1:8080")
	conn, _ := net.DialUDP("udp", nil, serverAddr)
	defer conn.Close()
	gbnSender(conn, serverAddr, logChan)
}
```

## 5. 场景题（综合排查与优化）：TCP 文件传输慢的问题定位与解决

### 场景描述

某 Go 开发的 TCP 文件传输工具（客户端→服务器，1GB 文件），在跨地域网络（RTT=300ms，带宽 = 100Mbps）下传输速度仅 10Mbps，远低于带宽上限。需通过代码排查与协议优化，将速度提升至 50Mbps 以上。

### 核心需求

1. 问题定位：通过 Go 代码打印 TCP 连接的 “滑动窗口大小”“拥塞窗口（CWND）”“RTT” 等参数，分析传输慢的原因（如窗口过小、拥塞控制保守）。
2. 优化方案：基于 TCP 特性（2-1、2-8、2-9），调整 “TCP 窗口缩放”“拥塞控制算法”“MSS 协商” 等参数。
3. 验证：修改客户端 / 服务器代码，实现优化并对比传输时间（原时间 vs 优化后时间）。

### 考察点

- TCP 滑动窗口（2-8）、拥塞控制（2-1、2-9）、TCP 首部参数（2-10）
- Go 的`net.TCPConn`参数获取（`syscall`）、TCP 选项设置

### 参考答案（核心代码片段）

#### 1. 问题定位：打印 TCP 关键参数

go

```go
package main

import (
	"log"
	"net"
	"syscall"
	"time"
)

// 获取TCP滑动窗口大小（接收窗口）
func getTCPWindowSize(conn *net.TCPConn) (int, error) {
	fd, err := conn.File()
	if err != nil {
		return 0, err
	}
	defer fd.Close()

	// 通过syscall获取TCP_INFO（Linux）
	tcpInfo := syscall.TCPInfo{}
	err = syscall.GetsockoptInt(int(fd.Fd()), syscall.SOL_TCP, syscall.TCP_INFO, (*int)(&tcpInfo))
	if err != nil {
		return 0, err
	}
	return int(tcpInfo.Rcv_wnd), nil // 接收窗口大小
}

// 计算实际传输速率
func calcTransferRate(startTime time.Time, fileSize int64) float64 {
	duration := time.Since(startTime).Seconds()
	rateMbps := (float64(fileSize) * 8) / (1024 * 1024 * duration) // 转为Mbps
	return rateMbps
}

// 服务器端定位代码（处理连接时打印参数）
func handleConn(conn net.Conn) {
	defer conn.Close()
	tcpConn, ok := conn.(*net.TCPConn)
	if !ok {
		return
	}

	// 每2秒打印一次窗口大小和RTT
	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		for range ticker.C {
			winSize, _ := getTCPWindowSize(tcpConn)
			// 获取RTT（通过TCP_INFO的rtt字段）
			fd, _ := tcpConn.File()
			tcpInfo := syscall.TCPInfo{}
			_ = syscall.GetsockoptInt(int(fd.Fd()), syscall.SOL_TCP, syscall.TCP_INFO, (*int)(&tcpInfo))
			rtt := time.Duration(tcpInfo.Rtt) * time.Microsecond
			log.Printf("Window Size: %d bytes, RTT: %v", winSize, rtt)
		}
	}()

	// 接收文件并计算速率（省略文件接收代码）
	startTime := time.Now()
	fileSize := int64(1024 * 1024 * 1024) // 1GB
	// ... 接收文件逻辑 ...
	rate := calcTransferRate(startTime, fileSize)
	log.Printf("Transfer completed, rate: %.2f Mbps", rate)
}
```

#### 2. 优化方案：调整 TCP 参数

go

```go
// 客户端优化：设置TCP窗口缩放、MSS、拥塞算法
func dialOptimizedTCP(addr string) (*net.TCPConn, error) {
	dialer := net.Dialer{
		Control: func(network, address string, c syscall.RawConn) error {
			return c.Control(func(fd uintptr) {
				// 1. 启用TCP窗口缩放（允许窗口超过65535字节）
				_ = syscall.SetsockoptInt(int(fd), syscall.SOL_SOCKET, syscall.SO_RCVBUF, 4*1024*1024) // 接收缓冲区4MB
				_ = syscall.SetsockoptInt(int(fd), syscall.SOL_SOCKET, syscall.SO_SNDBUF, 4*1024*1024) // 发送缓冲区4MB

				// 2. 设置MSS（最大分段大小）为1460（MTU=1500-IP首部20-TCP首部20）
				_ = syscall.SetsockoptInt(int(fd), syscall.SOL_TCP, syscall.TCP_MAXSEG, 1460)

				// 3. 使用BBR拥塞控制算法（需Linux内核支持）
				_ = syscall.SetsockoptString(int(fd), syscall.SOL_TCP, syscall.TCP_CONGESTION, "bbr")
			})
		},
	}

	conn, err := dialer.Dial("tcp", addr)
	if err != nil {
		return nil, err
	}
	return conn.(*net.TCPConn), nil
}

// 服务器端优化：启用窗口缩放
func listenOptimizedTCP(addr string) (*net.TCPListener, error) {
	listener, err := net.ListenTCP("tcp", func() *net.TCPAddr {
		tcpAddr, _ := net.ResolveTCPAddr("tcp", addr)
		return tcpAddr
	}())
	if err != nil {
		return nil, err
	}

	// 设置服务器socket选项
	fd, err := listener.File()
	if err != nil {
		return nil, err
	}
	defer fd.Close()
	_ = syscall.SetsockoptInt(int(fd.Fd()), syscall.SOL_SOCKET, syscall.SO_RCVBUF, 4*1024*1024)
	_ = syscall.SetsockoptInt(int(fd.Fd()), syscall.SOL_SOCKET, syscall.SO_SNDBUF, 4*1024*1024)

	return listener, nil
}

// 优化后传输验证
func main() {
	// 服务器端
	go func() {
		listener, _ := listenOptimizedTCP(":8080")
		defer listener.Close()
		for {
			conn, _ := listener.Accept()
			go handleConn(conn)
		}
	}()

	// 客户端
	time.Sleep(1 * time.Second)
	conn, _ := dialOptimizedTCP("127.0.0.1:8080")
	defer conn.Close()

	// 发送1GB文件（省略文件读取和发送代码）
	startTime := time.Now()
	sendFile(conn, "1gb_test.file")
	rate := calcTransferRate(startTime, 1024*1024*1024)
	log.Printf("Optimized transfer rate: %.2f Mbps", rate) // 预期提升至50Mbps以上
}
```



# 项目

# Go 实用小项目：UDP 可靠文件传输工具（基于停止等待协议）

## 项目说明

本项目基于斯坦福计算机网络 2 - 系列核心知识点（UDP 特性、停止等待协议、CRC 错误检测），实现一个**UDP 可靠文件传输工具**。通过 UDP 的高效性结合停止等待协议的可靠性，解决 UDP 丢包问题，支持跨网络传输小型文件（如日志、配置文件），并提供传输进度和 RTT 统计。

核心功能：

1. 客户端：文件分片、帧封装（序列号 + CRC 校验）、停止等待发送（超时重传）
2. 服务器：帧校验、按序接收、ACK 回复、文件重组
3. 辅助功能：传输进度显示、RTT 统计、传输完成校验

## 完整代码（含详细注释）

go

```go
// main.go: UDP可靠文件传输工具，支持客户端发送/服务器接收
package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"log"
	"math"
	"net"
	"os"
	"time"

	"github.com/sigurn/crc16" // CRC16校验依赖（需执行 go get github.com/sigurn/crc16）
)

// -------------------------- 1. 配置常量定义 --------------------------
// 基于停止等待协议和UDP特性设计，平衡效率与可靠性
const (
	Proto           = "udp"          // 传输协议
	FrameSize       = 1024           // 帧总大小（1KB，适配大多数网络MTU）
	SeqSize         = 1              // 序列号长度（1字节，0-255循环，满足小型文件传输）
	CRCSize         = 2              // CRC16校验码长度（2字节，检错能力强）
	EndFlagSize     = 1              // 结束标志长度（1字节，标识文件传输结束）
	DataSize        = FrameSize - SeqSize - CRCSize - EndFlagSize // 单帧数据最大长度：1024-1-2-1=1020字节
	Timeout         = 2 * time.Second // 超时重传时间（2秒，适配一般网络延迟）
	MaxRetries      = 5              // 单帧最大重传次数（避免无限重传）
	CRC16Poly       = crc16.CRC16_XMODEM // CRC16多项式（工业常用，检错效果好）
	EndFlag         = 0x01           // 结束帧标志（0x01表示结束，0x00表示数据帧）
)

// -------------------------- 2. 核心数据结构 --------------------------
// Frame：UDP传输的帧结构，包含"序列号+CRC校验+数据+结束标志"
type Frame struct {
	Seq     uint8   // 序列号（0-255循环，用于按序接收和重传判断）
	CRC     uint16  // CRC16校验码（校验Seq+Data+EndFlag，确保数据完整性）
	Data    []byte  // 实际传输的数据（最大1020字节）
	IsEnd   bool    // 是否为结束帧（传输完所有数据后发送）
}

// -------------------------- 3. 工具函数：CRC校验 --------------------------
// calcCRC：计算数据的CRC16校验码（输入为帧的Seq+Data+EndFlag字节流）
func calcCRC(data []byte) uint16 {
	// 初始化CRC16计算器（使用XMODEM多项式）
	crcTable := crc16.MakeTable(CRC16Poly)
	// 计算并返回CRC值
	return crc16.Checksum(data, crcTable)
}

// -------------------------- 4. 帧序列化与反序列化 --------------------------
// Marshal：将Frame结构体序列化为字节流（用于UDP发送）
func (f *Frame) Marshal() []byte {
	// 1. 初始化帧缓冲区（固定FrameSize字节）
	buf := make([]byte, FrameSize)
	// 2. 填充序列号（第1字节）
	buf[0] = f.Seq
	// 3. 填充结束标志（第2字节：0x00=数据帧，0x01=结束帧）
	endFlag := uint8(0x00)
	if f.IsEnd {
		endFlag = EndFlag
	}
	buf[SeqSize] = endFlag
	// 4. 填充数据（从第3字节开始，不足用0填充）
	dataLen := len(f.Data)
	if dataLen > DataSize {
		dataLen = DataSize // 防止数据溢出
	}
	copy(buf[SeqSize+EndFlagSize:SeqSize+EndFlagSize+dataLen], f.Data)
	// 5. 计算并填充CRC16校验码（最后2字节）
	// CRC校验范围：Seq（1字节）+ EndFlag（1字节）+ Data（实际长度）
	crcInput := append([]byte{f.Seq, endFlag}, f.Data[:dataLen]...)
	f.CRC = calcCRC(crcInput)
	binary.BigEndian.PutUint16(buf[FrameSize-CRCSize:], f.CRC)

	return buf
}

// Unmarshal：将UDP接收的字节流反序列化为Frame结构体（用于服务器解析）
func Unmarshal(buf []byte) (*Frame, error) {
	// 1. 校验缓冲区长度（必须为FrameSize，否则为无效帧）
	if len(buf) != FrameSize {
		return nil, fmt.Errorf("invalid frame size: %d (expected %d)", len(buf), FrameSize)
	}

	// 2. 解析基本字段
	seq := buf[0]                          // 序列号
	endFlag := buf[SeqSize]                // 结束标志
	data := buf[SeqSize+EndFlagSize : FrameSize-CRCSize] // 数据部分（含填充的0）
	crcFromFrame := binary.BigEndian.Uint16(buf[FrameSize-CRCSize:]) // 帧中的CRC值

	// 3. 验证CRC校验（判断数据是否损坏）
	crcInput := append([]byte{seq, endFlag}, data...)
	crcCalc := calcCRC(crcInput)
	if crcCalc != crcFromFrame {
		return nil, fmt.Errorf("crc check failed: calc %x, frame %x", crcCalc, crcFromFrame)
	}

	// 4. 构造Frame对象（去除数据尾部的0填充）
	// 找到数据的实际长度（从非0字节到第一个0字节的位置，或取DataSize）
	dataLen := DataSize
	for i := DataSize - 1; i >= 0; i-- {
		if data[i] != 0 {
			break
		}
		dataLen = i
	}
	if dataLen < 0 {
		dataLen = 0 // 空数据处理
	}

	return &Frame{
		Seq:     seq,
		CRC:     crcFromFrame,
		Data:    data[:dataLen],
		IsEnd:   endFlag == EndFlag,
	}, nil
}

// -------------------------- 5. 服务器端逻辑：接收文件 --------------------------
// ServerConfig：服务器配置参数
type ServerConfig struct {
	ListenAddr string // 监听地址（如 ":8080"）
	SaveDir    string // 文件保存目录
}

// StartServer：启动UDP文件接收服务器
func StartServer(cfg ServerConfig) error {
	// 1. 解析监听地址
	udpAddr, err := net.ResolveUDPAddr(Proto, cfg.ListenAddr)
	if err != nil {
		return fmt.Errorf("resolve listen address failed: %v", err)
	}

	// 2. 创建UDP监听套接字
	conn, err := net.ListenUDP(Proto, udpAddr)
	if err != nil {
		return fmt.Errorf("listen udp failed: %v", err)
	}
	defer conn.Close() // 程序退出时关闭连接
	log.Printf("UDP file server started: listen on %s, save to %s", cfg.ListenAddr, cfg.SaveDir)

	// 3. 初始化接收状态（按序接收核心变量）
	expectedSeq := uint8(0)          // 期望接收的下一个序列号
	fileBuf := make([]byte, 0)       // 缓存已接收的文件数据
	clientAddr := &net.UDPAddr{}     // 客户端地址（用于回复ACK）
	frameBuf := make([]byte, FrameSize) // 接收帧的缓冲区
	isReceiving := false             // 是否正在接收文件（防止多客户端干扰，简化版单客户端处理）

	// 4. 循环接收帧并处理
	for {
		// 读取UDP数据（阻塞直到收到数据或出错）
		n, addr, err := conn.ReadFromUDP(frameBuf)
		if err != nil {
			log.Printf("read from udp failed: %v", err)
			continue
		}

		// 处理第一个客户端连接（简化版：同一时间只处理一个客户端）
		if !isReceiving {
			clientAddr = addr
			isReceiving = true
			log.Printf("new client connected: %s", clientAddr.String())
		}
		// 忽略其他客户端的数据包（实际项目可扩展为多客户端管理）
		if addr.String() != clientAddr.String() {
			log.Printf("ignore data from unknown client: %s", addr.String())
			continue
		}

		// 反序列化帧并校验（CRC+格式）
		frame, err := Unmarshal(frameBuf[:n])
		if err != nil {
			log.Printf("invalid frame from %s: %v", clientAddr.String(), err)
			// 发送上一个正确的ACK（告知客户端重传）
			sendACK(conn, clientAddr, expectedSeq-1)
			continue
		}
		log.Printf("received frame: seq=%d, data_len=%d, is_end=%v", frame.Seq, len(frame.Data), frame.IsEnd)

		// 按序接收逻辑（停止等待协议核心）
		if frame.Seq == expectedSeq {
			// 5.1 接收当前期望的帧
			if !frame.IsEnd {
				// 数据帧：追加到文件缓存
				fileBuf = append(fileBuf, frame.Data...)
				// 打印传输进度（每接收10帧打印一次）
				if expectedSeq%10 == 0 {
					progress := float64(len(fileBuf)) / (1024 * 1024) // 转为MB
					log.Printf("transfer progress: %.2f MB", progress)
				}
			}

			// 5.2 发送ACK（确认号=当前序列号，告知客户端已接收）
			ackSeq := expectedSeq
			if err := sendACK(conn, clientAddr, ackSeq); err != nil {
				log.Printf("send ACK failed: %v", err)
				continue
			}

			// 5.3 处理结束帧（文件传输完成）
			if frame.IsEnd {
				log.Printf("received end frame, total data size: %d bytes", len(fileBuf))
				// 生成保存文件名（当前时间+客户端IP）
				fileName := fmt.Sprintf("recv_%s_%d.dat", clientAddr.IP.String(), time.Now().Unix())
				savePath := fmt.Sprintf("%s/%s", cfg.SaveDir, fileName)
				// 写入文件
				if err := os.WriteFile(savePath, fileBuf, 0644); err != nil {
					log.Printf("save file failed: %v", err)
				} else {
					log.Printf("file saved successfully: %s", savePath)
				}
				// 重置接收状态，准备下一次传输
				expectedSeq = 0
				fileBuf = fileBuf[:0]
				isReceiving = false
				continue
			}

			// 5.4 更新期望序列号（循环递增）
			expectedSeq = (expectedSeq + 1) % 256

		} else {
			// 5.5 接收失序帧（如重复帧或跳号帧）：重发上一个正确的ACK
			log.Printf("out-of-order frame: expected %d, got %d", expectedSeq, frame.Seq)
			sendACK(conn, clientAddr, expectedSeq-1)
		}
	}
}

// sendACK：服务器向客户端发送ACK确认（ACK内容为已接收的最大序列号）
func sendACK(conn *net.UDPConn, clientAddr *net.UDPAddr, ackSeq uint8) error {
	// ACK报文简化为1字节（仅包含已接收的最大序列号）
	ackBuf := []byte{ackSeq}
	_, err := conn.WriteToUDP(ackBuf, clientAddr)
	if err != nil {
		return err
	}
	log.Printf("sent ACK: seq=%d to %s", ackSeq, clientAddr.String())
	return nil
}

// -------------------------- 6. 客户端逻辑：发送文件 --------------------------
// ClientConfig：客户端配置参数
type ClientConfig struct {
	ServerAddr string // 服务器地址（如 "127.0.0.1:8080"）
	Filepath   string // 待发送文件路径
}

// StartClient：启动UDP文件发送客户端
func StartClient(cfg ClientConfig) error {
	// 1. 验证文件是否存在
	if _, err := os.Stat(cfg.Filepath); os.IsNotExist(err) {
		return fmt.Errorf("file not found: %s", cfg.Filepath)
	}
	// 读取文件内容
	fileData, err := os.ReadFile(cfg.Filepath)
	if err != nil {
		return fmt.Errorf("read file failed: %v", err)
	}
	log.Printf("file loaded: %s, size: %d bytes", cfg.Filepath, len(fileData))

	// 2. 解析服务器地址
	serverAddr, err := net.ResolveUDPAddr(Proto, cfg.ServerAddr)
	if err != nil {
		return fmt.Errorf("resolve server address failed: %v", err)
	}

	// 3. 创建UDP客户端连接
	conn, err := net.DialUDP(Proto, nil, serverAddr)
	if err != nil {
		return fmt.Errorf("dial udp server failed: %v", err)
	}
	defer conn.Close()
	log.Printf("connected to UDP server: %s", serverAddr.String())

	// 4. 初始化发送状态（停止等待协议核心变量）
	currentSeq := uint8(0)            // 当前要发送的序列号
	totalFrames := calcTotalFrames(fileData) // 总数据帧数
	sentBytes := 0                    // 已发送字节数
	rttList := make([]time.Duration, 0) // 存储RTT用于统计

	// 5. 发送所有数据帧
	for i := 0; i < totalFrames; i++ {
		// 5.1 构造数据帧（分片文件数据）
		start := i * DataSize
		end := start + DataSize
		if end > len(fileData) {
			end = len(fileData)
		}
		dataFrame := &Frame{
			Seq:   currentSeq,
			Data:  fileData[start:end],
			IsEnd: false,
		}

		// 5.2 停止等待发送（带超时重传）
		ackReceived := false
		retryCount := 0
		for !ackReceived && retryCount < MaxRetries {
			// 发送帧
			sendBuf := dataFrame.Marshal()
			sendTime := time.Now()
			if _, err := conn.Write(sendBuf); err != nil {
				log.Printf("send frame %d (seq=%d) failed: %v", i, currentSeq, err)
				retryCount++
				time.Sleep(500 * time.Millisecond) // 重试前等待
				continue
			}
			log.Printf("sent frame %d/%d: seq=%d, data_len=%d", i+1, totalFrames, currentSeq, len(dataFrame.Data))

			// 等待ACK（设置超时）
			conn.SetReadDeadline(time.Now().Add(Timeout))
			ackBuf := make([]byte, 1) // ACK为1字节
			n, _, err := conn.ReadFromUDP(ackBuf)
			if err != nil {
				// 超时或读取错误：重传
				if netErr, ok := err.(net.Error); ok && netErr.Timeout() {
					log.Printf("frame %d (seq=%d) timeout, retry %d/%d", i, currentSeq, retryCount+1, MaxRetries)
				} else {
					log.Printf("read ACK failed: %v, retry %d/%d", err, retryCount+1, MaxRetries)
				}
				retryCount++
				continue
			}

			// 验证ACK（确认号需等于当前发送的序列号）
			if n == 1 && ackBuf[0] == currentSeq {
				// 计算RTT并记录
				rtt := time.Since(sendTime)
				rttList = append(rttList, rtt)
				log.Printf("received ACK for frame %d (seq=%d), RTT: %v", i, currentSeq, rtt)
				ackReceived = true
				sentBytes += len(dataFrame.Data)
			} else {
				log.Printf("invalid ACK: expected %d, got %v", currentSeq, ackBuf[:n])
				retryCount++
			}
		}

		// 单帧重传次数超限：终止传输
		if !ackReceived {
			return fmt.Errorf("frame %d (seq=%d) max retries exceeded, abort", i, currentSeq)
		}

		// 更新序列号（循环递增）
		currentSeq = (currentSeq + 1) % 256
	}

	// 6. 发送结束帧（告知服务器传输完成）
	log.Println("sending end frame to server...")
	endFrame := &Frame{
		Seq:   currentSeq,
		Data:  []byte("EOF"),
		IsEnd: true,
	}
	// 结束帧的停止等待发送
	ackReceived := false
	retryCount := 0
	for !ackReceived && retryCount < MaxRetries {
		sendBuf := endFrame.Marshal()
		if _, err := conn.Write(sendBuf); err != nil {
			log.Printf("send end frame failed: %v", err)
			retryCount++
			time.Sleep(500 * time.Millisecond)
			continue
		}

		// 等待结束帧的ACK
		conn.SetReadDeadline(time.Now().Add(Timeout))
		ackBuf := make([]byte, 1)
		n, _, err := conn.ReadFromUDP(ackBuf)
		if err != nil {
			log.Printf("end frame timeout, retry %d/%d", retryCount+1, MaxRetries)
			retryCount++
			continue
		}

		if n == 1 && ackBuf[0] == currentSeq {
			log.Printf("received ACK for end frame (seq=%d)", currentSeq)
			ackReceived = true
		} else {
			log.Printf("invalid end frame ACK: got %v", ackBuf[:n])
			retryCount++
		}
	}
	if !ackReceived {
		return fmt.Errorf("end frame max retries exceeded, abort")
	}

	// 7. 传输完成统计
	log.Println("=" + strings.Repeat("-", 50) + "=")
	log.Printf("file transfer completed successfully!")
	log.Printf("total sent: %.2f MB", float64(sentBytes)/(1024*1024))
	log.Printf("total frames: %d", totalFrames)
	if len(rttList) > 0 {
		avgRTT := calcAvgRTT(rttList)
		maxRTT := calcMaxRTT(rttList)
		minRTT := calcMinRTT(rttList)
		log.Printf("RTT stats: avg=%v, max=%v, min=%v", avgRTT, maxRTT, minRTT)
	}
	log.Println("=" + strings.Repeat("-", 50) + "=")

	return nil
}

// calcTotalFrames：计算文件需要分割的总帧数
func calcTotalFrames(fileData []byte) int {
	totalBytes := len(fileData)
	// 向上取整：总字节数 / 单帧数据长度
	return int(math.Ceil(float64(totalBytes) / float64(DataSize)))
}

// calcAvgRTT：计算平均RTT
func calcAvgRTT(rttList []time.Duration) time.Duration {
	total := time.Duration(0)
	for _, rtt := range rttList {
		total += rtt
	}
	return total / time.Duration(len(rttList))
}

// calcMaxRTT：计算最大RTT
func calcMaxRTT(rttList []time.Duration) time.Duration {
	max := time.Duration(0)
	for _, rtt := range rttList {
		if rtt > max {
			max = rtt
		}
	}
	return max
}

// calcMinRTT：计算最小RTT
func calcMinRTT(rttList []time.Duration) time.Duration {
	min := rttList[0]
	for _, rtt := range rttList {
		if rtt < min {
			min = rtt
		}
	}
	return min
}

// -------------------------- 7. 主函数：命令行参数解析与启动 --------------------------
import "strings" // 补充strings依赖

func main() {
	// 定义命令行参数（支持server和client两种模式）
	// 服务器模式参数：-mode server -listen :8080 -savedir ./recv
	// 客户端模式参数：-mode client -server 127.0.0.1:8080 -file ./test.dat
	mode := flag.String("mode", "", "运行模式：server（接收）/client（发送）")
	// 服务器参数
	listenAddr := flag.String("listen", ":8080", "服务器监听地址（仅server模式）")
	saveDir := flag.String("savedir", "./recv", "文件保存目录（仅server模式）")
	// 客户端参数
	serverAddr := flag.String("server", "127.0.0.1:8080", "服务器地址（仅client模式）")
	filePath := flag.String("file", "", "待发送文件路径（仅client模式）")

	// 解析命令行参数
	flag.Parse()

	// 验证运行模式
	if *mode != "server" && *mode != "client" {
		log.Fatal("请指定正确的运行模式：-mode server 或 -mode client")
	}

	// 初始化保存目录（服务器模式）
	if *mode == "server" {
		if err := os.MkdirAll(*saveDir, 0755); err != nil {
			log.Fatalf("创建保存目录失败：%v", err)
		}
		// 启动服务器
		if err := StartServer(ServerConfig{
			ListenAddr: *listenAddr,
			SaveDir:    *saveDir,
		}); err != nil {
			log.Fatalf("服务器启动失败：%v", err)
		}
	}

	// 客户端模式：验证文件路径
	if *mode == "client" {
		if *filePath == "" {
			log.Fatal("客户端模式必须指定待发送文件：-file <文件路径>")
		}
		// 启动客户端
		if err := StartClient(ClientConfig{
			ServerAddr: *serverAddr,
			Filepath:   *filePath,
		}); err != nil {
			log.Fatalf("文件发送失败：%v", err)
		}
	}
}
```

## 项目使用说明

### 1. 环境准备

1. 安装 Go 环境（1.16+）
2. 安装 CRC 依赖：`go get github.com/sigurn/crc16`
3. 准备测试文件（如 10MB 的`test.dat`）

### 2. 启动服务器（接收文件）

bash

```bash
# 格式：go run main.go -mode server -listen <监听地址> -savedir <保存目录>
go run main.go -mode server -listen :8080 -savedir ./received_files
```

- 服务器会在`./received_files`目录下保存接收的文件，文件名为`recv_<客户端IP>_<时间戳>.dat`

### 3. 启动客户端（发送文件）

bash

```bash
# 格式：go run main.go -mode client -server <服务器地址> -file <待发送文件>
go run main.go -mode client -server 127.0.0.1:8080 -file ./test.dat
```

- 客户端会显示传输进度、RTT 统计，传输完成后提示 “file transfer completed successfully”

### 4. 核心功能验证

- **可靠性验证**：可在网络中模拟丢包（如使用`tc`命令），客户端会自动超时重传，服务器最终能接收完整文件
- **错误检测**：手动修改传输中的帧数据，CRC 校验会失败，服务器会丢弃错误帧并要求重传
- **进度统计**：服务器每接收 10 帧打印一次进度，客户端传输完成后输出平均 / 最大 / 最小 RTT

## 项目关联的课程知识点

1. **UDP 服务模型（2-2）**：使用 UDP 无连接特性，直接发送数据报，通过应用层协议补充可靠性
2. **停止等待协议（2-7）**：客户端 “发送一帧→等 ACK→超时重传”，服务器 “按序接收→发 ACK→重组文件”
3. **错误检测（2-5）**：采用 CRC16 校验，检测传输中的比特错误，确保数据完整性
4. **帧结构设计**：参考 TCP 首部的序列号字段，通过 1 字节序列号实现按序接收和重传判断
5. **端到端原则（2-4）**：可靠性逻辑（重传、校验）在客户端 / 服务器（端系统）实现，UDP 仅负责数据转发

## 项目扩展方向

1. 支持多客户端并发接收（当前为单客户端简化版）
2. 升级为滑动窗口协议（GBN/SR），提升大文件传输效率
3. 增加文件校验（如 MD5），确保传输后文件与原文件一致
4. 实现断点续传（记录已接收的帧序号，重启后从断点继续）



# Java

以下是基于斯坦福大学计算机网络 2 系列核心实验的 Java 实现，涵盖 UDP/TCP 通信、可靠传输协议等关键知识点，每个实验包含完整代码、原理说明和验证方法。

## 实验 1：UDP 无连接通信（对应 2-2 UDP 服务模型）

### 实验目标

理解 UDP“无连接、不可靠、数据报” 特性，实现客户端向服务器发送数据，服务器打印并回显数据。

#### UDP 服务器（UDPServer.java）

java

```java
import java.net.*;
import java.io.*;

public class UDPServer {
    public static void main(String[] args) throws IOException {
        // 监听UDP端口8080
        DatagramSocket serverSocket = new DatagramSocket(8080);
        byte[] receiveData = new byte[1024];
        System.out.println("UDP server started on :8080");

        while (true) {
            // 接收客户端数据
            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            serverSocket.receive(receivePacket);
            String clientMsg = new String(receivePacket.getData(), 0, receivePacket.getLength());
            InetAddress clientIP = receivePacket.getAddress();
            int clientPort = receivePacket.getPort();
            System.out.println("Received from " + clientIP + ":" + clientPort + ": " + clientMsg);

            // 回显数据给客户端
            String response = "Echo: " + clientMsg;
            byte[] sendData = response.getBytes();
            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, clientIP, clientPort);
            serverSocket.send(sendPacket);
        }
    }
}
```

#### UDP 客户端（UDPClient.java）

java

```java
import java.net.*;
import java.io.*;
import java.util.Scanner;

public class UDPClient {
    public static void main(String[] args) throws IOException {
        DatagramSocket clientSocket = new DatagramSocket();
        InetAddress serverIP = InetAddress.getByName("127.0.0.1");
        int serverPort = 8080;
        Scanner scanner = new Scanner(System.in);

        System.out.println("Enter message to send (exit to quit):");
        while (true) {
            String msg = scanner.nextLine();
            if (msg.equals("exit")) {
                System.out.println("Client exiting");
                break;
            }

            // 发送数据到服务器
            byte[] sendData = msg.getBytes();
            DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length, serverIP, serverPort);
            clientSocket.send(sendPacket);

            // 接收服务器回显（设置3秒超时）
            byte[] receiveData = new byte[1024];
            DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
            clientSocket.setSoTimeout(3000); // 3秒超时
            try {
                clientSocket.receive(receivePacket);
                String response = new String(receivePacket.getData(), 0, receivePacket.getLength());
                System.out.println("Server response: " + response);
            } catch (SocketTimeoutException e) {
                System.out.println("Read failed (may be lost): timeout");
            }
        }
        clientSocket.close();
        scanner.close();
    }
}
```

### 验证方法

1. 启动服务器：`javac UDPServer.java && java UDPServer`
2. 启动客户端：`javac UDPClient.java && java UDPClient`
3. 客户端输入消息，观察服务器接收和回显；若客户端 3 秒内未收到回显，模拟 “丢包”（体现 UDP 不可靠特性）。

## 实验 2：TCP 面向连接通信（对应 2-1 TCP 服务模型）

### 实验目标

理解 TCP“三次握手建立连接、可靠传输、四次挥手关闭连接” 特性，实现客户端 - 服务器文件传输。

#### TCP 服务器（TCPServer.java）

java

```java
import java.net.*;
import java.io.*;

public class TCPServer {
    public static void main(String[] args) throws IOException {
        // 监听TCP端口8080
        ServerSocket serverSocket = new ServerSocket(8080);
        System.out.println("TCP server started on :8080");

        while (true) {
            // 接受客户端连接（三次握手由系统自动完成）
            Socket clientSocket = serverSocket.accept();
            System.out.println("New TCP connection from " + clientSocket.getInetAddress());

            // 启动线程处理连接
            new Thread(() -> handleClient(clientSocket)).start();
        }
    }

    private static void handleClient(Socket clientSocket) {
        try (InputStream in = clientSocket.getInputStream();
             OutputStream out = clientSocket.getOutputStream()) {

            // 读取文件名（先接收256字节的文件名）
            byte[] fileNameBuf = new byte[256];
            int fileNameLen = in.read(fileNameBuf);
            String fileName = new String(fileNameBuf, 0, fileNameLen).trim();
            System.out.println("Receiving file: " + fileName);

            // 创建文件接收数据
            FileOutputStream fileOut = new FileOutputStream("received_" + fileName);

            // 读取文件内容（TCP字节流，持续读取直到结束）
            byte[] buf = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buf)) != -1) {
                fileOut.write(buf, 0, bytesRead);
            }

            fileOut.close();
            System.out.println("File received completely");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                clientSocket.close(); // 关闭连接（四次挥手）
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

#### TCP 客户端（TCPClient.java）

java

```java
import java.net.*;
import java.io.*;

public class TCPClient {
    public static void main(String[] args) throws IOException {
        if (args.length != 1) {
            System.err.println("Usage: java TCPClient <file_path>");
            System.exit(1);
        }
        String filePath = args[0];

        // 建立TCP连接（触发三次握手）
        Socket socket = new Socket("127.0.0.1", 8080);
        System.out.println("TCP connection established");

        try (OutputStream out = socket.getOutputStream();
             InputStream in = new FileInputStream(filePath)) {

            // 发送文件名（先发送文件名）
            File file = new File(filePath);
            String fileName = file.getName();
            out.write(fileName.getBytes());
            out.flush(); // 确保文件名被立即发送

            // 发送文件内容（TCP字节流，自动处理分片和重传）
            byte[] buf = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buf)) != -1) {
                out.write(buf, 0, bytesRead);
            }
            System.out.println("File sent completely");
        } finally {
            socket.close(); // 关闭连接（触发四次挥手）
        }
    }
}
```

### 验证方法

1. 启动服务器：`javac TCPServer.java && java TCPServer`
2. 客户端发送文件：`javac TCPClient.java && java TCPClient test.txt`
3. 服务器目录生成`received_test.txt`，验证文件完整性（体现 TCP 可靠传输特性）；用`netstat -an | grep 8080`观察连接状态（ESTABLISHED、TIME-WAIT 等）。

## 实验 3：停止等待协议（对应 2-7 Stop and Wait）

### 实验目标

手动实现 “发送一帧、等待确认、超时重传” 逻辑，理解可靠传输的核心原理。

#### 帧结构与工具类（Frame.java）

java

```java
// 帧结构：序列号（1字节）+ 数据
public class Frame {
    private byte seq;
    private byte[] data;

    public Frame(byte seq, byte[] data) {
        this.seq = seq;
        this.data = data;
    }

    // 序列化帧（序列号+数据）
    public byte[] toBytes() {
        byte[] frame = new byte[1 + data.length];
        frame[0] = seq;
        System.arraycopy(data, 0, frame, 1, data.length);
        return frame;
    }

    // 从字节数组反序列化帧
    public static Frame fromBytes(byte[] bytes) {
        if (bytes.length < 1) return null;
        byte seq = bytes[0];
        byte[] data = new byte[bytes.length - 1];
        System.arraycopy(bytes, 1, data, 0, data.length);
        return new Frame(seq, data);
    }

    public byte getSeq() { return seq; }
    public byte[] getData() { return data; }
}
```

#### 服务器（StopWaitServer.java）

java

```java
import java.net.*;
import java.io.*;

public class StopWaitServer {
    private static final int PORT = 8080;
    private static final int FRAME_SIZE = 1024;

    public static void main(String[] args) throws IOException {
        DatagramSocket serverSocket = new DatagramSocket(PORT);
        System.out.println("Stop-Wait server started on :" + PORT);

        byte expectedSeq = 0;
        byte[] frameBuf = new byte[FRAME_SIZE + 1]; // 1字节序列号+数据

        while (true) {
            // 接收帧
            DatagramPacket receivePacket = new DatagramPacket(frameBuf, frameBuf.length);
            serverSocket.receive(receivePacket);
            Frame frame = Frame.fromBytes(receivePacket.getData());
            if (frame == null) continue;

            InetAddress clientIP = receivePacket.getAddress();
            int clientPort = receivePacket.getPort();
            System.out.println("Received frame (seq=" + frame.getSeq() + "): " + new String(frame.getData()));

            // 验证序列号（丢弃重复帧）
            if (frame.getSeq() != expectedSeq) {
                System.out.println("Unexpected seq (expected=" + expectedSeq + "), retransmitting ACK");
                // 重发上一个ACK
                byte[] ack = {(byte) ((expectedSeq - 1) % 2)};
                DatagramPacket ackPacket = new DatagramPacket(ack, ack.length, clientIP, clientPort);
                serverSocket.send(ackPacket);
                continue;
            }

            // 发送ACK（确认号=seq+1）
            byte ackSeq = (byte) ((frame.getSeq() + 1) % 2);
            byte[] ack = {ackSeq};
            DatagramPacket ackPacket = new DatagramPacket(ack, ack.length, clientIP, clientPort);
            serverSocket.send(ackPacket);
            System.out.println("Sent ACK (ackSeq=" + ackSeq + ")\n");

            expectedSeq = ackSeq; // 更新期望序列号
        }
    }
}
```

#### 客户端（StopWaitClient.java）

java

```java
import java.net.*;
import java.io.*;

public class StopWaitClient {
    private static final String SERVER_IP = "127.0.0.1";
    private static final int SERVER_PORT = 8080;
    private static final int TIMEOUT = 2000; // 超时时间2秒
    private static final int FRAME_SIZE = 1024;

    public static void main(String[] args) throws IOException {
        DatagramSocket clientSocket = new DatagramSocket();
        clientSocket.setSoTimeout(TIMEOUT); // 设置超时
        InetAddress serverIP = InetAddress.getByName(SERVER_IP);

        // 待发送数据（分2帧）
        byte[] data1 = "Hello Stop-Wait Protocol! This is frame 1.".getBytes();
        Frame frame1 = new Frame((byte) 0, data1);
        byte[] data2 = "This is frame 2, end of data.".getBytes();
        Frame frame2 = new Frame((byte) 1, data2);

        // 发送帧1
        sendFrame(clientSocket, frame1, serverIP, SERVER_PORT);
        // 发送帧2
        sendFrame(clientSocket, frame2, serverIP, SERVER_PORT);

        System.out.println("All frames sent successfully");
        clientSocket.close();
    }

    private static void sendFrame(DatagramSocket socket, Frame frame, InetAddress serverIP, int serverPort) throws IOException {
        while (true) {
            // 发送帧
            byte[] frameData = frame.toBytes();
            DatagramPacket sendPacket = new DatagramPacket(frameData, frameData.length, serverIP, serverPort);
            socket.send(sendPacket);
            System.out.println("Sent frame (seq=" + frame.getSeq() + "), waiting ACK...");

            // 等待ACK
            byte[] ackBuf = new byte[1];
            DatagramPacket ackPacket = new DatagramPacket(ackBuf, ackBuf.length);
            try {
                socket.receive(ackPacket);
                byte ackSeq = ackBuf[0];
                // 验证ACK（确认号=seq+1）
                if (ackSeq == (frame.getSeq() + 1) % 2) {
                    System.out.println("Received ACK (ackSeq=" + ackSeq + "), frame sent successfully\n");
                    return;
                } else {
                    System.out.println("Invalid ACK (ackSeq=" + ackSeq + "), retransmitting...");
                }
            } catch (SocketTimeoutException e) {
                System.out.println("Timeout, retransmitting frame (seq=" + frame.getSeq() + ")...");
            }
        }
    }
}
```

### 验证方法

1. 启动服务器：`javac Frame.java StopWaitServer.java && java StopWaitServer`
2. 启动客户端：`javac Frame.java StopWaitClient.java && java StopWaitClient`
3. 观察日志：发送帧后等待 ACK，超时后自动重传；服务器收到重复帧时重发旧 ACK，确保可靠传输。

## 实验 4：滑动窗口协议（GBN）（对应 2-8 Sliding Window）

### 实验目标

实现 “回退 N 帧（GBN）” 协议，理解 “连续发送、累计确认、超时重传窗口内所有未确认帧” 逻辑。

#### GBN 服务器（GBNServer.java）

java

```java
import java.net.*;
import java.io.*;

public class GBNServer {
    private static final int PORT = 8080;
    private static final int FRAME_SIZE = 1024;

    public static void main(String[] args) throws IOException {
        DatagramSocket serverSocket = new DatagramSocket(PORT);
        System.out.println("GBN server started on :" + PORT);

        byte expectedSeq = 0;
        byte[] frameBuf = new byte[FRAME_SIZE + 1]; // 1字节序列号+数据

        while (true) {
            // 接收帧
            DatagramPacket receivePacket = new DatagramPacket(frameBuf, frameBuf.length);
            serverSocket.receive(receivePacket);
            Frame frame = Frame.fromBytes(receivePacket.getData());
            if (frame == null) continue;

            InetAddress clientIP = receivePacket.getAddress();
            int clientPort = receivePacket.getPort();
            System.out.println("Received frame (seq=" + frame.getSeq() + "): " + new String(frame.getData()));

            // 累计确认：仅确认连续接收的最大序列号+1
            if (frame.getSeq() == expectedSeq) {
                System.out.println("Frame (seq=" + frame.getSeq() + ") accepted, expected next=" + (expectedSeq + 1));
                expectedSeq++;
            } else {
                System.out.println("Frame (seq=" + frame.getSeq() + ") out of order, expected=" + expectedSeq);
            }

            // 发送累计ACK（确认号=expectedSeq）
            byte[] ack = {expectedSeq};
            DatagramPacket ackPacket = new DatagramPacket(ack, ack.length, clientIP, clientPort);
            serverSocket.send(ackPacket);
            System.out.println("Sent cumulative ACK (ackSeq=" + expectedSeq + ")\n");
        }
    }
}
```

#### GBN 客户端（GBNClient.java）

java

```java
import java.net.*;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class GBNClient {
    private static final String SERVER_IP = "127.0.0.1";
    private static final int SERVER_PORT = 8080;
    private static final int WINDOW_SIZE = 3; // 窗口大小
    private static final int TIMEOUT = 3000; // 超时时间3秒
    private static final int FRAME_SIZE = 1024;

    public static void main(String[] args) throws IOException {
        DatagramSocket clientSocket = new DatagramSocket();
        clientSocket.setSoTimeout(100); // 短超时用于轮询ACK
        InetAddress serverIP = InetAddress.getByName(SERVER_IP);

        // 测试数据
        String data = "GBN Protocol Test: This is a long message to split into multiple frames. " +
                "GBN allows sending multiple frames without waiting for each ACK, improving efficiency.";
        List<Frame> frames = splitIntoFrames(data.getBytes());
        System.out.println("Total frames to send: " + frames.size());

        gbnSender(clientSocket, serverIP, SERVER_PORT, frames);
        clientSocket.close();
    }

    // 将数据分片为帧
    private static List<Frame> splitIntoFrames(byte[] data) {
        List<Frame> frames = new ArrayList<>();
        for (int i = 0; i < data.length; i += FRAME_SIZE) {
            int end = Math.min(i + FRAME_SIZE, data.length);
            byte[] frameData = new byte[end - i];
            System.arraycopy(data, i, frameData, 0, frameData.length);
            frames.add(new Frame((byte) frames.size(), frameData));
        }
        return frames;
    }

    // GBN发送逻辑
    private static void gbnSender(DatagramSocket socket, InetAddress serverIP, int serverPort, List<Frame> frames) throws IOException {
        int base = 0; // 窗口左边界
        int nextSeq = 0; // 下一个要发送的序列号
        long timeoutTime = System.currentTimeMillis() + TIMEOUT; // 超时计时器

        while (base < frames.size()) {
            // 1. 发送窗口内所有可发送的帧
            while (nextSeq < base + WINDOW_SIZE && nextSeq < frames.size()) {
                Frame frame = frames.get(nextSeq);
                byte[] frameData = frame.toBytes();
                DatagramPacket sendPacket = new DatagramPacket(frameData, frameData.length, serverIP, serverPort);
                socket.send(sendPacket);
                System.out.println("Sent frame (seq=" + frame.getSeq() + "), window [base=" + base + ", next=" + nextSeq + "]");
                nextSeq++;
            }

            // 2. 等待ACK或超时
            byte[] ackBuf = new byte[1];
            DatagramPacket ackPacket = new DatagramPacket(ackBuf, ackBuf.length);
            try {
                socket.receive(ackPacket);
                int ackSeq = ackBuf[0] & 0xFF; // 转为无符号整数
                System.out.println("Received ACK (ackSeq=" + ackSeq + ")");

                // 更新窗口左边界
                if (ackSeq > base) {
                    base = ackSeq;
                    timeoutTime = System.currentTimeMillis() + TIMEOUT; // 重置超时计时器
                    System.out.println("Window updated to [base=" + base + ", next=" + nextSeq + "]");
                }
            } catch (SocketTimeoutException e) {
                // 检查是否超时
                if (System.currentTimeMillis() > timeoutTime) {
                    System.out.println("Timeout, retransmitting frames from seq=" + base);
                    // 重传窗口内所有未确认帧
                    for (int seq = base; seq < nextSeq; seq++) {
                        Frame frame = frames.get(seq);
                        byte[] frameData = frame.toBytes();
                        DatagramPacket sendPacket = new DatagramPacket(frameData, frameData.length, serverIP, serverPort);
                        socket.send(sendPacket);
                        System.out.println("Retransmitted frame (seq=" + frame.getSeq() + ")");
                    }
                    timeoutTime = System.currentTimeMillis() + TIMEOUT; // 重置超时计时器
                }
            }
        }
        System.out.println("All frames sent successfully (GBN)");
    }
}
```









### 验证方法

1. 启动服务器：`javac Frame.java GBNServer.java && java GBNServer`
2. 启动客户端：`javac Frame.java GBNClient.java && java GBNClient`
3. 观察日志：发送方连续发送 3 帧（窗口大小 = 3），接收方累计确认；超时后重传窗口内所有未确认帧（体现 GBN 核心逻辑）。

## 总结

以上 Java 实现完整覆盖了斯坦福大学计算机网络 2 系列的核心实验，包括：

- UDP/TCP 基础通信：体现无连接 vs 面向连接、不可靠 vs 可靠的差异
- 可靠传输协议：手动实现停止等待（基础可靠传输）和 GBN（滑动窗口优化效率）
- 核心原理验证：通过日志和交互过程验证协议的状态转移、重传机制和效率特性

可通过`Wireshark`抓包进一步分析报文细节，或调整参数（如窗口大小、超时时间）观察协议行为变化，加深对计算机网络传输层原理的理解。





# 项目Java

以下是一个基于传输层核心知识点的 Java 小项目 ——**多协议文件传输工具**。该工具支持 3 种传输方式（UDP 裸传、TCP、基于 UDP 的停止等待协议），可直观对比不同协议的可靠性、效率差异，完美对应课程中的 TCP/UDP 服务模型、可靠传输协议等核心知识点。

### 项目概述

**项目名称**：多协议文件传输工具
**核心功能**：通过 UDP（不可靠）、TCP（可靠）、基于 UDP 的停止等待协议（可靠）三种方式传输文件，对比不同协议的传输效果（完整性、耗时、重传次数等）。
**知识点覆盖**：UDP 无连接特性、TCP 可靠传输（三次握手 / 四次挥手 / 滑动窗口）、停止等待协议（超时重传 / 确认机制）、CRC 错误检测等。

### 项目结构

plaintext

```plaintext
FileTransferTool/
├── common/                // 公共工具类
│   ├── Frame.java         // 数据帧结构（序列号+CRC+数据）
│   ├── CRCUtil.java       // CRC校验工具（错误检测）
│   └── FileUtil.java      // 文件分片/合并工具
├── server/                // 服务器端（支持三种协议）
│   ├── UDPServer.java     // UDP服务器（不可靠传输）
│   ├── TCPServer.java     // TCP服务器（可靠传输）
│   └── StopWaitServer.java// 停止等待协议服务器（可靠传输）
├── client/                // 客户端（支持三种协议选择）
│   ├── Client.java        // 客户端主界面（选择协议/输入文件）
│   ├── UDPClient.java     // UDP客户端
│   ├── TCPClient.java     // TCP客户端
│   └── StopWaitClient.java// 停止等待协议客户端
└── Main.java              // 程序入口（启动服务器/客户端）
```

### 核心代码实现与理论对应

#### 1. 公共工具类（对应 “错误检测”“帧结构” 知识点）

##### Frame.java（数据帧结构，对应 “停止等待协议”“滑动窗口” 中的帧概念）

java

```java
package common;

// 数据帧：序列号（1字节）+ CRC校验码（2字节）+ 数据（最大1021字节）
public class Frame {
    private byte seq;       // 序列号（用于排序和重传检测）
    private short crc;      // CRC校验码（用于错误检测）
    private byte[] data;    // 实际数据

    public Frame(byte seq, byte[] data) {
        this.seq = seq;
        this.data = data;
        this.crc = CRCUtil.calcCRC(mergeSeqAndData(seq, data)); // 计算CRC（含序列号+数据）
    }

    // 合并序列号和数据（用于CRC计算，确保序列号篡改也能被检测）
    private byte[] mergeSeqAndData(byte seq, byte[] data) {
        byte[] merged = new byte[data.length + 1];
        merged[0] = seq;
        System.arraycopy(data, 0, merged, 1, data.length);
        return merged;
    }

    // 帧序列化（用于网络传输）
    public byte[] toBytes() {
        byte[] frame = new byte[1 + 2 + data.length]; // 1字节seq + 2字节crc + 数据
        frame[0] = seq;
        frame[1] = (byte) (crc >> 8);  // CRC高8位
        frame[2] = (byte) crc;         // CRC低8位
        System.arraycopy(data, 0, frame, 3, data.length);
        return frame;
    }

    // 从字节数组反序列化帧
    public static Frame fromBytes(byte[] bytes) {
        if (bytes.length < 3) return null; // 至少包含seq(1)+crc(2)
        byte seq = bytes[0];
        short crc = (short) ((bytes[1] & 0xFF) << 8 | (bytes[2] & 0xFF));
        byte[] data = new byte[bytes.length - 3];
        System.arraycopy(bytes, 3, data, 0, data.length);
        return new Frame(seq, data, crc);
    }

    // 带CRC的构造函数（反序列化用）
    private Frame(byte seq, byte[] data, short crc) {
        this.seq = seq;
        this.data = data;
        this.crc = crc;
    }

    // 验证帧完整性（CRC是否匹配）
    public boolean isValid() {
        short calculatedCrc = CRCUtil.calcCRC(mergeSeqAndData(seq, data));
        return calculatedCrc == crc;
    }

    // getter
    public byte getSeq() { return seq; }
    public byte[] getData() { return data; }
}
```

##### CRCUtil.java（错误检测，对应 “循环冗余校验（CRC）” 知识点）

java

```java
package common;

import java.util.zip.CRC32;

public class CRCUtil {
    // 计算CRC校验码（使用CRC32算法，对应课程中的“模2运算”错误检测）
    public static short calcCRC(byte[] data) {
        CRC32 crc32 = new CRC32();
        crc32.update(data);
        // 取低16位作为校验码（简化计算，课程中CRC-32更复杂但原理一致）
        return (short) (crc32.getValue() & 0xFFFF);
    }
}
```

#### 2. 服务器端（对应 “TCP 服务模型”“UDP 服务模型”“停止等待协议” 知识点）

##### TCPServer.java（TCP 可靠传输，对应 “TCP 面向连接、可靠传输” 特性）

java

```java
package server;

import common.FileUtil;
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;

public class TCPServer {
    private static final int PORT = 8888;

    public void start() throws IOException {
        // 启动TCP监听（对应“三次握手”建立连接）
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("TCP服务器启动，端口：" + PORT + "（基于TCP可靠传输）");
            while (true) {
                // 接受客户端连接（三次握手由系统底层完成）
                Socket clientSocket = serverSocket.accept();
                System.out.println("新TCP连接：" + clientSocket.getInetAddress());

                // 多线程处理连接（支持并发传输）
                new Thread(() -> handleClient(clientSocket)).start();
            }
        }
    }

    private void handleClient(Socket socket) {
        try (InputStream in = socket.getInputStream();
             DataInputStream dataIn = new DataInputStream(in)) {

            // 1. 读取文件名和长度（TCP字节流，需先约定格式）
            String fileName = dataIn.readUTF();
            long fileLength = dataIn.readLong();
            System.out.println("接收文件：" + fileName + "（大小：" + fileLength + "字节）");

            // 2. 接收文件内容（TCP自动处理分片、重传、排序，体现“可靠传输”）
            FileOutputStream fileOut = new FileOutputStream("tcp_" + fileName);
            byte[] buf = new byte[1024];
            int bytesRead;
            long totalRead = 0;
            while (totalRead < fileLength && (bytesRead = in.read(buf)) != -1) {
                fileOut.write(buf, 0, bytesRead);
                totalRead += bytesRead;
            }
            fileOut.close();
            System.out.println("TCP文件接收完成（完整度：100%）");

        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try {
                socket.close(); // 四次挥手关闭连接
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}
```

##### UDPServer.java（UDP 不可靠传输，对应 “UDP 无连接、不可靠” 特性）

java

```java
package server;

import common.Frame;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.io.FileOutputStream;
import java.util.HashMap;
import java.util.Map;

public class UDPServer {
    private static final int PORT = 8889;
    private static final int BUFFER_SIZE = 1024;

    public void start() throws Exception {
        try (DatagramSocket socket = new DatagramSocket(PORT)) {
            System.out.println("UDP服务器启动，端口：" + PORT + "（基于UDP不可靠传输）");
            byte[] buf = new byte[BUFFER_SIZE];
            Map<Byte, Frame> receivedFrames = new HashMap<>(); // 缓存接收的帧
            String fileName = null;
            int totalFrames = -1;
            int receivedCount = 0;

            while (true) {
                // 接收UDP数据报（无连接，直接接收）
                DatagramPacket packet = new DatagramPacket(buf, buf.length);
                socket.receive(packet);
                Frame frame = Frame.fromBytes(packet.getData());

                if (frame == null || !frame.isValid()) {
                    System.out.println("收到无效帧，丢弃");
                    continue;
                }

                // 首帧传输文件名和总帧数（约定：seq=0为控制帧）
                if (frame.getSeq() == 0) {
                    String[] info = new String(frame.getData()).split(",");
                    fileName = info[0];
                    totalFrames = Integer.parseInt(info[1]);
                    System.out.println("接收文件：" + fileName + "（总帧数：" + totalFrames + "）");
                    continue;
                }

                // 普通数据帧（UDP可能丢包或乱序，此处简单缓存）
                if (!receivedFrames.containsKey(frame.getSeq())) {
                    receivedFrames.put(frame.getSeq(), frame);
                    receivedCount++;
                    System.out.println("收到帧 " + frame.getSeq() + "（已收：" + receivedCount + "/" + totalFrames + "）");
                }

                // 所有帧接收完成（实际中可能永远收不全，体现UDP不可靠）
                if (receivedCount == totalFrames) {
                    System.out.println("UDP文件接收完成（完整度：" + (receivedCount * 100.0 / totalFrames) + "%）");
                    saveUDPFile(fileName, receivedFrames, totalFrames);
                    break;
                }
            }
        }
    }

    // 合并帧并保存文件
    private void saveUDPFile(String fileName, Map<Byte, Frame> frames, int totalFrames) throws Exception {
        try (FileOutputStream out = new FileOutputStream("udp_" + fileName)) {
            for (byte i = 1; i <= totalFrames; i++) {
                Frame frame = frames.get(i);
                if (frame != null) {
                    out.write(frame.getData());
                } else {
                    System.out.println("帧 " + i + " 丢失（UDP不可靠导致）");
                }
            }
        }
    }
}
```

##### StopWaitServer.java（停止等待协议，对应 “停止等待协议” 知识点）

java

```java
package server;

import common.Frame;
import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.io.FileOutputStream;

public class StopWaitServer {
    private static final int PORT = 8890;
    private static final int BUFFER_SIZE = 1024;

    public void start() throws Exception {
        try (DatagramSocket socket = new DatagramSocket(PORT)) {
            System.out.println("停止等待协议服务器启动，端口：" + PORT + "（基于UDP的可靠传输）");
            byte[] buf = new byte[BUFFER_SIZE];
            FileOutputStream fileOut = null;
            byte expectedSeq = 1; // 期望接收的下一个序列号
            boolean isFirstFrame = true;
            String fileName = null;

            while (true) {
                // 1. 接收帧（停止等待：一次只处理一帧）
                DatagramPacket receivePacket = new DatagramPacket(buf, buf.length);
                socket.receive(receivePacket);
                Frame frame = Frame.fromBytes(receivePacket.getData());

                // 校验帧有效性
                if (frame == null || !frame.isValid()) {
                    System.out.println("帧无效，请求重传");
                    sendAck(socket, receivePacket.getAddress(), receivePacket.getPort(), expectedSeq - 1);
                    continue;
                }

                // 首帧获取文件名
                if (isFirstFrame) {
                    fileName = new String(frame.getData());
                    fileOut = new FileOutputStream("stopwait_" + fileName);
                    isFirstFrame = false;
                    expectedSeq = 1; // 数据帧从1开始
                    sendAck(socket, receivePacket.getAddress(), receivePacket.getPort(), (byte) 0); // 确认控制帧
                    continue;
                }

                // 2. 检查序列号（按序接收）
                if (frame.getSeq() != expectedSeq) {
                    System.out.println("帧失序（期望：" + expectedSeq + "，实际：" + frame.getSeq() + "），重发ACK");
                    sendAck(socket, receivePacket.getAddress(), receivePacket.getPort(), expectedSeq - 1);
                    continue;
                }

                // 3. 处理有效帧
                System.out.println("收到帧 " + frame.getSeq() + "，保存数据");
                fileOut.write(frame.getData());

                // 4. 发送ACK（确认已收到，允许发送下一帧）
                sendAck(socket, receivePacket.getAddress(), receivePacket.getPort(), expectedSeq);
                expectedSeq++;

                // 5. 结束条件（约定：数据长度为0的帧表示结束）
                if (frame.getData().length == 0) {
                    System.out.println("停止等待协议文件接收完成（完整度：100%）");
                    fileOut.close();
                    break;
                }
            }
        }
    }

    // 发送确认帧（ACK=期望的下一个序列号）
    private void sendAck(DatagramSocket socket, java.net.InetAddress clientAddr, int clientPort, byte ackSeq) throws Exception {
        byte[] ackData = {ackSeq};
        DatagramPacket ackPacket = new DatagramPacket(ackData, ackData.length, clientAddr, clientPort);
        socket.send(ackPacket);
        System.out.println("发送ACK：" + ackSeq + "\n");
    }
}
```

#### 3. 客户端（提供协议选择与传输控制）

##### Client.java（客户端主界面）

java

```java
package client;

import java.util.Scanner;

public class Client {
    private static final String SERVER_IP = "127.0.0.1";

    public static void main(String[] args) throws Exception {
        Scanner scanner = new Scanner(System.in);
        System.out.println("===== 多协议文件传输工具 =====");
        System.out.println("1. TCP传输（可靠，适合大文件）");
        System.out.println("2. UDP传输（不可靠，适合实时数据）");
        System.out.println("3. 停止等待协议传输（可靠，基于UDP）");
        System.out.print("选择传输协议（1-3）：");
        int choice = scanner.nextInt();
        scanner.nextLine(); // 消费换行
        System.out.print("输入要传输的文件路径：");
        String filePath = scanner.nextLine();

        // 根据选择启动对应客户端
        switch (choice) {
            case 1:
                TCPClient tcpClient = new TCPClient(SERVER_IP, 8888);
                tcpClient.sendFile(filePath);
                break;
            case 2:
                UDPClient udpClient = new UDPClient(SERVER_IP, 8889);
                udpClient.sendFile(filePath);
                break;
            case 3:
                StopWaitClient swClient = new StopWaitClient(SERVER_IP, 8890);
                swClient.sendFile(filePath);
                break;
            default:
                System.out.println("无效选择");
        }
        scanner.close();
    }
}
```

### 关键知识点对应与项目解释

#### 1. 协议特性对比（核心价值）

| 协议                | 可靠性       | 连接性   | 效率           | 项目中体现                         | 对应课程知识点                   |
| ------------------- | ------------ | -------- | -------------- | ---------------------------------- | -------------------------------- |
| TCP                 | 可靠（100%） | 面向连接 | 中（有开销）   | 文件完整，自动重传丢失分片         | TCP 三次握手、滑动窗口、超时重传 |
| UDP                 | 不可靠       | 无连接   | 高（低开销）   | 可能丢包导致文件损坏，无重传机制   | UDP 无连接、不可靠传输           |
| 停止等待协议（UDP） | 可靠（100%） | 无连接   | 低（单帧传输） | 按序传输，超时重传丢失帧，文件完整 | 停止等待协议、超时重传、确认机制 |

#### 2. 核心机制解析

- **TCP 的可靠传输**：项目中 TCPServer/TCPClient 通过 Java 的`Socket`实现，底层自动完成三次握手建立连接、滑动窗口控制流量、超时重传丢失数据，最终保证文件 100% 完整（对应 “TCP 服务模型” 中 “可靠传输四大机制”）。
- **UDP 的不可靠性**：UDPServer 接收的帧可能丢失（`receivedFrames`中存在缺失的序列号），导致保存的文件损坏（对应 “UDP 服务模型” 中 “不保证到达性”）。
- **停止等待协议的可靠性**：StopWaitClient 发送一帧后必须等待 ACK 才能发送下一帧，超时未收到 ACK 则重传（体现 “发送一帧→等确认→再发下一帧” 逻辑，对应 “停止等待协议” 知识点）。
- **CRC 错误检测**：所有基于 UDP 的帧都通过`CRCUtil`计算校验码，接收方验证`isValid()`，体现 “循环冗余校验（CRC）” 的错误检测能力（对应 “错误检测” 知识点）。

### 运行与验证方法

1. 启动服务器

   ：先运行

   ```
   Main.java
   ```

   启动所有服务器（或分别启动

   ```
   TCPServer
   ```

   、

   ```
   UDPServer
   ```

   、

   ```
   StopWaitServer
   ```

   ）。

   java

   

   运行

   

   ```java
   // Main.java
   public class Main {
       public static void main(String[] args) throws Exception {
           new server.TCPServer().start();       // 启动TCP服务器
           // new server.UDPServer().start();   // 启动UDP服务器
           // new server.StopWaitServer().start(); // 启动停止等待服务器
       }
   }
   ```
   
2. **运行客户端**：执行`client.Client`，选择协议并输入文件路径（如`test.txt`）。

3. 观察结果

   ：

   - TCP 传输：服务器生成`tcp_test.txt`，与原文件完全一致。
   - UDP 传输：服务器生成`udp_test.txt`，可能因丢包导致内容缺失。
   - 停止等待传输：服务器生成`stopwait_test.txt`，与原文件完全一致，但传输耗时最长（因单帧传输机制）。

### 项目扩展建议

- 增加 “滑动窗口 GBN 协议” 传输方式，对比与停止等待协议的效率差异。
- 加入传输时间统计，量化不同协议的效率（如 TCP 耗时 < 停止等待耗时）。
- 模拟网络丢包（在客户端随机不发送部分帧），观察各协议的容错表现。

通过该项目，可直观理解传输层协议的设计权衡（可靠性 vs 效率），将课程中的抽象理论转化为可感知的实践效果。

以下是**精简版多协议文件传输工具**，合并冗余类、简化逻辑，保留核心功能（TCP/UDP/ 停止等待协议传输），代码量减少 50%，仍完整对应传输层核心知识点。

### 精简版核心代码（合并为 3 个文件）

#### 1. 公共工具类（ProtocolUtil.java）

整合帧结构、CRC 校验、文件读写，简化冗余逻辑。

java











```java
import java.io.*;
import java.util.zip.CRC32;

/**
 * 公共工具类：帧结构+CRC校验+文件工具
 */
public class ProtocolUtil {
    // 数据帧：序列号(1字节)+CRC(4字节)+数据(最大1020字节)
    public static class Frame {
        public byte seq;       // 序列号
        public long crc;       // CRC校验码
        public byte[] data;    // 数据

        public Frame(byte seq, byte[] data) {
            this.seq = seq;
            this.data = data;
            this.crc = calcCRC(seq, data); // 计算CRC(含序列号+数据)
        }

        // 从字节数组解析帧
        public static Frame fromBytes(byte[] bytes) {
            if (bytes.length < 5) return null; // 1(seq)+4(crc)+数据
            byte seq = bytes[0];
            long crc = ((bytes[1] & 0xFFL) << 24) | ((bytes[2] & 0xFFL) << 16) 
                    | ((bytes[3] & 0xFFL) << 8) | (bytes[4] & 0xFFL);
            byte[] data = new byte[bytes.length - 5];
            System.arraycopy(bytes, 5, data, 0, data.length);
            return new Frame(seq, data, crc);
        }

        // 带CRC的构造函数(解析用)
        private Frame(byte seq, byte[] data, long crc) {
            this.seq = seq;
            this.data = data;
            this.crc = crc;
        }

        // 转为字节数组(网络传输用)
        public byte[] toBytes() {
            byte[] frame = new byte[5 + data.length]; // 1+4+数据
            frame[0] = seq;
            frame[1] = (byte) (crc >> 24);
            frame[2] = (byte) (crc >> 16);
            frame[3] = (byte) (crc >> 8);
            frame[4] = (byte) crc;
            System.arraycopy(data, 0, frame, 5, data.length);
            return frame;
        }

        // 校验帧有效性(CRC匹配)
        public boolean isValid() {
            return calcCRC(seq, data) == crc;
        }

        // 计算CRC(基于CRC32，对应课程"错误检测"知识点)
        private long calcCRC(byte seq, byte[] data) {
            CRC32 crc32 = new CRC32();
            crc32.update(seq);
            crc32.update(data);
            return crc32.getValue();
        }
    }

    // 读取文件为字节数组
    public static byte[] readFile(String path) throws IOException {
        File file = new File(path);
        try (FileInputStream in = new FileInputStream(file)) {
            byte[] data = new byte[(int) file.length()];
            in.read(data);
            return data;
        }
    }

    // 保存字节数组为文件
    public static void saveFile(byte[] data, String prefix, String fileName) throws IOException {
        String[] parts = fileName.split("/");
        String name = parts[parts.length - 1]; // 提取文件名
        try (FileOutputStream out = new FileOutputStream(prefix + "_" + name)) {
            out.write(data);
        }
    }
}
```

#### 2. 服务器类（FileServer.java）

合并 TCP/UDP/ 停止等待协议服务器，用线程区分不同服务。

java











```java
import java.net.*;
import java.io.*;
import java.util.HashMap;
import java.util.Map;

/**
 * 多协议文件服务器：同时支持TCP/UDP/停止等待协议
 */
public class FileServer {
    private static final int TCP_PORT = 8888;
    private static final int UDP_PORT = 8889;
    private static final int STOPWAIT_PORT = 8890;
    private static final int BUFFER_SIZE = 1024;

    public static void main(String[] args) {
        // 启动TCP服务器(可靠传输)
        new Thread(() -> startTCPServer()).start();
        // 启动UDP服务器(不可靠传输)
        new Thread(() -> startUDPServer()).start();
        // 启动停止等待协议服务器(基于UDP的可靠传输)
        new Thread(() -> startStopWaitServer()).start();
        System.out.println("所有服务器启动完成(TCP:" + TCP_PORT + ", UDP:" + UDP_PORT + ", 停止等待:" + STOPWAIT_PORT + ")");
    }

    // ------------------------------ TCP服务器(对应"TCP可靠传输"知识点) ------------------------------
    private static void startTCPServer() {
        try (ServerSocket serverSocket = new ServerSocket(TCP_PORT)) {
            while (true) {
                Socket clientSocket = serverSocket.accept(); // 三次握手建立连接
                new Thread(() -> handleTCP(clientSocket)).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private static void handleTCP(Socket socket) {
        try (DataInputStream in = new DataInputStream(socket.getInputStream())) {
            // 读取文件名和数据
            String fileName = in.readUTF();
            int fileLen = in.readInt();
            byte[] fileData = new byte[fileLen];
            in.readFully(fileData); // TCP保证完整接收(滑动窗口+重传)

            ProtocolUtil.saveFile(fileData, "tcp", fileName);
            System.out.println("TCP接收完成：" + fileName + "（完整度100%）");
        } catch (IOException e) {
            e.printStackTrace();
        } finally {
            try { socket.close(); } catch (IOException e) {} // 四次挥手关闭
        }
    }

    // ------------------------------ UDP服务器(对应"UDP不可靠传输"知识点) ------------------------------
    private static void startUDPServer() {
        try (DatagramSocket socket = new DatagramSocket(UDP_PORT)) {
            byte[] buf = new byte[BUFFER_SIZE];
            Map<Byte, ProtocolUtil.Frame> frames = new HashMap<>();
            String fileName = null;
            int totalFrames = -1;
            int received = 0;

            while (true) {
                DatagramPacket packet = new DatagramPacket(buf, buf.length);
                socket.receive(packet); // 无连接，直接接收数据报
                ProtocolUtil.Frame frame = ProtocolUtil.Frame.fromBytes(packet.getData());

                if (frame == null || !frame.isValid()) {
                    System.out.println("UDP无效帧，丢弃");
                    continue;
                }

                // 首帧(seq=0)：文件名+总帧数
                if (frame.seq == 0) {
                    String[] info = new String(frame.data).split(",");
                    fileName = info[0];
                    totalFrames = Integer.parseInt(info[1]);
                    System.out.println("UDP开始接收：" + fileName + "（总帧数：" + totalFrames + "）");
                    continue;
                }

                // 数据帧：可能丢包/乱序，仅缓存未接收的帧
                if (!frames.containsKey(frame.seq)) {
                    frames.put(frame.seq, frame);
                    received++;
                    System.out.println("UDP收到帧" + frame.seq + "（已收" + received + "/" + totalFrames + "）");
                }

                // 尝试合并(可能永远收不全，体现UDP不可靠)
                if (received == totalFrames) {
                    byte[] fileData = mergeFrames(frames, totalFrames);
                    ProtocolUtil.saveFile(fileData, "udp", fileName);
                    System.out.println("UDP接收完成（完整度：" + (received * 100.0 / totalFrames) + "%）");
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 合并UDP帧(丢失的帧会导致数据不完整)
    private static byte[] mergeFrames(Map<Byte, ProtocolUtil.Frame> frames, int total) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (byte i = 1; i <= total; i++) {
            ProtocolUtil.Frame frame = frames.get(i);
            if (frame != null) out.write(frame.data);
            else System.out.println("UDP帧" + i + "丢失（数据不完整）");
        }
        return out.toByteArray();
    }

    // ------------------------------ 停止等待协议服务器(对应"停止等待协议"知识点) ------------------------------
    private static void startStopWaitServer() {
        try (DatagramSocket socket = new DatagramSocket(STOPWAIT_PORT)) {
            byte[] buf = new byte[BUFFER_SIZE];
            ByteArrayOutputStream fileOut = new ByteArrayOutputStream();
            byte expectedSeq = 1; // 期望的下一个序列号
            String fileName = null;
            boolean isFirst = true;

            while (true) {
                // 1. 接收帧(一次只处理一帧)
                DatagramPacket packet = new DatagramPacket(buf, buf.length);
                socket.receive(packet);
                ProtocolUtil.Frame frame = ProtocolUtil.Frame.fromBytes(packet.getData());

                // 校验帧有效性
                if (frame == null || !frame.isValid()) {
                    sendAck(socket, packet, expectedSeq - 1); // 请求重传
                    continue;
                }

                // 首帧(seq=0)：文件名
                if (isFirst) {
                    fileName = new String(frame.data);
                    isFirst = false;
                    sendAck(socket, packet, (byte) 0); // 确认控制帧
                    continue;
                }

                // 2. 检查序列号(必须按序接收)
                if (frame.seq != expectedSeq) {
                    sendAck(socket, packet, expectedSeq - 1); // 重发上一个ACK
                    continue;
                }

                // 3. 处理数据(帧有效且有序)
                fileOut.write(frame.data);
                System.out.println("停止等待收到帧" + frame.seq);

                // 4. 发送ACK(允许客户端发下一帧)
                sendAck(socket, packet, expectedSeq);
                expectedSeq++;

                // 5. 结束条件：数据长度为0的帧
                if (frame.data.length == 0) {
                    ProtocolUtil.saveFile(fileOut.toByteArray(), "stopwait", fileName);
                    System.out.println("停止等待接收完成（完整度100%）");
                    break;
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // 发送确认帧(ACK=期望的下一个序列号)
    private static void sendAck(DatagramSocket socket, DatagramPacket packet, byte ackSeq) throws IOException {
        DatagramPacket ack = new DatagramPacket(
            new byte[]{ackSeq}, 1,
            packet.getAddress(), packet.getPort()
        );
        socket.send(ack);
        System.out.println("发送ACK：" + ackSeq);
    }
}
```

#### 3. 客户端类（FileClient.java）

支持选择协议，简化文件发送逻辑。

java











```java
import java.net.*;
import java.io.*;
import java.util.Scanner;

/**
 * 多协议文件客户端：支持TCP/UDP/停止等待协议
 */
public class FileClient {
    private static final String SERVER_IP = "127.0.0.1";
    private static final int TCP_PORT = 8888;
    private static final int UDP_PORT = 8889;
    private static final int STOPWAIT_PORT = 8890;
    private static final int FRAME_SIZE = 1020; // 每帧数据最大长度

    public static void main(String[] args) throws Exception {
        Scanner sc = new Scanner(System.in);
        System.out.println("===== 精简版多协议文件传输 =====");
        System.out.println("1. TCP传输(可靠)  2. UDP传输(不可靠)  3. 停止等待传输(可靠)");
        System.out.print("选择协议(1-3)：");
        int choice = sc.nextInt();
        sc.nextLine(); // 消费换行
        System.out.print("输入文件路径：");
        String filePath = sc.nextLine();
        sc.close();

        byte[] fileData = ProtocolUtil.readFile(filePath);
        String fileName = new File(filePath).getName();

        // 选择协议发送
        switch (choice) {
            case 1:
                sendTCP(fileName, fileData);
                break;
            case 2:
                sendUDP(fileName, fileData);
                break;
            case 3:
                sendStopWait(fileName, fileData);
                break;
            default:
                System.out.println("无效选择");
        }
    }

    // ------------------------------ TCP发送(对应"TCP面向连接"知识点) ------------------------------
    private static void sendTCP(String fileName, byte[] data) throws IOException {
        try (Socket socket = new Socket(SERVER_IP, TCP_PORT); // 三次握手
             DataOutputStream out = new DataOutputStream(socket.getOutputStream())) {
            // 发送文件名+长度+数据(TCP自动分片/重传)
            out.writeUTF(fileName);
            out.writeInt(data.length);
            out.write(data);
            System.out.println("TCP发送完成(依赖底层可靠传输)");
        }
    }

    // ------------------------------ UDP发送(对应"UDP无连接"知识点) ------------------------------
    private static void sendUDP(String fileName, byte[] data) throws IOException {
        try (DatagramSocket socket = new DatagramSocket()) {
            InetAddress serverAddr = InetAddress.getByName(SERVER_IP);
            // 1. 发送首帧(seq=0)：文件名+总帧数
            int totalFrames = (data.length + FRAME_SIZE - 1) / FRAME_SIZE; // 向上取整
            byte[] info = (fileName + "," + totalFrames).getBytes();
            ProtocolUtil.Frame infoFrame = new ProtocolUtil.Frame((byte) 0, info);
            socket.send(new DatagramPacket(
                infoFrame.toBytes(), infoFrame.toBytes().length,
                serverAddr, UDP_PORT
            ));

            // 2. 发送数据帧(seq=1~totalFrames)
            for (byte i = 1; i <= totalFrames; i++) {
                int start = (i - 1) * FRAME_SIZE;
                int len = Math.min(FRAME_SIZE, data.length - start);
                byte[] frameData = new byte[len];
                System.arraycopy(data, start, frameData, 0, len);

                ProtocolUtil.Frame frame = new ProtocolUtil.Frame(i, frameData);
                socket.send(new DatagramPacket(
                    frame.toBytes(), frame.toBytes().length,
                    serverAddr, UDP_PORT
                ));
                System.out.println("UDP发送帧" + i);
            }
            System.out.println("UDP发送完成(可能丢包，不保证到达)");
        }
    }

    // ------------------------------ 停止等待协议发送(对应"停止等待超时重传"知识点) ------------------------------
    private static void sendStopWait(String fileName, byte[] data) throws Exception {
        try (DatagramSocket socket = new DatagramSocket()) {
            InetAddress serverAddr = InetAddress.getByName(SERVER_IP);
            byte[] buf = new byte[1]; // 接收ACK的缓冲区
            int timeout = 1000; // 超时时间1秒
            socket.setSoTimeout(timeout);

            // 1. 发送首帧(seq=0)：文件名
            ProtocolUtil.Frame infoFrame = new ProtocolUtil.Frame((byte) 0, fileName.getBytes());
            sendAndWaitAck(socket, serverAddr, infoFrame, (byte) 0);

            // 2. 分片发送数据帧(seq=1,2...)，每帧等待ACK
            int totalFrames = (data.length + FRAME_SIZE - 1) / FRAME_SIZE;
            for (byte seq = 1; seq <= totalFrames; seq++) {
                int start = (seq - 1) * FRAME_SIZE;
                int len = Math.min(FRAME_SIZE, data.length - start);
                byte[] frameData = new byte[len];
                System.arraycopy(data, start, frameData, 0, len);

                ProtocolUtil.Frame frame = new ProtocolUtil.Frame(seq, frameData);
                sendAndWaitAck(socket, serverAddr, frame, seq);
            }

            // 3. 发送结束帧(seq=totalFrames+1，数据长度0)
            ProtocolUtil.Frame endFrame = new ProtocolUtil.Frame((byte) (totalFrames + 1), new byte[0]);
            sendAndWaitAck(socket, serverAddr, endFrame, (byte) (totalFrames + 1));
            System.out.println("停止等待发送完成(每帧确认，保证可靠)");
        }
    }

    // 发送帧并等待ACK，超时则重传
    private static void sendAndWaitAck(DatagramSocket socket, InetAddress addr, 
                                      ProtocolUtil.Frame frame, byte expectedAck) throws Exception {
        while (true) {
            // 发送帧
            socket.send(new DatagramPacket(
                frame.toBytes(), frame.toBytes().length,
                addr, STOPWAIT_PORT
            ));
            System.out.println("发送帧" + frame.seq + "，等待ACK=" + expectedAck);

            // 等待ACK
            DatagramPacket ackPacket = new DatagramPacket(new byte[1], 1);
            try {
                socket.receive(ackPacket);
                byte ack = ackPacket.getData()[0];
                if (ack == expectedAck) {
                    System.out.println("收到ACK=" + ack);
                    return; // ACK正确，继续下一帧
                }
            } catch (SocketTimeoutException e) {
                System.out.println("超时，重传帧" + frame.seq);
            }
        }
    }
}
```

### 精简说明与知识点对应

#### 1. 精简优化

- **类结构合并**：将原项目的`Frame.java`/`CRCUtil.java`/`FileUtil.java`合并为`ProtocolUtil.java`，减少文件数量。
- **逻辑简化**：去掉冗余的异常处理和类层次，保留核心流程（如 TCP 直接用`DataInputStream`/`DataOutputStream`传输，UDP 帧合并用`ByteArrayOutputStream`）。
- **代码压缩**：合并重复的发送 / 接收逻辑，用循环和方法复用减少冗余（如停止等待协议的`sendAndWaitAck`方法）。

#### 2. 核心知识点对应

| 协议 / 机制    | 代码体现                                  | 课程知识点                       |
| -------------- | ----------------------------------------- | -------------------------------- |
| TCP 可靠传输   | `Socket`建立连接，`readFully`保证完整接收 | TCP 三次握手、滑动窗口、重传机制 |
| UDP 不可靠传输 | 直接发送`DatagramPacket`，可能丢包        | UDP 无连接、数据报服务、无重传   |
| 停止等待协议   | 每帧发送后等待 ACK，超时重传              | 停止等待的 “发一帧等确认” 机制   |
| CRC 错误检测   | `Frame.isValid()`校验 CRC 匹配            | 循环冗余校验（CRC）错误检测原理  |

#### 3. 运行与对比

1. 先启动`FileServer`（同时启动三个协议的服务）。
2. 运行`FileClient`，选择协议并输入文件路径（如`test.txt`）。
3. 观察结果：
   - TCP：生成`tcp_test.txt`，与原文件完全一致（可靠）。
   - UDP：生成`udp_test.txt`，可能因丢包导致内容缺失（不可靠）。
   - 停止等待：生成`stopwait_test.txt`，完整但传输最慢（可靠但效率低）。

该精简版保留核心功能和知识点对应，代码更易阅读和运行，适合快速理解不同传输层协议的特性差异。
