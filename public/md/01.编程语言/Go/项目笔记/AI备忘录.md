# AI 备忘录应用：完整项目目录与分步实现指南

基于 `HTML/CSS/JS + Gin + Gorm + 文心一言API` 构建，以下是**完整项目目录结构**和**可落地的分步实现方法**，确保零基础也能跟随操作。

## 一、完整项目目录结构

plaintext

```plaintext
ai-memo/                  # 项目根目录
├── config/               # 配置文件目录
│   └── db.go             # 数据库连接配置
├── model/                # 数据模型目录（Gorm）
│   └── task.go           # 任务表模型定义
├── service/              # 业务服务目录
│   └── ai_service.go     # AI接口调用服务（文心一言）
├── static/               # 前端静态资源目录
│   ├── css/
│   │   └── style.css     # 页面样式文件
│   └── js/
│       └── main.js       # 前端交互逻辑
├── templates/            # HTML模板目录（Gin渲染）
│   └── index.html        # 首页（任务表单+列表）
├── go.mod                # Go依赖管理文件
├── go.sum                # Go依赖版本锁定文件
└── main.go               # 后端主程序（路由+入口）
```

## 二、分步实现方法（共 9 步）

### 步骤 1：环境准备（必做）

先安装基础工具，确保后续操作无依赖问题：

1. 安装 Go 环境

   - 下载地址：https://go.dev/dl/（选择 Go 1.20 + 版本，适配 Gin 最新版）
   - 验证：终端输入 `go version`，显示 `go version go1.2x.x xxx` 即成功。

2. 安装 MySQL 数据库

   - 下载地址：https://dev.mysql.com/downloads/mysql/（8.0 + 版本）
   - 记住数据库**用户名**（默认 root）和**密码**（安装时设置）。

3. 申请文心一言 API 密钥

   - 访问：https://console.bce.baidu.com/qianfan/ （百度智能云千帆平台）
   - 注册登录后，创建 “应用”，获取 **API Key** 和 **Secret Key**（后续配置用）。

4. 安装代码编辑器

   （可选，推荐 VS Code）

   - 安装 Go 插件（搜索 “Go”）和 HTML/CSS 插件，方便编写代码。

### 步骤 2：创建项目目录（终端 / 命令行操作）

1. 新建根目录

    

   ```
   ai-memo
   ```

   （路径可自定义，如桌面）：

   bash

   

   

   

   

   

   ```bash
   # Windows（CMD）
   mkdir C:\Users\你的用户名\Desktop\ai-memo
   cd C:\Users\你的用户名\Desktop\ai-memo
   
   # Mac/Linux（终端）
   mkdir ~/Desktop/ai-memo
   cd ~/Desktop/ai-memo
   ```

   

2. 创建子目录（按完整目录结构）：

   bash

   

   

   

   

   

   ```bash
   # 批量创建子目录
   mkdir config model service static/css static/js templates
   ```

   

3. 验证：打开项目根目录，确认 `config`、`static` 等文件夹已创建。

### 步骤 3：初始化 Go 模块（管理依赖）

在项目根目录执行以下命令，初始化 Go 项目并导入核心依赖：

1. 初始化 Go 模块（

   ```
   your-project-path
   ```

    

   可自定义，如

    

   ```
   github.com/your-name/ai-memo
   ```

   ）：

   bash

   

   

   

   

   

   ```bash
   go mod init your-project-path
   ```

   

   - 执行后，根目录会生成 `go.mod` 文件（依赖配置文件）。

2. 安装核心依赖（Gin、Gorm、MySQL 驱动、百度 API SDK）：

   bash

   

   

   

   

   

   ```bash
   go get github.com/gin-gonic/gin@v1.10.0
   go get gorm.io/gorm@v1.25.3
   go get gorm.io/driver/mysql@v1.5.2
   go get github.com/baidu-idl/bce-sdk-go@v0.10.233
   ```

   

   - 执行后，根目录会生成 `go.sum` 文件（依赖版本锁定），且 `go.mod` 会新增依赖记录。

### 步骤 4：数据库配置与模型定义（后端核心）

#### 4.1 创建数据库（MySQL 操作）

先在 MySQL 中创建项目专用数据库 `ai_memo`（后续 Gorm 会自动建表）：

1. 打开 MySQL 终端（或用 Navicat、DataGrip 等工具）：

   bash

   

   

   

   

   

   ```bash
   # 登录MySQL（输入密码时按回车，然后输入你的MySQL密码）
   mysql -u root -p
   ```

   

2. 创建数据库

    

   ```
   ai_memo
   ```

   ：

   sql

   

   

   

   

   

   ```sql
   CREATE DATABASE IF NOT EXISTS ai_memo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   

3. 验证：输入 `show databases;`，看到 `ai_memo` 即成功，然后输入 `exit;` 退出 MySQL。

#### 4.2 编写数据库配置（config/db.go）

在 `config` 目录下新建 `db.go` 文件，粘贴以下代码（**需修改 MySQL 连接信息**）：

go



运行









```go
package config

