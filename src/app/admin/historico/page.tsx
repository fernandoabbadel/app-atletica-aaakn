"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Save, X, 
  Calendar, MapPin, Image as ImageIcon, History, 
  Upload, Settings, Layout, Loader2, Database, RefreshCw
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db, storage } from "../../../lib/firebase"; 
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- 🦈 DADOS REAIS DE 2025 (BASEADO NOS FLYERS) ---
const MOCK_HISTORICO = [
    {
        titulo: "3º JUCA BEACH", 
        data: "2025-03-23", 
        ano: "2025",
        descricao: "Jogos Universitários de Caraguá. O dia em que a areia da Praia do Camaroeiro tremeu com a nossa torcida. Sol, mar e muita integração.",
        local: "Praia do Camaroeiro", 
        foto: "/historico/juca-beach.JPG"
    },
    {
        titulo: "ANESTESIA: Worries OFF", 
        data: "2025-05-14", 
        ano: "2025",
        descricao: "A festa para desligar as preocupações. O Santé Gastro Club ficou pequeno para a energia da Medicina Caraguá.",
        local: "Santé Gastro Club", 
        foto: "/historico/anestesia.JPG"
    },
    {
        titulo: "CALOURADA 2025.2", 
        data: "2025-08-15", 
        ano: "2025",
        descricao: "A recepção dos novos tubarões! Com DJ Lanco e Pétala no comando, mostramos aos calouros como se faz uma festa de verdade.",
        local: "O Garimpo", 
        foto: "/historico/calourada.JPG"
    },
    {
        titulo: "BLACKOUT: Turn Off The Lights", 
        data: "2025-09-27", 
        ano: "2025",
        descricao: "No escuro, a gente brilha mais. Uma noite inesquecível no Santé Gastro Club onde as luzes se apagaram e a loucura começou.",
        local: "Santé Gastro Club", 
        foto: "/historico/black-out.JPG"
    },
    {
        titulo: "EPIDEMIA: Festa a Fantasia", 
        data: "2025-10-25", 
        ano: "2025",
        descricao: "A festa a fantasia mais esperada do ano! A criatividade rolou solta e o terror tomou conta de Benfica.",
        local: "Rua Iraci, 59 - Benfica", 
        foto: "/historico/epidemia.JPG"
    },
    {
        titulo: "JIMESP: Primeira Edição", 
        data: "2025-11-20", 
        ano: "2025",
        descricao: "Histórico! Marcamos presença na primeira edição dos Jogos Interuniversitários de Medicina do Estado de São Paulo. De 20 a 22 de novembro, mostramos nossa força pro estado todo.",
        local: "São Paulo", 
        foto: "/historico/jimesp.JPG"
    }
];

// --- TIPAGEM ---
export interface HistoricEvent {
  id: string;
  titulo: string;
  data: string;
  ano: string;
  descricao: string;
  local: string;
  foto: string;
}

interface PageConfig {
  tituloPagina: string;
  subtituloPagina: string;
  fotoCapa: string;
}

