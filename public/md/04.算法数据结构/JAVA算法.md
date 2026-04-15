# Java算法

labuladong算法学习路线



## 尚硅谷算法基础

### 数组

```java
package com.atguigu.array;

public class array {
    private int[] elementData; // 存储元素的数组
    private int size;          // 当前元素个数
    private static final int DEFAULT_CAPACITY = 10; // 默认初始容量

    // 使用默认容量初始化数组
    public array() {
        this(DEFAULT_CAPACITY);
    }

    // 自定义初始容量
    public array(int initialCapacity) {
        if (initialCapacity > 0) {
            this.elementData = new int[initialCapacity];
        } else {
            throw new IllegalArgumentException("Illegal Capacity: "+ initialCapacity);
        }
    }

    // 在数组末尾添加元素
    public void add(int value) {
        ensureCapacity(size + 1);
        elementData[size++] = value;
    }

    // 在指定索引位置插入元素
    public void add(int index, int value) {
        rangeCheckForAdd(index);
        ensureCapacity(size + 1);
        
        System.arraycopy(elementData, index, elementData, index + 1, size - index);
        elementData[index] = value;
        size++;
    }

    // 按值顺序插入（需保持数组有序）
    public void addOrdered(int value) {
        ensureCapacity(size + 1);
        int i = size - 1;
        while (i >= 0 && value < elementData[i]) {
            elementData[i + 1] = elementData[i];
            i--;
        }
        elementData[i + 1] = value;
        size++;
    }

    // 删除指定索引元素
    public int remove(int index) {
        rangeCheck(index);
        int oldValue = elementData[index];
        int numMoved = size - index - 1;
        if (numMoved > 0) {
            System.arraycopy(elementData, index + 1, elementData, index, numMoved);
        }
        size--;
        return oldValue;
    }

    // 删除第一个匹配元素
    public boolean removeValue(int value) {
        int index = linearSearch(value);
        if (index >= 0) {
            remove(index);
            return true;
        }
        return false;
    }

    // 线性查找
    public int linearSearch(int value) {
        for (int i = 0; i < size; i++) {
            if (elementData[i] == value) {
                return i;
            }
        }
        return -1;
    }

    // 二分查找（要求数组有序）
    public int binarySearch(int value) {
        int low = 0;
        int high = size - 1;
        while (low <= high) {
            int mid = (low + high) >>> 1;
            int midVal = elementData[mid];
            if (midVal < value)
                low = mid + 1;
            else if (midVal > value)
                high = mid - 1;
            else
                return mid;
        }
        return -1;
    }

    // 获取元素数量
    public int size() {
        return size;
    }

    // 检查数组是否为空
    public boolean isEmpty() {
        return size == 0;
    }

    // 动态扩容
    private void ensureCapacity(int minCapacity) {
        if (minCapacity - elementData.length > 0) {
            int oldCapacity = elementData.length;
            int newCapacity = oldCapacity + (oldCapacity >> 1); // 1.5倍扩容
            if (newCapacity - minCapacity < 0)
                newCapacity = minCapacity;
            elementData = Arrays.copyOf(elementData, newCapacity);
        }
    }

    // 索引范围检查
    private void rangeCheck(int index) {
        if (index >= size || index < 0)
            throw new IndexOutOfBoundsException("Index: "+index+", Size: "+size);
    }

    // 添加操作的索引检查
    private void rangeCheckForAdd(int index) {
        if (index > size || index < 0)
            throw new IndexOutOfBoundsException("Index: "+index+", Size: "+size);
    }

    @Override
    public String toString() {
        if (size == 0) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < size; i++) {
            sb.append(elementData[i]);
            if (i == size - 1)
                return sb.append(']').toString();
            sb.append(", ");
        }
        return sb.toString();
    }

    // 测试用例
    public static void main(String[] args) {
        array arr = new array(5);
        
        // 添加元素测试
        arr.add(10);
        arr.add(20);
        arr.add(1, 15); // 在索引1插入
        System.out.println("添加元素后: " + arr); // [10, 15, 20]
        
        // 顺序插入测试
        arr.addOrdered(17);
        System.out.println("顺序插入后: " + arr); // [10, 15, 17, 20]
        
        // 删除测试
        arr.remove(1);
        System.out.println("删除索引1后: " + arr); // [10, 17, 20]
        
        // 查找测试
        System.out.println("查找20的位置: " + arr.linearSearch(20)); // 2
        System.out.println("二分查找17: " + arr.binarySearch(17)); // 1
    }
}
```



### 稀疏数组

