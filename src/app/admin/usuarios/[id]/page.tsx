"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, User, Mail, GraduationCap, MapPin, 
  ShieldAlert, Ban, CheckCircle, Ticket, History, QrCode, 
  Dumbbell, Trophy, ShoppingBag, MessageCircle, Star, 
  CreditCard, DollarSign, LayoutGrid, Activity, Award, AlertTriangle, 
  Gamepad2, Coins, Flame
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/src/context/ToastContext";

// --- MOCK DATABASE COMPLETO (REFLETINDO 100% DO ECOSSISTEMA) ---
const USER_FULL_DB = {
    // DADOS CADASTRAIS
    id: "u123",
    nome: "João Tubarão",
    email: "joao.shark@unitau.br",
    turma: "Medicina T5",
    status: "active",
    matricula: "2024.1.0054",
    cpf: "123.456.789-00",
    telefone: "(12) 99999-8888",
    desde: "Fev/2024",
    foto: "https://github.com/shadcn.png",
    nivel: 12,
    xpTotal: 12450,
    sharkCoins: 3450, // Saldo Fidelidade

    // 1. GYM RATS (Social Fitness)
    gymActivity: {
        posts: [
            { id: 1, img: "foto_treino.jpg", legenda: "Tá pago! #NoPain", likes: 45, coments: 12, data: "Hoje 08:00" },
            { id: 2, img: "foto_whey.jpg", legenda: "Chegou o carregamento", likes: 32, coments: 5, data: "Ontem 19:00" }
        ],
        comentarios: [
            { id: 101, postAlheio: "Post do Pedro", texto: "Boa monstro!", data: "12/01/2026" }
        ],
        denuncias: [] // Nenhuma denúncia recebida
    },

    // 2. ARENA GAMES (XP & Partidas)
    arenaMatches: [
        { id: 1, jogo: "FIFA 24", evento: "Copa AAAKN", resultado: "Vitória (3x1)", xp: "+150 XP", data: "10/01/2026 - 14:30" },
        { id: 2, jogo: "Truco", evento: "Intermed", resultado: "Derrota", xp: "+20 XP", data: "05/01/2026 - 22:00" },
        { id: 3, jogo: "Just Dance", evento: "Integração", resultado: "2º Lugar", xp: "+300 XP", data: "02/01/2026 - 20:00" },
    ],

    // 3. LOJA (Compras)
    lojaOrders: [
        { id: "#9921", itens: "Kit Bixo (Camisa + Caneca)", total: "R$ 120,00", status: "Entregue", data: "15/12/2025" },
        { id: "#8842", itens: "Tirante Oficial", total: "R$ 25,00", status: "Aguardando Retirada", data: "10/01/2026" },
    ],

    // 4. PARCEIROS (QR Codes & Scans)
    parceiroScans: [
        { id: 1, local: "Ironberg", beneficio: "15% Mensalidade", economia: "R$ 45,00", data: "Hoje 10:00" },
        { id: 2, local: "Açaí Monstro", beneficio: "Toppings Free", economia: "R$ 8,00", data: "Ontem 16:30" },
    ],

    // 5. COMUNIDADE (Interações & Denúncias)
    comunidadeLogs: [
        { id: 1, tipo: "Post", conteudo: "Alguém tem o resumo de Farmaco?", likes: 5, reports: 0, data: "12/01/2026" },
        { id: 2, tipo: "Denúncia Enviada", alvo: "Post Ofensivo (ID #55)", status: "Em Análise", data: "10/01/2026" },
    ],

    // 6. FIDELIDADE (Missões & Ativações)
    fidelidadeHistory: [
        { id: 1, missao: "Check-in Gym (5 dias)", recompensa: "+50 Coins", data: "12/01/2026" },
        { id: 2, missao: "Compra na Loja", recompensa: "+120 Coins", data: "10/01/2026" },
        { id: 3, missao: "Presença Arena", recompensa: "+30 Coins", data: "05/01/2026" },
    ],

    // 7. CONQUISTAS
    conquistas: [
        { id: 1, titulo: "Rato de Academia", nivel: "Ouro", icon: Dumbbell },
        { id: 2, titulo: "Rei do Truco", nivel: "Prata", icon: Trophy },
        { id: 3, titulo: "Burguês Safado", nivel: "Bronze", icon: ShoppingBag },
    ]
};

