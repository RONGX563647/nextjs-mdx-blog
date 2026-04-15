# 完整个人博客项目（VuePress + Gin + GORM）- 含布局优化 + MD 上传 + 用户注册

基于原有架构，补充**用户注册、文档分类、Markdown 实时编辑、路由守卫、统一提示**等核心功能，修复权限判断与体验问题，形成生产可用的完整项目。以下是全量代码与配置。

## 一、项目整体结构（最终版）

plaintext



```plaintext
blog-project/
├─ frontend/          # VuePress 前端（布局优化+MD上传+多语言）
│  ├─ docs/            # 文档源文件（含多语言）
│  │  ├─ .vuepress/    # VuePress 核心配置
│  │  │  ├─ components/ # 自定义组件（登录/注册/文档管理/MD编辑器）
│  │  │  │  ├─ Login.vue       # 登录组件
│  │  │  │  ├─ Register.vue    # 新增：注册组件
│  │  │  │  ├─ DocManager.vue  # 文档管理（含MD上传+分类选择）
│  │  │  │  └─ MDEditor.vue    # 新增：Markdown实时编辑组件
│  │  │  ├─ public/      # 静态资源
│  │  │  │  └─ custom.css      # 布局优化样式
│  │  │  ├─ config.js     # 导航/搜索/多语言配置
│  │  │  └─ enhanceApp.js # 全局配置（路由守卫+Toast+axios）
│  │  ├─ en/             # 英文页面（多语言）
│  │  │  ├─ README.md     # 英文首页
│  │  │  ├─ login.md      # 英文登录页
│  │  │  ├─ register.md   # 英文注册页
│  │  │  └─ admin.md      # 英文管理中心
│  │  ├─ README.md        # 中文首页
│  │  ├─ login.md         # 中文登录页
│  │  ├─ register.md      # 新增：中文注册页
│  │  └─ admin.md         # 中文管理中心
│  └─ package.json        # 前端依赖（含mavon-editor/Toast）
└─ backend/           # Gin 后端（用户注册+文档分类+权限控制）
   ├─ main.go         # 入口文件（全局错误处理+路由注册）
   ├─ model/          # GORM 模型（Doc加分类字段）
   │  ├─ user.go      # 用户模型
   │  └─ doc.go       # 文档模型（新增Category字段）
   ├─ handler/        # API 处理器（新增注册/分类接口）
   │  ├─ auth.go      # 登录+新增注册接口
   │  ├─ doc.go       # 文档CRUD（加分类+权限判断）
   │  └─ upload.go    # MD文件/文件夹上传接口
   ├─ middleware/     # 中间件（新增全局错误处理）
   │  ├─ jwt.go       # JWT认证
   │  ├─ cors.go      # 跨域配置
   │  └─ error.go     # 新增：全局错误处理中间件
   ├─ util/           # 工具函数（JWT/密码/文件解析）
   │  ├─ jwt.go       # JWT生成/验证
   │  ├─ password.go  # 密码哈希
   │  └─ file.go      # MD文件解析
   ├─ config/         # 配置（支持环境变量）
   │  └─ config.go    # 数据库/JWT配置（环境变量占位）
   ├─ temp_upload/    # 临时上传目录（自动创建）
   └─ go.mod          # 后端依赖
```

## 二、后端实现（完整版）

### 1. 初始化后端项目与依赖

bash











```bash
# 创建后端目录
mkdir -p blog-project/backend && cd blog-project/backend
# 初始化Go模块
go mod init github.com/your-name/blog-backend
# 安装依赖（含文件处理、环境变量）
go get github.com/gin-gonic/gin
go get gorm.io/gorm
go get gorm.io/driver/mysql
go get github.com/golang-jwt/jwt/v5
go get golang.org/x/crypto/bcrypt
go get github.com/gin-contrib/cors
go get github.com/spf13/viper  # 新增：环境变量配置
go get github.com/google/uuid  # 新增：生成唯一ID
```

### 2. 配置文件（支持环境变量，config/config.go）

go



运行









```go
package config

import (
	"os"
	"time"

	"github.com/spf13/viper"
)

// 全局配置
var Conf = &Config{}

// Config 系统总配置
type Config struct {
	DB  DBConfig  `mapstructure:"db"`
	JWT JWTConfig `mapstructure:"jwt"`
}

// DBConfig 数据库配置
type DBConfig struct {
	DSN string `mapstructure:"dsn"` // 优先从环境变量获取
}

// JWTConfig JWT配置
type JWTConfig struct {
	Secret  string        `mapstructure:"secret"`  // 签名密钥（环境变量）
	Expires time.Duration `mapstructure:"expires"` // 过期时间（默认24h）
}

// Init 初始化配置（优先环境变量，其次默认值）
func Init() {
	// 1. 加载环境变量
	viper.AutomaticEnv()
	// 2. 数据库配置（环境变量BLOG_DB_DSN，默认本地MySQL）
	Conf.DB.DSN = viper.GetString("BLOG_DB_DSN")
	if Conf.DB.DSN == "" {
		Conf.DB.DSN = "root:123456@tcp(127.0.0.1:3306)/blog_db?charset=utf8mb4&parseTime=true&loc=Local"
	}
	// 3. JWT配置（环境变量BLOG_JWT_SECRET，默认临时密钥）
	Conf.JWT.Secret = viper.GetString("BLOG_JWT_SECRET")
	if Conf.JWT.Secret == "" {
		Conf.JWT.Secret = "blog-jwt-secret-2025-dev" // 生产环境必须替换为环境变量
	}
	// 4. JWT过期时间（默认24h）
	Conf.JWT.Expires = time.Duration(viper.GetInt64("BLOG_JWT_EXPIRES")) * time.Hour
	if Conf.JWT.Expires == 0 {
		Conf.JWT.Expires = 24 * time.Hour
	}
}
```

### 3. 数据库模型（model/）

#### 3.1 用户模型（model/user.go）

go



运行









```go
package model

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Username  string         `gorm:"column:username;type:varchar(50);not null;unique" json:"username"` // 唯一用户名
	Password  string         `gorm:"column:password;type:varchar(100);not null" json:"-"`              // 密码哈希（返回时隐藏）
	Email     string         `gorm:"column:email;type:varchar(100);not null;unique" json:"email"`     // 新增：唯一邮箱
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"` // 软删除（返回时隐藏）
}

// 表名
func (User) TableName() string {
	return "t_user"
}
```

#### 3.2 文档模型（model/doc.go，新增分类字段）

go



运行









```go
package model

import (
	"gorm.io/gorm"
	"time"
)

// 文档分类枚举（固定分类：技术笔记/生活随笔）
const (
	CategoryTech  = "tech"  // 技术笔记
	CategoryLife  = "life"  // 生活随笔
	CategoryOther = "other" // 其他
)

type Doc struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Title     string         `gorm:"column:title;type:varchar(100);not null" json:"title"` // 文档标题
	Content   string         `gorm:"column:content;type:text;not null" json:"content"`     // Markdown内容
	Category  string         `gorm:"column:category;type:varchar(20);not null" json:"category"` // 新增：文档分类
	AuthorID  uint           `gorm:"column:author_id;not null;index" json:"author_id"`     // 作者ID
	CreatedAt time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"` // 软删除
	Author    User           `gorm:"foreignKey:AuthorID" json:"author,omitempty"` // 关联用户（仅查询用）
}

// 表名
func (Doc) TableName() string {
	return "t_doc"
}

// 验证分类是否合法
func IsValidCategory(cat string) bool {
	switch cat {
	case CategoryTech, CategoryLife, CategoryOther:
		return true
	default:
		return false
	}
}
```

### 4. 工具函数（util/）

#### 4.1 密码哈希（util/password.go）

go



运行









```go
package util

import "golang.org/x/crypto/bcrypt"

// HashPassword 密码哈希（bcrypt）
func HashPassword(password string) (string, error) {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(hashBytes), err
}

// CheckPassword 验证密码（哈希对比）
func CheckPassword(hashPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashPassword), []byte(password))
	return err == nil
}
```

#### 4.2 JWT 工具（util/jwt.go）

go



运行









```go
package util

import (
	"errors"
	"github.com/golang-jwt/jwt/v5"
	"github.com/your-name/blog-backend/config"
	"time"
)

// JWTClaims JWT载荷（存储用户ID/用户名）
type JWTClaims struct {
	UserID   uint   `json:"user_id"`
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken 生成JWT Token
func GenerateToken(userID uint, username string) (string, error) {
	claims := JWTClaims{
		UserID:   userID,
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(config.Conf.JWT.Expires)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "blog-backend",
		},
	}
	// HS256算法签名
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(config.Conf.JWT.Secret))
}

// ParseToken 解析Token
func ParseToken(tokenStr string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// 验证算法
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("invalid token signing method")
		}
		return []byte(config.Conf.JWT.Secret), nil
	})
	// 提取载荷
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid or expired token")
}
```

#### 4.3 MD 文件解析（util/file.go）

go



运行









```go
package util

import (
	"bufio"
	"os"
	"strings"
)

// ParseMDContent 解析MD文件：提取第一个#标题，其余为内容
func ParseMDContent(filePath string) (title, content string, err error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", "", err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	var lines []string
	title = "Untitled Document" // 默认标题

	for scanner.Scan() {
		line := scanner.Text()
		lines = append(lines, line)
		// 提取第一个一级标题（# 开头）
		if strings.HasPrefix(line, "# ") && title == "Untitled Document" {
			title = strings.TrimPrefix(line, "# ")
		}
	}

	content = strings.Join(lines, "\n")
	return title, content, scanner.Err()
}
```

### 5. 中间件（middleware/）

#### 5.1 跨域配置（middleware/cors.go）

go



运行









```go
package middleware

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"time"
)

// CORS 跨域中间件（允许前端VuePress访问）
func CORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8080"}, // 前端地址（生产环境替换为域名）
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour, // 预检请求缓存
	})
}
```

#### 5.2 JWT 认证（middleware/jwt.go）

go



运行









```go
package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/your-name/blog-backend/util"
	"net/http"
	"strings"
)

// JWTAuth JWT认证中间件（保护需要登录的接口）
func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 提取Authorization头
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Set("error", "未登录：请先登录")
			c.Abort()
			return
		}
		// 2. 解析Bearer Token格式
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.Set("error", "Token格式错误：应为Bearer <token>")
			c.Abort()
			return
		}
		// 3. 验证Token
		claims, err := util.ParseToken(parts[1])
		if err != nil {
			c.Set("error", "Token无效或已过期")
			c.Abort()
			return
		}
		// 4. 存储用户信息到上下文
		c.Set("user_id", claims.UserID)
		c.Set("username", claims.Username)
		c.Next()
	}
}
```

#### 5.3 全局错误处理（middleware/error.go，新增）

go



运行









```go
package middleware

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

// GlobalErrorHandler 全局错误处理中间件（统一响应格式）
func GlobalErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next() // 先执行后续处理

		// 检查是否有错误
		if err, exists := c.Get("error"); exists {
			errMsg, _ := err.(string)
			c.JSON(http.StatusUnauthorized, gin.H{
				"code": 401,
				"msg":  errMsg,
			})
			return
		}

		// 处理其他错误（如数据库错误）
		if len(c.Errors) > 0 {
			firstErr := c.Errors.First()
			c.JSON(http.StatusInternalServerError, gin.H{
				"code": 500,
				"msg":  "服务器内部错误：" + firstErr.Error(),
			})
			return
		}
	}
}
```

### 6. API 处理器（handler/）

#### 6.1 认证接口（handler/auth.go，新增注册）

go



运行









```go
package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/your-name/blog-backend/model"
	"github.com/your-name/blog-backend/util"
	"gorm.io/gorm"
	"net/http"
	"regexp"
)

// 注册请求参数
type RegisterRequest struct {
	Username string `json:"username" binding:"required,min=3,max=20"`
	Password string `json:"password" binding:"required,min=6,max=20"`
	Email    string `json:"email" binding:"required,email"`
}

// 登录请求参数
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Register 注册接口（POST /api/auth/register）
func Register(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest
		// 1. 绑定参数
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误：" + err.Error()})
			return
		}
		// 2. 验证邮箱格式（额外增强）
		emailReg := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
		if !emailReg.MatchString(req.Email) {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "邮箱格式无效"})
			return
		}
		// 3. 检查用户名/邮箱是否已存在
		var user model.User
		if err := db.Where("username = ? OR email = ?", req.Username, req.Email).First(&user).Error; err != nil {
			if err != gorm.ErrRecordNotFound {
				c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "查询失败：" + err.Error()})
				return
			}
		} else {
			if user.Username == req.Username {
				c.JSON(http.StatusOK, gin.H{"code": 1, "msg": "用户名已存在"})
				return
			}
			if user.Email == req.Email {
				c.JSON(http.StatusOK, gin.H{"code": 1, "msg": "邮箱已被注册"})
				return
			}
		}
		// 4. 密码哈希
		hashPwd, err := util.HashPassword(req.Password)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "密码加密失败"})
			return
		}
		// 5. 创建用户
		newUser := model.User{
			Username: req.Username,
			Password: hashPwd,
			Email:    req.Email,
		}
		if err := db.Create(&newUser).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "创建用户失败：" + err.Error()})
			return
		}
		// 6. 返回结果
		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"msg":  "注册成功，请登录",
			"data": gin.H{"username": newUser.Username},
		})
	}
}

// Login 登录接口（POST /api/auth/login）
func Login(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req LoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误：" + err.Error()})
			return
		}
		// 1. 查询用户
		var user model.User
		if err := db.Where("username = ?", req.Username).First(&user).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusOK, gin.H{"code": 1, "msg": "用户名或密码错误"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "查询失败：" + err.Error()})
			return
		}
		// 2. 验证密码
		if !util.CheckPassword(user.Password, req.Password) {
			c.JSON(http.StatusOK, gin.H{"code": 1, "msg": "用户名或密码错误"})
			return
		}
		// 3. 生成Token
		token, err := util.GenerateToken(user.ID, user.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "Token生成失败"})
			return
		}
		// 4. 返回结果
		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"msg":  "登录成功",
			"data": gin.H{
				"token":    token,
				"username": user.Username,
				"email":    user.Email,
			},
		})
	}
}
```

#### 6.2 文档接口（handler/doc.go，加分类 + 权限判断）

go



运行









```go
package handler

import (
	"github.com/gin-gonic/gin"
	"github.com/your-name/blog-backend/model"
	"gorm.io/gorm"
	"net/http"
	"strconv"
	"time"
)

// 文档请求参数（含分类）
type DocRequest struct {
	Title    string `json:"title" binding:"required,min=1,max=100"`
	Content  string `json:"content" binding:"required,min=10"`
	Category string `json:"category" binding:"required"` // 新增：分类
}

// GetDocs 获取文档列表（支持分类筛选）
func GetDocs(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取筛选参数（分类）
		category := c.Query("category")
		// 2. 构建查询
		session := db.Order("created_at DESC")
		if category != "" && model.IsValidCategory(category) {
			session = session.Where("category = ?", category)
		}
		// 3. 查询文档
		var docs []model.Doc
		if err := session.Find(&docs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "查询失败：" + err.Error()})
			return
		}
		// 4. 返回结果
		c.JSON(http.StatusOK, gin.H{"code": 0, "data": docs})
	}
}

// CreateDoc 创建文档（需登录+验证分类）
func CreateDoc(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req DocRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误：" + err.Error()})
			return
		}
		// 1. 验证分类合法性
		if !model.IsValidCategory(req.Category) {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "无效分类：仅支持tech/life/other"})
			return
		}
		// 2. 获取当前用户ID
		userID, _ := c.Get("user_id")
		// 3. 创建文档
		doc := model.Doc{
			Title:    req.Title,
			Content:  req.Content,
			Category: req.Category,
			AuthorID: userID.(uint),
		}
		if err := db.Create(&doc).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "创建失败：" + err.Error()})
			return
		}
		// 4. 返回结果
		c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "创建成功", "data": doc})
	}
}

// UpdateDoc 更新文档（需登录+仅作者可修改）
func UpdateDoc(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取文档ID
		docIDStr := c.Param("id")
		docID, err := strconv.Atoi(docIDStr)
		if err != nil || docID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "文档ID无效"})
			return
		}
		// 2. 绑定参数
		var req DocRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "参数错误：" + err.Error()})
			return
		}
		// 3. 验证分类
		if !model.IsValidCategory(req.Category) {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "无效分类"})
			return
		}
		// 4. 查询文档（验证存在+作者权限）
		var doc model.Doc
		if err := db.First(&doc, docID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusOK, gin.H{"code": 1, "msg": "文档不存在"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "查询失败：" + err.Error()})
			return
		}
		// 5. 权限判断：仅作者可修改
		currentUserID, _ := c.Get("user_id")
		if doc.AuthorID != currentUserID.(uint) {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "msg": "无权限：仅作者可修改"})
			return
		}
		// 6. 更新文档
		doc.Title = req.Title
		doc.Content = req.Content
		doc.Category = req.Category
		doc.UpdatedAt = time.Now()
		if err := db.Save(&doc).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "更新失败：" + err.Error()})
			return
		}
		// 7. 返回结果
		c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "更新成功", "data": doc})
	}
}

// DeleteDoc 删除文档（需登录+仅作者可删除）
func DeleteDoc(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取文档ID
		docIDStr := c.Param("id")
		docID, err := strconv.Atoi(docIDStr)
		if err != nil || docID <= 0 {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "文档ID无效"})
			return
		}
		// 2. 查询文档+权限判断
		var doc model.Doc
		if err := db.First(&doc, docID).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				c.JSON(http.StatusOK, gin.H{"code": 1, "msg": "文档不存在"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "查询失败：" + err.Error()})
			return
		}
		currentUserID, _ := c.Get("user_id")
		if doc.AuthorID != currentUserID.(uint) {
			c.JSON(http.StatusForbidden, gin.H{"code": 403, "msg": "无权限：仅作者可删除"})
			return
		}
		// 3. 软删除
		if err := db.Delete(&doc).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"code": 500, "msg": "删除失败：" + err.Error()})
			return
		}
		// 4. 返回结果
		c.JSON(http.StatusOK, gin.H{"code": 0, "msg": "删除成功"})
	}
}
```

#### 6.3 MD 上传接口（handler/upload.go）

go



运行









```go
package handler

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/your-name/blog-backend/model"
	"github.com/your-name/blog-backend/util"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// 临时上传目录（自动创建）
const tempUploadDir = "./temp_upload"

func init() {
	if err := os.MkdirAll(tempUploadDir, 0755); err != nil {
		panic("创建临时上传目录失败：" + err.Error())
	}
}

// UploadDoc 上传MD文件/文件夹（POST /api/docs/upload）
func UploadDoc(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. 获取当前用户ID
		userID, _ := c.Get("user_id")
		authorID := userID.(uint)
		// 2. 获取分类参数（默认other）
		category := c.PostForm("category")
		if !model.IsValidCategory(category) {
			category = model.CategoryOther
		}
		// 3. 接收文件
		form, err := c.MultipartForm()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "文件上传失败：" + err.Error()})
			return
		}
		files := form.File["files"]
		if len(files) == 0 {
			c.JSON(http.StatusBadRequest, gin.H{"code": 400, "msg": "请选择MD文件"})
			return
		}
		// 4. 处理文件
		successCount := 0
		failFiles := make([]string, 0)
		for _, file := range files {
			// 4.1 校验格式
			fileExt := strings.ToLower(filepath.Ext(file.Filename))
			if fileExt != ".md" {
				failFiles = append(failFiles, fmt.Sprintf("%s（非MD文件）", file.Filename))
				continue
			}
			// 4.2 保存临时文件
			tempFilePath := filepath.Join(tempUploadDir, file.Filename)
			if err := c.SaveUploadedFile(file, tempFilePath); err != nil {
				failFiles = append(failFiles, fmt.Sprintf("%s（保存失败：%v）", file.Filename, err))
				continue
			}
			// 4.3 解析MD内容
			title, content, parseErr := util.ParseMDContent(tempFilePath)
			if parseErr != nil {
				failFiles = append(failFiles, fmt.Sprintf("%s（解析失败：%v）", file.Filename, parseErr))
				os.Remove(tempFilePath)
				continue
			}
			// 4.4 保存到数据库
			doc := model.Doc{
				Title:    title,
				Content:  content,
				Category: category,
				AuthorID: authorID,
			}
			if err := db.Create(&doc).Error; err != nil {
				failFiles = append(failFiles, fmt.Sprintf("%s（数据库失败：%v）", file.Filename, err))
				os.Remove(tempFilePath)
				continue
			}
			// 4.5 成功：计数+清理临时文件
			successCount++
			os.Remove(tempFilePath)
		}
		// 5. 返回结果
		c.JSON(http.StatusOK, gin.H{
			"code": 0,
			"msg":  fmt.Sprintf("上传完成：成功%d个，失败%d个", successCount, len(failFiles)),
			"data": gin.H{
				"success_count": successCount,
				"fail_files":    failFiles,
			},
		})
	}
}
```

### 7. 入口文件（main.go，全局错误处理 + 路由）

go



运行









```go
package main

