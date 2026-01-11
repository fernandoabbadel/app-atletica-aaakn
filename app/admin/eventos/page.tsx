"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Calendar, MapPin, 
  DollarSign, Image as ImageIcon, Link as LinkIcon, 
  UploadCloud, X, Tag, Users, CheckCircle, Search, MoreHorizontal, Download
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// Tipos
interface Lote {
  id: number;
  nome: string;
  preco: string;
  status: "ativo" | "encerrado" | "agendado";
  dataVirada?: string;
}

interface Participante {
    id: number;
    nome: string;
    status: "pago" | "pendente";
    lote: string;
    origem: "app" | "manual";
}

interface Evento {
  id: number;
  titulo: string;
  data: string;
  hora: string;
  local: string;
  tipo: string;
  destaque: string;
  mapsUrl: string;
  imagem: string;
  lotes: Lote[];
  participantes: Participante[];
  status: "ativo" | "encerrado";
}

const EVENTOS_MOCK: Evento[] = [
  {
    id: 1,
    titulo: "INTERMED 2026",
    data: "12 a 15 OUT",
    hora: "14:00 - 22:00",
    local: "Arena XP",
    tipo: "Festa",
    destaque: "OPEN BAR",
    mapsUrl: "",
    imagem: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    status: "ativo",
    lotes: [{ id: 1, nome: "Lote 1", preco: "R$ 75,00", status: "ativo", dataVirada: "2026-10-01" }],
    participantes: [
        { id: 101, nome: "Ana Clara", status: "pago", lote: "Lote 1", origem: "app" },
        { id: 102, nome: "João Pedro", status: "pendente", lote: "Lote 1", origem: "app" }
    ]
  },
];

