"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Save, X, Search, 
  Shield, Key, Users, UploadCloud, Eye, EyeOff, 
  Loader2, Calendar, MessageCircle, Lightbulb, Bell, UserPlus 
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { uploadImage } from "../../../lib/upload";
import { 
  collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query, orderBy, setDoc, serverTimestamp, getDocs 
} from "firebase/firestore";

// --- TIPAGEM ---
interface PerguntaLiga { 
    id: string; 
    texto: string; 
    imagemBase64?: string; 
    alternativas: string[]; 
    correta: number; 
}

interface Member { 
    id: string; 
    nome: string; 
    cargo: string; 
    foto: string; 
    linkPerfil?: string; 
}

interface Lote { 
    id: number; 
    nome: string; 
    preco: string; 
    status: "ativo" | "encerrado" | "agendado"; 
}

interface LeagueEvent { 
    id: string; 
    titulo: string; 
    data: string; 
    hora: string; 
    local: string; 
    tipo: string; 
    destaque: string; 
    imagem: string; 
    imagePositionY: number;
    lotes: Lote[]; 
    descricao: string; 
    linkEvento?: string; 
    globalEventId?: string;
    pollQuestion?: string; 
}

interface Liga {
  id: string;
  nome: string;
  sigla: string;
  presidente: string;
  descricao: string;
  senha: string;
  foto: string; // URL da logo
  logoBase64?: string; // Para compatibilidade com o front
  membros: Member[];
  eventos: LeagueEvent[];
  perguntas: PerguntaLiga[];
  bizu: string;
  likes: number;
}

