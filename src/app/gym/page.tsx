"use client";

import React, { useState } from "react";
import {
  Trophy, Flame, MessageCircle, ArrowLeft, MoreVertical,
  Calendar as CalendarIcon, Share2, User, Clock, CheckCircle2,
  ShieldAlert, History, Camera, Flag, X, Info, MapPin, Users,
  Heart, Send, AlertTriangle, Tag, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---
interface Comentario {
    user: string;
    avatar: string;
    texto: string;
    tempo: string;
}

interface Post {
    id: number;
    usuarioId: number;
    usuarioNome: string;
    usuarioAvatar: string;
    titulo: string; // Voltou
    modalidade: string; // Voltou
    legenda: string;
    data: string; // Para agrupamento (Ex: "Hoje", "Ontem")
    tempo: string;
    foto: string;
    isChallenge: boolean;
    validado: boolean; // Selo Tubarão
    likes: number;
    likedByUser: boolean;
    comentarios: Comentario[];
}

// --- DADOS MOCKADOS ---

const ACTIVE_CHALLENGE = {
    titulo: "DESAFIO MEDCOF",
    subtitulo: "Valendo XP Dobrado",
    descricao: "Mostre sua rotina de treinos nas férias e domine o ranking. Vale qualquer modalidade cadastrada!",
    regras: ["Postar foto nítida.", "Válido 1x por dia.", "Fair play obrigatório."],
    inicio: "12/12",
    fim: "10/01",
    xp: 2000
};

const PREVIOUS_CHALLENGES = [
  { id: 10, titulo: "Novembro Azul", data: "Nov 2025", xp: 500, cor: "from-blue-900 to-blue-950", icon: "💙" },
  { id: 11, titulo: "Halloween", data: "Out 2025", xp: 300, cor: "from-orange-900 to-orange-950", icon: "🎃" },
  { id: 12, titulo: "Intermed", data: "Set 2025", xp: 1000, cor: "from-purple-900 to-purple-950", icon: "🏆" },
];

const RANKING_INDIVIDUAL = [
  { id: 1, pos: 1, nome: "Julia de Souza", pontos: 85, avatar: "https://i.pravatar.cc/150?u=julia" },
  { id: 2, pos: 2, nome: "Maria Gabriela", pontos: 82, avatar: "https://i.pravatar.cc/150?u=maria" },
  { id: 3, pos: 3, nome: "Matheus N.", pontos: 82, avatar: "https://i.pravatar.cc/150?u=matheus" },
  { id: 4, pos: 4, nome: "Maria Eduarda", pontos: 50, avatar: "https://i.pravatar.cc/150?u=eduarda" },
  { id: 5, pos: 5, nome: "Laura de Goes", pontos: 45, avatar: "https://i.pravatar.cc/150?u=laura" },
];

const RANKING_TURMA = [
    { id: "T5", nome: "Turma V", pontos: 15400, logo: "/turma5.jpeg" },
    { id: "T7", nome: "Turma VII", pontos: 12100, logo: "/turma7.jpeg" },
    { id: "T4", nome: "Turma IV", pontos: 9800, logo: "/turma4.jpeg" },
];

const INITIAL_POSTS: Post[] = [
  {
    id: 1,
    usuarioId: 101,
    usuarioNome: "Maria Eduarda",
    usuarioAvatar: "https://i.pravatar.cc/150?u=eduarda",
    titulo: "Legday Pesado",
    modalidade: "Musculação",
    legenda: "Pose do dia - Tá pago! 💪",
    data: "Hoje",
    tempo: "7:32 am",
    foto: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
    isChallenge: false,
    validado: true,
    likes: 45,
    likedByUser: true,
    comentarios: [
        { user: "João", avatar: "https://i.pravatar.cc/150?u=joao", texto: "Braba! 🔥", tempo: "10m" },
        { user: "Ana", avatar: "https://i.pravatar.cc/150?u=ana", texto: "Foco total!", tempo: "5m" }
    ]
  },
  {
    id: 2,
    usuarioId: 102,
    usuarioNome: "Atlética AAAKN",
    usuarioAvatar: "https://github.com/shadcn.png",
    titulo: "Desafio do Dia",
    modalidade: "Crossfit",
    legenda: "Pose do dia 29: Duplo Bíceps! Valendo 50pts.",
    data: "Hoje",
    tempo: "1:45 am",
    foto: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80",
    isChallenge: true,
    validado: true,
    likes: 120,
    likedByUser: false,
    comentarios: []
  },
  {
    id: 3,
    usuarioId: 103,
    usuarioNome: "João Calouro",
    usuarioAvatar: "https://i.pravatar.cc/150?u=joao",
    titulo: "Corrida Matinal",
    modalidade: "Cardio",
    legenda: "Primeiro treino do ano! Foco total.",
    data: "Ontem",
    tempo: "10:00 am",
    foto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
    isChallenge: false,
    validado: false,
    likes: 12,
    likedByUser: false,
    comentarios: []
  },
];

// Mock do Calendário (Para interagir com o Perfil)
const CALENDARIO_DEZEMBRO = Array.from({ length: 31 }, (_, i) => {
  const dia = i + 1;
  // Dias 5 e 10 têm treino (para teste de clique)
  const temTreino = [5, 10, 29].includes(dia); 
  // Simulando que o treino do dia é o Post ID 1
  const postAssociado = temTreino ? INITIAL_POSTS[0] : null; 
  
  return { dia, temTreino, postAssociado };
});

export default function GymPage() {
  const { addToast } = useToast();
  
  // Estados de Navegação
  const [activeView, setActiveView] = useState<"feed" | "ranking" | "stats">("feed");
  const [rankingTab, setRankingTab] = useState<"individual" | "turma">("individual");

  // Estados de Dados
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  
  // Modais
  const [showChallengeDetails, setShowChallengeDetails] = useState(false);
  const [detailPost, setDetailPost] = useState<Post | null>(null); // O Post expandido

  // --- ACTIONS ---

  const handleBack = () => {
      if (activeView !== "feed") {
          setActiveView("feed");
      } else {
          window.location.href = "/"; 
      }
  };

  const handleLike = (postId: number) => {
    setPosts(current => current.map(p => {
        if(p.id === postId) {
            return { ...p, likedByUser: !p.likedByUser, likes: p.likedByUser ? p.likes - 1 : p.likes + 1 }
        }
        return p;
    }));
    // Atualiza também o modal se estiver aberto
    if (detailPost && detailPost.id === postId) {
        setDetailPost(prev => prev ? { ...prev, likedByUser: !prev.likedByUser, likes: prev.likedByUser ? prev.likes - 1 : prev.likes + 1 } : null);
    }
  };

  const handleReport = () => {
      addToast("Denúncia enviada para os Admins. 🚨", "success");
      setDetailPost(null);
  };

  // Agrupamento de Posts por Data
  const groupedPosts = posts.reduce((groups, post) => {
      const date = post.data;
      if (!groups[date]) {
          groups[date] = [];
      }
      groups[date].push(post);
      return groups;
  }, {} as Record<string, Post[]>);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* HEADER SUPERIOR FIXO */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-zinc-900">
        <button onClick={handleBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-sm text-white uppercase tracking-wider">
            {activeView === 'feed' ? 'Central de Desafios' : activeView === 'ranking' ? 'Classificações' : 'Meu Histórico'}
          </h1>
        </div>
        <div className="w-10"></div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="animate-in fade-in duration-300 pb-20">
        
        {/* --- VIEW 1: FEED (HOME) --- */}
        {activeView === "feed" && (
          <div className="space-y-6 p-4">
            
            {/* 1. DESAFIOS ANTERIORES */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-zinc-400 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                  <History size={12} /> Desafios Concluídos
                </h3>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                {PREVIOUS_CHALLENGES.map((challenge) => (
                  <div key={challenge.id} className={`flex-shrink-0 w-32 h-32 rounded-2xl bg-gradient-to-br ${challenge.cor} p-3 flex flex-col justify-between border border-white/5 relative overflow-hidden group`}>
                    <div className="absolute top-0 right-0 p-2 opacity-50 text-4xl group-hover:scale-110 transition duration-500">{challenge.icon}</div>
                    <div className="bg-black/30 w-fit px-2 py-1 rounded backdrop-blur-sm"><span className="text-[9px] font-bold text-white/80">{challenge.data}</span></div>
                    <div><h4 className="font-bold text-sm leading-tight mb-0.5">{challenge.titulo}</h4><span className="text-[9px] text-white/60 flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-400" /> +{challenge.xp} XP</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. CARD DO DESAFIO ATIVO (INTERATIVO) */}
            <div className="space-y-3">
              <h3 className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest px-1 flex items-center gap-2">
                <Flame size={12} className="animate-pulse" /> Desafio Ativo
              </h3>

              <div className="bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 relative group">
                <div onClick={() => setShowChallengeDetails(true)} className="h-40 bg-gradient-to-r from-emerald-900 to-black relative cursor-pointer">
                  <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80" className="w-full h-full object-cover opacity-40 mix-blend-overlay group-hover:scale-105 transition duration-700" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">{ACTIVE_CHALLENGE.subtitulo}</span>
                    <h2 className="font-black text-3xl italic text-white uppercase tracking-tighter drop-shadow-lg flex items-center gap-2">{ACTIVE_CHALLENGE.titulo} <Info size={16} className="text-zinc-400"/></h2>
                    <p className="text-xs text-zinc-300 mt-1 max-w-[200px] line-clamp-2">{ACTIVE_CHALLENGE.descricao}</p>
                  </div>
                </div>

                <div className="p-4 flex justify-between items-center bg-zinc-900 text-white relative z-10">
                  <div onClick={() => setActiveView("ranking")} className="flex flex-col items-center w-1/3 cursor-pointer hover:bg-zinc-800/50 rounded-lg p-1 transition active:scale-95">
                    <div className="flex items-center gap-1">
                      <img src="https://i.pravatar.cc/150?u=julia" className="w-6 h-6 rounded-full border border-zinc-700" />
                      <span className="font-bold text-xl">85</span>
                    </div>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Líder Atual</span>
                  </div>
                  <div onClick={() => setActiveView("stats")} className="flex flex-col items-center w-1/3 border-l border-r border-zinc-800 cursor-pointer hover:bg-zinc-800/50 rounded-lg p-1 transition active:scale-95">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center mb-1 text-sm shadow-[0_0_15px_rgba(16,185,129,0.4)] text-black font-black">7º</div>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Sua Posição</span>
                  </div>
                  <div className="flex flex-col items-center w-1/3">
                    <span className="font-bold text-xl flex items-center gap-1"><CalendarIcon size={16} className="text-emerald-500" /> 12</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold mt-1">Dias Rest.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FEED DA COMUNIDADE (AGRUPADO POR DATA) */}
            <div>
              <h3 className="text-zinc-500 text-[10px] uppercase font-bold px-1 mb-3 mt-6">Feed da Comunidade</h3>
              
              {Object.keys(groupedPosts).map((date) => (
                  <div key={date}>
                      {/* Separador de Data */}
                      <div className="flex items-center gap-4 py-4">
                          <div className="h-px bg-zinc-800 flex-1"></div>
                          <span className="text-xs font-bold text-zinc-500 uppercase">{date}</span>
                          <div className="h-px bg-zinc-800 flex-1"></div>
                      </div>

                      {/* Lista de Posts da Data */}
                      {groupedPosts[date].map((post) => (
                        <div key={post.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 mb-4 relative overflow-hidden">
                          {/* Header Post */}
                          <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                  <Link href={`/perfil/${post.usuarioId}`}><img src={post.usuarioAvatar} className="w-10 h-10 rounded-full object-cover border border-zinc-700 hover:border-emerald-500 transition"/></Link>
                                  <div>
                                      <Link href={`/perfil/${post.usuarioId}`}><h4 className="font-bold text-sm text-zinc-200 hover:text-emerald-400 transition">{post.usuarioNome}</h4></Link>
                                      <p className="text-[10px] text-zinc-500">{post.tempo}</p>
                                  </div>
                              </div>
                              {post.validado && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-[10px] flex items-center gap-1" title="Validado pela Atlética">
                                      <span className="text-xs">🦈</span> <span className="font-bold text-emerald-500">Validado</span>
                                  </div>
                              )}
                          </div>

                          {/* Infos do Treino */}
                          <div className="mb-3">
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><Tag size={10}/> {post.modalidade}</span>
                                  {post.isChallenge && <span className="bg-orange-500/10 text-orange-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-orange-500/20">Desafio</span>}
                              </div>
                              <h3 className="font-bold text-base text-white">{post.titulo}</h3>
                              <p className="text-xs text-zinc-400">{post.legenda}</p>
                          </div>

                          {/* Foto Clicável (Abre Modal Detalhes) */}
                          <div className="rounded-xl overflow-hidden h-64 bg-black relative border border-zinc-800 group cursor-pointer" onClick={() => setDetailPost(post)}>
                            <img src={post.foto} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/20">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-white flex items-center gap-2">Ver Detalhes</div>
                            </div>
                          </div>

                          {/* Footer Ações */}
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-zinc-800/50">
                              <div className="flex gap-4">
                                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-1.5 transition ${post.likedByUser ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}>
                                      <Heart size={18} fill={post.likedByUser ? "currentColor" : "none"}/>
                                      <span className="text-xs font-bold">{post.likes}</span>
                                  </button>
                                  <button onClick={() => setDetailPost(post)} className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition">
                                      <MessageCircle size={18}/>
                                      <span className="text-xs font-bold">{post.comentarios.length}</span>
                                  </button>
                              </div>
                          </div>
                        </div>
                      ))}
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 2: RANKING --- */}
        {activeView === "ranking" && (
          <div className="p-4 space-y-6">
            <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button onClick={() => setRankingTab("individual")} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition ${rankingTab === 'individual' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Individual</button>
                <button onClick={() => setRankingTab("turma")} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition ${rankingTab === 'turma' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500'}`}>Por Turma</button>
            </div>
            <div className="space-y-1">
              {rankingTab === 'individual' ? RANKING_INDIVIDUAL.map((user) => (
                <Link href={`/perfil/${user.id}`} key={user.id} className="flex items-center justify-between py-3 border-b border-zinc-900/50 hover:bg-zinc-900/30 px-2 -mx-2 rounded transition">
                  <div className="flex items-center gap-3">
                    <span className={`font-black text-sm w-4 ${user.pos === 1 ? 'text-yellow-500' : 'text-zinc-600'}`}>{user.pos}</span>
                    <img src={user.avatar} className="w-9 h-9 rounded-full object-cover border border-zinc-800" />
                    <div><p className="font-bold text-xs text-zinc-200">{user.nome}</p><p className="text-[10px] text-zinc-500">{user.pontos} pontos</p></div>
                  </div>
                </Link>
              )) : RANKING_TURMA.map((turma, idx) => (
                  <div key={turma.id} className="flex items-center justify-between py-3 border-b border-zinc-900/50 hover:bg-zinc-900/30 px-2 -mx-2 rounded transition">
                    <div className="flex items-center gap-3">
                        <span className={`font-black text-sm w-4 text-zinc-600`}>{idx + 1}</span>
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-800"><img src={turma.logo} className="w-full h-full object-cover" /></div>
                        <div><p className="font-bold text-xs text-zinc-200">{turma.nome}</p><p className="text-[10px] text-zinc-500">{turma.pontos} XP Totais</p></div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 3: PERFIL (STATS & CALENDARIO) --- */}
        {activeView === "stats" && (
          <div className="p-4 text-center animate-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-full p-1 border border-zinc-800 mb-3 relative group cursor-pointer">
                <img src="https://github.com/shadcn.png" className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-100 transition" />
                <div className="absolute -bottom-2 inset-x-0 flex justify-center"><span className="bg-zinc-950 text-[10px] px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">AAAKN</span></div>
              </div>
              <h2 className="font-bold text-base text-white">Atlética Medicina Caragua</h2>
              <div className="flex justify-center gap-8 mt-6">
                <div className="flex flex-col"><span className="font-bold text-lg text-white">33</span><span className="text-[9px] text-zinc-500 uppercase">Check-ins</span></div>
                <div className="flex flex-col"><span className="font-bold text-lg text-white">27</span><span className="text-[9px] text-zinc-500 uppercase">Dias ativos</span></div>
              </div>
            </div>

            {/* Calendário Interativo */}
            <div className="bg-black rounded-xl border border-zinc-900 p-4">
              <h3 className="font-bold text-sm text-white mb-4 capitalize">Dezembro 2025</h3>
              <div className="grid grid-cols-7 mb-2 text-zinc-600 text-[10px] uppercase font-bold"><div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div></div>
              <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                <div></div><div></div>
                {CALENDARIO_DEZEMBRO.map((dia) => (
                  <div key={dia.dia} className="flex flex-col items-center justify-center h-8 w-8 mx-auto">
                    {dia.temTreino ? (
                      <button 
                        onClick={() => dia.postAssociado && setDetailPost(dia.postAssociado)}
                        className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-500/50 flex items-center justify-center text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-black transition"
                      >
                          {dia.dia}
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-800 font-medium">{dia.dia}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FAB - NOVO CHECK-IN (APENAS NA ABA FEED) */}
      {activeView === 'feed' && (
          <Link href="/gym/checkin" className="fixed bottom-6 right-5 bg-[#E53935] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(229,57,53,0.4)] text-white hover:scale-105 active:scale-95 transition z-40 border-2 border-black group">
            <Camera size={28} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" />
          </Link>
      )}

      {/* --- MODAIS --- */}

      {/* 1. MODAL DE DETALHES DO POST (Lightbox Style) */}
      {detailPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
              <button onClick={() => setDetailPost(null)} className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full text-white hover:bg-zinc-700 z-50"><X size={24}/></button>
              
              <div className="w-full h-full md:max-w-4xl md:h-auto md:max-h-[90vh] bg-black md:rounded-3xl md:border md:border-zinc-800 overflow-hidden flex flex-col md:flex-row">
                  
                  {/* Coluna Esquerda: Imagem */}
                  <div className="flex-1 bg-zinc-950 flex items-center justify-center relative">
                      <img src={detailPost.foto} className="w-full h-full object-contain" />
                      {detailPost.validado && (
                          <div className="absolute top-4 left-4 bg-emerald-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                              🦈 Validado
                          </div>
                      )}
                  </div>

                  {/* Coluna Direita: Infos e Comentários */}
                  <div className="flex-1 flex flex-col bg-zinc-900 border-l border-zinc-800 w-full md:w-[400px]">
                      
                      {/* Header */}
                      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <img src={detailPost.usuarioAvatar} className="w-10 h-10 rounded-full object-cover"/>
                              <div>
                                  <h3 className="font-bold text-white text-sm">{detailPost.usuarioNome}</h3>
                                  <p className="text-xs text-zinc-500">{detailPost.modalidade} • {detailPost.data}</p>
                              </div>
                          </div>
                      </div>

                      {/* Body: Título e Comentários */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          <div>
                              <h2 className="text-xl font-black text-white italic uppercase">{detailPost.titulo}</h2>
                              <p className="text-sm text-zinc-300 mt-1">{detailPost.legenda}</p>
                          </div>

                          <div className="pt-4 border-t border-zinc-800">
                              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3">Comentários</h4>
                              <div className="space-y-3">
                                  {detailPost.comentarios.length > 0 ? detailPost.comentarios.map((c, i) => (
                                      <div key={i} className="flex gap-2">
                                          <img src={c.avatar} className="w-6 h-6 rounded-full"/>
                                          <div>
                                              <p className="text-xs text-white"><span className="font-bold">{c.user}</span> {c.texto}</p>
                                              <span className="text-[9px] text-zinc-600">{c.tempo}</span>
                                          </div>
                                      </div>
                                  )) : <p className="text-xs text-zinc-600 italic">Seja o primeiro a comentar.</p>}
                              </div>
                          </div>
                      </div>

                      {/* Footer: Ações */}
                      <div className="p-4 border-t border-zinc-800 space-y-3">
                          <div className="flex justify-between items-center">
                              <div className="flex gap-4">
                                  <button onClick={() => handleLike(detailPost.id)} className={`flex items-center gap-2 ${detailPost.likedByUser ? 'text-red-500' : 'text-white'}`}>
                                      <Heart size={24} fill={detailPost.likedByUser ? "currentColor" : "none"}/>
                                  </button>
                                  <button className="text-white hover:text-zinc-300"><MessageCircle size={24}/></button>
                                  <button className="text-white hover:text-zinc-300"><Share2 size={24}/></button>
                              </div>
                              <button onClick={handleReport} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition" title="Denunciar">
                                  <Flag size={20}/>
                              </button>
                          </div>
                          <div className="text-sm font-bold text-white">{detailPost.likes} curtidas</div>
                          
                          {/* Input Comentário */}
                          <div className="flex gap-2">
                              <input type="text" placeholder="Adicione um comentário..." className="flex-1 bg-black rounded-full px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"/>
                              <button className="text-emerald-500 font-bold text-xs uppercase p-2">Publicar</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* 2. MODAL DETALHES CAMPEONATO */}
      {showChallengeDetails && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 relative animate-in slide-in-from-bottom-10">
                  <button onClick={() => setShowChallengeDetails(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                  <div className="text-center mb-6">
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{ACTIVE_CHALLENGE.titulo}</h2>
                      <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{ACTIVE_CHALLENGE.subtitulo}</p>
                  </div>
                  <div className="space-y-4">
                      <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                          <div className="flex items-center gap-3"><CalendarIcon size={20} className="text-zinc-400"/><div><p className="text-[10px] text-zinc-500 uppercase font-bold">Período</p><p className="text-sm font-bold text-white">{ACTIVE_CHALLENGE.inicio} até {ACTIVE_CHALLENGE.fim}</p></div></div>
                          <div className="text-right"><p className="text-[10px] text-zinc-500 uppercase font-bold">Prêmio</p><p className="text-sm font-bold text-yellow-500">+{ACTIVE_CHALLENGE.xp} XP</p></div>
                      </div>
                      <div>
                          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Info size={14}/> Regras Oficiais</h3>
                          <ul className="space-y-2">{ACTIVE_CHALLENGE.regras.map((regra, i) => (<li key={i} className="text-xs text-zinc-400 flex items-start gap-2"><span className="text-emerald-500 font-bold">•</span> {regra}</li>))}</ul>
                      </div>
                  </div>
                  <button onClick={() => { setShowChallengeDetails(false); }} className="w-full mt-6 bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-emerald-900/20 active:scale-95 transition">Entendi, bora treinar!</button>
              </div>
          </div>
      )}

    </div>
  );
}