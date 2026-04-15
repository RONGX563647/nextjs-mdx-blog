# Java实验题目归纳

## java数组的操作

### 源码

```java
import org.w3c.dom.ls.LSOutput;

import java.util.Arrays;
import java.util.Random;
import java.util.Scanner;

public class array {
    //第一题
    public static void main(String[] args) {
        int[] arr = {200, 24, 354, 4534, 534};
        int sum = 0;
        int max = arr[0];
        int min = arr[0];
        for (int num : arr) {
            sum = sum + num;
            if (num > max) {
                max = num;
            }
            if (num < min) {
                min = num;
            }
        }
        System.out.println("数值和：" + sum);
        System.out.println("数组最小值" + min);
        System.out.println("数组最大值" + max);

        //排序
        int[] sortarr = arr.clone();
        Arrays.sort(sortarr);
        System.out.println("数组排序后：" + Arrays.toString(sortarr));
        //拷贝
        int[] copyarr = Arrays.copyOf(arr, arr.length);
        System.out.println("数组拷贝后：" + Arrays.toString(copyarr));
        //原数组
        System.out.println("数组原数组：" + Arrays.toString(arr));
//        //查找
//        int index = Arrays.binarySearch(arr, 354);
//        System.out.println("数组查找后：" + index);
//        //填充
//        Arrays.fill(arr, 100);
//        System.out.println("数组填充后：" + Arrays.toString(arr));
        //第二题
        System.out.println("=======================================");
        //10个元素动态数组 new
        int[] arr2 = new int[10];
        for (int i = 0; i < arr2.length; i++) {
            arr2[i] = i;
        }
        System.out.println("数组：" + Arrays.toString(arr2));
        int j = 0;
        int[] arr3 = new int[10];
        for (int i = arr2.length - 1; i >= 0; i--) {
            arr3[j] = arr2[i];
            j++;
        }
        System.out.println("数组：" + Arrays.toString(arr3));
        System.out.println("==================================");
        //第三题
        Scanner sc = new Scanner(System.in);
        int[][] arr4 = new int[3][3];

        for (int i = 0; i < arr4.length; i++) {
            for (int k = 0; k < arr4[i].length; k++) {
                arr4[i][k] = sc.nextInt();
            }
        }
        System.out.println("原数组：");
        printarray2(arr4);

        int[][] arr5 = transpose(arr4);
        System.out.println("转置数组：");
        printarray2(arr5);
        System.out.println("============================");
        //第四题
        Scanner scanner = new Scanner(System.in);
        System.out.println("请输入第一个数：");
        String str1 = scanner.nextLine();
        System.out.println("请输入第二个数：");
        String str2 = scanner.nextLine();

        int[] num1 = BigNumberMultiplication.stringToIntArray(str1);
        int[] num2 = BigNumberMultiplication.stringToIntArray(str2);

        int[] product = BigNumberMultiplication.multiply(num1, num2);
        String result = BigNumberMultiplication.intArrayToString(product);

        System.out.println(str1 + " * " + str2 + " = " + result);

        scanner.close();
        System.out.println("=================================");

    }

    //第三题实现二维数组逆转
    public static int[][] transpose(int[][] arr) {
        int rows = arr.length;
        int cols = arr[0].length;
        int[][] result = new int[cols][rows];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                result[j][i] = arr[i][j];
            }
        }
        return result;
    }

    public static void printarray2(int[][] arr) {
        for (int i = 0; i < arr.length; i++) {
            for (int j = 0; j < arr[i].length; j++) {
                System.out.print(arr[i][j] + " ");
            }
            System.out.println();
        }
    }

    //第四题 大数相乘
    public class BigNumberMultiplication {
        public static int[] stringToIntArray(String num) {
            int[] arr = new int[num.length()];
            for (int i = 0; i < num.length(); i++) {
                arr[i] = num.charAt(num.length() - 1 - i) - '0';
            }
            return arr;
        }

        public static int[] multiply(int[] num1, int[] num2) {
            int len1 = num1.length;
            int len2 = num2.length;
            int[] result = new int[len1 + len2 + 1];

            for (int i = 0; i < len1; i++) {
                for (int j = 0; j < len2; j++) {
                    result[i + j] += num1[i] * num2[j];
                }
            }

            for (int i = 0; i < result.length - 1; i++) {
                if (result[i] >= 10) {
                    result[i + 1] += result[i] / 10;
                    result[i] %= 10;
                }
            }

            return result;
        }

        public static String intArrayToString(int[] arr) {
            StringBuilder sb = new StringBuilder();
            int i = arr.length - 1;
            while (i > 0 && arr[i] == 0) {
                i--;
            }
            for (; i >= 0; i--) {
                sb.append(arr[i]);
            }
            return sb.toString();
        }
    }


}

```



### 运行结果

![image-20250315164242509](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315164242509.png)



### 知识点

![image-20250315162310309](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315162310309.png)

![image-20250315162519814](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315162519814.png)

![image-20250315162756821](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315162756821.png)

​	ps：**把一个算法问题解决成数学问题，拆解细分为小的程序步骤**





## 数字雨

### 源码

```java
import java.util.Random;

public class DigitalRain {
    private static final int WIDTH = 80; // 控制台宽度
    private static final int HEIGHT = 20; // 控制台高度
    private static final int MAX_LENGTH = 10; // 数字串的最大长度
    private static final int MIN_LENGTH = 3; // 数字串的最小长度
    private static final int DROP_SPEED = 100; // 下落速度，单位为毫秒

    public static void main(String[] args) throws InterruptedException {
        Random random = new Random();
        int[][] drops = new int[WIDTH][];

        // 初始化每列的数字串
        for (int i = 0; i < WIDTH; i++) {
            drops[i] = new int[random.nextInt(MAX_LENGTH - MIN_LENGTH + 1) + MIN_LENGTH];
            for (int j = 0; j < drops[i].length; j++) {
                drops[i][j] = -random.nextInt(HEIGHT);
            }
        }

        while (true) {
            // 清空控制台
            System.out.print("\033[2J");
            System.out.print("\033[H");

            // 打印数字雨
            for (int y = 0; y < HEIGHT; y++) {
                for (int x = 0; x < WIDTH; x++) {
                    if (drops[x].length > 0 && y >= drops[x][0]) {
                        if (y < drops[x][0] + drops[x].length) {
                            System.out.print(random.nextInt(10));
                        } else {
                            System.out.print(" ");
                        }
                    } else {
                        System.out.print(" ");
                    }
                }
                System.out.println();
            }

            // 更新数字串的位置
            for (int i = 0; i < WIDTH; i++) {
                for (int j = 0; j < drops[i].length; j++) {
                    drops[i][j]++;
                }
                // 当数字串完全移出屏幕时，重新初始化
                if (drops[i][0] > HEIGHT) {
                    drops[i] = new int[random.nextInt(MAX_LENGTH - MIN_LENGTH + 1) + MIN_LENGTH];
                    for (int j = 0; j < drops[i].length; j++) {
                        drops[i][j] = -random.nextInt(HEIGHT);
                    }
                }
            }

            // 控制下落速度
            Thread.sleep(DROP_SPEED);
        }
    }
}
```

