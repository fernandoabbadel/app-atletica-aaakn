"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut, LayoutDashboard, Settings, ShieldAlert, Trophy, Calendar,
  Star, Gamepad2, BookOpen, Dumbbell, History, ShoppingBag, Megaphone,
  Lock, Crown, BarChart3, Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const sidebarItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Eventos", path: "/admin/eventos", icon: <Calendar size={18} /> },
    { name: "Treinos", path: "/admin/treinos", icon: <BarChart3 size={18} /> },
    { name: "Loja", path: "/admin/loja", icon: <ShoppingBag size={18} /> },
    { name: "Usuários", path: "/admin/usuarios", icon: <Users size={18} /> },
    { name: "Gym Champ", path: "/admin/gym", icon: <Dumbbell size={18} /> },
    { name: "Arena Games", path: "/admin/games", icon: <Gamepad2 size={18} /> },
    { name: "Fidelidade", path: "/admin/fidelidade", icon: <Star size={18} /> },
    { name: "Conquistas", path: "/admin/conquistas", icon: <Trophy size={18} /> },
    { name: "Parceiros", path: "/admin/parceiros", icon: <Megaphone size={18} /> },
    { name: "Planos", path: "/admin/planos", icon: <Crown size={18} /> },
    { name: "Histórico", path: "/admin/historico", icon: <History size={18} /> },
    { name: "Guia do App", path: "/admin/guia", icon: <BookOpen size={18} /> },
    { name: "Denúncias", path: "/admin/denuncias", icon: <ShieldAlert size={18} /> },
    { name: "Configurações", path: "/admin/configuracoes", icon: <Settings size={18} /> }, // NOVO BOTÃO AQUI
    { name: "Permissões", path: "/admin/permissoes", icon: <Lock size={18} />, isDanger: true },
  ];

  return (
    <div className="flex min-h-screen bg-[#050505]">
      {/* BARRA LATERAL FIXA */}
      <aside className="w-64 bg-zinc-900/90 backdrop-blur-xl border-r border-white/5 flex flex-col justify-between fixed h-full z-40 overflow-y-auto custom-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] shrink-0"><ShieldAlert size={24} className="text-black" /></div>
            <div><h1 className="font-black text-white text-lg uppercase tracking-tighter leading-none">Painel Admin</h1><p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">AAAKN • v2.0</p></div>
          </div>

          <div className="mb-6 p-3 bg-black/40 rounded-xl border border-zinc-800 flex items-center gap-3">
            <img src={user?.foto || "https://github.com/shadcn.png"} alt="Admin" className="w-8 h-8 rounded-full border border-emerald-500"/>
            <div className="overflow-hidden"><p className="text-xs font-bold text-white truncate">{user?.nome.split(" ")[0]}</p><span className="text-[8px] font-black text-red-500 uppercase tracking-widest block truncate">{user?.role?.replace("admin_", "") || "MASTER"}</span></div>
          </div>

          <nav className="space-y-1">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-2 mb-2">Menu Principal</p>
            {sidebarItems.map((item) => (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${pathname === item.path ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-bold" : item.isDanger ? "text-red-500 hover:bg-red-500/10" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"}`}>
                {item.icon}<span className="text-xs font-medium uppercase tracking-wide">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-6 border-t border-zinc-800 bg-black/20">
          <button onClick={() => logout()} className="w-full flex items-center justify-center gap-3 p-3 rounded-xl bg-red-600/10 text-red-500 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all font-bold uppercase text-[10px] tracking-wider group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sair do Painel
          </button>
        </div>
      </aside>

      {/* CONTEÚDO */}
      <main className="flex-1 ml-64 p-8 relative z-10">{children}</main>
    </div>
  );
}