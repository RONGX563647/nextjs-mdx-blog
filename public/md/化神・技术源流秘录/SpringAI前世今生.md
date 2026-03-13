# 从“模型接入”到“智能体编排”：Spring AI发展历程与核心知识点详解（超详细版）

### 引言

2022年末，ChatGPT的横空出世引爆了全球AI浪潮。大语言模型（LLM）展现出惊人的能力，企业纷纷希望将AI能力集成到现有业务系统中。然而，对于庞大的Java/Spring开发者群体而言，一个尴尬的问题摆在面前：主流的AI开发框架（如LangChain、LlamaIndex）都是基于Python的，Java开发者被挡在AI应用开发的大门之外。

Java开发者迫切需要一套符合Spring哲学——依赖注入、模块化、POJO优先、自动配置——的AI开发工具，让他们能用熟悉的方式构建AI原生应用。Spring AI正是在这样的背景下应运而生。

Spring AI的目标非常明确：将Spring的设计哲学引入AI工程领域，让Java开发者用熟悉的方式构建AI应用，而无需放弃已有的Spring生态。它不仅仅是封装几个模型API，而是提供了一套完整的AI工程化解决方案，涵盖模型接入、提示词工程、检索增强生成（RAG）、对话记忆、工具调用、可观测性等企业级AI应用所需的核心能力。

从2023年萌芽，到2024年首个公开版本发布，再到2025年1.0正式版和生态的全面爆发，Spring AI走过了一条快速迭代的演进之路。今天，我们顺着时间线，用最详尽的笔触，还原Spring AI从诞生到2026年的完整发展历程。


## 第一章：AI浪潮与Spring生态的必然选择（2022-2023）

### 1.1 时代背景：大语言模型的爆发

**2022年11月**，OpenAI发布ChatGPT，迅速成为历史上用户增长最快的消费级应用。2023年，GPT-4、Claude、Llama等模型相继问世，AI从“玩具”走向“生产力工具”。

企业级AI应用的需求激增：智能客服、文档问答、代码生成、数据分析、自动化报告……每个业务场景都渴望被AI赋能。然而，大多数AI工具链都围绕Python构建（LangChain、LlamaIndex、HuggingFace），Java/Spring开发者陷入尴尬——为了用AI，难道要放弃整个Spring生态？

### 1.2 技术鸿沟：Java开发者的困境

| 问题 | 说明 |
|------|------|
| **技术栈割裂** | 核心业务用Java，AI部分用Python，增加了系统复杂度和维护成本 |
| **学习曲线陡峭** | 提示工程、RAG、向量数据库、工具调用等概念对Java团队陌生 |
| **重复造轮子** | 每个团队都在自己封装OpenAI接口、管理对话记忆、搭建RAG流程 |
| **生产级能力缺失** | 监控、追踪、评估等企业级需求难以满足 |

如果每个Java团队都自己从零开始封装这些能力，将造成大量的重复工作。这正是Spring AI要解决的问题。

### 1.3 Spring AI的诞生与定位

**2023年**，Spring AI项目悄然启动，最初以实验性项目在Spring官方仓库中孵化。项目的核心目标非常明确：
- 为Java开发者提供一套统一的API，对接各类LLM模型
- 抽象出AI应用开发的通用模式：提示词、RAG、工具调用、记忆等
- 与Spring Boot深度集成，实现自动配置和Starter机制
- 提供生产级能力：监控、追踪、评估

Spring AI的定位非常清晰：**不做底层AI逻辑运算，而是作为一个外层的服务层，通过Java在服务端强大的能力，为其他微服务提供AI能力**。


## 第二章：快速迭代——Milestone版本阶段（2024）

### 2.1 首个公开版本：0.8.1（2024年3月）

**2024年2月**，Spring AI发布了第一个公开可用版本——**0.8.1 Milestone**版本。这个版本虽然还处于早期探索阶段，但已经奠定了框架的基础架构：

- 支持基础模型集成（OpenAI、Azure OpenAI等）
- 初步的ChatClient API设计
- 提示词模板机制
- 对话记忆的基础抽象

**版本特点**：仅为历史兼容与早期探索体验，不建议新项目选用。

### 2.2 1.0.0-M1：ChatClient与结构化输出（2024年5月）

**2024年5月**，Spring AI发布了**1.0.0-M1里程碑版本**。这个版本引入了几个核心功能：

- **ChatClient API**：核心交互接口，采用流畅API风格，类似RestTemplate和WebClient
- **结构化输出**：将AI模型的响应自动映射为Java对象（POJO），实现类型安全的处理
- **对话记忆（ChatMemory）**：管理多轮对话历史，实现上下文感知的连续对话

**结构化输出示例**：
```java
public record JokeResponse(String setup, String punchline) {}

public JokeResponse tellJoke(String type, String topic) {
    return chatClient.prompt()
            .user("Tell me a " + type + " joke about " + topic)
            .call()
            .entity(JokeResponse.class);  // 自动映射
}
```

### 2.3 1.0.0-M2：工具调用与模型扩展（2024年8月）

**2024年8月**，**1.0.0-M2版本**发布。核心变更包括：

- **工具调用（Tool Calling）**：将Java方法注册为工具，LLM可在适当时机调用这些方法执行业务逻辑
- **提供商扩展**：支持更多模型提供商，如Anthropic Claude、Google Gemini等

