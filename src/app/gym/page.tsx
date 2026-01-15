"use client";

import React, { useState, useEffect } from "react";
import {
  Flame, MessageCircle, ArrowLeft,
  Calendar as CalendarIcon, CheckCircle2,
  History, Camera, Heart, Tag, Info, X
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  increment 
} from "firebase/firestore";

// --- TIPAGEM ---
interface Post {
    id: string;
    usuarioId: string;
    usuarioNome: string;
    usuarioAvatar: string;
    titulo: string;
    modalidade: string;
    legenda: string;
    data: string; // Armazenado como string formatada ou Timestamp convertido
    tempo: string;
    foto: string;
    isChallenge: boolean;
    validado: boolean;
    likes: number;
    likedBy: string[]; // Lista de UIDs que deram like
    comentarios: any[];
}

const ACTIVE_CHALLENGE = {
    titulo: "DESAFIO MEDCOF",
    subtitulo: "Valendo XP Dobrado",
    descricao: "Mostre sua rotina de treinos nas férias e domine o ranking. Vale qualquer modalidade cadastrada!",
    regras: ["Postar foto nítida.", "Válido 1x por dia.", "Fair play obrigatório."],
    inicio: "12/12",
    fim: "10/01",
    xp: 2000
};

export default function GymPage() {
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const [activeView, setActiveView] = useState<"feed" | "ranking" | "stats">("feed");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [detailPost, setDetailPost] = useState<Post | null>(null);

  // 🦈 LISTENER EM TEMPO REAL DO FIRESTORE
  useEffect(() => {
    // Cria a query: Coleção 'posts', ordenada por 'createdAt' decrescente
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

    // O onSnapshot mantem os dados vivos. Se alguém postar, aparece na hora.
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const novosPosts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Post[];
        
        setPosts(novosPosts);
        setLoading(false);
    }, (error) => {
        console.error("Erro ao buscar posts:", error);
        addToast("Erro ao carregar o feed.", "error");
        setLoading(false);
    });

    return () => unsubscribe();
  }, [addToast]);

  const handleBack = () => {
      if (activeView !== "feed") {
          setActiveView("feed");
      } else {
          window.location.href = "/dashboard"; 
      }
  };

  // 🦈 FUNÇÃO DE LIKE INTEGRADA
  const handleLike = async (post: Post) => {
    if (!user) return;

    const postRef = doc(db, "posts", post.id);
    const jaDeuLike = post.likedBy?.includes(user.uid);

    try {
        if (jaDeuLike) {
            // Remove Like
            await updateDoc(postRef, {
                likes: increment(-1),
                likedBy: arrayRemove(user.uid)
            });
        } else {
            // Adiciona Like
            await updateDoc(postRef, {
                likes: increment(1),
                likedBy: arrayUnion(user.uid)
            });
        }
    } catch (error) {
        console.error("Erro no like:", error);
        addToast("Erro ao curtir.", "error");
    }
  };

  const handleReport = () => {
      addToast("Denúncia enviada para os Admins. 🚨", "success");
      setDetailPost(null);
  };

  // Agrupamento Visual (Opcional, mantido para estética)
  const groupedPosts = posts.reduce((groups, post) => {
      const date = post.data || "Hoje";
      if (!groups[date]) {
          groups[date] = [];
      }
      groups[date].push(post);
      return groups;
  }, {} as Record<string, Post[]>);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-zinc-900">
        <button onClick={handleBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-sm text-white uppercase tracking-wider">
            {activeView === 'feed' ? 'Central de Desafios' : 'Classificações'}
          </h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* CONTEÚDO */}
      <main className="animate-in fade-in duration-300 pb-20">
        
        {activeView === "feed" && (
          <div className="space-y-6 p-4">
            
            {/* DESAFIO ATIVO */}
            <div className="space-y-3">
              <h3 className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest px-1 flex items-center gap-2">
                <Flame size={12} className="animate-pulse" /> Desafio Ativo
              </h3>

              <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 relative group">
                <div onClick={() => setShowChallengeDetails(true)} className="h-40 bg-gradient-to-r from-emerald-900 to-black relative cursor-pointer">
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">{ACTIVE_CHALLENGE.subtitulo}</span>
                    <h2 className="font-black text-3xl italic text-white uppercase tracking-tighter drop-shadow-lg flex items-center gap-2">{ACTIVE_CHALLENGE.titulo} <Info size={16} className="text-zinc-400"/></h2>
                    <p className="text-xs text-zinc-300 mt-1 max-w-[200px] line-clamp-2">{ACTIVE_CHALLENGE.descricao}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FEED REAL */}
            <div>
              <h3 className="text-zinc-500 text-[10px] uppercase font-bold px-1 mb-3 mt-6">Feed da Comunidade</h3>
              
              {loading ? (
                  <div className="flex justify-center py-10"><span className="text-zinc-500 text-xs animate-pulse">Carregando treinos...</span></div>
              ) : posts.length === 0 ? (
                  <div className="text-center py-10 text-zinc-600 text-xs">Nenhum treino postado ainda. Seja o primeiro!</div>
              ) : (
                  Object.keys(groupedPosts).map((date) => (
                      <div key={date}>
                          <div className="flex items-center gap-4 py-4">
                              <div className="h-px bg-zinc-800 flex-1"></div>
                              <span className="text-xs font-bold text-zinc-500 uppercase">{date}</span>
                              <div className="h-px bg-zinc-800 flex-1"></div>
                          </div>

                          {groupedPosts[date].map((post) => {
                            const isLiked = user ? post.likedBy?.includes(user.uid) : false;
                            
                            return (
                            <div key={post.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mb-4 relative overflow-hidden">
                              <div className="flex justify-between items-start mb-3">
                                  <div className="flex items-center gap-3">
                                      <Link href={`/perfil/${post.usuarioId}`}><img src={post.usuarioAvatar || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full object-cover border border-zinc-700 hover:border-emerald-500 transition"/></Link>
                                      <div>
                                          <Link href={`/perfil/${post.usuarioId}`}><h4 className="font-bold text-sm text-zinc-200 hover:text-emerald-400 transition">{post.usuarioNome}</h4></Link>
                                          <p className="text-[10px] text-zinc-500">{post.tempo}</p>
                                      </div>
                                  </div>
                                  {post.validado && (
                                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] flex items-center gap-1">
                                          <span className="text-xs">🦈</span> <span className="font-bold text-emerald-500">Validado</span>
                                      </div>
                                  )}
                              </div>

                              <div className="mb-3">
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Tag size={10}/> {post.modalidade}</span>
                                  </div>
                                  <h3 className="font-bold text-base text-white">{post.titulo}</h3>
                                  <p className="text-xs text-zinc-400">{post.legenda}</p>
                              </div>

                              <div className="rounded-xl overflow-hidden h-64 bg-black relative border border-zinc-800 group cursor-pointer" onClick={() => setDetailPost(post)}>
                                <img src={post.foto} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                              </div>

                              <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/50">
                                  <div className="flex gap-4">
                                      <button onClick={() => handleLike(post)} className={`flex items-center gap-1.5 transition ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}>
                                          <Heart size={18} fill={isLiked ? "currentColor" : "none"}/>
                                          <span className="text-xs font-bold">{post.likes || 0}</span>
                                      </button>
                                      <button onClick={() => setDetailPost(post)} className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition">
                                          <MessageCircle size={18}/>
                                          <span className="text-xs font-bold">{post.comentarios?.length || 0}</span>
                                      </button>
                                  </div>
                              </div>
                            </div>
                          )})}
                      </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* View Ranking (Placeholder) */}
        {activeView !== "feed" && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-zinc-500">
                <p>Em desenvolvimento...</p>
                <button onClick={() => setActiveView("feed")} className="text-emerald-500 font-bold mt-4">Voltar</button>
            </div>
        )}

      </main>

      {/* FAB - NOVO CHECK-IN */}
      {activeView === 'feed' && (
          <Link href="/gym/checkin" className="fixed bottom-6 right-5 bg-[#E53935] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(229,57,53,0.4)] text-white hover:scale-105 active:scale-95 transition z-40 border-2 border-black group">
            <Camera size={28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          </Link>
      )}

      {/* MODAIS (Detalhes e Desafio) mantidos simples */}
      {detailPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
              <button onClick={() => setDetailPost(null)} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 z-50"><X size={24}/></button>
              <div className="w-full max-w-md bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
                  <img src={detailPost.foto} className="w-full h-64 object-cover" />
                  <div className="p-4">
                      <h2 className="text-xl font-bold text-white">{detailPost.titulo}</h2>
                      <div className="flex gap-4 mt-4">
                           <button onClick={() => handleLike(detailPost)} className={`flex items-center gap-2 ${user && detailPost.likedBy?.includes(user.uid) ? 'text-red-500' : 'text-white'}`}>
                               <Heart size={20} fill={user && detailPost.likedBy?.includes(user.uid) ? "currentColor" : "none"}/> Curtir
                           </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {showChallengeDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
               <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 relative">
                   <button onClick={() => setShowChallengeDetails(false)} className="absolute top-4 right-4 text-white"><X size={24}/></button>
                   <h2 className="text-2xl font-black text-white italic">{ACTIVE_CHALLENGE.titulo}</h2>
                   <p className="text-zinc-400 mt-2">{ACTIVE_CHALLENGE.descricao}</p>
               </div>
          </div>
      )}

    </div>
  );
}