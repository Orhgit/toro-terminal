/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ai-core", "@repo/database"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
    ],
  },
};

export default nextConfig;