import (
	"your-project-path/model"  // 替换为你的Go模块名（步骤3中init的路径）
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB  // 全局数据库对象，供其他模块调用

// InitDB 初始化数据库连接（自动建表）
func InitDB() error {
	// 1. 修改这里的MySQL配置：root:密码@tcp(localhost:3306)/ai_memo?xxx
	dsn := "root:你的MySQL密码@tcp(127.0.0.1:3306)/ai_memo?charset=utf8mb4&parseTime=True&loc=Local"
	
	// 2. 连接MySQL
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err  // 连接失败返回错误
	}
	
	// 3. 自动迁移：根据model.Task创建task表（无表则建表，有表则更新结构）
	err = db.AutoMigrate(&model.Task{})
	if err != nil {
		return err
	}
	
	DB = db  // 赋值给全局变量
	return nil
}
```

- **关键修改**：将 `dsn` 中的 `你的MySQL密码` 替换为实际 MySQL 密码（如 `root:123456@tcp(...)`）。

#### 4.3 编写任务模型（model/task.go）

在 `model` 目录下新建 `task.go` 文件，粘贴以下代码（定义任务表结构）：

go



运行









```go
package model

import (
	"time"
	"gorm.io/gorm"
)

// TaskStatus 任务状态枚举（限定值：pending/doing/done）
type TaskStatus string
const (
	StatusPending TaskStatus = "pending"  // 待执行
	StatusDoing   TaskStatus = "doing"    // 执行中
	StatusDone    TaskStatus = "done"     // 已完成
)

// Task 任务表模型（Gorm会根据此结构体创建task表）
type Task struct {
	gorm.Model          // 内置字段：ID（主键）、CreatedAt（创建时间）、UpdatedAt（更新时间）、DeletedAt（软删除）
	Title       string   `gorm:"size:100;not null" json:"title"`       // 任务标题（非空，最大100字符）
	Content     string   `gorm:"type:text" json:"content"`             // 任务详情（长文本）
	DueTime     time.Time `gorm:"not null" json:"due_time"`            // 截止时间（非空）
	Status      TaskStatus `gorm:"default:pending" json:"status"`      // 任务状态（默认待执行）
	AIPlan      string   `gorm:"type:text" json:"ai_plan"`             // AI生成的任务规划
	AIAdvice    string   `gorm:"type:text" json:"ai_advice"`           // AI生成的执行建议
}
```

### 步骤 5：编写 AI 服务（调用文心一言 API）

在 `service` 目录下新建 `ai_service.go` 文件，粘贴以下代码（**需替换 API 密钥**）：

go



运行









```go
package service

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/baidubce/bce-qianfan-sdk/go/qianfan"
)

// 初始化鉴权信息（通过环境变量设置AK/SK，符合SDK鉴权逻辑）
func init() {
	// 替换为你的百度智能云Access Key和Secret Key
	// 获取路径：百度智能云控制台 → 用户账户 → 安全认证 → 访问密钥
	err := os.Setenv("QIANFAN_ACCESS_KEY", "ALTAKYipvjqeEdTYIbnvB9BnQc")
	if err != nil {
		return
	} // 你的Access Key
	err = os.Setenv("QIANFAN_SECRET_KEY", "bda8ea87f6f6405797bbbe5a7f88f98c")
	if err != nil {
		return
	} // 你的Secret Key
}

// GetAIAdvice 调用百度千帆大模型API，生成任务规划和建议
// 参数：任务标题、任务详情、截止时间；返回：AI规划、AI建议、错误信息
func GetAIAdvice(title, content string, dueTime string) (plan string, advice string, err error) {
	// 1. 构造AI提示词（明确输出格式，便于后续解析）
	prompt := fmt.Sprintf(`
	请基于以下任务信息，严格按照【规划】和【建议】两部分生成内容，不要额外文字：
	1. 【规划】：包含任务优先级（高/中/低）、分步骤时间分配（适配截止时间%s）；
	2. 【建议】：包含执行风险点（如可能拖延的环节）、资源推荐（如工具/资料）。
	任务标题：%s
	任务详情：%s
	`, dueTime, title, content)

	// 2. 初始化千帆SDK的聊天客户端（使用SDK中定义的NewChatCompletion）
	client := qianfan.NewChatCompletion()

	// 3. 构造大模型请求参数（使用SDK中定义的ChatCompletionRequest结构体）
	req := &qianfan.ChatCompletionRequest{
		Messages: []qianfan.ChatCompletionMessage{
			{
				Role:    "user", // 角色：用户（发送提示词）
				Content: prompt,
			},
		},
		Temperature: 0.7, // 生成随机性（0-1，值越小越稳定）
	}

	// 4. 调用大模型API（使用SDK中定义的Do方法）
	resp, err := client.Do(context.Background(), req)
	if err != nil {
		return "", "", fmt.Errorf("大模型调用失败：%v", err)
	}

	// 5. 提取大模型生成结果（直接使用SDK响应结构体的Result字段）
	if resp.Result == "" {
		return "", "", fmt.Errorf("未获取到有效生成结果")
	}

	// 6. 分割规划和建议（按约定格式提取）
	parts := strings.Split(resp.Result, "【建议】")
	if len(parts) < 2 {
		return "", "", fmt.Errorf("AI返回格式不符合要求（缺少【建议】）：%s", resp.Result)
	}
	plan = strings.TrimPrefix(parts[0], "【规划】") // 移除【规划】前缀
	advice = parts[1]                           // 提取建议内容

	return plan, advice, nil
}

