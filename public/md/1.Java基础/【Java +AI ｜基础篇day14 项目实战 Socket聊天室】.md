##### 15💬 Java Day14 - 项目实战：Socket 聊天室

> 💡 **核心提示**：通过 Socket 聊天室项目，综合运用网络编程、多线程、IO 流等知识，实现一个支持多客户端的实时聊天系统。

---

#### 快速回顾

- **项目目标**：实现一个基于 TCP 的多人聊天室
- **核心功能**：用户登录、群聊、私聊、在线用户列表
- **技术要点**：Socket 通信、多线程处理、并发集合、消息协议设计
- **架构设计**：C/S 架构，服务器转发消息，客户端收发分离

---

#### 目录

- [一、项目架构设计](#一项目架构设计)
  - [1. 系统架构](#1-系统架构)
  - [2. 通信协议设计](#2-通信协议设计)
- [二、服务器端实现](#二服务器端实现)
  - [1. 聊天服务器](#1-聊天服务器)
  - [2. 客户端处理器](#2-客户端处理器)
- [三、客户端实现](#三客户端实现)
  - [1. 聊天客户端](#1-聊天客户端)
- [四、功能说明](#四功能说明)
  - [1. 命令列表](#1-命令列表)
  - [2. 消息流程](#2-消息流程)
- [五、代码优化建议](#五代码优化建议)
  - [1. 心跳机制](#1-心跳机制)
  - [2. 消息历史记录](#2-消息历史记录)
  - [3. 用户认证](#3-用户认证)
- [问答](#问答)

---

#### 详细内容

##### 一、项目架构设计

#### 1. 系统架构

```
聊天室系统
├── 服务器端
│   ├── ChatServer（主服务器，监听连接）
│   ├── ClientHandler（客户端处理器）
│   └── UserManager（用户管理）
└── 客户端
    ├── ChatClient（主程序）
    ├── Sender（消息发送线程）
    └── Receiver（消息接收线程）
```

#### 2. 通信协议设计

```java
// 消息类型枚举
public enum MessageType {
    LOGIN,      // 登录
    LOGOUT,     // 登出
    CHAT,       // 群聊
    PRIVATE,    // 私聊
    USER_LIST,  // 用户列表
    SYSTEM      // 系统消息
}

// 消息类
public class Message implements Serializable {
    private MessageType type;
    private String from;      // 发送者
    private String to;        // 接收者（私聊用）
    private String content;   // 内容
    private long timestamp;   // 时间戳
    
    // 构造器、getter、setter 省略
}
```

---

##### 二、服务器端实现

#### 1. 聊天服务器

```java
import java.io.*;
import java.net.*;
import java.util.concurrent.*;

public class ChatServer {
    private static final int PORT = 8888;
    private ServerSocket serverSocket;
    // 存储在线客户端：用户名 -> ClientHandler
    private static ConcurrentHashMap<String, ClientHandler> clients = 
        new ConcurrentHashMap<>();
    
    public void start() {
        try {
            serverSocket = new ServerSocket(PORT);
            System.out.println("聊天服务器启动，端口：" + PORT);
            
            while (true) {
                Socket socket = serverSocket.accept();
                System.out.println("新客户端连接：" + socket.getInetAddress());
                
                // 为每个客户端创建处理器
                ClientHandler handler = new ClientHandler(socket);
                new Thread(handler).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    // 广播消息给所有客户端
    public static void broadcast(Message message) {
        clients.values().forEach(handler -> handler.sendMessage(message));
    }
    
    // 发送私信
    public static void sendPrivate(Message message) {
        ClientHandler handler = clients.get(message.getTo());
        if (handler != null) {
            handler.sendMessage(message);
            // 同时发送给发送者
            clients.get(message.getFrom()).sendMessage(message);
        }
    }
    
    // 添加客户端
    public static void addClient(String username, ClientHandler handler) {
        clients.put(username, handler);
        // 通知所有人有新用户加入
        broadcast(new Message(MessageType.SYSTEM, "系统", null, 
            username + " 加入了聊天室"));
        // 发送用户列表
        sendUserList();
    }
    
    // 移除客户端
    public static void removeClient(String username) {
        clients.remove(username);
        broadcast(new Message(MessageType.SYSTEM, "系统", null, 
            username + " 离开了聊天室"));
        sendUserList();
    }
    
    // 发送用户列表
    public static void sendUserList() {
        String userList = String.join(",", clients.keySet());
        Message message = new Message(MessageType.USER_LIST, "系统", null, userList);
        clients.values().forEach(handler -> handler.sendMessage(message));
    }
    
    public static void main(String[] args) {
        new ChatServer().start();
    }
}
```

#### 2. 客户端处理器

```java
public class ClientHandler implements Runnable {
    private Socket socket;
    private ObjectInputStream in;
    private ObjectOutputStream out;
    private String username;
    private boolean running = true;
    
    public ClientHandler(Socket socket) {
        this.socket = socket;
    }
    
    @Override
    public void run() {
        try {
            out = new ObjectOutputStream(socket.getOutputStream());
            in = new ObjectInputStream(socket.getInputStream());
            
            // 处理登录
            while (username == null) {
                Message loginMsg = (Message) in.readObject();
                if (loginMsg.getType() == MessageType.LOGIN) {
                    String proposedName = loginMsg.getFrom();
                    if (ChatServer.clients.containsKey(proposedName)) {
                        sendMessage(new Message(MessageType.SYSTEM, "系统", null, 
                            "用户名已存在"));
                    } else {
                        username = proposedName;
                        ChatServer.addClient(username, this);
                        sendMessage(new Message(MessageType.SYSTEM, "系统", null, 
                            "登录成功"));
                    }
                }
            }
            
            // 处理消息
            while (running) {
                Message message = (Message) in.readObject();
                handleMessage(message);
            }
        } catch (IOException | ClassNotFoundException e) {
            System.out.println(username + " 断开连接");
        } finally {
            if (username != null) {
                ChatServer.removeClient(username);
            }
            close();
        }
    }
    
    private void handleMessage(Message message) {
        switch (message.getType()) {
            case CHAT:
                // 群聊
                ChatServer.broadcast(message);
                break;
            case PRIVATE:
                // 私聊
                ChatServer.sendPrivate(message);
                break;
            case LOGOUT:
                running = false;
                break;
        }
    }
    
    public void sendMessage(Message message) {
        try {
            out.writeObject(message);
            out.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    
    private void close() {
        try {
            if (in != null) in.close();
            if (out != null) out.close();
            if (socket != null) socket.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

---

##### 三、客户端实现

#### 1. 聊天客户端

```java
import java.io.*;
import java.net.*;
import java.util.Scanner;

public class ChatClient {
    private static final String SERVER_HOST = "127.0.0.1";
    private static final int SERVER_PORT = 8888;
    private Socket socket;
    private ObjectOutputStream out;
    private ObjectInputStream in;
    private String username;
    private boolean running = true;
    
    public void start() {
        try {
            socket = new Socket(SERVER_HOST, SERVER_PORT);
            out = new ObjectOutputStream(socket.getOutputStream());
            in = new ObjectInputStream(socket.getInputStream());
            
            // 登录
            login();
            
            // 启动接收线程
            new Thread(new Receiver()).start();
            
            // 主线程处理输入
            Scanner scanner = new Scanner(System.in);
            while (running) {
                String input = scanner.nextLine();
                handleInput(input);
            }
        } catch (IOException e) {
            System.out.println("连接服务器失败");
        }
    }
    
    private void login() throws IOException {
        Scanner scanner = new Scanner(System.in);
        System.out.print("请输入用户名：");
        username = scanner.nextLine();
        
        // 发送登录消息
        Message loginMsg = new Message(MessageType.LOGIN, username, null, null);
        out.writeObject(loginMsg);
        out.flush();
    }
    
    private void handleInput(String input) throws IOException {
        if (input.startsWith("@")) {
            // 私聊：@用户名 消息内容
            int spaceIndex = input.indexOf(' ');
            if (spaceIndex > 1) {
                String to = input.substring(1, spaceIndex);
                String content = input.substring(spaceIndex + 1);
                Message msg = new Message(MessageType.PRIVATE, username, to, content);
                out.writeObject(msg);
            }
        } else if (input.equalsIgnoreCase("exit")) {
            // 退出
            Message msg = new Message(MessageType.LOGOUT, username, null, null);
            out.writeObject(msg);
            running = false;
        } else {
            // 群聊
            Message msg = new Message(MessageType.CHAT, username, null, input);
            out.writeObject(msg);
        }
        out.flush();
    }
    
    // 接收线程
    private class Receiver implements Runnable {
        @Override
        public void run() {
            try {
                while (running) {
                    Message message = (Message) in.readObject();
                    displayMessage(message);
                }
            } catch (IOException | ClassNotFoundException e) {
                System.out.println("与服务器断开连接");
            }
        }
    }
    
    private void displayMessage(Message message) {
        switch (message.getType()) {
            case CHAT:
                System.out.println("[" + message.getFrom() + "] " + message.getContent());
                break;
            case PRIVATE:
                System.out.println("[私聊 " + message.getFrom() + " -> " + 
                    message.getTo() + "] " + message.getContent());
                break;
            case SYSTEM:
                System.out.println("[系统] " + message.getContent());
                break;
            case USER_LIST:
                System.out.println("[在线用户] " + message.getContent());
                break;
        }
    }
    
    public static void main(String[] args) {
        new ChatClient().start();
    }
}
```

---

##### 四、功能说明

#### 1. 命令列表

| 命令 | 功能 | 示例 |
|------|------|------|
| `@用户名 消息` | 私聊指定用户 | `@张三 你好` |
| `exit` | 退出聊天室 | `exit` |
| 其他文字 | 群聊消息 | `大家好` |

#### 2. 消息流程

```
用户A发送群聊消息
    ↓
服务器接收消息
    ↓
服务器广播给所有在线用户（包括A）
    ↓
所有客户端显示消息

用户A发送私聊消息给B
    ↓
服务器接收消息
    ↓
服务器转发给A和B
    ↓
A和B的客户端显示私聊消息
```

---

##### 五、代码优化建议

#### 1. 心跳机制

```java
// 定期发送心跳包检测连接状态
public class HeartbeatTask implements Runnable {
    @Override
    public void run() {
        while (running) {
            try {
                Thread.sleep(30000);  // 30秒
                sendMessage(new Message(MessageType.HEARTBEAT, username, null, null));
            } catch (InterruptedException e) {
                break;
            }
        }
    }
}
```

#### 2. 消息历史记录

```java
// 服务器保存最近消息
private static LinkedBlockingQueue<Message> history = 
    new LinkedBlockingQueue<>(100);

// 新用户登录时发送历史消息
public static void sendHistory(ClientHandler handler) {
    history.forEach(handler::sendMessage);
}
```

#### 3. 用户认证

```java
// 添加密码验证
public class User {
    private String username;
    private String passwordHash;
    // ...
}

// 登录时验证
private boolean authenticate(String username, String password) {
    User user = userDatabase.get(username);
    return user != null && user.checkPassword(password);
}
```

---

#### 问答

##### Q1：为什么要使用 ConcurrentHashMap 存储客户端？

**答**：
- `ConcurrentHashMap` 是线程安全的哈希表。
- 多个线程可能同时访问和修改客户端集合（新用户登录、用户退出）。
- 使用普通 `HashMap` 需要额外同步，而 `ConcurrentHashMap` 内部已优化。

##### Q2：如何处理客户端异常断开？

**答**：
- 在 `catch` 块中捕获 `IOException`。
- 从客户端集合中移除该用户。
- 广播用户离开消息。
- 关闭相关资源（socket、流）。

##### Q3：为什么使用 ObjectInputStream/ObjectOutputStream？

**答**：
- 可以直接传输 Java 对象，无需手动序列化/反序列化。
- 代码更简洁，类型安全。
- 传输的消息类需要实现 `Serializable` 接口。

##### Q4：如何支持文件传输？

**答**：
- 添加新的消息类型 `FILE`。
- 消息包含文件名、文件大小、文件内容（字节数组）。
- 大文件可以分块传输，避免内存溢出。

```java
public class FileMessage implements Serializable {
    private String filename;
    private long fileSize;
    private byte[] data;
    private int chunkIndex;  // 分块索引
    private int totalChunks; // 总块数
}
```

##### Q5：如何扩展为 Web 聊天室？

**答**：
- 使用 WebSocket 替代 Socket。
- 前端使用 JavaScript WebSocket API。
- 后端可以使用 Java WebSocket（JSR 356）或 Spring WebSocket。
- 添加消息数据库存储（MySQL、MongoDB）。
- 添加 Redis 实现分布式部署。

---

> **学习建议**：本项目综合运用了网络编程、多线程、IO 流等核心知识，是检验 Java 基础的重要实践。建议先理解整体架构，再逐步实现每个功能。可以尝试添加更多功能（如文件传输、表情包、消息记录等），加深理解。
