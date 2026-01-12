/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.dicebear.com', 'res.cloudinary.com'],
  },
  reactStrictMode: true,
  // Aumentar límite de tamaño para uploads de video
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
};

module.exports = nextConfig;
