# Java Swing 银行管理系统开发教程

## 1. 系统概述

### 1.1 项目简介

Java Swing银行管理系统是一个基于Java 8、JDBC、Swing和MySQL技术栈开发的桌面应用程序，旨在提供完整的银行业务处理功能。本系统采用传统的桌面应用架构，支持存款、取款、查询余额、交易历史记录、账户管理、转账等核心功能，同时实现了基于角色的访问控制（RBAC）机制，确保系统安全性和权限管理的有效性。

### 1.2 技术栈选择

| 类别       | 技术  | 版本  | 选型理由                                      |
| ---------- | ----- | ----- | --------------------------------------------- |
| 开发语言   | Java  | 8     | 成熟稳定、跨平台、生态完善、无需额外安装      |
| 数据库连接 | JDBC  | 4.x   | Java标准数据库连接API、无需额外依赖、原生支持 |
| 图形界面   | Swing | 内置  | Java内置GUI框架、无需额外安装、跨平台支持     |
| 数据库     | MySQL | 8.0+  | 可靠性高、性能稳定、适合金融系统              |
| 构建工具   | Maven | 3.8.x | 依赖管理、项目构建标准化                      |

### 1.3 系统架构概览

```mermaid
graph TB
    subgraph 表示层
        A[登录界面 LoginPanel] --> B[主界面 BankMainPanel]
        B --> C[存款面板 DepositPanel]
        B --> D[取款面板 WithdrawPanel]
        B --> E[查询面板 QueryPanel]
        B --> F[交易历史面板 TransactionHistoryPanel]
        B --> G[转账面板 TransferPanel]
        B --> H[账户管理面板 AccountManagementPanel]
        B --> I[报表面板 ReportPanel]
    end
    
    subgraph 业务层
        J[数据访问对象 BankDAO]
    end
    
    subgraph 数据层
        K[(MySQL数据库 bank_db)]
    end
    
    subgraph 工具层
        L[数据库连接 DatabaseConnection]
    end
    
    C --> J
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    J --> L
    L --> K
    
    style A fill:#e1f5fe
    style B fill:#e1f5fe
    style K fill:#4caf50
    style L fill:#ff9800
    style J fill:#9c27b0
```

## 2. 数据库设计

### 2.1 数据库模型设计

#### 2.1.1 实体关系图

```mermaid
erDiagram
    ROLE ||--o{ USER : has
    USER ||--o{ ACCOUNT : owns
    ACCOUNT ||--o{ TRANSACTION : generates
    
    ROLE {
        int role_id
        string role_name
        string role_description
        timestamp created_date
    }
    
    USER {
        int user_id
        string username
        string password
        string full_name
        string email
        string phone
        int role_id
        boolean is_active
        timestamp created_date
        timestamp updated_date
    }
    
    ACCOUNT {
        int account_id
        string account_number
        string account_holder
        decimal balance
        int user_id
        timestamp created_date
        timestamp updated_date
    }
    
    TRANSACTION {
        int transaction_id
        string account_number
        string transaction_type
        decimal amount
        timestamp transaction_date
        string description
    }
```

#### 2.1.2 数据字典

| 表名         | 字段名           | 数据类型      | 约束                                                  | 描述                  |
| ------------ | ---------------- | ------------- | ----------------------------------------------------- | --------------------- |
| roles        | role_id          | INT           | PRIMARY KEY, AUTO_INCREMENT                           | 角色ID                |
| roles        | role_name        | VARCHAR(50)   | UNIQUE, NOT NULL                                      | 角色名称              |
| roles        | role_description | VARCHAR(255)  |                                                       | 角色描述              |
| roles        | created_date     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                             | 创建时间              |
| users        | user_id          | INT           | PRIMARY KEY, AUTO_INCREMENT                           | 用户ID                |
| users        | username         | VARCHAR(50)   | UNIQUE, NOT NULL                                      | 用户名                |
| users        | password         | VARCHAR(255)  | NOT NULL                                              | 密码（BCrypt加密）    |
| users        | full_name        | VARCHAR(100)  | NOT NULL                                              | 用户全名              |
| users        | email            | VARCHAR(100)  |                                                       | 邮箱                  |
| users        | phone            | VARCHAR(20)   |                                                       | 电话                  |
| users        | role_id          | INT           | FOREIGN KEY, NOT NULL                                 | 关联角色ID            |
| users        | is_active        | BOOLEAN       | DEFAULT TRUE                                          | 是否激活              |
| users        | created_date     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                             | 创建时间              |
| users        | updated_date     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间              |
| accounts     | account_id       | INT           | PRIMARY KEY, AUTO_INCREMENT                           | 账户ID                |
| accounts     | account_number   | VARCHAR(20)   | UNIQUE, NOT NULL                                      | 账号                  |
| accounts     | account_holder   | VARCHAR(100)  | NOT NULL                                              | 账户持有人            |
| accounts     | balance          | DECIMAL(10,2) | DEFAULT 0.00                                          | 账户余额              |
| accounts     | user_id          | INT           | FOREIGN KEY                                           | 关联用户ID            |
| accounts     | created_date     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                             | 创建时间              |
| accounts     | updated_date     | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间              |
| transactions | transaction_id   | INT           | PRIMARY KEY, AUTO_INCREMENT                           | 交易ID                |
| transactions | account_number   | VARCHAR(20)   | FOREIGN KEY, NOT NULL                                 | 关联账号              |
| transactions | transaction_type | ENUM          | NOT NULL                                              | 交易类型（存款/取款） |
| transactions | amount           | DECIMAL(10,2) | NOT NULL                                              | 交易金额              |
| transactions | transaction_date | TIMESTAMP     | DEFAULT CURRENT_TIMESTAMP                             | 交易时间              |
| transactions | description      | VARCHAR(255)  |                                                       | 交易描述              |

