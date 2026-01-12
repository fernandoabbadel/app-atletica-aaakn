/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // 📸 Fotos salvas no seu Storage
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // 👤 Avatares do Google Auth
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // 🖼️ Placeholders (se ainda estiver usando)
      },
      {
        protocol: 'https',
        hostname: 'github.com', // 🐙 Caso use login com GitHub ou avatares de lá
      }
    ],
  },
};

export default nextConfig;