### 知识点

![image-20250315164743550](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315164743550.png)

![image-20250315165014158](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315165014158.png)

![image-20250315165027867](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315165027867.png)

## 银行取款机制

### 源码

```java
import java.util.ArrayList;
import java.util.Date;
import java.util.Scanner;

public class Account {
    private final String name;
    private final String psd;
    private double balance;
    private final ArrayList<String> transactionRecords = new ArrayList<>();

    public String getName() {
        return name;
    }

    public String getPsd() {
        return psd;
    }

    public Account(String name, String psd) {
        this.name = name;
        this.psd = psd;
        this.balance = 0;
    }

    public double getBalance() {
        return balance;
    }

    public void saveMoney(double amount) {
        balance += amount;
        String record = "存入：" + amount + "元。";
        addTransactionRecord(record);
    }

    public boolean deposit(double amount) {
        if (amount <= balance) {
            balance -= amount;
            String record = "取出：" + amount + "元。";
            addTransactionRecord(record);
            return true;
        } else {
            return false;
        }
    }

    public void addTransactionRecord(String record) {
        Date now = new Date();
        String fullRecord = "余额:" + balance + " " + now + " " + record;
        transactionRecords.add(fullRecord);
    }

    public void displayTransactionRecords() {
        System.out.println("交易记录");
        for (String record : transactionRecords) {
            System.out.println(record);
        }
    }
}


class Bank {
    private final ArrayList<Account> accounts = new ArrayList<>();
    private static final int MAX_ATTEMPTS = 3;

    public boolean Login(String name, String psd) {
        for (Account account : accounts) {
            if (account.getName().equals(name) && account.getPsd().equals(psd)) {
                return true;
            }
        }
        return false;
    }

    public void disMenu(Account account) {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println("**********************************");
            System.out.println("1、存款业务");
            System.out.println("2、取款业务");
            System.out.println("3、显示交易记录");
            System.out.println("4、退出业务办理");
            System.out.println("**********************************");
            System.out.println("请输入对应的数字选择相应的业务：");
            int choice = scanner.nextInt();
            switch (choice) {
                case 1:
                    System.out.println("你的余额为:" + account.getBalance());
                    System.out.println("请输入你要存款的数目：");
                    double saveAmount = scanner.nextDouble();
                    account.saveMoney(saveAmount);
                    System.out.println("你已存入：" + saveAmount + "元。你的余额为：" + account.getBalance());
                    break;
                case 2:
                    System.out.println("你的余额为:" + account.getBalance());
                    System.out.println("你可以取款的最多数目为:" + account.getBalance());
                    System.out.println("请输入你要取款的数目：");
                    double withdrawAmount = scanner.nextDouble();
                    if (account.deposit(withdrawAmount)) {
                        System.out.println("你已取走" + withdrawAmount + "元。你的余额为:" + account.getBalance());
                    } else {
                        System.out.println("取款失败！请重新输入");
                        System.out.println("你的余额为:" + account.getBalance());
                    }
                    break;
                case 3:
                    account.displayTransactionRecords();
                    break;
                case 4:
                    return;
                case 5:
                    removeAccount(account);
                    break;
                case 6:
                    addAccount(account);
                    break;
                default:
                    System.out.println("无效的选择，请重新输入");
            }
        }
    }

    public void addAccount(Account account) {
        accounts.add(account);
    }

    public void removeAccount(Account account) {
        accounts.remove(account);
    }

    public Account loginProcess() {
        Scanner scanner = new Scanner(System.in);
        int attempts = 0;
        while (attempts < MAX_ATTEMPTS) {
            System.out.println("请输入用户名：");
            String name = scanner.nextLine();
            System.out.println("请输入密码：");
            String psd = scanner.nextLine();
            for (Account account : accounts) {
                if (Login(name, psd)) {
                    System.out.println("登录成功！");
                    return account;
                }
            }
            attempts++;
            System.out.println("登录失败，你还有 " + (MAX_ATTEMPTS - attempts) + " 次尝试机会。");
        }
        System.out.println("登录尝试次数已达上限，程序退出。");
        return null;
    }
}
class Main3 {
    public static void main(String[] args) {
        Bank bank = new Bank();
        Account account = new Account("user", "123456");
        bank.addAccount(account);

        Account loggedInAccount = bank.loginProcess();
        if (loggedInAccount != null) {
            bank.disMenu(loggedInAccount);
        }
    }
}
```

### 知识点

ps **private类属性后一般都会跟一个set或get来调用它**

ps **写程序代码的核心不在于语法而是逻辑，一个项目代码看起来长复杂实际上细分成包、类、方法都很容易实现**

![image-20250315170851007](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315170851007.png)

### 优化方案 

ps：回顾代码时去实现

![image-20250315171019503](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315171019503.png)

### 优化后示例

