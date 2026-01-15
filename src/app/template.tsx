"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [frase, setFrase] = useState("");
  const pathname = usePathname();

  // Lista de frases
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
    // 1. Sorteia a frase
    setFrase(frases[Math.floor(Math.random() * frases.length)]);

    // 2. Inicia o Loading
    setLoading(true);

    // 3. Espera 5 segundos (5000ms) e libera a tela
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [pathname]); // Roda toda vez que muda a rota (pathname)

  // SE ESTIVER CARREGANDO, MOSTRA A TELA DE SPLASH
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center animate-in fade-in duration-300">
        {/* CONTAINER DO LOGO E ANIMAÇÃO */}
        <div className="relative w-40 h-40 rounded-full border-4 border-zinc-800 overflow-hidden bg-black shadow-[0_0_50px_rgba(16,185,129,0.3)] mb-8 flex items-center justify-center">
          {/* LOGO DA ATLÉTICA (Fixo no centro) */}
          <div className="relative z-20 w-28 h-28 flex items-center justify-center">
            {/* Certifique-se que o logo.png está na pasta public */}
            <img
              src="/logo.png"
              alt="Logo Atlética"
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>

          {/* ONDA VERDE (Animação subindo) */}
          {/* A duração foi ajustada para 5s para acompanhar o tempo */}
          <div className="absolute left-[-50%] w-[200%] h-[200%] bg-emerald-600/90 rounded-[40%] animate-wave z-10 top-[100%]"></div>
        </div>

        {/* TEXTO */}
        <div className="text-center px-6">
          <h2 className="text-emerald-500 font-black text-xl tracking-widest mb-3 animate-pulse">
            CARREGANDO....
          </h2>
          <p className="text-zinc-400 text-sm font-medium italic max-w-xs mx-auto leading-relaxed">
            "{frase}"
          </p>
        </div>

        {/* CSS DA ANIMAÇÃO DA ONDA */}
        <style jsx>{`
          @keyframes wave {
            0% {
              transform: rotate(0deg);
              top: 100%;
            }
            100% {
              transform: rotate(360deg);
              top: -20%; /* Sobe até cobrir tudo */
            }
          }
          .animate-wave {
            animation: wave 5s ease-in-out forwards; /* 5s de duração */
          }
        `}</style>
      </div>
    );
  }

  // SE TERMINOU, MOSTRA A PÁGINA NORMAL
  return <>{children}</>;
}
