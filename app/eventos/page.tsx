"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Music,
  Trophy,
  Search,
  Heart,
  CheckCircle,
  XCircle,
  HelpCircle,
  ExternalLink,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function EventosPage() {
  const [filtro, setFiltro] = useState<"todos" | "festas" | "esportes">(
    "todos"
  );

  // --- DADOS DOS EVENTOS (SUPER COMPLETOS) ---
  const eventos = [
    {
      id: 1,
      tipo: "festa",
      titulo: "INTERMED 2026",
      data: "12 OUT - 15 OUT",
      local: "Arena XP, São Paulo",
      // Link gerado para o Maps
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Arena+XP+Sao+Paulo",
      imagem:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      stats: { confirmados: 289, talvez: 67, likes: 512 },
      destaque: "OPEN BAR", // Categoria separada
      lotes: [
        { nome: "Promocional", preco: "R$ 60,00", status: "encerrado" },
        { nome: "Lote 1", preco: "R$ 75,00", status: "encerrado" },
        {
          nome: "Lote 2",
          preco: "R$ 85,00",
          status: "ativo",
          vendidos: 178,
          total: 300,
        },
      ],
    },
    {
      id: 2,
      tipo: "esportes",
      titulo: "Tubarões vs. Engenharia",
      data: "20 JAN • 14:00",
      local: "Ginásio Municipal",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Ginasio+Municipal+Caraguatatuba",
      imagem:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
      stats: { confirmados: 45, talvez: 12, likes: 89 },
      destaque: "FINAL",
      lotes: [
        {
          nome: "Entrada Franca",
          preco: "GRÁTIS",
          status: "ativo",
          vendidos: 450,
          total: 500,
        },
      ],
    },
    {
      id: 3,
      tipo: "festa",
      titulo: "Cervejada dos Calouros",
      data: "05 FEV • 22:00",
      local: "Toca do Tubarão",
      mapsUrl: "https://www.google.com/maps/search/?api=1&query=Caraguatatuba",
      imagem:
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
      stats: { confirmados: 120, talvez: 40, likes: 230 },
      destaque: "INTEGRAÇÃO",
      lotes: [
        { nome: "Early Bird", preco: "R$ 20,00", status: "encerrado" },
        {
          nome: "Lote 1",
          preco: "R$ 30,00",
          status: "ativo",
          vendidos: 89,
          total: 200,
        },
      ],
    },
  ];

  // Lógica de Filtro
  const eventosFiltrados =
    filtro === "todos"
      ? eventos
      : eventos.filter(
          (e) => e.tipo === (filtro === "festas" ? "festa" : "esportes")
        );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      {/* HEADER FIXO */}
      <header className="fixed top-0 left-0 w-full z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="p-4 flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-white/10 group"
            >
              <ArrowLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </Link>
            <h1 className="font-bold text-lg tracking-tight text-white">
              Agenda do Tubarão
            </h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="h-20"></div>

      <main className="p-4 space-y-8 max-w-md mx-auto">
        {/* FILTROS */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
          <button
            onClick={() => setFiltro("todos")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
              filtro === "todos"
                ? "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105"
                : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltro("festas")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
              filtro === "festas"
                ? "bg-purple-600 text-white border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)] scale-105"
                : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}
          >
            <Music size={12} /> Festas
          </button>
          <button
            onClick={() => setFiltro("esportes")}
            className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${
              filtro === "esportes"
                ? "bg-orange-600 text-white border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)] scale-105"
                : "bg-zinc-900 text-zinc-500 border-zinc-800"
            }`}
          >
            <Trophy size={12} /> Esportes
          </button>
        </div>

        {/* LISTA DE EVENTOS */}
        <div className="space-y-10">
          {eventosFiltrados.map((evento) => (
            <div
              key={evento.id}
              className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl"
            >
              {/* 1. IMAGEM + TAG DESTAQUE */}
              <div className="h-64 relative">
                <img
                  src={evento.imagem}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

                {/* TAG DESTAQUE (Separado do Lote) */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md shadow-lg ${
                      evento.tipo === "festa"
                        ? "bg-purple-600 text-white"
                        : "bg-orange-600 text-white"
                    }`}
                  >
                    {evento.destaque}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 drop-shadow-lg">
                    {evento.titulo}
                  </h3>
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-medium bg-black/40 w-fit px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
                    <Calendar size={14} className="text-emerald-500" />
                    {evento.data}
                  </div>
                </div>
              </div>

              {/* 2. INFORMAÇÕES E INTERAÇÃO */}
              <div className="p-5 space-y-6">
                {/* Localização (Link Google Maps) + Stats Confirmados */}
                <div className="space-y-3">
                  <a
                    href={evento.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 group cursor-pointer hover:bg-zinc-800/50 p-2 -mx-2 rounded-xl transition"
                  >
                    <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black transition">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white group-hover:underline decoration-emerald-500 underline-offset-4">
                        {evento.local}
                      </p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        Ver no mapa <ExternalLink size={10} />
                      </p>
                    </div>
                  </a>

                  {/* Stats de Presença */}
                  <div className="flex items-center gap-2 text-xs text-zinc-400 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-950"></div>
                      <div className="w-6 h-6 rounded-full bg-zinc-600 border-2 border-zinc-950"></div>
                      <div className="w-6 h-6 rounded-full bg-zinc-500 border-2 border-zinc-950 flex items-center justify-center text-[8px] text-white font-bold">
                        +99
                      </div>
                    </div>
                    <span>
                      <strong className="text-emerald-400">
                        {evento.stats.confirmados} confirmados
                      </strong>{" "}
                      • {evento.stats.talvez} talvez
                    </span>
                  </div>
                </div>

                {/* PAINEL DE INTERAÇÃO (RSVP) */}
                <div className="grid grid-cols-4 gap-2">
                  <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition group">
                    <Heart
                      size={20}
                      className="group-active:scale-125 transition"
                    />
                    <span className="text-[9px] font-bold">
                      {evento.stats.likes}
                    </span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition">
                    <CheckCircle size={20} />
                    <span className="text-[9px] font-bold">Vou</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 transition">
                    <XCircle size={20} />
                    <span className="text-[9px] font-bold">Não</span>
                  </button>
                  <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition">
                    <HelpCircle size={20} />
                    <span className="text-[9px] font-bold">Talvez</span>
                  </button>
                </div>

                <div className="border-t border-dashed border-zinc-800 my-4"></div>

                {/* SEÇÃO DE INGRESSOS (LOTES) */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
                    Ingressos
                  </h4>

                  {evento.lotes.map((lote, index) => {
                    const isAtivo = lote.status === "ativo";
                    const progresso =
                      isAtivo && lote.vendidos && lote.total
                        ? (lote.vendidos / lote.total) * 100
                        : 0;

                    return (
                      <div
                        key={index}
                        className={`relative p-4 rounded-xl border flex flex-col gap-2 transition ${
                          isAtivo
                            ? "bg-gradient-to-br from-emerald-900/20 to-zinc-900 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                            : "bg-zinc-950 border-zinc-800 opacity-60 grayscale"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider block ${
                                isAtivo
                                  ? "text-emerald-400"
                                  : "text-zinc-500 line-through"
                              }`}
                            >
                              {lote.nome}
                            </span>
                            <span
                              className={`text-lg font-black block ${
                                isAtivo
                                  ? "text-white"
                                  : "text-zinc-600 line-through"
                              }`}
                            >
                              {lote.preco}
                            </span>
                          </div>

                          {isAtivo ? (
                            <div className="bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase">
                              Ativo
                            </div>
                          ) : (
                            <div className="bg-zinc-800 text-zinc-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                              Encerrado
                            </div>
                          )}
                        </div>

                        {/* Barra de Progresso (Só para lote ativo) */}
                        {isAtivo && lote.vendidos && lote.total && (
                          <div className="mt-2">
                            <div className="flex justify-between text-[9px] font-bold text-zinc-400 mb-1">
                              <span>
                                Vendidos: {lote.vendidos}/{lote.total}
                              </span>
                              <span className="text-emerald-500">
                                {Math.round(progresso)}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${progresso}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* BOTÃO COMPRAR FINAL */}
                <button className="w-full bg-white text-black py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-emerald-400 hover:scale-[1.02] transition shadow-xl active:scale-95 mt-4">
                  <Ticket size={18} />
                  COMPRAR INGRESSO
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé extra */}
        <div className="h-10 text-center">
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
            Fim da Agenda
          </p>
        </div>
      </main>
    </div>
  );
}
