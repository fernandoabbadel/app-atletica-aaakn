"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, 
  DollarSign, Image as ImageIcon, UploadCloud, X, Tag, Users, 
  CheckCircle, Search, MoreHorizontal, Download, Ticket, TrendingUp, BarChart3, ExternalLink, Lock, MoveVertical,
  Star, MessageCircle, Clock, ShieldAlert, Flag
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { uploadImage } from "../../../lib/upload";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, getDocs } from "firebase/firestore";

// --- TIPAGEM ---
interface Lote {
  id: number;
  nome: string;
  preco: string;
  status: "ativo" | "encerrado" | "agendado";
  dataVirada?: string;
}

interface PollOption {
    text: string;
    votes: number;
    creator?: string; 
    creatorName?: string;
    creatorAvatar?: string;
}

interface Poll {
    id: string;
    question: string;
    options: PollOption[];
    allowUserOptions: boolean;
    voters: string[];
}

interface Participante {
    id: string; 
    userId: string;
    userName: string;
    userAvatar: string;
    userTurma: string;
    status: "going" | "maybe";
    pagamento?: "pago" | "pendente"; 
    lote?: string;
}

interface Evento {
  id: string;
  titulo: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  local: string;
  tipo: string;
  destaque: string;
  mapsUrl: string;
  imagem: string;
  imagePositionY: number; 
  lotes: Lote[];
  descricao: string;
  status: "ativo" | "encerrado";
  isLowStock?: boolean; 
  stats?: { confirmados: number; talvez: number; likes: number; };
  vendasTotais?: { vendidos: number; total: number; receita?: number; };
}

