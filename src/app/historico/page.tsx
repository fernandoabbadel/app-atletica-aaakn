"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Trophy, ChevronRight, CalendarRange } from "lucide-react";

// MOCK: Apontando para a pasta local public/historico
const EVENTS_MOCK = [
    {
        id: "1", titulo: "Fundação da AAAKN", data: "2018-03-15", ano: "2018",
        descricao: "O início de tudo. A primeira gestão reuniu os alunos para criar a maior do litoral. Foi um dia histórico onde assinamos a ata de fundação.",
        local: "Campus Unitau", foto: "/historico/fundacao.jpg" // Nome exemplo
    },
    {
        id: "2", titulo: "Primeiro Título no JIMESP", data: "2022-11-02", ano: "2022",
        descricao: "Contra todas as probabilidades, trouxemos o caneco pra casa no Futsal Masculino. Uma final emocionante decidida nos pênaltis.",
        local: "Ginásio Municipal", foto: "/historico/titulo_2022.jpg"
    },
    {
        id: "3", titulo: "A Maior Calourada", data: "2024-02-20", ano: "2024",
        descricao: "Recorde de público com mais de 500 pessoas. O Tubarão dominou a cidade e mostrou quem manda no litoral.",
        local: "Arena Show", foto: "/historico/calourada_2024.jpg"
    }
];

export default function HistoricoPage() {
  const timelineEvents = [...EVENTS_MOCK].sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-emerald-500">
      
      {/* HEADER COM LOGO AAAKN */}
      <div className="relative h-72 w-full overflow-hidden flex items-center justify-center bg-zinc-900">
          {/* Background Abstrato */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/50 to-[#050505] z-10"></div>
          
          {/* LOGO CENTRALIZADA */}
          <div className="relative z-20 flex flex-col items-center animate-in zoom-in-50 duration-700">
              <div className="w-32 h-32 bg-black/50 backdrop-blur-xl rounded-full border-4 border-emerald-500/30 p-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                <img src="/logo.png" className="w-full h-full object-contain drop-shadow-xl" alt="Logo AAAKN" />
              </div>
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mt-4 drop-shadow-xl">
                  Nossa <span className="text-emerald-500">História</span>
              </h1>
          </div>
          
          {/* Botão Voltar */}
          <div className="absolute top-6 left-6 z-30">
              <Link href="/menu" className="w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-emerald-600 transition border border-white/10">
                <ArrowLeft size={20}/>
              </Link>
          </div>
      </div>

      {/* TIMELINE CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 mt-8 relative">
          
          {/* LINHA CENTRAL VERTICAL */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-zinc-800 to-transparent"></div>

          <div className="space-y-12">
              {timelineEvents.map((event, index) => {
                  const isEven = index % 2 === 0;
                  return (
                      <div key={event.id} className={`relative flex flex-col md:flex-row items-start md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}>
                          
                          {/* BOLINHA DA TIMELINE */}
                          <div className="absolute left-4 md:left-1/2 -translate-x-[5px] md:-translate-x-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black shadow-[0_0_10px_rgba(16,185,129,0.8)] z-10 mt-1.5 md:mt-0"></div>

                          {/* CONTEÚDO (CARD) */}
                          <div className={`pl-10 md:pl-0 w-full md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                              <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl overflow-hidden group hover:border-emerald-500/50 transition duration-300 shadow-xl">
                                  
                                  {/* Imagem do Evento (Public Folder) */}
                                  <div className="h-40 w-full overflow-hidden relative bg-black">
                                      <img 
                                        src={event.foto} 
                                        onError={(e) => e.currentTarget.src = "https://via.placeholder.com/400x200?text=Sem+Foto"} // Fallback se não achar a foto na pasta
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                      />
                                      <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                                          <span className="text-xs font-black text-emerald-400">{event.ano}</span>
                                      </div>
                                  </div>

                                  <div className="p-5">
                                      <h3 className="text-xl font-black uppercase text-white mb-2 leading-tight">{event.titulo}</h3>
                                      <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase mb-3">
                                          <span className="flex items-center gap-1"><Calendar size={12}/> {event.data}</span>
                                          <span className="flex items-center gap-1"><MapPin size={12}/> {event.local}</span>
                                      </div>
                                      <p className="text-sm text-zinc-400 leading-relaxed border-t border-zinc-800 pt-3">
                                          {event.descricao}
                                      </p>
                                  </div>
                              </div>
                          </div>

                          {/* ESPAÇO VAZIO (Para alinhar no desktop) */}
                          <div className="w-full md:w-1/2 hidden md:block"></div>
                      </div>
                  );
              })}
          </div>

          {/* FIM DA LINHA E BOTÃO GLOWING */}
          <div className="mt-16 mb-8 flex flex-col items-center gap-6">
              <div className="inline-block p-4 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500 animate-bounce">
                  <Trophy size={24} className="text-yellow-500"/>
              </div>
              
              {/* BOTÃO FLOATING COOL PARA EVENTOS */}
              <Link href="/eventos" className="relative group w-full max-w-sm">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-40 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
                  <button className="relative w-full bg-zinc-900 ring-1 ring-white/10 rounded-xl px-6 py-4 flex items-center justify-between overflow-hidden">
                      <div className="flex items-center gap-4">
                          <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
                              <CalendarRange size={24} />
                          </div>
                          <div className="text-left">
                              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Próximos Passos</p>
                              <h3 className="text-lg font-black text-white italic uppercase">Agenda do Tubarão</h3>
                          </div>
                      </div>
                      <ChevronRight className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition"/>
                  </button>
              </Link>
          </div>
      </div>
    </div>
  );
}