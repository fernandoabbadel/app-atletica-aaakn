"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, CreditCard, Lock, Crown, Star, Ghost, Copy, QrCode } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

const PLANOS_INFO: any = {
    'bicho': { nome: "Bicho Solto", preco: "75,00", icon: Ghost, color: "text-emerald-500" },
    'atleta': { nome: "Atleta de Bar", preco: "160,00", icon: Star, color: "text-white" },
    'lenda': { nome: "Lenda da JIMESP", preco: "250,00", icon: Crown, color: "text-yellow-500" },
};

export default function AdesaoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const planId = searchParams.get('plano') || 'atleta';
  const plano = PLANOS_INFO[planId] || PLANOS_INFO['atleta'];
  
  const [step, setStep] = useState(1); // 1: Dados, 2: Pix, 3: Sucesso
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
      setLoading(true);
      setTimeout(() => {
          setLoading(false);
          setStep(3);
          addToast("Pagamento Confirmado! Bem-vindo ao bando.", "success");
      }, 3000); // Simula tempo de pagamento
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        
        {/* Background Animado */}
        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <Link href="/planos" className="absolute top-6 left-6 text-zinc-500 hover:text-white flex items-center gap-2 transition z-50 font-bold uppercase text-xs tracking-wider">
            <ArrowLeft size={18}/> Cancelar
        </Link>

        <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-[2rem] shadow-2xl relative z-10 my-10 animate-in zoom-in-95 duration-300">
            
            {/* HEADER DO CARD */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-black rounded-full border border-zinc-700 flex items-center justify-center mb-4 shadow-xl">
                    <plano.icon size={32} className={plano.color}/>
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Adesão {plano.nome}</h1>
                <p className="text-zinc-400 text-xs font-medium mt-2">Passo {step} de 3</p>
                {/* Barra de Progresso */}
                <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-500 transition-all duration-500 ease-out`} style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
                </div>
            </div>

            {/* PASSO 1: CONFIRMAÇÃO */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right">
                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-700 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Plano Selecionado</span>
                            <span className="text-white font-bold">{plano.nome}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Validade</span>
                            <span className="text-white font-bold">Semestre 2026.1</span>
                        </div>
                        <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                            <span className="text-zinc-300 font-bold uppercase">Total</span>
                            <span className="text-emerald-400 font-black text-xl">R$ {plano.preco}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Seu Nome na Carteirinha</label>
                        <input type="text" placeholder="Nome Completo" className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 transition"/>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Tamanho da Camiseta (Se houver no kit)</label>
                        <div className="grid grid-cols-5 gap-2">
                            {['P', 'M', 'G', 'GG', 'XG'].map(size => (
                                <button key={size} className="bg-zinc-800 hover:bg-zinc-700 text-white py-2 rounded-lg text-xs font-bold border border-zinc-700 focus:border-emerald-500 focus:bg-emerald-900/20">{size}</button>
                            ))}
                        </div>
                    </div>

                    <button onClick={() => setStep(2)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95 flex justify-center items-center gap-2">
                        Ir para Pagamento <ArrowLeft size={18} className="rotate-180"/>
                    </button>
                </div>
            )}

            {/* PASSO 2: PAGAMENTO (PIX) */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    <p className="text-sm text-zinc-300">Escaneie o QR Code abaixo para pagar via Pix e liberar seu acesso imediatamente.</p>
                    
                    <div className="bg-white p-4 rounded-2xl inline-block shadow-xl relative group">
                        <div className={`absolute inset-0 bg-emerald-500/20 animate-pulse rounded-2xl ${loading ? 'block' : 'hidden'}`}></div>
                        <QrCode size={180} className="text-black"/>
                    </div>

                    <div className="bg-zinc-800/50 p-3 rounded-xl flex items-center justify-between border border-zinc-700 cursor-pointer hover:bg-zinc-800 transition" onClick={() => addToast("Código Pix Copiado!", "success")}>
                        <span className="text-xs text-zinc-400 truncate max-w-[200px]">00020126580014br.gov.bcb.pix0136...</span>
                        <Copy size={16} className="text-emerald-500"/>
                    </div>

                    <button onClick={handlePayment} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95 flex justify-center items-center gap-2">
                        {loading ? "Verificando..." : "Já Fiz o Pix"}
                    </button>
                </div>
            )}

            {/* PASSO 3: SUCESSO */}
            {step === 3 && (
                <div className="space-y-6 animate-in zoom-in text-center py-6">
                    <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.5)]">
                        <CheckCircle size={48} className="text-black"/>
                    </div>
                    
                    <div>
                        <h2 className="text-3xl font-black text-white uppercase italic">AÍ SIM!</h2>
                        <p className="text-zinc-400 mt-2">Você agora é um <span className="text-emerald-400 font-bold">{plano.nome}</span> oficial.</p>
                    </div>

                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 text-left">
                        <p className="text-xs text-zinc-300 mb-2">🎁 <span className="font-bold text-white">Próximos Passos:</span></p>
                        <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                            <li>Seu acesso ao App já foi atualizado.</li>
                            <li>Passe na salinha para retirar seu Kit.</li>
                            <li>Seu desconto na loja já está valendo.</li>
                        </ul>
                    </div>

                    <button onClick={() => router.push('/menu')} className="w-full bg-white hover:bg-zinc-200 text-black font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95">
                        Acessar o App
                    </button>
                </div>
            )}

        </div>
    </div>
  );
}