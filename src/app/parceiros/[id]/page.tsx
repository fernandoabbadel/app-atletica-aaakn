"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Clock, Phone, Globe, Copy, QrCode, CheckCircle, Ticket, Instagram, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation"; 
import { useToast } from "../../../context/ToastContext";

// MOCK ESTENDIDO COM CUPONS
const PARCEIROS_MOCK = [
  { 
    id: 1, 
    nome: "Academia Ironberg", 
    descricao: "Maior rede de academias com equipamentos de ponta.",
    categoria: "Saúde", 
    tier: "ouro", 
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80",
    logo: "https://i.pravatar.cc/150?u=iron",
    endereco: "Av. da Praia, 1000",
    horario: "06h - 23h",
    cupons: [
        { id: 1, titulo: "15% OFF Mensalidade", regra: "Planos Semestrais", codigo: "IRON-15" },
        { id: 2, titulo: "Isenção de Matrícula", regra: "Para novos alunos", codigo: "IRON-FREE" },
    ]
  },
  // ... outros parceiros
];

export default function ParceiroDetalhePage() {
  const { addToast } = useToast();
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCupom, setActiveCupom] = useState<any>(null);
  const [countdown, setCountdown] = useState(300);

  const parceiro = PARCEIROS_MOCK.find(p => p.id === Number(params.id)) || PARCEIROS_MOCK[0];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isModalOpen && countdown > 0) { timer = setInterval(() => setCountdown(prev => prev - 1), 1000); }
    return () => clearInterval(timer);
  }, [isModalOpen, countdown]);

  const handleOpenCupom = (cupom: any) => { setActiveCupom(cupom); setIsModalOpen(true); setCountdown(300); };
  const formatTime = (s: number) => `${Math.floor(s / 60)}:${s % 60 < 10 ? '0' : ''}${s % 60}`;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500 pb-10">
      
      {/* CAPA */}
      <div className="relative h-[35vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505] z-10"/>
        <img src={parceiro.image} className="w-full h-full object-cover"/>
        <Link href="/parceiros" className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black transition border border-white/10 text-white"><ArrowLeft size={20}/></Link>
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-20 -mt-10 px-4 md:px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-black border-4 border-[#050505] -mt-16 flex items-center justify-center overflow-hidden shadow-lg shrink-0"><img src={parceiro.logo} className="w-full h-full object-cover"/></div>
                <div className="pt-2"><h1 className="text-2xl font-black text-white uppercase leading-none">{parceiro.nome}</h1><span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{parceiro.categoria}</span></div>
            </div>

            <div className="flex gap-2 mb-6">
                <button className="flex-1 bg-zinc-800 p-2.5 rounded-xl text-zinc-400 hover:text-white"><Instagram size={20}/></button>
                <button className="flex-1 bg-zinc-800 p-2.5 rounded-xl text-zinc-400 hover:text-white"><Globe size={20}/></button>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed mb-6">{parceiro.descricao}</p>
            
            <div className="space-y-2 text-xs text-zinc-300 mb-8">
                <div className="flex items-center gap-3"><MapPin size={16} className="text-emerald-500"/><span>{parceiro.endereco}</span></div>
                <div className="flex items-center gap-3"><Clock size={16} className="text-emerald-500"/><span>{parceiro.horario}</span></div>
            </div>

            {/* LISTA DE CUPONS (CARROSEL VERTICAL) */}
            <h3 className="text-sm font-bold text-white uppercase mb-3 flex items-center gap-2"><Ticket size={16} className="text-yellow-500"/> Cupons Disponíveis</h3>
            <div className="space-y-3">
                {parceiro.cupons.map(cupom => (
                    <div key={cupom.id} onClick={() => handleOpenCupom(cupom)} className="bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:border-emerald-500 transition group relative overflow-hidden">
                        <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500"></div>
                        <div>
                            <h4 className="font-black text-white text-sm uppercase">{cupom.titulo}</h4>
                            <p className="text-[10px] text-zinc-400">{cupom.regra}</p>
                        </div>
                        <div className="bg-black/40 p-2 rounded-full text-zinc-500 group-hover:text-emerald-500 transition"><QrCode size={20}/></div>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* MODAL QR CODE */}
      {isModalOpen && activeCupom && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center relative shadow-2xl overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-zinc-100 p-2 rounded-full text-zinc-500 hover:bg-zinc-200"><ArrowLeft size={20}/></button>
            <h3 className="text-black font-black text-xl uppercase mb-1">Cupom Ativado!</h3>
            <p className="text-zinc-500 text-xs font-medium mb-6">{activeCupom.titulo}</p>
            
            <div className="bg-black p-4 rounded-2xl inline-block mb-6 shadow-xl relative group">
                <div className="absolute inset-0 bg-emerald-500/20 animate-pulse rounded-2xl"></div>
                <QrCode size={160} className="text-white relative z-10"/>
            </div>

            <div className="bg-zinc-100 rounded-xl p-4 mb-6 flex justify-between items-center border border-zinc-200">
                <div className="text-left"><p className="text-[10px] text-zinc-400 font-bold uppercase">Código</p><span className="font-mono text-xl font-black text-black tracking-widest">{activeCupom.codigo}</span></div>
                <button onClick={() => addToast("Copiado!", "success")} className="bg-white p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-emerald-600 shadow-sm"><Copy size={20}/></button>
            </div>

            <div className="text-zinc-400 text-xs font-bold flex items-center justify-center gap-2 bg-red-50 p-2 rounded-lg text-red-500"><Clock size={14} className="animate-pulse"/> Expira em: <span className="font-mono text-base">{formatTime(countdown)}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}