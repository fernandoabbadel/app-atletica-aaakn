"use client";

import React from "react";
import { ArrowLeft, Crown, Star, Ghost, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// DADOS (Idealmente viriam do backend, aqui repetimos o mock para o front)
const PLANOS = [
    {
        id: "bicho", nome: "Bicho Solto", preco: "75,00", parcelas: "Semestral", cor: "emerald", icon: Ghost, destaque: false,
        chamada: "Kit Sobrevivência",
        benefits: ["Kit: Caneca + Tirante", "15% OFF na Lojinha", "Fura-fila Open Cooler", "1 VIP preço de Pista"]
    },
    {
        id: "atleta", nome: "Atleta de Bar", preco: "160,00", parcelas: "2x Sem Juros", cor: "zinc", icon: Star, destaque: true,
        chamada: "O Mais Vendido",
        benefits: ["Kit: Caneca + Tirante", "Kit: Camiseta ou Samba", "Preço Gestão (3 itens)", "50% OFF em 2 Festas", "Prioridade JIMESP"]
    },
    {
        id: "lenda", nome: "Lenda da JIMESP", preco: "250,00", parcelas: "3x Sem Juros", cor: "yellow", icon: Crown, destaque: false,
        chamada: "Status & VIP",
        benefits: ["Kit Caneca + Tirante", "Kit Colete ou Body + Bandana", "R$ 50 OFF no JIMESP", "VIP Garantido", "Sorteio Camarote"]
    }
];

export default function PlanosPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 pb-20">
      
      {/* HEADER HERO */}
      <div className="relative pt-10 pb-20 px-6 overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto text-center">
              <Link href="/menu" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition uppercase text-xs font-bold tracking-widest"><ArrowLeft size={16}/> Voltar ao Menu</Link>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Seja Sócio <span className="text-emerald-500">Tubarão</span></h1>
              <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base">Não é só ajudar a atlética. É matemática inteligente. Economize nos rolês, garanta seu kit e tenha prioridade em tudo.</p>
          </div>
      </div>

      {/* CARDS */}
      <div className="px-6 relative z-20 -mt-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {PLANOS.map(plano => (
                  <div key={plano.id} className={`bg-zinc-900/80 backdrop-blur-xl border rounded-[2rem] p-6 flex flex-col relative transition duration-300 hover:-translate-y-2 ${plano.destaque ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.2)] md:pb-12 md:pt-10 bg-zinc-900' : 'border-zinc-800 hover:border-zinc-600'}`}>
                      
                      {plano.destaque && (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-emerald-500 text-black font-black text-[10px] uppercase px-4 py-1 rounded-b-xl shadow-lg tracking-widest w-fit whitespace-nowrap">
                              Escolha dos Veteranos
                          </div>
                      )}

                      <div className="mb-6 text-center">
                          <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${plano.cor === 'yellow' ? 'bg-yellow-500/10 text-yellow-500' : plano.cor === 'zinc' ? 'bg-zinc-800 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                              <plano.icon size={32}/>
                          </div>
                          <h3 className={`text-2xl font-black uppercase ${plano.cor === 'yellow' ? 'text-yellow-500' : plano.cor === 'zinc' ? 'text-white' : 'text-emerald-500'}`}>{plano.nome}</h3>
                          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{plano.chamada}</p>
                      </div>

                      <div className="text-center mb-8">
                          <div className="flex items-end justify-center gap-1">
                              <span className="text-sm font-bold text-zinc-500 mb-2">R$</span>
                              <span className="text-5xl font-black text-white">{plano.preco}</span>
                          </div>
                          <p className="text-xs text-emerald-400 font-bold mt-2">{plano.parcelas}</p>
                      </div>

                      <div className="space-y-3 flex-1 mb-8">
                          {plano.benefits.map((ben, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                  <CheckCircle size={16} className={`shrink-0 ${plano.cor === 'yellow' ? 'text-yellow-500' : plano.cor === 'zinc' ? 'text-white' : 'text-emerald-500'}`}/>
                                  {ben}
                              </div>
                          ))}
                      </div>

                      <button 
                        onClick={() => router.push(`/planos/adesao?plano=${plano.id}`)}
                        className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-lg flex items-center justify-center gap-2 ${plano.destaque ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
                      >
                          Quero Esse <ArrowRight size={16}/>
                      </button>
                  </div>
              ))}
          </div>
      </div>

      <div className="max-w-2xl mx-auto mt-16 px-6 text-center">
          <p className="text-zinc-500 text-xs">
              * A adesão é válida por um semestre letivo. Os kits devem ser retirados na salinha da Atlética mediante apresentação do QR Code gerado após o pagamento. Dúvidas? Chame a diretoria no Insta.
          </p>
      </div>
    </div>
  );
}