export default function AdminHistoricoPage() {
  const { addToast } = useToast();
  
  // Estados Globais
  const [activeTab, setActiveTab] = useState<"gerenciar" | "configurar">("gerenciar");
  const [events, setEvents] = useState<HistoricEvent[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Estados de Configuração
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    tituloPagina: "",
    subtituloPagina: "",
    fotoCapa: ""
  });

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoricEvent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Estados de Upload
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 1. CARREGAR DADOS
  useEffect(() => {
    // Carregar Eventos
    const q = query(collection(db, "historic_events"), orderBy("data", "desc"));
    const unsubEvents = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as HistoricEvent)));
      setLoadingData(false);
    });

    // Carregar Configurações
    const fetchConfig = async () => {
      const snap = await getDoc(doc(db, "app_config", "historico"));
      if (snap.exists()) {
        setPageConfig(snap.data() as PageConfig);
      }
    };
    fetchConfig();

    return () => unsubEvents();
  }, []);

  // --- 🦈 FUNÇÃO DE RESGATE (SEED) ---
  const handleSeedDatabase = async () => {
      if(!confirm("⚠️ Atenção Tubarão!\nIsso vai adicionar os 6 eventos OFICIAIS de 2025 ao banco de dados.\n\nCertifique-se que as fotos estão na pasta public/historico.\n\nDeseja confirmar?")) return;
      
      setIsSaving(true);
      try {
          // Loop para adicionar cada evento do Mock ao Firebase
          const promises = MOCK_HISTORICO.map(evento => 
              addDoc(collection(db, "historic_events"), evento)
          );
          
          await Promise.all(promises);
          
          addToast("Histórico de 2025 restaurado com sucesso! 🦈", "success");
          setActiveTab("gerenciar"); // Joga pra lista pra ver o resultado na hora
      } catch (error) {
          console.error(error);
          addToast("Erro ao restaurar dados.", "error");
      } finally {
          setIsSaving(false);
      }
  };

  // --- HANDLERS DE MODAL ---
  const handleCreate = () => {
    setEditingEvent({ id: "", titulo: "", data: "", ano: "", descricao: "", local: "", foto: "" });
    setPreviewImage("");
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: HistoricEvent) => {
    setEditingEvent({ ...event });
    setPreviewImage(event.foto);
    setImageFile(null);
    setIsModalOpen(true);
  };

  // --- HANDLERS DE UPLOAD E SAVE ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveEvent = async () => {
    if (!editingEvent) return;
    if (!editingEvent.titulo || !editingEvent.data) {
        addToast("Preencha título e data!", "error");
        return;
    }

    setIsSaving(true);
    let finalFotoUrl = editingEvent.foto;

    try {
      if (imageFile) {
        const storageRef = ref(storage, `historico/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        finalFotoUrl = await getDownloadURL(storageRef);
      }

      const anoDerivado = editingEvent.ano || editingEvent.data.split("-")[0];
      const eventData = { ...editingEvent, ano: anoDerivado, foto: finalFotoUrl };
      
      const { id, ...dataToSave } = eventData;

      if (editingEvent.id) {
        await updateDoc(doc(db, "historic_events", editingEvent.id), dataToSave);
        addToast("Evento atualizado!", "success");
      } else {
        await addDoc(collection(db, "historic_events"), dataToSave);
        addToast("Novo marco criado!", "success");
      }
      setIsModalOpen(false);
    } catch (error) {
      addToast("Erro ao salvar.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Tem certeza que deseja apagar?")) {
      try {
        await deleteDoc(doc(db, "historic_events", id));
        addToast("Evento removido.", "info");
      } catch (error) {
        addToast("Erro ao excluir.", "error");
      }
    }
  };

  const handleConfigImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `config/historico_capa_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPageConfig(prev => ({ ...prev, fotoCapa: url }));
      addToast("Capa carregada!", "success");
    } catch (error) {
      addToast("Erro no upload.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "app_config", "historico"), pageConfig);
      addToast("Configurações salvas!", "success");
    } catch (error) {
      addToast("Erro ao salvar.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div>
            <h1 className="text-xl font-black uppercase flex items-center gap-2"><History className="text-emerald-500" /> Gestão História</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Construindo o Legado</p>
          </div>
        </div>
        {activeTab === "gerenciar" && (
            <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg transition active:scale-95">
                <Plus size={16} /> Novo Marco
            </button>
        )}
      </header>

      {/* ABAS */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6">
              <button onClick={() => setActiveTab("gerenciar")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "gerenciar" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}><Layout size={16}/> Timeline</button>
              <button onClick={() => setActiveTab("configurar")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "configurar" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}><Settings size={16}/> Configurações & Dados</button>
          </div>
      </div>

      <main className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {loadingData ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>
          ) : (
            <>
              {/* ABA GERENCIAR */}
              {activeTab === "gerenciar" && (
                  <div className="space-y-4">
                      {events.map((event) => (
                          <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 hover:border-emerald-500/50 transition group items-center">
                              <div className="w-20 h-20 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-700 relative">
                                  {event.foto ? <img src={event.foto} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImageIcon size={20}/></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-start">
                                      <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20 mb-1 inline-block">{event.ano}</span>
                                      <div className="flex gap-2">
                                          <button onClick={() => handleEdit(event)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition"><Edit size={14}/></button>
                                          <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-900/10 rounded-lg text-red-500 hover:bg-red-900/30 transition"><Trash2 size={14}/></button>
                                      </div>
                                  </div>
                                  <h3 className="text-base font-black text-white truncate">{event.titulo}</h3>
                                  <div className="flex items-center gap-4 mt-1">
                                      <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Calendar size={10}/> {event.data}</span>
                                      <span className="text-[10px] text-zinc-500 flex items-center gap-1"><MapPin size={10}/> {event.local}</span>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {events.length === 0 && (
                          <div className="text-center py-10 flex flex-col items-center gap-4">
                              <p className="text-zinc-600 text-sm font-bold uppercase">Nenhum evento registrado.</p>
                              <button onClick={() => setActiveTab("configurar")} className="text-emerald-500 text-xs hover:underline flex items-center gap-1"><Database size={12}/> Vá em Configurações para restaurar dados padrão</button>
                          </div>
                      )}
                  </div>
              )}

              {/* ABA CONFIGURAR */}
              {activeTab === "configurar" && (
                  <div className="space-y-8">
                      {/* CARD 1: APARÊNCIA */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                          <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><Settings size={16} className="text-emerald-500"/> Personalizar Página</h3>
                          
                          <div className="space-y-5">
                              <div>
                                  <label className="label-admin">Título da Página</label>
                                  <input type="text" className="input-admin text-lg font-black" value={pageConfig.tituloPagina} onChange={e => setPageConfig({...pageConfig, tituloPagina: e.target.value})}/>
                              </div>
                              <div>
                                  <label className="label-admin">Subtítulo</label>
                                  <textarea rows={2} className="input-admin" value={pageConfig.subtituloPagina} onChange={e => setPageConfig({...pageConfig, subtituloPagina: e.target.value})}/>
                              </div>
                              <div>
                                  <label className="label-admin">Capa</label>
                                  <div className="flex items-center gap-4 mt-2 bg-black/30 p-4 rounded-xl border border-zinc-800">
                                      <div className="w-24 h-16 bg-black rounded-lg overflow-hidden border border-zinc-700 relative">
                                          {pageConfig.fotoCapa ? <img src={pageConfig.fotoCapa} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImageIcon size={20}/></div>}
                                      </div>
                                      <label className={`cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                          {isUploading ? <Loader2 className="animate-spin" size={14}/> : <Upload size={14}/>}
                                          {isUploading ? "Enviando..." : "Trocar Capa"}
                                          <input type="file" className="hidden" accept="image/*" onChange={handleConfigImageUpload} disabled={isUploading}/>
                                      </label>
                                  </div>
                              </div>
                          </div>

                          <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                              <button onClick={handleSaveConfig} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-xs uppercase shadow-lg transition active:scale-95">
                                {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                Salvar
                              </button>
                          </div>
                      </div>

                      {/* CARD 2: ZONA DE DADOS (SEED) 🦈 */}
                      <div className="bg-zinc-900 border border-dashed border-yellow-500/20 rounded-3xl p-6">
                          <h3 className="text-sm font-bold text-yellow-500 uppercase mb-4 flex items-center gap-2"><Database size={16}/> Zona de Dados</h3>
                          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
                              Use esta opção se a lista estiver vazia e você quiser carregar os 6 eventos oficiais de 2025 (Juca Beach, Calourada, etc) automaticamente para não começar do zero.
                          </p>
                          
                          <button onClick={handleSeedDatabase} disabled={isSaving} className="w-full bg-zinc-800 hover:bg-yellow-500/10 hover:text-yellow-500 hover:border-yellow-500 border border-zinc-700 text-zinc-300 font-bold py-4 px-6 rounded-xl flex justify-center items-center gap-2 text-xs uppercase transition">
                              {isSaving ? <Loader2 className="animate-spin" size={16}/> : <RefreshCw size={16}/>}
                              Restaurar Histórico Padrão (2025)
                          </button>
                      </div>
                  </div>
              )}
            </>
          )}
      </main>

      {/* MODAL (MANTER IGUAL AO ANTERIOR) */}
      {isModalOpen && editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                  <h2 className="font-bold text-white text-xl mb-6">{editingEvent.id ? "Editar Marco" : "Criar História"}</h2>

                  <div className="space-y-4">
                      {/* UPLOAD DO EVENTO */}
                      <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 border-dashed hover:border-emerald-500/50 transition text-center relative group">
                          {previewImage ? (
                              <img src={previewImage} className="h-40 w-full object-cover rounded-lg"/>
                          ) : (
                              <div className="py-8 flex flex-col items-center gap-2 text-zinc-500">
                                  <ImageIcon size={32}/>
                                  <span className="text-xs font-bold uppercase">Clique para adicionar foto</span>
                              </div>
                          )}
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleFileChange}/>
                          {previewImage && <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none"><span className="text-white text-xs font-bold uppercase">Trocar Foto</span></div>}
                      </div>

                      <div><label className="label-admin">Título</label><input type="text" className="input-admin" value={editingEvent.titulo} onChange={e => setEditingEvent({...editingEvent, titulo: e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-3">
                          <div><label className="label-admin">Data</label><input type="date" className="input-admin" value={editingEvent.data} onChange={e => setEditingEvent({...editingEvent, data: e.target.value})}/></div>
                          <div><label className="label-admin">Ano</label><input type="text" className="input-admin" placeholder="Auto" value={editingEvent.ano} onChange={e => setEditingEvent({...editingEvent, ano: e.target.value})}/></div>
                      </div>
                      <div><label className="label-admin">Descrição</label><textarea rows={3} className="input-admin" value={editingEvent.descricao} onChange={e => setEditingEvent({...editingEvent, descricao: e.target.value})}/></div>
                      <div><label className="label-admin">Local</label><input type="text" className="input-admin" value={editingEvent.local} onChange={e => setEditingEvent({...editingEvent, local: e.target.value})}/></div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase transition">Cancelar</button>
                      <button onClick={handleSaveEvent} disabled={isSaving} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2 transition">
                        {isSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                        Salvar
                      </button>
                  </div>
              </div>
          </div>
      )}

      <style jsx global>{`
        .label-admin { font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .input-admin { width: 100%; background: #000; border: 1px solid #27272a; border-radius: 0.5rem; padding: 0.75rem; color: white; outline: none; font-size: 0.875rem; transition: border-color 0.2s; }
        .input-admin:focus { border-color: #10b981; }
      `}</style>
    </div>
  );
}