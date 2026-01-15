"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, User, Crown } from "lucide-react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

// Interface para o Usuário vindo do Firebase
interface RankingUser {
  id: string;
  nome: string;
  xp: number;
  foto: string;
  turma: string;
}

// Interface para a Turma Agregada
interface RankingTurma {
  id: string;
  nome: string;
  pontos: number;
  membros: number;
  logo: string;
}

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<"individual" | "turma">("individual");
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [turmas, setTurmas] = useState<RankingTurma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRanking() {
      try {
        // 🦈 Busca os top 50 usuários ordenados por XP
        const q = query(
          collection(db, "users"), 
          orderBy("xp", "desc"), 
          limit(50)
        );
        
        const snapshot = await getDocs(q);
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome || "Atleta Anônimo",
          xp: doc.data().xp || 0,
          foto: doc.data().foto || "https://github.com/shadcn.png",
          turma: doc.data().turma || "Geral"
        })) as RankingUser[];

        setUsers(usersData);

        // 🦈 Cálculo Dinâmico das Turmas (Agregação no Cliente)
        const turmasMap: Record<string, RankingTurma> = {};

        usersData.forEach(user => {
            const turmaKey = user.turma;
            if (!turmasMap[turmaKey]) {
                turmasMap[turmaKey] = {
                    id: turmaKey,
                    nome: `Turma ${turmaKey}`,
                    pontos: 0,
                    membros: 0,
                    logo: `/turma${turmaKey.replace(/\D/g, "")}.jpeg` // Tenta adivinhar a logo ex: T5 -> turma5.jpeg
                };
            }
            turmasMap[turmaKey].pontos += user.xp;
            turmasMap[turmaKey].membros += 1;
        });

        // Transforma o mapa em array e ordena por pontos
        const turmasSorted = Object.values(turmasMap).sort((a, b) => b.pontos - a.pontos);
        setTurmas(turmasSorted);

      } catch (error) {
        console.error("Erro ao carregar ranking:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRanking();
  }, []);

  // Seleciona a lista baseada na aba
  const dataList = activeTab === "individual" ? users : turmas;
  const top3 = dataList.slice(0, 3);
  const restList = dataList.slice(3);

  if (loading) {
      return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-bold animate-pulse">Calculando Ranking... 🦈</div>;
  }

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
        {dataList.length === 0 ? (
            <div className="text-center text-zinc-500 mt-10">Nenhum dado encontrado no ranking.</div>
        ) : (
            <>
                {/* PODIUM (Top 3) */}
                {top3.length >= 1 && (
                <div className="flex justify-center items-end gap-4 mb-8 pt-4">
                {/* 2º Lugar */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                    <Link href={activeTab === "individual" ? `/perfil/${top3[1]?.id}` : `/ranking/${top3[1]?.id}`}>
                        <img
                        src={activeTab === "individual" ? (top3[1] as RankingUser).foto : (top3[1] as RankingTurma).logo}
                        className="w-16 h-16 rounded-full border-4 border-zinc-700 object-cover cursor-pointer hover:scale-105 transition"
                        onError={(e) => (e.currentTarget.src = "https://github.com/shadcn.png")}
                        />
                    </Link>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black">2º</div>
                    </div>
                    <p className="mt-4 text-xs font-bold text-zinc-300 w-20 text-center truncate">{top3[1]?.nome}</p>
                    <p className="text-[10px] text-zinc-500 font-bold">
                        {activeTab === "individual" ? (top3[1] as RankingUser)?.xp : (top3[1] as RankingTurma)?.pontos} pts
                    </p>
                </div>

                {/* 1º Lugar */}
                <div className="flex flex-col items-center -mt-8">
                    <div className="relative">
                    <Crown size={24} className="text-yellow-500 absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce" fill="currentColor" />
                    <Link href={activeTab === "individual" ? `/perfil/${top3[0].id}` : `/ranking/${top3[0].id}`}>
                        <img
                        src={activeTab === "individual" ? (top3[0] as RankingUser).foto : (top3[0] as RankingTurma).logo}
                        className="w-24 h-24 rounded-full border-4 border-yellow-500 object-cover shadow-[0_0_30px_rgba(234,179,8,0.3)] cursor-pointer hover:scale-105 transition"
                        onError={(e) => (e.currentTarget.src = "https://github.com/shadcn.png")}
                        />
                    </Link>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-black px-3 py-0.5 rounded-full border-2 border-black">1º</div>
                    </div>
                    <p className="mt-5 text-sm font-black text-white w-28 text-center truncate">{top3[0].nome}</p>
                    <p className="text-xs text-yellow-500 font-bold">
                        {activeTab === "individual" ? (top3[0] as RankingUser).xp : (top3[0] as RankingTurma).pontos} pts
                    </p>
                </div>

                {/* 3º Lugar */}
                {top3[2] && (
                    <div className="flex flex-col items-center">
                    <div className="relative">
                        <Link href={activeTab === "individual" ? `/perfil/${top3[2].id}` : `/ranking/${top3[2].id}`}>
                        <img
                            src={activeTab === "individual" ? (top3[2] as RankingUser).foto : (top3[2] as RankingTurma).logo}
                            className="w-16 h-16 rounded-full border-4 border-orange-700 object-cover cursor-pointer hover:scale-105 transition"
                            onError={(e) => (e.currentTarget.src = "https://github.com/shadcn.png")}
                        />
                        </Link>
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-700 text-white text-[10px] font-black px-2 py-0.5 rounded-full border border-black">3º</div>
                    </div>
                    <p className="mt-4 text-xs font-bold text-zinc-300 w-20 text-center truncate">{top3[2].nome}</p>
                    <p className="text-[10px] text-zinc-500 font-bold">
                        {activeTab === "individual" ? (top3[2] as RankingUser).xp : (top3[2] as RankingTurma).pontos} pts
                    </p>
                    </div>
                )}
                </div>
                )}

                {/* LISTA RESTANTE */}
                <div className="space-y-2">
                {restList.map((item, index) => (
                    <Link
                    key={item.id}
                    href={activeTab === "individual" ? `/perfil/${item.id}` : `/ranking/${item.id}`}
                    className="flex items-center gap-4 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/50 hover:bg-zinc-800 transition active:scale-95"
                    >
                    <span className="text-sm font-black text-zinc-600 w-6 text-center">{index + 4}º</span>
                    <img
                        src={activeTab === "individual" ? (item as RankingUser).foto : (item as RankingTurma).logo}
                        className="w-10 h-10 rounded-full object-cover bg-zinc-800"
                        onError={(e) => (e.currentTarget.src = "https://github.com/shadcn.png")}
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
                        {activeTab === "individual" ? (item as RankingUser).xp : (item as RankingTurma).pontos}
                        </p>
                        <p className="text-[8px] text-zinc-600 font-bold uppercase">PTS</p>
                    </div>
                    </Link>
                ))}
                </div>
            </>
        )}
      </main>
    </div>
  );
}