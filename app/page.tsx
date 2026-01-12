"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2, ArrowRight, UserCircle, QrCode } from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  const router = useRouter();

  // --- LÓGICA DE REDIRECIONAMENTO AUTOMÁTICO ---
  useEffect(() => {
    if (user) {
      // Se já está logado, direciona baseado no cargo
      if (user.role === 'empresa') router.push('/empresa');
      else if (user.role === 'treinador') router.push('/admin/treinos');
      else router.push('/dashboard'); // Usuário, Admin e Master vão pro Dashboard visual
    }
  }, [user, router]);

  // Se não estiver logado, mostra a Landing Page
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        
        {/* Logo Animado */}
        <div className="mb-8 relative group">
          <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000 animate-pulse"></div>
          <img src="/logo.png" className="w-40 h-40 object-contain relative z-10 drop-shadow-2xl" alt="Logo AAAKN" />
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
          Bem-vindo à <br/> <span className="text-emerald-500">Toca do Tubarão</span>
        </h1>
        <p className="text-zinc-400 text-sm max-w-xs mx-auto mb-10 font-medium">
          O app oficial da Maior do Litoral. Gerencie sua carteirinha, treinos e eventos em um só lugar.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <Link href="/login" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transition transform hover:-translate-y-1 flex items-center justify-center gap-3">
            <UserCircle size={20} /> Fazer Login
          </Link>
          
          <Link href="/cadastro" className="w-full py-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 text-white font-bold uppercase tracking-widest rounded-2xl transition hover:bg-zinc-800 flex items-center justify-center gap-3">
            Criar Conta
          </Link>

          <Link href="/dashboard" className="w-full py-3 text-zinc-500 hover:text-emerald-400 text-xs font-bold uppercase tracking-widest transition flex items-center justify-center gap-2">
            Entrar como Visitante <ArrowRight size={14} />
          </Link>
        </div>
      </main>

      <footer className="p-6 text-center">
        <p className="text-[10px] text-zinc-600 font-mono uppercase">AAAKN App v2.0 • Powered by Tubarão Dev</p>
      </footer>
    </div>
  );
}