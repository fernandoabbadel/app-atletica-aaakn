"use client";

import React, { useState, useEffect } from "react";

export default function Loading() {
  const [frase, setFrase] = useState("Carregando...");

  // Lista de frases criativas
  const frases = [
    "Afiando o bisturi... e os dentes. 🦈",
    "Os tubarões estão revisando Anatomia...",
    "Procurando a veia certa... aguarde.",
    "Tubarão não dorme, estuda Fisiologia.",
    "Calibrando a mordida para o Intermed. 🏆",
    "Mergulhando em um mar de apostilas.",
    "Oxigenando as brânquias para o plantão. 🫁",
    "Esperando o R1 passar a visita...",
    "Consultando o Harrison... um momento. 📚",
    "Nadando contra a corrente (e o sono).",
  ];

  useEffect(() => {
    // Escolhe uma frase aleatória quando o componente monta
    const randomIndex = Math.floor(Math.random() * frases.length);
    setFrase(frases[randomIndex]);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center">
      {/* CONTAINER DA ANIMAÇÃO (Bolinha enchendo) */}
      <div className="relative w-32 h-32 rounded-full border-4 border-zinc-800 overflow-hidden bg-zinc-900 shadow-[0_0_40px_rgba(16,185,129,0.2)] mb-8">
        {/* ÍCONE/LOGO NO CENTRO (Fica parado) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {/* Se tiver a imagem do logo, use <img src="/logo.png" className="w-16 opacity-80" /> */}
          {/* Por enquanto, usando o emoji grande */}
          <span className="text-5xl drop-shadow-lg filter grayscale opacity-50">
            🦈
          </span>
        </div>

        {/* ONDA VERDE (Animação subindo) */}
        <div className="absolute left-0 w-[200%] h-[200%] bg-emerald-600/80 rounded-[40%] animate-wave -translate-x-1/4 z-10 top-[100%]"></div>
      </div>

      {/* TEXTO DE CARREGAMENTO */}
      <div className="text-center px-4">
        <h2 className="text-emerald-500 font-bold text-lg animate-pulse mb-2">
          CARREGANDO
        </h2>
        <p className="text-zinc-400 text-sm font-medium italic max-w-xs mx-auto">
          "{frase}"
        </p>
      </div>

      {/* CSS INLINE PARA A ANIMAÇÃO DA ONDA */}
      <style jsx>{`
        @keyframes wave {
          0% {
            transform: rotate(0deg);
            top: 100%;
          }
          100% {
            transform: rotate(360deg);
            top: -50%;
          }
        }
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