**工具调用示例**：
```java
@Component
public class WeatherTool {
    
    @Tool(name = "getWeather", description = "Returns weather for a given city")
    public String getWeather(String city) {
        // 调用天气API或查询数据库
        return "The weather in " + city + " is 21°C and sunny.";
    }
}
```

### 2.4 重要里程碑：Spring AI Alibaba开源（2024年9月）

**2024年9月**，一个重要的生态项目诞生——**Spring AI Alibaba正式开源**。其定位非常清晰：基于Spring AI，向上做抽象和功能增强，与阿里云生态深度集成，服务国内Java开发者。

Spring AI Alibaba的诞生有其必然性：Spring AI在2024年2月发布了第一个公开版本后，阿里云团队看到了国内Java开发者的巨大需求。他们希望借助本地化服务、阿里巴巴的实践经验积累，以较快的演进节奏和国内活跃的贡献者社区，更好地服务Java开发者。

Spring AI Alibaba的核心贡献包括：
- **Graph多智能体框架**：借鉴LangGraph的设计理念，提供Java版的工作流和Multi-agent编排能力
- **阿里云生态集成**：与百炼平台、Nacos、Higress、ARMS等深度整合
- **企业级特性**：MCP分布式部署、提示词管理、可观测性等

### 2.5 1.0.0-M6：@Tool注解与MCP协议集成（2025年2月）

进入2025年，Spring AI的迭代明显加速。**1.0.0-M6版本**于**2025年2月**发布，带来了两项重要功能：

- **@Tool注解**：简化工具定义的声明式编程模型，开发者只需在方法上加`@Tool`注解即可将方法注册为LLM可调用的工具
- **MCP协议集成**：支持模型上下文协议（Model Context Protocol），标准化LLM与外部工具/资源的交互方式

**模型上下文协议（MCP）**于2024年11月由Anthropic推出，旨在标准化LLM与外部工具/资源的交互方式。Spring AI团队在MCP规范发布后迅速跟进，并将其Java SDK基础代码捐赠给了Anthropic。

### 2.6 1.0.0-M7：RAG模块独立与模块化架构（2025年4月）

**2025年4月**，**1.0.0-M7版本**发布。核心变更：

- **独立RAG模块**：检索增强生成功能被抽取为独立模块，提供更完整的文档ETL（提取、切分、嵌入）能力
- **模块化架构**：框架整体采用分层模块化设计，各功能独立（模型、向量存储、记忆、工具调用），按需加载

### 2.7 1.0.0-RC1：API锁定与生产准备（2025年5月13日）

**2025年5月13日**，**1.0.0-RC1版本**发布。这个版本标志着：

- **API锁定**：核心API基本稳定，不再进行破坏性变更
- **生产准备**：经过多个里程碑版本的迭代，框架已为生产环境做好准备


## 第三章：Spring AI 1.0 GA——稳定版里程碑（2025年5月）

### 3.1 1.0 GA正式发布

**北京时间2025年5月20日**，Spring AI官方团队宣布**1.0 GA版本正式发布**。这一天距离首个Milestone版本发布已过去一年多，期间经历了8个里程碑版本的迭代。

Spring AI 1.0的核心定位是：**简化AI集成，提供可移植的服务抽象，让开发者用Spring的方式构建AI应用**。

### 3.2 1.0版本的核心能力全景

#### 3.2.1 统一的模型抽象

Spring AI为多种AI模型提供商提供了开箱即用的支持：

| 模型类型 | 支持的提供商 |
|---------|-------------|
| **聊天模型** | OpenAI、Anthropic、Amazon Bedrock、Azure OpenAI、Google Gemini、阿里通义千问、DeepSeek、智谱AI、Ollama等20+ |
| **嵌入模型** | OpenAI、Azure、Ollama等 |
| **图像生成** | OpenAI DALL-E、Stability AI |
| **音频转录** | OpenAI Whisper |
| **文本转语音** | ElevenLabs等 |

开发者只需通过配置文件切换提供商，业务代码无需改动：

```yaml
spring:
  ai:
    openai:
      api-key: ${OPENAI_API_KEY}
      chat:
        model: gpt-4
    # 切换为Anthropic只需修改配置
    anthropic:
      api-key: ${ANTHROPIC_API_KEY}
```

#### 3.2.2 ChatClient：核心交互接口

`ChatClient`是Spring AI最核心的组件，设计上借鉴了`RestTemplate`和`WebClient`的流畅API风格。

```java
@RestController
public class ChatController {
    
    private final ChatClient chatClient;
    
    public ChatController(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }
    
    @GetMapping("/ask")
    public String ask(@RequestParam String question) {
        return chatClient.prompt()
                .user(question)
                .call()
                .content();
    }
}
```

`ChatClient`支持三种调用模式：
- **同步调用**：`call()`方法，阻塞等待结果
- **异步调用**：基于Reactor的Mono异步处理
- **流式调用**：返回Flux，支持SSE服务端推送

**流式响应示例**：
```java
@GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<ChatResponse> stream(@RequestParam String msg) {
    return chatClient.prompt()
            .user(msg)
            .stream()
            .chatResponse();  // 返回Flux，自动处理事件流
}
```

#### 3.2.3 提示模板（Prompt Templates）

