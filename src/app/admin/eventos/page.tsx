"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, 
  DollarSign, Image as ImageIcon, UploadCloud, X, Tag, Users, 
  CheckCircle, Search, MoreHorizontal, Download, Ticket, TrendingUp, BarChart3, ExternalLink, Lock, MoveVertical 
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
  data: string;
  hora: string;
  local: string;
  tipo: string;
  destaque: string;
  mapsUrl: string;
  imagem: string;
  imagePositionY: number; // 🦈 NOVO CAMPO: Posição Vertical (0-100)
  lotes: Lote[];
  descricao: string;
  status: "ativo" | "encerrado";
  stats?: { confirmados: number; talvez: number; likes: number; };
  vendasTotais?: { vendidos: number; total: number; receita?: number; };
}

export default function AdminEventosPage() {
  const { addToast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>([]);
  
  // Modais
  const [showModal, setShowModal] = useState(false);
  const [showGestaoModal, setShowGestaoModal] = useState<Evento | null>(null);
  const [participantesReais, setParticipantesReais] = useState<Participante[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Estados de Edição/Criação
  const [novoEvento, setNovoEvento] = useState<Partial<Evento>>({
    titulo: "", data: "", hora: "", local: "", tipo: "Festa", destaque: "", mapsUrl: "", imagem: "", descricao: "", lotes: [],
    imagePositionY: 50 // 🦈 Default: Centro (50%)
  });
  const [novoLote, setNovoLote] = useState({ nome: "", preco: "", status: "ativo" as const });

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
              imagePositionY: doc.data().imagePositionY ?? 50 // Fallback
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

  const handleOpenEdit = (evento: Evento) => {
      setNovoEvento({ ...evento, imagePositionY: evento.imagePositionY ?? 50 });
      setEditingId(evento.id);
      setIsEditing(true);
      setShowModal(true);
  };

  const handleSave = async () => {
    if (!novoEvento.titulo?.trim()) return addToast("Título obrigatório!", "error");

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
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><Ticket size={48}/></div>
                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2"><Ticket size={14}/> Ingressos Vendidos</p>
                <p className="text-3xl font-black text-blue-400 mt-2">{dashboardStats.totalIngressos}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><DollarSign size={48}/></div>
                <p className="text-xs text-zinc-500 font-bold uppercase flex items-center gap-2"><TrendingUp size={14}/> Receita Estimada</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">R$ {dashboardStats.receitaEstimada.toLocaleString('pt-BR')}</p>
            </div>
        </div>

        {/* LISTA DE EVENTOS */}
        <div>
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2"><BarChart3 size={16}/> Eventos Ativos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventos.map((evento) => (
                <div key={evento.id} className={`rounded-2xl border overflow-hidden group hover:border-emerald-500/30 transition flex flex-col h-full ${evento.status === 'encerrado' ? 'bg-zinc-950 border-zinc-900 grayscale opacity-70' : 'bg-zinc-900 border-zinc-800'}`}>
                    <div className="h-32 bg-black/50 relative overflow-hidden">
                        {/* 🦈 APLICAÇÃO DA POSIÇÃO NO CARD ADMIN TAMBÉM */}
                        <img 
                            src={evento.imagem} 
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" 
                            style={{ objectPosition: `50% ${evento.imagePositionY || 50}%` }}
                        />
                        <div className="absolute top-2 left-2 flex gap-1"><span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm border border-white/10">{evento.tipo}</span></div>
                        {evento.status === 'encerrado' && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"><span className="text-red-500 font-black uppercase tracking-widest border border-red-500 px-4 py-2 rounded-lg transform -rotate-12">Encerrado</span></div>}
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-white text-lg leading-tight mb-1">{evento.titulo}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4"><Calendar size={12} className="text-emerald-500"/> {evento.data} <Users size={12} className="text-blue-500"/> {evento.stats?.confirmados || 0} confirmados</div>
                        <div className="flex gap-2 pt-3 border-t border-white/5 mt-auto">
                            <button onClick={() => setShowGestaoModal(evento)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-black transition flex justify-center items-center gap-2 text-xs font-bold uppercase"><Users size={14}/> Lista</button>
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
              <div className="bg-zinc-900 w-full max-w-4xl h-[90vh] rounded-2xl border border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/40">
                      <div><h2 className="font-black text-white text-xl uppercase tracking-tighter flex items-center gap-2"><Tag size={20} className="text-emerald-500"/> Gestão: {showGestaoModal.titulo}</h2></div>
                      <button onClick={() => setShowGestaoModal(null)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
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
                              {participantesReais.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-zinc-500">Ninguém na lista ainda.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CRIAR/EDITAR (Z-INDEX 100) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-lg rounded-2xl border border-zinc-800 p-6 space-y-4 my-10 animate-in zoom-in-95">
            <h2 className="font-bold text-white text-lg flex items-center gap-2"><Calendar size={20} className="text-emerald-500"/> {isEditing ? "Editar" : "Criar"} Evento</h2>
            <div className="space-y-3">
                
                {/* 🦈 UPLOAD COM PREVIEW E POSICIONAMENTO */}
                <div className="space-y-2">
                    <div onClick={() => fileInputRef.current?.click()} className="h-40 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-pointer hover:border-emerald-500 transition bg-black/20 relative group overflow-hidden">
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload}/>
                        {uploading ? <span className="text-xs text-emerald-500 animate-pulse">Enviando...</span> : novoEvento.imagem ? (
                            <img 
                                src={novoEvento.imagem} 
                                className="w-full h-full object-cover" 
                                style={{ objectPosition: `50% ${novoEvento.imagePositionY || 50}%` }}
                            />
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
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={novoEvento.imagePositionY || 50} 
                                onChange={(e) => setNovoEvento({ ...novoEvento, imagePositionY: Number(e.target.value) })}
                                className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                        </div>
                    )}
                </div>

                <input type="text" placeholder="Nome do Evento" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={novoEvento.titulo} onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Data (ex: 12 OUT)" className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.data} onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })} />
                    <input type="text" placeholder="Local" className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.local} onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })} />
                </div>
                <div className="flex gap-2">
                    <select className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400" value={novoEvento.tipo} onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}>
                        <option value="Festa">Festa</option><option value="Esporte">Esporte</option><option value="Outro">Outro...</option>
                    </select>
                    <input type="text" placeholder="Destaque (ex: OPEN BAR)" className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.destaque} onChange={(e) => setNovoEvento({ ...novoEvento, destaque: e.target.value })} />
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