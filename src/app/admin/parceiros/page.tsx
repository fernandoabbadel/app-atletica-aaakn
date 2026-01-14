"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft, Plus, Trash2, Megaphone, Percent, ExternalLink,
  LayoutDashboard, QrCode, FileText, Crown, Store, TrendingUp,
  Users, CheckCircle, Search, X, Camera, DollarSign, Wallet,
  Edit, Save, Image as ImageIcon, Instagram, Phone, Globe, Clock, MapPin, Tag,
  FileBadge, User, BarChart3, PieChart, Power, AlertTriangle, Eye, Shield, Star
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---
interface Cupom { id: string; titulo: string; regra: string; valor: string; imagem: string; }
interface Parceiro {
    id: number;
    nome: string;
    categoria: string;
    tier: 'ouro' | 'prata' | 'standard';
    status: 'active' | 'pending' | 'disabled'; // Status adicionado
    cnpj: string;
    responsavel: string;
    email: string;
    telefone: string;
    descricao: string;
    endereco: string;
    horario: string;
    insta: string;
    site: string;
    imgCapa: string;
    imgLogo: string;
    mensalidade: number;
    vendasTotal: number;
    totalScans: number;
    cupons: Cupom[];
}

// --- MOCKS ---
const PARCEIROS_MOCK: Parceiro[] = [
  { 
      id: 1, nome: "Academia Ironberg", categoria: "Saúde", tier: "ouro", status: "active",
      cnpj: "12.345.678/0001-90", responsavel: "Renato Cariani", email: "contato@ironberg.com", telefone: "12 99999-9999",
      descricao: "A maior rede...", endereco: "Av. da Praia, 1000", horario: "06h - 23h", insta: "@ironberg", site: "iron.com", 
      imgCapa: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80", 
      imgLogo: "https://i.pravatar.cc/150?u=iron",
      mensalidade: 500, vendasTotal: 15400, totalScans: 450,
      cupons: [{ id: "c1", titulo: "15% OFF Mensalidade", regra: "Planos Semestrais", valor: "15%", imagem: "" }]
  },
  { 
      id: 2, nome: "Lanchonete do Zé (Pendente)", categoria: "Alimentação", tier: "standard", status: "pending",
      cnpj: "99.999.999/0001-99", responsavel: "Zé da Silva", email: "ze@lanche.com", telefone: "12 98888-7777",
      descricao: "Lanches rápidos.", endereco: "Rua 2", horario: "18h - 23h", insta: "@ze_lanches", site: "", 
      imgCapa: "", imgLogo: "", mensalidade: 0, vendasTotal: 0, totalScans: 0,
      cupons: []
  },
];

const SCAN_HISTORY_MOCK = [
    { id: "SCAN-992", data: "12/01", hora: "14:30", empresa: "Ironberg", usuario: "João (T5)", userId: "u123", cupom: "15% OFF" },
    { id: "SCAN-993", data: "12/01", hora: "12:15", empresa: "Açaí Monstro", usuario: "Maria (T1)", userId: "u456", cupom: "Toppings Free" },
];

const CATEGORIAS_MOCK = ["Alimentação", "Saúde", "Lazer", "Serviços"];

