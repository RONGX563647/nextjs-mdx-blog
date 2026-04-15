# 简易 IM 系统分步构建与代码解析

下面我将把这个简易 IM 系统拆分成 6 个步骤，让你可以逐步构建，并详细讲解每个部分的关键代码和语法。

## 步骤 1：基础 HTML 结构与资源引入

首先创建基础的 HTML 框架，引入必要的外部资源。

html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简易IM系统</title>
    <!-- 引入Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- 引入Font Awesome图标库 -->
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100 font-sans min-h-screen flex flex-col">
    <!-- 主容器 -->
    <div id="app" class="flex flex-col md:flex-row flex-1 max-w-7xl w-full mx-auto overflow-hidden">
        <!-- 内容将在后续步骤添加 -->
    </div>
</body>
</html>
```

**关键说明**：

- `viewport`元标签：确保在移动设备上正确显示
- Tailwind CSS：通过 CDN 引入的实用优先 CSS 框架，用于快速构建 UI
- Font Awesome：提供各种图标（如消息图标、用户图标等）
- 基础布局类：`flex`启用弹性布局，`min-h-screen`确保页面占满全屏高度

## 步骤 2：自定义 Tailwind 配置

添加自定义颜色和工具类，扩展 Tailwind 的功能。

html

```html
<!-- 在head标签内添加 -->
<script>
    tailwind.config = {
        theme: {
            extend: {
                colors: {
                    primary: '#3B82F6',    // 主色调：蓝色
                    secondary: '#10B981',  // 辅助色：绿色
                    dark: '#1E293B',       // 深色
                    light: '#F8FAFC',      // 浅色
                    accent: '#8B5CF6'      // 强调色：紫色
                }
            }
        }
    }
</script>

<style type="text/tailwindcss">
    @layer utilities {
        /* 隐藏滚动条 */
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        
        /* 消息动画 */
        .message-in {
            animation: fadeInLeft 0.3s ease forwards;
        }
        .message-out {
            animation: fadeInRight 0.3s ease forwards;
        }
        
        /* 连接状态动画 */
        .pulse {
            animation: pulse 2s infinite;
        }
    }
</style>

