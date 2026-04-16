import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16+ uses Turbopack by default. Webpack config is no longer supported.
  // Turbopack handles externals automatically via serverExternalPackages.
  serverExternalPackages: ["canvas", "@tensorflow/tfjs", "@teachablemachine/image"],

  // Empty turbopack config silences the "no turbopack config" warning
  turbopack: {},
};

export default nextConfig;