### 2.2 数据库初始化脚本

```sql
-- 银行管理系统数据库初始化脚本
-- 创建数据库和相关表

-- 创建数据库
CREATE DATABASE IF NOT EXISTS bank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE bank_db;

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    role_description VARCHAR(255),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    role_id INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- 创建账户表
CREATE TABLE IF NOT EXISTS accounts (
    account_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    user_id INT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) NOT NULL,
    transaction_type ENUM('存款', '取款') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    description VARCHAR(255),
    FOREIGN KEY (account_number) REFERENCES accounts(account_number)
);

-- 插入角色数据
INSERT INTO roles (role_name, role_description) VALUES
('ADMIN', '系统管理员'),
('USER', '普通用户');

-- 插入用户数据（密码：admin123, user123）
INSERT INTO users (username, password, full_name, email, phone, role_id) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 'admin@bank.com', '13800138000', 1),
('user1', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '张三', 'zhangsan@bank.com', '13800138001', 2),
('user2', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '李四', 'lisi@bank.com', '13800138002', 2);

-- 插入示例账户数据
INSERT INTO accounts (account_number, account_holder, balance, user_id) VALUES
('6222000000001', '张三', 1000.00, 2),
('6222000000002', '李四', 2500.50, 3),
('6222000000003', '王五', 500.00, NULL);

-- 创建索引以提高查询性能
CREATE INDEX idx_username ON users(username);
CREATE INDEX idx_account_number ON accounts(account_number);
CREATE INDEX idx_transaction_date ON transactions(transaction_date);
CREATE INDEX idx_transaction_account ON transactions(account_number);
CREATE INDEX idx_user_role ON users(role_id);
```

## 3. 系统架构设计

### 3.1 分层架构设计

```mermaid
graph LR
    subgraph 表示层
        A[LoginPanel 登录面板]
        B[BankMainPanel 主面板]
        C[DepositPanel 存款面板]
        D[WithdrawPanel 取款面板]
        E[QueryPanel 查询面板]
        F[TransactionHistoryPanel 交易历史面板]
        G[AccountManagementPanel 账户管理面板]
        H[TransferPanel 转账面板]
        I[ReportPanel 报表面板]
    end
    
    subgraph 业务层
        J[BankDAO 数据访问对象]
    end
    
    subgraph 数据层
        K[(MySQL数据库)]
    end
    
    subgraph 工具层
        L[DatabaseConnection 数据库连接]
        M[UIDesignManager UI设计管理器]
    end
    
    A -->|登录成功| B
    B -->|存款操作| C
    B -->|取款操作| D
    B -->|余额查询| E
    B -->|交易历史| F
    B -->|账户管理| G
    B -->|转账操作| H
    B -->|报表生成| I
    
    C --> J
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    
    J --> L
    L --> K
    
    M --> A
    M --> B
    M --> C
    M --> D
    M --> E
    M --> F
    M --> G
    M --> H
    M --> I
```

### 3.2 组件交互关系图

```mermaid
graph TB
    subgraph 主应用
        APP[BankSystemApp 主应用类]
    end
    
    subgraph 界面组件
        LOGIN[LoginPanel 登录界面]
        MAIN[BankMainPanel 主界面]
        DEPOSIT[DepositPanel 存款]
        WITHDRAW[WithdrawPanel 取款]
        QUERY[QueryPanel 查询]
        HISTORY[TransactionHistoryPanel 交易历史]
        ACCOUNT[AccountManagementPanel 账户管理]
        TRANSFER[TransferPanel 转账]
        REPORT[ReportPanel 报表]
    end
    
    subgraph 数据访问
        DAO[BankDAO 数据访问]
        DB[(MySQL数据库)]
    end
    
    subgraph 工具类
        CONN[DatabaseConnection 连接管理]
    end
    
    APP -->|初始化| LOGIN
    LOGIN -->|登录成功| MAIN
    MAIN -->|包含| DEPOSIT
    MAIN -->|包含| WITHDRAW
    MAIN -->|包含| QUERY
    MAIN -->|包含| HISTORY
    MAIN -->|包含| ACCOUNT
    MAIN -->|包含| TRANSFER
    MAIN -->|包含| REPORT
    
    DEPOSIT --> DAO
    WITHDRAW --> DAO
    QUERY --> DAO
    HISTORY --> DAO
    ACCOUNT --> DAO
    TRANSFER --> DAO
    REPORT --> DAO
    
    DAO --> CONN
    CONN --> DB
```

## 4. 核心类详解

### 4.1 BankSystemApp - 主应用程序类

#### 4.1.1 类功能

`BankSystemApp`是整个银行管理系统的入口类，负责应用程序的初始化、界面切换和窗口管理。它使用`CardLayout`实现登录界面和主界面之间的切换，是整个应用程序的容器。

#### 4.1.2 核心属性

| 属性名     | 类型          | 描述                         |
| ---------- | ------------- | ---------------------------- |
| cardLayout | CardLayout    | 卡片布局管理器，用于界面切换 |
| mainPanel  | JPanel        | 主面板容器，包含所有子面板   |
| loginPanel | LoginPanel    | 登录面板实例                 |
| mainFrame  | BankMainPanel | 主面板实例（登录成功后创建） |