export default function AdminUsuarioDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [user, setUser] = useState(USER_FULL_DB);
  const [activeTab, setActiveTab] = useState<"visao" | "esporte" | "economico" | "social">("visao");
  const [loading, setLoading] = useState(false);

  // Ação de Banimento
  const handleToggleBan = () => {
      const action = user.status === 'active' ? 'banned' : 'active';
      const msg = action === 'banned' ? "Bloquear acesso total deste aluno?" : "Restaurar acesso?";
      if (confirm(msg)) {
          setLoading(true);
          setTimeout(() => {
              setUser(prev => ({ ...prev, status: action }));
              setLoading(false);
              addToast(action === 'banned' ? "Usuário banido do sistema." : "Acesso restaurado!", action === 'banned' ? "error" : "success");
          }, 800);
      }
  };

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
                        <img src={user.foto} className={`w-full h-full object-cover ${user.status === 'banned' ? 'grayscale' : ''}`}/>
                    </div>
                    <div className="absolute -bottom-3 -right-3 z-20 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-lg border-2 border-[#050505] shadow-lg flex items-center gap-1">
                        <Star size={10} fill="black"/> LVL {user.nivel}
                    </div>
                </div>

                <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h2 className="text-4xl font-black text-white uppercase leading-none mb-2">{user.nome}</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="tag-info"><GraduationCap size={14}/> {user.turma}</span>
                                <span className="tag-info"><CreditCard size={14}/> Matrícula: {user.matricula}</span>
                                <span className="tag-info text-emerald-400 border-emerald-500/20 bg-emerald-500/10"><Coins size={14}/> {user.sharkCoins} SharkCoins</span>
                            </div>
                        </div>
                        <button onClick={handleToggleBan} disabled={loading} className={`px-6 py-3 rounded-xl text-xs font-bold uppercase transition flex items-center gap-2 border shadow-lg ${user.status === 'active' ? 'bg-red-900/10 text-red-500 border-red-900/30 hover:bg-red-900/30' : 'bg-emerald-900/10 text-emerald-500 border-emerald-900/30'}`}>
                            {loading ? "..." : user.status === 'active' ? <><ShieldAlert size={16}/> Bloquear Acesso</> : <><CheckCircle size={16}/> Restaurar Acesso</>}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 border-t border-zinc-800 text-xs">
                        <div><p className="label-dossie">Email</p><p className="text-white">{user.email}</p></div>
                        <div><p className="label-dossie">CPF</p><p className="text-white font-mono">{user.cpf}</p></div>
                        <div><p className="label-dossie">Contato</p><p className="text-white">{user.telefone}</p></div>
                        <div><p className="label-dossie">XP Total</p><p className="text-yellow-500 font-bold">{user.xpTotal} XP</p></div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- NAVEGAÇÃO (ABAS) --- */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
                { id: 'visao', label: 'Visão Geral & Conquistas', icon: LayoutGrid },
                { id: 'esporte', label: 'Gym Rats & Arena', icon: Trophy },
                { id: 'economico', label: 'Loja & Parceiros', icon: DollarSign },
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
                        <div className="row-stat"><span className="text-zinc-400">Total Scans (QR Code)</span><span className="text-white font-bold">{user.parceiroScans.length}</span></div>
                        <div className="row-stat"><span className="text-zinc-400">Partidas Jogadas</span><span className="text-white font-bold">{user.arenaMatches.length}</span></div>
                        <div className="row-stat"><span className="text-zinc-400">Posts no Gym Rats</span><span className="text-white font-bold">{user.gymActivity.posts.length}</span></div>
                        <div className="row-stat"><span className="text-zinc-400">Missões Completadas</span><span className="text-emerald-400 font-bold">{user.fidelidadeHistory.length}</span></div>
                    </div>
                </div>
                <div className="card-admin">
                    <h3 className="title-admin text-yellow-500"><Award size={16}/> Conquistas Desbloqueadas</h3>
                    <div className="grid grid-cols-1 gap-3 mt-4">
                        {user.conquistas.map((c) => (
                            <div key={c.id} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <div className="p-3 bg-zinc-800 rounded-full text-yellow-500"><c.icon size={20}/></div>
                                <div><h4 className="text-sm font-bold text-white">{c.titulo}</h4><p className="text-[10px] text-zinc-500 uppercase">{c.nivel}</p></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 2. ESPORTE (GYM & ARENA) */}
        {activeTab === 'esporte' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {/* GYM RATS (Social) */}
                <div className="card-admin">
                    <h3 className="title-admin text-red-500"><Dumbbell size={16}/> Gym Rats: Feed & Denúncias</h3>
                    <div className="mt-4 space-y-4">
                        <div className="bg-black/30 p-3 rounded-xl border border-zinc-800">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Últimos Posts</p>
                            {user.gymActivity.posts.map(p => (
                                <div key={p.id} className="flex gap-3 mb-3 last:mb-0">
                                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center text-xs text-zinc-500">FOTO</div>
                                    <div>
                                        <p className="text-xs text-white italic">"{p.legenda}"</p>
                                        <p className="text-[10px] text-zinc-500">{p.likes} Likes • {p.coments} Comentários • {p.data}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {user.gymActivity.denuncias.length > 0 ? (
                            <div className="bg-red-900/20 p-3 rounded-xl border border-red-500/30"><p className="text-red-400 text-xs font-bold flex items-center gap-2"><AlertTriangle size={12}/> Usuário possui denúncias neste módulo.</p></div>
                        ) : (
                            <div className="bg-emerald-900/20 p-3 rounded-xl border border-emerald-500/30"><p className="text-emerald-400 text-xs font-bold flex items-center gap-2"><CheckCircle size={12}/> Nenhuma denúncia no Gym Rats.</p></div>
                        )}
                    </div>
                </div>

                {/* ARENA GAMES */}
                <div className="card-admin">
                    <h3 className="title-admin text-purple-500"><Gamepad2 size={16}/> Arena Games: Histórico</h3>
                    <div className="mt-4 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-black/40 text-zinc-500 font-bold uppercase"><tr><th className="p-3">Jogo/Evento</th><th className="p-3">Resultado</th><th className="p-3 text-right">XP</th></tr></thead>
                            <tbody className="divide-y divide-zinc-800/50 text-zinc-300">
                                {user.arenaMatches.map((match) => (
                                    <tr key={match.id}>
                                        <td className="p-3"><div>{match.jogo}</div><div className="text-[9px] text-zinc-500">{match.evento}</div></td>
                                        <td className={`p-3 font-bold ${match.resultado.includes('Vitória') ? 'text-emerald-500' : 'text-zinc-400'}`}>{match.resultado}</td>
                                        <td className="p-3 text-right text-yellow-500 font-bold">{match.xp}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* 3. LOJA & PARCEIROS */}
        {activeTab === 'economico' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {/* PARCEIROS (Scans) */}
                <div className="card-admin">
                    <h3 className="title-admin text-emerald-500"><QrCode size={16}/> Scans & Descontos</h3>
                    <div className="mt-4 space-y-2">
                        {user.parceiroScans.map(scan => (
                            <div key={scan.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <div><p className="text-sm font-bold text-white">{scan.local}</p><p className="text-[10px] text-emerald-400">{scan.beneficio}</p></div>
                                <div className="text-right"><p className="text-xs text-white font-mono">{scan.economia}</p><p className="text-[9px] text-zinc-500">{scan.data}</p></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LOJA (Pedidos) */}
                <div className="card-admin">
                    <h3 className="title-admin text-blue-500"><ShoppingBag size={16}/> Compras na Loja</h3>
                    <div className="mt-4 space-y-2">
                        {user.lojaOrders.map(order => (
                            <div key={order.id} className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <div className="flex justify-between mb-1"><span className="text-xs font-bold text-white">{order.id}</span><span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">{order.status}</span></div>
                                <p className="text-xs text-zinc-400">{order.itens}</p>
                                <div className="mt-2 pt-2 border-t border-zinc-800 flex justify-between text-xs"><span className="text-zinc-500">{order.data}</span><span className="text-emerald-400 font-bold">{order.total}</span></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* 4. SOCIAL & FIDELIDADE */}
        {activeTab === 'social' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {/* FIDELIDADE */}
                <div className="card-admin">
                    <h3 className="title-admin text-yellow-500"><Flame size={16}/> Missões & Fidelidade</h3>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-4 bg-yellow-900/10 p-3 rounded-xl border border-yellow-600/30"><span className="text-yellow-500 text-xs font-bold uppercase">Saldo Atual</span><span className="text-xl font-black text-white">{user.sharkCoins} 🪙</span></div>
                        <div className="space-y-2">
                            {user.fidelidadeHistory.map(fid => (
                                <div key={fid.id} className="flex justify-between items-center text-xs border-b border-zinc-800/50 pb-2 last:border-0">
                                    <div><p className="text-white font-medium">{fid.missao}</p><p className="text-[9px] text-zinc-500">{fid.data}</p></div>
                                    <span className="text-emerald-400 font-bold">{fid.recompensa}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COMUNIDADE */}
                <div className="card-admin">
                    <h3 className="title-admin text-indigo-500"><MessageCircle size={16}/> Comunidade Geral</h3>
                    <div className="mt-4 space-y-3">
                        {user.comunidadeLogs.map(log => (
                            <div key={log.id} className="bg-black/40 p-3 rounded-xl border border-zinc-800">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${log.tipo.includes('Denúncia') ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-zinc-400'}`}>{log.tipo}</span>
                                    <span className="text-[9px] text-zinc-600">{log.data}</span>
                                </div>
                                <p className="text-xs text-zinc-300 italic">"{log.conteudo || log.alvo}"</p>
                                {log.status && <p className="text-[9px] text-yellow-500 mt-1 font-bold">Status: {log.status}</p>}
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