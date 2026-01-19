import clsx from 'clsx'

export function Container({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={clsx(className, 'mx-auto max-w-4xl px-6 lg:max-w-6xl xl:max-w-7xl')}>
      {children}
    </div>
  )
}
