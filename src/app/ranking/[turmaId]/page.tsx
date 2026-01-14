"use client";

import React, { use } from "react";
import { ArrowLeft, Users, Trophy } from "lucide-react";
import Link from "next/link";

// REUTILIZANDO DADOS MOCKADOS (Em um app real, isso viria de um Contexto ou API)
const RANKING_INDIVIDUAL = [
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

export default function TurmaRankingPage({
  params,
}: {
  params: Promise<{ turmaId: string }>;
}) {
  const { turmaId } = use(params);

  // Filtrar alunos desta turma e ordenar por pontos
  const alunosDaTurma = RANKING_INDIVIDUAL.filter(
    (aluno) => aluno.turma === turmaId
  ).sort((a, b) => b.pontos - a.pontos);

  // Calcular total de pontos da turma
  const totalPontos = alunosDaTurma.reduce((acc, curr) => acc + curr.pontos, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      {/* Header */}
      <header className="p-6 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <div className="flex items-center gap-4">
          <Link
            href="/ranking"
            className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-black text-xl italic uppercase tracking-tighter">
            Ranking {turmaId}
          </h1>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Banner da Turma */}
        <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4ade80]/5 to-transparent"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto bg-white rounded-full p-1 mb-3">
              <img
                src={`/turma${turmaId.replace(/\D/g, "")}.jpeg`}
                className="w-full h-full rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = "/logo.png")}
              />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
              Turma {turmaId}
            </h2>
            <div className="flex justify-center gap-4 mt-4 text-xs font-bold uppercase tracking-widest text-zinc-500">
              <span className="flex items-center gap-1">
                <Users size={14} /> {alunosDaTurma.length} Alunos
              </span>
              <span className="flex items-center gap-1">
                <Trophy size={14} className="text-[#4ade80]" /> {totalPontos}{" "}
                Pts
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Alunos */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
            Classificação Interna
          </h3>

          {alunosDaTurma.length > 0 ? (
            alunosDaTurma.map((item, index) => (
              <Link
                key={item.id}
                href={`/perfil/${item.id}`}
                className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 hover:bg-zinc-800 transition active:scale-95"
              >
                <span
                  className={`text-sm font-black w-6 text-center ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-zinc-300"
                      : index === 2
                      ? "text-orange-700"
                      : "text-zinc-600"
                  }`}
                >
                  {index + 1}º
                </span>
                <img
                  src={item.avatar}
                  className={`w-10 h-10 rounded-full object-cover bg-zinc-800 ${
                    index === 0 ? "border-2 border-yellow-500" : ""
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{item.nome}</p>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">
                    Sócio Atleta
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
            ))
          ) : (
            <div className="text-center py-10 text-zinc-500 text-sm">
              Nenhum aluno dessa turma pontuou ainda.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
