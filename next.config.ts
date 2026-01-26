/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚨 A CURA DO LOGIN: Desativa o Strict Mode.
  // Isso impede que o React carregue o popup do Firebase duas vezes e trave o app.
  reactStrictMode: false, 

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
        hostname: 'www.google.com', // 🚨 Ícone "G" do botão de login
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc', // 🌟 Fotos dos depoimentos
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // 🖼️ Placeholders
      },
      {
        protocol: 'https',
        hostname: 'github.com', // ✅ Adicionei este para garantir (fotos padrão do shadcn)
      }
    ],
  },
};

export default nextConfig;