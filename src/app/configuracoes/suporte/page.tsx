"use client";

import React, { useState } from "react";
import { ArrowLeft, Send, AlertTriangle } from "lucide-react";
import Link from "next/link";

const APP_PAGES = [
  "Página Inicial (Feed)",
  "Academia (Gym Rats)",
  "Carteirinha Digital",
  "Eventos",
  "Loja",
  "Ranking",
  "Perfil de Usuário",
  "Login / Cadastro",
  "Outros / Sugestão Geral"
];

export default function SupportPage() {
  const [selectedPage, setSelectedPage] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    // Aqui você enviaria os dados para o backend
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Send size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black italic uppercase">Mensagem Enviada!</h2>
        <p className="text-zinc-400 mt-2 mb-8">Agradecemos seu feedback. Nossa equipe vai analisar o tubarão que escapou.</p>
        <Link href="/configuracoes" className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold uppercase hover:bg-zinc-700 transition">
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-10 font-sans">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <Link href="/configuracoes" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter">Fale Conosco</h1>
      </header>

      <main className="p-6 max-w-lg mx-auto">
        <div className="bg-emerald-900/20 border border-emerald-900/50 p-4 rounded-xl flex gap-3 mb-8">
          <AlertTriangle className="text-emerald-500 shrink-0" />
          <p className="text-xs text-emerald-100/80 leading-relaxed">
            Encontrou um bug ou tem uma ideia genial? Conte pra gente! Selecione a página onde o problema ocorreu para nos ajudar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Onde está o problema?</label>
            <div className="grid grid-cols-1 gap-2">
              <select 
                value={selectedPage} 
                onChange={(e) => setSelectedPage(e.target.value)}
                required
                className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:border-emerald-500 outline-none appearance-none"
              >
                <option value="" disabled>Selecione a página...</option>
                {APP_PAGES.map(page => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Descreva o que houve</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="Ex: O botão de check-in não está aparecendo..."
              className="w-full bg-zinc-900 border border-zinc-800 text-white p-4 rounded-xl focus:border-emerald-500 outline-none resize-none"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2 transition active:scale-[0.98]"
          >
            <Send size={18} /> Enviar Feedback
          </button>
        </form>
      </main>
    </div>
  );
}