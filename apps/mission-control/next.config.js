/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ai-core", "@repo/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