```

- **关键修改**：将 `APIKey` 和 `SecretKey` 替换为步骤 1 中申请的百度智能云密钥。

### 步骤 6：编写后端主服务（路由 + 逻辑）

在项目根目录下新建 `main.go` 文件（后端入口文件），粘贴以下代码：

go



运行

```go
package main

import (
	"net/http"
	"strconv"
	"time"
	"your-project-path/config"  // 替换为你的Go模块名
	"your-project-path/model"   // 替换为你的Go模块名
	"your-project-path/service" // 替换为你的Go模块名

	"github.com/gin-gonic/gin"
)

func main() {
	// 第一步：初始化数据库（调用config中的InitDB）
	if err := config.InitDB(); err != nil {
		panic("数据库初始化失败：" + err.Error()) // 失败则退出程序
	}

	// 第二步：初始化Gin引擎（开启默认中间件：日志、恢复）
	r := gin.Default()

	// 第三步：配置Gin模板和静态文件
	r.LoadHTMLGlob("templates/*")          // 加载templates目录下的HTML模板
	r.Static("/static", "./static")         // 映射/static路径到static目录（前端加载CSS/JS）

	// 第四步：定义路由（接口+页面）
	// 1. 首页：GET请求，展示任务列表
	r.GET("/", func(c *gin.Context) {
		var tasks []model.Task
		// 从数据库查询所有任务（按创建时间倒序，最新的在前面）
		config.DB.Order("created_at desc").Find(&tasks)
		// 渲染templates/index.html，并传递tasks数据到前端
		c.HTML(http.StatusOK, "index.html", gin.H{"tasks": tasks})
	})

	// 2. 添加任务：POST请求，接收前端表单，调用AI生成规划
	r.POST("/task/add", func(c *gin.Context) {
		// 1. 接收前端表单参数（对应index.html中的表单name）
		title := c.PostForm("title")       // 任务标题
		content := c.PostForm("content")   // 任务详情
		dueTimeStr := c.PostForm("due_time")// 截止时间（前端传的是"2024-12-31T23:59"格式）

		// 2. 转换截止时间格式（前端T分隔 → 后端空格分隔）
		dueTime, err := time.Parse("2006-01-02T15:04", dueTimeStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"msg": "截止时间格式错误"})
			return
		}

		// 3. 调用AI服务生成规划和建议
		aiPlan, aiAdvice, err := service.GetAIAdvice(
			title, 
			content, 
			dueTime.Format("2006-01-02 15:04"), // 传给AI的时间格式
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"msg": "AI调用失败：" + err.Error()})
			return
		}

		// 4. 保存任务到数据库（创建model.Task对象）
		task := model.Task{
			Title:    title,
			Content:  content,
			DueTime:  dueTime,
			AIPlan:   aiPlan,
			AIAdvice: aiAdvice,
			Status:   model.StatusPending, // 默认状态：待执行
		}
		config.DB.Create(&task) // 插入数据库

		// 5. 返回成功响应给前端
		c.JSON(http.StatusOK, gin.H{"msg": "任务添加成功（AI规划已生成）"})
	})

	// 3. 更新任务状态：POST请求，接收任务ID和新状态
	r.POST("/task/status", func(c *gin.Context) {
		// 1. 接收前端参数（任务ID是字符串，需转为int）
		idStr := c.PostForm("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"msg": "任务ID格式错误"})
			return
		}
		newStatus := model.TaskStatus(c.PostForm("status")) // 转换为TaskStatus类型

		// 2. 更新数据库中的任务状态（根据ID更新status字段）
		config.DB.Model(&model.Task{}).Where("id = ?", id).Update("status", newStatus)

		// 3. 返回成功响应
		c.JSON(http.StatusOK, gin.H{"msg": "任务状态更新成功"})
	})

	// 第五步：启动服务（监听8080端口，访问地址：http://localhost:8080）
	r.Run(":8080")
}
```

- **关键修改**：将 `your-project-path` 替换为步骤 3 中 `go mod init` 定义的模块名（如 `github.com/your-name/ai-memo`）。

### 步骤 7：编写前端代码（HTML/CSS/JS）

#### 7.1 编写首页 HTML（templates/index.html）

在 `templates` 目录下新建 `index.html` 文件，粘贴以下代码：

html



预览









```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI智能备忘录</title>
    <!-- 加载静态CSS（对应static/css/style.css） -->
    <link rel="stylesheet" href="/static/css/style.css">