// 🦈 ID 644: LÓGICA DO CONTADOR COOL (COM PROTEÇÃO DE DATA INVÁLIDA)
const calculateTimeLeft = (dateStr: string, timeStr: string) => {
    if (!dateStr || !timeStr) return "DATA INDEFINIDA";
    
    // Verifica se a data está no formato novo (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "FORMATO ANTIGO";

    const eventDate = new Date(`${dateStr}T${timeStr}:00`);
    
    if (isNaN(eventDate.getTime())) return "DATA INVÁLIDA";

    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();

    if (diff < 0 && diff > -1000 * 60 * 60 * 4) return "AO VIVO 🔴"; 
    if (diff < 0) return "ENCERRADO";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${String(days).padStart(2, '0')}D ${String(hours).padStart(2, '0')}H ${String(minutes).padStart(2, '0')}M`;
};

export default function AdminEventosPage() {
  const { addToast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>([]);
  
  // Modais
  const [showModal, setShowModal] = useState(false);
  const [showGestaoModal, setShowGestaoModal] = useState<Evento | null>(null);
  const [showPollModal, setShowPollModal] = useState<Evento | null>(null); 
  const [participantesReais, setParticipantesReais] = useState<Participante[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]); 
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [novoEvento, setNovoEvento] = useState<Partial<Evento>>({
    titulo: "", data: "", hora: "", local: "", tipo: "Festa", destaque: "", mapsUrl: "", imagem: "", descricao: "", lotes: [],
    imagePositionY: 50
  });
  const [novoLote, setNovoLote] = useState({ nome: "", preco: "", status: "ativo" as const });
  
  const [novaEnquete, setNovaEnquete] = useState({ question: "", allowUserOptions: true });

  // 🦈 FIREBASE LISTENER
  useEffect(() => {
      const q = query(collection(db, "eventos"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              lotes: doc.data().lotes || [],
              stats: doc.data().stats || { confirmados: 0, talvez: 0, likes: 0 },
              vendasTotais: doc.data().vendasTotais || { vendidos: 0, total: 500, receita: 0 },
              imagePositionY: doc.data().imagePositionY ?? 50 
          })) as Evento[];
          setEventos(lista);
      });
      return () => unsubscribe();
  }, []);

  // 🦈 GESTÃO LISTA
  useEffect(() => {
      if (!showGestaoModal) return;
      const q = collection(db, "eventos", showGestaoModal.id, "rsvps");
      const unsub = onSnapshot(q, (snap) => {
          setParticipantesReais(snap.docs.map(d => ({ 
              id: d.id, 
              ...d.data(),
              pagamento: d.data().pagamento || "pendente" 
          } as Participante)));
      });
      return () => unsub();
  }, [showGestaoModal]);

  // 🦈 GESTÃO ENQUETES
  useEffect(() => {
      if (!showPollModal) return;
      const q = collection(db, "eventos", showPollModal.id, "enquetes");
      const unsub = onSnapshot(q, (snap) => {
          setPolls(snap.docs.map(d => ({ id: d.id, ...d.data() } as Poll)));
      });
      return () => unsub();
  }, [showPollModal]);

  const dashboardStats = useMemo(() => {
      const totalEventos = eventos.length;
      const totalIngressos = eventos.reduce((acc, curr) => acc + (curr.vendasTotais?.vendidos || 0), 0);
      const receitaEstimada = totalIngressos * 60; 
      return { totalEventos, totalIngressos, receitaEstimada };
  }, [eventos]);

  // --- ACTIONS ---

  const handleOpenCreate = () => {
      setNovoEvento({ titulo: "", data: "", hora: "", local: "", tipo: "Festa", destaque: "", mapsUrl: "", imagem: "", descricao: "", lotes: [], imagePositionY: 50 });
      setEditingId(null);
      setIsEditing(false);
      setShowModal(true);
  };

  // 🦈 CORREÇÃO DE CRASH AO EDITAR DATA ANTIGA
  const handleOpenEdit = (evento: Evento) => {
      // Verifica se a data/hora estão no formato correto para os inputs type="date"/"time"
      const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(evento.data);
      const isValidTime = /^\d{2}:\d{2}$/.test(evento.hora);

      setNovoEvento({ 
          ...evento, 
          imagePositionY: evento.imagePositionY ?? 50,
          // Se for formato antigo (ex: "12 OUT"), limpa o campo para o usuário selecionar no calendário novo
          data: isValidDate ? evento.data : "",
          hora: isValidTime ? evento.hora : ""
      });

      if (!isValidDate || !isValidTime) {
          addToast("Formato de data antigo. Por favor, atualize.", "info");
      }

      setEditingId(evento.id);
      setIsEditing(true);
      setShowModal(true);
  };

  const handleSave = async () => {
    if (!novoEvento.titulo?.trim()) return addToast("Título obrigatório!", "error");
    if (!novoEvento.data || !novoEvento.hora) return addToast("Data e Hora obrigatórios!", "error");

    const eventoPayload = {
        ...novoEvento,
        lotes: novoEvento.lotes || [],
        status: novoEvento.status || "ativo",
        updatedAt: serverTimestamp()
    };

    try {
        if (isEditing && editingId) {
            await updateDoc(doc(db, "eventos", editingId), eventoPayload);
            addToast("Evento atualizado!", "success");
        } else {
            await addDoc(collection(db, "eventos"), {
                ...eventoPayload,
                stats: { confirmados: 0, talvez: 0, likes: 0 },
                vendasTotais: { vendidos: 0, total: 500, receita: 0 },
                createdAt: serverTimestamp()
            });
            addToast("Evento criado!", "success");
        }
        setShowModal(false);
    } catch (e) {
        addToast("Erro ao salvar.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Excluir evento permanentemente?")) {
      try {
          await deleteDoc(doc(db, "eventos", id));
          addToast("Evento cancelado.", "info");
      } catch(e) {
          addToast("Erro ao excluir.", "error");
      }
    }
  };

  const handleAddLote = () => {
      if(!novoLote.nome || !novoLote.preco) return;
      const lotes = novoEvento.lotes || [];
      setNovoEvento({ ...novoEvento, lotes: [...lotes, { id: Date.now(), ...novoLote }] });
      setNovoLote({ nome: "", preco: "", status: "ativo" });
  };

  const toggleLoteStatus = (loteId: number, status: any) => {
      const updated = novoEvento.lotes?.map(l => l.id === loteId ? { ...l, status } : l);
      setNovoEvento({ ...novoEvento, lotes: updated });
  };

  const removeLote = (loteId: number) => {
      const updated = novoEvento.lotes?.filter(l => l.id !== loteId);
      setNovoEvento({ ...novoEvento, lotes: updated });
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setUploading(true);
        const { url } = await uploadImage(file, "eventos");
        if (url) setNovoEvento(prev => ({ ...prev, imagem: url }));
        setUploading(false);
    }
  };

  const exportarCSV = () => {
      if(!showGestaoModal) return;
      const headers = ["Nome", "Turma", "Status Presença", "Pagamento"];
      const rows = participantesReais.map(p => [p.userName, p.userTurma, p.status, p.pagamento || "pendente"]);
      const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `lista_${showGestaoModal.titulo}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const toggleEventoStatus = async (evento: Evento) => {
      const newStatus = evento.status === "ativo" ? "encerrado" : "ativo";
      try {
          await updateDoc(doc(db, "eventos", evento.id), { status: newStatus });
          addToast(`Evento marcado como ${newStatus}.`, "info");
      } catch(e) { addToast("Erro ao atualizar status.", "error"); }
  };

  const toggleLowStock = async (evento: Evento) => {
      try {
          await updateDoc(doc(db, "eventos", evento.id), { isLowStock: !evento.isLowStock });
          addToast(`Status de vagas ${!evento.isLowStock ? 'ATIVADO' : 'DESATIVADO'}`, "success");
      } catch (e) {
          addToast("Erro ao atualizar.", "error");
      }
  };

  // --- GESTÃO DE ENQUETES ---

  const handleCreatePoll = async () => {
      if (!showPollModal || !novaEnquete.question) return;
      try {
          await addDoc(collection(db, "eventos", showPollModal.id, "enquetes"), {
              question: novaEnquete.question,
              allowUserOptions: novaEnquete.allowUserOptions,
              options: [],
              voters: [],
              createdAt: serverTimestamp()
          });
          setNovaEnquete({ question: "", allowUserOptions: true });
          addToast("Enquete criada!", "success");
      } catch (e) { addToast("Erro ao criar enquete.", "error"); }
  };

  const handleDeletePoll = async (pollId: string) => {
      if (!showPollModal) return;
      if (!confirm("Excluir enquete?")) return;
      try {
          await deleteDoc(doc(db, "eventos", showPollModal.id, "enquetes", pollId));
          addToast("Enquete excluída.", "info");
      } catch (e) { addToast("Erro ao excluir.", "error"); }
  };

  // 🦈 NOVO: EXCLUIR OPÇÃO ESPECÍFICA (MODERAÇÃO)
  const handleDeleteOption = async (poll: Poll, optionIndex: number) => {
      if (!showPollModal) return;
      if (!confirm("Remover esta opção da enquete?")) return;
      
      const newOptions = poll.options.filter((_, i) => i !== optionIndex);
      
      try {
          await updateDoc(doc(db, "eventos", showPollModal.id, "enquetes", poll.id), {
              options: newOptions
          });
          addToast("Opção removida.", "info");
      } catch (e) {
          addToast("Erro ao remover opção.", "error");
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestão de Eventos</h1>
        </div>
        <button onClick={handleOpenCreate} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
          <Plus size={16} /> Novo Evento
        </button>
      </header>

      <main className="p-6 space-y-8">
        {/* DASHBOARD VISUAL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Calendar size={48}/></div>
                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2"><Tag size={14}/> Total de Eventos</p>
                <p className="text-3xl font-black text-white mt-2">{dashboardStats.totalEventos}</p>
            </div>
            {/* Outros cards... */}
        </div>

        {/* LISTA DE EVENTOS */}
        <div>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 size={16}/> Eventos Ativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventos.map((evento) => (
                <div key={evento.id} className={`rounded-2xl border overflow-hidden group hover:border-emerald-500/30 transition flex flex-col h-full ${evento.status === 'encerrado' ? 'bg-zinc-950 border-zinc-900 grayscale opacity-70' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className="h-32 bg-black/50 relative overflow-hidden">
                        <img 
                            src={evento.imagem} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" 
                            style={{ objectPosition: `50% ${evento.imagePositionY || 50}%` }}
                        />
                        <div className="absolute top-2 left-2 flex gap-1"><span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm border border-white/10">{evento.tipo}</span></div>
                        
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
                            {calculateTimeLeft(evento.data, evento.hora)}
                        </div>

                        <button 
                            onClick={(e) => { e.stopPropagation(); toggleLowStock(evento); }} 
                            className={`absolute top-2 right-2 p-1.5 rounded-lg border transition shadow-lg ${evento.isLowStock ? 'bg-yellow-500 text-black border-yellow-400' : 'bg-black/50 text-zinc-400 border-zinc-700 hover:text-white'}`}
                            title="Alternar 'Últimas Vagas'"
                        >
                            <Star size={14} className={evento.isLowStock ? 'fill-black' : ''}/>
                        </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{evento.titulo}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4"><Calendar size={12} className="text-emerald-500"/> {evento.data} <Users size={12} className="text-blue-500"/> {evento.stats?.confirmados || 0} confirmados</div>
                        <div className="flex gap-2 pt-3 border-t border-white/5 mt-auto">
                            <button onClick={() => setShowGestaoModal(evento)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-black transition flex justify-center items-center gap-2 text-xs font-bold uppercase"><Users size={14}/> Lista</button>
                            <button onClick={() => setShowPollModal(evento)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-purple-400 transition" title="Enquetes"><MessageCircle size={16}/></button>
                            <button onClick={() => handleOpenEdit(evento)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"><Edit size={16}/></button>
                            <button onClick={() => toggleEventoStatus(evento)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-yellow-500 transition" title={evento.status === 'ativo' ? 'Encerrar' : 'Reativar'}>{evento.status === 'ativo' ? <Lock size={16}/> : <CheckCircle size={16}/>}</button>
                            <button onClick={() => handleDelete(evento.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </div>
      </main>

      {/* --- MODAL DE GESTÃO DE LISTA --- */}
      {showGestaoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
              {/* Conteúdo da Lista de Presença (Mantido) */}
              <div className="bg-zinc-900 w-full max-w-4xl h-[90vh] rounded-2xl border border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/40">
                      <div><h2 className="font-black text-white text-xl uppercase tracking-tighter flex items-center gap-2"><Tag size={20} className="text-emerald-500"/> Gestão: {showGestaoModal.titulo}</h2></div>
                      <button onClick={() => setShowGestaoModal(null)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
                  </div>
                  <div className="flex-1 p-6 overflow-y-auto">
                       {/* Tabela de Participantes (Igual código anterior) */}
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-bold text-zinc-400 uppercase">Lista de Presença ({participantesReais.length})</h3>
                          <button onClick={exportarCSV} className="text-xs text-emerald-500 font-bold hover:underline flex items-center gap-1"><Download size={14}/> CSV</button>
                      </div>
                      <table className="w-full text-left text-sm">
                          <thead className="text-zinc-500 border-b border-zinc-800"><tr><th className="p-3">Nome</th><th className="p-3">Turma</th><th className="p-3">RSVP</th><th className="p-3">Pagamento</th></tr></thead>
                          <tbody>
                              {participantesReais.map(p => (
                                  <tr key={p.id} className="border-b border-zinc-800/50">
                                      <td className="p-3 font-bold flex items-center gap-2"><img src={p.userAvatar || "https://github.com/shadcn.png"} className="w-6 h-6 rounded-full"/> {p.userName}</td>
                                      <td className="p-3 text-zinc-400">{p.userTurma || "-"}</td>
                                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.status === 'going' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>{p.status === 'going' ? 'Vou' : 'Talvez'}</span></td>
                                      <td className="p-3"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.pagamento === 'pago' ? 'bg-blue-500/10 text-blue-500' : 'bg-zinc-800 text-zinc-500'}`}>{p.pagamento || "Pendente"}</span></td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* 🦈 ID 640: MODAL ENQUETES (COM GESTÃO AVANÇADA) */}
      {showPollModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 flex flex-col animate-in zoom-in-95 duration-200 h-[80vh]">
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/40">
                      <div><h2 className="font-black text-white text-lg uppercase tracking-tighter flex items-center gap-2"><MessageCircle size={20} className="text-purple-500"/> Enquetes: {showPollModal.titulo}</h2></div>
                      <button onClick={() => setShowPollModal(null)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
                  </div>
                  
                  <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                      {/* Criar Nova Enquete */}
                      <div className="bg-black/30 p-4 rounded-xl border border-zinc-800">
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nova Enquete</label>
                          <input type="text" placeholder="Pergunta (ex: Qual a boa do pós?)" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white mb-3" value={novaEnquete.question} onChange={e => setNovaEnquete({...novaEnquete, question: e.target.value})} />
                          <div className="flex items-center gap-2 mb-4">
                              <input type="checkbox" id="allowOpts" checked={novaEnquete.allowUserOptions} onChange={e => setNovaEnquete({...novaEnquete, allowUserOptions: e.target.checked})} className="accent-purple-500"/>
                              <label htmlFor="allowOpts" className="text-xs text-zinc-400">Permitir que usuários adicionem opções</label>
                          </div>
                          <button onClick={handleCreatePoll} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs uppercase">Criar Enquete</button>
                      </div>

                      {/* Lista de Enquetes */}
                      <div className="space-y-4">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Enquetes Ativas</label>
                          {polls.map(poll => (
                              <div key={poll.id} className="bg-zinc-800/20 p-4 rounded-xl border border-zinc-800 space-y-3">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <p className="font-bold text-sm text-white">{poll.question}</p>
                                          <p className="text-[10px] text-zinc-500">{poll.options.length} opções • {poll.allowUserOptions ? "Aberta" : "Fechada"}</p>
                                      </div>
                                      <button onClick={() => handleDeletePoll(poll.id)} className="text-zinc-600 hover:text-red-500 transition"><Trash2 size={16}/></button>
                                  </div>

                                  {/* 🦈 VISUALIZAÇÃO DO CRIADOR DA OPÇÃO */}
                                  <div className="space-y-1 bg-black/20 p-2 rounded-lg max-h-40 overflow-y-auto custom-scrollbar">
                                      {poll.options.map((opt, idx) => (
                                          <div key={idx} className="flex justify-between items-center text-xs text-zinc-300 p-2 hover:bg-zinc-700/30 rounded group">
                                              <div className="flex items-center gap-2">
                                                  {opt.creatorAvatar ? (
                                                      <img src={opt.creatorAvatar} className="w-5 h-5 rounded-full object-cover border border-zinc-600" title={`Criado por ${opt.creatorName}`}/>
                                                  ) : (
                                                      <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold">ADM</div>
                                                  )}
                                                  <span>{opt.text} <span className="text-zinc-500">({opt.votes})</span></span>
                                              </div>
                                              <button onClick={() => handleDeleteOption(poll, idx)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12}/></button>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CRIAR/EDITAR */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 p-6 space-y-4 my-10 animate-in zoom-in-95">
            <h2 className="font-bold text-white text-lg flex items-center gap-2"><Calendar size={20} className="text-emerald-500"/> {isEditing ? "Editar" : "Criar"} Evento</h2>
            <div className="space-y-3">
                {/* UPLOAD IMAGEM */}
                <div className="space-y-2">
                    <div onClick={() => fileInputRef.current?.click()} className="h-40 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition bg-black/20 relative group overflow-hidden">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload}/>
                        {uploading ? <span className="text-xs text-emerald-500 animate-pulse">Enviando...</span> : novoEvento.imagem ? (
                            <img src={novoEvento.imagem} className="w-full h-full object-cover" style={{ objectPosition: `50% ${novoEvento.imagePositionY || 50}%` }}/>
                        ) : <div className="text-center text-zinc-500"><ImageIcon className="mx-auto mb-1"/><span className="text-xs font-bold uppercase">Capa</span></div>}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"><span className="text-xs font-bold text-white uppercase bg-black px-3 py-1 rounded-full">Trocar Imagem</span></div>
                    </div>
                    {/* SLIDER DE POSIÇÃO */}
                    {novoEvento.imagem && (
                        <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                            <div className="flex justify-between text-[10px] text-zinc-400 uppercase font-bold mb-1">
                                <span className="flex items-center gap-1"><MoveVertical size={12}/> Ajuste Fino</span>
                                <span>{novoEvento.imagePositionY}%</span>
                            </div>
                            <input type="range" min="0" max="100" value={novoEvento.imagePositionY || 50} onChange={(e) => setNovoEvento({ ...novoEvento, imagePositionY: Number(e.target.value) })} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"/>
                        </div>
                    )}
                </div>

                <input type="text" placeholder="Nome do Evento" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={novoEvento.titulo} onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })} />
                
                {/* 🦈 ID 644: INPUTS DE DATA RESTRITIVOS */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Data</label>
                        <input type="date" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white uppercase" value={novoEvento.data} onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })} />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Hora</label>
                        <input type="time" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.hora} onChange={(e) => setNovoEvento({ ...novoEvento, hora: e.target.value })} />
                    </div>
                </div>

                <div className="flex gap-2">
                    <select className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400" value={novoEvento.tipo} onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}>
                        <option value="Festa">Festa</option><option value="Esporte">Esporte</option><option value="Outro">Outro...</option>
                    </select>
                    <input type="text" placeholder="Local" className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.local} onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })} />
                </div>
                
                {/* Gestão de Lotes */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
                    <label className="text-xs text-zinc-500 font-bold uppercase mb-3 block border-b border-zinc-800 pb-2">Configurar Lotes</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="text" placeholder="Nome (ex: Lote 1)" className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white" value={novoLote.nome} onChange={e => setNovoLote({...novoLote, nome: e.target.value})} />
                        <input type="text" placeholder="Preço (R$)" className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white" value={novoLote.preco} onChange={e => setNovoLote({...novoLote, preco: e.target.value})} />
                    </div>
                    <button onClick={handleAddLote} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500">Adicionar Lote</button>
                    <div className="space-y-1 mt-2 max-h-24 overflow-y-auto custom-scrollbar">
                        {novoEvento.lotes?.map(l => (
                            <div key={l.id} className="flex justify-between items-center text-xs bg-zinc-900 px-3 py-2 rounded border border-zinc-800">
                                <span className="text-white font-bold">{l.nome} - {l.preco}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleLoteStatus(l.id, "ativo")} className={`px-2 rounded ${l.status === 'ativo' ? 'bg-emerald-500 ring-2 ring-emerald-500/50' : 'bg-zinc-700'}`} title="Ativar"></button>
                                    <button onClick={() => toggleLoteStatus(l.id, "agendado")} className={`px-2 rounded ${l.status === 'agendado' ? 'bg-yellow-600 ring-2 ring-yellow-500/50' : 'bg-zinc-700'}`} title="Em Breve"></button>
                                    <button onClick={() => toggleLoteStatus(l.id, "encerrado")} className={`px-2 rounded ${l.status === 'encerrado' ? 'bg-red-500 ring-2 ring-red-500/50' : 'bg-zinc-700'}`} title="Esgotado"></button>
                                    <button onClick={() => removeLote(l.id)} className="text-zinc-500 hover:text-red-500 ml-1"><X size={12}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Descrição Completa</label><textarea className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-sm text-white h-24 resize-none focus:border-emerald-500 outline-none" value={novoEvento.descricao} onChange={(e) => setNovoEvento({ ...novoEvento, descricao: e.target.value })}></textarea></div>

            <div className="flex gap-3 pt-2 border-t border-zinc-800">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition">{isEditing ? "Atualizar Evento" : "Criar Evento"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}