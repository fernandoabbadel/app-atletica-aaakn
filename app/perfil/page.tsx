"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Trophy,
  Dumbbell,
  Flame,
  Settings,
  MessageCircle,
  X,
  Heart,
  CheckCircle,
  ShieldCheck,
  Edit3,
  Share2,
  Instagram,
  Crown,
  Martini,
  Ticket,
  Fish,
  Anchor,
  Medal,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import SharkAvatar from "../components/SharkAvatar"; 

// ============================================================================
// 1. DADOS MOCKADOS (SIMULAÇÃO)
// ============================================================================
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
  },
];

const HISTORY_ACHIEVEMENTS = [
  { id: 1, titulo: "Rato de Academia I", desc: "10 treinos no mês", icone: "🐭", data: "12 dez", xp: 200 },
  { id: 2, titulo: "Pose do Dia", desc: "Completou o desafio", icone: "🔥", data: "10 dez", xp: 50 },
  { id: 3, titulo: "Sócio Ouro", desc: "Renovou a carteirinha", icone: "💳", data: "01 dez", xp: 500 },
];

const COMMUNITY_POSTS = [
  { id: 1, texto: "Bora marcar um rachão na quadra nova?", data: "Há 2 horas", likes: 15, comentarios: 3 },
];

// ============================================================================
// 2. HELPERS VISUAIS
// ============================================================================