类似Spring MVC中的视图模板，Spring AI提供了`PromptTemplate`机制，将提示词与代码分离，支持变量渲染和多角色消息组合。

```java
// 使用模板字符串
SystemPromptTemplate sysTpl = new SystemPromptTemplate("以{role}风格回答");
Message sysMsg = sysTpl.createMessage(Map.of("role", "技术专家"));
UserMessage userMsg = new UserMessage("解释Spring Boot自动装配");
Prompt prompt = new Prompt(List.of(sysMsg, userMsg));
String result = chatClient.prompt(prompt).call().content();
```

提示模板可以包含系统角色、用户角色、助手角色等多种消息类型，满足复杂提示工程需求。

#### 3.2.4 结构化输出

将AI模型的响应自动映射为Java对象（POJO），实现类型安全的处理。

```java
public record JokeResponse(String setup, String punchline) {}

public JokeResponse tellJoke(String type, String topic) {
    return chatClient.prompt()
            .user("Tell me a " + type + " joke about " + topic)
            .call()
            .entity(JokeResponse.class);  // 自动映射
}
```

结构化输出采用精心设计的提示，通常需要多次与模型交互以获得理想格式。Spring AI内部封装了这一复杂过程。

#### 3.2.5 检索增强生成（RAG）

Spring AI提供了完整的RAG支持，包括文档ETL（提取、切分、嵌入）、向量存储集成、检索与问答等。

**RAG流程**：
1. **文档预处理**：读取文档 → 分块 → 向量化 → 存入向量数据库
2. **问答过程**：用户问题 → 向量化 → 相似性检索 → 构建增强提示 → 调用LLM生成答案

```java
@Service
public class RagService {
    @Autowired private VectorStore vectorStore;
    @Autowired private ChatClient chatClient;
    
    public String query(String question) {
        List<Document> docs = vectorStore.similaritySearch(question);
        String context = docs.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n"));
        return chatClient.prompt()
            .user("根据以下内容回答：\n" + context + "\n问题：" + question)
            .call()
            .content();
    }
}
```

支持的向量数据库包括PGVector、Milvus、Pinecone、Redis、Chroma、Cassandra等20+主流向量数据库。

#### 3.2.6 对话记忆与上下文管理

`ChatMemory`接口提供了多轮对话历史存储的抽象，支持内存级、数据库级等多种实现。

```java
@Autowired private ChatMemory chatMemory;
@Autowired private ChatClient chatClient;

public String chat(String sessionId, String msg) {
    List<Message> history = chatMemory.get(sessionId);
    history.add(new UserMessage(msg));
    String reply = chatClient.prompt(new Prompt(history)).call().content();
    chatMemory.add(sessionId, new AssistantMessage(reply));
    return reply;
}
```

Spring AI默认提供`InMemoryChatMemory`的内存实现，开发者可以通过实现`ChatMemory`接口扩展为Redis、MySQL等持久化存储。

#### 3.2.7 多模态支持

支持文本、图像、音频等多种输入输出。

```java
UserMessage msg = new UserMessage("描述这张图片", 
    new Media(MimeTypeUtils.IMAGE_PNG, new ClassPathResource("photo.png")));
String description = chatClient.prompt(new Prompt(msg)).call().content();
```

#### 3.2.8 工具调用（Tool Calling）

将Java方法注册为工具，LLM可在适当时机调用这些方法执行业务逻辑。Spring AI会自动处理工具调用对话，包括工具定义、参数生成、结果返回等完整流程。

```java
@Component
public class OrderTools {
    
    @Tool(name = "query_order", description = "查询订单状态")
    public String queryOrder(@ToolParam(description = "订单号") String orderId) {
        // 调用业务服务
        return "订单状态：已发货";
    }
}
```

使用时只需在ChatClient中引用工具：
```java
chatClient.prompt()
    .user("查询订单ORD-001的状态")
    .tools("query_order")  // 注册工具
    .call();
```

#### 3.2.9 模型上下文协议（MCP）支持

Spring AI 1.0提供了完整的MCP客户端和服务器Spring Boot Starter，使模型能够便利地与外部工具交互。支持的MCP传输层包括：

- **HTTP+SSE**：传统流式传输
- **Streamable HTTP**（1.1.0-M1+）：有状态会话管理、可恢复性、重新投递，支持JDK Servlet、WebMVC和WebFlux多种实现

#### 3.2.10 可观测性

Spring AI在多个关键节点做了SDK默认埋点，记录运行过程中的metrics与tracing信息，包括模型调用、向量检索、工具调用等关键环节。tracing信息兼容OpenTelemetry，可接入Langfuse、阿里云ARMS等主流可观测平台。


## 第四章：生态爆发——Spring AI Alibaba的崛起（2024-2025）

### 4.1 Spring AI Alibaba的发展路线

自2024年9月开源以来，Spring AI Alibaba一直与Spring AI社区深度沟通合作，期间发布了多个Milestone版本，并与很多企业客户建立了深度合作关系。在交流过程中，团队看到了低代码开发模式的优势与限制，也看到了智能体开发从简单Demo走向生产上线过程中遇到的困难。

### 4.2 1.0 GA正式发布（2025年11月）

**2025年11月**，Spring AI Alibaba 1.0 GA版本正式发布。这个版本在继承Spring AI所有核心能力的基础上，重点打造了三大核心能力：

