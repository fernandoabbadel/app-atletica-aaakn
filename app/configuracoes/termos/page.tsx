"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <Link href="/configuracoes" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter">Termos de Uso</h1>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg mb-2">1. Política de Privacidade</h2>
          <p>
            A Associação Atlética Acadêmica Keiiti Nakamura (AAAKN) respeita a sua privacidade. 
            Todos os dados coletados (nome, matrícula, fotos) são utilizados exclusivamente para 
            identificação em eventos esportivos, validação de sócio torcedor e gamificação interna.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">2. Uso de Imagem</h2>
          <p>
            Ao enviar fotos para o Feed ou Check-in, você autoriza o uso interno no aplicativo para 
            fins de ranking e comprovação de atividades. Nenhuma imagem será vendida a terceiros.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg mb-2">3. Regras da Comunidade</h2>
          <p>
            É estritamente proibido conteúdo ofensivo, discriminatório ou que incite violência no feed 
            da comunidade. O descumprimento resultará no banimento da conta e reporte à diretoria da Atlética.
          </p>
        </section>
        
        <div className="pt-8 text-center text-xs text-zinc-600">
            Última atualização: Janeiro 2026
        </div>
      </main>
    </div>
  );
}