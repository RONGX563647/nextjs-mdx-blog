```
<html lang="zh-CN"><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>陈明 | Java开发工程师（应届生）</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* 全局样式与变量 - 白金色配色方案 */
        :root {
            --primary: #D4AF37; /* 主色调：金色 */
            --primary-light: rgba(212, 175, 55, 0.1);
            --primary-glow: rgba(212, 175, 55, 0.2);
            --secondary: #FFFFFF; /* 辅助色：白色 */
            --accent: #B8860B; /* 强调色：暗金色 */
            --dark: #F8F8F8;
            --gray-dark: #555555;
            --gray: #777777;
            --light-gray: #F0F0F0;
            --glass-border: rgba(212, 175, 55, 0.2);
            --glass-bg: rgba(255, 255, 255, 0.95);
            --glass-blur: 10px;
            --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            --shadow-hover: 0 8px 30px rgba(212, 175, 55, 0.15);
            --transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Inter', 'Helvetica Neue', 'Microsoft YaHei', sans-serif;
        }
        
        body {
            background-color: var(--dark);
            background-image: 
                radial-gradient(var(--primary-light) 0.5px, transparent 0.5px),
                radial-gradient(var(--primary-light) 0.5px, var(--dark) 0.5px);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            color: #333333;
            line-height: 1.6;
            font-size: 16px;
            overflow-x: hidden;
            padding-top: 70px; /* 为顶部导航留出空间 */
        }
        
        .container {
            max-width: 1000px;
            width: 100%;
            padding: 60px 40px;
            margin-left: auto;
            margin-right: auto;
        }
        
        section {
            margin-bottom: 80px;
            position: relative;
        }
        
        h1, h2, h3, h4 {
            font-weight: 600;
            color: #333;
            line-height: 1.3;
        }
        
        a {
            text-decoration: none;
            color: var(--primary);
            transition: var(--transition);
        }
        
        a:hover {
            color: var(--accent);
        }
        
        /* 玻璃质感核心样式 - 白金色卡片 */
        .glass {
            background: var(--glass-bg);
            backdrop-filter: blur(var(--glass-blur));
            -webkit-backdrop-filter: blur(var(--glass-blur));
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            box-shadow: var(--shadow);
            transition: var(--transition);
            overflow: hidden;
            position: relative;
        }
        
        .glass::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(
                to bottom right,
                rgba(212, 175, 55, 0.05) 0%,
                rgba(212, 175, 55, 0) 50%
            );
            opacity: 0;
            transition: opacity 0.4s ease;
            pointer-events: none;
        }
        
        .glass:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-hover);
            border-color: rgba(212, 175, 55, 0.3);
        }
        
        .glass:hover::before {
            opacity: 1;
        }
        
        /* 顶部固定导航栏 - 简化版 */
        .navbar {
            width: 100%;
            height: 70px;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(16px);
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.05);
        }
        
        .navbar-logo {
            color: var(--primary);
            font-size: 22px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .navbar-links {
            display: flex;
            list-style: none;
            gap: 30px;
        }
        
        .navbar-link {
            position: relative;
        }
        
        .navbar-link a {
            color: #555;
            font-weight: 500;
            font-size: 15px;
            padding: 5px 0;
            display: inline-block;
        }
        
        .navbar-link.active a {
            color: var(--primary);
        }
        
        .navbar-link a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background-color: var(--primary);
            transition: width 0.3s ease;
        }
        
        .navbar-link a:hover::after,
        .navbar-link.active a::after {
            width: 100%;
        }
        
        .mobile-menu-btn {
            display: none;
            background: none;
            border: none;
            color: var(--primary);
            font-size: 24px;
            cursor: pointer;
        }
        
        /* 轮播容器 */
        .carousel-container {
            position: relative;
            width: 100%;
            overflow: hidden;
            border-radius: 20px;
            margin-bottom: 80px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
        }
        
        .carousel {
            display: flex;
            transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .carousel-slide {
            min-width: 100%;
            padding: 50px;
        }
        
        .carousel-controls {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 12px;
            z-index: 10;
        }
        
        .carousel-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: rgba(0, 0, 0, 0.2);
            cursor: pointer;
            transition: var(--transition);
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .carousel-dot.active {
            background-color: var(--primary);
            width: 36px;
            border-radius: 6px;
        }
        
        .carousel-prev, .carousel-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 10;
            transition: var(--transition);
            opacity: 0.8;
            border: 1px solid rgba(212, 175, 55, 0.3);
            color: var(--primary);
        }
        
        .carousel-prev:hover, .carousel-next:hover {
            background-color: var(--secondary);
            transform: translateY(-50%) scale(1.15);
            opacity: 1;
            border-color: var(--primary);
        }
        
        .carousel-prev {
            left: 25px;
        }
        
        .carousel-next {
            right: 25px;
        }
        
        /* 时间轴样式 - 项目经验 */
        .timeline {
            position: relative;
            max-width: 1000px;
            margin: 0 auto;
            padding-left: 50px;
        }
        
        .timeline::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 4px;
            background-color: var(--primary-light);
            border-radius: 2px;
        }
        
        .timeline-item {
            position: relative;
            margin-bottom: 60px;
            padding: 35px;
            transform: translateX(-20px);
            opacity: 0;
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .timeline-item.active {
            transform: translateX(0);
            opacity: 1;
        }
        
        .timeline-item:last-child {
            margin-bottom: 0;
        }
        
        .timeline-dot {
            position: absolute;
            left: -58px;
            top: 30px;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background-color: var(--secondary);
            border: 4px solid var(--primary);
            z-index: 10;
            box-shadow: 0 0 0 4px var(--primary-light);
            transition: transform 0.3s ease;
        }
        
        .timeline-item:hover .timeline-dot {
            transform: scale(1.3);
        }
        
        .timeline-content {
            position: relative;
        }
        
        .timeline-date {
            display: inline-block;
            padding: 6px 15px;
            background-color: var(--primary-light);
            color: var(--primary);
            border-radius: 20px;
            font-size: 13px;
            margin-bottom: 15px;
            font-weight: 500;
        }
        
        /* 高级动画效果 */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                        transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .reveal.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        /* 技能进度条动画 */
        .skill-bar {
            height: 6px;
            background-color: rgba(0, 0, 0, 0.05);
            border-radius: 3px;
            overflow: hidden;
            margin: 8px 0 15px;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        .skill-progress {
            height: 100%;
            background: linear-gradient(90deg, #B8860B, #D4AF37, #F0E68C);
            width: 0;
            border-radius: 3px;
            transition: width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
        }
        
        .skill-progress::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 50%, transparent);
            animation: shine 2s infinite;
        }
        
        @keyframes shine {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
        
        /* 页面加载动画 */
        .loader-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: var(--dark);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease, visibility 0.5s;
        }
        
        .loader {
            width: 60px;
            height: 60px;
            border: 5px solid var(--primary-light);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            position: relative;
        }
        
        .loader::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: var(--dark);
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .loader-container.hidden {
            opacity: 0;
            visibility: hidden;
        }
        
        /* 滚动进度指示器 */
        .scroll-indicator {
            position: fixed;
            top: 70px; /* 位于导航栏下方 */
            left: 0;
            height: 4px;
            background: linear-gradient(90deg, #B8860B, #D4AF37);
            z-index: 9999;
            width: 0%;
            transition: width 0.2s ease;
            box-shadow: 0 0 10px var(--primary-glow);
        }
        
        /* 悬浮按钮 - 返回顶部 */
        .back-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 55px;
            height: 55px;
            background-color: var(--secondary);
            color: var(--primary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: 0 6px 18px var(--primary-glow);
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: var(--transition);
            z-index: 1000;
            transform: translateY(20px);
            border: 1px solid var(--primary);
        }
        
        .back-to-top.active {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .back-to-top:hover {
            transform: translateY(-5px) scale(1.05);
            box-shadow: 0 8px 25px var(--primary-glow);
            background-color: var(--primary);
            color: white;
        }
        
        /* 按钮样式 */
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #B8860B, #D4AF37);
            color: white;
            border-radius: 8px;
            font-weight: 500;
            transition: var(--transition);
            border: none;
            cursor: pointer;
            font-size: 15px;
            position: relative;
            overflow: hidden;
        }
        
        .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: 0.6s;
        }
        
        .btn:hover::before {
            left: 100%;
        }
        
        .btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 20px var(--primary-glow);
            color: white;
        }
        
        .btn-outline {
            background: transparent;
            color: var(--primary);
            border: 1px solid var(--primary);
        }
        
        .btn-outline:hover {
            background: linear-gradient(135deg, #B8860B, #D4AF37);
            color: white;
        }
        
        /* 标题样式 */
        .section-title {
            font-size: 32px;
            margin-bottom: 50px;
            position: relative;
            display: inline-block;
            padding-bottom: 12px;
            color: #333;
        }
        
        .section-title::after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #B8860B, #D4AF37);
            border-radius: 3px;
            transition: width 0.5s ease;
        }
        
        .section-title:hover::after {
            width: 100%;
        }
        
        .section-subtitle {
            font-size: 18px;
            color: #666;
            max-width: 700px;
            margin-bottom: 40px;
            line-height: 1.8;
        }
        
        /* 头部区域 */
        .header {
            text-align: center;
            padding: 50px;
        }
        
        .job-tag {
            display: inline-block;
            padding: 8px 18px;
            background-color: var(--primary-light);
            color: var(--primary);
            border-radius: 30px;
            font-weight: 500;
            font-size: 14px;
            margin-bottom: 25px;
        }
        
        .header h1 {
            font-size: 48px;
            margin-bottom: 20px;
            letter-spacing: -0.5px;
            color: #333;
        }
        
        .header p {
            font-size: 20px;
            color: #666;
            max-width: 700px;
            margin: 0 auto 35px;
            line-height: 1.8;
        }
        
        .profile-highlights {
            max-width: 800px;
            margin: 0 auto;
            padding: 25px 30px;
            margin-bottom: 40px;
        }
        
        .header-actions {
            display: flex;
            justify-content: center;
            gap: 18px;
            flex-wrap: wrap;
        }
        
        /* 核心技术栈 */
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 30px;
        }
        
        .tech-category {
            padding: 30px;
        }
        
        .tech-category h3 {
            font-size: 20px;
            margin-bottom: 25px;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .tech-list {
            list-style: none;
        }
        
        .tech-list li {
            margin-bottom: 20px;
            padding-left: 28px;
            position: relative;
            line-height: 1.7;
            color: #666;
        }
        
        .tech-list li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 9px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: var(--primary-light);
            border: 2px solid var(--primary);
        }
        
        /* 项目经验时间轴内容样式 */
        .project-tech-stack {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .tech-badge {
            font-size: 13px;
            padding: 5px 12px;
            background-color: rgba(245, 245, 245, 0.8);
            color: #555;
            border-radius: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            transition: var(--transition);
            border: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        .tech-badge:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            background-color: white;
            border-color: var(--primary);
            color: var(--primary);
        }
        
        .project-section {
            margin-bottom: 25px;
        }
        
        .project-section h4 {
            font-size: 16px;
            margin-bottom: 12px;
            color: #333;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .project-section h4 i {
            color: var(--primary);
        }
        
        .project-section p, .project-section li {
            color: #666;
            line-height: 1.7;
        }
        
        .project-section ul {
            margin-left: 20px;
        }
        
        .project-highlights {
            background-color: var(--primary-light);
            padding: 20px;
            border-radius: 8px;
            border-left: 3px solid var(--primary);
        }
        
        /* 联系方式 */
        .contact-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
        }
        
        @media (max-width: 768px) {
            .contact-container {
                grid-template-columns: 1fr;
            }
        }
        
        .contact-info {
            padding: 30px;
        }
        
        .contact-list {
            list-style: none;
        }
        
        .contact-item {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            transition: var(--transition);
        }
        
        .contact-item:hover {
            transform: translateX(8px);
        }
        
        .contact-icon {
            width: 50px;
            height: 50px;
            background-color: var(--primary-light);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            font-size: 20px;
            flex-shrink: 0;
            transition: var(--transition);
            border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .contact-item:hover .contact-icon {
            background-color: var(--primary);
            color: white;
            transform: scale(1.1);
            border-color: var(--primary);
        }
        
        .contact-details h4 {
            font-size: 16px;
            margin-bottom: 5px;
            color: #333;
        }
        
        .contact-details p {
            color: #666;
        }
        
        .contact-cta {
            background: linear-gradient(135deg, white, #f9f9f9);
            color: #333;
            padding: 40px;
            border-radius: 16px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
            position: relative;
            overflow: hidden;
            border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .contact-cta::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
        
        .contact-cta h3 {
            color: var(--primary);
            font-size: 24px;
            margin-bottom: 20px;
            position: relative;
        }
        
        .contact-cta p {
            color: #555;
            margin-bottom: 30px;
            line-height: 1.8;
            position: relative;
        }
        
        .contact-cta .btn {
            background: linear-gradient(90deg, #B8860B, #D4AF37);
            color: white;
            align-self: flex-start;
            position: relative;
        }
        
        /* 页脚 */
        footer {
            background: var(--glass-bg);
            backdrop-filter: blur(var(--glass-blur));
            border-top: 1px solid var(--glass-border);
            color: #666;
            padding: 60px 0 30px;
            margin-top: 100px;
        }
        
        .footer-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .footer-logo {
            font-size: 22px;
            font-weight: 600;
            color: var(--primary);
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 25px;
        }
        
        .footer-links {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
            flex-wrap: wrap;
            justify-content: center;
        }
        
        .footer-links a {
            color: #666;
            font-weight: 500;
        }
        
        .footer-links a:hover {
            color: var(--primary);
        }
        
        .footer-social {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .footer-social a {
            width: 40px;
            height: 40px;
            background-color: var(--primary-light);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
            transition: var(--transition);
            border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .footer-social a:hover {
            background-color: var(--primary);
            color: white;
            transform: translateY(-3px) scale(1.1);
            border-color: var(--primary);
        }
        
        .copyright {
            font-size: 14px;
            color: #888;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            width: 100%;
        }
        
        /* 移动端适配 */
        @media (max-width: 768px) {
            .navbar {
                padding: 0 15px;
            }
            
            .navbar-links {
                position: fixed;
                top: 70px;
                left: -100%;
                flex-direction: column;
                width: 100%;
                height: calc(100vh - 70px);
                background-color: white;
                padding: 30px;
                transition: left 0.3s ease;
                z-index: 999;
                gap: 20px;
            }
            
            .navbar-links.active {
                left: 0;
            }
            
            .mobile-menu-btn {
                display: block;
            }
            
            .container {
                padding: 30px 20px;
            }
            
            .scroll-indicator {
                top: 70px;
            }
            
            .carousel-slide {
                padding: 25px;
            }
            
            .timeline {
                padding-left: 30px;
            }
            
            .timeline-dot {
                left: -38px;
            }
            
            .header h1 {
                font-size: 36px;
            }
            
            .section-title {
                font-size: 28px;
            }
        }
    </style>
</head>
<body>
    <!-- 滚动进度指示器 -->
    <div class="scroll-indicator"></div>
    
    <!-- 页面加载动画 -->
    <div class="loader-container">
        <div class="loader"></div>
    </div>

    <!-- 顶部固定导航栏 - 简化版 -->
    <nav class="navbar">
        <div class="navbar-logo">
            <i class="fa-solid fa-code"></i>
            <span>陈明 | Java开发</span>
        </div>
        
        <button class="mobile-menu-btn">
            <i class="fa-solid fa-bars"></i>
        </button>
        
        <ul class="navbar-links">
            <li class="navbar-link active" data-target="home">
                <a href="#home">首页</a>
            </li>
            <li class="navbar-link" data-target="tech">
                <a href="#tech">技术栈</a>
            </li>
            <li class="navbar-link" data-target="projects">
                <a href="#projects">项目经验</a>
            </li>
            <li class="navbar-link" data-target="contact">
                <a href="#contact">联系方式</a>
            </li>
        </ul>
    </nav>

    <div class="container">
        <!-- 轮播容器 -->
        <div class="carousel-container glass">
            <div class="carousel">
                <!-- 轮播页1：个人介绍 -->
                <div class="carousel-slide" id="home">
                    <header class="header">
                        <div class="job-tag">应聘 Java 开发工程师（应届生/初级）</div>
                        <h1>陈明</h1>
                        <p>计算机科学与技术专业2024届本科毕业生，具备扎实的Java基础和项目实战经验，熟悉Spring生态系统，精通RESTful API设计与实现，致力于成为一名优秀的Java开发工程师。</p>
                        
                        <div class="profile-highlights glass">
                            <p><strong>核心优势：</strong> 扎实的Java基础 + 3个完整项目经验 + 良好的问题解决能力。熟悉Spring Boot/MyBatis等主流框架，深入理解JVM原理和MySQL优化，能独立完成后端接口开发与调试，具备良好的代码规范和系统设计思维。</p>
                        </div>
                        
                        <div class="header-actions">
                            <a href="#contact" class="btn">联系我</a>
                            <a href="#" class="btn btn-outline">下载简历</a>
                        </div>
                    </header>
                </div>
                
                <!-- 轮播页2：核心技术栈 -->
                <div class="carousel-slide" id="tech-slide">
                    <h2 class="section-title">核心技术栈</h2>
                    <p class="section-subtitle">专注Java开发领域，掌握核心技术与工具，具备独立开发能力</p>
                    
                    <div class="tech-grid">
                        <div class="tech-category glass">
                            <h3><i class="fa-brands fa-java"></i>Java核心</h3>
                            <ul class="tech-list">
                                <li>
                                    <strong>集合框架</strong>：深入理解HashMap/ArrayList原理与并发安全实现
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="85%"></div>
                                    </div>
                                </li>
                                <li>
                                    <strong>JVM</strong>：内存模型、垃圾回收机制与调优实践
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="75%"></div>
                                    </div>
                                </li>
                                <li>
                                    <strong>多线程</strong>：线程池参数调优、synchronized与Lock底层实现
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="80%"></div>
                                    </div>
                                </li>
                                <li>
                                    <strong>设计模式</strong>：单例、工厂、代理等模式在项目中的实际应用
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="70%"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="tech-category glass">
                            <h3><i class="fa-solid fa-puzzle-piece"></i>框架与工具</h3>
                            <ul class="tech-list">
                                <li>
                                    <strong>Spring Boot</strong>：RESTful接口开发、AOP切面编程、事务管理
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="85%"></div>
                                    </div>
                                </li>
                                <li>
                                    <strong>MyBatis</strong>：XML映射与动态SQL、一级/二级缓存优化
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="80%"></div>
                                    </div>
                                </li>
                                <li>
                                    <strong>数据库</strong>：MySQL索引优化、事务隔离级别、SQL性能调优
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="82%"></div>
                                    </div>
                                </li>
                                <li>
                                    <strong>中间件</strong>：Redis缓存策略、消息队列应用场景
                                    <div class="skill-bar">
                                        <div class="skill-progress" data-width="70%"></div>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- 轮播页3：技术积累 -->
                <div class="carousel-slide" id="learning-slide">
                    <h2 class="section-title">技术积累与学习态度</h2>
                    <p class="section-subtitle">持续学习Java开发技术，注重实践和总结，不断提升专业能力</p>
                    
                    <div class="learning-container">
                        <div class="learning-card glass">
                            <h3><i class="fa-brands fa-github"></i>GitHub项目</h3>
                            <ul class="repo-list">
                                <li class="repo-item">
                                    <a href="#" target="_blank">java-basic-practice</a>
                                    <p class="repo-desc">Java核心技术实践库，包含集合框架、多线程并发、JVM调优等核心知识点的示例代码和性能对比分析</p>
                                </li>
                                <li class="repo-item">
                                    <a href="#" target="_blank">spring-boot-blog-api</a>
                                    <p class="repo-desc">个人博客系统后端API，基于Spring Boot实现，采用分层架构设计，包含完整的单元测试和API文档</p>
                                </li>
                                <li class="repo-item">
                                    <a href="#" target="_blank">algorithm-practice</a>
                                    <p class="repo-desc">算法练习仓库，包含LeetCode中等难度以上题目80+，涵盖数组、链表、树、动态规划等核心算法领域</p>
                                </li>
                            </ul>
                        </div>
                        
                        <div class="learning-card glass">
                            <h3><i class="fa-solid fa-pencil"></i>技术博客</h3>
                            <ul class="blog-list">
                                <li class="blog-item">
                                    <a href="#" target="_blank">HashMap源码解析与并发安全问题深度剖析</a>
                                    <p class="blog-desc">掘金 | 2023-06-15 | 解析HashMap底层结构、扩容机制和线程安全问题，包含JDK7与JDK8实现差异对比</p>
                                </li>
                                <li class="blog-item">
                                    <a href="#" target="_blank">Spring Boot集成Redis实现缓存最佳实践</a>
                                    <p class="blog-desc">CSDN | 2023-05-20 | 包含缓存穿透、击穿、雪崩解决方案，结合实际业务场景的缓存策略设计</p>
                                </li>
                                <li class="blog-item">
                                    <a href="#" target="_blank">MySQL索引原理与查询优化实战</a>
                                    <p class="blog-desc">掘金 | 2023-04-10 | 结合Explain执行计划分析，详解索引失效场景及优化技巧</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 轮播控制按钮 -->
            <button class="carousel-prev">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <button class="carousel-next">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
            
            <!-- 轮播指示器 -->
            <div class="carousel-controls">
                <div class="carousel-dot active" data-index="0"></div>
                <div class="carousel-dot" data-index="1"></div>
                <div class="carousel-dot" data-index="2"></div>
            </div>
        </div>

        <!-- 项目经验（时间轴样式） -->
        <section id="projects" class="reveal">
            <h2 class="section-title">项目经验</h2>
            <p class="section-subtitle">聚焦Java后端开发，注重技术实现与问题解决，体现实战能力</p>
            
            <div class="timeline">
                <!-- 项目1 -->
                <div class="timeline-item glass">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">2023.03 - 2023.06 | 个人项目 | 独立开发</div>
                        <h3 class="project-title">在线图书借阅系统</h3>
                        
                        <div class="project-tech-stack">
                            <span class="tech-badge">Spring Boot 2.7.x</span>
                            <span class="tech-badge">MyBatis</span>
                            <span class="tech-badge">MySQL 8.0</span>
                            <span class="tech-badge">Redis 6.x</span>
                            <span class="tech-badge">JWT</span>
                            <span class="tech-badge">Maven</span>
                        </div>
                        
                        <div class="project-section">
                            <h4><i class="fa-solid fa-info-circle"></i>项目背景</h4>
                            <p>开发校园在线图书借阅系统，解决传统管理效率低的问题，支持图书查询、借阅、归还和后台管理等功能，服务校园师生。系统采用分层架构设计，实现前后端分离，支持高并发借阅场景。</p>
                        </div>
                        
                        <div class="project-section">
                            <h4><i class="fa-solid fa-user"></i>个人职责</h4>
                            <ul>
                                <li>负责用户模块开发，实现基于JWT的身份认证与授权，设计RBAC权限模型</li>
                                <li>开发图书借阅/归还模块，实现预约排队机制和逾期自动提醒功能</li>
                                <li>设计并实现基于Redis的热门图书排行榜和缓存策略，提升系统响应速度</li>
                                <li>优化数据库查询，通过索引优化和SQL重构解决多表联查性能瓶颈</li>
                                <li>编写单元测试和集成测试，覆盖率达到85%以上，确保系统稳定性</li>
                            </ul>
                        </div>
                        
                        <div class="project-section project-highlights">
                            <h4><i class="fa-solid fa-lightbulb"></i>技术亮点与解决的问题</h4>
                            <ul>
                                <li>使用JWT实现无状态身份认证，解决分布式部署下的session共享问题，提升系统水平扩展能力</li>
                                <li>针对图书借阅并发场景，设计基于Redis的分布式锁方案，有效防止超量预约问题</li>
                                <li>优化图书查询SQL，通过添加联合索引和SQL改写，将查询响应时间从500ms降至50ms，性能提升90%</li>
                                <li>实现基于Redis的缓存预热和定时更新机制，解决缓存与数据库一致性问题</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <!-- 项目2 -->
                <div class="timeline-item glass">
                    <div class="timeline-dot"></div>
                    <div class="timeline-content">
                        <div class="timeline-date">2023.01 - 2023.02 | 个人项目 | 独立开发</div>
                        <h3 class="project-title">个人博客系统（后端API）</h3>
                        
                        <div class="project-tech-stack">
                            <span class="tech-badge">Spring Boot 2.7.x</span>
                            <span class="tech-badge">Spring Security</span>
                            <span class="tech-badge">MyBatis-Plus</span>
                            <span class="tech-badge">MySQL 8.0</span>
                            <span class="tech-badge">Elasticsearch 7.x</span>
                            <span class="tech-badge">Lombok</span>
                        </div>
                        
                        <div class="project-section">
                            <h4><i class="fa-solid fa-info-circle"></i>项目背景</h4>
                            <p>开发个人博客系统后端API，支持文章发布、分类、标签、评论、搜索等功能，采用RESTful API设计风格，遵循REST原则，实现完整的CRUD操作和业务逻辑处理。</p>
                        </div>
                        
                        <div class="project-section">
                            <h4><i class="fa-solid fa-user"></i>个人职责</h4>
                            <ul>
                                <li>独立设计并实现所有后端API，包括用户认证、文章管理、评论等模块，代码符合阿里巴巴开发规范</li>
                                <li>设计数据库表结构，优化字段类型和关系，编写高效的CRUD操作和复杂查询</li>
                                <li>集成Elasticsearch实现文章全文检索功能，优化搜索相关性和响应速度</li>
                                <li>使用AOP实现统一日志记录、异常处理和接口性能监控，便于问题排查</li>
                                <li>编写单元测试和API文档，使用Swagger生成接口文档，提高开发效率</li>
                            </ul>
                        </div>
                        
                        <div class="project-section project-highlights">
                            <h4><i class="fa-solid fa-lightbulb"></i>技术亮点与解决的问题</h4>
                            <ul>
                                <li>基于Spring Security实现RBAC权限控制，支持不同角色的操作权限管理，实现细粒度的权限控制</li>
                                <li>使用AOP实现接口性能监控和异常统一处理，减少重复代码，提高系统可维护性</li>
                                <li>实现文章阅读量统计功能，采用Redis+定时任务的异步处理方案，解决高并发计数问题</li>
                                <li>设计实现基于策略模式的文件上传功能，支持本地存储和云存储无缝切换</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 联系方式 -->
        <section id="contact" class="reveal">
            <h2 class="section-title">联系方式</h2>
            <p class="section-subtitle">期待与您沟通交流，寻找合适的Java开发岗位机会</p>
            
            <div class="contact-container">
                <div class="contact-info glass">
                    <ul class="contact-list">
                        <li class="contact-item">
                            <div class="contact-icon">
                                <i class="fa-solid fa-envelope"></i>
                            </div>
                            <div class="contact-details">
                                <h4>邮箱</h4>
                                <p><a href="mailto:chenming@example.com">chenming@example.com</a></p>
                            </div>
                        </li>
                        
                        <li class="contact-item">
                            <div class="contact-icon">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <div class="contact-details">
                                <h4>电话</h4>
                                <p><a href="tel:13800138000">138-0013-8000</a></p>
                            </div>
                        </li>
                        
                        <li class="contact-item">
                            <div class="contact-icon">
                                <i class="fa-brands fa-github"></i>
                            </div>
                            <div class="contact-details">
                                <h4>GitHub</h4>
                                <p><a href="https://github.com/chenming" target="_blank">github.com/chenming</a></p>
                            </div>
                        </li>
                        
                        <li class="contact-item">
                            <div class="contact-icon">
                                <i class="fa-solid fa-code"></i>
                            </div>
                            <div class="contact-details">
                                <h4>技术博客</h4>
                                <p><a href="https://juejin.cn/user/123456" target="_blank">掘金 - 陈明的技术笔记</a></p>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <div class="contact-cta">
                    <h3>寻找Java开发岗位机会</h3>
                    <p>我已准备好迎接Java开发岗位的挑战，能够快速掌握工作所需技能，融入团队。具备扎实的Java基础和良好的学习能力，熟悉企业级应用开发流程和规范，期待有机会与您详细交流我的技术能力和项目经验，为贵公司的发展贡献力量。</p>
                    <a href="mailto:chenming@example.com" class="btn">立即联系我</a>
                </div>
            </div>
        </section>

        <!-- 页脚 -->
        <footer>
            <div class="container">
                <div class="footer-content">
                    <div class="footer-logo">
                        <i class="fa-solid fa-code"></i>
                        <span>陈明 | Java开发工程师</span>
                    </div>
                    
                    <div class="footer-links">
                        <a href="#home">首页</a>
                        <a href="#tech">技术栈</a>
                        <a href="#projects">项目经验</a>
                        <a href="#contact">联系方式</a>
                    </div>
                    
                    <div class="footer-social">
                        <a href="#"><i class="fa-brands fa-github"></i></a>
                        <a href="#"><i class="fa-brands fa-linkedin"></i></a>
                        <a href="#"><i class="fa-brands fa-codepen"></i></a>
                        <a href="#"><i class="fa-brands fa-weixin"></i></a>
                    </div>
                    
                    <div class="copyright">
                        <p>© 2024 陈明的个人主页 | 应聘Java开发工程师</p>
                    </div>
                </div>
            </div>
        </footer>
    </div>

    <!-- 返回顶部按钮 -->
    <button class="back-to-top">
        <i class="fa-solid fa-arrow-up"></i>
    </button>

    <script>
        // 页面加载完成后隐藏加载动画
        window.addEventListener('load', function() {
            setTimeout(function() {
                document.querySelector('.loader-container').classList.add('hidden');
            }, 800);
        });
        
        // 滚动进度指示器
        window.addEventListener('scroll', function() {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            document.querySelector('.scroll-indicator').style.width = scrolled + '%';
            
            // 控制返回顶部按钮显示/隐藏
            const backToTopBtn = document.querySelector('.back-to-top');
            if (winScroll > 300) {
                backToTopBtn.classList.add('active');
            } else {
                backToTopBtn.classList.remove('active');
            }
            
            // 激活滚动显示动画
            revealElements();
        });
        
        // 返回顶部功能
        document.querySelector('.back-to-top').addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 轮播功能
        const carousel = document.querySelector('.carousel');
        const slides = document.querySelectorAll('.carousel-slide');
        const dots = document.querySelectorAll('.carousel-dot');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        let currentSlide = 0;
        
        function showSlide(index) {
            // 确保索引在有效范围内
            if (index < 0) index = slides.length - 1;
            if (index >= slides.length) index = 0;
            
            currentSlide = index;
            carousel.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // 更新指示器状态
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
            
            // 更新导航栏激活状态
            if (currentSlide === 0) {
                updateNavbarActive('home');
            } else if (currentSlide === 1) {
                updateNavbarActive('tech');
            } else if (currentSlide === 2) {
                updateNavbarActive('learning');
            }
        }
        
        // 点击指示器切换轮播
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                showSlide(parseInt(dot.dataset.index));
            });
        });
        
        // 上一张/下一张按钮
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
        
        // 自动轮播
        let slideInterval = setInterval(() => showSlide(currentSlide + 1), 6000);
        
        // 鼠标悬停时暂停自动轮播
        document.querySelector('.carousel-container').addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        // 鼠标离开时恢复自动轮播
        document.querySelector('.carousel-container').addEventListener('mouseleave', () => {
            slideInterval = setInterval(() => showSlide(currentSlide + 1), 6000);
        });
        
        // 导航栏交互
        const navbarLinks = document.querySelectorAll('.navbar-link');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const navbarLinksContainer = document.querySelector('.navbar-links');
        
        // 移动端菜单切换
        mobileMenuBtn.addEventListener('click', function() {
            navbarLinksContainer.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navbarLinksContainer.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
        
        navbarLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.dataset.target;
                
                // 关闭移动端菜单
                navbarLinksContainer.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
                
                // 如果是首页，显示轮播的第一页
                if (targetId === 'home') {
                    showSlide(0);
                    window.scrollTo({
                        top: document.getElementById('home').offsetTop - 80,
                        behavior: 'smooth'
                    });
                } 
                // 如果是技术栈，显示轮播的第二页
                else if (targetId === 'tech') {
                    showSlide(1);
                    window.scrollTo({
                        top: document.getElementById('tech-slide').offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
                // 如果是技术积累，显示轮播的第三页
                else if (targetId === 'learning') {
                    showSlide(2);
                    window.scrollTo({
                        top: document.getElementById('learning-slide').offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
                // 其他部分直接滚动到对应区域
                else {
                    window.scrollTo({
                        top: document.getElementById(targetId).offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
                
                updateNavbarActive(targetId);
            });
        });
        
        // 更新导航栏激活状态
        function updateNavbarActive(targetId) {
            navbarLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.target === targetId);
            });
        }
        
        // 滚动显示动画
        function revealElements() {
            const reveals = document.querySelectorAll('.reveal');
            const timelineItems = document.querySelectorAll('.timeline-item');
            
            // 普通元素的显示动画
            reveals.forEach(element => {
                const windowHeight = window.innerHeight;
                const elementTop = element.getBoundingClientRect().top;
                const elementVisible = 150;
                
                if (elementTop < windowHeight - elementVisible) {
                    element.classList.add('active');
                    
                    // 激活技能进度条动画
                    const progressBars = element.querySelectorAll('.skill-progress');
                    progressBars.forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        bar.style.width = width;
                    });
                }
            });
            
            // 时间轴项目的交错动画
            timelineItems.forEach((item, index) => {
                const windowHeight = window.innerHeight;
                const itemTop = item.getBoundingClientRect().top;
                const itemVisible = 200;
                
                if (itemTop < windowHeight - itemVisible) {
                    // 为每个项目添加延迟，创建交错效果
                    setTimeout(() => {
                        item.classList.add('active');
                    }, index * 200);
                }
            });
        }
        
        // 初始化
        window.addEventListener('load', () => {
            showSlide(0);
            // 初始检查可见元素
            setTimeout(revealElements, 500);
        });
        
        // 监听窗口大小变化，重新检查可见元素
        window.addEventListener('resize', revealElements);
    </script>


</body></html>
```

