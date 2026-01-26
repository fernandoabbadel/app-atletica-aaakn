import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🦈 COMPONENTES GLOBAIS
import BottomNav from "./components/BottomNav"; 
import RouteGuard from "./components/RouteGuard"; 

// 🦈 CONTEXTOS
import { AuthProvider } from "../context/AuthContext";
import { ToastProvider } from "../context/ToastContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. METADATA (Apenas SEO)
export const metadata: Metadata = {
  title: "Tubarão App - AAAKN",
  description: "Portal oficial da Atlética Medicina Caraguá",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

// 2. VIEWPORT (Visual e Tema - A Correção do Erro)
export const viewport: Viewport = {
  themeColor: "#050505", // A cor da barra do navegador fica aqui agora
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Evita zoom indesejado no mobile
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505] text-white min-h-screen selection:bg-emerald-500/30`}
      >
        {/* Provedor de Autenticação (Firebase) */}
        <AuthProvider>
          {/* Provedor de Notificações (Toasts) */}
          <ToastProvider>
            
            {/* O RouteGuard protege todas as rotas e mostra o Tubarão carregando */}
            <RouteGuard>
              
              {/* Conteúdo Principal da Página */}
              <main className="pb-24 min-h-screen relative z-10">
                {children}
              </main>

              {/* Barra de Navegação Flutuante (Fixa embaixo) */}
              <BottomNav />
            
            </RouteGuard>
          
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}