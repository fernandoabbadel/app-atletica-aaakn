"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Check,
  X,
  Crown,
  Star,
  Zap,
  Beer,
  Dumbbell,
  Ticket,
} from "lucide-react";
import Link from "next/link";

export default function PlanosPage() {
  const [ciclo, setCiclo] = useState<"mensal" | "semestral">("mensal");

  const planos = [
    {
      nome: "Plano Cação",
      preco: ciclo === "mensal" ? "R$ 14,90" : "R$ 79,90",
      desc: "Para quem tá chegando agora no mar.",
      cor: "blue",
      icone: <Star size={24} />,
      beneficios: [
        "Carteirinha Digital",
        "Acesso à Lojinha",
        "Descontos em parceiros básicos",
        "Participação em sorteios simples",
      ],
      naoInclui: [
        "Treinos Esportivos",
        "Desconto em Festas",
        "Kits Exclusivos",
      ],
    },
    {
      nome: "Tubarão Martelo",
      preco: ciclo === "mensal" ? "R$ 29,90" : "R$ 159,90",
      desc: "Focado em quem defende a atlética em quadra.",
      cor: "orange",
      destaque: "ESPORTES",
      icone: <Dumbbell size={24} />,
      beneficios: [
        "Tudo do Plano Cação",
        "Acesso liberado aos treinos",
        "Prioridade em campeonatos",
        "Desconto em Fisioterapia",
        "Isenção de taxa de seletiva",
      ],
      naoInclui: ["Desconto em Festas", "Kit Sócio"],
    },
    {
      nome: "Tubarão Titular",
      preco: ciclo === "mensal" ? "R$ 39,90" : "R$ 199,90",
      desc: "O plano padrão para o torcedor fiel.",
      cor: "emerald",
      icone: <Zap size={24} />,
      popular: true,
      beneficios: [
        "Carteirinha Digital & Física",
        "10% OFF na Lojinha",
        "15% OFF em Festas Oficiais",
        "Direito a voto em assembleias",
        "Acesso à arquibancada premium",
      ],
      naoInclui: ["Kit Sócio Rei", "Open Bar estendido"],
    },
    {
      nome: "Lenda do Bar",
      preco: ciclo === "mensal" ? "R$ 49,90" : "R$ 249,90",
      desc: "Para quem não perde um gole.",
      cor: "purple",
      icone: <Beer size={24} />,
      beneficios: [
        "Carteirinha + Tirante exclusivo",
        "Fura-fila no Bar das festas",
        "Welcome Shot em eventos oficiais",
        "Copo exclusivo da gestão",
        "Desconto em cervejadas (20%)",
      ],
      naoInclui: ["Acesso a treinos"],
    },
    {
      nome: "Lenda dos Eventos",
      preco: ciclo === "mensal" ? "R$ 59,90" : "R$ 299,90",
      desc: "VIP é pouco pra você.",
      cor: "pink",
      icone: <Ticket size={24} />,
      beneficios: [
        "Garantia de Lote Promocional (Sempre)",
        "Entrada VIP (sem fila) nas festas",
        "Acesso ao Backstage/Camarote",
        "Meet & Greet com atrações",
        "10% OFF em ingressos para amigos",
      ],
      naoInclui: ["Acesso a treinos"],
    },
    {
      nome: "Tubarão Rei",
      preco: ciclo === "mensal" ? "R$ 99,90" : "R$ 499,90",
      desc: "A hierarquia máxima. Domine o oceano.",
      cor: "yellow",
      icone: <Crown size={24} />,
      beneficios: [
        "Acesso TOTAL (Treinos + Festas)",
        "Kit Sócio Rei (Moletom + Boné + Caneca)",
        "1 Festa Open Bar grátis/ano",
        "Personal Shopper na Lojinha",
        "Nome gravado no mural da sede",
        "30% OFF em qualquer produto",
      ],
      naoInclui: [], // Tem tudo
    },
  ];

  // Função auxiliar para cores
  const getColorClasses = (cor: string) => {
    const map: any = {
      blue: "text-blue-400 border-blue-500/20 bg-blue-500/10",
      orange: "text-orange-400 border-orange-500/20 bg-orange-500/10",
      emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/10",
      purple: "text-purple-400 border-purple-500/20 bg-purple-500/10",
      pink: "text-pink-400 border-pink-500/20 bg-pink-500/10",
      yellow: "text-yellow-400 border-yellow-500/50 bg-yellow-500/10",
    };
    return map[cor] || map.emerald;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/carteirinha"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">Seja Sócio</h1>
      </header>

      <main className="p-4 space-y-8">
        {/* Toggle Mensal/Semestral */}
        <div className="flex justify-center">
          <div className="bg-zinc-900 p-1 rounded-xl flex border border-zinc-800 relative">
            <button
              onClick={() => setCiclo("mensal")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                ciclo === "mensal"
                  ? "bg-zinc-800 text-white shadow"
                  : "text-zinc-500"
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setCiclo("semestral")}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                ciclo === "semestral"
                  ? "bg-emerald-600 text-white shadow"
                  : "text-zinc-500"
              }`}
            >
              Semestral
            </button>
            {/* Badge de desconto */}
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-bounce">
              -15% OFF
            </span>
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="space-y-6">
          {planos.map((plano, i) => {
            const styles = getColorClasses(plano.cor);
            const isRei = plano.nome === "Tubarão Rei";

            return (
              <div
                key={i}
                className={`relative rounded-3xl p-6 border transition-all duration-300 ${
                  isRei
                    ? "bg-gradient-to-b from-[#1a1a0f] to-black border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                    : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {/* Tag Popular ou Destaque */}
                {plano.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    Mais Escolhido
                  </div>
                )}
                {plano.destaque && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                    {plano.destaque}
                  </div>
                )}

                {/* Cabeçalho do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2
                      className={`text-xl font-black italic uppercase mb-1 ${
                        isRei ? "text-yellow-400" : "text-white"
                      }`}
                    >
                      {plano.nome}
                    </h2>
                    <p className="text-xs text-zinc-400 w-3/4 leading-tight">
                      {plano.desc}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border ${styles}`}
                  >
                    {plano.icone}
                  </div>
                </div>

                {/* Preço */}
                <div className="mb-6">
                  <span className="text-3xl font-black text-white">
                    {plano.preco}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">
                    {" "}
                    / {ciclo}
                  </span>
                </div>

                {/* Lista de Benefícios */}
                <ul className="space-y-3 mb-6">
                  {plano.beneficios.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-zinc-300"
                    >
                      <div
                        className={`mt-0.5 min-w-[16px] flex justify-center`}
                      >
                        <Check
                          size={14}
                          className={
                            isRei ? "text-yellow-500" : "text-emerald-500"
                          }
                          strokeWidth={3}
                        />
                      </div>
                      <span
                        className={
                          item.includes("Kit") || item.includes("VIP")
                            ? "font-bold text-white"
                            : ""
                        }
                      >
                        {item}
                      </span>
                    </li>
                  ))}
                  {plano.naoInclui.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-zinc-600 line-through decoration-zinc-700"
                    >
                      <div className="mt-0.5 min-w-[16px] flex justify-center">
                        <X size={14} />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão de Assinar */}
                <button
                  className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition active:scale-95 ${
                    isRei
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-400 text-black shadow-lg hover:shadow-yellow-500/20"
                      : "bg-white text-black hover:bg-emerald-400"
                  }`}
                >
                  Virar {plano.nome.split(" ")[0]}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[10px] text-zinc-600 px-8">
          Ao assinar, você concorda com os termos de uso da Atlética AAAKN. O
          cancelamento pode ser feito a qualquer momento.
        </p>
      </main>
    </div>
  );
}
