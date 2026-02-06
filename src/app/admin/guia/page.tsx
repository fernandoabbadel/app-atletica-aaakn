"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Edit, Trash2, Save, X, 
  BookOpen, Bus, Map, Phone, Image as ImageIcon,
  ExternalLink, AlertTriangle, Loader2, Database, RefreshCw
} from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // 🦈 Importando Image
import { useToast } from "../../../context/ToastContext";
import { db, storage } from "../../../lib/firebase"; 
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// --- 🦈 INTERFACE PARA OS ITENS DO GUIA ---
interface GuiaItem {
  id: string;
  categoria: "academico" | "transporte" | "turismo" | "emergencia";
  // Campos Opcionais (dependem da categoria)
  titulo?: string;
  url?: string;
  nome?: string;
  horario?: string;
  detalhe?: string;
  descricao?: string;
  foto?: string;
  numero?: string;
  cor?: string;
}

// --- MOCK ORIGINAL ---
const INITIAL_GUIA_DATA = [
    // Acadêmico
    { categoria: 'academico', titulo: 'Portal do Aluno (EVA)', url: 'https://eva.unitau.br' },
    { categoria: 'academico', titulo: 'Calendário Acadêmico 2026', url: 'https://unitau.br/calendario' },
    { categoria: 'academico', titulo: 'Cardápio do RU', url: 'https://unitau.br/ru' },
    
    // Transporte
    { categoria: 'transporte', nome: 'Circular (Intercampi)', horario: '07:10, 12:30 | 11:50, 17:50', detalhe: 'Saída Terminal <-> Campus' },
    
    // Turismo
    { categoria: 'turismo', nome: 'Praia Martim de Sá', descricao: 'O point da galera', foto: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
    { categoria: 'turismo', nome: 'Pedra da Freira', descricao: 'Pôr do sol top', foto: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80' },
    
    // Emergência
    { categoria: 'emergencia', nome: 'SAMU', numero: '192', cor: 'red' },
    { categoria: 'emergencia', nome: 'Polícia', numero: '190', cor: 'red' }
];

export default function AdminGuiaPage() {
  const { addToast } = useToast();
  
  // Estados
  const [activeTab, setActiveTab] = useState<"academico" | "transporte" | "turismo" | "emergencia">("academico");
  
  // 🦈 Tipagem correta do estado de dados
  const [data, setData] = useState<Record<string, GuiaItem[]>>({ academico: [], transporte: [], turismo: [], emergencia: [] });
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<GuiaItem> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Upload
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  // 🦈 Removido isUploading não utilizado

  // 1. CARREGAR DADOS DO FIREBASE
  useEffect(() => {
    const q = query(collection(db, "guia_data"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData: Record<string, GuiaItem[]> = { academico: [], transporte: [], turismo: [], emergencia: [] };
      
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as GuiaItem;
        if (newData[item.categoria]) {
          newData[item.categoria].push(item);
        }
      });

      setData(newData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 🦈 FUNÇÃO DE RESGATE (SEED) ---
  const handleSeedGuia = async () => {
      if(!confirm("⚠️ Confirmar restauração?\nIsso vai adicionar todos os itens padrão (Links, Horários, Praias, Telefones) ao banco de dados.")) return;
      
      setIsSaving(true);
      try {
          const promises = INITIAL_GUIA_DATA.map(item => 
              addDoc(collection(db, "guia_data"), item)
          );
          await Promise.all(promises);
          addToast("Guia restaurado com sucesso! 📚", "success");
      } catch (error) {
          console.error(error);
          addToast("Erro ao restaurar dados.", "error");
      } finally {
          setIsSaving(false);
      }
  };

  // --- HANDLERS GENÉRICOS ---
  const handleCreate = () => {
      const baseItem: Partial<GuiaItem> = { categoria: activeTab }; 
      if (activeTab === "academico") setEditingItem({ ...baseItem, titulo: "", url: "" });
      if (activeTab === "transporte") setEditingItem({ ...baseItem, nome: "", horario: "", detalhe: "" });
      if (activeTab === "turismo") { setEditingItem({ ...baseItem, nome: "", descricao: "", foto: "" }); setPreviewImage(""); setImageFile(null); }
      if (activeTab === "emergencia") setEditingItem({ ...baseItem, nome: "", numero: "", cor: "red" });
      
      setIsModalOpen(true);
  };

  const handleEdit = (item: GuiaItem) => {
      setEditingItem({ ...item });
      if (activeTab === "turismo") {
          setPreviewImage(item.foto || "");
          setImageFile(null);
      }
      setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
      if(confirm("Remover este item do Guia permanentemente?")) {
          try {
              await deleteDoc(doc(db, "guia_data", id));
              addToast("Item removido.", "info");
          } catch (error) {
              console.error(error); // 🦈 Logando erro
              addToast("Erro ao excluir.", "error");
          }
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setImageFile(file);
          setPreviewImage(URL.createObjectURL(file));
      }
  };

  const handleSave = async () => {
      if (!editingItem) return;
      setIsSaving(true);

      try {
          let finalFotoUrl = editingItem.foto;

          if (activeTab === "turismo" && imageFile) {
              const storageRef = ref(storage, `guia/${Date.now()}_${imageFile.name}`);
              await uploadBytes(storageRef, imageFile);
              finalFotoUrl = await getDownloadURL(storageRef);
          }

          const dataToSave = { ...editingItem, foto: finalFotoUrl };
          
          // 🦈 Forma correta de remover o ID do payload
          const payload = { ...dataToSave };
          delete payload.id;

          if (editingItem.id) {
              await updateDoc(doc(db, "guia_data", editingItem.id), payload);
              addToast("Item atualizado!", "success");
          } else {
              await addDoc(collection(db, "guia_data"), payload);
              addToast("Item criado!", "success");
          }
          setIsModalOpen(false);
      } catch (error) {
          console.error(error);
          addToast("Erro ao salvar.", "error");
      } finally {
          setIsSaving(false);
      }
  };

  // --- RENDERIZADORES DE CARD ---
  const renderCard = (item: GuiaItem) => {
      if (activeTab === "academico") return (
          <div className="flex justify-between items-center w-full">
              <div>
                  <h4 className="font-bold text-white">{item.titulo}</h4>
                  <p className="text-xs text-zinc-500 truncate max-w-[200px]">{item.url}</p>
              </div>
              <ExternalLink size={16} className="text-emerald-500"/>
          </div>
      );
      if (activeTab === "transporte") return (
          <div className="w-full">
              <div className="flex justify-between mb-1">
                  <h4 className="font-bold text-white">{item.nome}</h4>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">{item.horario}</span>
              </div>
              <p className="text-xs text-zinc-500">{item.detalhe}</p>
          </div>
      );
      if (activeTab === "turismo") return (
          <div className="flex gap-4 w-full">
              <div className="w-16 h-16 bg-black rounded-lg overflow-hidden shrink-0 border border-zinc-700 relative">
                  {item.foto ? (
                      <Image 
                        src={item.foto} 
                        alt={item.nome || "Turismo"} 
                        fill
                        unoptimized
                        className="object-cover"
                      />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImageIcon size={20}/></div>
                  )}
              </div>
              <div>
                  <h4 className="font-bold text-white">{item.nome}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2">{item.descricao}</p>
              </div>
          </div>
      );
      if (activeTab === "emergencia") return (
          <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.cor === 'red' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>
                      <AlertTriangle size={18}/>
                  </div>
                  <h4 className="font-bold text-white">{item.nome}</h4>
              </div>
              <span className="text-xl font-black text-white">{item.numero}</span>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black uppercase flex items-center gap-2"><BookOpen className="text-emerald-500" /> Editor do Guia</h1></div>
        </div>
        <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition"><Plus size={16} /> Adicionar</button>
      </header>

      {/* ABAS */}
      <div className="px-6 pt-6 overflow-x-auto">
          <div className="flex border-b border-zinc-800 gap-4 min-w-max">
              <button onClick={() => setActiveTab("academico")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "academico" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}><BookOpen size={16}/> Acadêmico</button>
              <button onClick={() => setActiveTab("transporte")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "transporte" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}><Bus size={16}/> Transporte</button>
              <button onClick={() => setActiveTab("turismo")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "turismo" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}><Map size={16}/> Turismo</button>
              <button onClick={() => setActiveTab("emergencia")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "emergencia" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-300"}`}><Phone size={16}/> Emergência</button>
          </div>
      </div>

      <main className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>
          ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data[activeTab].map((item: GuiaItem) => (
                        <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center gap-4 hover:border-emerald-500/30 transition group">
                            {renderCard(item)}
                            <div className="flex flex-col gap-2 shrink-0 border-l border-zinc-800 pl-3 ml-2">
                                <button onClick={() => handleEdit(item)} className="text-zinc-500 hover:text-white transition"><Edit size={16}/></button>
                                <button onClick={() => handleDelete(item.id)} className="text-zinc-500 hover:text-red-500 transition"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 🦈 ZONA DE DADOS: SE ESTIVER VAZIO, MOSTRA O BOTÃO DE RESGATE */}
                {data[activeTab].length === 0 && (
                    <div className="text-center py-10 flex flex-col items-center gap-6">
                        <p className="text-zinc-600 text-sm font-bold uppercase">Nenhum item nesta seção.</p>
                        
                        {/* Botão de Resgate */}
                        <div className="w-full max-w-md bg-zinc-900 border border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center gap-3">
                            <Database className="text-emerald-500" size={24}/>
                            <p className="text-xs text-zinc-400">Banco de dados vazio? Resgate os dados originais.</p>
                            <button 
                                onClick={handleSeedGuia} 
                                disabled={isSaving}
                                className="bg-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-500 border border-zinc-700 hover:border-emerald-500 text-white px-6 py-3 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>}
                                Restaurar Guia Padrão
                            </button>
                        </div>
                    </div>
                )}
              </>
          )}
      </main>

      {/* MODAL DINÂMICO */}
      {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                  <h2 className="font-bold text-white text-xl mb-6 flex items-center gap-2 capitalize">
                      {editingItem.id ? "Editar Item" : "Novo Item"} <span className="text-emerald-500">({activeTab})</span>
                  </h2>

                  <div className="space-y-4">
                      
                      {/* FORMULÁRIO ACADÊMICO */}
                      {activeTab === "academico" && (
                          <>
                              <div><label className="label-admin">Título do Link</label><input type="text" className="input-admin" value={editingItem.titulo || ""} onChange={e => setEditingItem({...editingItem, titulo: e.target.value})}/></div>
                              <div><label className="label-admin">URL de Destino</label><input type="text" className="input-admin" value={editingItem.url || ""} onChange={e => setEditingItem({...editingItem, url: e.target.value})}/></div>
                          </>
                      )}

                      {/* FORMULÁRIO TRANSPORTE */}
                      {activeTab === "transporte" && (
                          <>
                              <div><label className="label-admin">Nome da Linha</label><input type="text" className="input-admin" value={editingItem.nome || ""} onChange={e => setEditingItem({...editingItem, nome: e.target.value})}/></div>
                              <div><label className="label-admin">Horários (Separe por vírgula)</label><input type="text" className="input-admin" value={editingItem.horario || ""} onChange={e => setEditingItem({...editingItem, horario: e.target.value})}/></div>
                              <div><label className="label-admin">Detalhes / Trajeto</label><input type="text" className="input-admin" value={editingItem.detalhe || ""} onChange={e => setEditingItem({...editingItem, detalhe: e.target.value})}/></div>
                          </>
                      )}

                      {/* FORMULÁRIO TURISMO (COM UPLOAD) */}
                      {activeTab === "turismo" && (
                          <>
                              <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 border-dashed hover:border-emerald-500/50 transition text-center relative group h-40 flex items-center justify-center overflow-hidden">
                                  {previewImage ? (
                                      <Image 
                                        src={previewImage} 
                                        alt="Preview" 
                                        fill
                                        unoptimized
                                        className="object-cover rounded-lg"
                                      />
                                  ) : (
                                      <div className="flex flex-col items-center gap-2 text-zinc-500">
                                          <ImageIcon size={32}/>
                                          <span className="text-xs font-bold uppercase">Foto do Local</span>
                                      </div>
                                  )}
                                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" accept="image/*" onChange={handleFileChange}/>
                              </div>
                              <div><label className="label-admin">Nome do Local</label><input type="text" className="input-admin" value={editingItem.nome || ""} onChange={e => setEditingItem({...editingItem, nome: e.target.value})}/></div>
                              <div><label className="label-admin">Descrição Curta</label><textarea rows={2} className="input-admin" value={editingItem.descricao || ""} onChange={e => setEditingItem({...editingItem, descricao: e.target.value})}/></div>
                          </>
                      )}

                      {/* FORMULÁRIO EMERGÊNCIA */}
                      {activeTab === "emergencia" && (
                          <>
                              <div><label className="label-admin">Nome do Serviço</label><input type="text" className="input-admin" value={editingItem.nome || ""} onChange={e => setEditingItem({...editingItem, nome: e.target.value})}/></div>
                              <div><label className="label-admin">Número de Telefone</label><input type="text" className="input-admin text-2xl font-black text-white" value={editingItem.numero || ""} onChange={e => setEditingItem({...editingItem, numero: e.target.value})}/></div>
                              <div>
                                  <label className="label-admin">Cor do Ícone</label>
                                  <select className="input-admin" value={editingItem.cor || "red"} onChange={e => setEditingItem({...editingItem, cor: e.target.value})}>
                                      <option value="red">Vermelho (Emergência)</option>
                                      <option value="zinc">Cinza (Polícia/Geral)</option>
                                      <option value="blue">Azul (Serviços)</option>
                                  </select>
                              </div>
                          </>
                      )}

                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase">Cancelar</button>
                      <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase flex items-center gap-2">
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