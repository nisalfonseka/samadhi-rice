import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer ships its own bundled runtime (yoga, fontkit, etc.)
  // that doesn't play well with the server bundler — keep it external.
  serverExternalPackages: ["@react-pdf/renderer"],
  // allow Cloudinary product images
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
