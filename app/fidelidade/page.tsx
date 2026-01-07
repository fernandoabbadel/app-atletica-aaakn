"use client";

import React, { useState } from "react";
import { ArrowLeft, QrCode, Gift, Info, Check } from "lucide-react";
import Link from "next/link";

export default function FidelidadePage() {
  const [activeTab, setActiveTab] = useState<"cartao" | "premios">("cartao");

  // DADOS
  const cartao = {
    carimbos: 7, // De 10
    total: 10,
    campanha: "Compra de Ingressos & Produtos",
  };

  const premios = [
    {
      id: 1,
      nome: "Copo da Atlética",
      pontos: 10,
      img: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800&q=80",
      resgatavel: false,
    },
    {
      id: 2,
      nome: "50% OFF na Cervejada",
      pontos: 5,
      img: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
      resgatavel: true,
    },
    {
      id: 3,
      nome: "Chaveiro Tubarão",
      pontos: 3,
      img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80",
      resgatavel: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/menu"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">Clube Fidelidade</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* ABAS */}
        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("cartao")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "cartao"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Meu Cartão
          </button>
          <button
            onClick={() => setActiveTab("premios")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "premios"
                ? "bg-zinc-800 text-white shadow"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Recompensas
          </button>
        </div>

        {/* CONTEÚDO */}
        {activeTab === "cartao" ? (
          <div className="space-y-6 animate-in slide-in-from-left-5 duration-300">
            {/* Cartão Fidelidade Visual */}
            <div className="bg-gradient-to-br from-emerald-900 to-[#0a2e23] p-6 rounded-[2rem] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h2 className="text-xl font-black text-white italic uppercase tracking-wider">
                    SHARK CARD
                  </h2>
                  <p className="text-[10px] text-emerald-200 font-bold">
                    {cartao.campanha}
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md">
                  <QrCode size={24} className="text-white" />
                </div>
              </div>

              {/* Grid de Carimbos */}
              <div className="grid grid-cols-5 gap-3 relative z-10">
                {Array.from({ length: cartao.total }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                      i < cartao.carimbos
                        ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                        : "bg-black/30 border-white/10 text-white/10"
                    }`}
                  >
                    {i < cartao.carimbos ? (
                      <Check size={14} strokeWidth={4} />
                    ) : (
                      <span className="text-[10px] font-bold">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-center text-[10px] text-emerald-200/60 mt-4 relative z-10 font-medium">
                Complete 10 selos para ganhar um prêmio exclusivo!
              </p>

              {/* Fundo Decorativo */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl"></div>
            </div>

            {/* Botão de Validar */}
            <button className="w-full bg-white text-black font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition shadow-lg active:scale-95">
              <QrCode size={18} />
              LER QR CODE PARA PONTUAR
            </button>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex gap-3">
              <Info size={18} className="text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                Você ganha 1 selo a cada R$ 50,00 em compras na lojinha ou na
                compra de ingressos para festas oficiais.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-right-5 duration-300">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-sm font-bold text-white">
                Prêmios Disponíveis
              </h3>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                {cartao.carimbos} Pontos
              </span>
            </div>

            {premios.map((premio) => (
              <div
                key={premio.id}
                className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex items-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-xl bg-black overflow-hidden shrink-0">
                  <img
                    src={premio.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-white">
                    {premio.nome}
                  </h4>
                  <span className="text-xs text-zinc-500">
                    {premio.pontos} selos necessários
                  </span>
                </div>
                <button
                  disabled={!premio.resgatavel}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase transition ${
                    premio.resgatavel
                      ? "bg-emerald-500 text-black hover:bg-emerald-400"
                      : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                  }`}
                >
                  {premio.resgatavel ? "Resgatar" : "Bloqueado"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