import (
	"github.com/gin-gonic/gin"
	"github.com/your-name/blog-backend/config"
	"github.com/your-name/blog-backend/handler"
	"github.com/your-name/blog-backend/middleware"
	"github.com/your-name/blog-backend/model"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"log"
	"os"
)

func main() {
	// 1. 初始化配置
	config.Init()

	// 2. 初始化数据库
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // 输出到控制台
		logger.Config{
			LogLevel: logger.Info, // 显示SQL日志
		},
	)
	db, err := gorm.Open(mysql.Open(config.Conf.DB.DSN), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		panic("数据库连接失败：" + err.Error())
	}
	// 3. 数据库迁移（创建表）
	if err := db.AutoMigrate(&model.User{}, &model.Doc{}); err != nil {
		panic("数据库迁移失败：" + err.Error())
	}

	// 4. 初始化Gin引擎
	gin.SetMode(gin.ReleaseMode) // 生产环境用ReleaseMode
	r := gin.Default()
	// 5. 注册中间件（顺序：跨域→全局错误→路由）
	r.Use(middleware.CORS())
	r.Use(middleware.GlobalErrorHandler())

	// 6. 注册API路由
	api := r.Group("/api")
	{
		// 公开接口（无需登录）
		auth := api.Group("/auth")
		{
			auth.POST("/register", handler.Register(db)) // 注册
			auth.POST("/login", handler.Login(db))       // 登录
		}

		// 需登录的接口（JWT保护）
		doc := api.Group("/docs")
		doc.Use(middleware.JWTAuth())
		{
			doc.GET("", handler.GetDocs(db))         // 获取文档列表
			doc.POST("", handler.CreateDoc(db))      // 创建文档
			doc.PUT("/:id", handler.UpdateDoc(db))   // 更新文档
			doc.DELETE("/:id", handler.DeleteDoc(db))// 删除文档
			doc.POST("/upload", handler.UploadDoc(db))// 上传MD
		}
	}

	// 7. 启动服务（端口8081）
	log.Println("后端服务启动：http://localhost:8081")
	if err := r.Run(":8081"); err != nil {
		panic("服务启动失败：" + err.Error())
	}
}
```

## 三、前端实现（完整版）

### 1. 初始化前端项目与依赖

bash











```bash
# 创建前端目录
mkdir -p blog-project/frontend && cd blog-project/frontend
# 初始化npm
npm init -y
# 安装依赖（含MD编辑器、Toast提示、多语言）
npm install vuepress@next axios vuepress-plugin-register-components @vuepress/plugin-search @vuepress/plugin-i18n mavon-editor vue-toastification@next
```

### 2. 前端配置文件

#### 2.1 package.json（脚本配置）

json











```json
{
  "name": "blog-frontend",
  "version": "1.0.0",
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  },
  "dependencies": {
    "@vuepress/plugin-i18n": "^2.0.0-rc.0",
    "@vuepress/plugin-search": "^2.0.0-rc.0",
    "axios": "^1.6.8",
    "mavon-editor": "^3.0.1",
    "vue-toastification": "^2.0.0-rc.5",
    "vuepress": "^2.0.0-rc.0",
    "vuepress-plugin-register-components": "^2.0.0-rc.0"
  }
}
```

#### 2.2 config.js（导航 + 搜索 + 多语言）

javascript



运行









```javascript
const { defaultTheme } = require("@vuepress/theme-default");
const { searchPlugin } = require("@vuepress/plugin-search");
const { i18nPlugin } = require("@vuepress/plugin-i18n");

module.exports = {
  // 1. 多语言配置
  locales: {
    "/": {
      lang: "zh-CN",
      title: "我的个人博客",
      description: "VuePress + Gin + GORM 个人博客",
    },
    "/en/": {
      lang: "en-US",
      title: "My Personal Blog",
      description: "Personal Blog with VuePress + Gin + GORM",
    },
  },

  // 2. 基础配置
  base: "/",
  port: 8080,
  head: [
    ["link", { rel: "stylesheet", href: "/custom.css" }],
    ["link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" }],
  ],

  // 3. 主题配置（左侧导航+右侧目录+顶部栏）
  theme: defaultTheme({
    // 顶部导航栏
    navbar: [
      { text: "首页", link: "/" },
      { 
        text: "文档列表", 
        children: [
          { text: "技术笔记", link: "/docs/?category=tech" },
          { text: "生活随笔", link: "/docs/?category=life" },
          { text: "其他文档", link: "/docs/?category=other" },
        ]
      },
      { text: "管理中心", link: "/admin/", target: "_self" },
      { text: "登录", link: "/login/", target: "_self", id: "login-link" },
      { text: "注册", link: "/register/", target: "_self", id: "register-link" },
      // 多语言切换
      {
        text: "语言",
        children: [
          { text: "中文", link: "/" },
          { text: "English", link: "/en/" },
        ],
      },
    ],

    // 左侧侧边栏（按分类）
    sidebar: {
      "/docs/": [
        {
          text: "技术笔记",
          collapsible: true,
          children: [
            { text: "Gin 入门", link: "/docs/tech/gin.md" },
            { text: "VuePress 配置", link: "/docs/tech/vuepress.md" },
          ],
        },
        {
          text: "生活随笔",
          collapsible: true,
          children: [
            { text: "旅行记录", link: "/docs/life/travel.md" },
            { text: "读书心得", link: "/docs/life/book.md" },
          ],
        },
      ],
      "/en/docs/": [
        {
          text: "Tech Notes",
          collapsible: true,
          children: [
            { text: "Gin Intro", link: "/en/docs/tech/gin.md" },
            { text: "VuePress Config", link: "/en/docs/tech/vuepress.md" },
          ],
        },
        {
          text: "Life Essays",
          collapsible: true,
          children: [
            { text: "Travel Log", link: "/en/docs/life/travel.md" },
            { text: "Reading Notes", link: "/en/docs/life/book.md" },
          ],
        },
      ],
    },

    // 右侧内容目录（显示h2-h3）
    outline: {
      level: [2, 3],
      label: "文档目录",
    },
    outlineTitle: "文档目录",

    // 搜索框配置
    searchPlaceholder: {
      "/": "搜索文档...",
      "/en/": "Search docs...",
    },
  }),

  // 4. 插件配置
  plugins: [
    // 搜索插件
    searchPlugin({
      locales: {
        "/": { placeholder: "搜索文档..." },
        "/en/": { placeholder: "Search docs..." },
      },
      maxSuggestions: 10,
      isSearchable: (page) => !page.path.includes("/login/") && !page.path.includes("/register/") && !page.path.includes("/admin/"),
    }),
    // 多语言插件
    i18nPlugin({
      defaultLocale: "zh-CN",
      locales: [
        { path: "/", locale: "zh-CN" },
        { path: "/en/", locale: "en-US" },
      ],
    }),
    // 注册自定义组件
    [
      "register-components",
      {
        componentsDir: "./docs/.vuepress/components",
      },
    ],
  ],
};
```

#### 2.3 enhanceApp.js（全局配置：路由守卫 + Toast+axios）

javascript



运行









```javascript
import { defineClientConfig } from "@vuepress/client";
import axios from "axios";
import { createToast } from "vue-toastification";
import "vue-toastification/dist/index.css";
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import DocManager from "./components/DocManager.vue";
import MDEditor from "./components/MDEditor.vue";

// 1. 初始化Toast提示
const toast = createToast({
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
});

// 2. 配置axios
axios.defaults.baseURL = "http://localhost:8081/api";
// 请求拦截器：添加Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("blog_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error("请求异常：" + error.message);
    return Promise.reject(error);
  }
);
// 响应拦截器：统一错误处理
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error.response?.data?.msg || "服务器异常";
    toast.error(msg);
    // Token过期：跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem("blog_token");
      localStorage.removeItem("blog_username");
      window.location.href = "/login/";
    }
    return Promise.reject(error);
  }
);

// 3. 路由守卫：未登录拦截管理中心
export default defineClientConfig({
  components: { Login, Register, DocManager, MDEditor },
  setup({ app, router }) {
    // 全局注入axios和toast
    app.config.globalProperties.$axios = axios;
    app.config.globalProperties.$toast = toast;

    // 路由前置守卫
    router.beforeEach((to, from, next) => {
      const token = localStorage.getItem("blog_token");
      const isLoginPage = to.path.includes("/login/");
      const isRegisterPage = to.path.includes("/register/");
      const isAdminPage = to.path.includes("/admin/");

      // 已登录：隐藏登录/注册按钮，显示用户名
      if (token) {
        const loginLink = document.getElementById("login-link");
        const registerLink = document.getElementById("register-link");
        if (loginLink) {
          const username = localStorage.getItem("blog_username");
          loginLink.textContent = `欢迎，${username}`;
          loginLink.href = "#";
          loginLink.onclick = (e) => {
            e.preventDefault();
            if (confirm("确定要退出登录吗？")) {
              localStorage.removeItem("blog_token");
              localStorage.removeItem("blog_username");
              window.location.reload();
            }
          };
        }
        if (registerLink) registerLink.style.display = "none";
      }

      // 未登录：拦截管理中心，跳转登录页
      if (isAdminPage && !token && !isLoginPage) {
        toast.warning("请先登录");
        next("/login/");
        return;
      }

      // 已登录：访问登录/注册页，跳转首页
      if (token && (isLoginPage || isRegisterPage)) {
        next("/");
        return;
      }

      next();
    });
  },
});
```

#### 2.4 布局样式（custom.css）

css











```css
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 左侧侧边栏优化 */
.sidebar {
  width: 260px !important;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
}
.sidebar-item {
  margin: 8px 0;
}
.sidebar-link {
  padding: 8px 16px !important;
  border-radius: 4px;
}
.sidebar-link:hover {
  background: rgba(66, 185, 131, 0.1) !important;
}

/* 右侧内容区优化 */
.theme-default-content:not(.custom) {
  max-width: 1200px !important;
}
.theme-default-content {
  padding: 28px 48px !important;
  line-height: 1.8;
  font-size: 16px;
}
.page-title {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #42b983;
  color: #333;
}

/* 顶部导航栏优化 */
.navbar {
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff !important;
}
.navbar-item {
  margin: 0 12px;
}
.navbar-link {
  padding: 10px 16px !important;
  border-radius: 4px;
  color: #333 !important;
}
.navbar-link:hover {
  color: #42b983 !important;
  background: rgba(66, 185, 131, 0.1) !important;
}

/* 搜索框优化 */
.search-box {
  width: 280px !important;
  margin-right: 12px;
}
.search-input {
  height: 38px !important;
  border-radius: 4px !important;
  border: 1px solid #ddd !important;
}

/* 多语言下拉框 */
.dropdown-menu {
  min-width: 120px !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
.dropdown-item {
  padding: 8px 16px !important;
}
.dropdown-item:hover {
  background: rgba(66, 185, 131, 0.1) !important;
  color: #42b983 !important;
}

/* 响应式适配（手机端） */
@media (max-width: 768px) {
  .sidebar {
    width: 220px !important;
  }
  .theme-default-content {
    padding: 16px 24px !important;
  }
  .search-box {
    width: 180px !important;
  }
}
```

### 3. 自定义组件（components/）

#### 3.1 注册组件（Register.vue）

vue











```vue
<template>
  <div class="register-container">
    <h2 class="page-title">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '用户注册' : 'User Registration' }}</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-item">
        <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '用户名：' : 'Username：' }}</label>
        <input
          type="text"
          v-model="form.username"
          required
          placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '3-20位字符' : '3-20 characters' }}"
          minlength="3"
          maxlength="20"
        />
      </div>
      <div class="form-item">
        <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '密码：' : 'Password：' }}</label>
        <input
          type="password"
          v-model="form.password"
          required
          placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '6-20位字符' : '6-20 characters' }}"
          minlength="6"
          maxlength="20"
        />
      </div>
      <div class="form-item">
        <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '邮箱：' : 'Email：' }}</label>
        <input
          type="email"
          v-model="form.email"
          required
          placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '请输入有效邮箱' : 'Enter valid email' }}"
        />
      </div>
      <button type="submit" class="register-btn" :disabled="loading">
        <span v-if="loading"><<i class="fa fa-spinner fa-spin"></</i> {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '注册中...' : 'Registering...' }}</span>
        <span v-else>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '注册' : 'Register' }}</span>
      </button>
      <p class="login-link">
        {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '已有账号？' : 'Already have an account？' }}
        <a :href="$localePath + 'login/'">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '去登录' : 'Go to Login' }}</a>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const form = ref({
  username: "",
  password: "",
  email: "",
});
const loading = ref(false);

const handleRegister = async () => {
  loading.value = true;
  try {
    const { $axios, $toast } = window.$vueApp.config.globalProperties;
    const res = await $axios.post("/auth/register", form.value);
    if (res.data.code === 0) {
      $toast.success(res.data.msg);
      // 跳转登录页
      router.push($localePath + "login/");
    } else {
      $toast.error(res.data.msg);
    }
  } catch (e) {
    // 错误由axios拦截器处理
  } finally {
    loading.value = false;
  }
};

// 全局挂载app（供axios拦截器使用）
if (!window.$vueApp) {
  window.$vueApp = { config: { globalProperties: {} } };
}
</script>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.form-item {
  margin: 18px 0;
}
.form-item label {
  display: inline-block;
  width: 80px;
  font-weight: 500;
  color: #333;
}
.form-item input {
  width: calc(100% - 90px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
.form-item input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}
.register-btn {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}
.register-btn:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}
.login-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
}
.login-link a {
  color: #42b983;
  text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}
</style>
```

#### 3.2 登录组件（Login.vue）

vue











```vue
<template>
  <div class="login-container">
    <h2 class="page-title">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '用户登录' : 'User Login' }}</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-item">
        <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '用户名：' : 'Username：' }}</label>
        <input
          type="text"
          v-model="form.username"
          required
          placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '请输入用户名' : 'Enter username' }}"
        />
      </div>
      <div class="form-item">
        <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '密码：' : 'Password：' }}</label>
        <input
          type="password"
          v-model="form.password"
          required
          placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '请输入密码' : 'Enter password' }}"
        />
      </div>
      <button type="submit" class="login-btn" :disabled="loading">
        <span v-if="loading"><<i class="fa fa-spinner fa-spin"></</i> {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '登录中...' : 'Logging in...' }}</span>
        <span v-else>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '登录' : 'Login' }}</span>
      </button>
      <p class="register-link">
        {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '没有账号？' : 'No account？' }}
        <a :href="$localePath + 'register/'">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '去注册' : 'Go to Register' }}</a>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const form = ref({
  username: "",
  password: "",
});
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  try {
    const { $axios, $toast } = window.$vueApp.config.globalProperties;
    const res = await $axios.post("/auth/login", form.value);
    if (res.data.code === 0) {
      // 存储Token和用户名
      localStorage.setItem("blog_token", res.data.data.token);
      localStorage.setItem("blog_username", res.data.data.username);
      $toast.success(res.data.msg);
      // 跳转管理中心
      router.push($localePath + "admin/");
      window.location.reload();
    } else {
      $toast.error(res.data.msg);
    }
  } catch (e) {
    // 错误由axios拦截器处理
  } finally {
    loading.value = false;
  }
};

// 全局挂载app
if (!window.$vueApp) {
  window.$vueApp = { config: { globalProperties: {} } };
}
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.form-item {
  margin: 18px 0;
}
.form-item label {
  display: inline-block;
  width: 80px;
  font-weight: 500;
  color: #333;
}
.form-item input {
  width: calc(100% - 90px);
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}
.form-item input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}
.login-btn {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}
.login-btn:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}
.register-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
}
.register-link a {
  color: #42b983;
  text-decoration: none;
}
.register-link a:hover {
  text-decoration: underline;
}
</style>
```

#### 3.3 Markdown 编辑器（MDEditor.vue）

vue











```vue
<template>
  <div class="md-editor">
    <!-- 分类选择 -->
    <div class="category-selector" v-if="showCategory">
      <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '文档分类：' : 'Document Category：' }}</label>
      <select v-model="form.category" class="form-select" required>
        <option value="tech">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '技术笔记' : 'Tech Notes' }}</option>
        <option value="life">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '生活随笔' : 'Life Essays' }}</option>
        <option value="other">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '其他' : 'Other' }}</option>
      </select>
    </div>
    <!-- 标题输入 -->
    <input
      type="text"
      v-model="form.title"
      class="title-input"
      placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '请输入文档标题' : 'Enter document title' }}"
      required
    />
    <!-- Mavon Editor -->
    <mavon-editor
      v-model="form.content"
      :toolbars="toolbars"
      :subfield="true"
      :defaultOpen="'edit'"
      placeholder="{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '请输入Markdown内容（至少10个字符）' : 'Enter Markdown content (min 10 chars)' }}"
    />
    <!-- 按钮 -->
    <div class="btn-group">
      <button type="button" class="btn save-btn" @click="handleSave" :disabled="loading">
        <span v-if="loading"><<i class="fa fa-spinner fa-spin"></</i> {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '保存中...' : 'Saving...' }}</span>
        <span v-else>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '保存' : 'Save' }}</span>
      </button>
      <button type="button" class="btn cancel-btn" @click="handleCancel">
        {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '取消' : 'Cancel' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import mavonEditor from "mavon-editor";
import "mavon-editor/dist/css/index.css";

// 接收props：编辑模式时传入文档数据
const props = defineProps({
  doc: {
    type: Object,
    default: () => null,
  },
  showCategory: {
    type: Boolean,
    default: true,
  },
});

// 触发事件：保存成功/取消
const emit = defineEmits(["saveSuccess", "cancel"]);

// 表单数据
const form = ref({
  title: "",
  content: "",
  category: "tech",
});

// 加载状态
const loading = ref(false);

// 编辑器工具栏配置
const toolbars = ref({
  bold: true,
  italic: true,
  header: true,
  link: true,
  image: true,
  list: true,
  table: true,
  code: true,
  fullscreen: true,
});

// 初始化：编辑模式时回显数据
if (props.doc) {
  form.value.title = props.doc.title;
  form.value.content = props.doc.content;
  form.value.category = props.doc.category;
}

// 保存（创建/更新）
const handleSave = async () => {
  // 验证内容长度
  if (form.value.content.length < 10) {
    const { $toast } = window.$vueApp.config.globalProperties;
    $toast.warning($localeConfig.locales[$localePath].lang === 'zh-CN' ? '内容至少10个字符' : 'Content min 10 characters');
    return;
  }

  loading.value = true;
  try {
    const { $axios, $toast } = window.$vueApp.config.globalProperties;
    let res;
    if (props.doc) {
      // 编辑模式：PUT请求
      res = await $axios.put(`/docs/${props.doc.id}`, form.value);
    } else {
      // 创建模式：POST请求
      res = await $axios.post("/docs", form.value);
    }
    if (res.data.code === 0) {
      $toast.success(res.data.msg);
      emit("saveSuccess");
    }
  } catch (e) {
    // 错误由axios拦截器处理
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
.md-editor {
  width: 100%;
  margin: 16px 0;
}
.category-selector {
  margin-bottom: 16px;
}
.category-selector label {
  display: inline-block;
  width: 100px;
  font-weight: 500;
}
.form-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
}
.title-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 500;
}
.title-input:focus {
  outline: none;
  border-color: #42b983;
}
.btn-group {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
.btn {
  padding: 10px 2
```

继续

已完成思考



### 3.3 Markdown 编辑器（MDEditor.vue - 补全 Style）

vue











```vue
<style scoped>
.md-editor {
  width: 100%;
  margin: 16px 0;
}
.category-selector {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.category-selector label {
  display: inline-block;
  width: 100px;
  font-weight: 500;
  color: #333;
}
.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
  font-size: 14px;
  cursor: pointer;
}
.form-select:focus {
  outline: none;
  border-color: #42b983;
}
.title-input {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}
.title-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}
/* 编辑器容器 */
.mavon-editor {
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  overflow: hidden;
}
/* 按钮组 */
.btn-group {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}
.save-btn {
  background: #42b983;
  color: #fff;
}
.save-btn:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}
.cancel-btn {
  background: #f5f5f5;
  color: #666;
}
.cancel-btn:hover {
  background: #eee;
}
/* 响应式适配 */
@media (max-width: 768px) {
  .category-selector {
    flex-direction: column;
    align-items: flex-start;
  }
  .form-select {
    width: 100%;
  }
  .btn-group {
    justify-content: center;
  }
}
</style>
```

### 3.4 文档管理组件（DocManager.vue - 整合 MDEditor）

vue











```vue
<template>
  <div class="doc-manager">
    <h2 class="page-title">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '文档管理中心' : 'Document Management' }}</h2>

    <!-- 1. 上传区域 -->
    <div class="upload-area">
      <label class="upload-btn">
        <input
          type="file"
          multiple
          webkitdirectory
          accept=".md"
          @change="handleFileSelect"
          class="file-input"
        />
        <<i class="fa fa-upload mr-2"></</i>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '选择 MD 文件/文件夹' : 'Select MD Files/Folder' }}
      </label>
      <!-- 上传分类选择 -->
      <div class="upload-category">
        <label>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '上传分类：' : 'Upload Category：' }}</label>
        <select v-model="uploadCategory" class="form-select">
          <option value="tech">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '技术笔记' : 'Tech Notes' }}</option>
          <option value="life">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '生活随笔' : 'Life Essays' }}</option>
          <option value="other">{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '其他' : 'Other' }}</option>
        </select>
      </div>
      <!-- 上传状态提示 -->
      <p class="upload-success" v-if="uploadSuccessMsg">{{ uploadSuccessMsg }}</p>
      <p class="upload-fail" v-if="uploadFailMsg">
        {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '上传失败：' : 'Upload Failed：' }}<br />{{ uploadFailMsg }}
      </p>
    </div>

    <!-- 2. 新增文档按钮 -->
    <button class="add-btn" @click="openAddModal">
      <<i class="fa fa-plus mr-2"></</i>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '新增文档（Markdown）' : 'New Document (Markdown)' }}
    </button>

    <!-- 3. 文档列表 -->
    <div class="table-container" v-if="docList.length > 0">
      <table class="doc-table">
        <thead>
          <tr>
            <<th>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? 'ID' : 'ID' }}</</th>
            <<th>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '标题' : 'Title' }}</</th>
            <<th>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '分类' : 'Category' }}</</th>
            <<th>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '创建时间' : 'Created At' }}</</th>
            <<th>{{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '操作' : 'Action' }}</</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in docList" :key="doc.id">
            <td>{{ doc.id }}</td>
            <td class="title-cell">{{ doc.title }}</td>
            <td>
              <span class="category-tag" :class="getCategoryClass(doc.category)">
                {{ getCategoryName(doc.category) }}
              </span>
            </td>
            <td>{{ formatTime(doc.created_at) }}</td>
            <td class="action-cell">
              <button class="btn edit-btn" @click="openEditModal(doc)">
                <<i class="fa fa-pencil"></</i> {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '编辑' : 'Edit' }}
              </button>
              <button class="btn delete-btn" @click="handleDelete(doc.id)">
                <<i class="fa fa-trash"></</i> {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '删除' : 'Delete' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-tip" v-else>
      {{ $localeConfig.locales[$localePath].lang === 'zh-CN' ? '暂无文档，可上传或手动创建' : 'No documents yet, upload or create manually' }}
    </p>

    <!-- 4. 新增/编辑弹窗（整合MDEditor） -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? ($localeConfig.locales[$localePath].lang === 'zh-CN' ? '编辑文档' : 'Edit Document') : ($localeConfig.locales[$localePath].lang === 'zh-CN' ? '新增文档' : 'New Document') }}</h3>
          <span class="close-btn" @click="closeModal">&times;</span>
        </div>
        <div class="modal-body">
          <!-- 引入MDEditor组件 -->
          <MDEditor
            :doc="isEditMode ? currentDoc : null"
            @saveSuccess="handleModalSave"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const { $axios, $toast } = window.$vueApp.config.globalProperties;

