"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft, Calendar, MapPin, Share2, Ticket, Clock,
  Users, CheckCircle, HelpCircle, XCircle, Lock, 
  Loader2, Crown, MessageCircle, AlertTriangle, 
  Heart, Send, Plus, Trash2, ShieldAlert, Star,
  Ghost, Zap, Gem, Trophy, ShoppingBag, Fish, Swords,
  ChevronLeft, ChevronRight, Flag
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { 
    doc, onSnapshot, collection, runTransaction, serverTimestamp, 
    increment, addDoc, updateDoc, query, orderBy, arrayUnion, arrayRemove, deleteDoc 
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

// --- MAPEAMENTO DE ÍCONES ---
const ICONS_MAP: any = {
  ghost: Ghost,
  star: Star,
  crown: Crown,
  shopping: ShoppingBag,
  zap: Zap,
  gem: Gem,
  trophy: Trophy,
  fish: Fish
};

// Cores dos Planos
const PLAN_COLORS: any = {
    yellow: "text-yellow-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    blue: "text-blue-400",
    red: "text-red-500",
    zinc: "text-zinc-400"
};

const TURMA_IMAGENS: Record<string, string> = {
    "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
    "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
    "T7": "/turma7.jpeg", "T8": "/turma8.jpeg",
    "Geral": "https://github.com/shadcn.png"
};

// --- HELPER: PARSER DE DATA ---
const parseEventDate = (dateStr: string, timeStr: string = "00:00") => {
    try {
        const months: Record<string, number> = {
            'JAN': 0, 'FEV': 1, 'MAR': 2, 'ABR': 3, 'MAI': 4, 'JUN': 5,
            'JUL': 6, 'AGO': 7, 'SET': 8, 'OUT': 9, 'NOV': 10, 'DEZ': 11
        };
        const cleanDate = dateStr.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const parts = cleanDate.split(' '); 
        
        if (parts.length < 2) return null;
        
        const day = parseInt(parts[0]);
        const monthKey = Object.keys(months).find(m => parts[1].includes(m));
        
        if (!monthKey || isNaN(day)) return null;

        const now = new Date();
        const year = now.getFullYear();
        const [hours, mins] = timeStr.split(':').map(Number);
        
        let eventDate = new Date(year, months[monthKey], day, hours || 0, mins || 0);
        
        if (eventDate < now && (now.getMonth() - months[monthKey]) > 6) eventDate.setFullYear(year + 1);
        
        return eventDate;
    } catch (e) {
        return null;
    }
};

// --- CONTADOR VISUAL COOL ---
function EventCountdown({ dateStr, timeStr }: { dateStr: string, timeStr: string }) {
  const [timeLeft, setTimeLeft] = useState<{d: number, h: number, m: number, s: number} | null>(null);
  const [status, setStatus] = useState("CALCULANDO...");

  useEffect(() => {
    const tick = () => {
        const target = parseEventDate(dateStr, timeStr);
        if (!target) {
            setStatus("DATA INDEFINIDA");
            return;
        }
        const now = new Date();
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) {
            setStatus("ESTÁ ROLANDO!");
            setTimeLeft(null);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ d: days, h: hours, m: minutes, s: seconds });
        setStatus("");
    };
    
    tick();
    const interval = setInterval(tick, 1000); 
    return () => clearInterval(interval);
  }, [dateStr, timeStr]);

  if (status) {
      return (
        <div className="bg-black/80 backdrop-blur-md px-6 py-3 rounded-full border border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.4)] animate-pulse">
            <span className="text-sm font-black text-emerald-400 tracking-[0.2em]">{status}</span>
        </div>
      );
  }

  return (
    <div className="flex gap-3 bg-black/40 backdrop-blur-sm p-2 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center justify-center bg-zinc-900/80 w-12 h-14 rounded-xl border border-zinc-800">
            <span className="text-xl font-black text-white leading-none">{String(timeLeft?.d || 0).padStart(2, '0')}</span>
            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Dias</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-zinc-900/80 w-12 h-14 rounded-xl border border-zinc-800">
            <span className="text-xl font-black text-white leading-none">{String(timeLeft?.h || 0).padStart(2, '0')}</span>
            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Hrs</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-zinc-900/80 w-12 h-14 rounded-xl border border-zinc-800">
            <span className="text-xl font-black text-white leading-none">{String(timeLeft?.m || 0).padStart(2, '0')}</span>
            <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider mt-1">Min</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-emerald-900/20 w-12 h-14 rounded-xl border border-emerald-500/30">
            <span className="text-xl font-black text-emerald-400 leading-none">{String(timeLeft?.s || 0).padStart(2, '0')}</span>
            <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-wider mt-1">Seg</span>
        </div>
    </div>
  );
}

