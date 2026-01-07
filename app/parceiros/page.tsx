"use client";

import React from "react";
import { ArrowLeft, Percent, ChevronRight } from "lucide-react";
import Link from "next/link";

// Exportamos a lista para que a página de detalhes também possa usá-la (simulando banco de dados)
export const parceirosData = [
  {
    id: 1,
    nome: "Academia Ironberg",
    desconto: "20% OFF",
    cat: "Saúde",
    img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    slug: "ironberg",
    local: "Av. Principal, 123 - Centro",
    tel: "(12) 99876-5432",
    beneficio: "Desconto válido em todos os planos anuais para sócios AAAKN.",
  },
  {
    id: 2,
    nome: "Açaí do Monstro",
    desconto: "15% OFF",
    cat: "Alimentação",
    img: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
    slug: "acai-do-monstro",
    local: "Rua das Flores, 45 - Bairro Universitário",
    tel: "(12) 98122-3344",
    beneficio: "15% de desconto no copo de 500ml e 700ml.",
  },
  // ... outros parceiros aqui
];

export default function ParceirosPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg underline decoration-[#4ade80] underline-offset-4">
          Clube de Vantagens
        </h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Card de Alerta */}
        <div className="bg-gradient-to-r from-[#1a3a2a] to-black p-5 rounded-3xl border border-[#4ade80]/20 mb-6 flex items-center gap-4">
          <div className="bg-[#4ade80] p-3 rounded-2xl text-black">
            <Percent size={24} strokeWidth={3} />
          </div>
          <div>
            <h2 className="font-black italic uppercase text-sm italic tracking-tighter text-white">
              Economize agora!
            </h2>
            <p className="text-[10px] text-zinc-400 font-bold uppercase leading-tight">
              Apresente sua carteirinha digital.
            </p>
          </div>
        </div>

        {parceirosData.map((p) => (
          <Link
            key={p.id}
            href={`/parceiros/${p.id}`} // Rota dinâmica baseada no ID
            className="bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800/50 flex items-center gap-4 hover:border-[#4ade80]/50 transition group"
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black shrink-0 border border-zinc-800">
              <img
                src={p.img}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-black text-white uppercase italic tracking-tighter">
                  {p.nome}
                </h3>
                <ChevronRight
                  size={18}
                  className="text-zinc-600 group-hover:text-[#4ade80] transition"
                />
              </div>
              <span className="text-[9px] font-black text-[#4ade80] uppercase tracking-widest">
                {p.cat}
              </span>
              <p className="text-sm font-black text-white mt-1">{p.desconto}</p>
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}