#### 4.1.3 核心方法

| 方法名                   | 参数       | 返回类型 | 描述                     |
| ------------------------ | ---------- | -------- | ------------------------ |
| BankSystemApp()          | 无         | void     | 构造函数，初始化所有组件 |
| initializeComponents()   | 无         | void     | 初始化界面组件           |
| setupLayout()            | 无         | void     | 设置界面布局             |
| setupWindow()            | 无         | void     | 设置窗口属性             |
| showMainFrame(User user) | User对象   | void     | 显示主界面               |
| showLoginPanel()         | 无         | void     | 显示登录界面             |
| createIcon()             | 无         | Image    | 创建应用图标             |
| main(String[] args)      | String数组 | void     | 应用程序入口             |

#### 4.1.4 使用场景

- **应用启动**：程序启动时创建`BankSystemApp`实例，初始化登录界面
- **界面切换**：用户登录成功后，调用`showMainFrame()`方法切换到主界面
- **退出登录**：用户退出时，调用`showLoginPanel()`方法返回登录界面
- **窗口管理**：设置窗口标题、大小、图标等属性

#### 4.1.5 代码示例

```java
package com.bank.ui;

import com.bank.model.User;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;

public class BankSystemApp extends JFrame {
    
    private CardLayout cardLayout;
    private JPanel mainPanel;
    private LoginPanel loginPanel;
    private BankMainPanel mainFrame;
    
    public BankSystemApp() {
        initializeComponents();
        setupLayout();
        setupWindow();
    }
    
    private void initializeComponents() {
        cardLayout = new CardLayout();
        mainPanel = new JPanel(cardLayout);
        
        loginPanel = new LoginPanel();
        loginPanel.setLoginSuccessListener(new LoginPanel.LoginSuccessListener() {
            @Override
            public void onLoginSuccess(User user) {
                showMainFrame(user);
            }
        });
        
        mainFrame = null;
    }
    
    private void setupLayout() {
        setLayout(new BorderLayout());
        mainPanel.add(loginPanel, "LOGIN");
        add(mainPanel, BorderLayout.CENTER);
    }
    
    private void setupWindow() {
        setTitle("银行管理系统 - 登录");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setSize(900, 700);
        setLocationRelativeTo(null);
        setResizable(true);
        setIconImage(createIcon());
    }
    
    private void showMainFrame(User user) {
        if (mainFrame == null) {
            mainFrame = new BankMainPanel(user);
        }
        mainPanel.add(mainFrame, "MAIN");
        cardLayout.show(mainPanel, "MAIN");
        setTitle("银行管理系统 - 欢迎，" + user.getFullName() + " (" + user.getRoleName() + ")");
    }
    
    private void showLoginPanel() {
        cardLayout.show(mainPanel, "LOGIN");
        loginPanel.setInitialFocus();
        setTitle("银行管理系统 - 登录");
    }
    
    private Image createIcon() {
        try {
            BufferedImage icon = new BufferedImage(32, 32, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = icon.createGraphics();
            g2d.setColor(new Color(0, 82, 163));
            g2d.fillRect(0, 0, 32, 32);
            g2d.setColor(new Color(255, 215, 0));
            g2d.fillRect(8, 8, 16, 16);
            g2d.setColor(Color.WHITE);
            g2d.fillRect(12, 12, 8, 8);
            g2d.setColor(new Color(139, 69, 19));
            g2d.drawRect(11, 11, 10, 10);
            g2d.dispose();
            return icon;
        } catch (Exception e) {
            return null;
        }
    }
    
    public static void main(String[] args) {
        try {
            UIManager.setLookAndFeel("javax.swing.plaf.metal.MetalLookAndFeel");
        } catch (Exception e) {
            System.err.println("无法设置系统外观，使用默认外观: " + e.getMessage());
        }
        
        SwingUtilities.invokeLater(() -> {
            try {
                BankSystemApp app = new BankSystemApp();
                app.setVisible(true);
                SwingUtilities.invokeLater(() -> {
                    app.loginPanel.setInitialFocus();
                });
            } catch (Exception e) {
                System.err.println("启动应用程序时发生错误: " + e.getMessage());
                e.printStackTrace();
            }
        });
    }
}
```

### 4.2 BankDAO - 数据访问对象类

#### 4.2.1 类功能

`BankDAO`是数据访问层（DAO）的核心类，负责处理所有与数据库相关的操作。它封装了JDBC操作，提供账户查询、余额更新、存款、取款、转账、交易记录等功能，确保数据操作的安全性和一致性。

#### 4.2.2 核心方法

| 方法名                                                       | 参数                     | 返回类型          | 描述               |
| ------------------------------------------------------------ | ------------------------ | ----------------- | ------------------ |
| findAccountByNumber(String accountNumber)                    | 账号                     | BankAccount       | 根据账号查找账户   |
| updateAccountBalance(String accountNumber, double newBalance) | 账号、新余额             | boolean           | 更新账户余额       |
| deposit(String accountNumber, double amount, String description) | 账号、金额、描述         | boolean           | 存款操作（含事务） |
| withdraw(String accountNumber, double amount, String description) | 账号、金额、描述         | boolean           | 取款操作（含事务） |
| recordTransaction(String accountNumber, String transactionType, double amount, String description) | 账号、类型、金额、描述   | boolean           | 记录交易           |
| getTransactionHistory(String accountNumber)                  | 账号                     | List<Transaction> | 获取交易历史       |
| createAccount(String accountNumber, String accountHolder, Integer userId) | 账号、持有人、用户ID     | boolean           | 创建新账户         |
| findAccountsByUserId(int userId)                             | 用户ID                   | List<BankAccount> | 根据用户ID查找账户 |
| updateAccountUser(String accountNumber, Integer userId)      | 账号、用户ID             | boolean           | 更新账户关联用户   |
| transferMoney(String fromAccount, String toAccount, double amount) | 转出账号、转入账号、金额 | boolean           | 转账操作（含事务） |