</head>
<body>
    <div class="container">
        <!-- 页面标题 -->
        <h1>AI智能备忘录</h1>

        <!-- 1. 任务添加表单 -->
        <div class="add-task">
            <h3>添加新任务</h3>
            <form id="taskForm">
                <div class="form-item">
                    <label>任务标题：</label>
                    <input type="text" name="title" required placeholder="例如：完成Go项目报告">
                </div>
                <div class="form-item">
                    <label>任务详情：</label>
                    <textarea name="content" rows="3" placeholder="例如：包含需求分析、代码说明、测试报告"></textarea>
                </div>
                <div class="form-item">
                    <label>截止时间：</label>
                    <input type="datetime-local" name="due_time" required>
                </div>
                <button type="submit" id="submitBtn">添加任务（AI自动规划）</button>
                <!-- AI加载状态（默认隐藏） -->
                <span id="loading" style="display: none; margin-left: 10px; color: #666;">AI正在生成规划...（约3秒）</span>
            </form>
        </div>

        <!-- 2. 任务列表（后端传递的tasks数据会渲染这里） -->
        <div class="task-list">
            <h3>我的任务</h3>
            {{if len .tasks}}
                <ul>
                    {{range .tasks}}
                    <li class="task-item">
                        <!-- 任务标题+状态选择器 -->
                        <div class="task-header">
                            <h4>{{.Title}}</h4>
                            <select class="status-select" data-id="{{.ID}}">
                                <option value="pending" {{if eq .Status "pending"}}selected{{end}}>待执行</option>
                                <option value="doing" {{if eq .Status "doing"}}selected{{end}}>执行中</option>
                                <option value="done" {{if eq .Status "done"}}selected{{end}}>已完成</option>
                            </select>
                        </div>
                        <!-- 任务基础信息 -->
                        <div class="task-info">
                            <p><span>详情：</span>{{if .Content}}{{.Content}}{{else}}无详情{{end}}</p>
                            <p><span>截止时间：</span>{{.DueTime.Format "2006-01-02 15:04"}}</p>
                            <p><span>创建时间：</span>{{.CreatedAt.Format "2006-01-02 15:04"}}</p>
                        </div>
                        <!-- AI生成的规划和建议 -->
                        <div class="ai-content">
                            <p><span>AI规划：</span>{{.AIPlan}}</p>
                            <p><span>AI建议：</span>{{.AIAdvice}}</p>
                        </div>
                    </li>
                    {{end}}
                </ul>
            {{else}}
                <!-- 无任务时显示 -->
                <p class="empty">暂无任务，点击“添加新任务”开始吧！</p>
            {{end}}
        </div>
    </div>

    <!-- 加载静态JS（对应static/js/main.js） -->
    <script src="/static/js/main.js"></script>
</body>
</html>
```

#### 7.2 编写 CSS 样式（static/css/style.css）

在 `static/css` 目录下新建 `style.css` 文件，粘贴以下代码：

css











```css
/* 全局样式重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: "Microsoft YaHei", Arial, sans-serif;
}

body {
    background-color: #f5f7fa;
    color: #333;
}

/* 容器样式（居中+宽度限制） */
.container {
    max-width: 1000px;
    margin: 30px auto;
    padding: 0 20px;
}

h1 {
    color: #2c3e50;
    text-align: center;
    margin-bottom: 40px;
    font-size: 28px;
}

h3 {
    color: #2c3e50;
    margin-bottom: 15px;
    font-size: 18px;
}

/* 1. 任务添加表单样式 */
.add-task {
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin-bottom: 30px;
}

.form-item {
    margin-bottom: 20px;
}

.form-item label {
    display: block;
    margin-bottom: 8px;
    color: #666;
    font-weight: 500;
}

.form-item input, 
.form-item textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border 0.3s;
}

.form-item input:focus, 
.form-item textarea:focus {
    outline: none;
    border-color: #3498db;
}

.form-item textarea {
    resize: vertical; /* 只允许垂直拉伸 */
}

button {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background 0.3s;
}

button:hover {
    background-color: #2980b9;
}

