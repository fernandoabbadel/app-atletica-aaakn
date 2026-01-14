"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Moon,
  LogOut,
  ChevronRight,
  HelpCircle,
  FileText,
  Smartphone,
  Volume2,
  MessageSquarePlus, // Novo ícone
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);

  const handleLogout = () => {
    const confirm = window.confirm("Tem certeza que deseja sair?");
    if (confirm) {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans selection:bg-emerald-500/30">
      <header className="glass p-4 sticky top-0 z-30 flex items-center gap-4 border-b border-white/5 backdrop-blur-md">
        <Link 
          href="/perfil" 
          className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">
          Configurações
        </h1>
      </header>

      <main className="p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* PERFIL */}
        {user && (
          <div className="glass p-4 rounded-2xl border border-white/5 flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full border-2 border-emerald-500 p-0.5">
              <img
                src={user.foto}
                alt="Perfil"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg text-white leading-tight">
                {user.nome}
              </h2>
              <p className="text-xs text-zinc-400 font-medium">
                {user.handle} • {user.turma}
              </p>
            </div>
            <Link 
              href="/cadastro" 
              className="px-3 py-1.5 bg-zinc-800 rounded-lg text-[10px] font-bold uppercase text-white hover:bg-emerald-600 transition"
            >
              Editar
            </Link>
          </div>
        )}

        {/* CONTA */}
        <section>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 px-1">
            Sua Conta
          </h3>
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <SettingsItem 
              icon={<User size={18} />} 
              label="Dados Pessoais" 
              href="/cadastro" 
            />
            <div className="h-[1px] bg-white/5 mx-4"></div>
            <SettingsItem 
              icon={<Shield size={18} />} 
              label="Segurança e Senha" 
              href="/configuracoes/seguranca" // Novo Link
            />
            <div className="h-[1px] bg-white/5 mx-4"></div>
            <SettingsItem 
              icon={<Smartphone size={18} />} 
              label="Carteirinha Digital" 
              href="/carteirinha" 
            />
          </div>
        </section>

        {/* PREFERÊNCIAS */}
        <section>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 px-1">
            Preferências
          </h3>
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <div className="flex items-center justify-between p-4 hover:bg-white/5 transition cursor-pointer" onClick={() => setNotifications(!notifications)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                  <Bell size={18} />
                </div>
                <span className="text-sm font-bold text-zinc-200">Notificações</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${notifications ? "bg-emerald-500" : "bg-zinc-700"}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${notifications ? "left-6" : "left-1"}`}></div>
              </div>
            </div>
            <div className="h-[1px] bg-white/5 mx-4"></div>
            <div className="flex items-center justify-between p-4 hover:bg-white/5 transition cursor-pointer" onClick={() => setSounds(!sounds)}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                  <Volume2 size={18} />
                </div>
                <span className="text-sm font-bold text-zinc-200">Sons do App</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${sounds ? "bg-emerald-500" : "bg-zinc-700"}`}>
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${sounds ? "left-6" : "left-1"}`}></div>
              </div>
            </div>
          </div>
        </section>

        {/* SUPORTE E AJUDA */}
        <section>
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 px-1">
            Central de Ajuda
          </h3>
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            <SettingsItem 
              icon={<MessageSquarePlus size={18} />} 
              label="Sugestões / Fale Conosco" 
              href="/configuracoes/suporte" // Novo Link
            />
            <div className="h-[1px] bg-white/5 mx-4"></div>
            <SettingsItem 
              icon={<HelpCircle size={18} />} 
              label="Guia do App" 
              href="/guia" 
            />
            <div className="h-[1px] bg-white/5 mx-4"></div>
            <SettingsItem 
              icon={<FileText size={18} />} 
              label="Termos e Privacidade" 
              href="/configuracoes/termos" // Novo Link
            />
          </div>
        </section>

        <button 
          onClick={handleLogout}
          className="w-full glass p-4 rounded-2xl border border-red-500/20 flex items-center justify-center gap-2 text-red-500 font-bold uppercase tracking-widest hover:bg-red-500/10 transition active:scale-[0.98]"
        >
          <LogOut size={18} /> Sair da Conta
        </button>

        <p className="text-center text-[10px] text-zinc-600 font-mono pt-4">
          AAAKN App v1.2 • Build 2026
        </p>
      </main>
    </div>
  );
}

function SettingsItem({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 hover:bg-white/5 transition group">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition">
          {icon}
        </div>
        <span className="text-sm font-bold text-zinc-200 group-hover:text-white transition">
          {label}
        </span>
      </div>
      <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition" />
    </Link>
  );
}