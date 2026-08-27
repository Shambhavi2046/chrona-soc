import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites: async () => {
    if (process.env.VERCEL && !process.env.BACKEND_INTERNAL_URL) {
      throw new Error("BACKEND_INTERNAL_URL must be explicitly configured in production on Vercel");
    }
    return [
      {
        source: "/api/v1/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000"}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