#### 4.2.3 使用场景

- **存款操作**：用户存款时，先查询账户，计算新余额，更新余额，记录交易，提交事务
- **取款操作**：用户取款时，先查询账户，检查余额是否足够，计算新余额，更新余额，记录交易，提交事务
- **转账操作**：用户转账时，检查两个账户是否存在，检查转出账户余额是否足够，更新两个账户余额，记录两笔交易，提交事务
- **查询余额**：根据账号查询账户信息，获取当前余额
- **交易历史**：根据账号查询所有交易记录，按时间倒序排列

#### 4.2.4 事务管理

```mermaid
sequenceDiagram
    participant User as 用户
    participant DAO as BankDAO
    participant DB as MySQL数据库
    
    User->>DAO: deposit(accountNumber, amount, description)
    DAO->>DAO: 开启事务
    DAO->>DB: 查找账户
    DB-->>DAO: 返回账户信息
    
    alt 账户存在
        DAO->>DAO: 计算新余额
        DAO->>DB: 更新账户余额
        DB-->>DAO: 更新成功
        DAO->>DB: 记录交易
        DB-->>DAO: 记录成功
        DAO->>DAO: 提交事务
        DAO-->>User: 返回true
    else 账户不存在
        DAO->>DAO: 回滚事务
        DAO-->>User: 返回false
    end
```

### 4.3 DatabaseConnection - 数据库连接管理类

#### 4.3.1 类功能

`DatabaseConnection`是数据库连接的工具类，负责管理与MySQL数据库的连接。它使用单例模式确保连接参数的一致性，提供获取连接和关闭连接的方法，封装了JDBC驱动的加载和连接管理。

#### 4.3.2 核心属性

| 属性名   | 类型                   | 描述          |
| -------- | ---------------------- | ------------- |
| URL      | String（static final） | 数据库连接URL |
| USERNAME | String（static final） | 数据库用户名  |
| PASSWORD | String（static final） | 数据库密码    |

#### 4.3.3 核心方法

| 方法名                                 | 参数           | 返回类型   | 描述           |
| -------------------------------------- | -------------- | ---------- | -------------- |
| getConnection()                        | 无             | Connection | 获取数据库连接 |
| closeConnection(Connection connection) | Connection对象 | void       | 关闭数据库连接 |

#### 4.3.4 使用场景

- **获取连接**：所有需要访问数据库的操作都通过`getConnection()`方法获取连接
- **关闭连接**：操作完成后，通过`closeConnection()`方法关闭连接，释放资源
- **异常处理**：连接失败时抛出SQLException，由调用方处理

#### 4.3.5 数据库连接流程图

```mermaid
flowchart TD
    A[开始] --> B[加载MySQL驱动]
    B --> C{驱动加载成功?}
    C -->|是| D[获取数据库连接]
    C -->|否| E[抛出SQLException]
    D --> F{连接成功?}
    F -->|是| G[返回Connection对象]
    F -->|否| E
    H[使用Connection] --> I[操作完成]
    I --> J[关闭Connection]
    J --> K[释放资源]
    K --> L[结束]
    
    style A fill:#4caf50
    style G fill:#4caf50
    style E fill:#f44336
    style K fill:#2196f3
```

### 4.4 BankAccount - 账户实体类

#### 4.4.1 类功能

`BankAccount`是账户的实体类，用于表示银行账户的数据模型。它封装了账户的基本信息，包括账户ID、账号、持有人姓名和余额，提供了标准的getter和setter方法。

#### 4.4.2 核心属性

| 属性名        | 类型   | 描述           |
| ------------- | ------ | -------------- |
| accountId     | int    | 账户ID（主键） |
| accountNumber | String | 账号           |
| accountHolder | String | 账户持有人姓名 |
| balance       | double | 账户余额       |

#### 4.4.3 核心方法

| 方法名                                                       | 参数                       | 返回类型 | 描述               |
| ------------------------------------------------------------ | -------------------------- | -------- | ------------------ |
| BankAccount()                                                | 无                         | void     | 默认构造函数       |
| BankAccount(int accountId, String accountNumber, String accountHolder, double balance) | 账户ID、账号、持有人、余额 | void     | 完整构造函数       |
| getAccountId()                                               | 无                         | int      | 获取账户ID         |
| setAccountId(int accountId)                                  | 账户ID                     | void     | 设置账户ID         |
| getAccountNumber()                                           | 无                         | String   | 获取账号           |
| setAccountNumber(String accountNumber)                       | 账号                       | void     | 设置账号           |
| getAccountHolder()                                           | 无                         | String   | 获取持有人姓名     |
| setAccountHolder(String accountHolder)                       | 持有人姓名                 | void     | 设置持有人姓名     |
| getBalance()                                                 | 无                         | double   | 获取余额           |
| setBalance(double balance)                                   | 余额                       | void     | 设置余额           |
| toString()                                                   | 无                         | String   | 返回账户信息字符串 |

