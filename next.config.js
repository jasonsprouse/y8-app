/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable type checking during build to avoid viem's deep type recursion issues
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