#### 4.2.1 Graph多智能体框架

Spring AI Alibaba Graph是社区的核心贡献之一，可以理解为Java版的LangGraph实现。它让开发者能够轻松构建工作流和多智能体应用。

**Graph核心能力**：
- **支持Multi-agent**：内置ReAct Agent、Supervisor等常规智能体模式
- **支持工作流**：内置工作流节点，与主流低代码平台对齐
- **Human-in-the-loop**：通过人类确认节点，支持修改状态、恢复执行
- **支持记忆与持久存储**
- **支持流程快照**
- **支持嵌套分支、并行分支**
- **PlantUML、Mermaid可视化导出**

Graph框架中提供大量预置结点，可以对标到市面上主流的如Dify、百炼等低代码平台，典型结点包括LlmNode（大模型节点）、QuestionClassifierNode（问题分类结点）、ToolNode（工具结点）等。

#### 4.2.2 企业级AI生态集成

Spring AI Alibaba通过与阿里云生态深度集成，提供了完整的企业级AI应用解决方案：

| 集成组件 | 功能 |
|---------|------|
| **百炼Dashscope** | 支持Qwen、Deepseek等主流模型系列 |
| **百炼AgentScope** | 低代码、高代码双向转换 |
| **百炼析言ChatBI** | 自然语言到SQL自动生成 |
| **Nacos MCP Registry** | MCP Server分布式注册与发现 |
| **Higress AI网关** | 模型代理、API到MCP转换 |
| **ARMS可观测** | OpenTelemetry兼容的链路追踪 |

**MCP Gateway**：基于Nacos实现MCP Server的分布式部署与负载均衡。对于存量Spring Cloud、Dubbo等应用，支持零代码改造实现API到MCP服务的发布。

#### 4.2.3 通用智能体探索

Spring AI Alibaba社区发布了基于框架实现的**JManus智能体**，对标OpenManus的通用智能体能力。目标是探索自主规划在智能体开发中的应用，为开发者提供从低代码、高代码到零代码构建智能体的更灵活选择。

### 4.3 AgentScope-Java：Agentic路线的探索（2025年9月）

**2025年9月**，阿里巴巴通义实验室开源的**AgentScope-Java**项目上线GitHub。与Spring AI Alibaba的Workflow路线不同，AgentScope-Java走的是**Agentic路线**——最大化利用基础大模型的能力，强调智能体的自主决策。

**AgentScope-Java发展路线**：
- **v0.2**（2025年9月）：已具备ReActAgent核心能力
- **v1.0**（计划2025年11月底）：新增RAG、Plan、Tracing、Evaluation及Studio等全套功能
- **未来**：Runtime v1.0将提供涵盖安全沙箱、A2A Agent在内的企业级落地方案

AgentScope-Java的推出标志着Java AI生态正在分化出不同的技术路线，满足不同场景的需求。


## 第五章：持续演进——Spring AI 1.1.x版本（2025-2026）

### 5.1 1.0.3：GraalVM原生镜像支持（2025年10月）

**2025年10月**，Spring AI发布了**1.0.3版本**，核心变更为支持GraalVM原生镜像。这一特性使得Spring AI应用可以编译为原生可执行文件，大幅降低启动时间和内存占用，更适合云原生和Serverless部署场景。

### 5.2 1.1.0-M3：MCP SDK升级与多文档支持（2025年10月）

**2025年10月15日**，**1.1.0-M3里程碑版本**发布。核心变更：

- **MCP SDK升级**：完善对模型上下文协议的支持
- **多文档支持**：改进文档ETL流程，支持更复杂的文档处理

### 5.3 1.1.0-M1的重大升级（2025年9月）

在1.1.0-M3之前，**1.1.0-M1**于**2025年9月**发布，包含多项重大改进：

- **Streamable HTTP传输支持**：有状态会话管理、可恢复性、重新投递，支持JDK Servlet、WebMVC和WebFlux多种实现
- **注解编程模型**：`@McpTool`、`@McpResource`、`@McpPrompt`等声明式开发
- **自动生命周期管理**：客户端/服务器初始化、资源清理、配置管理
- **安全集成**：OAuth2认证、Spring Security方法级注解支持

### 5.4 扩展的模型支持

在1.1.x系列中，Spring AI持续扩展对最新模型的支持：

- **Google GenAI SDK集成**：支持Gemini Pro、1.5 Pro和2.0 Flash模型
- **Anthropic Claude提示缓存**：成本降低高达90%
- **OpenAI GPT-5模型支持**：包括gpt-5、gpt-5-mini等新模型家族
- **ElevenLabs文本转语音**：完整集成，支持流式传输


## 第六章：Spring AI发展历程全景图

### 6.1 时间线总览

