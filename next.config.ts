import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  transpilePackages: ['lucide-react'],
  outputFileTracingRoot: process.cwd(), // silences workspace root warning

  images: {
    // Without this, Vercel cannot optimize external images at all — it just proxies raw files
    remotePatterns: [
      // YouTube
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      // Open Library
      { protocol: "https", hostname: "covers.openlibrary.org" },
      // GitHub
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "opengraph.githubassets.com" },
      { protocol: "https", hostname: "repository-images.githubusercontent.com" },
      // Dev.to (uses Cloudinary + Forem CDN)
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "dev-to-uploads.s3.amazonaws.com" },
      { protocol: "https", hostname: "practicaldev-herokuapp-com.freetls.fastly.net" },
      // General fallback for any CDN-hosted thumbnails
      { protocol: "https", hostname: "*.fastly.net" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
    // Serve AVIF first (smaller), fall back to WebP — both much smaller than JPEG
    formats: ["image/avif", "image/webp"],
    // Cache optimized images for 24hrs on Vercel's CDN edge
    minimumCacheTTL: 86400,
    // Allow larger images to be optimized (default is 8MB)
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
