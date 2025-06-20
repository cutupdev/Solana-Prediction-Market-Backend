/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  distDir: "build",
  swcMinify: false,
  publicRuntimeConfig: {
    network: "mainnet-beta",
    rpcUrl: "https://mainnet.helius-rpc.com/?api-key=791e2c4e-4495-45c4-b873-c8f35344e0c0",
    // rpcUrl: "https://solana-devnet.g.alchemy.com/v2/7aYE8GkSuPRPbN9kUn_jlYAloba7gBBO",
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
      // FIX this
      // Disable minimize to make it work with Candy Machine template
      // minimization brakes Public Key names
      config.optimization.minimize = true;
    }
    return config;
  },
  images: {
    domains: ['arweave.net', 'www.arweave.net'],
  },
};
module.exports = nextConfig