#### 4.4.4 使用场景

- **数据传输**：在数据库操作和界面显示之间传输账户数据
- **数据封装**：封装账户的所有属性，提供统一的访问接口
- **数据验证**：可以在setter方法中添加数据验证逻辑

#### 4.4.5 类图

```mermaid
classDiagram
    class BankAccount {
        -int accountId
        -String accountNumber
        -String accountHolder
        -double balance
        +BankAccount()
        +BankAccount(int, String, String, double)
        +getAccountId() int
        +setAccountId(int) void
        +getAccountNumber() String
        +setAccountNumber(String) void
        +getAccountHolder() String
        +setAccountHolder(String) void
        +getBalance() double
        +setBalance(double) void
        +toString() String
    }
    
    class Transaction {
        -int transactionId
        -String accountNumber
        -String transactionType
        -double amount
        -LocalDateTime transactionDate
        -String description
        +getTransactionId() int
        +setTransactionId(int) void
        +getAccountNumber() String
        +setAccountNumber(String) void
        +getTransactionType() String
        +setTransactionType(String) void
        +getAmount() double
        +setAmount(double) void
        +getTransactionDate() LocalDateTime
        +setTransactionDate(LocalDateTime) void
        +getDescription() String
        +setDescription(String) void
    }
    
    class User {
        -int userId
        -String username
        -String password
        -String fullName
        -String email
        -String phone
        -int roleId
        -boolean isActive
        +getUserId() int
        +setUserId(int) void
        +getUsername() String
        +setUsername(String) void
        +getPassword() String
        +setPassword(String) void
        +getFullName() String
        +setFullName(String) void
        +getEmail() String
        +setEmail(String) void
        +getPhone() String
        +setPhone(String) void
        +getRoleId() int
        +setRoleId(int) void
        +getIsActive() boolean
        +setIsActive(boolean) void
        +getRoleName() String
    }
    
    class Role {
        -int roleId
        -String roleName
        -String roleDescription
        +getRoleId() int
        +setRoleId(int) void
        +getRoleName() String
        +setRoleName(String) void
        +getRoleDescription() String
        +setRoleDescription(String) void
    }
    
    BankAccount "1" --> "*" Transaction : generates
    User "1..*" --> BankAccount : owns
    Role "1" --> User : has
```

## 5. 业务流程设计

### 5.1 登录流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant LoginPanel as 登录界面
    participant UserDAO as 用户DAO
    participant DB as 数据库
    participant BankSystemApp as 主应用
    
    User->>LoginPanel: 输入用户名和密码
    LoginPanel->>UserDAO: 验证用户凭据
    UserDAO->>DB: 查询用户信息
    DB-->>UserDAO: 返回用户数据
    
    alt 用户存在且密码正确
        UserDAO-->>LoginPanel: 返回用户对象
        LoginPanel->>BankSystemApp: 触发登录成功事件
        BankSystemApp->>BankSystemApp: 创建主面板
        BankSystemApp->>BankSystemApp: 切换到主界面
        BankSystemApp-->>User: 显示主界面
    else 用户不存在或密码错误
        UserDAO-->>LoginPanel: 返回null
        LoginPanel-->>User: 显示错误提示
    end
```

### 5.2 存款流程

```mermaid
flowchart TD
    A[开始存款] --> B[输入账号和金额]
    B --> C{输入验证}
    C -->|验证失败| D[显示错误提示]
    D --> A
    
    C -->|验证通过| E[调用BankDAO.deposit]
    E --> F[开启数据库事务]
    F --> G[查询账户信息]
    G --> H{账户存在?}
    H -->|否| I[回滚事务]
    I --> J[返回失败]
    J --> K[显示错误提示]
    K --> A
    
    H -->|是| L[计算新余额]
    L --> M[更新账户余额]
    M --> N{更新成功?}
    N -->|否| I
    N -->|是| O[记录交易]
    O --> P{记录成功?}
    P -->|否| I
    P -->|是| Q[提交事务]
    Q --> R[返回成功]
    R --> S[显示成功提示]
    S --> T[刷新界面显示]
    T --> U[结束]
    
    style A fill:#4caf50
    style U fill:#4caf50
    style D fill:#f44336
    style I fill:#f44336
    style J fill:#f44336
    style K fill:#f44336
    style S fill:#2196f3
    style R fill:#2196f3
```

### 5.3 取款流程

```mermaid
flowchart TD
    A[开始取款] --> B[输入账号和金额]
    B --> C{输入验证}
    C -->|验证失败| D[显示错误提示]
    D --> A
    
    C -->|验证通过| E[调用BankDAO.withdraw]
    E --> F[开启数据库事务]
    F --> G[查询账户信息]
    G --> H{账户存在?}
    H -->|否| I[回滚事务]
    I --> J[返回失败]
    J --> K[显示账户不存在提示]
    K --> A
    
    H -->|是| L{余额足够?}
    L -->|否| M[回滚事务]
    M --> N[返回失败]
    N --> O[显示余额不足提示]
    O --> A
    
    L -->|是| P[计算新余额]
    P --> Q[更新账户余额]
    Q --> R{更新成功?}
    R -->|否| M
    R -->|是| S[记录交易]
    S --> T{记录成功?}
    T -->|否| M
    T -->|是| U[提交事务]
    U --> V[返回成功]
    V --> W[显示成功提示]
    W --> X[刷新界面显示]
    X --> Y[结束]
    
    style A fill:#4caf50
    style Y fill:#4caf50
    style D fill:#f44336
    style I fill:#f44336
    style J fill:#f44336
    style K fill:#f44336
    style M fill:#f44336
    style N fill:#f44336
    style O fill:#f44336
    style W fill:#2196f3
    style V fill:#2196f3
