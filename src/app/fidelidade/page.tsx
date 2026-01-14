"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Gift,
  Info,
  Lock,
  Star,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";

export default function FidelidadePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"cartao" | "regras">("cartao");

  if (!user)
    return (
      <div className="text-white p-10 text-center">
        Carregando perfil do tubarão...
      </div>
    );

  // --- CONFIGURAÇÃO (VIRIA DO BACKEND DO ADMIN) ---
  const XP_POR_SELO = 100; // Valor configurável no Admin
  const TOTAL_SELOS = 10;

  // Cálculo de Progresso
  const selosConquistados = Math.min(
    Math.floor(user.xp / XP_POR_SELO),
    TOTAL_SELOS
  );
  const progresso = (selosConquistados / TOTAL_SELOS) * 100;
  const xpProximoSelo = (selosConquistados + 1) * XP_POR_SELO - user.xp;

  // Prêmios Mockados (Refletindo o Admin)
  const premios = [
    {
      id: 1,
      nome: "Copo 850ml + Tirante",
      custo: 1000,
      img: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800",
    },
    {
      id: 2,
      nome: "Boné Aba Reta AAAKN",
      custo: 2000,
      img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
    },
    {
      id: 3,
      nome: "Entrada VIP Intermed",
      custo: 5000,
      img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    },
  ];

  // Histórico Mockado
  const historico = [
    {
      id: 1,
      acao: "Check-in Gym Rats",
      data: "Hoje, 09:30",
      xp: 50,
      tipo: "treino",
    },
    {
      id: 2,
      acao: "Check-in Gym Rats",
      data: "Ontem, 18:45",
      xp: 50,
      tipo: "treino",
    },
    {
      id: 3,
      acao: "Compra Loja (Camiseta)",
      data: "05 jan, 14:20",
      xp: 200,
      tipo: "compra",
    },
    {
      id: 4,
      acao: "Check-in Gym Rats",
      data: "04 jan, 07:15",
      xp: 50,
      tipo: "treino",
    },
  ];

  const handleResgatar = (premioNome: string) => {
    addToast(
      `Pedido de resgate para ${premioNome} enviado! Vá à lojinha.`,
      "success"
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans selection:bg-emerald-500/30">
      {/* HEADER GLASS */}
      <header className="p-4 sticky top-0 z-30 flex items-center gap-4 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-lg">
        <Link
          href="/menu"
          className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="flex-1">
          <h1 className="font-black text-lg italic uppercase tracking-tighter text-white leading-none">
            Shark Card
          </h1>
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
            Programa de Fidelidade
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-2 shadow-inner">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white">{user.xp} XP</span>
        </div>
      </header>

      <main className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* CONTROLES DE ABA */}
        <div className="bg-zinc-900/80 p-1 rounded-xl flex border border-zinc-800 shadow-sm">
          <button
            onClick={() => setActiveTab("cartao")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "cartao"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Meu Cartão
          </button>
          <button
            onClick={() => setActiveTab("regras")}
            className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
              activeTab === "regras"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-zinc-500 hover:text-white"
            }`}
          >
            Prêmios & Regras
          </button>
        </div>

        {activeTab === "cartao" ? (
          <div className="space-y-6">
            {/* CARTÃO DIGITAL (Visual Premium) */}
            <div className="relative w-full max-w-sm mx-auto aspect-[1.58/1] rounded-3xl overflow-hidden shadow-2xl transition-transform hover:scale-[1.01] duration-500 group border border-white/10 ring-1 ring-emerald-500/20">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-[#064e3b] z-0"></div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-0"></div>

              <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo.png"
                      className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                      alt="Logo"
                    />
                    <div>
                      <h2 className="text-base font-black italic uppercase tracking-tighter text-white leading-none">
                        Shark Card
                      </h2>
                      <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">
                        Membro Oficial
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                      {user.nome.split(" ")[0]}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-mono tracking-widest">
                      ID: {user.matricula || "0000"}
                    </p>
                  </div>
                </div>

                {/* GRID DE SELOS */}
                <div className="flex-1 flex items-center justify-center py-2">
                  <div className="grid grid-cols-5 gap-3 w-full max-w-[260px]">
                    {Array.from({ length: TOTAL_SELOS }).map((_, i) => {
                      const conquistado = i < selosConquistados;
                      return (
                        <div
                          key={i}
                          className="aspect-square relative flex items-center justify-center"
                        >
                          <div
                            className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-500 border ${
                              conquistado
                                ? "bg-emerald-500 border-emerald-400 shadow-[0_0_15px_#10b981]"
                                : "bg-black/40 border-dashed border-zinc-700"
                            }`}
                          >
                            {conquistado ? (
                              <img
                                src="/logo.png"
                                className="w-[65%] h-[65%] object-contain mix-blend-multiply opacity-80 filter brightness-0"
                              />
                            ) : (
                              <span className="text-[8px] font-black text-white/10">
                                {i + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                    <span>Progresso</span>
                    <span
                      className={
                        selosConquistados === TOTAL_SELOS
                          ? "text-yellow-400 animate-pulse"
                          : "text-emerald-400"
                      }
                    >
                      {selosConquistados === TOTAL_SELOS
                        ? "COMPLETO!"
                        : `${
                            xpProximoSelo > 0
                              ? `Faltam ${xpProximoSelo} XP`
                              : "Resgate disponível!"
                          }`}
                    </span>
                  </div>
                  <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-700 to-emerald-400 shadow-[0_0_10px_#10b981] transition-all duration-1000 ease-out"
                      style={{ width: `${progresso}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* HISTÓRICO DE SELOS */}
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-emerald-500" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                    Extrato de Selos
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-500">
                  Últimos 30 dias
                </span>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                {historico.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/5 ${
                          item.tipo === "treino"
                            ? "bg-emerald-900/20 text-emerald-500"
                            : item.tipo === "compra"
                            ? "bg-purple-900/20 text-purple-500"
                            : "bg-yellow-900/20 text-yellow-500"
                        }`}
                      >
                        {item.tipo === "treino" ? (
                          <CheckCircle2 size={18} />
                        ) : item.tipo === "compra" ? (
                          <Gift size={18} />
                        ) : (
                          <Star size={18} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-200">
                          {item.acao}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">
                          {item.data}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 bg-emerald-900/20 px-2 py-1 rounded">
                      +{item.xp} XP
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-6">
            {/* CARD COMO FUNCIONA (DINÂMICO) */}
            <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 border border-emerald-500/20">
                  <Info size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase">
                    Regras do Jogo
                  </h3>
                  <p className="text-[10px] text-zinc-500">
                    Entenda como turbinar seu card
                  </p>
                </div>
              </div>
              <ul className="space-y-3 pl-2">
                <RegraItem
                  texto={`A cada ${XP_POR_SELO} XP acumulados, você ganha 1 Selo do Tubarão automaticamente.`}
                />
                <RegraItem texto="Acumule 10 Selos para desbloquear o nível de resgate de prêmios exclusivos." />
                <RegraItem texto="XP pode ser ganho em treinos (Gym Rats), presença em eventos ou compras na lojinha." />
              </ul>
            </section>

            {/* LISTA DE PRÊMIOS */}
            <section>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 px-1 flex items-center gap-2">
                <Gift size={14} /> Vitrine de Recompensas
              </h3>
              <div className="space-y-4">
                {premios.map((premio) => {
                  const bloqueado = user.xp < premio.custo;
                  const progressoItem = Math.min(
                    (user.xp / premio.custo) * 100,
                    100
                  );

                  return (
                    <div
                      key={premio.id}
                      className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-4 items-center group relative overflow-hidden"
                    >
                      {/* Barra de progresso de fundo sutil */}
                      <div
                        className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-1000"
                        style={{
                          width: `${progressoItem}%`,
                          opacity: bloqueado ? 0.2 : 1,
                        }}
                      ></div>

                      <div
                        className={`w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 shrink-0 ${
                          bloqueado
                            ? "grayscale opacity-60"
                            : "border-emerald-500/50 shadow-lg shadow-emerald-900/20"
                        }`}
                      >
                        <img
                          src={premio.img}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <h4
                          className={`font-bold text-sm ${
                            bloqueado ? "text-zinc-400" : "text-white"
                          }`}
                        >
                          {premio.nome}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              bloqueado
                                ? "bg-zinc-800 text-zinc-500"
                                : "bg-emerald-900/30 text-emerald-400"
                            }`}
                          >
                            {premio.custo} XP
                          </span>
                          {bloqueado && (
                            <span className="text-[9px] text-zinc-600">
                              Faltam {premio.custo - user.xp} XP
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleResgatar(premio.nome)}
                        disabled={bloqueado}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          bloqueado
                            ? "bg-zinc-800 text-zinc-600 border border-zinc-700"
                            : "bg-emerald-600 text-white hover:scale-110 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400"
                        }`}
                      >
                        {bloqueado ? (
                          <Lock size={18} />
                        ) : (
                          <Gift size={20} className="animate-bounce-slow" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function RegraItem({ texto }: { texto: string }) {
  return (
    <li className="flex items-start gap-3 text-xs text-zinc-300 font-medium leading-relaxed group">
      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5 shrink-0 group-hover:bg-emerald-400 group-hover:shadow-[0_0_8px_#10b981] transition"></div>
      {texto}
    </li>
  );
}
