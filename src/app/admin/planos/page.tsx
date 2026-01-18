"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Edit, Save, Plus, Trash2, CheckCircle, X, 
  LayoutDashboard, CreditCard, DollarSign, Crown, Star, Ghost, 
  Users, TrendingUp, Calendar, Search, Megaphone, Sparkles, ChevronRight, Loader2, Database, RefreshCw, ShoppingBag, Eye, User, ClipboardList, Check
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, setDoc, getDoc } from "firebase/firestore";

// --- TIPAGEM COMPLETA ---
interface Plano {
    id: string;
    nome: string;
    preco: string;
    precoVal: number;
    parcelamento: string;
    descricao: string;
    cor: string;
    icon: string;
    destaque: boolean;
    beneficios: string[];
}

interface Assinatura {
    id: string;
    aluno: string;
    turma: string;
    foto?: string;
    planoId: string;
    planoNome: string;
    valorPago: number;
    dataInicio: string;
    status: 'ativo' | 'vencido' | 'pendente';
    metodo: 'pix' | 'cartao';
}

// 🦈 NOVA INTERFACE PARA SOLICITAÇÕES
interface Solicitacao {
    id: string;
    userId: string;
    userName: string;
    userTurma: string;
    planoId: string;
    planoNome: string;
    valor: number;
    comprovanteUrl: string;
    dataSolicitacao: any;
    status: 'pendente' | 'aprovado' | 'rejeitado';
}

interface BannerConfig {
    titulo: string;
    subtitulo: string;
    cor: 'dourado' | 'esmeralda' | 'roxo' | 'fogo';
}

// --- DADOS DE RESGATE ---
const INITIAL_PLANOS = [
    { nome: "Bicho Solto", preco: "0,00", precoVal: 0, parcelamento: "Gratuito", descricao: "Plano de entrada para todos.", cor: "zinc", icon: "ghost", destaque: false, beneficios: ["Carteirinha Digital", "Descontos em Parceiros", "Acesso ao App"] },
    { nome: "Cardume Livre", preco: "75,00", precoVal: 75, parcelamento: "Semestral", descricao: "Kit básico e economia.", cor: "emerald", icon: "shopping", destaque: false, beneficios: ["Kit: Caneca + Tirante", "15% OFF na Lojinha", "Fura-fila Open Cooler"] },
    { nome: "Atleta de Bar", preco: "160,00", precoVal: 160, parcelamento: "2x Sem Juros", descricao: "Vive a atlética.", cor: "zinc", icon: "star", destaque: true, beneficios: ["Kit: Caneca + Tirante", "Kit: Camiseta", "50% OFF em 2 festas", "Prioridade Jogos"] },
    { nome: "Lenda dos Jogos", preco: "250,00", precoVal: 250, parcelamento: "3x Sem Juros", descricao: "VIP e Jogos.", cor: "yellow", icon: "crown", destaque: false, beneficios: ["Kit Completo (Body/Colete)", "Acesso VIP Festas", "R$ 50 OFF no JIMESP", "Sorteio Camarote"] }
];

const MOCK_ASSINATURAS = [
    { aluno: "João Silva", turma: "T5", planoId: "lenda", planoNome: "Lenda dos Jogos", valorPago: 250, dataInicio: "10/01/2026", status: "ativo", metodo: "pix", foto: "https://github.com/shadcn.png" },
    { aluno: "Maria Souza", turma: "T5", planoId: "atleta", planoNome: "Atleta de Bar", valorPago: 160, dataInicio: "11/01/2026", status: "ativo", metodo: "pix" },
    { aluno: "Pedro Santos", turma: "T4", planoId: "cardume", planoNome: "Cardume Livre", valorPago: 75, dataInicio: "12/01/2026", status: "ativo", metodo: "cartao" },
    { aluno: "Ana Lima", turma: "T6", planoId: "atleta", planoNome: "Atleta de Bar", valorPago: 160, dataInicio: "09/01/2026", status: "ativo", metodo: "pix", foto: "https://github.com/shadcn.png" },
    { aluno: "Carlos Jr", turma: "T5", planoId: "lenda", planoNome: "Lenda dos Jogos", valorPago: 250, dataInicio: "10/01/2026", status: "ativo", metodo: "cartao" },
];

