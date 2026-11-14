import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_OUTPUT_MODE === "export" ? { output: "export" } : {}),
  images: { unoptimized: true },
  poweredByHeader: false,
  trailingSlash: true,
};

export default nextConfig;
