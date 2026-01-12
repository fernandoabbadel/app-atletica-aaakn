"use client";

import React, { useState } from "react";
import { QrCode, TrendingUp, Users, DollarSign, LogOut, Camera, X } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// SIMULAÇÃO DE LOGIN
export default function PartnerDashboard() {
  const { addToast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if(email.includes("@")) { setIsLoggedIn(true); addToast("Bem-vindo, Parceiro!", "success"); }
  };

  const handleScan = () => {
      setScanning(true);
      setTimeout(() => { setScanning(false); addToast("✅ Cupom Validado!", "success"); }, 2000);
  };

  if (!isLoggedIn) {
      return (
          <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white">
              <div className="w-full max-w-sm text-center">
                  <div className="bg-zinc-900 p-4 rounded-3xl inline-block mb-6 shadow-2xl border border-zinc-800"><StoreIcon size={40} className="text-emerald-500"/></div>
                  <h1 className="text-2xl font-black uppercase mb-2">Área do Parceiro</h1>
                  <p className="text-zinc-500 text-sm mb-8">Gerencie suas vendas e valide cupons.</p>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input type="email" placeholder="Email da Empresa" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-emerald-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} required/>
                      <button type="submit" className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg">Acessar Painel</button>
                  </form>
                  <Link href="/" className="block mt-6 text-xs text-zinc-600 hover:text-white">Voltar ao App</Link>
              </div>
          </div>
      );
  }

  return (
      <div className="min-h-screen bg-black text-white pb-20">
          <header className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
              <div><h2 className="text-lg font-black uppercase">Ironberg</h2><p className="text-[10px] text-zinc-500">Dashboard</p></div>
              <button onClick={() => setIsLoggedIn(false)} className="bg-black p-2 rounded-full text-zinc-500"><LogOut size={16}/></button>
          </header>

          <main className="p-6 space-y-6">
              {/* METRICAS */}
              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><p className="text-[10px] text-zinc-500 uppercase font-bold">Vendas Hoje</p><h3 className="text-2xl font-black text-white mt-1">R$ 450</h3></div>
                  <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><p className="text-[10px] text-zinc-500 uppercase font-bold">Cupons</p><h3 className="text-2xl font-black text-emerald-500 mt-1">12</h3></div>
              </div>

              {/* SCANNER */}
              <div className="bg-gradient-to-b from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-3xl p-8 text-center" onClick={handleScan}>
                  <div className={`w-32 h-32 mx-auto rounded-full bg-black border-4 flex items-center justify-center mb-4 transition duration-500 ${scanning ? 'border-emerald-500 animate-pulse shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'border-zinc-700'}`}>
                      <Camera size={40} className={scanning ? 'text-emerald-500' : 'text-zinc-500'}/>
                  </div>
                  <h3 className="text-xl font-black uppercase mb-1">{scanning ? "Lendo..." : "Ler QR Code"}</h3>
                  <p className="text-xs text-zinc-400">Aponte a câmera para o celular do aluno</p>
              </div>

              {/* HISTORICO */}
              <div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Últimas Validações</h3>
                  <div className="space-y-2">
                      {[1,2,3].map(i => (
                          <div key={i} className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                              <div className="flex gap-3 items-center">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold">AL</div>
                                  <div><p className="text-xs font-bold text-white">Aluno {i}</p><p className="text-[9px] text-zinc-500">Há {i*10} min</p></div>
                              </div>
                              <span className="text-xs font-bold text-emerald-500">Validado</span>
                          </div>
                      ))}
                  </div>
              </div>
          </main>
      </div>
  );
}

function StoreIcon({size, className}: {size: number, className?: string}) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>}