```java
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.InputMismatchException;
import java.util.Scanner;

public class Account {
    private static final String DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private final String name;
    private final String psd;
    private double balance;
    private final ArrayList<String> transactionRecords = new ArrayList<>();

    public String getName() {
        return name;
    }

    public String getPsd() {
        return psd;
    }

    public Account(String name, String psd) {
        this.name = name;
        this.psd = psd;
        this.balance = 0;
    }

    public double getBalance() {
        return balance;
    }

    public void saveMoney(double amount) {
        if (amount <= 0) {
            System.out.println("存款金额必须为正数。");
            return;
        }
        balance += amount;
        String record = "存入：" + amount + "元。";
        addTransactionRecord(record);
    }

    public boolean deposit(double amount) {
        if (amount <= 0) {
            System.out.println("取款金额必须为正数。");
            return false;
        }
        if (amount <= balance) {
            balance -= amount;
            String record = "取出：" + amount + "元。";
            addTransactionRecord(record);
            return true;
        } else {
            return false;
        }
    }

    public void addTransactionRecord(String record) {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern(DATE_FORMAT);
        String fullRecord = "余额:" + balance + " " + now.format(formatter) + " " + record;
        transactionRecords.add(fullRecord);
    }

    public void displayTransactionRecords() {
        System.out.println("交易记录");
        for (String record : transactionRecords) {
            System.out.println(record);
        }
    }
}

class Bank {
    private static final String MENU = "**********************************\n" +
            "1、存款业务\n" +
            "2、取款业务\n" +
            "3、显示交易记录\n" +
            "4、退出业务办理\n" +
            "**********************************\n" +
            "请输入对应的数字选择相应的业务：";
    private final ArrayList<Account> accounts = new ArrayList<>();
    private static final int MAX_ATTEMPTS = 3;

    public boolean Login(String name, String psd) {
        for (Account account : accounts) {
            if (account.getName().equals(name) && account.getPsd().equals(psd)) {
                return true;
            }
        }
        return false;
    }

    public void disMenu(Account account) {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println(MENU);
            try {
                int choice = scanner.nextInt();
                switch (choice) {
                    case 1:
                        System.out.println("你的余额为:" + account.getBalance());
                        System.out.println("请输入你要存款的数目：");
                        double saveAmount = scanner.nextDouble();
                        account.saveMoney(saveAmount);
                        System.out.println("你已存入：" + saveAmount + "元。你的余额为：" + account.getBalance());
                        break;
                    case 2:
                        System.out.println("你的余额为:" + account.getBalance());
                        System.out.println("你可以取款的最多数目为:" + account.getBalance());
                        System.out.println("请输入你要取款的数目：");
                        double withdrawAmount = scanner.nextDouble();
                        if (account.deposit(withdrawAmount)) {
                            System.out.println("你已取走" + withdrawAmount + "元。你的余额为:" + account.getBalance());
                        } else {
                            System.out.println("取款失败！请重新输入");
                            System.out.println("你的余额为:" + account.getBalance());
                        }
                        break;
                    case 3:
                        account.displayTransactionRecords();
                        break;
                    case 4:
                        return;
                    default:
                        System.out.println("无效的选择，请重新输入");
                }
            } catch (InputMismatchException e) {
                System.out.println("输入无效，请输入一个整数。");
                scanner.nextLine(); // 清除无效输入
            }
        }
    }

    public void addAccount(Account account) {
        accounts.add(account);
    }

    public void removeAccount(Account account) {
        accounts.remove(account);
    }

    public Account loginProcess() {
        Scanner scanner = new Scanner(System.in);
        int attempts = 0;
        while (attempts < MAX_ATTEMPTS) {
            System.out.println("请输入用户名：");
            String name = scanner.nextLine();
            System.out.println("请输入密码：");
            String psd = scanner.nextLine();
            if (Login(name, psd)) {
                System.out.println("登录成功！");
                for (Account account : accounts) {
                    if (account.getName().equals(name) && account.getPsd().equals(psd)) {
                        return account;
                    }
                }
            }
            attempts++;
            System.out.println("登录失败，你还有 " + (MAX_ATTEMPTS - attempts) + " 次尝试机会。");
        }
        System.out.println("登录尝试次数已达上限，程序退出。");
        return null;
    }
}

class Main3 {
    public static void main(String[] args) {
        Bank bank = new Bank();
        Account account = new Account("user", "123456");
        bank.addAccount(account);

        Account loggedInAccount = bank.loginProcess();
        if (loggedInAccount != null) {
            bank.disMenu(loggedInAccount);
        }
    }
}
```



## 图书管理系统

### 源码

```java
 class Book {
     private String bookName;
     private double price;
     private int copies;
     private static int count = 1;
     private String ISSN;
     private static int totalCopies;

     public Book(String bookName, double price, int copies) {
         this.bookName = bookName;
         this.price = price;
         this.copies = copies;
         this.ISSN = "ISSN" + count++;

     }


     public String getBookName() {
         return bookName;
     }

     public double getPrice() {
         return price;
     }
     public int getCopies() {
         return copies;
     }
     public String getISSN() {
         return ISSN;
     }
     public static int getTotalCopies() {
         return count -1;
     }

 }
 class Main2 {
     public static void main(String[] args) {
         Book [] books ={
                 new Book("Java程序", 35.6, 3),
                 new Book("Java程序", 35.6, 3),
                 new Book("Java程序", 35.6, 3),
                 new Book("C语言程序设计", 42.6, 2),
                 new Book("C语言程序设计", 42.6, 2),
                 new Book(null, 0.0, 3),
                 new Book(null, 0.0, 3),
                 new Book(null, 0.0, 3)
         };
         for (Book book : books) {
             System.out.println("[书名]:" + book.getBookName() +
                     "\t[价格]:" + book.getPrice() +
                     "\t[图书编号]:" + book.getISSN() +
                     "\t[本书的册数]:" + book.getCopies());
         }
         System.out.println("图书总册数为:" + Book.getTotalCopies());
     }
 }
```

### 知识点

![image-20250315171437698](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315171437698.png)

ps **静态方法生命线与类一样，注意不要谁便把变量定义为static这样会占用堆的内存空间**



### 优化方案

![image-20250315171828008](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315171828008.png)



### **优化代码示例**

```java
class Book {
    private String bookName;
    private double price;
    private int copies;
    private static int count = 1;
    private String ISSN;
    private static int totalCopies;

    /**
     * 构造方法，用于创建图书对象
     * @param bookName 图书名称
     * @param price 图书价格
     * @param copies 图书册数
     */
    public Book(String bookName, double price, int copies) {
        if (bookName == null || bookName.isEmpty()) {
            throw new IllegalArgumentException("图书名称不能为空");
        }
        if (price < 0) {
            throw new IllegalArgumentException("图书价格不能为负数");
        }
        if (copies < 0) {
            throw new IllegalArgumentException("图书册数不能为负数");
        }
        this.bookName = bookName;
        this.price = price;
        this.copies = copies;
        this.ISSN = "ISSN" + count++;
        totalCopies += copies;
    }

    public String getBookName() {
        return bookName;
    }

    public double getPrice() {
        return price;
    }

    public int getCopies() {
        return copies;
    }

    public String getISSN() {
        return ISSN;
    }

    /**
     * 获取图书的总册数
     * @return 图书总册数
     */
    public static int getTotalCopies() {
        return totalCopies;
    }

    /**
     * 增加图书册数
     * @param num 要增加的册数
     */
    public void addCopies(int num) {
        if (num < 0) {
            throw new IllegalArgumentException("增加的册数不能为负数");
        }
        this.copies += num;
        totalCopies += num;
    }

    /**
     * 减少图书册数
     * @param num 要减少的册数
     */
    public void reduceCopies(int num) {
        if (num < 0) {
            throw new IllegalArgumentException("减少的册数不能为负数");
        }
        if (num > this.copies) {
            throw new IllegalArgumentException("减少的册数不能超过现有册数");
        }
        this.copies -= num;
        totalCopies -= num;
    }
}

class Main2 {
    public static void main(String[] args) {
        try {
            Book[] books = {
                    new Book("Java程序", 35.6, 3),
                    new Book("Java程序", 35.6, 3),
                    new Book("Java程序", 35.6, 3),
                    new Book("C语言程序设计", 42.6, 2),
                    new Book("C语言程序设计", 42.6, 2)
            };
            for (Book book : books) {
                System.out.println("[书名]:" + book.getBookName() +
                        "\t[价格]:" + book.getPrice() +
                        "\t[图书编号]:" + book.getISSN() +
                        "\t[本书的册数]:" + book.getCopies());
            }
            System.out.println("图书总册数为:" + Book.getTotalCopies());

            // 测试增加和减少册数的方法
            books[0].addCopies(2);
            System.out.println("增加2册后，" + books[0].getBookName() + "的册数为: " + books[0].getCopies());
            System.out.println("图书总册数为: " + Book.getTotalCopies());

            books[0].reduceCopies(1);
            System.out.println("减少1册后，" + books[0].getBookName() + "的册数为: " + books[0].getCopies());
            System.out.println("图书总册数为: " + Book.getTotalCopies());
        } catch (IllegalArgumentException e) {
            System.out.println("创建图书对象时出现错误: " + e.getMessage());
        }
    }
}
```

