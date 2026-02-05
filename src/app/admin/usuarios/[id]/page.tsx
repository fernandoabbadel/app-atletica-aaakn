"use client";

import React, { use, useState, useEffect, useMemo } from "react";
import { 
  ArrowLeft, User, Ban, 
  Dumbbell, ShoppingBag, MessageCircle, 
  LayoutGrid, Activity, Award, 
  Gamepad2, Coins, ShieldAlert, GraduationCap, Loader2,
  Trophy, DollarSign, Calendar, Mail, Phone, Lock,
  Zap, Power, Trash2, PowerOff
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "../../../../context/ToastContext"; 
import { db } from "../../../../lib/firebase"; 
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, deleteDoc, Timestamp } from "firebase/firestore";

// --- TIPOS AUXILIARES ---
type TabType = "visao" | "financeiro" | "social" | "games" | "seguranca";

interface UserData {
    id: string;
    nome: string;
    email: string;
    foto?: string;
    matricula?: string;
    turma?: string;
    telefone?: string;
    status: 'ativo' | 'bloqueado';
    level?: number;
    xp?: number;
    sharkCoins?: number;
    plano_badge?: string;
    tier?: string;
    patente?: string;
    createdAt?: Timestamp;
    [key: string]: any; // Flexibilidade para outros campos
}

interface Post {
    id: string;
    texto: string;
    likes?: string[];
    comentarios?: number;
    createdAt?: Timestamp;
}

interface Order {
    id: string;
    itens: number;
    total: number;
    status: string;
    createdAt?: Timestamp;
}

interface Achievement {
    id: string;
    achievementTitle: string;
    timestamp?: Timestamp;
}

interface Match {
    id: string;
    game: string;
    result: 'win' | 'lose';
}

interface GymLog {
    id: string;
    local: string;
    date: string;
}