| 时间 | 事件 | 核心里程碑 |
|------|------|-----------|
| **2023** | Spring AI项目启动 | 内部孵化，确定设计理念 |
| **2024.02** | Spring AI 0.8.1 | 首个公开可用版本 |
| **2024.05** | 1.0.0-M1 | ChatClient API、结构化输出、对话记忆 |
| **2024.08** | 1.0.0-M2 | 提供商扩展、工具调用 |
| **2024.09** | Spring AI Alibaba开源 | 阿里云加入生态 |
| **2025.02** | 1.0.0-M6 | @Tool注解、MCP协议集成 |
| **2025.04** | 1.0.0-M7 | RAG模块独立、模块化架构 |
| **2025.05.13** | 1.0.0-RC1 | API锁定、生产准备 |
| **2025.05.20** | **Spring AI 1.0 GA** | 首个生产版本 |
| **2025.09** | AgentScope-Java开源 | Agentic路线新选择 |
| **2025.09** | Spring AI 1.1.0-M1 | Streamable HTTP、MCP增强 |
| **2025.10** | Spring AI 1.0.3 | GraalVM原生镜像支持 |
| **2025.10** | Spring AI 1.1.0-M3 | MCP SDK升级、多文档支持 |
| **2025.11** | **Spring AI Alibaba 1.0 GA** | Graph多智能体框架成熟 |
| **2025.12** | JManus发布 | 通用智能体探索 |
| **2026** | 持续演进 | 生态扩展，性能优化 |

### 6.2 版本演进图谱

```
2023                 2024                 2025                 2026
  |--------------------|--------------------|--------------------|
  |                    |                    |                    |
  |   Spring AI        |                    |                    |
  |   项目启动          |                    |                    |
  |                    | 0.8.1 (02)         | 1.0 GA (05)        | 1.1.x
  |                    | 1.0.0-M1 (05)      | 1.1.0-M1 (09)      |
  |                    | 1.0.0-M2 (08)      | 1.0.3 (10)         |
  |                    | 1.0.0-M6 (02/25)   | 1.1.0-M3 (10)      |
  |                    | 1.0.0-M7 (04/25)   |                    |
  |                    | 1.0.0-RC1 (05/25)  |                    |
  |                    |                    |                    |
  |                    | Spring AI Alibaba  |                    |
  |                    |   开源 (09)        | 1.0 GA (11)        | JManus
  |                    |                    |                    |
  |                    |                    | AgentScope-Java    |
  |                    |                    |   开源 (09)        | 1.0 (11)
```

### 6.3 架构分层演进

Spring AI的架构设计采用清晰的分层模块化结构：

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (Application)                  │
│  ChatClient API | Prompt Templates | Structured Output  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   集成层 (Integration)                   │
│  Spring Boot 自动配置 | 依赖注入                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   核心层 (Core)                         │
│  模型抽象 | 嵌入 | 向量存储 | 记忆                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   扩展层 (Extension)                     │
│  RAG | Agent | MCP | 工具调用 | 可观察性                │
└─────────────────────────────────────────────────────────┘
```


## 第七章：Spring AI与生态对比

### 7.1 Spring AI vs Spring AI Alibaba

| 维度 | Spring AI | Spring AI Alibaba |
|------|-----------|-------------------|
| **定位** | 通用AI开发标准，抽象统一AI操作接口 | 基于Spring AI，深度集成阿里云生态 |
| **核心功能** | 模型接入、提示词、RAG、记忆、工具调用、MCP | Graph多智能体、企业级生态集成、通用智能体探索 |
| **智能体能力** | 基础单智能体 | Graph工作流编排、Multi-agent |
| **生态集成** | 与Spring Boot无缝集成 | 百炼、Nacos、Higress、ARMS等 |
| **社区** | Spring官方社区 | Alibaba开源社区 + Spring生态 |

### 7.2 Spring AI vs LangChain4j vs LangChain

截至2026年初，主流Java AI框架的对比情况：

| 对比维度 | Spring AI | LangChain4J | LangChain (Python) |
|---------|-----------|-------------|---------------------|
| **Spring Boot集成** | 原生支持，自动配置 | 社区适配 | 不适用 |
| **统一抽象** | ChatClient统一API | 各功能独立抽象 | 模块化但无统一抽象 |
| **结构化输出** | 原生支持，POJO映射 | 需手动解析 | 有输出解析器 |
| **RAG** | 模块化RAG，20+向量库 | 支持 | 生态丰富 |
| **工具调用** | @Tool注解 | 函数定义 | 工具定义完善 |
| **MCP支持** | 官方支持 | 需集成 | 丰富生态 |
| **Agent能力** | 基础单智能体 | 有Agent概念 | 强大Agent生态 |
| **可观测性** | OpenTelemetry埋点 | 有限 | 丰富 |
| **学习曲线** | 平缓（Spring习惯） | 中等 | 陡峭 |
| **优势** | Spring深度集成、类型安全 | 功能丰富 | 生态最强大、社区成熟 |
| **局限** | Agent功能相对有限 | 与Spring集成度不足 | Python技术栈，对Java团队不友好 |

**对比结论**：Spring AI的最大优势是与Spring的自然整合、生产级能力和类型安全，适合企业级Java团队。Python框架如LangChain功能更强，但对Java团队集成成本高。


## 第八章：技术生态与社区发展

### 8.1 官方生态

- **Spring AI Playground**：官方社区开发的完整“前端UI+后端实现”示例，可以体验聊天机器人、多轮对话、图片生成、多模态、工具调用、MCP集成、RAG知识库等所有框架核心能力。

- **官方示例仓库**：提供丰富的源码示例，帮助开发者学习框架用法。

### 8.2 Spring AI Alibaba生态

- **JManus智能体**：基于Spring AI Alibaba实现的通用智能体，对标OpenManus。
- **MCP Gateway**：基于Nacos的MCP Server分布式注册与发现方案。
- **百炼析言ChatBI**：自然语言到SQL自动生成模块。

### 8.3 AgentScope生态

- **AgentScope-Java**：阿里巴巴通义实验室开源的Agentic智能体框架。
- **Runtime**：安全沙箱、A2A Agent等企业级落地方案。

### 8.4 两种技术路线的分化与融合

随着开源生态的发展，开放框架呈现出两种不同的发展趋势：

| 路线 | 代表框架 | 设计理念 | 适用场景 |
|------|---------|---------|---------|
| **Workflow路线** | Spring AI Alibaba Graph | 强调工作流编排，以相对固化的模式拆解任务，确定性强 | 意图识别、业务分类、确定性流程 |
| **Agentic路线** | AgentScope-Java | 最大化利用基础大模型能力，强调智能体自主决策 | 复杂推理、自主规划、开放场景 |

这两种不同的设计理念都会是企业的主流选择。未来，Spring AI Alibaba生态将会在底层全面支持AgentScope，实现两种路线的融合。


## 第九章：面试题库

### 5道难度递增的基础面试题

#### 第1题：Spring AI是什么？它与Spring生态有什么关系？

**难度**：⭐

**参考答案**：

Spring AI是Spring官方推出的用于AI应用开发的框架，旨在简化Java和Spring生态系统中AI驱动应用程序的开发。

**与Spring生态的关系**：
- 遵循Spring的设计哲学（依赖注入、模块化、POJO优先、自动配置）
- 提供Spring Boot Starter，通过`spring-ai-spring-boot-starter`实现自动配置
- 与现有Spring应用无缝集成，无需迁移技术栈
- 借鉴了Spring Data、Spring Integration等项目的设计经验

**核心价值**：让Java开发者用熟悉的方式构建AI应用，无需放弃已有的Spring生态。

#### 第2题：Spring AI的ChatClient是什么？有哪些核心功能？

**难度**：⭐⭐

**参考答案**：

`ChatClient`是Spring AI中最核心的组件，用于与聊天模型（如GPT、Claude）进行交互。

**设计特点**：
- 流畅API风格，类似`RestTemplate`和`WebClient`
- 支持同步、异步、流式三种调用模式
- 提供`prompt()`方法构建请求
- 支持`advisors()`添加拦截器链（RAG、记忆等）

**核心方法链**：
```java
chatClient.prompt()           // 构建请求
    .user("用户输入")          // 添加用户消息
    .system("系统提示词")       // 添加系统消息
    .options(ChatOptions)      // 设置模型参数
    .advisors(advisor)         // 添加顾问（RAG、记忆等）
    .tools(tool)               // 注册工具
    .call()                    // 执行调用（同步）
    .stream()                  // 流式调用
    .content()                 // 获取文本响应
    .entity(User.class)        // 获取类型安全的对象响应