const getPlanBadge = (plano: string) => {
  const p = plano?.toLowerCase() || "cação";
  
  if (p.includes("rei")) return { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50", icon: <Crown size={12} />, label: "Tubarão Rei" };
  if (p.includes("lenda do bar")) return { color: "bg-purple-500/10 text-purple-500 border-purple-500/50", icon: <Martini size={12} />, label: "Lenda do Bar" };
  if (p.includes("eventos")) return { color: "bg-orange-500/10 text-orange-500 border-orange-500/50", icon: <Ticket size={12} />, label: "Lenda dos Eventos" };
  if (p.includes("martelo")) return { color: "bg-blue-500/10 text-blue-500 border-blue-500/50", icon: <Anchor size={12} />, label: "Tubarão Martelo" };
  if (p.includes("titular")) return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/50", icon: <ShieldCheck size={12} />, label: "Tubarão Titular" };
  
  return { color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: <Fish size={12} />, label: "Plano Cação" };
};

const getPatenteIcon = (patente: string) => {
    const p = patente?.toLowerCase() || "";
    if (p.includes("megalodon")) return <div className="text-red-600 bg-red-600/10 rounded-full p-1" title="Megalodon"><Zap size={14} fill="currentColor"/></div>;
    if (p.includes("branco")) return <div className="text-emerald-400 bg-emerald-400/10 rounded-full p-1" title="Tubarão Branco"><Medal size={14} fill="currentColor"/></div>;
    if (p.includes("martelo")) return <div className="text-purple-400 bg-purple-400/10 rounded-full p-1" title="Tubarão Martelo"><Anchor size={14} fill="currentColor"/></div>;
    
    return <div className="text-blue-400 bg-blue-400/10 rounded-full p-1" title="Verificado"><CheckCircle size={14} fill="currentColor"/></div>;
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

export default function MyProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"activities" | "conquests" | "community">("activities");
  const [selectedPost, setSelectedPost] = useState<any>(null);

  if (!user) return null;

  const planStyle = getPlanBadge(user.plano || "Tubarão Titular");
  const patente = user.patente || "Megalodon";

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900 shadow-md">
        <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Meu Perfil</h1>
          <p className="text-xs font-bold text-[#4ade80]">{user.handle}</p>
        </div>
        <Link href="/configuracoes" className="p-2 -mr-2 text-zinc-400 hover:text-white">
          <Settings size={24} />
        </Link>
      </header>

      <main>
        {/* ================================================================================= */}
        {/* ÁREA DA CAPA (HERO SECTION) */}
        {/* ================================================================================= */}
        <div className="relative mb-28">
          
          {/* 1. Capa com Gradiente */}
          <div className="h-44 bg-gradient-to-b from-[#1a3a2a] to-[#050505] border-b border-white/5 relative">
              
              {/* 2. LOGO CENTRALIZADO (Na linha de corte) */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-16 h-16 bg-[#050505] rounded-full p-1 border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                       {/* Certifique-se que logo.png existe em /public */}
                       <img src="/logo.png" alt="AAAKN Logo" className="w-full h-full object-contain opacity-90 drop-shadow-md" />
                  </div>
              </div>

          </div>

          {/* 3. Avatar do Usuário (Esquerda) */}
          <div className="absolute -bottom-20 left-4 z-10">
            <div className="relative group cursor-pointer">
              {/* Foto Redonda */}
              <div className="w-36 h-36 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <img src={user.foto} className="w-full h-full object-cover scale-110" alt={user.nome} />
              </div>
              
              {/* Badge de Nível (Canto Sup Esq) */}
              <div className="absolute -top-1 -left-1 bg-[#4ade80] text-black min-w-[2.5rem] h-10 px-2 rounded-full border-4 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg animate-pulse whitespace-nowrap">
                LV{user.level}
              </div>

              {/* Logo Turma (Canto Inf Dir) */}
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

          {/* 4. Botões de Ação (Direita) */}
          <div className="absolute -bottom-16 right-4 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-lg hover:bg-zinc-800 active:scale-95 transition">
              <Share2 size={18} />
            </button>
            <Link href="/cadastro" className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-[#4ade80] text-black hover:bg-[#22c55e] active:scale-95 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]">
              <Edit3 size={16} /> Editar
            </Link>
          </div>
        </div>

        {/* ================================================================================= */}
        {/* INFO DO PERFIL */}
        {/* ================================================================================= */}
        <div className="px-6 mt-8 relative">
            
            {/* 5. MASCOTE ANIMADO (SHARK AVATAR) */}
            {/* Posicionado flutuando à direita superior desta seção */}
            <div className="absolute top-0 right-6 -mt-24 pointer-events-none z-10 select-none">
                <SharkAvatar name="Sharky" size="md" />
            </div>

            {/* Nome e Patente */}
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    {user.nome}
                </h2>
                {getPatenteIcon(patente)}
            </div>

            {/* Turma e Plano */}
            <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest bg-zinc-900/50 px-2 py-0.5 rounded-md border border-zinc-800/50">
                    {user.turma} • Medicina
                </p>
                <span className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm ${planStyle.color}`}>
                   {planStyle.icon} {planStyle.label}
                </span>
            </div>

            {/* Stats Sociais */}
            <div className="flex gap-6 mb-5">
                <div className="flex gap-1 items-center group cursor-pointer">
                    <span className="font-black text-white group-hover:text-[#4ade80] transition">{user.seguidores}</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Seguidores</span>
                </div>
                <div className="flex gap-1 items-center group cursor-pointer">
                    <span className="font-black text-white group-hover:text-[#4ade80] transition">{user.seguindo}</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Seguindo</span>
                </div>
            </div>

            {/* Instagram Button */}
            {user.instagram && (
                <div className="mb-5">
                <Link href={`https://instagram.com/${user.instagram.replace("@", "")}`} target="_blank" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-pink-500/20 px-4 py-2.5 rounded-xl hover:scale-105 transition-transform group shadow-lg shadow-pink-500/5">
                    <Instagram size={16} className="text-pink-500 group-hover:animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-white transition">{user.instagram}</span>
                </Link>
                </div>
            )}

            {/* Bio Box */}
            <div className="bg-[#0a0a0a] border-l-4 border-[#4ade80] p-4 mt-2 rounded-r-2xl mb-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-5"><Fish size={40}/></div>
                <p className="text-zinc-300 text-sm italic font-medium leading-relaxed relative z-10">
                    "{user.bio}"
                </p>
            </div>

            {/* Grid de Stats (Treinos, Sequencia, XP) */}
            <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-4 rounded-[2rem] border bg-[#111] border-zinc-800 shadow-xl flex flex-col items-center justify-center">
                    <span className="block text-xl font-black italic text-white text-center">42</span>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-center text-zinc-500 mt-1">Treinos</span>
                </div>
                <div className="p-4 rounded-[2rem] border bg-[#111] border-zinc-800 shadow-xl flex flex-col items-center justify-center">
                    <div className="flex justify-center items-center gap-1">
                        <span className="text-xl font-black italic text-white">12</span>
                        <Flame size={16} className="text-orange-500 fill-orange-500 animate-pulse"/>
                    </div>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-center text-zinc-500 mt-1">Sequência</span>
                </div>
                <div className="p-4 rounded-[2rem] border bg-[#4ade80] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 blur-xl"></div>
                    <span className="block text-xl font-black italic text-black relative z-10">{user.xp}</span>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-center text-black/60 relative z-10 mt-1">XP Geral</span>
                </div>
            </div>
        </div>

        {/* ================================================================================= */}
        {/* ABAS (TABS) */}
        {/* ================================================================================= */}
        <div className="mt-10 px-4 border-b border-zinc-900 flex gap-2 overflow-x-auto scrollbar-hide sticky top-[72px] bg-[#050505]/95 z-20 backdrop-blur-sm pt-2">
          
          <button 
            onClick={() => setActiveTab("activities")} 
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-black uppercase italic text-xs tracking-tighter transition-all relative whitespace-nowrap ${activeTab === 'activities' ? "text-[#4ade80]" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Dumbbell size={16} /> GymRats
            {activeTab === 'activities' && <div className="absolute bottom-0 w-12 h-1 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80]"></div>}
          </button>

          <button 
            onClick={() => setActiveTab("conquests")} 
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-black uppercase italic text-xs tracking-tighter transition-all relative whitespace-nowrap ${activeTab === 'conquests' ? "text-[#4ade80]" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <Trophy size={16} /> Skills
            {activeTab === 'conquests' && <div className="absolute bottom-0 w-12 h-1 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80]"></div>}
          </button>

          <button 
            onClick={() => setActiveTab("community")} 
            className={`flex-1 py-4 flex items-center justify-center gap-2 font-black uppercase italic text-xs tracking-tighter transition-all relative whitespace-nowrap ${activeTab === 'community' ? "text-[#4ade80]" : "text-zinc-500 hover:text-zinc-300"}`}
          >
            <MessageCircle size={16} /> Posts
            {activeTab === 'community' && <div className="absolute bottom-0 w-12 h-1 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80]"></div>}
          </button>

        </div>

        {/* ================================================================================= */}
        {/* CONTEÚDO DAS ABAS */}
        {/* ================================================================================= */}
        <div className="p-4 min-h-[400px]">
          
          {/* 1. ATIVIDADES */}
          {activeTab === "activities" && (
            <div className="grid grid-cols-2 gap-2">
              {HISTORY_ACTIVITIES.map((activity) => (
                <div key={activity.id} onClick={() => setSelectedPost(activity)} className="aspect-square rounded-2xl overflow-hidden relative group cursor-pointer border border-white/5">
                  <img src={activity.foto} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="Treino" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold uppercase text-white">{activity.tipo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 2. CONQUISTAS (SKILLS) */}
          {activeTab === "conquests" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {HISTORY_ACHIEVEMENTS.map((ach) => (
                <div key={ach.id} className="bg-[#111] p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 hover:border-zinc-700 transition">
                  <div className="text-3xl p-3 bg-black rounded-xl border border-zinc-800 shadow-inner">
                    {ach.icone}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black italic text-white uppercase tracking-tight truncate">{ach.titulo}</h4>
                    <p className="text-[10px] text-zinc-500 truncate">{ach.desc}</p>
                    <span className="text-[9px] text-[#4ade80] font-bold mt-1 block">+{ach.xp} XP</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. POSTS COMUNIDADE */}
          {activeTab === "community" && (
            <div className="space-y-4">
              {COMMUNITY_POSTS.map((post) => (
                <div key={post.id} className="bg-[#111] p-5 rounded-3xl border border-zinc-800">
                  <p className="text-sm mb-4 italic text-zinc-300">"{post.texto}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-zinc-900">
                    <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-500 transition">
                      <Heart size={14} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#4ade80] transition">
                      <MessageCircle size={14} /> {post.comentarios}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DETALHE TREINO */}
        {selectedPost && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedPost(null)}></div>
            <div className="bg-[#111] w-full max-w-lg rounded-[3rem] overflow-hidden border border-zinc-800 relative z-10 animate-in zoom-in-95 duration-200">
                <img src={selectedPost.foto} className="w-full h-72 object-cover" />
                <div className="p-8">
                <div className="flex justify-between items-start mb-4">
                    <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{selectedPost.tipo}</h3>
                    <p className="text-xs text-[#4ade80] font-bold uppercase">{selectedPost.local}</p>
                    </div>
                    <button onClick={() => setSelectedPost(null)} className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white"><X size={20} /></button>
                </div>
                <p className="text-zinc-300 italic mb-8">"{selectedPost.legenda}"</p>
                <div className="flex gap-3">
                    <button className="flex-1 bg-[#4ade80] text-black py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-[#3ecf72] transition">Curtir ({selectedPost.likes})</button>
                    <button className="flex-1 bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase italic tracking-tighter hover:bg-zinc-700 transition">Comentar</button>
                </div>
                </div>
            </div>
            </div>
        )}
      </main>
    </div>
  );
}