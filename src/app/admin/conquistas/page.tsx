"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  Trophy,
  Medal,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  Target,
  Zap,
  Filter,
  Users,
  TrendingUp,
  Award,
  Crown,
  History,
  Calendar,
  Clock,
  ExternalLink,
  MoreHorizontal,
  FolderPlus,
  X
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";

// ============================================================================
// 1. DADOS MOCKADOS (O BANCO DE DADOS SIMULADO)
// ============================================================================

// Tipos de Conquistas (O Catálogo)
const INITIAL_ACHIEVEMENTS = [
    { id: 1, titulo: "Primeiro Mergulho", desc: "Criou a conta no App.", cat: "Social", xp: 10, target: 1 },
    { id: 2, titulo: "Influencer", desc: "Teve 50 likes em posts.", cat: "Social", xp: 500, target: 50 },
    { id: 5, titulo: "Gym Rat I", desc: "5 treinos na semana.", cat: "Gym", xp: 200, target: 5 },
    { id: 9, titulo: "Gladiador", desc: "Venceu 10 batalhas PVP.", cat: "Games", xp: 500, target: 10 },
    { id: 14, titulo: "Patrocinador", desc: "Gastou 5000 XP na loja.", cat: "Loja", xp: 500, target: 5000 },
    { id: 18, titulo: "Inimigo do Fim", desc: "Check-in em 3 festas seguidas.", cat: "Eventos", xp: 300, target: 3 },
    { id: 6, titulo: "MEGALODON", desc: "Atingiu o nível máximo.", cat: "Geral", xp: 10000, target: 1 },
];

// Log de Conquistas Desbloqueadas (Histórico Real)
const MOCK_UNLOCK_LOGS = [
    { id: 101, userId: "u1", userName: "Mariana S.", userAvatar: "https://i.pravatar.cc/150?u=mari", turma: "T1", achievementId: 1, achievementTitle: "Primeiro Mergulho", xp: 10, date: "2024-02-10", time: "14:30" },
    { id: 102, userId: "u2", userName: "João Silva", userAvatar: "https://i.pravatar.cc/150?u=joao", turma: "T2", achievementId: 1, achievementTitle: "Primeiro Mergulho", xp: 10, date: "2024-02-11", time: "09:15" },
    { id: 103, userId: "u1", userName: "Mariana S.", userAvatar: "https://i.pravatar.cc/150?u=mari", turma: "T1", achievementId: 5, achievementTitle: "Gym Rat I", xp: 200, date: "2024-02-15", time: "18:45" },
    { id: 104, userId: "u3", userName: "Pedro H.", userAvatar: "https://i.pravatar.cc/150?u=pedro", turma: "T1", achievementId: 9, achievementTitle: "Gladiador", xp: 500, date: "2024-02-20", time: "22:10" },
    { id: 105, userId: "u2", userName: "João Silva", userAvatar: "https://i.pravatar.cc/150?u=joao", turma: "T2", achievementId: 5, achievementTitle: "Gym Rat I", xp: 200, date: "2024-02-21", time: "07:30" },
    { id: 106, userId: "u4", userName: "Ana Clara", userAvatar: "https://i.pravatar.cc/150?u=ana", turma: "T3", achievementId: 1, achievementTitle: "Primeiro Mergulho", xp: 10, date: "2024-02-22", time: "11:00" },
    { id: 107, userId: "u1", userName: "Mariana S.", userAvatar: "https://i.pravatar.cc/150?u=mari", turma: "T1", achievementId: 2, achievementTitle: "Influencer", xp: 500, date: "2024-02-25", time: "15:20" },
];

// Níveis de Patente
const INITIAL_BADGES = [
    { id: 1, titulo: "Plâncton", minXp: 0, cor: "text-zinc-400" },
    { id: 2, titulo: "Peixe Palhaço", minXp: 1000, cor: "text-orange-400" },
    { id: 3, titulo: "Barracuda", minXp: 5000, cor: "text-blue-400" },
    { id: 4, titulo: "Tubarão Martelo", minXp: 15000, cor: "text-purple-400" },
    { id: 5, titulo: "Tubarão Branco", minXp: 50000, cor: "text-emerald-400" },
    { id: 6, titulo: "MEGALODON", minXp: 100000, cor: "text-red-600" },
];

