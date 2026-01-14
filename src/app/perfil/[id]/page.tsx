"use client";

import React, { use, useState, useEffect } from "react";
import {
  ArrowLeft, Share2, MoreHorizontal, Zap, Crown, Martini, Ticket, Fish, Anchor, ShieldCheck, Medal, CheckCircle, Heart, MessageCircle, Dumbbell, Flame, Trophy, Instagram
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import SharkAvatar from "../../components/SharkAvatar"; 
// 🦈 IMPORTS DO FIREBASE
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User } from "../../../context/AuthContext"; // Importando a tipagem do nosso Contexto

// ============================================================================
// 2. HELPERS VISUAIS (Mantive os seus, são ótimos!)
// ============================================================================
const getPlanBadge = (plano: string) => {
  const p = plano?.toLowerCase() || "cação";
  
  if (p.includes("rei")) return { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50", icon: <Crown size={12} />, label: "Tubarão Rei" };
  if (p.includes("lenda do bar")) return { color: "bg-purple-500/10 text-purple-500 border-purple-500/50", icon: <Martini size={12} />, label: "Lenda do Bar" };
  if (p.includes("eventos")) return { color: "bg-orange-500/10 text-orange-500 border-orange-500/50", icon: <Ticket size={12} />, label: "Lenda dos Eventos" };
  if (p.includes("martelo")) return { color: "bg-blue-500/10 text-blue-500 border-blue-500/50", icon: <Anchor size={12} />, label: "Tubarão Martelo" };
  if (p.includes("titular")) return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/50", icon: <ShieldCheck size={12} />, label: "Tubarão Titular" };
  
  return { color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: <Fish size={12} />, label: "Plano Cação" };
};

const getPatenteIcon = (patente: string) => {
    const p = patente?.toLowerCase() || "";
    if (p.includes("megalodon")) return <div className="text-red-600 bg-red-600/10 rounded-full p-1" title="Megalodon"><Zap size={14} fill="currentColor"/></div>;
    if (p.includes("branco")) return <div className="text-emerald-400 bg-emerald-400/10 rounded-full p-1" title="Tubarão Branco"><Medal size={14} fill="currentColor"/></div>;
    if (p.includes("martelo")) return <div className="text-purple-400 bg-purple-400/10 rounded-full p-1" title="Tubarão Martelo"><Anchor size={14} fill="currentColor"/></div>;
    return <div className="text-blue-400 bg-blue-400/10 rounded-full p-1" title="Verificado"><CheckCircle size={14} fill="currentColor"/></div>;
};

// ============================================================================
// 3. COMPONENTE DA PÁGINA
// ============================================================================

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [activeTab, setActiveTab] = useState<"activities" | "conquests" | "community">("activities");
  
  // 🦈 ESTADO PARA DADOS REAIS
  const [profileData, setProfileData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🦈 BUSCA NO FIREBASE
  useEffect(() => {
    async function fetchUser() {
      try {
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data() as User);
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white font-bold animate-pulse">SONAR LIGADO... 📡</div>;
  if (!profileData) return notFound();

  // Estilos Calculados
  const planStyle = getPlanBadge(profileData.plano || "Cação");
  const patente = profileData.patente || "Iniciante";

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER FIXO */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900 shadow-md">
        <Link href="/ranking" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Perfil do Atleta</h1>
          <p className="text-xs font-bold text-[#4ade80]">{profileData.handle || "@sem.handle"}</p>
        </div>
        <button className="p-2 -mr-2 text-zinc-400 hover:text-white transition">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main>
        {/* HERO SECTION */}
        <div className="relative mb-28">
          <div className="h-44 bg-gradient-to-b from-[#1a3a2a] to-[#050505] border-b border-white/5 relative">
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-16 h-16 bg-[#050505] rounded-full p-1 border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                        <img src="/logo.png" alt="AAAKN Logo" className="w-full h-full object-contain opacity-90 drop-shadow-md" />
                  </div>
              </div>
          </div>

          {/* Avatar do Usuário */}
          <div className="absolute -bottom-20 left-4 z-10">
            <div className="relative group cursor-pointer">
              <div className="w-36 h-36 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                <img src={profileData.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover scale-110" alt={profileData.nome} />
              </div>
              
              <div className="absolute -top-1 -left-1 bg-[#4ade80] text-black min-w-[2.5rem] h-10 px-2 rounded-full border-4 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg animate-pulse whitespace-nowrap">
                LV{profileData.level || 1}
              </div>

              {profileData.turma && (
                  <div className="absolute -bottom-2 -right-2 w-14 h-14 bg-white rounded-full border-[4px] border-[#050505] flex items-center justify-center shadow-lg overflow-hidden z-10">
                    <img 
                        src={`/turma${profileData.turma.replace(/\D/g, "")}.jpeg`} 
                        className="w-full h-full object-cover" 
                        alt={profileData.turma} 
                        onError={(e) => (e.currentTarget.src = "/logo.png")} 
                    />
                  </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="absolute -bottom-16 right-4 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-lg hover:bg-zinc-800 active:scale-95 transition">
              <Share2 size={18} />
            </button>
            <button className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-[#4ade80] text-black hover:bg-[#22c55e] active:scale-95 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)]">
              Seguir
            </button>
          </div>
        </div>

        {/* INFO DO PERFIL */}
        <div className="px-6 mt-8 relative">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-24 z-20 pointer-events-auto hover:scale-110 transition-transform duration-300">
                <SharkAvatar name="Sharky" size="lg" />
            </div>

            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    {profileData.nome}
                </h2>
                {getPatenteIcon(patente)}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                {profileData.turma && (
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest bg-zinc-900/50 px-2 py-0.5 rounded-md border border-zinc-800/50">
                        {profileData.turma} • Medicina
                    </p>
                )}
                <span className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm ${planStyle.color}`}>
                   {planStyle.icon} {planStyle.label}
                </span>
            </div>

            {/* Stats XP */}
            <div className="p-4 rounded-[2rem] border bg-[#4ade80] border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.2)] flex flex-col items-center justify-center relative overflow-hidden mt-4">
                <div className="absolute inset-0 bg-white/10 blur-xl"></div>
                <span className="block text-xl font-black italic text-black relative z-10">{profileData.xp || 0}</span>
                <span className="block text-[8px] font-black uppercase tracking-widest text-center text-black/60 relative z-10 mt-1">XP Geral</span>
            </div>
        </div>
        
        {/* CONTEÚDO EM BRANCO (Pode adicionar os mocks de volta aqui se quiser depois) */}
        <div className="p-10 text-center text-zinc-600 italic text-sm">
            Histórico oculto pelo atleta.
        </div>

      </main>
    </div>
  );
}