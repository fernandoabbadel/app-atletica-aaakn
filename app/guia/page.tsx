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
} from "lucide-react";
import Link from "next/link";

export default function GuiaPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">Guia de Sobrevivência</h1>
      </header>

      <main className="p-4 space-y-8">
        {/* Links Úteis */}
        <section>
          <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <GraduationCap size={16} /> Acadêmico & Útil
          </h2>
          <div className="space-y-2">
            <LinkButton texto="Portal do Aluno (EVA)" url="#" />
            <LinkButton texto="Calendário Acadêmico 2026" url="#" />
            <LinkButton texto="Cardápio do RU" url="#" />
          </div>
        </section>

        {/* Transportes */}
        <section>
          <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Bus size={16} /> Transporte
          </h2>
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="font-bold">Circular (Intercampi)</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                Grátis
              </span>
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <p>
                Saída Terminal:{" "}
                <span className="text-white">07:10, 12:30, 18:40</span>
              </p>
              <p>
                Saída Campus Med:{" "}
                <span className="text-white">11:50, 17:50, 22:10</span>
              </p>
            </div>
            <LinkButton
              texto="Ver itinerário completo no Maps"
              url="#"
              pequeno
            />
          </div>
        </section>

        {/* Pontos Turísticos */}
        <section>
          <h2 className="text-sm font-bold text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Landmark size={16} /> Pontos Turísticos
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <CardTurismo
              nome="Praia Martim de Sá"
              desc="O point da galera"
              img="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"
            />
            <CardTurismo
              nome="Pedra da Freira"
              desc="Pôr do sol top"
              img="https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80"
            />
          </div>
        </section>

        {/* Contatos de Emergência */}
        <section>
          <h2 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Phone size={16} /> Emergência
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-900/10 border border-red-900/30 p-3 rounded-xl text-center">
              <span className="block text-red-500 font-black text-xl">192</span>
              <span className="text-[10px] text-red-300 uppercase">SAMU</span>
            </div>
            <div className="bg-red-900/10 border border-red-900/30 p-3 rounded-xl text-center">
              <span className="block text-red-500 font-black text-xl">190</span>
              <span className="text-[10px] text-red-300 uppercase">
                Polícia
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

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
      className={`flex justify-between items-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition rounded-xl ${
        pequeno ? "p-2 text-xs" : "p-4"
      }`}
    >
      <span className={pequeno ? "font-medium" : "font-bold"}>{texto}</span>
      <ExternalLink size={pequeno ? 14 : 18} className="text-zinc-500" />
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
    <div className="relative h-24 rounded-xl overflow-hidden group">
      <img
        src={img}
        className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute bottom-2 left-2">
        <span className="block text-white font-bold text-xs">{nome}</span>
        <span className="block text-zinc-300 text-[9px]">{desc}</span>
      </div>
    </div>
  );
}