export default function AdminParceirosPage() {
  const { addToast } = useToast();
  
  // Estados Principais
  const [activeTab, setActiveTab] = useState<"dashboard" | "parceiros" | "cadastros" | "historico">("dashboard");
  const [parceiros, setParceiros] = useState<Parceiro[]>(PARCEIROS_MOCK);
  const [categorias, setCategorias] = useState(CATEGORIAS_MOCK);
  
  // Modais
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTierModal, setShowTierModal] = useState(false); // Modal de Detalhe do Plano
  const [tierModalData, setTierModalData] = useState<{tier: string, list: Parceiro[]}>({ tier: "", list: [] });
  
  const [isEditing, setIsEditing] = useState(false);
  
  // Forms
  const [currentPartner, setCurrentPartner] = useState<Partial<Parceiro>>({});
  const [newCupom, setNewCupom] = useState<Cupom>({ id: "", titulo: "", regra: "", valor: "", imagem: "" });
  const [newCategoryName, setNewCategoryName] = useState("");

  // Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const cupomInputRef = useRef<HTMLInputElement>(null);

  // --- LÓGICA DE NEGÓCIO ---

  // Aprovar Parceiro Pendente
  const handleApprove = (id: number) => {
      setParceiros(prev => prev.map(p => p.id === id ? { ...p, status: 'active' } : p));
      addToast("Parceiro aprovado e ativado!", "success");
  };

  // Alternar Status (Habilitar/Desabilitar)
  const handleToggleStatus = (id: number, currentStatus: string) => {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      setParceiros(prev => prev.map(p => p.id === id ? { ...p, status: newStatus as any } : p));
      addToast(newStatus === 'active' ? "Empresa Habilitada!" : "Empresa Desabilitada.", newStatus === 'active' ? "success" : "info");
  };

  // Abrir Modal de Drill-down do Dashboard
  const handleViewTier = (tierName: string, tierKey: string) => {
      const list = parceiros.filter(p => p.tier === tierKey);
      setTierModalData({ tier: tierName, list });
      setShowTierModal(true);
  };

  // --- CÁLCULOS DO DASHBOARD ---
  const totalFaturamento = parceiros.reduce((acc, p) => acc + (p.status === 'active' ? p.mensalidade : 0), 0);
  const totalScans = parceiros.reduce((acc, p) => acc + p.totalScans, 0);
  const parceirosOuro = parceiros.filter(p => p.tier === 'ouro');
  const parceirosPrata = parceiros.filter(p => p.tier === 'prata');
  const parceirosStandard = parceiros.filter(p => p.tier === 'standard');
  const topParceiro = [...parceiros].sort((a,b) => b.totalScans - a.totalScans)[0];

  // --- HANDLERS PADRÃO ---
  const handleOpenEdit = (partner: Parceiro) => { setCurrentPartner({ ...partner }); setIsEditing(true); setShowPartnerModal(true); };
  
  const handleOpenNew = () => { 
      setCurrentPartner({ 
          nome: "", categoria: "Alimentação", tier: "standard", status: "active", 
          cupons: [], imgCapa: "", imgLogo: "", mensalidade: 0, vendasTotal: 0, totalScans: 0 
      }); 
      setIsEditing(false); 
      setShowPartnerModal(true); 
  };

  const handleAddCategory = () => {
      if(!newCategoryName) return;
      setCategorias([...categorias, newCategoryName]);
      setNewCategoryName("");
      setShowCategoryModal(false);
      addToast("Categoria adicionada!", "success");
  };

  const handleAddCupom = () => {
      if (!newCupom.titulo) return addToast("Título obrigatório", "error");
      const cupom = { ...newCupom, id: Date.now().toString() };
      setCurrentPartner(prev => ({ ...prev, cupons: [...(prev.cupons || []), cupom] }));
      setNewCupom({ id: "", titulo: "", regra: "", valor: "", imagem: "" });
      addToast("Cupom adicionado à lista", "success");
  };

  const handleRemoveCupom = (id: string) => {
      setCurrentPartner(prev => ({ ...prev, cupons: prev.cupons?.filter(c => c.id !== id) }));
  };

  const handleSavePartner = () => {
      if (!currentPartner.nome) return addToast("Nome da empresa obrigatório", "error");
      if (isEditing) {
          setParceiros(prev => prev.map(p => p.id === currentPartner.id ? { ...p, ...currentPartner } as Parceiro : p));
          addToast("Dados atualizados!", "success");
      } else {
          // Se criado pelo admin, já nasce ativo. Se fosse pelo form externo, nasceria 'pending'.
          const novoId = Date.now();
          setParceiros(prev => [...prev, { ...currentPartner, id: novoId, status: 'active', vendasTotal: 0, totalScans: 0 } as Parceiro]);
          addToast("Novo parceiro cadastrado!", "success");
      }
      setShowPartnerModal(false);
  };

  const handleDelete = (id: number) => { if (confirm("Remover?")) setParceiros(prev => prev.filter(p => p.id !== id)); };
  
  const handleFileClick = (ref: React.RefObject<HTMLInputElement | null>) => { ref.current?.click(); };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, isCupom = false) => {
      if (e.target.files?.[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          if (isCupom) { setNewCupom(prev => ({ ...prev, imagem: url })); addToast("Foto cupom ok!", "success"); }
          else { setCurrentPartner(prev => ({ ...prev, [field]: url })); addToast("Imagem ok!", "success"); }
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center shadow-lg">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2"><Store className="text-emerald-500" /> Gestão de Parceiros</h1><p className="text-[11px] text-zinc-500 font-medium">Controle total do clube de vantagens</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowCategoryModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2"><Tag size={16}/> Categoria</button>
            <button onClick={handleOpenNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg"><Plus size={16} /> Novo Parceiro</button>
        </div>
      </header>

      {/* TABS */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto scrollbar-hide">
              {[{ id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard }, { id: 'parceiros', label: 'Empresas', icon: Store }, { id: 'cadastros', label: 'Dados Cadastrais', icon: FileBadge }, { id: 'historico', label: 'Histórico', icon: FileText }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 text-xs font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white hover:border-zinc-700'}`}><tab.icon size={16}/> {tab.label}</button>
              ))}
          </div>
      </div>

      <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* === ABA DASHBOARD === */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Receita Mensal</p><h3 className="text-2xl font-black text-white mt-1">R$ {totalFaturamento}</h3></div>
                        <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-500"><DollarSign size={20}/></div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Total Parceiros</p><h3 className="text-2xl font-black text-white mt-1">{parceiros.length}</h3></div>
                        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500"><Store size={20}/></div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Scans Validados</p><h3 className="text-2xl font-black text-white mt-1">{totalScans}</h3></div>
                        <div className="bg-purple-500/20 p-2 rounded-lg text-purple-500"><QrCode size={20}/></div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Top Performance</p><h3 className="text-lg font-black text-white mt-1 line-clamp-1">{topParceiro?.nome || "-"}</h3></div>
                        <div className="bg-yellow-500/20 p-2 rounded-lg text-yellow-500"><Crown size={20}/></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* DISTRIBUIÇÃO DE PLANOS (CLICÁVEL) */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><PieChart size={16}/> Planos Ativos (Clique para ver)</h3>
                        <div className="space-y-4">
                            <div onClick={() => handleViewTier('Ouro', 'ouro')} className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition"><span className="text-xs font-bold text-yellow-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> Ouro (R$ 500)</span><span className="text-white font-mono group-hover:scale-110 transition">{parceirosOuro.length}</span></div>
                            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4"><div className="bg-yellow-500 h-full" style={{width: `${(parceirosOuro.length/parceiros.length)*100}%`}}></div></div>
                            
                            <div onClick={() => handleViewTier('Prata', 'prata')} className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition"><span className="text-xs font-bold text-zinc-400 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-400"></div> Prata (R$ 250)</span><span className="text-white font-mono group-hover:scale-110 transition">{parceirosPrata.length}</span></div>
                            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4"><div className="bg-zinc-400 h-full" style={{width: `${(parceirosPrata.length/parceiros.length)*100}%`}}></div></div>
                            
                            <div onClick={() => handleViewTier('Standard', 'standard')} className="flex items-center justify-between cursor-pointer group hover:bg-white/5 p-2 rounded-lg transition"><span className="text-xs font-bold text-emerald-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Standard (Free)</span><span className="text-white font-mono group-hover:scale-110 transition">{parceirosStandard.length}</span></div>
                            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-4"><div className="bg-emerald-500 h-full" style={{width: `${(parceirosStandard.length/parceiros.length)*100}%`}}></div></div>
                        </div>
                    </div>

                    {/* RANKING DE VENDAS */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                        <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><BarChart3 size={16}/> Ranking de Vendas</h3>
                        <div className="space-y-4">
                            {parceiros.sort((a,b) => b.vendasTotal - a.vendasTotal).slice(0, 4).map((p, i) => (
                                <div key={p.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${i===0 ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>{i+1}</div>
                                        <span className="text-sm text-zinc-300 font-medium">{p.nome}</span>
                                    </div>
                                    <span className="text-xs text-emerald-400 font-bold">R$ {p.vendasTotal}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* === ABA EMPRESAS (LISTA E APROVAÇÃO) === */}
        {activeTab === 'parceiros' && (
            <div className="grid grid-cols-1 gap-4">
                {parceiros.map((parceiro) => (
                    <div key={parceiro.id} className={`bg-zinc-900 p-5 rounded-2xl border flex flex-col md:flex-row justify-between items-center gap-4 transition group ${parceiro.status === 'pending' ? 'border-yellow-600/50 bg-yellow-900/10' : parceiro.status === 'disabled' ? 'border-red-900/30 opacity-60' : 'border-zinc-800 hover:border-emerald-500/30'}`}>
                        <div className="flex gap-4 items-center w-full">
                            <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center overflow-hidden border border-zinc-800 shrink-0">
                                {parceiro.imgLogo ? <img src={parceiro.imgLogo} className="w-full h-full object-cover"/> : <span className="font-bold text-zinc-600">{parceiro.nome.charAt(0)}</span>}
                            </div>
                            <div>
                                <div className="flex gap-2 mb-1">
                                    {parceiro.status === 'pending' && <span className="text-[9px] bg-yellow-500 text-black px-2 py-0.5 rounded font-bold uppercase animate-pulse flex items-center gap-1"><AlertTriangle size={10}/> Pendente</span>}
                                    {parceiro.status === 'disabled' && <span className="text-[9px] bg-red-500 text-white px-2 py-0.5 rounded font-bold uppercase">Desativado</span>}
                                    {parceiro.tier === 'ouro' && <span className="text-[9px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-bold uppercase">Ouro</span>}
                                    <span className="text-[9px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-bold uppercase">{parceiro.categoria}</span>
                                </div>
                                <h3 className="font-bold text-white text-base">{parceiro.nome}</h3>
                                <p className="text-zinc-500 text-xs">{parceiro.cupons.length} Cupons • {parceiro.responsavel}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            {/* BOTÃO APROVAR (SÓ PENDENTES) */}
                            {parceiro.status === 'pending' && (
                                <button onClick={() => handleApprove(parceiro.id)} className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"><CheckCircle size={14}/> Aprovar</button>
                            )}
                            
                            {/* BOTÃO TOGGLE STATUS (HABILITAR/DESABILITAR) */}
                            {parceiro.status !== 'pending' && (
                                <button onClick={() => handleToggleStatus(parceiro.id, parceiro.status)} className={`flex-1 md:flex-none p-2 rounded-lg transition ${parceiro.status === 'active' ? 'bg-zinc-800 text-emerald-500 hover:bg-zinc-700' : 'bg-zinc-800 text-red-500 hover:bg-zinc-700'}`} title={parceiro.status === 'active' ? "Desativar Empresa" : "Ativar Empresa"}>
                                    <Power size={16}/>
                                </button>
                            )}

                            <button onClick={() => handleOpenEdit(parceiro)} className="flex-1 md:flex-none p-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(parceiro.id)} className="flex-1 md:flex-none p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/40"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* === ABA HISTÓRICO (LINK NO USUÁRIO) === */}
        {activeTab === 'historico' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-black/40 border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                        <tr><th className="p-5">Data/Hora</th><th className="p-5">Empresa</th><th className="p-5">Aluno (Clique p/ Perfil)</th><th className="p-5">Cupom Utilizado</th></tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                        {SCAN_HISTORY_MOCK.map((scan) => (
                            <tr key={scan.id} className="hover:bg-zinc-800/30 transition">
                                <td className="p-5"><div>{scan.data}</div><div className="text-[10px] text-zinc-500">{scan.hora}</div></td>
                                <td className="p-5 font-bold text-white">{scan.empresa}</td>
                                <td className="p-5">
                                    {/* LINK SIMULADO PARA PERFIL */}
                                    <Link href={`/admin/usuarios/${scan.userId}`} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:underline transition group">
                                        <div className="w-6 h-6 rounded-full bg-blue-900/30 flex items-center justify-center text-[10px] text-blue-400 group-hover:bg-blue-900/50">
                                            {scan.usuario.charAt(0)}
                                        </div>
                                        {scan.usuario} <ExternalLink size={10}/>
                                    </Link>
                                </td>
                                <td className="p-5 text-emerald-400 font-medium">{scan.cupom}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* === ABA CADASTROS (DADOS SENSÍVEIS) === */}
        {activeTab === 'cadastros' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-black/40 border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                            <tr><th className="p-5">Empresa</th><th className="p-5">CNPJ</th><th className="p-5">Responsável</th><th className="p-5">Contato</th><th className="p-5">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                            {parceiros.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-800/30 transition">
                                    <td className="p-5 font-bold text-white">{p.nome}</td>
                                    <td className="p-5 font-mono text-xs">{p.cnpj}</td>
                                    <td className="p-5 flex items-center gap-2"><User size={14}/> {p.responsavel}</td>
                                    <td className="p-5 text-xs"><div className="text-emerald-400">{p.email}</div><div>{p.telefone}</div></td>
                                    <td className="p-5"><span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${p.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>{p.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </main>

      {/* --- MODAL DE DETALHES DO PLANO (DRILL DOWN) --- */}
      {showTierModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 p-6 relative">
                  <button onClick={() => setShowTierModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                  <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
                      {tierModalData.tier === 'Ouro' ? <Crown size={18} className="text-yellow-500"/> : tierModalData.tier === 'Prata' ? <Star size={18} className="text-zinc-400"/> : <Shield size={18} className="text-emerald-500"/>}
                      Empresas Plano {tierModalData.tier}
                  </h3>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {tierModalData.list.map(p => (
                          <div key={p.id} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-zinc-800">
                              <span className="text-sm font-bold text-white">{p.nome}</span>
                              <Link href={`/parceiros/${p.id}`} target="_blank" className="text-[10px] bg-zinc-800 hover:bg-zinc-700 px-2 py-1 rounded text-zinc-400 flex items-center gap-1">Ver Página <ExternalLink size={10}/></Link>
                          </div>
                      ))}
                      {tierModalData.list.length === 0 && <p className="text-zinc-500 text-xs text-center py-4">Nenhuma empresa neste plano.</p>}
                  </div>
              </div>
          </div>
      )}

      {/* --- MODAL EDITAR/CRIAR --- */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-5xl rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowPartnerModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
            <h2 className="font-bold text-white text-xl mb-6 border-b border-zinc-800 pb-4 flex items-center gap-2">
                {isEditing ? <Edit className="text-emerald-500"/> : <Plus className="text-emerald-500"/>}
                {isEditing ? `Editar ${currentPartner.nome}` : "Novo Parceiro"}
            </h2>

            {/* FORMULÁRIO DE EDIÇÃO (IGUAL AO ANTERIOR, MANTIDO COMPLETO) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* ESQUERDA: DADOS */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Nome Fantasia" className="input-admin" value={currentPartner.nome} onChange={e => setCurrentPartner({...currentPartner, nome: e.target.value})}/>
                        <input type="text" placeholder="CNPJ" className="input-admin" value={currentPartner.cnpj} onChange={e => setCurrentPartner({...currentPartner, cnpj: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <select className="input-admin text-zinc-300" value={currentPartner.categoria} onChange={e => setCurrentPartner({...currentPartner, categoria: e.target.value})}>{categorias.map(c => <option key={c} value={c}>{c}</option>)}</select>
                        <select className="input-admin font-bold text-yellow-500 bg-yellow-900/10 border-yellow-600/50" value={currentPartner.tier} onChange={e => setCurrentPartner({...currentPartner, tier: e.target.value as any})}><option value="standard">Standard</option><option value="prata">Prata</option><option value="ouro">Ouro</option></select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Responsável" className="input-admin" value={currentPartner.responsavel} onChange={e => setCurrentPartner({...currentPartner, responsavel: e.target.value})}/>
                        <input type="text" placeholder="Tel/Whats" className="input-admin" value={currentPartner.telefone} onChange={e => setCurrentPartner({...currentPartner, telefone: e.target.value})}/>
                    </div>
                    <input type="email" placeholder="Email" className="input-admin" value={currentPartner.email} onChange={e => setCurrentPartner({...currentPartner, email: e.target.value})}/>
                    <textarea placeholder="Descrição" rows={3} className="input-admin" value={currentPartner.descricao} onChange={e => setCurrentPartner({...currentPartner, descricao: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Endereço" className="input-admin" value={currentPartner.endereco} onChange={e => setCurrentPartner({...currentPartner, endereco: e.target.value})}/><input type="text" placeholder="Horário" className="input-admin" value={currentPartner.horario} onChange={e => setCurrentPartner({...currentPartner, horario: e.target.value})}/></div>
                    <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Instagram" className="input-admin" value={currentPartner.insta} onChange={e => setCurrentPartner({...currentPartner, insta: e.target.value})}/><input type="text" placeholder="Site" className="input-admin" value={currentPartner.site} onChange={e => setCurrentPartner({...currentPartner, site: e.target.value})}/></div>
                </div>

                {/* DIREITA: MÍDIA E CUPONS */}
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => logoInputRef.current?.click()} className="bg-zinc-800 border border-dashed border-zinc-600 p-4 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 relative overflow-hidden h-24 flex flex-col items-center justify-center">{currentPartner.imgLogo ? <img src={currentPartner.imgLogo} className="absolute inset-0 w-full h-full object-cover opacity-50"/> : <ImageIcon size={20}/>} Logo</button>
                        <button onClick={() => coverInputRef.current?.click()} className="bg-zinc-800 border border-dashed border-zinc-600 p-4 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 relative overflow-hidden h-24 flex flex-col items-center justify-center">{currentPartner.imgCapa ? <img src={currentPartner.imgCapa} className="absolute inset-0 w-full h-full object-cover opacity-50"/> : <ImageIcon size={20}/>} Capa</button>
                        <input type="file" hidden ref={logoInputRef} onChange={e => handleFileChange(e, 'imgLogo')}/><input type="file" hidden ref={coverInputRef} onChange={e => handleFileChange(e, 'imgCapa')}/>
                    </div>
                    <div className="bg-black/30 p-4 rounded-xl border border-zinc-800">
                        <div className="flex gap-2 mb-2"><input type="text" placeholder="Título Cupom" className="input-admin flex-1" value={newCupom.titulo} onChange={e => setNewCupom({...newCupom, titulo: e.target.value})}/><button onClick={() => cupomInputRef.current?.click()} className="bg-zinc-800 p-2 rounded-lg border border-zinc-700 hover:bg-zinc-600"><ImageIcon size={18}/></button><input type="file" hidden ref={cupomInputRef} onChange={e => handleFileChange(e, '', true)}/></div>
                        <div className="grid grid-cols-2 gap-2 mb-2"><input type="text" placeholder="Regra" className="input-admin" value={newCupom.regra} onChange={e => setNewCupom({...newCupom, regra: e.target.value})}/><input type="text" placeholder="Valor" className="input-admin" value={newCupom.valor} onChange={e => setNewCupom({...newCupom, valor: e.target.value})}/></div>
                        <button onClick={handleAddCupom} className="w-full bg-emerald-600/20 text-emerald-500 border border-emerald-600/50 py-2 rounded-xl text-xs font-bold uppercase hover:bg-emerald-600 hover:text-white transition">Adicionar</button>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {currentPartner.cupons?.map(cupom => (
                            <div key={cupom.id} className="bg-black p-3 rounded-xl border border-zinc-800 flex justify-between items-center"><div className="flex gap-3 items-center"><div className="w-10 h-10 bg-zinc-900 rounded-lg overflow-hidden shrink-0">{cupom.imagem && <img src={cupom.imagem} className="w-full h-full object-cover"/>}</div><div><p className="text-xs font-bold text-white">{cupom.titulo}</p><p className="text-[10px] text-zinc-500">{cupom.valor}</p></div></div><button onClick={() => handleRemoveCupom(cupom.id)} className="text-zinc-600 hover:text-red-500"><X size={14}/></button></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-zinc-800 pt-4">
                <button onClick={() => setShowPartnerModal(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase">Cancelar</button>
                <button onClick={handleSavePartner} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2"><CheckCircle size={16}/> Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOVA CATEGORIA */}
      {showCategoryModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 w-full max-w-sm"><h3 className="font-bold text-white mb-4">Nova Categoria</h3><input type="text" autoFocus placeholder="Ex: Vestuário" className="input-admin mb-4" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}/><div className="flex justify-end gap-2"><button onClick={() => setShowCategoryModal(false)} className="bg-zinc-800 text-zinc-400 px-4 py-2 rounded-lg text-xs font-bold">Cancelar</button><button onClick={handleAddCategory} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold">Adicionar</button></div></div>
          </div>
      )}

      <style jsx global>{`
        .input-admin { width: 100%; background-color: #000; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.75rem; font-size: 0.875rem; color: white; outline: none; transition: border-color 0.2s; }
        .input-admin:focus { border-color: #10b981; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #18181b; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
      `}</style>
    </div>
  );
}