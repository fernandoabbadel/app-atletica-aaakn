"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Swords, Trophy, Sparkles, Shield, Heart, Zap, Brain, Flame, User, Palette,
  ChevronRight, Gamepad2, Edit2, Save, Search, History, LogOut, Share2, Loader2,
  XCircle, Eye, Info, ShoppingBag, Dumbbell, Crown, Calendar, Megaphone, Target
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";
import html2canvas from "html2canvas";
import SharkAvatar from "../components/SharkAvatar";
import { useAuth } from "@/context/AuthContext";

// ============================================================================
// 1. CONFIGURAÇÕES E TIPAGEM
// ============================================================================

const MAX_SERVER_STAT = 400; 

type Expression = "normal" | "angry" | "pain" | "dead" | "happy";

interface HeroStats {
  inteligencia: number; forca: number; stamina: number; hp: number; ataque: number; defesa: number;
}

interface Move {
  id: string; name: string; desc: string; type: "fisico" | "especial" | "suporte";
  power: number; accuracy: number; staminaCost: number; statScaling: keyof HeroStats; icon: string; color: string;
}

interface Combatant {
  id: number; name: string; avatarName: string; level: number; rankPosition: number; totalPower: number; profileImage: string;
  avatarType: "warrior" | "zombie" | "skeleton" | "shadow" | "boss"; customColor: string; customEyeColor: string;
  maxHp: number; currentHp: number; maxStamina: number; currentStamina: number;
  stats: { str: number; int: number; def: number; spd: number }; expression: Expression;
}

interface BattleEffect { id: string; type: "damage" | "heal" | "miss" | "critical" | "stamina"; value: string | number; x: string; y: string; }
interface BattleHistoryItem { id: number; opponentName: string; opponentColor: string; opponentProfileImage: string; opponentLevel: number; result: "victory" | "defeat"; date: string; opponentId: number; }

// --- ATUALIZADO: DESCRIÇÕES DE ONDE VEM O PODER ---
const STAT_CONFIG: Record<keyof HeroStats, { label: string; icon: any; color: string; source: string; desc: string; }> = {
  forca: { label: "Força", icon: Dumbbell, color: "text-red-500", source: "Treinos & GymRats", desc: "Aumenta Dano Bruto. Vem de suor e presença." },
  defesa: { label: "Defesa", icon: ShoppingBag, color: "text-blue-500", source: "Loja & Sócio", desc: "Reduz Dano. Vem de compras e planos." },
  inteligencia: { label: "Inteligência", icon: Brain, color: "text-purple-500", source: "Social & Ideias", desc: "Aumenta Crítico. Vem de posts e sugestões." },
  stamina: { label: "Stamina", icon: Zap, color: "text-yellow-500", source: "Login & Nível", desc: "Energia. Vem de consistência (dias seguidos)." },
  hp: { label: "Vida", icon: Heart, color: "text-pink-500", source: "Nível Geral", desc: "Resistência base. Vem de XP acumulado." },
  ataque: { label: "Ataque", icon: Swords, color: "text-orange-500", source: "Conquistas & PvP", desc: "Precisão. Vem de vitórias e troféus." },
};

const SHARK_QUOTES = ["O mar ficou vermelho! 🩸", "Aqui é Tubarão! 🦈", "Mordida fatal! 🦷", "Respeita a hierarquia! 🌊"];
const ENEMY_COLORS: Record<string, string> = { warrior: "#3b82f6", zombie: "#16a34a", skeleton: "#e4e4e7", shadow: "#7e22ce", boss: "#ef4444" };

const HERO_MOVES: Move[] = [
  { id: "m1", name: "Esmagar", desc: "Força Bruta", type: "fisico", power: 80, accuracy: 85, staminaCost: 40, statScaling: "forca", icon: "💪", color: "bg-red-600" },
  { id: "m2", name: "Tática", desc: "Ignora Defesa", type: "especial", power: 50, accuracy: 100, staminaCost: 30, statScaling: "inteligencia", icon: "🧠", color: "bg-purple-600" },
  { id: "m3", name: "Combo", desc: "Rápido", type: "fisico", power: 35, accuracy: 95, staminaCost: 15, statScaling: "ataque", icon: "⚔️", color: "bg-orange-600" },
  { id: "m4", name: "Postura", desc: "Recuperar", type: "suporte", power: 0, accuracy: 100, staminaCost: 0, statScaling: "defesa", icon: "🛡️", color: "bg-blue-600" },
];

const BATTLE_HISTORY_MOCK: BattleHistoryItem[] = [
  { id: 1, opponentName: "ShadowBlade", opponentColor: "#7e22ce", opponentProfileImage: "https://i.pravatar.cc/150?u=101", opponentLevel: 14, result: "victory", date: "Hoje", opponentId: 101 },
  { id: 2, opponentName: "BoneCrusher", opponentColor: "#e4e4e7", opponentProfileImage: "https://i.pravatar.cc/150?u=102", opponentLevel: 16, result: "defeat", date: "Hoje", opponentId: 102 },
];

const GENERATE_OPPONENTS = (userRank: number): Combatant[] => {
  const list: Combatant[] = [];
  const baseLevel = userRank; 
  for (let i = 1; i <= 5; i++) {
    const isStronger = Math.random() > 0.5;
    const level = Math.max(1, isStronger ? baseLevel + Math.floor(Math.random() * 3) : baseLevel - Math.floor(Math.random() * 3));
    const type: any = i % 3 === 0 ? "zombie" : i % 2 === 0 ? "skeleton" : "shadow";
    const statBase = 20 + (level * 4);
    list.push({
      id: i, name: `Rival #${i}`, avatarName: i < 3 ? "Veterano" : "Calouro",
      level: level, rankPosition: userRank + (isStronger ? -i : i), totalPower: level * 80,
      avatarType: type, customColor: ENEMY_COLORS[type], customEyeColor: "#000000",
      profileImage: `https://i.pravatar.cc/150?u=${i + 20}`,
      maxHp: 200 + (level * 25), currentHp: 200 + (level * 25),
      maxStamina: 100 + (level * 10), currentStamina: 100 + (level * 10),
      stats: { str: statBase, int: statBase, def: statBase, spd: 10 },
      expression: "normal",
    });
  }
  return list;
};

