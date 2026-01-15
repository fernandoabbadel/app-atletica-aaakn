"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft, Plus, Edit, Trash2, X, Settings, User, Shield, Wallet,
  Bell, Volume2, MessageSquare, HelpCircle, FileText, CheckCircle,
  Scale, Cookie, Lock, FilePlus, ClipboardList, Siren, Key, Scroll, Smartphone
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, limit, onSnapshot,
  orderBy, query, serverTimestamp, setDoc, updateDoc
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// --- TIPOS ---
type ItemType = "link" | "toggle" | "action";

interface ConfigItem {
  id: string;
  label: string;
  icon: string;
  type: ItemType;
  path?: string;
  active: boolean;
}

interface ConfigSection {
  id: string;
  title: string;
  items: ConfigItem[];
}

interface LegalDoc {
  id: string;
  titulo: string;
  conteudo: string;
  icon: any;
  iconName?: string;
  tipo: "publico" | "interno";
}

// Mapas de Ícones
const ICON_MAP: Record<string, any> = { User, Shield, Wallet, Bell, Volume2, MessageSquare, HelpCircle, FileText, Settings, Smartphone };
const LEGAL_ICON_MAP: Record<string, any> = { Lock, Scale, Cookie, ClipboardList, Siren, Key, Scroll, Shield, FileText };

// Dados Iniciais (Fallback)
const INITIAL_SECTIONS: ConfigSection[] = [
  {
    id: "1",
    title: "Sua Conta",
    items: [
      { id: "1", label: "Dados Pessoais", icon: "User", type: "link", path: "/perfil/dados", active: true },
      { id: "2", label: "Carteirinha Digital", icon: "Wallet", type: "link", path: "/carteirinha", active: true },
    ],
  },
  {
    id: "3",
    title: "Central de Ajuda",
    items: [
      { id: "7", label: "Guia do App", icon: "HelpCircle", type: "link", path: "/guia", active: true },
      { id: "8", label: "Termos e Privacidade", icon: "FileText", type: "link", path: "/configuracoes/termos", active: true },
    ],
  },
];

