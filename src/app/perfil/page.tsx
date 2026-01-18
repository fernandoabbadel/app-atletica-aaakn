"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Settings, Share2, Edit3, Camera, Loader2, 
  Crown, ShieldCheck, Fish, Zap, CheckCircle, Trophy, 
  LayoutGrid, Star, Activity 
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { storage, db } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "../../context/ToastContext";

// --- HELPERS VISUAIS ---
const getPlanBadge = (plano: string) => {
  const p = (plano || "").toLowerCase();
  if (p.includes("lenda")) return { color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/50", icon: <Crown size={12} />, label: "Lenda dos Jogos" };
  if (p.includes("atleta")) return { color: "bg-purple-500/10 text-purple-500 border-purple-500/50", icon: <Star size={12} />, label: "Atleta de Bar" };
  if (p.includes("cardume")) return { color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/50", icon: <ShieldCheck size={12} />, label: "Cardume Livre" };
  return { color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: <Fish size={12} />, label: "Bicho Solto" };
};

const getPatenteIcon = (patente: string) => {
    const p = (patente || "").toLowerCase();
    if (p.includes("megalodon")) return <div className="text-red-600 bg-red-600/10 rounded-full p-1 border border-red-500/20" title="Megalodon"><Zap size={14} fill="currentColor"/></div>;
    return <div className="text-blue-400 bg-blue-400/10 rounded-full p-1 border border-blue-500/20" title="Verificado"><CheckCircle size={14} fill="currentColor"/></div>;
};

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div className="h-screen flex items-center justify-center bg-[#050505] text-emerald-500"><Loader2 className="animate-spin" size={40}/></div>;

  // 🦈 CORREÇÃO CRÍTICA AQUI: Adicionado || "" para evitar undefined
  const planStyle = getPlanBadge(user.plano_badge || ""); 
  const patente = user.patente || "Peixinho";

  // --- UPLOAD DE FOTO ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        addToast("A imagem deve ter no máximo 2MB.", "error");
        return;
    }

    setUploading(true);
    try {
        const storageRef = ref(storage, `perfis/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { foto: downloadUrl });

        if (updateUser) updateUser({ foto: downloadUrl });
        
        addToast("Foto de perfil atualizada!", "success");
    } catch (error) {
        console.error(error);
        addToast("Erro ao atualizar foto.", "error");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-30 border-b border-zinc-900 shadow-md">
        <Link href="/dashboard" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Meu Perfil</h1>
          <p className="text-xs font-bold text-emerald-400">@{user.apelido || "atleta"}</p>
        </div>
        <Link href="/configuracoes" className="p-2 -mr-2 text-zinc-400 hover:text-white">
          <Settings size={24} />
        </Link>
      </header>

      <main>
        <div className="relative mb-24">
          <div className="h-44 bg-gradient-to-b from-emerald-900/40 to-[#050505] border-b border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20">
                  <div className="w-16 h-16 bg-[#050505] rounded-full p-1 border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                        <img src="/logo.png" alt="AAAKN" className="w-full h-full object-contain opacity-90" />
                  </div>
              </div>
          </div>

          <div className="absolute -bottom-16 left-6 z-20">
            <div 
                className="relative group cursor-pointer" 
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <div className={`w-32 h-32 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl transition-all duration-500 group-hover:border-emerald-500/50 ${uploading ? 'opacity-50' : ''}`}>
                <img src={user.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover" alt="Avatar" />
              </div>

              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                 <Camera className="text-emerald-400 drop-shadow-md" size={32} />
                 <span className="text-[10px] text-white absolute bottom-8 font-bold uppercase">Alterar</span>
              </div>
              
              {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center z-30">
                      <Loader2 className="animate-spin text-emerald-500" size={40}/>
                  </div>
              )}
              
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />

              <div className="absolute -top-1 -right-1 bg-zinc-900 text-white min-w-[2.5rem] h-8 px-2 rounded-full border-2 border-zinc-700 flex items-center justify-center font-black text-[10px] z-20 shadow-lg whitespace-nowrap">
                LV {Math.floor((user.xp || 0) / 1000) + 1}
              </div>
            </div>
          </div>

          <div className="absolute -bottom-12 right-6 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-zinc-400 border border-zinc-800 shadow-lg hover:text-white hover:bg-zinc-800 active:scale-95 transition">
              <Share2 size={18} />
            </button>
            <Link href="/configuracoes" className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 bg-emerald-600 text-black hover:bg-emerald-500 active:scale-95">
              <Edit3 size={16} /> Editar
            </Link>
          </div>
        </div>

        <div className="px-6 mt-4 relative">
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    {user.nome || "Atleta"}
                </h2>
                {getPatenteIcon(patente)}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 mb-6">
                {user.turma && (
                    <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                        {user.turma}
                    </p>
                )}
                <span className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm ${planStyle.color}`}>
                    {planStyle.icon} {planStyle.label}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                    <Activity size={24} className="text-emerald-500 mb-2"/>
                    <span className="text-2xl font-black text-white">{user.xp || 0}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">XP Acumulado</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center justify-center">
                    <Trophy size={24} className="text-yellow-500 mb-2"/>
                    <span className="text-2xl font-black text-white">0</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">Conquistas</span>
                </div>
            </div>

            <div className="border-t border-zinc-900 pt-6">
                <div className="flex gap-6 text-sm font-bold text-zinc-500 border-b border-zinc-900 pb-2 mb-4 overflow-x-auto">
                    <span className="text-white border-b-2 border-emerald-500 pb-2">Atividade</span>
                    <span className="hover:text-zinc-300 cursor-pointer">Fotos</span>
                    <span className="hover:text-zinc-300 cursor-pointer">Eventos</span>
                </div>
                
                <div className="text-center py-10 opacity-50">
                    <LayoutGrid size={40} className="mx-auto mb-2 text-zinc-600"/>
                    <p className="text-xs text-zinc-500">Nenhuma atividade recente para exibir.</p>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}