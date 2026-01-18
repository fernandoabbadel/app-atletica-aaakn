"use client";

import React, { use, useState, useEffect } from "react";
import { 
  ArrowLeft, MoreHorizontal, Crown, Fish, Zap, CheckCircle, 
  Trophy, LayoutGrid, Star, Users, Heart, Lock, Loader2, UserPlus, 
  Instagram, Phone, PawPrint, Award
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { db } from "../../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ACHIEVEMENTS_CATALOG } from "../../../lib/achievements";

// --- MAPEAMENTO DE CAPAS ---
const TURMA_COVERS: Record<string, string> = {
  "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
  "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
  "T7": "/turma7.jpeg", "T8": "/turma8.jpeg", "T9": "/turma9.jpeg"
};

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

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"atividade" | "conquistas" | "ficha">("atividade");
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const docSnap = await getDoc(doc(db, "users", id));
        if (docSnap.exists()) setProfileData(docSnap.data());
        else router.push("/dashboard");
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchUser();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;
  if (!profileData) return null;

  const plan = getPlanBadge(profileData.plano_badge || "");
  const xpBadge = getXPBadge(profileData.xp || 0);
  const coverImage = profileData.turma ? TURMA_COVERS[profileData.turma] : "/logo.png";

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-30 border-b border-zinc-900">
        <button onClick={() => router.back()} className="p-2 text-zinc-400"><ArrowLeft size={24} /></button>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-widest text-zinc-500">Perfil do Atleta</h1>
          <p className="text-xs font-bold text-emerald-400">@{profileData.apelido || "atleta"}</p>
        </div>
        <button className="p-2 text-zinc-400"><MoreHorizontal size={24} /></button>
      </header>

      <main>
        {/* CAPA TURMA */}
        <div className="relative mb-16">
          <div className="h-48 bg-zinc-900 border-b border-white/5 overflow-hidden">
             <img src={coverImage} className="w-full h-full object-cover opacity-60" />
             <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
             {profileData.turma && <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase tracking-widest">{profileData.turma}</div>}
          </div>
          
          <div className="absolute -bottom-12 left-6 z-20">
            <div className="w-32 h-32 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl">
              <img src={profileData.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover" />
            </div>
          </div>
          
          <div className="absolute -bottom-10 right-6 flex items-center gap-2">
            <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase transition flex items-center gap-2 ${isFollowing ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-black'}`}
            >
              {isFollowing ? "Seguindo" : <><UserPlus size={16}/> Seguir</>}
            </button>
          </div>
        </div>

        <div className="px-6 mt-6">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">{profileData.nome}</h2>
          
          {/* BADGES COM RÓTULOS */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Plano</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${plan.color}`}>{plan.label}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Patente</span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${xpBadge.color}`}>{xpBadge.label}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">Fidelidade</span>
                <span className="px-3 py-1 rounded-full text-[10px] font-black border border-blue-500/20 bg-blue-500/10 text-blue-400">Sócio</span>
            </div>
          </div>

          <div className="mt-6 space-y-4">
             <p className="text-sm text-zinc-400 leading-relaxed max-w-md italic border-l-2 border-emerald-500 pl-3">
                "{profileData.bio || "O tubarão ainda não escreveu seu grito de guerra..."}"
             </p>
             
             {/* Redes Sociais */}
             <div className="flex gap-3">
                {profileData.instagram && (
                    <Link href={`https://instagram.com/${profileData.instagram.replace('@', '')}`} target="_blank" className="p-2 bg-zinc-900 rounded-lg text-pink-500 hover:text-white hover:bg-pink-600 transition border border-zinc-800">
                        <Instagram size={18}/>
                    </Link>
                )}
                {profileData.telefone && profileData.whatsappPublico && (
                    <Link href={`https://wa.me/55${profileData.telefone.replace(/\D/g, '')}`} target="_blank" className="p-2 bg-zinc-900 rounded-lg text-emerald-500 hover:text-white hover:bg-emerald-600 transition border border-zinc-800">
                        <Phone size={18}/>
                    </Link>
                )}
             </div>

             <div className="flex gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest pt-2">
                <button className="hover:text-white transition">0 Seguidores</button>
                <button className="hover:text-white transition">0 Seguindo</button>
             </div>
          </div>

          <div className="flex gap-6 mt-10 border-b border-zinc-900 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab("atividade")} className={`pb-4 text-xs font-black uppercase transition whitespace-nowrap ${activeTab === "atividade" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Atividade</button>
            <button onClick={() => setActiveTab("conquistas")} className={`pb-4 text-xs font-black uppercase transition whitespace-nowrap ${activeTab === "conquistas" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Conquistas</button>
            <button onClick={() => setActiveTab("ficha")} className={`pb-4 text-xs font-black uppercase transition whitespace-nowrap ${activeTab === "ficha" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Ficha Técnica</button>
          </div>

          <div className="py-8 min-h-[200px]">
            {activeTab === "atividade" && (
                <div className="text-center py-10 opacity-30">
                    <LayoutGrid size={48} className="mx-auto mb-4"/>
                    <p className="text-xs font-bold uppercase tracking-widest">Nenhuma atividade</p>
                </div>
            )}

            {activeTab === "conquistas" && (
              <div className="grid grid-cols-1 gap-3">
                {ACHIEVEMENTS_CATALOG.slice(0, 3).map(ach => (
                   <div key={ach.id} className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex items-center gap-4 opacity-40 grayscale">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-600"><Lock size={16}/></div>
                      <div className="flex-1"><p className="text-[10px] font-black text-white uppercase">{ach.titulo}</p></div>
                   </div>
                ))}
              </div>
            )}

            {activeTab === "ficha" && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500"><PawPrint size={20}/></div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-bold">Mascote</p>
                                <p className="text-sm font-bold text-white capitalize">{profileData.pets || "Nenhum"}</p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Award size={14} className="text-emerald-500"/> Modalidades</h4>
                        <div className="flex flex-wrap gap-2">
                            {profileData.esportes?.length > 0 ? profileData.esportes.map((esp: string) => (
                                <span key={esp} className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold text-zinc-300 capitalize">
                                    {esp}
                                </span>
                            )) : <p className="text-xs text-zinc-600 italic">Nenhuma modalidade.</p>}
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