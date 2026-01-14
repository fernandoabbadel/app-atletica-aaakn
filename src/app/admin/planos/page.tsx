"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Edit, Save, Plus, Trash2, CheckCircle, X, 
  LayoutDashboard, CreditCard, DollarSign, Crown, Star, Ghost, 
  Users, TrendingUp, Calendar, Search, Megaphone, Type, Sparkles, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";

// --- TIPAGEM ---
interface Plano {
    id: string;
    nome: string;
    preco: string;
    parcelamento: string;
    descricao: string;
    cor: string;
    destaque: boolean;
    beneficios: string[];
}

interface BannerConfig {
    titulo: string;
    subtitulo: string;
    cor: 'dourado' | 'esmeralda' | 'roxo' | 'fogo';
}

interface Assinatura {
    id: string;
    aluno: string;
    turma: string;
    planoId: string;
    valorPago: number;
    dataInicio: string;
    status: 'ativo' | 'vencido';
}

interface TurmaStats {
    id: string;
    nome: string;
    foto: string;
    totalSocios: number;
    planoDominante: string;
}

// --- MOCKS ---
const INITIAL_PLANOS: Plano[] = [
    {
        id: "bicho", nome: "Bicho Solto", preco: "75,00", parcelamento: "Semestral", descricao: "Básico para sobreviver.", cor: "emerald", destaque: false,
        beneficios: ["Kit: Caneca + Tirante", "Carteirinha Digital", "15% OFF na Lojinha"]
    },
    {
        id: "atleta", nome: "Atleta de Bar", preco: "160,00", parcelamento: "2x Sem Juros", descricao: "Vive a atlética.", cor: "zinc", destaque: true,
        beneficios: ["Kit: Caneca + Tirante", "Kit: Camiseta", "50% OFF em 2 festas"]
    },
    {
        id: "lenda", nome: "Lenda da JIMESP", preco: "250,00", parcelamento: "3x Sem Juros", descricao: "VIP e Jogos.", cor: "yellow", destaque: false,
        beneficios: ["Kit Completo", "Acesso VIP", "R$ 50 OFF no JIMESP"]
    }
];

const ASSINATURAS_MOCK: Assinatura[] = [
    { id: "1", aluno: "João Silva", turma: "T5", planoId: "lenda", valorPago: 250, dataInicio: "10/01/2026", status: "ativo" },
    { id: "2", aluno: "Maria Souza", turma: "T5", planoId: "atleta", valorPago: 160, dataInicio: "11/01/2026", status: "ativo" },
    { id: "3", aluno: "Pedro Santos", turma: "T4", planoId: "bicho", valorPago: 75, dataInicio: "12/01/2026", status: "ativo" },
    { id: "4", aluno: "Ana Lima", turma: "T6", planoId: "atleta", valorPago: 160, dataInicio: "09/01/2026", status: "ativo" },
    { id: "5", aluno: "Carlos Jr", turma: "T5", planoId: "lenda", valorPago: 250, dataInicio: "10/01/2026", status: "ativo" },
];

const TURMAS_MOCK: TurmaStats[] = [
    { id: "T5", nome: "Medicina T5", foto: "/turmas/t5.jpg", totalSocios: 45, planoDominante: "Lenda da JIMESP" },
    { id: "T6", nome: "Medicina T6", foto: "/turmas/t6.jpg", totalSocios: 32, planoDominante: "Atleta de Bar" },
    { id: "T4", nome: "Medicina T4", foto: "/turmas/t4.jpg", totalSocios: 15, planoDominante: "Bicho Solto" },
];

