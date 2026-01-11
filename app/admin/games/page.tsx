"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Trophy, Calendar, LayoutDashboard, ScrollText, Swords, 
  Users, Star, Dumbbell, ShoppingBag, MapPin, MessageCircle, Crown, 
  Share2, Zap, Heart, Shield, Brain, Flame, Save, AlertTriangle,
  Info, Search, History, Clock, Lock, Archive
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// ============================================================================
// 1. TIPAGEM & INTERFACES
// ============================================================================

interface PlayerStat {
    id: number;
    handle: string;
    name: string;
    avatar: string;
    turma: string;
    value: number; 
}

interface GameRule {
    id: string; 
    label: string;
    icon: any;
    color: string;
    description: string; 
    xpPerAction: number;
}

// Interface para o Histórico Detalhado
interface BattleRecord {
    id: string;
    date: string;
    time: string;
    attacker: { name: string; handle: string; avatar: string };
    defender: { name: string; handle: string; avatar: string };
    winner: { name: string; handle: string; avatar: string };
    winnerHp: number;
    loserHp: number;
}

// Interface para Guardar Temporadas Passadas
interface SeasonArchive {
    id: number;
    name: string;
    dateEnded: string;
    logs: BattleRecord[];
    topPlayers: PlayerStat[];
}

// Interface do Pedido de Reset
interface ResetRequest {
    requestedBy: string;
    requestedAt: number; // Timestamp
    status: 'pending' | 'ready';
}

// ============================================================================
// 2. DADOS MOCKADOS (BASE)
// ============================================================================

const DEFAULT_RULES: GameRule[] = [
    { id: "forca", label: "Força", icon: Flame, color: "text-red-500", description: "Check-in Gymrats confirmado", xpPerAction: 50 },
    { id: "inteligencia", label: "Inteligência", icon: Brain, color: "text-purple-500", description: "Presença em Monitoria/Aula", xpPerAction: 40 },
    { id: "stamina", label: "Stamina", icon: Zap, color: "text-yellow-500", description: "Participação em Treino da Atlética", xpPerAction: 45 },
    { id: "defesa", label: "Defesa", icon: Shield, color: "text-blue-500", description: "Compra de Produto na Lojinha", xpPerAction: 100 },
    { id: "ataque", label: "Ataque", icon: Swords, color: "text-orange-500", description: "Vencer Desafio 1v1", xpPerAction: 30 },
    { id: "hp", label: "Vida", icon: Heart, color: "text-pink-500", description: "Subir de Nível Geral", xpPerAction: 10 },
];

const generateTop10 = (type: string, seed: number): PlayerStat[] => {
    return Array.from({ length: 10 }).map((_, i) => ({
        id: i + 1,
        handle: `user${i}`,
        name: `Aluno ${type} ${i + 1}`,
        avatar: `https://i.pravatar.cc/150?u=${type}${i + seed}`,
        turma: i % 2 === 0 ? "T5" : "T7",
        value: Math.floor(Math.random() * 500) + 50 - (i * 5)
    })).sort((a, b) => b.value - a.value);
};

// Gerador de Logs
const generateLogs = (count: number): BattleRecord[] => Array.from({ length: count }).map((_, i) => {
    const isWin = i % 2 === 0;
    return {
        id: `BTL-${1000 + i}`,
        date: new Date(Date.now() - i * 86400000).toLocaleDateString('pt-BR'),
        time: new Date(Date.now() - i * 3600000).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        attacker: { name: `Atacante ${i}`, handle: `atk${i}`, avatar: `https://i.pravatar.cc/150?u=atk${i}` },
        defender: { name: `Defensor ${i}`, handle: `def${i}`, avatar: `https://i.pravatar.cc/150?u=def${i}` },
        winner: { 
            name: isWin ? `Atacante ${i}` : `Defensor ${i}`, 
            handle: isWin ? `atk${i}` : `def${i}`, 
            avatar: isWin ? `https://i.pravatar.cc/150?u=atk${i}` : `https://i.pravatar.cc/150?u=def${i}` 
        },
        winnerHp: Math.floor(Math.random() * 50) + 10,
        loserHp: 0
    };
});

