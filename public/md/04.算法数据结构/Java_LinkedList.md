# LinkedList

### class node

```java
// 单链表节点定义
class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}    
```



### 基础算法实现

```java
public class LinkedListAlgorithms {
    // 1. 反转链表 - 迭代法
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode reverseList(ListNode head) {
        ListNode prev = null;    // 前驱节点
        ListNode curr = head;    // 当前节点
        while (curr != null) {
            ListNode nextTemp = curr.next;  // 临时保存下一个节点
            curr.next = prev;  // 当前节点指向前驱节点
            prev = curr;       // 前驱节点后移
            curr = nextTemp;   // 当前节点后移
        }
        return prev;  // 返回新的头节点
    }

    // 2. 反转链表 - 递归法
    // 时间复杂度: O(n)，空间复杂度: O(n)（递归栈深度）
    public ListNode reverseListRecursive(ListNode head) {
        if (head == null || head.next == null) return head;  // 递归终止条件
        ListNode p = reverseListRecursive(head.next);  // 递归反转后续节点
        head.next.next = head;  // 反转指针方向
        head.next = null;       // 断开原指针
        return p;  // 返回新的头节点
    }

    // 3. 合并两个有序链表
    // 时间复杂度: O(m+n)，空间复杂度: O(1)
    public ListNode mergeTwoLists(ListNode l1, ListNode l2) {
        ListNode dummy = new ListNode(0);  // 虚拟头节点
        ListNode tail = dummy;  // 尾指针
        while (l1 != null && l2 != null) {
            if (l1.val < l2.val) {
                tail.next = l1;
                l1 = l1.next;
            } else {
                tail.next = l2;
                l2 = l2.next;
            }
            tail = tail.next;  // 尾指针后移
        }
        tail.next = l1 != null ? l1 : l2;  // 连接剩余部分
        return dummy.next;  // 返回真正的头节点
    }

    // 4. 链表中环的检测 - 快慢指针法
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public boolean hasCycle(ListNode head) {
        if (head == null) return false;
        ListNode slow = head;  // 慢指针，每次移动一步
        ListNode fast = head.next;  // 快指针，每次移动两步
        while (slow != fast) {
            if (fast == null || fast.next == null) return false;  // 无环
            slow = slow.next;
            fast = fast.next.next;
        }
        return true;  // 相遇即有环
    }

    // 5. 删除链表倒数第n个节点
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode removeNthFromEnd(ListNode head, int n) {
        ListNode dummy = new ListNode(0);  // 虚拟头节点处理边界情况
        dummy.next = head;
        ListNode first = dummy;  // 第一个指针
        ListNode second = dummy;  // 第二个指针
        
        // 移动first指针n+1步
        for (int i = 1; i <= n + 1; i++) {
            first = first.next;
        }
        
        // 同时移动两个指针直到first到达末尾
        while (first != null) {
            first = first.next;
            second = second.next;
        }
        
        // 删除倒数第n个节点
        second.next = second.next.next;
        return dummy.next;
    }

    // 6. 求链表的中间节点 - 快慢指针法
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode middleNode(ListNode head) {
        ListNode slow = head;  // 慢指针
        ListNode fast = head;  // 快指针
        while (fast != null && fast.next != null) {
            slow = slow.next;      // 慢指针移动一步
            fast = fast.next.next; // 快指针移动两步
        }
        return slow;  // 慢指针指向中间节点
    }

    // 7. 链表排序 - 归并排序
    // 时间复杂度: O(nlogn)，空间复杂度: O(logn)（递归栈深度）
    public ListNode sortList(ListNode head) {
        if (head == null || head.next == null)
            return head;
        
        // 分割链表为两部分
        ListNode prev = null, slow = head, fast = head;
        while (fast != null && fast.next != null) {
            prev = slow;
            slow = slow.next;
            fast = fast.next.next;
        }
        prev.next = null;  // 断开链表
        
        // 递归排序左右两部分
        ListNode l1 = sortList(head);
        ListNode l2 = sortList(slow);
        
        // 合并两个有序链表
        return mergeTwoLists(l1, l2);
    }

    // 8. 链表去重 - 保留唯一
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode deleteDuplicates(ListNode head) {
        ListNode current = head;
        while (current != null && current.next != null) {
            if (current.next.val == current.val) {
                current.next = current.next.next;  // 删除重复节点
            } else {
                current = current.next;  // 移动到下一个不同节点
            }
        }
        return head;
    }

    // 9. 链表去重 - 所有重复节点删除
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode deleteDuplicatesAll(ListNode head) {
        if (head == null) return null;
        ListNode dummy = new ListNode(0);  // 虚拟头节点处理边界情况
        dummy.next = head;
        ListNode prev = dummy;  // 前驱节点
        ListNode curr = head;   // 当前节点
        
        while (curr != null) {
            // 跳过所有重复节点
            while (curr.next != null && curr.val == curr.next.val) {
                curr = curr.next;
            }
            
            // 判断是否存在重复节点
            if (prev.next == curr) {
                prev = prev.next;  // 没有重复节点，直接移动prev
            } else {
                prev.next = curr.next;  // 删除所有重复节点
            }
            
            curr = curr.next;  // 移动当前节点
        }
        
        return dummy.next;
    }

    // 10. 判断链表是否为回文结构
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public boolean isPalindrome(ListNode head) {
        if (head == null || head.next == null) return true;
        
        // 找到中间节点
        ListNode slow = head;
        ListNode fast = head;
        while (fast.next != null && fast.next.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        
        // 反转后半部分链表
        ListNode secondHalf = reverseList(slow.next);
        ListNode p1 = head;
        ListNode p2 = secondHalf;
        
        // 比较前后两部分
        while (p2 != null) {
            if (p1.val != p2.val) return false;
            p1 = p1.next;
            p2 = p2.next;
        }
        
        // 恢复链表（可选）
        slow.next = reverseList(secondHalf);
        
        return true;
    }

    // 11. 链表分区 - 小于x的节点移到前面
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode partition(ListNode head, int x) {
        ListNode beforeHead = new ListNode(0);  // 小于x的节点的虚拟头
        ListNode before = beforeHead;  // 小于x的节点的尾指针
        ListNode afterHead = new ListNode(0);  // 大于等于x的节点的虚拟头
        ListNode after = afterHead;  // 大于等于x的节点的尾指针
        
        // 遍历链表，将节点分到两个链表中
        while (head != null) {
            if (head.val < x) {
                before.next = head;
                before = before.next;
            } else {
                after.next = head;
                after = after.next;
            }
            head = head.next;
        }
        
        // 连接两个链表
        after.next = null;  // 切断after链表的尾部
        before.next = afterHead.next;  // 连接两个链表
        
        return beforeHead.next;
    }

    // 12. 两数相加 - 链表表示的数字相加
    // 时间复杂度: O(max(m,n))，空间复杂度: O(max(m,n))
    public ListNode addTwoNumbers(ListNode l1, ListNode l2) {
        ListNode dummyHead = new ListNode(0);  // 虚拟头节点
        ListNode p = l1, q = l2, curr = dummyHead;
        int carry = 0;  // 进位值
        
        while (p != null || q != null) {
            int x = (p != null) ? p.val : 0;
            int y = (q != null) ? q.val : 0;
            int sum = carry + x + y;
            carry = sum / 10;  // 计算进位
            curr.next = new ListNode(sum % 10);  // 创建新节点
            curr = curr.next;  // 移动指针
            
            if (p != null) p = p.next;
            if (q != null) q = q.next;
        }
        
        // 处理最后一个进位
        if (carry > 0) {
            curr.next = new ListNode(carry);
        }
        
        return dummyHead.next;
    }

    // 13. 复制带随机指针的链表
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public Node copyRandomList(Node head) {
        if (head == null) return null;
        
        // 第一步：在原链表每个节点后插入复制节点
        Node curr = head;
        while (curr != null) {
            Node copy = new Node(curr.val);
            copy.next = curr.next;
            curr.next = copy;
            curr = copy.next;
        }
        
        // 第二步：设置随机指针
        curr = head;
        while (curr != null) {
            if (curr.random != null) {
                curr.next.random = curr.random.next;  // 复制节点的随机指针指向原节点随机指针的下一个节点
            }
            curr = curr.next.next;
        }
        
        // 第三步：拆分链表
        curr = head;
        Node dummy = new Node(0);  // 复制链表的虚拟头节点
        Node copyCurr = dummy;     // 复制链表的尾指针
        
        while (curr != null) {
            Node copy = curr.next;
            copyCurr.next = copy;
            copyCurr = copyCurr.next;
            
            curr.next = copy.next;  // 恢复原链表
            curr = curr.next;
        }
        
        return dummy.next;
    }

    // 14. 旋转链表 - 右移k个位置
    // 时间复杂度: O(n)，空间复杂度: O(1)
    public ListNode rotateRight(ListNode head, int k) {
        if (head == null) return null;
        
        // 计算链表长度并找到尾节点
        int n = 1;
        ListNode tail = head;
        while (tail.next != null) {
            tail = tail.next;
            n++;
        }
        
        // 处理k大于链表长度的情况
        k = k % n;
        if (k == 0) return head;
        
        // 找到新的尾节点（第n-k-1个节点）
        ListNode newTail = head;
        for (int i = 0; i < n - k - 1; i++) {
            newTail = newTail.next;
        }
        
        // 旋转链表
        ListNode newHead = newTail.next;
        newTail.next = null;  // 断开原链表
        tail.next = head;     // 连接首尾
        
        return newHead;
    }

    // 测试用例
    public static void main(String[] args) {
        // 可在此处添加测试代码
    }
}

// 带随机指针的链表节点（用于问题13）
class Node {
    int val;
    Node next;
    Node random;
    public Node(int val) {
        this.val = val;
        this.next = null;
        this.random = null;
    }
}    
```



## 算法题录

[基础](https://blog.csdn.net/qq_42265220/article/details/120231277?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522b975f27c537dfa94357d7a3044346ae2%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=b975f27c537dfa94357d7a3044346ae2&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-120231277-null-null.142^v102^pc_search_result_base7&utm_term=leetcode%E9%93%BE%E8%A1%A8java&spm=1018.2226.3001.4187)

[题录1](https://blog.csdn.net/Qiuhan_909/article/details/134866848?ops_request_misc=&request_id=&biz_id=102&utm_term=leetcode%E9%93%BE%E8%A1%A8%E9%A2%98%E7%9B%AE&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-134866848.142^v102^pc_search_result_base7&spm=1018.2226.3001.4187)