```

#### 第3题：Spring AI中的RAG（检索增强生成）是如何实现的？用到哪些组件？

**难度**：⭐⭐⭐

**参考答案**：

RAG的实现流程分为两个阶段：

**阶段一：文档预处理（ETL）**
1. **文档加载**：从各类数据源（文件、数据库、网页）读取文档
2. **文本分块**：将长文档切分为合适大小的块，保留语义边界
3. **向量化**：通过嵌入模型（EmbeddingModel）将文本块转换为向量
4. **存储**：将向量存入向量数据库（VectorStore）

**阶段二：问答过程**
1. **用户问题向量化**：将用户问题转为向量
2. **相似性检索**：在向量数据库中查找最相似的文档块
3. **构建增强提示**：将检索到的文档块作为上下文，与用户问题拼接
4. **调用LLM生成答案**

**核心组件**：
- **VectorStore**：向量数据库抽象（PGVector、Milvus、Redis等20+）
- **EmbeddingModel**：嵌入模型接口
- **QuestionAnswerAdvisor**：RAG顾问，自动完成检索和上下文注入
- **DocumentReader**：文档读取器
- **DocumentTransformer**：文档转换器（分块、清洗等）

**代码示例**：
```java
@Service
public class RagService {
    @Autowired private VectorStore vectorStore;
    @Autowired private ChatClient chatClient;
    
    public String query(String question) {
        List<Document> docs = vectorStore.similaritySearch(question);
        String context = docs.stream()
            .map(Document::getContent)
            .collect(Collectors.joining("\n"));
        return chatClient.prompt()
            .user("根据以下内容回答：\n" + context + "\n问题：" + question)
            .call()
            .content();
    }
}
```

#### 第4题：Spring AI中的工具调用（Tool Calling）是如何工作的？@Tool注解的作用是什么？

**难度**：⭐⭐⭐⭐

**参考答案**：

工具调用机制允许大语言模型（LLM）调用外部API和业务服务，解决模型知识过时、无法访问外部数据的问题。

**工作流程**：
1. **工具定义**：在聊天请求中包含工具的定义（名称、描述、输入参数schema）
2. **模型决策**：LLM判断是否需要调用工具，如果需要则返回工具名和按schema构造的参数
3. **应用执行**：应用根据工具名识别并执行工具，传入参数
4. **结果返回**：应用将工具调用结果返回给模型
5. **最终生成**：模型用工具调用结果作为额外上下文生成最终回复

**@Tool注解的作用**：
- 简化工具定义的声明式编程模型
- 自动从方法签名生成工具描述和参数schema
- 支持`@ToolParam`注解描述参数含义

```java
@Component
public class WeatherTool {
    
