"use client";

import React, { useState, useRef } from "react";
import { ArrowLeft, Settings, Share2, Edit3, Camera, Loader2, Crown, ShieldCheck, Fish, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";

// 🦈 IMPORTS CORRIGIDOS PELO MAPA
import { useAuth } from "../../context/AuthContext";       // Pasta src/context
import SharkAvatar from "../components/SharkAvatar";    // Pasta src/components
import { uploadImage } from "../../lib/upload";            // Pasta src/lib (ACABAMOS DE CRIAR)

// --- HELPERS (Mantidos) ---
const getPlanBadge = (plano: string) => {
  const p = plano?.toLowerCase() || "cação";
  if (p.includes("rei")) return { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50", icon: <Crown size={12} />, label: "Tubarão Rei" };
  if (p.includes("titular")) return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/50", icon: <ShieldCheck size={12} />, label: "Tubarão Titular" };
  return { color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: <Fish size={12} />, label: "Plano Cação" };
};

const getPatenteIcon = (patente: string) => {
    const p = patente?.toLowerCase() || "";
    if (p.includes("megalodon")) return <div className="text-red-600 bg-red-600/10 rounded-full p-1" title="Megalodon"><Zap size={14} fill="currentColor"/></div>;
    return <div className="text-blue-400 bg-blue-400/10 rounded-full p-1" title="Verificado"><CheckCircle size={14} fill="currentColor"/></div>;
};

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div className="h-screen flex items-center justify-center text-white bg-[#050505]">Carregando cardume... 🦈</div>;

  const planStyle = getPlanBadge(user.plano || "Tubarão Titular");
  const patente = user.patente || "Megalodon";

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
        const result = await uploadImage(file, "perfil");
        if (result.url) {
            await updateUser({ foto: result.url });
            alert("Foto atualizada com sucesso! 📸");
        }
    } catch (error) {
        console.error(error);
        alert("Erro ao subir foto.");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-md z-30 border-b border-zinc-900 shadow-md">
        <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Meu Perfil</h1>
          <p className="text-xs font-bold text-[#4ade80]">{user.handle || "@atleta"}</p>
        </div>
        <Link href="/configuracoes" className="p-2 -mr-2 text-zinc-400 hover:text-white">
          <Settings size={24} />
        </Link>
      </header>

      <main>
        {/* HERO SECTION */}
        <div className="relative mb-28">
          <div className="h-44 bg-gradient-to-b from-[#1a3a2a] to-[#050505] border-b border-white/5 relative">
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-16 h-16 bg-[#050505] rounded-full p-1 border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                        <img src="/logo.png" alt="AAAKN" className="w-full h-full object-contain opacity-90" />
                  </div>
              </div>
          </div>

          {/* AVATAR COM UPLOAD */}
          <div className="absolute -bottom-20 left-4 z-10">
            <div 
                className="relative group cursor-pointer" 
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className={`w-36 h-36 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] ${uploading ? 'opacity-50' : ''}`}>
                <img src={user.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover scale-110" alt={user.nome} />
              </div>

              {/* Overlay Câmera */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera className="text-white drop-shadow-md" size={32} />
              </div>
              
              {/* Loading */}
              {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center z-30">
                      <Loader2 className="animate-spin text-[#4ade80]" size={40}/>
                  </div>
              )}
              
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

              <div className="absolute -top-1 -left-1 bg-[#4ade80] text-black min-w-[2.5rem] h-10 px-2 rounded-full border-4 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg whitespace-nowrap">
                LV{user.level || 1}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-16 right-4 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-white border border-zinc-800 shadow-lg hover:bg-zinc-800 active:scale-95 transition">
              <Share2 size={18} />
            </button>
            <Link href="/cadastro" className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-[#4ade80] text-black hover:bg-[#22c55e] active:scale-95">
              <Edit3 size={16} /> Editar
            </Link>
          </div>
        </div>

        {/* INFO */}
        <div className="px-6 mt-8 relative">
            <div className="absolute top-0 right-6 -mt-24 pointer-events-none z-10 select-none">
                <SharkAvatar name="Sharky" size="md" />
            </div>

            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    {user.nome}
                </h2>
                {getPatenteIcon(patente)}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 mb-4">
                {user.turma && (
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest bg-zinc-900/50 px-2 py-0.5 rounded-md border border-zinc-800/50">
                        {user.turma} • Medicina
                    </p>
                )}
                <span className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm ${planStyle.color}`}>
                   {planStyle.icon} {planStyle.label}
                </span>
            </div>
        </div>
      </main>
    </div>
  );
}