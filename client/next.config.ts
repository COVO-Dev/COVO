import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      // https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uriEncodedFileName}
      {
        // hostname: `${process.env.IMAGE_HOSTNAME}`,
        // pathname: `/${process.env.AWS_BUCKET_NAME}/**`,
        protocol: "https",
        hostname: `${process.env.NEXT_AWS_PUBLIC_PATH}`,
        port: "",
        pathname: `/**`,
      },
    ],
  },
};

export default nextConfig;
