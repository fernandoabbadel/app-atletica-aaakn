"use client";

import React from "react";
import {
  ArrowLeft,
  CreditCard,
  Crown,
  ChevronRight,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
export default function CarteirinhaPage() {
  const { user } = useAuth(); // PUXANDO DADOS REAIS

  // Se não tiver usuário carregado, não mostra nada (proteção)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-emerald-500">
          <CreditCard size={16} /> Identidade Digital
        </h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden space-y-8">
        {/* Luz de fundo ambiente */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* --- CARTÃO DIGITAL --- */}
        <div className="relative w-full max-w-[380px] aspect-[1.58/1] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)] border border-zinc-800 bg-[#0a0a0a]">
          {/* === CAMADA DE FUNDO === */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-zinc-900">
              {/* LÓGICA DE FOTO DA TURMA: Pega o numero da turma do usuário */}
              <img
                src={`/turma${user.turma.replace(/\D/g, "")}.jpeg`}
                alt="Background Turma"
                className="w-full h-full object-cover opacity-40 mix-blend-luminosity brightness-75 blur-[1px] scale-110"
                onError={(e) => (e.currentTarget.src = "/carteirinha-bg.jpg")}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-[#0a2e23]/80 to-black/90 mix-blend-multiply"></div>
            <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>

          {/* CONTEÚDO PRINCIPAL */}
          <div className="relative h-full p-4 flex flex-col justify-between z-10">
            {/* 1. CABEÇALHO DO CARTÃO */}
            <div className="flex justify-between items-start border-b border-white/10 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg border border-zinc-700 p-1">
                  <img
                    src="/logo.png"
                    alt="Logo AAAKN"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="drop-shadow-md">
                  <h2 className="font-black text-white text-base leading-none tracking-tight">
                    AAAKN
                  </h2>
                  <p className="text-emerald-400 text-[8px] uppercase tracking-widest font-bold mt-0.5">
                    Medicina Caraguá
                  </p>
                </div>
              </div>

              {/* Badge Status + Plano (Vindo do Contexto) */}
              <div className="flex flex-col items-end gap-1">
                <div className="bg-black/40 backdrop-blur-md text-emerald-400 text-[9px] font-black px-3 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  ATIVO
                </div>
                <div className="text-[8px] font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                  <Crown size={8} /> {user.plano_badge}
                </div>
              </div>
            </div>

            {/* 2. CORPO (Foto + Dados Dinâmicos) */}
            <div className="flex gap-3 items-center mt-1 flex-1">
              <div className="w-20 h-24 flex-shrink-0 rounded-xl border border-emerald-500/50 p-0.5 bg-black/60 shadow-2xl relative overflow-hidden group">
                <img
                  src={user.foto}
                  className="w-full h-full object-cover rounded-lg opacity-95"
                  alt="Foto do Sócio"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
              </div>

              <div className="flex-1 space-y-1.5 drop-shadow-lg">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 text-shadow">
                    Nome do Atleta
                  </p>
                  <h3 className="text-white font-black text-sm leading-tight line-clamp-2 uppercase">
                    {user.nome}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 text-shadow">
                      Curso
                    </p>
                    <p className="text-xs text-zinc-100 font-bold">MEDICINA</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-emerald-500 uppercase font-bold tracking-wider mb-0.5 text-shadow">
                      Turma
                    </p>
                    <p className="text-xs text-emerald-400 font-black">
                      {user.turma}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. RODAPÉ (QR Code Dinâmico com Matrícula) */}
            <div className="flex justify-between items-end mt-1 pt-2 border-t border-white/10">
              <div className="space-y-2 drop-shadow-md">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 leading-none text-shadow">
                    Matrícula
                  </p>
                  <p className="text-xs text-white font-mono tracking-tight leading-none">
                    {user.matricula}
                  </p>
                </div>

                <div>
                  <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 leading-none text-shadow">
                    Validade
                  </p>
                  <p className="text-xs text-white font-mono leading-none">
                    DEZ/2026
                  </p>
                </div>
              </div>

              <div className="bg-white p-1 rounded-md shadow-xl flex-shrink-0 ml-2">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${user.matricula}`}
                  className="w-12 h-12 mix-blend-multiply"
                  alt="QR Code"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- AÇÕES --- */}
        <div className="w-full max-w-[380px] space-y-3">
          <Link
            href="/planos"
            className="block w-full bg-gradient-to-r from-amber-600 to-amber-800 p-4 rounded-xl border border-amber-500/30 group relative overflow-hidden shadow-lg transform active:scale-95 transition"
          >
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-black/30 p-2 rounded-full text-amber-200">
                  <Crown size={20} />
                </div>
                <div>
                  <span className="block text-xs font-bold text-amber-200 uppercase tracking-wider">
                    Plano {user.plano_badge}
                  </span>
                  <span className="block text-sm font-black text-white">
                    Fazer Upgrade
                  </span>
                </div>
              </div>
              <ChevronRight className="text-amber-200 group-hover:translate-x-1 transition" />
            </div>
          </Link>

          <div className="bg-zinc-900 text-zinc-400 w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-zinc-800">
            <QrCode size={16} /> Apresente este QR Code na entrada
          </div>

          <p className="text-emerald-700/60 text-[10px] flex items-center justify-center gap-1 uppercase font-bold tracking-widest mt-2">
            <ShieldCheck size={12} /> Documento Oficial Validado
          </p>
        </div>
      </main>
    </div>
  );
}
