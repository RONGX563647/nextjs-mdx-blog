'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Maximize, 
  Minimize, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  MonitorPlay,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  Filter,
  ChevronDown,
  Grid3X3,
  List,
  SkipBack,
  SkipForward
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface VideoEpisode {
  id: number
  title: string
  duration?: string
  isWatched?: boolean
  progress?: number
}

interface EnhancedBilibiliPlayerProps {
  bvid: string
  title?: string
  totalEpisodes?: number
}

// localStorage keys
const getWatchedKey = (bvid: string) => `bilibili_watched_episodes_${bvid}`
const getLastEpisodeKey = (bvid: string) => `bilibili_last_episode_${bvid}`
const getPlaybackProgressKey = (bvid: string) => `bilibili_playback_progress_${bvid}`

// Java基础视频选集 (BV17F411T7Ao)
const javaBasicVideoTitles: string[] = [
  'Java入门-01-Java学习介绍',
  'Java入门-02-人机交互-图形化界面的小故事',
  'Java入门-03-打开CMD',
  'Java入门-04-常见的CMD命令',
  'Java入门-05-练习-利用CMD打开QQ并配置环境变量',
  'Java入门-06-Java概述和学习方法',
  'Java入门-07-Java学习-JDK下载和安装',
  'Java入门-08-Java学习-HelloWorld小案例',
  'Java入门-09-Java学习-常见小问题',
  'Java入门-10-Java学习-环境变量',
  'Java入门-11-Java学习-Notepad',
  'Java入门-12-Java学习-Java语言的发展',
  'Java入门-13-Java学习-Java能干什么',
  'Java入门-14-Java学习-Java为什么这么火',
  'Java入门-15-Java学习-Java跨平台的原理',
  'Java入门-16-JDK和JRE',
  'Java基础概念-01-02-注释和关键字',
  'Java基础概念-03-字面量',
  'Java基础概念-04-变量-基本用法',
  'Java基础概念-05-变量-使用方式和注意事项',
  'Java基础概念-06-变量练习-计算公交车的人数',
  'Java基础概念-07-计算机中的数据存储',
  'Java基础概念-08-数据类型',
  'Java基础概念-09-定义变量的三个练习',
  'Java基础概念-10-标识符',
  'Java基础概念-11-键盘录入',
  'Java基础概念-12-idea的概述和下载安装',
  'Java基础概念-13-idea中的第一个代码',
  'Java基础概念-14-AI工具和IDEA的相关设置',
  '运算符-01-03-算术运算符详解和综合练习',
  '运算符-04-05-隐式转换和强制转换',
  '运算符-06-字符串和字符的加操作',
  '运算符-07-自增自减运算符-基本使用',
  '运算符-08-赋值运算符和关系运算符',
  '运算符-09-四种逻辑运算符',
  '运算符-10-短路逻辑运算符',
  '运算符-11-三元运算符和运算符的优先级',
  '运算符-12-多学一招原码反码补码',
  '判断和循环-01-流程控制语句-顺序结构',
  '判断和循环-02-if第一种格式和注意事项加练习',
  '判断和循环-03-if的第二种格式和练习',
  '判断和循环-04-if的第三种格式',
  '判断和循环-05-switch语句和练习',
  '判断和循环-06-switch的扩展知识点和练习',
  '判断和循环-07-循环语句-for循环格式和练习',
  '判断和循环-08-for循环练习-累加思想和统计思想',
  '判断和循环-09-循环语句-while',
  '判断和循环-10-两道力扣算法题和do...while循环',
  '循环高级综合练习-01-无限循环和跳转控制语句',
  '循环高级综合练习-02-逢七过',
  '循环高级综合练习-03-平方根',
  '循环高级综合练习-04-判断是否为质数',
  '循环高级综合练习-05-猜数字小游戏',
  '数组-01-数组的概述和静态初始化',
  '数组-02-数组的地址值和元素访问',
  '数组-03-数组的遍历和三道综合练习',
  '数组-04-数组的动态初始化和常见问题',
  '数组-05-数组练习1-求最值',
  '数组-06-数组练习2-求和并统计个数',
  '数组-07-数组练习3-交换数据',
  '数组-08-数组练习4-打乱数据',
  '数组-09-数组的内存图',
  '方法-01-什么是方法？',
  '方法-02-最简单的方法定义和调用',
  '方法-03-带参数的方法定义和调用',
  '方法-04-带返回值方法的定义和调用',
  '方法-05-方法的小结',
  '方法-06-方法的重载',
  '方法-07-方法的三个练习：遍历求最大值和判断是否存在',
  '方法-08-方法练习-拷贝数组',
  '方法-09-方法的基本内存原理',
  '方法-10-什么是基本数据类型和引用数据类型',
  '方法-11-方法的值传递',
  '综合练习-01~02-买飞机票和找质数',
  '综合练习-03~04-开发验证码和数组元素的复制',
  '综合练习-05-评委打分',
  '综合练习-06-数字加密和解密',
  '综合练习-07-抽奖的两种实现方式',
  '面向对象-01-面向对象介绍',
  '面向对象-02-类和对象',
  '面向对象-03-封装',
  '面向对象-04-构造方法',
  '面向对象-05-标准JavaBean',
  '面向对象-06-对象内存图',
  '面向对象-07-this关键字',
  '面向对象-08-成员变量和局部变量',
  '面向对象-09-综合练习-文字版格斗游戏',
  '面向对象-10-综合练习-两个对象数组练习',
  '面向对象-11-综合练习-对象数组练习3和4',
  '面向对象-12-综合练习-键盘录入',
  '字符串-01-API和API帮助文档',
  '字符串-02-String概述',
  '字符串-03-String构造方法',
  '字符串-04-String成员方法-比较',
  '字符串-05-String成员方法-遍历、替换、截取',
  '字符串-06-StringBuilder概述',
  '字符串-07-StringBuilder构造方法和成员方法',
  '字符串-08-StringJoiner',
  '字符串-09-字符串原理-扩展底层原理1',
  '字符串-10-字符串原理-扩展底层原理2和3',
  '字符串-11-综合练习-01-转换罗马数字',
  '字符串-12-综合练习-02-调整字符串',
  '字符串-13-综合练习-03-打乱字符串',
  '字符串-14-综合练习-04-生成验证码',
  '集合-01-集合体系结构',
  '集合-02-Collection集合-常用方法',
  '集合-03-Collection集合-遍历方式',
  '集合-04-List集合-特点和特有方法',
  '集合-05-List集合-五种遍历方式',
  '集合-06-数据结构-栈和队列',
  '集合-07-数据结构-数组和链表',
  '集合-08-ArrayList集合-底层原理',
  '集合-09-LinkedList集合',
  '集合-10-泛型-概述',
  '集合-11-泛型-细节',
  '集合-12-泛型-通配符',
  '集合-13-Set集合-概述',
  '集合-14-Set集合-HashSet',
  '集合-15-Set集合-LinkedHashSet',
  '集合-16-Set集合-TreeSet',
  '集合-17-双列集合-Map集合-特点',
  '集合-18-双列集合-Map集合-常用方法',
  '集合-19-双列集合-Map集合-遍历方式',
  '集合-20-双列集合-HashMap',
  '集合-21-双列集合-LinkedHashMap',
  '集合-22-双列集合-TreeMap',
  '集合-23-可变参数',
  '集合-24-综合练习-01-随机点名器',
  '集合-25-综合练习-02-带有概率的随机点名',
  '集合-26-综合练习-03-集合嵌套',
  '集合-27-综合练习-04-斗地主发牌',
  '集合-28-综合练习-05-斗地主发牌2',
  '集合-29-Stream流-初体验',
  '集合-30-Stream流-生成方式',
  '集合-31-Stream流-中间方法',
  '集合-32-Stream流-终结方法',
  '集合-33-方法引用-概述',
  '集合-34-方法引用-引用静态方法',
  '集合-35-方法引用-引用成员方法',
  '集合-36-方法引用-引用构造方法',
  '集合-37-方法引用-其他调用方式',
  '异常-01-异常-概述',
  '异常-02-异常-体系介绍',
  '异常-03-异常-作用',
  '异常-04-异常-处理方式-throws',
  '异常-05-异常-处理方式-try...catch',
  '异常-06-异常-常见方法',
  '异常-07-异常-综合练习',
  '异常-08-异常-自定义异常',
  'File-01-File-概述和构造方法',
  'File-02-File-成员方法-判断和获取',
  'File-03-File-成员方法-创建和删除',
  'File-04-File-成员方法-获取并遍历',
  'File-05-File-综合练习-01-创建文件夹',
  'File-06-File-综合练习-02-查找文件',
  'File-07-File-综合练习-03-删除多级文件夹',
  'File-08-File-综合练习-04-统计文件大小',
  'IO流-01-IO流-概述和分类',
  'IO流-02-IO流-字节流-书写和读取',
  'IO流-03-IO流-字节流-文件拷贝',
  'IO流-04-IO流-字节流-文件拷贝的弊端',
  'IO流-05-IO流-字节流-一次读取多个字节',
  'IO流-06-IO流-字符流-编码表',
  'IO流-07-IO流-字符流-书写和读取',
  'IO流-08-IO流-字符流-书写和读取2',
  'IO流-09-IO流-字符流-拷贝文件',
  'IO流-10-IO流-字符流-缓冲区',
  'IO流-11-IO流-字节流和字符流的使用场景',
  'IO流-12-IO流-综合练习-01-拷贝文件夹',
  'IO流-13-IO流-综合练习-02-文件加密',
  'IO流-14-IO流-综合练习-03-数字排序',
  'IO流-15-IO流-综合练习-04-软件运行次数',
  'IO流-16-IO流-高级流-缓冲流-字节缓冲流',
  'IO流-17-IO流-高级流-缓冲流-字符缓冲流',
  'IO流-18-IO流-高级流-转换流-概述和分类',
  'IO流-19-IO流-高级流-转换流-书写和读取',
  'IO流-20-IO流-高级流-序列化流和反序列化流',
  'IO流-21-IO流-高级流-打印流',
  'IO流-22-IO流-高级流-解压缩流和压缩流',
  'IO流-23-IO流-高级流-Commons-io',
  'IO流-24-IO流-高级流-hutool工具包',
  'IO流-25-IO流-综合练习-01-网络爬虫',
  'IO流-26-IO流-综合练习-02-利用糊涂包生成假数据',
  'IO流-27-IO流-综合练习-03-带权重的随机',
  'IO流-28-IO流-综合练习-04-多线程下载',
  '多线程-01-多线程-概述',
  '多线程-02-多线程-并发和并行',
  '多线程-03-多线程-多线程的实现方式-继承Thread类',
  '多线程-04-多线程-多线程的实现方式-实现Runnable接口',
  '多线程-05-多线程-多线程的实现方式-实现Callable接口',
  '多线程-06-多线程-常见的成员方法',
  '多线程-07-多线程-线程的生命周期',
  '多线程-08-多线程-线程安全问题-同步代码块',
  '多线程-09-多线程-线程安全问题-同步方法',
  '多线程-10-多线程-线程安全问题-Lock锁',
  '多线程-11-多线程-死锁',
  '多线程-12-多线程-等待唤醒机制',
  '多线程-13-多线程-等待唤醒机制-阻塞队列',
  '多线程-14-多线程-线程的状态',
  '多线程-15-多线程-综合练习-01-抽奖',
  '多线程-16-多线程-综合练习-02-多线程下载',
  '多线程-17-多线程-线程池-概述',
  '多线程-18-多线程-线程池-自定义线程池',
  '多线程-19-多线程-线程池-最大并行数',
  '网络编程-01-网络编程三要素-概述',
  '网络编程-02-网络编程三要素-IP',
  '网络编程-03-网络编程三要素-端口号',
  '网络编程-04-网络编程三要素-协议',
  '网络编程-05-UDP-发送端',
  '网络编程-06-UDP-接收端',
  '网络编程-07-UDP-练习-聊天室',
  '网络编程-08-UDP-三种通讯方式-单播、组播、广播',
  '网络编程-09-TCP-客户端',
  '网络编程-10-TCP-服务器',
  '网络编程-11-TCP-练习-多发多收',
  '网络编程-12-TCP-练习-接收并反馈',
  '网络编程-13-TCP-练习-上传文件',
  '网络编程-14-TCP-练习-上传文件-优化',
  '网络编程-15-TCP-练习-BS架构',
  '反射-01-反射-概述',
  '反射-02-反射-获取class对象',
  '反射-03-反射-获取构造方法',
  '反射-04-反射-获取成员变量',
  '反射-05-反射-获取成员方法',
  '反射-06-反射-综合练习-01-保存任意对象数据',
  '反射-07-反射-综合练习-02-利用反射动态的创建对象并执行方法',
  '动态代理-01-动态代理-概述',
  '动态代理-02-动态代理-代码实现',
  '动态代理-03-动态代理-扩展-增强方法',
  '动态代理-04-动态代理-扩展-增强方法2',
  '动态代理-05-动态代理-扩展-无侵入式编程',
  'JUnit-01-JUnit-概述和基本使用',
  'JUnit-02-JUnit-常用注解',
  'JUnit-03-JUnit-断言',
]