const RANKING_DATA = {
  global: [
    { pos: 1, aluno: "Ana Clara", handle: "ana", avatarName: "Valkyrie", turma: "T5", wins: 124, color: "#ef4444", power: 1250, level: 25, photo: "https://i.pravatar.cc/150?u=ana" },
    { pos: 2, aluno: "João Pedro", handle: "joao", avatarName: "Shadow", turma: "T7", wins: 110, color: "#3b82f6", power: 1100, level: 22, photo: "https://i.pravatar.cc/150?u=joao" },
    { pos: 3, aluno: "Lucas M.", handle: "lucas", avatarName: "Bones", turma: "T4", wins: 98, color: "#eab308", power: 980, level: 19, photo: "https://i.pravatar.cc/150?u=lucas" },
  ],
  turmas: [
    { pos: 1, nome: "Turma V", xp: 154000, logo: "/turma5.png" }, 
    { pos: 2, nome: "Turma VII", xp: 121000, logo: "/turma7.png" },
    { pos: 3, nome: "Turma IV", xp: 98000, logo: "/turma4.png" },
  ],
  minha_turma: [
    { pos: 1, aluno: "Você", handle: "me", avatarName: "Lendário", turma: "T5", wins: 45, color: "#047857", power: 660, level: 15, photo: "https://github.com/shadcn.png" },
    { pos: 2, aluno: "Mariana S.", handle: "mari", avatarName: "Zombie", turma: "T5", wins: 42, color: "#db2777", power: 640, level: 14, photo: "https://i.pravatar.cc/150?u=mari" },
    { pos: 3, aluno: "Pedro H.", handle: "pedro", avatarName: "Ghost", turma: "T5", wins: 38, color: "#7e22ce", power: 600, level: 13, photo: "https://i.pravatar.cc/150?u=pedro" },
  ],
};

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

