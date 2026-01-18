"use client";

import React, { useState, useRef } from "react";
import { 
  ArrowLeft, Settings, Share2, Edit3, Camera, Loader2, 
  Crown, ShieldCheck, Fish, Zap, CheckCircle, Trophy, 
  LayoutGrid, Star, Activity, Users, Heart, Lock, 
  Instagram, Phone, PawPrint, Award
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { storage, db } from "../../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "../../context/ToastContext";
import { ACHIEVEMENTS_CATALOG } from "../../lib/achievements";

// --- MAPEAMENTO DE CAPAS DAS TURMAS ---
const TURMA_COVERS: Record<string, string> = {
  "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
  "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
  "T7": "/turma7.jpeg", "T8": "/turma8.jpeg", "T9": "/turma9.jpeg"
};

// --- HELPERS VISUAIS ---
const getPlanBadge = (plano: string) => {
  const p = (plano || "").toLowerCase();
  if (p.includes("lenda")) return { color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20", icon: <Crown size={12} />, label: "Lenda" };
  if (p.includes("atleta")) return { color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: <Star size={12} />, label: "Atleta" };
  return { color: "text-zinc-400 bg-zinc-800 border-zinc-700", icon: <Fish size={12} />, label: "Bicho Solto" };
};

const getXPBadge = (xp: number) => {
  if (xp >= 50000) return { label: "Megalodon", color: "text-red-500 bg-red-500/10 border-red-500/20" };
  if (xp >= 15000) return { label: "Branco", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" };
  return { label: "Plâncton", color: "text-zinc-500 bg-zinc-800 border-zinc-700" };
};

export default function MyProfilePage() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  
  // NOVA ABA "FICHA"
  const [activeTab, setActiveTab] = useState<"atividade" | "conquistas" | "ficha">("atividade");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div className="h-screen flex items-center justify-center bg-[#050505] text-emerald-500"><Loader2 className="animate-spin" size={40}/></div>;

  const plan = getPlanBadge(user.plano_badge || "");
  const xpBadge = getXPBadge(user.xp || 0);
  const coverImage = user.turma ? TURMA_COVERS[user.turma] : "/logo.png"; // Fallback

  // --- UPLOAD DE FOTO ---
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return addToast("Máximo 2MB, tubarão!", "error");

    setUploading(true);
    try {
        const storageRef = ref(storage, `perfis/${user.uid}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        
        await updateDoc(doc(db, "users", user.uid), { foto: downloadUrl });
        if (updateUser) updateUser({ foto: downloadUrl });
        
        addToast("Foto atualizada!", "success");
    } catch (error) {
        addToast("Erro no upload.", "error");
    } finally {
        setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      
      {/* HEADER */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-30 border-b border-zinc-900">
        <Link href="/dashboard" className="p-2 text-zinc-400 hover:text-white"><ArrowLeft size={24} /></Link>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-widest text-zinc-500">Meu Perfil</h1>
          <p className="text-xs font-bold text-emerald-400">@{user.apelido || "atleta"}</p>
        </div>
        <Link href="/configuracoes" className="p-2 text-zinc-400 hover:text-white"><Settings size={24} /></Link>
      </header>

      <main>
        {/* CAPA DA TURMA */}
        <div className="relative mb-16">
          <div className="h-48 bg-zinc-900 border-b border-white/5 overflow-hidden relative group">
             <img src={coverImage} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-1000" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
             {/* Badge da Turma na Capa */}
             {user.turma && <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase tracking-widest">{user.turma}</div>}
          </div>

          <div className="absolute -bottom-12 left-6 z-20">
            <div className="relative group cursor-pointer" onClick={() => !uploading && fileInputRef.current?.click()}>
              <div className={`w-32 h-32 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl ${uploading ? 'opacity-50' : ''}`}>
                <img src={user.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
              {uploading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500"/></div>}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            </div>
          </div>

          {/* BOTÃO EDITAR (AGORA VAI PRO CADASTRO) */}
          <div className="absolute -bottom-10 right-6 flex items-center gap-2">
            <Link href="/cadastro" className="px-6 py-2.5 rounded-2xl text-xs font-black uppercase bg-emerald-600 text-black hover:bg-emerald-500 transition flex items-center gap-2 shadow-lg shadow-emerald-900/20">
              <Edit3 size={16} /> Editar
            </Link>
          </div>
        </div>

        {/* INFO PRINCIPAL */}
        <div className="px-6 mt-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">{user.nome}</h2>
          
          {/* BADGES COM RÓTULOS (COMENTÁRIOS ACIMA) */}
          <div className="flex flex-wrap gap-4 mt-6">
            
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Plano</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1.5 ${plan.color}`}>
                  {plan.icon} {plan.label}
                </span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Patente</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1.5 ${xpBadge.color}`}>
                  <Zap size={10} fill="currentColor"/> {xpBadge.label}
                </span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Fidelidade</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase border border-blue-500/20 bg-blue-500/10 text-blue-400 flex items-center gap-1.5">
                  <CheckCircle size={10} fill="currentColor"/> Sócio
                </span>
            </div>

          </div>

          {/* BIO & REDES SOCIAIS */}
          <div className="mt-6 space-y-4">
             <p className="text-sm text-zinc-400 leading-relaxed max-w-md italic border-l-2 border-emerald-500 pl-3">
                "{user.bio || "O tubarão ainda não escreveu seu grito de guerra..."}"
             </p>
             
             {/* Redes Sociais */}
             <div className="flex gap-3">
                {user.instagram && (
                    <Link href={`https://instagram.com/${user.instagram.replace('@', '')}`} target="_blank" className="p-2 bg-zinc-900 rounded-lg text-pink-500 hover:text-white hover:bg-pink-600 transition border border-zinc-800">
                        <Instagram size={18}/>
                    </Link>
                )}
                {user.telefone && user.whatsappPublico && (
                    <Link href={`https://wa.me/55${user.telefone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-zinc-900 rounded-lg text-emerald-500 hover:text-white hover:bg-emerald-600 transition border border-zinc-800">
                        <Phone size={18}/>
                    </Link>
                )}
             </div>

             <div className="flex gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest pt-2">
                <span className="flex items-center gap-1"><Users size={14}/> 0 Seguidores</span>
                <span className="flex items-center gap-1"><Users size={14}/> 0 Seguindo</span>
             </div>
          </div>

          {/* ABAS (COM FICHA TÉCNICA) */}
          <div className="flex gap-6 mt-10 border-b border-zinc-900 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab("atividade")} className={`pb-4 text-xs font-black uppercase transition whitespace-nowrap ${activeTab === "atividade" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Atividade</button>
            <button onClick={() => setActiveTab("conquistas")} className={`pb-4 text-xs font-black uppercase transition whitespace-nowrap ${activeTab === "conquistas" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Conquistas</button>
            <button onClick={() => setActiveTab("ficha")} className={`pb-4 text-xs font-black uppercase transition whitespace-nowrap ${activeTab === "ficha" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Ficha Técnica</button>
          </div>

          {/* CONTEÚDO DAS ABAS */}
          <div className="py-8 min-h-[200px]">
            
            {activeTab === "atividade" && (
              <div className="text-center py-10 opacity-30">
                <LayoutGrid size={48} className="mx-auto mb-4"/>
                <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade recente</p>
              </div>
            )}

            {activeTab === "conquistas" && (
              <div className="grid grid-cols-1 gap-3">
                {ACHIEVEMENTS_CATALOG.slice(0, 5).map(ach => (
                   <div key={ach.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center gap-4 opacity-50 grayscale">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-600"><Trophy size={20}/></div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-white uppercase">{ach.titulo}</p>
                        <p className="text-[10px] text-zinc-500">{ach.desc}</p>
                      </div>
                      <Lock size={14} className="text-zinc-700"/>
                   </div>
                ))}
              </div>
            )}

            {activeTab === "ficha" && (
                <div className="space-y-6 animate-in fade-in">
                    {/* Mascote */}
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500"><PawPrint size={20}/></div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Mascote</p>
                                <p className="text-sm font-bold text-white capitalize">{user.pets || "Nenhum"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Modalidades */}
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} className="text-emerald-500"/> Modalidades</h4>
                        <div className="flex flex-wrap gap-2">
                            {/* 🦈 CORREÇÃO: Check de array seguro */}
                            {(user.esportes || []).length > 0 ? (user.esportes || []).map((esp: string) => (
                                <span key={esp} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 capitalize">
                                    {esp}
                                </span>
                            )) : <p className="text-xs text-zinc-600 italic">Nenhuma modalidade selecionada.</p>}
                        </div>
                    </div>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}