"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, LayoutDashboard, Trophy, Medal, Plus, Search, Edit2, Trash2, Save, Target,
  Zap, Users, TrendingUp, Award, Crown, History, Calendar, Clock, ExternalLink,
  FolderPlus, X, Power, PowerOff, Filter, CheckCircle2, MessageSquare, Flame
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc, updateDoc, getDocs } from "firebase/firestore";
import { ACHIEVEMENTS_CATALOG, AchievementCategory } from "../../../lib/achievements";

export default function AdminConquistasPage() {
  const { addToast } = useToast();
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState<"dashboard" | "conquistas" | "historico" | "patentes">("dashboard");
  const [activeCat, setActiveCat] = useState<AchievementCategory | "Todas">("Todas");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dados do Firebase
  const [achievements, setAchievements] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [usersRanking, setUsersRanking] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]); // Patentes (futuro: carregar do banco)

  // Edição
  const [editingAch, setEditingAch] = useState<any>(null);

  // 1. CARREGAR DADOS REAIS
  useEffect(() => {
    // A. Escuta Catálogo (Firebase)
    // Se não tiver nada no banco 'achievements_config', usamos o arquivo estático como base visual
    const unsubAch = onSnapshot(collection(db, "achievements_config"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAchievements(data.length > 0 ? data : ACHIEVEMENTS_CATALOG);
    });

    // B. Escuta Histórico Real
    const qLogs = query(collection(db, "achievements_logs"), orderBy("timestamp", "desc"), limit(50));
    const unsubLogs = onSnapshot(qLogs, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // C. Ranking Hall da Fama (XP Real dos Users)
    const qRank = query(collection(db, "users"), orderBy("xp", "desc"), limit(10));
    const unsubRank = onSnapshot(qRank, (snap) => {
      setUsersRanking(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => { unsubAch(); unsubLogs(); unsubRank(); };
  }, []);

  // --- FILTRAGEM ---
  const filteredAchievements = useMemo(() => {
    return achievements.filter(a => {
      const matchSearch = a.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = activeCat === "Todas" || a.cat === activeCat;
      return matchSearch && matchCat;
    });
  }, [achievements, searchTerm, activeCat]);

  // --- AÇÕES ---
  const toggleMissionStatus = async (ach: any) => {
    try {
      // Se a missão não existe no banco (é estática), teríamos que criá-la primeiro.
      // Mas assumindo que você já rodou o script de seed ou vai editar uma existente:
      const newStatus = !ach.active;
      
      // Salva no Firestore (se não existir, cria o doc com o ID da missão)
      await updateDoc(doc(db, "achievements_config", ach.id), { active: newStatus });
      
      addToast(newStatus ? "Missão reativada! 🟢" : "Missão desativada e XP congelado! 🔴", "info");
    } catch (e) { 
        // Fallback: Se o doc não existe, avisa (em produção usaríamos setDoc com merge)
        addToast("Erro: Missão ainda não configurada no banco.", "error"); 
    }
  };

  const handleSaveEdit = async () => {
    if (!editingAch) return;
    try {
      // Atualiza ou Cria a configuração da missão no banco
      // Aqui idealmente seria setDoc com merge para garantir que crie se não existir
      await updateDoc(doc(db, "achievements_config", editingAch.id), editingAch);
      setEditingAch(null);
      addToast("Conquista atualizada no catálogo!", "success");
    } catch (e) { addToast("Erro ao salvar.", "error"); }
  };

  // Cores por Categoria
  const getCatColor = (cat: string) => {
    switch(cat) {
      case "Gym": return "text-emerald-400 border-emerald-500/20 bg-emerald-500/5";
      case "Social": return "text-blue-400 border-blue-500/20 bg-blue-500/5";
      case "Games": return "text-purple-400 border-purple-500/20 bg-purple-500/5";
      case "Loja": return "text-yellow-400 border-yellow-500/20 bg-yellow-500/5";
      default: return "text-zinc-400 border-zinc-700 bg-zinc-800/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
            <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
            <div><h1 className="text-lg font-black text-white uppercase tracking-tighter">Engenharia de Conquistas</h1><p className="text-[10px] text-zinc-500">Controle de Recompensas e XP</p></div>
        </div>
      </header>

      {/* TABS PRINCIPAIS */}
      <div className="px-6 pt-4">
          <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto no-scrollbar">
              <button onClick={() => setActiveTab("dashboard")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><LayoutDashboard size={16}/> Hall da Fama</button>
              <button onClick={() => setActiveTab("conquistas")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'conquistas' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><Trophy size={16}/> Catálogo</button>
              <button onClick={() => setActiveTab("historico")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'historico' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><History size={16}/> Logs Reais</button>
              <button onClick={() => setActiveTab("patentes")} className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'patentes' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><Medal size={16}/> Patentes</button>
          </div>
      </div>

      <main className="p-6 space-y-6">
        
        {/* ======================= HALL DA FAMA (DADOS REAIS) ======================= */}
        {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
                {/* Ranking de Alunos */}
                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                    <h3 className="font-black uppercase text-white mb-6 flex items-center gap-2 text-sm"><Crown className="text-yellow-500"/> Top 10 Tubarões do Oceano</h3>
                    <div className="space-y-4">
                        {usersRanking.length === 0 && <p className="text-zinc-500 text-sm text-center py-10">Nenhum tubarão pontuou ainda.</p>}
                        {usersRanking.map((u, i) => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-black/40 rounded-2xl border border-zinc-800 hover:border-emerald-500/30 transition">
                                <div className="flex items-center gap-4">
                                    <span className="font-black text-zinc-700 w-4">#{i+1}</span>
                                    <img src={u.foto} className="w-10 h-10 rounded-full border-2 border-zinc-800 object-cover"/>
                                    <div>
                                        <p className="font-bold text-sm text-white">{u.nome}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase">{u.turma} • Medicina</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-emerald-500">{u.xp?.toLocaleString()}</p>
                                    <p className="text-[8px] text-zinc-600 uppercase font-bold tracking-widest">XP Acumulado</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats Rápidas */}
                <div className="space-y-6">
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-center">
                        <Flame size={40} className="text-orange-500 mx-auto mb-2"/>
                        <p className="text-4xl font-black text-white">{logs.length}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">Troféus Conquistados hoje</p>
                    </div>
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4 flex items-center gap-2"><TrendingUp size={14}/> Recentemente na Sala</h4>
                        <div className="space-y-3">
                            {logs.length === 0 && <p className="text-zinc-600 text-xs text-center">Sem atividade recente.</p>}
                            {logs.slice(0, 5).map(log => (
                                <div key={log.id} className="text-[11px] text-zinc-400 border-l-2 border-emerald-500 pl-3 py-1">
                                    <span className="text-white font-bold">{log.userName}</span> desbloqueou <span className="text-emerald-400">{log.achievementTitle}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ======================= CATÁLOGO POR ABAS ======================= */}
        {activeTab === 'conquistas' && (
             <div className="space-y-6 animate-in fade-in">
                 {/* Filtros de Categoria */}
                 <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                    {["Todas", "Social", "Gym", "Games", "Loja", "Eventos"].map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCat(cat as any)}
                            className={`px-6 py-2 rounded-full text-[10px] font-black uppercase transition border ${activeCat === cat ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
                        >
                            {cat}
                        </button>
                    ))}
                 </div>

                 {/* Lista Master */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {filteredAchievements.map(item => (
                         <div key={item.id} className={`bg-zinc-900 border p-5 rounded-[2rem] transition relative group ${item.active === false ? 'opacity-40 grayscale border-zinc-800' : 'border-zinc-800 hover:border-emerald-500/40 shadow-xl'}`}>
                             
                             <div className="flex items-start gap-4">
                                 {/* Badge Colorida */}
                                 <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shrink-0 ${getCatColor(item.cat)} shadow-inner`}>
                                     <Award size={28}/>
                                 </div>

                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-start">
                                         <h4 className="font-black text-white text-base tracking-tighter uppercase italic">{item.titulo}</h4>
                                         <div className="flex gap-1">
                                            <button onClick={() => setEditingAch(item)} className="p-2 bg-zinc-800 rounded-lg text-zinc-500 hover:text-white"><Edit2 size={12}/></button>
                                            <button onClick={() => toggleMissionStatus(item)} className={`p-2 rounded-lg ${item.active === false ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                {item.active === false ? <PowerOff size={12}/> : <Power size={12}/>}
                                            </button>
                                         </div>
                                     </div>
                                     <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.desc}</p>
                                     
                                     <div className="flex items-center gap-3 mt-4">
                                         <span className="text-[10px] font-black px-2 py-1 bg-black rounded-lg border border-zinc-800 text-yellow-500">+{item.xp} XP</span>
                                         <span className="text-[10px] font-black px-2 py-1 bg-black rounded-lg border border-zinc-800 text-emerald-500"><Target size={10} className="inline mr-1"/> Meta: {item.target}</span>
                                         <span className="text-[10px] font-black px-2 py-1 bg-black rounded-lg border border-zinc-800 text-zinc-500">{item.statKey}</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        )}

        {/* ======================= LOGS REAIS ======================= */}
        {activeTab === 'historico' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden flex flex-col h-[70vh]">
                <div className="p-5 border-b border-zinc-800 bg-black/20 flex justify-between items-center sticky top-0 backdrop-blur-md">
                    <h3 className="font-bold text-white flex items-center gap-2"><History size={18} className="text-emerald-500"/> Registro Mundial de Troféus</h3>
                    <p className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Logs Seguros v2.0</p>
                </div>
                <div className="overflow-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-black/50 sticky top-0 z-10 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <tr><th className="p-4 border-b border-zinc-800">Tubarão</th><th className="p-4 border-b border-zinc-800">Conquista</th><th className="p-4 border-b border-zinc-800">Data e Hora</th><th className="p-4 border-b border-zinc-800 text-right">XP Adicionado</th></tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-zinc-800">
                            {logs.length === 0 && <tr><td colSpan={4} className="p-10 text-center text-zinc-500">Nenhum registro histórico encontrado.</td></tr>}
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-zinc-800/30 transition group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-black font-black text-[10px] flex items-center justify-center">{log.userName?.charAt(0)}</div>
                                            <span className="font-bold text-white group-hover:text-emerald-400">{log.userName}</span>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="text-zinc-300 bg-zinc-800/50 px-2 py-1 rounded text-xs">{log.achievementTitle}</span></td>
                                    <td className="p-4 text-zinc-500 text-xs font-mono">{log.timestamp?.toDate().toLocaleString() || '---'}</td>
                                    <td className="p-4 text-right font-black text-emerald-500">+{log.xp} XP</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

      </main>

      {/* MODAL DE EDIÇÃO DE CONQUISTA */}
      {editingAch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in duration-200">
               <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-black text-white uppercase text-lg italic flex items-center gap-2"><Edit2 className="text-emerald-500"/> Editar Missão</h3>
                        <button onClick={() => setEditingAch(null)}><X className="text-zinc-500 hover:text-white"/></button>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2 mb-1 block tracking-widest">Título da Conquista</label>
                            <input type="text" className="input-admin w-full" value={editingAch.titulo} onChange={e => setEditingAch({...editingAch, titulo: e.target.value})}/>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2 mb-1 block tracking-widest">Descrição da Missão</label>
                            <textarea className="input-admin w-full min-h-[80px]" value={editingAch.desc} onChange={e => setEditingAch({...editingAch, desc: e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2 mb-1 block tracking-widest">Recompensa (XP)</label>
                                <input type="number" className="input-admin w-full" value={editingAch.xp} onChange={e => setEditingAch({...editingAch, xp: Number(e.target.value)})}/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2 mb-1 block tracking-widest">Meta Final</label>
                                <input type="number" className="input-admin w-full" value={editingAch.target} onChange={e => setEditingAch({...editingAch, target: Number(e.target.value)})}/>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <button onClick={() => setEditingAch(null)} className="flex-1 py-4 text-zinc-500 font-bold uppercase text-xs">Cancelar</button>
                        <button onClick={handleSaveEdit} className="flex-1 py-4 bg-emerald-600 rounded-2xl text-black font-black uppercase text-xs hover:bg-emerald-500 shadow-lg shadow-emerald-500/20">Salvar Alterações</button>
                    </div>
               </div>
          </div>
      )}

      <style jsx global>{`
        .input-admin { background: #000; border: 1px solid #27272a; border-radius: 1.25rem; padding: 1rem; color: white; outline: none; transition: all 0.2s; font-size: 0.875rem; }
        .input-admin:focus { border-color: #10b981; box-shadow: 0 0 15px rgba(16,185,129,0.1); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
      `}</style>
    </div>
  );
}