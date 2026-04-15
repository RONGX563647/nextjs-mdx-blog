# 【Java +AI ｜基础篇day9 项目实战 石头迷阵】

## 一、项目概述

石头迷阵（石子迷阵 v1.0）是一款基于 **Java 基础技术 + GUI 编程 + 面向对象** 的综合实战项目，核心是通过键盘或鼠标操作移动方块，达成目标排列顺序即可获得胜利。项目整合了多门 Java 核心技术，是巩固基础、提升实战能力的典型案例。

### 1. 项目核心定位

- 技术融合：整合 GUI 界面编程、二维数组、程序流程控制、面向对象编程四大核心技术。
- 功能目标：实现 “启动游戏→交互操作→逻辑判断→胜利反馈” 的完整游戏流程。
- 应用场景：适合 Java 初学者巩固基础语法，理解 “技术落地” 的逻辑，培养模块化编程思维。

### 2. 游戏核心规则

- 游戏界面包含一个 `N×N`（常见 4×4）的方块矩阵，其中一个方块为空白（用于移动）。
- 玩家通过键盘方向键（上 / 下 / 左 / 右）或鼠标点击，移动空白块相邻的方块（空白块与目标方块交换位置）。
- 当所有方块按预设顺序（如 1-15 按行排列，空白块在右下角）排列时，游戏胜利，界面显示 “胜利！” 提示。

------

## 二、核心技术栈与应用场景

### 1. GUI 界面编程（Swing）

- 核心作用：搭建游戏可视化界面，实现 “界面与用户交互”。
- 关键组件：
  - `JFrame`：顶层窗口（游戏主窗口，包含标题、大小、关闭模式）。
  - `JPanel`：面板组件（承载方块矩阵，作为游戏绘制区域）。
  - 绘图相关：重写 `JPanel` 的 `paintComponent(Graphics g)` 方法，绘制方块、数字、网格线。
  - 事件监听：键盘监听器（`KeyListener`）监听方向键输入，鼠标监听器（`MouseListener`）监听鼠标点击。
- 应用场景：界面布局（方块矩阵排版）、视觉反馈（方块颜色、数字显示、胜利提示）、交互响应（键盘 / 鼠标操作）。

### 2. 二维数组（数据存储）

- 核心作用：存储游戏矩阵的状态（方块编号、空白块位置）。
- 设计思路：
  - 用 `int[][]` 数组表示矩阵，例如 4×4 矩阵：`int[][] map = new int[4][4];`。
  - 数组元素含义：非 0 值表示方块编号（如 1-15），0 表示空白块（便于判断移动逻辑）。
- 应用场景：初始化游戏地图（随机打乱方块）、记录当前游戏状态、判断方块移动合法性（如边缘方块不能移出矩阵）。

### 3. 程序流程控制

- 核心作用：实现游戏逻辑的流转（初始化→操作→判断→反馈）。
- 关键语法：
  - 循环结构：初始化数组、打乱方块、绘制界面（重复调用绘图方法）。
  - 条件判断：判断方块是否可移动（如空白块在边缘时，对应方向的方块不能移动）、判断游戏是否胜利（对比当前数组与目标数组）。
  - 分支结构：处理不同操作（上 / 下 / 左 / 右移动）对应的逻辑。
- 应用场景：移动逻辑校验、胜利条件判断、界面刷新控制。

### 4. 面向对象编程（OOP）

- 核心作用：封装游戏模块，降低耦合度，提升代码复用性。
- 核心封装：
  - `Game` 类：封装游戏核心逻辑（初始化地图、打乱方块、移动处理、胜利判断）。
  - `Block` 类：封装方块属性（编号、位置、颜色）和行为（绘制自身）。
  - `GameFrame` 类：封装 GUI 界面逻辑（窗口搭建、组件初始化、事件监听）。
- 应用场景：模块解耦（界面与逻辑分离）、属性封装（方块信息独立管理）、行为复用（绘制方法统一调用）。

------

## 三、项目架构设计（模块化拆分）

### 1. 架构核心原则

采用 “模块化编程” 思想，将项目拆分为 **界面层、数据层、逻辑层**，各层职责单一，便于开发和维护。

| 模块                 | 核心职责                                                     | 技术依赖                          |
| -------------------- | ------------------------------------------------------------ | --------------------------------- |
| 界面层（View）       | 搭建游戏窗口、绘制方块矩阵、显示胜利提示、监听用户操作（键盘 / 鼠标） | Swing（JFrame、JPanel、Graphics） |
| 数据层（Model）      | 存储游戏状态（当前矩阵、目标矩阵、空白块位置）、提供数据访问方法 | 二维数组、面向对象（封装数据）    |
| 逻辑层（Controller） | 初始化游戏（打乱方块）、处理移动逻辑、判断胜利条件、响应界面交互 | 程序流程控制、方法封装            |

