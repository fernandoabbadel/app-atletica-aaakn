"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Calendar, Loader2, Target, Users, Heart, 
  CheckCircle, ChevronRight, ChevronLeft, ShoppingBag, 
  Star, Wallet, Dumbbell, Medal, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase'; 
import { 
    collection, query, orderBy, limit, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot 
} from 'firebase/firestore';

// --- TIPAGEM BASEADA NO SEU PRINT ---
interface Evento {
  id: string;
  titulo: string;
  data: string;
  local: string;
  imagem: string; // ✅ Corrigido conforme print
  tipo: string;
  likesList: string[]; // ✅ Corrigido conforme print
  participantes: string[]; // ✅ Corrigido conforme print
  imagePositionY?: number;
}

interface Produto {
    id: string;
    nome: string;
    preco: string | number;
    img: string; 
    likes: string[];
}

// --- CARD EVENTO ---
const EventCardItem = ({ evt, userId, onToggleLike }: any) => {
  const isLiked = evt.likesList?.includes(userId);
  const isGoing = evt.participantes?.includes(userId);

  return (
    <div className="bg-zinc-900 min-w-full rounded-3xl overflow-hidden border border-zinc-800 flex flex-col snap-center relative h-[450px]">
      <Link href={`/eventos/${evt.id}`} className="relative h-64 w-full bg-black block group">
        {evt.imagem ? (
            <img 
                src={evt.imagem} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition duration-500" 
                style={{ objectPosition: `50% ${evt.imagePositionY || 50}%` }} 
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-700"><Calendar size={48}/></div>
        )}
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase bg-black/60 backdrop-blur-md border border-white/10">{evt.tipo || 'Geral'}</span>
      </Link>
      
      <div className="p-6 flex flex-col justify-between flex-1">
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
            
            <Link href={`/eventos/${evt.id}`} className={`px-6 py-2 rounded-full font-black text-xs uppercase border transition flex items-center gap-2 ${isGoing ? 'bg-emerald-500 text-black border-emerald-500' : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-emerald-500'}`}>
                {isGoing && <CheckCircle size={14}/>} {isGoing ? 'Confirmado' : 'Ver Detalhes'}
            </Link>
        </div>
      </div>
    </div>
  );
};