    @Tool(name = "getWeather", description = "返回指定城市的天气")
    public String getWeather(
            @ToolParam(description = "城市名称") String city) {
        // 调用天气API
        return "The weather in " + city + " is 21°C and sunny.";
    }
}
```

**Spring AI的自动化处理**：框架会自动处理工具调用对话，开发者只需通过`tools()`方法在ChatClient中引用工具即可。

#### 第5题：Spring AI与Spring AI Alibaba有什么区别？Graph多智能体框架解决了什么问题？

**难度**：⭐⭐⭐⭐⭐

**参考答案**：

**区别与联系**：

| 维度 | Spring AI | Spring AI Alibaba |
|------|-----------|-------------------|
| **定位** | 通用AI开发标准，抽象统一AI操作接口 | 基于Spring AI，深度集成阿里云生态 |
| **核心能力** | 模型接入、提示词、RAG、记忆、工具调用 | Graph多智能体、企业级生态集成 |
| **智能体能力** | 基础单智能体 | 工作流编排、Multi-agent |
| **生态集成** | 与Spring Boot无缝集成 | 百炼、Nacos、Higress、ARMS |

**Graph多智能体框架解决的问题**[citation：7]：

当给模型的上下文和工具过多时，整体效果会变差，有时事情的走向会严重偏离预期。因此需要把复杂的问题拆解开来。Graph框架提供了两种拆解模式：

1. **工作流（Workflow）**：以相对固化的模式人为拆解任务，确定性强，模型作为流程中的结点起分类决策作用。适用于意图识别等类别属性强的场景。

2. **多智能体（Multi-agent）**：多个子智能体间通过通信协作完成复杂任务，在整个决策、执行流程上具备更多的自主性和灵活性。

**Graph核心能力**：
- 支持Multi-agent，内置ReAct Agent、Supervisor等模式
- 支持工作流，内置工作流节点，与低代码平台对齐
- Human-in-the-loop，支持人类确认、修改状态
- 支持记忆、持久存储、流程快照
- PlantUML/Mermaid可视化导出

**代码示例**：Graph框架让开发者可以用Java代码定义工作流，对应可视化绘制的流程图。


### 3道实战场景题

#### 场景1：企业知识库问答系统

**问题**：你负责为公司构建一个内部知识库问答系统，员工可以提问关于公司政策、产品文档、技术规范等问题。你将如何用Spring AI实现？

**考察点**：RAG实现、向量数据库选型、文档处理

**参考思路**：

**方案设计**：
1. **文档处理**：将各类文档（Word、PDF、Markdown）统一处理，分块存储
2. **向量数据库**：选择PGVector（如果已有PostgreSQL）或Milvus（大规模）
3. **问答流程**：RAG + LLM生成答案

**代码实现**：
```java
@Service
public class KnowledgeBaseService {
    
    private final VectorStore vectorStore;
    private final ChatClient chatClient;
    
    public String askQuestion(String question) {
        return chatClient.prompt()
                .user(question)
                .advisors(new QuestionAnswerAdvisor(vectorStore))
                .call()
                .content();
    }
}

// 文档导入
@EventListener(ApplicationReadyEvent.class)
public void initKnowledgeBase() {
    // 读取文档
    DocumentReader reader = new PagePdfDocumentReader("classpath:docs/*.pdf");
    List<Document> documents = reader.get();
    
    // 分块
    DocumentTransformer splitter = new TokenTextSplitter(500, 100);
    List<Document> chunks = splitter.apply(documents);
    
    // 存储到向量库
    vectorStore.add(chunks);
}
```

**关键考虑因素**：
- **分块策略**：在保留内容语义边界的前提下拆分文档
- **向量嵌入**：选择合适的嵌入模型
- **数据质量**：提前进行数据清洗

#### 场景2：智能客服Agent，支持工具调用和对话记忆

**问题**：你需要开发一个智能客服Agent，用户可以通过自然语言查询订单状态、修改配送地址、申请退款等。如何设计？

**考察点**：工具调用、多轮对话、Agent设计

**参考思路**：

**方案设计**：
1. **定义工具**：将订单查询、地址修改、退款申请等封装为@Tool方法
2. **记忆管理**：保存对话历史，实现上下文感知
3. **Agent流程**：LLM根据用户意图选择合适的工具

**代码实现**：
```java
@Component
public class OrderTools {
    
    @Autowired
    private OrderService orderService;
    
    @Tool(name = "query_order", description = "查询订单状态")
    public String queryOrder(@ToolParam(description = "订单号") String orderId) {
        Order order = orderService.findById(orderId);
        return "订单状态：" + order.getStatus();
    }
    
    @Tool(name = "change_address", description = "修改订单配送地址")
    public String changeAddress(
            @ToolParam(description = "订单号") String orderId,
            @ToolParam(description = "新地址") String newAddress) {
        orderService.updateAddress(orderId, newAddress);
        return "地址修改成功";
    }
}

@Service
public class CustomerServiceAgent {
    
    private final ChatClient chatClient;
    private final ChatMemory chatMemory = new InMemoryChatMemory();
    