<!-- 添加动画关键帧 -->
<style>
    @keyframes fadeInLeft {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes fadeInRight {
        from { opacity: 0; transform: translateX(10px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
</style>
```

**关键说明**：

- `tailwind.config`：自定义主题颜色，便于在整个项目中保持一致的设计语言
- `@layer utilities`：创建自定义工具类，扩展 Tailwind 功能
- 动画效果：为消息添加淡入动画，为连接状态添加脉冲动画，提升用户体验
- 滚动条隐藏：在聊天区域使用，使界面更简洁

## 步骤 3：实现登录 / 注册面板

创建用户认证界面，包含登录和注册两种表单。

html



预览









```html
<!-- 在#app容器内添加 -->
<!-- 登录/注册面板 -->
<div id="auth-panel" class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
    <div class="w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-[clamp(1.8rem,5vw,2.5rem)] font-bold text-dark mb-2">
                <i class="fa fa-comments text-primary mr-2"></i>即时通讯
            </h1>
            <p class="text-gray-500">简单、快速的在线聊天系统</p>
        </div>
        
        <!-- 登录表单 -->
        <div id="login-form" class="space-y-4">
            <div class="space-y-2">
                <label for="login-username" class="block text-sm font-medium text-gray-700">用户名</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa fa-user text-gray-400"></i>
                    </div>
                    <input type="text" id="login-username" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        placeholder="请输入用户名">
                </div>
            </div>
            
            <div class="space-y-2">
                <label for="login-password" class="block text-sm font-medium text-gray-700">密码</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa fa-lock text-gray-400"></i>
                    </div>
                    <input type="password" id="login-password" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        placeholder="请输入密码">
                </div>
            </div>
            
            <button id="login-btn" 
                class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
                <i class="fa fa-sign-in mr-2"></i>登录
            </button>
            
            <div class="text-center text-gray-600">
                还没有账号？ <button id="show-register" class="text-primary hover:underline font-medium">注册</button>
            </div>
        </div>
        
        <!-- 注册表单 (默认隐藏) -->
        <div id="register-form" class="space-y-4 hidden">
            <!-- 注册表单字段与登录表单类似，但多了昵称字段 -->
            <div class="space-y-2">
                <label for="reg-username" class="block text-sm font-medium text-gray-700">用户名</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa fa-user text-gray-400"></i>
                    </div>
                    <input type="text" id="reg-username" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        placeholder="请设置用户名">
                </div>
            </div>
            
            <div class="space-y-2">
                <label for="reg-nickname" class="block text-sm font-medium text-gray-700">昵称</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa fa-user-circle text-gray-400"></i>
                    </div>
                    <input type="text" id="reg-nickname" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        placeholder="请设置昵称">
                </div>
            </div>
            
            <div class="space-y-2">
                <label for="reg-password" class="block text-sm font-medium text-gray-700">密码</label>
                <div class="relative">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i class="fa fa-lock text-gray-400"></i>
                    </div>
                    <input type="password" id="reg-password" 
                        class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                        placeholder="请设置密码">
                </div>
            </div>
            
            <button id="register-btn" 
                class="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
                <i class="fa fa-user-plus mr-2"></i>注册
            </button>
            
            <div class="text-center text-gray-600">
                已有账号？ <button id="show-login" class="text-primary hover:underline font-medium">登录</button>
            </div>
        </div>
        
        <!-- 错误提示 -->
        <div id="auth-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm hidden">
            <i class="fa fa-exclamation-circle mr-1"></i>
            <span id="auth-error-message"></span>
        </div>
    </div>
</div>
```

**关键说明**：

- 响应式设计：使用`md:w-1/2`在中等屏幕以上将面板分为两半
- 表单布局：使用`space-y-4`创建表单元素间的垂直间距
- 图标位置：使用绝对定位将 Font Awesome 图标放置在输入框内左侧
- 焦点状态：`focus:ring-2 focus:ring-primary`为输入框添加聚焦效果
- 表单切换：通过`hidden`类控制登录 / 注册表单的显示与隐藏
- 错误提示：创建统一的错误提示区域，默认隐藏，有错误时显示

## 步骤 4：实现聊天面板

创建用户登录后的聊天界面，包含导航栏、用户列表和聊天区域。

html



预览









```html
<!-- 在#auth-panel后面添加 -->
<!-- 聊天面板（默认隐藏） -->
<div id="chat-panel" class="w-full md:w-full flex flex-col bg-white hidden">
    <!-- 顶部导航 -->
    <header class="bg-primary text-white p-4 shadow-md">
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <h1 class="text-xl font-bold flex items-center">
                    <i class="fa fa-comments mr-2"></i>即时通讯
                </h1>
                <span id="connection-status" class="ml-4 text-xs px-2 py-1 bg-green-500 rounded-full flex items-center">
                    <span class="w-2 h-2 bg-white rounded-full mr-1"></span>
                    在线
                </span>
            </div>
            <div class="flex items-center space-x-4">
                <span id="current-user" class="hidden md:inline-block text-sm font-medium"></span>
                <button id="logout-btn" class="text-white hover:text-gray-200 transition">
                    <i class="fa fa-sign-out"></i>
                </button>
            </div>
        </div>
    </header>
    
    <!-- 聊天区域 -->
    <div class="flex-1 flex overflow-hidden">
        <!-- 在线用户列表 -->
        <div class="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 hidden md:block overflow-hidden flex flex-col">
            <div class="p-3 border-b border-gray-200 bg-white">
                <h2 class="font-medium text-gray-700 flex items-center">
                    <i class="fa fa-users text-primary mr-2"></i>在线用户
                    <span id="online-count" class="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"></span>
                </h2>
            </div>
            <div id="user-list" class="flex-1 overflow-y-auto scrollbar-hide p-2">
                <div class="text-center text-gray-500 text-sm py-4">
                    等待连接...
                </div>
            </div>
        </div>
        
        <!-- 聊天窗口 -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- 聊天内容 -->
            <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
                <div class="text-center text-gray-500 text-sm py-8">
                    <i class="fa fa-comment-o text-3xl mb-2 block opacity-30"></i>
                    开始聊天吧！
                </div>
            </div>
            
            <!-- 消息输入框 -->
            <div class="p-4 border-t border-gray-200 bg-white">
                <div class="flex items-end space-x-2">
                    <div class="flex-1 relative">
                        <textarea id="message-input" rows="3" 
                            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 resize-none"
                            placeholder="输入消息..."></textarea>
                        <div class="absolute right-3 bottom-3 text-gray-400 text-xs">
                            <span id="char-count">0</span> 字符
                        </div>
                    </div>
                    <button id="send-btn" 
                        class="bg-primary hover:bg-primary/90 text-white p-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i class="fa fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
```

**关键说明**：

- 面板切换：聊天面板默认隐藏，登录成功后显示
- 导航栏：显示系统名称、连接状态和用户信息
- 连接状态：通过颜色变化直观展示 WebSocket 连接状态
- 用户列表：侧边栏显示在线用户，移动端默认隐藏以节省空间
- 聊天区域：使用`flex-1`占满剩余空间，`overflow-y-auto`实现滚动
- 消息输入：使用 textarea 允许多行输入，带字符计数和发送按钮

## 步骤 5：核心 JavaScript 逻辑

实现页面基础交互功能，如表单切换、字符计数等。

html



预览









```html
<!-- 在body结束前添加 -->
<script>
    // 全局变量
    let currentUser = null;
    let token = localStorage.getItem('im_token');
    let ws = null;
    let wsConnected = false;
    
    // DOM 元素
    const authPanel = document.getElementById('auth-panel');
    const chatPanel = document.getElementById('chat-panel');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authError = document.getElementById('auth-error');
    const authErrorMessage = document.getElementById('auth-error-message');
    const currentUserEl = document.getElementById('current-user');
    const chatMessages = document.getElementById('chat-messages');
    const messageInput = document.getElementById('message-input');
    const charCount = document.getElementById('char-count');
    const sendBtn = document.getElementById('send-btn');
    const userList = document.getElementById('user-list');
    const onlineCount = document.getElementById('online-count');
    const connectionStatus = document.getElementById('connection-status');
    
    // API 基础 URL
    const API_BASE = '';
    
    // 初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 检查本地存储中是否有token，有则尝试自动登录
        if (token) {
            verifyTokenAndLoadUser();
        }
        // 绑定所有事件处理函数
        bindEvents();
    });
    
    // 绑定事件处理函数
    function bindEvents() {
        // 登录/注册切换
        document.getElementById('show-register').addEventListener('click', () => {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            clearAuthError();
        });
        
        document.getElementById('show-login').addEventListener('click', () => {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            clearAuthError();
        });
        
        // 登录按钮
        document.getElementById('login-btn').addEventListener('click', login);
        
        // 注册按钮
        document.getElementById('register-btn').addEventListener('click', register);
        
        // 登出按钮
        document.getElementById('logout-btn').addEventListener('click', logout);
        
        // 发送消息按钮
        sendBtn.addEventListener('click', sendMessage);
        
        // 消息输入框事件
        messageInput.addEventListener('input', updateCharCount);
        messageInput.addEventListener('keydown', (e) => {
            // 支持Ctrl+Enter发送消息
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // 限制输入长度
        messageInput.addEventListener('beforeinput', (e) => {
            if (messageInput.value.length >= 500 && e.data) {
                e.preventDefault();
            }
        });
    }
    
    // 显示认证错误
    function showAuthError(message) {
        authErrorMessage.textContent = message;
        authError.classList.remove('hidden');
        // 3秒后自动清除错误提示
        setTimeout(clearAuthError, 3000);
    }
    
    // 清除认证错误
    function clearAuthError() {
        authError.classList.add('hidden');
        authErrorMessage.textContent = '';
    }
    
    // 更新字符计数
    function updateCharCount() {
        const count = messageInput.value.length;
        charCount.textContent = count;
        
        // 超过500字符禁用发送按钮
        if (count >= 500) {
            charCount.classList.add('text-red-500');
            sendBtn.disabled = true;
        } else {
            charCount.classList.remove('text-red-500');
            sendBtn.disabled = false;
        }
    }
</script>
```

**关键说明**：

- 全局状态管理：使用变量保存当前用户、认证 token 和 WebSocket 连接状态
- 页面初始化：DOM 加载完成后检查是否有保存的 token，自动尝试登录
- 事件绑定：集中管理所有交互事件，使代码结构更清晰
- 表单切换：通过添加 / 移除`hidden`类实现登录和注册表单的切换
- 错误处理：统一的错误提示机制，自动消失提升用户体验
- 输入控制：限制消息长度，支持快捷键发送消息，提升输入体验

## 步骤 6：实现核心功能模块

添加认证、WebSocket 连接、消息处理等核心功能。

html



预览









```html
<!-- 继续添加JavaScript代码 -->
<script>
    // 登录功能
    async function login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();
        
        if (!username || !password) {
            return showAuthError('用户名和密码不能为空');
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '登录失败');
            }
            
            // 保存token并加载用户信息
            token = data.token;
            localStorage.setItem('im_token', token);
            loadUserInfo(data.user);
            
        } catch (error) {
            showAuthError(error.message);
        }
    }
    
    // 注册功能
    async function register() {
        const username = document.getElementById('reg-username').value.trim();
        const nickname = document.getElementById('reg-nickname').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        
        if (!username || !nickname || !password) {
            return showAuthError('所有字段都不能为空');
        }
        
        if (password.length < 6) {
            return showAuthError('密码长度不能少于6位');
        }
        
        try {
            const response = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, nickname, password }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || '注册失败');
            }
            
            showAuthError('注册成功，请登录');
            document.getElementById('show-login').click();
            document.getElementById('login-username').value = username;
            
        } catch (error) {
            showAuthError(error.message);
        }
    }
    
    // 验证令牌并加载用户信息
    async function verifyTokenAndLoadUser() {
        try {
            const response = await fetch(`${API_BASE}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) {
                throw new Error('令牌无效');
            }
            
            const data = await response.json();
            loadUserInfo(data.user);
            
        } catch (error) {
            localStorage.removeItem('im_token');
            token = null;
        }
    }
    
    // 加载用户信息并进入聊天界面
    function loadUserInfo(user) {
        currentUser = user;
        currentUserEl.textContent = `欢迎，${user.nickname}`;
        
        // 切换到聊天面板
        authPanel.classList.add('hidden');
        chatPanel.classList.remove('hidden');
        
        // 连接WebSocket并加载数据
        connectWebSocket();
        loadOnlineUsers();
        loadHistoryMessages();
    }
    
    // 登出功能
    function logout() {
        if (ws) ws.close();
        localStorage.removeItem('im_token');
        token = null;
        currentUser = null;
        
        // 切换回登录面板
        chatPanel.classList.add('hidden');
        authPanel.classList.remove('hidden');
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
    }
    
    // 连接WebSocket
    function connectWebSocket() {
        if (ws) ws.close();
        
        updateConnectionStatus('连接中...', 'yellow-500');
        
        // 根据当前协议选择ws或wss
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsURL = `${protocol}//${window.location.host}/api/ws?token=${token}`;
        
        ws = new WebSocket(wsURL);
        
        ws.onopen = () => {
            wsConnected = true;
            updateConnectionStatus('在线', 'green-500');
        };
        
        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };
        
        ws.onclose = () => {
            wsConnected = false;
            updateConnectionStatus('已断开', 'red-500');
            
            // 5秒后尝试重连
            setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
            updateConnectionStatus('错误', 'red-500');
        };
    }
    
    // 更新连接状态
    function updateConnectionStatus(text, colorClass) {
        connectionStatus.innerHTML = `
            <span class="w-2 h-2 bg-white rounded-full mr-1 ${text === '连接中...' ? 'pulse' : ''}"></span>
            ${text}
        `;
        connectionStatus.className = `ml-4 text-xs px-2 py-1 ${colorClass} rounded-full flex items-center`;
    }
    
    // 处理WebSocket消息
    function handleWebSocketMessage(message) {
        if (message.type === 1) {
            // 系统消息（用户上线/下线）
            addSystemMessage(message);
            loadOnlineUsers();
            return;
        }
        
        // 普通聊天消息
        addChatMessage(message);
    }
    
    // 添加系统消息
    function addSystemMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'text-center text-gray-500 text-sm py-1';
        messageEl.innerHTML = `<span>${message.sender_name} ${message.content}</span>`;
        
        chatMessages.appendChild(messageEl);
        scrollToBottom();
    }
    
    // 添加聊天消息
    function addChatMessage(message) {
        const isCurrentUser = message.sender_id === currentUser.id;
        const messageClass = isCurrentUser ? 'message-out' : 'message-in';
        const alignmentClass = isCurrentUser ? 'ml-auto' : 'mr-auto';
        const bgColorClass = isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-800';
        
        // 格式化时间
        const date = new Date(message.timestamp * 1000);
        const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        
        const messageEl = document.createElement('div');
        messageEl.className = `flex ${messageClass}`;
        messageEl.innerHTML = `
            <div class="max-w-[80%] ${alignmentClass}">
                <div class="flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}">
                    <span class="text-xs text-gray-500">${isCurrentUser ? '我' : message.sender_name}</span>
                    <span class="text-xs text-gray-400 ml-2">${timeStr}</span>
                </div>
                <div class="${bgColorClass} p-3 rounded-lg shadow-sm">
                    <p>${escapeHtml(message.content)}</p>
                </div>
            </div>
        `;
        
        chatMessages.appendChild(messageEl);
        scrollToBottom();
    }
    
    // 发送消息
    function sendMessage() {
        const content = messageInput.value.trim();
        if (!content || !wsConnected) return;
        
        // 获取选中的聊天对象
        const selectedUserEl = document.querySelector('#user-list .bg-primary/10');
        const receiverId = selectedUserEl ? parseInt(selectedUserEl.dataset.userId) : 0;
        
        const message = {
            type: 0,
            content: content,
            receiver_id: receiverId
        };
        
        // 通过WebSocket发送消息
        ws.send(JSON.stringify(message));
        messageInput.value = '';
        updateCharCount();
    }
    
    // 加载在线用户
    async function loadOnlineUsers() {
        try {
            const response = await fetch(`${API_BASE}/api/online`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) throw new Error('加载在线用户失败');
            
            const data = await response.json();
            renderUserList(data.users);
            onlineCount.textContent = data.users.length;
            
        } catch (error) {
            console.error('加载在线用户错误:', error);
            setTimeout(loadOnlineUsers, 5000);
        }
    }
    
    // 渲染用户列表
    function renderUserList(users) {
        userList.innerHTML = '';
        
        if (users.length === 0) {
            userList.innerHTML = `<div class="text-center text-gray-500 text-sm py-4">暂无在线用户</div>`;
            return;
        }
        
        // 排序：当前用户排在最后
        users.sort((a, b) => {
            if (a.id === currentUser.id) return 1;
            if (b.id === currentUser.id) return -1;
            return a.id - b.id;
        });
        
        users.forEach(user => {
            const userEl = document.createElement('div');
            const isCurrentUser = user.id === currentUser.id;
            const isSelected = users.length === 1;
            
            userEl.className = `flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition ${
                isCurrentUser ? 'opacity-70' : ''
            } ${!isCurrentUser && isSelected ? 'bg-primary/10' : ''}`;
            
            userEl.dataset.userId = user.id;
            
            // 非当前用户可点击选择聊天对象
            if (!isCurrentUser) {
                userEl.addEventListener('click', () => {
                    document.querySelectorAll('#user-list > div').forEach(el => {
                        el.classList.remove('bg-primary/10');
                    });
                    userEl.classList.add('bg-primary/10');
                    loadHistoryMessages(user.id);
                });
            }
            
            userEl.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                    <i class="fa fa-user"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">${user.nickname}</p>
                    ${isCurrentUser ? '<p class="text-xs text-gray-500">你自己</p>' : ''}
                </div>
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
            `;
            
            userList.appendChild(userEl);
        });
    }
    
    // 加载历史消息
    async function loadHistoryMessages(otherUserId = 0) {
        try {
            chatMessages.innerHTML = `<div class="text-center text-gray-500 text-sm py-2">加载历史消息中...</div>`;
            
            const url = otherUserId 
                ? `${API_BASE}/api/messages?other_id=${otherUserId}&limit=50&offset=0`
                : `${API_BASE}/api/messages?limit=50&offset=0`;
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            
            if (!response.ok) throw new Error('加载历史消息失败');
            
            const data = await response.json();
            chatMessages.innerHTML = '';
            
            if (data.messages.length === 0) {
                chatMessages.innerHTML = `
                    <div class="text-center text-gray-500 text-sm py-8">
                        <i class="fa fa-comment-o text-3xl mb-2 block opacity-30"></i>
                        暂无消息
                    </div>
                `;
                return;
            }
            
            data.messages.forEach(message => addChatMessage(message));
            
        } catch (error) {
            console.error('加载历史消息错误:', error);
            chatMessages.innerHTML = `
                <div class="text-center text-red-500 text-sm py-4">
                    <i class="fa fa-exclamation-circle mr-1"></i>
                    加载消息失败，请重试
                </div>
            `;
        }
    }
    
    // 滚动到最新消息
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // HTML转义，防止XSS攻击
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
</script>
```

**关键说明**：

- 认证系统：实现登录、注册、令牌验证功能，使用 localStorage 保存令牌
- WebSocket 通信：处理实时消息传输，包含自动重连机制
- 消息处理：区分系统消息和聊天消息，应用不同的样式和处理逻辑
- 在线用户管理：加载并渲染在线用户列表，支持选择聊天对象
- 历史消息：加载和显示聊天历史记录
- XSS 防护：对用户输入的消息内容进行 HTML 转义，确保安全
- 响应式设计：适配不同屏幕尺寸，移动端隐藏用户列表节省空间

通过这 6 个步骤，你可以逐步构建一个功能完整的简易 IM 系统，每个步骤都专注于特定的功能模块，便于理解和维护。这个系统包含用户认证、实时通讯、消息历史等核心功能，使用现代前端技术实现了良好的用户体验。

# 完整代码

```
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简易IM系统</title>
    <!-- 引入Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- 引入Font Awesome -->
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    
    <!-- 自定义配置 -->
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3B82F6',
                        secondary: '#10B981',
                        dark: '#1E293B',
                        light: '#F8FAFC',
                        accent: '#8B5CF6'
                    }
                }
            }
        }
    </script>
    
    <style type="text/tailwindcss">
        @layer utilities {
            .scrollbar-hide {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
                display: none;
            }
            .message-in {
                animation: fadeInLeft 0.3s ease forwards;
            }
            .message-out {
                animation: fadeInRight 0.3s ease forwards;
            }
            @keyframes fadeInLeft {
                from { opacity: 0; transform: translateX(-10px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeInRight {
                from { opacity: 0; transform: translateX(10px); }
                to { opacity: 1; transform: translateX(0); }
            }
            .pulse {
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
        }
    </style>
</head>
<body class="bg-gray-100 font-sans min-h-screen flex flex-col">
    <!-- 主容器 -->
    <div id="app" class="flex flex-col md:flex-row flex-1 max-w-7xl w-full mx-auto overflow-hidden">
        <!-- 登录/注册面板 -->
        <div id="auth-panel" class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
            <div class="w-full max-w-md">
                <div class="text-center mb-8">
                    <h1 class="text-[clamp(1.8rem,5vw,2.5rem)] font-bold text-dark mb-2">
                        <i class="fa fa-comments text-primary mr-2"></i>即时通讯
                    </h1>
                    <p class="text-gray-500">简单、快速的在线聊天系统</p>
                </div>
                
                <!-- 登录表单 -->
                <div id="login-form" class="space-y-4">
                    <div class="space-y-2">
                        <label for="login-username" class="block text-sm font-medium text-gray-700">用户名</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa fa-user text-gray-400"></i>
                            </div>
                            <input type="text" id="login-username" 
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                                placeholder="请输入用户名">
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <label for="login-password" class="block text-sm font-medium text-gray-700">密码</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa fa-lock text-gray-400"></i>
                            </div>
                            <input type="password" id="login-password" 
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                                placeholder="请输入密码">
                        </div>
                    </div>
                    
                    <button id="login-btn" 
                        class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
                        <i class="fa fa-sign-in mr-2"></i>登录
                    </button>
                    
                    <div class="text-center text-gray-600">
                        还没有账号？ <button id="show-register" class="text-primary hover:underline font-medium">注册</button>
                    </div>
                </div>
                
                <!-- 注册表单 -->
                <div id="register-form" class="space-y-4 hidden">
                    <div class="space-y-2">
                        <label for="reg-username" class="block text-sm font-medium text-gray-700">用户名</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa fa-user text-gray-400"></i>
                            </div>
                            <input type="text" id="reg-username" 
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                                placeholder="请设置用户名">
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <label for="reg-nickname" class="block text-sm font-medium text-gray-700">昵称</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa fa-user-circle text-gray-400"></i>
                            </div>
                            <input type="text" id="reg-nickname" 
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                                placeholder="请设置昵称">
                        </div>
                    </div>
                    
                    <div class="space-y-2">
                        <label for="reg-password" class="block text-sm font-medium text-gray-700">密码</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i class="fa fa-lock text-gray-400"></i>
                            </div>
                            <input type="password" id="reg-password" 
                                class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                                placeholder="请设置密码">
                        </div>
                    </div>
                    
                    <button id="register-btn" 
                        class="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
                        <i class="fa fa-user-plus mr-2"></i>注册
                    </button>
                    
                    <div class="text-center text-gray-600">
                        已有账号？ <button id="show-login" class="text-primary hover:underline font-medium">登录</button>
                    </div>
                </div>
                
                <!-- 错误提示 -->
                <div id="auth-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm hidden">
                    <i class="fa fa-exclamation-circle mr-1"></i>
                    <span id="auth-error-message"></span>
                </div>
            </div>
        </div>
        
        <!-- 聊天面板（默认隐藏） -->
        <div id="chat-panel" class="w-full md:w-full flex flex-col bg-white hidden">
            <!-- 顶部导航 -->
            <header class="bg-primary text-white p-4 shadow-md">
                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold flex items-center">
                            <i class="fa fa-comments mr-2"></i>即时通讯
                        </h1>
                        <span id="connection-status" class="ml-4 text-xs px-2 py-1 bg-green-500 rounded-full flex items-center">
                            <span class="w-2 h-2 bg-white rounded-full mr-1"></span>
                            在线
                        </span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span id="current-user" class="hidden md:inline-block text-sm font-medium"></span>
                        <button id="logout-btn" class="text-white hover:text-gray-200 transition">
                            <i class="fa fa-sign-out"></i>
                        </button>
                    </div>
                </div>
            </header>
            
            <!-- 聊天区域 -->
            <div class="flex-1 flex overflow-hidden">
                <!-- 在线用户列表 -->
                <div class="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 hidden md:block overflow-hidden flex flex-col">
                    <div class="p-3 border-b border-gray-200 bg-white">
                        <h2 class="font-medium text-gray-700 flex items-center">
                            <i class="fa fa-users text-primary mr-2"></i>在线用户
                            <span id="online-count" class="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"></span>
                        </h2>
                    </div>
                    <div id="user-list" class="flex-1 overflow-y-auto scrollbar-hide p-2">
                        <div class="text-center text-gray-500 text-sm py-4">
                            等待连接...
                        </div>
                    </div>
                </div>
                
                <!-- 聊天窗口 -->
                <div class="flex-1 flex flex-col overflow-hidden">
                    <!-- 聊天内容 -->
                    <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
                        <div class="text-center text-gray-500 text-sm py-8">
                            <i class="fa fa-comment-o text-3xl mb-2 block opacity-30"></i>
                            开始聊天吧！
                        </div>
                    </div>
                    
                    <!-- 消息输入框 -->
                    <div class="p-4 border-t border-gray-200 bg-white">
                        <div class="flex items-end space-x-2">
                            <div class="flex-1 relative">
                                <textarea id="message-input" rows="3" 
                                    class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 resize-none"
                                    placeholder="输入消息..."></textarea>
                                <div class="absolute right-3 bottom-3 text-gray-400 text-xs">
                                    <span id="char-count">0</span> 字符
                                </div>
                            </div>
                            <button id="send-btn" 
                                class="bg-primary hover:bg-primary/90 text-white p-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i class="fa fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // 全局变量
        let currentUser = null;
        let token = localStorage.getItem('im_token');
        let ws = null;
        let wsConnected = false;
        
        // DOM 元素
        const authPanel = document.getElementById('auth-panel');
        const chatPanel = document.getElementById('chat-panel');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const authError = document.getElementById('auth-error');
        const authErrorMessage = document.getElementById('auth-error-message');
        const currentUserEl = document.getElementById('current-user');
        const chatMessages = document.getElementById('chat-messages');
        const messageInput = document.getElementById('message-input');
        const charCount = document.getElementById('char-count');
        const sendBtn = document.getElementById('send-btn');
        const userList = document.getElementById('user-list');
        const onlineCount = document.getElementById('online-count');
        const connectionStatus = document.getElementById('connection-status');
        
        // API 基础 URL
        const API_BASE = '';
        
        // 初始化
        document.addEventListener('DOMContentLoaded', () => {
            if (token) {
                verifyTokenAndLoadUser();
            }
            bindEvents();
        });
        
        // 绑定事件处理函数
        function bindEvents() {
            // 登录/注册切换
            document.getElementById('show-register').addEventListener('click', () => {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                clearAuthError();
            });
            
            document.getElementById('show-login').addEventListener('click', () => {
                registerForm.classList.add('hidden');
                loginForm.classList.remove('hidden');
                clearAuthError();
            });
            
            // 登录按钮
            document.getElementById('login-btn').addEventListener('click', login);
            
            // 注册按钮
            document.getElementById('register-btn').addEventListener('click', register);
            
            // 登出按钮
            document.getElementById('logout-btn').addEventListener('click', logout);
            
            // 发送消息按钮
            sendBtn.addEventListener('click', sendMessage);
            
            // 消息输入框事件
            messageInput.addEventListener('input', updateCharCount);
            messageInput.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    sendMessage();
                }
            });
            
            // 限制输入长度
            messageInput.addEventListener('beforeinput', (e) => {
                if (messageInput.value.length >= 500 && e.data) {
                    e.preventDefault();
                }
            });
        }
        
        // 显示认证错误
        function showAuthError(message) {
            authErrorMessage.textContent = message;
            authError.classList.remove('hidden');
            setTimeout(clearAuthError, 3000);
        }
        
        // 清除认证错误
        function clearAuthError() {
            authError.classList.add('hidden');
            authErrorMessage.textContent = '';
        }
        
        // 更新字符计数
        function updateCharCount() {
            const count = messageInput.value.length;
            charCount.textContent = count;
            
            if (count >= 500) {
                charCount.classList.add('text-red-500');
                sendBtn.disabled = true;
            } else {
                charCount.classList.remove('text-red-500');
                sendBtn.disabled = false;
            }
        }
        
        // 登录
        async function login() {
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            
            if (!username || !password) {
                return showAuthError('用户名和密码不能为空');
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || '登录失败');
                }
                
                token = data.token;
                localStorage.setItem('im_token', token);
                loadUserInfo(data.user);
                
            } catch (error) {
                showAuthError(error.message);
            }
        }
        
        // 注册
        async function register() {
            const username = document.getElementById('reg-username').value.trim();
            const nickname = document.getElementById('reg-nickname').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            
            if (!username || !nickname || !password) {
                return showAuthError('所有字段都不能为空');
            }
            
            if (password.length < 6) {
                return showAuthError('密码长度不能少于6位');
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, nickname, password }),
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || '注册失败');
                }
                
                showAuthError('注册成功，请登录');
                document.getElementById('show-login').click();
                document.getElementById('login-username').value = username;
                
            } catch (error) {
                showAuthError(error.message);
            }
        }
        
        // 验证令牌并加载用户信息
        async function verifyTokenAndLoadUser() {
            try {
                const response = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                
                if (!response.ok) {
                    throw new Error('令牌无效');
                }
                
                const data = await response.json();
                loadUserInfo(data.user);
                
            } catch (error) {
                localStorage.removeItem('im_token');
                token = null;
            }
        }
        
        // 加载用户信息并进入聊天界面
        function loadUserInfo(user) {
            currentUser = user;
            currentUserEl.textContent = `欢迎，${user.nickname}`;
            
            authPanel.classList.add('hidden');
            chatPanel.classList.remove('hidden');
            
            connectWebSocket();
            loadOnlineUsers();
            loadHistoryMessages();
        }
        
        // 登出
        function logout() {
            if (ws) ws.close();
            localStorage.removeItem('im_token');
            token = null;
            currentUser = null;
            
            chatPanel.classList.add('hidden');
            authPanel.classList.remove('hidden');
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
        }
        
        // 连接WebSocket
        function connectWebSocket() {
            if (ws) ws.close();
            
            updateConnectionStatus('连接中...', 'yellow-500');
            
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsURL = `${protocol}//${window.location.host}/api/ws?token=${token}`;
            
            ws = new WebSocket(wsURL);
            
            ws.onopen = () => {
                wsConnected = true;
                updateConnectionStatus('在线', 'green-500');
            };
            
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };
            
            ws.onclose = () => {
                wsConnected = false;
                updateConnectionStatus('已断开', 'red-500');
                
                setTimeout(connectWebSocket, 5000);
            };
            
            ws.onerror = (error) => {
                console.error('WebSocket错误:', error);
                updateConnectionStatus('错误', 'red-500');
            };
        }
        
        // 更新连接状态
        function updateConnectionStatus(text, colorClass) {
            connectionStatus.innerHTML = `
                <span class="w-2 h-2 bg-white rounded-full mr-1 ${text === '连接中...' ? 'pulse' : ''}"></span>
                ${text}
            `;
            connectionStatus.className = `ml-4 text-xs px-2 py-1 ${colorClass} rounded-full flex items-center`;
        }
        
        // 处理WebSocket消息
        function handleWebSocketMessage(message) {
            if (message.type === 1) {
                addSystemMessage(message);
                loadOnlineUsers();
                return;
            }
            
            addChatMessage(message);
        }
        
        // 添加系统消息
        function addSystemMessage(message) {
            const messageEl = document.createElement('div');
            messageEl.className = 'text-center text-gray-500 text-sm py-1';
            messageEl.innerHTML = `<span>${message.sender_name} ${message.content}</span>`;
            
            chatMessages.appendChild(messageEl);
            scrollToBottom();
        }
        
        // 添加聊天消息
        function addChatMessage(message) {
            const isCurrentUser = message.sender_id === currentUser.id;
            const messageClass = isCurrentUser ? 'message-out' : 'message-in';
            const alignmentClass = isCurrentUser ? 'ml-auto' : 'mr-auto';
            const bgColorClass = isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-800';
            
            const date = new Date(message.timestamp * 1000);
            const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            const messageEl = document.createElement('div');
            messageEl.className = `flex ${messageClass}`;
            messageEl.innerHTML = `
                <div class="max-w-[80%] ${alignmentClass}">
                    <div class="flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}">
                        <span class="text-xs text-gray-500">${isCurrentUser ? '我' : message.sender_name}</span>
                        <span class="text-xs text-gray-400 ml-2">${timeStr}</span>
                    </div>
                    <div class="${bgColorClass} p-3 rounded-lg shadow-sm">
                        <p>${escapeHtml(message.content)}</p>
                    </div>
                </div>
            `;
            
            chatMessages.appendChild(messageEl);
            scrollToBottom();
        }
        
        // 发送消息
        function sendMessage() {
            const content = messageInput.value.trim();
            if (!content || !wsConnected) return;
            
            const selectedUserEl = document.querySelector('#user-list .bg-primary/10');
            const receiverId = selectedUserEl ? parseInt(selectedUserEl.dataset.userId) : 0;
            
            const message = {
                type: 0,
                content: content,
                receiver_id: receiverId
            };
            
            ws.send(JSON.stringify(message));
            messageInput.value = '';
            updateCharCount();
        }
        
        // 加载在线用户
        async function loadOnlineUsers() {
            try {
                const response = await fetch(`${API_BASE}/api/online`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                
                if (!response.ok) throw new Error('加载在线用户失败');
                
                const data = await response.json();
                renderUserList(data.users);
                onlineCount.textContent = data.users.length;
                
            } catch (error) {
                console.error('加载在线用户错误:', error);
                setTimeout(loadOnlineUsers, 5000);
            }
        }
        
        // 渲染用户列表
        function renderUserList(users) {
            userList.innerHTML = '';
            
            if (users.length === 0) {
                userList.innerHTML = `<div class="text-center text-gray-500 text-sm py-4">暂无在线用户</div>`;
                return;
            }
            
            users.sort((a, b) => {
                if (a.id === currentUser.id) return 1;
                if (b.id === currentUser.id) return -1;
                return a.id - b.id;
            });
            
            users.forEach(user => {
                const userEl = document.createElement('div');
                const isCurrentUser = user.id === currentUser.id;
                const isSelected = users.length === 1;
                
                userEl.className = `flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition ${
                    isCurrentUser ? 'opacity-70' : ''
                } ${!isCurrentUser && isSelected ? 'bg-primary/10' : ''}`;
                
                userEl.dataset.userId = user.id;
                
                if (!isCurrentUser) {
                    userEl.addEventListener('click', () => {
                        document.querySelectorAll('#user-list > div').forEach(el => {
                            el.classList.remove('bg-primary/10');
                        });
                        userEl.classList.add('bg-primary/10');
                        loadHistoryMessages(user.id);
                    });
                }
                
                userEl.innerHTML = `
                    <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                        <i class="fa fa-user"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-800 truncate">${user.nickname}</p>
                        ${isCurrentUser ? '<p class="text-xs text-gray-500">你自己</p>' : ''}
                    </div>
                    <div class="w-2 h-2 rounded-full bg-green-500"></div>
                `;
                
                userList.appendChild(userEl);
            });
        }
        
        // 加载历史消息
        async function loadHistoryMessages(otherUserId = 0) {
            try {
                chatMessages.innerHTML = `<div class="text-center text-gray-500 text-sm py-2">加载历史消息中...</div>`;
                
                const url = otherUserId 
                    ? `${API_BASE}/api/messages?other_id=${otherUserId}&limit=50&offset=0`
                    : `${API_BASE}/api/messages?limit=50&offset=0`;
                
                const response = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                
                if (!response.ok) throw new Error('加载历史消息失败');
                
                const data = await response.json();
                chatMessages.innerHTML = '';
                
                if (data.messages.length === 0) {
                    chatMessages.innerHTML = `
                        <div class="text-center text-gray-500 text-sm py-8">
                            <i class="fa fa-comment-o text-3xl mb-2 block opacity-30"></i>
                            暂无消息
                        </div>
                    `;
                    return;
                }
                
                data.messages.forEach(message => addChatMessage(message));
                
            } catch (error) {
                console.error('加载历史消息错误:', error);
                chatMessages.innerHTML = `
                    <div class="text-center text-red-500 text-sm py-4">
                        <i class="fa fa-exclamation-circle mr-1"></i>
                        加载消息失败，请重试
                    </div>
                `;
            }
        }
        
        // 滚动到最底部
        function scrollToBottom() {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // HTML转义
        function escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
    </script>
</body>
</html>

```

# 拆分

以下是按照功能拆分后的多个代码文件，每个文件专注于特定功能模块，便于维护和扩展：

### 1. 入口文件（index.html）

负责基础 HTML 结构和资源引入，整合各模块

html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>简易IM系统</title>
    <!-- 外部资源 -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
    
    <!-- 自定义样式与配置 -->
    <link rel="stylesheet" href="styles.css">
    <script src="tailwind-config.js"></script>
</head>
<body class="bg-gray-100 font-sans min-h-screen flex flex-col">
    <!-- 主容器 -->
    <div id="app" class="flex flex-col md:flex-row flex-1 max-w-7xl w-full mx-auto overflow-hidden">
        <!-- 认证面板（登录/注册） -->
        <div id="auth-panel" class="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white">
            <!-- 认证表单内容由auth-ui.html引入 -->
            <div id="auth-form-container"></div>
        </div>
        
        <!-- 聊天面板（默认隐藏） -->
        <div id="chat-panel" class="w-full md:w-full flex flex-col bg-white hidden">
            <!-- 聊天界面内容由chat-ui.html引入 -->
        </div>
    </div>

    <!-- 模块脚本（按依赖顺序引入） -->
    <script src="utils.js"></script>
    <script src="auth-module.js"></script>
    <script src="websocket-module.js"></script>
    <script src="chat-module.js"></script>
    <script src="init.js"></script>
</body>
</html>
```

### 2. 样式配置（styles.css）

包含自定义工具类和动画效果

css











```css
/* 自定义工具类 */
@layer utilities {
    .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
    .message-in {
        animation: fadeInLeft 0.3s ease forwards;
    }
    .message-out {
        animation: fadeInRight 0.3s ease forwards;
    }
    .pulse {
        animation: pulse 2s infinite;
    }
}

/* 动画关键帧 */
@keyframes fadeInLeft {
    from { opacity: 0; transform: translateX(-10px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
    from { opacity: 0; transform: translateX(10px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
```

### 3. Tailwind 配置（tailwind-config.js）

自定义颜色主题

javascript



运行









```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                primary: '#ff464c',    // 主色调（红色）
                secondary: '#10B981',  // 辅助色（绿色）
                dark: '#1E293B',
                light: '#F8FAFC',
                accent: '#8B5CF6'
            }
        }
    }
}
```

### 4. 认证界面（auth-ui.html）

登录 / 注册表单的 HTML 结构（通过 JS 动态加载）

html

```html
<div class="w-full max-w-md">
    <div class="text-center mb-8">
        <h1 class="text-[clamp(1.8rem,5vw,2.5rem)] font-bold text-dark mb-2">
            <i class="fa fa-comments text-primary mr-2"></i>即时通讯
        </h1>
        <p class="text-gray-500">简单、快速的在线聊天系统</p>
    </div>
    
    <!-- 登录表单 -->
    <div id="login-form" class="space-y-4">
        <div class="space-y-2">
            <label for="login-username" class="block text-sm font-medium text-gray-700">用户名</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fa fa-user text-gray-400"></i>
                </div>
                <input type="text" id="login-username"
                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                       placeholder="请输入用户名">
            </div>
        </div>
        
        <div class="space-y-2">
            <label for="login-password" class="block text-sm font-medium text-gray-700">密码</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fa fa-lock text-gray-400"></i>
                </div>
                <input type="password" id="login-password"
                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                       placeholder="请输入密码">
            </div>
        </div>
        
        <button id="login-btn"
                class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
            <i class="fa fa-sign-in mr-2"></i>登录
        </button>
        
        <div class="text-center text-gray-600">
            还没有账号？ <button id="show-register" class="text-primary hover:underline font-medium">注册</button>
        </div>
    </div>
    
    <!-- 注册表单 -->
    <div id="register-form" class="space-y-4 hidden">
        <div class="space-y-2">
            <label for="reg-username" class="block text-sm font-medium text-gray-700">用户名</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fa fa-user text-gray-400"></i>
                </div>
                <input type="text" id="reg-username"
                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                       placeholder="请设置用户名">
            </div>
        </div>
        
        <div class="space-y-2">
            <label for="reg-nickname" class="block text-sm font-medium text-gray-700">昵称</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fa fa-user-circle text-gray-400"></i>
                </div>
                <input type="text" id="reg-nickname"
                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                       placeholder="请设置昵称">
            </div>
        </div>
        
        <div class="space-y-2">
            <label for="reg-password" class="block text-sm font-medium text-gray-700">密码</label>
            <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fa fa-lock text-gray-400"></i>
                </div>
                <input type="password" id="reg-password"
                       class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200"
                       placeholder="请设置密码">
            </div>
        </div>
        
        <button id="register-btn"
                class="w-full bg-secondary hover:bg-secondary/90 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center">
            <i class="fa fa-user-plus mr-2"></i>注册
        </button>
        
        <div class="text-center text-gray-600">
            已有账号？ <button id="show-login" class="text-primary hover:underline font-medium">登录</button>
        </div>
    </div>
    
    <!-- 错误提示 -->
    <div id="auth-error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm hidden">
        <i class="fa fa-exclamation-circle mr-1"></i>
        <span id="auth-error-message"></span>
    </div>
</div>
```

### 5. 聊天界面（chat-ui.html）

聊天面板的 HTML 结构（通过 JS 动态加载）

html



预览









```html
<!-- 顶部导航 -->
<header class="bg-primary text-white p-4 shadow-md">
    <div class="flex items-center justify-between">
        <div class="flex items-center">
            <h1 class="text-xl font-bold flex items-center">
                <i class="fa fa-comments mr-2"></i>即时通讯
            </h1>
            <span id="connection-status" class="ml-4 text-xs px-2 py-1 bg-green-500 rounded-full flex items-center">
                <span class="w-2 h-2 bg-white rounded-full mr-1"></span>
                在线
            </span>
        </div>
        <div class="flex items-center space-x-4">
            <span id="current-user" class="hidden md:inline-block text-sm font-medium"></span>
            <button id="logout-btn" class="text-white hover:text-gray-200 transition">
                <i class="fa fa-sign-out"></i>
            </button>
        </div>
    </div>
</header>

<!-- 聊天区域 -->
<div class="flex-1 flex overflow-hidden">
    <!-- 在线用户列表 -->
    <div class="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0 hidden md:block overflow-hidden flex flex-col">
        <div class="p-3 border-b border-gray-200 bg-white">
            <h2 class="font-medium text-gray-700 flex items-center">
                <i class="fa fa-users text-primary mr-2"></i>在线用户
                <span id="online-count" class="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full"></span>
            </h2>
        </div>
        <div id="user-list" class="flex-1 overflow-y-auto scrollbar-hide p-2">
            <div class="text-center text-gray-500 text-sm py-4">
                等待连接...
            </div>
        </div>
    </div>

    <!-- 聊天窗口 -->
    <div class="flex-1 flex flex-col overflow-hidden">
        <!-- 聊天内容 -->
        <div id="chat-messages" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
            <div class="text-center text-gray-500 text-sm py-8">
                <i class="fa fa-comment-o text-3xl mb-2 block opacity-30"></i>
                开始聊天吧！
            </div>
        </div>

        <!-- 消息输入框 -->
        <div class="p-4 border-t border-gray-200 bg-white">
            <div class="flex items-end space-x-2">
                <div class="flex-1 relative">
                    <textarea id="message-input" rows="3"
                              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition duration-200 resize-none"
                              placeholder="输入消息..."></textarea>
                    <div class="absolute right-3 bottom-3 text-gray-400 text-xs">
                        <span id="char-count">0</span> 字符
                    </div>
                </div>
                <button id="send-btn"
                        class="bg-primary hover:bg-primary/90 text-white p-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    <i class="fa fa-paper-plane"></i>
                </button>
            </div>
        </div>
    </div>
</div>
```

### 6. 工具函数（utils.js）

通用工具函数，被其他模块调用

javascript



运行









```javascript
/**
 * HTML转义，防止XSS攻击
 * @param {string} unsafe - 未转义的字符串
 * @returns {string} 转义后的安全字符串
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * 滚动到聊天区域底部
 */
function scrollToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

/**
 * 动态加载HTML片段到指定容器
 * @param {string} url - HTML文件路径
 * @param {HTMLElement} container - 目标容器
 */
async function loadHtml(url, container) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('加载HTML失败');
        container.innerHTML = await response.text();
    } catch (error) {
        console.error('HTML加载错误:', error);
        container.innerHTML = '<div class="text-red-500">加载失败</div>';
    }
}
```

### 7. 认证模块（auth-module.js）

处理登录、注册、令牌验证等认证相关功能

javascript



运行









```javascript
// 全局认证状态
let token = localStorage.getItem('im_token');
let currentUser = null;

// DOM元素
const authPanel = document.getElementById('auth-panel');
const chatPanel = document.getElementById('chat-panel');
const authFormContainer = document.getElementById('auth-form-container');

// 初始化认证表单
async function initAuthUI() {
    await loadHtml('auth-ui.html', authFormContainer);
    bindAuthEvents();
}

// 绑定认证相关事件
function bindAuthEvents() {
    // 登录/注册表单切换
    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        clearAuthError();
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
        clearAuthError();
    });

    // 登录按钮
    document.getElementById('login-btn').addEventListener('click', login);

    // 注册按钮
    document.getElementById('register-btn').addEventListener('click', register);
}

// 显示认证错误
function showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    const errorMsgEl = document.getElementById('auth-error-message');
    errorMsgEl.textContent = message;
    errorEl.classList.remove('hidden');
    setTimeout(clearAuthError, 3000);
}

// 清除认证错误
function clearAuthError() {
    const errorEl = document.getElementById('auth-error');
    errorEl.classList.add('hidden');
}

// 登录功能
async function login() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        return showAuthError('用户名和密码不能为空');
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '登录失败');
        }

        // 保存token并进入聊天界面
        token = data.token;
        localStorage.setItem('im_token', token);
        loadUserInfo(data.user);

    } catch (error) {
        showAuthError(error.message);
    }
}

// 注册功能
async function register() {
    const username = document.getElementById('reg-username').value.trim();
    const nickname = document.getElementById('reg-nickname').value.trim();
    const password = document.getElementById('reg-password').value.trim();

    if (!username || !nickname || !password) {
        return showAuthError('所有字段都不能为空');
    }

    if (password.length < 6) {
        return showAuthError('密码长度不能少于6位');
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, nickname, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '注册失败');
        }

        showAuthError('注册成功，请登录');
        document.getElementById('show-login').click();
        document.getElementById('login-username').value = username;

    } catch (error) {
        showAuthError(error.message);
    }
}

// 验证令牌并加载用户信息
async function verifyTokenAndLoadUser() {
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error('令牌无效');
        }

        const data = await response.json();
        loadUserInfo(data.user);

    } catch (error) {
        localStorage.removeItem('im_token');
        token = null;
    }
}

// 加载用户信息并切换到聊天界面
async function loadUserInfo(user) {
    currentUser = user;
    // 加载聊天界面
    await loadHtml('chat-ui.html', chatPanel);
    // 更新用户信息显示
    document.getElementById('current-user').textContent = `欢迎，${user.nickname}`;
    // 切换面板显示
    authPanel.classList.add('hidden');
    chatPanel.classList.remove('hidden');
    // 初始化聊天功能
    initChatModule();
}

// 登出功能
function logout() {
    // 关闭WebSocket连接
    closeWebSocket();
    // 清除本地存储
    localStorage.removeItem('im_token');
    token = null;
    currentUser = null;
    // 切换回认证面板
    chatPanel.classList.add('hidden');
    authPanel.classList.remove('hidden');
    // 重置表单
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}
```

### 8. WebSocket 模块（websocket-module.js）

处理 WebSocket 连接、消息收发等实时通信功能

javascript



运行









```javascript
// WebSocket状态
let ws = null;
let wsConnected = false;

// 连接WebSocket
function connectWebSocket() {
    if (ws) ws.close();

    updateConnectionStatus('连接中...', 'yellow-500');

    // 根据当前协议选择ws/wss
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsURL = `${protocol}//${window.location.host}/api/ws?token=${token}`;

    ws = new WebSocket(wsURL);

    // 连接成功
    ws.onopen = () => {
        wsConnected = true;
        updateConnectionStatus('在线', 'green-500');
    };

    // 接收消息
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
    };

    // 连接关闭
    ws.onclose = () => {
        wsConnected = false;
        updateConnectionStatus('已断开', 'red-500');
        // 5秒后自动重连
        setTimeout(connectWebSocket, 5000);
    };

    // 连接错误
    ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        updateConnectionStatus('错误', 'red-500');
    };
}

