"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Search, User, CheckCircle, XCircle,
  Edit, Trash2, Crown, DollarSign, Users,
  Phone, Download, ExternalLink, AlertCircle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---
interface Usuario {
    id: number;
    nome: string;
    handle: string;
    email: string;
    telefone: string; // Formato: 5512999999999
    curso: string;
    turma: string;
    turmaLogo: string;
    matricula: string;
    status: "Ativo" | "Inadimplente" | "Cancelado" | "Pendente";
    plano: "Ouro" | "Prata" | "Bronze" | "Não Sócio";
    foto: string;
    dataEntrada: string;
    totalGasto: number;
}

// --- DADOS MOCK (Atualizados com formato 55...) ---
const USUARIOS_MOCK: Usuario[] = [
    { id: 1, nome: "João Silva", handle: "joaosilva", email: "joao@med.com", telefone: "5512999998888", curso: "Medicina", turma: "T5", turmaLogo: "/turma5.jpeg", matricula: "2024001", status: "Ativo", plano: "Ouro", foto: "https://i.pravatar.cc/150?u=1", dataEntrada: "10/01/24", totalGasto: 1250.00 },
    { id: 2, nome: "Maria Souza", handle: "mariasouza", email: "maria@med.com", telefone: "5512988887777", curso: "Medicina", turma: "T6", turmaLogo: "/turma6.jpeg", matricula: "2025040", status: "Inadimplente", plano: "Prata", foto: "https://i.pravatar.cc/150?u=2", dataEntrada: "15/02/25", totalGasto: 450.00 },
    { id: 3, nome: "Pedro H.", handle: "pedroh", email: "pedro@med.com", telefone: "5512977776666", curso: "Enfermagem", turma: "T4", turmaLogo: "/turma4.jpeg", matricula: "2023102", status: "Ativo", plano: "Bronze", foto: "https://i.pravatar.cc/150?u=3", dataEntrada: "10/05/23", totalGasto: 890.00 },
    { id: 4, nome: "Ana Clara", handle: "anaclara", email: "ana@med.com", telefone: "5512966665555", curso: "Medicina", turma: "T5", turmaLogo: "/turma5.jpeg", matricula: "2024015", status: "Ativo", plano: "Ouro", foto: "https://i.pravatar.cc/150?u=4", dataEntrada: "20/01/24", totalGasto: 2100.00 },
    { id: 5, nome: "Lucas Lima", handle: "lucaslima", email: "lucas@med.com", telefone: "5512955554444", curso: "Medicina", turma: "T7", turmaLogo: "/turma7.jpeg", matricula: "2026001", status: "Pendente", plano: "Não Sócio", foto: "https://i.pravatar.cc/150?u=5", dataEntrada: "01/02/26", totalGasto: 0.00 },
];

