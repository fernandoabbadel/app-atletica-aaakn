"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Crown, Star, Ghost, CheckCircle, ArrowRight, Loader2, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

// Mapeamento de Ícones
const ICONS_MAP: any = {
  ghost: Ghost,
  star: Star,
  crown: Crown,
  shopping: ShoppingBag 
};

export default function PlanosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [planos, setPlanos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "planos"), orderBy("precoVal", "asc")); 
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlanos(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Helper para Cores
  const getColorClasses = (cor: string) => {
      switch(cor) {
          case 'yellow': return { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
          case 'emerald': return { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
          case 'zinc': return { text: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' }; // 🦈 MUDANÇA: Zinc/Atleta vira Roxo
          default: return { text: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-800' };
      }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 gap-2"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500 pb-20">
      
      {/* HEADER */}
      <div className="relative pt-10 pb-20 px-6 overflow-hidden">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 max-w-4xl mx-auto text-center">
              <Link href="/menu" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white mb-6 transition uppercase text-xs font-bold tracking-widest"><ArrowLeft size={16}/> Voltar ao Menu</Link>
              <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Seja Sócio <span className="text-emerald-500">Tubarão</span></h1>
              <p className="text-zinc-400 max-w-lg mx-auto text-sm md:text-base">Escolha seu nível de acesso.</p>
          </div>
      </div>

      {/* GRID */}
      <div className="px-6 relative z-20 -mt-10">
          <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-end">
              {planos.map(plano => {
                  const Icon = ICONS_MAP[plano.icon] || Star;
                  
                  // 🦈 LÓGICA DO PLANO ATUAL
                  // Se o user não tem badge, ele é Bicho Solto (R$ 0).
                  // Se tem badge, compara o nome.
                  const isFree = plano.precoVal === 0;
                  const userHasNoPlan = !user?.plano_badge;
                  const isMyPlan = (userHasNoPlan && isFree) || (user?.plano_badge === plano.nome);

                  // 🦈 CORREÇÃO DE COR: Se o banco diz "zinc" (Atleta), usamos Roxo agora.
                  const styles = getColorClasses(plano.cor); 

                  return (
                      <div key={plano.id} className={`
                        bg-zinc-900/80 backdrop-blur-xl border rounded-[2rem] p-6 flex flex-col relative transition duration-300 h-full
                        ${isMyPlan 
                            ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] scale-105 z-20 bg-zinc-900' // 🔥 Destaque Vermelho
                            : plano.destaque 
                                ? `${styles.border} shadow-lg md:pb-12 md:pt-10 z-10` 
                                : 'border-zinc-800 hover:border-zinc-600 hover:-translate-y-1'
                        }
                      `}>
                          
                          {/* BADGE SEU PLANO (VERMELHO) */}
                          {isMyPlan && (
                              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white font-black text-[12px] uppercase px-6 py-1.5 rounded-full shadow-lg tracking-widest w-max flex items-center gap-2 animate-pulse border-4 border-black">
                                  <Check size={14} strokeWidth={4}/> SEU PLANO
                              </div>
                          )}

                          {/* BADGE DESTAQUE (SE NÃO FOR O SEU) */}
                          {!isMyPlan && plano.destaque && (
                              <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${styles.bg} ${styles.text} font-black text-[10px] uppercase px-4 py-1 rounded-b-xl tracking-widest w-fit whitespace-nowrap`}>
                                  Recomendado
                              </div>
                          )}

                          <div className="mb-6 text-center mt-6">
                              <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${styles.bg} ${styles.text}`}>
                                  <Icon size={32}/>
                              </div>
                              <h3 className={`text-2xl font-black uppercase ${styles.text}`}>{plano.nome}</h3>
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">{plano.descricao}</p>
                          </div>

                          <div className="text-center mb-8">
                              {isFree ? (
                                  <div className="flex items-center justify-center h-[60px]">
                                      <span className="text-3xl font-black text-zinc-400 uppercase">Gratuito</span>
                                  </div>
                              ) : (
                                  <>
                                    <div className="flex items-end justify-center gap-1">
                                        <span className="text-sm font-bold text-zinc-500 mb-2">R$</span>
                                        <span className="text-5xl font-black text-white">{plano.preco}</span>
                                    </div>
                                    <p className={`text-xs font-bold mt-2 ${styles.text}`}>{plano.parcelamento}</p>
                                  </>
                              )}
                          </div>

                          <div className="space-y-3 flex-1 mb-8">
                              {plano.beneficios?.map((ben: string, i: number) => (
                                  <div key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                                      <CheckCircle size={16} className={`shrink-0 ${styles.text}`}/>
                                      {ben}
                                  </div>
                              ))}
                          </div>

                          {isMyPlan ? (
                              <button disabled className="w-full py-4 rounded-xl font-bold uppercase text-sm tracking-wider bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed flex items-center justify-center gap-2">
                                  <CheckCircle size={16}/> Plano Ativo
                              </button>
                          ) : (
                              <button 
                                onClick={() => router.push(`/planos/adesao?plano=${plano.id}`)}
                                className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-wider transition shadow-lg flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200`}
                              >
                                  {isFree ? "Ver Detalhes" : "Quero Esse"} <ArrowRight size={16}/>
                              </button>
                          )}
                      </div>
                  )
              })}
          </div>
      </div>
    </div>
  );
}