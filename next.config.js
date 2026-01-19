const { withContentlayer } = require('next-contentlayer')

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    turbo: {
      rules: {
        '*.mdx': {
          loaders: ['@mdx-js/loader'],
          as: '*.js',
        },
      },
    },
  },
}

module.exports = withContentlayer(nextConfig)