/* 2. 任务列表样式 */
.task-list {
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.task-item {
    border-bottom: 1px solid #f0f0f0;
    padding: 20px 0;
    list-style: none;
}

.task-item:last-child {
    border-bottom: none;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.task-header h4 {
    color: #2c3e50;
    font-size: 16px;
}

.status-select {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    transition: border 0.3s;
}

.status-select:focus {
    outline: none;
    border-color: #3498db;
}

.task-info {
    margin-bottom: 15px;
    font-size: 14px;
    color: #666;
    line-height: 1.8;
}

.task-info span {
    color: #999;
    margin-right: 8px;
}

/* AI内容样式（突出显示） */
.ai-content {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 4px;
    font-size: 14px;
    line-height: 1.8;
    color: #555;
}

.ai-content span {
    color: #3498db;
    font-weight: 500;
    margin-right: 8px;
}

/* 无任务提示样式 */
.empty {
    text-align: center;
    padding: 40px 0;
    color: #999;
    font-size: 14px;
    background-color: #f8f9fa;
    border-radius: 4px;
}
```

#### 7.3 编写前端 JS（static/js/main.js）

在 `static/js` 目录下新建 `main.js` 文件，粘贴以下代码：

javascript



运行









```javascript
// 1. 任务表单提交逻辑（调用后端/add接口，带加载状态）
const taskForm = document.getElementById('taskForm');
const submitBtn = document.getElementById('submitBtn');
const loading = document.getElementById('loading');

taskForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // 阻止表单默认刷新行为

    // 显示加载状态，禁用按钮（防止重复提交）
    submitBtn.disabled = true;
    loading.style.display = 'inline-block';

    try {
        // 收集表单数据（转为URL编码格式，适配后端POST接收）
        const formData = new FormData(taskForm);
        const formParams = new URLSearchParams(formData);

        // 调用后端添加任务接口
        const response = await fetch('/task/add', {
            method: 'POST',
            body: formParams, // 自动设置Content-Type为application/x-www-form-urlencoded
        });

        // 解析后端响应（JSON格式）
        const result = await response.json();
        
        // 提示用户并刷新页面（显示新任务）
        alert(result.msg);
        window.location.reload();
    } catch (error) {
        // 捕获错误并提示
        alert('添加任务失败：' + error.message);
    } finally {
        // 恢复按钮和加载状态（无论成功/失败）
        submitBtn.disabled = false;
        loading.style.display = 'none';
    }
});

// 2. 任务状态更新逻辑（实时修改，无需刷新页面）
const statusSelects = document.querySelectorAll('.status-select');

statusSelects.forEach(select => {
    // 记录初始状态（用于更新失败时恢复）
    const oldStatus = select.value;

    // 监听下拉框变化
    select.addEventListener('change', async (e) => {
        const taskId = e.target.dataset.id; // 获取任务ID（从HTML的data-id属性）
        const newStatus = e.target.value;   // 获取新状态

        try {
            // 调用后端更新状态接口
            await fetch('/task/status', {
                method: 'POST',
                body: new URLSearchParams({
                    id: taskId,
                    status: newStatus
                })
            });

            // 更新成功：提示用户（可选）
            // alert('状态已更新');
        } catch (error) {
            // 更新失败：恢复初始状态并提示
            e.target.value = oldStatus;
            alert('更新状态失败：' + error.message);
        }
    });
});
```

### 步骤 8：测试运行项目

1. **启动 MySQL 服务**

   - Windows：打开 “服务”，找到 “MySQL”，确保状态为 “正在运行”；
   - Mac：通过 “系统偏好设置”→“MySQL”，点击 “Start MySQL Server”；
   - Linux：执行 `sudo systemctl start mysql`。

2. **启动后端服务**

   在项目根目录执行以下命令（终端 / CMD）：

   bash

   

   

   

   

   

   ```bash
   go run main.go
   ```

   

   - 成功提示：`[GIN-debug] Listening and serving HTTP on :8080`（表示服务已启动，监听 8080 端口）。

3. **访问应用**

   打开浏览器，输入地址：`http://localhost:8080`，即可看到 AI 备忘录页面：

   - 功能 1：填写任务标题、详情、截止时间，点击 “添加任务”，等待 AI 生成规划（约 3 秒），成功后刷新页面显示新任务；
   - 功能 2：在任务列表的下拉框中修改状态（待执行→执行中→已完成），实时更新数据库；
   - 功能 3：查看 AI 生成的 “规划” 和 “建议”（在每个任务的下方）。

### 步骤 9：常见问题排查

1. **数据库连接失败**
   - 错误提示：`数据库初始化失败：Error 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)`
   - 解决：检查 `config/db.go` 中的 `dsn`，确认 MySQL 密码正确（如 `root:123456` 中的 `123456` 是你的实际密码）。
2. **AI 调用失败**
   - 错误提示：`AI调用失败：AI返回错误：18-Invalid API Key`
   - 解决：检查 `service/ai_service.go` 中的 `APIKey` 和 `SecretKey`，确认与百度智能云的应用密钥一致（注意大小写）。
