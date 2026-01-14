"use client";

import React, { useState } from "react";
import { ArrowLeft, Search, Filter, Lock, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// IMPORTANDO ÍCONES "BRABOS"
import { 
  GiSharkFin, GiTrophyCup, GiBiceps, GiBoxingGlove, GiBroadsword, 
  GiSkeleton, GiShoppingBag, GiPartyPopper, GiBeerBottle, GiTicket, 
  GiOpenBook, GiMoneyStack, GiHeartBeats, GiMegaphone, GiHandcuffs,
  GiCrown, GiMuscleUp, GiDiamonds, GiPadlock
} from "react-icons/gi";
import { FaInstagram, FaHandHoldingHeart, FaUserAstronaut } from "react-icons/fa6";

// ============================================================================
// 1. DADOS & CONFIGURAÇÃO (ENGINE)
// ============================================================================

type Categoria = "Todas" | "Gym" | "Games" | "Social" | "Loja" | "Eventos";

// Sistema de Níveis (Badges)
const BADGES = [
    { id: 1, titulo: "Plâncton", minXp: 0, cor: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/30", icon: <GiSharkFin className="opacity-50"/> },
    { id: 2, titulo: "Peixe Palhaço", minXp: 1000, cor: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: <FaUserAstronaut/> },
    { id: 3, titulo: "Barracuda", minXp: 5000, cor: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: <GiBroadsword/> },
    { id: 4, titulo: "Tubarão Martelo", minXp: 15000, cor: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: <GiSharkFin/> },
    { id: 5, titulo: "Tubarão Branco", minXp: 50000, cor: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: <GiSharkFin className="scale-125"/> },
    { id: 6, titulo: "MEGALODON", minXp: 100000, cor: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30", icon: <GiCrown/> },
];

export default function ConquistasPage() {
  // Estado do Usuário (Mockado)
  const userStats = {
    xp: 18450,
    conquistasDesbloqueadas: 14,
    totalConquistas: 24,
  };

  // Lógica de Patente Atual
  const currentBadgeIndex = BADGES.slice().reverse().findIndex(b => userStats.xp >= b.minXp);
  // O slice().reverse() inverte o array, então o index precisa ser ajustado:
  const realCurrentIndex = BADGES.length - 1 - currentBadgeIndex;
  
  // Estado do Carrossel (Começa mostrando a patente atual do usuário)
  const [viewIndex, setViewIndex] = useState(realCurrentIndex);

  const displayedBadge = BADGES[viewIndex];
  const isCurrent = viewIndex === realCurrentIndex;
  const isLocked = viewIndex > realCurrentIndex;
  const isPast = viewIndex < realCurrentIndex;

  // Barra de Progresso (Calculada para o card atual visualizado)
  // Se for o atual: mostra progresso real. Se for passado: 100%. Se for futuro: 0%.
  let progressPercent = 0;
  let xpNeeded = 0;

  if (isPast) {
      progressPercent = 100;
  } else if (isCurrent) {
      const nextBadge = BADGES[viewIndex + 1];
      if (nextBadge) {
          const totalRange = nextBadge.minXp - displayedBadge.minXp;
          const currentProgress = userStats.xp - displayedBadge.minXp;
          progressPercent = (currentProgress / totalRange) * 100;
          xpNeeded = nextBadge.minXp - userStats.xp;
      } else {
          progressPercent = 100; // Nível máximo
      }
  } else if (isLocked) {
      progressPercent = 0;
      xpNeeded = displayedBadge.minXp - userStats.xp;
  }

  // Navegação do Carrossel
  const handleNext = () => {
      if (viewIndex < BADGES.length - 1) setViewIndex(viewIndex + 1);
  };
  const handlePrev = () => {
      if (viewIndex > 0) setViewIndex(viewIndex - 1);
  };

  const [filtro, setFiltro] = useState<Categoria>("Todas");

  // LISTA DE CONQUISTAS
  const conquistas = [
    // GERAL & SOCIAL
    { id: 1, titulo: "Primeiro Mergulho", desc: "Criou a conta no App.", cat: "Social", xp: 10, icon: <GiSharkFin/>, progress: 1, target: 1 },
    { id: 2, titulo: "Influencer", desc: "Teve 50 likes em posts.", cat: "Social", xp: 500, icon: <GiHeartBeats/>, progress: 32, target: 50 },
    { id: 3, titulo: "Tagarela", desc: "Comentou em 100 posts.", cat: "Social", xp: 300, icon: <GiMegaphone/>, progress: 100, target: 100 },
    { id: 4, titulo: "Sentinela", desc: "Fez uma denúncia útil.", cat: "Social", xp: 100, icon: <GiHandcuffs/>, progress: 0, target: 1 },
    
    // GYM (TREINOS)
    { id: 5, titulo: "Gym Rat I", desc: "5 treinos na semana.", cat: "Gym", xp: 200, icon: <GiMuscleUp/>, progress: 3, target: 5 },
    { id: 6, titulo: "Monstro da Jaula", desc: "Check-in antes das 6h da manhã.", cat: "Gym", xp: 500, icon: <GiBiceps/>, progress: 1, target: 1 },
    { id: 7, titulo: "Shape Inexplicável", desc: "100 Treinos confirmados.", cat: "Gym", xp: 2000, icon: <GiBiceps className="text-yellow-500"/>, progress: 42, target: 100 },
    
    // GAMES (RPG & ARENA)
    { id: 9, titulo: "Gladiador", desc: "Venceu 10 batalhas PVP.", cat: "Games", xp: 500, icon: <GiBroadsword/>, progress: 8, target: 10 },
    { id: 10, titulo: "One Hit KO", desc: "Venceu com 1 golpe crítico.", cat: "Games", xp: 1000, icon: <GiBoxingGlove/>, progress: 0, target: 1 },
    { id: 11, titulo: "Saco de Pancada", desc: "Perdeu 5 seguidas.", cat: "Games", xp: 50, icon: <GiSkeleton/>, progress: 2, target: 5 },
    
    // LOJA & ECONOMIA
    { id: 14, titulo: "Patrocinador", desc: "Gastou 5000 XP na loja.", cat: "Loja", xp: 500, icon: <GiShoppingBag/>, progress: 1200, target: 5000 },
    { id: 16, titulo: "Ostentação", desc: "Comprou o item mais caro.", cat: "Loja", xp: 5000, icon: <GiDiamonds/>, progress: 0, target: 1 },
    
    // EVENTOS & BAR
    { id: 18, titulo: "Inimigo do Fim", desc: "Check-in em 3 festas seguidas.", cat: "Eventos", xp: 300, icon: <GiBeerBottle/>, progress: 3, target: 3 },
    { id: 19, titulo: "Sócio Torcedor", desc: "Foi a todos os jogos.", cat: "Eventos", xp: 2000, icon: <GiPartyPopper/>, progress: 1, target: 4 },
    { id: 20, titulo: "Nerd da Turma", desc: "Foi em 1 evento acadêmico.", cat: "Eventos", xp: 100, icon: <GiOpenBook/>, progress: 0, target: 1 },
    { id: 22, titulo: "Primeiro Lote", desc: "Comprou ingresso na hora.", cat: "Eventos", xp: 500, icon: <GiTicket/>, progress: 1, target: 1 },
    
    // PLANOS
    { id: 23, titulo: "Sócio Elite", desc: "Assinou o plano Anual.", cat: "Loja", xp: 10000, icon: <GiMoneyStack/>, progress: 1, target: 1 },
    { id: 24, titulo: "Tubarão Solidário", desc: "Doou para ação social.", cat: "Social", xp: 1000, icon: <FaHandHoldingHeart/>, progress: 0, target: 1 },
  ];

  const filteredConquistas = filtro === "Todas" ? conquistas : conquistas.filter(c => c.cat === filtro);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-white/5 shadow-lg">
        <Link href="/menu" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
            <h1 className="font-black text-lg italic uppercase tracking-tighter">Sala de Troféus</h1>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Suas Conquistas</p>
        </div>
      </header>

      <main className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- 1. CARROSSEL DE NÍVEL (INTERATIVO) --- */}
        <section className={`relative overflow-hidden rounded-3xl border ${displayedBadge.border} ${displayedBadge.bg} p-6 text-center shadow-2xl transition-colors duration-500`}>
            
            {/* Setas de Navegação */}
            <button 
                onClick={handlePrev} 
                disabled={viewIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white disabled:opacity-20 transition"
            >
                <ChevronLeft size={32}/>
            </button>
            <button 
                onClick={handleNext} 
                disabled={viewIndex === BADGES.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white disabled:opacity-20 transition"
            >
                <ChevronRight size={32}/>
            </button>

            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>

            <div className="relative z-10 px-6">
                <div className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-zinc-950/80 border-4 ${displayedBadge.border} shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-500`}>
                    <span className={`text-6xl drop-shadow-lg ${displayedBadge.cor} ${isLocked ? 'grayscale opacity-50 blur-[2px]' : ''}`}>
                        {isLocked ? <GiPadlock/> : displayedBadge.icon}
                    </span>
                </div>
                
                <h2 className={`text-3xl font-black uppercase italic tracking-tighter ${displayedBadge.cor} drop-shadow-md transition-all duration-500`}>
                    {displayedBadge.titulo}
                </h2>
                
                {/* STATUS DA PATENTE */}
                <div className="mt-2 min-h-[60px] flex flex-col items-center justify-center">
                    {isCurrent && (
                        <div className="w-full animate-in zoom-in duration-300">
                            <span className="text-[10px] font-bold text-white bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest mb-3 inline-block">Patente Atual</span>
                            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                                {userStats.xp} / {BADGES[viewIndex + 1]?.minXp || "MAX"} XP
                            </p>
                        </div>
                    )}

                    {isPast && (
                        <div className="animate-in zoom-in duration-300">
                            <div className="flex items-center gap-2 text-emerald-500 font-bold bg-emerald-950/50 px-4 py-2 rounded-xl border border-emerald-900">
                                <CheckCircle2 size={16}/> <span>Conquistado</span>
                            </div>
                        </div>
                    )}

                    {isLocked && (
                        <div className="animate-in zoom-in duration-300">
                            <p className="text-xs text-zinc-500 font-bold uppercase mb-1">Bloqueado</p>
                            <p className="text-sm font-mono text-white">Necessário <span className="text-red-400 font-black">{displayedBadge.minXp} XP</span></p>
                            <p className="text-[10px] text-zinc-600 mt-1">Faltam {xpNeeded} XP</p>
                        </div>
                    )}
                </div>
            </div>
        </section>

        {/* --- 2. FILTROS --- */}
        <section className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
                {["Todas", "Gym", "Games", "Loja", "Eventos", "Social"].map((cat) => (
                    <button 
                        key={cat}
                        onClick={() => setFiltro(cat as Categoria)}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition border ${
                            filtro === cat 
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/20" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </section>

        {/* --- 3. LISTA DE CONQUISTAS --- */}
        <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <GiTrophyCup size={14} className="text-yellow-500"/> Conquistas
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                    <span className="text-white">{userStats.conquistasDesbloqueadas}</span> / {userStats.totalConquistas} Liberadas
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {filteredConquistas.map((item) => {
                    const desbloqueada = item.progress >= item.target;
                    const percent = Math.min((item.progress / item.target) * 100, 100);

                    return (
                        <div key={item.id} className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 group ${
                            desbloqueada 
                            ? "bg-zinc-900 border-emerald-500/30 shadow-md" 
                            : "bg-black border-zinc-800/60 opacity-60 grayscale hover:opacity-100 hover:grayscale-0"
                        }`}>
                            {/* Barra de Fundo Sutil */}
                            <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 transition-all duration-1000" style={{ width: `${percent}%` }}></div>

                            <div className="flex items-center gap-4 relative z-10">
                                {/* Ícone */}
                                <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center border transition-colors ${
                                    desbloqueada 
                                    ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]" 
                                    : "bg-zinc-800 text-zinc-600 border-zinc-700"
                                }`}>
                                    <span className="text-2xl">{desbloqueada ? item.icon : <Lock size={20}/>}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-bold truncate ${desbloqueada ? "text-white" : "text-zinc-400"}`}>{item.titulo}</h4>
                                        {desbloqueada && <CheckCircle2 size={16} className="text-emerald-500 shrink-0 drop-shadow-glow"/>}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 font-medium">{item.desc}</p>
                                    
                                    {/* Barra Miniatura e XP */}
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="h-2 flex-1 rounded-full bg-zinc-950 overflow-hidden border border-white/5">
                                            <div className={`h-full rounded-full ${desbloqueada ? 'bg-emerald-500' : 'bg-zinc-700'}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <span className={`text-[9px] font-black ${desbloqueada ? "text-emerald-400" : "text-zinc-600"}`}>
                                            {item.progress}/{item.target}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* XP Badge Flutuante */}
                            <div className="absolute top-3 right-3">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                    desbloqueada 
                                    ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/20" 
                                    : "bg-zinc-900 text-zinc-600 border-zinc-800"
                                }`}>
                                    +{item.xp} XP
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>

      </main>
    </div>
  );
}