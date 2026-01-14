import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Tente usar caminhos relativos se o alias @ estiver falhando
import BottomNav from "./components/BottomNav";
import RouteGuard from "./components/RouteGuard";
import { AuthProvider } from "@/src/context/AuthContext";
import { ToastProvider } from "@/src/context/ToastContext";

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
