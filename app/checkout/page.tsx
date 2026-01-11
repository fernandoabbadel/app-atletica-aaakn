"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, CreditCard, Lock, User, Mail, Smartphone, 
  QrCode, ShieldCheck, Loader2, CheckCircle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Dados, 2: Pagamento, 3: Sucesso
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");

  // Simulação de Total vindo do carrinho
  const total = 120.00; 

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // AQUI ENTRARIA A INTEGRAÇÃO COM STRIPE/MERCADO PAGO
    // Ex: const response = await stripe.confirmCardPayment(...)

    // Simulando delay da API
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setLoading(false);
    setStep(3); // Vai para tela de sucesso
  };

  if (step === 3) {
    return <SuccessScreen router={router} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32 selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-30 flex items-center gap-4 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">Finalizar Compra</h1>
        <Lock size={16} className="ml-auto text-emerald-500" />
      </header>

      <main className="p-4 max-w-xl mx-auto space-y-6">
        
        {/* PROGRESSO */}
        <div className="flex items-center justify-between px-4 mb-6">
            <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>1</div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Dados</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 2 ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
            <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>2</div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Pagamento</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 ${step >= 3 ? 'bg-emerald-500' : 'bg-zinc-800'}`}></div>
            <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>3</div>
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Fim</span>
            </div>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
            
            {/* ETAPA 1: DADOS PESSOAIS */}
            <section className={step === 1 ? "block animate-in fade-in slide-in-from-right-4" : "hidden"}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <User size={18} className="text-emerald-500" /> Dados do Titular
                </h2>
                <div className="space-y-3">
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition">
                        <User size={18} className="text-zinc-500" />
                        <input type="text" placeholder="Nome Completo" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600" required />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition">
                        <Mail size={18} className="text-zinc-500" />
                        <input type="email" placeholder="E-mail para envio dos ingressos" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600" required />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition">
                        <Smartphone size={18} className="text-zinc-500" />
                        <input type="tel" placeholder="WhatsApp / Celular" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600" required />
                    </div>
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition">
                        <ShieldCheck size={18} className="text-zinc-500" />
                        <input type="text" placeholder="CPF" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600" required />
                    </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full mt-6 bg-white text-black py-4 rounded-xl font-black text-sm uppercase hover:bg-emerald-400 transition">
                    Ir para Pagamento
                </button>
            </section>

            {/* ETAPA 2: PAGAMENTO */}
            <section className={step === 2 ? "block animate-in fade-in slide-in-from-right-4" : "hidden"}>
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-emerald-500" /> Forma de Pagamento
                </h2>

                {/* Seleção de Método */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${paymentMethod === 'card' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                    >
                        <CreditCard size={24} />
                        <span className="text-xs font-bold uppercase">Cartão</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setPaymentMethod("pix")}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition ${paymentMethod === 'pix' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                    >
                        <QrCode size={24} />
                        <span className="text-xs font-bold uppercase">PIX</span>
                    </button>
                </div>

                {paymentMethod === "card" ? (
                    <div className="space-y-3 animate-in fade-in">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition">
                            <CreditCard size={18} className="text-zinc-500" />
                            <input type="text" placeholder="Número do Cartão" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition">
                                <input type="text" placeholder="MM/AA" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600 text-center" required />
                            </div>
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 focus-within:border-emerald-500 transition">
                                <input type="text" placeholder="CVV" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600 text-center" required />
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-emerald-500 transition">
                            <User size={18} className="text-zinc-500" />
                            <input type="text" placeholder="Nome Impresso no Cartão" className="bg-transparent w-full text-sm outline-none text-white placeholder:text-zinc-600" required />
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-2xl text-center animate-in fade-in">
                        <QrCode size={64} className="mx-auto text-emerald-500 mb-4" />
                        <p className="text-sm text-zinc-300 font-bold mb-2">Pagar via PIX</p>
                        <p className="text-xs text-zinc-500">O código QR será gerado na próxima tela. A aprovação é instantânea.</p>
                    </div>
                )}

                {/* Resumo Final */}
                <div className="mt-8 pt-4 border-t border-zinc-800 flex justify-between items-end">
                    <span className="text-zinc-400 text-sm">Total a pagar:</span>
                    <span className="text-2xl font-black text-white">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full mt-4 bg-emerald-500 text-black py-4 rounded-xl font-black text-sm uppercase hover:bg-emerald-400 transition shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <><Loader2 size={18} className="animate-spin" /> Processando...</>
                    ) : (
                        <><Lock size={18} /> Confirmar Pagamento</>
                    )}
                </button>
                <p className="text-center text-[10px] text-zinc-600 mt-3 flex items-center justify-center gap-1">
                    <ShieldCheck size={10} /> Ambiente criptografado e seguro
                </p>
            </section>

        </form>
      </main>
    </div>
  );
}

// TELA DE SUCESSO
function SuccessScreen({ router }: { router: any }) {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
            <div className="max-w-sm w-full text-center">
                <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                    <CheckCircle size={48} className="text-black" strokeWidth={3} />
                </div>
                <h1 className="text-3xl font-black italic uppercase text-white mb-2">Compra Aprovada!</h1>
                <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                    Yess! Seus ingressos foram enviados para seu e-mail e já estão disponíveis na sua carteirinha.
                </p>
                
                <div className="space-y-3">
                    <button onClick={() => router.push('/carteirinha')} className="w-full bg-white text-black py-3.5 rounded-xl font-black text-sm uppercase hover:bg-emerald-400 transition">
                        Ver Meus Ingressos
                    </button>
                    <button onClick={() => router.push('/')} className="w-full bg-zinc-900 border border-zinc-800 text-zinc-400 py-3.5 rounded-xl font-bold text-sm uppercase hover:text-white hover:border-zinc-700 transition">
                        Voltar ao Início
                    </button>
                </div>
            </div>
        </div>
    );
}