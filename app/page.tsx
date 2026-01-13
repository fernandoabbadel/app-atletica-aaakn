"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // ✅ Next Image (Otimizado)
import { useAuth } from "@/context/AuthContext";
import { Loader2, LogIn, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { user, loginGoogle, loading } = useAuth();
  const router = useRouter();

  // Se já estiver logado, chuta pro Dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    await loginGoogle();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />

      {/* --- LOGO & HERO --- */}
      <div className="z-10 flex flex-col items-center mb-12 text-center">
        <div className="h-24 w-24 bg-gray-900 rounded-2xl flex items-center justify-center border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)] mb-6 transform hover:scale-105 transition-transform duration-500">
            <ShieldCheck className="h-12 w-12 text-orange-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          AAAKN <span className="text-orange-500">LOGIN</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-[280px]">
          Acesso exclusivo para sócios, atletas e parceiros da Atlética.
        </p>
      </div>

      {/* --- CARD DE LOGIN --- */}
      <div className="w-full max-w-sm bg-gray-900/50 backdrop-blur-sm border border-gray-800 p-6 rounded-2xl shadow-xl z-10">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
            <span className="text-gray-400 text-sm">Verificando credenciais...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Botão Google Oficial */}
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-gray-100 text-gray-900 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg group"
            >
              {/* Logo Google SVG Inline para evitar dependência externa */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.62c1.61 0 3.06.56 4.23 1.68l3.17-3.17C17.46 1.14 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
            </button>

            <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-gray-800 flex-1" />
                <span className="text-[10px] text-gray-500 uppercase font-bold">Ou</span>
                <div className="h-px bg-gray-800 flex-1" />
            </div>

            {/* Link para Landing Page (Voltar) */}
            <button 
              onClick={() => router.push("/")}
              className="w-full bg-transparent hover:bg-gray-800/50 text-gray-400 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-xs border border-gray-800"
            >
              <LogIn className="h-4 w-4" />
              Voltar para Início
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center z-10 opacity-60">
        <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-2">Desenvolvido com 🦈</p>
        <div className="flex justify-center gap-4">
           {/* Placeholders para badges de lojas */}
           <div className="h-8 w-24 bg-gray-800 rounded flex items-center justify-center text-[8px] text-gray-500">App Store</div>
           <div className="h-8 w-24 bg-gray-800 rounded flex items-center justify-center text-[8px] text-gray-500">Google Play</div>
        </div>
      </div>

    </div>
  );
}