import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@auction/shared', '@auction/ui'],
};

export default nextConfig;