// Web开发视频选集 (BV1yGydYEE3H)
const javaWebVideoTitles: string[] = [
  '01.Web开发-导学视频',
  '02.Web前端开发初识',
  '03.HTML-CSS-入门程序',
  '04.HTML-CSS-VsCode开发工具',
  '05.HTML-CSS-常见标签和样式-央视新闻-标题-排版',
  '06.HTML-CSS-常见标签和样式-央视新闻-标题-样式',
  '07.HTML-CSS-常见标签和样式-央视新闻-标题-样式(选择器)',
  '08.HTML-CSS-常见标签和样式-央视新闻-正文-排版',
  '09.HTML-CSS-常见标签和样式-央视新闻-正文-样式',
  '10.HTML-CSS-常见标签和样式-央视新闻-整体布局',
  '11.HTML-CSS-常见标签和样式-tlias案例-顶部导航栏',
  '12.HTML-CSS-常见标签和样式-表单标签',
  '13.HTML-CSS-常见标签和样式-表单项标签',
  '14.HTML-CSS-常见标签和样式-tlias案例-搜索表单区域',
  '15.HTML-CSS-常见标签和样式-tlias案例-底部版权区域',
  '16.HTML-CSS-课程总结',
  '17.JS-课程介绍',
  '18.JS-核心语法-引入方式',
  '19.JS-核心语法-变量&数据类型',
  '20.JS-核心语法-函数',
  '21.JS-核心语法-自定义对象&JSON',
  '22.JS-核心语法-DOM',
  '23.JS-事件监听-语法&常见事件',
  '24.JS-事件监听-常见事件(优化-JS模块化)',
  '25.Vue-快速入门',
  '26.Vue-常用指令-v-for',
  '27.Vue-常用指令-v-bind&v-if&v-show',
  '28.Vue-常用指令-v-model与v-on',
  '29.Ajax-入门',
  '30.Ajax-案例',
  '31.Maven-课程介绍',
  '32.Maven-概述-介绍&安装',
  '33.Maven-IDEA集成',
  '34.Maven-依赖管理',
  '35.单元测试-概述&入门',
  '36.单元测试-断言&常见注解',
  '37.单元测试-企业开发规范&AI生成生成单元测试',
  '38.单元测试-Maven依赖范围',
  '39.Maven-常见问题解决方案',
  '40.Web基础-课程安排',
  '41.Web基础-SpringBootWeb入门-入门程序',
  '42.Web基础-SpringBootWeb入门-入门解析',
  '43.Web基础-HTTP协议-概述',
  '44.Web基础-HTTP协议-请求协议',
  '45.Web基础-HTTP协议-响应协议',
  '46.Web基础-SpringBootWeb案例',
  '47.Web基础-分层解耦-三层架构',
  '48.Web基础-分层解耦-IOC与DI入门',
  '49.Web基础-分层解耦-IOC&DI详解',
  '50.MySQL-课程介绍',
  '51.MySQL-概述-安装&数据模型',
  '52.MySQL-SQL-DDL-数据库操作&图形化工具',
  '53.MySQL-SQL-DDL-表操作-创建表',
  '54.MySQL-SQL-DDL-表操作-数据类型',
  '55.MySQL-SQL-DDL-表操作-设计表案例',
  '56.MySQL-SQL-DDL-表操作-查询-修改-删除',
  '57.MySQL-SQL-DML-insert&update&delete',
  '58.MySQL-SQL-DQL-基本查询',
  '59.MySQL-SQL-DQL-条件查询',
  '60.MySQL-SQL-DQL-分组查询',
  '61.MySQL-SQL-DQL-排序查询&分页查询',
  '62.JDBC-入门程序',
  '63.JDBC-执行DQL语句',
  '64.JDBC-预编译SQL',
  '65.Mybatis-入门程序',
  '66.Mybatis-辅助配置&JDBC VS Mybatis',
  '67.Mybatis-数据库连接池',
  '68.Mybatis-增删改查-删除操作',
  '69.Mybatis-增删改查-新增操作',
  '70.Mybatis-增删改查-更新操作',
  '71.Mybatis-增删改查-查询操作',
  '72.Mybatis-XML映射配置',
  '73.SpringBoot项目配置文件',
  '74.准备工作-开发规范-开发模式',
  '75.准备工作-开发规范-Restful',
  '76.准备工作-工程搭建',
  '77.部门管理-列表查询-接口开发',
  '78.部门管理-列表查询-结果封装',
  '79.部门管理-列表查询-前后端联调测试',
  '80.部门管理-删除部门-接口开发',
  '81.部门管理-新增部门-接口开发',
  '82.部门管理-修改部门-查询回显',
  '83.部门管理-修改部门-修改数据',
  '84.日志技术-Logback入门程序',
  '85.日志技术-Logback配置文件&日志级别',
  '86.员工管理-分页查询-分析',
  '87.员工管理-分页查询-实现',
  '88.员工管理-分页查询-PageHelper插件',
  '89.员工管理-分页查询-前后端联调',
  '90.员工管理-条件分页查询',
  '91.员工管理-新增员工-分析',
  '92.员工管理-新增员工-实现',
  '93.文件上传-简介&前端三要素',
  '94.文件上传-服务端接收文件',
  '95.文件上传-本地存储',
  '96.文件上传-阿里云OSS-概述',
  '97.文件上传-阿里云OSS-入门',
  '98.文件上传-阿里云OSS-集成',
  '99.员工管理-修改员工',
  '100.员工管理-查询回显',
  '101.登录认证-概述',
  '102.登录认证-登录功能',
  '103.登录认证-登录校验-概述',
  '104.登录认证-登录校验-JWT令牌',
  '105.登录认证-登录校验-JWT令牌-生成',
  '106.登录认证-登录校验-JWT令牌-校验',
  '107.登录认证-登录校验-过滤器Filter',
  '108.登录认证-登录校验-拦截器Interceptor',
  '109.登录认证-登录校验-全局异常处理',
  '110.事务管理-事务回顾&Spring事务管理',
  '111.事务管理-事务进阶-事务属性',
  '112.AOP-基础-概述',
  '113.AOP-基础-核心概念',
  '114.AOP-基础-快速入门',
  '115.AOP-基础-AOP工作流程',
  '116.AOP-进阶-通知类型',
  '117.AOP-进阶-通知顺序',
  '118.AOP-进阶-切入点表达式-execution',
  '119.AOP-进阶-切入点表达式-@annotation',
  '120.AOP-进阶-连接点',
  '121.AOP-案例-记录操作日志',
  '122.项目部署-概述',
  '123.项目部署-多环境配置',
  '124.项目部署-项目打包',
  '125.项目部署-部署',
]

