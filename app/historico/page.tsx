"use client";

import React from "react";
import { ArrowLeft, Calendar, MapPin, Clock, Camera } from "lucide-react";
import Link from "next/link";

// Dados baseados nas imagens que você enviou
const timelineEventos = [
  {
    id: 1,
    titulo: "3º JUCA BEACH",
    subtitulo: "A Invasão do Litoral",
    data: "23 de Março",
    local: "Praia do Camaroeiro",
    descricao:
      "Sol, areia e muita integração. Nossos atletas dominaram as quadras de areia e a torcida fez a praia tremer.",
    imagem: "/historico/juca-beach.JPG",
    cor: "from-yellow-500 to-blue-500",
    tags: ["Jogos", "Praia", "Integração"],
  },
  {
    id: 2,
    titulo: "ANESTESIA",
    subtitulo: "Worries Off",
    data: "14 de Maio",
    local: "Santé Gastro Club",
    descricao:
      "O dress code branco tomou conta da cidade. Uma noite insana para esquecer dos problemas e focar na diversão.",
    imagem: "/historico/anestesia.JPG",
    cor: "from-zinc-200 to-zinc-500",
    tags: ["White Party", "Open Bar"],
  },
  {
    id: 3,
    titulo: "CALOURADA 2025.2",
    subtitulo: "O Início da Jornada",
    data: "15 de Agosto",
    local: "O Garimpo",
    descricao:
      "A recepção oficial dos novos tubarões. DJ Lanco e Pétala comandaram o som até o amanhecer.",
    imagem: "/historico/calourada.JPG",
    cor: "from-green-600 to-emerald-900",
    tags: ["Boas-vindas", "Trote"],
  },
  {
    id: 4,
    titulo: "BLACKOUT",
    subtitulo: "Turn Off The Lights",
    data: "27 de Setembro",
    local: "Santé Gastro Club",
    descricao:
      "Quando as luzes se apagam, a loucura começa. A festa mais misteriosa e sensorial do ano.",
    imagem: "/historico/black-out.JPG",
    cor: "from-zinc-800 to-black",
    tags: ["Noite", "Mistério"],
  },
  {
    id: 5,
    titulo: "EPIDEMIA",
    subtitulo: "A Festa à Fantasia",
    data: "25 de Outubro",
    local: "Rua Iraci, 59",
    descricao:
      "A criatividade rolou solta! Uma noite assustadoramente divertida onde ninguém era quem parecia ser.",
    imagem: "/historico/epidemia.JPG",
    cor: "from-red-900 to-black",
    tags: ["Fantasia", "Halloween"],
  },
  {
    id: 6,
    titulo: "JIMESP",
    subtitulo: "Jogos Intermed SP",
    data: "20 a 22 de Novembro",
    local: "São Paulo",
    descricao:
      "A primeira edição histórica. Sangue, suor e glória defendendo o manto verde e preto contra as maiores medicinas do estado.",
    imagem: "/historico/jimesp.JPG",
    cor: "from-green-500 to-yellow-400",
    tags: ["Campeonato", "Esportes", "Viagem"],
  },
];

export default function HistoricoPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="p-4 flex items-center gap-3 max-w-2xl mx-auto">
          <Link
            href="/"
            className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-white/10 group"
          >
            <ArrowLeft
              size={24}
              className="group-hover:-translate-x-1 transition-transform"
            />
          </Link>
          <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">
            Nossa História
          </h1>
        </div>
      </header>

      <div className="h-20"></div>

      <main className="p-4 max-w-2xl mx-auto space-y-12">
        {/* Intro */}
        <section className="text-center space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="text-emerald-500 text-xs font-black uppercase tracking-[0.3em]">
            Galeria AAAKN
          </span>
          <h2 className="text-3xl font-black text-white italic uppercase leading-none">
            Momentos <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              Lendários
            </span>
          </h2>
          <p className="text-zinc-400 text-sm max-w-xs mx-auto leading-relaxed">
            Da praia ao ginásio, da festa ao pódio. Confira os eventos que
            construíram nossa tradição.
          </p>
        </section>

        {/* TIMELINE */}
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
          {timelineEventos.map((evento, index) => (
            <div
              key={evento.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
            >
              {/* Bolinha da Timeline */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#050505] bg-zinc-800 group-hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(0,0,0,0.5)] shrink-0 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <Camera
                  size={16}
                  className="text-zinc-400 group-hover:text-black"
                />
              </div>

              {/* Card do Evento */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden shadow-xl hover:border-white/20 transition-all duration-500 hover:-translate-y-1">
                {/* Imagem */}
                <div className="h-48 relative overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10`}
                  ></div>
                  <img
                    src={evento.imagem}
                    alt={evento.titulo}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                  />
                  {/* Data Badge */}
                  <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 flex flex-col items-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold">
                      {evento.data.split(" ")[2]}
                    </span>
                    <span className="text-lg font-black text-white leading-none">
                      {evento.data.split(" ")[0]}
                    </span>
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-5 relative">
                  {/* Tags */}
                  <div className="flex gap-2 mb-3">
                    {evento.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-bold uppercase px-2 py-0.5 bg-white/5 rounded text-zinc-300 border border-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="text-xl font-black italic uppercase text-white leading-none mb-1">
                    {evento.titulo}
                  </h3>
                  <p
                    className={`text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r ${evento.cor} uppercase tracking-widest mb-3`}
                  >
                    {evento.subtitulo}
                  </p>

                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    {evento.descricao}
                  </p>

                  <div className="flex items-center gap-2 text-zinc-500 text-xs pt-3 border-t border-white/5">
                    <MapPin size={14} className="text-emerald-500" />
                    {evento.local}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="text-center pt-8 pb-4">
          <p className="text-zinc-500 text-sm mb-4">
            Não fique de fora da próxima história...
          </p>
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 bg-emerald-500 text-black px-8 py-4 rounded-xl font-black uppercase text-sm hover:bg-emerald-400 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Calendar size={18} /> Ver Agenda 2026
          </Link>
        </div>
      </main>
    </div>
  );
}
