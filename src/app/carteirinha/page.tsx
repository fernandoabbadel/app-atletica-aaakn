"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  Crown,
  ChevronRight,
  ShieldCheck,
  QrCode,
  X,
  UserCheck,
  Star,
  Ghost,
  ShoppingBag
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { QRCodeSVG } from "qrcode.react";

export default function CarteirinhaPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  // 1. Buscar Configuração Visual do Admin (Validade e Backgrounds customizados)
  useEffect(() => {
      const fetchConfig = async () => {
          try {
              const docRef = doc(db, "app_config", "carteirinha");
              const snap = await getDoc(docRef);
              if (snap.exists()) {
                  setConfig(snap.data());
              }
          } catch (e) {
              console.error("Erro config carteirinha", e);
          } finally {
              setLoadingConfig(false);
          }
      };
      fetchConfig();
  }, []);

  if (!user) return null;

  // --- LÓGICA DE FUNDO (BACKGROUND) ---
  // 1. Tenta pegar do Admin. 2. Tenta pegar da pasta public (ex: turma5.jpeg). 3. Fallback cinza.
  const numTurma = user.turma ? user.turma.replace(/\D/g, "") : "1";
  const bgPadrao = `/turma${numTurma}.jpeg`;
  const bgFinal = config?.backgrounds?.[user.turma || ""] || bgPadrao;
  const validadeTexto = config?.validade || "DEZ/2026";

  // --- LÓGICA VISUAL DO PLANO ---
  // Define cores e ícones baseados no nome do plano
  const getPlanStyle = (plano: string) => {
      const p = (plano || "").toLowerCase();
      
      if (p.includes("lenda")) {
          return { label: "Lenda", color: "text-yellow-500", border: "border-yellow-500/30", bg: "bg-yellow-500/10", icon: Crown };
      }
      if (p.includes("atleta")) {
          return { label: "Atleta", color: "text-purple-500", border: "border-purple-500/30", bg: "bg-purple-500/10", icon: Star };
      }
      if (p.includes("cardume") || p.includes("livre")) {
          return { label: "Cardume", color: "text-emerald-500", border: "border-emerald-500/30", bg: "bg-emerald-500/10", icon: ShoppingBag };
      }
      // Padrão (Sócio Standard / Bicho Solto)
      return { label: "Standard", color: "text-zinc-400", border: "border-zinc-700", bg: "bg-zinc-800", icon: UserCheck };
  };

  const currentPlanName = user.plano_badge || "Sócio Standard";
  const style = getPlanStyle(currentPlanName);
  const PlanIcon = style.icon;
  const isStandard = style.label === "Standard"; // Flag para mostrar botão de upgrade

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-emerald-500/30">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-md">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2 text-emerald-500">
          <CreditCard size={16} /> Identidade Digital
        </h1>
        <div className="w-8"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden space-y-8">
        
        {/* Luz de fundo ambiente */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        {/* --- CARTÃO DIGITAL --- */}
        <div className="relative w-full max-w-[380px] aspect-[1.58/1] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(16,185,129,0.25)] border border-zinc-800 bg-[#0a0a0a]">
          
          {/* === CAMADA DE FUNDO === */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-zinc-900">
                <img
                    src={bgFinal}
                    alt="Background Turma"
                    className="w-full h-full object-cover opacity-50 mix-blend-luminosity brightness-75 blur-[1px] scale-110"
                    onError={(e) => (e.currentTarget.src = "/carteirinha-bg-default.jpg")}
                />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-[#0a2e23]/80 to-black/90 mix-blend-multiply"></div>
            <div className="absolute inset-0 opacity-[0.1] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>

          {/* CONTEÚDO PRINCIPAL DO CARTÃO */}
          <div className="relative h-full p-4 flex flex-col justify-between z-10">
            
            {/* CABEÇALHO */}
            <div className="flex justify-between items-start border-b border-white/10 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center shadow-lg border border-zinc-700 p-1">
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div className="drop-shadow-md">
                  <h2 className="font-black text-white text-base leading-none tracking-tight">AAAKN</h2>
                  <p className="text-emerald-400 text-[8px] uppercase tracking-widest font-bold mt-0.5">Medicina Caraguá</p>
                </div>
              </div>

              {/* Status + Plano (Com cores dinâmicas) */}
              <div className="flex flex-col items-end gap-1">
                <div className="bg-black/40 backdrop-blur-md text-emerald-400 text-[9px] font-black px-3 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div> ATIVO
                </div>
                <div className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex items-center gap-1 ${style.color} ${style.border} ${style.bg}`}>
                    <PlanIcon size={8} /> {currentPlanName}
                </div>
              </div>
            </div>

            {/* DADOS DO ALUNO */}
            <div className="flex gap-3 items-center mt-1 flex-1">
              <div className="w-20 h-24 flex-shrink-0 rounded-xl border border-emerald-500/50 p-0.5 bg-black/60 shadow-2xl relative overflow-hidden group">
                <img
                  src={user.foto || "https://github.com/shadcn.png"}
                  className="w-full h-full object-cover rounded-lg opacity-95"
                  alt="Foto"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
              </div>

              <div className="flex-1 space-y-1.5 drop-shadow-lg">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 text-shadow">Nome do Atleta</p>
                  <h3 className="text-white font-black text-sm leading-tight line-clamp-2 uppercase">{user.nome || user.apelido}</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 text-shadow">Curso</p>
                    <p className="text-xs text-zinc-100 font-bold">MEDICINA</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-emerald-500 uppercase font-bold tracking-wider mb-0.5 text-shadow">Turma</p>
                    <p className="text-xs text-emerald-400 font-black">{user.turma || "CALOURO"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RODAPÉ E QR PEQUENO */}
            <div className="flex justify-between items-end mt-1 pt-2 border-t border-white/10">
              <div className="space-y-2 drop-shadow-md">
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 leading-none text-shadow">Matrícula</p>
                  <p className="text-xs text-white font-mono tracking-tight leading-none">{user.matricula || "---"}</p>
                </div>
                <div>
                  <p className="text-[8px] text-zinc-400 uppercase font-bold tracking-wider mb-0.5 leading-none text-shadow">Validade</p>
                  {loadingConfig ? <div className="h-3 w-16 bg-white/10 animate-pulse rounded"></div> : <p className="text-xs text-white font-mono leading-none">{validadeTexto}</p>}
                </div>
              </div>
              <div className="bg-white p-1 rounded-md shadow-xl flex-shrink-0 ml-2">
                <QRCodeSVG value={user.uid} size={48} />
              </div>
            </div>
          </div>
        </div>

        {/* --- AÇÕES INFERIORES --- */}
        <div className="w-full max-w-[380px] space-y-3">
          
          {/* BOTÃO UPGRADE (SÓ APARECE SE FOR STANDARD) */}
          {isStandard && (
              <Link
                href="/planos"
                className="block w-full bg-gradient-to-r from-emerald-600 to-emerald-800 p-4 rounded-xl border border-emerald-500/30 group relative overflow-hidden shadow-lg transform active:scale-95 transition"
              >
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-black/30 p-2 rounded-full text-emerald-200"><Crown size={20} /></div>
                    <div>
                      <span className="block text-xs font-bold text-emerald-200 uppercase tracking-wider">Seja Sócio</span>
                      <span className="block text-sm font-black text-white">Fazer Upgrade Agora</span>
                    </div>
                  </div>
                  <ChevronRight className="text-emerald-200 group-hover:translate-x-1 transition" />
                </div>
              </Link>
          )}

          {/* BOTÃO QR CODE AMPLIADO */}
          <button 
            onClick={() => setShowQrModal(true)}
            className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition w-full py-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-zinc-800 shadow-lg"
          >
            <QrCode size={16} /> Apresente este QR Code na entrada
          </button>

          <p className="text-emerald-700/60 text-[10px] flex items-center justify-center gap-1 uppercase font-bold tracking-widest mt-2">
            <ShieldCheck size={12} /> Documento Oficial Validado
          </p>
        </div>
      </main>

      {/* --- MODAL QR CODE --- */}
      {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 animate-in fade-in duration-200" onClick={() => setShowQrModal(false)}>
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center relative shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowQrModal(false)} className="absolute top-5 right-5 text-zinc-400 hover:text-black bg-zinc-100 p-2 rounded-full transition"><X size={24}/></button>
                  
                  <div className="mb-6">
                      <h3 className="text-black font-black text-2xl uppercase italic">Seu Passe</h3>
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Aproxime do Leitor</p>
                  </div>

                  <div className="p-4 border-4 border-black rounded-3xl mb-6">
                      <QRCodeSVG value={user.uid} size={250} />
                  </div>

                  <div className="w-full bg-zinc-100 py-3 rounded-xl">
                      <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest mb-1">ID do Usuário</p>
                      <p className="text-xs text-black font-mono font-bold truncate px-4">{user.uid}</p>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}