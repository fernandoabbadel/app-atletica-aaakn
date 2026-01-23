import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🦈 COMPONENTES GLOBAIS
import BottomNav from "./components/BottomNav"; // Verifique se o caminho da pasta bate com seu projeto
import RouteGuard from "./components/RouteGuard"; // Assumindo que este componente existe

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

export const metadata: Metadata = {
  title: "Tubarão App - AAAKN",
  description: "Portal oficial da Atlética Medicina Caraguá",
  manifest: "/manifest.json", 
  themeColor: "#050505",
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
        <AuthProvider>
          <ToastProvider>
            {/* O RouteGuard protege todas as rotas internas */}
            <RouteGuard>
              <main className="pb-24 min-h-screen relative z-10">
                {children}
              </main>
              {/* Barra de Navegação Flutuante */}
              <BottomNav />
            </RouteGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}