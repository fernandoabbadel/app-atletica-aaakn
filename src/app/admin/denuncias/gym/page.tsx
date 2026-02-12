"use client";

import Link from "next/link";
import { ArrowLeft, Dumbbell } from "lucide-react";

const MOCK_REPORTS = [
  { id: "gym-1", autor: "Atleta X", mensagem: "Fraude de check-in detectada.", status: "pendente" },
  { id: "gym-2", autor: "Atleta Y", mensagem: "Uso indevido de QR no treino.", status: "resolvida" },
];

export default function AdminDenunciasGymPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <Link href="/admin/denuncias" className="p-2 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800">
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Gym</h1>
            <p className="text-[11px] text-zinc-500 font-bold">Incidentes de treino e check-in</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-5xl mx-auto space-y-3">
        {MOCK_REPORTS.map((row) => (
          <article key={row.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold">{row.autor}</p>
              <span className={`text-[10px] uppercase font-bold ${row.status === "resolvida" ? "text-emerald-400" : "text-yellow-400"}`}>{row.status}</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2">{row.mensagem}</p>
          </article>
        ))}

        <div className="text-[11px] text-zinc-600 inline-flex items-center gap-2">
          <Dumbbell size={13} />
          Integracao completa depende das rotinas de denuncia do modulo gym.
        </div>
      </main>
    </div>
  );
}