3. **前端样式不加载**
   - 现象：页面无样式，CSS/JS 路径报错；
   - 解决：确保 `main.go` 中 `r.Static("/static", "./static")` 配置正确，且 HTML 中 `link` 和 `script` 的路径是 `/static/css/style.css`（开头带 `/`）。
4. **端口被占用**
   - 错误提示：`bind: address already in use`
   - 解决：修改 `main.go` 中 `r.Run(":8080")` 为其他端口（如 `r.Run(":8081")`），访问时用 `http://localhost:8081`。

## 三、功能扩展建议（可选）

1. **任务删除 / 编辑**：在 `main.go` 中添加 `/task/delete` 和 `/task/edit` 接口，前端增加删除按钮和编辑表单；
2. **AI 多轮交互**：在任务详情页增加 “追问 AI” 输入框，支持用户进一步细化规划（如 “如何优化这个任务步骤？”）；
3. **到期提醒**：集成 Go 的定时任务库（如 `github.com/robfig/cron`），每天检查到期任务，通过邮件 / 短信提醒；
4. **数据导出**：添加 “导出任务” 功能，将任务列表导出为 Excel（使用 `github.com/xuri/excelize/v2` 库）。

按照以上步骤操作，即可完成一个完整的 “AI 自动规划任务” 备忘录应用，前后端全链路打通，支持核心功能使用。

编辑分享





# 待改进V2.0

### 功能扩展一：任务删除功能

**目标**：实现 “删除任务” 按钮，点击后从数据库删除任务并刷新列表。

#### 步骤 1：后端添加删除任务路由（修改 `main.go`）

在现有路由后新增删除逻辑：

go



运行









```go
// 4. 删除任务：POST请求，接收任务ID并删除
r.POST("/task/delete", func(c *gin.Context) {
    // 解析任务ID
    idStr := c.PostForm("id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"msg": "任务ID格式错误"})
        return
    }
    // GORM删除任务（根据ID）
    config.DB.Delete(&model.Task{}, id)
    c.JSON(http.StatusOK, gin.H{"msg": "任务删除成功"})
})
```

#### 步骤 2：前端页面添加删除按钮（修改 `templates/index.html`）

在任务项的「状态选择器」旁添加删除按钮：

html



预览









```html
<div class="task-header">
    <h4>{{.Title}}</h4>
    <div>
        <select class="status-select" data-id="{{.ID}}">
            <option value="pending" {{if eq .Status "pending"}}selected{{end}}>待执行</option>
            <option value="doing" {{if eq .Status "doing"}}selected{{end}}>执行中</option>
            <option value="done" {{if eq .Status "done"}}selected{{end}}>已完成</option>
        </select>
        <button class="delete-btn" data-id="{{.ID}}">删除</button>
    </div>
</div>
```

#### 步骤 3：前端 JS 处理删除逻辑（修改 `static/js/main.js`）

添加删除按钮的点击事件：

javascript



运行









```javascript
// 3. 任务删除逻辑
const deleteBtns = document.querySelectorAll('.delete-btn');
deleteBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const taskId = e.target.dataset.id;
        if (confirm('确定要删除该任务吗？')) {
            try {
                await fetch('/task/delete', {
                    method: 'POST',
                    body: new URLSearchParams({ id: taskId })
                });
                window.location.reload(); // 刷新页面
            } catch (error) {
                alert('删除失败：' + error.message);
            }
        }
    });
});
```

#### 步骤 4：添加删除按钮样式（修改 `static/css/style.css`）

css











```css
.delete-btn {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    cursor: pointer;
    margin-left: 10px;
    transition: background 0.3s;
}
.delete-btn:hover {
    background-color: #c0392b;
}
```

### 功能扩展二：AI 多轮交互（任务详情追问）

**目标**：在任务详情页添加输入框，向 AI 追问并获取实时建议。

#### 步骤 1：后端添加 “追问 AI” 路由（修改 `main.go`）

新增路由处理追问请求：

go



运行









```go
// 5. AI追问：接收任务ID和问题，生成新建议
r.POST("/task/ask", func(c *gin.Context) {
    taskIdStr := c.PostForm("taskId")
    taskId, err := strconv.Atoi(taskIdStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"msg": "任务ID错误"})
        return
    }
    question := c.PostForm("question") // 追问内容

    // 查询任务详情
    var task model.Task
    if err := config.DB.First(&task, taskId).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"msg": "任务不存在"})
        return
    }

    // 构造包含任务上下文的提示词
    prompt := fmt.Sprintf(`
    任务标题：%s
    详情：%s
    截止时间：%s
    AI原规划：%s
    AI原建议：%s
    我的问题：%s
    `, task.Title, task.Content, task.DueTime.Format("2006-01-02 15:04"), task.AIPlan, task.AIAdvice, question)

    // 调用AI服务（复用GetAIAdvice，忽略title和content，用prompt传完整问题）
    _, aiReply, err := service.GetAIAdvice("", "", prompt)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"msg": "AI调用失败"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"reply": aiReply})
})
```