### 2. 核心类设计

#### （1）Game 类（逻辑核心）

- 核心属性：
  - `private int[][] currentMap;`：当前游戏矩阵（存储方块状态）。
  - `private int[][] targetMap;`：目标矩阵（胜利条件）。
  - `private int emptyRow;`：空白块的行索引。
  - `private int emptyCol;`：空白块的列索引。
  - `private int size;`：矩阵大小（如 4 代表 4×4）。
- 核心方法：
  - `public Game(int size)`：构造方法（初始化目标矩阵、当前矩阵、空白块位置）。
  - `private void initTargetMap()`：初始化目标矩阵（如 4×4 矩阵为 1-15 按行排列，右下角为 0）。
  - `public void shuffleMap()`：打乱方块（确保有解，避免死局）。
  - `public boolean moveBlock(int direction)`：处理方块移动（上 / 下 / 左 / 右），返回是否移动成功。
  - `public boolean checkWin()`：判断是否胜利（对比 currentMap 与 targetMap）。

#### （2）GameFrame 类（界面核心）

- 核心属性：
  - `private JFrame frame;`：游戏主窗口。
  - `private GamePanel gamePanel;`：游戏绘制面板（继承 JPanel）。
  - `private Game game;`：关联游戏逻辑核心。
- 核心方法：
  - `public GameFrame(int size)`：构造方法（初始化窗口、面板、事件监听）。
  - `private void initFrame()`：初始化窗口属性（标题、大小、居中、关闭模式）。
  - `private void initListener()`：绑定键盘监听器（监听方向键输入）。

#### （3）GamePanel 类（绘制核心）

- 继承

  ```
  JPanel
  ```

  ，重写 

  ```
  paintComponent(Graphics g)
  ```

  方法，负责绘制游戏界面：

  - 绘制网格线（区分方块区域）。
  - 绘制每个方块（填充颜色、显示编号，空白块不显示编号）。
  - 绘制胜利提示（游戏胜利时显示 “胜利！” 文字）。

#### （4）Block 类（方块封装，可选）

- 核心属性：`private int num;`（方块编号）、`private int x;`（绘制 x 坐标）、`private int y;`（绘制 y 坐标）、`private int width;`（方块宽度）。
- 核心方法：`public void draw(Graphics g)`（绘制自身，空白块跳过绘制）。

------

## 四、核心实现步骤（分阶段编码）

### 1. 阶段一：环境准备与项目搭建

#### （1）创建项目结构

- 包结构设计（模块化分类）：

  plaintext

  ```plaintext
  stonePuzzle/
  ├─ view/          // 界面层（GameFrame、GamePanel）
  ├─ model/         // 数据层（Game、Block）
  └─ Main.java      // 程序入口（启动游戏）
  ```

#### （2）导入核心依赖

无需额外导入第三方库，直接使用 JDK 内置的 `javax.swing`（GUI）、`java.awt`（绘图与事件）包。

### 2. 阶段二：数据层实现（游戏核心数据管理）

#### （1）初始化目标矩阵与当前矩阵

以 4×4 矩阵为例，目标矩阵是 1-15 按行排列，右下角为空白块（0）：

java

运行

```java
// Game 类中 initTargetMap() 方法
private void initTargetMap() {
    int count = 1;
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            targetMap[i][j] = count++;
        }
    }
    // 右下角设为空白块（0）
    targetMap[size-1][size-1] = 0;
    // 初始化当前矩阵为目标矩阵（后续会打乱）
    currentMap = Arrays.stream(targetMap).map(int[]::clone).toArray(int[][]::new);
    // 记录空白块初始位置（右下角）
    emptyRow = size - 1;
    emptyCol = size - 1;
}
```

#### （2）打乱方块（确保游戏有解）

核心逻辑：通过随机生成方向，模拟移动空白块（避免直接随机赋值导致死局）：

java

运行

```java
// Game 类中 shuffleMap() 方法
public void shuffleMap() {
    // 随机移动 100 次（次数越多，打乱越彻底）
    Random random = new Random();
    for (int i = 0; i < 100; i++) {
        // 0-3 分别代表：上、下、左、右
        int direction = random.nextInt(4);
        // 调用移动方法（失败则跳过，不影响）
        moveBlock(direction);
    }
}
```

### 3. 阶段三：界面层实现（GUI 搭建）

#### （1）搭建主窗口（GameFrame）

java

运行

