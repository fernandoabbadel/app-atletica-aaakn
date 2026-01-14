"use client";

import React from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  Ticket,
  CheckCircle,
  XCircle,
  HelpCircle,
  Clock,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// Mock de dados
const eventosData = [
  {
    id: 1,
    titulo: "INTERMED 2026",
    data: "12 a 15 de Outubro",
    hora: "14:00 - 22:00",
    local: "Arena XP, São Paulo",
    endereco: "Av. das Nações Unidas, 1234 - Pinheiros",
    descricao:
      "O maior evento universitário de medicina do Brasil está de volta! Prepare-se para 4 dias de competições insanas, festas open bar e a maior integração da história. A delegação do Tubarão vai invadir SP!",
    imagem:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
    turmasPresence: [
      // CORREÇÃO: Usando os arquivos que existem na pasta public
      { turma: "T5", count: 85, logo: "/turma5.jpeg" },
      { turma: "T3", count: 62, logo: "/turma3.jpeg" },
      { turma: "T1", count: 45, logo: "/turma1.jpeg" },
    ],
    lotes: [
      { nome: "Promocional", preco: "R$ 60,00", status: "encerrado" },
      { nome: "Lote 1", preco: "R$ 75,00", status: "encerrado" },
      { nome: "Lote 2 - Open Bar", preco: "R$ 85,00", status: "ativo" },
    ],
  },
];

export default function DetalhesEventoPage() {
  const params = useParams();
  const evento =
    eventosData.find((e) => e.id === Number(params.id)) || eventosData[0];

  // Ordenar turmas por presença
  const sortedTurmas =
    evento.turmasPresence?.sort((a, b) => b.count - a.count) || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* HERO IMAGE */}
      <div className="relative h-[55vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
        <img
          src={evento.imagem}
          className="w-full h-full object-cover"
          alt={evento.titulo}
        />

        {/* Botão Voltar */}
        <Link
          href="/eventos"
          className="absolute top-6 left-6 z-20 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-black transition"
        >
          <ArrowLeft size={24} />
        </Link>

        {/* Botão Share */}
        <button className="absolute top-6 right-6 z-20 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-emerald-500 hover:text-black transition">
          <Share2 size={24} />
        </button>

        {/* CONTEÚDO SOBRE A IMAGEM (HERO) */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col gap-4">
          {/* Tag Oficial */}
          <div>
            <span className="bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full mb-3 inline-block">
              Evento Oficial
            </span>
          </div>

          <div className="flex justify-between items-end">
            {/* Título e Datas */}
            <div className="flex-1 pr-4">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2 text-white drop-shadow-xl">
                {evento.titulo}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm font-bold text-zinc-300">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500" />{" "}
                  {evento.data}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-500" /> {evento.hora}
                </div>
              </div>
            </div>

            {/* TURMAS (Círculos flutuantes - Com Imagens Reais) */}
            <div className="flex flex-col items-end gap-2">
              {sortedTurmas.slice(0, 3).map((turma, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-black/60 backdrop-blur-md pl-1.5 pr-2 py-1.5 rounded-full border border-white/10 animate-in slide-in-from-right duration-700"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* 1. Círculo da Turma (Primeiro e Maior) */}
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-500 shrink-0">
                    {/* CORREÇÃO: Usando a imagem real */}
                    <img
                      src={turma.logo}
                      className="w-full h-full object-cover"
                      alt={`Turma ${turma.turma}`}
                      onError={(e) => {
                        // Fallback se a imagem falhar: esconde img e mostra texto
                        e.currentTarget.style.display = "none";
                        e.currentTarget.parentElement!.innerText = turma.turma;
                      }}
                    />
                  </div>

                  {/* 2. Quantidade (Depois) */}
                  <span className="text-[10px] font-bold text-white">
                    +{turma.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL */}
      <div className="p-6 max-w-2xl mx-auto -mt-4 relative z-30 space-y-8">
        {/* RSVP GRID */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-2xl">
          <p className="text-center text-xs font-bold text-zinc-400 mb-3 uppercase tracking-widest">
            Confirme sua presença
          </p>
          <div className="grid grid-cols-3 gap-3">
            <button className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-emerald-500 hover:text-black transition">
              <CheckCircle size={20} />
              <span className="text-[10px] font-black uppercase">Vou</span>
            </button>
            <button className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 py-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-yellow-500 hover:text-black transition">
              <HelpCircle size={20} />
              <span className="text-[10px] font-black uppercase">Talvez</span>
            </button>
            <button className="bg-red-500/10 text-red-500 border border-red-500/20 py-3 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-red-500 hover:text-black transition">
              <XCircle size={20} />
              <span className="text-[10px] font-black uppercase">Não Vou</span>
            </button>
          </div>
        </div>

        {/* Descrição */}
        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" /> Sobre o evento
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {evento.descricao}
          </p>
        </section>

        {/* Localização */}
        <section className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
          <h2 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <MapPin size={16} className="text-emerald-500" /> Localização
          </h2>
          <p className="text-zinc-300 text-sm font-medium">{evento.local}</p>
          <p className="text-zinc-500 text-xs mt-1">{evento.endereco}</p>
          <div className="mt-3 h-32 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 text-xs">
            [Mapa Interativo Aqui]
          </div>
        </section>

        {/* SELEÇÃO DE INGRESSOS */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Ticket size={18} className="text-emerald-500" /> Ingressos
          </h2>
          <div className="space-y-3">
            {evento.lotes.map((lote, index) => (
              <div
                key={index}
                className={`flex justify-between items-center p-4 rounded-xl border ${
                  lote.status === "ativo"
                    ? "bg-zinc-900 border-emerald-500/50 shadow-lg shadow-emerald-900/20"
                    : "bg-black border-zinc-800 opacity-60"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-bold uppercase ${
                      lote.status === "ativo"
                        ? "text-white"
                        : "text-zinc-500 line-through"
                    }`}
                  >
                    {lote.nome}
                  </p>
                  <p
                    className={`text-lg font-black ${
                      lote.status === "ativo"
                        ? "text-emerald-400"
                        : "text-zinc-600"
                    }`}
                  >
                    {lote.preco}
                  </p>
                </div>
                {lote.status === "ativo" ? (
                  <Link
                    href="/carrinho"
                    className="bg-white text-black px-4 py-2 rounded-lg text-xs font-black uppercase hover:bg-emerald-400 transition"
                  >
                    Comprar
                  </Link>
                ) : (
                  <span className="text-[10px] font-bold text-zinc-500 uppercase bg-zinc-800 px-3 py-1 rounded-full">
                    Esgotado
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