#### 步骤 2：前端页面添加追问输入框（修改 `templates/index.html`）

在任务的「AI 内容」下方新增输入框：

html



预览









```html
<div class="ai-ask">
    <input type="text" id="askInput" placeholder="向AI追问（如：如何优化步骤？）" data-id="{{.ID}}">
    <button class="ask-btn" data-id="{{.ID}}">追问AI</button>
    <div id="aiReply" style="display: none; margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px;">
        <span>AI回复：</span><span id="replyContent"></span>
    </div>
</div>
```

#### 步骤 3：前端 JS 处理追问逻辑（修改 `static/js/main.js`）

添加追问按钮的点击事件：

javascript



运行









```javascript
// 4. AI追问逻辑
const askBtns = document.querySelectorAll('.ask-btn');
askBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        const taskId = e.target.dataset.id;
        const input = document.querySelector(`#askInput[data-id="${taskId}"]`);
        const question = input.value.trim();
        if (!question) {
            alert('请输入追问内容');
            return;
        }

        // 显示加载状态
        const loading = document.createElement('span');
        loading.textContent = 'AI思考中...';
        loading.style.marginLeft = '10px';
        btn.parentNode.appendChild(loading);

        try {
            const res = await fetch('/task/ask', {
                method: 'POST',
                body: new URLSearchParams({ taskId, question })
            });
            const data = await res.json();

            // 显示AI回复
            const replyDiv = document.querySelector(`#aiReply[data-id="${taskId}"]`);
            const replyContent = document.querySelector(`#replyContent[data-id="${taskId}"]`);
            replyContent.textContent = data.reply;
            replyDiv.style.display = 'block';
        } catch (err) {
            alert('追问失败：' + err.message);
        } finally {
            loading.remove(); // 移除加载状态
        }
    });
});
```

#### 步骤 4：添加追问样式（修改 `static/css/style.css`）

css











```css
.ai-ask {
    margin-top: 20px;
}
.ai-ask input {
    width: calc(100% - 120px);
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}
.ask-btn {
    background-color: #2ecc71;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-left: 5px;
    transition: background 0.3s;
}
.ask-btn:hover {
    background-color: #27ae60;
}
```

### 功能扩展三：到期提醒（定时任务 + 邮件通知）

**目标**：每天自动检查到期任务，通过邮件提醒用户。

#### 步骤 1：安装依赖

bash











```bash
go get github.com/robfig/cron/v3     # 定时任务库
go get github.com/jordan-wright/email # 邮件库
```

#### 步骤 2：配置邮件服务（新增 `config/email.go`）

在 `config` 目录新建 `email.go`，配置邮件服务器（以 QQ 邮箱为例）：

go



运行









```go
package config

import (
	"github.com/jordan-wright/email"
	"net/smtp"
)

// 邮件配置（需替换为你的实际信息）
const (
	EmailHost     = "smtp.qq.com"      // QQ邮箱SMTP服务器
	EmailPort     = 587                // SMTP端口
	EmailUsername = "你的QQ邮箱@qq.com" // 邮箱账号
	EmailPassword = "你的SMTP授权码"    // QQ邮箱需生成“SMTP授权码”（非登录密码）
	EmailFrom     = "你的QQ邮箱@qq.com" // 发件人地址
)

// SendEmail 发送邮件
func SendEmail(to, subject, body string) error {
	e := email.NewEmail()
	e.From = EmailFrom
	e.To = []string{to}
	e.Subject = subject
	e.Text = []byte(body)
	return e.Send(EmailHost+":"+string(EmailPort), smtp.PlainAuth("", EmailUsername, EmailPassword, EmailHost))
}
```

#### 步骤 3：添加定时任务（修改 `main.go`）

导入依赖并启动定时任务：

go



运行









```go
package main

import (
	"aimemo/config"
	"aimemo/model"
	"aimemo/service"
	"time"
	"github.com/gin-gonic/gin"
	"github.com/robfig/cron/v3" // 新增：定时任务库
	"net/http"
	"strconv"
	"fmt" // 新增：用于日志打印
)

func main() {
	// ... 原有初始化代码（数据库、Gin引擎）...

	// 启动定时任务
	cronJob := cron.New()
	// 每天9:00执行（Cron表达式："0 9 * * *"）
	_, err := cronJob.AddFunc("0 9 * * *", checkDueTasks)
	if err != nil {
		panic("定时任务创建失败：" + err.Error())
	}
	cronJob.Start()

	// ... 原有路由代码 ...

	// 启动服务
	r.Run(":8080")
}

