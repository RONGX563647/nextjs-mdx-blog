/**
 * 面试演示页面布局
 * 独立的布局，不包含网站导航栏和其他全局组件
 * 注：此布局只是标记 /interview 路由，实际的全局组件隐藏由 GlobalComponents 组件处理
 */

export default function InterviewLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
