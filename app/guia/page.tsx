"use client";

import React from "react";
import {
  ArrowLeft,
  Bus,
  Map,
  Phone,
  ExternalLink,
  Landmark,
  GraduationCap,
  Utensils,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

// Mock de dados (Simulando o que viria do banco de dados/Admin)
const GUIA_DATA = [
  {
    categoria: "Acadêmico",
    icon: <GraduationCap size={18} />,
    color: "text-emerald-500",
    itens: [
      { titulo: "Portal do Aluno (EVA)", url: "#", tipo: "link" },
      { titulo: "Calendário Acadêmico 2026", url: "#", tipo: "link" },
      { titulo: "Cardápio do RU", url: "#", tipo: "link" },
    ],
  },
  {
    categoria: "Transporte",
    icon: <Bus size={18} />,
    color: "text-orange-500",
    itens: [
      {
        titulo: "Circular (Intercampi)",
        tipo: "card",
        detalhes: "Saída Terminal: 07:10, 12:30 | Saída Campus: 11:50, 17:50",
        badge: "Grátis",
        badgeColor: "bg-emerald-500/10 text-emerald-500",
        url: "#",
      },
    ],
  },
  {
    categoria: "Turismo",
    icon: <Landmark size={18} />,
    color: "text-blue-500",
    itens: [
      {
        titulo: "Praia Martim de Sá",
        descricao: "O point da galera",
        img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
        tipo: "imagem",
      },
      {
        titulo: "Pedra da Freira",
        descricao: "Pôr do sol top",
        img: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80",
        tipo: "imagem",
      },
    ],
  },
  {
    categoria: "Emergência",
    icon: <Phone size={18} />,
    color: "text-red-500",
    itens: [
      { titulo: "SAMU", numero: "192", tipo: "contato", color: "text-red-500" },
      {
        titulo: "Polícia",
        numero: "190",
        tipo: "contato",
        color: "text-red-500",
      },
    ],
  },
];

export default function GuiaPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      <header className="p-4 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-lg uppercase tracking-wide flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-500" /> Guia do Bixo
        </h1>
      </header>

      <main className="p-4 space-y-8">
        {GUIA_DATA.map((secao, index) => (
          <section key={index}>
            <h2
              className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${secao.color}`}
            >
              {secao.icon} {secao.categoria}
            </h2>

            {/* Layout Grid para Imagens e Contatos */}
            <div
              className={`grid gap-3 ${
                secao.itens[0].tipo === "imagem" ||
                secao.itens[0].tipo === "contato"
                  ? "grid-cols-2"
                  : "grid-cols-1"
              }`}
            >
              {secao.itens.map((item: any, idx) => (
                <div key={idx}>
                  {/* TIPO: LINK SIMPLES */}
                  {item.tipo === "link" && (
                    <LinkButton texto={item.titulo} url={item.url} />
                  )}

                  {/* TIPO: CARD DETALHADO (Transporte) */}
                  {item.tipo === "card" && (
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 hover:border-zinc-700 transition">
                      <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                        <span className="font-bold text-white">
                          {item.titulo}
                        </span>
                        {item.badge && (
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {item.detalhes}
                      </p>
                      <LinkButton texto="Ver Detalhes" url={item.url} pequeno />
                    </div>
                  )}

                  {/* TIPO: IMAGEM (Turismo) */}
                  {item.tipo === "imagem" && (
                    <CardTurismo
                      nome={item.titulo}
                      desc={item.descricao}
                      img={item.img}
                    />
                  )}

                  {/* TIPO: CONTATO (Emergência) */}
                  {item.tipo === "contato" && (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-center hover:bg-zinc-900 transition cursor-pointer">
                      <span
                        className={`block font-black text-2xl mb-1 ${item.color}`}
                      >
                        {item.numero}
                      </span>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                        {item.titulo}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}

// Componentes Auxiliares
function LinkButton({
  texto,
  url,
  pequeno = false,
}: {
  texto: string;
  url: string;
  pequeno?: boolean;
}) {
  return (
    <a
      href={url}
      className={`flex justify-between items-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition rounded-xl group ${
        pequeno ? "p-2 text-xs" : "p-4"
      }`}
    >
      <span
        className={`${
          pequeno ? "font-medium text-zinc-300" : "font-bold text-white"
        } group-hover:text-emerald-400 transition`}
      >
        {texto}
      </span>
      <ExternalLink
        size={pequeno ? 14 : 18}
        className="text-zinc-600 group-hover:text-emerald-500 transition"
      />
    </a>
  );
}

function CardTurismo({
  nome,
  desc,
  img,
}: {
  nome: string;
  desc: string;
  img: string;
}) {
  return (
    <div className="relative h-32 rounded-xl overflow-hidden group cursor-pointer border border-zinc-800 hover:border-emerald-500/50 transition">
      <img
        src={img}
        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition duration-700"
        alt={nome}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute bottom-3 left-3 right-3">
        <span className="block text-white font-bold text-sm mb-0.5 group-hover:text-emerald-400 transition">
          {nome}
        </span>
        <span className="block text-zinc-400 text-[10px] font-medium">
          {desc}
        </span>
      </div>
    </div>
  );
}
