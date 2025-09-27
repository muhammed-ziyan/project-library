/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ENABLE_ADMIN: process.env.NEXT_PUBLIC_ENABLE_ADMIN || 'false'
  }
}

module.exports = nextConfig