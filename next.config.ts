/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // 📸 Fotos que os usuários sobem no App
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // 👤 Foto de perfil que vem do Login Google
      },
      {
        protocol: 'https',
        hostname: 'www.google.com', // 🚨 A CORREÇÃO: Libera o ícone "G" do botão de login
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // 🌟 Libera as fotos dos depoimentos da Landing Page
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // 🖼️ Mantive caso você use placeholders antigos
      }
    ],
  },
};

export default nextConfig;