import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permite imagens de qualquer domínio HTTPS
      },
    ],
  }
};

export default nextConfig;
