"use client";

import React, { use, useState } from "react";
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
  Crown,
  Martini,
  Ticket,
  Fish,
  Anchor,
  Medal,
  Zap,
  Heart
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SharkAvatar from "../../components/SharkAvatar"; // Certifique-se de ter criado este componente

// ============================================================================
// 1. DADOS MOCKADOS (SIMULAÇÃO DE BANCO DE DADOS)
// ============================================================================

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
    bio: "Focada no Intermed! 🦈 | Diretoria de Esportes",
    plano: "Tubarão Rei",
    patente: "Megalodon"
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
    bio: "Gym rat de carteirinha. Se não for pra treinar pesado eu nem vou.",
    plano: "Tubarão Titular",
    patente: "Tubarão Branco"
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
    bio: "Futura cirurgiã 🩺 | Apaixonada pela Atlética 💚",
    plano: "Lenda dos Eventos",
    patente: "Tubarão Martelo"
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
      bio: "Shark Team 🦈 | O importante é competir (e beber).",
      plano: "Lenda do Bar",
      patente: "Barracuda"
  },
];

// MOCK DE CONQUISTAS (Exemplo para preencher a aba Skills)
const MOCK_USER_ACHIEVEMENTS = [
    { id: 1, titulo: "Primeiro Mergulho", desc: "Criou a conta no App.", icone: "🌊", xp: 10 },
    { id: 2, titulo: "Influencer", desc: "Teve 50 likes em posts.", icone: "📸", xp: 500 },
    { id: 5, titulo: "Gym Rat I", desc: "5 treinos na semana.", icone: "💪", xp: 200 },
    { id: 9, titulo: "Rei do Camarote", desc: "Foi em 3 festas seguidas.", icone: "👑", xp: 300 },
];

