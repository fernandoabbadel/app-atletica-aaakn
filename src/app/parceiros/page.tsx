"use client";

import React, { useState } from "react";
import {
  Search, MapPin, Star, ChevronRight, Crown, Filter,
  Utensils, Dumbbell, ShoppingBag, Beer, ArrowRight,
  Store, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// DADOS MOCKADOS (O que o aluno vê)
const PARCEIROS = [
  { 
    id: 1, 
    nome: "Academia Ironberg", 
    beneficio: "15% OFF na Mensalidade", 
    categoria: "Saúde", 
    tier: "ouro", 
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop", 
    logo: "https://i.pravatar.cc/150?u=iron", 
    distancia: "1.2km" 
  },
  { 
    id: 2, 
    nome: "Açaí do Monstro", 
    beneficio: "Toppings Grátis", 
    categoria: "Alimentação", 
    tier: "prata", 
    image: "https://images.unsplash.com/photo-1590301157890-4810ed357c33?q=80&w=1000&auto=format&fit=crop", 
    logo: "https://i.pravatar.cc/150?u=acai", 
    distancia: "0.5km" 
  },
  { 
    id: 3, 
    nome: "Bar do Zé", 
    beneficio: "Dose Dupla Gin", 
    categoria: "Lazer", 
    tier: "standard", 
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000&auto=format&fit=crop", 
    logo: "https://i.pravatar.cc/150?u=bar", 
    distancia: "200m" 
  },
];

const CATEGORIAS = [
  { id: 'todas', label: 'Tudo', icon: Star },
  { id: 'Saúde', label: 'Saúde', icon: Dumbbell },
  { id: 'Alimentação', label: 'Comer', icon: Utensils },
  { id: 'Lazer', label: 'Rolês', icon: Beer },
];

export default function ParceirosPage() {
  const router = useRouter(); 
  const [filtro, setFiltro] = useState("todas");
  const [busca, setBusca] = useState("");

  const filtered = PARCEIROS.filter(p => {
    const matchCat = filtro === 'todas' || p.categoria === filtro;
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const parceirosOuro = filtered.filter(p => p.tier === 'ouro');
  const outrosParceiros = filtered.filter(p => p.tier !== 'ouro');

  return (
    <div className="min-h-screen bg-black text-white font-sans pb-24 selection:bg-emerald-500">
      
      {/* HEADER DA VITRINE */}
      <header className="pt-8 pb-4 px-6 sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <Link href="/menu" className="bg-zinc-900 p-2 rounded-full border border-zinc-800 hover:bg-zinc-800 transition">
                <ArrowLeft size={20} className="text-zinc-400"/>
             </Link>
             <div>
                <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
                  Clube <span className="text-emerald-500">AAAKN</span>
                </h1>
                <p className="text-xs text-zinc-400 font-medium">Descontos exclusivos.</p>
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center">
            <Crown size={20} className="text-emerald-500 animate-pulse"/>
          </div>
        </div>

        {/* BUSCA */}
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search size={18} className="text-zinc-500"/>
          </div>
          <input 
            type="text" 
            placeholder="Buscar parceiro..." 
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition placeholder:text-zinc-600"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* FILTROS */}
        <div className="flex gap-3 mt-4 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIAS.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setFiltro(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition border ${filtro === cat.id ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
            >
              <cat.icon size={14}/> {cat.label}
            </button>
          ))}
        </div>
      </header>

      <main className="px-6 space-y-8 mt-4">
        
        {/* SEÇÃO OURO (CARDS GRANDES) */}
        {parceirosOuro.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
              <Crown size={14}/> Parceiros Master
            </h3>
            <div className="space-y-4">
              {parceirosOuro.map(p => (
                <Link href={`/parceiros/${p.id}`} key={p.id} className="block group">
                  <div className="relative h-48 rounded-3xl overflow-hidden border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)] transition transform group-hover:scale-[1.02]">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"/>
                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    
                    <div className="absolute top-3 right-3 z-20 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg uppercase">
                      Ouro
                    </div>

                    <div className="absolute bottom-0 left-0 w-full p-5 z-20">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-black border-2 border-yellow-500 flex items-center justify-center overflow-hidden">
                          <img src={p.logo} className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <h4 className="text-lg font-black text-white leading-none">{p.nome}</h4>
                          <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-1 mt-1">
                            <Star size={10} fill="currentColor"/> Destaque da Semana
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-zinc-300 text-xs font-medium bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                          {p.beneficio}
                        </p>
                        <div className="bg-yellow-500 p-2 rounded-full text-black">
                          <ArrowRight size={16}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* LISTA GERAL (GRID) */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <Filter size={14}/> Todos os Parceiros
          </h3>
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
                  <div className="mt-auto flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1"><MapPin size={10}/> {p.distancia}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-emerald-500 transition"/>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA: ÁREA DA EMPRESA */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-black p-6 rounded-3xl border border-emerald-500/20 text-center space-y-3 mt-8 mb-20">
          <h3 className="text-lg font-black text-white uppercase">Tem uma empresa?</h3>
          <p className="text-xs text-zinc-400">Torne-se um parceiro oficial da Atlética AAAKN e divulgue sua marca.</p>
          
          <button 
            onClick={() => router.push('/empresa')} 
            className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition shadow-lg w-full flex items-center justify-center gap-2"
          >
            <Store size={16}/> Sou uma Empresa Parceira
          </button>
        </div>

      </main>
    </div>
  );
}