export default function AdminPlanosPage() {
  const { addToast } = useToast();
  
  // Estados
  const [activeTab, setActiveTab] = useState<"dashboard" | "config" | "marketing">("dashboard");
  const [planos, setPlanos] = useState<Plano[]>(INITIAL_PLANOS);
  const [editingPlan, setEditingPlan] = useState<Plano | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ESTADO DO BANNER (MARKETING)
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({
      titulo: "VIRE TUBARÃO REI",
      subtitulo: "Domine o Oceano & Os Rolês",
      cor: 'dourado'
  });

  // --- LÓGICA DO DASHBOARD ---
  const totalFaturamento = ASSINATURAS_MOCK.reduce((acc, curr) => acc + curr.valorPago, 0);
  const totalSocios = ASSINATURAS_MOCK.length;
  
  const statsPorPlano = planos.map(plano => {
      const subs = ASSINATURAS_MOCK.filter(s => s.planoId === plano.id);
      const total = subs.reduce((acc, curr) => acc + curr.valorPago, 0);
      return { ...plano, qtd: subs.length, receita: total };
  });

  // --- HANDLERS ---
  const handleCreate = () => {
      setEditingPlan({ 
          id: "", nome: "", preco: "", parcelamento: "", descricao: "", 
          cor: "zinc", destaque: false, beneficios: ["Novo Benefício"] 
      });
      setIsModalOpen(true);
  };

  const handleEdit = (plano: Plano) => {
      setEditingPlan({ ...plano });
      setIsModalOpen(true);
  };

  const handleSave = () => {
      if (!editingPlan) return;
      if (editingPlan.id === "") {
          const newPlan = { ...editingPlan, id: Date.now().toString() };
          setPlanos([...planos, newPlan]);
          addToast("Novo plano criado!", "success");
      } else {
          setPlanos(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
          addToast("Plano atualizado!", "success");
      }
      setIsModalOpen(false);
  };

  const handleSaveBanner = () => {
      // Aqui você salvaria no Firebase
      addToast("Botão de Sócio atualizado no App!", "success");
  };

  const handleBenefitChange = (index: number, value: string) => {
      if (!editingPlan) return;
      const newBenefits = [...editingPlan.beneficios];
      newBenefits[index] = value;
      setEditingPlan({ ...editingPlan, beneficios: newBenefits });
  };

  const addBenefit = () => {
      if (!editingPlan) return;
      setEditingPlan({ ...editingPlan, beneficios: [...editingPlan.beneficios, "Novo Benefício"] });
  };

  const removeBenefit = (index: number) => {
      if (!editingPlan) return;
      const newBenefits = editingPlan.beneficios.filter((_, i) => i !== index);
      setEditingPlan({ ...editingPlan, beneficios: newBenefits });
  };

  // Helper para renderizar o preview do botão
  const getBannerStyles = (cor: string) => {
      switch(cor) {
          case 'dourado': return { gradient: "from-yellow-600 via-amber-500 to-yellow-600", border: "border-yellow-400/50", shadow: "shadow-[0_0_25px_rgba(234,179,8,0.4)]" };
          case 'esmeralda': return { gradient: "from-emerald-600 via-green-500 to-emerald-600", border: "border-emerald-400/50", shadow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]" };
          case 'roxo': return { gradient: "from-purple-600 via-indigo-500 to-purple-600", border: "border-purple-400/50", shadow: "shadow-[0_0_25px_rgba(147,51,234,0.4)]" };
          case 'fogo': return { gradient: "from-red-600 via-orange-500 to-red-600", border: "border-orange-400/50", shadow: "shadow-[0_0_25px_rgba(249,115,22,0.4)]" };
          default: return { gradient: "from-zinc-600 via-zinc-500 to-zinc-600", border: "border-zinc-400/50", shadow: "" };
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2"><CreditCard className="text-emerald-500" /> Gestão de Planos</h1><p className="text-[11px] text-zinc-500 font-medium">Financeiro & Sócios</p></div>
        </div>
        <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg"><Plus size={16} /> Novo Plano</button>
      </header>

      {/* ABAS */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto">
              <button onClick={() => setActiveTab("dashboard")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "dashboard" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}><LayoutDashboard size={16}/> Dashboard</button>
              <button onClick={() => setActiveTab("config")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "config" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}><Edit size={16}/> Configurar Planos</button>
              <button onClick={() => setActiveTab("marketing")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === "marketing" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}><Megaphone size={16}/> Marketing Botão</button>
          </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- ABA DASHBOARD --- */}
        {activeTab === "dashboard" && (
            <div className="space-y-8">
                {/* KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Faturamento Total</p><h3 className="text-3xl font-black text-white mt-1">R$ {totalFaturamento}</h3></div>
                        <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-500"><DollarSign size={28}/></div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Total Sócios</p><h3 className="text-3xl font-black text-white mt-1">{totalSocios}</h3></div>
                        <div className="bg-blue-500/20 p-3 rounded-xl text-blue-500"><Users size={28}/></div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Ticket Médio</p><h3 className="text-3xl font-black text-white mt-1">R$ {(totalFaturamento/totalSocios).toFixed(2)}</h3></div>
                        <div className="bg-yellow-500/20 p-3 rounded-xl text-yellow-500"><TrendingUp size={28}/></div>
                    </div>
                </div>

                {/* TURMAS */}
                <div>
                    <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Crown size={16} className="text-yellow-500"/> Performance por Turma</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TURMAS_MOCK.map(turma => (
                            <div key={turma.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/50 transition group">
                                <div className="w-16 h-16 rounded-xl bg-black overflow-hidden border border-zinc-700 shrink-0 relative">
                                    <img src={turma.foto} alt={turma.nome} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition"/>
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white/50 group-hover:opacity-0">{turma.id}</div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{turma.nome}</h4>
                                    <p className="text-xs text-zinc-500">{turma.totalSocios} Sócios Ativos</p>
                                    <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/50 mt-1 inline-block">Dominante: {turma.planoDominante}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TABELA */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="p-5 border-b border-zinc-800 bg-black/20 flex justify-between items-center">
                        <h3 className="text-sm font-bold text-white flex items-center gap-2"><Calendar size={16} className="text-zinc-400"/> Histórico de Assinaturas</h3>
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input type="text" placeholder="Buscar aluno..." className="bg-zinc-800 border border-zinc-700 rounded-full pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-black/40 text-zinc-500 text-[10px] font-bold uppercase"><tr><th className="p-4">Aluno</th><th className="p-4">Turma</th><th className="p-4">Plano</th><th className="p-4">Valor</th><th className="p-4 text-right">Data Início</th></tr></thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                                {ASSINATURAS_MOCK.filter(s => s.aluno.toLowerCase().includes(searchTerm.toLowerCase())).map((sub) => (
                                    <tr key={sub.id} className="hover:bg-zinc-800/30 transition">
                                        <td className="p-4 font-bold text-white">{sub.aluno}</td>
                                        <td className="p-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs font-bold">{sub.turma}</span></td>
                                        <td className="p-4">{sub.planoId}</td>
                                        <td className="p-4 text-emerald-400 font-mono">R$ {sub.valorPago}</td>
                                        <td className="p-4 text-right text-zinc-500 text-xs">{sub.dataInicio}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- ABA MARKETING (NOVA) --- */}
        {activeTab === "marketing" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* EDITOR */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                        <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><Megaphone size={16} className="text-emerald-500"/> Configurar Botão de Venda</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2"><Type size={12}/> Título de Impacto</label>
                                <input 
                                    type="text" 
                                    className="input-admin text-lg font-black uppercase text-yellow-500" 
                                    value={bannerConfig.titulo} 
                                    onChange={e => setBannerConfig({...bannerConfig, titulo: e.target.value})}
                                    maxLength={20}
                                />
                                <p className="text-[10px] text-zinc-600 mt-1 text-right">{bannerConfig.titulo.length}/20</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2"><Sparkles size={12}/> Subtítulo Persuasivo</label>
                                <input 
                                    type="text" 
                                    className="input-admin" 
                                    value={bannerConfig.subtitulo} 
                                    onChange={e => setBannerConfig({...bannerConfig, subtitulo: e.target.value})}
                                    maxLength={30}
                                />
                                <p className="text-[10px] text-zinc-600 mt-1 text-right">{bannerConfig.subtitulo.length}/30</p>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Tema Visual</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['dourado', 'esmeralda', 'roxo', 'fogo'] as const).map(cor => (
                                        <button 
                                            key={cor}
                                            onClick={() => setBannerConfig({...bannerConfig, cor})}
                                            className={`h-10 rounded-xl border-2 transition capitalize text-xs font-bold ${bannerConfig.cor === cor ? 'border-white scale-105' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            style={{background: cor === 'dourado' ? '#eab308' : cor === 'esmeralda' ? '#10b981' : cor === 'roxo' ? '#9333ea' : '#ef4444'}}
                                        >
                                            {cor}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                            <button onClick={handleSaveBanner} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-xs uppercase shadow-lg transition active:scale-95">
                                <Save size={16}/> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>

                {/* PREVIEW */}
                <div className="bg-[#09090b] border border-zinc-800 rounded-[2.5rem] p-4 shadow-2xl relative max-w-sm mx-auto w-full">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black px-4 py-1 rounded-b-xl text-[10px] font-bold text-zinc-500 border border-zinc-800 border-t-0">LIVE PREVIEW</div>
                    
                    <div className="mt-8 space-y-4 px-2">
                        {/* Simulação da Sidebar */}
                        <div className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-zinc-800"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-2 w-20 bg-zinc-800 rounded full"></div>
                                <div className="h-2 w-10 bg-zinc-800 rounded full"></div>
                            </div>
                        </div>

                        {/* O BOTÃO REAL */}
                        <div className="py-2">
                            <p className="text-[10px] text-zinc-500 text-center mb-2 uppercase tracking-widest">Assim que o aluno vê:</p>
                            
                            <button className={`w-full group relative overflow-hidden rounded-2xl transition-all shadow-xl border ${getBannerStyles(bannerConfig.cor).border} ${getBannerStyles(bannerConfig.cor).shadow}`}>
                                <div className={`absolute inset-0 bg-gradient-to-r ${getBannerStyles(bannerConfig.cor).gradient} opacity-100`}></div>
                                <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] animate-[shine_2s_infinite]"></div>

                                <div className="relative p-4 flex items-center justify-between z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/20 shadow-inner">
                                            <Crown size={20} className="text-white drop-shadow-md" />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-black uppercase leading-none drop-shadow-md text-white">{bannerConfig.titulo}</h4>
                                            <p className="text-[10px] font-bold opacity-90 mt-1 drop-shadow-sm text-white">{bannerConfig.subtitulo}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-white drop-shadow-md" />
                                </div>
                            </button>
                        </div>

                        {/* Resto da lista simulada */}
                        {[1,2,3].map(i => (
                            <div key={i} className="h-10 w-full bg-zinc-900/50 rounded-xl border border-zinc-800/50 opacity-30"></div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* --- ABA CONFIG (CRUD PLANOS) --- */}
        {activeTab === "config" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planos.map(plano => (
                    <div key={plano.id} className={`bg-zinc-900 border rounded-3xl p-6 flex flex-col relative overflow-hidden transition ${plano.cor === 'yellow' ? 'border-yellow-500/30' : plano.cor === 'zinc' ? 'border-zinc-500/30' : 'border-emerald-500/30'}`}>
                        <div className="mb-4">
                            <h2 className="text-xl font-black uppercase">{plano.nome}</h2>
                            <p className="text-xs text-zinc-400 mt-1">{plano.descricao}</p>
                        </div>
                        <div className="mb-6"><span className="text-xs text-zinc-500 font-bold uppercase">Valor</span><div className="flex items-end gap-1"><span className="text-sm font-bold text-zinc-400 mb-1">R$</span><span className="text-3xl font-black text-white">{plano.preco}</span></div></div>
                        <div className="flex gap-2 mt-auto">
                            <button onClick={() => handleEdit(plano)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl uppercase text-xs transition flex items-center justify-center gap-2"><Edit size={14}/> Editar</button>
                            <button onClick={() => {if(confirm('Excluir plano?')) setPlanos(prev => prev.filter(p => p.id !== plano.id))}} className="bg-red-900/20 text-red-500 px-4 rounded-xl hover:bg-red-900/40"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO (MANTIDO IGUAL) */}
      {isModalOpen && editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                  <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-2">{editingPlan.id ? "Editar Plano" : "Criar Novo Plano"}</h2>
                  <div className="space-y-4">
                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Nome</label><input type="text" className="input-admin" value={editingPlan.nome} onChange={e => setEditingPlan({...editingPlan, nome: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Preço</label><input type="text" className="input-admin" value={editingPlan.preco} onChange={e => setEditingPlan({...editingPlan, preco: e.target.value})}/></div>
                          <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Parcelas</label><input type="text" className="input-admin" value={editingPlan.parcelamento} onChange={e => setEditingPlan({...editingPlan, parcelamento: e.target.value})}/></div>
                      </div>
                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Descrição</label><textarea rows={2} className="input-admin" value={editingPlan.descricao} onChange={e => setEditingPlan({...editingPlan, descricao: e.target.value})}/></div>
                      
                      <div className="bg-black/30 p-4 rounded-xl border border-zinc-800">
                          <div className="flex justify-between items-center mb-2"><label className="text-[10px] font-bold text-zinc-500 uppercase">Benefícios</label><button onClick={addBenefit} className="text-[10px] bg-emerald-900/30 text-emerald-500 px-2 py-1 rounded hover:bg-emerald-900/50">+ Adicionar</button></div>
                          <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                              {editingPlan.beneficios.map((ben, i) => (
                                  <div key={i} className="flex gap-2"><input type="text" className="input-admin py-2 text-xs" value={ben} onChange={(e) => handleBenefitChange(i, e.target.value)}/><button onClick={() => removeBenefit(i)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button></div>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase">Cancelar</button>
                      <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2"><CheckCircle size={16}/> Salvar</button>
                  </div>
              </div>
          </div>
      )}

      <style jsx global>{`
        .input-admin { width: 100%; background: #000; border: 1px solid #27272a; border-radius: 0.5rem; padding: 0.75rem; color: white; outline: none; transition: border-color 0.2s; font-size: 0.875rem; }
        .input-admin:focus { border-color: #10b981; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #18181b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
      `}</style>
    </div>
  );
}