/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloudflare Pages compatible configuration
  images: {
    unoptimized: true,
  },
  // Note: next-intl handles i18n routing via middleware
  // No experimental i18n config needed with App Router
  typescript: {
    // Allow build to succeed despite legacy code TypeScript errors
    // All new Location API code is type-safe
    ignoreBuildErrors: false,
  },
  eslint: {
    // Allow build despite legacy code ESLint warnings
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
