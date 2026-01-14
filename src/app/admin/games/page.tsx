"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Trophy, Calendar, LayoutDashboard, ScrollText, Swords, 
  Users, Star, Dumbbell, ShoppingBag, MapPin, MessageCircle, Crown, 
  Share2, Zap, Heart, Shield, Brain, Flame, Save, AlertTriangle,
  Info, Search, History, Clock, Lock, Archive, Target, Ticket, Megaphone
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";

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

// Nova estrutura de Regra baseada no GAME_RULES.md
interface GameRule {
    id: string; 
    category: 'GYM' | 'LOJA' | 'SOCIAL' | 'GAME';
    label: string;
    icon: any;
    color: string;
    description: string; 
    xpReward: number;      // XP ganho
    statType: string;      // Qual atributo ganha bônus
    statReward: number;    // Quanto de atributo ganha
}

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

interface SeasonArchive {
    id: number;
    name: string;
    dateEnded: string;
    logs: BattleRecord[];
    topPlayers: PlayerStat[];
}

interface ResetRequest {
    requestedBy: string;
    requestedAt: number;
    status: 'pending' | 'ready';
}

// ============================================================================
// 2. DADOS MOCKADOS (ATUALIZADOS COM AS NOVAS REGRAS)
// ============================================================================

const NEW_RULES: GameRule[] = [
    // --- GYM & ESPORTES ---
    { id: "gym_checkin", category: "GYM", label: "Presença Treino", icon: Dumbbell, color: "text-red-500", description: "Check-in diário validado", xpReward: 30, statType: "Força", statReward: 2 },
    { id: "gym_post", category: "GYM", label: "Post Camp. Gym", icon: Flame, color: "text-orange-500", description: "Postar foto treinando no feed", xpReward: 15, statType: "Força", statReward: 1 },
    { id: "gymrats_win", category: "GYM", label: "Top 10 GymRats", icon: Trophy, color: "text-yellow-500", description: "Finalizar temporada no topo", xpReward: 500, statType: "Força", statReward: 10 },
    
    // --- FINANCEIRO (LOJA) ---
    { id: "store_buy", category: "LOJA", label: "Compra Loja", icon: ShoppingBag, color: "text-blue-500", description: "A cada R$ 10,00 gastos", xpReward: 50, statType: "Defesa", statReward: 1 },
    { id: "loyalty_full", category: "LOJA", label: "Fidelidade Completa", icon: Star, color: "text-purple-500", description: "Completar cartela de selos", xpReward: 300, statType: "Defesa", statReward: 5 },
    { id: "partner_plan", category: "LOJA", label: "Sócio Torcedor", icon: Ticket, color: "text-emerald-500", description: "Renovação mensal do plano", xpReward: 200, statType: "Defesa", statReward: 2 },

    // --- SOCIAL & GESTÃO ---
    { id: "event_checkin", category: "SOCIAL", label: "Check-in Evento", icon: MapPin, color: "text-pink-500", description: "Presença confirmada em festa", xpReward: 100, statType: "Inteligência", statReward: 3 },
    { id: "suggestion_ok", category: "SOCIAL", label: "Sugestão Aprovada", icon: Brain, color: "text-indigo-500", description: "Ideia implementada pela diretoria", xpReward: 200, statType: "Inteligência", statReward: 5 },
    { id: "report_valid", category: "SOCIAL", label: "Denúncia Válida", icon: AlertTriangle, color: "text-zinc-400", description: "Reportar conteúdo impróprio", xpReward: 10, statType: "Inteligência", statReward: 0.5 },
    { id: "share_app", category: "SOCIAL", label: "Compartilhar", icon: Share2, color: "text-blue-400", description: "Compartilhar conquista/app", xpReward: 20, statType: "Inteligência", statReward: 0.2 },

    // --- GAME & CONSISTÊNCIA ---
    { id: "login_streak", category: "GAME", label: "Login Streak", icon: Zap, color: "text-yellow-400", description: "Entrar 7 dias seguidos", xpReward: 50, statType: "Stamina", statReward: 5 },
    { id: "pvp_win", category: "GAME", label: "Vitória Arena", icon: Swords, color: "text-red-600", description: "Vencer batalha PvP", xpReward: 20, statType: "Ataque", statReward: 1 },
    { id: "achievement", category: "GAME", label: "Conquista", icon: Crown, color: "text-yellow-600", description: "Desbloquear badge", xpReward: 100, statType: "Ataque", statReward: 2 },
    { id: "class_goal", category: "GAME", label: "Meta da Turma", icon: Users, color: "text-teal-500", description: "Turma bateu meta coletiva", xpReward: 200, statType: "HP (Todos)", statReward: 20 },
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "hall_fama" | "regras" | "historico">("dashboard");
  const [currentSeason, setCurrentSeason] = useState(2);
  const [viewingSeason, setViewingSeason] = useState<number | 'current'>('current');
  
  // Dados Atuais
  const [liveRules, setLiveRules] = useState<GameRule[]>(NEW_RULES);
  const [liveLogs, setLiveLogs] = useState<BattleRecord[]>(generateLogs(15));
  
  // Mock Data para Hall da Fama (4 Pilares)
  const [topForce, setTopForce] = useState<PlayerStat[]>(generateTop10("Gym", 1));
  const [topDefense, setTopDefense] = useState<PlayerStat[]>(generateTop10("Rich", 2));
  const [topIntel, setTopIntel] = useState<PlayerStat[]>(generateTop10("Nerd", 3));
  const [topAttack, setTopAttack] = useState<PlayerStat[]>(generateTop10("Gamer", 4));

  // Arquivo Morto
  const [archives, setArchives] = useState<SeasonArchive[]>([
      { id: 1, name: "Temporada 1 (Beta)", dateEnded: "01/01/2026", logs: generateLogs(5), topPlayers: generateTop10("Beta", 99) }
  ]);

  const [resetRequest, setResetRequest] = useState<ResetRequest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const isArchivedView = viewingSeason !== 'current';
  const displayedLogs = isArchivedView ? archives.find(a => a.id === viewingSeason)?.logs || [] : liveLogs;

  const filteredLogs = displayedLogs.filter(log => 
      log.attacker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.defender.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RESET LOGIC ---
  const handleRequestReset = () => {
      setResetRequest({ requestedBy: "Admin 01", requestedAt: Date.now(), status: 'pending' });
      addToast("Protocolo de Reset INICIADO.", "info");
  };

  const handleConfirmReset = () => {
      if (!resetRequest) return;
      const timeElapsed = Date.now() - resetRequest.requestedAt;
      const safeTime = 5000; // 5 segundos para teste
      if (timeElapsed < safeTime) { addToast("Aguarde a trava de segurança.", "error"); return; }

      const newArchive: SeasonArchive = {
          id: currentSeason, name: `Temporada ${currentSeason}`, dateEnded: new Date().toLocaleDateString('pt-BR'),
          logs: [...liveLogs], topPlayers: [...topAttack] // Salva o principal
      };
      setArchives(prev => [...prev, newArchive]);
      setLiveLogs([]); setCurrentSeason(prev => prev + 1); setResetRequest(null);
      addToast(`Temporada ${currentSeason} ARQUIVADA!`, "success");
  };

  // --- UPDATE RULES ---
  const handleUpdateRule = (id: string, field: keyof GameRule, value: any) => {
      if (isArchivedView) return; 
      setLiveRules(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const handleSaveRules = () => { addToast("Economia do jogo atualizada!", "success"); };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col xl:flex-row justify-between gap-4 items-center shadow-xl">
        <div className="flex items-center gap-4 w-full xl:w-auto">
            <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
            <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                    Shark Legends Admin
                    {isArchivedView ? <span className="bg-zinc-800 text-zinc-400 text-[10px] px-3 py-1 rounded-full border border-zinc-700 flex items-center gap-1"><Archive size={10}/> Arquivo: S{viewingSeason}</span> : <span className="bg-emerald-900/30 text-emerald-400 text-[10px] px-3 py-1 rounded-full border border-emerald-900/50 flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Ao Vivo: S{currentSeason}</span>}
                </h1>
                <p className="text-[11px] text-zinc-500 font-medium">Controle da Economia, XP e Batalhas</p>
            </div>
        </div>

        <div className="flex items-center gap-2 bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-800/50">
            <button onClick={() => setViewingSeason('current')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewingSeason === 'current' ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Zap size={14}/> Atual</button>
            <div className="w-px h-6 bg-zinc-800 mx-1"></div>
            {archives.map(arch => (<button key={arch.id} onClick={() => setViewingSeason(arch.id)} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${viewingSeason === arch.id ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}><Archive size={14}/> {arch.name}</button>))}
        </div>
        
        {!isArchivedView && (
            <div className="w-full xl:w-auto">
                {!resetRequest ? (
                    <button onClick={handleRequestReset} className="w-full group flex items-center justify-center gap-3 px-5 py-3 bg-red-950/20 border border-red-900/30 rounded-xl hover:bg-red-900/40 transition active:scale-95"><AlertTriangle size={18} className="text-red-500 group-hover:animate-pulse"/><span className="text-xs font-black text-red-500">RESETAR TEMPORADA</span></button>
                ) : (
                    <button onClick={handleConfirmReset} className="w-full group flex items-center justify-center gap-3 px-5 py-3 bg-yellow-900/20 border border-yellow-700/50 rounded-xl hover:bg-yellow-900/40 transition active:scale-95 animate-pulse-slow"><Clock size={18} className="text-yellow-500"/><span className="text-xs font-black text-yellow-500">CONFIRMAR RESET</span></button>
                )}
            </div>
        )}
      </header>

      {/* TABS */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-8 overflow-x-auto scrollbar-hide">
              {[
                  { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
                  { id: 'hall_fama', label: 'Hall da Fama (Atributos)', icon: Star },
                  { id: 'regras', label: 'Configurar XP/Regras', icon: ScrollText },
                  { id: 'historico', label: 'Logs de Batalha', icon: History },
              ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 text-xs font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white hover:border-zinc-700'}`}><tab.icon size={16}/> {tab.label}</button>
              ))}
          </div>
      </div>

      <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ABA 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <LeaderboardCard title="Mais Fortes (XP Total)" icon={<Crown size={18} className="text-yellow-500"/>} data={topAttack} metric="XP Total" color="yellow" />
                <LeaderboardCard title="Mais Ricos (Loja)" icon={<ShoppingBag size={18} className="text-blue-500"/>} data={topDefense} metric="R$ Gastos" color="blue" />
                <LeaderboardCard title="Mais Sociais (Eventos)" icon={<MessageCircle size={18} className="text-pink-500"/>} data={topIntel} metric="Interações" color="pink" />
            </div>
        )}

        {/* ABA 2: HALL DA FAMA (OS 4 PILARES) */}
        {activeTab === 'hall_fama' && (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* CARD FORÇA */}
                    <AttributeCard title="Reis da Força" icon={Dumbbell} color="text-red-500" data={topForce} attr="FOR" source="Gym/Treinos"/>
                    {/* CARD DEFESA */}
                    <AttributeCard title="Reis da Defesa" icon={Shield} color="text-blue-500" data={topDefense} attr="DEF" source="Loja/Sócio"/>
                    {/* CARD INTELIGÊNCIA */}
                    <AttributeCard title="Gênios (Int)" icon={Brain} color="text-purple-500" data={topIntel} attr="INT" source="Eventos/Social"/>
                    {/* CARD ATAQUE */}
                    <AttributeCard title="Mestres PvP (Atk)" icon={Swords} color="text-orange-500" data={topAttack} attr="ATK" source="Arena/Games"/>
                </div>
            </div>
        )}

        {/* ABA 3: REGRAS & ECONOMIA (EDIÇÃO) */}
        {activeTab === 'regras' && (
            <div className="space-y-8 max-w-6xl mx-auto">
                {isArchivedView && <div className="bg-orange-900/20 border border-orange-500/20 p-4 rounded-2xl flex gap-3 items-center text-orange-400 mb-4"><Lock size={20}/><p className="text-sm font-bold">Modo Leitura: Temporada Arquivada.</p></div>}
                
                {['GYM', 'LOJA', 'SOCIAL', 'GAME'].map((category) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 border-b border-zinc-800 pb-2">
                            {category === 'GYM' ? <Dumbbell className="text-red-500"/> : category === 'LOJA' ? <ShoppingBag className="text-blue-500"/> : category === 'SOCIAL' ? <Brain className="text-purple-500"/> : <Zap className="text-yellow-500"/>}
                            Regras de {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {liveRules.filter(r => r.category === category).map((rule) => (
                                <div key={rule.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition relative group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2.5 rounded-xl bg-black border border-zinc-800 ${rule.color}`}><rule.icon size={20}/></div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm uppercase">{rule.label}</h4>
                                                <p className="text-[10px] text-zinc-500">{rule.description}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <label className="text-[9px] text-zinc-500 font-bold uppercase block">XP</label>
                                            <input type="number" disabled={isArchivedView} className="bg-black border border-zinc-700 rounded-lg w-16 px-2 py-1 text-right text-emerald-400 font-bold text-sm focus:border-emerald-500 outline-none" value={rule.xpReward} onChange={(e) => handleUpdateRule(rule.id, 'xpReward', parseInt(e.target.value))}/>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 p-2 rounded-lg border border-zinc-800/50 flex justify-between items-center">
                                        <span className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">Bônus: <span className={rule.color}>{rule.statType}</span></span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] text-zinc-500">+</span>
                                            <input type="number" disabled={isArchivedView} className="bg-transparent border-b border-zinc-700 w-10 text-right text-white font-bold text-xs focus:border-white outline-none" value={rule.statReward} onChange={(e) => handleUpdateRule(rule.id, 'statReward', parseFloat(e.target.value))}/>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {!isArchivedView && (
                    <div className="fixed bottom-6 right-6 md:right-10 z-40">
                        <button onClick={handleSaveRules} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition transform hover:scale-105 flex items-center gap-3 font-bold text-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"><Save size={24} /> Salvar Alterações</button>
                    </div>
                )}
            </div>
        )}

        {/* ABA 4: HISTÓRICO */}
        {activeTab === 'historico' && (
            <div className="space-y-4">
                <div className="flex gap-4 items-center bg-zinc-900 p-4 rounded-2xl border border-zinc-800 w-full lg:w-1/2 focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/20 transition">
                    <Search size={20} className="text-zinc-500"/>
                    <input type="text" placeholder="Filtrar logs..." className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-zinc-600 font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar pb-2">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-black/60 border-b border-zinc-800 text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
                                <tr>
                                    <th className="p-5">ID</th><th className="p-5">Data</th><th className="p-5">Atacante</th><th className="p-5">Defensor</th><th className="p-5 text-emerald-500">Vencedor</th><th className="p-5 text-center">HP Restante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm">
                                {filteredLogs.length > 0 ? filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                                        <td className="p-5 font-mono text-zinc-500 text-xs">{log.id}</td>
                                        <td className="p-5 text-zinc-300">{log.date} {log.time}</td>
                                        <td className="p-5 flex items-center gap-2"><img src={log.attacker.avatar} className="w-6 h-6 rounded-full"/> {log.attacker.name}</td>
                                        <td className="p-5"><div className="flex items-center gap-2"><img src={log.defender.avatar} className="w-6 h-6 rounded-full"/> {log.defender.name}</div></td>
                                        <td className="p-5 font-bold text-emerald-400">{log.winner.name}</td>
                                        <td className="p-5 text-center font-mono text-emerald-500">{log.winnerHp}</td>
                                    </tr>
                                )) : <tr><td colSpan={6} className="p-10 text-center text-zinc-500">Nenhum log encontrado.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
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
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-[500px] shadow-lg">
            <div className="p-6 bg-black/40 border-b border-zinc-800 flex justify-between items-center"><div className="flex items-center gap-3"><div className="bg-zinc-800 p-2 rounded-lg">{icon}</div><h3 className="font-black text-white text-lg tracking-tight">{title}</h3></div></div>
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-1">{data.map((player, index) => (<Link href={`/perfil/${player.handle}`} key={player.id} className="flex items-center gap-4 p-3 hover:bg-zinc-800 rounded-2xl transition group border border-transparent hover:border-zinc-700"><div className={`w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm shrink-0 ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : index === 1 ? 'bg-zinc-500/20 text-zinc-400' : index === 2 ? 'bg-orange-700/20 text-orange-600' : 'bg-zinc-900 text-zinc-600'}`}>#{index + 1}</div><img src={player.avatar} className="w-10 h-10 rounded-full object-cover border border-zinc-700 group-hover:border-emerald-500 transition"/><div className="flex-1 min-w-0"><p className="text-sm font-bold text-zinc-200 truncate group-hover:text-white transition">{player.name}</p><p className="text-[10px] text-zinc-500 font-medium">{player.turma}</p></div><div className="text-right"><span className={`block font-black text-lg text-${color}-500`}>{player.value}</span><span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{metric}</span></div></Link>))}</div>
        </div>
    )
}

function AttributeCard({ title, icon: Icon, color, data, attr, source }: { title: string, icon: any, color: string, data: PlayerStat[], attr: string, source: string }) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-80 shadow-md hover:border-zinc-700 transition">
            <div className="p-4 bg-black/40 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2"><div className={`p-2 rounded-lg bg-zinc-950 border border-zinc-800 ${color}`}><Icon size={16} /></div><div><h3 className="font-bold text-white text-sm uppercase">{title}</h3><p className="text-[9px] text-zinc-500">Fonte: {source}</p></div></div>
                <div className={`text-xs font-black bg-zinc-950 px-2 py-1 rounded border border-zinc-800 ${color}`}>{attr}</div>
            </div>
            <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
                {data.slice(0, 5).map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 p-2 hover:bg-zinc-800/80 rounded-xl transition">
                        <span className="font-mono text-[10px] font-bold text-zinc-600 w-4">#{i+1}</span>
                        <img src={p.avatar} className="w-6 h-6 rounded-full bg-zinc-800 object-cover"/>
                        <div className="flex-1 min-w-0"><p className="text-xs font-bold text-zinc-300 truncate">{p.name}</p></div>
                        <span className={`text-xs font-black ${color}`}>{p.value}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}