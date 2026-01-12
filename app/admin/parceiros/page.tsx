"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft, Plus, Trash2, Megaphone, Percent, ExternalLink,
  LayoutDashboard, QrCode, FileText, Crown, Store, TrendingUp,
  Users, CheckCircle, Search, X, Camera, DollarSign, Wallet,
  Edit, Save, Image as ImageIcon, Instagram, Phone, Globe, Clock, MapPin, Tag
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// MOCKS
const PARCEIROS_MOCK = [
  { id: 1, nome: "Academia Ironberg", beneficio: "15% OFF", categoria: "Saúde", tier: "ouro", acessos: 142, vendas: 4500, status: "active", descricao: "Melhor academia...", endereco: "Rua X", horario: "08-22h", insta: "@iron", whats: "11999", site: "iron.com", imgCapa: "", imgLogo: "", imgCupom: "" },
];

const CATEGORIAS_MOCK = ["Alimentação", "Saúde", "Lazer", "Serviços"];

export default function AdminParceirosPage() {
  const { addToast } = useToast();
  
  // Estados
  const [activeTab, setActiveTab] = useState<"dashboard" | "parceiros" | "historico">("dashboard");
  const [parceiros, setParceiros] = useState(PARCEIROS_MOCK);
  const [categorias, setCategorias] = useState(CATEGORIAS_MOCK);
  
  // Modal Edit/Create
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<any>({});
  
  // Modal Categoria
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCat, setNewCat] = useState("");

  // Refs de Arquivo (Iniciam como nulos)
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const couponInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleOpenEdit = (partner: any) => { setCurrentPartner(partner); setIsEditing(true); setShowModal(true); };
  const handleOpenNew = () => { setCurrentPartner({ nome: "", beneficio: "", categoria: "Alimentação", tier: "standard", status: "active", imgCupom: "" }); setIsEditing(false); setShowModal(true); };

  const handleSave = () => {
      if (!currentPartner.nome) return;
      if (isEditing) {
          setParceiros(prev => prev.map(p => p.id === currentPartner.id ? { ...currentPartner } : p));
          addToast("Atualizado com sucesso!", "success");
      } else {
          setParceiros(prev => [...prev, { ...currentPartner, id: Date.now(), acessos: 0, vendas: 0 }]);
          addToast("Novo Tubarão-Parceiro criado!", "success");
      }
      setShowModal(false);
  };

  const handleDelete = (id: number) => { if (confirm("Remover?")) { setParceiros(prev => prev.filter(p => p.id !== id)); addToast("Removido.", "info"); } };
  const handleAddCategory = () => { if(newCat) { setCategorias([...categorias, newCat]); setNewCat(""); setShowCatModal(false); addToast("Categoria criada!", "success"); }};

  // --- CORREÇÃO DO ERRO DE TIPO AQUI ---
  // Agora aceita 'HTMLInputElement | null' explicitamente
  const handleFileClick = (ref: React.RefObject<HTMLInputElement | null>) => { 
      ref.current?.click(); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      if (e.target.files?.[0]) {
          // Aqui faria o upload real. Simulamos apenas visualmente com URL local.
          addToast(`Arquivo para ${field} selecionado!`, "success");
          setCurrentPartner({ ...currentPartner, [field]: URL.createObjectURL(e.target.files[0]) });
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center shadow-lg">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2"><Store className="text-emerald-500" /> Admin Parceiros</h1><p className="text-[11px] text-zinc-500 font-medium">Gestão Comercial</p></div>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowCatModal(true)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2"><Tag size={16}/> Categoria</button>
            <button onClick={handleOpenNew} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg"><Plus size={16} /> Novo Parceiro</button>
        </div>
      </header>

      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto scrollbar-hide">
              {[{ id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard }, { id: 'parceiros', label: 'Empresas', icon: Store }, { id: 'historico', label: 'Histórico Scans', icon: FileText }].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 text-xs font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white hover:border-zinc-700'}`}><tab.icon size={16}/> {tab.label}</button>
              ))}
          </div>
      </div>

      <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* DASHBOARD MOCK */}
        {activeTab === 'dashboard' && <div className="grid grid-cols-1 md:grid-cols-3 gap-4"><div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl">Vendas: R$ 14k</div></div>}

        {/* LISTA PARCEIROS */}
        {activeTab === 'parceiros' && (
            <div className="grid grid-cols-1 gap-4">
                {parceiros.map((parceiro) => (
                    <div key={parceiro.id} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center font-bold text-zinc-600 overflow-hidden">
                                {parceiro.imgLogo ? <img src={parceiro.imgLogo} className="w-full h-full object-cover"/> : parceiro.nome.charAt(0)}
                            </div>
                            <div><h3 className="font-bold text-white">{parceiro.nome}</h3><span className="text-xs text-zinc-500">{parceiro.categoria} • {parceiro.tier}</span></div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleOpenEdit(parceiro)} className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700"><Edit size={16}/></button>
                            <button onClick={() => handleDelete(parceiro.id)} className="p-2 bg-red-900/20 text-red-500 rounded-lg hover:bg-red-900/40"><Trash2 size={16}/></button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </main>

      {/* MODAL PRINCIPAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-3xl rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
            <h2 className="font-bold text-white text-xl mb-6 border-b border-zinc-800 pb-4">{isEditing ? `Editar ${currentPartner.nome}` : "Novo Parceiro"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Informações Básicas</label>
                    <input type="text" placeholder="Nome Fantasia" className="input-admin" value={currentPartner.nome} onChange={e => setCurrentPartner({...currentPartner, nome: e.target.value})}/>
                    <div className="grid grid-cols-2 gap-2">
                        <select className="input-admin text-zinc-400" value={currentPartner.categoria} onChange={e => setCurrentPartner({...currentPartner, categoria: e.target.value})}>
                            {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className="input-admin text-zinc-400" value={currentPartner.tier} onChange={e => setCurrentPartner({...currentPartner, tier: e.target.value})}><option value="ouro">Ouro</option><option value="prata">Prata</option><option value="standard">Standard</option></select>
                    </div>
                    <textarea placeholder="Descrição Completa" rows={3} className="input-admin" value={currentPartner.descricao} onChange={e => setCurrentPartner({...currentPartner, descricao: e.target.value})}/>
                </div>

                <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Benefício & Cupom</label>
                    <input type="text" placeholder="Texto do Benefício (ex: 15% OFF)" className="input-admin text-emerald-400 font-bold" value={currentPartner.beneficio} onChange={e => setCurrentPartner({...currentPartner, beneficio: e.target.value})}/>
                    <div className="flex gap-2">
                        <button onClick={() => handleFileClick(couponInputRef)} className="flex-1 bg-zinc-800 border border-dashed border-zinc-600 p-3 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 flex items-center justify-center gap-2"><ImageIcon size={16}/> Foto do Cupom</button>
                        <input type="file" hidden ref={couponInputRef} onChange={(e) => handleFileChange(e, 'imgCupom')}/>
                    </div>
                </div>

                <div className="space-y-4 md:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">Mídia e Localização</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => handleFileClick(logoInputRef)} className="bg-zinc-800 border border-dashed border-zinc-600 p-4 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 text-center"><ImageIcon size={24} className="mx-auto mb-2"/>Upload Logo</button>
                        <button onClick={() => handleFileClick(coverInputRef)} className="bg-zinc-800 border border-dashed border-zinc-600 p-4 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 text-center"><ImageIcon size={24} className="mx-auto mb-2"/>Upload Capa</button>
                        <input type="file" hidden ref={logoInputRef} onChange={(e) => handleFileChange(e, 'imgLogo')}/>
                        <input type="file" hidden ref={coverInputRef} onChange={(e) => handleFileChange(e, 'imgCapa')}/>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="Instagram" className="input-admin" value={currentPartner.insta} onChange={e => setCurrentPartner({...currentPartner, insta: e.target.value})}/>
                        <input type="text" placeholder="WhatsApp" className="input-admin" value={currentPartner.whats} onChange={e => setCurrentPartner({...currentPartner, whats: e.target.value})}/>
                    </div>
                </div>
            </div>

            <button onClick={handleSave} className="w-full py-4 mt-6 rounded-xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-500 shadow-lg">Salvar Dados</button>
          </div>
        </div>
      )}

      {/* MODAL NOVA CATEGORIA */}
      {showCatModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-6">
              <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-xs border border-zinc-800">
                  <h3 className="text-white font-bold mb-4">Nova Categoria</h3>
                  <input type="text" className="input-admin mb-4" placeholder="Ex: Vestuário" value={newCat} onChange={e => setNewCat(e.target.value)} autoFocus/>
                  <div className="flex gap-2">
                      <button onClick={() => setShowCatModal(false)} className="flex-1 bg-zinc-800 p-2 rounded-lg text-xs font-bold text-zinc-400">Cancelar</button>
                      <button onClick={handleAddCategory} className="flex-1 bg-emerald-600 p-2 rounded-lg text-xs font-bold text-white">Adicionar</button>
                  </div>
              </div>
          </div>
      )}

      <style jsx global>{`
        .input-admin { width: 100%; background-color: #000; border: 1px solid #27272a; border-radius: 0.75rem; padding: 0.75rem; font-size: 0.875rem; color: white; outline: none; }
        .input-admin:focus { border-color: #10b981; }
      `}</style>
    </div>
  );
}