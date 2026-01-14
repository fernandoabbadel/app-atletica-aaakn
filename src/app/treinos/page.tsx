"use client";

import React, { useState } from "react";
import {
  ArrowLeft, MapPin, Clock, CalendarCheck, ChevronLeft, ChevronRight, Users,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";

// --- DADOS MOCKADOS (Sincronizados com o Admin) ---
const TREINOS_DATA = [
  {
    id: 1,
    esporte: "Futsal",
    categoria: "Masculino",
    dia: "Segunda",
    dia_num: 12,
    mes: "OUT",
    horario: "22:00",
    local: "Ginásio Municipal",
    responsavel: "Dudu",
    img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80",
    cor: "bg-emerald-600",
    confirmados: 18,
    meta: 24,
    turmas_destaque: [
      { turma: "T5", count: 8, color: "bg-emerald-500" },
      { turma: "T1", count: 5, color: "bg-yellow-500" },
    ],
  },
  {
    id: 2,
    esporte: "Vôlei",
    categoria: "Misto",
    dia: "Terça",
    dia_num: 13,
    mes: "OUT",
    horario: "19:00",
    local: "Quadra da Orla",
    responsavel: "Bia",
    img: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
    cor: "bg-purple-600",
    confirmados: 24,
    meta: 30,
    turmas_destaque: [
      { turma: "T3", count: 10, color: "bg-purple-500" },
      { turma: "T5", count: 6, color: "bg-emerald-500" },
    ],
  },
];

// Gerador de Dias do Mês (Simulado)
const DAYS_IN_MONTH = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const hasTraining = [2, 5, 9, 12, 13, 16, 19, 23, 26, 30].includes(day);
  return {
    day,
    hasTraining,
    trainings: hasTraining
      ? ["bg-emerald-500", day % 2 === 0 ? "bg-purple-500" : null].filter(Boolean)
      : [],
  };
});

export default function TreinosPage() {
  const [selectedDay, setSelectedDay] = useState(12);

  const treinosFiltrados = TREINOS_DATA.filter(
    (t) => t.dia_num === selectedDay || t.dia_num > selectedDay
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-lg uppercase tracking-widest text-white">
          Agenda Outubro
        </h1>
        <div className="w-8"></div>
      </header>

      {/* CALENDÁRIO MENSAL */}
      <div className="p-4 border-b border-white/5 bg-zinc-900/30">
        <div className="flex justify-between items-center mb-4">
          <button className="text-zinc-400 hover:text-white"><ChevronLeft /></button>
          <span className="text-sm font-bold uppercase tracking-widest">Outubro 2026</span>
          <button className="text-zinc-400 hover:text-white"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-zinc-600 mb-2">{d}</span>
          ))}

          {DAYS_IN_MONTH.map((d) => {
            const isSelected = selectedDay === d.day;
            return (
              <button
                key={d.day}
                onClick={() => setSelectedDay(d.day)}
                className={`relative w-10 h-10 mx-auto flex flex-col items-center justify-center rounded-full transition-all group ${
                  isSelected ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/50 scale-110 z-10" : "bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800"
                }`}
              >
                <span className="text-xs font-bold">{d.day}</span>
                {/* Bolinhas de Treino */}
                <div className="flex gap-0.5 mt-0.5 absolute bottom-1.5">
                  {d.trainings.map((cor:any, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${cor}`}></div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <main className="p-4 space-y-6">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
          Treinos a partir do dia {selectedDay}
        </h2>

        <div className="grid gap-6">
          {treinosFiltrados.map((treino) => (
            <Link
              key={treino.id}
              href={`/treinos/${treino.id}`}
              className="group relative w-full aspect-[16/9] block rounded-3xl overflow-hidden border border-white/5 cursor-pointer shadow-lg hover:border-white/20 transition-all active:scale-95"
            >
              {/* IMAGEM E GRADIENTE */}
              <div className="absolute inset-0 h-full w-full">
                <img src={treino.img} alt={treino.esporte} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent"></div>
              </div>

              {/* BADGES NO TOPO */}
              <div className="absolute top-3 left-3 flex gap-2">
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${treino.cor} shadow-lg`}>
                  {treino.categoria}
                </div>
                <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-bold uppercase text-white border border-white/10 flex items-center gap-1">
                  <CalendarCheck size={10} /> {treino.dia_num} {treino.mes}
                </div>
              </div>

              {/* CONTEÚDO INFERIOR */}
              <div className="absolute bottom-0 left-0 w-full p-5">
                <div className="flex items-center justify-end gap-1 mb-2">
                  {treino.turmas_destaque.map((t, idx) => (
                    <div key={idx} className={`${t.color} text-black text-[8px] font-black w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-black/50 -ml-2 first:ml-0 z-10`}>
                      {t.turma}
                    </div>
                  ))}
                </div>

                <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2 drop-shadow-md">
                  {treino.esporte}
                </h3>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[8px] font-bold text-zinc-300 uppercase">
                    <span>Lotação</span>
                    <span>{treino.confirmados}/{treino.meta}</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full ${treino.cor} shadow-[0_0_10px_currentColor]`} style={{ width: `${Math.min((treino.confirmados / treino.meta) * 100, 100)}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-1.5 text-zinc-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                      <Clock size={12} className="text-emerald-500" /> {treino.horario}
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                      <MapPin size={12} className="text-emerald-500" /> {treino.local}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((_, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[8px] text-zinc-500">
                          <Users size={10} />
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-bold">+{treino.confirmados - 3}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}