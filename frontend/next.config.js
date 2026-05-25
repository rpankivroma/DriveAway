/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const backendUrl = (
      process.env.NEXT_PUBLIC_API_URL || 
      process.env.BACKEND_URL || 
      'http://127.0.0.1:8000'
    ).replace(/\/$/, ''); // strip trailing slash if any

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/static/:path*',
        destination: `${backendUrl}/static/:path*`,
      },
      {
        source: '/db-status',
        destination: `${backendUrl}/db-status`,
      },
    ];
  },
};

module.exports = nextConfig;