// 关闭WebSocket连接
function closeWebSocket() {
    if (ws) {
        ws.close();
        ws = null;
        wsConnected = false;
    }
}

// 更新连接状态显示
function updateConnectionStatus(text, colorClass) {
    const statusEl = document.getElementById('connection-status');
    if (!statusEl) return;

    statusEl.innerHTML = `
        <span class="w-2 h-2 bg-white rounded-full mr-1 ${text === '连接中...' ? 'pulse' : ''}"></span>
        ${text}
    `;
    statusEl.className = `ml-4 text-xs px-2 py-1 ${colorClass} rounded-full flex items-center`;
}

// 发送消息
function sendMessage(content, receiverId = 0) {
    if (!content || !wsConnected) return;

    const message = {
        type: 0,  // 0:普通消息，1:系统消息
        content: content,
        receiver_id: receiverId
    };

    ws.send(JSON.stringify(message));
}

// 处理接收到的WebSocket消息
function handleWebSocketMessage(message) {
    if (message.type === 1) {
        // 系统消息（用户上下线）
        addSystemMessage(message);
        loadOnlineUsers();  // 刷新在线用户列表
    } else {
        // 普通聊天消息
        addChatMessage(message);
    }
}
```

### 9. 聊天模块（chat-module.js）

处理聊天界面交互、消息渲染、用户列表等功能

javascript



运行









```javascript
// 初始化聊天模块
function initChatModule() {
    // 绑定聊天相关事件
    bindChatEvents();
    // 连接WebSocket
    connectWebSocket();
    // 加载在线用户
    loadOnlineUsers();
    // 加载历史消息
    loadHistoryMessages();
}

