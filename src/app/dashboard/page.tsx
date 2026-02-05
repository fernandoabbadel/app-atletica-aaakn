"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Loader2, Target, Users, Heart, 
  CheckCircle, ChevronRight, ChevronLeft, ShoppingBag, 
  Star, Wallet, Dumbbell, Medal, ExternalLink, MessageCircle, Lightbulb, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import Link from 'next/link';
import Image from 'next/image'; // 🦈 Otimização de Imagem
import { db } from '../../lib/firebase'; 
import { 
    collection, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot, getDocs, where, Timestamp
} from 'firebase/firestore';

// --- INTERFACES ESTRITAS ---

interface Evento {
  id: string;
  titulo: string;
  data: string;
  local: string;
  imagem: string;
  tipo: string;
  likesList: string[];
  participantes: string[];
  imagePositionY?: number;
}

interface Produto {
    id: string;
    nome: string;
    preco: string | number;
    img: string; 
    likes: string[];
}

interface Liga {
    id: string;
    nome: string;
    sigla: string;
    foto?: string;       
    logoBase64?: string; 
    logo?: string;       
    bizu?: string;       
}

interface Parceiro {
    id: string;
    nome: string;
    imgLogo: string;
    imgCapa?: string;
    categoria?: string;
    plano?: string;
    status?: string;
}

interface PostComunidade { 
    id: string;
    userId: string;
    userName: string; 
    avatar: string;
    createdAt: Timestamp;   
    texto: string;
    likes: string[];
}

interface UserData {
    uid: string;
    nome: string;
    foto: string;
    turma: string;
    level?: number;
    selos?: number;
}

// --- SUB-COMPONENTES PADRONIZADOS ---

const NavButton = ({ onClick, icon: Icon }: { onClick: () => void, icon: React.ElementType }) => (
    <button 
        onClick={onClick} 
        className="w-8 h-8 flex items-center justify-center bg-zinc-900 rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:border-emerald-500 hover:bg-zinc-800 transition-all shadow-md active:scale-95"
    >
        <Icon size={16}/>
    </button>
);

interface SectionHeaderProps {
    title: string;
    icon: React.ElementType;
    link?: string;
    onPrev?: () => void;
    onNext?: () => void;
    colorClass?: string;
}

const SectionHeader = ({ title, icon: Icon, link, onPrev, onNext, colorClass = "text-emerald-500" }: SectionHeaderProps) => (
    <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-sm font-black uppercase tracking-widest mb-0 flex items-center gap-2 text-white">
            <Icon size={18} className={colorClass}/> {title}
        </h2>
        <div className="flex items-center gap-3">
            {link && (
                <Link href={link} className={`text-[10px] font-bold text-zinc-500 hover:${colorClass.replace('text-', 'text-hover-')} uppercase transition flex items-center gap-1`}>
                    Ver todos <ExternalLink size={10}/>
                </Link>
            )}
            {(onPrev || onNext) && (
                <div className="flex gap-2">
                    {onPrev && <NavButton onClick={onPrev} icon={ChevronLeft} />}
                    {onNext && <NavButton onClick={onNext} icon={ChevronRight} />}
                </div>
            )}
        </div>
    </div>
);