// --- CARD PRODUTO ---
const ProductCard = ({ prod }: any) => (
    <Link href={`/loja/${prod.id}`} className="bg-zinc-900 min-w-full rounded-3xl overflow-hidden border border-zinc-800 flex flex-col h-[450px] snap-center">
        <div className="h-64 bg-black relative">
            <img src={prod.img} className="w-full h-full object-cover" />
        </div>
        <div className="p-6 flex justify-between items-center">
            <div>
                <h3 className="font-black text-xl uppercase text-white">{prod.nome}</h3>
                <p className="text-emerald-400 font-black text-lg">R$ {Number(prod.preco).toFixed(2)}</p>
            </div>
            <div className="bg-white text-black p-3 rounded-full"><ChevronRight/></div>
        </div>
    </Link>
);

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Evento[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [treinos, setTreinos] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const eventsScrollRef = useRef<HTMLDivElement>(null);
  const productsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Eventos (Ordenado por Data)
    const unsubEvents = onSnapshot(query(collection(db, "eventos"), orderBy("data", "asc"), limit(5)), (snap) => {
        setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as Evento)));
    });

    // 2. Produtos
    const unsubProds = onSnapshot(query(collection(db, "produtos"), limit(5)), (snap) => {
        setProdutos(snap.docs.map(d => ({ id: d.id, ...d.data() } as Produto)));
    });

    // 3. Parceiros (Ativos)
    const unsubParceiros = onSnapshot(query(collection(db, "parceiros")), (snap) => {
        setParceiros(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((p:any) => p.status === 'active'));
    });

    // 4. Comunidade (Mensagens)
    const unsubMsgs = onSnapshot(query(collection(db, "comunidade"), orderBy("timestamp", "desc"), limit(2)), (snap) => {
        setMensagens(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // 5. Treinos (Mosaico)
    const unsubTreinos = onSnapshot(query(collection(db, "treinos"), limit(4)), (snap) => {
        setTreinos(snap.docs.map(d => d.data().imagem).filter(Boolean));
        setLoadingData(false);
    });

    return () => { unsubEvents(); unsubProds(); unsubParceiros(); unsubMsgs(); unsubTreinos(); };
  }, []);

  const scroll = (ref: any, dir: 'left' | 'right') => { ref.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' }); };
  
  const handleEventLike = async (id: string, state: boolean) => { 
      if(!user) return; 
      await updateDoc(doc(db,"eventos",id), { likesList: state ? arrayRemove(user.uid) : arrayUnion(user.uid) }); 
  };

  const formatTime = (ts: any) => { 
      if (!ts) return ""; 
      const d = ts.toDate ? ts.toDate() : new Date(ts); 
      const diff = Math.floor((new Date().getTime() - d.getTime()) / 60000); 
      return diff < 60 ? `${diff}min` : `${Math.floor(diff/60)}h`; 
  };

  if (loading || loadingData) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  // Safe User Access
  const userData = user as any; 

  return (
    <div className="flex flex-col gap-8 p-5 pb-32 max-w-md mx-auto w-full bg-[#050505] min-h-screen text-white font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Fala, {userData?.nome?.split(' ')[0]}! 🦈</h1>
          <p className="text-zinc-500 text-xs font-bold tracking-wide">Pronto para dominar?</p>
        </div>
        <Link href="/perfil">
            <div className="h-12 w-12 rounded-full bg-zinc-900 border-2 border-emerald-500 p-0.5 overflow-hidden">
                <img src={userData?.foto || "https://github.com/shadcn.png"} alt="Perfil" className="w-full h-full rounded-full object-cover" />
            </div>
        </Link>
      </div>

      {/* 1. CARTEIRINHA */}
      <Link href="/carteirinha" className="relative h-40 w-full overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 active:scale-95 transition group">
          <img src={`/turma${userData?.turma?.replace('T','') || '1'}.jpeg`} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition" />
          <div className="absolute inset-0 bg-gradient-to-r from-black p-6 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                  <Wallet size={16} className="text-emerald-500"/>
                  <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-900/30 px-2 py-0.5 rounded">Sócio Ativo</span>
              </div>
              <h2 className="text-2xl font-black italic uppercase text-white">Carteirinha</h2>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Turma {userData?.turma || "Geral"}</p>
          </div>
      </Link>

      {/* 2. SHARK ROUND & TREINOS */}
      <div className="grid grid-cols-2 gap-4">
          <Link href="/sharkround" className="bg-emerald-600 rounded-3xl p-5 h-44 flex flex-col justify-between active:scale-95 transition relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-white/10 rounded-full blur-xl -mr-6 -mt-6"></div>
              <Target size={32} className="text-black relative z-10" />
              <h3 className="font-black text-black text-xl uppercase italic leading-none relative z-10">Shark<br/>Round</h3>
          </Link>
          
          <Link href="/treinos" className="bg-zinc-900 rounded-3xl h-44 overflow-hidden relative active:scale-95 transition border border-zinc-800 group">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30 group-hover:opacity-50 transition">
                  {treinos.length > 0 ? treinos.map((img, i) => <img key={i} src={img} className="w-full h-full object-cover border-[0.5px] border-black"/>) : (
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
          <Link href="/conquistas" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 h-44 flex flex-col justify-between active:scale-95 transition hover:border-zinc-700 group relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 p-2"><Medal size={80}/></div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-500 font-black text-xl">{userData?.level || 1}</div>
              <h3 className="font-black text-white text-lg uppercase italic leading-none">Nível</h3>
          </Link>
          <Link href="/fidelidade" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 h-44 flex flex-col justify-between active:scale-95 transition hover:border-zinc-700 group relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 p-2"><Star size={80} className="text-yellow-500"/></div>
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-500 font-black"><Star size={20} className="fill-current"/></div>
              <div>
                  <h3 className="font-black text-white text-lg uppercase italic leading-none">Fidelidade</h3>
                  <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">{userData?.selos || 0} Selos</p>
              </div>
          </Link>
      </div>

      {/* 4. CARROSSEL EVENTOS */}
      {events.length > 0 && (
          <div className="relative group/car">
              <div className="flex items-center justify-between mb-4 px-1">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-0 flex items-center gap-2"><Calendar size={16} className="text-emerald-500"/> Eventos</h2>
                  <div className="flex gap-2">
                      <button onClick={() => scroll(eventsScrollRef, 'left')} className="p-1.5 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400 hover:text-white"><ChevronLeft size={16}/></button>
                      <button onClick={() => scroll(eventsScrollRef, 'right')} className="p-1.5 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400 hover:text-white"><ChevronRight size={16}/></button>
                  </div>
              </div>
              <div ref={eventsScrollRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4">
                  {events.map(evt => <EventCardItem key={evt.id} evt={evt} userId={userData?.uid} onToggleLike={handleEventLike} />)}
              </div>
          </div>
      )}

      {/* 5. PARCEIROS (Carrossel Box) */}
      {parceiros.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 relative overflow-hidden">
               <div className="flex items-center justify-between mb-5 relative z-10">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><Users size={16} className="text-blue-500"/> Parceiros</h2>
                 <Link href="/parceiros" className="text-[10px] text-blue-400 font-bold bg-blue-900/20 px-3 py-1.5 rounded-full hover:bg-blue-900/40 transition">Ver todos</Link>
               </div>
               <div className="flex overflow-x-auto gap-4 scrollbar-hide snap-x relative z-10 pb-2">
                   {parceiros.map((p: any) => (
                       <Link href={`/parceiros/${p.id}`} key={p.id} className="min-w-[140px] h-36 bg-black rounded-2xl flex flex-col items-center justify-center gap-3 snap-start group active:scale-95 transition relative overflow-hidden border border-zinc-800">
                           <div className="absolute inset-0">
                               <img src={p.imgCapa || "/placeholder.jpg"} className="w-full h-full object-cover opacity-30 group-hover:opacity-50 transition"/>
                               <div className="absolute inset-0 bg-black/40"/>
                           </div>
                           <div className="w-14 h-14 bg-black rounded-full border-2 border-zinc-600 flex items-center justify-center overflow-hidden shadow-xl relative z-10">
                               <img src={p.imgLogo} className="w-full h-full object-cover"/>
                           </div>
                           <div className="text-center relative z-10 px-2 w-full">
                               <h4 className="text-xs font-bold text-white truncate">{p.nome}</h4>
                           </div>
                       </Link>
                   ))}
               </div>
          </div>
      )}

      {/* 6. CARROSSEL LOJA */}
      {produtos.length > 0 && (
          <div className="relative group/car">
              <h2 className="text-sm font-black uppercase tracking-widest mb-4 px-1 flex items-center gap-2"><ShoppingBag size={16} className="text-purple-500"/> Lojinha</h2>
              <div ref={productsScrollRef} className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4">
                  {produtos.map(p => <ProductCard key={p.id} prod={p} />)}
              </div>
          </div>
      )}

      {/* 7. LIGAS UNITAU */}
      <Link href="/ligas_unitau" className="bg-blue-900/10 border border-blue-500/20 p-5 rounded-2xl flex items-center justify-between active:scale-95 transition hover:bg-blue-900/20 shadow-lg">
           <div className="flex items-center gap-4">
               <div className="bg-blue-500 p-3 rounded-xl text-black shadow-[0_0_15px_rgba(59,130,246,0.4)]"><Users size={20}/></div>
               <div>
                   <h4 className="text-base font-black text-white uppercase italic">Ligas Acadêmicas</h4>
                   <p className="text-xs text-zinc-400 font-medium">Conecte-se com a UNITAU.</p>
               </div>
           </div>
           <ExternalLink size={20} className="text-blue-500"/>
      </Link>

      {/* 8. COMUNIDADE */}
      <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Mural da Tuba</h2>
            <Link href="/comunidade" className="text-[10px] font-bold text-emerald-500 hover:underline">Ver tudo</Link>
          </div>
          {mensagens.length > 0 ? mensagens.map((msg: any) => (
              <Link href="/comunidade" key={msg.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex gap-4 items-start active:scale-95 transition hover:bg-zinc-800/80">
                  <img src={msg.avatar || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full bg-black object-cover border border-zinc-700"/>
                  <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between w-full gap-2 mb-1">
                          <span className="text-sm font-bold text-white truncate">{msg.autor}</span>
                          <span className="text-[10px] text-zinc-500 whitespace-nowrap">{formatTime(msg.timestamp)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-1">{msg.texto}</p>
                  </div>
              </Link>
          )) : (
              <div className="text-center py-6 border border-dashed border-zinc-800 rounded-xl">
                  <p className="text-zinc-600 text-xs italic">Nenhuma mensagem recente.</p>
              </div>
          )}
      </div>

      <div className="h-6"></div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}