// 视频选集映射表
const videoTitlesMap: Record<string, string[]> = {
  'BV17F411T7Ao': javaBasicVideoTitles,
  'BV1yGydYEE3H': javaWebVideoTitles,
}

// 获取视频选集
const getVideoTitles = (bvid: string): string[] => {
  return videoTitlesMap[bvid] || javaBasicVideoTitles
}

// 生成视频数据
const generateEpisodes = (bvid: string, total: number): VideoEpisode[] => {
  const titles = getVideoTitles(bvid)
  return Array.from({ length: Math.min(total, titles.length) }, (_, i) => {
    const id = i + 1
    return {
      id,
      title: titles[i] || `第${id}集`,
      duration: '',
    }
  })
}

export function EnhancedBilibiliPlayer({ 
  bvid, 
  title = '视频教程',
  totalEpisodes = 200 
}: EnhancedBilibiliPlayerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentEpisode, setCurrentEpisode] = useState(1)
  const [watchedEpisodes, setWatchedEpisodes] = useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showFilter, setShowFilter] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'watched' | 'unwatched'>('all')
  const [mounted, setMounted] = useState(false)
  const [isPreview, setIsPreview] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // 使用useMemo缓存episodes，避免重复生成
  const episodes = useMemo(() => generateEpisodes(bvid, totalEpisodes), [bvid, totalEpisodes])

  // 获取当前视频的localStorage key
  const watchedKey = useMemo(() => getWatchedKey(bvid), [bvid])
  const lastEpisodeKey = useMemo(() => getLastEpisodeKey(bvid), [bvid])

  useEffect(() => {
    setMounted(true)
    // 从localStorage读取当前视频的观看记录
    const savedWatched = localStorage.getItem(watchedKey)
    if (savedWatched) {
      setWatchedEpisodes(new Set(JSON.parse(savedWatched)))
    }
    const savedLastEpisode = localStorage.getItem(lastEpisodeKey)
    if (savedLastEpisode) {
      setCurrentEpisode(parseInt(savedLastEpisode, 10))
    }
  }, [watchedKey, lastEpisodeKey])

  // 过滤和搜索
  const filteredEpisodes = useMemo(() => {
    let result = episodes

    // 搜索过滤
    if (searchQuery) {
      result = result.filter(ep => 
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.id.toString().includes(searchQuery)
      )
    }

    // 观看状态过滤
    if (filterType === 'watched') {
      result = result.filter(ep => watchedEpisodes.has(ep.id))
    } else if (filterType === 'unwatched') {
      result = result.filter(ep => !watchedEpisodes.has(ep.id))
    }

    return result
  }, [episodes, searchQuery, filterType, watchedEpisodes])

  // 自动滚动到当前集
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const element = document.getElementById(`episode-${bvid}-${currentEpisode}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [isOpen, currentEpisode, bvid])

  const handleOpen = useCallback(() => {
    setIsOpen(true)
    setIsPreview(true)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setIsFullscreen(false)
    setIsPreview(false)
  }, [])

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const handleEpisodeChange = useCallback((episodeId: number) => {
    setCurrentEpisode(episodeId)
    localStorage.setItem(lastEpisodeKey, episodeId.toString())
    
    // 保存观看记录
    const newWatched = new Set(watchedEpisodes)
    newWatched.add(episodeId)
    setWatchedEpisodes(newWatched)
    localStorage.setItem(watchedKey, JSON.stringify(Array.from(newWatched)))
    
    setIsPreview(false)
  }, [watchedEpisodes, watchedKey, lastEpisodeKey])

  const handlePrevEpisode = useCallback(() => {
    if (currentEpisode > 1) {
      handleEpisodeChange(currentEpisode - 1)
    }
  }, [currentEpisode, handleEpisodeChange])

  const handleNextEpisode = useCallback(() => {
    if (currentEpisode < episodes.length) {
      handleEpisodeChange(currentEpisode + 1)
    }
  }, [currentEpisode, episodes.length, handleEpisodeChange])

  const handleQuickJump = useCallback((episodeId: number) => {
    if (episodeId >= 1 && episodeId <= episodes.length) {
      handleEpisodeChange(episodeId)
    }
  }, [episodes.length, handleEpisodeChange])

  const handleResetProgress = useCallback(() => {
    localStorage.removeItem(watchedKey)
    localStorage.removeItem(lastEpisodeKey)
    setWatchedEpisodes(new Set())
    setCurrentEpisode(1)
  }, [watchedKey, lastEpisodeKey])

  // 生成B站嵌入URL
  const embedUrl = useMemo(() => {
    return `https://player.bilibili.com/player.html?bvid=${bvid}&page=${currentEpisode}&high_quality=1&danmaku=0&autoplay=${isPreview ? 0 : 1}`
  }, [bvid, currentEpisode, isPreview])

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border-pink-500/30"
      >
        <MonitorPlay className="h-4 w-4 mr-2" />
        视频教程
      </Button>
    )
  }

  const progress = episodes.length > 0 ? Math.round((watchedEpisodes.size / episodes.length) * 100) : 0

  return (
    <>
      {/* 触发按钮 */}
      <Button
        onClick={handleOpen}
        variant="secondary"
        size="sm"
        className="bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 border-pink-500/30"
      >
        <MonitorPlay className="h-4 w-4 mr-2" />
        视频教程
        {watchedEpisodes.size > 0 && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {progress}%
          </Badge>
        )}
      </Button>

      {/* 视频播放器弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)' }}
              onClick={handleClose}
            />

            {/* 播放器容器 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                position: 'relative',
                width: isFullscreen ? '100%' : '95%',
                height: isFullscreen ? '100%' : '90%',
                maxWidth: isFullscreen ? '100%' : '1400px',
                maxHeight: isFullscreen ? '100%' : '900px',
                zIndex: 1,
              }}
              className="bg-background rounded-xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* 头部工具栏 */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <MonitorPlay className="h-5 w-5 text-pink-500" />
                  <div>
                    <h3 className="text-lg font-semibold truncate max-w-md">{title}</h3>
                    <p className="text-xs text-muted-foreground">
                      第 {currentEpisode} 集 / 共 {episodes.length} 集
                      {watchedEpisodes.size > 0 && ` · 已观看 ${watchedEpisodes.size} 集`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* 进度重置 */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleResetProgress}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    重置进度
                  </Button>
                  {/* 全屏按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFullscreen}
                    className="hover:bg-muted"
                  >
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                  </Button>
                  {/* 关闭按钮 */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 主体内容 */}
              <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* 主播放器区域 */}
                <div className="flex-1 relative bg-black flex flex-col">
                  {/* 视频播放器 */}
                  <div className="flex-1 relative">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      style={{ border: 'none' }}
                    />
                    
                    {/* 预览遮罩 */}
                    {isPreview && (
                      <div 
                        className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                        onClick={() => setIsPreview(false)}
                      >
                        <div className="text-center">
                          <div className="w-20 h-20 rounded-full bg-pink-500/90 flex items-center justify-center mb-4 mx-auto hover:scale-110 transition-transform">
                            <Play className="h-10 w-10 text-white ml-1" />
                          </div>
                          <p className="text-white text-lg font-medium">点击开始播放</p>
                          <p className="text-white/70 text-sm mt-1">第 {currentEpisode} 集</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 播放控制栏 */}
                  <div className="bg-muted/30 border-t border-border p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrevEpisode}
                        disabled={currentEpisode === 1}
                      >
                        <SkipBack className="h-4 w-4 mr-1" />
                        上一集
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNextEpisode}
                        disabled={currentEpisode === episodes.length}
                      >
                        下一集
                        <SkipForward className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                    
                    {/* 快速跳转 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">跳转到</span>
                      <Input
                        type="number"
                        min={1}
                        max={episodes.length}
                        placeholder="集数"
                        className="w-20 h-8 text-center"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const value = parseInt((e.target as HTMLInputElement).value)
                            handleQuickJump(value)
                          }
                        }}
                      />
                      <span className="text-sm text-muted-foreground">集</span>
                    </div>
                  </div>
                </div>

                {/* 侧边栏 - 选集区域 */}
                {!isFullscreen && (
                  <div className="w-full lg:w-96 border-l border-border bg-muted/20 flex flex-col">
                    {/* 搜索和筛选 */}
                    <div className="p-4 border-b border-border space-y-3">
                      {/* 搜索框 */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="搜索集数或标题..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      
                      {/* 筛选和视图切换 */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFilter(!showFilter)}
                          className={showFilter ? 'text-pink-500' : ''}
                        >
                          <Filter className="h-4 w-4 mr-1" />
                          筛选
                          <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showFilter ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                            onClick={() => setViewMode('list')}
                          >
                            <List className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 ${viewMode === 'grid' ? 'bg-background shadow-sm' : ''}`}
                            onClick={() => setViewMode('grid')}
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* 筛选选项 */}
                      <AnimatePresence>
                        {showFilter && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex gap-2 pt-2">
                              <Button
                                variant={filterType === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                                className="flex-1"
                              >
                                全部
                              </Button>
                              <Button
                                variant={filterType === 'watched' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('watched')}
                                className="flex-1"
                              >
                                已看
                              </Button>
                              <Button
                                variant={filterType === 'unwatched' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterType('unwatched')}
                                className="flex-1"
                              >
                                未看
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* 统计信息 */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>共 {filteredEpisodes.length} 集</span>
                        <span>观看进度 {progress}%</span>
                      </div>
                    </div>

                    {/* 选集列表 */}
                    <ScrollArea className="flex-1" ref={scrollRef}>
                      <div className={`p-2 ${viewMode === 'grid' ? 'grid grid-cols-4 gap-2' : 'space-y-1'}`}>
                        {filteredEpisodes.map((episode) => {
                          const isWatched = watchedEpisodes.has(episode.id)
                          const isCurrent = currentEpisode === episode.id
                          
                          if (viewMode === 'grid') {
                            return (
                              <button
                                key={episode.id}
                                id={`episode-${bvid}-${episode.id}`}
                                onClick={() => handleEpisodeChange(episode.id)}
                                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all ${
                                  isCurrent
                                    ? 'bg-pink-500 text-white'
                                    : isWatched
                                    ? 'bg-muted hover:bg-muted/80'
                                    : 'bg-background hover:bg-muted border border-border'
                                }`}
                              >
                                <span className="text-lg font-bold">{episode.id}</span>
                                {isWatched && (
                                  <CheckCircle2 className={`h-3 w-3 mt-1 ${isCurrent ? 'text-white' : 'text-green-500'}`} />
                                )}
                              </button>
                            )
                          }

                          return (
                            <button
                              key={episode.id}
                              id={`episode-${bvid}-${episode.id}`}
                              onClick={() => handleEpisodeChange(episode.id)}
                              className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                                isCurrent
                                  ? 'bg-pink-500/10 border-pink-500/30 border'
                                  : isWatched
                                  ? 'bg-muted/50 hover:bg-muted'
                                  : 'hover:bg-muted'
                              }`}
                            >
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCurrent
                                  ? 'bg-pink-500 text-white'
                                  : isWatched
                                  ? 'bg-green-500/10 text-green-600'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {isWatched ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  episode.id
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isCurrent ? 'text-pink-600' : ''}`}>
                                  {episode.title}
                                </p>
                              </div>
                              {isCurrent && (
                                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </ScrollArea>

                    {/* 快速导航 */}
                    <div className="p-3 border-t border-border bg-muted/30">
                      <div className="flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(1)}
                          className="flex-1"
                        >
                          首集
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(Math.max(1, currentEpisode - 10))}
                          className="flex-1"
                        >
                          -10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(Math.min(episodes.length, currentEpisode + 10))}
                          className="flex-1"
                        >
                          +10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickJump(episodes.length)}
                          className="flex-1"
                        >
                          末集
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
