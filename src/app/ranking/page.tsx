"use client";

import React, { useState } from "react";
import { ArrowLeft, Trophy, Users, User, Medal, Crown } from "lucide-react";
import Link from "next/link";

// Dados Mockados - Individual (Adicionei mais alguns para ter dados nas turmas)
export const RANKING_INDIVIDUAL = [
  {
    id: 1,
    nome: "Julia Felinto",
    pontos: 1250,
    avatar: "https://i.pravatar.cc/150?u=julia",
    turma: "T5",
  },
  {
    id: 2,
    nome: "Matheus Negreiros",
    pontos: 1180,
    avatar: "https://i.pravatar.cc/150?u=matheus",
    turma: "T3",
  },
  {
    id: 3,
    nome: "Maria Gabriela",
    pontos: 1100,
    avatar: "https://i.pravatar.cc/150?u=maria",
    turma: "T5",
  },
  {
    id: 4,
    nome: "João Silva",
    pontos: 950,
    avatar: "https://i.pravatar.cc/150?u=joao",
    turma: "T1",
  },
  {
    id: 5,
    nome: "Ana Clara",
    pontos: 920,
    avatar: "https://i.pravatar.cc/150?u=ana",
    turma: "T7",
  },
  {
    id: 6,
    nome: "Pedro Costa",
    pontos: 880,
    avatar: "https://i.pravatar.cc/150?u=pedro",
    turma: "T2",
  },
  {
    id: 7,
    nome: "Lucas Almeida",
    pontos: 850,
    avatar: "https://i.pravatar.cc/150?u=lucas",
    turma: "T4",
  },
  {
    id: 8,
    nome: "Fernanda Lima",
    pontos: 800,
    avatar: "https://i.pravatar.cc/150?u=fernanda",
    turma: "T5",
  },
  {
    id: 9,
    nome: "Bruno Souza",
    pontos: 750,
    avatar: "https://i.pravatar.cc/150?u=bruno",
    turma: "T5",
  },
];