// Helper para Base64 (usado nas perguntas e membros internos se não usar uploadImage)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function AdminLigasPage() {
  const { addToast } = useToast();
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controle de Modal e Edição
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'membros' | 'eventos' | 'shark'>('info');
  
  // Estado para visualização de senha
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  // Busca de Usuários
  const [searchUserModal, setSearchUserModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);

  // Form State Principal
  const [formData, setFormData] = useState<Partial<Liga>>({
    nome: "", sigla: "", presidente: "", descricao: "", senha: "", foto: "", 
    membros: [], eventos: [], perguntas: [], bizu: "", likes: 0
  });

  // Estado Evento
  const [eventModal, setEventModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<LeagueEvent>>({});
  const [editingEventIdx, setEditingEventIdx] = useState<number | null>(null);

  // 1. BUSCAR LIGAS EM TEMPO REAL
  useEffect(() => {
    const q = query(collection(db, "ligas_config"), orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        membros: doc.data().membros || [],
        eventos: doc.data().eventos || [],
        perguntas: doc.data().perguntas || []
      })) as Liga[];
      setLigas(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. BUSCAR USUÁRIOS (Para adicionar membros)
  useEffect(() => {
      const fetchUsers = async () => {
          const snap = await getDocs(collection(db, "users"));
          setAllUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      };
      if (searchUserModal) fetchUsers();
  }, [searchUserModal]);

  // --- AÇÕES ---

  const handleOpenCreate = () => {
    setFormData({ 
        nome: "", sigla: "", presidente: "", descricao: "", senha: "", foto: "", 
        membros: [], eventos: [], perguntas: [], bizu: "", likes: 0 
    });
    setIsEditing(false);
    setShowModal(true);
    setActiveTab('info');
  };

  const handleOpenEdit = (liga: Liga) => {
    setFormData(liga);
    setEditingId(liga.id);
    setIsEditing(true);
    setShowModal(true);
    setActiveTab('info');
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta Liga?")) return;
    try {
      await deleteDoc(doc(db, "ligas_config", id));
      addToast("Liga removida com sucesso.", "success");
    } catch (e) {
      addToast("Erro ao remover.", "error");
    }
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.senha) return addToast("Nome e Senha são obrigatórios!", "error");

    try {
      if (isEditing && editingId) {
        await updateDoc(doc(db, "ligas_config", editingId), formData);
        addToast("Liga atualizada!", "success");
      } else {
        await addDoc(collection(db, "ligas_config"), formData);
        addToast("Liga criada!", "success");
      }
      setShowModal(false);
    } catch (e) {
      addToast("Erro ao salvar.", "error");
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      const { url } = await uploadImage(file, "ligas");
      if (url) setFormData(prev => ({ ...prev, foto: url, logoBase64: url })); // Salva em ambos para compatibilidade
      setUploading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // --- GESTÃO DE MEMBROS ---
  const addMemberFromSearch = (u: any) => {
      const newMember: Member = { 
          id: u.id, 
          nome: u.nome || "Sem Nome", 
          cargo: "Membro", 
          foto: u.foto || "", 
          linkPerfil: `/perfil/${u.id}` 
      };
      setFormData(prev => ({ ...prev, membros: [...(prev.membros || []), newMember] }));
      setSearchUserModal(false);
      addToast("Membro adicionado.", "success");
  };

  const removeMember = (idx: number) => {
      setFormData(prev => ({ ...prev, membros: prev.membros?.filter((_, i) => i !== idx) }));
  };

  const updateMemberCargo = (idx: number, val: string) => {
      const novos = [...(formData.membros || [])];
      novos[idx].cargo = val;
      setFormData({ ...formData, membros: novos });
  };

  // --- GESTÃO DE EVENTOS ---
  const handleOpenEventModal = (idx: number | null) => {
      if (idx !== null && formData.eventos) {
          setCurrentEvent(formData.eventos[idx]);
          setEditingEventIdx(idx);
      } else {
          setCurrentEvent({ 
              id: Date.now().toString(), titulo: "", data: "", hora: "", local: "", 
              tipo: "Festa", destaque: "", imagem: "", imagePositionY: 50, 
              lotes: [], descricao: "", pollQuestion: "" 
          });
          setEditingEventIdx(null);
      }
      setEventModal(true);
  };

  const saveEventLocal = () => {
      if (!currentEvent.titulo) return addToast("Título obrigatório!", "error");
      const novosEventos = [...(formData.eventos || [])];
      const eventoSalvo = currentEvent as LeagueEvent;
      
      if (editingEventIdx !== null) {
          novosEventos[editingEventIdx] = eventoSalvo;
      } else {
          novosEventos.push(eventoSalvo);
      }
      setFormData({ ...formData, eventos: novosEventos });
      setEventModal(false);
  };

  // --- GESTÃO SHARK ROUND (PERGUNTAS) ---
  const addQuestion = () => setFormData(prev => ({...prev, perguntas: [...(prev.perguntas||[]), { id: Date.now().toString(), texto: "", alternativas: ["","","",""], correta: 0 }]}));
  
  const updateQuestion = (idx: number, field: string, val: any) => {
      const novas = [...(formData.perguntas || [])];
      if(field === 'texto') novas[idx].texto = val; 
      else if(field === 'correta') novas[idx].correta = val; 
      else {
          const altIdx = parseInt(field.split('-')[1]); 
          novas[idx].alternativas[altIdx] = val;
      }
      setFormData({ ...formData, perguntas: novas });
  };

  const removeQuestion = (idx: number) => setFormData(prev => ({...prev, perguntas: prev.perguntas?.filter((_, i) => i !== idx)}));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
            <Shield size={20} className="text-emerald-500"/> Gestão de Ligas
          </h1>
        </div>
        <button onClick={handleOpenCreate} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
          <Plus size={16} /> Nova Liga
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* LISTA DE LIGAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ligas.map(liga => (
            <div key={liga.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 group hover:border-emerald-500/30 transition">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={liga.foto || "https://github.com/shadcn.png"} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-zinc-800"
                  />
                  <div>
                    <h3 className="font-bold text-white uppercase">{liga.nome}</h3>
                    <p className="text-xs text-zinc-500 font-bold">{liga.sigla} • {liga.presidente}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenEdit(liga)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(liga.id)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                </div>
              </div>

              {/* VISUALIZADOR DE SENHA */}
              <div className="bg-black/40 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Key size={14} className="text-emerald-500"/>
                    <span className="font-mono">
                        {showPassword[liga.id] ? liga.senha : "••••••••"}
                    </span>
                </div>
                <button onClick={() => togglePasswordVisibility(liga.id)} className="text-zinc-500 hover:text-white">
                    {showPassword[liga.id] ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 line-clamp-2">
                  {liga.descricao}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* MODAL CRIAR/EDITAR (COM ABAS) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-2xl rounded-2xl border border-zinc-800 p-6 space-y-4 animate-in zoom-in-95 my-10">
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-white text-lg">{isEditing ? "Editar Liga" : "Nova Liga"}</h2>
                <button onClick={() => setShowModal(false)}><X size={20} className="text-zinc-500 hover:text-white"/></button>
            </div>

            {/* ABAS DO MODAL */}
            <div className="flex border-b border-zinc-800 mb-4 overflow-x-auto">
                {['info', 'membros', 'eventos', 'shark'].map(tab => (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-xs font-bold uppercase border-b-2 transition ${activeTab === tab ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}
                    >
                        {tab === 'info' ? 'Informações' : tab}
                    </button>
                ))}
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">
                {/* 1. ABA INFO */}
                {activeTab === 'info' && (
                    <div className="space-y-3">
                        <div className="flex justify-center mb-4">
                            <label className="relative w-24 h-24 rounded-full bg-zinc-900 border-2 border-dashed border-zinc-700 flex items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden group">
                                {formData.foto ? <img src={formData.foto} className="w-full h-full object-cover"/> : <UploadCloud className="text-zinc-500 group-hover:text-emerald-500"/>}
                                <input type="file" className="hidden" onChange={handleUpload}/>
                                {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500"/></div>}
                            </label>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Nome da Liga" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm text-white outline-none" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})}/>
                            <input type="text" placeholder="Sigla" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm text-white outline-none uppercase" value={formData.sigla} onChange={e => setFormData({...formData, sigla: e.target.value})}/>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="Presidente" className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm text-white outline-none" value={formData.presidente} onChange={e => setFormData({...formData, presidente: e.target.value})}/>
                            <input type="text" placeholder="Senha de Acesso" className="w-full bg-zinc-900 border border-emerald-500/30 p-3 rounded-xl text-sm text-white outline-none" value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})}/>
                        </div>
                        <textarea rows={3} placeholder="Descrição..." className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-sm text-white outline-none resize-none" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}/>
                        <input type="text" placeholder="Bizu da Semana" className="w-full bg-zinc-900 border border-yellow-500/30 p-3 rounded-xl text-sm text-white outline-none" value={formData.bizu} onChange={e => setFormData({...formData, bizu: e.target.value})}/>
                    </div>
                )}

                {/* 2. ABA MEMBROS */}
                {activeTab === 'membros' && (
                    <div className="space-y-3">
                        <button onClick={() => setSearchUserModal(true)} className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-xs font-bold uppercase hover:border-emerald-500 hover:text-emerald-500 transition flex justify-center items-center gap-2"><UserPlus size={16}/> Adicionar Membro</button>
                        {formData.membros?.map((m, idx) => (
                            <div key={idx} className="flex items-center gap-3 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                <img src={m.foto || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full object-cover"/>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-white">{m.nome}</p>
                                    <input type="text" placeholder="Cargo" value={m.cargo} onChange={e => updateMemberCargo(idx, e.target.value)} className="bg-transparent text-xs text-emerald-500 outline-none w-full"/>
                                </div>
                                <button onClick={() => removeMember(idx)} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                )}

                {/* 3. ABA EVENTOS */}
                {activeTab === 'eventos' && (
                    <div className="space-y-3">
                        <button onClick={() => handleOpenEventModal(null)} className="w-full py-3 border border-dashed border-zinc-700 rounded-xl text-zinc-500 text-xs font-bold uppercase hover:border-emerald-500 hover:text-emerald-500 transition flex justify-center items-center gap-2"><Calendar size={16}/> Adicionar Evento</button>
                        {formData.eventos?.map((ev, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                                <span className="text-sm font-bold text-white">{ev.titulo}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEventModal(idx)} className="text-zinc-400 hover:text-white"><Edit size={16}/></button>
                                    <button onClick={() => setFormData({...formData, eventos: formData.eventos?.filter((_, i) => i !== idx)})} className="text-zinc-600 hover:text-red-500"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 4. ABA SHARK ROUND */}
                {activeTab === 'shark' && (
                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-zinc-500 uppercase">Banco de Questões ({formData.perguntas?.length}/10)</h3><button onClick={addQuestion} className="text-emerald-500 text-xs font-bold hover:underline">+ Adicionar</button></div>
                        {formData.perguntas?.map((p, idx) => (
                            <div key={idx} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 space-y-2 relative group">
                                <button onClick={() => removeQuestion(idx)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-500"><Trash2 size={14}/></button>
                                <input type="text" value={p.texto} onChange={e => updateQuestion(idx, 'texto', e.target.value)} className="w-full bg-transparent border-b border-zinc-700 text-sm text-white outline-none pb-1" placeholder="Pergunta..."/>
                                {p.alternativas.map((alt, aIdx) => (
                                    <div key={aIdx} className="flex items-center gap-2">
                                        <input type="radio" name={`q-${idx}`} checked={p.correta === aIdx} onChange={() => updateQuestion(idx, 'correta', aIdx)} className="accent-emerald-500"/>
                                        <input type="text" value={alt} onChange={e => updateQuestion(idx, `alt-${aIdx}`, e.target.value)} className="flex-1 bg-black rounded p-1 text-xs border border-zinc-800 text-zinc-300" placeholder={`Opção ${aIdx+1}`}/>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-800 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-900">Cancelar</button>
                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg">Salvar Tudo</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SEARCH USER */}
      {searchUserModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6 shadow-2xl relative animate-in zoom-in-95">
                <button onClick={() => setSearchUserModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                <h3 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Search size={16} className="text-emerald-500"/> Buscar Aluno</h3>
                <input type="text" placeholder="Digite o nome..." className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-sm text-white mb-4 outline-none focus:border-emerald-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {allUsers.filter(u => u.nome?.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
                        <div key={u.id} className="flex items-center justify-between p-3 bg-black/50 rounded-lg cursor-pointer hover:bg-zinc-800 transition" onClick={() => addMemberFromSearch(u)}>
                            <div className="flex items-center gap-3">
                                <img src={u.foto || "https://github.com/shadcn.png"} className="w-8 h-8 rounded-full object-cover"/>
                                <div><p className="text-xs font-bold text-white">{u.nome}</p><p className="text-[10px] text-zinc-500">{u.turma || "Sem turma"}</p></div>
                            </div>
                            <Plus size={14} className="text-emerald-500"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* MODAL EVENTO */}
      {eventModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-zinc-950 w-full max-w-md rounded-2xl border border-zinc-800 p-6 space-y-3 animate-in zoom-in-95">
                  <h3 className="text-white font-bold">Editar Evento</h3>
                  <input type="text" placeholder="Título" value={currentEvent.titulo} onChange={e => setCurrentEvent({...currentEvent, titulo: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-white"/>
                  <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Data" value={currentEvent.data} onChange={e => setCurrentEvent({...currentEvent, data: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-white"/>
                      <input type="text" placeholder="Hora" value={currentEvent.hora} onChange={e => setCurrentEvent({...currentEvent, hora: e.target.value})} className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-white"/>
                  </div>
                  <input type="text" placeholder="Local" value={currentEvent.local} onChange={e => setCurrentEvent({...currentEvent, local: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-white"/>
                  <textarea placeholder="Descrição" value={currentEvent.descricao} onChange={e => setCurrentEvent({...currentEvent, descricao: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm text-white h-20 resize-none"/>
                  <div className="flex gap-2 pt-2">
                      <button onClick={() => setEventModal(false)} className="flex-1 py-2 border border-zinc-700 rounded-lg text-xs text-zinc-400">Cancelar</button>
                      <button onClick={saveEventLocal} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">Salvar Evento</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}