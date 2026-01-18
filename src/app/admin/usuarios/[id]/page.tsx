"use client";

import React, { use, useState, useEffect } from "react";
import { 
  ArrowLeft, User, CheckCircle, Ban, 
  Dumbbell, ShoppingBag, MessageCircle, Star, 
  CreditCard, LayoutGrid, Activity, Award, AlertTriangle, 
  Gamepad2, Coins, Flame, ShieldAlert, GraduationCap, Loader2,
  // 🦈 ÍCONES ADICIONADOS AQUI:
  Trophy, DollarSign 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../context/ToastContext";
import { db } from "../../../../lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from "firebase/firestore";

export default function AdminUsuarioDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"visao" | "esporte" | "economico" | "social">("visao");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Estados para dados relacionados
  const [gymPosts, setGymPosts] = useState<any[]>([]);
  const [arenaMatches, setArenaMatches] = useState<any[]>([]);
  const [lojaOrders, setLojaOrders] = useState<any[]>([]);
  const [comunidadeLogs, setComunidadeLogs] = useState<any[]>([]);

  // 1. CARREGAR DADOS DO USUÁRIO E RELACIONADOS
  useEffect(() => {
      const fetchData = async () => {
          try {
              // Perfil Principal
              const userDoc = await getDoc(doc(db, "users", id));
              if (userDoc.exists()) {
                  setUser({ id: userDoc.id, ...userDoc.data() });
              } else {
                  addToast("Usuário não encontrado.", "error");
                  router.push('/admin/usuarios');
                  return;
              }

              // Gym Rats (Posts do usuário)
              const qGym = query(collection(db, "posts"), where("userId", "==", id), where("categoria", "==", "Gym Rats"), orderBy("createdAt", "desc"));
              const snapGym = await getDocs(qGym);
              setGymPosts(snapGym.docs.map(d => ({ id: d.id, ...d.data() })));

              // Arena Games e Loja (Placeholders)
              setArenaMatches([]); 
              setLojaOrders([]); 

              // Comunidade (Todos os posts gerais)
              const qComunidade = query(collection(db, "posts"), where("userId", "==", id), orderBy("createdAt", "desc"));
              const snapComunidade = await getDocs(qComunidade);
              setComunidadeLogs(snapComunidade.docs.map(d => ({ id: d.id, ...d.data() })));

          } catch (e) {
              console.error(e);
              addToast("Erro ao carregar dossiê.", "error");
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [id]);

  // Ação de Banimento (Real)
  const handleToggleBan = async () => {
      const newStatus = user.status === 'banned' ? 'active' : 'banned';
      const msg = newStatus === 'banned' ? "Bloquear acesso total deste aluno?" : "Restaurar acesso?";
      
      if (confirm(msg)) {
          setActionLoading(true);
          try {
              await updateDoc(doc(db, "users", id), { status: newStatus });
              setUser({ ...user, status: newStatus });
              addToast(newStatus === 'banned' ? "Usuário banido do sistema." : "Acesso restaurado!", newStatus === 'banned' ? "info" : "success");
          } catch (e) {
              addToast("Erro ao atualizar status.", "error");
          } finally {
              setActionLoading(false);
          }
      }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800 group">
            <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <User className="text-emerald-500" /> Dossiê do Aluno
            </h1>
            <p className="text-[11px] text-zinc-500 font-medium font-mono">ID: {id}</p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-2 ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
            {user.status === 'active' ? <><CheckCircle size={12}/> Ativo</> : <><Ban size={12}/> Banido</>}
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* --- CARD PRINCIPAL --- */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden shadow-xl">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${user.status === 'active' ? 'from-emerald-500 via-emerald-600 to-black' : 'from-red-600 via-red-900 to-black'}`}></div>
            
            <div className="flex flex-col md:flex-row items-start gap-8 mt-2">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-black border-4 border-zinc-800 overflow-hidden shadow-2xl relative z-10">
                        <img src={user.foto || "https://github.com/shadcn.png"} className={`w-full h-full object-cover ${user.status === 'banned' ? 'grayscale' : ''}`}/>
                    </div>
                    <div className="absolute -bottom-3 -right-3 z-20 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-[#050505] shadow-lg flex items-center gap-1">
                        <Star size={10} fill="black"/> LVL {user.level || 1}
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase leading-none mb-2">{user.nome}</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="tag-info"><GraduationCap size={14}/> {user.turma || "Sem Turma"}</span>
                                <span className="tag-info"><CreditCard size={14}/> Matrícula: {user.matricula || "---"}</span>
                                <span className="tag-info text-emerald-400 border-emerald-500/20 bg-emerald-500/10"><Coins size={14}/> {user.sharkCoins || 0} SharkCoins</span>
                            </div>
                        </div>
                        <button onClick={handleToggleBan} disabled={actionLoading} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 border shadow-lg ${user.status === 'active' ? 'bg-red-900/10 text-red-500 border-red-900/30 hover:bg-red-900/30' : 'bg-emerald-900/10 text-emerald-500 border-emerald-900/30'}`}>
                            {actionLoading ? <Loader2 className="animate-spin" size={16}/> : user.status === 'active' ? <><ShieldAlert size={16}/> Bloquear Acesso</> : <><CheckCircle size={16}/> Restaurar Acesso</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-zinc-800 text-xs">
                        <div><p className="label-dossie">Email</p><p className="text-white">{user.email}</p></div>
                        <div><p className="label-dossie">CPF</p><p className="text-white font-mono">{user.cpf || "---"}</p></div>
                        <div><p className="label-dossie">Contato</p><p className="text-white">{user.telefone || "---"}</p></div>
                        <div><p className="label-dossie">XP Total</p><p className="text-yellow-500 font-bold">{user.xp || 0} XP</p></div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- NAVEGAÇÃO (ABAS) --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { id: 'visao', label: 'Visão Geral & Conquistas', icon: LayoutGrid },
                { id: 'esporte', label: 'Gym Rats & Arena', icon: Trophy }, // 🦈 AGORA USA O ÍCONE IMPORTADO
                { id: 'economico', label: 'Loja & Parceiros', icon: DollarSign }, // 🦈 AGORA USA O ÍCONE IMPORTADO
                { id: 'social', label: 'Comunidade & Fidelidade', icon: MessageCircle },
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase transition border ${activeTab === tab.id ? 'bg-zinc-900 text-white border-emerald-500 shadow-lg shadow-emerald-900/10' : 'bg-transparent text-zinc-500 border-transparent hover:bg-zinc-900/50 hover:text-zinc-300'}`}>
                    <tab.icon size={16}/> {tab.label}
                </button>
            ))}
        </div>

        {/* --- CONTEÚDO DINÂMICO --- */}
        
        {/* 1. VISÃO GERAL & CONQUISTAS */}
        {activeTab === 'visao' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="card-admin">
                    <h3 className="title-admin"><Activity size={16}/> Resumo de Atividade</h3>
                    <div className="space-y-3 mt-4">
                        <div className="row-stat"><span className="text-zinc-400">Total Posts Comunidade</span><span className="text-white font-bold">{comunidadeLogs.length}</span></div>
                        <div className="row-stat"><span className="text-zinc-400">Partidas Jogadas</span><span className="text-white font-bold">{arenaMatches.length}</span></div>
                        <div className="row-stat"><span className="text-zinc-400">Posts no Gym Rats</span><span className="text-white font-bold">{gymPosts.length}</span></div>
                    </div>
                </div>
                <div className="card-admin">
                    <h3 className="title-admin text-yellow-500"><Award size={16}/> Conquistas Desbloqueadas</h3>
                    {user.conquistas?.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            {user.conquistas.map((c: any, i: number) => (
                                <div key={i} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-zinc-800">
                                    <div className="p-3 bg-zinc-800 rounded-full text-yellow-500"><Trophy size={20}/></div>
                                    <div><h4 className="text-sm font-bold text-white">{c.titulo || "Conquista"}</h4></div>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-zinc-600 text-xs py-4 text-center">Nenhuma conquista ainda.</p>}
                </div>
            </div>
        )}

        {/* 2. ESPORTE (GYM & ARENA) */}
        {activeTab === 'esporte' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="card-admin">
                    <h3 className="title-admin text-red-500"><Dumbbell size={16}/> Gym Rats: Posts</h3>
                    <div className="mt-4 space-y-4">
                        <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
                            {gymPosts.length === 0 && <p className="text-zinc-600 text-xs">Nenhum post de treino.</p>}
                            {gymPosts.map(p => (
                                <div key={p.id} className="flex gap-3 mb-3 last:mb-0 border-b border-zinc-800/50 pb-2">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                                        <img src={p.imagem} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'}/>
                                    </div>
                                    <div>
                                        <p className="text-xs text-white italic">"{p.texto}"</p>
                                        <p className="text-[10px] text-zinc-500">{p.createdAt?.toDate().toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* 3. LOJA & PARCEIROS */}
        {activeTab === 'economico' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="card-admin">
                    <h3 className="title-admin text-blue-500"><ShoppingBag size={16}/> Compras na Loja</h3>
                    <div className="mt-4 space-y-2">
                        {lojaOrders.length === 0 && <p className="text-zinc-600 text-xs">Nenhuma compra registrada.</p>}
                        {lojaOrders.map(order => (
                            <div key={order.id} className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <p className="text-xs text-zinc-400">{order.itens}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 4. SOCIAL & FIDELIDADE */}
        {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="card-admin">
                    <h3 className="title-admin text-indigo-500"><MessageCircle size={16}/> Histórico na Comunidade</h3>
                    <div className="mt-4 space-y-3">
                        {comunidadeLogs.length === 0 && <p className="text-zinc-600 text-xs">Nenhuma interação recente.</p>}
                        {comunidadeLogs.map(log => (
                            <div key={log.id} className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-zinc-800 text-zinc-400">Post</span>
                                    <span className="text-[9px] text-zinc-600">{log.createdAt?.toDate().toLocaleString()}</span>
                                </div>
                                <p className="text-xs text-zinc-300 italic">"{log.texto}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

      </main>

      <style jsx global>{`
        .label-dossie { @apply text-[10px] text-zinc-500 uppercase font-bold mb-1; }
        .tag-info { @apply bg-black/40 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-300 flex items-center gap-2 border border-zinc-700; }
        .card-admin { @apply bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-full; }
        .title-admin { @apply text-sm font-bold text-white flex items-center gap-2 border-b border-zinc-800 pb-3; }
        .row-stat { @apply flex justify-between p-3 bg-black/40 rounded-lg border border-zinc-800 text-xs; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}