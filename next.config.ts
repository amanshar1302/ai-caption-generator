import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["canvas", "@tensorflow/tfjs", "@teachablemachine/image"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      (config.externals as string[]).push("canvas");
    }
    return config;
  },
};

export default nextConfig;
