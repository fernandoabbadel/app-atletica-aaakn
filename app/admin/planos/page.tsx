"use client";

import React, { useState } from "react";
import { ArrowLeft, Edit, Crown, Check, DollarSign } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

const PLANOS_MOCK = [
  {
    id: 1,
    nome: "VIP",
    preco: "49,90",
    cor: "text-yellow-500",
    border: "border-yellow-500",
    beneficios: [
      "Entrada grátis nas festas",
      "Desconto na loja",
      "Carteirinha Digital",
    ],
  },
  {
    id: 2,
    nome: "STANDARD",
    preco: "29,90",
    cor: "text-emerald-500",
    border: "border-emerald-500",
    beneficios: ["Meia entrada nas festas", "Carteirinha Digital"],
  },
];

export default function AdminPlanosPage() {
  const { addToast } = useToast();
  const [planos, setPlanos] = useState(PLANOS_MOCK);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState("");

  const startEdit = (plano: any) => {
    setEditingId(plano.id);
    setEditPrice(plano.preco);
  };

  const saveEdit = (id: number) => {
    setPlanos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, preco: editPrice } : p))
    );
    setEditingId(null);
    addToast("Preço atualizado!", "success");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center gap-3">
        <Link
          href="/admin"
          className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"
        >
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <h1 className="text-lg font-black text-white uppercase tracking-tighter">
          Planos de Sócio
        </h1>
      </header>

      <main className="p-6 space-y-6">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className={`bg-zinc-900 p-6 rounded-3xl border ${
              plano.id === 1 ? "border-yellow-500/30" : "border-zinc-800"
            } relative overflow-hidden`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Crown size={20} className={plano.cor} />
                <h2
                  className={`text-xl font-black uppercase italic tracking-tighter ${plano.cor}`}
                >
                  {plano.nome}
                </h2>
              </div>
              {editingId === plano.id ? (
                <button
                  onClick={() => saveEdit(plano.id)}
                  className="bg-emerald-600 text-white p-2 rounded-lg"
                >
                  <Check size={16} />
                </button>
              ) : (
                <button
                  onClick={() => startEdit(plano)}
                  className="bg-zinc-800 text-zinc-400 p-2 rounded-lg hover:text-white"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>

            <div className="mb-6">
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
                Mensalidade
              </p>
              <div className="flex items-center gap-1">
                <span className="text-zinc-500 font-bold">R$</span>
                {editingId === plano.id ? (
                  <input
                    autoFocus
                    type="text"
                    className="bg-black border border-zinc-700 rounded px-2 py-1 text-2xl font-black text-white w-24"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                ) : (
                  <span className="text-4xl font-black text-white tracking-tighter">
                    {plano.preco}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {plano.beneficios.map((ben, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 text-sm text-zinc-300"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      plano.id === 1 ? "bg-yellow-500" : "bg-emerald-500"
                    }`}
                  ></div>
                  {ben}
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
