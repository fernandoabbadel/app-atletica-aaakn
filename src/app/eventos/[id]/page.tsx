"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft, Calendar, MapPin, Share2, Ticket, Clock,
  Users, CheckCircle, HelpCircle, XCircle, Lock, Trophy, Loader2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, onSnapshot, collection, runTransaction, serverTimestamp, increment } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

// Mapa de imagens das turmas (Assets locais)
const TURMA_IMAGENS: Record<string, string> = {
    "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
    "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
    "T7": "/turma7.jpeg", "T8": "/turma8.jpeg"
};

export default function DetalhesEventoPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
 
  const [evento, setEvento] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRsvp, setUserRsvp] = useState<string | null>(null);

  // 1. CARREGAR DADOS DO FIREBASE
  useEffect(() => {
      if (!params.id) return;

      // Listener do Evento
      const unsubEvent = onSnapshot(doc(db, "eventos", params.id as string), (docSnap) => {
          if (docSnap.exists()) {
              setEvento({ id: docSnap.id, ...docSnap.data() });
          } else {
              setEvento(null); // Evento não existe
          }
          setLoading(false);
      });

      // Listener dos RSVPs (Lista de quem vai)
      const unsubRsvp = onSnapshot(collection(db, "eventos", params.id as string, "rsvps"), (snap) => {
          const lista = snap.docs.map(d => d.data());
          setRsvps(lista);
          
          if (user) {
              const me = lista.find((p: any) => p.userId === user.uid);
              setUserRsvp(me ? me.status : null);
          }
      });

      return () => { unsubEvent(); unsubRsvp(); };
  }, [params.id, user]);

  // 2. CÁLCULO DO RANKING DE TURMAS
  const rankingTurmas = useMemo(() => {
      const counts: Record<string, number> = {};
      
      rsvps.forEach(r => {
          if (r.status === 'going' && r.userTurma) {
              // Normaliza para maiúsculo (ex: t1 -> T1)
              const turma = r.userTurma.toUpperCase(); 
              counts[turma] = (counts[turma] || 0) + 1;
          }
      });

      return Object.entries(counts)
          .sort((a, b) => b[1] - a[1]) // Maior para menor
          .slice(0, 3) // Top 3
          .map(([turma, count]) => ({
              turma,
              count,
              imagem: TURMA_IMAGENS[turma] || null
          }));
  }, [rsvps]);

  // 3. AÇÃO DE RSVP (TRANSAÇÃO SEGURA)
  const handleRSVP = async (status: "going" | "maybe") => {
      if (!user) {
          addToast("Faça login para confirmar presença!", "error");
          router.push("/login");
          return;
      }
      
      try {
          await runTransaction(db, async (t) => {
              const eventRef = doc(db, "eventos", evento.id);
              const rsvpRef = doc(db, "eventos", evento.id, "rsvps", user.uid);
              const rsvpDoc = await t.get(rsvpRef);
              const oldStatus = rsvpDoc.exists() ? rsvpDoc.data().status : null;

              // Se clicar no mesmo botão, remove a presença (toggle)
              if (oldStatus === status) {
                  t.delete(rsvpRef);
                  // Remove UID dos arrays principais para facilitar consultas simples
                  if (status === 'going') t.update(eventRef, { confirmed: user.uid, [`stats.confirmados`]: increment(-1) });
                  else t.update(eventRef, { [`stats.talvez`]: increment(-1) });
              } else {
                  // Se mudar de status ou for novo
                  if (oldStatus) {
                      // Decrementa o antigo
                      t.update(eventRef, { [`stats.${oldStatus === 'going' ? 'confirmados' : 'talvez'}`]: increment(-1) });
                  }
                  
                  // Salva dados completos na subcoleção para o ranking
                  t.set(rsvpRef, {
                      userId: user.uid,
                      status: status,
                      userName: user.nome || "Anônimo",
                      userAvatar: user.foto || "",
                      userTurma: user.turma || "Geral", 
                      timestamp: serverTimestamp()
                  });

                  // Incrementa o novo e atualiza arrays de IDs
                  if (status === 'going') {
                      // ArrayUnion não funciona bem dentro de transaction com lógica complexa as vezes, 
                      // mas para contadores simples usamos increment.
                      t.update(eventRef, { [`stats.confirmados`]: increment(1) });
                  } else {
                      t.update(eventRef, { [`stats.talvez`]: increment(1) });
                  }
              }
          });
          
          // Feedback Visual
          if (userRsvp === status) addToast("Presença removida.", "info");
          else addToast(status === 'going' ? "Confirmado! A Tuba te espera! 🦈" : "Interesse registrado.", "success");

      } catch (e) {
          console.error(e);
          addToast("Erro ao atualizar presença.", "error");
      }
  };

  // --- RENDERS ---

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin"/>
        <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Carregando Evento...</p>
    </div>
  );

  if (!evento) return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-zinc-500 gap-4">
        <XCircle size={48} className="text-red-500/50"/>
        <p className="text-sm font-bold uppercase tracking-widest">Evento não encontrado</p>
        <Link href="/dashboard" className="text-emerald-500 text-xs hover:underline">Voltar para o Início</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-emerald-500/30">
      
      {/* --- HERO SECTION (CAPA) --- */}
      <div className="relative h-[55vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10"></div>
        
        <img
            src={evento.imagem || evento.imgCapa || "https://placehold.co/600x400/111/333?text=Sem+Capa"}
            className="w-full h-full object-cover"
            alt={evento.titulo}
        />

        <Link
            href="/dashboard"
            className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full text-white border border-white/10 hover:bg-white hover:text-black transition duration-300"
        >
            <ArrowLeft size={24} />
        </Link>

        {/* RANKING FLUTUANTE DE TURMAS */}
        <div className="absolute bottom-32 right-6 z-20 flex flex-col gap-2 items-end">
            {rankingTurmas.map((t, i) => (
                <div
                    key={t.turma}
                    className="flex items-center gap-3 bg-black/60 backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-full border border-white/10 animate-in slide-in-from-right duration-700 shadow-xl"
                    style={{ animationDelay: `${i * 100}ms` }}
                >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-600 shadow-inner">
                        {t.imagem ? (
                            <img src={t.imagem} alt={t.turma} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[10px] font-black">{t.turma}</span>
                        )}
                    </div>
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Presença</span>
                        <span className="text-emerald-400 font-black text-xs">+{t.count}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* INFO PRINCIPAL */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col gap-3">
          <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${evento.tipo === 'Festa' ? 'bg-purple-600/80 border-purple-500' : 'bg-orange-600/80 border-orange-500'}`}>
                  {evento.tipo || "Evento"}
              </span>
              {evento.destaque && (
                  <span className="bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-lg shadow-emerald-500/20">
                      {evento.destaque}
                  </span>
              )}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
              {evento.titulo}
          </h1>
          
          <div className="flex flex-wrap gap-3 text-xs font-bold text-zinc-300 uppercase tracking-wide mt-1">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                <Calendar size={14} className="text-emerald-500" /> {evento.data}
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 backdrop-blur-sm">
                <Clock size={14} className="text-emerald-500" /> {evento.hora}
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTEÚDO (CARD) --- */}
      <div className="relative z-30 -mt-6 bg-[#050505] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-6 space-y-8 min-h-[50vh]">
        
        {/* 1. BOTÕES DE RSVP */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-1.5 rounded-2xl shadow-inner">
            <div className="grid grid-cols-2 gap-2">
                <button
                    onClick={() => handleRSVP('going')}
                    className={`py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${userRsvp === 'going' ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 scale-[1.02]" : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800"}`}
                >
                    <CheckCircle size={22} className={userRsvp === 'going' ? "fill-black text-emerald-500" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Eu Vou</span>
                </button>
                
                <button
                    onClick={() => handleRSVP('maybe')}
                    className={`py-4 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${userRsvp === 'maybe' ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20 scale-[1.02]" : "bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800"}`}
                >
                    <HelpCircle size={22} className={userRsvp === 'maybe' ? "fill-black text-yellow-500" : ""} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Talvez</span>
                </button>
            </div>
            
            <div className="text-center py-2.5 flex justify-center items-center gap-2 mt-1">
                <Users size={12} className="text-zinc-500"/>
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                    {evento.stats?.confirmados || 0} confirmados • {evento.stats?.talvez || 0} interessados
                </p>
            </div>
        </div>

        {/* 2. DESCRIÇÃO */}
        <section>
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              Detalhes do Rolê
          </h2>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap font-medium bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800/50">
              {evento.descricao || "Nenhuma descrição informada."}
          </p>
        </section>

        {/* 3. LOCALIZAÇÃO */}
        <section className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-zinc-700 shrink-0 shadow-lg">
                <MapPin size={24} className="text-emerald-500" />
            </div>
            <div className="flex-1">
                <h3 className="text-white font-bold text-sm uppercase">Localização</h3>
                <p className="text-zinc-400 text-xs mt-0.5">{evento.local}</p>
                {evento.mapsUrl && (
                    <a href={evento.mapsUrl} target="_blank" className="text-[10px] text-emerald-500 font-bold hover:underline mt-1 block">Abrir no Maps</a>
                )}
            </div>
        </section>

        {/* 4. LOTES (INGRESSOS) */}
        {evento.lotes && evento.lotes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Ticket size={14} className="text-emerald-500" /> Ingressos
              </h2>
              
              <div className="space-y-3">
                {evento.lotes.map((lote: any, index: number) => (
                  <div
                    key={index}
                    className={`relative flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 group ${
                        lote.status === "ativo"
                            ? "bg-zinc-900 border-emerald-500/30 shadow-lg"
                            : "bg-black border-zinc-800 opacity-60"
                    }`}
                  >
                    <div className="relative z-10">
                      <p className={`text-xs font-black uppercase tracking-wider mb-0.5 ${lote.status === "ativo" ? "text-white" : "text-zinc-500"}`}>
                          {lote.nome}
                      </p>
                      <p className={`text-lg font-black ${lote.status === "ativo" ? "text-emerald-400" : "text-zinc-600"}`}>
                          R$ {lote.preco}
                      </p>
                    </div>
                    
                    <div className="relative z-10">
                        {lote.status === "ativo" && (
                            <Link href="/carrinho" className="bg-white text-black px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-400 transition-colors shadow-lg">
                                Comprar
                            </Link>
                        )}
                        {lote.status === "agendado" && (
                            <div className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                <Lock size={12}/>
                                <span className="text-[9px] font-bold uppercase">Em Breve</span>
                            </div>
                        )}
                        {lote.status === "encerrado" && (
                            <div className="text-[9px] font-black text-red-500 uppercase bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                                Esgotado
                            </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
        )}

      </div>
    </div>
  );
}