```java
package com.atguigu.array;

public class xishushuzu {
    // 二维数组转稀疏数组
    public static int[][] toSparseArray(int[][] original) {
        int rows = original.length;
        int cols = original[0].length;
        int count = 0;

        // 统计非零元素数量
        for (int[] row : original) {
            for (int val : row) {
                if (val != 0) count++;
            }
        }

        // 创建稀疏数组
        int[][] sparse = new int[count + 1][3];
        sparse[0][0] = rows;
        sparse[0][1] = cols;
        sparse[0][2] = count;

        // 填充数据
        int index = 1;
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (original[i][j] != 0) {
                    sparse[index][0] = i;
                    sparse[index][1] = j;
                    sparse[index][2] = original[i][j];
                    index++;
                }
            }
        }
        return sparse;
    }

    // 稀疏数组转二维数组
    public static int[][] fromSparseArray(int[][] sparse) {
        int rows = sparse[0][0];
        int cols = sparse[0][1];
        int[][] original = new int[rows][cols];

        // 恢复数据
        for (int i = 1; i < sparse.length; i++) {
            original[sparse[i][0]][sparse[i][1]] = sparse[i][2];
        }
        return original;
    }

    // 测试用例
    public static void main(String[] args) {
        // 原始二维数组示例（棋盘）
        int[][] chessArr = {
            {0, 0, 0, 0, 0},
            {0, 1, 0, 0, 0},
            {0, 0, 2, 0, 0},
            {0, 0, 0, 0, 0}
        };

        // 转换为稀疏数组
        int[][] sparse = toSparseArray(chessArr);
        System.out.println("稀疏数组：");
        printArray(sparse);

        // 转换回二维数组
        int[][] recovered = fromSparseArray(sparse);
        System.out.println("\n恢复后的数组：");
        printArray(recovered);
    }

    // 辅助打印方法
    private static void printArray(int[][] arr) {
        for (int[] row : arr) {
            for (int val : row) {
                System.out.printf("%d\t", val);
            }
            System.out.println();
        }
    }
}
```



### 队列

```java
package com.atguigu.deque;

public class deque {
    // 基础数组队列（FIFO）
    static class ArrayQueue {
        private int[] data;
        private int front; // 队头指针
        private int rear;  // 队尾指针
        private int capacity;

        public ArrayQueue(int size) {
            capacity = size;
            data = new int[capacity];
            front = rear = 0;
        }

        // 入队
        public boolean enqueue(int value) {
            if (isFull()) return false;
            data[rear++] = value;
            return true;
        }

        // 出队
        public int dequeue() {
            if (isEmpty()) throw new RuntimeException("Queue is empty");
            return data[front++];
        }

        public boolean isEmpty() {
            return front == rear;
        }

        public boolean isFull() {
            return rear == capacity;
        }
    }

    // 循环队列（解决空间复用问题）
    static class CircularQueue {
        private int[] data;
        private int front;
        private int rear;
        private int capacity;

        public CircularQueue(int size) {
            capacity = size + 1; // 留一个空位判断满队列
            data = new int[capacity];
            front = rear = 0;
        }

        public boolean enqueue(int value) {
            if (isFull()) return false;
            data[rear] = value;
            rear = (rear + 1) % capacity;
            return true;
        }

        public int dequeue() {
            if (isEmpty()) throw new RuntimeException("Queue is empty");
            int val = data[front];
            front = (front + 1) % capacity;
            return val;
        }

        public boolean isEmpty() {
            return front == rear;
        }

        public boolean isFull() {
            return (rear + 1) % capacity == front;
        }
    }

    // 链式队列（节点结构）
    static class LinkedQueue {
        private static class Node {
            int data;
            Node next;
            
            Node(int data) {
                this.data = data;
            }
        }

        private Node head;
        private Node tail;

        public void enqueue(int value) {
            Node newNode = new Node(value);
            if (tail == null) {
                head = tail = newNode;
            } else {
                tail.next = newNode;
                tail = newNode;
            }
        }

        public int dequeue() {
            if (isEmpty()) throw new RuntimeException("Queue is empty");
            int val = head.data;
            head = head.next;
            if (head == null) tail = null;
            return val;
        }

        public boolean isEmpty() {
            return head == null;
        }
    }

    // 双端队列（支持两端操作）
    static class ArrayDeque {
        private int[] data;
        private int front;
        private int rear;
        private int capacity;

        public ArrayDeque(int size) {
            capacity = size;
            data = new int[capacity * 2]; // 前后留有空间
            front = rear = capacity;
        }

        public void addFirst(int value) {
            data[--front] = value;
        }

        public void addLast(int value) {
            data[rear++] = value;
        }

        public int removeFirst() {
            return data[front++];
        }

        public int removeLast() {
            return data[--rear];
        }

        public boolean isEmpty() {
            return front == rear;
        }
    }

    // 优先队列（基于小顶堆）
    static class PriorityQueue {
        private int[] heap;
        private int size;

        public PriorityQueue(int capacity) {
            heap = new int[capacity];
            size = 0;
        }

        public void enqueue(int value) {
            if (size == heap.length) return;
            
            heap[size] = value;
            siftUp(size);
            size++;
        }

        public int dequeue() {
            if (isEmpty()) throw new RuntimeException("Queue is empty");
            int min = heap[0];
            heap[0] = heap[--size];
            siftDown(0);
            return min;
        }

        private void siftUp(int index) {
            while (index > 0 && heap[index] < heap[(index-1)/2]) {
                swap(index, (index-1)/2);
                index = (index-1)/2;
            }
        }

        private void siftDown(int index) {
            while (2*index + 1 < size) {
                int child = 2*index + 1;
                if (child+1 < size && heap[child+1] < heap[child]) {
                    child++;
                }
                if (heap[index] <= heap[child]) break;
                swap(index, child);
                index = child;
            }
        }

        private void swap(int i, int j) {
            int temp = heap[i];
            heap[i] = heap[j];
            heap[j] = temp;
        }

        public boolean isEmpty() {
            return size == 0;
        }
    }

    // 测试所有队列类型
    public static void main(String[] args) {
        System.out.println("=== 数组队列测试 ===");
        ArrayQueue aq = new ArrayQueue(3);
        aq.enqueue(1); aq.enqueue(2); aq.enqueue(3);
        System.out.println(aq.dequeue()); // 1
        System.out.println(aq.dequeue()); // 2

        System.out.println("\n=== 循环队列测试 ===");
        CircularQueue cq = new CircularQueue(3);
        cq.enqueue(10); cq.enqueue(20); cq.enqueue(30);
        System.out.println(cq.dequeue()); // 10
        cq.enqueue(40); // 成功插入

        System.out.println("\n=== 优先队列测试 ===");
        PriorityQueue pq = new PriorityQueue(5);
        pq.enqueue(5); pq.enqueue(3); pq.enqueue(8);
        System.out.println(pq.dequeue()); // 3
        System.out.println(pq.dequeue()); // 5
    }
}

```



