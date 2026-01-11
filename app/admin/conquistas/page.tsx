"use client";

import React, { useState } from "react";
import { ArrowLeft, Plus, Medal, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

const CONQUISTAS_MOCK = [
  { id: 1, titulo: "Primeiro Treino", xp: 50, icone: "🏃", tipo: "Esporte" },
  { id: 2, titulo: "Rei da Festa", xp: 100, icone: "👑", tipo: "Social" },
];

export default function AdminConquistasPage() {
  const { addToast } = useToast();
  const [conquistas, setConquistas] = useState(CONQUISTAS_MOCK);
  const [showModal, setShowModal] = useState(false);
  const [novaConquista, setNovaConquista] = useState({
    titulo: "",
    xp: "",
    icone: "🏆",
  });

  const handleSave = () => {
    if (!novaConquista.titulo) return;
    setConquistas([
      ...conquistas,
      {
        id: Date.now(),
        ...novaConquista,
        xp: Number(novaConquista.xp),
        tipo: "Custom",
      },
    ]);
    setShowModal(false);
    setNovaConquista({ titulo: "", xp: "", icone: "🏆" });
    addToast("Conquista criada!", "success");
  };

  const handleDelete = (id: number) => {
    setConquistas((prev) => prev.filter((c) => c.id !== id));
    addToast("Conquista removida.", "info");
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
            Conquistas
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition"
        >
          <Plus size={16} /> Nova
        </button>
      </header>

      <main className="p-6 grid grid-cols-2 gap-3">
        {conquistas.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col items-center text-center relative group hover:border-yellow-500/30 transition"
          >
            <button
              onClick={() => handleDelete(item.id)}
              className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={14} />
            </button>
            <div className="text-3xl mb-2">{item.icone}</div>
            <h3 className="font-bold text-white text-xs mb-1">{item.titulo}</h3>
            <span className="text-[10px] text-yellow-500 font-black bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1">
              <Star size={8} fill="currentColor" /> {item.xp} XP
            </span>
          </div>
        ))}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 space-y-4">
            <h2 className="font-bold text-white text-lg">Nova Conquista</h2>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Emoji (ex: 🦈)"
                className="w-16 text-center bg-black border border-zinc-700 rounded-xl p-3 text-xl text-white focus:border-emerald-500 outline-none"
                value={novaConquista.icone}
                onChange={(e) =>
                  setNovaConquista({ ...novaConquista, icone: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Nome da Conquista"
                className="flex-1 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                value={novaConquista.titulo}
                onChange={(e) =>
                  setNovaConquista({ ...novaConquista, titulo: e.target.value })
                }
              />
            </div>
            <input
              type="number"
              placeholder="XP (ex: 100)"
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
              value={novaConquista.xp}
              onChange={(e) =>
                setNovoConquista({ ...novaConquista, xp: e.target.value })
              }
            />

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
