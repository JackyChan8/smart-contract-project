import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  },
  sassOptions: {
    additionalData: `$var: red;`,
  },
  output: 'export',
};

export default nextConfig;