// Categorias
const INITIAL_CATEGORIES = ["Geral", "Gym", "Games", "Social", "Eventos", "Loja"];

// ============================================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminConquistasPage() {
  const { addToast } = useToast();
  
  // Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "conquistas" | "historico" | "patentes">("dashboard");

  // Estados de Dados
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [badges, setBadges] = useState(INITIAL_BADGES);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [logs, setLogs] = useState(MOCK_UNLOCK_LOGS);

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState(""); // Busca dentro do modal de usuários

  // Modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  
  // Modal de Detalhes (Lista de Usuários)
  const [selectedAchievementId, setSelectedAchievementId] = useState<number | null>(null);

  // Formulários Temporários
  const [newItem, setNewItem] = useState({ titulo: "", desc: "", cat: "Geral", xp: "", target: "" });
  const [newCategory, setNewCategory] = useState("");
  const [newBadge, setNewBadge] = useState({ titulo: "", minXp: "", cor: "text-zinc-400" });

  // --- CÁLCULOS & LOGS ---

  // 1. Ranking de Turmas
  const classRanking = useMemo(() => {
    const ranking: Record<string, number> = {};
    logs.forEach(log => {
      ranking[log.turma] = (ranking[log.turma] || 0) + 1; // Conta desbloqueios
      // Ou poderia somar XP: ranking[log.turma] = (ranking[log.turma] || 0) + log.xp;
    });
    return Object.entries(ranking)
      .sort(([,a], [,b]) => b - a) // Maior para menor
      .map(([turma, count]) => ({ turma, count }));
  }, [logs]);

  // 2. Conquistas com Contagem de Usuários (Ordenadas pela mais recente desbloqueada globalmente)
  const achievementsWithStats = useMemo(() => {
    return achievements.map(ach => {
        const achLogs = logs.filter(l => l.achievementId === ach.id);
        const count = achLogs.length;
        // Pega a data mais recente desse log, se existir
        const lastUnlock = achLogs.length > 0 
            ? achLogs.sort((a,b) => new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime())[0].date 
            : "0000-00-00";
            
        return { ...ach, count, lastUnlock, unlockers: achLogs };
    }).sort((a,b) => b.lastUnlock.localeCompare(a.lastUnlock)); // Ordena por data (string yyyy-mm-dd funciona)
  }, [achievements, logs]);

  // --- AÇÕES ---

  const handleAddAchievement = () => {
      if(!newItem.titulo || !newItem.xp) return addToast("Preencha os dados!", "error");
      setAchievements([...achievements, {
          id: Date.now(),
          titulo: newItem.titulo,
          desc: newItem.desc,
          cat: newItem.cat,
          xp: Number(newItem.xp),
          target: Number(newItem.target)
      }]);
      setShowCreateModal(false);
      setNewItem({ titulo: "", desc: "", cat: "Geral", xp: "", target: "" });
      addToast("Conquista criada!", "success");
  };

  const handleDeleteAchievement = (id: number) => {
      if(confirm("Tem certeza? Isso apaga a conquista do catálogo (o histórico permanece).")) {
          setAchievements(achievements.filter(a => a.id !== id));
          addToast("Conquista removida do catálogo.", "info");
      }
  };

  const handleAddCategory = () => {
      if(!newCategory) return;
      if(categories.includes(newCategory)) return addToast("Categoria já existe!", "error");
      setCategories([...categories, newCategory]);
      setShowCategoryModal(false);
      setNewCategory("");
      addToast("Categoria adicionada!", "success");
  };

  const handleAddBadge = () => {
      if(!newBadge.titulo || !newBadge.minXp) return addToast("Preencha titulo e XP!", "error");
      setBadges([...badges, { id: Date.now(), titulo: newBadge.titulo, minXp: Number(newBadge.minXp), cor: newBadge.cor }].sort((a,b) => a.minXp - b.minXp));
      setShowBadgeModal(false);
      setNewBadge({ titulo: "", minXp: "", cor: "text-zinc-400" });
      addToast("Patente criada!", "success");
  };

  const handleUpdateBadge = (id: number, field: string, value: any) => {
    setBadges(badges.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  // Filtragem
  const filteredAchievementsList = achievementsWithStats.filter(a => 
      a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition border border-zinc-800">
                <ArrowLeft size={20} className="text-zinc-400" />
            </Link>
            <div>
                <h1 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    Gestão de Conquistas
                </h1>
                <p className="text-[10px] text-zinc-500">Estatísticas e Configuração</p>
            </div>
        </div>
        
        <div className="flex gap-2">
            {activeTab === 'conquistas' && (
                <>
                    <button onClick={() => setShowCategoryModal(true)} className="bg-zinc-800 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-zinc-700 transition border border-zinc-700">
                        <FolderPlus size={16} /> Categoria
                    </button>
                    <button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                        <Plus size={16} /> Nova Conquista
                    </button>
                </>
            )}
            {activeTab === 'patentes' && (
                 <button onClick={() => setShowBadgeModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-purple-500 transition shadow-[0_0_15px_rgba(147,51,234,0.3)]">
                    <Plus size={16} /> Nova Patente
                </button>
            )}
        </div>
      </header>

      {/* TABS */}
      <div className="px-6 pt-4">
          <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab("dashboard")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><LayoutDashboard size={16}/> Hall da Fama</button>
              <button onClick={() => setActiveTab("conquistas")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'conquistas' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><Trophy size={16}/> Catálogo</button>
              <button onClick={() => setActiveTab("historico")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'historico' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><History size={16}/> Histórico</button>
              <button onClick={() => setActiveTab("patentes")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'patentes' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><Medal size={16}/> Patentes</button>
          </div>
      </div>

      <main className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* ==================================================================================== */}
        {/* ABA 1: DASHBOARD (STATS REAIS) */}
        {/* ==================================================================================== */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. KPI Cards */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110"><Trophy size={60}/></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase">Conquistas Desbloqueadas (Total)</span>
                        </div>
                        <span className="text-4xl font-black text-white">{logs.length}</span>
                        <p className="text-xs text-emerald-500 mt-1 font-bold">+12 hoje</p>
                    </div>

                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110"><Zap size={60}/></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase">XP Distribuído</span>
                        </div>
                        <span className="text-4xl font-black text-white">{logs.reduce((acc, l) => acc + l.xp, 0).toLocaleString()}</span>
                    </div>

                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition transform group-hover:scale-110"><Target size={60}/></div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-zinc-500 text-[10px] font-bold uppercase">Conquistas no Catálogo</span>
                        </div>
                        <span className="text-4xl font-black text-white">{achievements.length}</span>
                    </div>
                </div>

                {/* 2. Lista de Conquistas (Ranking de Popularidade/Recência) */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden lg:col-span-2 flex flex-col h-[500px]">
                    <div className="p-5 border-b border-zinc-800 bg-black/20 sticky top-0 backdrop-blur-sm z-10">
                        <h3 className="font-bold text-white flex items-center gap-2"><Award size={18} className="text-emerald-500"/> Ranking de Conquistas (Por Desbloqueios)</h3>
                        <p className="text-[10px] text-zinc-500">Ordenado pelas que tiveram atividade mais recente</p>
                    </div>
                    <div className="overflow-y-auto p-2 space-y-2 custom-scrollbar flex-1">
                        {achievementsWithStats.map((item, i) => (
                            <button 
                                key={item.id} 
                                onClick={() => { setSelectedAchievementId(item.id); }}
                                className="w-full text-left bg-black/40 hover:bg-zinc-800 p-3 rounded-xl border border-zinc-800/50 hover:border-emerald-500/50 transition flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-400 group-hover:text-emerald-400 font-black text-xs">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-white group-hover:text-emerald-400 transition">{item.titulo}</p>
                                        <div className="flex gap-2 items-center">
                                            <span className="text-[10px] text-zinc-500">{item.cat}</span>
                                            {item.lastUnlock !== "0000-00-00" && (
                                                <span className="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400">Última: {item.lastUnlock}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-white text-lg">{item.count}</span>
                                    <span className="text-[9px] text-zinc-600 uppercase font-bold">Usuários</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 3. Ranking de Turmas */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden h-[500px] flex flex-col">
                    <div className="p-5 border-b border-zinc-800 bg-black/20">
                        <h3 className="font-bold text-white flex items-center gap-2"><Crown size={18} className="text-yellow-500"/> Top Turmas</h3>
                        <p className="text-[10px] text-zinc-500">Turmas com mais conquistas</p>
                    </div>
                    <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1">
                        {classRanking.map((rank, index) => (
                            <div key={rank.turma} className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-zinc-800">
                                <div className="flex items-center gap-3">
                                    {index === 0 && <Crown size={14} className="text-yellow-500"/>}
                                    {index === 1 && <Medal size={14} className="text-zinc-400"/>}
                                    {index === 2 && <Medal size={14} className="text-amber-700"/>}
                                    <span className={`font-black ${index < 3 ? 'text-white' : 'text-zinc-500'}`}>{index + 1}º</span>
                                    <span className="font-bold text-white text-sm">Turma {rank.turma}</span>
                                </div>
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{rank.count} un.</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 2: LISTA DE CONQUISTAS (CRUD) */}
        {/* ==================================================================================== */}
        {activeTab === 'conquistas' && (
            <div className="space-y-4">
                {/* Filtro */}
                <div className="flex gap-4 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800 w-full md:w-1/2">
                    <Search size={18} className="text-zinc-500"/>
                    <input 
                        type="text" 
                        placeholder="Buscar conquista por nome ou categoria..." 
                        className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-zinc-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredAchievementsList.map(item => (
                        <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition relative overflow-hidden">
                            <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center border border-zinc-800 shrink-0">
                                <Award className="text-emerald-500"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-white text-sm truncate">{item.titulo}</h4>
                                    <span className="text-[10px] font-black text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded border border-yellow-500/20">{item.xp} XP</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{item.desc}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 border border-zinc-700 uppercase font-bold">{item.cat}</span>
                                    <span className="text-[9px] text-zinc-500 flex items-center gap-1"><Target size={10}/> Meta: {item.target}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => addToast("Edição em breve (Backend)", "info")} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-400"><Edit2 size={14}/></button>
                                <button onClick={() => handleDeleteAchievement(item.id)} className="p-1.5 bg-zinc-800 hover:bg-red-900/50 hover:text-red-500 rounded text-zinc-400"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 3: HISTÓRICO (LOG COMPLETO) */}
        {/* ==================================================================================== */}
        {activeTab === 'historico' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col h-[70vh]">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                    <h3 className="font-bold text-white flex items-center gap-2"><History size={18} className="text-emerald-500"/> Log de Desbloqueios</h3>
                    <span className="text-xs text-zinc-500 bg-black/50 px-2 py-1 rounded border border-zinc-800">{logs.length} Registros</span>
                </div>
                
                {/* Tabela com Scroll Lateral e Header Fixo */}
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-black/50 sticky top-0 z-10 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-zinc-800">ID Log</th>
                                <th className="p-4 border-b border-zinc-800">Data</th>
                                <th className="p-4 border-b border-zinc-800">Hora</th>
                                <th className="p-4 border-b border-zinc-800">Usuário</th>
                                <th className="p-4 border-b border-zinc-800">Turma</th>
                                <th className="p-4 border-b border-zinc-800">Conquista</th>
                                <th className="p-4 border-b border-zinc-800 text-right">XP</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-zinc-800">
                            {logs.sort((a,b) => b.id - a.id).map(log => (
                                <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                                    <td className="p-4 text-zinc-600 font-mono text-xs">#{log.id}</td>
                                    <td className="p-4 text-zinc-400 text-xs"><div className="flex items-center gap-1"><Calendar size={12}/> {log.date}</div></td>
                                    <td className="p-4 text-zinc-400 text-xs"><div className="flex items-center gap-1"><Clock size={12}/> {log.time}</div></td>
                                    <td className="p-4">
                                        <Link href={`/admin/alunos/${log.userId}`} className="flex items-center gap-2 hover:text-emerald-400 transition group">
                                            <img src={log.userAvatar} className="w-6 h-6 rounded-full border border-zinc-700"/>
                                            <span className="font-bold text-white group-hover:underline underline-offset-4">{log.userName}</span>
                                            <ExternalLink size={10} className="opacity-0 group-hover:opacity-100"/>
                                        </Link>
                                    </td>
                                    <td className="p-4 text-zinc-400 text-xs"><span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">{log.turma}</span></td>
                                    <td className="p-4 font-medium text-white">{log.achievementTitle}</td>
                                    <td className="p-4 text-right font-black text-emerald-500">+{log.xp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 4: NÍVEIS & PATENTES (CONFIG) */}
        {/* ==================================================================================== */}
        {activeTab === 'patentes' && (
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex gap-3 items-center">
                    <TrendingUp size={20} className="text-emerald-500"/>
                    <div>
                        <h4 className="font-bold text-white text-sm">Escada de Evolução</h4>
                        <p className="text-xs text-zinc-500">Defina o XP necessário para alcançar cada patente.</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {badges.map((badge, index) => (
                        <div key={badge.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden group">
                            {/* Linha de conexão visual */}
                            {index !== badges.length - 1 && (
                                <div className="absolute left-[26px] top-12 bottom-0 w-0.5 bg-zinc-800 -z-10 group-hover:bg-emerald-900/50 transition"></div>
                            )}

                            <div className="w-8 h-8 rounded-full bg-black border-2 border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-500 z-10 shrink-0">
                                {index + 1}
                            </div>

                            <div className="flex-1">
                                <h3 className={`font-black text-sm uppercase ${badge.cor}`}>{badge.titulo}</h3>
                                <p className="text-[10px] text-zinc-500">Nível {index + 1}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="text-[9px] font-bold text-zinc-500 uppercase">XP Mínimo</label>
                                <input 
                                    type="number" 
                                    value={badge.minXp} 
                                    onChange={(e) => handleUpdateBadge(badge.id, 'minXp', Number(e.target.value))}
                                    className="bg-black border border-zinc-700 rounded-lg w-24 py-2 px-3 text-right text-emerald-400 font-bold focus:border-emerald-500 outline-none text-sm"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={() => addToast("Patentes salvas!", "success")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/10 flex items-center gap-2">
                        <Save size={18}/> Salvar Patentes
                    </button>
                </div>
            </div>
        )}

      </main>

      {/* ==================================================================================== */}
      {/* MODAL 1: CRIAR NOVA CONQUISTA */}
      {/* ==================================================================================== */}
      {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2"><Trophy className="text-emerald-500"/> Criar Conquista</h3>
                    <button onClick={() => setShowCreateModal(false)}><X className="text-zinc-500 hover:text-white"/></button>
                  </div>
                  
                  <div className="space-y-3">
                      <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Título</label>
                          <input type="text" placeholder="Ex: Rei do Camarote" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" value={newItem.titulo} onChange={e => setNewItem({...newItem, titulo: e.target.value})}/>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Descrição</label>
                          <input type="text" placeholder="Ex: Compareça a 5 festas" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})}/>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                          <div>
                              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">XP</label>
                              <input type="number" placeholder="500" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" value={newItem.xp} onChange={e => setNewItem({...newItem, xp: e.target.value})}/>
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Meta</label>
                              <input type="number" placeholder="5" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" value={newItem.target} onChange={e => setNewItem({...newItem, target: e.target.value})}/>
                          </div>
                      </div>

                      <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Categoria</label>
                          <select 
                            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none text-sm"
                            value={newItem.cat}
                            onChange={e => setNewItem({...newItem, cat: e.target.value})}
                          >
                              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          </select>
                      </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                      <button onClick={handleAddAchievement} className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold uppercase text-xs hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition">Criar</button>
                  </div>
              </div>
          </div>
      )}

      {/* ==================================================================================== */}
      {/* MODAL 2: CRIAR CATEGORIA */}
      {/* ==================================================================================== */}
      {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><FolderPlus className="text-zinc-400"/> Nova Categoria</h3>
                        <button onClick={() => setShowCategoryModal(false)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Nome da Categoria</label>
                        <input type="text" placeholder="Ex: Acadêmico" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" value={newCategory} onChange={e => setNewCategory(e.target.value)}/>
                    </div>
                    <button onClick={handleAddCategory} className="w-full py-3.5 rounded-xl bg-zinc-100 text-black font-bold uppercase text-xs hover:bg-white transition">Adicionar</button>
               </div>
          </div>
      )}

      {/* ==================================================================================== */}
      {/* MODAL 3: CRIAR PATENTE */}
      {/* ==================================================================================== */}
      {showBadgeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2"><Medal className="text-purple-500"/> Nova Patente</h3>
                        <button onClick={() => setShowBadgeModal(false)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Título</label>
                            <input type="text" placeholder="Ex: Tubarão Rei" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none" value={newBadge.titulo} onChange={e => setNewBadge({...newBadge, titulo: e.target.value})}/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">XP Mínimo</label>
                            <input type="number" placeholder="200000" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none" value={newBadge.minXp} onChange={e => setNewBadge({...newBadge, minXp: e.target.value})}/>
                        </div>
                         <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">Cor (Classe Tailwind)</label>
                          <select 
                            className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-purple-500 outline-none text-sm"
                            value={newBadge.cor}
                            onChange={e => setNewBadge({...newBadge, cor: e.target.value})}
                          >
                              <option value="text-zinc-400">Cinza</option>
                              <option value="text-orange-400">Laranja</option>
                              <option value="text-blue-400">Azul</option>
                              <option value="text-purple-400">Roxo</option>
                              <option value="text-emerald-400">Verde</option>
                              <option value="text-red-600">Vermelho</option>
                              <option value="text-yellow-400">Amarelo (Gold)</option>
                          </select>
                      </div>
                    </div>
                    <button onClick={handleAddBadge} className="w-full py-3.5 rounded-xl bg-purple-600 text-white font-bold uppercase text-xs hover:bg-purple-500 transition shadow-lg shadow-purple-500/20">Criar Patente</button>
               </div>
          </div>
      )}

      {/* ==================================================================================== */}
      {/* MODAL 4: DETALHES DA CONQUISTA (LISTA DE USUÁRIOS) */}
      {/* ==================================================================================== */}
      {selectedAchievementId !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                
                {/* Header do Modal */}
                <div className="p-6 border-b border-zinc-800 bg-black/20 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Trophy className="text-emerald-500" />
                            {achievements.find(a => a.id === selectedAchievementId)?.titulo}
                        </h2>
                        <p className="text-xs text-zinc-500 mt-1">{achievements.find(a => a.id === selectedAchievementId)?.desc}</p>
                    </div>
                    <button onClick={() => { setSelectedAchievementId(null); setUserSearchTerm(""); }} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20} className="text-zinc-400"/></button>
                </div>

                {/* Busca Interna */}
                <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
                    <div className="flex items-center bg-black border border-zinc-800 rounded-xl p-3">
                        <Search size={16} className="text-zinc-500 mr-2"/>
                        <input 
                            type="text" 
                            placeholder="Buscar aluno..." 
                            className="bg-transparent outline-none text-sm text-white w-full"
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Lista de Usuários */}
                <div className="overflow-y-auto flex-1 p-4 custom-scrollbar space-y-2">
                    {logs
                        .filter(l => l.achievementId === selectedAchievementId)
                        .filter(l => l.userName.toLowerCase().includes(userSearchTerm.toLowerCase()))
                        .map(log => (
                            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800 hover:border-emerald-500/30 transition group">
                                <div className="flex items-center gap-3">
                                    <img src={log.userAvatar} className="w-10 h-10 rounded-full border border-zinc-700"/>
                                    <div>
                                        <Link href={`/admin/alunos/${log.userId}`} className="font-bold text-sm text-white hover:text-emerald-400 transition flex items-center gap-1">
                                            {log.userName}
                                            <ExternalLink size={10} className="opacity-50"/>
                                        </Link>
                                        <p className="text-[10px] text-zinc-500">Turma {log.turma}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 justify-end"><Calendar size={10}/> {log.date}</div>
                                    <div className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end"><Clock size={10}/> {log.time}</div>
                                </div>
                            </div>
                        ))
                    }
                    {logs.filter(l => l.achievementId === selectedAchievementId).length === 0 && (
                        <div className="text-center py-10 text-zinc-500 text-sm">Nenhum aluno conquistou isso ainda.</div>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
}