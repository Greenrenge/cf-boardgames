/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Cloudflare Pages compatible configuration
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
