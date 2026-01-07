"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, MapPin, Phone, CheckCircle2, Share2 } from "lucide-react";
import Link from "next/link";
import { parceirosData } from "../page"; // Importamos os dados

export default function DetalheParceiro() {
  const params = useParams();
  const partner = parceirosData.find((p) => p.id === Number(params.id));

  if (!partner)
    return <div className="p-10 text-center">Parceiro não encontrado.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      {/* Imagem de Capa */}
      <div className="relative h-64">
        <img
          src={partner.img}
          className="w-full h-full object-cover brightness-50"
        />
        <Link
          href="/parceiros"
          className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-full border border-white/10"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="absolute -bottom-1 left-0 w-full h-24 bg-gradient-to-t from-[#050505] to-transparent"></div>
      </div>

      <main className="px-6 -mt-10 relative z-10">
        <div className="bg-[#111] border border-zinc-800 p-6 rounded-[2.5rem] shadow-2xl">
          <div className="flex justify-between items-start mb-4">
            <span className="px-3 py-1 bg-[#4ade80]/10 border border-[#4ade80]/20 rounded-full text-[#4ade80] text-[10px] font-black uppercase tracking-widest">
              {partner.cat}
            </span>
            <button className="text-zinc-500 hover:text-white transition">
              <Share2 size={20} />
            </button>
          </div>

          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2 leading-none">
            {partner.nome}
          </h1>
          <div className="flex items-center gap-2 text-[#4ade80] mb-6">
            <div className="p-1 bg-[#4ade80] text-black rounded-lg">
              <CheckCircle2 size={16} strokeWidth={3} />
            </div>
            <span className="font-black uppercase text-sm tracking-tight">
              {partner.desconto}
            </span>
          </div>

          <div className="space-y-6">
            {/* Benefício */}
            <div>
              <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">
                Benefício Sócio
              </h4>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                {partner.beneficio}
              </p>
            </div>

            {/* Localização */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-zinc-800/50">
              <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                <MapPin size={20} />
              </div>
              <div>
                <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Localização
                </h5>
                <p className="text-xs text-white mt-1 font-bold">
                  {partner.local}
                </p>
              </div>
            </div>

            {/* Contato */}
            <div className="flex items-start gap-4 p-4 bg-black/40 rounded-2xl border border-zinc-800/50">
              <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                <Phone size={20} />
              </div>
              <div>
                <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  Contato
                </h5>
                <p className="text-xs text-white mt-1 font-bold">
                  {partner.tel}
                </p>
              </div>
            </div>
          </div>

          <button className="w-full mt-8 bg-[#4ade80] text-black font-black py-4 rounded-2xl uppercase italic tracking-tighter hover:bg-[#22c55e] transition shadow-[0_4px_0_#1a3a2a]">
            Como usar o desconto?
          </button>
        </div>
      </main>
    </div>
  );
}
