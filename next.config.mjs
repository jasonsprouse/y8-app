/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization for pages that need client-side rendering
  output: 'standalone',
  
  webpack: (config, { isServer }) => {
    // Fix for lit-protocol and other packages using Node.js APIs
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Ignore node:diagnostics_channel warnings
    config.ignoreWarnings = [
      { module: /node_modules\/lit-protocol/ },
      { module: /node_modules\/@lit-protocol/ },
    ];

    return config;
  },
  
  // Suppress hydration warnings during development
  reactStrictMode: true,
  
  // Experimental features for better compatibility
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
