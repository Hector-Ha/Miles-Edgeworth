import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  trailingSlash: true,
  outputFileTracingIncludes: {
    "/api/my-lawyer/chat": ["./src/data/my-lawyer/**/*"],
  },
};

export default nextConfig;
