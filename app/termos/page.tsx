"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Scale, Cookie, Lock, FileText } from "lucide-react";

// --- CONTEÚDO (MOCK - Em produção viria do banco) ---
const DOCS = [
    { id: "privacidade", title: "Política de Privacidade", icon: Lock, content: "Aqui entra o texto completo da Política de Privacidade..." },
    { id: "termos", title: "Termos de Uso", icon: Scale, content: "Aqui entra o texto completo dos Termos de Uso..." },
    { id: "cookies", title: "Política de Cookies", icon: Cookie, content: "Aqui entra o texto completo da Política de Cookies..." },
    { id: "moderacao", title: "Moderação e Denúncias", icon: Shield, content: "Aqui entra o texto completo de Moderação..." }
];

export default function TermosLegaisPage() {
  const [activeDocId, setActiveDocId] = useState("privacidade");
  const activeDoc = DOCS.find(d => d.id === activeDocId);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER FIXO */}
      <header className="p-4 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 flex items-center gap-4">
          <Link href="/configuracoes" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition"><ArrowLeft size={20}/></Link>
          <h1 className="text-lg font-black uppercase tracking-tight">Central Jurídica</h1>
      </header>

      <main className="max-w-4xl mx-auto p-4 flex flex-col md:flex-row gap-6 mt-4">
          
          {/* MENU LATERAL */}
          <nav className="w-full md:w-64 shrink-0 space-y-2">
              {DOCS.map(doc => (
                  <button 
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all border ${activeDocId === doc.id ? 'bg-zinc-800 border-emerald-500 text-emerald-500 shadow-lg' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                  >
                      <doc.icon size={20}/>
                      <span className="text-xs font-bold uppercase">{doc.title}</span>
                  </button>
              ))}
          </nav>

          {/* CONTEÚDO DO DOCUMENTO */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeDoc && (
                  <>
                      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
                          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><activeDoc.icon size={24}/></div>
                          <h2 className="text-2xl font-black uppercase">{activeDoc.title}</h2>
                      </div>
                      
                      {/* ÁREA DE TEXTO (PRESERVA QUEBRA DE LINHA) */}
                      <div className="prose prose-invert prose-sm max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {/* Aqui entra o texto que está no banco. 
                             Como estamos usando mock, ele vai mostrar o texto curto do mock acima.
                             Mas quando você usar o contexto real, ele puxará o textão do Admin.
                          */}
                          {activeDoc.content}
                          
                          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-xs font-bold uppercase flex items-center gap-2">
                              <FileText size={16}/> Documento registrado em 12/01/2026
                          </div>
                      </div>
                  </>
              )}
          </div>

      </main>
    </div>
  );
}