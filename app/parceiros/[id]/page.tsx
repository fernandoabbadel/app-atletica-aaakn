"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, MapPin, Clock, Phone, Globe, Copy,
  QrCode, CheckCircle, Ticket, Instagram, MessageCircle
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation"; 
import { useToast } from "@/context/ToastContext";

// MOCK DATA EXTENDIDO
const PARCEIROS_MOCK = [
  { 
    id: 1, 
    nome: "Academia Ironberg", 
    descricao: "A maior rede de academias agora com desconto exclusivo para a medicina. Equipamentos de ponta e instrutores capacitados.",
    beneficio: "15% OFF na Mensalidade",
    regra: "Válido para planos trimestrais e semestrais. Apresente o QR Code na recepção.",
    categoria: "Saúde", 
    tier: "ouro", 
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
    logo: "https://i.pravatar.cc/150?u=iron",
    endereco: "Av. da Praia, 1000 - Centro",
    horario: "06h às 23h",
    social: { insta: "@ironberg_caragua", whats: "1299999999", site: "ironberg.com" }
  },
  // ... adicione os outros mocks se necessário
];

export default function ParceiroDetalhePage() {
  const { addToast } = useToast();
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [countdown, setCountdown] = useState(300);

  const parceiro = PARCEIROS_MOCK.find(p => p.id === Number(params.id)) || PARCEIROS_MOCK[0]; // Fallback para não quebrar se id não existir no mock

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isModalOpen && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [isModalOpen, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500 pb-10">
      
      {/* HEADER IMAGE - FIXED HEIGHT */}
      <div className="relative h-[35vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505] z-10"/>
        <img src={parceiro.image} className="w-full h-full object-cover"/>
        
        {/* Nav */}
        <Link href="/parceiros" className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full hover:bg-black transition border border-white/10 text-white">
          <ArrowLeft size={20}/>
        </Link>
      </div>

      {/* CONTENT CONTAINER - SOBREPOSIÇÃO */}
      <div className="relative z-20 -mt-10 px-4 md:px-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-2xl">
            
            {/* Header do Card */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-black border-4 border-[#050505] -mt-16 flex items-center justify-center overflow-hidden shadow-lg shrink-0">
                        <img src={parceiro.logo} className="w-full h-full object-cover"/>
                    </div>
                    <div className="pt-2">
                        <h1 className="text-2xl font-black text-white uppercase leading-none">{parceiro.nome}</h1>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{parceiro.categoria}</span>
                    </div>
                </div>
                
                {/* Botões Sociais */}
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-zinc-800 p-2.5 rounded-xl hover:bg-zinc-700 transition text-zinc-400 hover:text-pink-500"><Instagram size={20}/></button>
                    <button className="flex-1 md:flex-none bg-zinc-800 p-2.5 rounded-xl hover:bg-zinc-700 transition text-zinc-400 hover:text-emerald-500"><MessageCircle size={20}/></button>
                    <button className="flex-1 md:flex-none bg-zinc-800 p-2.5 rounded-xl hover:bg-zinc-700 transition text-zinc-400 hover:text-blue-500"><Globe size={20}/></button>
                </div>
            </div>

            {/* Descrição */}
            <div className="space-y-6">
                <p className="text-sm text-zinc-400 leading-relaxed">{parceiro.descricao}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
                        <div className="bg-zinc-800 p-2 rounded-lg text-emerald-500"><MapPin size={18}/></div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold">Endereço</p>
                            <p className="text-xs text-white font-medium">{parceiro.endereco}</p>
                        </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex items-center gap-3">
                        <div className="bg-zinc-800 p-2 rounded-lg text-emerald-500"><Clock size={18}/></div>
                        <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold">Funcionamento</p>
                            <p className="text-xs text-white font-medium">{parceiro.horario}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* TICKET DE BENEFÍCIO */}
            <div className="mt-8 relative group cursor-pointer" onClick={() => { setIsModalOpen(true); setCountdown(300); }}>
                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
                <div className="relative bg-gradient-to-r from-emerald-900/80 to-black border border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center text-center overflow-hidden">
                    {/* Furinhos do Ticket */}
                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] rounded-full"></div>
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#050505] rounded-full"></div>
                    
                    <div className="mb-2 bg-emerald-500/20 p-3 rounded-full text-emerald-400 mb-4"><Ticket size={32}/></div>
                    <h3 className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-1">Cupom Exclusivo</h3>
                    <p className="text-3xl font-black text-white mb-2">{parceiro.beneficio}</p>
                    <p className="text-xs text-zinc-400 italic mb-6 max-w-xs">{parceiro.regra}</p>
                    
                    <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2">
                        <QrCode size={20}/> Gerar QR Code
                    </button>
                </div>
            </div>

        </div>
      </div>

      {/* MODAL QR CODE (O MESMO DE ANTES, FUNCIONA BEM) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-in zoom-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center relative shadow-2xl overflow-hidden">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 bg-zinc-100 p-2 rounded-full text-zinc-500 hover:bg-zinc-200"><ArrowLeft size={20}/></button>
            <h3 className="text-black font-black text-xl uppercase mb-1">Cupom Ativado!</h3>
            <p className="text-zinc-500 text-xs font-medium mb-6">Mostre este código no caixa para validar</p>
            
            <div className="bg-black p-4 rounded-2xl inline-block mb-6 shadow-xl relative group">
                <div className="absolute inset-0 bg-emerald-500/20 animate-pulse rounded-2xl"></div>
                <QrCode size={160} className="text-white relative z-10"/>
            </div>

            <div className="bg-zinc-100 rounded-xl p-4 mb-6 flex justify-between items-center border border-zinc-200">
                <div className="text-left">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase">Código</p>
                    <span className="font-mono text-xl font-black text-black tracking-widest">IRON-8821</span>
                </div>
                <button onClick={() => addToast("Copiado!", "success")} className="bg-white p-2 rounded-lg border border-zinc-200 text-zinc-400 hover:text-emerald-600 shadow-sm"><Copy size={20}/></button>
            </div>

            <div className="text-zinc-400 text-xs font-bold flex items-center justify-center gap-2 bg-red-50 p-2 rounded-lg text-red-500">
                <Clock size={14} className="animate-pulse"/>
                Expira em: <span className="font-mono text-base">{formatTime(countdown)}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}