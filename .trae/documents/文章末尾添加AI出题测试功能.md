## 方案概述
在文章末尾评论区上方添加一个"知识点测试"按钮，点击后调用AI API根据文章内容生成选择题。

## 技术可行性
**完全可以只用前端+AI API实现！**

## 实现步骤

### 1. 创建AI出题组件 `ArticleQuiz.tsx`
- 位置：文章末尾、评论区上方
- 功能：
  - 点击"开始测试"按钮
  - 将文章内容发送到AI API
  - 接收AI生成的选择题（JSON格式）
  - 用Markdown格式渲染题目
  - 用户作答后显示正确答案和解析

### 2. AI Prompt设计
```
请根据以下文章内容，生成5道选择题来测试读者对知识点的掌握程度。

要求：
1. 只出单选题，每题4个选项
2. 题目要覆盖文章的核心知识点
3. 返回JSON格式：
{
  "questions": [
    {
      "id": 1,
      "question": "题目内容",
      "options": ["A. xxx", "B. xxx", "C. xxx", "D. xxx"],
      "correctAnswer": "A",
      "explanation": "解析内容"
    }
  ]
}

文章内容：
{{articleContent}}
```

### 3. 需要用户配置
- 需要在 `.env.local` 中添加 AI API Key（如 OpenAI、Claude、智谱AI等）
- 需要安装 `ai` 或 `@ai-sdk/openai` 包

### 4. 界面设计
- 按钮："📝 知识点测试"
- 弹窗/展开区域显示题目
- 选项用卡片形式展示
- 作答后显示对错和解析
- 支持重新生成题目

### 5. 文件修改
1. 新建 `src/components/blog/ArticleQuiz.tsx`
2. 新建 `src/app/api/quiz/route.ts` (API路由，保护API Key)
3. 修改 `src/components/blog/CommentSection.tsx` 或 `ArticlePageClient.tsx` 添加组件

## 依赖安装
```bash
npm install ai @ai-sdk/openai
```

## 环境变量配置
```
# .env.local
OPENAI_API_KEY=your_api_key_here
```

请确认这个方案后，我将开始实施具体代码。