```markdown
xxxxxxxxxx # 算法题刷题1-10学习笔记（Python）## 一、数组与字符串### 1. 两数之和（Easy）- **问题描述**：给定数组和目标值，找出两个数的索引，使其和为目标值。- **解法**：双重循环遍历数组，找到满足条件的两个数。- **时间复杂度**：O(n²)，n为数组长度。- **空间复杂度**：O(1)。- **关键点**：注意不能重复使用同一元素，返回索引顺序任意。​### 2. 无重复字符的最长子串（Medium）- **问题描述**：找出字符串中无重复字符的最长子串长度。- **解法**：滑动窗口+哈希表。右指针扩展窗口，左指针调整窗口起始位置以避免重复字符。- **时间复杂度**：O(n)，n为字符串长度。- **空间复杂度**：O(min(m,n))，m为字符集大小。- **关键点**：哈希表记录字符最后一次出现的索引，动态调整窗口边界。​### 3. 最长回文子串（Medium）- **问题描述**：找出字符串中最长的回文子串。- **解法**：中心扩展法。遍历每个字符，以其为中心向两边扩展，比较奇数和偶数长度的回文子串。- **时间复杂度**：O(n²)，n为字符串长度。- **空间复杂度**：O(1)。- **关键点**：分别处理奇数和偶数长度的回文子串，更新最长结果。​### 4. 字符串转换整数（atoi）（Medium）- **问题描述**：将字符串转换为整数，处理前导空格、符号位、数字字符及溢出。- **解法**：去除前导空格，确定符号位，提取连续数字字符，转换为整数并检查溢出。- **时间复杂度**：O(n)，n为字符串长度。- **空间复杂度**：O(1)。- **关键点**：注意处理正负号、前导零及溢出情况，使用32位整数边界值判断。​## 二、链表### 1. 两数相加（Medium）- **问题描述**：两链表表示的非负整数相加，返回结果链表（逆序存储）。- **解法**：模拟竖式加法，使用虚拟头结点简化链表操作，处理进位。- **时间复杂度**：O(max(m,n))，m、n为两链表长度。- **空间复杂度**：O(max(m,n))。- **关键点**：虚拟头结点避免头指针特殊处理，循环条件需考虑进位。​## 三、栈与队列### 1. 有效的括号（未在文档中但常见）- **问题描述**：判断字符串中括号是否有效匹配。- **解法**：栈存储左括号，遇到右括号时匹配栈顶元素。- **时间复杂度**：O(n)，n为字符串长度。- **空间复杂度**：O(n)。​## 四、贪心算法### 1. 用最少数量的箭引爆气球（Medium）- **问题描述**：区间调度问题，求最少箭数使所有气球被引爆。- **解法**：按区间结尾升序排序，贪心选择结尾最小的区间，统计不重叠区间数。- **时间复杂度**：O(n log n)，排序占主导。- **空间复杂度**：O(log n)，排序栈空间。- **关键点**：排序后遍历，维护当前区间结尾，判断是否重叠。​## 五、动态规划### 1. 正则表达式匹配（Hard）- **问题描述**：判断字符串是否匹配模式串（含`.`和`*`）。- **解法**：动态规划+备忘录。定义`dp(i,j)`表示`s[i..]`与`p[j..]`是否匹配，处理字符匹配和`*`的情况。- **时间复杂度**：O(mn)，m、n为字符串和模式串长度。- **空间复杂度**：O(mn)，备忘录空间。- **关键点**：备忘录避免重复计算，处理`*`时考虑匹配0次或多次的情况。​## 六、数学问题### 1. 整数反转（Medium）- **问题描述**：反转整数，处理正负号及溢出。- **解法**：转换为字符串反转，处理符号位，转回整数后检查溢出。- **时间复杂度**：O(n)，n为整数位数。- **空间复杂度**：O(n)。- **关键点**：负数符号不参与反转，注意前导零和32位整数范围。​### 2. 回文数（Easy）- **问题描述**：判断整数是否为回文数。- **解法**：转换为字符串，双指针从两端向中间比较字符。- **时间复杂度**：O(n)，n为字符串长度。- **空间复杂度**：O(n)。- **关键点**：处理负数（非回文数）和单字符情况。​## 七、排序与搜索### 1. 寻找两个正序数组的中位数（Hard）- **问题描述**：合并两个有序数组，求中位数。- **解法**：合并后排序，直接获取中位数。- **时间复杂度**：O((m+n) log(m+n))，排序占主导。- **空间复杂度**：O(m+n)。- **关键点**：处理奇偶长度，注意返回值类型为浮点数。​## 八、其他### 1. Z字形变换（Medium）- **问题描述**：将字符串按Z字形排列后按行读取。- **解法**：按行填充字符，正向和反向交替填充。- **时间复杂度**：O(n)，n为字符串长度。- **空间复杂度**：O(n)。- **关键点**：处理单行特殊情况，交替填充行字符。​## 学习总结- **数据结构应用**：  - 链表：虚拟头结点简化操作，如两数相加。  - 栈：处理括号匹配、表达式求值等。  - 哈希表：快速查找，如无重复字符子串、两数之和。- **算法思想**：  - 贪心：区间调度、最少箭数问题，局部最优解推导全局最优。  - 动态规划：正则表达式匹配，子问题划分与备忘录优化。  - 双指针：回文数判断、滑动窗口，降低时间复杂度。- **边界处理**：  - 空输入、特殊值（如0、负数）、溢出情况（如整数反转、atoi）。  - 数据结构边界（如链表头指针、数组越界）。- **优化方向**：  - 优先考虑时间复杂度，如滑动窗口优于双重循环。  - 空间换时间，如哈希表、备忘录。​通过刷题总结，掌握不同类型问题的解法套路，注重边界处理和算法复杂度分析，逐步提升代码健壮性和效率
```



### 源码

```java
import java.util.Calendar;

public class CalendarPrint {
    public static void main(String[] args) {
        Calendar cal = Calendar.getInstance();
        int year = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH);
        int day = cal.get(Calendar.DAY_OF_MONTH);

        System.out.println(year + "年" + (month + 1) + "月" + day + "日");
        System.out.println("日\t一\t二\t三\t四\t五\t六");

        cal.set(year, month, 1);
        int firstDayOfMonth = cal.get(Calendar.DAY_OF_WEEK);

        for (int i = 1; i < firstDayOfMonth; i++) {
            System.out.print("\t");
        }

        int maxDays = cal.getActualMaximum(Calendar.DAY_OF_MONTH);
        for (int i = 1; i <= maxDays; i++) {
            if (i == day) {
                System.out.print(i + "*\t");
            } else {
                System.out.print(i + "\t");
            }
            if ((firstDayOfMonth + i - 1) % 7 == 0) {
                System.out.println();
            }
        }
    }
}
```

