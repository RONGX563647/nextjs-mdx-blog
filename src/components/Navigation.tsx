import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="hidden md:flex items-center gap-2">
      <Link href="/" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
        首页
      </Link>
      <Link href="/about" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
        关于
      </Link>
      <Link href="/portfolio" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
        项目
      </Link>
      <Link href="/posts" className="px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors">
        博客
      </Link>
    </nav>
  )
}
