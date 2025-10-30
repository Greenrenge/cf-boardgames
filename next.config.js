/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatible configuration
  images: {
    unoptimized: true,
  },
  // Note: next-intl handles i18n routing via middleware
  // No experimental i18n config needed with App Router
};

module.exports = nextConfig;
