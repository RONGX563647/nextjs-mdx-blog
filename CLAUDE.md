# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal blog built with **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS**, featuring a unique "cultivation" (修仙) themed content organization system. The blog includes an AI assistant integration, creative animations, and interactive components.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Architecture

### Content System

Blog content is stored as Markdown files in `public/md/`, organized by "cultivation realms" (修仙等级):

```
public/md/
├── 引气・Java 气海初拓/     # Java basics
├── 筑基・Web 道途启关/     # Web development
├── 金丹・SSM 三式凝丹/     # SSM framework
├── 元婴・算法心劫磨砺/     # Algorithms
├── 化神・若依架构御界/     # RuoYi framework
└── 合体・全栈道途擘画/     # Full-stack
```

Category folders use format: `数字.名称` (e.g., `01.引气・Java 气海初拓`)

**Key files:**
- `src/lib/blog.ts` - Content fetching functions: `getCategories()`, `getArticles()`, `getArticle()`
- Article titles are extracted from `# Title` in markdown
- Categories are sorted by cultivation level order (引气 → 筑基 → 金丹 → 元婴 → 化神 → 合体)

### Routing Structure (App Router)

```
src/app/
├── layout.tsx              # Root layout with providers
├── page.tsx                # Homepage
├── blog/
│   ├── page.tsx            # Blog list (all categories)
│   ├── BlogSearch.tsx      # Search component
│   └── [category]/
│       ├── page.tsx        # Category article list
│       └── [slug]/
│           └── page.tsx    # Article detail page
├── portfolio/              # Project showcase
└── about/                  # About page
```

### Key Components

**Global Components** (`src/components/`):
- `Navigation.tsx` - Main navigation
- `Container.tsx` - Layout wrapper
- `ThemeSwitch.tsx` - Dark/light mode toggle
- `CustomCursor.tsx` - Custom cursor effect (desktop only)
- `PageTransition.tsx` - Page transition animations

**Blog Components** (`src/components/blog/`):
- `ArticlePageClient.tsx` - Client-side article rendering
- `ArticleContent.tsx` - Markdown content with syntax highlighting
- `CollapsibleToc.tsx` - Table of contents
- `CommentSection.tsx` - Giscus comments integration
- `ArticleQuiz.tsx` - Interactive quiz component

**AI Assistant** (`src/components/ai/`):
- `AIAssistant.tsx` - Main entry point
- `FloatingBall.tsx` - Floating trigger button
- `AISidebar.tsx` - Chat sidebar
- `AIAssistantContext.tsx` - React context for state management

### AI Integration

The AI assistant uses a proxy API route to protect API keys:

- `src/app/api/chat/route.ts` - Edge runtime API proxy
- Environment variables (server-side only):
  - `AI_API_KEY` - API key (NOT `NEXT_PUBLIC_*`)
  - `AI_API_URL` - API endpoint (default: Alibaba Cloud DashScope)
  - `AI_MODEL` - Model name (default: qwen-turbo)

### Styling

- **Tailwind CSS** with CSS variables for theming
- **shadcn/ui** components in `src/components/ui/`
- Dark mode via `next-themes` with `class` attribute
- CSS variables defined in `src/app/global.css`

### Client/Server Pattern

This project follows Next.js App Router patterns:

1. **Server Components** (default): Data fetching, SEO, static generation
2. **Client Components** (`'use client'`): Interactivity, hooks, animations

Example pattern from article pages:
- Server: `page.tsx` fetches article data, generates metadata
- Client: `ArticlePageClient.tsx` handles TOC, comments, animations

## Important Conventions

### Path Aliases

Use `@/*` for imports from `src/`:
```tsx
import { getCategories } from '@/lib/blog'
import { Container } from '@/components/Container'
```

### Article Front Matter

Articles use markdown with:
- First `# ` line as title
- Categories from folder names
- No YAML front matter required

### Component Patterns

- Use `'use client'` directive at top of client components
- Export components as named exports
- Import types from `@/lib/blog` for Article, Category

### Security Notes

- Never use `NEXT_PUBLIC_` prefix for sensitive API keys
- AI API key must remain server-side via `AI_API_KEY` env var
- The API route at `/api/chat` proxies requests to protect credentials