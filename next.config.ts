import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships its own bundled runtime (yoga, fontkit, etc.)
  // that doesn't play well with the server bundler — keep it external.
  serverExternalPackages: ["@react-pdf/renderer"],
  // allow Cloudinary product images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