export default function AdminUsuariosPage() {
    const { addToast } = useToast();
    
    // Estados
    const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_MOCK);
    const [busca, setBusca] = useState("");
    const [filtroPlano, setFiltroPlano] = useState<string>("Todos");
    
    // Modal e Validação
    const [showModal, setShowModal] = useState<Usuario | null>(null);
    const [editForm, setEditForm] = useState<Partial<Usuario>>({});
    const [phoneError, setPhoneError] = useState(""); // Estado para erro de telefone

    // --- CÁLCULOS DE KPI ---
    const totalSocios = usuarios.filter(u => u.plano !== "Não Sócio").length;
    const inadimplentes = usuarios.filter(u => u.status === "Inadimplente").length;
    
    const distPlanos = {
        Ouro: usuarios.filter(u => u.plano === "Ouro").length,
        Prata: usuarios.filter(u => u.plano === "Prata").length,
        Bronze: usuarios.filter(u => u.plano === "Bronze").length,
    };

    const distTurmas = usuarios.reduce((acc, user) => {
        if (!acc[user.turma]) { acc[user.turma] = { count: 0, logo: user.turmaLogo }; }
        acc[user.turma].count += 1;
        return acc;
    }, {} as Record<string, { count: number, logo: string }>);

    const topSpenders = [...usuarios].sort((a,b) => b.totalGasto - a.totalGasto).slice(0, 3);

    // --- FILTRAGEM ---
    const usuariosFiltrados = usuarios.filter(u => {
        const matchBusca = u.nome.toLowerCase().includes(busca.toLowerCase()) || 
                           u.email.toLowerCase().includes(busca.toLowerCase()) || 
                           u.matricula.includes(busca);
        const matchPlano = filtroPlano === "Todos" ? true : u.plano === filtroPlano;
        return matchBusca && matchPlano;
    });

    // --- AÇÕES ---
    const handleOpenEdit = (user: Usuario) => {
        setEditForm(user);
        setPhoneError(""); // Limpa erro anterior
        setShowModal(user);
    }

    const handleSaveEdit = () => {
        if (!editForm.id) return;

        // VALIDAÇÃO DE TELEFONE (55 + DDD + 8 ou 9 digitos = 12 ou 13 digitos totais)
        // Regex: Começa com 55, seguido de 10 ou 11 dígitos numéricos
        const phoneRegex = /^55\d{10,11}$/;
        
        if (!editForm.telefone || !phoneRegex.test(editForm.telefone)) {
            setPhoneError("Formato inválido! Use: 55 + DDD + Número (apenas números). Ex: 5512912345678");
            return;
        }

        setUsuarios(prev => prev.map(u => u.id === editForm.id ? { ...u, ...editForm } as Usuario : u));
        setShowModal(null);
        addToast("Cadastro atualizado e validado! 🦈", "success");
    };

    const handleDelete = (id: number) => {
        if(confirm("ATENÇÃO: Isso apagará todo o histórico financeiro e de acesso deste usuário. Confirmar?")) {
            setUsuarios(prev => prev.filter(u => u.id !== id));
            addToast("Usuário deletado.", "info");
        }
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
                    <button className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white transition text-xs font-bold uppercase flex items-center gap-2">
                        <Download size={14}/> Exportar CSV
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
                            <div className="relative w-24 h-24 shrink-0 rounded-full border-4 border-black shadow-xl"
                                style={{ background: `conic-gradient(#fbbf24 0% ${distPlanos.Ouro/totalSocios*100}%, #94a3b8 ${distPlanos.Ouro/totalSocios*100}% ${(distPlanos.Ouro+distPlanos.Prata)/totalSocios*100}%, #78350f ${(distPlanos.Ouro+distPlanos.Prata)/totalSocios*100}% 100%)` }}>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-xs text-zinc-300">Ouro: <strong className="text-white">{distPlanos.Ouro}</strong></span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-400"></div><span className="text-xs text-zinc-300">Prata: <strong className="text-white">{distPlanos.Prata}</strong></span></div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-900"></div><span className="text-xs text-zinc-300">Bronze: <strong className="text-white">{distPlanos.Bronze}</strong></span></div>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex justify-between">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Total Sócios</p>
                                <p className="text-2xl font-black text-white">{totalSocios}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Inadimplentes</p>
                                <p className="text-2xl font-black text-red-500">{inadimplentes}</p>
                            </div>
                        </div>
                    </div>

                    {/* CARD 2: TURMAS */}
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><Users size={16} className="text-blue-500"/> Sócios por Turma</h3>
                        <div className="space-y-4">
                            {Object.entries(distTurmas).map(([turma, data]) => (
                                <div key={turma} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0">
                                        <img src={data.logo} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="font-bold text-zinc-300">{turma}</span>
                                            <span className="font-bold text-white">{data.count}</span>
                                        </div>
                                        <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(data.count / usuarios.length) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CARD 3: TOP SPENDERS */}
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><DollarSign size={16} className="text-emerald-500"/> Baleias (Maior LTV)</h3>
                        <div className="space-y-4">
                            {topSpenders.map((user, i) => (
                                <Link href={`/perfil/${user.handle}`} key={user.id} className="flex items-center gap-3 bg-black/20 p-2 rounded-xl hover:bg-black/40 transition group">
                                    <div className="font-black text-zinc-600 w-4">#{i+1}</div>
                                    <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 group-hover:border-emerald-500 transition">
                                        <img src={user.foto} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition">{user.nome}</p>
                                        <p className="text-[10px] text-zinc-500">{user.plano}</p>
                                    </div>
                                    <div className="text-xs font-bold text-emerald-400">R$ {user.totalGasto}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- 2. LISTA GERAL --- */}
                <section className="space-y-4">
                    <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                        <div className="relative w-full md:w-96">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input type="text" placeholder="Buscar por nome, matricula, email..." className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition" value={busca} onChange={e => setBusca(e.target.value)} />
                        </div>
                        <div className="flex gap-2 overflow-x-auto">
                            {["Todos", "Ouro", "Prata", "Bronze", "Não Sócio"].map(plano => (
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
                                        <th className="p-4 text-center">ID</th>
                                        <th className="p-4">Foto</th>
                                        <th className="p-4">Nome</th>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">Telefone (Whats)</th>
                                        <th className="p-4">Curso</th>
                                        <th className="p-4 text-center">Turma</th>
                                        <th className="p-4 text-center">Matrícula</th>
                                        <th className="p-4 text-center">Entrada</th>
                                        <th className="p-4 text-center">Plano</th>
                                        <th className="p-4 text-center">Status</th>
                                        <th className="p-4 text-right">LTV (R$)</th>
                                        <th className="p-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                                    {usuariosFiltrados.map(user => (
                                        <tr key={user.id} className="hover:bg-zinc-800/50 transition group">
                                            <td className="p-4 text-center font-mono text-zinc-600">{user.id}</td>
                                            <td className="p-4"><Link href={`/perfil/${user.handle}`}><div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 hover:border-emerald-500 transition cursor-pointer"><img src={user.foto} className="w-full h-full object-cover"/></div></Link></td>
                                            <td className="p-4"><Link href={`/perfil/${user.handle}`} className="font-bold text-white hover:text-emerald-400 hover:underline transition">{user.nome}</Link></td>
                                            <td className="p-4 text-zinc-400">{user.email}</td>
                                            
                                            {/* Link WhatsApp com número validado */}
                                            <td className="p-4">
                                                <Link href={`https://wa.me/${user.telefone}`} target="_blank" className="flex items-center gap-1 text-green-500 hover:underline font-mono">
                                                    {user.telefone} <ExternalLink size={10}/>
                                                </Link>
                                            </td>

                                            <td className="p-4">{user.curso}</td>
                                            <td className="p-4 text-center"><span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800">{user.turma}</span></td>
                                            <td className="p-4 text-center font-mono text-zinc-400">{user.matricula}</td>
                                            <td className="p-4 text-center text-zinc-500">{user.dataEntrada}</td>
                                            <td className="p-4 text-center"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${user.plano === 'Ouro' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : user.plano === 'Prata' ? 'bg-slate-400/10 text-slate-400 border-slate-400/20' : user.plano === 'Bronze' ? 'bg-amber-900/10 text-amber-700 border-amber-900/20' : 'bg-zinc-800 text-zinc-600 border-zinc-700'}`}>{user.plano}</span></td>
                                            <td className="p-4 text-center"><div className={`flex items-center justify-center gap-1 text-[10px] font-bold ${user.status === 'Ativo' ? 'text-emerald-500' : user.status === 'Inadimplente' ? 'text-red-500' : 'text-zinc-500'}`}>{user.status === 'Ativo' ? <CheckCircle size={12}/> : user.status === 'Inadimplente' ? <AlertCircle size={12}/> : <XCircle size={12}/>}{user.status}</div></td>
                                            <td className="p-4 text-right font-mono text-emerald-400 font-bold">{user.totalGasto.toFixed(2)}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button onClick={() => handleOpenEdit(user)} className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded transition"><Edit size={16}/></button>
                                                    <button onClick={() => handleDelete(user.id)} className="text-zinc-400 hover:text-red-500 p-2 hover:bg-zinc-800 rounded transition"><Trash2 size={16}/></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            </main>

            {/* MODAL DE EDIÇÃO (VALIDAÇÃO TELEFONE) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 space-y-6 animate-in zoom-in duration-200 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Edit size={18} className="text-emerald-500"/> Editar Cadastro</h2>
                            <button onClick={() => setShowModal(null)} className="text-zinc-500 hover:text-white"><XCircle size={20}/></button>
                        </div>

                        <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-zinc-700"><img src={editForm.foto} className="w-full h-full object-cover"/></div>
                            <h3 className="font-bold text-white text-lg">{editForm.nome}</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Nome Completo</label>
                                <input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} />
                            </div>

                            {/* CAMPO TELEFONE COM VALIDAÇÃO E ERRO */}
                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Whatsapp (Obrigatório formato 55...)</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: 5512912345678" 
                                    className={`w-full bg-black border rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 ${phoneError ? 'border-red-500' : 'border-zinc-700'}`} 
                                    value={editForm.telefone} 
                                    onChange={e => {
                                        setEditForm({...editForm, telefone: e.target.value});
                                        if(phoneError) setPhoneError(""); // Limpa erro ao digitar
                                    }} 
                                />
                                {phoneError && <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {phoneError}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Matrícula</label>
                                    <input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editForm.matricula} onChange={e => setEditForm({...editForm, matricula: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Status</label>
                                    <select className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as any})}>
                                        <option value="Ativo">Ativo</option><option value="Inadimplente">Inadimplente</option><option value="Pendente">Pendente</option><option value="Cancelado">Cancelado</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Plano</label>
                                <select className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={editForm.plano} onChange={e => setEditForm({...editForm, plano: e.target.value as any})}>
                                    <option value="Ouro">Ouro</option><option value="Prata">Prata</option><option value="Bronze">Bronze</option><option value="Não Sócio">Não Sócio</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setShowModal(null)} className="flex-1 py-3 text-zinc-500 font-bold text-xs uppercase hover:text-white border border-transparent hover:border-zinc-700 rounded-xl transition">Cancelar</button>
                            <button onClick={handleSaveEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase transition shadow-lg shadow-emerald-900/20">Salvar Alterações</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}