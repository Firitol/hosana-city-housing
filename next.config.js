/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',  // ✅ Required for Render
  reactStrictMode: true,
  images: {
    unoptimized: true,  // ✅ Disable Next.js image optimization (Render doesn't support it well)
    domains: ['s3.amazonaws.com', '*.render.com'],
  },
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Content-Type, Date, Authorization' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
