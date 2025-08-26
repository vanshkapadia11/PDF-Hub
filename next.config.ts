// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb", // 👈 increase upload limit
    },
  },
};

module.exports = nextConfig;
