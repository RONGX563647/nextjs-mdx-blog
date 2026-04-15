/**
 * 项目页面组件
 * 从统一数据源获取项目数据
 */
import { ProjectCarousel } from '@/components/portfolio/ProjectCarousel'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { projects } from '@/data/projects'

export default function Portfolio() {
  return (
    <div>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">项目经历</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
            以下是我参与开发的代表性项目，展示了我的技术能力和实践经验。
          </p>
        </div>
      </section>

      <section className="py-16 border-t border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">我的项目</h2>
          <ProjectCarousel projects={projects} />
        </div>
      </section>

      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">项目详情预览</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                description={project.description}
                date={project.date}
                skills={project.skills}
                category={project.id}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
