"use client";
import type React from "react";
import { useState } from "react";
import {
  ArrowLeft,
  Swords,
  Trophy,
  Star,
  Users,
  Sparkles,
  Shield,
  Heart,
  Zap,
  Brain,
  Flame,
  Crown,
  Share2,
  Dices,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface HeroStats {
  inteligencia: number;
  forca: number;
  stamina: number;
  hp: number;
  ataque: number;
  defesa: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  icon: string;
  completed: boolean;
  progress: number;
  total: number;
}

interface Opponent {
  id: number;
  name: string;
  turma: string;
  level: number;
  avatar: string;
  stats: HeroStats;
}

interface RankingEntry {
  position: number;
  name: string;
  turma: string;
  level: number;
  wins: number;
  avatar: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL - SHARK LEGENDS
// ============================================================================

export default function SharkLegends() {
  // Estados do Herói
  const [hero, setHero] = useState({
    name: "Tubarão K.N.",
    turma: "T5",
    level: 12,
    xp: 2450,
    xpToNext: 3000,
    pointsToDistribute: 3,
    totalWins: 47,
    totalLosses: 18,
    stats: {
      inteligencia: 18,
      forca: 24,
      stamina: 20,
      hp: 180,
      ataque: 22,
      defesa: 16,
    } as HeroStats,
  });

  // Estados de Batalha
  const [dailyBattles, setDailyBattles] = useState(5);
  const [selectedTab, setSelectedTab] = useState<
    "battle" | "stats" | "ranking"
  >("battle");
  const [battleState, setBattleState] = useState<
    "idle" | "selecting" | "rolling" | "result"
  >("idle");
  const [selectedAttribute, setSelectedAttribute] = useState<
    keyof HeroStats | null
  >(null);
  const [opponent, setOpponent] = useState<Opponent | null>(null);
  const [battleResult, setBattleResult] = useState<{
    winner: "hero" | "opponent";
    attribute: keyof HeroStats;
    heroValue: number;
    opponentValue: number;
    xpGained: number;
  } | null>(null);
  const [diceRolling, setDiceRolling] = useState(false);
  const [chosenByDice, setChosenByDice] = useState<"hero" | "opponent" | null>(
    null
  );

  // Conquistas do usuário (simulação)
  const [achievements] = useState<Achievement[]>([
    {
      id: "eventos",
      name: "Presença VIP",
      description: "Participar de eventos",
      xpReward: 50,
      icon: "🎉",
      completed: true,
      progress: 8,
      total: 10,
    },
    {
      id: "compras",
      name: "Colecionador",
      description: "Comprar itens na loja",
      xpReward: 30,
      icon: "🛒",
      completed: true,
      progress: 15,
      total: 20,
    },
    {
      id: "gymrats",
      name: "Atleta de Elite",
      description: "Pontos no GymRats",
      xpReward: 100,
      icon: "💪",
      completed: false,
      progress: 750,
      total: 1000,
    },
    {
      id: "quiz",
      name: "Cérebro Afiado",
      description: "Acertar no Quiz",
      xpReward: 40,
      icon: "🧠",
      completed: false,
      progress: 0,
      total: 50,
    },
    {
      id: "acessos",
      name: "Frequentador",
      description: "Acessar o app diariamente",
      xpReward: 20,
      icon: "📱",
      completed: true,
      progress: 30,
      total: 30,
    },
    {
      id: "vitorias",
      name: "Gladiador",
      description: "Vencer batalhas",
      xpReward: 80,
      icon: "⚔️",
      completed: false,
      progress: 47,
      total: 100,
    },
  ]);

  // Lista de oponentes disponíveis
  const opponents: Opponent[] = [
    {
      id: 1,
      name: "Medusa_T3",
      turma: "T3",
      level: 10,
      avatar: "zombie",
      stats: {
        inteligencia: 16,
        forca: 20,
        stamina: 18,
        hp: 160,
        ataque: 19,
        defesa: 14,
      },
    },
    {
      id: 2,
      name: "DrBones_T8",
      turma: "T8",
      level: 14,
      avatar: "skeleton",
      stats: {
        inteligencia: 22,
        forca: 18,
        stamina: 16,
        hp: 140,
        ataque: 17,
        defesa: 20,
      },
    },
    {
      id: 3,
      name: "Viking_T1",
      turma: "T1",
      level: 11,
      avatar: "warrior",
      stats: {
        inteligencia: 14,
        forca: 26,
        stamina: 22,
        hp: 200,
        ataque: 24,
        defesa: 12,
      },
    },
    {
      id: 4,
      name: "Shadow_T5",
      turma: "T5",
      level: 13,
      avatar: "shadow",
      stats: {
        inteligencia: 20,
        forca: 22,
        stamina: 19,
        hp: 170,
        ataque: 21,
        defesa: 18,
      },
    },
  ];

  // Ranking individual
  const [ranking] = useState<RankingEntry[]>([
    {
      position: 1,
      name: "Titan_T2",
      turma: "T2",
      level: 25,
      wins: 124,
      avatar: "warrior",
    },
    {
      position: 2,
      name: "Phoenix_T4",
      turma: "T4",
      level: 23,
      wins: 112,
      avatar: "shadow",
    },
    {
      position: 3,
      name: "Storm_T1",
      turma: "T1",
      level: 22,
      wins: 98,
      avatar: "zombie",
    },
    {
      position: 4,
      name: "Tubarão K.N.",
      turma: "T5",
      level: 12,
      wins: 47,
      avatar: "warrior",
    },
    {
      position: 5,
      name: "Thunder_T3",
      turma: "T3",
      level: 11,
      wins: 42,
      avatar: "skeleton",
    },
  ]);

  // Ranking por turmas
  const [turmaRanking] = useState([
    { position: 1, turma: "T2", totalWins: 856, members: 45, avgLevel: 18 },
    { position: 2, turma: "T4", totalWins: 742, members: 42, avgLevel: 16 },
    { position: 3, turma: "T5", totalWins: 698, members: 48, avgLevel: 15 },
    { position: 4, turma: "T1", totalWins: 654, members: 40, avgLevel: 14 },
    { position: 5, turma: "T3", totalWins: 589, members: 38, avgLevel: 13 },
  ]);

  // Iniciar batalha - escolher oponente aleatório
  const startBattle = () => {
    if (dailyBattles <= 0) return;
    const randomOpponent =
      opponents[Math.floor(Math.random() * opponents.length)];
    setOpponent(randomOpponent);
    setBattleState("selecting");
    setBattleResult(null);
    setSelectedAttribute(null);
    setChosenByDice(null);
  };

  // Selecionar atributo para batalha
  const selectAttribute = (attr: keyof HeroStats) => {
    setSelectedAttribute(attr);
  };

  // Confirmar batalha e rolar dado
  const confirmBattle = () => {
    if (!selectedAttribute || !opponent) return;

    setBattleState("rolling");
    setDiceRolling(true);

    // Simular rolagem do dado
    setTimeout(() => {
      // Dado decide qual atributo será usado (50/50 entre herói e oponente)
      const useHeroAttribute = Math.random() > 0.5;
      setChosenByDice(useHeroAttribute ? "hero" : "opponent");

      // Se o dado escolher oponente, usar atributo aleatório do oponente
      const finalAttribute = useHeroAttribute
        ? selectedAttribute
        : (Object.keys(opponent.stats) as (keyof HeroStats)[])[
            Math.floor(Math.random() * 6)
          ];

      const heroValue = hero.stats[finalAttribute];
      const opponentValue = opponent.stats[finalAttribute];

      const winner = heroValue >= opponentValue ? "hero" : "opponent";
      const xpGained = winner === "hero" ? 80 + opponent.level * 5 : 10;

      setDiceRolling(false);
      setBattleState("result");
      setBattleResult({
        winner,
        attribute: finalAttribute,
        heroValue,
        opponentValue,
        xpGained,
      });

      // Atualizar stats
      setDailyBattles((prev) => prev - 1);
      if (winner === "hero") {
        setHero((prev) => ({
          ...prev,
          xp: prev.xp + xpGained,
          totalWins: prev.totalWins + 1,
        }));
      } else {
        setHero((prev) => ({
          ...prev,
          xp: prev.xp + xpGained,
          totalLosses: prev.totalLosses + 1,
        }));
      }
    }, 2000);
  };

  // Distribuir ponto de atributo
  const distributePoint = (stat: keyof HeroStats) => {
    if (hero.pointsToDistribute <= 0) return;
    setHero((prev) => ({
      ...prev,
      pointsToDistribute: prev.pointsToDistribute - 1,
      stats: {
        ...prev.stats,
        [stat]: prev.stats[stat] + (stat === "hp" ? 10 : 1),
      },
    }));
  };

  // Resetar batalha
  const resetBattle = () => {
    setBattleState("idle");
    setOpponent(null);
    setBattleResult(null);
    setSelectedAttribute(null);
    setChosenByDice(null);
  };

  // Compartilhar vitória
  const shareVictory = () => {
    const text = encodeURIComponent(
      `⚔️ SHARK LEGENDS - AAAKN\n\n🏆 Acabei de vencer uma batalha!\n👤 Level: ${hero.level}\n🎯 Vitórias: ${hero.totalWins}\n\nVenha me desafiar! 🦈`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Calcular progresso de XP
  const xpProgress = (hero.xp / hero.xpToNext) * 100;

  // Labels dos atributos
  const statLabels: Record<
    keyof HeroStats,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    inteligencia: {
      label: "INT",
      icon: <Brain size={14} />,
      color: "bg-purple-500",
    },
    forca: { label: "FOR", icon: <Flame size={14} />, color: "bg-red-500" },
    stamina: { label: "STA", icon: <Zap size={14} />, color: "bg-yellow-500" },
    hp: { label: "HP", icon: <Heart size={14} />, color: "bg-pink-500" },
    ataque: {
      label: "ATK",
      icon: <Swords size={14} />,
      color: "bg-orange-500",
    },
    defesa: { label: "DEF", icon: <Shield size={14} />, color: "bg-blue-500" },
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-mono">
      {/* HEADER */}
      <header className="bg-gradient-to-b from-emerald-950 to-black p-4 sticky top-0 z-20 border-b border-emerald-900/50">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/menu"
            className="p-2 bg-black/50 rounded-lg border border-emerald-900/50"
          >
            <ArrowLeft size={20} className="text-emerald-400" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black text-emerald-400 tracking-wider uppercase">
              Shark Legends
            </h1>
            <p className="text-[10px] text-emerald-600 tracking-widest">
              PIXEL HEROES ARENA
            </p>
          </div>
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-lg border border-emerald-900/50">
            <Swords size={14} className="text-emerald-400" />
            <span className="text-sm font-bold text-emerald-400">
              {dailyBattles}/5
            </span>
          </div>
        </div>

        {/* Hero Card Mini */}
        <div className="bg-black/50 rounded-xl p-3 border border-emerald-900/30">
          <div className="flex items-center gap-3">
            {/* Avatar Pixel */}
            <div className="relative">
              <PixelAvatar type="warrior" size="small" />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black text-[8px] font-black px-1.5 rounded">
                {hero.level}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-sm">{hero.name}</h2>
              <p className="text-[10px] text-emerald-500">
                {hero.turma} • {hero.totalWins}W / {hero.totalLosses}L
              </p>
              {/* XP Bar */}
              <div className="mt-1">
                <div className="flex justify-between text-[8px] text-zinc-500 mb-0.5">
                  <span>XP</span>
                  <span>
                    {hero.xp}/{hero.xpToNext}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>
            </div>
            {hero.pointsToDistribute > 0 && (
              <div className="bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded animate-pulse">
                +{hero.pointsToDistribute} PTS
              </div>
            )}
          </div>
        </div>
      </header>

      {/* TABS */}
      <div className="flex border-b border-zinc-900 bg-zinc-950 sticky top-[180px] z-10">
        {[
          { id: "battle", label: "Arena", icon: <Swords size={16} /> },
          { id: "stats", label: "Stats", icon: <Sparkles size={16} /> },
          { id: "ranking", label: "Ranking", icon: <Trophy size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedTab === tab.id
                ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-950/30"
                : "text-zinc-600 hover:text-zinc-400"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTEÚDO */}
      <main className="p-4">
        {/* TAB: ARENA DE BATALHA */}
        {selectedTab === "battle" && (
          <div className="space-y-4">
            {/* Estado: Idle - Aguardando início */}
            {battleState === "idle" && (
              <>
                {/* Arena Preview */}
                <div className="bg-gradient-to-b from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMGZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] bg-repeat" />
                  </div>

                  <div className="relative flex flex-col items-center">
                    <PixelAvatar type="warrior" size="large" />
                    <h3 className="mt-4 text-lg font-black text-white">
                      {hero.name}
                    </h3>
                    <p className="text-emerald-500 text-sm">
                      Level {hero.level} • {hero.turma}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 w-full max-w-xs">
                      {(Object.keys(hero.stats) as (keyof HeroStats)[]).map(
                        (stat) => (
                          <div
                            key={stat}
                            className="bg-black/50 rounded-lg p-2 text-center border border-zinc-800"
                          >
                            <div
                              className={`w-6 h-6 rounded mx-auto mb-1 flex items-center justify-center ${statLabels[stat].color}`}
                            >
                              {statLabels[stat].icon}
                            </div>
                            <p className="text-[10px] text-zinc-500 uppercase">
                              {statLabels[stat].label}
                            </p>
                            <p className="text-sm font-bold text-white">
                              {hero.stats[stat]}
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão de Batalha */}
                <button
                  onClick={startBattle}
                  disabled={dailyBattles <= 0}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-zinc-800 disabled:to-zinc-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-lg shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <Swords size={24} />
                  {dailyBattles > 0
                    ? "Encontrar Oponente"
                    : "Batalhas Esgotadas"}
                </button>

                {dailyBattles <= 0 && (
                  <p className="text-center text-zinc-500 text-xs">
                    Volte amanhã para mais batalhas!
                  </p>
                )}

                {/* Conquistas que dão XP */}
                <div className="mt-6">
                  <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                    <Star size={16} className="text-yellow-500" />
                    Ganhe XP com Conquistas
                  </h3>
                  <div className="space-y-2">
                    {achievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className={`bg-zinc-900 rounded-xl p-3 border ${
                          achievement.completed
                            ? "border-emerald-900/50"
                            : "border-zinc-800"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-bold text-white">
                                {achievement.name}
                              </h4>
                              <span className="text-emerald-400 text-xs font-bold">
                                +{achievement.xpReward} XP
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500">
                              {achievement.description}
                            </p>
                            <div className="mt-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  achievement.completed
                                    ? "bg-emerald-500"
                                    : "bg-zinc-600"
                                }`}
                                style={{
                                  width: `${
                                    (achievement.progress / achievement.total) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <p className="text-[9px] text-zinc-600 mt-0.5">
                              {achievement.progress}/{achievement.total}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Estado: Selecionando atributo */}
            {battleState === "selecting" && opponent && (
              <div className="space-y-4">
                {/* VS Display */}
                <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
                  <div className="flex items-center justify-around">
                    <div className="text-center">
                      <PixelAvatar type="warrior" size="medium" />
                      <p className="mt-2 text-sm font-bold text-white">
                        {hero.name}
                      </p>
                      <p className="text-[10px] text-emerald-500">
                        Lv.{hero.level}
                      </p>
                    </div>
                    <div className="text-3xl font-black text-red-500 animate-pulse">
                      VS
                    </div>
                    <div className="text-center">
                      <PixelAvatar
                        type={opponent.avatar as any}
                        size="medium"
                      />
                      <p className="mt-2 text-sm font-bold text-white">
                        {opponent.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        Lv.{opponent.level}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Seleção de Atributo */}
                <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800">
                  <h3 className="text-center text-sm font-bold text-zinc-400 mb-4">
                    <Dices className="inline mr-2" size={16} />
                    Escolha seu atributo de batalha
                  </h3>
                  <p className="text-center text-[10px] text-zinc-600 mb-4">
                    O dado decidirá se seu atributo ou o do oponente será usado!
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(hero.stats) as (keyof HeroStats)[]).map(
                      (stat) => (
                        <button
                          key={stat}
                          onClick={() => selectAttribute(stat)}
                          className={`p-3 rounded-xl border-2 transition-all ${
                            selectedAttribute === stat
                              ? "border-emerald-500 bg-emerald-950/50"
                              : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${statLabels[stat].color}`}
                            >
                              {statLabels[stat].icon}
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-white uppercase">
                                {statLabels[stat].label}
                              </p>
                              <p className="text-lg font-black text-emerald-400">
                                {hero.stats[stat]}
                              </p>
                            </div>
                          </div>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <button
                    onClick={resetBattle}
                    className="flex-1 bg-zinc-800 text-zinc-400 font-bold py-3 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmBattle}
                    disabled={!selectedAttribute}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-black py-3 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Dices size={18} />
                    Rolar Dado
                  </button>
                </div>
              </div>
            )}

            {/* Estado: Rolando dado */}
            {battleState === "rolling" && opponent && (
              <div className="space-y-4">
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 text-center">
                  <div className="flex items-center justify-around mb-6">
                    <div className="text-center">
                      <PixelAvatar type="warrior" size="medium" />
                      <p className="mt-2 text-sm font-bold text-white">
                        {hero.name}
                      </p>
                    </div>
                    <div
                      className={`text-5xl ${
                        diceRolling ? "animate-spin" : ""
                      }`}
                    >
                      🎲
                    </div>
                    <div className="text-center">
                      <PixelAvatar
                        type={opponent.avatar as any}
                        size="medium"
                      />
                      <p className="mt-2 text-sm font-bold text-white">
                        {opponent.name}
                      </p>
                    </div>
                  </div>

                  <p className="text-emerald-400 font-bold animate-pulse">
                    Rolando o dado...
                  </p>
                  <p className="text-zinc-500 text-xs mt-2">
                    Decidindo qual atributo será usado na batalha
                  </p>
                </div>
              </div>
            )}

            {/* Estado: Resultado */}
            {battleState === "result" && opponent && battleResult && (
              <div className="space-y-4">
                {/* Resultado Principal */}
                <div
                  className={`rounded-2xl p-6 border-2 text-center ${
                    battleResult.winner === "hero"
                      ? "bg-gradient-to-b from-emerald-950 to-black border-emerald-500"
                      : "bg-gradient-to-b from-red-950 to-black border-red-500"
                  }`}
                >
                  <div className="text-6xl mb-4">
                    {battleResult.winner === "hero" ? "🏆" : "💀"}
                  </div>
                  <h2
                    className={`text-2xl font-black uppercase tracking-wider ${
                      battleResult.winner === "hero"
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {battleResult.winner === "hero" ? "Vitória!" : "Derrota!"}
                  </h2>

                  <div className="mt-4 bg-black/50 rounded-xl p-4">
                    <p className="text-zinc-400 text-xs mb-2">
                      Dado escolheu:{" "}
                      <span className="text-white font-bold">
                        {chosenByDice === "hero"
                          ? "Seu atributo"
                          : "Atributo do oponente"}
                      </span>
                    </p>
                    <p className="text-zinc-400 text-xs mb-3">
                      Atributo usado:{" "}
                      <span
                        className={`font-bold ${
                          statLabels[battleResult.attribute].color
                        } bg-clip-text`}
                      >
                        {statLabels[battleResult.attribute].label}
                      </span>
                    </p>

                    <div className="flex items-center justify-around">
                      <div>
                        <p className="text-xs text-zinc-500">Você</p>
                        <p
                          className={`text-2xl font-black ${
                            battleResult.winner === "hero"
                              ? "text-emerald-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {battleResult.heroValue}
                        </p>
                      </div>
                      <div className="text-zinc-600">vs</div>
                      <div>
                        <p className="text-xs text-zinc-500">Oponente</p>
                        <p
                          className={`text-2xl font-black ${
                            battleResult.winner === "opponent"
                              ? "text-red-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {battleResult.opponentValue}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-yellow-400">
                    <Star size={18} />
                    <span className="font-bold">
                      +{battleResult.xpGained} XP
                    </span>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  {battleResult.winner === "hero" && (
                    <button
                      onClick={shareVictory}
                      className="flex-1 bg-[#25D366] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                    >
                      <Share2 size={18} />
                      Compartilhar
                    </button>
                  )}
                  <button
                    onClick={resetBattle}
                    className="flex-1 bg-zinc-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {dailyBattles > 0 ? "Nova Batalha" : "Voltar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB: STATS E DISTRIBUIÇÃO */}
        {selectedTab === "stats" && (
          <div className="space-y-4">
            {/* Avatar Grande */}
            <div className="bg-gradient-to-b from-zinc-900 to-black rounded-2xl p-6 border border-zinc-800 text-center">
              <PixelAvatar type="warrior" size="large" />
              <h3 className="mt-4 text-xl font-black text-white">
                {hero.name}
              </h3>
              <p className="text-emerald-500">
                Level {hero.level} • {hero.turma}
              </p>

              {hero.pointsToDistribute > 0 && (
                <div className="mt-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-2">
                  <p className="text-yellow-400 text-sm font-bold">
                    {hero.pointsToDistribute} pontos para distribuir!
                  </p>
                </div>
              )}
            </div>

            {/* Estatísticas Detalhadas */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400" />
                Atributos do Herói
              </h3>

              <div className="space-y-4">
                {(Object.keys(hero.stats) as (keyof HeroStats)[]).map(
                  (stat) => (
                    <div key={stat}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center ${statLabels[stat].color}`}
                          >
                            {statLabels[stat].icon}
                          </div>
                          <span className="text-sm font-bold text-white uppercase">
                            {stat}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-emerald-400">
                            {hero.stats[stat]}
                          </span>
                          {hero.pointsToDistribute > 0 && (
                            <button
                              onClick={() => distributePoint(stat)}
                              className="w-6 h-6 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-bold text-xs"
                            >
                              +
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${statLabels[stat].color} transition-all duration-500`}
                          style={{
                            width: `${Math.min(
                              (hero.stats[stat] / (stat === "hp" ? 300 : 50)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Histórico de Batalhas */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                <Swords size={16} className="text-emerald-400" />
                Histórico de Batalhas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-emerald-950/50 rounded-xl p-3 text-center border border-emerald-900/50">
                  <p className="text-2xl font-black text-emerald-400">
                    {hero.totalWins}
                  </p>
                  <p className="text-xs text-emerald-600">Vitórias</p>
                </div>
                <div className="bg-red-950/50 rounded-xl p-3 text-center border border-red-900/50">
                  <p className="text-2xl font-black text-red-400">
                    {hero.totalLosses}
                  </p>
                  <p className="text-xs text-red-600">Derrotas</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="text-zinc-500 text-xs">Taxa de Vitória</p>
                <p className="text-lg font-bold text-white">
                  {(
                    (hero.totalWins / (hero.totalWins + hero.totalLosses)) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: RANKING */}
        {selectedTab === "ranking" && (
          <div className="space-y-4">
            {/* Ranking Individual */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                <Crown size={16} className="text-yellow-500" />
                Ranking Individual
              </h3>

              <div className="space-y-2">
                {ranking.map((entry, index) => (
                  <div
                    key={entry.position}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      entry.name === hero.name
                        ? "bg-emerald-950/50 border border-emerald-900/50"
                        : "bg-zinc-950"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-zinc-400 text-black"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {entry.position}
                    </div>
                    <PixelAvatar type={entry.avatar as any} size="tiny" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {entry.name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {entry.turma} • Lv.{entry.level}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        {entry.wins}
                      </p>
                      <p className="text-[10px] text-zinc-600">vitórias</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ranking por Turmas */}
            <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                <Users size={16} className="text-emerald-400" />
                Ranking por Turmas
              </h3>

              <div className="space-y-2">
                {turmaRanking.map((entry, index) => (
                  <div
                    key={entry.turma}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      entry.turma === hero.turma
                        ? "bg-emerald-950/50 border border-emerald-900/50"
                        : "bg-zinc-950"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                        index === 0
                          ? "bg-yellow-500 text-black"
                          : index === 1
                          ? "bg-zinc-400 text-black"
                          : index === 2
                          ? "bg-orange-600 text-white"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {entry.position}
                    </div>
                    <div className="w-10 h-10 bg-emerald-900/50 rounded-lg flex items-center justify-center text-lg font-black text-emerald-400">
                      {entry.turma}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        Turma {entry.turma}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {entry.members} membros • Média Lv.{entry.avgLevel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-400">
                        {entry.totalWins}
                      </p>
                      <p className="text-[10px] text-zinc-600">vitórias</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================================================
// COMPONENTE: PIXEL AVATAR
// ============================================================================

function PixelAvatar({
  type,
  size = "medium",
}: {
  type: "warrior" | "zombie" | "skeleton" | "shadow";
  size?: "tiny" | "small" | "medium" | "large";
}) {
  const sizeClasses = {
    tiny: "w-8 h-10",
    small: "w-12 h-16",
    medium: "w-20 h-28",
    large: "w-28 h-40",
  };

  const avatarStyles = {
    warrior: {
      skin: "bg-amber-600",
      hair: "bg-amber-900",
      armor: "bg-emerald-700",
      accent: "bg-emerald-500",
    },
    zombie: {
      skin: "bg-green-600",
      hair: "bg-green-900",
      armor: "bg-zinc-700",
      accent: "bg-red-500",
    },
    skeleton: {
      skin: "bg-zinc-200",
      hair: "bg-transparent",
      armor: "bg-zinc-600",
      accent: "bg-zinc-400",
    },
    shadow: {
      skin: "bg-purple-900",
      hair: "bg-purple-950",
      armor: "bg-zinc-900",
      accent: "bg-purple-500",
    },
  };

  const style = avatarStyles[type];

  if (size === "tiny") {
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <div
          className={`w-full h-full ${style.armor} rounded-sm border-b-2 border-r-2 border-black/30`}
        >
          <div
            className={`w-3/4 h-1/3 ${style.skin} mx-auto -mt-1 rounded-sm`}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} relative pixel-avatar`}>
      {/* Corpo */}
      <div
        className={`w-full h-full ${style.armor} rounded-sm border-b-4 border-r-4 border-black/30 flex flex-col items-center relative overflow-hidden`}
      >
        {/* Cabeça */}
        <div
          className={`w-3/4 h-2/5 ${style.skin} -mt-4 rounded-sm border-b-2 border-r-2 border-black/20 relative z-10`}
        >
          {/* Cabelo */}
          <div
            className={`absolute -top-1 left-0 right-0 h-2 ${style.hair} rounded-t-sm`}
          />
          {/* Olhos */}
          <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-white" />
          <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white" />
        </div>

        {/* Detalhes da armadura */}
        <div
          className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-1 ${style.accent} rounded`}
        />

        {/* Logo AAAKN no peito */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-[6px] font-black text-white/30 tracking-tighter">
          AAAKN
        </div>
      </div>

      {/* Efeito de brilho */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-sm pointer-events-none" />
    </div>
  );
}