### 链表

```java
package com.atguigu.linkedlist;

public class linkedlist {
    // 链表节点定义
    static class Node {
        int data;
        Node next;
        
        Node(int data) {
            this.data = data;
        }
    }

    // 链表操作类
    static class SingleLinkedList {
        private Node head;
        private Node tail;
        private int size;

        // 头部插入
        public void addFirst(int data) {
            Node newNode = new Node(data);
            if (head == null) {
                head = tail = newNode;
            } else {
                newNode.next = head;
                head = newNode;
            }
            size++;
        }

        // 尾部插入
        public void addLast(int data) {
            Node newNode = new Node(data);
            if (head == null) {
                head = tail = newNode;
            } else {
                tail.next = newNode;
                tail = newNode;
            }
            size++;
        }

        // 指定位置插入
        public void insertAt(int index, int data) {
            if (index < 0 || index > size) {
                throw new IndexOutOfBoundsException();
            }
            if (index == 0) {
                addFirst(data);
                return;
            }
            if (index == size) {
                addLast(data);
                return;
            }
            
            Node prev = getNode(index - 1);
            Node newNode = new Node(data);
            newNode.next = prev.next;
            prev.next = newNode;
            size++;
        }

        // 删除节点
        public boolean remove(int data) {
            if (head == null) return false;
            
            if (head.data == data) {
                head = head.next;
                if (head == null) tail = null;
                size--;
                return true;
            }
            
            Node current = head;
            while (current.next != null) {
                if (current.next.data == data) {
                    current.next = current.next.next;
                    if (current.next == null) {
                        tail = current;
                    }
                    size--;
                    return true;
                }
                current = current.next;
            }
            return false;
        }

        // 反转链表（迭代法）
        public void reverse() {
            Node prev = null;
            Node current = head;
            tail = head;
            
            while (current != null) {
                Node next = current.next;
                current.next = prev;
                prev = current;
                current = next;
            }
            head = prev;
        }

        // 检测环（快慢指针法）
        public boolean hasCycle() {
            if (head == null) return false;
            
            Node slow = head;
            Node fast = head;
            while (fast != null && fast.next != null) {
                slow = slow.next;
                fast = fast.next.next;
                if (slow == fast) return true;
            }
            return false;
        }

        // 获取中间节点
        public Node getMiddle() {
            if (head == null) return null;
            
            Node slow = head;
            Node fast = head;
            while (fast.next != null && fast.next.next != null) {
                slow = slow.next;
                fast = fast.next.next;
            }
            return slow;
        }

        // 合并两个有序链表（静态方法）
        public static Node mergeSortedLists(Node list1, Node list2) {
            Node dummy = new Node(-1);
            Node current = dummy;
            
            while (list1 != null && list2 != null) {
                if (list1.data < list2.data) {
                    current.next = list1;
                    list1 = list1.next;
                } else {
                    current.next = list2;
                    list2 = list2.next;
                }
                current = current.next;
            }
            current.next = (list1 != null) ? list1 : list2;
            return dummy.next;
        }

        // 辅助方法：获取指定位置节点
        private Node getNode(int index) {
            if (index < 0 || index >= size) {
                throw new IndexOutOfBoundsException();
            }
            Node current = head;
            for (int i = 0; i < index; i++) {
                current = current.next;
            }
            return current;
        }

        // 打印链表
        public void print() {
            Node current = head;
            while (current != null) {
                System.out.print(current.data + " -> ");
                current = current.next;
            }
            System.out.println("null");
        }
    }

    // 测试用例
    public static void main(String[] args) {
        // 创建链表并测试
        SingleLinkedList list = new SingleLinkedList();
        list.addLast(1);
        list.addLast(3);
        list.addLast(5);
        list.insertAt(1, 2);
        System.out.print("原始链表：");
        list.print(); // 1 -> 2 -> 3 -> 5 -> null

        // 反转测试
        list.reverse();
        System.out.print("反转后：");
        list.print(); // 5 -> 3 -> 2 -> 1 -> null

        // 合并测试
        SingleLinkedList list2 = new SingleLinkedList();
        list2.addLast(2);
        list2.addLast(4);
        list2.addLast(6);
        
        Node merged = SingleLinkedList.mergeSortedLists(list.head, list2.head);
        System.out.print("合并后：");
        while (merged != null) {
            System.out.print(merged.data + " -> ");
            merged = merged.next;
        }
        System.out.println("null");
    }
}
```

