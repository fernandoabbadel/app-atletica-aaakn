"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, Filter, ShieldAlert, 
  PlusCircle, Edit, Trash2, LogIn, AlertTriangle, Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns"; // Se não tiver, use JS puro (mostro abaixo)

// MOCK PARA VISUALIZAÇÃO (Depois trocamos pelo useEffect do Firebase)
const LOGS_MOCK = [
  { id: 1, usuario: "Maria Master", acao: "CREATE", local: "Eventos", detalhe: "Criou o evento 'Intermed 2026'", data: new Date() },
  { id: 2, usuario: "João Gestor", acao: "UPDATE", local: "Loja", detalhe: "Alterou preço da Caneca para R$ 35,00", data: new Date(Date.now() - 3600000) },
  { id: 3, usuario: "Pedro Treino", acao: "DELETE", local: "Treinos", detalhe: "Removeu o treino de Futsal", data: new Date(Date.now() - 7200000) },
  { id: 4, usuario: "Ana User", acao: "LOGIN", local: "Auth", detalhe: "Fez login no sistema", data: new Date(Date.now() - 8000000) },
];

export default function AdminLogsPage() {
  const [logs, setLogs] = useState(LOGS_MOCK);
  const [busca, setBusca] = useState("");

  // Ícone baseado na ação
  const getIcon = (acao: string) => {
    switch(acao) {
      case 'CREATE': return <PlusCircle size={16} className="text-emerald-500"/>;
      case 'UPDATE': return <Edit size={16} className="text-blue-500"/>;
      case 'DELETE': return <Trash2 size={16} className="text-red-500"/>;
      case 'LOGIN': return <LogIn size={16} className="text-zinc-400"/>;
      default: return <AlertTriangle size={16} className="text-yellow-500"/>;
    }
  };

  const getColor = (acao: string) => {
      switch(acao) {
          case 'CREATE': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
          case 'UPDATE': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
          default: return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      }
  }

  // Filtragem simples
  const logsFiltrados = logs.filter(log => 
    log.usuario.toLowerCase().includes(busca.toLowerCase()) ||
    log.detalhe.toLowerCase().includes(busca.toLowerCase()) ||
    log.local.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
             <ShieldAlert size={20} className="text-emerald-500"/> Centro de Auditoria
          </h1>
        </div>
      </header>

      <main className="p-6 space-y-6">
        
        {/* Barra de Busca */}
        <div className="flex gap-4">
            <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                <input 
                    type="text" 
                    placeholder="Buscar por usuário, ação ou detalhe..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                />
            </div>
            <button className="bg-zinc-900 border border-zinc-800 px-4 rounded-xl text-zinc-400 hover:text-white transition">
                <Filter size={18} />
            </button>
        </div>

        {/* Lista de Logs */}
        <div className="space-y-2">
            {logsFiltrados.map((log) => (
                <div key={log.id} className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex items-center justify-between group hover:bg-zinc-900 hover:border-zinc-700 transition">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColor(log.acao)}`}>
                            {getIcon(log.acao)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{log.usuario}</span>
                                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider bg-black px-1.5 py-0.5 rounded">
                                    {log.local}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 mt-0.5">{log.detalhe}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end gap-1 text-zinc-500 text-xs font-mono">
                            <Clock size={12}/>
                            {log.data.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase">
                            {log.data.toLocaleDateString('pt-BR')}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}