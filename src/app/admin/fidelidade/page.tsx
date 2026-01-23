"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Plus, Trash2, Edit2, Star, Gift, LayoutDashboard,
  ScrollText, Save, Users, TrendingUp, Info, X, Loader2
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, addDoc, query, orderBy, limit } from "firebase/firestore";

export default function AdminFidelidadePage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"dashboard" | "premios" | "regras">("dashboard");

  // --- ESTADOS REAIS ---
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [config, setConfig] = useState({ xpPerStamp: 100, rules: [] as string[] });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReward, setNewReward] = useState({ title: "", cost: "", stock: "", image: "" });

  // 1. CARREGAR DADOS
  useEffect(() => {
    // A. Prêmios
    const unsubRewards = onSnapshot(collection(db, "store_rewards"), (snap) => {
        setRewards(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // B. Configuração
    const unsubConfig = onSnapshot(doc(db, "app_config", "fidelity"), (snap) => {
        if(snap.exists()) {
            setConfig({ 
                xpPerStamp: snap.data().xpPerStamp || 100, 
                rules: snap.data().rules || [] 
            });
        }
    });

    // C. Top Users (Ranking por XP)
    const qUsers = query(collection(db, "users"), orderBy("xp", "desc"), limit(5));
    const unsubUsers = onSnapshot(qUsers, (snap) => {
        setTopUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
    });

    return () => { unsubRewards(); unsubConfig(); unsubUsers(); };
  }, []);

  // --- AÇÕES ---

  const handleAddReward = async () => {
    if (!newReward.title || !newReward.cost) return addToast("Preencha título e custo!", "error");
    
    try {
        await addDoc(collection(db, "store_rewards"), {
            title: newReward.title,
            cost: Number(newReward.cost),
            stock: Number(newReward.stock || 0),
            image: newReward.image || "https://placehold.co/400x400/000/FFF?text=Premio",
            active: true,
            createdAt: new Date()
        });
        setIsModalOpen(false);
        setNewReward({ title: "", cost: "", stock: "", image: "" });
        addToast("Prêmio adicionado!", "success");
    } catch (e) {
        addToast("Erro ao adicionar.", "error");
    }
  };

  const handleDeleteReward = async (id: string) => {
    if (confirm("Remover este prêmio permanentemente?")) {
        await deleteDoc(doc(db, "store_rewards", id));
        addToast("Item removido.", "info");
    }
  };

  // Funções de Regra
  const handleUpdateRuleText = (index: number, value: string) => {
    const newRules = [...config.rules];
    newRules[index] = value;
    setConfig({ ...config, rules: newRules });
  };

  const handleAddRuleLine = () => {
    setConfig({ ...config, rules: [...config.rules, "Nova regra..."] });
  };

  const handleDeleteRuleLine = (index: number) => {
    const newRules = config.rules.filter((_, i) => i !== index);
    setConfig({ ...config, rules: newRules });
  };

  const handleSaveConfig = async () => {
    try {
        await setDoc(doc(db, "app_config", "fidelity"), config, { merge: true });
        addToast("Configurações salvas!", "success");
    } catch (e) {
        addToast("Erro ao salvar config.", "error");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition border border-zinc-800">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">Admin Fidelidade</h1>
            <p className="text-[10px] text-zinc-500">Gestão do Shark Card</p>
          </div>
        </div>
        {activeTab === "premios" && (
          <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Plus size={16} /> Novo Prêmio
          </button>
        )}
      </header>

      {/* NAV */}
      <div className="px-6 pt-4">
        <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto">
          {["dashboard", "premios", "regras"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-white"}`}>
                  {tab === 'dashboard' && <LayoutDashboard size={16}/>}
                  {tab === 'premios' && <Gift size={16}/>}
                  {tab === 'regras' && <ScrollText size={16}/>}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
          ))}
        </div>
      </div>

      <main className="p-6 space-y-6">
        {/* DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start mb-2"><span className="text-zinc-500 text-[10px] font-bold uppercase">XP Total da Base</span><Star size={16} className="text-yellow-500" /></div>
                <span className="text-3xl font-black text-white">{topUsers.reduce((acc, u) => acc + (u.xp || 0), 0).toLocaleString()}</span>
              </div>
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start mb-2"><span className="text-zinc-500 text-[10px] font-bold uppercase">Prêmios Ativos</span><Gift size={16} className="text-purple-500" /></div>
                <span className="text-3xl font-black text-white">{rewards.filter(r => r.active).length}</span>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden col-span-1 lg:col-span-2">
              <div className="p-5 border-b border-zinc-800 bg-black/20"><h3 className="font-bold text-white flex items-center gap-2"><Users size={18} className="text-emerald-500" /> Top Acumuladores (XP)</h3></div>
              <div className="divide-y divide-zinc-800">
                {topUsers.map((u, i) => (
                  <div key={u.id} className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition">
                    <div className="flex items-center gap-4">
                      <span className={`font-black w-6 text-center ${i === 0 ? "text-yellow-500" : "text-zinc-500"}`}>#{i + 1}</span>
                      <img src={u.foto || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full border border-zinc-700 object-cover" />
                      <div><p className="font-bold text-sm text-white">{u.nome}</p><p className="text-[10px] text-zinc-500">{u.turma}</p></div>
                    </div>
                    <div className="text-right">
                        <span className="block font-black text-lg text-white">{Math.floor((u.xp || 0) / config.xpPerStamp)} Selos</span>
                        <span className="text-[8px] text-zinc-600 uppercase font-bold">Baseado em XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRÊMIOS */}
        {activeTab === "premios" && (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div key={reward.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 group items-center">
                <div className="w-20 h-20 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-800"><img src={reward.image} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "/logo.png"} /></div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-white">{reward.title}</h3>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1 inline-block ${reward.stock <= 3 ? "bg-red-500/20 text-red-500" : "bg-emerald-500/10 text-emerald-500"}`}>Estoque: {reward.stock}</span>
                    </div>
                    <div className="bg-zinc-950 px-3 py-1 rounded text-xs font-mono font-bold text-yellow-500 border border-yellow-500/10">{reward.cost} XP</div>
                  </div>
                </div>
                <button onClick={() => handleDeleteReward(reward.id)} className="p-2 bg-zinc-800 hover:bg-red-900/50 rounded-lg text-zinc-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {/* REGRAS */}
        {activeTab === "regras" && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-500/10 p-2 rounded-lg"><TrendingUp size={24} className="text-yellow-500" /></div>
                <div><h3 className="font-bold text-white text-lg">Dificuldade</h3><p className="text-xs text-zinc-400">XP necessário para 1 selo.</p></div>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-end mb-2"><span className="text-xs font-bold text-zinc-500 uppercase">Fator de Conversão</span><span className="text-2xl font-black text-emerald-400 font-mono">{config.xpPerStamp} XP <span className="text-xs text-zinc-500 font-normal">= 1 Selo</span></span></div>
                <input type="range" min="50" max="500" step="50" value={config.xpPerStamp} onChange={(e) => setConfig({...config, xpPerStamp: Number(e.target.value)})} className="w-full accent-emerald-500 h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
                <div className="flex justify-between mb-4">
                    <h3 className="font-bold text-white">Regras do App</h3>
                    <button onClick={handleAddRuleLine} className="text-xs bg-zinc-800 px-3 py-1.5 rounded-lg text-white font-bold">+ Nova Linha</button>
                </div>
                <div className="space-y-3">
                    {config.rules.map((rule, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                            <span className="text-zinc-500 font-bold text-xs">{idx+1}</span>
                            <input type="text" value={rule} onChange={(e) => handleUpdateRuleText(idx, e.target.value)} className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 outline-none" />
                            <button onClick={() => handleDeleteRuleLine(idx)} className="p-2 text-red-500"><Trash2 size={16}/></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="fixed bottom-6 right-6 z-40">
                <button onClick={handleSaveConfig} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-full shadow-lg flex items-center gap-3 font-bold text-lg"><Save size={24} /> Salvar</button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL NOVO PRÊMIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 space-y-5 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20} /></button>
            <h3 className="font-bold text-xl text-white text-center">Novo Item</h3>
            <div className="space-y-3">
                <input type="text" placeholder="Nome do Produto" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none" value={newReward.title} onChange={(e) => setNewReward({...newReward, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                    <input type="number" placeholder="Custo (XP)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none" value={newReward.cost} onChange={(e) => setNewReward({...newReward, cost: e.target.value})} />
                    <input type="number" placeholder="Estoque" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none" value={newReward.stock} onChange={(e) => setNewReward({...newReward, stock: e.target.value})} />
                </div>
                <input type="text" placeholder="URL da Imagem" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white outline-none text-xs" value={newReward.image} onChange={(e) => setNewReward({...newReward, image: e.target.value})} />
            </div>
            <button onClick={handleAddReward} className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-bold uppercase text-xs">Adicionar</button>
          </div>
        </div>
      )}
    </div>
  );
}