// 绑定聊天界面事件
function bindChatEvents() {
    // 登出按钮
    document.getElementById('logout-btn').addEventListener('click', logout);

    // 消息输入框事件
    const messageInput = document.getElementById('message-input');
    const charCount = document.getElementById('char-count');
    const sendBtn = document.getElementById('send-btn');

    // 字符计数更新
    messageInput.addEventListener('input', () => {
        const count = messageInput.value.length;
        charCount.textContent = count;

        // 限制最大长度500
        if (count >= 500) {
            charCount.classList.add('text-red-500');
            sendBtn.disabled = true;
        } else {
            charCount.classList.remove('text-red-500');
            sendBtn.disabled = false;
        }
    });

    // 快捷键发送（Ctrl+Enter）
    messageInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // 发送按钮点击
    sendBtn.addEventListener('click', handleSendMessage);
}

// 处理发送消息逻辑
function handleSendMessage() {
    const messageInput = document.getElementById('message-input');
    const content = messageInput.value.trim();

    if (!content) return;

    // 获取选中的聊天对象
    const selectedUserEl = document.querySelector('#user-list .bg-primary\\/10');
    const receiverId = selectedUserEl ? parseInt(selectedUserEl.dataset.userId) : 0;

    // 发送消息
    sendMessage(content, receiverId);
    // 清空输入框
    messageInput.value = '';
    document.getElementById('char-count').textContent = '0';
}

