"use client";

import React, { use } from "react";
import {
  ArrowLeft,
  Share2,
  MoreHorizontal,
  CheckCircle,
  ShieldCheck,
  Flame,
  Instagram,
  MessageCircle,
  Trophy,
  Dumbbell,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// SIMULAÇÃO DE BANCO DE DADOS (Mesmos dados do Ranking)
const MOCK_USERS_DB = [
  {
    id: 1,
    nome: "Julia Felinto",
    pontos: 1250,
    avatar: "https://i.pravatar.cc/150?u=julia",
    turma: "T5",
    handle: "@ju.felinto",
    insta: "@jufelinto_med",
    level: 12,
    bio: "Focada no Intermed! 🦈",
  },
  {
    id: 2,
    nome: "Matheus Negreiros",
    pontos: 1180,
    avatar: "https://i.pravatar.cc/150?u=matheus",
    turma: "T3",
    handle: "@math.negreiros",
    insta: "@matheus_med",
    level: 11,
    bio: "Gym rat de carteirinha",
  },
  {
    id: 3,
    nome: "Maria Gabriela",
    pontos: 1100,
    avatar: "https://i.pravatar.cc/150?u=maria",
    turma: "T5",
    handle: "@mari.gabi",
    insta: "@gabi_medicina",
    level: 10,
    bio: "Futura cirurgiã 🩺",
  },
  {
    id: 4,
    nome: "João Silva",
    pontos: 950,
    avatar: "https://i.pravatar.cc/150?u=joao",
    turma: "T1",
    handle: "@joao.silva",
    insta: "@joaosilva",
    level: 8,
    bio: "Calouro sofrendo",
  },
  {
    id: 5,
    nome: "Ana Clara",
    pontos: 920,
    avatar: "https://i.pravatar.cc/150?u=ana",
    turma: "T7",
    handle: "@ana.c",
    insta: "@ana_med",
    level: 8,
    bio: "Quase formando!",
  },
  {
    id: 6,
    nome: "Pedro Costa",
    pontos: 880,
    avatar: "https://i.pravatar.cc/150?u=pedro",
    turma: "T2",
    handle: "@pedro.costa",
    insta: "@pedro_med",
    level: 7,
    bio: "Bora treinar",
  },
  {
    id: 7,
    nome: "Lucas Almeida",
    pontos: 850,
    avatar: "https://i.pravatar.cc/150?u=lucas",
    turma: "T4",
    handle: "@lucas.a",
    insta: "@lucas_med",
    level: 7,
    bio: "Medicina por amor",
  },
  {
    id: 8,
    nome: "Fernanda Lima",
    pontos: 800,
    avatar: "https://i.pravatar.cc/150?u=fernanda",
    turma: "T5",
    handle: "@fe.lima",
    insta: "@fe_med",
    level: 6,
    bio: "T5 no topo!",
  },
  {
    id: 9,
    nome: "Bruno Souza",
    pontos: 750,
    avatar: "https://i.pravatar.cc/150?u=bruno",
    turma: "T5",
    handle: "@bruno.s",
    insta: "@bruno_med",
    level: 6,
    bio: "Shark Team 🦈",
  },
];

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Desembrulhar params (Next.js 15)
  const { id } = use(params);

  // Buscar usuário no "banco"
  const user = MOCK_USERS_DB.find((u) => u.id === Number(id));

  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900">
        <Link
          href="/ranking"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Perfil do Atleta
          </h1>
          <p className="text-xs font-bold text-[#4ade80]">{user.handle}</p>
        </div>
        <button className="p-2 -mr-2 text-zinc-400 hover:text-white">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main>
        {/* CAPA E AVATAR */}
        <div className="relative mb-24">
          <div className="h-44 bg-gradient-to-b from-[#1a3a2a] to-[#050505] border-b border-white/5"></div>
          <div className="absolute -bottom-20 left-4">
            <div className="relative">
              <div className="w-36 h-36 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl">
                <img
                  src={user.avatar}
                  className="w-full h-full object-cover"
                  alt={user.nome}
                />
              </div>
              <div className="absolute -top-1 -left-1 bg-[#4ade80] text-black min-w-[2.5rem] h-10 px-2 rounded-full border-4 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg">
                LV{user.level}
              </div>
              <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-full border-[4px] border-[#050505] flex items-center justify-center shadow-lg overflow-hidden z-10">
                <img
                  src={`/turma${user.turma.replace(/\D/g, "")}.jpeg`}
                  className="w-full h-full object-cover"
                  alt={user.turma}
                  onError={(e) => (e.currentTarget.src = "/logo.png")}
                />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 right-4 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-lg">
              <Share2 size={18} />
            </button>
            <button className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-[#4ade80] text-black hover:bg-[#22c55e]">
              Seguir
            </button>
          </div>
        </div>

        {/* INFO PRINCIPAL */}
        <div className="px-6 mt-6">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
              {user.nome}
            </h2>
            <CheckCircle size={18} className="text-[#4ade80] fill-current" />
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-1 mb-4">
            <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">
              {user.turma} • Medicina
            </p>
            <span className="bg-zinc-800 border border-zinc-700 px-3 py-0.5 rounded-full text-[10px] font-black text-zinc-400 uppercase tracking-tighter flex items-center gap-1">
              <ShieldCheck size={10} /> Sócio Ativo
            </span>
          </div>

          <div className="flex gap-6 mb-4">
            <div className="flex gap-1 items-center">
              <span className="font-black text-white">??</span>
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                Seguidores
              </span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="font-black text-white">??</span>
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                Seguindo
              </span>
            </div>
          </div>

          {/* INSTAGRAM */}
          <div className="mb-4">
            <Link
              href={`https://instagram.com/${user.insta.replace("@", "")}`}
              target="_blank"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-pink-500/20 px-4 py-2 rounded-xl hover:scale-105 transition-transform group"
            >
              <Instagram
                size={16}
                className="text-pink-500 group-hover:animate-pulse"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                {user.insta}
              </span>
            </Link>
          </div>

          <div className="bg-[#111] border-l-4 border-[#4ade80] p-4 mt-2 rounded-r-2xl">
            <p className="text-zinc-300 text-sm italic font-medium leading-relaxed">
              {user.bio}
            </p>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-3 gap-2 mt-8">
            <div className="p-4 rounded-[2rem] border bg-[#111] border-zinc-800 shadow-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xl font-black italic tracking-tighter text-white">
                  ??
                </span>
              </div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-center text-zinc-500">
                Treinos
              </span>
            </div>
            <div className="p-4 rounded-[2rem] border bg-[#111] border-zinc-800 shadow-xl">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xl font-black italic tracking-tighter text-white">
                  ??
                </span>
                <Flame size={16} className="text-orange-500" />
              </div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-center text-zinc-500">
                Sequência
              </span>
            </div>
            <div className="p-4 rounded-[2rem] border bg-[#4ade80] border-[#4ade80]">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-xl font-black italic tracking-tighter text-black">
                  {user.pontos}
                </span>
              </div>
              <span className="block text-[8px] font-black uppercase tracking-widest text-center text-black/60">
                XP Geral
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
