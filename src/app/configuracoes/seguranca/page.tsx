"use client";

import React from "react";
import { ArrowLeft, Lock, Key } from "lucide-react";
import Link from "next/link";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <Link href="/configuracoes" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter">Segurança</h1>
      </header>

      <main className="p-6 max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Key size={18} className="text-emerald-500"/> Alterar Senha
            </h3>
            <input type="password" placeholder="Senha Atual" className="w-full bg-black border border-zinc-800 p-3 rounded-lg mb-3 text-sm focus:border-emerald-500 outline-none" />
            <input type="password" placeholder="Nova Senha" className="w-full bg-black border border-zinc-800 p-3 rounded-lg mb-3 text-sm focus:border-emerald-500 outline-none" />
            <input type="password" placeholder="Confirmar Nova Senha" className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm focus:border-emerald-500 outline-none" />
            
            <button className="w-full mt-4 bg-white text-black font-bold py-3 rounded-lg text-xs uppercase hover:bg-emerald-400 transition">
              Atualizar Senha
            </button>
          </div>

          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 opacity-70">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Lock size={18} className="text-zinc-500"/> Autenticação de Dois Fatores
            </h3>
            <p className="text-xs text-zinc-500">Em breve disponível para todos os sócios.</p>
          </div>
        </div>
      </main>
    </div>
  );
}