### 运行结果

![image-20250315172240382](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315172240382.png)

### 知识点

ps 输出格式的调整，这种小功能完全可以直接抛给ai实现





## 发牌系统

### 源码

```java
import java.util.Random;
import java.util.Scanner;

class Cards {
    private String suit;
    private String rank;

    public Cards(String suit, String rank) {
        this.suit = suit;
        this.rank = rank;
    }

    public String getSuit() {
        return suit;
    }

    public String getRank() {
        return rank;
    }
}

class SendingCards {
    private Cards[] cards;
    private int[] flag;

    public SendingCards() {
        cards = new Cards[52];
        flag = new int[52];
        initCard();
    }

    public void Menu() {
        Scanner scanner = new Scanner(System.in);
        while (true) {
            System.out.println("0、初始化牌");
            System.out.println("1、显示牌码");
            System.out.println("2、洗牌");
            System.out.println("3、发牌");
            System.out.println("4、退出~~~~");
            System.out.print("请输入对应的数字选择相应的业务：");
            int choice = scanner.nextInt();
            switch (choice) {
                case 0:
                    initCard();
                    break;
                case 1:
                    printCards();
                    break;
                case 2:
                    shuffleCard();
                    break;
                case 3:
                    System.out.print("请输入发牌数：");
                    int num = scanner.nextInt();
                    dealCard(num);
                    break;
                case 4:
                    System.out.println("再见~~");
                    return;
                default:
                    System.out.println("输入错误，再见~~");
                    return;
            }
        }
    }

    public void setFlag() {
        for (int i = 0; i < 52; i++) {
            flag[i] = 0;
        }
    }

    public void initCard() {
        String[] suits = {"黑桃", "红桃", "方块", "梅花"};
        String[] ranks = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};
        int index = 0;
        for (String suit : suits) {
            for (String rank : ranks) {
                cards[index] = new Cards(suit, rank);
                index++;
            }
        }
        setFlag();
    }

//    public void printCard1(){
//        String[] suits = {"黑桃", "红桃", "方块", "梅花"};
//        String[] ranks = {"A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"};
//        int index = 0;
//        for (String suit : suits) {
//            for (String rank : ranks) {
//                System.out.print(suit + rank+ " ");
//            }
//            System.out.println();
//        }
//    }

    public void printCards() {

        for (Cards card : cards) {
            int index = 0;
            System.out.print(card.getSuit() + card.getRank() + " ");
        }
        System.out.println();
    }

    public void shuffleCard() {
        Random random = new Random();
        for (int i = 0; i < 52; i++) {
            int j = random.nextInt(52);
            Cards temp = cards[i];
            cards[i] = cards[j];
            cards[j] = temp;
        }
        setFlag();
    }

    public void dealCard(int num) {
        Random random = new Random();
        int count = 0;
        while (count < num) {
            int index = random.nextInt(52);
            if (flag[index] == 0) {
                System.out.print(cards[index].getSuit() + cards[index].getRank() + " ");
                flag[index] = 1;
                count++;
            }
        }
        System.out.println();
    }
}
class Main1 {
    public static void main(String[] args) {
        SendingCards sendingCards = new SendingCards();
        sendingCards.Menu();
    }
}
```

### 知识点

![image-20250315172948974](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315172948974.png)

### 优化示例

![image-20250315173216335](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315173216335.png)

![image-20250315173221808](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315173221808.png)

![image-20250315173226790](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315173226790.png)

![image-20250315173230221](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315173230221.png)

## 课程表系统

### 源码

```java
class Student {
    private String id;
    private String name;
    private String major;
    private char gender;
    private String school;
    private short grade;

    public Student(String id, String name, String major, char gender, String school, short grade) {
        this.id = id;
        this.name = name;
        this.major = major;
        this.gender = gender;
        this.school = school;
        this.grade = grade;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public char getGender() {
        return gender;
    }

    public void chooseCourse(Course course) {
        System.out.println("学生：" + name + " 选择了课程：" + course.getName());
        course.addStudent(id);
    }
}

class Teacher {
    private String id;
    private String name;
    private String school;

    public Teacher(String id, String name, String school) {
        this.id = id;
        this.name = name;
        this.school = school;
    }

    public Course openCourse() {
        Course course = new Course("1001", "《Java 程序设计》", "2020第二学期");
        course.setTeacher(this);
        System.out.println(name + "老师开课了.....");
        return course;
    }
    public String getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public String getSchool() {
        return school;
    }
}

class Course {
    private String id;
    private String name;
    private String semester;
    private String[] students = new String[100];
    private int studentCount = 0;
    private Teacher teacher;

    public int studentCount() {
        return studentCount;
    }
    public Course(String id, String name, String semester) {
        this.id = id;
        this.name = name;
        this.semester = semester;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSemester() {
        return semester;
    }

    public Teacher getTeacher() {
        return teacher;
    }

    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public void addStudent(String studentId) {
        students[studentCount++] = studentId;
        System.out.println(name + "课程新增了第 " + studentCount + " 学生： 学生姓名：" + findStudentName(studentId) + "  性别 : " + findStudentGender(studentId));
    }

    private String findStudentName(String studentId) {
        // 实际应用中这里应该从学生列表中查找，这里简单返回一个默认值
        return "李&";
    }

    char findStudentGender(String studentId) {
        // 实际应用中这里应该从学生列表中查找，这里简单返回一个默认值
        return '男';
    }

    @Override
    public String toString() {
        return "课程名称：" + name + "\n开课学期：" + semester + "\n开课老师编号：" + teacher.getId() + "：名字：" + teacher.getName();
    }
    public int getStudentCount() {
        return studentCount;
    }
    public String[] getStudents() {
        return students;

    }
    public void setStudents(String[] students) {
        this.students = students;

    }
}

class TestCourse {
    static Course cour;

    public static void testCreateCourse(int num) {
        Teacher tea = new Teacher("课程1001", "林老师", "某大学");
        cour = tea.openCourse();
        System.out.println(cour);

        for (int i = 0; i < num; i++) {
            Student student = new Student("student" + i, "李&", "计算机科学", '男', "某大学", (short) 2020);
            student.chooseCourse(cour);
        }
    }

    public static void testStatics() {
        int maleCount = 0;
        int femaleCount = 0;
        for (int i = 0; i < cour.getStudentCount(); i++) {
            if (cour.findStudentGender(cour.getStudents()[i]) == '男') {
                maleCount++;
            } else {
                femaleCount++;
            }
        }
        double maleRatio = (double) maleCount / cour.getStudentCount();
        double femaleRatio = (double) femaleCount / cour.getStudentCount();

        System.out.println("男生数量：" + maleCount + "，比重：" + maleRatio);
        System.out.println("女生数量：" + femaleCount + "，比重：" + femaleRatio);
    }

    public static void main(String[] args) {
        testCreateCourse(58);
        testStatics();
    }
}
```

