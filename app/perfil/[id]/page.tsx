"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Trophy, Dumbbell, Flame, MoreHorizontal, MessageCircle, X, MapPin, 
  Heart, Users, CheckCircle, Star, ShieldCheck, Zap, UserPlus, UserCheck, Flag, Instagram
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function PublicProfilePage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<"activities" | "conquests" | "community">("activities");
  const [isFollowing, setIsFollowing] = useState(false);

  const user = {
    nome: "Atleta Visitado",
    handle: `@${params.id}`,
    instagram: "atleta_shark", // Simulação do dado vindo do cadastro
    turma: "T6",
    logo_turma: "/turma6.jpeg", 
    level: 5,
    xp: 410,
    seguidores: 312,
    seguindo: 120,
    plano_badge: "ESPORTES",
    foto_perfil: `https://i.pravatar.cc/300?u=${params.id}`,
    bio: "Defendendo as cores da AAAKN em quadra! 🏀🦾",
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900">
        <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
            <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Perfil do Atleta</h1>
            <p className="text-xs font-bold text-[#4ade80]">{user.handle}</p>
        </div>
        <button className="p-2 -mr-2 text-zinc-400 hover:text-white"><MoreHorizontal size={24} /></button>
      </header>

      <main>
        <div className="relative mb-24">
          <div className="h-44 bg-gradient-to-b from-zinc-900 to-[#050505] border-b border-white/5"></div>
          <div className="absolute -bottom-20 left-4">
            <div className="relative">
              {/* FOTO REDONDA */}
              <div className="w-36 h-36 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl relative">
                <img src={user.foto_perfil} className="w-full h-full object-cover scale-110" alt="Profile" />
              </div>
              {/* Badge LV Responsiva */}
              <div className="absolute -top-1 -left-1 bg-[#4ade80] text-black min-w-[2.5rem] h-10 px-2 rounded-full border-4 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg animate-pulse whitespace-nowrap">
                LV{user.level}
              </div>
              <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-full border-[4px] border-[#050505] flex items-center justify-center shadow-lg overflow-hidden z-10">
                <img src={user.logo_turma} className="w-full h-full object-cover" alt="Logo Turma" />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 right-4 flex flex-col items-end gap-3">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-10 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 ${
                isFollowing ? "bg-zinc-900 text-zinc-400 border border-zinc-800" : "bg-[#4ade80] text-black hover:bg-[#22c55e]"
              }`}
            >
              {isFollowing ? <UserCheck size={16}/> : <UserPlus size={16}/>}
              {isFollowing ? "Seguindo" : "Seguir"}
            </button>
            <div className="flex gap-4 pr-2">
                <div className="text-center">
                    <p className="text-sm font-black leading-none">{user.seguidores}</p>
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Seguidores</p>
                </div>
                <div className="text-center">
                    <p className="text-sm font-black leading-none">{user.seguindo}</p>
                    <p className="text-[9px] uppercase font-bold text-zinc-500">Seguindo</p>
                </div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{user.nome}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-1 mb-4">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{user.turma} • Medicina</p>
            <span className="bg-[#4ade80]/10 border border-[#4ade80]/50 px-3 py-0.5 rounded-full text-[10px] font-black text-[#4ade80] uppercase tracking-tighter flex items-center gap-1 animate-pulse">
                <ShieldCheck size={10} /> {user.plano_badge}
            </span>
          </div>

          {/* BOTÃO INSTAGRAM MODERNO */}
          {user.instagram && (
            <Link 
              href={`https://instagram.com/${user.instagram.replace('@', '')}`} 
              target="_blank"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-pink-500/20 px-4 py-2 rounded-xl hover:scale-105 transition-all group mb-4"
            >
              <Instagram size={16} className="text-pink-500 group-hover:animate-bounce" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">@{user.instagram.replace('@', '')}</span>
            </Link>
          )}

          <p className="text-zinc-300 text-sm italic font-medium leading-relaxed bg-[#111] p-4 rounded-2xl border border-zinc-800 shadow-xl">{user.bio}</p>
        </div>

        <div className="mt-10 px-4 border-b border-zinc-900 flex gap-2">
          <TabButton active={activeTab === "activities"} onClick={() => setActiveTab("activities")} icon={<Dumbbell size={16} />} label="GymRats" />
          <TabButton active={activeTab === "conquests"} onClick={() => setActiveTab("conquests")} icon={<Trophy size={16} />} label="Skills" />
          <TabButton active={activeTab === "community"} onClick={() => setActiveTab("community")} icon={<MessageCircle size={16} />} label="Posts" />
        </div>
        
        {/* Aqui você mapearia os HISTORY_ACTIVITIES etc como no código anterior */}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
    return (
      <button onClick={onClick} className={`flex-1 py-4 flex items-center justify-center gap-2 font-black uppercase italic text-xs tracking-tighter transition-all relative ${active ? 'text-[#4ade80]' : 'text-zinc-500'}`}>
        {icon} {label}
        {active && <div className="absolute bottom-0 w-12 h-1 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80]"></div>}
      </button>
    );
}