export default function SharkLegendsPage() {
  const { addToast } = useToast();
  const { user } = useAuth();

  const [heroColor, setHeroColor] = useState("#64748b");
  const [heroEyeColor, setHeroEyeColor] = useState("#0f172a");
  const [heroName, setHeroName] = useState(user?.nome || "Lendário");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(heroName);
  
  // STATS INICIAIS (Baseado nas novas regras)
  const [heroStats] = useState<HeroStats>({
    forca: 65,        
    inteligencia: 48, 
    stamina: 150,     
    hp: 300,          
    ataque: 55,       
    defesa: 80,       
  });
  const totalPower = Object.values(heroStats).reduce((a, b) => a + b, 0);

  const [activeTab, setActiveTab] = useState<"arena" | "stats" | "ranking" | "visual">("arena");
  const [showOpponentList, setShowOpponentList] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rankingSubTab, setRankingSubTab] = useState<"global" | "turmas" | "minha_turma">("global");

  const [battleState, setBattleState] = useState<"idle" | "combat" | "victory" | "defeat">("idle");
  const [hero, setHero] = useState<Combatant | null>(null);
  const [enemy, setEnemy] = useState<Combatant | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [floatingEffects, setFloatingEffects] = useState<BattleEffect[]>([]);
  const [turn, setTurn] = useState<"player" | "enemy">("player");
  const [dailyBattles, setDailyBattles] = useState(5);
  const [isSharing, setIsSharing] = useState(false);
  const [luckCooldowns, setLuckCooldowns] = useState({ heroCrit: 0, heroMiss: 0, enemyCrit: 0, enemyMiss: 0 });

  const battleLogRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const enemyRef = useRef<HTMLDivElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (battleLogRef.current) battleLogRef.current.scrollTop = battleLogRef.current.scrollHeight; }, [battleLog]);

  const calculateRadarPolygon = () => {
    const statsKeys: (keyof HeroStats)[] = ["forca", "inteligencia", "defesa", "stamina", "hp", "ataque"];
    const points = statsKeys.map((key, i) => {
      const angle = i * 60; const rad = (angle * Math.PI) / 180;
      const value = heroStats[key]; 
      let normalizedValue = value;
      if (key === 'hp') normalizedValue = value / 3; 
      if (key === 'stamina') normalizedValue = value / 1.5;
      const normalized = Math.min(normalizedValue / MAX_SERVER_STAT, 1); 
      const radius = normalized * 40;
      const x = 50 + radius * Math.sin(rad); const y = 50 - radius * Math.cos(rad);
      return `${x},${y}`;
    });
    return points.join(" ");
  };

  const handleSaveName = () => {
    if (tempName.length < 3) { addToast("Muito curto!", "error"); return; }
    setHeroName(tempName); setIsEditingName(false); addToast("Nome atualizado!", "success");
  };

  const startBattle = (selectedOpponent: Combatant) => {
    if (dailyBattles <= 0) { addToast("Sem energia!", "error"); return; }
    setDailyBattles((prev) => prev - 1); setShowOpponentList(false);
    setLuckCooldowns({ heroCrit: 0, heroMiss: 0, enemyCrit: 0, enemyMiss: 0 });

    setHero({
      id: 0, name: "Você", avatarName: heroName, level: user?.level || 1, avatarType: "warrior",
      customColor: heroColor, customEyeColor: heroEyeColor, 
      maxHp: heroStats.hp, currentHp: heroStats.hp, maxStamina: heroStats.stamina, currentStamina: heroStats.stamina,
      profileImage: user?.foto || "https://github.com/shadcn.png",
      stats: { str: heroStats.forca, int: heroStats.inteligencia, def: heroStats.defesa, spd: 10 }, 
      expression: "normal", rankPosition: 42, totalPower: totalPower,
    });
    setEnemy(selectedOpponent); setBattleState("combat"); setBattleLog([`BATALHA: Você vs ${selectedOpponent.name}!`]); setTurn("player");
  };

  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const spawnEffect = (type: "damage" | "miss" | "critical" | "heal" | "stamina", value: string | number, target: "hero" | "enemy") => {
    const id = Math.random().toString();
    const x = target === "hero" ? "25%" : "75%"; const y = target === "hero" ? "50%" : "20%";
    setFloatingEffects((prev) => [...prev, { id, type, value, x, y }]);
    setTimeout(() => setFloatingEffects((prev) => prev.filter((e) => e.id !== id)), 2000);
  };

  const handleAttack = async (move: Move) => {
    if (turn !== "player" || !hero || !enemy) return;
    if (move.staminaCost > hero.currentStamina && move.type !== "suporte") { addToast("Sem stamina!", "error"); return; }
    setTurn("enemy");

    if (move.type === "suporte") {
        const stamRec = 30; const hpRec = Math.floor(hero.maxHp * 0.05);
        setHero(prev => prev ? { ...prev, currentStamina: Math.min(prev.maxStamina, prev.currentStamina + stamRec), currentHp: Math.min(prev.maxHp, prev.currentHp + hpRec) } : null);
        spawnEffect("heal", `+${hpRec}`, "hero"); setBattleLog((prev) => [...prev, `🛡️ Postura defensiva!`]);
        setTimeout(() => handleEnemyTurn(true), 1000); return;
    }

    setHero(prev => prev ? {...prev, currentStamina: prev.currentStamina - move.staminaCost} : null);
    if (heroRef.current) heroRef.current.classList.add("animate-lung-right");

    const canMiss = luckCooldowns.enemyMiss <= 0;
    const missChance = canMiss ? 5 + (enemy.stats.def * 0.15) : 5;
    const hitRoll = Math.random() * 100;

    if (hitRoll < missChance && move.accuracy < 100) {
        await wait(500); spawnEffect("miss", "MISS", "enemy"); setBattleLog((prev) => [...prev, `Errou o ataque!`]); setLuckCooldowns(prev => ({ ...prev, enemyMiss: 2 }));
    } else {
        let isCrit = false;
        if (luckCooldowns.heroCrit <= 0 && Math.random() * 100 < (5 + hero.stats.int * 0.25)) { isCrit = true; setLuckCooldowns(prev => ({ ...prev, heroCrit: 2 })); }
        const statValue = hero.stats[move.statScaling === 'ataque' ? 'str' : move.statScaling === 'inteligencia' ? 'int' : 'str'];
        let defenseFactor = enemy.stats.def;
        if (move.name.includes("Tática")) defenseFactor *= 0.5;

        let rawDamage = move.power + statValue;
        let damage = Math.floor( rawDamage * (100 / (100 + defenseFactor)) );
        if (isCrit) damage = Math.floor(damage * 1.5);
        damage = Math.max(10, damage);

        await wait(500);
        setEnemy((prev) => prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage), expression: "pain" } : null);
        spawnEffect(isCrit ? "critical" : "damage", damage, "enemy");
        setBattleLog((prev) => [...prev, `💥 ${move.name}: ${damage}${isCrit ? " (CRIT!)" : ""}`]);

        if (enemy.currentHp - damage <= 0) { setTimeout(() => { setEnemy((prev) => (prev ? { ...prev, expression: "dead" } : null)); setBattleState("victory"); }, 1000); return; }
    }
    setLuckCooldowns(prev => ({ heroCrit: Math.max(0, prev.heroCrit - 1), heroMiss: Math.max(0, prev.heroMiss - 1), enemyCrit: Math.max(0, prev.enemyCrit - 1), enemyMiss: Math.max(0, prev.enemyMiss - 1) }));
    setTimeout(() => { if (heroRef.current) heroRef.current.classList.remove("animate-lung-right"); setHero((prev) => (prev ? { ...prev, expression: "normal" } : null)); handleEnemyTurn(false); }, 1000);
  };

  const handleEnemyTurn = async (playerIsDefending: boolean) => {
    if (!hero || !enemy) return;
    await wait(1500);
    setEnemy(prev => prev ? {...prev, currentStamina: Math.min(prev.maxStamina, prev.currentStamina + 15)} : null);
    if (enemy.currentStamina < 20) { 
        setBattleLog((prev) => [...prev, `${enemy.name} está recuperando fôlego.`]); 
        setEnemy(prev => prev ? {...prev, currentStamina: prev.currentStamina + 40, expression: "dead"} : null); 
        spawnEffect("stamina", "+40", "enemy");
        setTimeout(() => { setEnemy(prev => prev ? {...prev, expression: "normal"} : null); setTurn("player"); }, 1500); 
        return; 
    }

    setEnemy(prev => prev ? {...prev, currentStamina: prev.currentStamina - 20, expression: "angry"} : null);
    if (enemyRef.current) enemyRef.current.classList.add("animate-lung-left");

    let rawDamage = 40 + enemy.stats.str;
    let damage = Math.floor( rawDamage * (100 / (100 + hero.stats.def)) );

    if (playerIsDefending) { damage = Math.floor(damage * 0.2); setBattleLog((prev) => [...prev, `🛡️ Defesa absorveu!`]); } 
    else {
        if (luckCooldowns.heroMiss <= 0 && Math.random() * 100 < (5 + hero.stats.def * 0.2)) {
            spawnEffect("miss", "ESQUIVA", "hero"); setBattleLog((prev) => [...prev, `Esquivou!`]); setLuckCooldowns(prev => ({...prev, heroMiss: 2}));
            setTimeout(() => { if (enemyRef.current) enemyRef.current.classList.remove("animate-lung-left"); setEnemy(prev => prev ? {...prev, expression: "normal"} : null); setTurn("player"); }, 1000); return;
        }
    }
    
    damage = Math.max(5, damage);
    spawnEffect("damage", damage, "hero"); setBattleLog((prev) => [...prev, `💀 ${enemy.name} atacou: -${damage} HP`]);
    setHero((prev) => prev ? { ...prev, currentHp: Math.max(0, prev.currentHp - damage), expression: "pain" } : null);

    if (hero.currentHp - damage <= 0) { setTimeout(() => { setHero((prev) => (prev ? { ...prev, expression: "dead" } : null)); setBattleState("defeat"); }, 1000); return; }
    setTimeout(() => { if (enemyRef.current) enemyRef.current.classList.remove("animate-lung-left"); setHero((prev) => (prev ? { ...prev, expression: "normal" } : null)); setEnemy((prev) => (prev ? { ...prev, expression: "normal" } : null)); setTurn("player"); }, 1000);
  };

  const handleShare = async () => { if (!resultCardRef.current) return; setIsSharing(true); try { const canvas = await html2canvas(resultCardRef.current, { useCORS: true, backgroundColor: null, scale: 2, ignoreElements: (element) => element.hasAttribute("data-html2canvas-ignore"), }); canvas.toBlob(async (blob) => { if (!blob) throw new Error("Erro"); const file = new File([blob], "shark-legends-result.png", { type: "image/png" }); if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ title: "Batalha Shark Legends", text: "Vem pro Shark!", files: [file], url: window.location.href }); addToast("Compartilhado!", "success"); } else { const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = "shark-legends-result.png"; link.click(); addToast("Baixado!", "success"); } }, "image/png"); } catch (e) { addToast("Erro", "error"); } finally { setIsSharing(false); } };

  return (
    <div className="min-h-screen bg-black text-white font-mono pb-24 selection:bg-emerald-500">
      <header className="p-4 bg-zinc-900 border-b border-zinc-800 sticky top-0 z-30 flex justify-between items-center shadow-lg">
        <Link href="/menu" className="bg-black p-2 rounded-full border border-zinc-700"><ArrowLeft size={20} /></Link>
        <h1 className="text-emerald-500 font-black uppercase tracking-widest text-lg flex items-center gap-2"><Gamepad2 size={24} /> Shark Legends</h1>
        <div className="bg-black px-3 py-1 rounded-full border border-emerald-900 text-xs font-bold text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">{dailyBattles}/5 Lutas</div>
      </header>

      {battleState === "idle" && !showOpponentList && (
        <div className="flex border-b border-zinc-800 bg-black sticky top-[68px] z-20 overflow-x-auto shadow-md">
          {[{ id: "arena", icon: <Swords size={16} />, label: "Arena" }, { id: "visual", icon: <Palette size={16} />, label: "Visual" }, { id: "stats", icon: <Sparkles size={16} />, label: "Stats" }, { id: "ranking", icon: <Trophy size={16} />, label: "Ranking" }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 min-w-[80px] py-4 flex flex-col items-center gap-1 text-[10px] font-bold uppercase transition ${activeTab === tab.id ? "text-emerald-400 border-b-2 border-emerald-400 bg-zinc-900" : "text-zinc-500"}`}>{tab.icon} {tab.label}</button>
          ))}
        </div>
      )}

      <main className="p-4">
        {/* === ARENA (LOBBY) === */}
        {activeTab === "arena" && !showOpponentList && battleState === "idle" && (
            <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-300">
              <div className="relative group text-center mt-6">
                <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition"></div>
                <div className="relative z-10 mb-6 mx-auto w-fit transform hover:scale-105 transition-transform duration-300"><SharkAvatar name={heroName} size="xl" level={user?.level || 1} customColor={heroColor} customEyeColor={heroEyeColor} /></div>
                <h2 className="text-2xl font-black text-white uppercase italic mt-4 drop-shadow-lg">{heroName}</h2>
                <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Nível {user?.level || 1} • Poder: {totalPower}</p>
              </div>
              <button onClick={() => setShowOpponentList(true)} disabled={dailyBattles <= 0} className="w-full max-w-xs bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black uppercase py-5 rounded-2xl text-xl shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 border-b-4 border-red-800 active:border-b-0 active:translate-y-1"><Swords size={24} className="animate-pulse" /> {dailyBattles > 0 ? "Batalhar" : "Sem Energia"}</button>
              <div className="w-full max-w-sm mt-4"><h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><History size={14} /> Últimas Batalhas</h3><div className="space-y-3">{BATTLE_HISTORY_MOCK.map((fight) => (<div key={fight.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center justify-between shadow-sm"><div className="flex items-center gap-4"><div className="relative flex -space-x-3"><Link href={`/perfil/${fight.opponentId}`} className="w-10 h-10 rounded-full border-2 border-zinc-800 overflow-hidden relative z-10 hover:scale-110 transition hover:z-20"><img src={fight.opponentProfileImage} className="w-full h-full object-cover" /></Link><div className="w-10 h-10 rounded-full border-2 border-zinc-800 bg-zinc-950 flex items-center justify-center relative z-0 overflow-hidden"><div className="scale-50 mt-1"><SharkAvatar size="sm" customColor={fight.opponentColor} level={fight.opponentLevel}/></div></div></div><div><Link href={`/perfil/${fight.opponentId}`} className="text-xs font-bold text-white hover:text-emerald-400 hover:underline">{fight.opponentName}</Link><p className="text-[10px] text-zinc-500">Nível {fight.opponentLevel} • {fight.date}</p></div></div><div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${fight.result === "victory" ? "bg-emerald-500 text-black" : "bg-red-600 text-white"}`}>{fight.result === "victory" ? "Vitória" : "Derrota"}</div></div>))}</div></div>
            </div>
        )}

        {/* === MATCHMAKING === */}
        {showOpponentList && (
          <div className="animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-2 mb-4"><button onClick={() => setShowOpponentList(false)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-white"><ArrowLeft size={16} /></button><h2 className="font-bold text-lg text-white">Escolha seu Oponente</h2></div>
            <div className="space-y-3 pb-4">
              {GENERATE_OPPONENTS(42).map((opp) => (
                <div key={opp.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between hover:border-emerald-500/50 transition cursor-pointer" onClick={() => startBattle(opp)}>
                  <div className="flex items-center gap-4">
                    <div className="relative"><div className="absolute -top-2 -left-2 bg-zinc-800 text-[9px] px-1.5 rounded font-bold border border-zinc-700 text-white z-20">#{opp.rankPosition}</div><div className="flex -space-x-2"><div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-900 overflow-hidden z-10"><img src={opp.profileImage} className="w-full h-full object-cover" /></div><div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-zinc-900 overflow-hidden flex items-center justify-center relative"><div className="scale-75 mt-2"><SharkAvatar size="sm" customColor={opp.customColor} level={opp.level} /></div></div></div></div>
                    <div><h3 className="font-bold text-white text-sm">{opp.name}</h3><div className="flex items-center gap-3 text-[10px] text-zinc-400"><span className="flex items-center gap-1 text-yellow-500 font-bold"><Zap size={10} /> {opp.totalPower}</span><span>Lv.{opp.level}</span></div></div>
                  </div>
                  <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-emerald-500 shadow-lg">Lutar</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === TELA DE BATALHA === */}
        {battleState !== "idle" && (
          <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            <div className="flex-1 relative bg-cover bg-center overflow-hidden animate-battle-bg" style={{ backgroundImage: `url('/battle-forest.png')` }}>
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
              {floatingEffects.map((effect) => (<div key={effect.id} className={`absolute z-50 font-black animate-float-up pointer-events-none text-shadow-lg ${effect.type === "damage" ? "text-red-500 text-3xl" : effect.type === "stamina" ? "text-yellow-400 text-xl" : effect.type === "heal" ? "text-emerald-400 text-2xl" : "text-zinc-300 text-xl"}`} style={{ left: effect.x, top: effect.y }}>{effect.type === "critical" ? "CRIT!" : ""} {effect.value}</div>))}
              {enemy && (
                <div className="absolute top-[12%] right-[10%] flex flex-col items-center w-32 animate-in slide-in-from-right duration-500 z-30 gap-2">
                  <div className="bg-black/80 backdrop-blur-md p-2 rounded-lg border border-red-900/50 w-full shadow-lg mb-2"><div className="flex justify-between w-full mb-1"><span className="font-bold text-white text-xs drop-shadow-md">{enemy.name}</span><span className="text-[10px] text-red-400 font-bold">Lv.{enemy.level}</span></div><div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-600 relative"><div className="h-full bg-red-500 transition-all duration-300" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}></div></div><div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden mt-1"><div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${(enemy.currentStamina / enemy.maxStamina) * 100}%` }}></div></div></div>
                  <div ref={enemyRef} className="transform scale-100 transition-transform duration-300 relative z-10"><SharkAvatar size="lg" customColor={enemy.customColor} level={enemy.level} /></div>
                </div>
              )}
              {hero && (
                <div className="absolute bottom-[8%] left-[10%] w-32 animate-in slide-in-from-left duration-500 z-30 flex flex-col items-center gap-4">
                  <div ref={heroRef} className="transform scale-125 transition-transform duration-300 relative z-10 order-2"><SharkAvatar size="lg" customColor={hero.customColor} customEyeColor={hero.customEyeColor} level={hero.level} /></div>
                  <div className="bg-black/80 backdrop-blur-md p-3 rounded-xl border border-emerald-900 shadow-xl w-full order-1"><div className="flex justify-between w-full mb-1"><span className="font-bold text-white text-sm">{hero.avatarName}</span><span className="text-[10px] text-emerald-400 font-bold">Lv.{hero.level}</span></div><div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-600 mb-1 relative"><div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(hero.currentHp / hero.maxHp) * 100}%` }}></div></div><div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700 relative"><div className="h-full bg-yellow-500 transition-all duration-300" style={{ width: `${(hero.currentStamina / hero.maxStamina) * 100}%` }}></div></div><div className="flex justify-between mt-1"><span className="text-[8px] text-emerald-400 font-bold">{hero.currentHp} HP</span><span className="text-[8px] text-yellow-500 font-bold">{hero.currentStamina} STA</span></div></div>
                </div>
              )}
            </div>
            <div className="bg-zinc-950 border-t-4 border-zinc-800 p-4 pb-8 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.8)] relative z-50">
              <button onClick={() => { setBattleState("idle"); setShowOpponentList(false); }} className="absolute -top-10 right-4 bg-zinc-800 text-zinc-300 text-xs font-bold px-3 py-1.5 rounded-full border border-zinc-600 hover:bg-red-900 hover:text-white transition flex items-center gap-1"><LogOut size={12} /> Fugir</button>
              <div ref={battleLogRef} className="h-16 overflow-y-auto mb-4 font-mono text-xs text-emerald-400 space-y-1 bg-black/50 p-2 rounded border border-zinc-800/50">{battleLog.map((log, i) => <div key={i}>{">"} {log}</div>)}</div>
              {battleState === "combat" && (
                <div className="grid grid-cols-2 gap-3 relative">
                  {turn !== "player" && <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center rounded-xl backdrop-blur-[1px]"><span className="text-white font-black uppercase text-sm animate-pulse">Vez do Oponente...</span></div>}
                  {HERO_MOVES.map((move) => (
                    <button key={move.id} onClick={() => handleAttack(move)} disabled={turn !== "player" || (!!hero && hero.currentStamina < move.staminaCost && move.type !== 'suporte')} className={`${move.color} text-white p-3 rounded-xl border-b-4 border-black/30 active:border-b-0 active:translate-y-1 transition flex flex-col justify-center relative overflow-hidden group shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}>
                      <div className="flex justify-between items-center w-full relative z-10"><span className="font-black uppercase text-sm">{move.name}</span><span className="text-xl">{move.icon}</span></div>
                      <span className="text-[9px] opacity-80 relative z-10 self-start mt-1 bg-black/20 px-1.5 py-0.5 rounded font-bold flex items-center gap-1"><Zap size={8} className="text-yellow-400"/> {move.staminaCost}</span>
                    </button>
                  ))}
                </div>
              )}
              {(battleState === "victory" || battleState === "defeat") && (<button onClick={() => { setBattleState("idle"); setShowOpponentList(false); }} className={`w-full py-4 ${battleState === "victory" ? "bg-emerald-600" : "bg-red-600"} text-white font-black uppercase text-xl rounded-xl border-b-8 border-black/30 animate-pulse flex items-center justify-center gap-3`}>{battleState === "victory" ? <><Trophy /> VITÓRIA! (Continuar)</> : <><XCircle /> DERROTA... (Voltar)</>}</button>)}
            </div>
            {(battleState === "victory" || battleState === "defeat") && (
              <div className="absolute inset-0 z-[10000] bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in duration-300 overflow-y-auto">
                <div ref={resultCardRef} className="w-full max-w-sm bg-gradient-to-b from-zinc-900 to-black rounded-[2rem] border-2 border-zinc-800 overflow-hidden shadow-2xl relative">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10"><img src="/logo.png" className="w-2/3 h-2/3 object-contain grayscale" /></div>
                  {battleState === "victory" && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/confetti.png')] opacity-20 animate-pulse"></div>}
                  <div className="p-6 text-center space-y-6 relative z-10">
                    <h2 className={`text-4xl font-black uppercase italic tracking-tighter ${battleState === "victory" ? "text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "text-red-500"}`}>{battleState === "victory" ? "VENCEDOR!" : "DERROTA..."}</h2>
                    <div className="flex justify-center items-center gap-2">
                        <div className="flex flex-col items-center relative"><div className={`w-24 h-24 rounded-full border-4 overflow-hidden shadow-2xl ${battleState === "victory" ? "border-emerald-500" : "border-zinc-700 grayscale"}`}><img src={hero?.profileImage} className="w-full h-full object-cover" /></div><div className="absolute -bottom-2 -right-2 w-14 h-14 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center overflow-hidden"><div className="scale-50 mt-2"><SharkAvatar size="sm" customColor={hero?.customColor} level={hero?.level} /></div></div><span className="font-bold text-white text-sm mt-3">{hero?.name}</span><span className="text-[10px] font-mono text-emerald-400 font-bold">HP: {hero?.currentHp}</span></div>
                        <div className="text-xl font-black text-zinc-600 italic px-2">VS</div>
                        <div className="flex flex-col items-center relative"><div className={`w-24 h-24 rounded-full border-4 overflow-hidden shadow-2xl ${battleState === "defeat" ? "border-red-500" : "border-zinc-700 grayscale"}`}><img src={enemy?.profileImage} className="w-full h-full object-cover" /></div><div className="absolute -bottom-2 -right-2 w-14 h-14 bg-zinc-900 rounded-full border-2 border-zinc-700 flex items-center justify-center overflow-hidden"><div className="scale-50 mt-2"><SharkAvatar size="sm" customColor={enemy?.customColor} level={enemy?.level} /></div></div><span className="font-bold text-white text-sm mt-3">{enemy?.name}</span><span className="text-[10px] font-mono text-red-400 font-bold">HP: {enemy?.currentHp}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3" data-html2canvas-ignore><button onClick={() => { setBattleState("idle"); setShowOpponentList(false); }} className="py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold uppercase text-xs hover:bg-zinc-800">Voltar</button><button onClick={handleShare} className="py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase text-xs hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-lg">{isSharing ? <Loader2 className="animate-spin" size={14} /> : <><Share2 size={14} /> Compartilhar</>}</button></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === CUSTOMIZAÇÃO VISUAL === */}
        {activeTab === "visual" && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 flex flex-col justify-center items-center bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] relative overflow-hidden h-72">
              <div className="transform scale-[1.5] translate-y-4 relative z-10"><SharkAvatar name={heroName} size="xl" customColor={heroColor} customEyeColor={heroEyeColor} level={user?.level || 1} /></div>
            </div>
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-center justify-between"><div className="flex items-center gap-3"><div className="bg-black p-2 rounded-lg border border-zinc-700"><User size={16} className="text-emerald-500" /></div>{isEditingName ? (<input type="text" className="bg-zinc-800 border border-emerald-500 rounded px-2 py-1 text-sm text-white focus:outline-none w-32 font-bold" value={tempName} onChange={(e) => setTempName(e.target.value)} autoFocus />) : (<div><p className="text-xs text-zinc-500 uppercase font-bold">Nome de Guerra</p><p className="text-white font-bold">{heroName}</p></div>)}</div><button onClick={isEditingName ? handleSaveName : () => setIsEditingName(true)} className="p-2 bg-emerald-600 rounded-lg text-white hover:bg-emerald-500">{isEditingName ? <Save size={16} /> : <Edit2 size={16} />}</button></div>
            <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
              <div><h3 className="font-bold text-white flex items-center gap-2 text-lg mb-3"><Palette size={20} className="text-emerald-500" /> Cor do Tubarão</h3><div className="flex gap-3 overflow-x-auto p-4 scrollbar-hide flex-wrap justify-center -mx-4">{["#64748b", "#ef4444", "#f97316", "#eab308", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef", "#f43f5e", "#18181b"].map((color) => (<button key={color} onClick={() => setHeroColor(color)} className={`w-12 h-12 rounded-full border-4 shrink-0 transition transform hover:scale-110 shadow-sm ${heroColor === color ? "border-white scale-110 shadow-lg ring-2 ring-emerald-500" : "border-zinc-800"}`} style={{ backgroundColor: color }} />))}</div></div>
              <div><h3 className="font-bold text-white flex items-center gap-2 text-lg mb-3"><Eye size={20} className="text-blue-400" /> Cor dos Olhos</h3><div className="flex gap-3 overflow-x-auto p-4 scrollbar-hide flex-wrap justify-center -mx-4">{["#0f172a", "#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#ffffff", "#000000"].map((color) => (<button key={color} onClick={() => setHeroEyeColor(color)} className={`w-10 h-10 rounded-full border-4 shrink-0 transition transform hover:scale-110 shadow-sm flex items-center justify-center ${heroEyeColor === color ? "border-white scale-110 shadow-lg ring-2 ring-blue-500" : "border-zinc-800"}`} style={{ backgroundColor: color }}><div className="w-2 h-2 bg-white rounded-full opacity-50"></div></button>))}</div></div>
            </div>
          </div>
        )}

        {/* --- STATS --- */}
        {activeTab === "stats" && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
            <div className="flex justify-end"><button onClick={() => setShowRules(true)} className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full hover:bg-zinc-800 hover:text-white transition"><Info size={14} className="text-emerald-500" /> Como Funciona?</button></div>
            <div className="bg-black border border-emerald-500/50 p-8 rounded-[2rem] text-center shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden"><div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div><p className="text-emerald-500 font-black uppercase tracking-[0.2em] text-xs mb-2 relative z-10">Poder Total</p><h2 className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10 tracking-tighter">{totalPower}</h2></div>
            <div className="flex justify-center py-8 relative"><div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full"></div><div className="relative w-80 h-80"><svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-2xl"><circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="0.5" strokeDasharray="2,2"/><polygon points={calculateRadarPolygon()} fill="rgba(16, 185, 129, 0.2)" stroke="#10b981" strokeWidth="2.5" strokeLinejoin="round" className="animate-pulse-slow"/><text x="50" y="8" textAnchor="middle" fill="#ef4444" fontSize="5" fontWeight="900">FOR</text><text x="98" y="30" textAnchor="middle" fill="#a855f7" fontSize="5" fontWeight="900">INT</text><text x="98" y="75" textAnchor="middle" fill="#3b82f6" fontSize="5" fontWeight="900">DEF</text><text x="50" y="98" textAnchor="middle" fill="#eab308" fontSize="5" fontWeight="900">STA</text><text x="2" y="75" textAnchor="middle" fill="#ec4899" fontSize="5" fontWeight="900">HP</text><text x="2" y="30" textAnchor="middle" fill="#f97316" fontSize="5" fontWeight="900">ATK</text></svg></div></div>
            <div className="grid grid-cols-1 gap-4">{Object.entries(heroStats).map(([key, value]) => { const conf = STAT_CONFIG[key as keyof HeroStats]; return (<div key={key} className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden group hover:border-zinc-600 transition shadow-lg"><div className="flex items-start gap-4 relative z-10"><div className={`p-3 rounded-xl bg-black border border-zinc-800 shadow-md ${conf.color}`}><conf.icon size={24} /></div><div className="flex-1"><div className="flex justify-between items-center mb-1"><h3 className="font-black text-white text-lg uppercase">{conf.label}</h3><div className="text-right"><span className={`text-2xl font-black ${conf.color} drop-shadow-md`}>{value}</span><span className="text-[10px] text-zinc-600 font-bold block">/{MAX_SERVER_STAT}</span></div></div><p className="text-[10px] text-zinc-400 font-medium mb-2">{conf.desc}</p><div className="inline-flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded text-[9px] text-zinc-500 uppercase border border-zinc-800"><Search size={10} /> Origem: <span className="text-white font-bold">{conf.source}</span></div></div></div></div>); })}</div>
          </div>
        )}

        {/* --- RANKING --- */}
        {activeTab === "ranking" && (
          <div className="space-y-4 animate-in slide-in-from-right-8 duration-300">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800"><button onClick={() => setRankingSubTab("global")} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition ${rankingSubTab === "global" ? "bg-zinc-800 text-white shadow" : "text-zinc-500"}`}>Global</button><button onClick={() => setRankingSubTab("turmas")} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition ${rankingSubTab === "turmas" ? "bg-zinc-800 text-white shadow" : "text-zinc-500"}`}>Turmas</button><button onClick={() => setRankingSubTab("minha_turma")} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded-lg transition ${rankingSubTab === "minha_turma" ? "bg-zinc-800 text-white shadow" : "text-zinc-500"}`}>Minha Sala</button></div>
            <div className="bg-zinc-900 rounded-2xl p-2 border border-zinc-800">
              {rankingSubTab === "turmas" && RANKING_DATA.turmas.map((t) => (
                  <div key={t.pos} className="flex items-center gap-4 p-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-950 rounded-xl transition">
                    <span className="font-black text-zinc-600 w-6 text-lg">#{t.pos}</span>
                    <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-700 overflow-hidden shadow-lg"><img src={t.logo} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /></div>
                    <div className="flex-1"><span className="font-bold text-white text-base block">{t.nome}</span><div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden"><div className="h-full bg-emerald-600" style={{ width: `${(t.xp / 200000) * 100}%` }}></div></div></div>
                    <span className="text-xs font-mono text-zinc-400 font-bold">{t.xp / 1000}k XP</span>
                  </div>
              ))}
              {(rankingSubTab === "global" || rankingSubTab === "minha_turma") && (rankingSubTab === "global" ? RANKING_DATA.global : RANKING_DATA.minha_turma).map((u) => (
                  <Link href={`/perfil/${u.handle}`} key={u.pos} className="flex items-center gap-3 p-3 hover:bg-zinc-950 rounded-xl transition group border-b border-zinc-800/50 last:border-0">
                    <span className={`font-black w-6 text-center text-lg ${u.pos === 1 ? "text-yellow-500" : u.pos === 2 ? "text-zinc-400" : u.pos === 3 ? "text-orange-700" : "text-zinc-600"}`}>#{u.pos}</span>
                    <div className="relative"><div className="w-12 h-12 rounded-full border-2 border-zinc-700 overflow-hidden"><img src={u.photo} className="w-full h-full object-cover" /></div><div className="absolute -bottom-1 -right-1 w-6 h-6 bg-zinc-900 rounded-full border border-zinc-600 flex items-center justify-center overflow-hidden"><div className="scale-[0.35] mt-1"><SharkAvatar size="sm" customColor={u.color} /></div></div></div>
                    <div className="flex-1"><p className="text-sm font-bold text-white group-hover:text-emerald-400 transition">{u.aluno}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] bg-zinc-800 px-1.5 rounded text-zinc-400 font-bold flex items-center gap-1"><Zap size={8} className="text-yellow-500"/> {u.power}</span><span className="text-[10px] bg-zinc-800 px-1.5 rounded text-zinc-400 font-bold">LVL {u.level}</span></div></div>
                    <div className="text-right"><span className="block font-black text-emerald-500 text-lg">{u.wins}</span><span className="text-[8px] text-zinc-600 uppercase font-bold">Vitórias</span></div>
                    <ChevronRight size={16} className="text-zinc-700" />
                  </Link>
              ))}
            </div>
          </div>
        )}

        {/* --- MODAL REGRAS (SUPER ATUALIZADO) --- */}
        {showRules && (
            <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-6 animate-in zoom-in">
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full relative max-h-[85vh] overflow-y-auto">
                    <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 bg-zinc-800 p-1 rounded-full"><XCircle size={20} className="text-zinc-400" /></button>
                    <h3 className="font-black text-xl text-white mb-6 uppercase flex items-center gap-2 border-b border-zinc-800 pb-4"><Info className="text-emerald-500"/> Manual do Tubarão</h3>
                    
                    <div className="space-y-6">
                        
                        {/* SEÇÃO 1: OS 4 PILARES */}
                        <div>
                            <h4 className="text-emerald-400 font-black uppercase text-sm mb-3 flex items-center gap-2"><Crown size={16}/> Os 4 Pilares de Poder</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                                    <div className="text-red-400 font-bold text-xs flex items-center gap-1 mb-1"><Dumbbell size={10}/> FORÇA</div>
                                    <p className="text-[10px] text-zinc-400 leading-tight">Vem de treinos e GymRats. Aumenta dano bruto.</p>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                                    <div className="text-blue-400 font-bold text-xs flex items-center gap-1 mb-1"><ShoppingBag size={10}/> DEFESA</div>
                                    <p className="text-[10px] text-zinc-400 leading-tight">Vem da Loja e Sócio. Reduz dano recebido.</p>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                                    <div className="text-purple-400 font-bold text-xs flex items-center gap-1 mb-1"><Brain size={10}/> INTELIGÊNCIA</div>
                                    <p className="text-[10px] text-zinc-400 leading-tight">Vem do Social. Aumenta chance de Crítico.</p>
                                </div>
                                <div className="bg-black/40 p-2 rounded border border-zinc-800">
                                    <div className="text-orange-400 font-bold text-xs flex items-center gap-1 mb-1"><Swords size={10}/> ATAQUE</div>
                                    <p className="text-[10px] text-zinc-400 leading-tight">Vem do PvP. Aumenta precisão.</p>
                                </div>
                            </div>
                        </div>

                        {/* SEÇÃO 2: COMO GANHAR XP */}
                        <div>
                            <h4 className="text-yellow-400 font-black uppercase text-sm mb-3 flex items-center gap-2"><Zap size={16}/> Fontes de XP & Atributos</h4>
                            <div className="space-y-2 text-xs text-zinc-300">
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>🏋️ Check-in Treino</span> <span className="text-emerald-500 font-bold">+30 XP | +Força</span></div>
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>🛍️ Compras na Loja</span> <span className="text-emerald-500 font-bold">+50 XP/R$10 | +Defesa</span></div>
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>💳 Plano Sócio</span> <span className="text-emerald-500 font-bold">Até +500 XP | +Defesa</span></div>
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>🎫 Ir em Eventos</span> <span className="text-emerald-500 font-bold">+100 XP | +Inteligência</span></div>
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>🏆 GymRats Top 10</span> <span className="text-emerald-500 font-bold">+500 XP | +Força</span></div>
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>💡 Sugestão Aprovada</span> <span className="text-emerald-500 font-bold">+200 XP | +Inteligência</span></div>
                                <div className="flex justify-between border-b border-zinc-800 pb-1"><span>📅 Login 7 Dias</span> <span className="text-emerald-500 font-bold">+50 XP | +Stamina</span></div>
                                <div className="flex justify-between"><span>⚔️ Vitória Arena</span> <span className="text-emerald-500 font-bold">+20 XP | +Ataque</span></div>
                            </div>
                        </div>

                    </div>
                    <button onClick={() => setShowRules(false)} className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl uppercase tracking-widest shadow-lg hover:bg-emerald-500 transition">Entendi, sou um Tubarão!</button>
                </div>
            </div>
        )}
      </main>

      <style jsx global>{`
        .animate-float-up { animation: floatUp 2s ease-out forwards; }
        @keyframes floatUp { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(-40px) scale(1.5); opacity: 0; } }
        .animate-lung-right { animation: lungRight 0.3s ease-out; }
        @keyframes lungRight { 0% { transform: translateX(0); } 50% { transform: translateX(40px); } 100% { transform: translateX(0); } }
        .animate-lung-left { animation: lungLeft 0.3s ease-out; }
        @keyframes lungLeft { 0% { transform: translateX(0); } 50% { transform: translateX(-40px); } 100% { transform: translateX(0); } }
        @keyframes battlePan { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-battle-bg { animation: battlePan 20s ease infinite; background-size: 120% 120%; }
      `}</style>
    </div>
  );
}