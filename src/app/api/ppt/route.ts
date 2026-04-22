/**
 * PPT目录列表API
 * 用于获取 /public/ppt 下的子目录列表
 * 或者获取指定子目录下的文件列表
 */
import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subDir = searchParams.get('dir')

    // 基础路径
    const baseDir = path.join(process.cwd(), 'public', 'ppt')

    // 如果指定了子目录，返回该子目录下的文件列表
    if (subDir) {
      const targetDir = path.join(baseDir, decodeURIComponent(subDir))

      // 安全检查：确保目标目录在baseDir下
      if (!targetDir.startsWith(baseDir)) {
        return NextResponse.json(
          { error: '无效的目录路径' },
          { status: 400 }
        )
      }

      // 检查目录是否存在
      if (!fs.existsSync(targetDir)) {
        return NextResponse.json(
          { error: '目录不存在' },
          { status: 404 }
        )
      }

      // 读取目录内容
      const items = fs.readdirSync(targetDir, { withFileTypes: true })

      // 分类文件和目录
      const files = items
        .filter(item => item.isFile())
        .map(item => ({
          name: item.name,
          type: 'file',
          path: `/ppt/${subDir}/${item.name}`,
          size: fs.statSync(path.join(targetDir, item.name)).size,
        }))

      const directories = items
        .filter(item => item.isDirectory())
        .map(item => ({
          name: item.name,
          type: 'directory',
          path: `${subDir}/${item.name}`,
        }))

      return NextResponse.json({
        currentDir: subDir,
        directories,
        files,
      })
    }

    // 没有指定子目录，返回所有子目录
    const items = fs.readdirSync(baseDir, { withFileTypes: true })

    const directories = items
      .filter(item => item.isDirectory())
      .map(item => ({
        name: item.name,
        path: item.name,
      }))

    return NextResponse.json({
      directories,
    })
  } catch (error) {
    console.error('读取PPT目录失败:', error)
    return NextResponse.json(
      { error: '读取目录失败' },
      { status: 500 }
    )
  }
}