```

### 5.4 转账流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant TransferPanel as 转账面板
    participant BankDAO as 数据访问
    participant DB as 数据库
    
    User->>TransferPanel: 输入转出账号、转入账号和金额
    TransferPanel->>BankDAO: transferMoney(fromAccount, toAccount, amount)
    BankDAO->>BankDAO: 开启数据库事务
    
    BankDAO->>DB: 查询转出账户
    DB-->>BankDAO: 返回转出账户信息
    BankDAO->>BankDAO: 验证转出账户存在
    
    alt 转出账户不存在
        BankDAO->>BankDAO: 回滚事务
        BankDAO-->>TransferPanel: 返回false
        TransferPanel-->>User: 显示转出账户不存在提示
    else 转出账户存在
        BankDAO->>DB: 查询转入账户
        DB-->>BankDAO: 返回转入账户信息
        BankDAO->>BankDAO: 验证转入账户存在
        
        alt 转入账户不存在
            BankDAO->>BankDAO: 回滚事务
            BankDAO-->>TransferPanel: 返回false
            TransferPanel-->>User: 显示转入账户不存在提示
        else 转入账户存在
            BankDAO->>BankDAO: 检查转出账户余额
            
            alt 余额不足
                BankDAO->>BankDAO: 回滚事务
                BankDAO-->>TransferPanel: 返回false
                TransferPanel-->>User: 显示余额不足提示
            else 余额足够
                BankDAO->>DB: 更新转出账户余额
                DB-->>BankDAO: 更新成功
                
                BankDAO->>DB: 更新转入账户余额
                DB-->>BankDAO: 更新成功
                
                BankDAO->>DB: 记录转出交易
                DB-->>BankDAO: 记录成功
                
                BankDAO->>DB: 记录转入交易
                DB-->>BankDAO: 记录成功
                
                BankDAO->>BankDAO: 提交事务
                BankDAO-->>TransferPanel: 返回true
                TransferPanel-->>User: 显示转账成功提示
            end
        end
    end
```

## 6. 开发环境搭建

### 6.1 前置条件

- JDK 8或更高版本
- MySQL 8.0或更高版本
- Maven 3.8或更高版本
- IDE（推荐IntelliJ IDEA或Eclipse）

### 6.2 项目结构

```
bank/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── bank/
│   │   │           ├── dao/          # 数据访问对象
│   │   │           │   ├── BankDAO.java
│   │   │           │   └── UserDAO.java
│   │   │           ├── model/        # 实体类
│   │   │           │   ├── BankAccount.java
│   │   │           │   ├── Transaction.java
│   │   │           │   ├── User.java
│   │   │           │   └── Role.java
│   │   │           ├── ui/           # 用户界面
│   │   │           │   ├── BankSystemApp.java
│   │   │           │   ├── BankMainFrame.java
│   │   │           │   ├── BankMainPanel.java
│   │   │           │   ├── LoginPanel.java
│   │   │           │   ├── DepositPanel.java
│   │   │           │   ├── WithdrawPanel.java
│   │   │           │   ├── QueryPanel.java
│   │   │           │   ├── TransactionHistoryPanel.java
│   │   │           │   ├── AccountManagementPanel.java
│   │   │           │   ├── TransferPanel.java
│   │   │           │   ├── ReportPanel.java
│   │   │           │   └── UIDesignManager.java
│   │   │           └── util/         # 工具类
│   │   │               └── DatabaseConnection.java
│   │   └── resources/
│   │       └── database_init_simple.sql
│   └── test/
│       └── java/
│           └── com/
│               └── bank/
├── pom.xml
├── run.sh
└── README.md
```

### 6.3 环境配置步骤

#### 6.3.1 JDK安装与配置

1. 下载JDK 8+安装包并安装
2. 配置环境变量：

```bash
# macOS/Linux
export JAVA_HOME=/path/to/jdk
export PATH=$JAVA_HOME/bin:$PATH

# Windows
set JAVA_HOME=C:\path\to\jdk
set PATH=%JAVA_HOME%\bin;%PATH%
```

3. 验证安装：

```bash
java -version
javac -version
```

#### 6.3.2 MySQL安装与配置

1. 下载并安装MySQL 8.0+
2. 启动MySQL服务
3. 创建数据库：

```sql
CREATE DATABASE bank_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. 执行初始化脚本：

```bash
mysql -u root -p < src/main/resources/database_init_simple.sql
```

#### 6.3.3 Maven配置

1. 下载Maven 3.8+并解压
2. 配置环境变量：

```bash
# macOS/Linux
export MAVEN_HOME=/path/to/maven
export PATH=$MAVEN_HOME/bin:$PATH

# Windows
set MAVEN_HOME=C:\path\to\maven
set PATH=%MAVEN_HOME%\bin;%PATH%
```

3. 验证安装：

```bash
mvn -version
```

### 6.4 项目构建

```bash
# 进入项目目录
cd /path/to/bank

# 编译项目
mvn clean compile