### 栈



### 栈计算器

### 前中后缀表达式

### 递归问题

### 迷宫回溯问题

### 八皇后问题

### 排序算法

### 查找算法

#### 二分查找

#### 插值查找

#### 斐波那契查找

### 哈希表

### 二叉树

#### 	遍历二叉树

```java
package com.atguigu;

public class Test01 {
    // 定义二叉树节点类
    static class TreeNode {
        int val;
        TreeNode left;
        TreeNode right;
        
        TreeNode(int x) {
            val = x;
        }
    }

    // 前序遍历（根-左-右）
    public static void preOrder(TreeNode node) {
        if (node == null) return;
        System.out.print(node.val + " ");
        preOrder(node.left);
        preOrder(node.right);
    }

    // 中序遍历（左-根-右）
    public static void inOrder(TreeNode node) {
        if (node == null) return;
        inOrder(node.left);
        System.out.print(node.val + " ");
        inOrder(node.right);
    }

    // 后序遍历（左-右-根）
    public static void postOrder(TreeNode node) {
        if (node == null) return;
        postOrder(node.left);
        postOrder(node.right);
        System.out.print(node.val + " ");
    }

    public static void main(String[] args) {
        // 创建示例二叉树
        //       1
        //     /   \
        //    2     3
        //   / \
        //  4   5
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        root.left.left = new TreeNode(4);
        root.left.right = new TreeNode(5);

        System.out.print("前序遍历: ");
        preOrder(root);
        
        System.out.print("\n中序遍历: ");
        inOrder(root);
        
        System.out.print("\n后序遍历: ");
        postOrder(root);
    }
}
```



## 经典题型

### 约瑟夫问题

~~~markdown
### 约瑟夫问题（Josephus Problem）

**问题描述**：  
有 `n` 个人围成一圈，从第一个人开始报数，报到 `k` 的人出列，然后从出列的下一个人重新开始报数，直到所有人都出列。求最后剩下的人的编号。


### 方法一：模拟法（链表实现）

**思路**：  
使用循环链表模拟报数和删除过程，每次找到第 `k` 个人并删除，直到链表中只剩一人。

