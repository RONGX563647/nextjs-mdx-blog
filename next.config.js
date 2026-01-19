/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

module.exports = nextConfig