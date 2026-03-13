import { NextResponse } from 'next/server'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
}

interface QuizResponse {
  questions: Question[]
}

export async function POST(req: Request) {
  try {
    const { content } = await req.json()

    if (!content || content.trim().length < 100) {
      return NextResponse.json(
        { error: '文章内容太短，无法生成测试题' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_AI_API_KEY || 'sk-86c926b97fd244fd86412b3f11a5c1be'
    const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
    const model = process.env.NEXT_PUBLIC_AI_MODEL || 'qwen-turbo'

    const prompt = `请根据以下技术博客文章内容，生成5道选择题来测试读者对知识点的掌握程度。

要求：
1. 只出单选题，每题4个选项，格式为["A. xxx", "B. xxx", "C. xxx", "D. xxx"]
2. 题目要覆盖文章的核心知识点，包括关键概念、原理、代码逻辑等
3. 选项要有干扰性，不能太简单
4. 每道题都要有详细的答案解析
5. 必须返回严格的JSON格式，不要包含任何其他文字：
{
  "questions": [
    {
      "id": 1,
      "question": "题目内容",
      "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
      "correctAnswer": "A",
      "explanation": "答案解析"
    }
  ]
}

文章内容：
${content.substring(0, 8000)}`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的技术教育专家，擅长根据技术文章生成高质量的选择题。你必须严格返回JSON格式，不要包含markdown代码块标记或其他额外文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('AI API 错误:', errorText)
      throw new Error(`API 调用失败: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || data.output?.text || ''
    
    // 解析AI返回的JSON
    let quizData: QuizResponse
    try {
      // 尝试直接解析
      quizData = JSON.parse(aiResponse)
    } catch {
      // 如果直接解析失败，尝试提取JSON部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析AI返回的数据')
      }
    }

    // 验证数据结构
    if (!quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      throw new Error('AI返回的数据格式不正确')
    }

    // 确保每道题都有完整的字段
    const validatedQuestions = quizData.questions.map((q, index) => ({
      id: q.id || index + 1,
      question: q.question || '题目加载失败',
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A. 选项A', 'B. 选项B', 'C. 选项C', 'D. 选项D'],
      correctAnswer: q.correctAnswer || 'A',
      explanation: q.explanation || '暂无解析',
    }))

    return NextResponse.json({ questions: validatedQuestions })
  } catch (error) {
    console.error('生成测试题失败:', error)
    return NextResponse.json(
      { error: '生成测试题失败，请稍后重试' },
      { status: 500 }
    )
  }
}
