"use client";

import React, { use, useState, useEffect } from "react";
import {
  ArrowLeft, Share2, MoreHorizontal, Zap, Crown, Fish, ShieldCheck, 
  Medal, CheckCircle, Star, LayoutGrid, Activity, Trophy, MessageCircle
} from "lucide-react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

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

export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"atividade" | "conquistas">("atividade");
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        // 1. Busca Dados do Usuário
        const docRef = doc(db, "users", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfileData(docSnap.data());
          
          // 2. Busca Posts Públicos do Usuário
          const qPosts = query(
              collection(db, "posts"), 
              where("userId", "==", id), 
              where("blocked", "==", false), // Só posts não bloqueados
              orderBy("createdAt", "desc"), 
              limit(10)
          );
          const postsSnap = await getDocs(qPosts);
          setUserPosts(postsSnap.docs.map(d => ({id: d.id, ...d.data()})));

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

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-bold uppercase tracking-widest animate-pulse">Carregando Perfil...</div>;
  if (!profileData) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">Usuário não encontrado.</div>;

  const planStyle = getPlanBadge(profileData.plano_badge);
  const patente = profileData.patente || "Peixinho";

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER FIXO */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-md z-30 border-b border-zinc-900 shadow-md">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">Perfil do Atleta</h1>
          <p className="text-xs font-bold text-emerald-400">@{profileData.apelido || "atleta"}</p>
        </div>
        <button className="p-2 -mr-2 text-zinc-400 hover:text-white transition">
          <MoreHorizontal size={24} />
        </button>
      </header>

      <main>
        {/* HERO SECTION */}
        <div className="relative mb-24">
          <div className="h-44 bg-gradient-to-b from-zinc-800 to-[#050505] border-b border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          </div>

          {/* Avatar */}
          <div className="absolute -bottom-16 left-6 z-20">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-[6px] border-[#050505] bg-zinc-900 overflow-hidden shadow-2xl">
                <img src={profileData.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover" alt={profileData.nome} />
              </div>
              <div className="absolute -top-1 -right-1 bg-emerald-500 text-black min-w-[2.5rem] h-8 px-2 rounded-full border-2 border-[#050505] flex items-center justify-center font-black text-[10px] z-20 shadow-lg">
                LV {Math.floor((profileData.xp || 0) / 1000) + 1}
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="absolute -bottom-12 right-6 flex items-center gap-2">
            <button className="p-3 rounded-2xl bg-zinc-900 text-zinc-400 border border-zinc-800 shadow-lg hover:text-white hover:bg-zinc-800 active:scale-95 transition">
              <Share2 size={18} />
            </button>
            <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-8 py-2.5 rounded-2xl text-xs font-black uppercase italic tracking-tighter transition shadow-lg flex items-center gap-2 active:scale-95 ${isFollowing ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
              {isFollowing ? "Seguindo" : "Seguir"}
            </button>
          </div>
        </div>

        {/* INFO */}
        <div className="px-6 mt-4 relative">
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-md">
                    {profileData.nome}
                </h2>
                {getPatenteIcon(patente)}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2 mb-6">
                {profileData.turma && (
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
                        {profileData.turma}
                    </p>
                )}
                <span className={`border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1.5 shadow-sm ${planStyle.color}`}>
                    {planStyle.icon} {planStyle.label}
                </span>
            </div>

            {/* ABAS */}
            <div className="flex gap-4 border-b border-zinc-900 mb-4">
                <button onClick={() => setActiveTab("atividade")} className={`pb-2 text-sm font-bold uppercase transition ${activeTab === "atividade" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Atividade</button>
                <button onClick={() => setActiveTab("conquistas")} className={`pb-2 text-sm font-bold uppercase transition ${activeTab === "conquistas" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-500"}`}>Conquistas</button>
            </div>

            {/* CONTEÚDO DA ABA */}
            {activeTab === "atividade" && (
                <div className="grid grid-cols-3 gap-2">
                    {userPosts.map(post => (
                        <div key={post.id} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative group">
                            {post.imagem ? (
                                <img src={post.imagem} className="w-full h-full object-cover"/>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center p-2 text-center text-[8px] text-zinc-500 italic">
                                    "{post.texto?.slice(0, 30)}..."
                                </div>
                            )}
                        </div>
                    ))}
                    {userPosts.length === 0 && <div className="col-span-3 text-center py-10 text-zinc-600 text-xs italic">Nenhuma atividade recente.</div>}
                </div>
            )}

            {activeTab === "conquistas" && (
                <div className="text-center py-10 text-zinc-600 text-xs italic bg-zinc-900/30 rounded-2xl border border-zinc-800 border-dashed">
                    <Trophy size={32} className="mx-auto mb-2 opacity-50"/>
                    Conquistas privadas.
                </div>
            )}
        </div>
      </main>
    </div>
  );
}