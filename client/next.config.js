/** @type {import('next').NextConfig} */

const { NEXT_AWS_PUBLIC_PATH } = process.env;

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
        hostname: "covo-test2.s3.us-east-1.amazonaws.com",
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
