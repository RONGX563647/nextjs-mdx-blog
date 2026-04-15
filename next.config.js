/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    mdxRs: true,
  },
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 排除 public/md 下的构建产物
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/public/md/**/build/**', '**/public/md/**/CMakeFiles/**'],
      }
    }
    return config
  },
}

module.exports = nextConfig