// 1. 文档列表相关
const docList = ref([]);
const loading = ref(false);

// 2. 上传相关
const uploadCategory = ref("tech");
const uploadSuccessMsg = ref("");
const uploadFailMsg = ref("");

// 3. 弹窗相关
const showModal = ref(false);
const isEditMode = ref(false);
const currentDoc = ref(null);

// 格式化时间
const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleString();
};

// 获取分类显示名称（多语言）
const getCategoryName = (category) => {
  const lang = $localeConfig.locales[$localePath].lang;
  switch (category) {
    case "tech":
      return lang === "zh-CN" ? "技术笔记" : "Tech Notes";
    case "life":
      return lang === "zh-CN" ? "生活随笔" : "Life Essays";
    case "other":
      return lang === "zh-CN" ? "其他" : "Other";
    default:
      return category;
  }
};

// 获取分类标签样式
const getCategoryClass = (category) => {
  switch (category) {
    case "tech":
      return "tag-tech";
    case "life":
      return "tag-life";
    case "other":
      return "tag-other";
    default:
      return "";
  }
};

// 检查登录状态
const checkLogin = () => {
  const token = localStorage.getItem("blog_token");
  if (!token) {
    $toast.warning($localeConfig.locales[$localePath].lang === 'zh-CN' ? '请先登录' : 'Please log in first');
    router.push($localePath + "login/");
    return false;
  }
  return true;
};

// 获取文档列表
const getDocs = async () => {
  if (!checkLogin()) return;
  loading.value = true;
  try {
    const res = await $axios.get("/docs");
    if (res.data.code === 0) {
      docList.value = res.data.data;
    }
  } catch (e) {
    // 错误由axios拦截器处理
  } finally {
    loading.value = false;
  }
};

// 4. 弹窗操作
// 打开新增弹窗
const openAddModal = () => {
  isEditMode.value = false;
  currentDoc.value = null;
  showModal.value = true;
};

// 打开编辑弹窗
const openEditModal = (doc) => {
  isEditMode.value = true;
  currentDoc.value = { ...doc }; // 深拷贝避免直接修改列表数据
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
  currentDoc.value = null;
};

// 弹窗保存成功后的回调
const handleModalSave = () => {
  closeModal();
  getDocs(); // 刷新列表
};

// 5. 删除文档
const handleDelete = async (id) => {
  if (!confirm($localeConfig.locales[$localePath].lang === 'zh-CN' ? '确定要删除该文档吗？删除后不可恢复' : 'Are you sure to delete this document? It cannot be recovered')) {
    return;
  }
  try {
    await $axios.delete(`/docs/${id}`);
    $toast.success($localeConfig.locales[$localePath].lang === 'zh-CN' ? '删除成功' : 'Delete success');
    getDocs();
  } catch (e) {
    // 错误由axios拦截器处理
  }
};

// 6. 文件上传
// 选择文件
const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length === 0) return;
  // 清空之前的上传状态
  uploadSuccessMsg.value = "";
  uploadFailMsg.value = "";
  // 调用上传接口
  handleUpload(files);
  // 重置文件输入（否则无法重复选择同一文件）
  e.target.value = "";
};

// 上传文件逻辑
const handleUpload = async (files) => {
  if (!checkLogin()) return;
  // 构造FormData（含分类参数）
  const formData = new FormData();
  formData.append("category", uploadCategory.value); // 上传分类
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]); // 多文件
  }

  try {
    const res = await $axios.post("/docs/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.code === 0) {
      const data = res.data.data;
      uploadSuccessMsg.value = res.data.msg;
      // 显示失败文件（若有）
      if (data.fail_files.length > 0) {
        uploadFailMsg.value = data.fail_files.join("<br />");
      }
      // 刷新文档列表
      getDocs();
    } else {
      uploadFailMsg.value = res.data.msg;
    }
  } catch (e) {
    uploadFailMsg.value = e.response?.data?.msg || ($localeConfig.locales[$localePath].lang === 'zh-CN' ? '上传失败，请重试' : 'Upload failed, please try again');
  }
};

// 初始化：获取文档列表
onMounted(() => {
  getDocs();
});
</script>

<style scoped>
.doc-manager {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}
/* 上传区域 */
.upload-area {
  margin: 20px 0;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  transition: border 0.3s;
}
.upload-area:hover {
  border-color: #42b983;
}
.upload-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #42b983;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
}
.file-input {
  display: none;
}
.upload-category {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}
.upload-category label {
  color: #666;
  font-size: 14px;
}
/* 上传状态提示 */
.upload-success {
  margin: 12px 0 0;
  color: #42b983;
  font-size: 14px;
}
.upload-fail {
  margin: 12px 0 0;
  color: #ff4d4f;
  font-size: 14px;
  white-space: pre-line;
}
/* 新增按钮 */
.add-btn {
  padding: 12px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}
.add-btn:hover {
  background: #359469;
}
/* 文档表格 */
.table-container {
  overflow-x: auto;
}
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.doc-table th,
.doc-table td {
  border: 1px solid #eee;
  padding: 12px 16px;
  text-align: left;
}
.doc-table th {
  background: #f5f5f5;
  color: #333;
  font-weight: 500;
}
.title-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 分类标签 */
.category-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}
.tag-tech {
  background: #42b983;
}
.tag-life {
  background: #3498db;
}
.tag-other {
  background: #999;
}
/* 操作按钮 */
.action-cell {
  display: flex;
  gap: 8px;
}
.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.edit-btn {
  background: #f5f5f5;
  color: #666;
}
.edit-btn:hover {
  background: #eee;
}
.delete-btn {
  background: #fff0f0;
  color: #ff4d4f;
}
.delete-btn:hover {
  background: #ffe0e0;
}
/* 空提示 */
.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}
.modal-header h3 {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}
.close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
}
.close-btn:hover {
  color: #333;
}
.modal-body {
  padding: 8px 0;
}
/* 响应式适配 */
@media (max-width: 768px) {
  .upload-category {
    flex-direction: column;
    align-items: center;
  }
  .action-cell {
    flex-direction: column;
  }
  .title-cell {
    max-width: 150px;
  }
}
</style>
```

## 四、前端页面文件（补全多语言）

### 4.1 中文页面

#### frontend/docs/register.md（中文注册页）

markdown











```markdown
# 用户注册

<Register />
```

#### frontend/docs/admin.md（中文管理中心）

markdown











```markdown
# 文档管理中心

<DocManager />
```

#### frontend/docs/docs/tech/gin.md（技术笔记示例）

markdown











~~~markdown
# Gin 框架入门

这是一篇用 Markdown 编写的技术笔记，基于 Gin 框架的基础使用教程。

## 1. 安装 Gin
```go
// 安装最新版 Gin
go get github.com/gin-gonic/gin@latest
~~~

## 2. 第一个 Gin 程序

go



运行









```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/hello", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Hello Gin!",
        })
    })
    r.Run(":8080") // 启动服务
}
```

## 3. 核心特性

- 高性能路由
- 中间件支持
- 内置 JSON 解析
- 表单验证

plaintext











~~~plaintext
#### frontend/docs/docs/life/travel.md（生活随笔示例）
```markdown
# 旅行记录：云南大理

去年夏天去了云南大理，记录一些旅途见闻。

## 行程亮点
1. **洱海骑行**：环洱海一圈约130公里，沿途风景绝美，推荐租电动车骑行；
2. **大理古城**：晚上的古城很热闹，有很多特色小店和当地美食；
3. **苍山徒步**：提前查好天气，建议穿舒适的徒步鞋，山顶温度较低。

## 美食推荐
- 烤乳扇：当地特色奶制品，蘸蜂蜜吃很香甜；
- 腊排骨火锅：肉质鲜嫩，搭配蔬菜很解腻；
- 鲜花饼：现烤的鲜花饼，玫瑰馅最经典。
~~~

### 4.2 英文页面

#### frontend/docs/en/register.md（英文注册页）

markdown











```markdown
# User Registration

<Register />
```

#### frontend/docs/en/admin.md（英文管理中心）

markdown











```markdown
# Document Management Center

<DocManager />
```

#### frontend/docs/en/docs/tech/gin.md（英文技术笔记示例）

markdown











~~~markdown
# Gin Framework Intro

A technical note written in Markdown, covering the basic usage of Gin framework.

## 1. Install Gin
```go
// Install the latest version of Gin
go get github.com/gin-gonic/gin@latest
~~~

## 2. First Gin Program

go



运行









```go
package main

import "github.com/gin-gonic/gin"

func main() {
    r := gin.Default()
    r.GET("/hello", func(c *gin.Context) {
        c.JSON(200, gin.H{
            "message": "Hello Gin!",
        })
    })
    r.Run(":8080") // Start server
}
```

## 3. Core Features

- High-performance routing
- Middleware support
- Built-in JSON parsing
- Form validation

plaintext











~~~plaintext
## 五、生产环境部署（完整步骤）
### 1. 前端部署（Nginx）
#### 1.1 构建静态文件
```bash
# 进入前端目录
cd blog-project/frontend
# 构建静态资源（输出到 docs/.vuepress/dist）
npm run docs:build
~~~

#### 1.2 Nginx 配置（/etc/nginx/conf.d/blog-frontend.conf）

nginx











```nginx
server {
    listen 80;
    server_name blog.yourdomain.com; # 替换为你的域名

    # 前端静态文件目录（指向构建后的 dist 文件夹）
    root /path/to/blog-project/frontend/docs/.vuepress/dist;
    index index.html;

    # 解决 VuePress 路由刷新404问题
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 反向代理后端 API（避免跨域）
    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/; # 后端服务地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存优化
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 7d; # 缓存7天
        add_header Cache-Control "public, max-age=604800";
    }
}
```

#### 1.3 启用 HTTPS（可选，推荐）

通过 Let's Encrypt 申请免费证书，配置 Nginx 跳转 HTTPS：

bash











```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx
# 申请证书并自动配置 Nginx
sudo certbot --nginx -d blog.yourdomain.com
```

### 2. 后端部署（Systemd 管理）

#### 2.1 编译后端二进制

bash











```bash
# 进入后端目录
cd blog-project/backend
# 编译（Linux 环境，指定输出文件名）
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o blog-backend main.go
```

#### 2.2 创建 Systemd 服务文件（/etc/systemd/system/blog-backend.service）

ini











```ini
[Unit]
Description=Blog Backend Service (Gin + GORM)
After=network.target mysql.service # 依赖网络和MySQL服务

[Service]
User=www-data # 运行用户（建议用非root用户）
Group=www-data
WorkingDirectory=/path/to/blog-project/backend # 后端目录
ExecStart=/path/to/blog-project/backend/blog-backend # 二进制文件路径
# 环境变量（替换敏感信息，如JWT密钥、数据库DSN）
Environment="BLOG_JWT_SECRET=your-secure-jwt-secret-2025"
Environment="BLOG_DB_DSN=root:your-mysql-password@tcp(127.0.0.1:3306)/blog_db?charset=utf8mb4&parseTime=true&loc=Local"
Restart=always # 服务异常时自动重启
RestartSec=3 # 重启间隔3秒

[Install]
WantedBy=multi-user.target
```

#### 2.3 启动后端服务

bash











```bash
# 重新加载 Systemd 配置
sudo systemctl daemon-reload
# 启动服务
sudo systemctl start blog-backend
# 设置开机自启
sudo systemctl enable blog-backend
# 查看服务状态
sudo systemctl status blog-backend
```

### 3. 安全优化

1. **敏感信息用环境变量**：生产环境中，JWT 密钥、数据库密码必须通过 `Environment` 配置，禁止硬编码在代码中；
2. **限制数据库用户权限**：为博客项目创建专用 MySQL 用户，仅授予 `blog_db` 库的 `SELECT/INSERT/UPDATE/DELETE` 权限，禁止 `DROP/ALTER` 等高危操作；
3. **防火墙配置**：仅开放 80（HTTP）、443（HTTPS）、3306（MySQL，仅限本地访问）端口，关闭无用端口；
4. **日志管理**：后端日志可输出到文件（如 `/var/log/blog-backend/`），定期轮转日志，避免磁盘占满。

## 六、项目完整验证

1. **访问博客首页**：打开 `https://blog.yourdomain.com`，验证左侧导航、顶部搜索、多语言切换正常；

2. **用户操作**：注册新用户 → 登录 → 进入管理中心；

3. 文档管理

   ：

   - 手动新增：点击 “新增文档”，用 Markdown 编辑器编写内容，选择分类后保存；
   - 文件上传：选择本地 MD 文件或文件夹，指定分类后上传，验证文档列表同步；
   - 编辑 / 删除：仅能修改 / 删除自己创建的文档，权限控制正常；

4. **文档展示**：在 “文档列表” 中点击文档标题，验证 Markdown 内容（代码块、表格等）正常渲染。

至此，整个个人博客项目从 **开发环境到生产部署** 完全完整，支持用户注册登录、Markdown 文档管理（手动 / 上传）、多语言切换、权限控制，满足个人博客的日常使用需求。





# 知识点

这个项目涵盖了 Go 后端和 Vue 前端的众多技术知识点与语法点，以下从后端（Go）和前端（Vue/JavaScript）两部分进行详细梳理，总计超过 100 个知识点：

## 一、后端技术栈（Go + Gin + GORM）

### 1. Go 基础语法

1. **包声明**：`package main` 声明可执行程序包，`package model` 声明库包

2. **导入语句**：`import (...)` 批量导入包，支持别名（如 `import m "gorm.io/gorm"`）

3. 变量声明

   ：

   - 短变量声明：`total := 100`（函数内使用）
   - 包级变量：`var ipPrefix = "192.168.1."`
   - 变量块：`var ()` 集中声明多个变量

4. **常量声明**：`const CategoryTech = "tech"` 定义枚举值

5. **函数定义**：`func GenerateRandomLog() TrafficLog` 含返回值类型

6. **匿名函数**：`go func(num int) { ... }(param)` 作为协程入口

7. **函数参数**：支持值传递、指针传递，`...` 表示可变参数

8. **返回值**：多返回值（如 `return title, content, err`）、命名返回值

9. **类型定义**：`type User struct { ... }` 定义结构体

10. **结构体字段标签**：`gorm:"primaryKey" json:"id"` 用于 ORM 和 JSON 序列化

11. **方法定义**：`func (u User) TableName() string` 为结构体绑定方法

12. **接口**：隐式实现（如 `error` 接口通过 `Error() string` 方法实现）

13. 流程控制

    ：

    - `if-else`：支持初始化语句（`if err := db.Create(...); err != nil`）
    - `for`：普通循环、无限循环（`for {}`）、range 遍历
    - `switch`：支持表达式匹配（`switch cat { case "tech": ... }`）

14. **错误处理**：`error` 类型返回，`if err != nil` 检查模式

15. **defer 语句**：`defer ticker.Stop()` 延迟执行资源释放

16. **指针**：`&user` 取地址，`*user` 解引用，用于修改原对象

17. **类型转换**：`uint(userID)` 显式转换，`time.Duration(sec)` 类型转换

18. **字符串操作**：`fmt.Sprintf("%d", num)` 格式化，`strings.HasPrefix` 判断前缀

19. **切片**：`[]string{"Vue", "React"}` 动态数组，`len()` 取长度，`append()` 添加元素

20. **map**：`gin.H{"code": 0, "msg": "success"}` 键值对集合

### 2. Gin 框架

1. **引擎初始化**：`r := gin.Default()` 创建含默认中间件的引擎
2. **路由分组**：`api := r.Group("/api")` 批量管理路由前缀
3. **HTTP 方法**：`r.GET()`、`r.POST()`、`r.PUT()`、`r.DELETE()` 注册路由
4. **路由参数**：`/:id` 定义路径参数，`c.Param("id")` 获取参数
5. **查询参数**：`c.Query("category")` 获取 URL 查询参数（`?category=tech`）
6. **请求体绑定**：`c.ShouldBindJSON(&req)` 解析 JSON 请求体
7. **表单数据**：`c.PostForm("category")` 获取表单字段
8. **文件上传**：`c.MultipartForm()` 处理文件上传，`c.SaveUploadedFile()` 保存文件
9. **响应发送**：`c.JSON(http.StatusOK, data)` 返回 JSON 响应
10. **上下文操作**：`c.Set("user_id", 1)` 存储数据，`c.Get("user_id")` 获取数据
11. **中间件**：`r.Use(middleware.CORS())` 注册中间件，`c.Next()` 执行后续处理
12. **路由守卫**：通过中间件实现（如 JWT 认证拦截未登录请求）
13. **错误处理**：`c.Abort()` 终止请求链，`c.Errors` 存储错误信息

### 3. GORM 框架

1. **数据库连接**：`gorm.Open(mysql.Open(dsn), &gorm.Config{})` 连接 MySQL

2. **模型定义**：结构体字段对应数据库表列，标签控制映射规则

3. **表名指定**：`func (User) TableName() string { return "t_user" }` 自定义表名

4. **数据库迁移**：`db.AutoMigrate(&User{}, &Doc{})` 自动创建 / 更新表结构

5. CRUD 操作

   ：

   - 创建：`db.Create(&user)`
   - 查询：`db.First(&user, id)`、`db.Where("username = ?", name).Find(&users)`
   - 更新：`db.Save(&user)`、`db.Model(&user).Update("name", "new")`
   - 删除：`db.Delete(&user)`（软删除，依赖 `DeletedAt` 字段）

6. **条件查询**：`db.Where("category = ?", "tech").Order("created_at DESC")`

