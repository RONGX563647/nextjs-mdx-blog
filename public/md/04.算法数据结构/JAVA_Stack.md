# STACK

### 数组实现

```Java
public class ArrayStack<T> {
    private T[] array;          // 存储栈元素的数组
    private int top;            // 栈顶指针
    private int capacity;       // 栈的容量

    // 构造函数，初始化栈
    @SuppressWarnings("unchecked")
    public ArrayStack(int capacity) {
        this.capacity = capacity;
        this.top = -1;          // 初始栈顶指针为-1，表示栈为空
        this.array = (T[]) new Object[capacity];
    }

    // 判断栈是否为空
    public boolean isEmpty() {
        return top == -1;
    }

    // 判断栈是否已满
    public boolean isFull() {
        return top == capacity - 1;
    }

    // 入栈操作
    public void push(T element) {
        if (isFull()) {
            throw new IllegalStateException("栈已满，无法入栈");
        }
        array[++top] = element;   // 先移动栈顶指针，再存入元素
    }

    // 出栈操作
    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("栈为空，无法出栈");
        }
        return array[top--];      // 先返回栈顶元素，再移动栈顶指针
    }

    // 获取栈顶元素但不出栈
    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("栈为空，无法获取栈顶元素");
        }
        return array[top];
    }

    // 获取栈的大小
    public int size() {
        return top + 1;
    }

    // 清空栈
    public void clear() {
        top = -1;
        // 帮助垃圾回收
        for (int i = 0; i <= top; i++) {
            array[i] = null;
        }
    }

    // 打印栈内元素
    public void printStack() {
        if (isEmpty()) {
            System.out.println("栈为空");
            return;
        }
        System.out.print("栈内元素（从栈底到栈顶）：");
        for (int i = 0; i <= top; i++) {
            System.out.print(array[i] + " ");
        }
        System.out.println();
    }
}    
```



### 链表实现

```java
public class LinkedListStack<T> {
    private Node<T> top;        // 栈顶节点
    private int size;           // 栈的大小

    // 链表节点类
    private static class Node<T> {
        T data;                 // 节点数据
        Node<T> next;           // 指向下一个节点的引用

        public Node(T data) {
            this.data = data;
            this.next = null;
        }
    }

    // 构造函数，初始化栈
    public LinkedListStack() {
        this.top = null;
        this.size = 0;
    }

    // 判断栈是否为空
    public boolean isEmpty() {
        return top == null;
    }

    // 获取栈的大小
    public int size() {
        return size;
    }

    // 入栈操作
    public void push(T element) {
        Node<T> newNode = new Node<>(element);
        newNode.next = top;     // 新节点指向原栈顶
        top = newNode;          // 更新栈顶为新节点
        size++;
    }

    // 出栈操作
    public T pop() {
        if (isEmpty()) {
            throw new IllegalStateException("栈为空，无法出栈");
        }
        T data = top.data;      // 获取栈顶元素
        top = top.next;         // 更新栈顶为原栈顶的下一个节点
        size--;
        return data;
    }

    // 获取栈顶元素但不出栈
    public T peek() {
        if (isEmpty()) {
            throw new IllegalStateException("栈为空，无法获取栈顶元素");
        }
        return top.data;
    }

    // 清空栈
    public void clear() {
        top = null;
        size = 0;
    }

    // 打印栈内元素
    public void printStack() {
        if (isEmpty()) {
            System.out.println("栈为空");
            return;
        }
        System.out.print("栈内元素（从栈顶到栈底）：");
        Node<T> current = top;
        while (current != null) {
            System.out.print(current.data + " ");
            current = current.next;
        }
        System.out.println();
    }
}    
```

### 基础算法

