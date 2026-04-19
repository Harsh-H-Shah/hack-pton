/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['pixi.js', '@pixi/react'],
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
};

export default nextConfig;
