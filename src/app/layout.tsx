import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🦈 CONTEXTOS (A ordem de importação não altera a lógica, mas organiza)
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { CartProvider } from "@/context/CartContext"; // <--- O Novo Jogador

// 🦈 COMPONENTES GLOBAIS
import BottomNav from "@/app/components/BottomNav";
import RouteGuard from "@/app/components/RouteGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. METADATA (SEO)
export const metadata: Metadata = {
  title: "Tubarão App - AAAKN",
  description: "Portal oficial da Atlética Medicina Caraguá",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
  },
};

// 2. VIEWPORT (Visual Mobile)
export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        {/* 1. Autenticação (Quem é o usuário?) */}
        <AuthProvider>
          
          {/* 2. Feedback Visual (Toasts/Alertas) */}
          <ToastProvider>
            
            {/* 3. Estado do Carrinho (Precisa do Toast para avisar) */}
            <CartProvider>
              
              {/* 4. Proteção de Rotas (Verifica se pode acessar) */}
              <RouteGuard>
                
                {/* Conteúdo Principal */}
                <main className="pb-24 min-h-screen relative z-10">
                  {children}
                </main>

                {/* Navegação Fixa (Sempre visível para quem está logado) */}
                <BottomNav />

              </RouteGuard>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}