```java
import java.util.Stack;

public class StackAlgorithms {
    // 1. 括号匹配问题
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if ((c == ')' && top != '(') ||
                    (c == ']' && top != '[') ||
                    (c == '}' && top != '{')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }

    // 2. 逆波兰表达式求值
    public static int evalRPN(String[] tokens) {
        Stack<Integer> stack = new Stack<>();
        for (String token : tokens) {
            if (isOperator(token)) {
                int b = stack.pop();
                int a = stack.pop();
                stack.push(applyOp(token, a, b));
            } else {
                stack.push(Integer.parseInt(token));
            }
        }
        return stack.pop();
    }

    private static boolean isOperator(String token) {
        return token.equals("+") || token.equals("-") || token.equals("*") || token.equals("/");
    }

    private static int applyOp(String op, int a, int b) {
        switch (op) {
            case "+": return a + b;
            case "-": return a - b;
            case "*": return a * b;
            case "/": return a / b;
            default: throw new IllegalArgumentException("无效运算符");
        }
    }

    // 3. 每日温度 - 下一个更高温度需要等待的天数
    public static int[] dailyTemperatures(int[] temperatures) {
        int n = temperatures.length;
        int[] result = new int[n];
        Stack<Integer> stack = new Stack<>();
        
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && temperatures[i] > temperatures[stack.peek()]) {
                int idx = stack.pop();
                result[idx] = i - idx;
            }
            stack.push(i);
        }
        
        return result;
    }

    // 4. 柱状图中最大矩形面积
    public static int largestRectangleArea(int[] heights) {
        Stack<Integer> stack = new Stack<>();
        int maxArea = 0;
        int n = heights.length;
        
        for (int i = 0; i <= n; i++) {
            int currentHeight = (i == n) ? 0 : heights[i];
            
            while (!stack.isEmpty() && currentHeight < heights[stack.peek()]) {
                int height = heights[stack.pop()];
                int width = stack.isEmpty() ? i : i - stack.peek() - 1;
                maxArea = Math.max(maxArea, height * width);
            }
            
            stack.push(i);
        }
        
        return maxArea;
    }

    // 5. 有效的括号字符串（包含*）
    public static boolean checkValidString(String s) {
        Stack<Integer> leftStack = new Stack<>();
        Stack<Integer> starStack = new Stack<>();
        
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (c == '(') {
                leftStack.push(i);
            } else if (c == '*') {
                starStack.push(i);
            } else {
                if (!leftStack.isEmpty()) {
                    leftStack.pop();
                } else if (!starStack.isEmpty()) {
                    starStack.pop();
                } else {
                    return false;
                }
            }
        }
        
        // 处理剩余的左括号
        while (!leftStack.isEmpty() && !starStack.isEmpty()) {
            if (leftStack.pop() > starStack.pop()) {
                return false;
            }
        }
        
        return leftStack.isEmpty();
    }

    // 6. 简化路径
    public static String simplifyPath(String path) {
        Stack<String> stack = new Stack<>();
        String[] components = path.split("/");
        
        for (String component : components) {
            if (component.isEmpty() || component.equals(".")) {
                continue;
            } else if (component.equals("..")) {
                if (!stack.isEmpty()) {
                    stack.pop();
                }
            } else {
                stack.push(component);
            }
        }
        
        if (stack.isEmpty()) {
            return "/";
        }
        
        StringBuilder result = new StringBuilder();
        for (String dir : stack) {
            result.append("/").append(dir);
        }
        return result.toString();
    }

    // 7. 单调栈 - 下一个更大元素
    public static int[] nextGreaterElement(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        Stack<Integer> stack = new Stack<>();
        
        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && nums[i] > nums[stack.peek()]) {
                int idx = stack.pop();
                result[idx] = nums[i];
            }
            stack.push(i);
        }
        
        // 处理没有更大元素的位置
        while (!stack.isEmpty()) {
            result[stack.pop()] = -1;
        }
        
        return result;
    }

    // 8. 最小栈 - 支持获取最小值的栈
    static class MinStack {
        private Stack<Integer> stack;
        private Stack<Integer> minStack;

        public MinStack() {
            stack = new Stack<>();
            minStack = new Stack<>();
        }

        public void push(int x) {
            stack.push(x);
            if (minStack.isEmpty() || x <= minStack.peek()) {
                minStack.push(x);
            }
        }

        public void pop() {
            if (stack.pop().equals(minStack.peek())) {
                minStack.pop();
            }
        }

        public int top() {
            return stack.peek();
        }

        public int getMin() {
            return minStack.peek();
        }
    }

    // 9. 逆置栈
    public static void reverseStack(Stack<Integer> stack) {
        if (stack.isEmpty()) return;
        int temp = stack.pop();
        reverseStack(stack);
        insertAtBottom(stack, temp);
    }

    private static void insertAtBottom(Stack<Integer> stack, int data) {
        if (stack.isEmpty()) {
            stack.push(data);
            return;
        }
        int temp = stack.pop();
        insertAtBottom(stack, data);
        stack.push(temp);
    }

    // 10. 验证栈序列
    public static boolean validateStackSequences(int[] pushed, int[] popped) {
        Stack<Integer> stack = new Stack<>();
        int i = 0; // popped指针
        
        for (int num : pushed) {
            stack.push(num);
            while (!stack.isEmpty() && stack.peek() == popped[i]) {
                stack.pop();
                i++;
            }
        }
        
        return i == popped.length;
    }

    // 测试用例
    public static void main(String[] args) {
        // 可在此处添加测试代码
    }
}    
```

