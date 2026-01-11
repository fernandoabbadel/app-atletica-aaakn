"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Megaphone,
  Percent,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

const PARCEIROS_MOCK = [
  {
    id: 1,
    nome: "Academia Ironberg",
    beneficio: "15% de desconto na mensalidade",
    categoria: "Saúde",
    ativo: true,
  },
  {
    id: 2,
    nome: "Açaí do Monstro",
    beneficio: "Toppings grátis para sócios",
    categoria: "Alimentação",
    ativo: true,
  },
];

export default function AdminParceirosPage() {
  const { addToast } = useToast();
  const [parceiros, setParceiros] = useState(PARCEIROS_MOCK);
  const [showModal, setShowModal] = useState(false);
  const [novoParceiro, setNovoParceiro] = useState({
    nome: "",
    beneficio: "",
    categoria: "Alimentação",
  });

  const handleSave = () => {
    if (!novoParceiro.nome) return;
    setParceiros([
      ...parceiros,
      { id: Date.now(), ...novoParceiro, ativo: true },
    ]);
    setShowModal(false);
    setNovoParceiro({ nome: "", beneficio: "", categoria: "Alimentação" });
    addToast("Parceiro adicionado!", "success");
  };

  const handleDelete = (id: number) => {
    if (confirm("Remover este parceiro?")) {
      setParceiros((prev) => prev.filter((p) => p.id !== id));
      addToast("Parceiro removido.", "info");
    }
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
            Parceiros
          </h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition"
        >
          <Plus size={16} /> Novo
        </button>
      </header>

      <main className="p-6 space-y-4">
        {parceiros.map((parceiro) => (
          <div
            key={parceiro.id}
            className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex justify-between items-center group hover:border-emerald-500/30 transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-zinc-500 font-bold border border-zinc-800">
                {parceiro.nome.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  {parceiro.nome}
                </h3>
                <p className="text-emerald-400 text-xs font-medium mt-0.5 flex items-center gap-1">
                  <Percent size={10} /> {parceiro.beneficio}
                </p>
                <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mt-1 block">
                  {parceiro.categoria}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDelete(parceiro.id)}
              className="p-2 text-zinc-600 hover:text-red-500 transition bg-black/50 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </main>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 space-y-4">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Megaphone size={20} className="text-emerald-500" /> Novo Parceiro
            </h2>

            <input
              type="text"
              placeholder="Nome da Empresa"
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
              value={novoParceiro.nome}
              onChange={(e) =>
                setNovoParceiro({ ...novoParceiro, nome: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Benefício (ex: 10% OFF)"
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
              value={novoParceiro.beneficio}
              onChange={(e) =>
                setNovoParceiro({ ...novoParceiro, beneficio: e.target.value })
              }
            />

            <select
              className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400 focus:border-emerald-500 outline-none"
              value={novoParceiro.categoria}
              onChange={(e) =>
                setNovoParceiro({ ...novoParceiro, categoria: e.target.value })
              }
            >
              <option value="Alimentação">Alimentação</option>
              <option value="Saúde">Saúde</option>
              <option value="Serviços">Serviços</option>
              <option value="Lazer">Lazer</option>
            </select>

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