### 知识点

![image-20250315173709415](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315173709415.png)

### 优化方案

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// 学生类，包含学生的基本信息和选课功能
class Student {
    private String id;
    private String name;
    private String major;
    private char gender;
    private String school;
    private short grade;

    /**
     * 学生类的构造方法，用于初始化学生的基本信息
     * @param id 学生的唯一标识
     * @param name 学生的姓名
     * @param major 学生的专业
     * @param gender 学生的性别，只能为 '男' 或 '女'
     * @param school 学生所在的学校
     * @param grade 学生的年级
     * @throws IllegalArgumentException 如果输入的参数不符合要求，抛出该异常
     */
    public Student(String id, String name, String major, char gender, String school, short grade) {
        if (id == null || id.isEmpty()) {
            throw new IllegalArgumentException("学生ID不能为空");
        }
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("学生姓名不能为空");
        }
        if (gender != '男' && gender != '女') {
            throw new IllegalArgumentException("性别必须为男或女");
        }
        this.id = id;
        this.name = name;
        this.major = major;
        this.gender = gender;
        this.school = school;
        this.grade = grade;
    }

    /**
     * 获取学生的ID
     * @return 学生的ID
     */
    public String getId() {
        return id;
    }

    /**
     * 获取学生的姓名
     * @return 学生的姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 获取学生的性别
     * @return 学生的性别
     */
    public char getGender() {
        return gender;
    }

    /**
     * 学生选择课程的方法
     * @param course 学生要选择的课程
     * @param studentManager 学生管理类的实例，用于管理学生信息
     */
    public void chooseCourse(Course course, StudentManager studentManager) {
        System.out.println("学生：" + name + " 选择了课程：" + course.getName());
        course.addStudent(id, studentManager);
    }
}

// 教师类，包含教师的基本信息和开课功能
class Teacher {
    private String id;
    private String name;
    private String school;

    /**
     * 教师类的构造方法，用于初始化教师的基本信息
     * @param id 教师的唯一标识
     * @param name 教师的姓名
     * @param school 教师所在的学校
     */
    public Teacher(String id, String name, String school) {
        this.id = id;
        this.name = name;
        this.school = school;
    }

    /**
     * 教师开课的方法
     * @return 教师开设的课程实例
     */
    public Course openCourse() {
        Course course = new Course("1001", "《Java 程序设计》", "2020第二学期");
        course.setTeacher(this);
        System.out.println(name + "老师开课了.....");
        return course;
    }

    /**
     * 获取教师的ID
     * @return 教师的ID
     */
    public String getId() {
        return id;
    }

    /**
     * 获取教师的姓名
     * @return 教师的姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 获取教师所在的学校
     * @return 教师所在的学校
     */
    public String getSchool() {
        return school;
    }
}

// 课程类，包含课程的基本信息、选课学生信息和开课教师信息
class Course {
    private String id;
    private String name;
    private String semester;
    private List<String> students = new ArrayList<>();
    private Teacher teacher;

    /**
     * 课程类的构造方法，用于初始化课程的基本信息
     * @param id 课程的唯一标识
     * @param name 课程的名称
     * @param semester 课程开设的学期
     */
    public Course(String id, String name, String semester) {
        this.id = id;
        this.name = name;
        this.semester = semester;
    }

    /**
     * 获取课程的ID
     * @return 课程的ID
     */
    public String getId() {
        return id;
    }

    /**
     * 获取课程的名称
     * @return 课程的名称
     */
    public String getName() {
        return name;
    }

    /**
     * 获取课程开设的学期
     * @return 课程开设的学期
     */
    public String getSemester() {
        return semester;
    }

    /**
     * 获取课程的开课教师
     * @return 课程的开课教师
     */
    public Teacher getTeacher() {
        return teacher;
    }

    /**
     * 设置课程的开课教师
     * @param teacher 课程的开课教师
     */
    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    /**
     * 向课程中添加学生的方法
     * @param studentId 要添加的学生的ID
     * @param studentManager 学生管理类的实例，用于管理学生信息
     */
    public void addStudent(String studentId, StudentManager studentManager) {
        Student student = studentManager.getStudent(studentId);
        if (student != null) {
            students.add(studentId);
            System.out.println(name + "课程新增了学生：" + student.getName());
        }
    }

    /**
     * 获取课程的学生数量
     * @return 课程的学生数量
     */
    public int getStudentCount() {
        return students.size();
    }

    /**
     * 获取课程的学生列表
     * @return 课程的学生列表
     */
    public List<String> getStudents() {
        return new ArrayList<>(students);
    }

    /**
     * 重写 toString 方法，用于输出课程的基本信息
     * @return 课程的基本信息字符串
     */
    @Override
    public String toString() {
        return "课程名称：" + name + "\n开课学期：" + semester + "\n开课老师编号：" + teacher.getId() + "：名字：" + teacher.getName();
    }
}

// 学生管理类，用于管理学生信息
class StudentManager {
    private Map<String, Student> students = new HashMap<>();

    /**
     * 向学生管理类中添加学生的方法
     * @param student 要添加的学生实例
     */
    public void addStudent(Student student) {
        students.put(student.getId(), student);
    }

    /**
     * 根据学生ID获取学生实例的方法
     * @param id 学生的ID
     * @return 对应的学生实例，如果不存在则返回 null
     */
    public Student getStudent(String id) {
        return students.get(id);
    }
}

// 测试类，包含创建课程和统计选课学生性别比例的测试方法
class TestCourse {
    static Course cour;

    /**
     * 测试创建课程和学生选课的方法
     * @param num 选课的学生数量
     */
    public static void testCreateCourse(int num) {
        try {
            Teacher tea = createTeacher();
            cour = tea.openCourse();
            System.out.println(cour);

            StudentManager studentManager = new StudentManager();
            for (int i = 0; i < num; i++) {
                Student student = new Student("student" + i, "李&", "计算机科学", '男', "某大学", (short) 2020);
                studentManager.addStudent(student);
                student.chooseCourse(cour, studentManager);
            }
        } catch (IllegalArgumentException e) {
            System.out.println("创建对象时出错：" + e.getMessage());
        }
    }

    /**
     * 创建教师实例的辅助方法
     * @return 教师实例
     */
    private static Teacher createTeacher() {
        return new Teacher("课程1001", "林老师", "某大学");
    }

    /**
     * 测试统计选课学生性别比例的方法
     */
    public static void testStatics() {
        int maleCount = 0;
        int femaleCount = 0;
        StudentManager studentManager = new StudentManager();
        for (String studentId : cour.getStudents()) {
            Student student = studentManager.getStudent(studentId);
            if (student != null && student.getGender() == '男') {
                maleCount++;
            } else {
                femaleCount++;
            }
        }
        double maleRatio = (double) maleCount / cour.getStudentCount();
        double femaleRatio = (double) femaleCount / cour.getStudentCount();

        System.out.println("男生数量：" + maleCount + "，比重：" + maleRatio);
        System.out.println("女生数量：" + femaleCount + "，比重：" + femaleRatio);
    }