// --- BADGES DO USUÁRIO ---
const UserBadges = ({ data }: { data: any }) => {
    const isAdminUser = data.role === 'admin_geral' || data.role === 'master';
    const PlanIcon = ICONS_MAP[data.userPlanoIcon || 'ghost'] || Ghost;
    const colorClass = PLAN_COLORS[data.userPlanoCor || 'zinc'];

    return (
        <div className="flex items-center gap-1 ml-1">
            {isAdminUser && (
                <span title="Admin">
                    <ShieldAlert size={12} className="text-red-500 fill-red-500/20" />
                </span>
            )}
            <PlanIcon size={12} className={colorClass} />
        </div>
    );
};

export default function DetalhesEventoPage() {
  const params = useParams();
  const { user, isAdmin } = useAuth(); 
  const { addToast } = useToast();
  
  const [evento, setEvento] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [enquetes, setEnquetes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRsvp, setUserRsvp] = useState<string | null>(null);
  
  const [modalUsersType, setModalUsersType] = useState<"going" | "maybe" | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newPollOption, setNewPollOption] = useState("");
  
  // 🦈 ESTADO PARA CARROSSEL DE ENQUETES
  const [currentPollIndex, setCurrentPollIndex] = useState(0);

  // 1. CARREGAMENTO REAL DO FIREBASE
  useEffect(() => {
      if (!params.id) return;
      const eventId = params.id as string;

      const unsubEvent = onSnapshot(doc(db, "eventos", eventId), (docSnap) => {
          if (docSnap.exists()) setEvento({ id: docSnap.id, ...docSnap.data() });
          else setEvento(null);
          setLoading(false);
      });

      const unsubRsvp = onSnapshot(collection(db, "eventos", eventId, "rsvps"), (snap) => {
          const lista = snap.docs.map(d => d.data());
          setRsvps(lista);
          if (user) {
              const me = lista.find((p: any) => p.userId === user.uid);
              setUserRsvp(me ? me.status : null);
          }
      });

      const qCom = query(collection(db, "eventos", eventId, "comentarios"), orderBy("createdAt", "desc"));
      const unsubCom = onSnapshot(qCom, (snap) => {
          setComentarios(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });

      const unsubPolls = onSnapshot(collection(db, "eventos", eventId, "enquetes"), (snap) => {
          setEnquetes(snap.docs.map(d => ({id: d.id, ...d.data()})));
      });

      return () => { unsubEvent(); unsubRsvp(); unsubCom(); unsubPolls(); };
  }, [params.id, user]);

  // --- ACTIONS ---

  const handleRSVP = async (status: "going" | "maybe") => {
      if (!user) return addToast("Faça login para confirmar!", "error");
      try {
          await runTransaction(db, async (t) => {
              const ref = doc(db, "eventos", evento.id, "rsvps", user.uid);
              const docSnap = await t.get(ref);
              const old = docSnap.exists() ? docSnap.data().status : null;

              if (old === status) {
                  t.delete(ref);
                  t.update(doc(db, "eventos", evento.id), { [`stats.${status === 'going' ? 'confirmados' : 'talvez'}`]: increment(-1) });
              } else {
                  if (old) t.update(doc(db, "eventos", evento.id), { [`stats.${old === 'going' ? 'confirmados' : 'talvez'}`]: increment(-1) });
                  t.set(ref, {
                      userId: user.uid, status, userName: user.nome || "Anônimo", 
                      userAvatar: user.foto || "", userTurma: user.turma || "Geral", timestamp: serverTimestamp()
                  });
                  t.update(doc(db, "eventos", evento.id), { [`stats.${status === 'going' ? 'confirmados' : 'talvez'}`]: increment(1) });
              }
          });
          addToast("Lista atualizada!", "success");
      } catch (e) { addToast("Erro ao atualizar.", "error"); }
  };

  const handleSendComment = async () => {
      if (!newComment.trim() || !user) return;
      
      const newCommentData = {
          text: newComment, 
          userId: user.uid, 
          userName: user.nome || "Anônimo",
          userAvatar: user.foto || "", 
          userTurma: user.turma || "",
          
          userPlanoCor: user.plano_cor || "zinc",
          userPlanoIcon: user.plano_icon || "ghost",
          userPatente: user.patente || "Novato",
          role: user.role || 'user',

          createdAt: serverTimestamp(), 
          likes: [], 
          reports: [], 
          hidden: false
      };

      try {
          await addDoc(collection(db, "eventos", evento.id, "comentarios"), newCommentData);
          await updateDoc(doc(db, "users", user.uid), { "stats.commentsCount": increment(1) });
          setNewComment("");
          addToast("Comentário enviado!", "success");
      } catch (e) {
          console.error(e);
          addToast("Erro ao comentar.", "error");
      }
  };

  const handleLikeComment = async (comId: string, currentLikes: string[], authorId: string) => {
      if (!user) return;
      const ref = doc(db, "eventos", evento.id, "comentarios", comId);
      const safeLikes = Array.isArray(currentLikes) ? currentLikes : [];
      const hasLiked = safeLikes.includes(user.uid);
      
      try {
          if (hasLiked) {
              await updateDoc(ref, { likes: arrayRemove(user.uid) });
          } else {
              await updateDoc(ref, { likes: arrayUnion(user.uid) });
          }

          if (user.uid !== authorId) {
              const incrementVal = hasLiked ? -1 : 1;
              await updateDoc(doc(db, "users", authorId), { "stats.likesReceived": increment(incrementVal) });
              await updateDoc(doc(db, "users", user.uid), { "stats.likesGiven": increment(incrementVal) });
          }
      } catch (e) { console.error(e); }
  };

  const handleDeleteComment = async (comId: string) => {
      if (!confirm("Apagar este comentário?")) return;
      try {
          await deleteDoc(doc(db, "eventos", evento.id, "comentarios", comId));
          addToast("Comentário apagado.", "info");
      } catch (error) { addToast("Erro ao apagar.", "error"); }
  };

  const handleReportComment = async (comId: string) => {
      if (!user) return;
      await updateDoc(doc(db, "eventos", evento.id, "comentarios", comId), { reports: arrayUnion(user.uid) });
      addToast("Comentário denunciado.", "info");
  };

  const handleToggleHideComment = async (comId: string, currentStatus: boolean) => {
     await updateDoc(doc(db, "eventos", evento.id, "comentarios", comId), { hidden: !currentStatus });
     addToast(currentStatus ? "Comentário restaurado." : "Comentário ocultado.", "info");
  };

  // ENQUETES (Múltipla Escolha e Respostas Dinâmicas)
  const handleVotePoll = async (pollId: string, optionIndex: number) => {
      if (!user) return addToast("Login necessário.", "error");
      const pollRef = doc(db, "eventos", evento.id, "enquetes", pollId);
      
      try {
        await runTransaction(db, async (t) => {
            const pollDoc = await t.get(pollRef);
            if (!pollDoc.exists()) throw "Enquete não existe";
            
            const data = pollDoc.data();
            
            const newOptions = [...data.options];
            newOptions[optionIndex].votes = (newOptions[optionIndex].votes || 0) + 1;
            
            const userTurma = user.turma || "Geral";
            if(!newOptions[optionIndex].votesByTurma) newOptions[optionIndex].votesByTurma = {};
            newOptions[optionIndex].votesByTurma[userTurma] = (newOptions[optionIndex].votesByTurma[userTurma] || 0) + 1;

            t.update(pollRef, {
                options: newOptions,
                voters: arrayUnion(user.uid)
            });
        });
        addToast("Voto computado!", "success");
      } catch (e: any) {
        addToast(typeof e === 'string' ? e : "Erro ao votar.", "error");
      }
  };

  // 🦈 ID 640: Adicionando info do criador na opção
  const handleCreatePollOption = async (pollId: string) => {
      if(!newPollOption || !user) return;
      const pollRef = doc(db, "eventos", evento.id, "enquetes", pollId);
      await updateDoc(pollRef, {
          options: arrayUnion({ 
              text: newPollOption, 
              votes: 0, 
              creatorId: user.uid,
              creatorName: user.nome?.split(" ")[0] || "Anônimo", // Primeiro nome
              creatorAvatar: user.foto || "",
              votesByTurma: {} 
          })
      });
      setNewPollOption("");
      addToast("Opção adicionada!", "success");
  };

  const handleReportPoll = async (pollId: string) => {
      if(!user) return;
      addToast("Enquete reportada à moderação.", "info");
  };

  // 🦈 ID 640: Reportar Opção Específica
  const handleReportOption = async (pollId: string, optionText: string) => {
      if(!user) return;
      addToast(`Opção "${optionText}" denunciada.`, "info");
  };

  // 🦈 CARROSSEL LÓGICA
  const nextPoll = () => setCurrentPollIndex(prev => (prev + 1) % enquetes.length);
  const prevPoll = () => setCurrentPollIndex(prev => (prev - 1 + enquetes.length) % enquetes.length);
  const currentPoll = enquetes[currentPollIndex];

  // 🦈 LÓGICA TOP 3 TURMAS
  const topTurmasPoll = useMemo(() => {
      if (!currentPoll) return [];
      const counts: Record<string, number> = {};
      currentPoll.options?.forEach((opt: any) => {
          if (opt.votesByTurma) {
              Object.entries(opt.votesByTurma).forEach(([turma, count]) => {
                  counts[turma] = (counts[turma] || 0) + (count as number);
              });
          }
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => t);
  }, [currentPoll]);

  const handleShare = () => {
      if (typeof navigator !== 'undefined' && navigator.share) {
          navigator.share({ title: evento.titulo, url: window.location.href });
      } else {
          navigator.clipboard.writeText(window.location.href);
          addToast("Link copiado!", "success");
      }
  };

  const modalUsers = useMemo(() => {
      if (!modalUsersType) return [];
      return rsvps.filter(r => r.status === modalUsersType);
  }, [rsvps, modalUsersType]);

  const rankingTurmas = useMemo(() => {
      const counts: Record<string, number> = {};
      rsvps.forEach(r => r.status === 'going' && (counts[(r.userTurma || "Geral").toUpperCase()] = (counts[(r.userTurma || "Geral").toUpperCase()] || 0) + 1));
      return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, c]) => ({ turma: t, count: c, imagem: TURMA_IMAGENS[t] || TURMA_IMAGENS["Geral"] }));
  }, [rsvps]);

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-10 h-10"/></div>;
  if (!evento) return <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-4"><XCircle size={40} className="text-red-500"/> <p>Evento não encontrado.</p> <Link href="/eventos" className="text-emerald-500 underline">Voltar</Link></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans">
      
      {/* HERO */}
      <div className="relative h-[50vh] w-full">
        <img src={evento.imagem || "https://placehold.co/600x400/111/333"} className="w-full h-full object-cover" style={{ objectPosition: `50% ${evento.imagePositionY || 50}%` }}/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent"></div>
        
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <Link href="/eventos" className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 text-white hover:bg-white hover:text-black transition">
                <ArrowLeft size={20} />
            </Link>
            <button onClick={handleShare} className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 text-white hover:bg-emerald-500 hover:text-black transition">
                <Share2 size={20} />
            </button>
        </div>

        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
            <EventCountdown dateStr={evento.data} timeStr={evento.hora} />
        </div>

        <div className="absolute bottom-24 right-6 z-20 flex flex-col items-end gap-2">
            {rankingTurmas.map((t) => (
                <div key={t.turma} className="flex items-center gap-2 bg-black/60 backdrop-blur-md pl-1 pr-3 py-1 rounded-full border border-white/10">
                    <img src={t.imagem} className="w-6 h-6 rounded-full object-cover border border-zinc-500"/>
                    <span className="text-[10px] font-bold text-emerald-400">+{t.count}</span>
                </div>
            ))}
        </div>

        <div className="absolute bottom-0 left-0 p-6 w-full z-20">
            <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase rounded mb-2 inline-block">{evento.tipo}</span>
            <h1 className="text-3xl font-black italic uppercase leading-none text-white drop-shadow-xl mb-2">{evento.titulo}</h1>
            <div className="flex gap-4 text-xs font-bold text-zinc-300 uppercase">
                <span className="flex items-center gap-1"><Calendar size={12} className="text-emerald-500"/> {evento.data}</span>
                <span className="flex items-center gap-1"><MapPin size={12} className="text-emerald-500"/> {evento.local}</span>
            </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="relative z-30 -mt-6 bg-[#050505] rounded-t-[30px] border-t border-white/10 p-6 space-y-8">
        
        {evento.descricao && (
            <div className="space-y-2">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Sobre o Evento</h3>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{evento.descricao}</p>
            </div>
        )}

        {evento.isLowStock && (
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-0.5 rounded-2xl animate-pulse shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <div className="bg-black rounded-[14px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Star className="text-yellow-400 fill-yellow-400" size={24}/>
                        <div>
                            <p className="text-yellow-400 font-black uppercase text-sm tracking-widest">Últimas Vagas</p>
                            <p className="text-zinc-400 text-[10px]">O lote vai virar em breve!</p>
                        </div>
                    </div>
                    <Link href="/carrinho" className="bg-yellow-400 text-black font-black text-xs px-4 py-2 rounded-lg uppercase hover:bg-yellow-300">Garantir</Link>
                </div>
            </div>
        )}

        <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleRSVP('going')} className={`py-4 rounded-xl flex flex-col items-center gap-1 transition border ${userRsvp === 'going' ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg' : 'bg-zinc-900 border-zinc-800'}`}>
                <CheckCircle size={20}/> <span className="text-xs font-black uppercase">Eu Vou</span>
            </button>
            <button onClick={() => handleRSVP('maybe')} className={`py-4 rounded-xl flex flex-col items-center gap-1 transition border ${userRsvp === 'maybe' ? 'bg-yellow-500 text-black border-yellow-500 shadow-lg' : 'bg-zinc-900 border-zinc-800'}`}>
                <HelpCircle size={20}/> <span className="text-xs font-black uppercase">Talvez</span>
            </button>
        </div>

        <div className="flex justify-center gap-6 text-[10px] font-bold uppercase text-zinc-500">
            <button onClick={() => setModalUsersType('going')} className="hover:text-emerald-500 transition underline decoration-dashed underline-offset-4 flex items-center gap-1">
                <Users size={12}/> {evento.stats?.confirmados || 0} Confirmados
            </button>
            <button onClick={() => setModalUsersType('maybe')} className="hover:text-yellow-500 transition underline decoration-dashed underline-offset-4 flex items-center gap-1">
                <HelpCircle size={12}/> {evento.stats?.talvez || 0} Interessados
            </button>
        </div>

        <div className="space-y-3">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Ticket size={14} className="text-emerald-500"/> Ingressos</h3>
            {evento.lotes?.map((l: any, i: number) => (
                <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${l.status === 'ativo' ? 'bg-zinc-900 border-emerald-500/50' : 'bg-black border-zinc-800 opacity-50'}`}>
                    <div>
                        <p className="text-xs font-black text-white uppercase">{l.nome}</p>
                        <p className="text-emerald-400 font-bold">R$ {l.preco}</p>
                    </div>
                    {l.status === 'ativo' ? 
                        <Link href="/carrinho" className="bg-white text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-400 transition">Comprar</Link> 
                        : <span className="text-[10px] font-bold text-zinc-600 uppercase border border-zinc-800 px-3 py-1 rounded-lg">{l.status}</span>}
                </div>
            ))}
        </div>

        {/* 🦈 ENQUETES CARROSSEL */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle size={14} className="text-purple-500"/> Enquete da Galera
                </h3>
                {enquetes.length > 1 && (
                    <div className="flex gap-2">
                        <button onClick={prevPoll} className="p-1 bg-zinc-900 rounded hover:bg-zinc-800 text-zinc-400"><ChevronLeft size={16}/></button>
                        <button onClick={nextPoll} className="p-1 bg-zinc-900 rounded hover:bg-zinc-800 text-zinc-400"><ChevronRight size={16}/></button>
                    </div>
                )}
            </div>

            {currentPoll ? (
                <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3 relative overflow-hidden transition-all duration-300">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-white max-w-[80%]">{currentPoll.question || "Qual a boa?"}</h4>
                        <button onClick={() => handleReportPoll(currentPoll.id)} className="text-zinc-600 hover:text-yellow-500"><ShieldAlert size={14}/></button>
                    </div>
                    
                    {/* 🦈 TOP 3 TURMAS GANHANDO */}
                    {topTurmasPoll.length > 0 && (
                        <div className="flex gap-2 mb-2 items-center bg-black/20 p-2 rounded-lg border border-white/5">
                            {topTurmasPoll.map(turma => (
                                <div key={turma} className="flex items-center gap-1">
                                    <div className="w-5 h-5 rounded-full border border-zinc-700 overflow-hidden">
                                        <img src={TURMA_IMAGENS[turma] || TURMA_IMAGENS["Geral"]} className="w-full h-full object-cover"/>
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400">{turma}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-2">
                        {currentPoll.options?.sort((a:any, b:any) => (b.votes || 0) - (a.votes || 0)).map((opt: any, idx: number) => {
                            const totalVotes = currentPoll.options.reduce((acc:number, o:any) => acc + (o.votes || 0), 0);
                            const percent = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                            return (
                                <div key={idx} className="relative group">
                                    <button onClick={() => handleVotePoll(currentPoll.id, idx)} className="w-full relative bg-black rounded overflow-hidden flex justify-between items-center h-10 text-xs hover:bg-zinc-800 transition" title={`${opt.votes} votos`}>
                                        <div className="absolute left-0 top-0 h-full bg-purple-500/20 transition-all duration-500" style={{ width: `${percent}%` }}></div>
                                        
                                        <div className="relative z-10 pl-3 flex items-center gap-2 max-w-[70%]">
                                            {/* 🦈 AVATAR DO CRIADOR */}
                                            {opt.creatorAvatar && (
                                                <img src={opt.creatorAvatar} className="w-5 h-5 rounded-full border border-zinc-700 object-cover" title={`Criado por ${opt.creatorName}`}/>
                                            )}
                                            <span className="truncate text-left">{opt.text}</span>
                                        </div>
                                        
                                        {/* 🦈 ID 654: QTD VOTOS (NÃO %) */}
                                        <span className="relative z-10 pr-3 text-zinc-500 font-bold group-hover:text-purple-400 flex items-center gap-1">
                                            {opt.votes} <span className="text-[8px] font-normal uppercase">Votos</span>
                                        </span>
                                    </button>
                                    
                                    {/* 🦈 ID 640: BOTÃO REPORTAR OPÇÃO */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleReportOption(currentPoll.id, opt.text); }}
                                        className="absolute right-[-20px] top-1/2 -translate-y-1/2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        title="Reportar Opção"
                                    >
                                        <Flag size={10}/>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    
                    <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-800/50">
                        <input 
                            value={newPollOption}
                            onChange={e => setNewPollOption(e.target.value)}
                            placeholder="Adicionar resposta..."
                            className="bg-transparent text-xs text-white border-b border-zinc-700 outline-none flex-1 py-1"
                            maxLength={20}
                        />
                        <button onClick={() => handleCreatePollOption(currentPoll.id)} className="text-[10px] bg-purple-500/10 text-purple-400 px-2 rounded uppercase font-bold hover:bg-purple-500 hover:text-white transition">Add</button>
                    </div>
                </div>
            ) : (
                <p className="text-[10px] text-zinc-600 italic">Nenhuma enquete ativa no momento.</p>
            )}
        </div>

        {/* COMENTÁRIOS */}
        <div className="space-y-6 pt-4 border-t border-zinc-800">
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Mural do Rolê</h3>
            
            <div className="flex gap-2">
                <input 
                    value={newComment} 
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Solta o verbo..." 
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 text-sm text-white outline-none focus:border-emerald-500 transition-colors"
                />
                <button onClick={handleSendComment} className="bg-emerald-500 p-3 rounded-xl text-black hover:bg-emerald-400 shadow-lg shadow-emerald-900/20">
                    <Send size={18}/>
                </button>
            </div>

            <div className="space-y-4">
                {comentarios.map((c) => {
                    const nameColorClass = PLAN_COLORS[c.userPlanoCor || 'zinc'] || "text-zinc-300";
                    const likesArray = Array.isArray(c.likes) ? c.likes : [];

                    return (!c.hidden || isAdmin) && (
                        <div key={c.id} className={`flex gap-3 ${c.hidden ? 'opacity-50 grayscale' : ''}`}>
                            <Link href={`/perfil/${c.userId}`}>
                                <div className="relative group/avatar cursor-pointer">
                                    <img src={c.userAvatar || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full bg-zinc-800 object-cover border border-zinc-800 group-hover/avatar:border-emerald-500 transition-colors"/>
                                </div>
                            </Link>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1.5">
                                            <p className={`text-xs font-black ${nameColorClass} flex items-center gap-1`}>
                                                {c.userName}
                                            </p>
                                            <UserBadges data={c} />
                                        </div>
                                        <span className="text-[9px] text-zinc-600 font-mono mt-0.5">{c.userTurma || "Visitante"}</span>
                                    </div>

                                    <div className="flex gap-2 text-zinc-500">
                                        <button onClick={() => handleLikeComment(c.id, c.likes || [], c.userId)} className={`flex items-center gap-1 hover:text-red-500 ${likesArray.includes(user?.uid) ? 'text-red-500' : ''}`}>
                                            <Heart size={12} className={likesArray.includes(user?.uid) ? "fill-current" : ""}/> 
                                            <span className="text-[9px]">{likesArray.length || 0}</span>
                                        </button>
                                        
                                        <button onClick={() => handleReportComment(c.id)} className="hover:text-yellow-500"><ShieldAlert size={12}/></button>
                                        
                                        {(user?.uid === c.userId || isAdmin) && (
                                            <button onClick={() => handleDeleteComment(c.id)} className="hover:text-red-500 transition-colors" title="Apagar">
                                                <Trash2 size={12}/>
                                            </button>
                                        )}

                                        {isAdmin && (
                                            <button onClick={() => handleToggleHideComment(c.id, c.hidden)} className="hover:text-red-500 opacity-50 hover:opacity-100">
                                                {c.hidden ? <CheckCircle size={12}/> : <div className="w-3 h-3 bg-zinc-700 rounded-full"></div>}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{c.text}</p>
                                {c.hidden && <span className="text-[9px] text-red-500 font-bold uppercase block mt-1 border border-red-900/30 bg-red-900/10 px-2 py-0.5 rounded w-fit">Oculto pelo Admin</span>}
                            </div>
                        </div>
                    );
                })}
                {comentarios.length === 0 && <p className="text-center text-xs text-zinc-600 py-4">Seja o primeiro a comentar!</p>}
            </div>
        </div>

      </div>

      {modalUsersType && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-zinc-950 w-full max-w-sm rounded-3xl border border-zinc-800 max-h-[70vh] flex flex-col shadow-2xl">
                  <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 rounded-t-3xl">
                      <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                          {modalUsersType === 'going' ? <CheckCircle size={16} className="text-emerald-500"/> : <HelpCircle size={16} className="text-yellow-500"/>}
                          {modalUsersType === 'going' ? 'Confirmados' : 'Interessados'}
                      </h3>
                      <button onClick={() => setModalUsersType(null)} className="p-2 hover:bg-zinc-800 rounded-full transition"><XCircle size={20} className="text-zinc-500"/></button>
                  </div>
                  <div className="p-2 overflow-y-auto space-y-1 custom-scrollbar flex-1">
                      {modalUsers.map((u, i) => (
                          <Link key={i} href={`/perfil/${u.userId}`} className="flex items-center gap-3 p-3 hover:bg-zinc-900 rounded-2xl transition group">
                              <div className="relative">
                                  <img src={u.userAvatar || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-800 group-hover:border-emerald-500 transition-colors"/>
                                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-800 rounded-full flex items-center justify-center text-[9px] font-black text-white border border-black">
                                      {u.userTurma || "?"}
                                  </div>
                              </div>
                              <div className="flex-1">
                                  <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{u.userName}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase font-bold">Ver Perfil</p>
                              </div>
                              <ArrowLeft size={16} className="rotate-180 text-zinc-700 group-hover:text-white transition-colors"/>
                          </Link>
                      ))}
                      {modalUsers.length === 0 && (
                          <div className="flex flex-col items-center justify-center py-12 text-zinc-600 gap-2">
                              <Users size={32} className="opacity-20"/>
                              <p className="text-xs">Ninguém nesta lista ainda.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}