# 树

## 大顶堆

```Java
public class MaxHeap {
    private int[] heap;     // 存储堆元素的数组
    private int size;       // 当前堆的大小
    private int capacity;   // 堆的最大容量

    // 构造函数，初始化最大堆
    public MaxHeap(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        // 堆数组的索引从1开始，所以容量加1
        this.heap = new int[capacity + 1];
        // 索引0处设置为最大值，作为哨兵
        this.heap[0] = Integer.MAX_VALUE;
    }

    // 返回父节点的索引
    private int parent(int pos) {
        return pos / 2;
    }

    // 返回左子节点的索引
    private int leftChild(int pos) {
        return (2 * pos);
    }

    // 返回右子节点的索引
    private int rightChild(int pos) {
        return (2 * pos) + 1;
    }

    // 判断节点是否为叶子节点
    private boolean isLeaf(int pos) {
        return pos >= (size / 2) && pos <= size;
    }

    // 交换两个节点的值
    private void swap(int fpos, int spos) {
        int tmp;
        tmp = heap[fpos];
        heap[fpos] = heap[spos];
        heap[spos] = tmp;
    }

    // 最大堆化：维护最大堆的性质
    private void maxHeapify(int pos) {
        // 如果是叶子节点，直接返回
        if (isLeaf(pos))
            return;

        // 如果当前节点小于其子节点，需要调整
        if (heap[pos] < heap[leftChild(pos)] ||
                heap[pos] < heap[rightChild(pos)]) {

            // 选择较大的子节点进行交换
            if (heap[leftChild(pos)] > heap[rightChild(pos)]) {
                swap(pos, leftChild(pos));
                // 递归调整被交换的子树
                maxHeapify(leftChild(pos));
            } else {
                swap(pos, rightChild(pos));
                maxHeapify(rightChild(pos));
            }
        }
    }

    // 插入新元素到最大堆
    public void insert(int element) {
        if (size >= capacity) {
            return; // 堆已满，无法插入
        }

        // 将新元素添加到堆的末尾
        heap[++size] = element;
        int current = size;

        // 向上调整堆，确保父节点大于子节点
        while (heap[current] > heap[parent(current)]) {
            swap(current, parent(current));
            current = parent(current);
        }
    }

    // 打印堆的结构（用于调试）
    public void print() {
        for (int i = 1; i <= size / 2; i++) {
            System.out.print(" PARENT : " + heap[i] + " LEFT CHILD : " +
                    heap[2 * i] + " RIGHT CHILD :" + heap[2 * i + 1]);
            System.out.println();
        }
    }

    // 提取并返回堆中的最大值（根节点）
    public int extractMax() {
        int popped = heap[1];
        // 将最后一个元素移到根节点
        heap[1] = heap[size--];
        // 重新调整堆
        maxHeapify(1);
        return popped;
    }

    public static void main(String[] arg) {
        System.out.println("The Max Heap is ");
        MaxHeap maxHeap = new MaxHeap(15);
        maxHeap.insert(5);
        maxHeap.insert(3);
        maxHeap.insert(17);
        maxHeap.insert(10);
        maxHeap.insert(84);
        maxHeap.insert(19);
        maxHeap.insert(6);
        maxHeap.insert(22);
        maxHeap.insert(9);

        maxHeap.print();
        System.out.println("The max val is " + maxHeap.extractMax());
    }
}    
```

## 小顶堆

```Java
public class MinHeap {
    private int[] heap;     // 存储堆元素的数组
    private int size;       // 当前堆的大小
    private int capacity;   // 堆的最大容量

    // 构造函数，初始化最小堆
    public MinHeap(int capacity) {
        this.capacity = capacity;
        this.size = 0;
        // 堆数组的索引从1开始，所以容量加1
        this.heap = new int[capacity + 1];
        // 索引0处设置为最小值，作为哨兵
        this.heap[0] = Integer.MIN_VALUE;
    }

    // 返回父节点的索引
    private int parent(int pos) {
        return pos / 2;
    }

    // 返回左子节点的索引
    private int leftChild(int pos) {
        return (2 * pos);
    }

    // 返回右子节点的索引
    private int rightChild(int pos) {
        return (2 * pos) + 1;
    }

    // 判断节点是否为叶子节点
    private boolean isLeaf(int pos) {
        return pos >= (size / 2) && pos <= size;
    }

    // 交换两个节点的值
    private void swap(int fpos, int spos) {
        int tmp;
        tmp = heap[fpos];
        heap[fpos] = heap[spos];
        heap[spos] = tmp;
    }

    // 最小堆化：维护最小堆的性质
    private void minHeapify(int pos) {
        // 如果是叶子节点，直接返回
        if (isLeaf(pos))
            return;

        // 如果当前节点大于其子节点，需要调整
        if (heap[pos] > heap[leftChild(pos)] ||
                heap[pos] > heap[rightChild(pos)]) {

            // 选择较小的子节点进行交换
            if (heap[leftChild(pos)] < heap[rightChild(pos)]) {
                swap(pos, leftChild(pos));
                // 递归调整被交换的子树
                minHeapify(leftChild(pos));
            } else {
                swap(pos, rightChild(pos));
                minHeapify(rightChild(pos));
            }
        }
    }

    // 插入新元素到最小堆
    public void insert(int element) {
        if (size >= capacity) {
            return; // 堆已满，无法插入
        }

        // 将新元素添加到堆的末尾
        heap[++size] = element;
        int current = size;

        // 向上调整堆，确保父节点小于子节点
        while (heap[current] < heap[parent(current)]) {
            swap(current, parent(current));
            current = parent(current);
        }
    }

    // 打印堆的结构（用于调试）
    public void print() {
        for (int i = 1; i <= size / 2; i++) {
            System.out.print(" PARENT : " + heap[i] + " LEFT CHILD : " +
                    heap[2 * i] + " RIGHT CHILD :" + heap[2 * i + 1]);
            System.out.println();
        }
    }

    // 提取并返回堆中的最小值（根节点）
    public int extractMin() {
        int popped = heap[1];
        // 将最后一个元素移到根节点
        heap[1] = heap[size--];
        // 重新调整堆
        minHeapify(1);
        return popped;
    }

    public static void main(String[] arg) {
        System.out.println("The Min Heap is ");
        MinHeap minHeap = new MinHeap(15);
        minHeap.insert(5);
        minHeap.insert(3);
        minHeap.insert(17);
        minHeap.insert(10);
        minHeap.insert(84);
        minHeap.insert(19);
        minHeap.insert(6);
        minHeap.insert(22);
        minHeap.insert(9);

        minHeap.print();
        System.out.println("The min val is " + minHeap.extractMin());
    }
}    
```