// checkDueTasks 检查当天到期的任务并发送邮件
func checkDueTasks() {
	var tasks []model.Task
	todayEnd := time.Now().Truncate(24 * time.Hour).Add(23*time.Hour + 59*time.Minute + 59*time.Second)
	config.DB.Where("due_time <= ?", todayEnd).Find(&tasks)

	for _, task := range tasks {
		userEmail := "接收提醒的邮箱@xxx.com" // 需替换为实际用户邮箱（可扩展User模型存储）
		subject := "任务到期提醒：" + task.Title
		body := fmt.Sprintf(`
		任务标题：%s
		详情：%s
		截止时间：%s
		AI规划：%s
		AI建议：%s
		`, task.Title, task.Content, task.DueTime.Format("2006-01-02 15:04"), task.AIPlan, task.AIAdvice)
		
		if err := config.SendEmail(userEmail, subject, body); err != nil {
			fmt.Printf("邮件发送失败，任务ID：%d，错误：%v\n", task.ID, err)
		}
	}
}
```

#### 步骤 4：测试定时任务（可选）

若需快速测试，临时修改 Cron 表达式为 `*/1 * * * *`（每分钟执行一次），等待 1 分钟后查看邮箱是否收到提醒，测试后改回 `0 9 * * *`。

### 功能扩展四：任务导出为 Excel

**目标**：添加按钮，将任务列表导出为 Excel 文件。

#### 步骤 1：安装 Excel 依赖

bash











```bash
go get github.com/xuri/excelize/v2
```

#### 步骤 2：后端添加导出路由（修改 `main.go`）

新增导出 Excel 的路由：

go



运行









```go
// 6. 导出任务为Excel
r.GET("/task/export", func(c *gin.Context) {
    var tasks []model.Task
    config.DB.Order("created_at desc").Find(&tasks)

    f := excelize.NewFile()
    defer f.Close()

    // 设置表头
    f.SetCellValue("Sheet1", "A1", "ID")
    f.SetCellValue("Sheet1", "B1", "标题")
    f.SetCellValue("Sheet1", "C1", "详情")
    f.SetCellValue("Sheet1", "D1", "截止时间")
    f.SetCellValue("Sheet1", "E1", "状态")
    f.SetCellValue("Sheet1", "F1", "AI规划")
    f.SetCellValue("Sheet1", "G1", "AI建议")
    f.SetCellValue("Sheet1", "H1", "创建时间")

    // 填充任务数据
    for i, task := range tasks {
        row := i + 2
        f.SetCellValue("Sheet1", fmt.Sprintf("A%d", row), task.ID)
        f.SetCellValue("Sheet1", fmt.Sprintf("B%d", row), task.Title)
        f.SetCellValue("Sheet1", fmt.Sprintf("C%d", row), task.Content)
        f.SetCellValue("Sheet1", fmt.Sprintf("D%d", row), task.DueTime.Format("2006-01-02 15:04"))
        f.SetCellValue("Sheet1", fmt.Sprintf("E%d", row), task.Status)
        f.SetCellValue("Sheet1", fmt.Sprintf("F%d", row), task.AIPlan)
        f.SetCellValue("Sheet1", fmt.Sprintf("G%d", row), task.AIAdvice)
        f.SetCellValue("Sheet1", fmt.Sprintf("H%d", row), task.CreatedAt.Format("2006-01-02 15:04"))
    }

    // 设置下载响应头
    c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    c.Header("Content-Disposition", "attachment; filename=tasks.xlsx")
    if err := f.WriteTo(c.Writer); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"msg": "导出失败"})
    }
})
```

#### 步骤 3：前端添加导出按钮（修改 `templates/index.html`）

在任务列表标题旁添加按钮：

html



预览









```html
<div class="task-list">
    <h3>我的任务</h3>
    <button id="exportBtn">导出任务为Excel</button>
    {{if len .tasks}}
    <ul>...</ul>
    {{else}}
    <p class="empty">暂无任务</p>
    {{end}}
</div>
```

#### 步骤 4：前端 JS 处理导出逻辑（修改 `static/js/main.js`）

添加导出按钮的点击事件：

javascript



运行









```javascript
// 5. 导出任务为Excel
const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    exportBtn.addEventListener('click', () => {
        window.location.href = '/task/export'; // 跳转到导出接口，触发文件下载
    });
}
```

#### 步骤 5：添加导出按钮样式（修改 `static/css/style.css`）

css











```css
#exportBtn {
    background-color: #3498db;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-bottom: 20px;
    transition: background 0.3s;
}
#exportBtn:hover {
    background-color: #2980b9;
}
```

### 总结

通过以上步骤，依次实现了**任务删除**、**AI 多轮交互**、**到期提醒**、**Excel 导出**四大扩展功能。每个功能从**后端路由**、**前端页面**、**JS 逻辑**、**样式美化**等维度逐步修改，确保功能完整且交互友好。实际部署时，需根据自身环境替换**数据库密码**、**AI 密钥**、**邮件服务器配置**等敏感信息。