// MOCK DE POSTS (Exemplo para preencher a aba Posts)
const MOCK_USER_POSTS = [
    { id: 101, texto: "Alguém anima o treino de perna hoje na Smart? 🏋️‍♀️", data: "Há 3 horas", likes: 24, comentarios: 5 },
    { id: 102, texto: "Venda de ingressos pro Intermed tá voando! Garanta o seu com a gente.", data: "Ontem", likes: 56, comentarios: 12 },
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
// 3. COMPONENTE DA PÁGINA
// ============================================================================

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  // Desembrulhar params (Next.js 15)
  const { id } = use(params);
  
  // Estado das Abas
  const [activeTab, setActiveTab] = useState<"activities" | "conquests" | "community">("activities");

  // Buscar usuário (Simulado)
  const user = MOCK_USERS_DB.find((u) => u.id === Number(id));

  // Se não achar, 404
  if (!user) return notFound();

  // Estilos Calculados
  const planStyle = getPlanBadge(user.plano || "Cação");

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER FIXO */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900 shadow-md">
        <Link href="/ranking" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Perfil do Atleta</h1>
          <p className="text-xs font-bold text-[#4ade80]">{user.handle}</p>
        </div>
        <button className="p-2 -mr-2 text-zinc-400 hover:text-white transition">
          <MoreHorizontal size={24} />
        </button>
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
                <img src={user.avatar} className="w-full h-full object-cover scale-110" alt={user.nome} />
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
            <button className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-[#4ade80] text-black hover:bg-[#22c55e] active:scale-95 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]">
              Seguir
            </button>
          </div>
        </div>

        {/* ================================================================================= */}
        {/* INFO DO PERFIL */}
        {/* ================================================================================= */}
        <div className="px-6 mt-8 relative">
            
            {/* 5. MASCOTE ANIMADO (SHARK AVATAR) */}
            {/* 5. MASCOTE ANIMADO (CENTRALIZADO) */}
{/* Mudamos de 'right-6' para 'left-1/2 -translate-x-1/2' para ficar no MEIO */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-24 z-20 pointer-events-auto hover:scale-110 transition-transform duration-300">
    <SharkAvatar name="Sharky" size="lg" />
</div>

            {/* Nome e Patente */}
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    {user.nome}
                </h2>
                {getPatenteIcon(user.patente || "")}
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
                    <span className="font-black text-white group-hover:text-[#4ade80] transition">245</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Seguidores</span>
                </div>
                <div className="flex gap-1 items-center group cursor-pointer">
                    <span className="font-black text-white group-hover:text-[#4ade80] transition">180</span>
                    <span className="text-[10px] uppercase font-bold text-zinc-500">Seguindo</span>
                </div>
            </div>

            {/* Instagram Button */}
            {user.insta && (
                <div className="mb-5">
                <Link href={`https://instagram.com/${user.insta.replace("@", "")}`} target="_blank" className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-pink-500/20 px-4 py-2.5 rounded-xl hover:scale-105 transition-transform group shadow-lg shadow-pink-500/5">
                    <Instagram size={16} className="text-pink-500 group-hover:animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-white transition">{user.insta}</span>
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
                    <span className="block text-xl font-black italic text-white">14</span>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-center text-zinc-500 mt-1">Treinos</span>
                </div>
                <div className="p-4 rounded-[2rem] border bg-[#111] border-zinc-800 shadow-xl flex flex-col items-center justify-center">
                    <div className="flex justify-center items-center gap-1">
                        <span className="text-xl font-black italic text-white">5</span>
                        <Flame size={16} className="text-orange-500 fill-orange-500 animate-pulse"/>
                    </div>
                    <span className="block text-[8px] font-black uppercase tracking-widest text-center text-zinc-500 mt-1">Sequência</span>
                </div>
                <div className="p-4 rounded-[2rem] border bg-[#4ade80] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)] flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 blur-xl"></div>
                    <span className="block text-xl font-black italic text-black relative z-10">{user.pontos}</span>
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
            <Dumbbell size={16} /> Atividades
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
        <div className="p-4 min-h-[300px] animate-in fade-in slide-in-from-bottom-4 duration-500">
             
             {/* 1. ATIVIDADES */}
             {activeTab === "activities" && (
                <div className="text-center py-16 text-zinc-500 italic text-sm border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                    <Dumbbell className="mx-auto mb-3 opacity-20" size={48}/>
                    <p>Este atleta mantém seus treinos em segredo...</p>
                    <p className="text-[10px] mt-1">(Ou não treinou hoje 👀)</p>
                </div>
             )}

             {/* 2. SKILLS (CONQUISTAS) */}
             {activeTab === "conquests" && (
                <div className="grid grid-cols-1 gap-3">
                  {MOCK_USER_ACHIEVEMENTS.map((ach) => (
                    <div key={ach.id} className="bg-[#111] p-4 rounded-2xl border border-zinc-800 flex items-center gap-4 hover:border-zinc-700 transition group">
                      <div className="text-2xl p-3 bg-black rounded-xl border border-zinc-800 shadow-inner group-hover:scale-110 transition-transform">{ach.icone}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black italic text-white uppercase tracking-tight truncate">{ach.titulo}</h4>
                        <p className="text-[10px] text-zinc-500 truncate">{ach.desc}</p>
                      </div>
                      <span className="text-[9px] text-[#4ade80] font-bold bg-[#4ade80]/10 px-2 py-1 rounded-lg border border-[#4ade80]/20">+{ach.xp} XP</span>
                    </div>
                  ))}
                </div>
             )}

             {/* 3. POSTS DA COMUNIDADE */}
             {activeTab === "community" && (
                <div className="space-y-4">
                  {MOCK_USER_POSTS.map((post) => (
                    <div key={post.id} className="bg-[#111] p-5 rounded-3xl border border-zinc-800 shadow-sm hover:border-zinc-700 transition">
                      <div className="flex items-center gap-3 mb-3">
                          <img src={user.avatar} className="w-8 h-8 rounded-full border border-zinc-700 object-cover"/>
                          <div>
                              <p className="text-xs font-bold text-white">{user.nome}</p>
                              <p className="text-[10px] text-zinc-500 font-medium">{post.data}</p>
                          </div>
                      </div>
                      <p className="text-sm mb-4 italic text-zinc-300 leading-relaxed">"{post.texto}"</p>
                      <div className="flex items-center gap-4 pt-4 border-t border-zinc-900">
                        <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-red-500 transition group">
                          <Heart size={14} className="group-hover:fill-current"/> {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-[#4ade80] transition group">
                          <MessageCircle size={14} className="group-hover:fill-current"/> {post.comentarios}
                        </button>
                      </div>
                    </div>
                  ))}
                  {MOCK_USER_POSTS.length === 0 && (
                      <div className="text-center py-10 text-zinc-500 italic text-sm">
                        Nenhum post encontrado.
                      </div>
                  )}
                </div>
             )}
        </div>

      </main>
    </div>
  );
}