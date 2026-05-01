/** @type {import('next').NextConfig} */
const nextConfig = {
  // Source maps enabled in production for debugging
  // This exposes the full React source code to anyone who knows where to look
  productionBrowserSourceMaps: true,
  
  // Enable React strict mode for development
  reactStrictMode: true,
  
  // Disable serverless mode detection to ensure API routes work
  // trailingSlash: false,
  
  // Environment variables exposed to browser
  env: {
    // Game version exposed for debugging
    GAME_VERSION: '2.4.1',
    BUILD_HASH: process.env.VERCEL_GIT_COMMIT_SHA || 'dev-build',
  },
}

module.exports = nextConfig