# 打包项目
mvn package
```

### 6.5 运行程序

方式一：使用Maven直接运行

```bash
mvn exec:java -Dexec.mainClass="com.bank.ui.BankSystemApp"
```

方式二：使用启动脚本

```bash
./run.sh
```

## 7. 系统功能模块

### 7.1 用户认证模块

#### 7.1.1 功能描述

用户认证模块负责验证用户身份，确保只有授权用户才能访问系统。系统支持两种角色：管理员和普通用户，不同角色拥有不同的功能权限。

#### 7.1.2 认证流程图

```mermaid
stateDiagram-v2
    [*] --> 未登录
    未登录 --> 输入凭据: 用户打开登录界面
    输入凭据 --> 验证中: 用户点击登录按钮
    验证中 --> 登录成功: 用户名和密码正确
    验证中 --> 登录失败: 用户名或密码错误
    登录失败 --> 输入凭据: 显示错误提示
    登录成功 --> 已登录: 切换到主界面
    已登录 --> 权限检查: 根据用户角色加载功能
    权限检查 --> 管理员界面: 角色为ADMIN
    权限检查 --> 普通用户界面: 角色为USER
    管理员界面 --> 已登录
    普通用户界面 --> 已登录
    已登录 --> 未登录: 用户点击退出
```

#### 7.1.3 示例账户

| 用户类型 | 用户名 | 密码     | 角色               | 姓名 |
| -------- | ------ | -------- | ------------------ | ---- |
| 管理员   | admin  | admin123 | ADMIN - 系统管理员 |      |
| 普通用户 | user1  | user123  | USER - 张三        |      |
| 普通用户 | user2  | user123  | USER - 李四        |      |

### 7.2 存款模块

#### 7.2.1 功能描述

存款模块允许用户向指定账户存入资金，系统会自动更新账户余额并记录交易历史。

#### 7.2.2 存款状态图

```mermaid
stateDiagram-v2
    [*] --> 等待输入: 用户打开存款面板
    等待输入 --> 验证输入: 用户输入账号和金额
    验证输入 --> 输入错误: 输入验证失败
    输入错误 --> 等待输入: 显示错误提示
    验证输入 --> 处理中: 输入验证通过
    处理中 --> 存款成功: 存款操作成功
    处理中 --> 存款失败: 存款操作失败
    存款失败 --> 等待输入: 显示失败原因
    存款成功 --> 显示结果: 显示成功信息和更新余额
    显示结果 --> [*]: 操作完成
```

### 7.3 取款模块

#### 7.3.1 功能描述

取款模块允许用户从指定账户提取资金，系统会检查账户余额是否足够，更新账户余额并记录交易历史。

#### 7.3.2 取款状态图

```mermaid
stateDiagram-v2
    [*] --> 等待输入: 用户打开取款面板
    等待输入 --> 验证输入: 用户输入账号和金额
    验证输入 --> 输入错误: 输入验证失败
    输入错误 --> 等待输入: 显示错误提示
    验证输入 --> 查询账户: 输入验证通过
    查询账户 --> 余额检查: 账户存在
    查询账户 --> 账户不存在: 账户不存在
    账户不存在 --> 等待输入: 显示账户不存在提示
    余额检查 --> 余额不足: 余额不足
    余额不足 --> 等待输入: 显示余额不足提示
    余额检查 --> 处理中: 余额足够
    处理中 --> 取款成功: 取款操作成功
    处理中 --> 取款失败: 取款操作失败
    取款失败 --> 等待输入: 显示失败原因
    取款成功 --> 显示结果: 显示成功信息和更新余额
    显示结果 --> [*]: 操作完成
```

### 7.4 交易历史模块

#### 7.4.1 功能描述

交易历史模块允许用户查看指定账户的所有交易记录，包括存款、取款、转账等操作，按时间倒序显示。

#### 7.4.2 交易历史流程图

```mermaid
flowchart LR
    A[用户选择账户] --> B[调用getTransactionHistory]
    B --> C[查询数据库]
    C --> D[获取交易列表]
    D --> E[按时间倒序排列]
    E --> F[限制显示数量]
    F --> G[显示在界面上]
    G --> H[支持分页]
    H --> I[显示交易详情]
    I --> J[支持筛选]
    J --> K[导出功能]
    
    style A fill:#4caf50
    style G fill:#2196f3
    style K fill:#ff9800
```

### 7.5 账户管理模块

#### 7.5.1 功能描述

账户管理模块允许管理员创建新账户、查看账户列表、修改账户信息、关联用户等操作。

#### 7.5.2 账户管理流程图

```mermaid
flowchart TD
    A[管理员登录] --> B[打开账户管理面板]
    B --> C{选择操作}
    C -->|创建账户| D[输入账户信息]
    D --> E[验证输入]
    E --> F[调用createAccount]
    F --> G{创建成功?}
    G -->|是| H[显示成功提示]
    G -->|否| I[显示错误提示]
    C -->|查看账户| J[调用findAccountsByUserId]
    J --> K[显示账户列表]
    C -->|修改账户| L[选择账户]
    L --> M[修改账户信息]
    M --> N[调用updateAccount]
    N --> O{更新成功?}
    O -->|是| P[显示成功提示]
    O -->|否| Q[显示错误提示]
    C -->|关联用户| R[选择账户和用户]
    R --> S[调用updateAccountUser]
    S --> T{关联成功?}
    T -->|是| U[显示成功提示]
    T -->|否| V[显示错误提示]
    
    style A fill:#4caf50
    style H fill:#2196f3
    style P fill:#2196f3
    style U fill:#2196f3
    style I fill:#f44336
    style Q fill:#f44336
    style V fill:#f44336
