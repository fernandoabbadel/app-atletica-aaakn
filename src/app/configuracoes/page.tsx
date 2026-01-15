"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, Bell, Shield, LogOut, ChevronRight, HelpCircle,
  FileText, Smartphone, Volume2, MessageSquarePlus, Settings
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

// Mapeamento de Ícones
const ICON_MAP: Record<string, any> = { User, Shield, Wallet: Smartphone, Bell, Volume2, MessageSquare: MessageSquarePlus, HelpCircle, FileText, Settings, Smartphone };

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // 🦈 ESTADO DINÂMICO
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar Menu do Firebase
  useEffect(() => {
      const unsub = onSnapshot(doc(db, "app_config", "menu"), (snap) => {
          if (snap.exists()) {
              setSections(snap.data().sections || []);
          }
          setLoading(false);
      });
      return () => unsub();
  }, []);

  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?") && logout) {
      await logout();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans">
      <header className="glass p-4 sticky top-0 z-30 flex items-center gap-4 border-b border-white/5 backdrop-blur-md">
        <Link href="/perfil" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full"><ArrowLeft size={24} /></Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">Configurações</h1>
      </header>

      <main className="p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* PERFIL */}
        {user && (
          <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full border-2 border-emerald-500 p-0.5"><img src={user.foto || "https://github.com/shadcn.png"} className="w-full h-full rounded-full object-cover"/></div>
            <div className="flex-1"><h2 className="font-bold text-lg text-white leading-tight">{user.nome}</h2><p className="text-xs text-zinc-400 font-medium">{user.handle || "@usuario"}</p></div>
            <Link href="/perfil" className="px-3 py-1.5 bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-white hover:bg-emerald-600 transition">Ver Perfil</Link>
          </div>
        )}

        {/* MENU DINÂMICO DO FIREBASE */}
        {loading ? <div className="text-center text-zinc-500 text-xs">Carregando opções...</div> : sections.map((section) => (
            <section key={section.id}>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 px-1">{section.title}</h3>
                <div className="glass rounded-2xl overflow-hidden border border-white/5 divide-y divide-white/5">
                    {section.items.map((item: any) => {
                        if (!item.active) return null;
                        const Icon = ICON_MAP[item.icon] || Settings;
                        return (
                            <Link key={item.id} href={item.path || "#"} className="flex items-center justify-between p-4 hover:bg-white/5 transition group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition"><Icon size={18} /></div>
                                    <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition">{item.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition" />
                            </Link>
                        );
                    })}
                </div>
            </section>
        ))}

        <button onClick={handleLogout} className="w-full glass p-4 rounded-2xl border border-red-500/20 flex items-center justify-center gap-2 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500/10 transition active:scale-[0.98]">
          <LogOut size={18} /> Sair da Conta
        </button>

        <p className="text-center text-[10px] text-zinc-600 font-mono pt-4">AAAKN App v1.2 • Build 2026</p>
      </main>
    </div>
  );
}