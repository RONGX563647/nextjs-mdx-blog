'use client'

import { LastVisitedBar } from './LastVisitedBar'

export default function LastVisitedBarWrapper() {
  // 直接渲染LastVisitedBar，让它自己处理hydration
  return <LastVisitedBar />
}
