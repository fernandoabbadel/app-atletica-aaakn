"use client";

import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, Search, Lock, CheckCircle2, ChevronLeft, ChevronRight, 
  Trophy, Fish, Rocket, Swords, Skull, ShoppingBag, Gem, PartyPopper, 
  Beer, Ticket, BookOpen, DollarSign, HeartHandshake, Heart, Megaphone, 
  ShieldAlert, Crown, Activity, Dumbbell, Flame, Zap, Wallet, Timer, MessageCircle, Gamepad2
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { ACHIEVEMENTS_CATALOG, Achievement, AchievementCategory } from "../../lib/achievements";

// Mapeamento de Ícones
const IconMap: any = {
    Fish: <Fish />, Rocket: <Rocket />, Swords: <Swords />, Skull: <Skull />, 
    ShoppingBag: <ShoppingBag />, Gem: <Gem />, PartyPopper: <PartyPopper />, 
    Beer: <Beer />, Ticket: <Ticket />, BookOpen: <BookOpen />, DollarSign: <DollarSign />, 
    HeartHandshake: <HeartHandshake />, Heart: <Heart />, Megaphone: <Megaphone />, 
    ShieldAlert: <ShieldAlert />, Activity: <Activity />, Dumbbell: <Dumbbell />, 
    Flame: <Flame />, Crown: <Crown />, Zap: <Zap />, Wallet: <Wallet />, 
    Timer: <Timer />, MessageCircle: <MessageCircle />, Gamepad2: <Gamepad2 />
};