    /**
     * 程序的入口方法
     * @param args 命令行参数
     */
    public static void main(String[] args) {
        testCreateCourse(58);
        testStatics();
    }
}
```

## 学生成绩

### 源码

```

public class Stu {
    private int sid;
    private String name;
    private  double math;
    private double english;
    private double cs;
    public Stu(int sid, String name, int math, int english, int cs) {
        this.sid = sid;
        this.name = name;
        this.math = math;
        this.english = english;
        this.cs = cs;
    }
    public double count(){
        return english + math + cs;
    }
    public double getAverage(){
        return (english + math + cs) / 3.0;
    }
    public double max(){
        return Math.max(english, Math.max(math, cs));
    }
    public double min(){
        return Math.min(english, Math.min(math, cs));
    }
    public  String getname(){
        return name;
    }
    public int getsid(){
        return sid;
    }
}
//demo
class Main {
    public static void main(String[] args) {
        Stu Stu = new Stu(1, "张三", 10, 50, 100);
        System.out.println("学号: " + Stu.getsid() + ", 姓名: " + Stu.getname());
        System.out.println("总分: " + Stu.count());
        System.out.println("平均分: " + Stu.getAverage());
        System.out.println("最高分: " + Stu.max());
        System.out.println("最低分: " + Stu.min());
    }
}

public class Stu {
    private int sid;
    private String name;
    private  double math;
    private double english;
    private double cs;
    public Stu(int sid, String name, int math, int english, int cs) {
        this.sid = sid;
        this.name = name;
        this.math = math;
        this.english = english;
        this.cs = cs;
    }
    public double count(){
        return english + math + cs;
    }
    public double getAverage(){
        return (english + math + cs) / 3.0;
    }
    public double max(){
        return Math.max(english, Math.max(math, cs));
    }
    public double min(){
        return Math.min(english, Math.min(math, cs));
    }
    public  String getname(){
        return name;
    }
    public int getsid(){
        return sid;
    }
}
//demo
class Main {
    public static void main(String[] args) {
        Stu Stu = new Stu(1, "张三", 10, 50, 100);
        System.out.println("学号: " + Stu.getsid() + ", 姓名: " + Stu.getname());
        System.out.println("总分: " + Stu.count());
        System.out.println("平均分: " + Stu.getAverage());
        System.out.println("最高分: " + Stu.max());
        System.out.println("最低分: " + Stu.min());
    }
}

```

### 知识点

### 优化方案

![image-20250315175200385](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315175200385.png)

```java
public class Stu {
    private int sid;
    private String name;
    private double math;
    private double english;
    private double cs;

    /**
     * 构造方法，用于初始化学生对象的属性
     * @param sid 学生的学号，必须大于 0
     * @param name 学生的姓名
     * @param math 学生的数学成绩，范围在 0 - 100
     * @param english 学生的英语成绩，范围在 0 - 100
     * @param cs 学生的计算机科学成绩，范围在 0 - 100
     * @throws IllegalArgumentException 如果输入的参数不符合要求，抛出该异常
     */
    public Stu(int sid, String name, double math, double english, double cs) {
        if (sid <= 0) {
            throw new IllegalArgumentException("学号必须大于 0");
        }
        if (math < 0 || math > 100 || english < 0 || english > 100 || cs < 0 || cs > 100) {
            throw new IllegalArgumentException("成绩必须在 0 - 100 之间");
        }
        this.sid = sid;
        this.name = name;
        this.math = math;
        this.english = english;
        this.cs = cs;
    }

    /**
     * 计算学生的总分
     * @return 学生的总分
     */
    public double count() {
        return english + math + cs;
    }

    /**
     * 计算学生的平均分
     * @return 学生的平均分
     */
    public double getAverage() {
        return count() / 3.0;
    }

    /**
     * 获取学生的最高分
     * @return 学生的最高分
     */
    public double max() {
        return Math.max(english, Math.max(math, cs));
    }

    /**
     * 获取学生的最低分
     * @return 学生的最低分
     */
    public double min() {
        return Math.min(english, Math.min(math, cs));
    }

    /**
     * 获取学生的姓名
     * @return 学生的姓名
     */
    public String getName() {
        return name;
    }

    /**
     * 获取学生的学号
     * @return 学生的学号
     */
    public int getSid() {
        return sid;
    }
}

//demo
class Main {
    public static void main(String[] args) {
        try {
            Stu student = new Stu(1, "张三", 10, 50, 100);
            System.out.println(String.format("学号: %d, 姓名: %s", student.getSid(), student.getName()));
            System.out.println(String.format("总分: %.2f", student.count()));
            System.out.println(String.format("平均分: %.2f", student.getAverage()));
            System.out.println(String.format("最高分: %.2f", student.max()));
            System.out.println(String.format("最低分: %.2f", student.min()));
        } catch (IllegalArgumentException e) {
            System.out.println("创建学生对象时出现错误: " + e.getMessage());
        }
    }
}
```

## 人骑车

### 源码

```java
public class Vehicle {
    private double speed;
    private int power;
    public double getSpeed() {
        return speed;
    }
    public void speedUp(int increment) {
        speed += increment;
    }
    public void speedDown(int decrement) {
        if (speed >= decrement) {
            speed -= decrement;
        } else {
            speed = 0;
        }
    }

    public int getPower() {
        return power;
    }

    public void setPower(int p) {
        power = p;
    }
}
class User {
    public static void main(String[] args) {
        Vehicle vehicle = new Vehicle();
        vehicle.setPower(100);
        vehicle.speedUp(20);
        System.out.println("当前速度: " + vehicle.getSpeed() + ", 当前功率: " + vehicle.getPower());

        vehicle.speedDown(5);
        System.out.println("减速后速度: " + vehicle.getSpeed() + ", 当前功率: " + vehicle.getPower());
    }
}

```

### 优化示例

![image-20250315175715151](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250315175715151.png)

```java
public class Vehicle {
    private static final int MAX_POWER = 100;
    private static final int MIN_POWER = 0;
    private double speed;
    private int power;

    /**
     * 车辆构造方法，初始化功率并设置初始速度为0
     * @param initialPower 初始功率（0-100）
     * @throws IllegalArgumentException 功率超出范围时抛出
     */
    public Vehicle(int initialPower) {
        setPower(initialPower);
        speed = 0;
    }

    /**
     * 获取当前速度（保证非负）
     * @return 当前速度值
     */
    public double getSpeed() {
        return Math.max(speed, 0);
    }

    /**
     * 加速操作
     * @param increment 加速值（必须≥0）
     * @throws IllegalArgumentException 加速值为负数时抛出
     */
    public void increaseSpeed(int increment) {
        if (increment < 0) {
            throw new IllegalArgumentException("加速值不能为负数");
        }
        speed += increment;
    }

