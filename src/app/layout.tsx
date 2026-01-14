import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// 🦈 IMPORTS DE COMPONENTES (Assumindo que estão em src/app/components)
import BottomNav from "./components/BottomNav";
import RouteGuard from "./components/RouteGuard";

// 🦈 IMPORTS DE CONTEXTO CORRIGIDOS (Usando ../ em vez de @)
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#050505] text-white min-h-screen`}
      >
        <AuthProvider>
          <ToastProvider>
            {/* O RouteGuard protege todas as páginas dentro dele */}
            <RouteGuard>
              <main className="pb-20">{children}</main>
              <BottomNav />
            </RouteGuard>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}