export default function AdminUsuarioDetalhe({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { addToast } = useToast();
  
  // Estado Principal
  const [user, setUser] = useState<UserData | null>(null);
  
  // Estados de Dados
  const [posts, setPosts] = useState<Post[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [gymLogs, setGymLogs] = useState<GymLog[]>([]);
  
  // Controle de UI
  const [activeTab, setActiveTab] = useState<TabType>("visao");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. CARREGAMENTO DE DADOS
  useEffect(() => {
      const fetchDossier = async () => {
          try {
              // A. Usuário
              const userRef = doc(db, "users", id);
              const userSnap = await getDoc(userRef);

              if (!userSnap.exists()) {
                  addToast("Usuário não encontrado.", "error");
                  router.push('/admin/usuarios');
                  return;
              }
              setUser({ id: userSnap.id, ...userSnap.data() } as UserData);

              // B. Buscas Paralelas
              const [postsSnap, ordersSnap, achSnap, matchesSnap, gymSnap] = await Promise.all([
                  getDocs(query(collection(db, "posts"), where("userId", "==", id), orderBy("createdAt", "desc"), limit(20))),
                  getDocs(query(collection(db, "store_orders"), where("userId", "==", id), orderBy("createdAt", "desc"))),
                  getDocs(query(collection(db, "achievements_logs"), where("userId", "==", id), orderBy("timestamp", "desc"))),
                  getDocs(query(collection(db, "arena_matches"), where("userId", "==", id), orderBy("date", "desc"), limit(20))),
                  getDocs(query(collection(db, "gym_logs"), where("userId", "==", id), orderBy("date", "desc"), limit(30)))
              ]);

              setPosts(postsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Post)));
              setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
              setAchievements(achSnap.docs.map(d => ({ id: d.id, ...d.data() } as Achievement)));
              setMatches(matchesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
              setGymLogs(gymSnap.docs.map(d => ({ id: d.id, ...d.data() } as GymLog)));

          } catch (e) {
              console.error(e);
              addToast("Erro ao carregar dados.", "error");
          } finally {
              setLoading(false);
          }
      };
      fetchDossier();
  }, [id, addToast, router]);

  // --- CÁLCULO LTV ---
  const ltv = useMemo(() => orders.reduce((acc, curr) => acc + (curr.total || 0), 0), [orders]);

  // --- AÇÃO: ATIVAR / DESATIVAR (Toggle Status) ---
  const handleToggleStatus = async () => {
      if (!user) return;
      // Se estiver ativo, vira bloqueado (banned/suspenso). Se não, vira ativo.
      const newStatus = user.status === 'ativo' ? 'bloqueado' : 'ativo';
      const msg = newStatus === 'bloqueado' 
        ? "Tem certeza? O usuário perderá acesso imediato ao app." 
        : "Reativar acesso do usuário?";
      
      if (confirm(msg)) {
          setActionLoading(true);
          try {
              await updateDoc(doc(db, "users", id), { status: newStatus });
              setUser({ ...user, status: newStatus });
              addToast(newStatus === 'bloqueado' ? "Conta desativada." : "Conta reativada!", newStatus === 'bloqueado' ? "info" : "success");
          } catch (e) {
              addToast("Erro ao atualizar status.", "error");
          } finally {
              setActionLoading(false);
          }
      }
  };

  // --- AÇÃO: DELETAR CONTA (Danger Zone) ---
  const handleDeleteAccount = async () => {
      const confirmText = prompt("PARA DELETAR, DIGITE 'DELETAR' ABAIXO.\nIsso apagará permanentemente o usuário do banco de dados.");
      
      if (confirmText === "DELETAR") {
          setActionLoading(true);
          try {
              // 1. Deleta o documento do usuário
              await deleteDoc(doc(db, "users", id));
              
              // (Opcional) Aqui você poderia deletar subcoleções ou logs, mas o Firestore não faz cascata automático.
              
              addToast("Usuário deletado permanentemente.", "success");
              router.push('/admin/usuarios'); // Volta para a lista
          } catch (e) {
              console.error(e);
              addToast("Erro ao deletar usuário.", "error");
              setActionLoading(false);
          }
      } else {
          if (confirmText !== null) addToast("Texto de confirmação incorreto.", "error");
      }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER DE COMANDO */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition border border-zinc-800 group">
            <ArrowLeft size={20} className="text-zinc-400 group-hover:text-white" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              <User className="text-emerald-500" /> Dossiê Supremo
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">UID: {id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
            {/* BOTÃO RESETAR SENHA (Simulação/Placeholder) */}
            <button onClick={() => addToast("Função de reset enviada por email!", "success")} className="bg-zinc-900 border border-zinc-700 text-zinc-300 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:text-white hover:border-zinc-500 transition flex items-center gap-2">
                <Lock size={14}/> Resetar Senha
            </button>

            {/* BOTÃO ATIVAR/DESATIVAR */}
            <button 
                onClick={handleToggleStatus} 
                disabled={actionLoading} 
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 border transition ${user.status === 'ativo' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'}`}
            >
                {user.status === 'ativo' ? <><PowerOff size={14}/> Desativar</> : <><Power size={14}/> Ativar</>}
            </button>

            {/* BOTÃO DELETAR (PERIGO) */}
            <button 
                onClick={handleDeleteAccount} 
                disabled={actionLoading} 
                className="bg-red-500/10 text-red-500 border border-red-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-red-500/20 transition flex items-center gap-2"
            >
                <Trash2 size={14}/> Excluir
            </button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* --- 1. HERO CARD (PERFIL) --- */}
        <div className={`bg-zinc-900 border rounded-[2rem] p-8 relative overflow-hidden shadow-2xl transition-colors ${user.status === 'ativo' ? 'border-zinc-800' : 'border-red-900/50 opacity-90'}`}>
            <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${user.status === 'ativo' ? 'from-emerald-500 via-teal-500 to-black' : 'from-red-600 via-red-900 to-black'}`}></div>
            
            {user.status !== 'ativo' && (
                <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 animate-pulse">
                    <Ban size={12}/> Conta Desativada
                </div>
            )}

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Avatar & Badges */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-36 h-36 rounded-full p-1 bg-gradient-to-br from-zinc-700 to-black shadow-2xl overflow-hidden relative">
                            <Image 
                                src={user.foto || "https://github.com/shadcn.png"} 
                                alt={user.nome}
                                fill
                                className={`rounded-full object-cover border-4 border-[#050505] ${user.status !== 'ativo' ? 'grayscale' : ''}`}
                                unoptimized
                            />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full border-4 border-[#050505] shadow-lg flex items-center gap-1">
                            LV {user.level || 1}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* 🦈 EXIBE O PLANO BADGE (Nome Personalizado) */}
                        <span className="badge-shark bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{user.plano_badge || user.tier || "Sem Plano"}</span>
                        <span className="badge-shark bg-purple-500/10 text-purple-500 border-purple-500/20">{user.patente || "Novato"}</span>
                    </div>
                </div>

                {/* Dados Principais */}
                <div className="flex-1 w-full text-center lg:text-left">
                    <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start mb-6">
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-1">{user.nome}</h2>
                            <p className="text-zinc-400 text-sm flex items-center justify-center lg:justify-start gap-2"><Mail size={14}/> {user.email}</p>
                        </div>
                        <div className="mt-4 lg:mt-0 text-right">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Saldo Atual</p>
                            <p className="text-3xl font-black text-emerald-400 flex items-center justify-center lg:justify-end gap-2"><Coins size={24}/> {user.sharkCoins || 0}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="stat-box">
                            <p className="label">Matrícula</p>
                            <p className="value"><CreditCard size={14} className="inline mr-1 text-zinc-500"/> {user.matricula || "---"}</p>
                        </div>
                        <div className="stat-box">
                            <p className="label">Turma</p>
                            <p className="value"><GraduationCap size={14} className="inline mr-1 text-zinc-500"/> {user.turma || "---"}</p>
                        </div>
                        <div className="stat-box">
                            <p className="label">Celular</p>
                            <p className="value"><Phone size={14} className="inline mr-1 text-zinc-500"/> {user.telefone || "---"}</p>
                        </div>
                        <div className="stat-box">
                            <p className="label">Data Cadastro</p>
                            <p className="value"><Calendar size={14} className="inline mr-1 text-zinc-500"/> {user.createdAt?.toDate().toLocaleDateString() || "Antigo"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- NAVEGAÇÃO (ABAS) --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-zinc-800">
            {[
                { id: 'visao', label: 'Visão 360º', icon: LayoutGrid },
                { id: 'financeiro', label: 'Loja & Financeiro', icon: DollarSign },
                { id: 'social', label: 'Comunidade & Gym', icon: MessageCircle },
                { id: 'games', label: 'Gamification', icon: Trophy },
                { id: 'seguranca', label: 'Auth & Segurança', icon: ShieldAlert },
            ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase transition border-b-2 ${activeTab === tab.id ? 'text-emerald-500 border-emerald-500 bg-zinc-900/50' : 'text-zinc-500 border-transparent hover:text-zinc-300'}`}>
                    <tab.icon size={16}/> {tab.label}
                </button>
            ))}
        </div>

        {/* --- CONTEÚDO DINÂMICO --- */}
        
        {/* 1. VISÃO GERAL */}
        {activeTab === 'visao' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in">
                <div className="card-kpi border-emerald-500/20">
                    <div className="flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">LTV (Total Gasto)</p><p className="text-2xl font-black text-white">R$ {ltv.toFixed(2)}</p></div>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><DollarSign size={20}/></div>
                    </div>
                </div>
                <div className="card-kpi border-yellow-500/20">
                    <div className="flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">XP Acumulado</p><p className="text-2xl font-black text-white">{user.xp || 0}</p></div>
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Zap size={20}/></div>
                    </div>
                </div>
                <div className="card-kpi border-blue-500/20">
                    <div className="flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Engajamento (Posts)</p><p className="text-2xl font-black text-white">{posts.length}</p></div>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><MessageCircle size={20}/></div>
                    </div>
                </div>
                <div className="card-kpi border-purple-500/20">
                    <div className="flex justify-between items-start">
                        <div><p className="text-zinc-500 text-[10px] font-bold uppercase">Conquistas</p><p className="text-2xl font-black text-white">{achievements.length}</p></div>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Award size={20}/></div>
                    </div>
                </div>

                <div className="col-span-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-4">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Activity size={18} className="text-emerald-500"/> Últimas Atividades</h3>
                    <div className="space-y-0">
                        {posts.slice(0,3).map(p => (
                            <div key={p.id} className="py-3 border-b border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-zinc-400"><MessageCircle size={12} className="inline mr-2 text-blue-500"/>Postou na comunidade</span>
                                <span className="text-[10px] text-zinc-600">{p.createdAt?.toDate().toLocaleString()}</span>
                            </div>
                        ))}
                        {orders.slice(0,3).map(o => (
                            <div key={o.id} className="py-3 border-b border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-zinc-400"><ShoppingBag size={12} className="inline mr-2 text-emerald-500"/>Comprou {o.itens}</span>
                                <span className="text-[10px] text-zinc-600">{o.createdAt?.toDate().toLocaleString()}</span>
                            </div>
                        ))}
                        {achievements.length === 0 && posts.length === 0 && orders.length === 0 && (
                            <p className="text-zinc-600 text-xs italic text-center py-4">Sem atividade recente.</p>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* 2. FINANCEIRO */}
        {activeTab === 'financeiro' && (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-4 bg-black/20 border-b border-zinc-800"><h3 className="font-bold text-white">Histórico de Compras</h3></div>
                    <table className="w-full text-left text-xs">
                        <thead className="bg-black/40 text-zinc-500 font-bold uppercase"><tr><th className="p-4">Pedido</th><th className="p-4">Itens</th><th className="p-4">Data</th><th className="p-4 text-right">Valor</th></tr></thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {orders.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-500">Nenhuma compra.</td></tr>}
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-zinc-800/30">
                                    <td className="p-4 font-mono text-zinc-500">#{order.id.slice(0,6)}</td>
                                    <td className="p-4">{order.itens}</td>
                                    <td className="p-4">{order.createdAt?.toDate().toLocaleDateString()}</td>
                                    <td className="p-4 text-right font-bold text-emerald-400">R$ {order.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* 3. SOCIAL & GYM */}
        {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Dumbbell className="text-red-500"/> Histórico de Treinos (Gym Rats)</h3>
                    <div className="space-y-2">
                        {gymLogs.length === 0 && <p className="text-zinc-600 text-xs">Sem registros de treino.</p>}
                        {gymLogs.map((log, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-zinc-800">
                                <span className="text-xs text-white font-bold">{log.local || "Academia Parceira"}</span>
                                <span className="text-[10px] text-zinc-500">{log.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 h-fit">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageCircle className="text-blue-500"/> Posts na Comunidade</h3>
                    <div className="space-y-3">
                        {posts.map(post => (
                            <div key={post.id} className="p-3 bg-black/30 rounded-xl border border-zinc-800">
                                <p className="text-xs text-zinc-300 italic mb-2">&quot;{post.texto}&quot;</p>
                                <div className="flex gap-3 text-[10px] text-zinc-500 font-bold uppercase">
                                    <span>❤️ {post.likes?.length || 0} Likes</span>
                                    <span>💬 {post.comentarios || 0} Coments</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 4. GAMES & CONQUISTAS */}
        {activeTab === 'games' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Trophy className="text-yellow-500"/> Conquistas Desbloqueadas</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {achievements.map((ach, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-black/30 rounded-xl border border-zinc-800">
                                <div className="p-2 bg-yellow-500/10 rounded-full text-yellow-500"><Award size={16}/></div>
                                <div><p className="text-xs font-bold text-white">{ach.achievementTitle}</p><p className="text-[10px] text-zinc-500">{ach.timestamp?.toDate().toLocaleString()}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Gamepad2 className="text-purple-500"/> Partidas na Arena</h3>
                    <div className="space-y-2">
                        {matches.length === 0 && <p className="text-zinc-600 text-xs">Sem partidas registradas.</p>}
                        {matches.map((match, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-black/30 rounded-xl border border-zinc-800">
                                <span className="text-xs text-white font-bold">{match.game}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${match.result === 'win' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>{match.result === 'win' ? 'VITÓRIA' : 'DERROTA'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 5. SEGURANÇA (AUTH CONTEXT DUMP) */}
        {activeTab === 'seguranca' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 animate-in fade-in overflow-hidden">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><ShieldAlert className="text-zinc-400"/> Dados Brutos do AuthContext (Debug)</h3>
                <pre className="text-[10px] text-emerald-400 font-mono bg-black p-4 rounded-xl overflow-x-auto border border-emerald-900/30">
                    {JSON.stringify(user, null, 2)}
                </pre>
            </div>
        )}

      </main>

      <style jsx global>{`
        .badge-shark { @apply px-3 py-1 rounded-full text-[10px] font-black uppercase border flex items-center gap-1; }
        .stat-box { @apply bg-black/30 p-3 rounded-xl border border-zinc-800; }
        .stat-box .label { @apply text-[10px] text-zinc-500 uppercase font-bold mb-1; }
        .stat-box .value { @apply text-sm text-white font-bold truncate; }
        .card-kpi { @apply bg-zinc-900 border p-5 rounded-2xl; }
      `}</style>
    </div>
  );
}