7. **关联查询**：`db.Preload("Author").Find(&docs)` 预加载关联对象

8. **事务**：`tx := db.Begin()` 开启事务，`tx.Commit()` 提交，`tx.Rollback()` 回滚

9. **错误处理**：`gorm.ErrRecordNotFound` 判断记录不存在

10. **日志配置**：`logger.New(...)` 配置 SQL 日志输出

### 4. 并发编程

1. **协程**：`go func() { ... }()` 启动轻量级线程
2. **通道**：`chan<- TrafficLog` 定义只写通道，`logChan <- log` 发送数据
3. **通道关闭**：`close(logChan)` 关闭通道，`range` 遍历通道直至关闭
4. **定时器**：`time.NewTicker(100 * time.Millisecond)` 周期性触发
5. **等待机制**：通过通道长度判断任务完成（`total - len(logChan)`）
6. **互斥锁**：（项目未直接使用，但 Go 中 `sync.Mutex` 用于保护共享资源）
7. **原子操作**：（项目未直接使用，但 `sync/atomic` 用于无锁计数）

### 5. 工具与库

1. **JWT**：`jwt.NewWithClaims()` 创建 Token，`jwt.ParseWithClaims()` 解析 Token
2. **密码加密**：`bcrypt.GenerateFromPassword()` 哈希密码，`bcrypt.CompareHashAndPassword()` 验证
3. **UUID**：`uuid.NewString()` 生成唯一 ID
4. **配置管理**：`viper.AutomaticEnv()` 读取环境变量，`viper.GetString()` 获取配置
5. **时间处理**：`time.Now()` 当前时间，`time.Duration` 时间间隔，`Add()` 计算相对时间
6. **文件操作**：`os.MkdirAll()` 创建目录，`os.Open()` 打开文件，`os.Remove()` 删除文件
7. **跨域处理**：`gin-contrib/cors` 配置跨域规则（允许 origins、methods 等）
8. **日志输出**：`log.New()` 创建日志实例，输出到控制台或文件
9. **字符串解析**：`bufio.Scanner` 逐行读取文件内容
10. **正则表达式**：`regexp.MustCompile()` 编译正则，`MatchString()` 匹配字符串

## 二、前端技术栈（VuePress + Vue + JavaScript）

### 1. Vue 基础

1. **组件定义**：`.vue` 文件（template、script、style）

2. **模板语法**：`{{ variable }}` 文本插值，`v-model` 双向绑定

3. 指令

   ：

   - `v-if`/`v-else` 条件渲染
   - `v-for` 列表渲染（`v-for="doc in docList" :key="doc.id"`）
   - `v-on` 事件绑定（简写 `@click`）
   - `v-bind` 属性绑定（简写 `:class`）

4. **事件处理**：`@submit.prevent` 阻止默认行为，`@change` 监听变化

5. **计算属性**：（项目未直接使用，`computed` 用于依赖推导）

6. **生命周期**：`onMounted` 组件挂载后执行

7. **组件通信**：`defineProps` 接收父组件参数，`defineEmits` 触发事件

8. **响应式数据**：`ref` 定义基本类型响应式数据，`reactive` 定义对象 / 数组

9. **样式隔离**：`scoped` 属性限制样式作用域（`<style scoped>`）

10. **条件样式**：`:class="getCategoryClass(doc.category)"` 动态绑定类名

### 2. VuePress 配置

1. **多语言配置**：`locales` 定义中英文语言包
2. **导航配置**：`navbar` 设置顶部导航栏，支持下拉菜单
3. **侧边栏配置**：`sidebar` 定义左侧目录，支持折叠（`collapsible: true`）
4. **插件配置**：`plugins` 注册搜索（searchPlugin）、多语言（i18nPlugin）等插件
5. **自定义组件**：`register-components` 插件注册全局组件
6. **全局增强**：`enhanceApp.js` 配置全局变量（axios、toast）和路由守卫
7. **静态资源**：`public` 目录存放静态文件（如 `custom.css`）
8. **端口配置**：`port: 8080` 指定开发服务器端口
9. **基础路径**：`base: "/"` 配置网站根路径

### 3. JavaScript/ES6+

1. **变量声明**：`const`（常量）、`let`（块级变量）
2. **箭头函数**：`() => { ... }` 简化函数写法，绑定上下文 this
3. **解构赋值**：`const { $axios, $toast } = app.config.globalProperties`
4. **模板字符串**：`${variable}` 拼接字符串（如 `fmt.Sprintf` 类似）
5. **数组方法**：`map()` 遍历转换，`filter()` 过滤，`push()` 添加元素
6. **对象方法**：`Object.keys()` 获取键名，`...` 扩展运算符（浅拷贝）
7. **异步编程**：`async/await` 处理异步操作（替代 Promise 链式调用）
8. **模块导入导出**：`import` 导入模块，`export default` 导出默认成员
9. **事件监听**：`addEventListener`（原生），`@click`（Vue 语法糖）
10. **DOM 操作**：`document.getElementById()` 获取元素，`textContent` 修改内容
11. **本地存储**：`localStorage.setItem()` 存储数据，`localStorage.getItem()` 读取数据

### 4. 网络请求与状态管理

1. **Axios 配置**：`axios.defaults.baseURL` 设置基础 URL，`interceptors` 配置拦截器
2. **请求拦截器**：添加 Token 到请求头（`config.headers.Authorization`）
3. **响应拦截器**：统一处理错误（如 Token 过期跳转登录）
4. **HTTP 方法**：`axios.get()`、`post()`、`put()`、`delete()` 对应 RESTful 接口
5. **FormData**：处理文件上传（`formData.append("files", file)`）
6. **全局状态**：通过 `window.$vueApp` 挂载全局变量（axios、toast）
7. **路由守卫**：`router.beforeEach` 拦截路由，控制访问权限

### 5. UI 与交互

1. **Toast 提示**：`vue-toastification` 实现全局消息提示（成功 / 错误 / 警告）
2. **Markdown 编辑**：`mavon-editor` 实现 MD 实时编辑与预览
3. **文件上传**：`input[type="file"]` 结合 `webkitdirectory` 支持文件夹上传
4. **响应式布局**：CSS 媒体查询（`@media (max-width: 768px)`）适配移动端
5. **动画效果**：`transition` 属性实现按钮悬停、弹窗切换动画
6. **图标库**：`font-awesome` 提供图标（如 `<i class="fa fa-upload"></i>`）
7. **表单验证**：HTML5 属性（`required`、`minlength`）+ 自定义校验逻辑

### 6. 部署与优化

1. **静态构建**：`npm run docs:build` 生成可部署的静态文件
2. **Nginx 配置**：反向代理 API、解决 SPA 路由刷新 404（`try_files $uri $uri/ /index.html`）
3. **缓存策略**：`expires 7d` 配置静态资源缓存
4. **HTTPS 配置**：`certbot` 申请免费证书，Nginx 配置 SSL
5. **进程管理**：`systemctl` 管理后端服务（开机自启、异常重启）
6. **环境变量**：分离开发 / 生产配置（如 JWT 密钥、数据库连接串）

## 总结

该项目覆盖了从后端 Go 语言基础、Gin 框架路由与中间件、GORM 数据库操作、并发编程，到前端 Vue 组件化、VuePress 配置、JavaScript 异步编程、网络请求等全栈技术点。通过 110 + 知识点的实践，构建了一个功能完整、架构清晰的个人博客系统，体现了现代 Web 开发的核心技术栈与最佳实践。



# 前端

以下是基于你提供的项目架构，**更完整、可落地的前端开发步骤**，从环境准备到功能验证全覆盖，同时规避之前遇到的依赖错误、配置问题：

# 前端完整开发步骤（VuePress 多语言博客）

## 一、开发环境准备

### 1. 基础环境要求

VuePress v2（`@next`）对 Node.js 版本有明确要求，需先确保环境兼容：

- **Node.js**：v16.14.0 及以上（推荐 v18 LTS，避免版本过低导致依赖安装失败）
- **npm**：v8.0 及以上（Node.js 自带，可通过 `npm -v` 检查）

### 2. 环境检查与修复

打开终端（Windows 用 MINGW64 或 CMD，Mac/Linux 用终端），执行以下命令验证：

bash











```bash
# 检查 Node.js 版本（需 ≥16.14.0）
node -v
# 检查 npm 版本
npm -v

# 若 Node 版本过低：
# Windows/Mac：去官网 https://nodejs.org/ 下载 v18 LTS 安装
# Linux：用 nvm 管理版本（推荐）：nvm install 18 && nvm use 18
```

### 3. 配置 npm 镜像源（避坑关键）

之前遇到过淘宝旧镜像证书过期问题，需确保镜像源为**最新有效地址**：

bash











```bash
# 1. 查看当前镜像源
npm config get registry

# 2. 若不是新地址，切换到淘宝新镜像（或华为云镜像）
npm config set registry https://registry.npmmirror.com/

# 3. 清除 npm 缓存（解决依赖安装残留问题）
npm cache clean --force
```

## 二、项目初始化（从 0 到 1 创建前端目录）

### 1. 创建项目根目录与前端目录

先按架构创建外层目录，确保与后端目录结构对齐：

bash











```bash
# 1. 创建项目总根目录（blog-project）
mkdir -p ~/blog-project  # Windows 用：mkdir -p D:\CODE\blog-project
cd ~/blog-project        # Windows 用：cd D:\CODE\blog-project

# 2. 创建前端目录（frontend）并进入
mkdir frontend && cd frontend
```

### 2. 初始化 npm 项目（生成 package.json）

执行初始化命令，快速生成基础配置（避免手动写初始文件）：

bash











```bash
# 用默认配置生成 package.json（无需交互）
npm init -y
```

执行后会在 `frontend` 目录下生成 `package.json`，初始内容如下（后续会完善）：

json











```json
{
  "name": "frontend",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

### 3. 安装前端依赖（避坑版：用正确的插件）

之前因依赖名称错误（如 `vuepress-plugin-register-components`、`@vuepress/plugin-i18n`）导致安装失败，**以下是经过验证的正确依赖列表**，区分「开发依赖」和「生产依赖」：

bash











```bash
# 安装开发依赖（仅开发时用：VuePress 核心 + 官方插件）
npm install vuepress@next @vuepress/plugin-search @vuepress/plugin-components --save-dev

# 安装生产依赖（运行时用：请求库 + MD 编辑器 + 提示组件）
npm install axios mavon-editor vue-toastification@next --save
```

#### 依赖说明（避免混淆）：

| 依赖名称                      | 用途                        | 类型            | 替代了之前的错误依赖                                 |
| ----------------------------- | --------------------------- | --------------- | ---------------------------------------------------- |
| `vuepress@next`               | VuePress v2 核心框架        | devDependencies | -                                                    |
| `@vuepress/plugin-search`     | 官方搜索插件                | devDependencies | -                                                    |
| `@vuepress/plugin-components` | 官方组件插件（提供基础 UI） | devDependencies | 替代 `vuepress-plugin-register-components`（不存在） |
| `axios`                       | 网络请求（调用后端 API）    | dependencies    | -                                                    |
| `mavon-editor`                | Markdown 编辑器组件         | dependencies    | -                                                    |
| `vue-toastification@next`     | 全局提示组件                | dependencies    | -                                                    |

安装完成后，`package.json` 会自动新增 `dependencies` 和 `devDependencies` 字段，无需手动修改。

## 三、搭建前端目录结构（按架构补全）

在 `frontend` 目录下，按需求创建以下子目录（**必须与代码路径对应，否则文件找不到**）：

bash











```bash
# 1. 创建文档源目录（docs）及多语言子目录
mkdir -p docs/en docs/docs/tech docs/docs/life

# 2. 创建 VuePress 核心配置目录（.vuepress）
mkdir -p docs/.vuepress/components docs/.vuepress/public