export default function AdminPlanosPage() {
  const { addToast } = useToast();
  
  // Estados de Controle
  const [activeTab, setActiveTab] = useState<"dashboard" | "solicitacoes" | "config" | "marketing">("dashboard"); // 🦈 ABA NOVA ADICIONADA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Solicitacao | null>(null); // 🦈 Estado para ver comprovante
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Estados de Dados
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [assinaturas, setAssinaturas] = useState<Assinatura[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]); // 🦈 NOVO LISTENER
  const [editingPlan, setEditingPlan] = useState<Plano | null>(null);
  
  // Estado Marketing
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({ titulo: "VIRE TUBARÃO REI", subtitulo: "Domine o Oceano", cor: "dourado" });

  // 1. CARREGAR DADOS
  useEffect(() => {
    const qPlanos = query(collection(db, "planos"), orderBy("precoVal", "asc"));
    const unsubPlanos = onSnapshot(qPlanos, (snap) => setPlanos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Plano))));

    const qAssinaturas = query(collection(db, "assinaturas"), orderBy("dataInicio", "desc"));
    const unsubAssinaturas = onSnapshot(qAssinaturas, (snap) => {
        setAssinaturas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Assinatura)));
        setLoading(false);
    });

    // 🦈 LISTENER DE SOLICITAÇÕES
    const qSolicitacoes = query(collection(db, "solicitacoes_adesao"), orderBy("dataSolicitacao", "desc"));
    const unsubSolicitacoes = onSnapshot(qSolicitacoes, (snap) => {
        setSolicitacoes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Solicitacao)));
    });

    const loadConfig = async () => {
        const snap = await getDoc(doc(db, "app_config", "marketing_banner"));
        if (snap.exists()) setBannerConfig(snap.data() as BannerConfig);
    }
    loadConfig();

    return () => { unsubPlanos(); unsubAssinaturas(); unsubSolicitacoes(); };
  }, []);

  // --- LÓGICA DO DASHBOARD ---
  const stats = useMemo(() => {
      const totalFaturamento = assinaturas.reduce((acc, curr) => acc + curr.valorPago, 0);
      const totalSociosPagantes = assinaturas.filter(s => s.valorPago > 0).length;
      const totalGeral = assinaturas.length;
      const ticketMedio = totalSociosPagantes > 0 ? totalFaturamento / totalSociosPagantes : 0;

      const turmasMap: Record<string, { nome: string, count: number, revenue: number, planos: Record<string, number> }> = {};
      const planosCountMap: Record<string, number> = {};

      assinaturas.forEach(sub => {
          if (!turmasMap[sub.turma]) turmasMap[sub.turma] = { nome: sub.turma, count: 0, revenue: 0, planos: {} };
          turmasMap[sub.turma].count += 1;
          turmasMap[sub.turma].revenue += sub.valorPago;
          const planoKey = sub.planoNome;
          turmasMap[sub.turma].planos[planoKey] = (turmasMap[sub.turma].planos[planoKey] || 0) + 1;

          const realPlan = planos.find(p => p.id === sub.planoId || p.nome === sub.planoNome);
          const pId = realPlan ? realPlan.id : sub.planoId;
          planosCountMap[pId] = (planosCountMap[pId] || 0) + 1;
      });

      const turmasStats = Object.values(turmasMap).map(t => {
          const topPlan = Object.entries(t.planos).sort((a,b) => b[1] - a[1])[0]?.[0] || "Nenhum";
          return { ...t, topPlan };
      }).sort((a,b) => b.revenue - a.revenue);

      return { totalFaturamento, totalSociosPagantes, totalGeral, ticketMedio, turmasStats, planosCountMap };
  }, [assinaturas, planos]);

  // --- 🦈 FUNÇÃO DE APROVAÇÃO FINANCEIRA ---
  const handleApprove = async (sol: Solicitacao) => {
      if(!confirm(`Confirmar pagamento de ${sol.userName}? Isso vai liberar o acesso dele.`)) return;
      setIsSaving(true);

      try {
          // 1. Atualizar Status da Solicitação
          await updateDoc(doc(db, "solicitacoes_adesao", sol.id), { status: "aprovado" });

          // 2. Atualizar Perfil do Usuário (Badge e Status)
          await updateDoc(doc(db, "users", sol.userId), {
              plano_badge: sol.planoNome,
              plano_status: "ativo",
              data_adesao: new Date().toISOString()
          });

          // 3. Criar Registro Financeiro (Para o Dashboard somar a receita)
          await addDoc(collection(db, "assinaturas"), {
              aluno: sol.userName,
              turma: sol.userTurma,
              planoId: sol.planoId,
              planoNome: sol.planoNome,
              valorPago: sol.valor,
              dataInicio: new Date().toLocaleDateString('pt-BR'),
              status: 'ativo',
              metodo: 'pix',
              userId: sol.userId
          });

          addToast("Adesão Aprovada! O aluno já está com o plano ativo.", "success");
          setViewingReceipt(null); // Fecha modal

      } catch (error) {
          console.error(error);
          addToast("Erro ao processar aprovação.", "error");
      } finally {
          setIsSaving(false);
      }
  };

  const handleReject = async (sol: Solicitacao) => {
      if(!confirm("Rejeitar esta solicitação? O aluno terá que enviar novamente.")) return;
      try {
          await updateDoc(doc(db, "solicitacoes_adesao", sol.id), { status: "rejeitado" });
          addToast("Solicitação rejeitada.", "info");
          setViewingReceipt(null);
      } catch(e) { addToast("Erro ao rejeitar.", "error"); }
  };

  // --- HANDLERS ANTIGOS (MANTIDOS) ---
  const handleSeedPlanos = async () => {
      if(!confirm("⚠️ ISSO VAI RECRIAR OS 4 PLANOS PADRÃO. Confirmar?")) return;
      setIsSaving(true);
      try { await Promise.all(INITIAL_PLANOS.map(p => addDoc(collection(db, "planos"), p))); addToast("Planos restaurados!", "success"); } catch (e) { addToast("Erro.", "error"); } finally { setIsSaving(false); }
  };
  const handleSeedAssinaturas = async () => {
      if(!confirm("Gerar dados financeiros de teste?")) return;
      setIsSaving(true);
      try { await Promise.all(MOCK_ASSINATURAS.map(a => addDoc(collection(db, "assinaturas"), a))); addToast("Dados gerados!", "success"); } catch (e) { addToast("Erro.", "error"); } finally { setIsSaving(false); }
  };
  const handleCreate = () => { setEditingPlan({ id: "", nome: "", preco: "", precoVal: 0, parcelamento: "", descricao: "", cor: "zinc", icon: "star", destaque: false, beneficios: ["Novo Benefício"] }); setIsModalOpen(true); };
  const handleEdit = (plano: Plano) => { setEditingPlan({ ...plano }); setIsModalOpen(true); };
  const handleSave = async () => { if (!editingPlan) return; setIsSaving(true); const { id, ...data } = editingPlan; const payload = { ...data, precoVal: parseFloat(editingPlan.preco.replace(',', '.')) || 0 }; try { if (id) { await updateDoc(doc(db, "planos", id), payload); addToast("Plano atualizado!", "success"); } else { await addDoc(collection(db, "planos"), payload); addToast("Plano criado!", "success"); } setIsModalOpen(false); } catch (e) { addToast("Erro.", "error"); } finally { setIsSaving(false); } };
  const handleDelete = async (id: string) => { if(!confirm("Excluir plano?")) return; try { await deleteDoc(doc(db, "planos", id)); addToast("Removido.", "info"); } catch(e) { addToast("Erro.", "error"); } };
  const handleSaveBanner = async () => { setIsSaving(true); try { await setDoc(doc(db, "app_config", "marketing_banner"), bannerConfig); addToast("Banner atualizado!", "success"); } catch (e) { addToast("Erro.", "error"); } finally { setIsSaving(false); } };
  const handleBenefitChange = (index: number, value: string) => { if (!editingPlan) return; const newBenefits = [...editingPlan.beneficios]; newBenefits[index] = value; setEditingPlan({ ...editingPlan, beneficios: newBenefits }); };
  const addBenefit = () => { if (!editingPlan) return; setEditingPlan({ ...editingPlan, beneficios: [...editingPlan.beneficios, "Novo Benefício"] }); };
  const removeBenefit = (index: number) => { if (!editingPlan) return; const newBenefits = editingPlan.beneficios.filter((_, i) => i !== index); setEditingPlan({ ...editingPlan, beneficios: newBenefits }); };
  const getBannerStyles = (cor: string) => { switch(cor) { case 'dourado': return { gradient: "from-yellow-600 via-amber-500 to-yellow-600", border: "border-yellow-400/50", shadow: "shadow-[0_0_25px_rgba(234,179,8,0.4)]" }; case 'esmeralda': return { gradient: "from-emerald-600 via-green-500 to-emerald-600", border: "border-emerald-400/50", shadow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]" }; case 'roxo': return { gradient: "from-purple-600 via-indigo-500 to-purple-600", border: "border-purple-400/50", shadow: "shadow-[0_0_25px_rgba(147,51,234,0.4)]" }; case 'fogo': return { gradient: "from-red-600 via-orange-500 to-red-600", border: "border-orange-400/50", shadow: "shadow-[0_0_25px_rgba(249,115,22,0.4)]" }; default: return { gradient: "from-zinc-600 via-zinc-500 to-zinc-600", border: "border-zinc-400/50", shadow: "" }; } };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2"><CreditCard className="text-emerald-500" /> Central Financeira</h1></div>
        </div>
        <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition"><Plus size={16} /> Criar Plano</button>
      </header>

      {/* NAVEGAÇÃO DE ABAS */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto">
              <button onClick={() => setActiveTab("dashboard")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap transition ${activeTab === "dashboard" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}><LayoutDashboard size={16}/> Dashboard</button>
              
              {/* 🦈 NOVA ABA DE AUDITORIA */}
              <button onClick={() => setActiveTab("solicitacoes")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap transition ${activeTab === "solicitacoes" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}>
                  <ClipboardList size={16}/> Auditoria 
                  {solicitacoes.filter(s => s.status === 'pendente').length > 0 && (
                      <span className="bg-red-500 text-white px-1.5 py-0.5 rounded-full text-[9px] animate-pulse">{solicitacoes.filter(s => s.status === 'pendente').length}</span>
                  )}
              </button>

              <button onClick={() => setActiveTab("config")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap transition ${activeTab === "config" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}><Edit size={16}/> Editar Planos</button>
              <button onClick={() => setActiveTab("marketing")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 whitespace-nowrap transition ${activeTab === "marketing" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}><Megaphone size={16}/> Marketing</button>
          </div>
      </div>

      <main className="p-6 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* ======================= ABA DASHBOARD ======================= */}
        {activeTab === "dashboard" && (
            <div className="space-y-8">
                {/* 1. KPIS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-20 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none"></div>
                        <div className="relative z-10">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Faturamento Total</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter">R$ {stats.totalFaturamento.toLocaleString('pt-BR')}</h3>
                            <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1"><TrendingUp size={12}/> Receita Atualizada</p>
                        </div>
                        <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500 border border-emerald-500/20"><DollarSign size={32}/></div>
                    </div>
                    {/* ... (Outros Cards Mantidos) ... */}
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Base de Sócios</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter">{stats.totalGeral}</h3>
                            <p className="text-[10px] text-blue-500 font-bold mt-2 flex items-center gap-1"><Users size={12}/> {stats.totalSociosPagantes} Pagantes</p>
                        </div>
                        <div className="bg-blue-500/20 p-4 rounded-2xl text-blue-500 border border-blue-500/20"><Users size={32}/></div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex items-center justify-between shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Ticket Médio</p>
                            <h3 className="text-4xl font-black text-white tracking-tighter">R$ {stats.ticketMedio.toFixed(2)}</h3>
                            <p className="text-[10px] text-yellow-500 font-bold mt-2">Por Sócio Pagante</p>
                        </div>
                        <div className="bg-yellow-500/20 p-4 rounded-2xl text-yellow-500 border border-yellow-500/20"><Crown size={32}/></div>
                    </div>
                </div>

                {/* 2. SÓCIOS POR PLANO */}
                <div>
                    <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Users size={16} className="text-blue-500"/> Sócios por Plano</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {planos.map(plano => (
                            <div key={plano.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between hover:border-zinc-700 transition">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-bold text-white text-sm uppercase">{plano.nome}</h4>
                                        <div className={`w-2 h-2 rounded-full ${plano.cor === 'yellow' ? 'bg-yellow-500' : plano.cor === 'emerald' ? 'bg-emerald-500' : 'bg-zinc-500'}`}></div>
                                    </div>
                                    <p className="text-3xl font-black text-white">{stats.planosCountMap[plano.id] || 0}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Sócios Ativos</p>
                                </div>
                                <button 
                                    onClick={() => setViewingPlanId(plano.id)}
                                    className="w-full mt-4 bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white border border-zinc-800 rounded-lg py-2 text-[10px] uppercase font-bold transition flex items-center justify-center gap-2"
                                >
                                    <Eye size={12}/> Ver Lista
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. TABELA DE ASSINATURAS DETALHADA (MANTIDA) */}
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
                                {assinaturas.filter(s => s.aluno.toLowerCase().includes(searchTerm.toLowerCase())).map((sub) => (
                                    <tr key={sub.id} className="hover:bg-zinc-800/30 transition">
                                        <td className="p-4 font-bold text-white">{sub.aluno}</td>
                                        <td className="p-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs font-bold">{sub.turma}</span></td>
                                        <td className="p-4">{sub.planoNome}</td>
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

        {/* 🦈 ======================= ABA AUDITORIA (NOVA) ======================= */}
        {activeTab === "solicitacoes" && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2"><ClipboardList size={16} className="text-yellow-500"/> Fila de Aprovação</h3>
                    <div className="text-xs text-zinc-500">Pendentes: <span className="text-white font-bold">{solicitacoes.filter(s => s.status === 'pendente').length}</span></div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {solicitacoes.length === 0 && <div className="text-center py-12 text-zinc-600 text-sm bg-zinc-900 border border-zinc-800 border-dashed rounded-xl">Nenhuma solicitação pendente.</div>}
                    
                    {solicitacoes.map(sol => (
                        <div key={sol.id} className={`bg-zinc-900 border p-4 rounded-xl flex items-center justify-between transition ${sol.status === 'pendente' ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-zinc-800 opacity-60'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-black text-lg ${sol.status === 'pendente' ? 'bg-yellow-500' : sol.status === 'aprovado' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                    {sol.userName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base">{sol.userName} <span className="text-zinc-500 text-xs font-normal">({sol.userTurma})</span></h4>
                                    <p className="text-xs text-zinc-400 mt-0.5">Solicitou: <span className="text-emerald-400 font-bold">{sol.planoNome}</span> (R$ {sol.valor})</p>
                                </div>
                            </div>

                            {sol.status === 'pendente' ? (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setViewingReceipt(sol)} className="bg-zinc-800 hover:bg-white hover:text-black text-zinc-300 px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 border border-zinc-700">
                                        <Eye size={14}/> Ver Comprovante
                                    </button>
                                </div>
                            ) : (
                                <span className={`text-xs font-bold uppercase px-3 py-1 rounded border ${sol.status === 'aprovado' ? 'text-emerald-500 border-emerald-900 bg-emerald-900/20' : 'text-red-500 border-red-900 bg-red-900/20'}`}>
                                    {sol.status}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ======================= ABA CONFIG (CRUD) ======================= */}
        {activeTab === "config" && (
            <>
                <div className="flex justify-end mb-6">
                     <button onClick={handleSeedPlanos} disabled={isSaving} className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:underline flex items-center gap-2 bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-900/30 hover:bg-emerald-900/20 transition">
                        {isSaving ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>} Restaurar os 4 Planos Padrão
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {planos.map(plano => (
                        <div key={plano.id} className={`bg-zinc-900 border rounded-[2rem] p-6 flex flex-col relative overflow-hidden transition group hover:-translate-y-1 duration-300 ${plano.cor === 'yellow' ? 'border-yellow-500/30' : plano.cor === 'zinc' ? 'border-zinc-500/30' : 'border-emerald-500/30'}`}>
                            <div className="mb-4">
                                <h2 className="text-xl font-black uppercase">{plano.nome}</h2>
                                <p className="text-xs text-zinc-400 mt-1">{plano.descricao}</p>
                            </div>
                            <div className="mb-6"><span className="text-xs text-zinc-500 font-bold uppercase">Valor</span><div className="flex items-end gap-1"><span className="text-sm font-bold text-zinc-400 mb-1">R$</span><span className="text-3xl font-black text-white">{plano.preco}</span></div></div>
                            <div className="flex gap-2 mt-auto">
                                <button onClick={() => handleEdit(plano)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl uppercase text-[10px] tracking-wider transition flex items-center justify-center gap-2 border border-zinc-700"><Edit size={12}/> Editar</button>
                                <button onClick={() => handleDelete(plano.id)} className="bg-red-900/10 text-red-500 px-3 rounded-xl hover:bg-red-900/30 border border-red-900/20 transition"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}

        {/* ======================= ABA MARKETING ======================= */}
        {activeTab === "marketing" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6">
                    <h3 className="text-lg font-black text-white uppercase mb-6 flex items-center gap-2"><Megaphone size={20} className="text-emerald-500"/> Configurar Call-to-Action</h3>
                    <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Título</label><input type="text" className="input-admin text-lg font-black uppercase text-yellow-500 w-full" value={bannerConfig.titulo} onChange={e => setBannerConfig({...bannerConfig, titulo: e.target.value})}/></div>
                    <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">Subtítulo</label><input type="text" className="input-admin w-full" value={bannerConfig.subtitulo} onChange={e => setBannerConfig({...bannerConfig, subtitulo: e.target.value})}/></div>
                    <button onClick={handleSaveBanner} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-xs uppercase shadow-lg transition active:scale-95">{isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Salvar Alterações</button>
                </div>
            </div>
        )}

      </main>

      {/* 🦈 MODAL DO COMPROVANTE (AUDITORIA) */}
      {viewingReceipt && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 p-4 animate-in fade-in">
              <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
                  <div className="p-4 bg-black/50 border-b border-zinc-800 flex justify-between items-center">
                      <div>
                          <h3 className="text-white font-bold uppercase text-sm">Comprovante de {viewingReceipt.userName}</h3>
                          <p className="text-zinc-500 text-[10px]">Valor: R$ {viewingReceipt.valor}</p>
                      </div>
                      <button onClick={() => setViewingReceipt(null)} className="text-zinc-500 hover:text-white bg-zinc-800 p-2 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="flex-1 bg-black p-4 flex items-center justify-center overflow-auto">
                      <img src={viewingReceipt.comprovanteUrl} className="max-w-full rounded-lg border border-zinc-800" alt="Comprovante"/>
                  </div>

                  <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-3">
                      <button onClick={() => handleReject(viewingReceipt)} disabled={isSaving} className="flex-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 py-3 rounded-xl font-bold uppercase text-xs transition border border-red-900/30">
                          Rejeitar
                      </button>
                      <button onClick={() => handleApprove(viewingReceipt)} disabled={isSaving} className="flex-[2] bg-emerald-600 text-white hover:bg-emerald-500 py-3 rounded-xl font-bold uppercase text-xs transition shadow-lg flex items-center justify-center gap-2">
                          {isSaving ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>} Confirmar Pagamento
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL LISTA DE SÓCIOS (MANTER IGUAL AO ANTERIOR) */}
      {viewingPlanId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-6 animate-in fade-in duration-200" onClick={() => setViewingPlanId(null)}>
              <div className="bg-zinc-900 w-full max-w-md rounded-[2.5rem] border border-zinc-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-zinc-800 bg-black/40 flex justify-between items-center">
                      <div><h3 className="text-white font-black uppercase text-lg leading-none">{planos.find(p => p.id === viewingPlanId)?.nome || "Plano"}</h3></div>
                      <button onClick={() => setViewingPlanId(null)} className="text-zinc-500 hover:text-white bg-zinc-800 p-2 rounded-full transition"><X size={20}/></button>
                  </div>
                  <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {assinaturas.filter(s => s.planoId === viewingPlanId || s.planoNome === planos.find(p => p.id === viewingPlanId)?.nome).map((sub) => (
                          <div key={sub.id} className="flex items-center gap-4 p-3 rounded-xl bg-black/30 border border-zinc-800">
                              <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0">
                                  {sub.foto ? <img src={sub.foto} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-500"><User size={16}/></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <h4 className="text-white font-bold text-sm truncate">{sub.aluno}</h4>
                                  <div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold border border-zinc-700">{sub.turma}</span></div>
                              </div>
                          </div>
                      ))}
                      {assinaturas.filter(s => s.planoId === viewingPlanId).length === 0 && <div className="text-center py-10 text-zinc-600 text-xs uppercase font-bold">Nenhum sócio.</div>}
                  </div>
              </div>
          </div>
      )}

      {/* MODAL EDIÇÃO PLANO (MANTIDO) */}
      {isModalOpen && editingPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
              <div className="bg-zinc-900 w-full max-w-2xl rounded-[2rem] border border-zinc-800 p-8 shadow-2xl relative my-auto">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white bg-zinc-800 p-2 rounded-full transition"><X size={20}/></button>
                  <h2 className="font-black text-white text-2xl mb-8 flex items-center gap-3">{editingPlan.id ? <Edit className="text-emerald-500"/> : <Plus className="text-emerald-500"/>} {editingPlan.id ? "Editar Plano" : "Criar Plano"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-5">
                          <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Nome</label><input type="text" className="input-admin" value={editingPlan.nome} onChange={e => setEditingPlan({...editingPlan, nome: e.target.value})}/></div>
                          <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Preço</label><input type="text" className="input-admin font-mono text-emerald-400" value={editingPlan.preco} onChange={e => setEditingPlan({...editingPlan, preco: e.target.value})}/></div>
                              <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Parcelas</label><input type="text" className="input-admin" value={editingPlan.parcelamento} onChange={e => setEditingPlan({...editingPlan, parcelamento: e.target.value})}/></div>
                          </div>
                          <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Descrição</label><textarea rows={3} className="input-admin resize-none" value={editingPlan.descricao} onChange={e => setEditingPlan({...editingPlan, descricao: e.target.value})}/></div>
                          <div className="grid grid-cols-2 gap-3">
                              <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Cor</label><select className="input-admin" value={editingPlan.cor} onChange={e => setEditingPlan({...editingPlan, cor: e.target.value})}><option value="emerald">Esmeralda</option><option value="zinc">Zinco</option><option value="yellow">Amarelo</option></select></div>
                              <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Ícone</label><select className="input-admin" value={editingPlan.icon} onChange={e => setEditingPlan({...editingPlan, icon: e.target.value})}><option value="ghost">Fantasma</option><option value="shopping">Bolsa</option><option value="star">Estrela</option><option value="crown">Coroa</option></select></div>
                          </div>
                      </div>
                      <div className="bg-black/40 p-5 rounded-2xl border border-zinc-800 flex flex-col h-full">
                          <div className="flex justify-between items-center mb-4"><label className="text-[10px] font-bold text-zinc-500 uppercase">Benefícios</label><button onClick={addBenefit} className="text-[10px] bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-500 font-bold shadow-lg transition">+ Adicionar</button></div>
                          <div className="space-y-3 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                              {editingPlan.beneficios.map((ben, i) => (
                                  <div key={i} className="flex gap-2 items-center group"><div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0">{i+1}</div><input type="text" className="input-admin py-2 text-xs flex-1 border-zinc-800 focus:bg-black" value={ben} onChange={(e) => handleBenefitChange(i, e.target.value)}/><button onClick={() => removeBenefit(i)} className="text-zinc-600 hover:text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition"><Trash2 size={14}/></button></div>
                              ))}
                          </div>
                      </div>
                  </div>
                  <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-zinc-800">
                      <button onClick={() => setIsModalOpen(false)} className="px-8 py-4 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase transition">Cancelar</button>
                      <button onClick={handleSave} disabled={isSaving} className="px-10 py-4 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2 transition hover:scale-105">{isSaving ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle size={16}/>} Salvar</button>
                  </div>
              </div>
          </div>
      )}

      <style jsx global>{`
        .input-admin { width: 100%; background: #09090b; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.875rem; color: white; outline: none; transition: all 0.2s; font-size: 0.875rem; }
        .input-admin:focus { border-color: #10b981; background: #000; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
      `}</style>
    </div>
  );
}