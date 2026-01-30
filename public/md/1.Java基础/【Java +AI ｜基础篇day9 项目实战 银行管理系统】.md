# 09 🏦 Java Day09 - 项目实战：银行管理系统

> 💡 **核心提示**：通过银行管理系统项目，综合运用面向对象编程思想，包括类设计、封装、继承、多态、集合等知识，巩固 Java 基础。

---

## 快速回顾

- **项目目标**：实现一个简单的银行账户管理系统
- **核心功能**：开户、存款、取款、转账、查询、销户
- **技术要点**：面向对象设计、集合存储、输入验证、异常处理
- **设计原则**：单一职责、开闭原则、高内聚低耦合

---

## 目录

- [一、项目架构设计](#一项目架构设计)
  - [1. 类结构设计](#1-类结构设计)
  - [2. 账户类设计](#2-账户类设计)
  - [3. 银行类设计](#3-银行类设计)
  - [4. ATM 交互类](#4-atm-交互类)
  - [5. 系统入口](#5-系统入口)
- [二、功能测试用例](#二功能测试用例)
- [三、代码优化建议](#三代码优化建议)
  - [1. 异常处理优化](#1-异常处理优化)
  - [2. 数据持久化](#2-数据持久化)
  - [3. 密码加密](#3-密码加密)
- [问答](#问答)

---

## 详细内容

### 一、项目架构设计

#### 1. 类结构设计

```
银行管理系统
├── Account（账户类）- 实体类
├── Bank（银行类）- 业务逻辑
├── ATM（ATM机类）- 交互界面
└── BankSystem（系统入口）- 主程序
```

**银行管理系统架构图：**

```
┌─────────────────────────────────────────────────────────────┐
│              银行管理系统架构设计              │
│                                                             │
│   ┌─────────────────────────────────────────────┐           │
│   │         BankSystem（系统入口）          │           │
│   │                                             │           │
│   │   • main() 方法                              │           │
│   │   • 程序启动入口                             │           │
│   │   • 创建 ATM 对象                            │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      │ 调用                                   │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │         ATM（交互界面）                │           │
│   │                                             │           │
│   │   • 显示主菜单                               │           │
│   │   • 接收用户输入                             │           │
│   │   • 调用 Bank 方法                          │           │
│   │   • 循环交互                                 │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      │ 调用                                   │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │         Bank（业务逻辑）               │           │
│   │                                             │           │
│   │   • 开户 createAccount()                    │           │
│   │   • 登录 login()                           │           │
│   │   • 存款 deposit()                         │           │
│   │   • 取款 withdraw()                        │           │
│   │   • 转账 transfer()                        │           │
│   │   • 查询 query()                           │           │
│   │   • 销户 closeAccount()                    │           │
│   └──────────────────┬──────────────────────────┘           │
│                      │                                       │
│                      │ 管理                                   │
│                      ▼                                       │
│   ┌─────────────────────────────────────────────┐           │
│   │      Account（实体类）                  │           │
│   │                                             │           │
│   │   属性：                                     │           │
│   │   • cardId       卡号                     │           │
│   │   • userName     用户名                   │           │
│   │   • password     密码                     │           │
│   │   • balance      余额                     │           │
│   │   • quota        取款限额                  │           │
│   │                                             │           │
│   │   方法：                                     │           │
│   │   • getter/setter                          │           │
│   │   • toString()                            │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   数据存储：                                                │
│   ┌─────────────────────────────────────────────┐           │
│   │      ArrayList<Account> accounts         │           │
│   │                                             │           │
│   │   [Account1, Account2, Account3, ...]     │           │
│   │                                             │           │
│   └─────────────────────────────────────────────┘           │
│                                                             │
│   说明：                                                    │
│   • BankSystem：程序入口，创建ATM对象                       │
│   • ATM：用户交互界面，接收输入并调用Bank方法                 │
│   • Bank：核心业务逻辑，管理所有账户                         │
│   • Account：账户实体类，封装账户信息                         │
│   • ArrayList：使用集合存储所有账户对象                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### 2. 账户类设计

```java
public class Account {
    private String cardId;      // 卡号
    private String userName;    // 用户名
    private String password;    // 密码
    private double balance;     // 余额
    private double quota;       // 取款限额
    
    // 构造器
    public Account() {}
    
    public Account(String cardId, String userName, 
                   String password, double quota) {
        this.cardId = cardId;
        this.userName = userName;
        this.password = password;
        this.quota = quota;
        this.balance = 0;
    }
    
    // getter/setter 省略...
    
    @Override
    public String toString() {
        return "Account{卡号='" + cardId + "', 用户名='" + userName + 
               "', 余额=" + balance + "}";
    }
}
```

#### 3. 银行类设计

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Bank {
    private List<Account> accounts = new ArrayList<>();
    private Account currentAccount;  // 当前登录账户
    
    // 开户
    public void createAccount(String userName, String password, double quota) {
        String cardId = generateCardId();
        Account account = new Account(cardId, userName, password, quota);
        accounts.add(account);
        System.out.println("开户成功！您的卡号是：" + cardId);
    }
    
    // 登录
    public boolean login(String cardId, String password) {
        for (Account acc : accounts) {
            if (acc.getCardId().equals(cardId) && 
                acc.getPassword().equals(password)) {
                currentAccount = acc;
                return true;
            }
        }
        return false;
    }
    
    // 存款
    public void deposit(double amount) {
        if (amount > 0) {
            currentAccount.setBalance(
                currentAccount.getBalance() + amount
            );
            System.out.println("存款成功！当前余额：" + 
                currentAccount.getBalance());
        }
    }
    
    // 取款
    public void withdraw(double amount) {
        if (amount <= 0) {
            System.out.println("金额不合法");
            return;
        }
        if (amount > currentAccount.getQuota()) {
            System.out.println("超过取款限额");
            return;
        }
        if (amount > currentAccount.getBalance()) {
            System.out.println("余额不足");
            return;
        }
        currentAccount.setBalance(
            currentAccount.getBalance() - amount
        );
        System.out.println("取款成功！当前余额：" + 
            currentAccount.getBalance());
    }
    
    // 转账
    public void transfer(String targetCardId, double amount) {
        if (amount > currentAccount.getBalance()) {
            System.out.println("余额不足");
            return;
        }
        Account target = findAccount(targetCardId);
        if (target == null) {
            System.out.println("目标账户不存在");
            return;
        }
        currentAccount.setBalance(
            currentAccount.getBalance() - amount
        );
        target.setBalance(target.getBalance() + amount);
        System.out.println("转账成功！");
    }
    
    // 查询余额
    public void queryBalance() {
        System.out.println("当前余额：" + currentAccount.getBalance());
    }
    
    // 销户
    public void closeAccount() {
        accounts.remove(currentAccount);
        currentAccount = null;
        System.out.println("销户成功！");
    }
    
    // 生成卡号
    private String generateCardId() {
        Random random = new Random();
        String cardId;
        do {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < 8; i++) {
                sb.append(random.nextInt(10));
            }
            cardId = sb.toString();
        } while (findAccount(cardId) != null);
        return cardId;
    }
    
    // 查找账户
    private Account findAccount(String cardId) {
        for (Account acc : accounts) {
            if (acc.getCardId().equals(cardId)) {
                return acc;
            }
        }
        return null;
    }
    
    public Account getCurrentAccount() {
        return currentAccount;
    }
    
    public void logout() {
        currentAccount = null;
    }
}
```

#### 4. ATM 交互类

```java
import java.util.Scanner;

public class ATM {
    private Bank bank = new Bank();
    private Scanner sc = new Scanner(System.in);
    
    public void start() {
        while (true) {
            System.out.println("\n=== 银行管理系统 ===");
            System.out.println("1. 登录");
            System.out.println("2. 开户");
            System.out.println("3. 退出");
            System.out.print("请选择：");
            
            int choice = sc.nextInt();
            sc.nextLine();
            
            switch (choice) {
                case 1: login(); break;
                case 2: createAccount(); break;
                case 3: System.out.println("再见！"); return;
                default: System.out.println("无效选择");
            }
        }
    }
    
    private void login() {
        System.out.print("请输入卡号：");
        String cardId = sc.nextLine();
        System.out.print("请输入密码：");
        String password = sc.nextLine();
        
        if (bank.login(cardId, password)) {
            System.out.println("登录成功！");
            showMainMenu();
        } else {
            System.out.println("卡号或密码错误！");
        }
    }
    
    private void showMainMenu() {
        while (bank.getCurrentAccount() != null) {
            System.out.println("\n=== 主菜单 ===");
            System.out.println("1. 查询余额");
            System.out.println("2. 存款");
            System.out.println("3. 取款");
            System.out.println("4. 转账");
            System.out.println("5. 销户");
            System.out.println("6. 退出登录");
            System.out.print("请选择：");
            
            int choice = sc.nextInt();
            sc.nextLine();
            
            switch (choice) {
                case 1: bank.queryBalance(); break;
                case 2: deposit(); break;
                case 3: withdraw(); break;
                case 4: transfer(); break;
                case 5: bank.closeAccount(); break;
                case 6: bank.logout(); break;
                default: System.out.println("无效选择");
            }
        }
    }
    
    private void createAccount() {
        System.out.print("请输入用户名：");
        String userName = sc.nextLine();
        System.out.print("请输入密码：");
        String password = sc.nextLine();
        System.out.print("请输入取款限额：");
        double quota = sc.nextDouble();
        sc.nextLine();
        
        bank.createAccount(userName, password, quota);
    }
    
    private void deposit() {
        System.out.print("请输入存款金额：");
        double amount = sc.nextDouble();
        sc.nextLine();
        bank.deposit(amount);
    }
    
    private void withdraw() {
        System.out.print("请输入取款金额：");
        double amount = sc.nextDouble();
        sc.nextLine();
        bank.withdraw(amount);
    }
    
    private void transfer() {
        System.out.print("请输入目标卡号：");
        String targetCardId = sc.nextLine();
        System.out.print("请输入转账金额：");
        double amount = sc.nextDouble();
        sc.nextLine();
        bank.transfer(targetCardId, amount);
    }
}
```

#### 5. 系统入口

```java
public class BankSystem {
    public static void main(String[] args) {
        ATM atm = new ATM();
        atm.start();
    }
}
```

---

### 二、功能测试用例

| 功能 | 测试步骤 | 预期结果 |
|------|----------|----------|
| 开户 | 输入用户名、密码、限额 | 生成唯一卡号，开户成功 |
| 登录 | 输入正确卡号和密码 | 登录成功，进入主菜单 |
| 登录失败 | 输入错误密码 | 提示错误，返回主界面 |
| 存款 | 输入正数金额 | 余额增加，显示成功 |
| 取款 | 输入小于余额的金额 | 余额减少，显示成功 |
| 取款超限 | 输入超过限额的金额 | 提示超过限额 |
| 转账 | 输入目标卡号和金额 | 双方余额变动，显示成功 |
| 查询 | 选择查询余额 | 显示当前余额 |
| 销户 | 选择销户 | 账户删除，退出登录 |

---

### 三、代码优化建议

#### 1. 异常处理优化

```java
// 使用自定义异常
public class InsufficientBalanceException extends Exception {
    public InsufficientBalanceException(String message) {
        super(message);
    }
}

// 在业务方法中抛出
public void withdraw(double amount) throws InsufficientBalanceException {
    if (amount > balance) {
        throw new InsufficientBalanceException("余额不足");
    }
    // ...
}
```

#### 2. 数据持久化

```java
// 使用文件存储账户信息
public void saveData() throws IOException {
    try (ObjectOutputStream oos = new ObjectOutputStream(
            new FileOutputStream("accounts.dat"))) {
        oos.writeObject(accounts);
    }
}

@SuppressWarnings("unchecked")
public void loadData() throws IOException, ClassNotFoundException {
    try (ObjectInputStream ois = new ObjectInputStream(
            new FileInputStream("accounts.dat"))) {
        accounts = (List<Account>) ois.readObject();
    }
}
```

#### 3. 密码加密

```java
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class MD5Util {
    public static String encrypt(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(password.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
}
```

---

## 问答

### Q1：为什么要将 Account 类的属性设为 private？

**答**：
- **封装性**：隐藏内部实现细节，防止外部直接修改。
- **安全性**：可以在 setter 中添加校验逻辑，保证数据合法性。
- **灵活性**：内部实现改变不影响外部调用者。
- **维护性**：清晰的接口定义，降低耦合度。

### Q2：如何防止卡号重复？

**答**：
- 生成卡号后，遍历现有账户列表检查是否已存在。
- 如果存在，重新生成；不存在则使用。
- 使用 `do-while` 循环确保生成唯一卡号。

### Q3：转账功能如何确保数据一致性？

**答**：
- 先检查余额是否充足。
- 再检查目标账户是否存在。
- 扣减转出账户余额，增加转入账户余额。
- 实际项目中应使用数据库事务保证原子性。

### Q4：项目可以如何扩展？

**答**：
- **功能扩展**：添加交易记录查询、修改密码、挂失等功能。
- **技术升级**：使用数据库存储数据，添加图形界面（Swing/JavaFX）。
- **架构优化**：使用 MVC 分层架构，引入服务层和数据访问层。
- **安全增强**：添加密码加密、登录验证码、操作日志等。

### Q5：如何改进用户交互体验？

**答**：
- 添加输入验证，防止非法输入导致程序崩溃。
- 使用循环让用户可以连续操作，而非每次重新登录。
- 添加操作确认提示，防止误操作。
- 使用格式化输出，让界面更美观。

---

> **学习建议**：本项目是 Java 基础知识的综合应用，建议先理解整体架构，再逐步实现每个功能。重点体会面向对象的设计思想，以及如何将需求转化为代码实现。