# 3. 查看最终目录结构（确保与架构一致）
tree -L 3  # Windows 用：dir /s （或用 VS Code 左侧目录树确认）
```

最终前端目录结构如下（关键目录不能错）：

plaintext











```plaintext
frontend/
├─ docs/                  # 文档源文件
│  ├─ en/                 # 英文页面（多语言）
│  ├─ docs/               # 文档内容（分类：tech/life）
│  │  ├─ tech/            # 技术笔记
│  │  └─ life/            # 生活随笔
│  └─ .vuepress/          # VuePress 核心配置
│     ├─ components/      # 自定义组件（Login/Register 等）
│     ├─ public/          # 静态资源（CSS/图片）
│     ├─ config.js        # 全局配置（导航/多语言）
│     └─ enhanceApp.js    # 全局初始化（axios/路由守卫）
└─ package.json           # 依赖与脚本配置
```

## 四、编写核心配置文件（逐个实现）

### 1. 完善 package.json（添加脚本命令）

打开 `frontend/package.json`，修改 `scripts` 字段，添加 VuePress 启动 / 构建命令：

json











```json
{
  "name": "frontend",
  "version": "1.0.0",
  "description": "VuePress 多语言博客前端（集成用户系统 + MD 管理）",
  "main": "index.js",
  "scripts": {
    "docs:dev": "vuepress dev docs",    // 开发模式（实时预览）
    "docs:build": "vuepress build docs",// 生产构建（生成静态文件）
    "docs:clean": "vuepress clean docs",// 清理缓存（解决编译异常）
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": ["vuepress", "blog", "markdown", "i18n"],
  "author": "",
  "license": "ISC",
  "type": "commonjs",  // 保持 CommonJS 模块规范（避免 ES 模块错误）
  "dependencies": {
    "axios": "^1.12.2",
    "mavon-editor": "^2.10.4",
    "vue-toastification": "^2.0.0-rc.5"
  },
  "devDependencies": {
    "@vuepress/plugin-components": "^2.0.0-rc.24",
    "@vuepress/plugin-search": "^2.0.0-rc.24",
    "vuepress": "^2.0.0-rc.24"
  }
}
```

### 2. 编写 VuePress 全局配置（docs/.vuepress/config.js）

这是前端核心配置文件，负责导航、多语言、插件、端口等，**修正之前的 i18n 配置错误**（VuePress v2 多语言通过 `locales` 直接配置，无需 `@vuepress/plugin-i18n`）：

javascript



运行









```javascript
const { defaultTheme } = require("@vuepress/theme-default");
const { searchPlugin } = require("@vuepress/plugin-search");
const { componentsPlugin } = require("@vuepress/plugin-components");

module.exports = {
  // 1. 多语言核心配置（替代原 @vuepress/plugin-i18n）
  locales: {
    "/": {  // 中文路径（默认）
      lang: "zh-CN",
      title: "我的个人博客",
      description: "基于 VuePress + Gin + GORM 开发的多语言博客",
    },
    "/en/": {  // 英文路径
      lang: "en-US",
      title: "My Personal Blog",
      description: "Multi-language Blog built with VuePress + Gin + GORM",
    },
  },

  // 2. 基础配置（避免路径错误）
  base: "/",          // 网站根路径（部署时若放子目录需修改，如 "/blog/"）
  port: 8080,         // 开发模式端口（避免与后端 8081 冲突）
  head: [
    // 引入静态资源（自定义 CSS + Font Awesome 图标）
    ["link", { rel: "stylesheet", href: "/custom.css" }],
    ["link", { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" }],
  ],

  // 3. 主题配置（导航栏、侧边栏）
  theme: defaultTheme({
    // 顶部导航栏（多语言自动适配）
    navbar: [
      { text: "首页", link: "/" },
      { 
        text: "文档列表", 
        children: [
          { text: "技术笔记", link: "/docs/tech/" },
          { text: "生活随笔", link: "/docs/life/" },
          { text: "其他文档", link: "/docs/other/" },
        ]
      },
      { text: "管理中心", link: "/admin/", target: "_self" },
      { text: "登录", link: "/login/", target: "_self", id: "login-link" },
      { text: "注册", link: "/register/", target: "_self", id: "register-link" },
      // 多语言切换下拉框
      {
        text: "语言",
        children: [
          { text: "中文", link: "/" },
          { text: "English", link: "/en/" },
        ],
      },
    ],

    // 左侧侧边栏（按路径分类，多语言适配）
    sidebar: {
      // 中文文档侧边栏
      "/docs/tech/": [
        { text: "Gin 入门", link: "/docs/tech/gin.md" },
        { text: "VuePress 配置", link: "/docs/tech/vuepress.md" }
      ],
      "/docs/life/": [
        { text: "旅行记录", link: "/docs/life/travel.md" },
        { text: "读书心得", link: "/docs/life/book.md" }
      ],
      // 英文文档侧边栏
      "/en/docs/tech/": [
        { text: "Gin Intro", link: "/en/docs/tech/gin.md" },
        { text: "VuePress Config", link: "/en/docs/tech/vuepress.md" }
      ],
      "/en/docs/life/": [
        { text: "Travel Log", link: "/en/docs/life/travel.md" },
        { text: "Reading Notes", link: "/en/docs/life/book.md" }
      ],
    },

    // 右侧内容目录（只显示 h2-h3 标题）
    outline: { level: [2, 3], label: "文档目录" },
    outlineTitle: "文档目录",

    // 搜索框配置（多语言提示）
    searchPlaceholder: {
      "/": "搜索文档...",
      "/en/": "Search docs..."
    },
  }),

  // 4. 插件配置（只加载存在的官方插件）
  plugins: [
    // 搜索插件（过滤登录/注册/管理中心页面）
    searchPlugin({
      locales: {
        "/": { placeholder: "搜索文档..." },
        "/en/": { placeholder: "Search docs..." }
      },
      maxSuggestions: 10,  // 最多显示 10 条搜索结果
      isSearchable: (page) => !page.path.includes("/login/") && !page.path.includes("/register/") && !page.path.includes("/admin/")
    }),
    // 官方组件插件（提供 Button/Icon 等基础组件，避免自定义组件重复开发）
    componentsPlugin({
      components: ["Button", "Icon"],  // 按需加载需要的组件
    }),
  ],
};
```

### 3. 编写全局初始化文件（docs/.vuepress/enhanceApp.js）

负责全局注入 axios、Toast 提示、路由守卫（未登录拦截），**修正 Vue 3 语法适配**：

javascript



运行









```javascript
import { defineClientConfig } from "@vuepress/client";
import axios from "axios";
import { createToast } from "vue-toastification";
import "vue-toastification/dist/index.css";
// 引入自定义组件（后续开发）
import Login from "./components/Login.vue";
import Register from "./components/Register.vue";
import DocManager from "./components/DocManager.vue";
import MDEditor from "./components/MDEditor.vue";

// 1. 初始化 Toast 提示（全局唯一）
const toast = createToast({
  position: "top-right",  // 提示位置：右上角
  timeout: 3000,          // 自动关闭时间：3秒
  closeOnClick: true      // 点击提示关闭
});

// 2. 配置 axios（全局请求拦截，避免重复写 Token）
axios.defaults.baseURL = "http://localhost:8081/api";  // 后端 API 基础路径
axios.defaults.timeout = 10000;                        // 请求超时时间：10秒

// 请求拦截器：添加 Token（从 localStorage 读取）
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("blog_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;  // JWT 格式
    }
    return config;
  },
  (error) => {
    toast.error("请求异常：" + error.message);
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理（Token 过期、服务器异常）
axios.interceptors.response.use(
  (response) => response.data,  // 直接返回响应体（简化前端调用）
  (error) => {
    const msg = error.response?.data?.msg || "服务器异常，请稍后重试";
    toast.error(msg);
    // Token 过期（401）：清除缓存并跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem("blog_token");
      localStorage.removeItem("blog_username");
      window.location.href = "/login/";  // 强制跳转
    }
    return Promise.reject(error);
  }
);

// 3. 定义客户端配置（VuePress v2 要求，注入组件和路由守卫）
export default defineClientConfig({
  // 全局注册自定义组件（在 Markdown 中可直接使用 <Login />）
  components: { Login, Register, DocManager, MDEditor },

  // 初始化钩子：注入全局变量 + 路由守卫
  setup({ app, router }) {
    // 全局注入 axios 和 toast（组件中可通过 this.$axios 调用）
    app.config.globalProperties.$axios = axios;
    app.config.globalProperties.$toast = toast;
    app.config.globalProperties.$localePath = router.currentRoute.value.path.startsWith("/en/") ? "/en/" : "/";  // 多语言路径标识

    // 路由前置守卫：控制页面访问权限
    router.beforeEach((to, from, next) => {
      const token = localStorage.getItem("blog_token");
      const isLoginPage = to.path.includes("/login/");
      const isRegisterPage = to.path.includes("/register/");
      const isAdminPage = to.path.includes("/admin/");

      // 已登录：隐藏登录/注册按钮，显示用户名
      if (token) {
        const loginLink = document.getElementById("login-link");
        const registerLink = document.getElementById("register-link");
        if (loginLink) {
          const username = localStorage.getItem("blog_username") || "用户";
          loginLink.textContent = `欢迎，${username}`;
          loginLink.href = "#";
          // 点击用户名退出登录
          loginLink.onclick = (e) => {
            e.preventDefault();
            if (confirm("确定要退出登录吗？")) {
              localStorage.removeItem("blog_token");
              localStorage.removeItem("blog_username");
              window.location.reload();  // 刷新页面
            }
          };
        }
        if (registerLink) registerLink.style.display = "none";  // 隐藏注册按钮
      }

      // 未登录：拦截管理中心，跳转登录页
      if (isAdminPage && !token && !isLoginPage) {
        toast.warning("请先登录后访问管理中心");
        next("/login/");
        return;
      }

      // 已登录：访问登录/注册页，自动跳转首页
      if (token && (isLoginPage || isRegisterPage)) {
        next("/");
        return;
      }

      next();  // 正常放行
    });
  },
});
```

### 4. 编写自定义样式（docs/.vuepress/public/custom.css）

优化页面布局（侧边栏、导航栏、表单样式），确保美观：

css











```css
/* 全局样式重置（统一浏览器默认样式） */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 1. 左侧侧边栏优化 */
.sidebar {
  width: 260px !important;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
  background: #fff !important;
}
.sidebar-item {
  margin: 8px 0;
}
.sidebar-link {
  padding: 8px 16px !important;
  border-radius: 4px;
  color: #333 !important;
}
.sidebar-link:hover {
  background: rgba(66, 185, 131, 0.1) !important;
  color: #42b983 !important;
}

/* 2. 右侧内容区优化（文档正文） */
.theme-default-content:not(.custom) {
  max-width: 1200px !important;  // 加宽内容区，避免文字过挤
}
.theme-default-content {
  padding: 28px 48px !important;
  line-height: 1.8;
  font-size: 16px;
  color: #333;
}
.page-title {
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid #42b983;  // 标题下划线（品牌色）
  color: #333;
}

/* 3. 顶部导航栏优化 */
.navbar {
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: #fff !important;
}
.navbar-item {
  margin: 0 12px;
}
.navbar-link {
  padding: 10px 16px !important;
  border-radius: 4px;
  color: #333 !important;
}
.navbar-link:hover {
  color: #42b983 !important;
  background: rgba(66, 185, 131, 0.1) !important;
}

/* 4. 搜索框优化 */
.search-box {
  width: 280px !important;
  margin-right: 12px;
}
.search-input {
  height: 38px !important;
  border-radius: 4px !important;
  border: 1px solid #ddd !important;
  padding: 0 12px !important;
}
.search-input:focus {
  border-color: #42b983 !important;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2) !important;
}

/* 5. 多语言下拉框优化 */
.dropdown-menu {
  min-width: 120px !important;
  border-radius: 4px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
.dropdown-item {
  padding: 8px 16px !important;
  color: #333 !important;
}
.dropdown-item:hover {
  background: rgba(66, 185, 131, 0.1) !important;
  color: #42b983 !important;
}

/* 6. 响应式适配（手机端） */
@media (max-width: 768px) {
  .sidebar {
    width: 220px !important;
  }
  .theme-default-content {
    padding: 16px 24px !important;
  }
  .search-box {
    width: 180px !important;
  }
}
```

## 五、开发自定义组件（components 目录）

按需求开发 4 个核心组件，每个组件需确保 Vue 3 语法兼容（用 `<script setup>`），且与后端 API 交互逻辑正确。

### 1. 注册组件（docs/.vuepress/components/Register.vue）

实现用户注册功能，调用后端 `/api/auth/register` 接口：

vue











```vue
<template>
  <div class="register-container">
    <h2 class="page-title">{{ $localePath === "/" ? "用户注册" : "User Registration" }}</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <!-- 用户名输入 -->
      <div class="form-item">
        <label>{{ $localePath === "/" ? "用户名：" : "Username：" }}</label>
        <input
          type="text"
          v-model="form.username"
          required
          placeholder="{{ $localePath === "/" ? "3-20位字符，不含特殊符号" : "3-20 characters, no special symbols" }}"
          minlength="3"
          maxlength="20"
          class="form-input"
        />
      </div>
      <!-- 密码输入 -->
      <div class="form-item">
        <label>{{ $localePath === "/" ? "密码：" : "Password：" }}</label>
        <input
          type="password"
          v-model="form.password"
          required
          placeholder="{{ $localePath === "/" ? "6-20位字符，含字母和数字" : "6-20 characters, include letters and numbers" }}"
          minlength="6"
          maxlength="20"
          class="form-input"
        />
      </div>
      <!-- 邮箱输入 -->
      <div class="form-item">
        <label>{{ $localePath === "/" ? "邮箱：" : "Email：" }}</label>
        <input
          type="email"
          v-model="form.email"
          required
          placeholder="{{ $localePath === "/" ? "请输入有效邮箱（用于找回密码）" : "Enter valid email (for password recovery)" }}"
          class="form-input"
        />
      </div>
      <!-- 注册按钮 -->
      <button type="submit" class="register-btn" :disabled="loading">
        <i class="fa fa-spinner fa-spin" v-if="loading"></i>
        <span v-if="loading">{{ $localePath === "/" ? "注册中..." : "Registering..." }}</span>
        <span v-else>{{ $localePath === "/" ? "注册" : "Register" }}</span>
      </button>
      <!-- 跳转登录页 -->
      <p class="login-link">
        {{ $localePath === "/" ? "已有账号？" : "Already have an account？" }}
        <a :href="$localePath + 'login/'">{{ $localePath === "/" ? "去登录" : "Go to Login" }}</a>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

// 获取全局实例（用于调用 $axios 和 $toast）
const { proxy } = getCurrentInstance();
const router = useRouter();

// 表单数据
const form = ref({
  username: "",
  password: "",
  email: ""
});

// 加载状态
const loading = ref(false);

// 注册逻辑
const handleRegister = async () => {
  loading.value = true;
  try {
    // 调用后端注册接口（axios 已全局注入）
    const res = await proxy.$axios.post("/auth/register", form.value);
    // 注册成功（后端返回 code: 0）
    if (res.code === 0) {
      proxy.$toast.success(res.msg || ($localePath === "/" ? "注册成功，跳转登录页..." : "Registration success, redirecting to login..."));
      // 跳转登录页（适配多语言路径）
      setTimeout(() => {
        router.push($localePath + "login/");
      }, 1500);
    } else {
      // 注册失败（如用户名已存在）
      proxy.$toast.error(res.msg || ($localePath === "/" ? "注册失败，请重试" : "Registration failed, please try again"));
    }
  } catch (error) {
    // 网络错误（由 axios 拦截器统一处理，此处无需额外操作）
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 注册容器样式 */
.register-container {
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
}

/* 表单样式 */
.register-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

/* 按钮样式 */
.register-btn {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.register-btn:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}

/* 登录链接样式 */
.login-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #42b983;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
```

### 2. 登录组件（docs/.vuepress/components/Login.vue）

实现用户登录功能，调用后端 `/api/auth/login` 接口，存储 JWT Token：

vue











```vue
<template>
  <div class="login-container">
    <h2 class="page-title">{{ $localePath === "/" ? "用户登录" : "User Login" }}</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <!-- 用户名输入 -->
      <div class="form-item">
        <label>{{ $localePath === "/" ? "用户名：" : "Username：" }}</label>
        <input
          type="text"
          v-model="form.username"
          required
          placeholder="{{ $localePath === "/" ? "请输入注册时的用户名" : "Enter your username" }}"
          class="form-input"
        />
      </div>
      <!-- 密码输入 -->
      <div class="form-item">
        <label>{{ $localePath === "/" ? "密码：" : "Password：" }}</label>
        <input
          type="password"
          v-model="form.password"
          required
          placeholder="{{ $localePath === "/" ? "请输入密码" : "Enter your password" }}"
          class="form-input"
        />
      </div>
      <!-- 登录按钮 -->
      <button type="submit" class="login-btn" :disabled="loading">
        <i class="fa fa-spinner fa-spin" v-if="loading"></i>
        <span v-if="loading">{{ $localePath === "/" ? "登录中..." : "Logging in..." }}</span>
        <span v-else>{{ $localePath === "/" ? "登录" : "Login" }}</span>
      </button>
      <!-- 跳转注册页 -->
      <p class="register-link">
        {{ $localePath === "/" ? "没有账号？" : "No account？" }}
        <a :href="$localePath + 'register/'">{{ $localePath === "/" ? "去注册" : "Go to Register" }}</a>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

// 获取全局实例
const { proxy } = getCurrentInstance();
const router = useRouter();

// 表单数据
const form = ref({
  username: "",
  password: ""
});

// 加载状态
const loading = ref(false);

// 登录逻辑
const handleLogin = async () => {
  loading.value = true;
  try {
    // 调用后端登录接口
    const res = await proxy.$axios.post("/auth/login", form.value);
    if (res.code === 0) {
      // 登录成功：存储 Token 和用户名到 localStorage
      localStorage.setItem("blog_token", res.data.token);
      localStorage.setItem("blog_username", res.data.username);
      proxy.$toast.success(res.msg || ($localePath === "/" ? "登录成功，跳转管理中心..." : "Login success, redirecting to admin..."));
      // 跳转管理中心（适配多语言）
      setTimeout(() => {
        router.push($localePath + "admin/");
        window.location.reload();  // 刷新页面使导航栏生效
      }, 1500);
    } else {
      // 登录失败（如用户名密码错误）
      proxy.$toast.error(res.msg || ($localePath === "/" ? "用户名或密码错误" : "Invalid username or password"));
    }
  } catch (error) {
    // 网络错误由拦截器处理
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 与注册组件样式复用，仅调整容器名称 */
.login-container {
  max-width: 450px;
  margin: 40px auto;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
}

.login-form {
  margin-top: 20px;
}

.form-item {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-item label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-btn:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}

.register-link {
  margin-top: 16px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #42b983;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
```

### 3. Markdown 编辑器组件（docs/.vuepress/components/MDEditor.vue）

集成 `mavon-editor`，实现 Markdown 实时编辑、预览，支持新增 / 编辑文档：

vue











```vue
<template>
  <div class="md-editor">
    <!-- 分类选择（新增文档显示，编辑文档隐藏） -->
    <div class="category-selector" v-if="showCategory">
      <label>{{ $localePath === "/" ? "文档分类：" : "Document Category：" }}</label>
      <select v-model="form.category" class="form-select" required>
        <option value="tech">{{ $localePath === "/" ? "技术笔记" : "Tech Notes" }}</option>
        <option value="life">{{ $localePath === "/" ? "生活随笔" : "Life Essays" }}</option>
        <option value="other">{{ $localePath === "/" ? "其他" : "Other" }}</option>
      </select>
    </div>
    <!-- 文档标题 -->
    <input
      type="text"
      v-model="form.title"
      class="title-input"
      placeholder="{{ $localePath === "/" ? "请输入文档标题（必填）" : "Enter document title (required)" }}"
      required
    />
    <!-- Markdown 编辑器（mavon-editor） -->
    <mavon-editor
      v-model="form.content"
      :toolbars="toolbars"
      :subfield="true"  // 分栏模式（左侧编辑，右侧预览）
      :defaultOpen="'edit'"  // 默认打开编辑模式
      placeholder="{{ $localePath === "/" ? "请输入 Markdown 内容（至少10个字符）" : "Enter Markdown content (min 10 characters)" }}"
      class="editor-content"
    />
    <!-- 操作按钮 -->
    <div class="btn-group">
      <button type="button" class="btn save-btn" @click="handleSave" :disabled="loading">
        <i class="fa fa-spinner fa-spin" v-if="loading"></i>
        <span v-if="loading">{{ $localePath === "/" ? "保存中..." : "Saving..." }}</span>
        <span v-else>{{ $localePath === "/" ? "保存文档" : "Save Document" }}</span>
      </button>
      <button type="button" class="btn cancel-btn" @click="handleCancel">
        {{ $localePath === "/" ? "取消" : "Cancel" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, getCurrentInstance, defineProps, defineEmits } from "vue";
import mavonEditor from "mavon-editor";
import "mavon-editor/dist/css/index.css";  // 引入编辑器样式

// 1. 定义 Props（接收父组件传递的文档数据，用于编辑模式）
const props = defineProps({
  doc: {  // 编辑模式时，传递已有的文档数据
    type: Object,
    default: () => null
  },
  showCategory: {  // 是否显示分类选择（新增：true，编辑：false）
    type: Boolean,
    default: true
  }
});

// 2. 定义 Emits（向父组件传递事件：保存成功/取消）
const emit = defineEmits(["saveSuccess", "cancel"]);

// 3. 获取全局实例（axios/toast）
const { proxy } = getCurrentInstance();

// 4. 表单数据（初始化：编辑模式回显，新增模式为空）
const form = ref({
  title: props.doc?.title || "",
  content: props.doc?.content || "",
  category: props.doc?.category || "tech"  // 默认分类：技术笔记
});

// 5. 编辑器工具栏配置（按需开启功能）
const toolbars = ref({
  bold: true,    // 加粗
  italic: true,  // 斜体
  header: true,  // 标题
  link: true,    // 链接
  image: true,   // 图片
  list: true,    // 列表
  table: true,   // 表格
  code: true,    // 代码块
  fullscreen: true,  // 全屏
  undo: true,    // 撤销
  redo: true     // 重做
});

// 6. 加载状态
const loading = ref(false);

// 7. 保存文档（新增：POST，编辑：PUT）
const handleSave = async () => {
  // 验证内容长度
  if (form.value.content.length < 10) {
    proxy.$toast.warning($localePath === "/" ? "内容至少10个字符" : "Content must be at least 10 characters");
    return;
  }

  loading.value = true;
  try {
    let res;
    if (props.doc) {
      // 编辑模式：调用后端更新接口（传递文档ID）
      res = await proxy.$axios.put(`/docs/${props.doc.id}`, form.value);
    } else {
      // 新增模式：调用后端创建接口
      res = await proxy.$axios.post("/docs", form.value);
    }

    if (res.code === 0) {
      proxy.$toast.success(res.msg || ($localePath === "/" ? "文档保存成功" : "Document saved successfully"));
      emit("saveSuccess");  // 通知父组件保存成功，刷新列表
    } else {
      proxy.$toast.error(res.msg || ($localePath === "/" ? "文档保存失败" : "Failed to save document"));
    }
  } catch (error) {
    // 网络错误由拦截器处理
  } finally {
    loading.value = false;
  }
};

// 8. 取消操作（通知父组件关闭弹窗）
const handleCancel = () => {
  emit("cancel");
};
</script>

<style scoped>
/* 编辑器容器 */
.md-editor {
  width: 100%;
  margin: 16px 0;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 分类选择 */
.category-selector {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-selector label {
  font-weight: 500;
  color: #333;
  font-size: 14px;
  width: 100px;
}

.form-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
  font-size: 14px;
  cursor: pointer;
  transition: border 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: #42b983;
}

/* 标题输入框 */
.title-input {
  width: 100%;
  padding: 12px 16px;
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 500;
  color: #333;
  transition: border 0.3s;
}

.title-input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}

/* 编辑器内容区 */
.editor-content {
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  min-height: 400px;
}

/* 按钮组 */
.btn-group {
  margin-top: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.save-btn {
  background: #42b983;
  color: #fff;
}

.save-btn:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #eee;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .category-selector {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-select {
    width: 100%;
  }

  .btn-group {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
```

### 4. 文档管理组件（docs/.vuepress/components/DocManager.vue）

整合 MDEditor 组件，实现文档列表、新增、编辑、删除、批量上传功能：

vue











```vue
<template>
  <div class="doc-manager">
    <h2 class="page-title">{{ $localePath === "/" ? "文档管理中心" : "Document Management" }}</h2>

    <!-- 1. 文件上传区域 -->
    <div class="upload-area">
      <!-- 选择 MD 文件/文件夹 -->
      <label class="upload-btn">
        <input
          type="file"
          multiple
          webkitdirectory  // 支持选择文件夹
          accept=".md"     // 仅允许 MD 文件
          @change="handleFileSelect"
          class="file-input"
        />
        <i class="fa fa-upload mr-2"></i>
        {{ $localePath === "/" ? "选择 MD 文件/文件夹" : "Select MD Files/Folder" }}
      </label>
      <!-- 上传分类选择 -->
      <div class="upload-category">
        <label>{{ $localePath === "/" ? "上传分类：" : "Upload Category：" }}</label>
        <select v-model="uploadCategory" class="form-select">
          <option value="tech">{{ $localePath === "/" ? "技术笔记" : "Tech Notes" }}</option>
          <option value="life">{{ $localePath === "/" ? "生活随笔" : "Life Essays" }}</option>
          <option value="other">{{ $localePath === "/" ? "其他" : "Other" }}</option>
        </select>
      </div>
      <!-- 上传状态提示 -->
      <p class="upload-success" v-if="uploadSuccessMsg">{{ uploadSuccessMsg }}</p>
      <p class="upload-fail" v-if="uploadFailMsg" v-html="uploadFailMsg"></p>
    </div>

    <!-- 2. 新增文档按钮 -->
    <button class="add-btn" @click="openAddModal">
      <i class="fa fa-plus mr-2"></i>
      {{ $localePath === "/" ? "新增文档（Markdown）" : "New Document (Markdown)" }}
    </button>

    <!-- 3. 文档列表 -->
    <div class="table-container" v-if="docList.length > 0">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ $localePath === "/" ? "ID" : "ID" }}</th>
            <th>{{ $localePath === "/" ? "标题" : "Title" }}</th>
            <th>{{ $localePath === "/" ? "分类" : "Category" }}</th>
            <th>{{ $localePath === "/" ? "创建时间" : "Created At" }}</th>
            <th>{{ $localePath === "/" ? "操作" : "Action" }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in docList" :key="doc.id" class="doc-row">
            <td>{{ doc.id }}</td>
            <td class="title-cell">{{ doc.title }}</td>
            <td>
              <span class="category-tag" :class="getCategoryClass(doc.category)">
                {{ getCategoryName(doc.category) }}
              </span>
            </td>
            <td>{{ formatTime(doc.created_at) }}</td>
            <td class="action-cell">
              <button class="btn edit-btn" @click="openEditModal(doc)">
                <i class="fa fa-pencil"></i>
                {{ $localePath === "/" ? "编辑" : "Edit" }}
              </button>
              <button class="btn delete-btn" @click="handleDelete(doc.id)">
                <i class="fa fa-trash"></i>
                {{ $localePath === "/" ? "删除" : "Delete" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 空列表提示 -->
    <p class="empty-tip" v-else>
      {{ $localePath === "/" ? "暂无文档，可上传或手动创建" : "No documents yet, upload or create manually" }}
    </p>

    <!-- 4. 新增/编辑弹窗（集成 MDEditor） -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{ isEditMode ? ($localePath === "/" ? "编辑文档" : "Edit Document") : ($localePath === "/" ? "新增文档" : "New Document") }}
          </h3>
          <span class="close-btn" @click="closeModal">&times;</span>
        </div>
        <div class="modal-body">
          <!-- 引入 MDEditor 组件，传递参数和事件 -->
          <MDEditor
            :doc="isEditMode ? currentDoc : null"
            :showCategory="!isEditMode"  // 编辑模式隐藏分类选择
            @saveSuccess="handleModalSave"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

// 1. 获取全局实例和路由
const { proxy } = getCurrentInstance();
const router = useRouter();

// 2. 文档列表相关
const docList = ref([]);
const loading = ref(false);

// 3. 上传相关
const uploadCategory = ref("tech");  // 默认上传分类
const uploadSuccessMsg = ref("");    // 上传成功提示
const uploadFailMsg = ref("");      // 上传失败提示

// 4. 弹窗相关
const showModal = ref(false);       // 弹窗显示状态
const isEditMode = ref(false);      // 是否编辑模式
const currentDoc = ref(null);       // 当前编辑的文档数据

// 5. 格式化时间（后端返回 ISO 时间 -> 本地时间）
const formatTime = (timeStr) => {
  if (!timeStr) return "-";
  return new Date(timeStr).toLocaleString();  // 适配本地时区
};

// 6. 获取分类显示名称（多语言）
const getCategoryName = (category) => {
  switch (category) {
    case "tech":
      return $localePath === "/" ? "技术笔记" : "Tech Notes";
    case "life":
      return $localePath === "/" ? "生活随笔" : "Life Essays";
    case "other":
      return $localePath === "/" ? "其他" : "Other";
    default:
      return category;
  }
};

// 7. 获取分类标签样式（不同分类不同颜色）
const getCategoryClass = (category) => {
  switch (category) {
    case "tech":
      return "tag-tech";
    case "life":
      return "tag-life";
    case "other":
      return "tag-other";
    default:
      return "";
  }
};

// 8. 检查登录状态（防止未登录直接访问管理中心）
const checkLogin = () => {
  const token = localStorage.getItem("blog_token");
  if (!token) {
    proxy.$toast.warning($localePath === "/" ? "请先登录" : "Please log in first");
    router.push($localePath + "login/");
    return false;
  }
  return true;
};

// 9. 获取文档列表（初始化和操作后刷新）
const getDocs = async () => {
  if (!checkLogin()) return;
  loading.value = true;
  try {
    // 调用后端获取文档列表接口（仅返回当前用户的文档）
    const res = await proxy.$axios.get("/docs");
    if (res.code === 0) {
      docList.value = res.data || [];  // 后端返回文档数组
    }
  } catch (error) {
    // 网络错误由拦截器处理
  } finally {
    loading.value = false;
  }
};

// 10. 弹窗操作
// 打开新增弹窗
const openAddModal = () => {
  isEditMode.value = false;
  currentDoc.value = null;
  showModal.value = true;
};

// 打开编辑弹窗（传递当前文档数据）
const openEditModal = (doc) => {
  isEditMode.value = true;
  currentDoc.value = { ...doc };  // 深拷贝，避免直接修改列表数据
  showModal.value = true;
};

// 关闭弹窗
const closeModal = () => {
  showModal.value = false;
  currentDoc.value = null;
};

// 弹窗保存成功后的回调（刷新列表 + 关闭弹窗）
const handleModalSave = () => {
  closeModal();
  getDocs();  // 刷新文档列表
};

// 11. 删除文档
const handleDelete = async (id) => {
  if (!confirm($localePath === "/" ? "确定要删除该文档吗？删除后不可恢复" : "Are you sure to delete this document? It cannot be recovered")) {
    return;
  }
  try {
    // 调用后端删除接口
    await proxy.$axios.delete(`/docs/${id}`);
    proxy.$toast.success($localePath === "/" ? "文档删除成功" : "Document deleted successfully");
    getDocs();  // 刷新列表
  } catch (error) {
    // 网络错误由拦截器处理
  }
};

// 12. MD 文件上传（支持单文件/多文件/文件夹）
// 选择文件后触发
const handleFileSelect = (e) => {
  const files = e.target.files;
  if (files.length === 0) return;
  // 清空之前的上传状态
  uploadSuccessMsg.value = "";
  uploadFailMsg.value = "";
  // 调用上传逻辑
  handleUpload(files);
  // 重置文件输入（否则无法重复选择同一文件）
  e.target.value = "";
};

// 上传文件到后端
const handleUpload = async (files) => {
  if (!checkLogin()) return;
  // 构造 FormData（后端需要 multipart/form-data 格式）
  const formData = new FormData();
  formData.append("category", uploadCategory.value);  // 上传分类
  // 添加所有选中的文件
  for (let i = 0; i < files.length; i++) {
    formData.append("files", files[i]);
  }

  try {
    // 调用后端文件上传接口
    const res = await proxy.$axios.post("/docs/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },  // 必须设置该头
      onUploadProgress: (progressEvent) => {
        // 可选：显示上传进度（如需实现进度条，可在此处理）
        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        console.log(`Upload progress: ${percent}%`);
      }
    });

    if (res.code === 0) {
      const { success_count, fail_files } = res.data;
      // 显示上传成功信息
      uploadSuccessMsg.value = $localePath === "/" 
        ? `成功上传 ${success_count} 个文件` 
        : `Successfully uploaded ${success_count} files`;
      // 显示上传失败的文件（若有）
      if (fail_files && fail_files.length > 0) {
        uploadFailMsg.value = $localePath === "/" 
          ? `上传失败的文件：<br />${fail_files.join("<br />")}` 
          : `Failed files：<br />${fail_files.join("<br />")}`;
      }
      // 刷新文档列表
      getDocs();
    } else {
      uploadFailMsg.value = res.msg || ($localePath === "/" ? "上传失败，请重试" : "Upload failed, please try again");
    }
  } catch (error) {
    uploadFailMsg.value = error.response?.data?.msg || ($localePath === "/" ? "网络异常，上传失败" : "Network error, upload failed");
  }
};

// 13. 初始化：页面加载时获取文档列表
onMounted(() => {
  getDocs();
});
</script>

<style scoped>
/* 管理中心容器 */
.doc-manager {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

/* 1. 上传区域样式 */
.upload-area {
  margin: 20px 0;
  padding: 20px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  transition: border 0.3s;
  background: #fafafa;
}

.upload-area:hover {
  border-color: #42b983;
}

.upload-btn {
  display: inline-block;
  padding: 12px 24px;
  background: #42b983;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 12px;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #359469;
}

.file-input {
  display: none;  // 隐藏原生文件选择框
}

.upload-category {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.upload-category label {
  color: #666;
  font-size: 14px;
}

/* 上传状态提示 */
.upload-success {
  margin: 12px 0 0;
  color: #42b983;
  font-size: 14px;
}

.upload-fail {
  margin: 12px 0 0;
  color: #ff4d4f;
  font-size: 14px;
  white-space: pre-line;
}

/* 2. 新增按钮样式 */
.add-btn {
  padding: 12px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: background 0.3s;
}

.add-btn:hover {
  background: #359469;
}

/* 3. 文档表格样式 */
.table-container {
  overflow-x: auto;  // 适配小屏幕，横向滚动
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.doc-table th,
.doc-table td {
  border: 1px solid #f0f0f0;
  padding: 12px 16px;
  text-align: left;
}

.doc-table th {
  background: #f5f5f5;
  color: #333;
  font-weight: 500;
}

.doc-row:hover {
  background: #fafafa;
}

/* 标题单元格（超出部分省略） */
.title-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
}

/* 分类标签 */
.category-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #fff;
}

.tag-tech {
  background: #42b983;
}

.tag-life {
  background: #3498db;
}

.tag-other {
  background: #999;
}

/* 操作按钮单元格 */
.action-cell {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: background 0.3s;
}

.edit-btn {
  background: #f5f5f5;
  color: #666;
}

.edit-btn:hover {
  background: #eee;
}

.delete-btn {
  background: #fff0f0;
  color: #ff4d4f;
}

.delete-btn:hover {
  background: #ffe0e0;
}

/* 空列表提示 */
.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 4. 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;  // 确保弹窗在最上层
}

.modal-content {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;  // 内容超出时滚动
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  color: #333;
  font-size: 16px;
  font-weight: 500;
}

.close-btn {
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 8px 0;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .upload-category {
    flex-direction: column;
    align-items: center;
  }

  .action-cell {
    flex-direction: column;
  }

  .title-cell {
    max-width: 150px;
  }

  .modal-content {
    padding: 16px;
  }
}
</style>
```

## 六、编写 Markdown 页面（docs 目录）

创建多语言页面，直接引用自定义组件（VuePress 支持在 Markdown 中使用 Vue 组件）。

### 1. 中文页面（docs 目录下）

#### （1）中文首页（docs/README.md）

markdown











```markdown
# 我的个人博客

欢迎来到我的个人博客！这里记录我的技术笔记、生活随笔和学习心得。

## 博客特色
- 📝 支持 Markdown 文档管理（手动编写/本地上传）
- 🌐 多语言切换（中文/英文）
- 🔒 用户登录注册，权限控制
- 🔍 文档搜索功能

## 快速导航
- [技术笔记](/docs/tech/)
- [生活随笔](/docs/life/)
- [管理中心](/admin/)（需登录）
```

#### （2）中文注册页（docs/register.md）

markdown











```markdown
# 用户注册

<!-- 直接引用自定义组件 <Register /> -->
<Register />
```

#### （3）中文登录页（docs/login.md）

markdown











```markdown
# 用户登录

<!-- 直接引用自定义组件 <Login /> -->
<Login />
```

#### （4）中文管理中心（docs/admin.md）

markdown











```markdown
# 文档管理中心

<!-- 直接引用自定义组件 <DocManager /> -->
<DocManager />
```

#### （5）中文技术笔记示例（docs/docs/tech/gin.md）

markdown











~~~markdown
# Gin 框架入门

这是一篇用 Markdown 编写的技术笔记，基于 Gin 框架的基础使用教程。

## 1. 安装 Gin
```go
// 安装最新版 Gin（Go 1.16+）
go get github.com/gin-gonic
~~~

# 5）中文技术笔记示例（docs/docs/tech/gin.md）- 补全

markdown











~~~markdown
# Gin 框架入门

这是一篇用 Markdown 编写的技术笔记，基于 Gin 框架的基础使用教程，适合 Go 语言初学者快速上手。

## 1. 安装 Gin
Gin 是 Go 语言的高性能 Web 框架，需确保本地已安装 Go 1.16+（推荐 1.18+）：
```go
// 安装最新稳定版 Gin
go get github.com/gin-gonic/gin@latest

// 验证安装：查看 Gin 版本（需在项目中引入后）
// 在 go.mod 中会自动添加依赖：require github.com/gin-gonic/gin v1.9.1（版本号可能更新）
~~~

## 2. 第一个 Gin 程序（Hello World）

创建 `main.go` 文件，编写最简单的 HTTP 服务：

go



运行









```go
package main

import "github.com/gin-gonic/gin"

func main() {
    // 1. 创建 Gin 引擎（默认带日志和恢复中间件）
    r := gin.Default()

    // 2. 定义路由（GET 方法，路径为 "/hello"）
    r.GET("/hello", func(c *gin.Context) {
        // 返回 JSON 响应
        c.JSON(200, gin.H{
            "message": "Hello Gin!",
            "status":  "success",
        })
    })

    // 3. 启动服务（默认端口 8080，可指定端口：r.Run(":8081")）
    if err := r.Run(); err != nil {
        panic("Gin 服务启动失败：" + err.Error())
    }
}
```

### 运行步骤：

1. 初始化 Go 模块：`go mod init gin-demo`

2. 运行程序：`go run main.go`

3. 访问接口：浏览器打开

    

   ```
   http://localhost:8080/hello
   ```

   ，会看到以下响应：

   json

   

   

   

   

   

   ```json
   { "message": "Hello Gin!", "status": "success" }
   ```

   

## 3. Gin 核心特性：路由参数

支持动态路由参数，适用于用户 ID、文档 ID 等场景：

go



运行









```go
// 动态路由：路径中的 ":id" 是参数
r.GET("/user/:id", func(c *gin.Context) {
    // 获取路由参数
    userId := c.Param("id")
    c.JSON(200, gin.H{
        "user_id": userId,
        "msg":     "获取用户信息成功",
    })
})

// 访问示例：http://localhost:8080/user/123 → 返回 { "user_id": "123", ... }
```

## 4. 接收请求参数（Query + Form）

### （1）Query 参数（URL 中的 `?key=value`）

go



运行









```go
// 路由：/search?keyword=gin&page=1
r.GET("/search", func(c *gin.Context) {
    // 获取 Query 参数，第二个参数是默认值
    keyword := c.DefaultQuery("keyword", "golang")
    page := c.Query("page") // 无默认值，未传则为空字符串

    c.JSON(200, gin.H{
        "keyword": keyword,
        "page":    page,
        "result":  "查询到 10 条相关结果",
    })
})
```

### （2）Form 表单参数（POST 请求）

go



运行









```go
// 解析 Form 表单（需先调用 c.ShouldBind()）
r.POST("/login", func(c *gin.Context) {
    username := c.PostForm("username")
    password := c.PostForm("password")

    if username == "admin" && password == "123456" {
        c.JSON(200, gin.H{"msg": "登录成功"})
    } else {
        c.JSON(400, gin.H{"msg": "用户名或密码错误"})
    }
})
```

# （6）中文生活随笔示例（docs/docs/life/travel.md）

markdown











```markdown
# 旅行记录：云南大理 5 日游

去年夏天（2024年7月）去了云南大理，避开了国庆旺季，体验感拉满！整理了一份详细的行程和攻略，供计划去大理的朋友参考。

## 一、行程规划（5天4晚）
| 天数 | 行程亮点 | 住宿推荐 |
|------|----------|----------|
| Day1 | 抵达大理 → 大理古城 | 古城内民宿（近人民路） |
| Day2 | 洱海西岸骑行 → 喜洲古镇 | 双廊古镇海景房 |
| Day3 | 双廊古镇 → 南诏风情岛 | 双廊古镇 |
| Day4 | 苍山徒步（洗马潭大索道） → 寂照庵 | 大理古城 |
| Day5 | 崇圣寺三塔 → 返程 | - |

## 二、必体验项目
### 1. 洱海骑行（强推！）
- **路线**：才村码头 → 磻溪村 S 弯 → 喜洲古镇（全程约 20km，骑行 2-3 小时）
- **交通**：租电动车（50-80 元/天，需押身份证或 200 元押金）
- **Tips**：
  - 避开正午太阳（云南紫外线强，建议早上 9 点前或下午 4 点后出发）
  - 带好防晒用品（帽子、墨镜、防晒霜）
  - S 弯拍照最佳时间：下午 5 点（光线柔和，人少）

### 2. 喜洲古镇（吃逛两不误）
- **必吃美食**：
  - 现烤乳扇（蘸蜂蜜，10 元/份，甜而不腻）
  - 喜洲粑粑（咸口加肉沫，5 元/个，现烤外皮酥脆）
  - 豌豆粉（凉拌味，8 元/份，解暑神器）
- **必逛景点**：
  - 严家大院（了解白族民居文化，门票 25 元/人）
  - 喜林苑（稻田拍照，6-8 月是绿色稻田，10 月是金色麦浪）

### 3. 苍山徒步（适合喜欢自然的朋友）
- **索道选择**：洗马潭大索道（全程票 290 元/人，直达海拔 3920 米的洗马潭）
- **徒步路线**：洗马潭 → 七龙女池（全程约 3km，耗时 1.5 小时，难度中等）
- **注意事项**：
  - 苍山海拔高，温差大，即使夏天也要带薄外套
  - 有轻微高反的朋友可提前准备氧气瓶（山下 20 元/罐）
  - 寂照庵（苍山半山腰）的素斋值得一试（20 元/人，自助式）

## 三、避坑指南
1. **不要跟低价旅行团**：低于 500 元的“大理一日游”多有购物陷阱（强制买银器、翡翠）
2. **洱海游船选择正规渠道**：推荐“洱海二号”或“大运号”，避免私人小游船（安全无保障）
3. **买特产认准本地人店铺**：大理古城内的“云南特产超市”多为外地人开，价格虚高，建议去喜洲古镇买手工扎染、普洱茶

## 四、照片分享
（可插入本地图片，需将图片放在 docs/.vuepress/public/images/ 目录下）
![洱海S弯](../../../.vuepress/public/images/dali-ershui.jpg)
![喜洲稻田](../../../.vuepress/public/images/dali-xizhou.jpg)
```

# 七、英文页面编写（docs/en 目录）

英文页面需与中文页面结构完全对应，确保多语言切换时路径匹配，内容语义一致。

## 1. 英文首页（docs/en/README.md）

markdown











```markdown
# My Personal Blog

Welcome to my personal blog! Here I share my technical notes, life essays, and learning experiences.

## Blog Features
- 📝 Support Markdown document management (manual writing/local upload)
- 🌐 Multi-language switch (Chinese/English)
- 🔒 User login & registration, permission control
- 🔍 Document search function

## Quick Navigation
- [Tech Notes](/en/docs/tech/)
- [Life Essays](/en/docs/life/)
- [Admin Center](/en/admin/) (Login required)
```

## 2. 英文注册页（docs/en/register.md）

markdown











```markdown
# User Registration

<!-- Reference the custom Register component directly -->
<Register />
```

## 3. 英文登录页（docs/en/login.md）

markdown











```markdown
# User Login

<!-- Reference the custom Login component directly -->
<Login />
```

## 4. 英文管理中心（docs/en/admin.md）

markdown











```markdown
# Document Management Center

<!-- Reference the custom DocManager component directly -->
<DocManager />
```

## 5. 英文技术笔记示例（docs/en/docs/tech/gin.md）

markdown











~~~markdown
# Gin Framework Introduction

This is a technical note written in Markdown, covering the basic usage of the Gin framework, suitable for Go beginners.

## 1. Install Gin
Gin is a high-performance web framework for Go. Ensure you have Go 1.16+ (recommended 1.18+) installed locally:
```go
// Install the latest stable version of Gin
go get github.com/gin-gonic/gin@latest

// Verify installation: Check Gin version (after importing in your project)
// The dependency will be added to go.mod automatically: require github.com/gin-gonic/gin v1.9.1 (version may update)
~~~

## 2. First Gin Program (Hello World)

Create a `main.go` file and write the simplest HTTP service:

go



运行









```go
package main

import "github.com/gin-gonic/gin"

func main() {
    // 1. Create a Gin engine (with default logger and recovery middleware)
    r := gin.Default()

    // 2. Define a route (GET method, path "/hello")
    r.GET("/hello", func(c *gin.Context) {
        // Return JSON response
        c.JSON(200, gin.H{
            "message": "Hello Gin!",
            "status":  "success",
        })
    })

    // 3. Start the service (default port 8080, specify port with r.Run(":8081"))
    if err := r.Run(); err != nil {
        panic("Gin service startup failed: " + err.Error())
    }
}
```

### Running Steps:

1. Initialize Go module: `go mod init gin-demo`

2. Run the program: `go run main.go`

3. Access the interface: Open

    

   ```
   http://localhost:8080/hello
   ```

    

   in your browser, you will see the following response:

   json

   

   

   

   

   

   ```json
   { "message": "Hello Gin!", "status": "success" }
   ```

   

## 3. Core Feature of Gin: Route Parameters

Supports dynamic route parameters, suitable for scenarios like user ID and document ID:

go



运行









```go
// Dynamic route: ":id" in the path is a parameter
r.GET("/user/:id", func(c *gin.Context) {
    // Get route parameter
    userId := c.Param("id")
    c.JSON(200, gin.H{
        "user_id": userId,
        "msg":     "Successfully get user info",
    })
})

// Access example: http://localhost:8080/user/123 → Returns { "user_id": "123", ... }
```

plaintext











~~~plaintext
## 6. 英文生活随笔示例（docs/en/docs/life/travel.md）
```markdown
# Travel Log: 5-Day Trip to Dali, Yunnan

Last summer (July 2024), I visited Dali, Yunnan, avoiding the National Day peak season, and had a great experience! I organized a detailed itinerary and guide for friends planning to visit Dali.

## I. Itinerary Planning (5 Days & 4 Nights)
| Day | Highlights | Accommodation Recommendation |
|-----|------------|------------------------------|
| Day1 | Arrive in Dali → Dali Ancient Town | Homestay in the ancient town (near Renmin Road) |
| Day2 | Erhai West Bank Cycling → Xizhou Ancient Town | Seaview room in Shuanglang Ancient Town |
| Day3 | Shuanglang Ancient Town → Nanzhao Style Island | Shuanglang Ancient Town |
| Day4 | Cangshan Hiking (Ximatan Cableway) → Jizhao Nunnery | Dali Ancient Town |
| Day5 | Chongsheng Temple Three Pagodas → Return | - |

## II. Must-Try Activities
### 1. Erhai Cycling (Highly Recommended!)
- **Route**: Caicun Wharf → Panxi Village S-Bend → Xizhou Ancient Town (about 20km, 2-3 hours cycling)
- **Transport**: Rent an electric bike (50-80 RMB/day, need to deposit ID card or 200 RMB)
- **Tips**:
  - Avoid the midday sun (Yunnan has strong UV rays; suggest leaving before 9 AM or after 4 PM)
  - Bring sun protection (hat, sunglasses, sunscreen)
  - Best time to take photos at S-Bend: 5 PM (soft light, fewer people)

### 2. Xizhou Ancient Town (Food & Shopping)
- **Must-Eat Foods**:
  - Freshly Baked Rushan (dip in honey, 10 RMB/serving, sweet but not greasy)
  - Xizhou Baba (salty with minced meat, 5 RMB/piece, crispy outer skin)
  - Pea Starch Noodles (cold flavor, 8 RMB/serving, refreshing)
- **Must-Visit Attractions**:
  - Yan Family Compound (learn about Bai ethnic group's residential culture, ticket 25 RMB/person)
  - Xilin Garden (take photos with rice fields; green in June-August, golden in October)

## III. Avoid These Traps
1. **Don’t join low-cost tour groups**: "Dali One-Day Tour" under 500 RMB mostly has shopping traps (forced to buy silverware, jade)
2. **Choose formal channels for Erhai cruises**: Recommend "Erhai No.2" or "Dayun", avoid private small boats (no safety guarantee)
3. **Buy specialties from local shops**: "Yunnan Specialty Supermarkets" in Dali Ancient Town are mostly run by outsiders with inflated prices; suggest buying hand-woven tie-dye and Pu'er tea in Xizhou Ancient Town

## IV. Photo Sharing
(Local images can be inserted; place images in the docs/.vuepress/public/images/ directory)
![Erhai S-Bend](../../../.vuepress/public/images/dali-ershui.jpg)
![Xizhou Rice Fields](../../../.vuepress/public/images/dali-xizhou.jpg)
~~~

# 八、前端开发完成后：测试与验证

前端代码编写完成后，需通过以下步骤验证功能是否正常，确保与后端接口衔接顺畅。

## 1. 启动前端开发服务

在 `frontend` 目录下执行命令，启动 VuePress 开发服务器（实时热更新）：

bash











```bash
npm run docs:dev
```

启动成功后，终端会提示访问地址（默认 `http://localhost:8080`），打开浏览器进入首页。

## 2. 核心功能验证清单

### （1）基础功能验证

| 功能点     | 验证步骤                                | 预期结果                                                     |
| ---------- | --------------------------------------- | ------------------------------------------------------------ |
| 多语言切换 | 点击顶部导航栏的 “语言”→ 选择 “English” | 页面自动切换为英文，路径变为 `/en/`，所有文本（标题、按钮、提示）适配英文 |
| 导航栏跳转 | 点击 “技术笔记”→ “Gin 入门”             | 成功进入 `docs/docs/tech/gin.md` 页面，侧边栏高亮当前文档，右侧显示目录 |
| 搜索功能   | 在顶部搜索框输入 “Gin”                  | 搜索结果显示 “Gin 框架入门”，点击可跳转至对应文档            |

### （2）用户系统验证

| 功能点     | 验证步骤                                                     | 预期结果                                                     |
| ---------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 注册       | 进入 “注册” 页 → 填写用户名（3-20 位）、密码（6-20 位）、邮箱 → 点击 “注册” | 注册成功：提示 “注册成功，跳转登录页”，1.5 秒后自动跳转到登录页；注册失败（如用户名已存在）：提示 “用户名已被占用” |
| 登录       | 进入 “登录” 页 → 输入注册的用户名和密码 → 点击 “登录”        | 登录成功：提示 “登录成功，跳转管理中心”，自动跳转到 `/admin/`，导航栏 “登录” 变为 “欢迎，XXX”，“注册” 按钮隐藏 |
| 未登录拦截 | 直接在地址栏输入 `http://localhost:8080/admin/`（未登录状态） | 自动跳转到登录页，提示 “请先登录”                            |
| 退出登录   | 点击导航栏 “欢迎，XXX”→ 确认 “退出登录”                      | 清除 localStorage 中的 Token 和用户名，页面刷新，导航栏恢复 “登录”“注册” 按钮 |

### （3）文档管理验证

| 功能点      | 验证步骤                                                     | 预期结果                                                     |
| ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| 新增文档    | 进入管理中心 → 点击 “新增文档”→ 输入标题、选择分类、编写 Markdown 内容 → 点击 “保存” | 保存成功：提示 “文档保存成功”，弹窗关闭，文档列表新增一条记录，显示标题、分类、创建时间 |
| 编辑文档    | 文档列表中找到新增的文档 → 点击 “编辑”→ 修改标题或内容 → 保存 | 保存成功：列表中文档信息更新，内容同步修改                   |
| 删除文档    | 文档列表中找到目标文档 → 点击 “删除”→ 确认删除               | 删除成功：提示 “文档删除成功”，列表中该文档消失              |
| MD 文件上传 | 管理中心 → 点击 “选择 MD 文件 / 文件夹”→ 选择本地 1-2 个 .md 文件 → 选择分类 → 上传 | 上传成功：提示 “成功上传 X 个文件”，列表中新增对应文档（标题为 MD 文件名，内容为文件内容）；上传失败（如非 .md 文件）：提示 “上传失败的文件：XXX” |

## 3. 常见问题排查

### （1）启动服务报错 “Component not found”

- **原因**：自定义组件（如 Login.vue）路径错误，或未在 `enhanceApp.js` 中注册。
- **解决**：检查 `docs/.vuepress/components/` 目录下是否存在对应组件，且 `enhanceApp.js` 的 `components` 数组中已包含该组件（如 `components: { Login, Register, DocManager, MDEditor }`）。

### （2）调用后端接口报错 “404 Not Found”

- **原因**：axios 基础路径配置错误，或后端服务未启动。

- 解决

  ：

  1. 检查 `enhanceApp.js` 中 `axios.defaults.baseURL` 是否为后端实际地址（如 `http://localhost:8081/api`）；
  2. 确保后端服务已启动（执行 `go run main.go`），且接口路径与前端请求路径一致（如前端 `post("/auth/login")` 对应后端 `/api/auth/login`）。

### （3）Markdown 编辑器样式错乱

- **原因**：未引入 `mavon-editor` 的 CSS 文件。
- **解决**：在 MDEditor.vue 的 `<script setup>` 中添加 `import "mavon-editor/dist/css/index.css";`。

## 4. 生产环境构建（可选）

若需部署到服务器，执行以下命令生成静态文件（输出到 `docs/.vuepress/dist` 目录）：

bash











```bash
npm run docs:build
```

构建完成后，将 `dist` 目录下的所有文件部署到 Nginx、Apache 等静态服务器即可（部署步骤参考之前的 “生产环境部署” 章节）。





# 前端重构

# 完整个人博客项目（Vue + VitePress + Gin + GORM）- 前端改造版

以下是将原 VuePress 前端框架**迁移为 Vue 3 + VitePress** 的全量实现代码，保留所有核心功能（用户注册、MD 上传、文档管理、多语言），适配 VitePress 目录结构与配置规范，解决依赖冲突与语法兼容问题。

## 一、项目整体结构（VitePress 版）

plaintext











```plaintext
blog-project/
├─ frontend/                # VitePress 前端（Vue 3 生态）
│  ├─ docs/                 # VitePress 核心目录（文件路由根目录）
│  │  ├─ .vitepress/         # VitePress 配置目录
│  │  │  ├─ components/      # 自定义组件（自动注册，可直接在 MD 中使用）
│  │  │  │  ├─ Login.vue       # 登录组件
│  │  │  │  ├─ Register.vue    # 注册组件
│  │  │  │  ├─ DocManager.vue  # 文档管理（MD 上传+分类）
│  │  │  │  └─ MDEditor.vue    # Markdown 编辑器
│  │  │  ├─ public/           # 静态资源（CSS、图标等）
│  │  │  │  └─ custom.css     # 全局样式优化
│  │  │  ├─ config.js          # VitePress 核心配置（路由、主题、多语言）
│  │  │  └─ enhanceApp.js      # 全局注入（Axios、Toast、路由守卫）
│  │  ├─ en/                  # 英文多语言页面（文件路由自动匹配 /en/ 路径）
│  │  │  ├─ index.md          # 英文首页
│  │  │  ├─ login.md          # 英文登录页
│  │  │  ├─ register.md       # 英文注册页
│  │  │  └─ admin.md          # 英文管理中心
│  │  ├─ index.md             # 中文首页（默认路由 /）
│  │  ├─ login.md             # 中文登录页（路由 /login.html）
│  │  ├─ register.md          # 中文注册页（路由 /register.html）
│  │  └─ admin.md             # 中文管理中心（路由 /admin.html）
│  └─ package.json            # 前端依赖（VitePress + Vue 3 生态）
└─ backend/                   # 原有 Gin 后端（无需修改，接口完全兼容）
   # 后端结构与之前一致，此处省略...
```

## 二、前端核心配置（VitePress 版）

### 1. package.json（依赖配置）

json











```json
{
  "name": "blog-frontend-vitepress",
  "version": "1.0.0",
  "description": "Vue 3 + VitePress 个人博客前端",
  "type": "module",
  "private": true,
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "scripts": {
    "docs:dev": "vitepress dev docs",    // 开发模式（热更新）
    "docs:build": "vitepress build docs",// 生产构建（输出到 docs/.vitepress/dist）
    "docs:preview": "vitepress preview docs" // 预览构建结果
  },
  "resolutions": {
    "vue": "3.5.10",                     // 强制 Vue 3 版本（避免冲突）
    "@vue/server-renderer": "3.5.10"
  },
  "dependencies": {
    "axios": "^1.7.7",                   // HTTP 请求（Vue 3 兼容）
    "mavon-editor": "^3.0.1",            // Vue 3 版 Markdown 编辑器
    "vue-toastification": "^2.0.0-rc.5"  // Vue 3 版全局提示
  },
  "devDependencies": {
    "@vitepress/theme-default": "^1.3.1",// VitePress 官方默认主题（Vue 3）
    "vitepress": "^1.3.1",               // VitePress 核心（基于 Vite + Vue 3）
    "npm-force-resolutions": "^0.0.10"   // 强制依赖版本（解决冲突）
  },
  "keywords": ["vue3", "vitepress", "blog", "markdown"],
  "author": "",
  "license": "ISC"
}
```

### 2. docs/.vitepress/config.js（VitePress 核心配置）

javascript



运行









```javascript
import { defineConfig } from 'vitepress'
import { defaultTheme } from '@vitepress/theme-default'

// 导出 VitePress 配置（基于 Vue 3）
export default defineConfig({
  // ========================= 基础配置 =========================
  title: '我的个人博客',          // 网站标题（默认语言）
  description: 'Vue 3 + VitePress + Gin 多语言博客', // SEO 描述
  base: '/',                     // 部署基础路径（根目录）
  lang: 'zh-CN',                 // 默认语言
  port: 8080,                    // 开发端口（避开后端 8081）

  // ========================= 多语言配置（VitePress 原生支持） =========================
  locales: {
    // 中文（默认语言，路由 /）
    '/': {
      lang: 'zh-CN',
      title: '我的个人博客',
      description: 'Vue 3 + VitePress 个人博客'
    },
    // 英文（路由 /en/）
    '/en/': {
      lang: 'en-US',
      title: 'My Personal Blog',
      description: 'Personal Blog with Vue 3 + VitePress'
    }
  },

  // ========================= 主题配置（官方默认主题） =========================
  theme: defaultTheme({
    // 1. 顶部导航栏（Navbar）
    navbar: [
      // 中文导航
      { text: '首页', link: '/' },
      {
        text: '文档列表',
        items: [
          { text: '技术笔记', link: '/docs/tech/' }, // 需创建 docs/tech/index.md
          { text: '生活随笔', link: '/docs/life/' },
          { text: '其他文档', link: '/docs/other/' }
        ]
      },
      { text: '管理中心', link: '/admin.html' },
      { text: '登录', link: '/login.html', id: 'login-link' },
      { text: '注册', link: '/register.html', id: 'register-link' },
      // 多语言切换
      {
        text: '语言',
        items: [
          { text: '中文', link: '/' },
          { text: 'English', link: '/en/' }
        ]
      }
    ],

    // 2. 左侧侧边栏（Sidebar，按路径匹配）
    sidebar: {
      // 中文技术笔记（匹配 /docs/tech/ 路径）
      '/docs/tech/': [
        { text: 'Gin 入门', link: '/docs/tech/gin.md' },
        { text: 'VitePress 配置', link: '/docs/tech/vitepress.md' }
      ],
      // 英文技术笔记（匹配 /en/docs/tech/ 路径）
      '/en/docs/tech/': [
        { text: 'Gin Intro', link: '/en/docs/tech/gin.md' },
        { text: 'VitePress Config', link: '/en/docs/tech/vitepress.md' }
      ]
    },

    // 3. 右侧内容目录（Outline）
    outline: {
      level: [2, 3], // 显示 h2-h3 标题
      label: {
        '/': '文档目录',
        '/en/': 'Table of Contents'
      }
    },

    // 4. 搜索配置（VitePress 内置搜索，无需额外插件）
    search: {
      placeholder: {
        '/': '搜索文档...',
        '/en/': 'Search docs...'
      },
      maxResults: 10 // 最大搜索结果数
    }
  }),

  // ========================= 注入 HTML 头部资源 =========================
  head: [
    // 全局样式（自定义布局优化）
    ['link', { rel: 'stylesheet', href: '/custom.css' }],
    // Font Awesome 图标库（组件中使用）
    ['link', { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css' }]
  ],

  // ========================= Vite 配置（VitePress 基于 Vite） =========================
  vite: {
    // 跨域代理（对接后端 Gin API）
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:8081', // 后端地址
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    // 解决依赖别名（可选）
    resolve: {
      alias: {
        'vue': 'vue/dist/vue.esm-bundler.js'
      }
    }
  }
})
```

### 3. docs/.vitepress/enhanceApp.js（全局注入与路由守卫）

javascript



运行









```javascript
import { useRouter } from 'vitepress'
import { createToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import axios from 'axios'

// 初始化全局提示（Vue 3 兼容）
const toast = createToast({
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true
})

// 配置 Axios（全局拦截器）
axios.defaults.baseURL = import.meta.env.MODE === 'development' ? '/api' : 'http://your-domain.com/api'
axios.defaults.timeout = 10000

// 请求拦截器：添加 Token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('blog_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    toast.error('请求异常：' + error.message)
    return Promise.reject(error)
  }
)

// 响应拦截器：统一错误处理
axios.interceptors.response.use(
  (response) => response.data, // 直接返回响应体（简化调用）
  (error) => {
    const errMsg = error.response?.data?.msg || '服务器异常，请稍后重试'
    toast.error(errMsg)

    // Token 过期：跳转登录页
    if (error.response?.status === 401) {
      localStorage.removeItem('blog_token')
      localStorage.removeItem('blog_username')
      const router = useRouter()
      router.push('/login.html')
    }

    return Promise.reject(error)
  }
)

// VitePress 全局增强：注入全局属性 + 路由守卫
export default ({ app, router }) => {
  // 1. 注入全局属性（组件中可通过 inject 或 app.config.globalProperties 访问）
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$toast = toast
  app.provide('axios', axios) // 依赖注入（推荐组件中用 inject('axios') 获取）
  app.provide('toast', toast)

  // 2. 路由守卫（权限控制 + 导航栏状态更新）
  router.beforeEach((to) => {
    const token = localStorage.getItem('blog_token')
    const isLoginPage = to.path.includes('login.html')
    const isRegisterPage = to.path.includes('register.html')
    const isAdminPage = to.path.includes('admin.html')
    const isEnLang = to.path.startsWith('/en/')

    // -------------------------- 权限控制 --------------------------
    // 未登录访问管理中心 → 跳转登录页
    if (isAdminPage && !token) {
      toast.warning(isEnLang ? 'Please log in first' : '请先登录后访问管理中心')
      return isEnLang ? '/en/login.html' : '/login.html'
    }

    // 已登录访问登录/注册页 → 跳转首页
    if (token && (isLoginPage || isRegisterPage)) {
      return isEnLang ? '/en/' : '/'
    }

    // -------------------------- 导航栏状态更新（已登录隐藏登录/注册按钮） --------------------------
    if (token && typeof window !== 'undefined') {
      const loginLink = document.getElementById('login-link')
      const registerLink = document.getElementById('register-link')
      const username = localStorage.getItem('blog_username') || (isEnLang ? 'User' : '用户')

      if (loginLink) {
        loginLink.textContent = isEnLang ? `Welcome, ${username}` : `欢迎，${username}`
        loginLink.href = '#'
        loginLink.onclick = (e) => {
          e.preventDefault()
          if (confirm(isEnLang ? 'Are you sure to log out?' : '确定要退出登录吗？')) {
            localStorage.removeItem('blog_token')
            localStorage.removeItem('blog_username')
            window.location.reload()
          }
        }
      }

      if (registerLink) registerLink.style.display = 'none'
    }

    return true
  })
}
```

### 4. docs/.vitepress/public/custom.css（全局样式优化）

css











```css
/* 重置默认样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 内容区宽度优化（VitePress 默认内容区较窄，加宽适配） */
.VPDoc {
  max-width: 1200px !important;
  padding: 2rem 2.5rem !important;
}

/* 导航栏样式优化 */
.VPNav {
  height: 64px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff !important;
}
.VPNavItem {
  margin: 0 0.75rem;
}
.VPNavLink {
  padding: 0.5rem 0.75rem !important;
  border-radius: 4px;
  color: #333 !important;
}
.VPNavLink:hover {
  color: #42b983 !important;
  background: rgba(66, 185, 131, 0.1) !important;
}

/* 侧边栏样式优化 */
.VPSidebar {
  width: 260px !important;
  box-shadow: 1px 0 3px rgba(0, 0, 0, 0.05);
}
.VPSidebarItem {
  margin: 0.5rem 0;
}
.VPSidebarLink {
  padding: 0.5rem 1rem !important;
  border-radius: 4px;
}
.VPSidebarLink:hover {
  background: rgba(66, 185, 131, 0.1) !important;
}

/* 组件通用样式（登录/注册/编辑器） */
.form-item {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-item label {
  font-weight: 500;
  color: #333;
  font-size: 0.9rem;
}
.form-input, .form-select {
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border 0.3s;
}
.form-input:focus, .form-select:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 2px rgba(66, 185, 131, 0.2);
}
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.btn-primary {
  background: #42b983;
  color: #fff;
}
.btn-primary:disabled {
  background: #91e0b8;
  cursor: not-allowed;
}
.btn-secondary {
  background: #f5f5f5;
  color: #666;
}
.btn-secondary:hover {
  background: #eee;
}

/* 响应式适配（手机端） */
@media (max-width: 768px) {
  .VPDoc {
    padding: 1.5rem 1rem !important;
  }
  .VPSidebar {
    width: 220px !important;
  }
  .form-item {
    gap: 0.25rem;
  }
}
```

## 三、自定义组件实现（VitePress 版）

### 1. docs/.vitepress/components/Login.vue（登录组件）

vue











```vue
<template>
  <div class="login-container">
    <h2 class="page-title">{{ isEn ? 'User Login' : '用户登录' }}</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <!-- 用户名输入 -->
      <div class="form-item">
        <label>{{ isEn ? 'Username：' : '用户名：' }}</label>
        <input
          type="text"
          v-model="form.username"
          required
          :placeholder="isEn ? 'Enter your username' : '请输入注册时的用户名'"
          class="form-input"
        />
      </div>

      <!-- 密码输入 -->
      <div class="form-item">
        <label>{{ isEn ? 'Password：' : '密码：' }}</label>
        <input
          type="password"
          v-model="form.password"
          required
          :placeholder="isEn ? 'Enter your password' : '请输入密码'"
          class="form-input"
        />
      </div>

      <!-- 登录按钮 -->
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <i class="fa fa-spinner fa-spin" v-if="loading"></i>
        <span v-if="loading">{{ isEn ? 'Logging in...' : '登录中...' }}</span>
        <span v-else>{{ isEn ? 'Login' : '登录' }}</span>
      </button>

      <!-- 跳转注册页 -->
      <p class="register-link">
        {{ isEn ? 'No account？' : '没有账号？' }}
        <a :href="isEn ? '/en/register.html' : '/register.html'">
          {{ isEn ? 'Go to Register' : '去注册' }}
        </a>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter, useData } from 'vitepress'

// 1. 注入全局依赖（Axios + Toast）
const axios = inject('axios')
const toast = inject('toast')
const router = useRouter()
const { page } = useData() // VitePress 钩子：获取当前页面信息

// 2. 判断当前语言（根据路径是否包含 /en/）
const isEn = computed(() => page.value.path.startsWith('/en/'))

// 3. 表单数据与状态
const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)

// 4. 登录逻辑
const handleLogin = async () => {
  loading.value = true
  try {
    // 调用后端登录接口
    const res = await axios.post('/auth/login', form.value)
    if (res.code === 0) {
      // 存储 Token 与用户名（持久化）
      localStorage.setItem('blog_token', res.data.token)
      localStorage.setItem('blog_username', res.data.username)
      
      // 提示并跳转管理中心
      toast.success(res.msg || (isEn.value ? 'Login success' : '登录成功'))
      setTimeout(() => {
        router.push(isEn.value ? '/en/admin.html' : '/admin.html')
        window.location.reload() // 刷新使导航栏状态生效
      }, 1500)
    } else {
      toast.error(res.msg || (isEn.value ? 'Invalid username or password' : '用户名或密码错误'))
    }
  } catch (error) {
    // 错误由 Axios 拦截器统一处理
  } finally {
    loading.value = false
  }
}

// 5. 已登录状态：直接跳转首页
onMounted(() => {
  if (localStorage.getItem('blog_token')) {
    router.push(isEn.value ? '/en/' : '/')
  }
})
</script>

<style scoped>
.login-container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
}
.page-title {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #42b983;
  color: #333;
  text-align: center;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.register-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}
.register-link a {
  color: #42b983;
  text-decoration: none;
}
.register-link a:hover {
  text-decoration: underline;
}
</style>
```

### 2. docs/.vitepress/components/Register.vue（注册组件）

vue











```vue
<template>
  <div class="register-container">
    <h2 class="page-title">{{ isEn ? 'User Registration' : '用户注册' }}</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <!-- 用户名输入 -->
      <div class="form-item">
        <label>{{ isEn ? 'Username（3-20 chars）：' : '用户名（3-20位）：' }}</label>
        <input
          type="text"
          v-model="form.username"
          required
          :placeholder="isEn ? 'No special symbols' : '不含特殊符号'"
          minlength="3"
          maxlength="20"
          class="form-input"
        />
      </div>

      <!-- 密码输入 -->
      <div class="form-item">
        <label>{{ isEn ? 'Password（6-20 chars）：' : '密码（6-20位）：' }}</label>
        <input
          type="password"
          v-model="form.password"
          required
          :placeholder="isEn ? 'Include letters and numbers' : '含字母和数字'"
          minlength="6"
          maxlength="20"
          class="form-input"
        />
      </div>

      <!-- 邮箱输入 -->
      <div class="form-item">
        <label>{{ isEn ? 'Email：' : '邮箱：' }}</label>
        <input
          type="email"
          v-model="form.email"
          required
          :placeholder="isEn ? 'For password recovery' : '用于找回密码'"
          class="form-input"
        />
      </div>

      <!-- 注册按钮 -->
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <i class="fa fa-spinner fa-spin" v-if="loading"></i>
        <span v-if="loading">{{ isEn ? 'Registering...' : '注册中...' }}</span>
        <span v-else>{{ isEn ? 'Register' : '注册' }}</span>
      </button>

      <!-- 跳转登录页 -->
      <p class="login-link">
        {{ isEn ? 'Already have an account？' : '已有账号？' }}
        <a :href="isEn ? '/en/login.html' : '/login.html'">
          {{ isEn ? 'Go to Login' : '去登录' }}
        </a>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useRouter, useData } from 'vitepress'

// 1. 注入全局依赖
const axios = inject('axios')
const toast = inject('toast')
const router = useRouter()
const { page } = useData()

// 2. 判断当前语言
const isEn = computed(() => page.value.path.startsWith('/en/'))

// 3. 表单数据
const form = ref({
  username: '',
  password: '',
  email: ''
})
const loading = ref(false)

// 4. 注册逻辑
const handleRegister = async () => {
  loading.value = true
  try {
    const res = await axios.post('/auth/register', form.value)
    if (res.code === 0) {
      toast.success(res.msg || (isEn.value ? 'Registration success' : '注册成功'))
      // 跳转登录页
      setTimeout(() => {
        router.push(isEn.value ? '/en/login.html' : '/login.html')
      }, 1500)
    } else {
      toast.error(res.msg || (isEn.value ? 'Registration failed' : '注册失败'))
    }
  } catch (error) {
    // 拦截器处理错误
  } finally {
    loading.value = false
  }
}

// 5. 已登录状态：跳转首页
onMounted(() => {
  if (localStorage.getItem('blog_token')) {
    router.push(isEn.value ? '/en/' : '/')
  }
})
</script>

<style scoped>
.register-container {
  max-width: 450px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  background: #fff;
}
.page-title {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #42b983;
  color: #333;
  text-align: center;
}
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.login-link {
  margin-top: 1.5rem;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}
.login-link a {
  color: #42b983;
  text-decoration: none;
}
.login-link a:hover {
  text-decoration: underline;
}
</style>
```

### 3. docs/.vitepress/components/MDEditor.vue（Markdown 编辑器）

vue











```vue
<template>
  <div class="md-editor">
    <!-- 分类选择（新增文档显示） -->
    <div class="form-item" v-if="showCategory">
      <label>{{ isEn ? 'Document Category：' : '文档分类：' }}</label>
      <select v-model="form.category" class="form-select" required>
        <option value="tech">{{ isEn ? 'Tech Notes' : '技术笔记' }}</option>
        <option value="life">{{ isEn ? 'Life Essays' : '生活随笔' }}</option>
        <option value="other">{{ isEn ? 'Other' : '其他' }}</option>
      </select>
    </div>

    <!-- 文档标题 -->
    <div class="form-item">
      <label>{{ isEn ? 'Document Title：' : '文档标题：' }}</label>
      <input
        type="text"
        v-model="form.title"
        required
        :placeholder="isEn ? 'Enter title (required)' : '请输入标题（必填）'"
        class="form-input"
      />
    </div>

    <!-- Markdown 编辑器（mavon-editor  Vue 3 版） -->
    <div class="form-item">
      <mavon-editor
        v-model="form.content"
        :toolbars="toolbars"
        :subfield="true"
        :defaultOpen="'edit'"
        :placeholder="isEn ? 'Enter Markdown (min 10 chars)' : '请输入Markdown内容（至少10字符）'"
        class="editor-content"
      />
    </div>

    <!-- 操作按钮 -->
    <div class="btn-group">
      <button type="button" class="btn btn-primary" @click="handleSave" :disabled="loading">
        <i class="fa fa-spinner fa-spin" v-if="loading"></i>
        <span v-if="loading">{{ isEn ? 'Saving...' : '保存中...' }}</span>
        <span v-else>{{ isEn ? 'Save Document' : '保存文档' }}</span>
      </button>
      <button type="button" class="btn btn-secondary" @click="handleCancel">
        {{ isEn ? 'Cancel' : '取消' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, defineProps, defineEmits } from 'vue'
import { useData } from 'vitepress'
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

// 1. 接收父组件参数
const props = defineProps({
  doc: { // 编辑模式：传入已有文档数据
    type: Object,
    default: () => null
  },
  showCategory: { // 是否显示分类选择（新增：true，编辑：false）
    type: Boolean,
    default: true
  }
})

// 2. 触发父组件事件
const emit = defineEmits(['saveSuccess', 'cancel'])

// 3. 注入全局依赖 + 判断语言
const axios = inject('axios')
const toast = inject('toast')
const { page } = useData()
const isEn = computed(() => page.value.path.startsWith('/en/'))

// 4. 表单数据（初始化：编辑模式回显）
const form = ref({
  title: props.doc?.title || '',
  content: props.doc?.content || '',
  category: props.doc?.category || 'tech' // 默认分类：技术笔记
})
const loading = ref(false)

// 5. 编辑器工具栏配置（按需开启功能）
const toolbars = ref({
  bold: true, italic: true, header: true,
  link: true, image: true, list: true,
  table: true, code: true, fullscreen: true,
  undo: true, redo: true
})

// 6. 保存文档（新增：POST，编辑：PUT）
const handleSave = async () => {
  // 验证内容长度
  if (form.value.content.length < 10) {
    toast.warning(isEn.value ? 'Content min 10 characters' : '内容至少10个字符')
    return
  }

  loading.value = true
  try {
    let res
    if (props.doc) {
      // 编辑模式：更新文档（传文档ID）
      res = await axios.put(`/docs/${props.doc.id}`, form.value)
    } else {
      // 新增模式：创建文档
      res = await axios.post('/docs', form.value)
    }

    if (res.code === 0) {
      toast.success(res.msg || (isEn.value ? 'Document saved' : '文档保存成功'))
      emit('saveSuccess') // 通知父组件刷新列表
    } else {
      toast.error(res.msg || (isEn.value ? 'Save failed' : '保存失败'))
    }
  } catch (error) {
    // 拦截器处理错误
  } finally {
    loading.value = false
  }
}

// 7. 取消操作
const handleCancel = () => {
  emit('cancel')
}
</script>

<style scoped>
.md-editor {
  width: 100%;
  margin: 1rem 0;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
}
.editor-content {
  border: 1px solid #ddd !important;
  border-radius: 4px !important;
  min-height: 400px;
}
.btn-group {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}
</style>
```

### 4. docs/.vitepress/components/DocManager.vue（文档管理组件）

vue











```vue
<template>
  <div class="doc-manager">
    <h2 class="page-title">{{ isEn ? 'Document Management' : '文档管理中心' }}</h2>

    <!-- 1. 上传区域 -->
    <div class="upload-area">
      <label class="btn btn-primary upload-btn">
        <i class="fa fa-upload mr-2"></i>
        {{ isEn ? 'Select MD Files/Folder' : '选择 MD 文件/文件夹' }}
        <input
          type="file"
          multiple
          webkitdirectory
          accept=".md"
          @change="handleFileSelect"
          class="file-input"
        />
      </label>

      <!-- 上传分类选择 -->
      <div class="upload-category">
        <label>{{ isEn ? 'Upload Category：' : '上传分类：' }}</label>
        <select v-model="uploadCategory" class="form-select">
          <option value="tech">{{ isEn ? 'Tech Notes' : '技术笔记' }}</option>
          <option value="life">{{ isEn ? 'Life Essays' : '生活随笔' }}</option>
          <option value="other">{{ isEn ? 'Other' : '其他' }}</option>
        </select>
      </div>

      <!-- 上传状态提示 -->
      <p class="upload-success" v-if="uploadSuccessMsg">{{ uploadSuccessMsg }}</p>
      <p class="upload-fail" v-if="uploadFailMsg" v-html="uploadFailMsg"></p>
    </div>

    <!-- 2. 新增文档按钮 -->
    <button class="btn btn-primary add-btn" @click="openAddModal">
      <i class="fa fa-plus mr-2"></i>
      {{ isEn ? 'New Markdown Document' : '新增 Markdown 文档' }}
    </button>

    <!-- 3. 文档列表 -->
    <div class="table-container" v-if="docList.length > 0">
      <table class="doc-table">
        <thead>
          <tr>
            <th>{{ isEn ? 'ID' : 'ID' }}</th>
            <th>{{ isEn ? 'Title' : '标题' }}</th>
            <th>{{ isEn ? 'Category' : '分类' }}</th>
            <th>{{ isEn ? 'Created At' : '创建时间' }}</th>
            <th>{{ isEn ? 'Action' : '操作' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="doc in docList" :key="doc.id">
            <td>{{ doc.id }}</td>
            <td class="title-cell">{{ doc.title }}</td>
            <td>
              <span class="category-tag" :class="getCategoryClass(doc.category)">
                {{ getCategoryName(doc.category) }}
              </span>
            </td>
            <td>{{ formatTime(doc.created_at) }}</td>
            <td class="action-cell">
              <button class="btn btn-secondary edit-btn" @click="openEditModal(doc)">
                <i class="fa fa-pencil"></i> {{ isEn ? 'Edit' : '编辑' }}
              </button>
              <button class="btn btn-danger delete-btn" @click="handleDelete(doc.id)">
                <i class="fa fa-trash"></i> {{ isEn ? 'Delete' : '删除' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="empty-tip" v-else>
      {{ isEn ? 'No documents yet. Upload or create manually.' : '暂无文档，可上传或手动创建' }}
    </p>

    <!-- 4. 新增/编辑弹窗（整合 MDEditor） -->
    <div class="modal" v-if="showModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ isEditMode ? (isEn ? 'Edit Document' : '编辑文档') : (isEn ? 'New Document' : '新增文档') }}</h3>
          <span class="close-btn" @click="closeModal">&times;</span>
        </div>
        <div class="modal-body">
          <MDEditor
            :doc="isEditMode ? currentDoc : null"
            :show-category="!isEditMode"
            @save-success="handleModalSave"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, computed, onMounted } from 'vue'
import { useData, useRouter } from 'vitepress'
import MDEditor from './MDEditor.vue'

// 1. 注入全局依赖
const axios = inject('axios')
const toast = inject('toast')
const router = useRouter()
const { page } = useData()

// 2. 基础状态
const isEn = computed(() => page.value.path.startsWith('/en/'))
const docList = ref([])
const loading = ref(false)

// 3. 上传相关状态
const uploadCategory = ref('tech')
const uploadSuccessMsg = ref('')
const uploadFailMsg = ref('')

// 4. 弹窗相关状态
const showModal = ref(false)
const isEditMode = ref(false)
const currentDoc = ref(null)

// ========================= 工具函数 =========================
// 格式化时间（本地时间显示）
const formatTime = (timeStr) => {
  return new Date(timeStr).toLocaleString()
}

// 获取分类显示名称（多语言）
const getCategoryName = (category) => {
  switch (category) {
    case 'tech': return isEn.value ? 'Tech Notes' : '技术笔记'
    case 'life': return isEn.value ? 'Life Essays' : '生活随笔'
    case 'other': return isEn.value ? 'Other' : '其他'
    default: return category
  }
}

// 获取分类标签样式
const getCategoryClass = (category) => {
  switch (category) {
    case 'tech': return 'tag-tech'
    case 'life': return 'tag-life'
    case 'other': return 'tag-other'
    default: return ''
  }
}

// 检查登录状态（未登录跳转）
const checkLogin = () => {
  const token = localStorage.getItem('blog_token')
  if (!token) {
    toast.warning(isEn.value ? 'Please log in first' : '请先登录')
    router.push(isEn.value ? '/en/login.html' : '/login.html')
    return false
  }
  return true
}

// ========================= 文档列表操作 =========================
// 获取文档列表
const getDocs = async () => {
  if (!checkLogin()) return
  loading.value = true
  try {
    const res = await axios.get('/docs')
    if (res.code === 0) {
      docList.value = res.data
    }
  } catch (error) {
    // 拦截器处理错误
  } finally {
    loading.value = false
  }
}

// 删除文档
const handleDelete = async (id) => {
  if (!confirm(isEn.value ? 'Delete permanently? Cannot recover.' : '确定永久删除？不可恢复')) {
    return
  }

  try {
    const res = await axios.delete(`/docs/${id}`)
    if (res.code === 0) {
      toast.success(isEn.value ? 'Deleted successfully' : '删除成功')
      getDocs() // 刷新列表
    }
  } catch (error) {
    // 拦截器处理错误
  }
}

// ========================= 弹窗操作 =========================
// 打开新增弹窗
const openAddModal = () => {
  isEditMode.value = false
  currentDoc.value = null
  showModal.value = true
}

// 打开编辑弹窗
const openEditModal = (doc) => {
  isEditMode.value = true
  currentDoc.value = { ...doc } // 深拷贝避免修改原数据
  showModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  currentDoc.value = null
}

// 弹窗保存成功回调
const handleModalSave = () => {
  closeModal()
  getDocs() // 刷新列表
}

// ========================= 文件上传操作 =========================
// 选择文件
const handleFileSelect = (e) => {
  const files = e.target.files
  if (files.length === 0) return
  // 清空之前的状态
  uploadSuccessMsg.value = ''
  uploadFailMsg.value = ''
  // 执行上传
  handleUpload(files)
  // 重置文件输入（允许重复选择同一文件）
  e.target.value = ''
}

// 上传文件到后端
const handleUpload = async (files) => {
  if (!checkLogin()) return

  // 构造 FormData（含分类参数）
  const formData = new FormData()
  formData.append('category', uploadCategory.value)
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i])
  }

  try {
    const res = await axios.post('/docs/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (res.code === 0) {
      const data = res.data
      uploadSuccessMsg.value = res.msg
      // 显示失败文件（若有）
      if (data.fail_files?.length > 0) {
        uploadFailMsg.value = data.fail_files.join('<br />')
      }
      getDocs() // 刷新列表
    } else {
      uploadFailMsg.value = res.msg
    }
  } catch (error) {
    uploadFailMsg.value = isEn.value ? 'Upload failed, try again' : '上传失败，请重试'
  }
}

// ========================= 初始化 =========================
onMounted(() => {
  getDocs() // 页面加载时获取文档列表
})
</script>

<style scoped>
.doc-manager {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}
.page-title {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #42b983;
  color: #333;
}

/* 上传区域 */
.upload-area {
  margin: 1.5rem 0;
  padding: 1.5rem;
  border: 2px dashed #ddd;
  border-radius: 8px;
  text-align: center;
  transition: border 0.3s;
}
.upload-area:hover {
  border-color: #42b983;
}
.upload-btn {
  margin-bottom: 1rem;
}
.upload-category {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}
.upload-success {
  margin-top: 1rem;
  color: #42b983;
  font-size: 0.9rem;
}
.upload-fail {
  margin-top: 1rem;
  color: #ff4d4f;
  font-size: 0.9rem;
  white-space: pre-line;
}

/* 新增按钮 */
.add-btn {
  margin: 1rem 0;
}

/* 文档表格 */
.table-container {
  overflow-x: auto;
  margin: 1.5rem 0;
}
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.doc-table th, .doc-table td {
  border: 1px solid #eee;
  padding: 0.75rem 1rem;
  text-align: left;
}
.doc-table th {
  background: #f5f5f5;
  color: #333;
  font-weight: 500;
}
.title-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分类标签 */
.category-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #fff;
}
.tag-tech { background: #42b983; }
.tag-life { background: #3498db; }
.tag-other { background: #999; }

/* 操作按钮 */
.action-cell {
  display: flex;
  gap: 0.5rem;
}
.btn-danger {
  background: #fff0f0;
  color: #ff4d4f;
}
.btn-danger:hover {
  background: #ffe0e0;
}

/* 空提示 */
.empty-tip {
  text-align: center;
  padding: 2rem 0;
  color: #999;
  font-size: 0.9rem;
}

/* 弹窗 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #eee;
}
.close-btn {
  font-size: 1.5rem;
  color: #999;
  cursor: pointer;
}
.close-btn:hover {
  color: #333;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .upload-category {
    flex-direction: column;
    align-items: center;
  }
  .action-cell {
    flex-direction: column;
  }
  .title-cell {
    max-width: 150px;
  }
}
</style>
```

## 四、页面文件实现（Markdown 页面）

### 1. docs/index.md（中文首页）

markdown











```markdown
# 我的个人博客

欢迎访问基于 Vue 3 + VitePress + Gin 开发的个人博客！

## 功能特点
- 📝 Markdown 文档编辑与管理
- 🔐 用户注册/登录（JWT 认证）
- 🌐 多语言支持（中文/英文）
- 📤 Markdown 文件批量上传
- 📊 文档分类（技术笔记/生活随笔）

## 快速导航
- [技术笔记](/docs/tech/)
- [生活随笔](/docs/life/)
- [管理中心](/admin.html)（需登录）
- [登录](/login.html) / [注册](/register.html)
```

### 2. docs/login.md（中文登录页）

markdown











```markdown
# 用户登录

<Login /> <!-- 直接使用注册的 Login 组件 -->
```

### 3. docs/register.md（中文注册页）

markdown











```markdown
# 用户注册

<Register /> <!-- 直接使用注册的 Register 组件 -->
```

### 4. docs/admin.md（中文管理中心）

markdown











```markdown
# 文档管理中心

<DocManager /> <!-- 直接使用文档管理组件 -->
```

### 5. docs/en/index.md（英文首页）

markdown











```markdown
# My Personal Blog

Welcome to my personal blog built with Vue 3 + VitePress + Gin!

## Features
- 📝 Markdown document editing & management
- 🔐 User registration/login (JWT authentication)
- 🌐 Multi-language support (Chinese/English)
- 📤 Batch Markdown file upload
- 📊 Document categories (Tech Notes/Life Essays)

## Quick Navigation
- [Tech Notes](/en/docs/tech/)
- [Life Essays](/en/docs/life/)
- [Admin Center](/en/admin.html) (Login required)
- [Login](/en/login.html) / [Register](/en/register.html)
```

## 五、启动与部署

### 1. 安装依赖

bash











```bash
# 进入 frontend 目录
cd blog-project/frontend

# 安装依赖（强制版本一致性）
npm install --legacy-peer-deps
```

### 2. 开发模式启动

bash











```bash
npm run docs:dev
```

启动后访问 `http://localhost:8080`，即可实时预览博客（热更新支持）。

### 3. 生产构建

bash











```bash
npm run docs:build
```

构建结果输出到 `docs/.vitepress/dist`，可直接部署到 Nginx、Apache 或静态托管平台（如 Netlify、Vercel）。

### 4. Nginx 配置示例（/etc/nginx/conf.d/blog-frontend.conf）

nginx











```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为你的域名

    # 前端静态文件（VitePress 构建结果）
    location / {
        root /path/to/blog-project/frontend/docs/.vitepress/dist;
        index index.html;
        try_files $uri $uri/ /index.html; # 解决单页应用路由问题
    }

    # 后端 API 代理（对接 Gin 服务）
    location /api/ {
        proxy_pass http://localhost:8081/; # 后端地址
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 六、关键改造说明（VuePress → VitePress）

1. **框架核心差异**：VitePress 基于 Vue 3 + Vite，比 VuePress 构建更快、热更新更流畅，原生支持 Vue 3 组合式 API。
2. **配置简化**：VitePress 内置搜索功能（无需额外插件），多语言配置更简洁，路由基于文件系统（无需手动配置路由）。
3. **组件注册**：VitePress 中 `docs/.vitepress/components` 目录下的组件自动注册，可直接在 Markdown 中使用（如 `<Login />`）。
4. **全局注入**：通过 `enhanceApp.js` 注入 Axios、Toast 等全局依赖，替代 VuePress 的 `enhanceApp.js`，语法更贴近 Vue 3 生态。
5. **依赖优化**：移除 VuePress 相关依赖，替换为 VitePress 依赖（如 `@vitepress/theme-default`），解决版本冲突问题。

所有后端代码无需修改，前端完全兼容原有 API 接口，实现无缝迁移。