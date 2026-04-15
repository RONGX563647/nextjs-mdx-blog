# JAVAWEB #1



学习内容 前端三大件 html css js 

建议学习时长 少于8h



[视频地址](https://www.bilibili.com/video/BV1UN411x7xe/?spm_id_from=333.1391.0.0&p=38&vd_source=3e5b8596fdf7a1e637fb85e996addeda)

## HTML

~~~markdown
### 一、HTML基本结构
HTML（Hyper Text Markup Language，超文本标记语言 ）文档是网页的基础，基本结构如下：
```html
<!DOCTYPE html>
<html>
<head>
    <title>网页标题</title>
</head>
<body>
    网页可见内容
</body>
</html>
```
- **`<!DOCTYPE html>`**：文档声明，告知浏览器这是一个HTML5文档，固定写法 ，作用是让浏览器以正确的模式渲染页面。 
- **`<html>`标签**：整个HTML页面的根标签，其他所有HTML标签都应包含在该标签内 ，相当于网页的“容器” 。 
- **`<head>`标签**：页面头部，用于设置网页的元信息，如标题、编码格式、引入外部样式表和脚本等，不会在页面中直接显示。其中`<title>`标签用于定义网页在浏览器标签栏显示的标题。 
- **`<body>`标签**：网页的主体部分，包含了页面上所有可见的内容，如文本、图片、链接、按钮等 。 

### 二、HTML基本语法
#### 1. 标签类型
    - **双标签**：由开始标签和结束标签组成，中间插入要显示的内容。语法格式为`<标签名>内容</标签名>` 。例如段落标签`<p>`：
```html
<p>这是一个段落。</p>
```
如果要给双标签添加属性，属性需放在开始标签内，且与标签名用空格隔开 ，多个属性之间也用空格隔开。例如设置段落文本颜色为红色：
```html
<p style="color: red;">这是一个红色段落。</p>
```
    - **单标签**：也叫自闭合标签，不需要结束标签 ，严格语法为`<标签名 />` ，但在HTML5中，自闭合斜杠`/`可省略，写为`<标签名>` 。例如换行标签`<br>` 、水平分隔线标签`<hr>` ：
```html
这是第一行。<br>这是第二行。
<hr>
```
若单标签要添加属性，语法为`<标签名 属性名="属性值" />`（HTML5中可省略`/` ） 。比如设置水平分隔线颜色为蓝色：
```html
<hr color="blue">
```
#### 2. 标签嵌套规则
标签可以嵌套使用，但要正确嵌套，不能交叉嵌套。例如：
```html
正确：<a href="#"><b>加粗的链接文字</b></a>
错误：<a href="#"><b>加粗的链接文字</a></b>
```
#### 3. 标签大小写
HTML标签不区分大小写，例如`<P>`和`<p>`效果相同，但为了代码规范和可读性，通常建议使用小写。 

### 三、HTML常用标签示例
#### 1. 文本相关
    - **标题标签**：HTML提供了6个标题标签`<h1>` - `<h6>` ，分别对应一级标题到六级标题，数字越小，标题字号越大 。示例：
```html
<h1>一级标题</h1>
<h2>二级标题</h2>
```
    - **字体样式标签**：
      - **`<b>`**：使文本加粗，如`<b>加粗文字</b>` 。
      - **`<i>`**：使文本倾斜，如`<i>倾斜文字</i>` 。
      - **`<u>`**：为文本添加下划线，如`<u>带下划线文字</u>` 。
    - **段落标签**：`<p>`用于定义段落 ，如：
```html
<p>这是一个段落，包含一些文本内容。</p>
```
    - **换行标签**：`<br>`用于在文本中强制换行 ，如：
```html
这是一行文本<br>这是另一行文本
```
#### 2. 链接相关
**超链接标签**：`<a>`标签用于创建超链接 ，`href`属性指定链接的目标地址 ，`target`属性指定链接打开的方式 。例如：
```html
<a href="https://www.baidu.com" target="_blank">点击访问百度</a>
```
上述代码表示创建一个链接到百度首页的超链接，`target="_blank"`表示在新窗口打开链接；若省略`target`属性，则默认在当前页面打开。 
#### 3. 图片相关
**图片标签**：`<img>`用于在网页中插入图片 ，`src`属性指定图片的路径（可以是相对路径或绝对路径 ），`alt`属性用于在图片无法显示时显示替代文本 。示例：
```html
<img src="example.jpg" alt="示例图片">
```
若要设置图片的宽和高，可使用`width`和`height`属性 ，如：
```html
<img src="example.jpg" alt="示例图片" width="300" height="200">
```
#### 4. 列表相关
    - **无序列表**：使用`<ul>`标签定义，列表项使用`<li>`标签 ，列表项前会显示默认的项目符号（如圆点 ）。例如：
```html
<ul>
    <li>列表项1</li>
    <li>列表项2</li>
</ul>
```
    - **有序列表**：使用`<ol>`标签定义，列表项同样用`<li>`标签 ，列表项前会显示数字序号 。例如：
```html
<ol>
    <li>第一项</li>
    <li>第二项</li>
</ol>
```
#### 5. 表格相关
    - **表格标签**：`<table>`用于定义表格 ，`<tr>`定义表格中的行 ，`<th>`定义表头单元格 ，`<td>`定义表格中的数据单元格 。例如：
```html
<table border="1">
    <tr>
        <th>表头1</th>
        <th>表头2</th>
    </tr>
    <tr>
        <td>数据1</td>
        <td>数据2</td>
    </tr>
</table>
```
上述代码创建了一个简单的2行2列表格，`border="1"`设置表格边框宽度为1像素。 
    - **合并单元格**：通过`colspan`属性合并列 ，`rowspan`属性合并行 。例如合并第一行的两列：
```html
<table border="1">
    <tr>
        <th colspan="2">合并后的表头</th>
    </tr>
    <tr>
        <td>数据1</td>
        <td>数据2</td>
    </tr>
</table>
```
#### 6. 其他
    - **注释**：使用`<!-- 注释内容 -->`来添加注释，注释内容不会在浏览器中显示，用于对代码进行说明、解释，方便代码维护和理解 。例如：
```html
<!-- 这是一个注释，用于说明下面的段落 -->
<p>这是一个段落。</p>
``` 
    - **语义化标签**：HTML5引入了一些语义化标签，如`<header>`（表示页面头部 ）、`<footer>`（表示页面底部 ）、`<nav>`（表示导航栏 ）、`<article>`（表示独立的文章内容 ）等，提高代码可读性和可维护性 ，例如：
```html
<header>
    <h1>网站标题</h1>
</header>
<nav>
    <a href="#">首页</a>
    <a href="#">关于</a>
</nav>
<article>
    <h2>文章标题</h2>
    <p>文章内容……</p>
</article>
<footer>
    版权所有 © 2025
</footer>
``` 
~~~



## css

```markdown
CSS的语法点众多，以下是一些主要的内容：
1. **基础概念**：CSS用于控制HTML或XML文档的呈现方式，包括布局、颜色、字体、大小等。具有层叠性和继承性，多个样式规则可以层叠应用于同一元素，某些样式属性可以从父元素继承到子元素。
2. **语法结构**：由选择器、属性和值组成。选择器用于指定要应用样式的HTML元素，如元素选择器（如`p`选择所有`<p>`元素）、类选择器（以`.`开头，如`.my - class`）、ID选择器（以`#`开头，如`#my - id`）等。属性和值则指定要设置的样式属性及其值，如`color: red;`设置文本颜色为红色。
3. **引入方式**：
    - **内联样式**：在HTML元素的`style`属性中直接编写CSS样式，如`<p style="color: blue;">This is blue text.</p>`。
    - **内部样式表**：在HTML文件的`<head>`标签中使用`<style>`标签定义CSS样式，如`<head><style>p { color: green; }</style></head>`。
    - **外部样式表**：将CSS代码保存为一个独立的`.css`文件，然后在HTML文件的`<head>`标签中使用`<link>`标签引入，如`<head><link rel="stylesheet" href="styles.css"></head>`。
4. **盒模型**：由内容（content）、内边距（padding）、边框（border）和外边距（margin）组成。可以通过设置相关属性来控制盒模型的各个部分，如`div {width: 200px; height: 100px; padding: 10px; border: 1px solid black; margin: 20px;}`。元素的实际宽度=内容宽度+左内边距+右内边距+左边框宽度+右边框宽度，实际高度同理。
5. **布局方式**：
    - **浮动（float）**：使元素向左或向右浮动，可用于实现多列布局，如`.left - column {float: left; width: 30%; }.right - column {float: right; width: 70%; }`。
    - **定位（position）**：包括相对定位（`relative`）、绝对定位（`absolute`）和固定定位（`fixed`）等。相对定位相对于元素在正常文档流中的位置进行定位；绝对定位相对于最近的已定位祖先元素进行定位，如果没有已定位祖先元素，则相对于文档的初始包含块进行定位；固定定位相对于浏览器窗口进行定位。
    - **弹性布局（Flexbox）**：通过设置容器和项目的相关属性来实现灵活的布局。容器属性包括`display: flex;`（将容器设置为弹性布局）、`flex - direction`（设置主轴方向）、`justify - content`（设置主轴上的对齐方式）、`align - items`（设置交叉轴上的对齐方式）等；项目属性包括`flex - grow`（定义项目的放大比例）、`flex - shrink`（定义项目的缩小比例）、`flex - basis`（定义项目在主轴上的初始大小）等。
    - **网格布局（Grid）**：通过设置容器和项目的相关属性来创建网格布局。容器属性包括`display: grid;`（将容器设置为网格布局）、`grid - template - columns`（定义列的轨道大小和数量）、`grid - template - rows`（定义行的轨道大小和数量）、`grid - gap`（设置网格间隙）等；项目属性包括`grid - column`（指定项目在网格中的列位置）、`grid - row`（指定项目在网格中的行位置）等。
6. **文本样式**：
    - **字体属性**：包括`font - family`（设置字体）、`font - size`（设置字体大小）、`font - weight`（设置字体粗细）、`font - style`（设置字体样式，如`normal`、`italic`等）等。
    - **文本对齐**：使用`text - align`属性设置文本的水平对齐方式，如`left`、`center`、`right`等。
    - **文本装饰**：如`text - decoration: underline;`添加下划线，`text - decoration: line - through;`添加删除线等。
7. **背景样式**：可以设置元素的背景颜色、背景图像、背景重复方式、背景位置等属性。如`background - color: blue;`设置背景颜色为蓝色；`background - image: url('image.jpg');`设置背景图像；`background - repeat: no - repeat;`设置背景图像不重复；`background - position: center;`设置背景图像位于元素中心。
8. **选择器进阶**：
    - **关系选择器**：包括后代选择器（如`div p`选择`<div>`元素内部的所有`<p>`元素）、子选择器（如`div > p`选择`<div>`元素的直接子元素`<p>`）、相邻兄弟选择器（如`h1 + p`选择紧跟在`<h1>`元素后面的`<p>`元素）、通用兄弟选择器（如`p ~ img`选择`<p>`元素之后的所有`<img>`元素）等。
    - **伪类选择器**：用于选择元素的特定状态，如`:hover`（鼠标悬停）、`:visited`（已访问链接）、`:active`（被激活状态）、`:first - child`（第一个子元素）、`:last - child`（最后一个子元素）、`:nth - child(n)`（指定位置的子元素）等。
    - **伪元素选择器**：用于创建虚拟元素，如`::first - line`（选择元素的第一行）、`::first - letter`（选择元素的第一个字母）、`::before`（在元素内容之前插入内容）、`::after`（在元素内容之后插入内容）等。
9. **其他特性**：
    - **层叠与优先级**：当多个样式规则应用于同一元素时，会根据层叠性和优先级来确定最终的样式。优先级由选择器的特异性、样式的来源（内联样式、内部样式表、外部样式表等）以及!important声明等来决定。
    - **继承性**：某些样式属性（如字体相关属性、文本对齐属性等）会从父元素继承到子元素。
    - **简写属性**：一些属性可以使用简写形式，如`padding`、`margin`、`border`等属性可以将多个方向的值合并在一个声明中。例如，`padding: 10px 15px 20px 25px;`分别表示上、右、下、左的内边距值。
    - **@规则**：如`@import`用于导入其他样式表，`@media`用于根据不同的媒体条件应用不同的样式，`@keyframes`用于定义动画等。
```



## JS

~~~markdown

以下是 JavaScript 的核心语法知识点分类总结，内容涵盖基础语法、变量与数据类型、运算符、流程控制、函数、对象与数组、面向对象编程、ES6+ 新特性等，以分点形式呈现：


### **一、基础语法**
#### 1. 脚本引入方式
- **内部脚本**：通过 `<script>` 标签嵌入 HTML 文档中。
  ```html
  <script>
    console.log("Hello, JavaScript!");
  </script>
  ```
- **外部脚本**：通过 `<script src="文件路径.js"></script>` 引入外部 JS 文件。
  ```html
  <script src="app.js"></script>
  ```

#### 2. 注释
- **单行注释**：`// 这是单行注释`
- **多行注释**：`/* 这是多行注释 */`


### **二、变量与数据类型**
#### 1. 变量声明
- **`var`**（函数作用域，存在变量提升，已逐步被淘汰）。
- **`let`**（块级作用域，不存在变量提升）。
- **`const`**（块级作用域，声明常量，值不可重新赋值）。

#### 2. 数据类型
- **原始数据类型**：
  - **`Number`**：数值（整数、浮点数），如 `10`、`3.14`。
  - **`String`**：字符串，用单引号或双引号包裹，如 `"hello"`。
  - **`Boolean`**：布尔值，`true` 或 `false`。
  - **`Null`**：表示空值，`null`（显式赋值）。
  - **`Undefined`**：未初始化的变量，默认值为 `undefined`。
  - **`Symbol`**（ES6+）：唯一标识符，如 `const id = Symbol('id');`。
- **引用数据类型**：
  - **`Object`**：对象（包括数组、函数、正则等），如 `{ name: "Alice" }`。
  - **`Array`**：数组，如 `[1, 2, 3]`。
  - **`Function`**：函数，如 `function add(a, b) { return a + b; }`。


### **三、运算符**
#### 1. 算术运算符
- `+`（加法/字符串拼接）、`-`（减法）、`*`（乘法）、`/`（除法）、`%`（取模）、`++`（自增）、`--`（自减）。

#### 2. 比较运算符
- `==`（松散相等，类型自动转换）、`===`（严格相等，类型和值均需相同）。
- `>`、`<`、`>=`、`<=`（比较数值或字符编码）。

#### 3. 逻辑运算符
- `&&`（逻辑与，全真为真）、`||`（逻辑或，有真为真）、`!`（逻辑非，取反）。

#### 4. 赋值运算符
- `=`（基本赋值）、`+=`、`-=`、`*=`、`/=`、`%=`（复合赋值）。

#### 5. 三元运算符
- `条件 ? 表达式1 : 表达式2`，如 `let age = 18; let status = age >= 18 ? "成年人" : "未成年人";`。


### **四、流程控制**
#### 1. 条件语句
- **`if...else`**：
  ```javascript
  let score = 85;
  if (score >= 90) {
    console.log("优秀");
  } else if (score >= 80) {
    console.log("良好");
  } else {
    console.log("一般");
  }
  ```
- **`switch...case`**：
  ```javascript
  let day = 3;
  switch (day) {
    case 1:
      console.log("星期一");
      break;
    case 2:
      console.log("星期二");
      break;
    default:
      console.log("其他");
  }
  ```

#### 2. 循环语句
- **`for` 循环**：
  ```javascript
  for (let i = 0; i < 5; i++) {
    console.log(i); // 输出 0, 1, 2, 3, 4
  }
  ```
- **`while` 循环**：
  ```javascript
  let count = 0;
  while (count < 3) {
    console.log(count); // 输出 0, 1, 2
    count++;
  }
  ```
- **`do...while` 循环**（至少执行一次）：
  ```javascript
  let x = 5;
  do {
    console.log(x); // 输出 5
    x++;
  } while (x < 5);
  ```
- **`for...in` 循环**（遍历对象属性）：
  ```javascript
  const person = { name: "Bob", age: 30 };
  for (const key in person) {
    console.log(key + ": " + person[key]); // 输出 "name: Bob", "age: 30"
  }
  ```
- **`for...of` 循环**（ES6+，遍历可迭代对象如数组、字符串）：
  ```javascript
  const arr = [1, 2, 3];
  for (const item of arr) {
    console.log(item); // 输出 1, 2, 3
  }
  ```


### **五、函数**
#### 1. 函数声明
```javascript
function add(a, b) { // 函数声明式
  return a + b;
}
```

#### 2. 函数表达式
```javascript
const subtract = function (a, b) { // 函数表达式
  return a - b;
};
```

#### 3. 箭头函数（ES6+）
```javascript
const multiply = (a, b) => a * b; // 简洁语法，适用于非构造函数场景
```

#### 4. 参数与作用域
- **默认参数**（ES6+）：`function greet(name = "Guest") { ... }`。
- **剩余参数**（ES6+）：`function sum(...nums) { return nums.reduce((acc, cur) => acc + cur, 0); }`。
- **作用域链**：函数内部可访问外层作用域的变量（闭包基础）。


### **六、对象与数组**
#### 1. 对象操作
- **创建对象**：
  ```javascript
  const obj = {
    name: "Alice",
    age: 25,
    sayHi() { // 对象方法
      console.log(`Hello, ${this.name}`);
    }
  };
  ```
- **访问属性**：`obj.name` 或 `obj["age"]`。
- **新增/修改属性**：`obj.gender = "female";`。
- **删除属性**：`delete obj.age;`。

#### 2. 数组操作
- **创建数组**：`const arr = [1, "apple", true];`（动态类型数组）。
- **常用方法**：
  - `push()`：末尾添加元素，返回新长度。
  - `pop()`：删除末尾元素，返回删除值。
  - `shift()`：删除开头元素，返回删除值。
  - `unshift()`：开头添加元素，返回新长度。
  - `splice()`：删除/替换/插入元素，返回删除的元素数组。
  - `slice()`：截取数组片段，返回新数组（不修改原数组）。
  - `indexOf()`：查找元素索引，不存在返回 `-1`。
  - `forEach()`：遍历数组（ES5+）。
  - `map()`：返回新数组（原数组元素映射后的值，ES5+）。
  - `filter()`：过滤符合条件的元素（ES5+）。
  - `reduce()`：累加数组元素（ES5+）。


### **七、面向对象编程（OOP）**
#### 1. 构造函数
```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.sayHello = function () {
    console.log(`Hi, I'm ${this.name}`);
  };
}
const p = new Person("Charlie", 30); // 使用 new 关键字创建实例
```

#### 2. 原型链（`prototype`）
- 通过原型为构造函数添加共享方法，避免重复创建函数：
  ```javascript
  Person.prototype.walk = function () {
    console.log(`${this.name} is walking`);
  };
  ```

#### 3. 类（ES6+）
```javascript
class Animal {
  constructor(species) {
    this.species = species;
  }
  speak() { // 类方法
    console.log("Animal sound");
  }
}