```java
// GameFrame 类中 initFrame() 方法
private void initFrame() {
    frame = new JFrame("石头迷阵 v1.0");
    frame.setSize(400, 450); // 窗口大小（宽×高）
    frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // 关闭窗口退出程序
    frame.setLocationRelativeTo(null); // 窗口居中
    frame.setResizable(false); // 禁止调整窗口大小（避免布局错乱）
    
    // 初始化游戏面板并添加到窗口
    gamePanel = new GamePanel(game);
    frame.add(gamePanel);
    
    frame.setVisible(true); // 显示窗口
}
```

#### （2）绘制游戏面板（GamePanel）

重写 `paintComponent` 方法，绘制网格和方块：

java

```java
public class GamePanel extends JPanel {
    private Game game;
    private int blockSize; // 方块大小（根据窗口尺寸计算）

    public GamePanel(Game game) {
        this.game = game;
        this.blockSize = 80; // 4×4 矩阵，窗口宽 400，方块大小 80（含间距）
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        int size = game.getSize();
        // 绘制网格线（黑色）
        g.setColor(Color.BLACK);
        for (int i = 0; i <= size; i++) {
            // 绘制横线
            g.drawLine(20, 20 + i * blockSize, 20 + size * blockSize, 20 + i * blockSize);
            // 绘制竖线
            g.drawLine(20 + i * blockSize, 20, 20 + i * blockSize, 20 + size * blockSize);
        }

        // 绘制方块
        int[][] map = game.getCurrentMap();
        for (int i = 0; i < size; i++) {
            for (int j = 0; j < size; j++) {
                int num = map[i][j];
                if (num != 0) { // 非空白块绘制颜色和编号
                    // 方块背景色（浅蓝色）
                    g.setColor(new Color(173, 216, 230));
                    // 绘制方块（x=20+j*blockSize，y=20+i*blockSize，宽=blockSize-2，高=blockSize-2，预留间距）
                    g.fillRect(21 + j * blockSize, 21 + i * blockSize, blockSize - 2, blockSize - 2);
                    // 方块编号（黑色，居中显示）
                    g.setColor(Color.BLACK);
                    g.setFont(new Font("宋体", Font.BOLD, 24));
                    // 计算文字居中坐标
                    int x = 21 + j * blockSize + (blockSize - 2) / 2 - 10;
                    int y = 21 + i * blockSize + (blockSize - 2) / 2 + 10;
                    g.drawString(String.valueOf(num), x, y);
                }
            }
        }

        // 绘制胜利提示
        if (game.checkWin()) {
            g.setColor(Color.RED);
            g.setFont(new Font("宋体", Font.BOLD, 36));
            g.drawString("胜利!", 150, 220);
        }
    }
}
```

### 4. 阶段四：逻辑层实现（交互与判断）

#### （1）绑定键盘事件（监听方向键）

在 `GameFrame` 中添加键盘监听器，响应移动操作：

java

```java
// GameFrame 类中 initListener() 方法
private void initListener() {
    frame.addKeyListener(new KeyAdapter() {
        @Override
        public void keyPressed(KeyEvent e) {
            int keyCode = e.getKeyCode();
            switch (keyCode) {
                case KeyEvent.VK_UP: // 上键（空白块向上移动 = 下方方块向上移动）
                    game.moveBlock(0);
                    break;
                case KeyEvent.VK_DOWN: // 下键
                    game.moveBlock(1);
                    break;
                case KeyEvent.VK_LEFT: // 左键
                    game.moveBlock(2);
                    break;
                case KeyEvent.VK_RIGHT: // 右键
                    game.moveBlock(3);
                    break;
            }
            // 移动后刷新界面（重新调用 paintComponent）
            gamePanel.repaint();
        }
    });
}
```

#### （2）实现方块移动逻辑

核心是 “空白块与相邻方块交换位置”，先判断移动合法性（如边缘方块不能移出矩阵）：

java

```java
// Game 类中 moveBlock() 方法
public boolean moveBlock(int direction) {
    int row = emptyRow;
    int col = emptyCol;
    int temp;

    // 根据方向判断是否可移动，并计算目标方块位置
    switch (direction) {
        case 0: // 上：空白块向上移 → 下方方块（row+1, col）与空白块交换
            if (row + 1 >= size) return false; // 空白块在最下方，不能上移
            // 交换方块
            temp = currentMap[row][col];
            currentMap[row][col] = currentMap[row+1][col];
            currentMap[row+1][col] = temp;
            emptyRow = row + 1; // 更新空白块位置
            break;
        case 1: // 下：空白块向下移 → 上方方块（row-1, col）与空白块交换
            if (row - 1 < 0) return false; // 空白块在最上方，不能下移
            temp = currentMap[row][col];
            currentMap[row][col] = currentMap[row-1][col];
            currentMap[row-1][col] = temp;
            emptyRow = row - 1;
            break;
        case 2: // 左：空白块向左移 → 右侧方块（row, col+1）与空白块交换
            if (col + 1 >= size) return false; // 空白块在最右侧，不能左移
            temp = currentMap[row][col];
            currentMap[row][col] = currentMap[row][col+1];
            currentMap[row][col+1] = temp;
            emptyCol = col + 1;
            break;
        case 3: // 右：空白块向右移 → 左侧方块（row, col-1）与空白块交换
            if (col - 1 < 0) return false; // 空白块在最左侧，不能右移
            temp = currentMap[row][col];
            currentMap[row][col] = currentMap[row][col-1];
            currentMap[row][col-1] = temp;
            emptyCol = col - 1;
            break;
        default:
            return false;
    }
    return true;
}
```

