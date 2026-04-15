import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { projects } from '@/data/projects'

export default async function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: encodedId } = await params
  const decodedId = decodeURIComponent(encodedId)
  const project = projects.find((p) => p.id === decodedId)

  if (!project) {
    notFound()
  }

  return (
    <div>
      <section className="py-12">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/portfolio" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            返回项目列表
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {project.description}
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
          <div className="flex items-center gap-2">
            <Calendar size={14} />
            <span>{project.date}</span>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">项目背景</h2>
        <p className="text-muted-foreground leading-relaxed">
          {project.background}
        </p>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">技术架构</h2>
        <p className="text-muted-foreground leading-relaxed">
          {project.architecture}
        </p>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {project.features.map((feature, index) => (
            <div key={index} className="bg-background border border-border p-4 rounded shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground">
                {feature}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">技术栈</h2>
        <div className="flex flex-wrap gap-3">
          {project.skills.map((skill, index) => (
            <span key={index} className="px-4 py-2 bg-primary/10 text-primary rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">工作职责</h2>
        <ul className="space-y-4">
          {project.responsibilities.map((responsibility, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                {index + 1}
              </div>
              <p className="text-muted-foreground">
                {responsibility}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">技术难点与解决方案</h2>
        <div className="space-y-6">
          {project.challenges.map((item, index) => (
            <div key={index} className="bg-background border border-border p-6 rounded shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-3 text-primary">
                {item.challenge}
              </h3>
              <p className="text-muted-foreground">
                {item.solution}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <h2 className="text-2xl font-bold mb-8">项目成果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {project.achievements.map((achievement, index) => (
            <div key={index} className="bg-background border border-border p-6 rounded shadow-sm hover:shadow-md transition-shadow">
              <p className="text-muted-foreground">
                {achievement}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
