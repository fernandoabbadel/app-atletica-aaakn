"use client";

import React, { useState, useEffect } from 'react';
import { 
  Save, LayoutGrid, Users, Power, Key, Plus, Trash2, Loader2, ArrowLeft, 
  AlertTriangle, CheckCircle2, Copy, RefreshCw, Settings
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase"; 
import { doc, setDoc, collection, getDocs, deleteDoc, updateDoc } from "firebase/firestore";

// Lista Base para popular se o banco estiver vazio
const LIGAS_PADRAO = [
    "Endocrinologia e Metabologia", "Ginecologia e Obstetrícia", "Medicina Legal", "Anatomia e Saúde",
    "Clínica Médica", "Cirurgia Geral", "Psiquiatria", "Ortopedia e Med. Esportiva",
    "Oncologia", "Humanidades e Saúde", "Dermatologia", "Neonatologia e Pediatria",
    "Urologia", "Emergência", "Neurologia e Neurocirurgia", "Oftalmologia",
    "Cardiologia", "Saúde da Família", "Otorrinolaringologia"
];

interface LigaConfig {
    id: string;
    nome: string;
    senha: string;
    ativa: boolean;
    perguntas: any[];
    logoBase64?: string;
    sigla?: string;
}

export default function AdminSharkRound() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [ligas, setLigas] = useState<LigaConfig[]>([]);
  const [stats, setStats] = useState({ ativas: 0, total: 0 });

  // 1. CARREGAR DADOS
  const fetchLigas = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "ligas_config"));
      
      if (snap.empty) {
          // Popula inicial se vazio
          const init = LIGAS_PADRAO.map(nome => ({
              id: nome.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
              nome,
              senha: Math.random().toString(36).slice(-6).toUpperCase(),
              ativa: false,
              perguntas: []
          }));
          // Salva no banco um por um
          const promises = init.map(l => setDoc(doc(db, "ligas_config", l.id), l));
          await Promise.all(promises);
          setLigas(init);
          addToast("Banco de ligas inicializado!", "success");
      } else {
          const loaded = snap.docs.map(d => ({ id: d.id, ...d.data() } as LigaConfig));
          // Ordenar: Ativas primeiro, depois alfabética
          loaded.sort((a, b) => (a.ativa === b.ativa ? a.nome.localeCompare(b.nome) : a.ativa ? -1 : 1));
          setLigas(loaded);
      }
    } catch (e) { 
        console.error(e); 
        addToast("Erro ao carregar dados.", "error"); 
    } finally { 
        setLoading(false); 
    }
  };

  useEffect(() => {
    fetchLigas();
  }, []);

  useEffect(() => {
      const ativas = ligas.filter(l => l.ativa).length;
      setStats({ ativas, total: ligas.length });
  }, [ligas]);

  // ID 27: Adicionar Nova Liga
  const addLiga = async () => {
      const nome = prompt("Nome da Nova Liga:");
      if (!nome) return;
      
      const id = nome.toLowerCase().replace(/ /g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const novaLiga: LigaConfig = {
          id,
          nome,
          senha: Math.random().toString(36).slice(-6).toUpperCase(),
          ativa: false,
          perguntas: []
      };

      try {
          await setDoc(doc(db, "ligas_config", id), novaLiga);
          setLigas([...ligas, novaLiga]);
          addToast("Liga criada com sucesso!", "success");
      } catch (e) {
          addToast("Erro ao criar liga.", "error");
      }
  };

  // ID 30 & 26: Alternar Status (Ativar/Desativar)
  const toggleLiga = async (idx: number) => {
      const liga = ligas[idx];
      const novoStatus = !liga.ativa;

      // Validação ID 30
      if (novoStatus && (liga.perguntas?.length || 0) < 10) {
          return addToast(`Bloqueado! A liga precisa de 10 perguntas (Atual: ${liga.perguntas?.length || 0})`, "error");
      }

      try {
          await updateDoc(doc(db, "ligas_config", liga.id), { ativa: novoStatus });
          const novas = [...ligas];
          novas[idx].ativa = novoStatus;
          setLigas(novas);
          addToast(novoStatus ? "Liga Ativada no Jogo!" : "Liga Removida do Jogo.", novoStatus ? "success" : "info");
      } catch (e) {
          addToast("Erro ao atualizar status.", "error");
      }
  };

  const deleteLiga = async (id: string) => {
      if (!confirm("Tem certeza? Isso apagará todas as perguntas e dados dessa liga.")) return;
      try {
          await deleteDoc(doc(db, "ligas_config", id));
          setLigas(ligas.filter(l => l.id !== id));
          addToast("Liga excluída.", "success");
      } catch(e) { addToast("Erro ao excluir.", "error"); }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      addToast("Senha copiada!", "success");
  };

  if (loading) return <div className="h-screen bg-zinc-950 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500"/></div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Link href="/menu" className="p-3 bg-zinc-900 rounded-full hover:bg-zinc-800 border border-zinc-700 transition"><ArrowLeft size={20}/></Link>
            <div>
                <h1 className="text-2xl font-black uppercase text-white flex items-center gap-2">Admin SharkRound <span className="text-xs bg-emerald-600 px-2 py-0.5 rounded text-black">V5.0</span></h1>
                <p className="text-xs text-zinc-500">Gestão de Ligas e Configurações do Tabuleiro</p>
            </div>
          </div>
          
          {/* ID 40: Painel de Controle de Tamanho */}
          <div className="flex gap-4 items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Ligas Ativas</p>
                  <p className="text-lg font-black text-emerald-500 leading-none">{stats.ativas} <span className="text-xs text-zinc-600">/ {stats.total}</span></p>
              </div>
              <div className="h-8 w-[1px] bg-zinc-700"></div>
              <div className="text-right">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Casas no Jogo</p>
                  <p className="text-lg font-black text-white leading-none">{stats.ativas > 0 ? (stats.ativas * 2) + 4 : "40 (Padrão)"}</p>
              </div>
          </div>

          <div className="flex gap-2">
              <button onClick={fetchLigas} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white p-3 rounded-xl transition"><RefreshCw size={18}/></button>
              <button onClick={addLiga} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition hover:scale-105"><Plus size={16}/> NOVA LIGA (ID 27)</button>
          </div>
      </header>

      {/* LISTA DE LIGAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {ligas.map((liga, idx) => {
              const qCount = liga.perguntas?.length || 0;
              const canActivate = qCount >= 10;

              return (
                  <div key={liga.id} className={`relative p-5 rounded-2xl border transition-all duration-300 ${liga.ativa ? 'bg-zinc-900 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-zinc-950 border-zinc-800 opacity-80 hover:opacity-100 hover:border-zinc-700'}`}>
                      
                      {/* Topo do Card */}
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                                  {/* ID 11: Mostra logo se tiver */}
                                  {liga.logoBase64 ? <img src={liga.logoBase64} className="w-full h-full object-cover"/> : <Users size={20} className="text-zinc-600"/>}
                              </div>
                              <div className="min-w-0">
                                  <h3 className="font-bold text-sm text-white truncate pr-2" title={liga.nome}>{liga.nome}</h3>
                                  <div className="flex items-center gap-2 mt-1">
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${canActivate ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                          {qCount}/10
                                      </span>
                                      {liga.sigla && <span className="text-[10px] text-zinc-500 border border-zinc-800 px-1 rounded">{liga.sigla}</span>}
                                  </div>
                              </div>
                          </div>
                          
                          {/* ID 26/30: Toggle Power */}
                          <button 
                            onClick={() => toggleLiga(idx)}
                            disabled={!canActivate && !liga.ativa}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${liga.ativa ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/40 hover:scale-105' : canActivate ? 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700' : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'}`}
                            title={!canActivate ? "Mínimo 10 perguntas exigido" : liga.ativa ? "Desativar" : "Ativar"}
                          >
                              <Power size={18} strokeWidth={3}/>
                          </button>
                      </div>
                      
                      {/* Senha e Ações */}
                      <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/50 flex items-center justify-between mb-3 group-hover:border-zinc-700 transition">
                          <div className="flex items-center gap-2">
                              <Key size={12} className="text-zinc-500"/>
                              <span className="text-xs font-mono text-zinc-300 tracking-wider">{liga.senha}</span>
                          </div>
                          <button onClick={() => copyToClipboard(liga.senha)} className="text-zinc-500 hover:text-white transition"><Copy size={14}/></button>
                      </div>

                      {/* Footer do Card */}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-800/50">
                          <span className={`text-[10px] font-bold uppercase ${liga.ativa ? 'text-emerald-500 flex items-center gap-1' : 'text-zinc-600'}`}>
                              {liga.ativa ? <><CheckCircle2 size={10}/> Ativa no Jogo</> : "Inativa"}
                          </span>
                          <button onClick={() => deleteLiga(liga.id)} className="text-zinc-600 hover:text-red-500 transition p-1"><Trash2 size={14}/></button>
                      </div>

                      {/* Aviso de erro se tentar ativar sem perguntas */}
                      {!canActivate && !liga.ativa && (
                          <div className="absolute top-2 right-14 bg-red-500/10 border border-red-500/20 text-red-500 text-[9px] px-2 py-1 rounded font-bold animate-pulse">
                              Incompleta
                          </div>
                      )}
                  </div>
              )
          })}
      </div>

      {ligas.length === 0 && !loading && (
          <div className="text-center py-20 opacity-50">
              <LayoutGrid size={48} className="mx-auto mb-4"/>
              <p>Nenhuma liga encontrada.</p>
          </div>
      )}
    </div>
  );
}