**Java代码**：
```java
class Node {
    int val;
    Node next;
    public Node(int val) {
        this.val = val;
    }
}

public class Josephus {
    public int josephus(int n, int k) {
        if (n == 1) return 1;
        
        // 构建循环链表
        Node head = new Node(1);
        Node prev = head;
        for (int i = 2; i <= n; i++) {
            prev.next = new Node(i);
            prev = prev.next;
        }
        prev.next = head; // 形成环
        
        Node curr = head;
        Node last = prev;
        
        // 模拟删除过程
        while (curr.next != curr) {
            // 找到第k-1个节点
            for (int i = 1; i < k; i++) {
                last = curr;
                curr = curr.next;
            }
            // 删除第k个节点
            last.next = curr.next;
            curr = last.next; // 从下一个节点重新开始
        }
        
        return curr.val;
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(nk)，每次删除操作需要遍历 `k` 个节点，共进行 `n` 次删除。
- **空间复杂度**：O(n)，用于存储链表节点。


### 方法二：模拟法（数组实现）

**思路**：  
使用布尔数组标记每个人是否已出列，模拟报数过程，直到找到最后一个人。

**Java代码**：
```java
public class Josephus {
    public int josephus(int n, int k) {
        if (n == 1) return 1;
        
        boolean[] eliminated = new boolean[n];
        int count = 0; // 已出列人数
        int index = 0; // 当前位置
        int step = 0;  // 报数计数器
        
        while (count < n - 1) {
            if (!eliminated[index]) {
                step++;
                if (step == k) {
                    eliminated[index] = true;
                    step = 0;
                    count++;
                }
            }
            index = (index + 1) % n; // 循环
        }
        
        // 找到最后一个未出列的人
        for (int i = 0; i < n; i++) {
            if (!eliminated[i]) {
                return i + 1; // 转换为1-based编号
            }
        }
        
        return -1; // 不会执行到这里
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(nk)，每次找到第 `k` 个人需要遍历数组。
- **空间复杂度**：O(n)，用于标记出列状态。


### 方法三：数学递推法（迭代）

**思路**：  
通过递推公式 `f(n, k) = (f(n-1, k) + k) % n` 计算最后剩下的人的编号，其中 `f(n, k)` 表示 `n` 个人时的结果。

**Java代码**：
```java
public class Josephus {
    public int josephus(int n, int k) {
        int result = 0; // f(1, k) = 0 (0-based)
        for (int i = 2; i <= n; i++) {
            result = (result + k) % i;
        }
        return result + 1; // 转换为1-based编号
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(n)，只需一次遍历。
- **空间复杂度**：O(1)，仅需常数级额外空间。


### 方法四：数学递推法（递归）

**思路**：  
递归实现递推公式 `f(n) = (f(n-1) + k) % n`，终止条件为 `n = 1`。

**Java代码**：
```java
public class Josephus {
    public int josephus(int n, int k) {
        if (n == 1) return 1;
        return (josephus(n - 1, k) + k - 1) % n + 1;
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(n)，递归深度为 `n`。
- **空间复杂度**：O(n)，递归栈空间。


### 方法五：位运算优化（k=2时）

**思路**：  
当 `k=2` 时，存在高效解法：将 `n` 的二进制表示左移一位，最高位补0，得到的数即为结果。

**Java代码**：
```java
public class Josephus {
    public int josephus(int n) {
        if (n == 1) return 1;
        
        // 找到小于等于n的最大2的幂
        int highestPowerOf2 = Integer.highestOneBit(n);
        
        // 计算结果：2 * (n - highestPowerOf2) + 1
        return 2 * (n - highestPowerOf2) + 1;
    }
}
```

**复杂度分析**：  
- **时间复杂度**：O(1)，仅需位运算。
- **空间复杂度**：O(1)，仅需常数级额外空间。


### 五种方法对比

| 方法               | 时间复杂度 | 空间复杂度 | 适用场景               | 优势                |
|--------------------|------------|------------|------------------------|---------------------|
| 链表模拟           | O(nk)      | O(n)       | 通用场景               | 直观易理解          |
| 数组模拟           | O(nk)      | O(n)       | 通用场景               | 实现简单            |
| 数学迭代           | O(n)       | O(1)       | 通用场景               | 高效，节省空间      |
| 数学递归           | O(n)       | O(n)       | 通用场景               | 代码简洁            |
| 位运算优化(k=2)    | O(1)       | O(1)       | k=2的特殊情况          | 极高效              |

- **数学方法（迭代/递归）**是最通用且高效的解法，适用于所有情况。
- **位运算优化**仅适用于 `k=2` 的特殊情况，时间复杂度为常数级。
- **模拟方法（链表/数组）**直观但效率较低，适合小规模数据或教学演示。
~~~







## 黑马算法

