"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Save, Plus, Edit, Trash2, X, 
  Settings, User, Shield, Wallet, Bell, Volume2, 
  MessageSquare, HelpCircle, FileText, Eye, EyeOff, CheckCircle,
  Scale, Cookie, Lock, FilePlus, ClipboardList, Siren, Key, Scroll,
  Smartphone // <--- ADICIONADO AQUI O ÍCONE QUE FALTAVA
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---
type ItemType = 'link' | 'toggle' | 'action';

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
    icon: React.ElementType;
    tipo: 'publico' | 'interno';
}

// --- CONTEÚDO LEGAL ---
const INITIAL_DOCS: LegalDoc[] = [
    {
        id: "privacidade",
        titulo: "1. Política de Privacidade (App)",
        icon: Lock,
        tipo: 'publico',
        conteudo: `DOCUMENTO 1 — POLÍTICA DE PRIVACIDADE (LGPD)\nAAAKN APP (Versão 1.0 — 12/01/2026)\n\nQUEM SOMOS (CONTROLADOR)\nO AAAKN APP é operado por [NOME DA ENTIDADE/EMPRESA]...\n(Cole aqui o texto completo da Política de Privacidade que você já tem)`
    },
    {
        id: "termos",
        titulo: "2. Termos de Uso (App)",
        icon: Scale,
        tipo: 'publico',
        conteudo: `DOCUMENTO 2 — TERMOS DE USO\nAAAKN APP (Versão 1.0 — 12/01/2026)\n\nACEITE\nAo acessar ou usar o AAAKN APP, você concorda com estes Termos...`
    },
    {
        id: "cookies",
        titulo: "3. Política de Cookies",
        icon: Cookie,
        tipo: 'publico',
        conteudo: `DOCUMENTO 3 — POLÍTICA DE COOKIES\nAAAKN APP (Versão 1.0 — 12/01/2026)\n\nO QUE SÃO COOKIES...`
    },
    {
        id: "ropa",
        titulo: "A. ROPA (Registro de Operações)",
        icon: ClipboardList,
        tipo: 'interno',
        conteudo: `DOCUMENTO A — ROPA (REGISTRO DAS OPERAÇÕES DE TRATAMENTO)...`
    },
    {
        id: "incidente",
        titulo: "B. Plano de Resposta a Incidentes",
        icon: Siren,
        tipo: 'interno',
        conteudo: `DOCUMENTO B — PLANO DE RESPOSTA A INCIDENTES...`
    },
    {
        id: "acesso",
        titulo: "C. Política de Controle de Acesso",
        icon: Key,
        tipo: 'interno',
        conteudo: `DOCUMENTO C — POLÍTICA DE CONTROLE DE ACESSO...`
    },
    {
        id: "dpa",
        titulo: "D. Contrato com Operadores (DPA)",
        icon: Scroll,
        tipo: 'interno',
        conteudo: `DOCUMENTO D — CONTRATO COM OPERADORES (DPA)...`
    }
];

// --- ÍCONES ---
const ICON_MAP: Record<string, React.ElementType> = {
    User, Shield, Wallet, Bell, Volume2, MessageSquare, 
    HelpCircle, FileText, Settings, Smartphone
};

const INITIAL_SECTIONS: ConfigSection[] = [
    {
        id: "1", title: "Sua Conta",
        items: [
            { id: "1", label: "Dados Pessoais", icon: "User", type: "link", path: "/perfil/dados", active: true },
            { id: "2", label: "Carteirinha Digital", icon: "Wallet", type: "link", path: "/carteirinha", active: true },
        ]
    },
    {
        id: "3", title: "Central de Ajuda",
        items: [
            { id: "7", label: "Guia do App", icon: "HelpCircle", type: "link", path: "/guia", active: true },
            { id: "8", label: "Termos e Privacidade", icon: "FileText", type: "link", path: "/termos", active: true },
        ]
    }
];