const BADGES = [
    { id: 1, titulo: "Plâncton", minXp: 0, cor: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/30", icon: <Fish className="opacity-50" size={64}/> },
    { id: 2, titulo: "Peixe Palhaço", minXp: 500, cor: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: <Fish size={64}/> },
    { id: 3, titulo: "Barracuda", minXp: 2000, cor: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: <Swords size={64}/> },
    { id: 4, titulo: "Tubarão Martelo", minXp: 5000, cor: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30", icon: <Fish size={64}/> },
    { id: 5, titulo: "Tubarão Branco", minXp: 15000, cor: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: <Fish size={80} className="scale-125"/> },
    { id: 6, titulo: "MEGALODON", minXp: 50000, cor: "text-red-600", bg: "bg-red-500/10", border: "border-red-500/30", icon: <Crown size={64}/> },
];

export default function ConquistasPage() {
  const { user } = useAuth();
  const [filtro, setFiltro] = useState<AchievementCategory | "Todas">("Todas");

  // 🦈 CORREÇÃO: Acesso direto e seguro graças à interface atualizada
  const userStats = user?.stats || {}; 
  
  // Calcula desbloqueios
  const calculatedAchievements = useMemo(() => {
      let totalXp = 0;
      let unlockedCount = 0;

      const processed = ACHIEVEMENTS_CATALOG.map(ach => {
          // Acesso dinâmico seguro (definido no index signature da interface)
          const userValue = userStats[ach.statKey] || 0;
          const isUnlocked = userValue >= ach.target;
          
          if (isUnlocked) {
              totalXp += ach.xp;
              unlockedCount++;
          }

          return { ...ach, progress: userValue, isUnlocked };
      });

      return { list: processed, totalXp, unlockedCount };
  }, [userStats]);

  const displayXp = Math.max(calculatedAchievements.totalXp, user?.xp || 0);

  // Lógica de Patente
  const currentBadgeIndex = BADGES.slice().reverse().findIndex(b => displayXp >= b.minXp);
  const realCurrentIndex = currentBadgeIndex === -1 ? 0 : BADGES.length - 1 - currentBadgeIndex;
  
  const [viewIndex, setViewIndex] = useState(realCurrentIndex);

  const displayedBadge = BADGES[viewIndex];
  const isCurrent = viewIndex === realCurrentIndex;
  const isLocked = viewIndex > realCurrentIndex;
  const isPast = viewIndex < realCurrentIndex;

  // Barra de Progresso
  let progressPercent = 0;
  let xpNeeded = 0;

  if (isPast) {
      progressPercent = 100;
  } else if (isCurrent) {
      const nextBadge = BADGES[viewIndex + 1];
      if (nextBadge) {
          const totalRange = nextBadge.minXp - displayedBadge.minXp;
          const currentProgress = displayXp - displayedBadge.minXp;
          progressPercent = Math.min((currentProgress / totalRange) * 100, 100);
          xpNeeded = nextBadge.minXp - displayXp;
      } else {
          progressPercent = 100;
      }
  } else if (isLocked) {
      progressPercent = 0;
      xpNeeded = displayedBadge.minXp - displayXp;
  }

  const handleNext = () => { if (viewIndex < BADGES.length - 1) setViewIndex(viewIndex + 1); };
  const handlePrev = () => { if (viewIndex > 0) setViewIndex(viewIndex - 1); };

  const filteredList = filtro === "Todas" 
    ? calculatedAchievements.list 
    : calculatedAchievements.list.filter(c => c.cat === filtro);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-white/5 shadow-lg">
        <Link href="/menu" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
            <h1 className="font-black text-lg italic uppercase tracking-tighter">Sala de Troféus</h1>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                {calculatedAchievements.unlockedCount} / {ACHIEVEMENTS_CATALOG.length} Desbloqueadas
            </p>
        </div>
      </header>

      <main className="p-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* CARROSSEL DE NÍVEL */}
        <section className={`relative overflow-hidden rounded-3xl border ${displayedBadge.border} ${displayedBadge.bg} p-6 text-center shadow-2xl transition-colors duration-500`}>
            
            <button onClick={handlePrev} disabled={viewIndex === 0} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white disabled:opacity-20 transition"><ChevronLeft size={32}/></button>
            <button onClick={handleNext} disabled={viewIndex === BADGES.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white disabled:opacity-20 transition"><ChevronRight size={32}/></button>

            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>

            <div className="relative z-10 px-6">
                <div className={`mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-zinc-950/80 border-4 ${displayedBadge.border} shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-500`}>
                    <div className={`drop-shadow-lg ${displayedBadge.cor} ${isLocked ? 'grayscale opacity-50 blur-[2px]' : ''}`}>
                        {isLocked ? <Lock size={48}/> : displayedBadge.icon}
                    </div>
                </div>
                
                <h2 className={`text-3xl font-black uppercase italic tracking-tighter ${displayedBadge.cor} drop-shadow-md transition-all duration-500`}>
                    {displayedBadge.titulo}
                </h2>
                
                <div className="mt-2 min-h-[60px] flex flex-col items-center justify-center">
                    {isCurrent && (
                        <div className="w-full animate-in zoom-in duration-300">
                            <span className="text-[10px] font-bold text-white bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-widest mb-3 inline-block">Patente Atual</span>
                            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                            <p className="text-[10px] text-zinc-400 mt-2 font-mono">
                                {displayXp} / {BADGES[viewIndex + 1]?.minXp || "MAX"} XP
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

        {/* FILTROS */}
        <section className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2">
                {["Todas", "Gym", "Games", "Loja", "Eventos", "Social"].map((cat) => (
                    <button key={cat} onClick={() => setFiltro(cat as any)} className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition border ${filtro === cat ? "bg-emerald-600 border-emerald-500 text-white shadow-lg" : "bg-zinc-900 border-zinc-800 text-zinc-500"}`}>
                        {cat}
                    </button>
                ))}
            </div>
        </section>

        {/* LISTA DE CONQUISTAS */}
        <section className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
                {filteredList.map((item) => {
                    const percent = Math.min((item.progress / item.target) * 100, 100);

                    return (
                        <div key={item.id} className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 group ${item.isUnlocked ? "bg-zinc-900 border-emerald-500/30 shadow-md" : "bg-black border-zinc-800/60 opacity-60 grayscale"}`}>
                            <div className="absolute bottom-0 left-0 h-1 bg-emerald-500/20 transition-all duration-1000" style={{ width: `${percent}%` }}></div>

                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center border transition-colors ${item.isUnlocked ? "bg-emerald-500 text-black border-emerald-400" : "bg-zinc-800 text-zinc-600 border-zinc-700"}`}>
                                    <span className="text-2xl">{item.isUnlocked ? IconMap[item.iconName] : <Lock size={20}/>}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-bold truncate ${item.isUnlocked ? "text-white" : "text-zinc-400"}`}>{item.titulo}</h4>
                                        {item.isUnlocked && <CheckCircle2 size={16} className="text-emerald-500 shrink-0"/>}
                                    </div>
                                    <p className="text-[10px] text-zinc-500 leading-tight mt-0.5 font-medium">{item.desc}</p>
                                    
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="h-2 flex-1 rounded-full bg-zinc-950 overflow-hidden border border-white/5">
                                            <div className={`h-full rounded-full ${item.isUnlocked ? 'bg-emerald-500' : 'bg-zinc-700'}`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                        <span className={`text-[9px] font-black ${item.isUnlocked ? "text-emerald-400" : "text-zinc-600"}`}>
                                            {item.progress}/{item.target}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-3 right-3">
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${item.isUnlocked ? "bg-emerald-950/50 text-emerald-400 border-emerald-500/20" : "bg-zinc-900 text-zinc-600 border-zinc-800"}`}>
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