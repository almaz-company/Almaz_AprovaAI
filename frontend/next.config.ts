// next.config.ts
import type { NextConfig } from "next";
import { withNextVideo } from "next-video/process";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permite imagens de qualquer domínio HTTPS
      },
    ],
  },
};

export default withNextVideo(nextConfig);
