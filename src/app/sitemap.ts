import { WEBSITE_HOST_URL } from '@/lib/constants'

export default async function sitemap() {
  const routes = ['', '/about', '/portfolio'].map((route) => ({
    url: `${WEBSITE_HOST_URL}${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return routes
}
