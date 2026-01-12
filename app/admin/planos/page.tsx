"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Edit, Save, Plus, Trash2, CheckCircle, X, 
  LayoutDashboard, CreditCard, DollarSign, Crown, Star, Ghost, 
  Users, TrendingUp, Calendar, Search, Image as ImageIcon 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// --- TIPAGEM ---
interface Plano {
    id: string;
    nome: string;
    preco: string;
    parcelamento: string;
    descricao: string;
    cor: string; // 'emerald' | 'zinc' | 'yellow'
    destaque: boolean;
    beneficios: string[];
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "config">("dashboard");
  const [planos, setPlanos] = useState<Plano[]>(INITIAL_PLANOS);
  const [editingPlan, setEditingPlan] = useState<Plano | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- LÓGICA DO DASHBOARD ---
  const totalFaturamento = ASSINATURAS_MOCK.reduce((acc, curr) => acc + curr.valorPago, 0);
  const totalSocios = ASSINATURAS_MOCK.length;
  
  // Agrupar por plano
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
          // Criar Novo
          const newPlan = { ...editingPlan, id: Date.now().toString() };
          setPlanos([...planos, newPlan]);
          addToast("Novo plano criado!", "success");
      } else {
          // Editar Existente
          setPlanos(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
          addToast("Plano atualizado!", "success");
      }
      setIsModalOpen(false);
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
          <div className="flex border-b border-zinc-800 gap-6">
              <button onClick={() => setActiveTab("dashboard")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 ${activeTab === "dashboard" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent"}`}><LayoutDashboard size={16}/> Dashboard</button>
              <button onClick={() => setActiveTab("config")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 ${activeTab === "config" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent"}`}><Edit size={16}/> Configurar Planos</button>
          </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* --- ABA DASHBOARD --- */}
        {activeTab === "dashboard" && (
            <div className="space-y-8">
                
                {/* 1. KPIs */}
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

                {/* 2. PERFORMANCE POR PLANO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><CreditCard size={16} className="text-emerald-500"/> Receita por Plano</h3>
                        <div className="space-y-5">
                            {statsPorPlano.map(stat => (
                                <div key={stat.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-zinc-300">{stat.nome}</span>
                                        <span className="text-emerald-400 font-bold">R$ {stat.receita}</span>
                                    </div>
                                    <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${stat.cor === 'yellow' ? 'bg-yellow-500' : stat.cor === 'zinc' ? 'bg-zinc-500' : 'bg-emerald-500'}`} style={{width: `${(stat.receita/totalFaturamento)*100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><Users size={16} className="text-blue-500"/> Adesão por Plano</h3>
                        <div className="space-y-5">
                            {statsPorPlano.map(stat => (
                                <div key={stat.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-bold text-zinc-300">{stat.nome}</span>
                                        <span className="text-white font-bold">{stat.qtd} sócios</span>
                                    </div>
                                    <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                                        <div className={`h-full ${stat.cor === 'yellow' ? 'bg-yellow-500' : stat.cor === 'zinc' ? 'bg-zinc-500' : 'bg-emerald-500'}`} style={{width: `${(stat.qtd/totalSocios)*100}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 3. TURMAS (COM FOTOS) */}
                <div>
                    <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Crown size={16} className="text-yellow-500"/> Performance por Turma</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {TURMAS_MOCK.map(turma => (
                            <div key={turma.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 hover:border-emerald-500/50 transition group">
                                <div className="w-16 h-16 rounded-xl bg-black overflow-hidden border border-zinc-700 shrink-0 relative">
                                    {/* SIMULAÇÃO DE FOTO DA PASTA PUBLIC */}
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

                {/* 4. TABELA DE HISTÓRICO */}
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
                            <thead className="bg-black/40 text-zinc-500 text-[10px] font-bold uppercase"><tr><th className="p-4">Aluno</th><th className="p-4">Turma</th><th className="p-4">Plano Escolhido</th><th className="p-4">Valor</th><th className="p-4 text-right">Data Início</th></tr></thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                                {ASSINATURAS_MOCK.filter(s => s.aluno.toLowerCase().includes(searchTerm.toLowerCase())).map((sub) => {
                                    const plano = planos.find(p => p.id === sub.planoId);
                                    return (
                                        <tr key={sub.id} className="hover:bg-zinc-800/30 transition">
                                            <td className="p-4 font-bold text-white">{sub.aluno}</td>
                                            <td className="p-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs font-bold">{sub.turma}</span></td>
                                            <td className="p-4 flex items-center gap-2">
                                                {plano?.id === 'lenda' ? <Crown size={14} className="text-yellow-500"/> : plano?.id === 'atleta' ? <Star size={14} className="text-zinc-400"/> : <Ghost size={14} className="text-emerald-500"/>}
                                                {plano?.nome}
                                            </td>
                                            <td className="p-4 text-emerald-400 font-mono">R$ {sub.valorPago}</td>
                                            <td className="p-4 text-right text-zinc-500 text-xs">{sub.dataInicio}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* --- ABA CONFIGURAÇÃO (CRUD) --- */}
        {activeTab === "config" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {planos.map(plano => (
                    <div key={plano.id} className={`bg-zinc-900 border rounded-3xl p-6 flex flex-col relative overflow-hidden transition hover:border-opacity-100 ${plano.cor === 'yellow' ? 'border-yellow-500/30 hover:border-yellow-500' : plano.cor === 'zinc' ? 'border-zinc-500/30 hover:border-white' : 'border-emerald-500/30 hover:border-emerald-500'}`}>
                        {plano.destaque && <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">Mais Vendido</div>}
                        <div className="mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${plano.cor === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' : plano.cor === 'zinc' ? 'bg-zinc-800 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {plano.id === 'lenda' ? <Crown size={24}/> : plano.id === 'atleta' ? <Star size={24}/> : <Ghost size={24}/>}
                            </div>
                            <h2 className="text-xl font-black uppercase">{plano.nome}</h2>
                            <p className="text-xs text-zinc-400 mt-1">{plano.descricao}</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-xs text-zinc-500 font-bold uppercase">Valor</span>
                            <div className="flex items-end gap-1"><span className="text-sm font-bold text-zinc-400 mb-1">R$</span><span className={`text-3xl font-black ${plano.cor === 'yellow' ? 'text-yellow-500' : plano.cor === 'zinc' ? 'text-white' : 'text-emerald-500'}`}>{plano.preco}</span></div>
                            <p className="text-[10px] text-zinc-500">{plano.parcelamento}</p>
                        </div>
                        <div className="space-y-2 flex-1 mb-6">
                            {plano.beneficios.map((ben, i) => (
                                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300"><CheckCircle size={14} className={`shrink-0 mt-0.5 ${plano.cor === 'yellow' ? 'text-yellow-500' : plano.cor === 'zinc' ? 'text-zinc-400' : 'text-emerald-500'}`}/>{ben}</div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEdit(plano)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl uppercase text-xs transition flex items-center justify-center gap-2"><Edit size={14}/> Editar</button>
                            <button onClick={() => {if(confirm('Excluir plano?')) setPlanos(prev => prev.filter(p => p.id !== plano.id))}} className="bg-red-900/20 text-red-500 px-4 rounded-xl hover:bg-red-900/40"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO */}
      {isModalOpen && editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                  <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-2">{editingPlan.id ? "Editar Plano" : "Criar Novo Plano"}</h2>

                  <div className="space-y-4">
                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Nome do Plano</label><input type="text" className="input-admin" value={editingPlan.nome} onChange={e => setEditingPlan({...editingPlan, nome: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-3">
                          <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Preço (R$)</label><input type="text" className="input-admin" value={editingPlan.preco} onChange={e => setEditingPlan({...editingPlan, preco: e.target.value})}/></div>
                          <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Parcelamento</label><input type="text" className="input-admin" value={editingPlan.parcelamento} onChange={e => setEditingPlan({...editingPlan, parcelamento: e.target.value})}/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Cor do Tema</label>
                            <select className="input-admin text-zinc-300" value={editingPlan.cor} onChange={e => setEditingPlan({...editingPlan, cor: e.target.value})}>
                                <option value="emerald">Verde (Básico)</option>
                                <option value="zinc">Prata (Médio)</option>
                                <option value="yellow">Dourado (VIP)</option>
                            </select>
                        </div>
                        <div className="flex items-end mb-2">
                             <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white"><input type="checkbox" checked={editingPlan.destaque} onChange={e => setEditingPlan({...editingPlan, destaque: e.target.checked})} className="w-4 h-4 rounded border-zinc-700 bg-black text-emerald-500"/> Marcar como Destaque</label>
                        </div>
                      </div>
                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Descrição Curta</label><textarea rows={2} className="input-admin" value={editingPlan.descricao} onChange={e => setEditingPlan({...editingPlan, descricao: e.target.value})}/></div>
                      
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
                      <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2"><Save size={16}/> Salvar</button>
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