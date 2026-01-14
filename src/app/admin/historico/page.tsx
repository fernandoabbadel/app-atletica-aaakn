"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Save, X, 
  Calendar, MapPin, Image as ImageIcon, History, 
  Upload, Settings, Layout
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---
export interface HistoricEvent {
    id: string;
    titulo: string;
    data: string;
    ano: string;
    descricao: string;
    local: string;
    foto: string; // URL ou Base64
    fotoFile?: File; // Arquivo para upload
}

// Configuração da Página Pública
interface PageConfig {
    tituloPagina: string;
    subtituloPagina: string;
    fotoCapa: string;
}

const INITIAL_EVENTS: HistoricEvent[] = [
    {
        id: "1", titulo: "Fundação da AAAKN", data: "2018-03-15", ano: "2018",
        descricao: "O início de tudo...",
        local: "Campus Unitau", foto: "/historico/fundacao.jpg"
    }
];

export default function AdminHistoricoPage() {
  const { addToast } = useToast();
  
  // Estados
  const [activeTab, setActiveTab] = useState<"gerenciar" | "configurar">("gerenciar");
  const [events, setEvents] = useState<HistoricEvent[]>(INITIAL_EVENTS);
  const [pageConfig, setPageConfig] = useState<PageConfig>({
      tituloPagina: "Nossa História",
      subtituloPagina: "Cada gota de suor, cada grito de gol registrada aqui.",
      fotoCapa: "/logo.png"
  });

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<HistoricEvent | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  const sortedEvents = [...events].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // --- HANDLERS DE EVENTO ---
  const handleCreate = () => {
      setEditingEvent({ id: "", titulo: "", data: "", ano: "", descricao: "", local: "", foto: "" });
      setPreviewImage("");
      setIsModalOpen(true);
  };

  const handleEdit = (event: HistoricEvent) => {
      setEditingEvent({ ...event });
      setPreviewImage(event.foto);
      setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && editingEvent) {
          // Cria URL temporária para preview
          const url = URL.createObjectURL(file);
          setEditingEvent({ ...editingEvent, fotoFile: file });
          setPreviewImage(url);
      }
  };

  const handleSave = () => {
      if (!editingEvent) return;
      
      // Lógica de Upload (Simulada: Usa o preview como URL final se tiver arquivo)
      // No Firebase, aqui você faria o uploadBytes e pegaria o downloadURL
      const finalFoto = editingEvent.fotoFile ? previewImage : editingEvent.foto;
      
      const anoDerivado = editingEvent.ano || editingEvent.data.split("-")[0];
      const eventToSave = { ...editingEvent, ano: anoDerivado, foto: finalFoto };

      if (editingEvent.id === "") {
          setEvents([...events, { ...eventToSave, id: Date.now().toString() }]);
          addToast("Novo marco histórico criado!", "success");
      } else {
          setEvents(events.map(e => e.id === editingEvent.id ? eventToSave : e));
          addToast("Histórico atualizado!", "success");
      }
      setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
      if(confirm("Apagar este evento?")) {
          setEvents(events.filter(e => e.id !== id));
          addToast("Evento removido.", "info");
      }
  };

  // --- HANDLER DE CONFIGURAÇÃO ---
  const handleSaveConfig = () => {
      // Salvar no banco de dados
      addToast("Configurações da página salvas!", "success");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black uppercase flex items-center gap-2"><History className="text-emerald-500" /> Gestão História</h1></div>
        </div>
        {activeTab === "gerenciar" && (
            <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg"><Plus size={16} /> Novo Marco</button>
        )}
      </header>

      {/* ABAS */}
      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6">
              <button onClick={() => setActiveTab("gerenciar")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 ${activeTab === "gerenciar" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent"}`}><Layout size={16}/> Timeline</button>
              <button onClick={() => setActiveTab("configurar")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 ${activeTab === "configurar" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent"}`}><Settings size={16}/> Configurar Página</button>
          </div>
      </div>

      <main className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ABA GERENCIAR (LISTA) */}
          {activeTab === "gerenciar" && (
              <div className="space-y-4">
                  {sortedEvents.map((event) => (
                      <div key={event.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 hover:border-emerald-500/50 transition group">
                          <div className="w-24 h-24 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-700 relative">
                              {event.foto ? <img src={event.foto} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImageIcon size={24}/></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                  <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20 mb-2 inline-block">{event.ano}</span>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleEdit(event)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><Edit size={14}/></button>
                                      <button onClick={() => handleDelete(event.id)} className="p-2 bg-red-900/20 rounded-lg text-red-500 hover:bg-red-900/40"><Trash2 size={14}/></button>
                                  </div>
                              </div>
                              <h3 className="text-lg font-black text-white truncate">{event.titulo}</h3>
                              <div className="flex items-center gap-4 mt-3">
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Calendar size={10}/> {event.data}</span>
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1"><MapPin size={10}/> {event.local}</span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {/* ABA CONFIGURAR (EDITAR CAMPOS DA PÁGINA) */}
          {activeTab === "configurar" && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
                  <h3 className="text-sm font-bold text-white uppercase mb-6 flex items-center gap-2"><Settings size={16} className="text-emerald-500"/> Personalizar Seção História</h3>
                  
                  <div className="space-y-5">
                      <div>
                          <label className="label-admin">Título da Página</label>
                          <input type="text" className="input-admin text-lg font-black" value={pageConfig.tituloPagina} onChange={e => setPageConfig({...pageConfig, tituloPagina: e.target.value})}/>
                      </div>
                      <div>
                          <label className="label-admin">Subtítulo (Frase de Efeito)</label>
                          <textarea rows={2} className="input-admin" value={pageConfig.subtituloPagina} onChange={e => setPageConfig({...pageConfig, subtituloPagina: e.target.value})}/>
                      </div>
                      <div>
                          <label className="label-admin">Foto de Capa (Logo ou Banner)</label>
                          <div className="flex items-center gap-4 mt-2">
                              <div className="w-16 h-16 bg-black rounded-xl overflow-hidden border border-zinc-700">
                                  <img src={pageConfig.fotoCapa} className="w-full h-full object-contain"/>
                              </div>
                              <label className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition">
                                  <Upload size={14}/> Trocar Capa
                                  <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                      if(e.target.files?.[0]) setPageConfig({...pageConfig, fotoCapa: URL.createObjectURL(e.target.files[0])})
                                  }}/>
                              </label>
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
                      <button onClick={handleSaveConfig} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-xs uppercase shadow-lg"><Save size={16}/> Salvar Configurações</button>
                  </div>
              </div>
          )}
      </main>

      {/* MODAL DE CRIAÇÃO/EDIÇÃO COM UPLOAD */}
      {isModalOpen && editingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                  <h2 className="font-bold text-white text-xl mb-6">{editingEvent.id ? "Editar Marco" : "Criar História"}</h2>

                  <div className="space-y-4">
                      {/* ÁREA DE UPLOAD */}
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
                          <div><label className="label-admin">Ano</label><input type="text" className="input-admin" value={editingEvent.ano} onChange={e => setEditingEvent({...editingEvent, ano: e.target.value})}/></div>
                      </div>
                      <div><label className="label-admin">Descrição</label><textarea rows={3} className="input-admin" value={editingEvent.descricao} onChange={e => setEditingEvent({...editingEvent, descricao: e.target.value})}/></div>
                      <div><label className="label-admin">Local</label><input type="text" className="input-admin" value={editingEvent.local} onChange={e => setEditingEvent({...editingEvent, local: e.target.value})}/></div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase">Cancelar</button>
                      <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2"><Save size={16}/> Salvar</button>
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