export default function AdminConfiguracoesPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"app" | "legal">("app");
  
  // Estados do Menu
  const [sections, setSections] = useState<ConfigSection[]>(INITIAL_SECTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string>("");
  const [savingMenu, setSavingMenu] = useState(false);

  // Estados Jurídico
  const [documents, setDocuments] = useState<LegalDoc[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [savingDoc, setSavingDoc] = useState(false);

  // 🦈 CARREGAR MENU EM TEMPO REAL
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "app_config", "menu"), (snap) => {
        if (snap.exists()) {
            const data = snap.data();
            if (data.sections) setSections(data.sections);
        }
    });
    return () => unsub();
  }, []);

  // 🦈 CARREGAR DOCS EM TEMPO REAL
  useEffect(() => {
    const q = query(collection(db, "legal_docs"), orderBy("titulo"));
    const unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            icon: LEGAL_ICON_MAP[d.data().iconName] || FileText
        })) as LegalDoc[];
        setDocuments(docs);
        if (docs.length > 0 && !selectedDocId) setSelectedDocId(docs[0].id);
    });
    return () => unsub();
  }, []);

  // --- ACTIONS MENU ---
  const handleSaveMenu = async (newSections: ConfigSection[]) => {
      setSavingMenu(true);
      try {
          await setDoc(doc(db, "app_config", "menu"), { 
              sections: newSections, 
              updatedAt: serverTimestamp() 
          });
          addToast("Menu do App atualizado para todos! 📲", "success");
          setSections(newSections);
          setIsModalOpen(false);
      } catch (error) {
          addToast("Erro ao salvar menu.", "error");
      } finally {
          setSavingMenu(false);
      }
  };

  const handleUpdateItem = () => {
      if (!editingItem || !editingSectionId) return;
      const newSections = sections.map(sec => {
          if (sec.id !== editingSectionId) return sec;
          const items = sec.items.some(i => i.id === editingItem.id)
              ? sec.items.map(i => i.id === editingItem.id ? editingItem : i)
              : [...sec.items, editingItem];
          return { ...sec, items };
      });
      handleSaveMenu(newSections);
  };

  const handleDeleteItem = (itemId: string) => {
      if(!confirm("Remover este botão do app?")) return;
      const newSections = sections.map(sec => ({
          ...sec,
          items: sec.items.filter(i => i.id !== itemId)
      }));
      handleSaveMenu(newSections);
  };

  // --- ACTIONS JURIDICO ---
  const handleCreateDoc = async () => {
      const ref = await addDoc(collection(db, "legal_docs"), {
          titulo: "Novo Regulamento",
          conteudo: "Escreva aqui...",
          tipo: "publico",
          iconName: "FileText",
          createdAt: serverTimestamp()
      });
      setSelectedDocId(ref.id);
      addToast("Documento criado.", "success");
  };

  const handleSaveDoc = async () => {
      const docData = documents.find(d => d.id === selectedDocId);
      if(!docData) return;
      setSavingDoc(true);
      try {
          await updateDoc(doc(db, "legal_docs", selectedDocId), {
              titulo: docData.titulo,
              conteudo: docData.conteudo,
              updatedAt: serverTimestamp()
          });
          addToast("Documento salvo e publicado! 📜", "success");
      } catch(e) { addToast("Erro ao salvar.", "error"); }
      finally { setSavingDoc(false); }
  };

  const handleDeleteDoc = async (id: string) => {
      if(!confirm("Apagar documento?")) return;
      await deleteDoc(doc(db, "legal_docs", id));
      addToast("Documento removido.", "info");
  };

  const currentDoc = documents.find(d => d.id === selectedDocId);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-xl font-black uppercase flex items-center gap-2">
            <Settings className="text-emerald-500" /> Configs & Legal
          </h1>
        </div>
      </header>

      <div className="px-6 pt-6">
        <div className="flex border-b border-zinc-800 gap-6">
          <button onClick={() => setActiveTab("app")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "app" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent"}`}>
            <Smartphone size={16} /> Menu do App
          </button>
          <button onClick={() => setActiveTab("legal")} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === "legal" ? "text-emerald-500 border-emerald-500" : "text-zinc-500 border-transparent"}`}>
            <Scale size={16} /> Jurídico
          </button>
        </div>
      </div>

      <main className="p-6 max-w-6xl mx-auto">
        {activeTab === "app" && (
          <div className="space-y-8 max-w-3xl mx-auto">
            {sections.map((section) => (
              <div key={section.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <div className="p-4 bg-black/20 border-b border-zinc-800 flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase text-zinc-400 tracking-wider pl-2">{section.title}</h3>
                  <button onClick={() => { setEditingSectionId(section.id); setEditingItem({ id: Date.now().toString(), label: "Novo Botão", icon: "Settings", type: "link", path: "/", active: true }); setIsModalOpen(true); }} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-bold uppercase flex items-center gap-1 transition">
                    <Plus size={12} /> Novo Botão
                  </button>
                </div>
                <div className="divide-y divide-zinc-800">
                  {section.items.map((item) => {
                      const Icon = ICON_MAP[item.icon] || Settings;
                      return (
                        <div key={item.id} className="p-4 flex items-center justify-between group hover:bg-zinc-800/50 transition">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-700 ${item.active ? "bg-black text-emerald-500" : "bg-zinc-800 text-zinc-600"}`}>
                              <Icon size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-sm text-white flex items-center gap-2">{item.label} {!item.active && <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 rounded uppercase">Inativo</span>}</h4>
                              <p className="text-[10px] text-zinc-500 font-mono">{item.path}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => { setEditingSectionId(section.id); setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteItem(item.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-zinc-800 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "legal" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 overflow-y-auto flex flex-col">
              <div className="mb-4 px-2 flex justify-between items-center">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Biblioteca</h3>
                <button onClick={handleCreateDoc} className="text-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg"><Plus size={14} /></button>
              </div>
              <div className="space-y-2 flex-1">
                {documents.map((docx) => (
                  <button key={docx.id} onClick={() => setSelectedDocId(docx.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition relative group ${selectedDocId === docx.id ? "bg-zinc-800 text-white border border-emerald-500/30" : "bg-black/40 text-zinc-400 hover:bg-zinc-800"}`}>
                    <docx.icon size={16} className={docx.tipo === "interno" ? "text-yellow-500" : "text-emerald-500"} />
                    <div className="flex-1 min-w-0"><span className="text-xs font-bold uppercase block truncate">{docx.titulo}</span></div>
                    <div onClick={(e) => { e.stopPropagation(); handleDeleteDoc(docx.id); }} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-500 rounded"><Trash2 size={12} /></div>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden">
              {currentDoc ? (
                <>
                  <div className="p-4 bg-black/20 border-b border-zinc-800 flex justify-between items-center">
                    <input type="text" className="bg-transparent text-lg font-black text-white uppercase outline-none w-full placeholder-zinc-600" value={currentDoc.titulo} onChange={(e) => {
                        setDocuments(docs => docs.map(d => d.id === selectedDocId ? { ...d, titulo: e.target.value } : d));
                    }} placeholder="TÍTULO DO DOCUMENTO" />
                    <button onClick={handleSaveDoc} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 shadow-lg transition">
                      <CheckCircle size={14} /> {savingDoc ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                  <textarea className="flex-1 w-full bg-[#09090b] text-zinc-300 p-6 font-mono text-xs outline-none resize-none leading-relaxed custom-scrollbar" value={currentDoc.conteudo} onChange={(e) => {
                      setDocuments(docs => docs.map(d => d.id === selectedDocId ? { ...d, conteudo: e.target.value } : d));
                  }} placeholder="Conteúdo jurídico aqui..." />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4"><FilePlus size={48} className="opacity-20" /><p className="text-sm font-bold uppercase">Selecione um documento</p></div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL EDITOR DE BOTÃO */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95">
            <h2 className="font-bold text-white text-xl mb-4">Editar Botão do App</h2>
            <div className="space-y-4">
              <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Nome do Botão</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm outline-none focus:border-emerald-500" value={editingItem.label} onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })} /></div>
              <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Rota / Link</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-emerald-500 font-mono text-sm outline-none focus:border-emerald-500" value={editingItem.path || ""} onChange={(e) => setEditingItem({ ...editingItem, path: e.target.value })} /></div>
              <div className="flex items-center gap-2"><label className="text-white text-xs font-bold cursor-pointer select-none"><input type="checkbox" checked={editingItem.active} onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })} className="mr-2" /> Visível no App</label></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 font-bold text-xs bg-zinc-800">Cancelar</button>
              <button onClick={handleUpdateItem} className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs">Salvar Alterações</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}