// ============================================================================
// 3. COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminGamesPage() {
  const { addToast } = useToast();
  
  // --- ESTADOS GLOBAIS ---
  const [activeTab, setActiveTab] = useState<"dashboard" | "atributos" | "regras" | "historico">("dashboard");
  const [currentSeason, setCurrentSeason] = useState(2); // Começa na 2 para exemplo
  const [viewingSeason, setViewingSeason] = useState<number | 'current'>('current'); // 'current' ou ID da season passada
  
  // Dados Atuais (Vivos)
  const [liveRules, setLiveRules] = useState<GameRule[]>(DEFAULT_RULES);
  const [liveLogs, setLiveLogs] = useState<BattleRecord[]>(generateLogs(15));
  const [liveTopPlayers, setLiveTopPlayers] = useState<PlayerStat[]>(generateTop10("Atual", 1));

  // Arquivo Morto (Temporadas Passadas)
  const [archives, setArchives] = useState<SeasonArchive[]>([
      { id: 1, name: "Temporada 1 (Beta)", dateEnded: "01/01/2026", logs: generateLogs(5), topPlayers: generateTop10("Beta", 99) }
  ]);

  // Estado do Reset
  const [resetRequest, setResetRequest] = useState<ResetRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- LÓGICA DE VISUALIZAÇÃO ---
  const isArchivedView = viewingSeason !== 'current';
  const displayedLogs = isArchivedView ? archives.find(a => a.id === viewingSeason)?.logs || [] : liveLogs;
  const displayedTopPlayers = isArchivedView ? archives.find(a => a.id === viewingSeason)?.topPlayers || [] : liveTopPlayers;

  // Filtro
  const filteredLogs = displayedLogs.filter(log => 
      log.attacker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.defender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- AÇÕES DO RESET (PROTOCOLO 24H) ---

  const handleRequestReset = () => {
      setResetRequest({
          requestedBy: "Admin 01", 
          requestedAt: Date.now(),
          status: 'pending'
      });
      addToast("Protocolo de Reset INICIADO. Aguardando 24h e confirmação do 2º Admin.", "info");
  };

  const handleConfirmReset = () => {
      if (!resetRequest) return;

      const timeElapsed = Date.now() - resetRequest.requestedAt;
      const hours24 = 10000; // 10 SEGUNDOS PARA TESTE

      if (timeElapsed < hours24) {
          const timeLeft = Math.ceil((hours24 - timeElapsed) / 1000);
          addToast(`Aguarde mais ${timeLeft} segundos para a trava de segurança liberar.`, "error");
          return;
      }

      const newArchive: SeasonArchive = {
          id: currentSeason,
          name: `Temporada ${currentSeason}`,
          dateEnded: new Date().toLocaleDateString('pt-BR'),
          logs: [...liveLogs],
          topPlayers: [...liveTopPlayers]
      };

      setArchives(prev => [...prev, newArchive]);
      
      setLiveLogs([]); 
      setLiveTopPlayers([]); 
      setCurrentSeason(prev => prev + 1);
      setResetRequest(null); 
      
      addToast(`Temporada ${currentSeason} ARQUIVADA! Temporada ${currentSeason + 1} iniciada.`, "success");
  };

  // --- UPDATE RULES ---
  const handleUpdateRule = (id: string, field: keyof GameRule, value: any) => {
      if (isArchivedView) return; 
      setLiveRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveRules = () => {
      addToast("Regras do Jogo atualizadas!", "success");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER DE COMANDO */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col xl:flex-row justify-between gap-4 items-center shadow-xl">
        
        <div className="flex items-center gap-4 w-full xl:w-auto">
            <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800">
                <ArrowLeft size={20} className="text-zinc-400" />
            </Link>
            <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    Central de Jogos 
                    {isArchivedView ? (
                        <span className="bg-zinc-800 text-zinc-400 text-[10px] px-3 py-1 rounded-full border border-zinc-700 flex items-center gap-1"><Archive size={10}/> Arquivo: Temporada {viewingSeason}</span>
                    ) : (
                        <span className="bg-emerald-900/30 text-emerald-400 text-[10px] px-3 py-1 rounded-full border border-emerald-900/50 flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ao Vivo: Temporada {currentSeason}</span>
                    )}
                </h1>
                <p className="text-[11px] text-zinc-500 font-medium">Controle Total de XP, Rankings e Batalhas</p>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/50">
            <button 
                onClick={() => setViewingSeason('current')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewingSeason === 'current' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
                <Zap size={14}/> Atual
            </button>
            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
            {archives.map(arch => (
                <button 
                    key={arch.id}
                    onClick={() => setViewingSeason(arch.id)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewingSeason === arch.id ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                >
                    <Archive size={14}/> {arch.name}
                </button>
            ))}
        </div>
        
        {!isArchivedView && (
            <div className="w-full xl:w-auto">
                {!resetRequest ? (
                    <button onClick={handleRequestReset} className="w-full group flex items-center justify-center gap-3 px-5 py-3 bg-red-950/20 border border-red-900/30 rounded-xl hover:bg-red-900/40 transition active:scale-95">
                        <AlertTriangle size={18} className="text-red-500 group-hover:animate-pulse"/>
                        <div className="text-left">
                            <span className="block text-[10px] font-bold text-red-400/70 uppercase tracking-wider">Zona de Perigo</span>
                            <span className="block text-xs font-black text-red-500">INICIAR RESET (1/2)</span>
                        </div>
                    </button>
                ) : (
                    <button onClick={handleConfirmReset} className="w-full group flex items-center justify-center gap-3 px-5 py-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl hover:bg-yellow-900/40 transition active:scale-95 animate-pulse-slow">
                        <Clock size={18} className="text-yellow-500"/>
                        <div className="text-left">
                            <span className="block text-[10px] font-bold text-yellow-400/70 uppercase tracking-wider">Aguardando 2º Admin</span>
                            <span className="block text-xs font-black text-yellow-500">CONFIRMAR RESET (2/2)</span>
                        </div>
                    </button>
                )}
            </div>
        )}
      </header>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-8 overflow-x-auto scrollbar-hide">
              {[
                  { id: 'dashboard', label: 'Top Players', icon: LayoutDashboard },
                  { id: 'historico', label: 'Histórico Global', icon: History },
                  { id: 'atributos', label: 'Top Atributos', icon: Star },
                  { id: 'regras', label: 'Regras do Jogo', icon: ScrollText },
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`pb-4 text-xs font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white hover:border-zinc-700'}`}
                  >
                      <tab.icon size={16}/> {tab.label}
                  </button>
              ))}
          </div>
      </div>

      <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ==================================================================================== */}
        {/* ABA 1: DASHBOARD (CARDS DE DESTAQUE) */}
        {/* ==================================================================================== */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LeaderboardCard title="Mais Jogaram" icon={<Swords size={18} className="text-yellow-500"/>} data={displayedTopPlayers} metric="Partidas" color="yellow" />
                <LeaderboardCard title="Mais Vitórias" icon={<Trophy size={18} className="text-emerald-500"/>} data={displayedTopPlayers.slice().reverse()} metric="Vitórias" color="emerald" />
                <LeaderboardCard title="Mais Compartilham" icon={<Share2 size={18} className="text-blue-500"/>} data={displayedTopPlayers} metric="Shares" color="blue" />
            </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 2: HISTÓRICO GERAL (TABELA DETALHADA) */}
        {/* ==================================================================================== */}
        {activeTab === 'historico' && (
            <div className="space-y-4">
                {/* Barra de Filtro */}
                <div className="flex gap-4 items-center bg-zinc-900 p-4 rounded-2xl border border-zinc-800 w-full lg:w-1/2 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                    <Search size={20} className="text-zinc-500"/>
                    <input 
                        type="text" 
                        placeholder="Filtrar por ID, Nome do Atacante ou Defensor..." 
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-zinc-600 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Tabela Scrollável */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar pb-2">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-black/60 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-5 min-w-[100px]">ID Batalha</th>
                                    <th className="p-5 min-w-[100px]">Data</th>
                                    <th className="p-5 min-w-[80px]">Hora</th>
                                    <th className="p-5 min-w-[200px]">Perfil Atacante</th>
                                    <th className="p-5 min-w-[200px]">Perfil Defensor</th>
                                    <th className="p-5 min-w-[200px] text-emerald-500">Vencedor</th>
                                    <th className="p-5 text-center min-w-[100px]">HP Vencedor</th>
                                    <th className="p-5 text-center min-w-[100px]">HP Perdedor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm">
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-zinc-800/40 transition group">
                                        <td className="p-5 font-mono text-zinc-500 font-bold text-xs">{log.id}</td>
                                        <td className="p-5 text-zinc-300 font-medium"><Calendar size={12} className="inline mr-2 text-zinc-600"/>{log.date}</td>
                                        <td className="p-5 text-zinc-300 font-medium"><Clock size={12} className="inline mr-2 text-zinc-600"/>{log.time}</td>
                                        <td className="p-5">
                                            <Link href={`/perfil/${log.attacker.handle}`} className="flex items-center gap-3 hover:opacity-80 transition">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                                                    <img src={log.attacker.avatar} className="w-full h-full object-cover"/>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-xs">{log.attacker.name}</p>
                                                    <p className="text-[9px] text-zinc-500">@{log.attacker.handle}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-5">
                                            <Link href={`/perfil/${log.defender.handle}`} className="flex items-center gap-3 hover:opacity-80 transition">
                                                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                                                    <img src={log.defender.avatar} className="w-full h-full object-cover"/>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white text-xs">{log.defender.name}</p>
                                                    <p className="text-[9px] text-zinc-500">@{log.defender.handle}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="p-5">
                                            <div className="flex items-center gap-2 bg-emerald-900/10 px-3 py-1.5 rounded-lg border border-emerald-900/30 w-fit">
                                                <Trophy size={14} className="text-emerald-500"/>
                                                <span className="font-black text-emerald-400 text-xs uppercase">{log.winner.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="font-mono text-emerald-500 font-bold">{log.winnerHp}</span>
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="font-mono text-red-500 font-bold opacity-50">{log.loserHp}</span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="p-10 text-center text-zinc-500 flex flex-col items-center gap-2">
                                            <Search size={32} className="opacity-20"/>
                                            <p>Nenhuma batalha encontrada nesta temporada.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 3: TOP ATRIBUTOS */}
        {/* ==================================================================================== */}
        {activeTab === 'atributos' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {liveRules.map(attr => (
                    <div key={attr.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-96 shadow-lg hover:border-zinc-700 transition">
                        <div className="p-5 bg-black/40 border-b border-zinc-800 flex items-center justify-between">
                            <h3 className={`font-black uppercase flex items-center gap-2 ${attr.color}`}>
                                <div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800`}>
                                    <attr.icon size={16} /> 
                                </div>
                                Top {attr.label}
                            </h3>
                            <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-1 rounded font-bold border border-zinc-800">Top 10</span>
                        </div>
                        <div className="overflow-y-auto flex-1 p-3 space-y-1 custom-scrollbar">
                            {displayedTopPlayers.map((p, i) => (
                                <Link href={`/perfil/${p.handle}`} key={p.id} className="flex items-center gap-3 p-2.5 hover:bg-zinc-800/80 rounded-xl transition group">
                                    <span className={`font-mono text-xs font-black w-6 text-center ${i < 3 ? attr.color : 'text-zinc-600'}`}>#{i+1}</span>
                                    <img src={p.avatar} className="w-8 h-8 rounded-full bg-zinc-800 object-cover border border-zinc-700"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-zinc-200 truncate group-hover:text-white">{p.name}</p>
                                        <p className="text-[9px] text-zinc-500">{p.turma}</p>
                                    </div>
                                    <span className={`text-xs font-black ${attr.color}`}>{p.value + (Math.random() * 100).toFixed(0)}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 4: REGRAS DO JOGO */}
        {/* ==================================================================================== */}
        {activeTab === 'regras' && (
            <div className="space-y-6 max-w-5xl mx-auto">
                {isArchivedView && (
                    <div className="bg-orange-900/20 border border-orange-500/20 p-4 rounded-2xl flex gap-3 items-center text-orange-400 mb-4">
                        <Lock size={20}/>
                        <p className="text-sm font-bold">Você está visualizando uma temporada arquivada. As regras são apenas leitura.</p>
                    </div>
                )}

                <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-3xl flex gap-5 items-start shadow-lg">
                    <div className="bg-emerald-500/20 p-3 rounded-full">
                        <Info className="text-emerald-500" size={24}/>
                    </div>
                    <div>
                        <h4 className="text-emerald-400 font-black text-lg">Engine de Balanceamento</h4>
                        <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
                            Defina como os alunos evoluem. Cada atributo está ligado a uma ação no mundo real.
                            <br/>Alterar o XP impacta imediatamente na dificuldade de "upar" aquele status.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {liveRules.map((rule) => (
                        <div key={rule.id} className={`bg-zinc-900 p-6 rounded-3xl border ${isArchivedView ? 'border-zinc-800 opacity-70' : 'border-zinc-800 hover:border-zinc-600'} transition group relative shadow-md`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl bg-black border border-zinc-800 ${rule.color}`}>
                                        <rule.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-lg uppercase tracking-tight">{rule.label}</h3>
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">Core Stat</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">XP / Ação</label>
                                    <input 
                                        type="number" 
                                        disabled={isArchivedView}
                                        className="bg-black border border-zinc-700 rounded-xl w-20 px-3 py-2 text-right text-emerald-400 font-black focus:border-emerald-500 outline-none text-lg disabled:opacity-50"
                                        value={rule.xpPerAction}
                                        onChange={(e) => handleUpdateRule(rule.id, 'xpPerAction', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-2">
                                    <Swords size={10}/> Ação Gatilho (Descrição no App)
                                </label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        disabled={isArchivedView}
                                        className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-300 font-medium focus:border-emerald-500 outline-none transition disabled:opacity-50"
                                        value={rule.description}
                                        onChange={(e) => handleUpdateRule(rule.id, 'description', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isArchivedView && (
                    <div className="fixed bottom-6 right-6 md:right-10 z-40">
                        <button 
                            onClick={handleSaveRules} 
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition transform hover:scale-105 flex items-center gap-3 font-bold text-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
                        >
                            <Save size={24} /> Salvar Regras
                        </button>
                    </div>
                )}
            </div>
        )}

      </main>
    </div>
  );
}

// ============================================================================
// 4. SUB-COMPONENTES
// ============================================================================

function LeaderboardCard({ title, icon, data, metric, color }: { title: string, icon: any, data: PlayerStat[], metric: string, color: string }) {
    const colorClass = {
        yellow: 'text-yellow-500',
        emerald: 'text-emerald-500',
        blue: 'text-blue-500'
    }[color] || 'text-white';

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-lg">
            <div className="p-6 bg-black/40 border-b border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-2 rounded-lg">{icon}</div>
                    <h3 className="font-black text-white text-lg tracking-tight">{title}</h3>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1">
                {data.map((player, index) => (
                    <Link href={`/perfil/${player.handle}`} key={player.id} className="flex items-center gap-4 p-3 hover:bg-zinc-800 rounded-2xl transition group border border-transparent hover:border-zinc-700">
                        <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shrink-0 ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-zinc-500/20 text-zinc-400' : index === 2 ? 'bg-orange-700/20 text-orange-600' : 'bg-zinc-900 text-zinc-600'}`}>
                            #{index + 1}
                        </div>
                        
                        <div className="relative w-10 h-10 shrink-0">
                            <img src={player.avatar} className="w-full h-full rounded-full object-cover border border-zinc-700 group-hover:border-emerald-500 transition"/>
                            {index === 0 && <div className="absolute -top-2 -right-2 text-yellow-500 bg-black rounded-full p-0.5"><Crown size={14} fill="currentColor"/></div>}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition">{player.name}</p>
                            <p className="text-[10px] text-zinc-500 font-medium">{player.turma}</p>
                        </div>

                        <div className="text-right">
                            <span className={`block font-black text-lg ${colorClass}`}>{player.value}</span>
                            <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{metric}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}