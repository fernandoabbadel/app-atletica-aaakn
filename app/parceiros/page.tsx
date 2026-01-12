"use client";

import React, { useState } from "react";
import {
  Search, MapPin, Star, ChevronRight, Crown, Filter,
  Utensils, Dumbbell, ShoppingBag, Beer, ArrowRight,
  Store, CheckCircle, X, ArrowLeft // <--- ADICIONADO AQUI
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// DADOS MOCKADOS
const PARCEIROS = [
  { id: 1, nome: "Academia Ironberg", beneficio: "15% OFF na Mensalidade", categoria: "Saúde", tier: "ouro", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80", logo: "https://i.pravatar.cc/150?u=iron", distancia: "1.2km" },
  { id: 2, nome: "Açaí do Monstro", beneficio: "Toppings Grátis", categoria: "Alimentação", tier: "prata", image: "https://images.unsplash.com/photo-1590301157890-4810ed357c33?q=80", logo: "https://i.pravatar.cc/150?u=acai", distancia: "0.5km" },
];

const PLANOS = [
    { id: 'ouro', nome: 'Patrocínio Ouro', valor: 'R$ 500/mês', benefits: ['Logo na Camisa', 'Banner Principal', 'Posts Semanais', 'Destaque Máximo'], color: 'yellow' },
    { id: 'prata', nome: 'Patrocínio Prata', valor: 'R$ 250/mês', benefits: ['Logo em Eventos', 'Destaque na Lista', '1 Post Mensal'], color: 'zinc' },
    { id: 'standard', nome: 'Parceiro Standard', valor: 'Grátis', benefits: ['Presença no Clube', 'Validador de QR Code', 'Perfil Básico'], color: 'emerald' },
];

export default function ParceirosPage() {
  const { addToast } = useToast();
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");
  
  // MODAL STATES
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [step, setStep] = useState(1); // 1 = Escolha Plano, 2 = Formulario
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [formData, setFormData] = useState({ nome: "", contato: "", instagram: "", categoria: "Alimentação" });

  const filtered = PARCEIROS.filter(p => (filtro === 'todas' || p.categoria === filtro) && p.nome.toLowerCase().includes(busca.toLowerCase()));
  const parceirosOuro = filtered.filter(p => p.tier === 'ouro');
  const outrosParceiros = filtered.filter(p => p.tier !== 'ouro');

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // AQUI VIRIA A LOGICA DE SALVAR NO FIREBASE COMO "PENDENTE"
      addToast("Solicitação enviada! A diretoria entrará em contato.", "success");
      setShowPartnerModal(false);
      setStep(1);
      setFormData({ nome: "", contato: "", instagram: "", categoria: "Alimentação" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="pt-8 pb-4 px-6 sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <Link href="/menu" className="bg-zinc-900 p-2 rounded-full"><ArrowLeft size={20} className="text-zinc-400"/></Link>
                <div><h1 className="text-2xl font-black uppercase tracking-tighter text-white">Clube <span className="text-emerald-500">AAAKN</span></h1><p className="text-xs text-zinc-400 font-medium">Descontos exclusivos.</p></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center"><Crown size={20} className="text-emerald-500 animate-pulse"/></div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Search size={18} className="text-zinc-500"/></div>
          <input type="text" placeholder="Buscar parceiro..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition placeholder:text-zinc-600" value={busca} onChange={(e) => setBusca(e.target.value)}/>
        </div>
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-2">
          {[{ id: 'todas', label: 'Tudo', icon: Star }, { id: 'Saúde', label: 'Saúde', icon: Dumbbell }, { id: 'Alimentação', label: 'Comer', icon: Utensils }, { id: 'Lazer', label: 'Rolês', icon: Beer }].map(cat => (
            <button key={cat.id} onClick={() => setFiltro(cat.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${filtro === cat.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}><cat.icon size={14}/> {cat.label}</button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-8 mt-4">
        {/* DESTAQUES OURO */}
        {parceirosOuro.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2"><Crown size={14}/> Parceiros Master</h3>
            <div className="space-y-4">
              {parceirosOuro.map(p => (
                <Link href={`/parceiros/${p.id}`} key={p.id} className="block group">
                  <div className="relative h-48 rounded-3xl overflow-hidden border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)] transition transform group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"/>
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div className="absolute top-3 right-3 z-20 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase">Ouro</div>
                    <div className="absolute bottom-0 left-0 w-full p-5 z-20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center overflow-hidden"><img src={p.logo} className="w-full h-full object-cover"/></div>
                        <div><h4 className="text-lg font-black text-white leading-none">{p.nome}</h4><span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1 mt-1"><Star size={10} fill="currentColor"/> Destaque da Semana</span></div>
                      </div>
                      <div className="flex justify-between items-end"><p className="text-zinc-300 text-xs font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">{p.beneficio}</p><div className="bg-yellow-500 p-2 rounded-full text-black"><ArrowRight size={16}/></div></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* LISTA GERAL */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Filter size={14}/> Todos os Parceiros</h3>
          <div className="grid grid-cols-2 gap-3">
            {outrosParceiros.map(p => (
              <Link href={`/parceiros/${p.id}`} key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition group flex flex-col h-full">
                <div className="h-24 overflow-hidden relative">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition z-10"/>
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                  {p.tier === 'prata' && <div className="absolute top-2 right-2 z-20 bg-zinc-400 text-black text-[9px] font-bold px-1.5 py-0.5 rounded">Prata</div>}
                </div>
                <div className="p-3 flex flex-col flex-1">
                  <h4 className="font-bold text-sm text-white mb-1 line-clamp-1">{p.nome}</h4>
                  <p className="text-[10px] text-emerald-400 font-bold mb-2">{p.beneficio}</p>
                  <div className="mt-auto flex items-center justify-between text-[10px] text-zinc-500"><span className="flex items-center gap-1"><MapPin size={10}/> {p.distancia}</span><ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-500 transition"/></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA "QUERO SER PARCEIRO" */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-black p-6 rounded-3xl border border-emerald-500/20 text-center space-y-3 mt-8 mb-20">
          <h3 className="text-lg font-black text-white uppercase">Tem uma empresa?</h3>
          <p className="text-xs text-zinc-400">Torne-se um parceiro oficial da Atlética AAAKN e divulgue sua marca.</p>
          <button onClick={() => setShowPartnerModal(true)} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition shadow-lg w-full">Quero ser Parceiro</button>
        </div>
      </main>

      {/* MODAL DE CADASTRO/PLANOS (MANTIDO E CORRIGIDO) */}
      {showPartnerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 relative my-auto">
                <button onClick={() => setShowPartnerModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={24}/></button>
                
                {step === 1 ? (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white uppercase mb-2">Escolha seu Plano</h2>
                            <p className="text-sm text-zinc-400">Selecione como quer apoiar a Atlética.</p>
                        </div>
                        <div className="space-y-3">
                            {PLANOS.map(plano => (
                                <div key={plano.id} onClick={() => { setSelectedPlan(plano); setStep(2); }} className={`p-4 rounded-2xl border cursor-pointer transition hover:scale-[1.02] flex justify-between items-center ${plano.id === 'ouro' ? 'bg-yellow-900/10 border-yellow-600/50 hover:bg-yellow-900/20' : plano.id === 'prata' ? 'bg-zinc-800/50 border-zinc-600 hover:bg-zinc-800' : 'bg-emerald-900/10 border-emerald-600/50 hover:bg-emerald-900/20'}`}>
                                    <div>
                                        <h4 className={`font-black text-lg ${plano.id === 'ouro' ? 'text-yellow-500' : plano.id === 'prata' ? 'text-zinc-300' : 'text-emerald-500'}`}>{plano.nome}</h4>
                                        <ul className="mt-2 space-y-1">
                                            {plano.benefits.slice(0, 2).map((b, i) => (
                                                <li key={i} className="text-xs text-zinc-400 flex items-center gap-2"><CheckCircle size={12} className={plano.id === 'ouro' ? 'text-yellow-500' : 'text-zinc-500'}/> {b}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-white text-lg">{plano.valor}</span>
                                        <span className="text-[10px] text-zinc-500 uppercase font-bold bg-black px-2 py-1 rounded">Selecionar</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <button type="button" onClick={() => setStep(1)} className="bg-zinc-800 p-2 rounded-full"><ArrowLeft size={16}/></button>
                            <h2 className="text-xl font-black text-white uppercase">Cadastro {selectedPlan?.nome}</h2>
                        </div>
                        
                        <input required type="text" placeholder="Nome da Empresa" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}/>
                        <input required type="text" placeholder="Seu Nome / Contato" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={formData.contato} onChange={e => setFormData({...formData, contato: e.target.value})}/>
                        <input type="text" placeholder="Instagram da Loja (@)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})}/>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <select className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400 focus:border-emerald-500 outline-none" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                                <option value="Alimentação">Alimentação</option><option value="Saúde">Saúde</option><option value="Serviços">Serviços</option><option value="Lazer">Lazer</option>
                            </select>
                            <div className="bg-zinc-800 rounded-xl flex items-center justify-center text-xs font-bold text-zinc-400 border border-zinc-700">Plano: {selectedPlan?.nome}</div>
                        </div>

                        <div className="bg-yellow-900/20 border border-yellow-600/30 p-3 rounded-xl text-[10px] text-yellow-500">
                            * Ao enviar, um administrador entrará em contato para formalizar o contrato e solicitar as imagens.
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95">Enviar Solicitação</button>
                    </form>
                )}
            </div>
        </div>
      )}
    </div>
  );
}