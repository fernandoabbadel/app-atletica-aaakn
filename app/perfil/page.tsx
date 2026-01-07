"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Dumbbell,
  Flame,
  Settings,
  MoreHorizontal,
  MessageCircle,
  X,
  MapPin,
  Heart,
  Users,
  CheckCircle,
  Star,
  ShieldCheck,
  Zap,
  Edit3,
  Share2,
  Flag,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
// Suba dois níveis para sair de 'perfil' e 'app' e chegar na raiz
import { useAuth } from "../../context/AuthContext";
// --- DADOS UNIFICADOS (SIMULAÇÃO DE HISTÓRICO) ---
const HISTORY_ACTIVITIES = [
  {
    id: 1,
    tipo: "Musculação",
    local: "Smart Fit Serramar",
    data: "Hoje, 07:30",
    foto: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80",
    legenda: "Foco no quadríceps hoje! 🍗 O projetinho vem.",
    likes: 42,
    comentarios: 5,
    validado: true,
  },
  {
    id: 2,
    tipo: "Cardio",
    local: "Orla da Praia",
    data: "Ontem, 18:00",
    foto: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&q=80",
    legenda: "Corridinha pra soltar a musculatura.",
    likes: 28,
    comentarios: 2,
    validado: true,
  },
];

const HISTORY_ACHIEVEMENTS = [
  {
    id: 1,
    titulo: "Rato de Academia I",
    desc: "10 treinos no mês",
    icone: "🐭",
    data: "12 dez",
  },
  {
    id: 2,
    titulo: "Pose do Dia",
    desc: "Completou o desafio",
    icone: "🔥",
    data: "10 dez",
  },
  {
    id: 3,
    titulo: "Sócio Ouro",
    desc: "Renovou a carteirinha",
    icone: "💳",
    data: "01 dez",
  },
];

const COMMUNITY_POSTS = [
  {
    id: 1,
    texto: "Bora marcar um rachão na quadra nova?",
    data: "Há 2 horas",
    likes: 15,
    comentarios: 3,
  },
];

export default function MyProfilePage() {
  const params = useParams();
  const { user } = useAuth(); // Puxando dados dinâmicos do usuário logado
  const [activeTab, setActiveTab] = useState<
    "activities" | "conquests" | "community"
  >("activities");
  const [selectedPost, setSelectedPost] = useState<any>(null);

  if (!user) return null; // Proteção contra carregamento

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Meu Perfil
          </h1>
          <p className="text-xs font-bold text-[#4ade80]">{user.handle}</p>
        </div>
        <Link
          href="/configuracoes"
          className="p-2 -mr-2 text-zinc-400 hover:text-white"
        >
          <Settings size={24} />
        </Link>
      </header>

      <main>
        <div className="relative mb-24">
          <div className="h-44 bg-gradient-to-b from-[#1a3a2a] to-[#050505] border-b border-white/5"></div>
          <div className="absolute -bottom-20 left-4">
            <div className="relative">
              <div className="w-36 h-36 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl">
                <img
                  src={user.foto}
                  className="w-full h-full object-cover scale-110"
                  alt="Profile"
                />
              </div>
              {/* Badge LV Responsiva para LV100 */}
              <div className="absolute -top-1 -left-1 bg-[#4ade80] text-black min-w-[2.5rem] h-10 px-2 rounded-full border-4 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg animate-pulse whitespace-nowrap">
                LV{user.level}
              </div>
              <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-full border-[4px] border-[#050505] flex items-center justify-center shadow-lg overflow-hidden z-10">
                <img
                  src={`/turma${user.turma.replace(/\D/g, "")}.jpeg`}
                  className="w-full h-full object-cover"
                  alt="Logo Turma"
                />
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 right-4 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-lg">
              <Share2 size={18} />
            </button>
            <Link
              href="/cadastro"
              className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-[#4ade80] text-black hover:bg-[#22c55e]"
            >
              <Edit3 size={16} /> Editar Perfil
            </Link>
          </div>
        </div>

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
            <span className="bg-[#4ade80]/10 border border-[#4ade80]/50 px-3 py-0.5 rounded-full text-[10px] font-black text-[#4ade80] uppercase tracking-tighter flex items-center gap-1">
              <ShieldCheck size={10} /> {user.plano_badge}
            </span>
          </div>

          <div className="flex gap-6 mb-4">
            <div className="flex gap-1 items-center">
              <span className="font-black text-white">{user.seguidores}</span>
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                Seguidores
              </span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="font-black text-white">{user.seguindo}</span>
              <span className="text-[10px] uppercase font-bold text-zinc-500">
                Seguindo
              </span>
            </div>
          </div>

          {/* BOTÃO INSTAGRAM RESPONSIVO E MODERNO */}
          {user.instagram && (
            <div className="mb-4">
              <Link
                href={`https://instagram.com/${user.instagram.replace(
                  "@",
                  ""
                )}`}
                target="_blank"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-pink-500/20 px-4 py-2 rounded-xl hover:scale-105 transition-transform group"
              >
                <Instagram
                  size={16}
                  className="text-pink-500 group-hover:animate-pulse"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  {user.instagram}
                </span>
              </Link>
            </div>
          )}

          <div className="bg-[#111] border-l-4 border-[#4ade80] p-4 mt-2 rounded-r-2xl">
            <p className="text-zinc-300 text-sm italic font-medium leading-relaxed">
              {user.bio}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-8">
            <StatCard label="Treinos" value="42" />
            <StatCard
              label="Sequência"
              value="12"
              icon={<Flame size={16} className="text-orange-500" />}
            />
            <StatCard label="XP Geral" value={user.xp} highlight />
          </div>
        </div>

        <div className="mt-10 px-4 border-b border-zinc-900 flex gap-2 overflow-x-auto scrollbar-hide">
          <TabButton
            active={activeTab === "activities"}
            onClick={() => setActiveTab("activities")}
            icon={<Dumbbell size={16} />}
            label="GymRats"
          />
          <TabButton
            active={activeTab === "conquests"}
            onClick={() => setActiveTab("conquests")}
            icon={<Trophy size={16} />}
            label="Skills"
          />
          <TabButton
            active={activeTab === "community"}
            onClick={() => setActiveTab("community")}
            icon={<MessageCircle size={16} />}
            label="Posts"
          />
        </div>

        <div className="p-4 min-h-[400px]">
          {activeTab === "activities" && (
            <div className="grid grid-cols-2 gap-2">
              {HISTORY_ACTIVITIES.map((activity) => (
                <div
                  key={activity.id}
                  onClick={() => setSelectedPost(activity)}
                  className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5"
                >
                  <img
                    src={activity.foto}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    alt="Treino"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold uppercase">
                      {activity.tipo}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* ... Mapeamento das outras abas (conquests e community) ... */}
        </div>
      </main>
    </div>
  );
}

// Funções auxiliares StatCard e TabButton omitidas para brevidade, mantenha as originais do arquivo.