// --- COMPONENTE: CARD EVENTO ---
const EventCardItem = ({ evt, userId, onToggleLike }: { evt: Evento, userId: string, onToggleLike: (id: string, state: boolean) => void }) => {
  const isLiked = evt.likesList?.includes(userId);
  const isGoing = evt.participantes?.includes(userId);

  return (
    <div className="bg-zinc-900 min-w-full rounded-3xl overflow-hidden border border-zinc-800 flex flex-col snap-center relative h-[450px]">
      <Link href={`/eventos/${evt.id}`} className="relative h-64 w-full bg-black block group">
        {evt.imagem ? (
            <Image 
                src={evt.imagem} 
                alt={evt.titulo}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition duration-500" 
                style={{ objectPosition: `50% ${evt.imagePositionY || 50}%` }} 
                unoptimized
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700"><Calendar size={48}/></div>
        )}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase bg-black/60 backdrop-blur-md border border-white/10 shadow-xl z-10">{evt.tipo || 'Geral'}</span>
      </Link>
      
      <div className="p-6 flex flex-col justify-between flex-1 bg-gradient-to-b from-zinc-900 to-black">
        <div>
            <h3 className="font-black text-2xl text-white italic uppercase leading-tight line-clamp-2">{evt.titulo}</h3>
            <div className="flex gap-4 mt-3 text-zinc-400 font-bold text-xs">
                <p className="flex items-center gap-1.5"><Calendar size={14} className="text-emerald-500"/> {evt.data}</p>
                {evt.local && <p className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500"/> {evt.local}</p>}
            </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button 
                onClick={(e) => { e.preventDefault(); onToggleLike(evt.id, isLiked); }} 
                className={`flex items-center gap-2 font-bold text-xs transition ${isLiked ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
            >
                <Heart size={20} className={isLiked ? 'fill-current' : ''}/> {evt.likesList?.length || 0}
            </button>
            
            <Link href={`/eventos/${evt.id}`} className={`px-6 py-3 rounded-xl font-black text-xs uppercase border transition flex items-center gap-2 shadow-lg ${isGoing ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-emerald-500 hover:text-white'}`}>
                {isGoing && <CheckCircle size={14}/>} {isGoing ? 'Confirmado' : 'Ver Detalhes'}
            </Link>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE: CARD PRODUTO COM CONTADOR DE TURMAS ---
const ProductCard = ({ prod, userId, onToggleLike }: { prod: Produto, userId: string, onToggleLike: (id: string, state: boolean) => void }) => {
    const isLiked = prod.likes?.includes(userId);
    const likeCount = prod.likes?.length || 0;
    
    // Estado para guardar as estatísticas das turmas
    const [turmaStats, setTurmaStats] = useState<{turma: string, count: number}[]>([]);

    useEffect(() => {
        const calculateTurmas = async () => {
            if (!prod.likes || prod.likes.length === 0) {
                setTurmaStats([]);
                return;
            }

            try {
                // Pegamos uma amostra dos últimos 10 likes para não sobrecarregar o banco
                const likesSample = prod.likes.slice(0, 10);
                
                // Busca os usuários que deram like para saber a turma
                const q = query(collection(db, "users"), where("uid", "in", likesSample));
                const querySnapshot = await getDocs(q);
                
                const stats: Record<string, number> = {};

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const turmaRaw = data.turma || "Geral";
                    const turmaKey = turmaRaw.replace(/\D/g, '') || "Geral"; 
                    
                    if (turmaKey !== "Geral") {
                        stats[turmaKey] = (stats[turmaKey] || 0) + 1;
                    }
                });

                const sorted = Object.entries(stats)
                    .map(([turma, count]) => ({ turma, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 3); // Pega Top 3

                setTurmaStats(sorted);

            } catch (error) {
                console.error("Erro ao calcular turmas:", error);
            }
        };

        calculateTurmas();
    }, [prod.likes]); 

    return (
        <div className="bg-zinc-900 min-w-full rounded-3xl overflow-hidden border border-zinc-800 flex flex-col h-[450px] snap-center group relative">
            <Link href={`/loja/${prod.id}`} className="h-64 bg-black relative block overflow-hidden">
                <Image 
                    src={prod.img} 
                    alt={prod.nome}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500" 
                    unoptimized
                />
            </Link>
            
            <div className="p-6 flex flex-col justify-between flex-1 bg-gradient-to-b from-zinc-900 to-black">
                <div>
                    <h3 className="font-black text-2xl uppercase text-white leading-tight line-clamp-2">{prod.nome}</h3>
                    <p className="text-purple-400 font-black text-xl mt-2">R$ {Number(prod.preco).toFixed(2)}</p>
                </div>
                
                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                    {/* Linha 1: Botões */}
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <button 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    onToggleLike(prod.id, isLiked); 
                                }} 
                                className={`p-2 rounded-full border transition active:scale-90 ${isLiked ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white'}`}
                            >
                                <Heart size={20} className={isLiked ? 'fill-current' : ''}/>
                            </button>
                            <span className="text-xs font-bold text-zinc-500">{likeCount}</span>
                        </div>
                        <Link href={`/loja/${prod.id}`} className="px-5 py-2.5 rounded-xl font-black text-xs uppercase border border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white transition">
                            Comprar
                        </Link>
                    </div>

                    {/* Linha 2: Contador de Turmas (NOVO) */}
                    {turmaStats.length > 0 && (
                        <div className="flex items-center gap-2">
                            {turmaStats.map((st, i) => (
                                <div key={i} className="flex items-center bg-zinc-800/50 rounded-full pr-2 border border-zinc-700/50 p-0.5">
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-600 bg-black relative">
                                         <Image 
                                            src={`/turma${st.turma}.jpeg`} 
                                            alt={`T${st.turma}`}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                         />
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-400 ml-1.5">+{st.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const [events, setEvents] = useState<Evento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [parceiros, setParceiros] = useState<Parceiro[]>([]);
  const [ligas, setLigas] = useState<Liga[]>([]);
  const [mensagens, setMensagens] = useState<PostComunidade[]>([]);
  const [treinos, setTreinos] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingLike, setLoadingLike] = useState(false);

  // Refs com Tipagem Correta para scroll
  const eventsScrollRef = useRef<HTMLDivElement | null>(null);
  const productsScrollRef = useRef<HTMLDivElement | null>(null);
  const ligasScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubEvents = onSnapshot(query(collection(db, "eventos"), orderBy("data", "asc"), limit(5)), (snap) => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Evento)));
    });

    const unsubProds = onSnapshot(query(collection(db, "produtos"), limit(8)), (snap) => {
        setProdutos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Produto)));
    });

    const unsubParceiros = onSnapshot(query(collection(db, "parceiros")), (snap) => {
        setParceiros(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Parceiro).filter(p => p.status === 'active'));
    });

    const unsubLigas = onSnapshot(query(collection(db, "ligas_config")), (snap) => {
        setLigas(snap.docs.map(d => ({ id: d.id, ...d.data() } as Liga)));
    });

    // ID 720: Correção para buscar da coleção "posts"
    const unsubMsgs = onSnapshot(
        query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(5)), 
        (snap) => {
            setMensagens(snap.docs.map(d => ({ id: d.id, ...d.data() } as PostComunidade)));
        },
        (error) => {
            console.error("Erro na Comunidade:", error);
        }
    );

    const unsubTreinos = onSnapshot(query(collection(db, "treinos"), limit(4)), (snap) => {
        setTreinos(snap.docs.map(d => d.data().imagem).filter(Boolean));
        setLoadingData(false);
    });

    return () => { unsubEvents(); unsubProds(); unsubParceiros(); unsubMsgs(); unsubTreinos(); unsubLigas(); };
  }, []);

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => { 
      if (ref.current) {
          ref.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' }); 
      }
  };
  
  // Handlers com Proteção
  const handleEventLike = async (id: string, state: boolean) => { 
      if(!user || loadingLike) return; 
      setLoadingLike(true);
      try { await updateDoc(doc(db,"eventos",id), { likesList: state ? arrayRemove(user.uid) : arrayUnion(user.uid) }); } 
      finally { setLoadingLike(false); }
  };

  const handleProductLike = async (id: string, state: boolean) => {
      if(!user || loadingLike) return;
      setLoadingLike(true);
      try { await updateDoc(doc(db, "produtos", id), { likes: state ? arrayRemove(user.uid) : arrayUnion(user.uid) }); }
      finally { setLoadingLike(false); }
  };

  const handleMessageLike = async (id: string, currentLikes: string[]) => {
      if(!user || loadingLike) return;
      setLoadingLike(true);
      try {
        const isLiked = currentLikes?.includes(user.uid);
        await updateDoc(doc(db, "posts", id), { likes: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid) });
      } finally { setLoadingLike(false); }
  };

  const formatTime = (ts: Timestamp) => { 
      if (!ts) return ""; 
      const d = ts.toDate(); 
      const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000); 
      return diff < 60 ? `${diff}min` : `${Math.floor(diff/60)}h`; 
  };

  const parceirosOuro = parceiros.filter(p => p.categoria === 'ouro' || p.plano === 'ouro');
  const parceirosComuns = parceiros.filter(p => p.categoria !== 'ouro' && p.plano !== 'ouro');
  const ligasComBizu = ligas.filter(l => l.bizu && l.bizu.trim() !== "");

  if (loading || loadingData) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-10 h-10" /></div>;

  const userData = user as unknown as UserData; 

  return (
    <div className="flex flex-col gap-8 p-5 pb-32 max-w-md mx-auto w-full bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Fala, {userData?.nome?.split(' ')[0]}! 🦈</h1>
          <p className="text-zinc-500 text-xs font-bold tracking-wide">Pronto para dominar?</p>
        </div>
        <Link href="/perfil">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border-2 border-emerald-500 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.3)] relative">
                <Image 
                    src={userData?.foto || "https://github.com/shadcn.png"} 
                    alt="Perfil" 
                    fill
                    className="rounded-full object-cover" 
                    unoptimized
                />
            </div>
        </Link>
      </div>

      {/* 1. CARTEIRINHA */}
      <Link href="/carteirinha" className="relative h-40 w-full overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 active:scale-95 transition group shadow-2xl block">
          <Image 
            src={`/turma${userData?.turma?.replace('T','') || '1'}.jpeg`} 
            alt="Carteira BG"
            fill
            className="object-cover opacity-40 group-hover:opacity-50 transition transform group-hover:scale-105 duration-700" 
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-emerald-500"/>
                  <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/20">Sócio Ativo</span>
              </div>
              <h2 className="text-2xl font-black italic uppercase text-white drop-shadow-lg">Carteirinha</h2>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Turma {userData?.turma || "Geral"}</p>
          </div>
      </Link>

      {/* PARCEIROS OURO */}
      {parceirosOuro.length > 0 && (
          <div className="relative overflow-hidden rounded-3xl p-[1px] bg-gradient-to-r from-yellow-600 via-yellow-300 to-yellow-600 animate-shine bg-[length:200%_100%] shadow-[0_0_20px_rgba(234,179,8,0.2)]">
              <div className="bg-[#1a1500] rounded-[23px] p-5 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-20"><Star size={40} className="text-yellow-400 fill-yellow-400 animate-pulse"/></div>
                 <h2 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Star size={14} className="fill-yellow-500"/> Parceiros Master
                 </h2>
                 <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x">
                     {parceirosOuro.map(p => (
                         <Link href={`/parceiros/${p.id}`} key={p.id} className="min-w-[80px] flex flex-col items-center gap-2 snap-start group">
                             <div className="w-16 h-16 rounded-full bg-black border-2 border-yellow-500/50 p-1 group-hover:scale-110 transition shadow-[0_0_15px_rgba(234,179,8,0.3)] relative">
                                 <Image src={p.imgLogo} alt={p.nome} fill className="rounded-full object-cover" unoptimized/>
                             </div>
                             <span className="text-[10px] font-bold text-yellow-200/80 truncate max-w-[80px]">{p.nome}</span>
                         </Link>
                     ))}
                 </div>
              </div>
          </div>
      )}

      {/* 2. SHARK ROUND & TREINOS */}
      <div className="grid grid-cols-2 gap-4">
          <Link href="/sharkround" className="bg-emerald-600 rounded-3xl p-5 h-44 flex flex-col justify-between active:scale-95 transition relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
              <Target size={32} className="text-black relative z-10" />
              <h3 className="font-black text-black text-xl uppercase italic leading-none relative z-10 drop-shadow-md">Shark<br/>Round</h3>
          </Link>
          
          <Link href="/treinos" className="bg-zinc-900 rounded-3xl h-44 overflow-hidden relative active:scale-95 transition border border-zinc-800 group shadow-lg">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30 group-hover:opacity-50 transition">
                  {treinos.length > 0 ? treinos.map((img, i) => (
                    <div key={i} className="relative w-full h-full border-[0.5px] border-black">
                        <Image src={img} alt="Treino" fill className="object-cover" unoptimized/>
                    </div>
                  )) : (
                      <>
                        <div className="bg-zinc-800 w-full h-full"></div><div className="bg-zinc-700 w-full h-full"></div>
                        <div className="bg-zinc-700 w-full h-full"></div><div className="bg-zinc-800 w-full h-full"></div>
                      </>
                  )}
              </div>
              <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black via-black/20 to-transparent">
                  <Dumbbell size={24} className="text-orange-500 mb-1 drop-shadow-md"/>
                  <h3 className="font-black text-white uppercase italic text-xl">Treinos</h3>
              </div>
          </Link>
      </div>

      {/* 3. CONQUISTAS & FIDELIDADE */}
      <div className="grid grid-cols-2 gap-4">
          <Link href="/conquistas" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 h-44 flex flex-col justify-between active:scale-95 transition hover:border-zinc-700 group relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 opacity-10 p-2"><Medal size={80}/></div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 font-black text-xl shadow-[0_0_10px_rgba(16,185,129,0.2)]">{userData?.level || 1}</div>
              <h3 className="font-black text-white text-lg uppercase italic leading-none">Nível</h3>
          </Link>
          <Link href="/fidelidade" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 h-44 flex flex-col justify-between active:scale-95 transition hover:border-zinc-700 group relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 opacity-10 p-2"><Star size={80} className="text-yellow-500"/></div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 font-black shadow-[0_0_10px_rgba(234,179,8,0.2)]"><Star size={20} className="fill-current"/></div>
              <div>
                  <h3 className="font-black text-white text-lg uppercase italic leading-none">Fidelidade</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">{userData?.selos || 0} Selos</p>
              </div>
          </Link>
      </div>

      {/* 4. CARROSSEL EVENTOS (Padronizado) */}
      {events.length > 0 && (
          <div className="relative group/car">
              <SectionHeader 
                  title="Eventos" 
                  icon={Calendar} 
                  link="/eventos" 
                  colorClass="text-emerald-500"
                  onPrev={() => scroll(eventsScrollRef, 'left')} 
                  onNext={() => scroll(eventsScrollRef, 'right')} 
              />
              <div ref={eventsScrollRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4">
                  {events.map(evt => <EventCardItem key={evt.id} evt={evt} userId={userData?.uid} onToggleLike={handleEventLike} />)}
              </div>
          </div>
      )}

      {/* --- BIZU DAS LIGAS (Reels + Letreiro) --- */}
      {ligasComBizu.length > 0 && (
          <div className="space-y-4">
               <SectionHeader 
                  title="BIZU DAS LIGAS" 
                  icon={Lightbulb} 
                  link="/ligas_unitau" 
                  colorClass="text-yellow-500"
                  onPrev={() => scroll(ligasScrollRef, 'left')} 
                  onNext={() => scroll(ligasScrollRef, 'right')} 
               />
               
               <div className="relative group/ligas">
                   <div ref={ligasScrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide snap-x px-1 py-2">
                       {ligasComBizu.map(liga => (
                           <Link href={`/ligas_unitau`} key={liga.id} className="min-w-[160px] flex flex-col items-center gap-4 snap-start group cursor-pointer relative bg-gradient-to-b from-zinc-900 to-black p-5 rounded-[24px] border border-zinc-800 hover:border-yellow-500/50 transition-all shadow-xl active:scale-95">
                               
                               <div className="relative w-24 h-24">
                                   <div className="absolute inset-0 rounded-full border-2 border-dashed border-yellow-500/50 animate-spin-slow pointer-events-none"></div>
                                   <div className="w-full h-full rounded-full bg-zinc-950 p-1.5 relative z-10 overflow-hidden shadow-lg group-hover:scale-105 transition">
                                       <Image 
                                            src={liga.foto || liga.logoBase64 || liga.logo || "/placeholder_liga.png"} 
                                            alt={liga.nome}
                                            fill
                                            className="rounded-full object-cover"
                                            unoptimized
                                       />
                                   </div>
                                   <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-black p-1.5 rounded-full z-20 border-2 border-black">
                                       <Lightbulb size={12} fill="black"/>
                                   </div>
                               </div>
                               
                               <div className="text-center w-full overflow-hidden">
                                   <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest block mb-2 group-hover:text-yellow-500 transition">{liga.sigla}</span>
                                   
                                   <div className="w-full bg-zinc-900/50 py-2 px-3 rounded-lg border border-zinc-800/50 relative overflow-hidden">
                                       <div className="w-full overflow-hidden whitespace-nowrap">
                                           <p className="text-[10px] text-zinc-300 italic inline-block animate-marquee pl-[100%] leading-relaxed">
                                               &quot;{liga.bizu}&quot;
                                           </p>
                                       </div>
                                   </div>
                               </div>
                           </Link>
                       ))}
                   </div>
               </div>
          </div>
      )}

      {/* 5. LOJA (Tamanho igual Eventos + Contador Turmas) */}
      {produtos.length > 0 && (
          <div className="relative group/car">
              <SectionHeader 
                  title="Lojinha" 
                  icon={ShoppingBag} 
                  link="/loja" 
                  colorClass="text-purple-500"
                  onPrev={() => scroll(productsScrollRef, 'left')} 
                  onNext={() => scroll(productsScrollRef, 'right')} 
              />
              <div ref={productsScrollRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4">
                  {produtos.map(p => <ProductCard key={p.id} prod={p} userId={userData?.uid} onToggleLike={handleProductLike} />)}
              </div>
          </div>
      )}

      {/* 6. PARCEIROS (Logo Aumentado) */}
      {parceirosComuns.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 relative overflow-hidden">
               <SectionHeader title="Parceiros" icon={Users} link="/parceiros" colorClass="text-zinc-500"/>
               <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x relative z-10 pb-2">
                   {parceirosComuns.map((p) => (
                       <Link href={`/parceiros/${p.id}`} key={p.id} className="min-w-[150px] h-44 bg-black rounded-2xl flex flex-col items-center justify-center gap-4 snap-start group active:scale-95 transition relative overflow-hidden border border-zinc-800 hover:border-zinc-600">
                           <div className="absolute inset-0">
                               <Image src={p.imgCapa || "/placeholder.jpg"} alt="Capa" fill className="object-cover opacity-30 group-hover:opacity-50 transition" unoptimized/>
                               <div className="absolute inset-0 bg-black/40"/>
                           </div>
                           <div className="w-20 h-20 bg-black rounded-full border-2 border-zinc-600 flex items-center justify-center overflow-hidden shadow-2xl relative z-10 group-hover:scale-110 transition">
                               <Image src={p.imgLogo} alt="Logo" fill className="object-cover" unoptimized/>
                           </div>
                           <div className="text-center relative z-10 px-2 w-full">
                               <h4 className="text-xs font-bold text-white truncate">{p.nome}</h4>
                           </div>
                       </Link>
                   ))}
               </div>
          </div>
      )}

      {/* 7. COMUNIDADE (Posts) */}
      <div className="space-y-4">
          <SectionHeader title="Comunidade" icon={MessageCircle} link="/comunidade" colorClass="text-zinc-500"/>
          {mensagens.length > 0 ? mensagens.map((msg) => {
              const userLikedMsg = msg.likes?.includes(userData?.uid);
              return (
              <div key={msg.id} className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden relative group">
                   <Link href="/comunidade" className="absolute inset-0 z-0"/>
                   
                   <div className="p-4 flex gap-4 items-start relative z-0">
                      <div className="w-10 h-10 rounded-full bg-black border border-zinc-700 relative overflow-hidden">
                        <Image 
                            src={msg.avatar || "https://github.com/shadcn.png"} 
                            alt="Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between w-full gap-2 mb-1">
                              <span className="text-sm font-bold text-white truncate">{msg.userName}</span>
                              <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatTime(msg.createdAt)}</span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{msg.texto}</p>
                      </div>
                   </div>

                   <div className="px-4 pb-3 flex justify-end relative z-10">
                       <button 
                          onClick={(e) => { e.preventDefault(); handleMessageLike(msg.id, msg.likes); }}
                          className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full transition ${userLikedMsg ? 'text-red-500 bg-red-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}
                       >
                           <Heart size={12} className={userLikedMsg ? 'fill-current' : ''}/> {msg.likes?.length || 0}
                       </button>
                   </div>
              </div>
          )}) : (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                  <p className="text-zinc-600 text-xs italic">Nenhuma mensagem recente.</p>
              </div>
          )}
      </div>

      <div className="h-6"></div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shine {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        .animate-shine {
          animation: shine 4s linear infinite;
        }
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
        }
        @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
        }
        .animate-marquee {
            animation: marquee 8s linear infinite;
        }
      `}</style>
    </div>
  );
}