"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, Search, User, CheckCircle, XCircle,
  Edit, Trash2, Crown, DollarSign, Users,
  Phone, Download, ExternalLink, AlertCircle, Loader2, Save, X
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";

// --- TIPAGEM ---
interface Usuario {
    id: string; // UID do Firebase
    nome: string;
    email: string;
    telefone: string;
    turma: string;
    matricula: string;
    status: "ativo" | "inadimplente" | "pendente" | "banned"; // Mapeado de plano_status
    plano: string; // Mapeado de plano_badge
    foto: string;
    totalGasto?: number; // Opcional (calculado via collection assinaturas se quiser, aqui vamos simular ou pegar do user)
    createdAt?: any;
}

export default function AdminUsuariosPage() {
    const { addToast } = useToast();
    
    // Estados
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroPlano, setFiltroPlano] = useState<string>("Todos");
    
    // Modal e Validação
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [phoneError, setPhoneError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    // 1. CARREGAR DADOS DO FIREBASE
    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("nome"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    nome: data.nome || "Sem Nome",
                    email: data.email || "---",
                    telefone: data.telefone || "",
                    turma: data.turma || "---",
                    matricula: data.matricula || "---",
                    status: data.status || data.plano_status || "pendente", // Fallback
                    plano: data.plano_badge || "Não Sócio",
                    foto: data.foto || "https://github.com/shadcn.png",
                    totalGasto: data.xp ? (data.xp * 0.5) : 0 // Simulação de LTV baseado em XP por enquanto
                } as Usuario;
            });
            setUsuarios(usersData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // --- CÁLCULOS DE KPI (MEMOIZED) ---
    const stats = useMemo(() => {
        const total = usuarios.length;
        const ativos = usuarios.filter(u => u.status === 'ativo').length;
        const inadimplentes = usuarios.filter(u => u.status === 'inadimplente').length;
        
        // Contagem por Plano
        const distPlanos: Record<string, number> = {
            "Lenda dos Jogos": 0,
            "Atleta de Bar": 0,
            "Cardume Livre": 0,
            "Bicho Solto": 0
        };

        // Contagem por Turma
        const distTurmas: Record<string, number> = {};

        usuarios.forEach(u => {
            // Planos (Normalização básica)
            if (u.plano.includes("Lenda")) distPlanos["Lenda dos Jogos"]++;
            else if (u.plano.includes("Atleta")) distPlanos["Atleta de Bar"]++;
            else if (u.plano.includes("Cardume")) distPlanos["Cardume Livre"]++;
            else distPlanos["Bicho Solto"]++;

            // Turmas
            const t = u.turma || "Outros";
            distTurmas[t] = (distTurmas[t] || 0) + 1;
        });

        const topTurmas = Object.entries(distTurmas)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 3); // Top 3 Turmas

        return { total, ativos, inadimplentes, distPlanos, topTurmas };
    }, [usuarios]);

    // --- FILTRAGEM ---
    const usuariosFiltrados = usuarios.filter(u => {
        const term = busca.toLowerCase();
        const matchBusca = u.nome.toLowerCase().includes(term) || 
                           u.email.toLowerCase().includes(term) || 
                           u.matricula.toLowerCase().includes(term) ||
                           u.turma.toLowerCase().includes(term);
        
        const matchPlano = filtroPlano === "Todos" ? true : u.plano.includes(filtroPlano); // Includes para pegar "Lenda..."
        return matchBusca && matchPlano;
    });

    // --- AÇÕES ---
    const handleSaveEdit = async () => {
        if (!editingUser) return;

        // Validação Telefone
        const phoneRegex = /^55\d{10,11}$/;
        if (editingUser.telefone && !phoneRegex.test(editingUser.telefone)) {
            setPhoneError("Formato inválido! Use: 55 + DDD + Número. Ex: 5512999998888");
            return;
        }

        setIsSaving(true);
        try {
            await updateDoc(doc(db, "users", editingUser.id), {
                nome: editingUser.nome,
                telefone: editingUser.telefone,
                matricula: editingUser.matricula,
                turma: editingUser.turma,
                status: editingUser.status, // plano_status no banco original, mas mapped aqui
                plano_badge: editingUser.plano, // mapped back
                // Adicione outros campos se necessário
            });
            addToast("Dados do atleta atualizados!", "success");
            setEditingUser(null);
        } catch (error) {
            console.error(error);
            addToast("Erro ao atualizar.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(confirm("🚨 PERIGO: Isso apagará o usuário permanentemente do banco de dados. Confirmar?")) {
            try {
                await deleteDoc(doc(db, "users", id));
                addToast("Usuário deletado.", "info");
            } catch (e) {
                addToast("Erro ao deletar.", "error");
            }
        }
    };

    const handleExportCSV = () => {
        const headers = "ID,Nome,Email,Telefone,Turma,Matricula,Plano,Status\n";
        const rows = usuariosFiltrados.map(u => 
            `${u.id},"${u.nome}",${u.email},${u.telefone},${u.turma},${u.matricula},${u.plano},${u.status}`
        ).join("\n");
        
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `socios_aaakn_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // Helper Cores Status
    const getStatusColor = (s: string) => {
        if (s === 'ativo') return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (s === 'inadimplente') return "text-red-500 bg-red-500/10 border-red-500/20";
        if (s === 'banned') return "text-zinc-500 bg-zinc-800 line-through";
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
            {/* HEADER */}
            <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
                    <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestão de Sócios</h1>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportCSV} className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white transition text-xs font-bold uppercase flex items-center gap-2">
                        <Download size={14}/> CSV
                    </button>
                </div>
            </header>

            <main className="p-6 space-y-8">
                
                {/* --- 1. DASHBOARD DE INTELIGÊNCIA --- */}
                <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CARD 1: VISÃO GERAL PLANOS */}
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col relative overflow-hidden">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Crown size={16} className="text-yellow-500"/> Distribuição de Planos</h3>
                        <div className="flex items-center gap-8">
                            {/* Gráfico CSS Puro (Conic Gradient Dinâmico) */}
                            <div className="relative w-24 h-24 shrink-0 rounded-full border-4 border-black shadow-xl"
                                style={{ 
                                    background: `conic-gradient(
                                        #eab308 0% ${(stats.distPlanos["Lenda dos Jogos"]/stats.total)*100 || 0}%, 
                                        #a855f7 ${(stats.distPlanos["Lenda dos Jogos"]/stats.total)*100 || 0}% ${((stats.distPlanos["Lenda dos Jogos"] + stats.distPlanos["Atleta de Bar"])/stats.total)*100 || 0}%, 
                                        #10b981 ${((stats.distPlanos["Lenda dos Jogos"] + stats.distPlanos["Atleta de Bar"])/stats.total)*100 || 0}% ${((stats.distPlanos["Lenda dos Jogos"] + stats.distPlanos["Atleta de Bar"] + stats.distPlanos["Cardume Livre"])/stats.total)*100 || 0}%,
                                        #3f3f46 ${((stats.distPlanos["Lenda dos Jogos"] + stats.distPlanos["Atleta de Bar"] + stats.distPlanos["Cardume Livre"])/stats.total)*100 || 0}% 100%
                                    )` 
                                }}>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-xs text-zinc-300">Lenda: <strong className="text-white">{stats.distPlanos["Lenda dos Jogos"]}</strong></span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-xs text-zinc-300">Atleta: <strong className="text-white">{stats.distPlanos["Atleta de Bar"]}</strong></span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-xs text-zinc-300">Cardume: <strong className="text-white">{stats.distPlanos["Cardume Livre"]}</strong></span></div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between">
                            <div><p className="text-[10px] text-zinc-500 uppercase font-bold">Total Cadastros</p><p className="text-2xl font-black text-white">{stats.total}</p></div>
                            <div className="text-right"><p className="text-[10px] text-zinc-500 uppercase font-bold">Inadimplentes</p><p className="text-2xl font-black text-red-500">{stats.inadimplentes}</p></div>
                        </div>
                    </div>

                    {/* CARD 2: TURMAS */}
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Users size={16} className="text-blue-500"/> Maiores Turmas</h3>
                        <div className="space-y-4">
                            {stats.topTurmas.map(([turma, count]) => (
                                <div key={turma} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                                        {turma.substring(0,2)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-zinc-300">{turma}</span>
                                            <span className="font-bold text-white">{count}</span>
                                        </div>
                                        <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(count / stats.total) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {stats.topTurmas.length === 0 && <p className="text-zinc-500 text-xs">Sem dados suficientes.</p>}
                        </div>
                    </div>

                    {/* CARD 3: VALIDAÇÃO */}
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><CheckCircle size={16} className="text-emerald-500"/> Status da Base</h3>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-black/30 p-4 rounded-2xl border border-emerald-500/20">
                                <p className="text-3xl font-black text-emerald-500">{Math.round((stats.ativos / (stats.total || 1)) * 100)}%</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Taxa de Ativos</p>
                            </div>
                            <div className="bg-black/30 p-4 rounded-2xl border border-red-500/20">
                                <p className="text-3xl font-black text-red-500">{stats.inadimplentes}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Pendentes</p>
                            </div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-xs text-zinc-400">Total de {stats.total} tubarões registrados.</p>
                        </div>
                    </div>
                </section>

                {/* --- 2. LISTA DE USUÁRIOS --- */}
                <section className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input type="text" placeholder="Buscar por nome, matricula, email..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition" value={busca} onChange={e => setBusca(e.target.value)} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0">
                            {["Todos", "Lenda", "Atleta", "Cardume", "Bicho"].map(plano => (
                                <button key={plano} onClick={() => setFiltroPlano(plano)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase whitespace-nowrap transition border ${filtroPlano === plano ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}>
                                    {plano}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-black/40 text-zinc-500 font-bold uppercase">
                                    <tr>
                                        <th className="p-4">Aluno</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Telefone</th>
                                        <th className="p-4 text-center">Turma</th>
                                        <th className="p-4 text-center">Plano</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                    {loading ? (
                                        <tr><td colSpan={7} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500"/></td></tr>
                                    ) : usuariosFiltrados.length === 0 ? (
                                        <tr><td colSpan={7} className="p-10 text-center text-zinc-500">Nenhum tubarão encontrado.</td></tr>
                                    ) : (
                                        usuariosFiltrados.map(user => (
                                            <tr key={user.id} className="hover:bg-zinc-800/50 transition group">
                                                <td className="p-4">
                                                    <Link href={`/admin/usuarios/${user.id}`} className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 hover:border-emerald-500 transition cursor-pointer shrink-0">
                                                            <img src={user.foto} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "https://github.com/shadcn.png"}/>
                                                        </div>
                                                        <span className="font-bold text-white hover:text-emerald-400 hover:underline transition">{user.nome}</span>
                                                    </Link>
                                                </td>
                                                <td className="p-4 text-zinc-400">{user.email}</td>
                                                <td className="p-4">
                                                    {user.telefone ? (
                                                        <Link href={`https://wa.me/${user.telefone}`} target="_blank" className="flex items-center gap-1 text-green-500 hover:underline font-mono">
                                                            {user.telefone} <ExternalLink size={10}/>
                                                        </Link>
                                                    ) : <span className="text-zinc-600">-</span>}
                                                </td>
                                                <td className="p-4 text-center"><span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{user.turma}</span></td>
                                                <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${user.plano.includes('Lenda') ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>{user.plano}</span></td>
                                                <td className="p-4 text-center">
                                                    <div className={`px-2 py-1 rounded-full border text-[9px] font-bold uppercase inline-flex items-center gap-1 ${getStatusColor(user.status)}`}>
                                                        {user.status === 'ativo' ? <CheckCircle size={10}/> : <AlertCircle size={10}/>} {user.status}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button onClick={() => {setEditingUser(user); setPhoneError("");}} className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded transition"><Edit size={16}/></button>
                                                        <button onClick={() => handleDelete(user.id)} className="text-zinc-400 hover:text-red-500 p-2 hover:bg-zinc-800 rounded transition"><Trash2 size={16}/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>

            {/* MODAL DE EDIÇÃO */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 space-y-6 shadow-2xl relative">
                        <button onClick={() => setEditingUser(null)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                        
                        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Edit size={18} className="text-emerald-500"/> Editar Cadastro</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Nome Completo</label>
                                <input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editingUser.nome} onChange={e => setEditingUser({...editingUser, nome: e.target.value})} />
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Whatsapp (55 + DDD + Numero)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 5512912345678" 
                                    className={`w-full bg-black border rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 ${phoneError ? 'border-red-500' : 'border-zinc-700'}`} 
                                    value={editingUser.telefone} 
                                    onChange={e => {
                                        setEditingUser({...editingUser, telefone: e.target.value});
                                        if(phoneError) setPhoneError("");
                                    }} 
                                />
                                {phoneError && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {phoneError}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Turma</label>
                                    <input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editingUser.turma} onChange={e => setEditingUser({...editingUser, turma: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Matrícula</label>
                                    <input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editingUser.matricula} onChange={e => setEditingUser({...editingUser, matricula: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Plano Atual</label>
                                <select className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editingUser.plano} onChange={e => setEditingUser({...editingUser, plano: e.target.value})}>
                                    <option value="Lenda dos Jogos">Lenda dos Jogos</option>
                                    <option value="Atleta de Bar">Atleta de Bar</option>
                                    <option value="Cardume Livre">Cardume Livre</option>
                                    <option value="Bicho Solto">Bicho Solto</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Status Financeiro</label>
                                <select className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value as any})}>
                                    <option value="ativo">Ativo</option>
                                    <option value="pendente">Pendente</option>
                                    <option value="inadimplente">Inadimplente</option>
                                    <option value="banned">Banido</option>
                                </select>
                            </div>
                        </div>

                        <button onClick={handleSaveEdit} disabled={isSaving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase transition shadow-lg flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Salvar Alterações
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}