# 【JavaWeb｜day16 Web前端基础】



[黑马官方笔记📒地址](https://heuqqdmbyk.feishu.cn/wiki/FxTdw2K9mieDgAkhSqucg59Cn8f)

up是学后端的这部分黑马 也只是科普的讲 笔记里也不会深入讲 看懂即可。

1. # 前端核心知识笔记（后端视角・场景化拓展）

   ## 一、HTML：后端对接核心 —— 数据提交与展示

   ### 1. 核心定位

   HTML 是页面骨架，后端无需关注样式，重点掌握「数据如何从前端传到后端」「后端数据如何让前端展示」。

   ### 2. 常用标签（后端必备）

   | 标签     | 作用                         | 后端对接场景                        | 关键属性 / 注意点                                            |
   | -------- | ---------------------------- | ----------------------------------- | ------------------------------------------------------------ |
   | `form`   | 包裹表单项，实现数据提交     | 登录、查询、新增 / 编辑员工         | `action`：后端接口地址（如`/emp/save`）；`method`：GET/POST  |
   | `input`  | 输入框（文本、密码、文件等） | 接收用户输入（姓名、密码等）        | `name`：后端接收参数的 key（必须与`@RequestParam`变量名一致）；`type`：text/password/file |
   | `option` | 下拉选择框                   | 性别、职位等固定选项选择            | `option`的`value`：后端接收的编码（如 1 = 男、2 = 女）       |
   | `butto`  | 按钮（提交、查询、重置）     | 触发请求（如查询员工、提交表单）    | `type`：submit（提交表单）、button（自定义事件）             |
   | `table`  | 表格展示数据                 | 员工列表、数据报表展示              | 后端返回数组，前端用`v-for`循环渲染行数据                    |
   | `img`    | 展示图片（头像、截图）       | 展示用户头像、商品图片              | `src`：后端返回的图片 URL（如`/upload/xxx.jpg`）             |
   | `hidden` | 隐藏域                       | 传递无需用户输入的参数（如员工 ID） | 后端可通过`name`获取参数，用于编辑 / 删除接口                |

   ### 3. 后端避坑点

   - 表单项必须加`name`属性，否则后端无法接收参数（如``对应后端`@RequestParam("username") String name`）。
   - 文件上传需设置`form`属性：`enctype="multipart/form-data"`，后端用`MultipartFile`接收。

   ## 二、CSS：后端无需深究，仅需了解这些

   ### 1. 核心定位

   CSS 负责页面美化，后端不用写，但要知道「哪些样式问题会影响数据展示」。

   ### 2. 关键知识点（后端视角）

   - 布局相关：「版心居中」（页面内容居中，后端返回的列表数据会在居中区域展示）、「表格边框 / 对齐」（影响数据可读性）。
   - 路径相关：CSS 引入外部资源（如背景图）时，路径错误会导致页面错乱，后端提供静态资源（图片、CSS 文件）时，需确保 URL 可访问。
   - 无需学习复杂选择器和样式写法，遇到前端反馈 “数据看不到”，优先排查是否是 CSS 隐藏了元素（如`display: none`）。

   ## 三、JavaScript：后端对接核心 —— 交互与数据处理

   ### 1. 核心定位

   JS 实现前端交互，后端重点关注「数据格式转换」「请求触发」「后端接口调用」。

   ### 2. 常用语法 / API（后端必备）

   #### （1）数据类型与格式转换

   - 核心类型：字符串（前后端传输默认）、数字、布尔、JSON（前后端数据交换标准）。
   - 关键 API：
     - `JSON.stringify(js对象)`：将前端数据转为 JSON 字符串（POST 请求提交给后端）。
     - `JSON.parse(json字符串)`：将后端返回的 JSON 字符串转为 JS 对象（前端渲染用）。
     - 场景：前端提交表单时，将表单数据转为 JSON 字符串传给后端；后端返回 JSON，前端解析后渲染表格。

   #### （2）事件监听（触发后端请求）

   - 常用事件：

     - `click`：点击事件（查询按钮、删除按钮、提交按钮）。
     - `blur`：失去焦点事件（输入框输入完成后触发校验，如用户名是否已存在）。
     - `submit`：表单提交事件（触发`form`提交到后端接口）。

   - 示例代码（后端接口对接场景）：

     javascript

     ```javascript
     // 点击“查询”按钮，触发后端查询接口
     document.querySelector('#searchBtn').addEventListener('click', async () => {
       const name = document.querySelector('#nameInput').value; // 获取输入框值
       const res = await axios.get(`/emp/list?name=${name}`); // 调用后端接口
     });
     ```

     

   #### （3）DOM 操作（获取 / 修改页面数据）

   - 常用 API：
     - `document.querySelector('选择器')`：获取页面元素（如输入框、按钮），用于获取用户输入或触发操作。
     - `element.value`：获取 / 设置输入框的值（如获取查询条件、回显编辑数据）。
     - 场景：后端返回编辑数据后，前端通过`element.value`将数据回显到输入框。

   ### 3. 后端避坑点

   - JS 是弱类型语言，前端传递的参数类型可能不一致（如数字 1 可能传成字符串 "1"），后端接口需做类型兼容（如用`String`接收后转`Integer`）。
   - 前端提交的 JSON 数据，后端需用`@RequestBody`接收（而非`@RequestParam`）。

   ## 四、Vue：前端数据渲染框架 —— 后端只需懂对接逻辑

   ### 1. 核心定位

   Vue 简化前端数据渲染，后端不用写 Vue 代码，但要知道「后端数据如何被 Vue 渲染」「前端请求如何触发后端接口」。

   ### 2. 常用指令与 API（后端对接场景）

   | 指令 / API | 作用                       | 后端对接场景                  | 示例代码                                                     |
   | ---------- | -------------------------- | ----------------------------- | ------------------------------------------------------------ |
   | v-for      | 循环渲染列表数据           | 展示员工列表、部门列表        |                                                              |
   | v-model    | 表单数据双向绑定           | 查询条件输入、表单新增 / 编辑 | ``                                                           |
   | v-bind(:)  | 动态绑定属性               | 展示图片、超链接              | ``（`emp.avatar`是后端返回的图片 URL）                       |
   | v-on(@)    | 绑定事件                   | 触发查询、删除、提交请求      | `查询`                                                       |
   | data()     | 存储前端数据（与后端交互） | 存储查询条件、接口返回数据    | `data(){return {searchForm:{name:'',gender:''}, empList:[]}}` |
   | methods    | 定义函数（调用后端接口）   | 封装查询、新增、删除等请求    | `async getEmpList(){const res = await axios.get('/emp/list', {params: this.searchForm}); this.empList = res.data.data}` |
   | mounted    | 页面加载完成后执行         | 页面初始化时查询默认数据      | `mounted(){this.getEmpList()}`（页面加载后自动调用后端查询接口） |

   ### 3. 后端对接核心流程

   1. 前端页面加载（`mounted`）→ 调用`methods`中的函数 → 用 Axios 请求后端接口（如`/emp/list`）。
   2. 后端接收请求（`@GetMapping("/emp/list")`），查询数据库，返回 JSON 格式数据（如`{code:200, data:[...], msg:"成功"}`）。
   3. 前端将`res.data.data`赋值给`empList` → 用`v-for`循环渲染表格。
   4. 前端修改查询条件（`v-model`绑定）→ 点击查询按钮（`@click`）→ 重新请求后端接口 → 后端根据参数筛选数据并返回。

   ## 五、Axios：前后端交互核心工具 —— 后端必须懂的请求逻辑

   ### 1. 核心定位

   Axios 是前端发送 HTTP 请求的工具，后端需掌握「Axios 请求对应后端哪种接收方式」「参数如何传递」「响应如何返回」。

   ### 2. 常用 API 与后端对接场景

   #### （1）请求方式与参数传递

   | 请求方式 | 前端 Axios 代码示例                                          | 后端接收方式                                                 | 适用场景                 |
   | -------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------ |
   | GET      | `axios.get('/emp/list', {params: {name: '张三', gender: 1}})` | `@GetMapping("/emp/list") public Result list(@RequestParam String name, @RequestParam Integer gender)` | 查询数据（列表、详情）   |
   | POST     | `axios.post('/emp/save', {name: '李四', gender: 2, job: 3})`（JSON 参数） | `@PostMapping("/emp/save") public Result save(@RequestBody Emp emp)` | 新增数据（表单提交）     |
   | POST     | `axios.post('/emp/upload', formData)`（FormData 格式，文件上传） | `@PostMapping("/emp/upload") public Result upload(@RequestParam MultipartFile file)` | 文件上传（头像、附件）   |
   | DELETE   | `axios.delete('/emp/delete/' + id)`                          | `@DeleteMapping("/emp/delete/{id}") public Result delete(@PathVariable Long id)` | 删除数据（根据 ID 删除） |

   #### （2）异步请求与`async/await`

   - 前端常用`async/await`简化异步请求（避免回调地狱），后端无需关注语法，只需保证接口响应及时。

   - 示例：

     javascript

     运行

     ```javascript
     async getEmpList() {
       try {
         const res = await axios.get('/emp/list', {params: this.searchForm});
         this.empList = res.data.data; // 后端返回的核心数据
       } catch (err) {
         alert('查询失败：' + err.response.data.msg); // 后端返回的错误信息
       }
     }
     ```

     

   #### （3）响应格式约定（前后端必须统一）

   后端返回数据建议格式（前端 Axios 可直接解析）：

   json

   ```json
   {
     "code": 200, // 状态码（200成功、400参数错误、500服务器错误、401未登录）
     "data": [...], // 核心数据（列表、详情、统计结果）
     "msg": "操作成功" // 提示信息（成功/失败原因）
   }
   ```

   - 后端注意：状态码要规范，错误信息要明确（如参数校验失败返回`msg: "姓名不能为空"`），方便前端提示用户。

   ### 3. 后端避坑点

   - 跨域问题：前端本地开发（如`localhost:8080`）请求后端接口（如`localhost:9090`）会触发跨域，后端需配置 CORS（如 SpringBoot 添加`@CrossOrigin`注解）。
   - 超时问题：前端 Axios 默认超时时间较短，后端处理耗时请求（如大数据查询）需配置超时时间，或返回异步结果。
   - Token 认证：前端登录后会存储 Token（如 localStorage），后续请求会在请求头携带`Authorization: Bearer xxx`，后端需通过拦截器验证 Token。

   ## 六、后端必备前端对接知识总结

   1. **数据传输**：前后端统一用 JSON 格式，后端返回数据需包含`code`「状态码」、`data`「数据」、`msg`「提示」。

   2. 接口设计

      ：

      - GET：查询数据，参数通过 URL 传递（`@RequestParam`接收）。
      - POST：新增 / 提交数据，JSON 参数用`@RequestBody`接收，文件用`MultipartFile`接收。
      - DELETE：删除数据，ID 通过路径传递（`@PathVariable`接收）。

   3. **参数约定**：前端`name`属性、Vue 的`v-model`变量名，需与后端接收参数名一致；固定选项（性别、职位）的编码（1 = 男、2 = 女）需前后端提前约定。

   4. 常见问题

      ：

      - 跨域：后端配置 CORS。
      - 数据回显：后端返回编辑数据，前端通过`v-model`或`element.value`填充表单。
      - 图片展示：后端提供可访问的图片 URL（如通过 Nginx 代理静态资源）。

   5. **无需深究**：CSS 样式、JS 复杂语法、Vue 高级特性（如组件、路由），交给前端处理，后端聚焦接口稳定性和数据正确性。





### 面试题 1

前后端数据传输的核心格式是什么？前端如何实现该格式与 JS 对象的相互转换？后端接收该格式数据时需用什么注解？

### 面试题 2

前端 HTML 表单中，表单项要让后端成功接收参数，必须具备什么属性？文件上传时，``标签需额外设置什么属性？

### 面试题 3

前端用 Axios 发送 GET 和 POST 请求时，参数传递方式有何不同？后端分别如何接收这两种请求的参数？

### 面试题 4

前端用 Vue 渲染后端返回的员工列表数据时，常用什么指令实现循环渲染？用什么指令实现表单查询条件的双向绑定？

### 面试题 5

前端本地开发时请求后端接口，经常遇到跨域问题，后端常用的解决方式是什么？

------

### 参考答案：

1. 核心格式是 JSON；前端通过`JSON.stringify(js对象)`将 JS 对象转为 JSON 字符串，通过`JSON.parse(json字符串)`将 JSON 字符串转为 JS 对象；后端接收需使用`@RequestBody`注解。解析：这是前后端对接最基础的格式约定，后端需明确转换逻辑和接收注解，避免参数接收失败。
2. 表单项必须具备`name`属性（该属性值需与后端`@RequestParam`注解指定的变量名一致）；文件上传时，``标签需额外设置`enctype="multipart/form-data"`属性。解析：后端对接表单的高频踩坑点，缺少这些配置会导致参数丢失或文件上传失败。
3. GET 请求的参数通过 URL 拼接传递（Axios 中通过`params`配置参数），后端用`@RequestParam`注解接收；POST 请求（JSON 格式）的参数放在请求体中传递，后端用`@RequestBody`注解接收。解析：接口对接的核心逻辑，需明确请求方式与接收注解的对应关系，避免接口调用异常。
4. 循环渲染常用`v-for`指令（示例：）；表单查询条件的双向绑定常用`v-model`指令（示例：``）。解析：后端无需编写 Vue 代码，但需理解前端如何渲染自己返回的数据，明确核心指令用途即可。
5. SpringBoot 项目中，常用解决方式是在接口方法或控制器类上添加`@CrossOrigin`注解，允许前端跨域请求。解析：前后端分离开发的常见问题，后端需掌握简单有效的解决方案，无需关注前端跨域配置细节。