export default function AdminConfiguracoesPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'app' | 'legal'>('app');
  const [sections, setSections] = useState<ConfigSection[]>(INITIAL_SECTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConfigItem | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string>("");
  const [documents, setDocuments] = useState<LegalDoc[]>(INITIAL_DOCS);
  const [selectedDocId, setSelectedDocId] = useState<string>(INITIAL_DOCS[0].id);

  const handleOpenModal = (sectionId: string, item?: ConfigItem) => {
      setEditingSectionId(sectionId);
      setEditingItem(item ? { ...item } : { id: Date.now().toString(), label: "", icon: "Settings", type: "link", path: "", active: true });
      setIsModalOpen(true);
  };

  const handleSaveItem = () => {
      if (!editingItem || !editingSectionId) return;
      const newSections = sections.map(section => {
          if (section.id !== editingSectionId) return section;
          const itemExists = section.items.find(i => i.id === editingItem.id);
          const newItems = itemExists ? section.items.map(i => i.id === editingItem.id ? editingItem : i) : [...section.items, editingItem];
          return { ...section, items: newItems };
      });
      setSections(newSections);
      setIsModalOpen(false);
      addToast("Botão atualizado!", "success");
  };

  const handleCreateDoc = () => {
      const newDoc: LegalDoc = {
          id: Date.now().toString(),
          titulo: "Novo Documento",
          conteudo: "Digite o texto aqui...",
          icon: FileText,
          tipo: 'interno'
      };
      setDocuments([...documents, newDoc]);
      setSelectedDocId(newDoc.id);
      addToast("Documento criado! Comece a editar.", "success");
  };

  const handleDeleteDoc = (id: string) => {
      if (confirm("Tem certeza? Isso apagará o documento permanentemente.")) {
          const newDocs = documents.filter(d => d.id !== id);
          setDocuments(newDocs);
          if (selectedDocId === id && newDocs.length > 0) setSelectedDocId(newDocs[0].id);
          addToast("Documento removido.", "info");
      }
  };

  const handleSaveDoc = () => {
      addToast("Documento e alterações salvas!", "success");
  };

  const handleDocChange = (field: 'titulo' | 'conteudo', value: string) => {
      setDocuments(prev => prev.map(doc => doc.id === selectedDocId ? { ...doc, [field]: value } : doc));
  };

  const currentDoc = documents.find(d => d.id === selectedDocId);

  const renderIcon = (iconName: string) => {
      const IconComp = ICON_MAP[iconName] || Settings;
      return <IconComp size={20} />;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black uppercase flex items-center gap-2"><Settings className="text-emerald-500" /> Configs & Legal</h1></div>
        </div>
      </header>

      <div className="px-6 pt-6">
          <div className="flex border-b border-zinc-800 gap-6">
              <button onClick={() => setActiveTab('app')} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === 'app' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><Smartphone size={16}/> Menu do App</button>
              <button onClick={() => setActiveTab('legal')} className={`pb-4 text-xs font-bold uppercase border-b-2 flex items-center gap-2 transition ${activeTab === 'legal' ? 'text-emerald-500 border-emerald-500' : 'text-zinc-500 border-transparent hover:text-white'}`}><Scale size={16}/> Jurídico & Compliance</button>
          </div>
      </div>

      <main className="p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'app' && (
              <div className="space-y-8 max-w-3xl mx-auto">
                  {sections.map((section) => (
                      <div key={section.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                          <div className="p-4 bg-black/20 border-b border-zinc-800 flex justify-between items-center">
                              <h3 className="text-sm font-black uppercase text-zinc-400 tracking-wider pl-2">{section.title}</h3>
                              <button onClick={() => handleOpenModal(section.id)} className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg font-bold uppercase flex items-center gap-1 transition"><Plus size={12}/> Novo Botão</button>
                          </div>
                          <div className="divide-y divide-zinc-800">
                              {section.items.map((item) => (
                                  <div key={item.id} className={`p-4 flex items-center justify-between group hover:bg-zinc-800/50 transition ${!item.active ? 'opacity-50' : ''}`}>
                                      <div className="flex items-center gap-4">
                                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-zinc-700 ${item.active ? 'bg-black text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>{renderIcon(item.icon)}</div>
                                          <div>
                                              <h4 className="font-bold text-sm text-white flex items-center gap-2">{item.label} {!item.active && <span className="text-[9px] bg-red-500/20 text-red-500 px-1.5 rounded uppercase">Inativo</span>}</h4>
                                              <p className="text-[10px] text-zinc-500 font-mono">{item.type === 'link' ? item.path : 'Toggle Switch'}</p>
                                          </div>
                                      </div>
                                      <button onClick={() => handleOpenModal(section.id, item)} className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg hover:bg-zinc-700 transition"><Edit size={16}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>
          )}

          {activeTab === 'legal' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[75vh]">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 overflow-y-auto flex flex-col">
                      <div className="mb-4 px-2 flex justify-between items-center">
                          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Biblioteca</h3>
                          <button onClick={handleCreateDoc} className="text-emerald-500 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 p-1.5 rounded-lg transition"><Plus size={14}/></button>
                      </div>
                      <div className="space-y-2 flex-1">
                          {documents.map(doc => (
                              <button key={doc.id} onClick={() => setSelectedDocId(doc.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition relative group ${selectedDocId === doc.id ? 'bg-zinc-800 text-white border border-emerald-500/30' : 'bg-black/40 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-transparent'}`}>
                                  <doc.icon size={16} className={doc.tipo === 'interno' ? 'text-yellow-500' : 'text-emerald-500'}/>
                                  <div className="flex-1 min-w-0"><span className="text-xs font-bold uppercase block truncate">{doc.titulo}</span><span className="text-[9px] uppercase tracking-wider opacity-50">{doc.tipo}</span></div>
                                  <div onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc.id); }} className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 text-red-500 rounded transition"><Trash2 size={12}/></div>
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col overflow-hidden">
                      {currentDoc ? (
                          <>
                              <div className="p-4 bg-black/20 border-b border-zinc-800 flex justify-between items-center">
                                  <div className="flex-1 mr-4"><input type="text" className="bg-transparent text-lg font-black text-white uppercase outline-none w-full placeholder-zinc-600" value={currentDoc.titulo} onChange={(e) => handleDocChange('titulo', e.target.value)} placeholder="TÍTULO DO DOCUMENTO"/></div>
                                  <button onClick={handleSaveDoc} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 shadow-lg transition"><CheckCircle size={14}/> Salvar</button>
                              </div>
                              <textarea className="flex-1 w-full bg-[#09090b] text-zinc-300 p-6 font-mono text-xs outline-none resize-none leading-relaxed custom-scrollbar" value={currentDoc.conteudo} onChange={(e) => handleDocChange('conteudo', e.target.value)} spellCheck={false} placeholder="Cole o conteúdo jurídico aqui..."/>
                          </>
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-500 gap-4"><FilePlus size={48} className="opacity-20"/><p className="text-sm font-bold uppercase">Selecione ou crie um documento</p></div>
                      )}
                  </div>
              </div>
          )}
      </main>

      {isModalOpen && editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl animate-in zoom-in-95">
                  <h2 className="font-bold text-white text-xl mb-4">Editar Botão</h2>
                  <div className="space-y-4">
                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Label</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm" value={editingItem.label} onChange={e => setEditingItem({...editingItem, label: e.target.value})}/></div>
                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Link</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-emerald-500 font-mono text-sm" value={editingItem.path} onChange={e => setEditingItem({...editingItem, path: e.target.value})}/></div>
                      <div className="flex items-center gap-2"><label className="text-white text-xs font-bold cursor-pointer"><input type="checkbox" checked={editingItem.active} onChange={e => setEditingItem({...editingItem, active: e.target.checked})} className="mr-2"/> Ativo no App</label></div>
                  </div>
                  <div className="mt-6 flex justify-end gap-2">
                      <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-zinc-400 font-bold text-xs bg-zinc-800">Cancelar</button>
                      <button onClick={handleSaveItem} className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs">Salvar</button>
                  </div>
              </div>
          </div>
      )}
      <style jsx global>{` .custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 3px; } .custom-scrollbar::-webkit-scrollbar-track { background: #09090b; } `}</style>
    </div>
  );
}