"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getTurmaImage } from "../../constants/turmaImages";

const TURMAS = [
  { id: "T1", slug: "t1", nome: "Turma I", mascote: "Jacare" },
  { id: "T2", slug: "t2", nome: "Turma II", mascote: "Cavalo Marinho" },
  { id: "T3", slug: "t3", nome: "Turma III", mascote: "Tartaruga" },
  { id: "T4", slug: "t4", nome: "Turma IV", mascote: "Baleia" },
  { id: "T5", slug: "t5", nome: "Turma V", mascote: "Pinguim" },
  { id: "T6", slug: "t6", nome: "Turma VI", mascote: "Lagosta" },
  { id: "T7", slug: "t7", nome: "Turma VII", mascote: "Urso Polar" },
  { id: "T8", slug: "t8", nome: "Turma VIII", mascote: "Calouros" },
] as const;

export default function AlbumTurmasPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition"
          >
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Album da Galera</h1>
            <p className="text-[11px] text-zinc-500 font-bold">
              Escolha a turma para abrir somente o que voce precisa
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TURMAS.map((turma, index) => (
            <Link
              key={turma.id}
              href={`/album/${turma.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-emerald-500/40 transition"
            >
              <div className="relative h-44 w-full">
                <Image
                  src={getTurmaImage(turma.id)}
                  alt={turma.nome}
                  fill
                  priority={index < 2}
                  className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">{turma.id}</p>
                    <h2 className="text-sm font-black uppercase">{turma.nome}</h2>
                    <p className="text-xs text-zinc-400 mt-1">{turma.mascote}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full border border-zinc-700 bg-zinc-950 flex items-center justify-center text-zinc-300 group-hover:text-emerald-400 group-hover:border-emerald-500/40 transition">
                    <ChevronRight size={16} />
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
