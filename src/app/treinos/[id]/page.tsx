"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, MapPin, Clock, User, Trophy, Users, CheckCircle, 
  HelpCircle, Share2, XCircle, Calendar, Crown, Navigation, UserX 
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { doc, onSnapshot, collection, runTransaction, serverTimestamp } from "firebase/firestore";

// Mapa de Imagens das Turmas
const TURMA_IMAGENS: Record<string, string> = {
    "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
    "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
};

export default function TreinoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [treino, setTreino] = useState<any>(null);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [chamadaAdmin, setChamadaAdmin] = useState<any[]>([]); // 🦈 Nova lista: Oficial do Admin
  
  const [loading, setLoading] = useState(true);
  const [userRsvp, setUserRsvp] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);

  // 1. CARREGAR DADOS (TREINO + RSVPS + CHAMADA OFICIAL)
  useEffect(() => {
      if (!params.id) return;

      // A. Dados do Treino
      const unsubTreino = onSnapshot(doc(db, "treinos", params.id as string), (docSnap) => {
          if (docSnap.exists()) {
              setTreino({ id: docSnap.id, ...docSnap.data() });
          } else {
              addToast("Treino não encontrado.", "error");
              router.push("/treinos");
          }
          setLoading(false);
      });

      // B. Lista de Intenção (Quem clicou "Eu Vou")
      const unsubRsvps = onSnapshot(collection(db, "treinos", params.id as string, "rsvps"), (snap) => {
          const lista = snap.docs.map(d => d.data());
          setRsvps(lista);
          if (user) {
              const me = lista.find((p: any) => p.userId === user.uid);
              setUserRsvp(me ? me.status : null);
          }
      });

      // C. Lista Oficial (Admin confirmou ou deu falta)
      const unsubChamada = onSnapshot(collection(db, "treinos", params.id as string, "chamada"), (snap) => {
          const lista = snap.docs.map(d => d.data());
          setChamadaAdmin(lista);
      });

      return () => { unsubTreino(); unsubRsvps(); unsubChamada(); };
  }, [params.id, user, router]);

  // 2. FUSÃO INTELIGENTE DAS LISTAS (RSVP + ADMIN)
  const listaFinal = useMemo(() => {
      const map = new Map();

      // Passo 1: Adiciona quem marcou "Eu Vou" (Estado Inicial)
      rsvps.forEach(r => {
          if (r.status === 'going') {
              map.set(r.userId, { 
                  ...r, 
                  nome: r.userName, 
                  turma: r.userTurma, 
                  avatar: r.userAvatar,
                  statusVisual: 'confirmado' // Padrão: Confirmado pelo usuário
              });
          }
      });

      // Passo 2: Sobrescreve/Adiciona com a Lista Oficial do Admin
      chamadaAdmin.forEach(c => {
          const existing = map.get(c.userId) || {};
          // Se o admin marcou, isso prevalece sobre o RSVP
          map.set(c.userId, {
              ...existing, // Mantém dados existentes se houver
              ...c,        // Atualiza com dados do admin (pode ser mais atualizado)
              userId: c.userId, // Garante ID
              statusVisual: c.status // 'presente' (Verde) ou 'falta' (Vermelho)
          });
      });

      // Retorna array ordenado por nome (Fica mais fácil de achar)
      return Array.from(map.values()).sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
  }, [rsvps, chamadaAdmin]);

  // 3. CÁLCULO DO RANKING DE TURMAS (Baseado na lista final)
  const rankingTurmas = useMemo(() => {
      const counts: Record<string, number> = {};
      listaFinal.forEach(aluno => {
          // Contamos quem confirmou ou quem o admin deu presença (ignoramos faltas no ranking de força)
          if (aluno.statusVisual !== 'falta' && aluno.turma) {
              const t = aluno.turma.toUpperCase();
              counts[t] = (counts[t] || 0) + 1;
          }
      });
      return Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([turma, count]) => ({ turma, count, imagem: TURMA_IMAGENS[turma] }));
  }, [listaFinal]);

  // 4. AÇÃO DE RSVP
  const handleRSVP = async (status: "going" | "not_going") => {
      if (!user) return addToast("Faça login para confirmar!", "error");
      if (loadingAction) return;
      setLoadingAction(true);

      try {
          await runTransaction(db, async (t) => {
              const rsvpRef = doc(db, "treinos", treino.id, "rsvps", user.uid);
              if (status === 'not_going') {
                  t.delete(rsvpRef);
              } else {
                  t.set(rsvpRef, {
                      userId: user.uid,
                      userName: user.nome || "Atleta",
                      userAvatar: user.foto || "",
                      userTurma: user.turma || "Geral",
                      status: 'going',
                      timestamp: serverTimestamp()
                  });
              }
          });
          addToast(status === 'going' ? "Presença confirmada! 💪" : "Inscrição removida.", "success");
      } catch (e) {
          console.error(e);
          addToast("Erro ao atualizar.", "error");
      } finally {
          setLoadingAction(false);
      }
  };

  const getTheme = () => {
      if (!treino) return {};
      const m = treino.modalidade.toLowerCase();
      if (m.includes("volei")) return { text: "text-yellow-400", badge: "bg-yellow-500 border-yellow-400 text-black", gradient: "from-yellow-900/40" };
      if (m.includes("hand")) return { text: "text-blue-400", badge: "bg-blue-600 border-blue-500 text-white", gradient: "from-blue-900/40" };
      return { text: "text-emerald-400", badge: "bg-emerald-600 border-emerald-500 text-white", gradient: "from-emerald-900/40" };
  };

  // Helper para link do Google Maps
  const getMapsLink = () => {
      if (!treino?.local) return "#";
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(treino.local)}`;
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div></div>;
  if (!treino) return null;

  const theme = getTheme();
  // Contagem para exibição (Exclui quem levou falta)
  const confirmadosCount = listaFinal.filter(a => a.statusVisual !== 'falta').length;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32 selection:bg-emerald-500/30">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[65vh] w-full">
        {/* Imagem de Fundo */}
        <div className="absolute inset-0 bg-black">
            <img src={treino.imagem || "https://placehold.co/800x600/111/333?text=AAAKN"} className="w-full h-full object-cover opacity-60" alt={treino.modalidade} />
            <div className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/30 to-transparent z-10`}></div>
        </div>

        {/* Botões Topo */}
        <Link href="/treinos" className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 hover:bg-white hover:text-black transition">
            <ArrowLeft size={24} />
        </Link>
        <button className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full border border-white/10 hover:bg-emerald-500 transition">
            <Share2 size={24} />
        </button>

        {/* RANKING FLUTUANTE */}
        <div className="absolute bottom-40 right-6 z-20 flex flex-col gap-2 items-end">
            {rankingTurmas.map((t, i) => (
                <div key={t.turma} className="flex items-center gap-3 bg-black/60 backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-full border border-white/10 animate-in slide-in-from-right duration-700 shadow-xl" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-500 shrink-0">
                        {t.imagem ? <img src={t.imagem} className="w-full h-full object-cover" /> : <span className="text-xs font-black">{t.turma}</span>}
                    </div>
                    <div className="flex flex-col items-end leading-none">
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Dominando</span>
                        <span className={`font-black text-sm ${theme.text}`}>+{t.count}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* INFO PRINCIPAL */}
        <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border shadow-lg ${theme.badge}`}>
                    {treino.modalidade}
                </span>
                <span className="bg-white/10 backdrop-blur-md text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                    <Users size={12}/> {confirmadosCount} Atletas
                </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
                {treino.modalidade}
            </h1>
            
            <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-300 uppercase tracking-wide mt-2">
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Calendar size={16} className={theme.text} /> {treino.diaSemana}, {treino.dia ? treino.dia.split('-').reverse().slice(0,2).join('/') : ''}
                </div>
                <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
                    <Clock size={16} className={theme.text} /> {treino.horario}
                </div>
            </div>
        </div>
      </div>

      {/* --- CARD DE CONTEÚDO --- */}
      <div className="relative z-30 -mt-8 bg-[#050505] rounded-t-[2.5rem] border-t border-white/10 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] p-6 space-y-8 min-h-[50vh]">
        
        {/* 1. BOTÕES DE DECISÃO */}
        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-2 rounded-2xl shadow-inner flex gap-2">
            <button 
                onClick={() => handleRSVP('not_going')}
                className="flex-1 py-4 rounded-xl border border-transparent hover:border-red-500/30 hover:bg-red-500/10 text-zinc-500 hover:text-red-500 font-bold text-xs uppercase transition-all"
            >
                <span className="flex flex-col items-center gap-1"><XCircle size={20}/> Não Vou</span>
            </button>
            <button 
                onClick={() => handleRSVP('going')}
                disabled={loadingAction}
                className={`flex-[2] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${userRsvp === 'going' ? 'bg-emerald-500 text-black shadow-emerald-500/30' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
                {loadingAction ? <span className="animate-spin">⌛</span> : userRsvp === 'going' ? <><CheckCircle size={24}/> Confirmado</> : "Confirmar Presença"}
            </button>
        </div>

        {/* 2. RESPONSÁVEL & DESCRIÇÃO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Trophy size={16} className={theme.text} /> O Treino
                </h2>
                <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                    <p className="text-zinc-300 text-sm leading-relaxed">{treino.descricao || "Sem descrição informada."}</p>
                </div>
                
                {/* Localização com Botão Maps */}
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center border border-zinc-700">
                            <MapPin size={18} className={theme.text} />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase">Localização</p>
                            <p className="text-white font-bold text-sm">{treino.local}</p>
                        </div>
                    </div>
                    {/* 🦈 BOTÃO MAPS */}
                    <a href={getMapsLink()} target="_blank" rel="noopener noreferrer" className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold uppercase px-3 py-2 rounded-xl flex items-center gap-2 transition">
                        Abrir <Navigation size={12}/>
                    </a>
                </div>
            </div>

            {/* Card Responsável Clicável */}
            <Link href={treino.treinadorId ? `/perfil/${treino.treinadorId}` : "#"} className="block group">
                <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-5 rounded-2xl flex flex-col items-center text-center gap-3 relative overflow-hidden group-hover:border-zinc-600 transition">
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.gradient} to-transparent`}></div>
                    <div className="w-20 h-20 rounded-full border-4 border-[#050505] shadow-xl overflow-hidden relative group-hover:scale-105 transition duration-300">
                        {treino.treinadorAvatar ? <img src={treino.treinadorAvatar} className="w-full h-full object-cover"/> : <User size={32} className="text-zinc-600 m-auto"/>}
                        <div className="absolute bottom-0 right-0 bg-emerald-500 p-1 rounded-full border-2 border-black"><Crown size={12} className="text-black"/></div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Responsável</p>
                        <p className="text-lg font-black text-white">{treino.treinador || "Tubarão"}</p>
                        <span className={`text-xs font-bold ${theme.text} mt-1 block group-hover:underline`}>Ver Perfil</span>
                    </div>
                </div>
            </Link>
        </div>

        {/* 3. LISTA DE QUEM VAI (INTEGRADA E COLORIDA) */}
        <section className="space-y-4 pt-4 border-t border-white/5">
            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={16} className={theme.text} /> Lista de Presença
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listaFinal.map((pessoa, idx) => {
                    // Lógica de Cores baseada no status Oficial do Admin
                    let statusColor = "border-zinc-800/50 bg-zinc-900/50"; // Neutro (Confirmado App)
                    let icon = null;

                    if (pessoa.statusVisual === 'presente') {
                        statusColor = "border-emerald-500/20 bg-emerald-900/10"; // Verde (Presente Admin)
                        icon = <CheckCircle size={14} className="text-emerald-500"/>;
                    } else if (pessoa.statusVisual === 'falta') {
                        statusColor = "border-red-500/20 bg-red-900/10 opacity-60"; // Vermelho (Falta Admin)
                        icon = <UserX size={14} className="text-red-500"/>;
                    }

                    return (
                        <Link href={`/perfil/${pessoa.userId}`} key={idx}>
                            <div className={`flex items-center justify-between p-3 rounded-xl border transition hover:bg-white/5 ${statusColor}`}>
                                <div className="flex items-center gap-3">
                                    <img src={pessoa.avatar || "https://github.com/shadcn.png"} className="w-10 h-10 rounded-full border border-zinc-700 object-cover"/>
                                    <div>
                                        <p className={`text-sm font-bold ${pessoa.statusVisual === 'falta' ? 'text-zinc-500 line-through' : 'text-white'}`}>{pessoa.nome}</p>
                                        <p className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1">
                                            {pessoa.turma}
                                        </p>
                                    </div>
                                </div>
                                {/* Badge de Status */}
                                <div className="flex flex-col items-end">
                                    {icon}
                                    <span className={`text-[8px] uppercase font-black tracking-widest mt-1 ${
                                        pessoa.statusVisual === 'presente' ? 'text-emerald-500' : 
                                        pessoa.statusVisual === 'falta' ? 'text-red-500' : 'text-zinc-500'
                                    }`}>
                                        {pessoa.statusVisual === 'presente' ? 'Presente' : 
                                         pessoa.statusVisual === 'falta' ? 'Faltou' : 'Inscrito'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                
                {listaFinal.length === 0 && (
                    <div className="col-span-full py-8 text-center border border-dashed border-zinc-800 rounded-xl">
                        <p className="text-zinc-600 text-xs font-bold uppercase">Nenhum confirmado ainda. Seja o primeiro!</p>
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
}