```

## 8. 安全特性

### 8.1 安全机制

```mermaid
graph TB
    subgraph 安全层
        A[用户认证]
        B[RBAC权限管理]
        C[输入验证]
        D[SQL注入防护]
        E[事务管理]
    end
    
    subgraph 实现方式
        F[BCrypt密码加密]
        G[PreparedStatement]
        H[数据库事务]
    end
    
    A --> F
    B --> A
    C --> B
    D --> G
    E --> H
    
    style A fill:#4caf50
    style B fill:#2196f3
    style C fill:#ff9800
    style D fill:#f44336
    style E fill:#9c27b0
```

### 8.2 安全特性说明

| 安全特性     | 实现方式          | 描述                                   |
| ------------ | ----------------- | -------------------------------------- |
| 用户认证     | 数据库验证        | 用户名和密码存储在数据库中，登录时验证 |
| RBAC权限管理 | 角色控制          | 不同角色拥有不同的功能权限             |
| 密码加密     | BCrypt            | 使用BCrypt算法加密用户密码             |
| 输入验证     | 前端验证          | 防止无效数据输入                       |
| SQL注入防护  | PreparedStatement | 使用参数化查询防止SQL注入              |
| 事务管理     | JDBC事务          | 确保存款和取款操作的数据一致性         |

## 9. 故障排除

### 9.1 常见问题与解决方案

| 问题             | 可能原因                       | 解决方案                        |
| ---------------- | ------------------------------ | ------------------------------- |
| 数据库连接失败   | 数据库服务未启动，连接参数错误 | 检查MySQL服务状态，验证连接参数 |
| 账户余额不足     | 取款或转账金额超过账户余额     | 检查账户余额，调整操作金额      |
| 用户名或密码错误 | 输入错误或用户不存在           | 检查输入内容，确认用户存在      |
| 中文乱码         | 数据库字符集设置不当           | 确认MySQL字符集设置为utf8mb4    |
| 界面显示异常     | Swing组件初始化失败            | 检查代码逻辑，查看异常堆栈      |

### 9.2 调试流程图

```mermaid
flowchart TD
    A[程序启动失败] --> B{错误类型?}
    B -->|数据库连接错误| C[检查MySQL服务状态]
    C --> D{服务运行?}
    D -->|否| E[启动MySQL服务]
    D -->|是| F[检查连接参数]
    F --> G{参数正确?}
    G -->|否| H[修改DatabaseConnection类]
    G -->|是| I[检查网络连接]
    
    B -->|界面显示错误| J[检查Swing组件初始化]
    J --> K[检查布局管理器]
    K --> L[检查事件监听器]
    
    B -->|业务逻辑错误| M[检查BankDAO方法]
    M --> N[检查SQL语句]
    N --> O[检查事务管理]
    O --> P[检查异常处理]
    
    E --> Q[重新运行程序]
    H --> Q
    I --> Q
    L --> Q
    P --> Q
    
    style A fill:#f44336
    style Q fill:#4caf50
    style C fill:#ff9800
    style J fill:#ff9800
    style M fill:#ff9800
```

## 10. 项目总结

### 10.1 系统功能

- ✅ 用户认证：基于数据库的用户登录验证，支持管理员和普通用户角色
- ✅ RBAC权限管理：基于角色的访问控制，不同角色拥有不同功能权限
- ✅ 存款功能：向指定账户存入资金
- ✅ 取款功能：从指定账户提取资金
- ✅ 余额查询：查看账户当前余额
- ✅ 交易历史：查看账户的交易记录
- ✅ 账户管理：管理员可创建和管理账户
- ✅ 转账功能：账户之间资金转账

### 10.2 技术亮点

1. **桌面应用架构**：采用Swing构建跨平台桌面应用
2. **分层架构**：清晰的表示层、业务层、数据层分离
3. **JDBC数据访问**：使用JDBC原生API访问MySQL数据库
4. **事务管理**：确保存款、取款、转账操作的数据一致性
5. **RBAC权限控制**：基于角色的访问控制，确保系统安全
6. **密码加密**：使用BCrypt算法加密用户密码

### 10.3 后续优化方向

1. **性能优化**：优化数据库查询，添加连接池管理
2. **界面优化**：改进UI设计，提升用户体验
3. **功能扩展**：添加更多银行业务功能，如贷款、理财等
4. **日志管理**：添加详细的操作日志记录
5. **数据备份**：实现数据库定期备份功能

## 11. 附录

### 11.1 参考文档

- [Java官方文档](https://docs.oracle.com/javase/8/)
- [JDBC教程](https://docs.oracle.com/javase/tutorial/jdbc/)
- [Swing教程](https://docs.oracle.com/javase/tutorial/uiswing/)
- [MySQL官方文档](https://dev.mysql.com/doc/)

### 11.2 开发工具推荐

| 工具            | 用途           | 推荐版本 |
| --------------- | -------------- | -------- |
| IntelliJ IDEA   | Java开发IDE    | 2023.1+  |
| Eclipse         | Java开发IDE    | 2023-03+ |
| MySQL Workbench | 数据库管理工具 | 8.0+     |
| Navicat Premium | 数据库管理工具 | 16.0+    |
| Maven           | 项目构建工具   | 3.8+     |