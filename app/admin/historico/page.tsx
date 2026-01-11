"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, History, Calendar, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

const HISTORICO_MOCK = [
  {
    id: 1,
    ano: "2018",
    titulo: "A Fundação",
    descricao: "Início da Atlética Medicina Caraguá com a primeira diretoria.",
    imagem: "/historico/fundacao.jpg",
  },
  {
    id: 2,
    ano: "2022",
    titulo: "Campeão do JIMS",
    descricao: "Primeiro título geral nos Jogos Intermed Sul.",
    imagem: "/historico/jims.jpg",
  },
];

export default function AdminHistoricoPage() {
  const { addToast } = useToast();
  const [marcos, setMarcos] = useState(HISTORICO_MOCK);
  const [showModal, setShowModal] = useState(false);
  const [novoMarco, setNovoMarco] = useState({
    ano: "",
    titulo: "",
    descricao: "",
  });

  const handleSave = () => {
    if (!novoMarco.ano || !novoMarco.titulo) return;
    setMarcos(
      [...marcos, { id: Date.now(), ...novoMarco, imagem: "" }].sort(
        (a, b) => Number(a.ano) - Number(b.ano)
      )
    );
    setShowModal(false);
    setNovoMarco({ ano: "", titulo: "", descricao: "" });
    addToast("Marco histórico adicionado!", "success");
  };

  const handleDelete = (id: number) => {
    setMarcos((prev) => prev.filter((m) => m.id !== id));
    addToast("Item removido.", "info");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"
          >
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">
            Gestão do Histórico
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition"
        >
          <Plus size={16} /> Adicionar
        </button>
      </header>

      <main className="p-6 space-y-6 relative">
        {/* Linha Vertical */}
        <div className="absolute left-9 top-6 bottom-0 w-0.5 bg-zinc-800 z-0"></div>

        {marcos.map((marco) => (
          <div key={marco.id} className="relative z-10 flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-zinc-900 border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <History size={14} className="text-emerald-500" />
              </div>
            </div>
            <div className="flex-1 bg-zinc-900 p-4 rounded-2xl border border-zinc-800 group hover:border-emerald-500/30 transition">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded border border-emerald-500/20">
                  {marco.ano}
                </span>
                <button
                  onClick={() => handleDelete(marco.id)}
                  className="text-zinc-600 hover:text-red-500 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <h3 className="font-bold text-white text-lg leading-tight mb-1">
                {marco.titulo}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                {marco.descricao}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* MODAL ADICIONAR */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 space-y-4">
            <h2 className="font-bold text-white text-lg">
              Novo Marco Histórico
            </h2>
            <div className="flex gap-3">
              <input
                type="number"
                placeholder="Ano (ex: 2024)"
                className="w-1/3 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                value={novoMarco.ano}
                onChange={(e) =>
                  setNovoMarco({ ...novoMarco, ano: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Título do Evento"
                className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                value={novoMarco.titulo}
                onChange={(e) =>
                  setNovoMarco({ ...novoMarco, titulo: e.target.value })
                }
              />
            </div>
            <textarea
              placeholder="Descrição do que aconteceu..."
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white h-24 resize-none focus:border-emerald-500 outline-none"
              value={novoMarco.descricao}
              onChange={(e) =>
                setNovoMarco({ ...novoMarco, descricao: e.target.value })
              }
            ></textarea>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