// 添加系统消息到聊天区域
function addSystemMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const messageEl = document.createElement('div');
    messageEl.className = 'text-center text-gray-500 text-sm py-1';
    messageEl.innerHTML = `<span>${message.sender_name} ${message.content}</span>`;

    chatMessages.appendChild(messageEl);
    scrollToBottom();
}

// 添加聊天消息到聊天区域
function addChatMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    const isCurrentUser = message.sender_id === currentUser.id;
    const messageClass = isCurrentUser ? 'message-out' : 'message-in';
    const alignmentClass = isCurrentUser ? 'ml-auto' : 'mr-auto';
    const bgColorClass = isCurrentUser ? 'bg-primary text-white' : 'bg-white text-gray-800';

    // 格式化时间（HH:MM）
    const date = new Date(message.timestamp * 1000);
    const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    const messageEl = document.createElement('div');
    messageEl.className = `flex ${messageClass}`;
    messageEl.innerHTML = `
        <div class="max-w-[80%] ${alignmentClass}">
            <div class="flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}">
                <span class="text-xs text-gray-500">${isCurrentUser ? '我' : message.sender_name}</span>
                <span class="text-xs text-gray-400 ml-2">${timeStr}</span>
            </div>
            <div class="${bgColorClass} p-3 rounded-lg shadow-sm">
                <p>${escapeHtml(message.content)}</p>
            </div>
        </div>
    `;

    chatMessages.appendChild(messageEl);
    scrollToBottom();
}