// Dados Mockados - Turmas
const RANKING_TURMAS = [
  {
    id: "T5",
    nome: "Turma V",
    pontos: 15400,
    membros: 42,
    logo: "/turma5.jpeg",
  },
  {
    id: "T3",
    nome: "Turma III",
    pontos: 12300,
    membros: 38,
    logo: "/turma3.jpeg",
  },
  {
    id: "T7",
    nome: "Turma VII",
    pontos: 11000,
    membros: 45,
    logo: "/turma7.jpeg",
  },
  {
    id: "T1",
    nome: "Turma I",
    pontos: 9800,
    membros: 30,
    logo: "/turma1.jpeg",
  },
];

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"individual" | "turma">(
    "individual"
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      {/* Header */}
      <header className="p-6 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/gym"
            className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-black text-xl italic uppercase tracking-tighter">
            Ranking Geral
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab("individual")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "individual"
                ? "bg-[#4ade80] text-black shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <User size={16} /> Individual
          </button>
          <button
            onClick={() => setActiveTab("turma")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              activeTab === "turma"
                ? "bg-[#4ade80] text-black shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            <Users size={16} /> Por Turma
          </button>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* PODIUM (Top 3) */}
        <div className="flex justify-center items-end gap-4 mb-8 pt-4">
          {/* 2º Lugar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Link
                href={
                  activeTab === "individual"
                    ? `/perfil/${RANKING_INDIVIDUAL[1].id}`
                    : `/ranking/${RANKING_TURMAS[1].id}`
                }
              >
                <img
                  src={
                    activeTab === "individual"
                      ? RANKING_INDIVIDUAL[1].avatar
                      : RANKING_TURMAS[1].logo
                  }
                  className="w-16 h-16 rounded-full border-4 border-zinc-700 object-cover cursor-pointer hover:scale-105 transition"
                  onError={(e) =>
                    (e.currentTarget.src = "https://github.com/shadcn.png")
                  }
                />
              </Link>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black">
                2º
              </div>
            </div>
            <p className="mt-4 text-xs font-bold text-zinc-300 w-20 text-center truncate">
              {activeTab === "individual"
                ? RANKING_INDIVIDUAL[1].nome
                : RANKING_TURMAS[1].nome}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold">
              {activeTab === "individual"
                ? RANKING_INDIVIDUAL[1].pontos
                : (RANKING_TURMAS[1].pontos / 1000).toFixed(1) + "k"}{" "}
              pts
            </p>
          </div>

          {/* 1º Lugar */}
          <div className="flex flex-col items-center -mt-8">
            <div className="relative">
              <Crown
                size={24}
                className="text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce"
                fill="currentColor"
              />
              <Link
                href={
                  activeTab === "individual"
                    ? `/perfil/${RANKING_INDIVIDUAL[0].id}`
                    : `/ranking/${RANKING_TURMAS[0].id}`
                }
              >
                <img
                  src={
                    activeTab === "individual"
                      ? RANKING_INDIVIDUAL[0].avatar
                      : RANKING_TURMAS[0].logo
                  }
                  className="w-24 h-24 rounded-full border-4 border-yellow-500 object-cover shadow-[0_0_30px_rgba(234,179,8,0.3)] cursor-pointer hover:scale-105 transition"
                  onError={(e) =>
                    (e.currentTarget.src = "https://github.com/shadcn.png")
                  }
                />
              </Link>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-0.5 rounded-full border-2 border-black">
                1º
              </div>
            </div>
            <p className="mt-5 text-sm font-black text-white w-28 text-center truncate">
              {activeTab === "individual"
                ? RANKING_INDIVIDUAL[0].nome
                : RANKING_TURMAS[0].nome}
            </p>
            <p className="text-xs text-yellow-500 font-bold">
              {activeTab === "individual"
                ? RANKING_INDIVIDUAL[0].pontos
                : (RANKING_TURMAS[0].pontos / 1000).toFixed(1) + "k"}{" "}
              pts
            </p>
          </div>

          {/* 3º Lugar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Link
                href={
                  activeTab === "individual"
                    ? `/perfil/${RANKING_INDIVIDUAL[2].id}`
                    : `/ranking/${RANKING_TURMAS[2].id}`
                }
              >
                <img
                  src={
                    activeTab === "individual"
                      ? RANKING_INDIVIDUAL[2].avatar
                      : RANKING_TURMAS[2].logo
                  }
                  className="w-16 h-16 rounded-full border-4 border-orange-700 object-cover cursor-pointer hover:scale-105 transition"
                  onError={(e) =>
                    (e.currentTarget.src = "https://github.com/shadcn.png")
                  }
                />
              </Link>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black">
                3º
              </div>
            </div>
            <p className="mt-4 text-xs font-bold text-zinc-300 w-20 text-center truncate">
              {activeTab === "individual"
                ? RANKING_INDIVIDUAL[2].nome
                : RANKING_TURMAS[2].nome}
            </p>
            <p className="text-[10px] text-zinc-500 font-bold">
              {activeTab === "individual"
                ? RANKING_INDIVIDUAL[2].pontos
                : (RANKING_TURMAS[2].pontos / 1000).toFixed(1) + "k"}{" "}
              pts
            </p>
          </div>
        </div>

        {/* LISTA RESTANTE */}
        <div className="space-y-2">
          {(activeTab === "individual" ? RANKING_INDIVIDUAL : RANKING_TURMAS)
            .slice(3)
            .map((item, index) => (
              <Link
                key={item.id}
                href={
                  activeTab === "individual"
                    ? `/perfil/${item.id}`
                    : `/ranking/${item.id}`
                }
                className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 hover:bg-zinc-800 transition active:scale-95"
              >
                <span className="text-sm font-black text-zinc-600 w-6 text-center">
                  {index + 4}º
                </span>
                <img
                  src={(item as any).avatar || (item as any).logo}
                  className="w-10 h-10 rounded-full object-cover bg-zinc-800"
                  onError={(e) =>
                    (e.currentTarget.src = "https://github.com/shadcn.png")
                  }
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{item.nome}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">
                    {activeTab === "individual"
                      ? `Turma ${(item as any).turma}`
                      : `${(item as any).membros} Membros`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-[#4ade80]">
                    {item.pontos}
                  </p>
                  <p className="text-[8px] text-zinc-600 font-bold uppercase">
                    PTS
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