export default function AdminEventosPage() {
  const { addToast } = useToast();
  const [eventos, setEventos] = useState<Evento[]>(EVENTOS_MOCK);
  
  // Modais
  const [showModal, setShowModal] = useState(false);
  const [showGestaoModal, setShowGestaoModal] = useState<Evento | null>(null);
  
  // Estado para menu de ações (qual participante está com menu aberto)
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Edição/Criação
  const [novoEvento, setNovoEvento] = useState<Partial<Evento>>({
    titulo: "", data: "", hora: "", local: "", tipo: "Festa", destaque: "", mapsUrl: "", imagem: "", lotes: []
  });
  const [novoLote, setNovoLote] = useState({ nome: "", preco: "", dataVirada: "", status: "ativo" as const });
  const [novoParticipante, setNovoParticipante] = useState({ nome: "", lote: "" });

  // --- FUNÇÕES DE AÇÃO ---

  const exportarCSV = () => {
      if(!showGestaoModal) return;

      const headers = ["Nome", "Lote", "Origem", "Status"];
      const rows = showGestaoModal.participantes.map(p => [
          p.nome, 
          p.lote, 
          p.origem, 
          p.status
      ]);

      const csvContent = [
          headers.join(","), 
          ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `lista_presenca_${showGestaoModal.titulo}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addToast("Baixou — os tubarões já foram buscar na prateleira.", "success");
  };

  const removeParticipante = (pId: number) => {
      if(!showGestaoModal) return;
      const novosParticipantes = showGestaoModal.participantes.filter(p => p.id !== pId);
      
      const eventoAtualizado = { ...showGestaoModal, participantes: novosParticipantes };
      setEventos(prev => prev.map(e => e.id === showGestaoModal.id ? eventoAtualizado : e));
      setShowGestaoModal(eventoAtualizado);
      setActiveMenuId(null);
      addToast("Participante removido da lista.", "info");
  };

  // --- CRUD EVENTOS E LOTES (Mantido do anterior) ---
  const handleSave = () => {
    if (!novoEvento.titulo?.trim()) {
        addToast("Ops — título obrigatório!", "error");
        return;
    }
    setEventos([...eventos, { 
        id: Date.now(), 
        ...novoEvento as Evento, 
        lotes: novoEvento.lotes || [], 
        participantes: [],
        status: "ativo" 
    }]);
    setShowModal(false);
    addToast("Evento criado! Os tubarões já estão sabendo.", "success");
  };

  const handleDelete = (id: number) => {
    if (confirm("Excluir evento?")) {
      setEventos((prev) => prev.filter((e) => e.id !== id));
      addToast("Evento cancelado.", "info");
    }
  };

  const handleAddLote = () => {
      if(!novoLote.nome || !novoLote.preco) return;
      const lotes = novoEvento.lotes || [];
      setNovoEvento({ ...novoEvento, lotes: [...lotes, { id: Date.now(), ...novoLote }] });
      setNovoLote({ nome: "", preco: "", dataVirada: "", status: "ativo" });
  };

  const handleAddParticipanteManual = () => {
      if(!showGestaoModal || !novoParticipante.nome) return;
      const novoUser: Participante = {
          id: Date.now(),
          nome: novoParticipante.nome,
          status: "pago",
          lote: novoParticipante.lote || "Geral",
          origem: "manual"
      };
      const eventoAtualizado = {
          ...showGestaoModal,
          participantes: [...showGestaoModal.participantes, novoUser]
      };
      setEventos(prev => prev.map(e => e.id === showGestaoModal.id ? eventoAtualizado : e));
      setShowGestaoModal(eventoAtualizado);
      setNovoParticipante({ nome: "", lote: "" });
      addToast("Participante adicionado manualmente.", "success");
  }

  const toggleStatusPagamento = (pId: number) => {
      if(!showGestaoModal) return;
      const novosParticipantes = showGestaoModal.participantes.map(p => 
          p.id === pId ? { ...p, status: p.status === "pago" ? "pendente" : "pago" as "pago" | "pendente" } : p
      );
      const eventoAtualizado = { ...showGestaoModal, participantes: novosParticipantes };
      setEventos(prev => prev.map(e => e.id === showGestaoModal.id ? eventoAtualizado : e));
      setShowGestaoModal(eventoAtualizado);
      addToast("Status de pagamento atualizado.", "info");
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (ev) => setNovoEvento({ ...novoEvento, imagem: ev.target?.result as string });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10" onClick={() => setActiveMenuId(null)}>
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestão de Eventos</h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
          <Plus size={16} /> Novo Evento
        </button>
      </header>

      <main className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventos.map((evento) => (
          <div key={evento.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden group hover:border-emerald-500/30 transition flex flex-col h-full">
            <div className="h-32 bg-black/50 relative">
                <img src={evento.imagem} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                <div className="absolute top-2 left-2 flex gap-1">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-sm border border-white/10">{evento.tipo}</span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col">
              <h3 className="font-bold text-white text-lg leading-tight mb-1">{evento.titulo}</h3>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                  <Calendar size={12} className="text-emerald-500"/> {evento.data}
                  <span className="w-1 h-1 bg-zinc-600 rounded-full"></span>
                  <Users size={12} className="text-blue-500"/> {evento.participantes.length} confirmados
              </div>

              <div className="flex gap-2 pt-3 border-t border-white/5 mt-auto">
                <button onClick={() => setShowGestaoModal(evento)} className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500 hover:text-black transition flex justify-center items-center gap-2 text-xs font-bold uppercase">
                    <Users size={14}/> Gerenciar Lista
                </button>
                <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"><Edit size={16} /></button>
                <button onClick={() => handleDelete(evento.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* --- MODAL DE GESTÃO DE LISTA --- */}
      {showGestaoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={(e) => e.stopPropagation()}>
              <div className="bg-zinc-900 w-full max-w-4xl h-[90vh] rounded-2xl border border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/40">
                      <div>
                          <h2 className="font-black text-white text-xl uppercase tracking-tighter flex items-center gap-2">
                              <Tag size={20} className="text-emerald-500"/> Gestão: {showGestaoModal.titulo}
                          </h2>
                          <p className="text-xs text-zinc-400 mt-1">Controle de pagantes e lista de presença.</p>
                      </div>
                      <button onClick={() => setShowGestaoModal(null)} className="p-2 hover:bg-zinc-800 rounded-full transition"><X size={20}/></button>
                  </div>

                  <div className="flex-1 flex overflow-hidden">
                      {/* Coluna Esquerda */}
                      <aside className="w-1/3 border-r border-zinc-800 p-6 bg-black/20 overflow-y-auto">
                          <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-2">
                              <Plus size={16} className="text-blue-500"/> Adicionar Pagante
                          </h3>
                          <div className="space-y-3">
                              <input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm text-white" value={novoParticipante.nome} onChange={e => setNovoParticipante({...novoParticipante, nome: e.target.value})} placeholder="Nome Completo" />
                              <select className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm text-zinc-300" value={novoParticipante.lote} onChange={e => setNovoParticipante({...novoParticipante, lote: e.target.value})}>
                                  <option value="">Selecione Lote...</option>
                                  {showGestaoModal.lotes.map(l => <option key={l.id} value={l.nome}>{l.nome} - {l.preco}</option>)}
                                  <option value="Cortesia">Cortesia / Staff</option>
                              </select>
                              <button onClick={handleAddParticipanteManual} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase transition mt-2">
                                  Confirmar Pagamento
                              </button>
                          </div>
                      </aside>

                      {/* Coluna Direita: Lista */}
                      <main className="flex-1 p-6 overflow-y-auto" onClick={() => setActiveMenuId(null)}>
                          <div className="flex justify-between items-center mb-4">
                              <div className="relative w-64">
                                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                                  <input type="text" placeholder="Buscar na lista..." className="w-full bg-zinc-900 border border-zinc-700 rounded-full pl-10 pr-4 py-2 text-xs text-white focus:border-emerald-500 outline-none"/>
                              </div>
                              <button onClick={exportarCSV} className="text-xs text-emerald-500 font-bold hover:underline flex items-center gap-1">
                                  <Download size={14}/> Exportar CSV
                              </button>
                          </div>

                          <table className="w-full text-left border-collapse">
                              <thead>
                                  <tr className="border-b border-zinc-800 text-[10px] font-black uppercase text-zinc-500">
                                      <th className="py-3 px-4">Nome</th>
                                      <th className="py-3 px-4">Lote</th>
                                      <th className="py-3 px-4">Origem</th>
                                      <th className="py-3 px-4">Status</th>
                                      <th className="py-3 px-4 text-right">Ações</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {showGestaoModal.participantes.map(p => (
                                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition relative">
                                          <td className="py-3 px-4 font-bold text-sm text-white">{p.nome}</td>
                                          <td className="py-3 px-4 text-xs text-zinc-400">{p.lote}</td>
                                          <td className="py-3 px-4">
                                              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${p.origem === 'app' ? 'bg-purple-500/10 text-purple-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                  {p.origem}
                                              </span>
                                          </td>
                                          <td className="py-3 px-4">
                                              <button onClick={() => toggleStatusPagamento(p.id)} className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1 w-fit transition ${p.status === 'pago' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                                                  {p.status === 'pago' ? <CheckCircle size={10}/> : <span className="w-2 h-2 rounded-full bg-zinc-500"></span>}
                                                  {p.status}
                                              </button>
                                          </td>
                                          <td className="py-3 px-4 text-right relative">
                                              <button 
                                                  onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === p.id ? null : p.id); }} 
                                                  className="text-zinc-600 hover:text-white transition p-1 rounded hover:bg-zinc-700"
                                              >
                                                  <MoreHorizontal size={16}/>
                                              </button>
                                              
                                              {/* MENU DE AÇÕES */}
                                              {activeMenuId === p.id && (
                                                  <div className="absolute right-8 top-8 bg-black border border-zinc-800 rounded-xl shadow-xl z-50 w-32 overflow-hidden flex flex-col">
                                                      <button onClick={() => removeParticipante(p.id)} className="text-left px-4 py-2 text-xs text-red-500 hover:bg-red-500/10 font-bold flex items-center gap-2">
                                                          <Trash2 size={12}/> Remover
                                                      </button>
                                                  </div>
                                              )}
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </main>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CRIAR (Igual anterior) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-lg rounded-2xl border border-zinc-800 p-6 space-y-4 my-10">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
                <Calendar size={20} className="text-emerald-500"/> Criar/Editar Evento
            </h2>
            <div className="space-y-3">
                <input type="text" placeholder="Nome do Evento" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={novoEvento.titulo} onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="Data (ex: 12 OUT)" className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.data} onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })} />
                    <input type="text" placeholder="Local" className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white" value={novoEvento.local} onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })} />
                </div>
                <div className="flex gap-2">
                    <select className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400" value={novoEvento.tipo} onChange={(e) => setNovoEvento({ ...novoEvento, tipo: e.target.value })}>
                        <option value="Festa">Festa</option>
                        <option value="Esporte">Esporte</option>
                        <option value="Outro">Outro...</option>
                    </select>
                </div>
                
                {/* Gestão de Lotes */}
                <div className="bg-black/40 border border-zinc-800 rounded-xl p-4">
                    <label className="text-xs text-zinc-500 font-bold uppercase mb-3 block border-b border-zinc-800 pb-2">Configurar Lotes</label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        <input type="text" placeholder="Nome (ex: Lote 1)" className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white" value={novoLote.nome} onChange={e => setNovoLote({...novoLote, nome: e.target.value})} />
                        <input type="text" placeholder="Preço (R$)" className="bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white" value={novoLote.preco} onChange={e => setNovoLote({...novoLote, preco: e.target.value})} />
                    </div>
                    <button onClick={handleAddLote} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500">Adicionar Lote</button>
                    <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
                        {novoEvento.lotes?.map(l => (
                            <div key={l.id} className="flex justify-between items-center text-xs bg-zinc-900 px-3 py-2 rounded border border-zinc-800">
                                <span className="text-white font-bold">{l.nome} - {l.preco}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}