class Dog extends Animal { // 继承
  constructor(name) {
    super("Dog"); // 调用父类构造函数
    this.name = name;
  }
  speak() { // 方法重写
    console.log("Woof!");
  }
}
```


### **八、ES6+ 新特性**
#### 1. 解构赋值
- **数组解构**：
  ```javascript
  const [a, b, c] = [1, 2, 3]; // a=1, b=2, c=3
  ```
- **对象解构**：
  ```javascript
  const { name, age } = { name: "David", age: 35 }; // name="David", age=35
  ```

#### 2. 模板字符串
```javascript
const user = "Eve";
const msg = `Hello, ${user}! You are ${age + 5} years old in 5 years.`; // 支持表达式插值
```

#### 3. 模块化（`import/export`）
- **导出模块**（`module.js`）：
  ```javascript
  export const PI = 3.14;
  export function calculateArea(r) { return PI * r * r; }
  ```
- **导入模块**（`app.js`）：
  ```javascript
  import { PI, calculateArea } from "./module.js";
  ```

#### 4. `let`/`const` 块级作用域
- 解决 `var` 的作用域问题，避免变量提升带来的隐患。

#### 5. 剩余参数与展开运算符
- **剩余参数**：`function fn(...args) { ... }`（收集多余参数为数组）。
- **展开运算符**：
  ```javascript
  const arr1 = [1, 2];
  const arr2 = [...arr1, 3, 4]; // 合并数组：[1, 2, 3, 4]
  ```

#### 6. `Promise` 与异步编程
- **创建 Promise**：
  ```javascript
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("成功"); // 或 reject("失败");
    }, 1000);
  });
  ```
- **链式调用**：
  ```javascript
  promise.then((result) => {
    console.log(result); // "成功"
  }).catch((error) => {
    console.error(error);
  });
  ```

#### 7. `async/await`（ES2017）
```javascript
async function fetchData() {
  try {
    const response = await fetch("https://api.example.com/data"); // 等待异步操作
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}
```

#### 8. `Set` 和 `Map`（ES6+）
- **`Set`**：存储唯一值的集合：
  ```javascript
  const set = new Set([1, 2, 2, 3]); // Set {1, 2, 3}
  ```
- **`Map`**：键值对集合（键可为任意类型）：
  ```javascript
  const map = new Map();
  map.set("name", "Frank").set(1, "one"); // 链式调用
  ```


### **九、其他重要语法**
#### 1. `this` 关键字
- 指向函数执行时的上下文（取决于调用方式）：
  - 普通函数中：默认指向全局对象（浏览器为 `window`，严格模式为 `undefined`）。
  - 方法中：指向所属对象。
  - 箭头函数中：继承外层作用域的 `this`（常用于避免 `this` 指向混乱）。

#### 2. `typeof` 运算符
- 检测变量类型，返回字符串（如 `"number"`、`"string"`、`"object"` 等），注意 `typeof null` 返回 `"object"`（历史遗留问题）。

#### 3. 异常处理（`try...catch`）
```javascript
try {
  // 可能抛出错误的代码
  throw new Error("自定义错误");
} catch (error) {
  console.error("捕获错误:", error.message); // 输出 "捕获错误: 自定义错误"
} finally {
  // 可选，无论是否出错都会执行
  console.log("执行清理操作");
}
```


### **十、严格模式（`use strict`）**
- 通过 `use strict` 开启严格模式，禁止一些不安全操作（如未声明变量直接赋值、`this` 指向 `undefined` 等）：
  ```javascript
  "use strict"; // 位于脚本顶部或函数开头
  ```


以上是 JavaScript 语法的核心知识点，涵盖基础到高级特性。实际开发中需结合项目需求（如前端框架、Node.js 后端等）进一步深入学习。
~~~

