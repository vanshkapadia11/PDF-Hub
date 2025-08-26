// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
    serverActions: {
      bodySizeLimit: "50mb", // 👈 increase upload limit
    },
  },
};

module.exports = nextConfig;
