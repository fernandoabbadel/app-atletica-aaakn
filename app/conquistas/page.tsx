"use client";

import React from "react";
import {
  ArrowLeft,
  Trophy,
  Lock,
  Zap,
  Award,
  Calendar,
  Beer,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

export default function ConquistasPage() {
  // DADOS MOCKADOS
  const stats = {
    total: 24,
    desbloqueadas: 11,
    nivel: "Tubarão Rei",
    xp: 2450,
  };

  const conquistas = [
    {
      id: 1,
      titulo: "Primeiro Mergulho",
      desc: "Completou o cadastro no app",
      icone: <Award size={24} />,
      desbloqueada: true,
      cor: "bg-blue-500",
    },
    {
      id: 2,
      titulo: "Gym Rat I",
      desc: "5 treinos na mesma semana",
      icone: <Zap size={24} />,
      desbloqueada: true,
      cor: "bg-emerald-500",
    },
    {
      id: 3,
      titulo: "Inimigo do Fim",
      desc: "Check-in em 3 festas seguidas",
      icone: <Beer size={24} />,
      desbloqueada: true,
      cor: "bg-purple-500",
    },
    {
      id: 4,
      titulo: "Nerd da Turma",
      desc: "Compareceu a 1 evento acadêmico",
      icone: <BookOpen size={24} />,
      desbloqueada: false,
      cor: "bg-zinc-700",
      progresso: "0/1",
    },
    {
      id: 5,
      titulo: "Sócio Torcedor",
      desc: "Foi a um jogo do campeonato",
      icone: <Trophy size={24} />,
      desbloqueada: true,
      cor: "bg-yellow-500",
    },
    {
      id: 6,
      titulo: "Lenda Viva",
      desc: "Alcançou o nível 10",
      icone: <Trophy size={24} />,
      desbloqueada: false,
      cor: "bg-zinc-700",
      progresso: "Nível 2/10",
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
        <h1 className="font-bold text-lg">Minhas Conquistas</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* RESUMO GERAL */}
        <section className="bg-gradient-to-br from-zinc-900 to-black p-6 rounded-3xl border border-zinc-800 text-center relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-emerald-500/30">
              <Trophy size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-white italic uppercase">
              {stats.nivel}
            </h2>
            <p className="text-zinc-400 text-xs mt-1 mb-4">
              {stats.desbloqueadas} de {stats.total} medalhas conquistadas
            </p>

            {/* Barra de Progresso Geral */}
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${(stats.desbloqueadas / stats.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Efeito de Fundo */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        </section>

        {/* GRID DE CONQUISTAS */}
        <section className="grid grid-cols-2 gap-3">
          {conquistas.map((conquista) => (
            <div
              key={conquista.id}
              className={`p-4 rounded-2xl border flex flex-col items-center text-center gap-3 transition ${
                conquista.desbloqueada
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-zinc-950 border-zinc-900 opacity-60 grayscale"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                  conquista.desbloqueada
                    ? conquista.cor
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {conquista.desbloqueada ? conquista.icone : <Lock size={20} />}
              </div>

              <div>
                <h3 className="font-bold text-sm text-white leading-tight mb-1">
                  {conquista.titulo}
                </h3>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  {conquista.desc}
                </p>
              </div>

              {!conquista.desbloqueada && conquista.progresso && (
                <div className="w-full mt-1">
                  <span className="text-[9px] text-zinc-500 font-bold mb-1 block">
                    {conquista.progresso}
                  </span>
                  <div className="w-full bg-zinc-800 h-1 rounded-full">
                    <div className="bg-zinc-600 h-full rounded-full w-1/3"></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