    /**
     * 减速操作
     * @param decrement 减速值（必须≥0）
     * @throws IllegalArgumentException 减速值为负数时抛出
     */
    public void decreaseSpeed(int decrement) {
        if (decrement < 0) {
            throw new IllegalArgumentException("减速值不能为负数");
        }
        speed = Math.max(speed - decrement, 0);
    }

    /**
     * 获取当前功率
     * @return 当前功率值
     */
    public int getPower() {
        return power;
    }

    /**
     * 设置功率值（需验证范围）
     * @param p 新功率值（0-100）
     * @throws IllegalArgumentException 功率超出范围时抛出
     */
    public void setPower(int p) {
        if (p < MIN_POWER || p > MAX_POWER) {
            throw new IllegalArgumentException("功率必须在0-100之间");
        }
        power = p;
    }
}

class User {
    public static void main(String[] args) {
        try {
            Vehicle vehicle = new Vehicle(100);
            vehicle.increaseSpeed(20);
            System.out.println("当前速度: " + vehicle.getSpeed() + ", 当前功率: " + vehicle.getPower());

            vehicle.decreaseSpeed(5);
            System.out.println("减速后速度: " + vehicle.getSpeed() + ", 当前功率: " + vehicle.getPower());
        } catch (IllegalArgumentException e) {
            System.out.println("操作失败: " + e.getMessage());
        }
    }
}
```







## ShiYan5



### 1 雇员

```java
class Employee {
    private String name;
    private int age;
    private char gender;

    public Employee(String name, int age, char gender) {
        this.name = name;
        this.age = age;
        this.gender = gender;
    }

    @Override
    public String toString() {
        return String.format("雇员姓名：%s，年龄：%d，性别：%c", name, age, gender);
    }
}

class Manager extends Employee {
    private String position;
    private double annualSalary;

    public Manager(String name, int age, char gender, String position, double annualSalary) {
        super(name, age, gender);
        this.position = position;
        this.annualSalary = annualSalary;
    }

    @Override
    public String toString() {
        return super.toString() + String.format("，职位：%s，年薪：%.1f", position, annualSalary);
    }
}

class Staff extends Employee {
    private String department;
    private double monthlySalary;

    public Staff(String name, int age, char gender, String department, double monthlySalary) {
        super(name, age, gender);
        this.department = department;
        this.monthlySalary = monthlySalary;
    }

    @Override
    public String toString() {
        return super.toString() + String.format("，部门：%s，月薪：%.1f", department, monthlySalary);
    }
}

public class Test {
    public static void main(String[] args) {
        Employee ea = new Manager("张三", 30, '男', "总监", 200000.0);  //向上转型，多态
        Employee eb = new Staff("李四", 25, '女', "业务部", 1500.0);
        System.out.println(ea);
        System.out.println(eb);
    }
}
```

#### 知识点



##### 1.string 方法调用

​	![image-20250417171832975](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250417171832975.png)



##### 2.封装 继承 多态

![image-20250417172414416](C:\Users\lrx56\AppData\Roaming\Typora\typora-user-images\image-20250417172414416.png)

### 2 求图形 面积 周长

```java
// 抽象图形类
abstract class Shape {
    public abstract double area();
    public abstract double perimeter();
}

// 矩形类
class Rectangle extends Shape {
    private double length;
    private double width;

    public Rectangle(double length, double width) {
        this.length = length;
        this.width = width;
    }

    @Override
    public double area() {
        return length * width;
    }

    @Override
    public double perimeter() {
        return 2 * (length + width);
    }
}

// 三角形类（使用海伦公式）
class Triangle extends Shape {
    private double a, b, c;

    public Triangle(double a, double b, double c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }

    @Override
    public double area() {
        double s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }

    @Override
    public double perimeter() {
        return a + b + c;
    }
}

// 圆形类
class Circle extends Shape {
    private double radius;

    public Circle(double radius) {
        this.radius = radius;
    }

    @Override
    public double area() {
        return Math.PI * radius * radius;
    }

    @Override
    public double perimeter() {
        return 2 * Math.PI * radius;
    }
}

// 测试类
public class Test {
    public static void main(String[] args) {
        // 测试矩形：假设长=18.0，宽=12.0
        Shape rectangle = new Rectangle(18.0, 12.0);
        System.out.printf("矩形面积：%.1f，矩形周长：%.1f%n", 
                         rectangle.area(), rectangle.perimeter());

        // 测试三角形：假设三边为20.0、12.0、16.0
        Shape triangle = new Triangle(20.0, 12.0, 16.0);
        System.out.println("三角形面积：" + triangle.area() + 
                         "，三角形周长：" + triangle.perimeter());

        // 测试圆形：假设半径=30.5
        Shape circle = new Circle(30.5);
        System.out.println("圆形面积：" + circle.area() + 
                         "，圆形周长：" + circle.perimeter());
    }
}
```

### 3 绘制图形

```java
// 1. Shape接口
interface Shape {
    void draw();
}

// 2. 具体实现类
class Circle implements Shape {
    @Override
    public void draw() {
        System.out.println("绘制圆形 ○");
    }
}

class Rectangle implements Shape {
    @Override
    public void draw() {
        System.out.println("绘制矩形 ▭");
    }
}

class Square implements Shape {
    @Override
    public void draw() {
        System.out.println("绘制正方形 ■");
    }
}

// 3. 工厂类
class ShapeFactory {
    public Shape getShape(String shapeType) {
        if (shapeType == null) return null;
        if (shapeType.equalsIgnoreCase("CIRCLE")) {
            return new Circle();
        } else if (shapeType.equalsIgnoreCase("RECTANGLE")) {
            return new Rectangle();
        } else if (shapeType.equalsIgnoreCase("SQUARE")) {
            return new Square();
        }
        return null;
    }
}

// 4. 演示类
public class FactoryPatternDemo {
    public static void main(String[] args) {
        ShapeFactory factory = new ShapeFactory();
        
        // 获取圆形对象并调用方法
        Shape shape1 = factory.getShape("CIRCLE");
        shape1.draw();
        
        // 获取矩形对象并调用方法
        Shape shape2 = factory.getShape("RECTANGLE");
        shape2.draw();
        
        // 获取正方形对象并调用方法
        Shape shape3 = factory.getShape("SQUARE");
        shape3.draw();
    }
}
```





# Java算法题

## 1.实现单链表返转

### 思路：迭代法，递归法

```java
public class Solution {
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;
        ListNode curr = head;
        
        while (curr != null) {
            ListNode nextTemp = curr.next;  // 保存下一个节点
            curr.next = prev;               // 反转当前节点指针
            prev = curr;                    // prev后移
            curr = nextTemp;                // curr后移
        }
        return prev;
    }
}
```

```java
public class Solution {
    public ListNode reverseList(ListNode head) {
        if (head == null || head.next == null) {
            return head;
        }
        ListNode newHead = reverseList(head.next);  // 递归至末尾
        head.next.next = head;  // 反转指针
        head.next = null;        // 断开原指针
        return newHead;
    }
}
```

![image-20250510144419604](./assets/image-20250510144419604.png)