    public String handleUserMessage(String userId, String message) {
        // 获取历史记录
        List<Message> history = chatMemory.get(userId);
        
        // 执行对话
        String reply = chatClient.prompt()
                .messages(history)  // 注入历史
                .user(message)
                .tools("query_order", "change_address", "apply_refund")
                .call()
                .content();
        
        // 保存新消息
        chatMemory.add(userId, new UserMessage(message));
        chatMemory.add(userId, new AssistantMessage(reply));
        
        return reply;
    }
}
```

**扩展考虑**：
- **记忆存储**：内存实现仅用于演示，生产环境可改用Redis+MySQL
- **数据漂移**：设置漂移阈值，超过后触发Lora微调
- **提示词设计**：包含角色定义、核心任务、规则约束、风格语气等组件

#### 场景3：使用Spring AI Alibaba Graph构建多智能体工作流

**问题**：你需要构建一个“用户评价分类”系统，自动对用户反馈进行分类（正面、负面、建议），并针对负面评价自动生成工单，针对建议转给产品团队。如何用Spring AI Alibaba Graph实现？

**考察点**：多智能体编排、工作流设计

**参考思路**：

**方案设计**：
1. **流程节点**：意图分类节点、正面评价处理节点、负面评价工单节点、建议转交节点
2. **状态管理**：在Graph State中维护评价内容和分类结果
3. **条件分支**：根据分类结果决定后续流程

**可视化工作流**：
```
[用户评价] → [分类节点] → 正面 → [正面处理节点] → [结束]
                     ↓
                   负面 → [工单创建节点] → [结束]
                     ↓
                   建议 → [产品团队转交] → [结束]
```

**代码实现**（基于Spring AI Alibaba Graph）：
```java
// 定义状态
@Data
public class ReviewState {
    private String reviewText;
    private String sentiment;
    private Ticket createdTicket;
    private String productFeedback;
}

// 构建Graph
Graph<ReviewState> graph = GraphBuilder.<ReviewState>builder()
    .addNode("classifier", new LlmNode<ReviewState>(chatModel) {
        @Override
        protected void process(ReviewState state) {
            String sentiment = classifySentiment(state.getReviewText());
            state.setSentiment(sentiment);
        }
    })
    .addNode("positive_handler", new PositiveHandlerNode())
    .addNode("negative_handler", new TicketCreationNode())
    .addNode("suggestion_handler", new ProductTeamNode())
    .addEdge("classifier", "positive_handler", 
        state -> "positive".equals(state.getSentiment()))
    .addEdge("classifier", "negative_handler",
        state -> "negative".equals(state.getSentiment()))
    .addEdge("classifier", "suggestion_handler",
        state -> "suggestion".equals(state.getSentiment()))
    .build();

// 执行工作流
ReviewState state = new ReviewState();
state.setReviewText("这个产品质量很好，但客服响应有点慢，建议增加在线客服");
graph.execute(state);

// 根据结果执行后续操作
if (state.getCreatedTicket() != null) {
    ticketService.process(state.getCreatedTicket());
}
if (state.getProductFeedback() != null) {
    feedbackService.sendToProductTeam(state.getProductFeedback());
}
```

**Graph框架优势**：
- **Human-in-the-loop**：支持人工确认关键节点
- **可视化导出**：可生成PlantUML/Mermaid流程图
- **持久存储**：支持流程快照和恢复
- **并行分支**：支持嵌套分支、并行处理


## 结语

从2023年萌芽到2026年成熟，Spring AI走过了一条令人惊叹的演进之路。两年多的时间里，它从一个实验性项目成长为Java开发者构建AI应用的首选框架：

- **2023年**：项目启动，奠定设计理念
- **2024年**：快速迭代，核心能力成型，生态初现
- **2025年**：1.0 GA发布，生态全面扩展，多路线分化
- **2026年**：智能体时代，Graph框架与Agentic路线并行发展

Spring AI的成功，不仅仅在于它提供了多模型接入、RAG、工具调用等功能，更在于它**将Spring的设计哲学引入了AI工程领域**——让Java开发者可以用熟悉的方式、在熟悉的生态中，构建生产就绪的AI应用。

与此同时，Spring AI Alibaba、AgentScope-Java等生态项目的蓬勃发展，也为国内Java开发者提供了更丰富的选择。无论是追求Workflow路线的Spring AI Alibaba Graph，还是Agentic路线的AgentScope-Java，都在各自的领域持续进化。

正如Anthropic在《Building Effective AI Agents》中所言：简单性和可组合性比复杂的框架更重要。Spring AI正是这一理念的最佳实践——它足够简单，让开发者快速上手；它足够可组合，让开发者根据需求灵活搭建。

未来，随着AI技术的持续演进，Spring AI必将与整个Java生态一起，走向更广阔的天地。


**参考资料**：
1. Spring AI 版本演进与核心功能. CSDN文库. 
2. Spring AI Alibaba官网：AI Concepts. 
3. Spring AI Alibaba博客：AgentScope与Spring AI Alibaba定位. 
4. 阿里云开发者社区：Spring AI面试题示例. 
5. 深入Spring AI：架构与应用. CSDN博客. 
6. Spring AI框架：企业级AI开发指南. 百度开发者中心. 
7. Spring AI Alibaba官网概览. 
8. Spring AI应用开发面试解析. CSDN博客. 
9. 盤一盤 SpringAI 現在發展得怎麼樣了？ CodeLove. 