#### （3）胜利判断逻辑

对比当前矩阵与目标矩阵，完全一致则返回胜利：

java

```java
// Game 类中 checkWin() 方法
public boolean checkWin() {
    for (int i = 0; i < size; i++) {
        for (int j = 0; j < size; j++) {
            if (currentMap[i][j] != targetMap[i][j]) {
                return false; // 有任意元素不一致，未胜利
            }
        }
    }
    return true; // 所有元素一致，胜利
}
```

### 5. 阶段五：程序入口与测试

创建 `Main` 类，启动游戏：

java

```java
public class Main {
    public static void main(String[] args) {
        // 启动 4×4 大小的游戏（可修改为 3×3、5×5 调整难度）
        Game game = new Game(4);
        game.shuffleMap(); // 打乱方块
        new GameFrame(game); // 初始化界面并启动
    }
}
```

------

## 五、关键技术难点与解决方案

### 1. 方块打乱（确保游戏有解）

- 问题：直接随机赋值二维数组可能导致 “死局”（无法通过移动达成目标排列）。
- 解决方案：通过 “模拟移动” 打乱（基于目标矩阵，随机移动空白块 N 次），确保每一步都可逆，游戏必然有解。

### 2. 界面刷新与绘制效率

- 问题：频繁调用 `repaint()` 可能导致界面闪烁。
- 解决方案：
  - 重写 `paintComponent` 时先调用 `super.paintComponent(g)` 清除上一帧。
  - 固定方块大小和窗口尺寸，避免动态计算导致的绘制延迟。
  - 仅在移动操作后刷新界面，而非持续刷新。

### 3. 边界条件判断

- 问题：边缘方块不能移动（如最上方方块不能上移），需避免非法移动。
- 解决方案：移动前判断空白块的位置（`emptyRow`、`emptyCol`），若超出矩阵范围则拒绝移动（返回 `false`）。

------

## 六、项目扩展方向（进阶优化）

1. 难度选择：添加 “简单（3×3）、中等（4×4）、困难（5×5）” 选项，通过修改 `size` 参数实现。
2. 计时功能：添加 `Timer` 组件，记录游戏开始到胜利的时间，显示在界面上。
3. 积分系统：根据移动步数、耗时计算积分，胜利后显示积分并保存最高记录（持久化到文件）。
4. 鼠标交互：除了键盘方向键，支持鼠标点击相邻方块实现移动，提升用户体验。
5. 界面美化：添加背景图片、方块 hover 效果、胜利动画，替换默认 Swing 组件样式。
6. 重新开始功能：添加 “重新游戏” 按钮，点击后重新打乱方块，重置游戏状态。

------

## 七、项目核心总结

### 1. 技术整合逻辑

| 技术点       | 项目落地场景                             | 核心价值                                    |
| ------------ | ---------------------------------------- | ------------------------------------------- |
| 二维数组     | 存储游戏矩阵状态（方块编号、空白块位置） | 提供高效的 “结构化数据存储”，便于索引和修改 |
| Swing GUI    | 搭建游戏窗口、绘制界面、绑定事件         | 实现 “可视化交互”，让程序具备用户操作入口   |
| 程序流程控制 | 移动判断、胜利校验、打乱逻辑             | 驱动游戏流程流转，确保逻辑正确性            |
| 面向对象编程 | 封装 Game、GameFrame、GamePanel 类       | 降低模块耦合，便于维护和扩展                |

### 2. 实战能力提升

- 模块化思维：学会将复杂项目拆分为 “界面、数据、逻辑” 三层，各司其职。
- 问题解决能力：面对 “死局”“界面闪烁” 等问题，掌握 “模拟真实场景”“优化代码逻辑” 的解决思路。
- 技术落地思维：理解 “语法” 到 “应用” 的转化，如 `KeyListener` 如何绑定到游戏移动逻辑。

------

