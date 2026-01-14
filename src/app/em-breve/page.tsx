"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Hammer, HardHat } from "lucide-react";

export default function ComingSoonPage() {
  const [frase, setFrase] = useState("");
  const frasesObra = [
    "Estamos ampliando o tanque dos tubarões. 🦈",
    "Afiando novas funcionalidades...",
    "O estagiário está codando (tenha fé). 💻",
    "Construindo algo gigante para a Atlética.",
    "Logo menos tem novidade na área!",
    "Espere só até ver o que vem por aí...",
  ];

  useEffect(() => {
    setFrase(frasesObra[Math.floor(Math.random() * frasesObra.length)]);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-700">
      <div className="flex gap-2 mb-6 text-amber-500 animate-bounce">
        <HardHat size={24} />
        <Hammer size={24} />
      </div>
      <div className="relative w-48 h-48 rounded-full border-4 border-zinc-800 overflow-hidden bg-black shadow-[0_0_60px_rgba(245,158,11,0.2)] mb-8 flex items-center justify-center">
        {/* Certifique-se que o logo.png está na pasta public */}
        <div className="relative z-20 w-32 h-32 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Logo Atlética"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
        <div className="absolute left-[-50%] w-[200%] h-[200%] bg-amber-500/20 rounded-[40%] animate-wave-slow z-10 top-[20%]"></div>
        <div className="absolute left-[-50%] w-[200%] h-[200%] bg-amber-600/20 rounded-[45%] animate-wave-reverse z-10 top-[25%]"></div>
      </div>
      <h2 className="text-amber-500 font-black text-2xl tracking-widest mb-3 uppercase">
        Em Construção
      </h2>
      <p className="text-zinc-300 text-base font-medium max-w-xs mx-auto mb-8 leading-relaxed">
        "{frase}"
      </p>
      <Link
        href="/"
        className="border border-zinc-800 bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-amber-500 hover:text-black transition shadow-lg flex items-center gap-2"
      >
        <ArrowLeft size={18} /> Voltar para o Início
      </Link>
      <style jsx>{`
        @keyframes wave-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes wave-reverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
        .animate-wave-slow {
          animation: wave-slow 8s linear infinite;
        }
        .animate-wave-reverse {
          animation: wave-reverse 10s linear infinite;
        }
      `}</style>
    </div>
  );
}
