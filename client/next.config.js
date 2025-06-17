/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignoring TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignoring ESLint errors during build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: process.env.NEXT_AWS_PUBLIC_PATH,
        port: "",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    // Enabling React Server Components
    serverActions: true,
  },
};

module.exports = nextConfig;
