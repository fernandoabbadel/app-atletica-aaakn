"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Users, Power, Key, Plus, Trash2, Loader2, ArrowLeft, 
  CheckCircle2, Copy, RefreshCw, Settings, HelpCircle, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase"; 
import { doc, collection, deleteDoc, updateDoc, onSnapshot, query, orderBy } from "firebase/firestore";

interface LigaConfig {
    id: string;
    nome: string;
    senha: string;
    ativa: boolean;
    perguntas: any[];
    foto?: string;
    sigla?: string;
}

export default function AdminSharkRound() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ligas, setLigas] = useState<LigaConfig[]>([]);
  const [stats, setStats] = useState({ ativas: 0, total: 0 });

  // UNIFICAÇÃO: Usando a coleção "ligas"
  useEffect(() => {
    const q = query(collection(db, "ligas"), orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LigaConfig));
        setLigas(loaded);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
      const ativas = ligas.filter(l => l.ativa).length;
      setStats({ ativas, total: ligas.length });
  }, [ligas]);

  const toggleLiga = async (liga: LigaConfig) => {
      const novoStatus = !liga.ativa;
      const qCount = liga.perguntas?.length || 0;

      if (novoStatus && qCount < 10) {
          return addToast(`Bloqueado! A liga precisa de 10 perguntas (Atual: ${qCount})`, "error");
      }

      try {
          await updateDoc(doc(db, "ligas", liga.id), { ativa: novoStatus });
          addToast(novoStatus ? "Liga ATIVADA no SharkRound!" : "Liga removida do tabuleiro.", "success");
      } catch (e) {
          addToast("Erro ao atualizar status.", "error");
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      addToast("Senha copiada!", "success");
  };

  if (loading) return <div className="h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-12 h-12"/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-zinc-800 pb-6 sticky top-0 bg-zinc-950/95 backdrop-blur z-20 pt-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 border border-zinc-700 transition"><ArrowLeft size={20}/></Link>
            <div>
                <h1 className="text-2xl font-black uppercase flex items-center gap-2 text-white">Admin SharkRound</h1>
                <p className="text-xs text-zinc-500">Controle quais ligas estão ativas no tabuleiro do jogo.</p>
            </div>
          </div>
          
          <div className="flex gap-4 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800 shadow-lg">
              <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Ligas Ativas</p>
                  <p className="text-lg font-black text-emerald-500 leading-none">{stats.ativas}</p>
              </div>
              <div className="h-8 w-[1px] bg-zinc-700"></div>
              <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Casas</p>
                  <p className="text-lg font-black text-white leading-none">{(stats.ativas * 2) + 4}</p>
              </div>
          </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ligas.map((liga) => {
              const qCount = liga.perguntas?.length || 0;
              const canActivate = qCount >= 10;

              return (
                  <div key={liga.id} className={`p-5 rounded-2xl border transition-all ${liga.ativa ? 'bg-zinc-900 border-emerald-500/50 shadow-lg' : 'bg-zinc-950 border-zinc-800 opacity-80'}`}>
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <img src={liga.foto || "https://github.com/shadcn.png"} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-800 bg-black"/>
                              <div className="min-w-0">
                                  <h3 className="font-bold text-sm text-white truncate">{liga.nome}</h3>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${canActivate ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {qCount}/10 Questões
                                  </span>
                              </div>
                          </div>
                          <button 
                            onClick={() => toggleLiga(liga)}
                            disabled={!canActivate && !liga.ativa}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${liga.ativa ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}
                          >
                              <Power size={18} strokeWidth={3}/>
                          </button>
                      </div>
                      <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/50 flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-zinc-300">{liga.senha}</span>
                          <button onClick={() => copyToClipboard(liga.senha)} className="text-zinc-500 hover:text-white transition"><Copy size={14}/></button>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase pt-2 border-t border-zinc-800">
                          <span className={liga.ativa ? 'text-emerald-500' : 'text-zinc-600'}>
                              {liga.ativa ? 'No Tabuleiro' : 'Inativa'}
                          </span>
                          {!canActivate && !liga.ativa && <span className="text-red-500 animate-pulse">Incompleta</span>}
                      </div>
                  </div>
              )
          })}
      </div>
    </div>
  );
}