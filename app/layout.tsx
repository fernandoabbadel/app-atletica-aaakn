import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "./components/BottomNav";
import { AuthProvider } from "@/context/AuthContext"; // Importação do contexto

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
        {/* O AuthProvider deve envolver tudo que precisa de acesso aos dados do usuário */}
        <AuthProvider>
          <main className="pb-20">
            {" "}
            {/* pb-20 para dar espaço ao BottomNav fixo */}
            {children}
          </main>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
