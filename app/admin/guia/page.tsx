"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Link as LinkIcon,
  MapPin,
  Phone,
  Bus,
  Image as ImageIcon,
  UploadCloud,
  X,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// Tipos alinhados com a página do usuário
type CategoriaGuia = "Acadêmico" | "Transporte" | "Turismo" | "Emergência";

const GUIA_MOCK = [
  { id: 1, titulo: "Portal do Aluno", conteudo: "https://eva.com.br", categoria: "Acadêmico", tipo: "link" },
  { id: 2, titulo: "Circular (Intercampi)", conteudo: "Horários...", categoria: "Transporte", tipo: "transporte" },
  { id: 3, titulo: "Praia Martim de Sá", conteudo: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80", categoria: "Turismo", tipo: "turismo" },
  { id: 4, titulo: "SAMU", conteudo: "192", categoria: "Emergência", tipo: "contato" },
];

export default function AdminGuiaPage() {
  const { addToast } = useToast();
  const [itens, setItens] = useState(GUIA_MOCK);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado do formulário flexível
  const [novoItem, setNovoItem] = useState({
    titulo: "",
    conteudo: "", 
    subtitulo: "", 
    categoria: "Acadêmico" as CategoriaGuia,
    previewImagem: "" 
  });

  const handleSave = () => {
    // 1. Verificação Anti-Crash
    if (!novoItem.titulo.trim()) {
        // Frase 40: Ops
        addToast("Ops — os tubarões erraram a porta da sala… tenta de novo.", "error");
        return;
    }

    // 2. Verificação Anti-Spam
    if (novoItem.conteudo.length > 500 || novoItem.subtitulo.length > 200) {
        // Frase 37: Deu ruim
        addToast("Deu ruim — nossos tubarões escorregaram no sabão… texto muito longo.", "error");
        return;
    }
    
    let tipoItem = "link";
    if (novoItem.categoria === "Transporte") tipoItem = "transporte";
    if (novoItem.categoria === "Turismo") tipoItem = "turismo";
    if (novoItem.categoria === "Emergência") tipoItem = "contato";

    const conteudoFinal = novoItem.previewImagem || novoItem.conteudo;

    setItens([...itens, { id: Date.now(), ...novoItem, conteudo: conteudoFinal, tipo: tipoItem }]);
    setShowModal(false);
    setNovoItem({ titulo: "", conteudo: "", subtitulo: "", categoria: "Acadêmico", previewImagem: "" });
    
    // Frase 1: Salvou o link
    addToast("Salvou o link — os tubarões já estão guardando isso no cofre.", "success");
  };

  const handleDelete = (id: number) => {
    if (confirm("Apagar este item?")) {
      setItens((prev) => prev.filter((i) => i.id !== id));
      // Frase 48: Pronto
      addToast("Pronto — os tubarões entregaram com sucesso (item removido).", "info");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
        // 1. Verificação de Tipo
        if (!file.type.startsWith("image/")) {
            // Frase 40: Ops
            addToast("Ops — os tubarões erraram a porta... apenas imagens!", "error");
            return;
        }

        // 2. Verificação de Tamanho
        if (file.size > 2 * 1024 * 1024) {
            // Frase 43: Não foi dessa vez
            addToast("Não foi dessa vez — arquivo muito pesado, os tubarões não aguentam.", "error");
            return;
        }

        // 3. Compressão Simples
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const scaleSize = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

                const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
                
                setNovoItem({ ...novoItem, previewImagem: compressedDataUrl, conteudo: compressedDataUrl });
                
                // Frase 6: Fez upload
                addToast("Fez upload — os tubarões estão subindo com a mochila nas costas.", "success");
            };
        };
    }
  };

  const removeImage = () => {
      setNovoItem({ ...novoItem, previewImagem: "", conteudo: "" });
      if(fileInputRef.current) fileInputRef.current.value = "";
      // Frase 38: Errou (contexto de desfazer)
      addToast("Apagou — os tubarões limparam a sujeira.", "info");
  }

  // Ícone dinâmico por categoria
  const getIcon = (cat: string) => {
      switch(cat) {
          case 'Transporte': return <Bus size={16} />;
          case 'Turismo': return <MapPin size={16} />;
          case 'Emergência': return <Phone size={16} />;
          default: return <LinkIcon size={16} />;
      }
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">
            Gestão do Guia
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
          <Plus size={16} /> Novo Item
        </button>
      </header>

      <main className="p-6 space-y-4">
        {itens.map((item) => (
          <div key={item.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between group hover:border-zinc-700 transition relative overflow-hidden">
            
            {/* Imagem de Fundo (se for turismo) */}
            {item.tipo === 'turismo' && (
                <div className="absolute inset-0 opacity-10">
                    <img src={item.conteudo} className="w-full h-full object-cover" />
                </div>
            )}

            <div className="flex items-center gap-4 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-black border border-zinc-800 ${item.categoria === 'Emergência' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {getIcon(item.categoria)}
                </div>
                <div>
                    <h3 className="font-bold text-white text-sm mb-0.5">{item.titulo}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-zinc-500 bg-black px-1.5 py-0.5 rounded border border-zinc-800">
                            {item.categoria}
                        </span>
                        <p className="text-zinc-400 text-xs truncate max-w-[150px] opacity-70">
                            {item.tipo === 'turismo' ? 'Imagem definida' : item.conteudo}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 relative z-10">
              <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition"><Edit size={16} /></button>
              <button onClick={() => handleDelete(item.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-500"/> Adicionar ao Guia
            </h2>
            
            <div className="space-y-3">
                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Categoria</label>
                <select
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition"
                    value={novoItem.categoria}
                    onChange={(e) => setNovoItem({ ...novoItem, categoria: e.target.value as CategoriaGuia })}
                >
                    <option value="Acadêmico">Acadêmico (Links)</option>
                    <option value="Transporte">Transporte (Card com Detalhes)</option>
                    <option value="Turismo">Turismo (Foto e Descrição)</option>
                    <option value="Emergência">Emergência (Telefones)</option>
                </select>

                <label className="text-xs text-zinc-500 font-bold uppercase ml-1">Detalhes</label>
                <input
                    type="text"
                    placeholder="Título (ex: Portal do Aluno, SAMU)"
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition mb-2"
                    value={novoItem.titulo}
                    onChange={(e) => setNovoItem({ ...novoItem, titulo: e.target.value })}
                    maxLength={50}
                />

                {/* Campos Dinâmicos */}
                {novoItem.categoria === "Acadêmico" && (
                    <input type="text" placeholder="URL do Link (https://...)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={novoItem.conteudo} onChange={(e) => setNovoItem({ ...novoItem, conteudo: e.target.value })} />
                )}

                {novoItem.categoria === "Transporte" && (
                    <>
                        <textarea placeholder="Horários e Detalhes..." className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white h-20 resize-none focus:border-emerald-500 outline-none" value={novoItem.subtitulo} onChange={(e) => setNovoItem({ ...novoItem, subtitulo: e.target.value })} maxLength={200}></textarea>
                        <input type="text" placeholder="Link do Itinerário (Opcional)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none mt-2" value={novoItem.conteudo} onChange={(e) => setNovoItem({ ...novoItem, conteudo: e.target.value })} />
                    </>
                )}

                {novoItem.categoria === "Turismo" && (
                    <>
                        <input type="text" placeholder="Descrição Curta (ex: O point da galera)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none mb-2" value={novoItem.subtitulo} onChange={(e) => setNovoItem({ ...novoItem, subtitulo: e.target.value })} maxLength={100} />
                        
                        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center hover:border-emerald-500/50 transition cursor-pointer relative bg-black/20" onClick={() => fileInputRef.current?.click()}>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleImageUpload} />
                            
                            {novoItem.previewImagem ? (
                                <div className="relative w-full h-32 rounded-lg overflow-hidden group">
                                    <img src={novoItem.previewImagem} className="w-full h-full object-cover" />
                                    <button onClick={(e) => { e.stopPropagation(); removeImage(); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-zinc-500">
                                    <UploadCloud size={24} />
                                    <span className="text-xs font-bold uppercase">Clique para enviar foto (Max 2MB)</span>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {novoItem.categoria === "Emergência" && (
                    <input type="text" placeholder="Número de Telefone (ex: 190)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={novoItem.conteudo} onChange={(e) => setNovoItem({ ...novoItem, conteudo: e.target.value })} maxLength={15} />
                )}
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}