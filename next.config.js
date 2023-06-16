/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  webpack: (config, { buildId, dev, isServer, defaultLoaders }) => {
    config.resolve.extensions.push('.ts', '.tsx');

    config.module.rules.push({
      test: /\.tsx?$/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
            configFile: path.resolve(__dirname, 'tsconfig.json')
          }
        }
      ]
    });

    return config;
  },
  images: {
    domains: ['avatars.githubusercontent.com', 'avatar.vercel.sh']
  },
  experimental: {
    serverComponentsExternalPackages: ['@tremor/react']
  }
};

module.exports = nextConfig;