// 加载在线用户列表
async function loadOnlineUsers() {
    try {
        const response = await fetch(`${API_BASE}/api/online`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('加载在线用户失败');

        const data = await response.json();
        renderUserList(data.users);
        document.getElementById('online-count').textContent = data.users.length;

    } catch (error) {
        console.error('加载在线用户错误:', error);
        setTimeout(loadOnlineUsers, 5000);  // 5秒后重试
    }
}

// 渲染用户列表
function renderUserList(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = '';

    if (users.length === 0) {
        userList.innerHTML = `<div class="text-center text-gray-500 text-sm py-4">暂无在线用户</div>`;
        return;
    }

    // 排序：当前用户排在最后
    users.sort((a, b) => {
        if (a.id === currentUser.id) return 1;
        if (b.id === currentUser.id) return -1;
        return a.id - b.id;
    });

    users.forEach(user => {
        const userEl = document.createElement('div');
        const isCurrentUser = user.id === currentUser.id;
        const isSelected = users.length === 1;  // 只有一个用户时默认选中

        userEl.className = `flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-100 transition ${
            isCurrentUser ? 'opacity-70' : ''
        } ${!isCurrentUser && isSelected ? 'bg-primary/10' : ''}`;

        userEl.dataset.userId = user.id;

        // 非当前用户可点击选择
        if (!isCurrentUser) {
            userEl.addEventListener('click', () => {
                // 移除其他用户的选中状态
                document.querySelectorAll('#user-list > div').forEach(el => {
                    el.classList.remove('bg-primary/10');
                });
                // 选中当前用户
                userEl.classList.add('bg-primary/10');
                // 加载与该用户的历史消息
                loadHistoryMessages(user.id);
            });
        }

        userEl.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary mr-3">
                <i class="fa fa-user"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 truncate">${user.nickname}</p>
                ${isCurrentUser ? '<p class="text-xs text-gray-500">你自己</p>' : ''}
            </div>
            <div class="w-2 h-2 rounded-full bg-green-500"></div>
        `;

        userList.appendChild(userEl);
    });
}

// 加载历史消息
async function loadHistoryMessages(otherUserId = 0) {
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = `<div class="text-center text-gray-500 text-sm py-2">加载历史消息中...</div>`;

    try {
        const url = otherUserId 
            ? `${API_BASE}/api/messages?other_id=${otherUserId}&limit=50&offset=0`
            : `${API_BASE}/api/messages?limit=50&offset=0`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) throw new Error('加载历史消息失败');

        const data = await response.json();
        chatMessages.innerHTML = '';

        if (data.messages.length === 0) {
            chatMessages.innerHTML = `
                <div class="text-center text-gray-500 text-sm py-8">
                    <i class="fa fa-comment-o text-3xl mb-2 block opacity-30"></i>
                    暂无消息
                </div>
            `;
            return;
        }

        // 渲染历史消息
        data.messages.forEach(message => addChatMessage(message));

    } catch (error) {
        console.error('加载历史消息错误:', error);
        chatMessages.innerHTML = `
            <div class="text-center text-red-500 text-sm py-4">
                <i class="fa fa-exclamation-circle mr-1"></i>
                加载消息失败，请重试
            </div>
        `;
    }
}
```

### 10. 初始化脚本（init.js）

启动应用，协调各模块初始化顺序

javascript



运行









```javascript
// API基础路径（根据实际后端地址修改）
const API_BASE = '';

// 应用初始化
async function initApp() {
    // 先加载认证界面
    await initAuthUI();
    
    // 检查是否有保存的token，有则自动登录
    if (token) {
        await verifyTokenAndLoadUser();
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', initApp);
```







![img](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAwCAYAAADab77TAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAjBSURBVHgB7VxNUxNJGO7EoIIGygoHQi0HPbBWeWEN+LFlKRdvsHf9AXBf9y7eZe/wA5a7cPNg3LJ2VYjFxdLiwFatVcBBDhAENfjxPO3bY2cyM/maiYnOU5VMT0/PTE+/3+9Md0LViJWVla6PHz8OHB4e9h8/fjyNbQ+qu1SMVqCUSqX2Mea7KG8nk8mt0dHRUi0nJqo1AGF7cPHT79+/H1IxQdsJr0DoNRB6P6iRL4EpsZ8+ffoZv9NW9TZ+Wzs7O9unTp3ar5WLYjQH0uLDhw+9iUSiD7sD+GXMsaNHj65Dstf8aJHwuWAPuOOyqGGiJm6J0RqQPjCXwygOSdU+6POvF30qCHz//v2+TCYzSuKCaw729vaWr1+/vqNitB2E0L+i2I3fPsrLly5d2rXbJNwnWJJLqX0eq+H2hji/I+qL6q6Q5ITdEAevCnG3Lly4sKxidAyePn1KIlNlk8h/G8FMmgZ0qIxaRoNVFaOjQG2LzQF+jHqGnXr+UTUbb7mrq+ufWC13HkgzRDda6yKkPUOasqwJLB4Z8Sr2lDsX4gy/Ypm5C26TtL1K3G2GQipGR8PQkIkp7Vcx/SjHtmPp7XwIDZmQ0qnllPqaFdlSPyiWl5dvgPPTGJC1sbGxvIoAjx49Sh87duwuy/B3lhClLK6urg6XSqWb6XR69uzZs0UVHkjLDN8bkMBMf6k3b97squ8cUFmLGNyNI0eO5M+fP79g6pECvIn6LIpL+OVVRMB9ctyCmQpPnjwZBgH+Qp1CMin37NmzafRpQ4UAppL7+vpoh3tTCIt68MAKXBRZtorcizdQD7yO4QE3crncb0HngzA8N232QYwCJG1a1QFKCwY0i/tleb5qMa5cuVLEczj7Fy9eXEPsegfE/h27WdDhNrZ1PZMf+J4A2ojF7hSISylWUYZGSIiP+x3DYA++fPkyXUVFpVWTgCrMUVoEoRKYzAMCVe0jnlVvMfiDhUKB0ryB8gL6dYNqm3WgR3FkZKQpZ5e0BPOw2JVSLQA6PWEezgswD+PYLKoagQGp217hnElTxqBOwu5OWodPSpsc6mf8rvHu3bt5SGKFGoVmmMUmq2rvC8djQsq6DpJ8m2MERiTzhSLJROQEhm0ZxIDmgtrgwYb9jkG9D3q031P198G5BwfYp2k24Jjq7u4mE4ZiJ1uFyAkM7s6BO8vqMIgFECln7V/DZrbGS9YtwVCfU5Z63vRoYqSP162LeVzIv3379k+/g/BD5ngv+gDQBndUCxA5gT3Ucx6/h/g5BA6yw5CarFu910Ngkd4JuY+nc0bvWn0Z+Ic4PqMaBDWLlwq37sN+k5nSdrsafJCGkVQRgoNrSyqBwX54cHBQ4eSIHQ4duN+cKUOTzKtviw3px0lTwTFCmPQAtn+OZRUyIpVgqMZrlmokigzwWQA3U1U6jkmQHXajVgmGJ3nL3INeKrzLSMOjACctLwmUTemLQ0hjwniuTfiwEKkEM4Fg71MFWuWCq+01n8s05GQx9sZmnGVI8SY9YBU9tJPm/oFwmnmZZLH6p5+LJsz0sdnwyAuRSbBJLNh1eNBFq1wwoQJRYzysgcGo2oaJBQziNGLwOSTep5EmHEac6ekh494mTGKbKa821Bp29ssHRbRbs65bZp74IsD4E+wPVLKyIoxIGDAyAjPH6lbPsL2bVthT4Yz4xMMV8SUGqiYVLY6MjnehOqdshvLBcICp4LX8CKwZhBoKZmDGVK58TV1p1YznX4MnrSuokmHCxs0YgQkjMR+REdjkXS0wXXnP7HglPuqxw20GncUC4wXGyNQq0BAmRGRmzajupSDvuxlEQmCm3CR5XxfcKk3qKlKA1ASqTkj4M+N1zAqTluoNk8TWa9jOnytBYxOPksrndJg5Sv8gEieLqUDVAMjRtMN2nReB2wmI0x1Coa+O/T0JeLUHcy7Z+zhnPirpJSKRYA/1nEddhf0CI6RRf9euKxaLPDdvXatioPr7+yNJCjQCpkCNHcXW0Sz2y40TJ044hIdzVRYtQGNo6RWndBbXmzehZBgIncBwZsaVyzFi+s6PS93xsDBH3tpPu+11VFmfRmCYmWEOX0Xiee7Zx1lv+ou4fBJtbtnH+bEBiLwAhhjk+XzpAPVeCEuqo1DR4/YO1VZQZ93xsJcdbldI5mmcZebX8V6bz2IzH8MmnWNn+EXimQMkvJw3xeuYWJn1YarsUCWYDof7bQwIFhg7uuNhY4cN17ttMD8QUDVCJKZaaERk5drMRM0FNaQjhVDoD+nbhPUcWq0i9JlOpVK6zwyLaKN5TZtxQcQ7SHBsoI73Sks61cTioYZLoRLY68V+tfiOeWkTGxq47HDDThYGMVunRtBffAQ1MAxGZsa1tTNJqYPd1M/JLzVMW4m9nTdZbIf9W6YNjs+KynbuaSeDwgA/2TnkVx38xLLZrzrcb46ofqupGx6Xtyx2uGETuMzJMqqtFuDZNtGnUCXC3F9iWn7jxcyXZ5iD8GcBTD8JopGAC2B2esyOCqfthZZh2nXKtBE13xRkvhKLpQRuQK+uV+azxLMI6wRj/iCi8OM6quxqhGPcHJbtffHiRQZakLMOdxNQE7+AC3/CznOomXUVo+MBoT2DzTnFGaIg7mupH1Axvhc4kxmSXNCDdhg7GTNhKUbnQmiYYZm0TdKxgo3QE5bsD9NidCZcEwlLOtEBr9XY3qHHjx/3qhgdCZHesomEmsAyYWldDozJjMMYHQRZoeGy7K6biYROqlIormeIQ8zPqRgdBa7TYa3Q4CRbKhZhsVZt2eJSDvFs//aGJDUokEMkrqzQ4EwDLnvZwAOyDAAleQAnXo096/YFl7ziwjlKiMslr9xzvH0XQrMkmYgXQmsjuBdC85Jcg8ClDOUiZ6xqvZQhiM25xDux+m4NxOklURnfli1lCKyL8NW+lKHr4u5l82J8YzAxhdeQ/8Op+q/hxUjdMMsJqy/c0ycTx1sy/fRHh7zx08sJIyn1up7lhD8DfU3/IDqhNFQAAAAASUVORK5CYII=)

### 拆分说明

1. **功能单一原则**：每个文件只负责特定功能（如`auth-module.js`仅处理认证），降低耦合度
2. **依赖管理**：通过引入顺序保证依赖关系（工具函数→认证→WebSocket→聊天）
3. **可维护性**：修改某功能只需调整对应文件，无需通读全部代码
4. **可扩展性**：新增功能（如文件上传）可新增模块文件，不影响现有代码

使用时需将所有文件放在同一目录（或按路径调整引入地址），并确保后端 API 接口与前端请求路径匹配。







# 进一步拆分

### 实现说明

这个拆分方案遵循以下原则，确保登录界面能正常显示：

1. **文件结构清晰**：
   - `index.html`：主入口，负责引入资源和提供页面容器
   - `styles.css`：自定义样式和动画
   - `config.js`：系统配置和 Tailwind 主题定义
   - `auth-template.html`：登录 / 注册表单的 HTML 结构
   - `auth.js`：认证相关的逻辑处理
   - `app.js`：应用初始化逻辑
2. **加载机制可靠**：
   - 使用异步 fetch 加载表单模板，失败时有错误提示
   - 所有脚本按依赖顺序加载（配置→认证→应用）
   - 确保 DOM 加载完成后再执行初始化逻辑
3. **功能完整**：
   - 包含登录 / 注册表单切换
   - 表单验证和错误提示
   - 基础的登录 / 注册逻辑处理

### 使用方法

1. 创建上述 6 个文件，保持相同的目录结构
2. 用浏览器打开`index.html`（推荐使用 VSCode 的 Live Server 插件启动本地服务）
3. 页面会自动加载并显示登录界面

如果登录界面仍无法显示，打开浏览器控制台（F12）查看错误信息，通常是文件路径错误或网络问题导致模板加载失败。