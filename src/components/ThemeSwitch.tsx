/**
 * 主题切换组件
 * 提供深色模式和浅色模式的切换功能
 */

// 标记为客户端组件
'use client'

// 导入必要的组件和工具
import { MoonStar, Sun } from 'lucide-react' // 月亮和太阳图标
import { useTheme } from 'next-themes' // 主题管理钩子
import { useEffect, useState } from 'react' // React钩子

/**
 * 主题切换组件
 * @returns 主题切换按钮
 */
export function ThemeSwitch() {
  // 获取当前解析的主题和设置主题的方法
  let { resolvedTheme, setTheme } = useTheme()
  // 计算另一个主题（如果当前是深色，则另一个是浅色，反之亦然）
  let otherTheme = resolvedTheme === 'dark' ? 'light' : 'dark'
  // 组件挂载状态，用于避免服务端渲染和客户端渲染不匹配的问题
  let [mounted, setMounted] = useState(false)

  // 组件挂载后设置mounted为true
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <button
      type="button"
      // 根据当前主题设置无障碍标签
      aria-label={mounted ? `Switch to ${otherTheme} theme` : 'Toggle theme'}
      // 按钮样式：圆角、半透明背景、阴影、边框、过渡效果
      className="group rounded-full bg-white/90 px-3 py-2 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 transition dark:bg-zinc-800/90 dark:ring-white/10 dark:hover:ring-white/20"
      // 点击时切换主题
      onClick={() => setTheme(otherTheme)}
    >
      {/* 太阳图标 - 在浅色模式下显示 */}
      <Sun 
        className="h-6 w-6 fill-zinc-100 stroke-zinc-500 transition group-hover:fill-zinc-200 group-hover:stroke-zinc-700 dark:hidden [@media(prefers-color-scheme:dark)]:fill-zinc-50 [@media(prefers-color-scheme:dark)]:stroke-zinc-500 [@media(prefers-color-scheme:dark)]:group-hover:fill-zinc-50 [@media(prefers-color-scheme:dark)]:group-hover:stroke-zinc-600" 
      />
      {/* 月亮图标 - 在深色模式下显示 */}
      <MoonStar 
        className="hidden h-6 w-6 fill-zinc-700 stroke-zinc-500 transition dark:block [@media(prefers-color-scheme:dark)]:group-hover:stroke-zinc-400 [@media_not_(prefers-color-scheme:dark)]:fill-zinc-400/10 [@media_not_(prefers-color-scheme:dark)]:stroke-zinc-500" 
      />
    </button>
  )
}

export default ThemeSwitch
