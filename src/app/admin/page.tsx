"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Users, Calendar, ShoppingBag, ShieldAlert, Settings, Activity,
  Dumbbell, Trophy, History, Lock, UserPlus, BarChart3, Megaphone,
  Gamepad2, Star, Crown, BookOpen, Medal, Package, ListChecks, 
  ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, onSnapshot, orderBy, Timestamp } from "firebase/firestore";

// --- INTERFACES ESTRITAS ---

interface Order {
  id: string;
  price: number;
  status: 'approved' | 'pending' | 'rejected';
  createdAt: Timestamp; 
  productName: string;
}

interface UserData {
  id: string;
  nome: string;
  role: string;
  xp: number;
  foto?: string;
  plano_status?: string;
  tier?: string;
}

interface DashboardStats {
  revenueTotal: number;
  activeMembers: number;
  pendingOrders: number;
  totalUsers: number;
}

// CORREÇÃO: Adicionado [key: string]: any para compatibilidade com Recharts
interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any; 
}

interface ProductRank {
  name: string;
  count: number;
}

// CORREÇÃO: Adicionado [key: string]: any para compatibilidade com Recharts
interface PieDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

// Tipagem específica para o formatador do Tooltip do Recharts
type RechartsValue = number | string | Array<number | string> | undefined;

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]; // Emerald, Blue, Amber, Red

export default function AdminDashboard() {
  const { checkPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // Estados de Dados Reais
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  
  // Permissions
  const canManageEvents = checkPermission(["admin_geral", "admin_gestor", "master"]);
  const canManageTrainings = checkPermission(["admin_treino", "master"]);
  const canManageAdmins = checkPermission(["admin_gestor", "master"]);

  // --- 🦈 FETCH DATA (REALTIME) ---
  useEffect(() => {
    // 1. Buscar Pedidos
    const qOrders = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      const data = snap.docs.map(d => {
          const docData = d.data();
          return { 
            id: d.id, 
            price: docData.price || 0,
            status: docData.status,
            createdAt: docData.createdAt,
            productName: docData.productName || 'Produto'
          } as Order;
      });
      setOrders(data);
    });

    // 2. Buscar Usuários
    const qUsers = query(collection(db, "users"), orderBy("xp", "desc")); 
    const unsubUsers = onSnapshot(qUsers, (snap) => {
      const data = snap.docs.map(d => {
        const docData = d.data();
        return { 
            id: d.id, 
            nome: docData.nome || 'Sem Nome',
            role: docData.role || 'guest',
            xp: docData.xp || 0,
            foto: docData.foto,
            plano_status: docData.plano_status,
            tier: docData.tier
        } as UserData;
      });
      setUsers(data);
      setLoading(false);
    });

    return () => { unsubOrders(); unsubUsers(); };
  }, []);

  // --- 🦈 CÁLCULOS (MEMOIZED) ---
  
  const stats = useMemo((): DashboardStats => {
    return {
      revenueTotal: orders.filter(o => o.status === 'approved').reduce((acc, curr) => acc + (curr.price || 0), 0),
      activeMembers: users.filter(u => u.plano_status === 'ativo').length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      totalUsers: users.length
    };
  }, [orders, users]);

  // Gráfico: Vendas Semanais
  const salesData = useMemo((): ChartDataPoint[] => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    return last7Days.map(date => {
      const dayName = days[date.getDay()];
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyTotal = orders
        .filter(o => {
            if (o.status !== 'approved' || !o.createdAt) return false;
            try {
                return o.createdAt.toDate().toISOString().split('T')[0] === dateStr;
            } catch {
                return false;
            }
        })
        .reduce((acc, curr) => acc + (curr.price || 0), 0);

      return { name: dayName, value: dailyTotal };
    });
  }, [orders]);

  // Top Produtos
  const topProducts = useMemo((): ProductRank[] => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
      if(o.status === 'approved' && o.productName) {
        counts[o.productName] = (counts[o.productName] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [orders]);

  // Members Pie Chart Data
  const pieData = useMemo((): PieDataPoint[] => [
    { name: "Ativos", value: stats.activeMembers },
    { name: "Pendentes/Inativos", value: stats.totalUsers - stats.activeMembers },
  ], [stats]);


  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-bold animate-pulse">Carregando dados do cardume... 🦈</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
            Dashboard <span className="text-emerald-500 text-sm not-italic font-normal bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">Ao Vivo</span>
          </h1>
          <p className="text-zinc-400 text-sm">
            Visão geral do desempenho da Atlética em tempo real.
          </p>
        </div>
        
        {/* KPI Cards Rápidos */}
        <div className="flex gap-4">
           <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl min-w-[120px]">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Receita Total</p>
              <p className="text-emerald-400 font-black text-lg">R$ {stats.revenueTotal.toLocaleString('pt-BR')}</p>
           </div>
           <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl min-w-[120px]">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Sócios Ativos</p>
              <p className="text-blue-400 font-black text-lg">{stats.activeMembers} <span className="text-xs text-zinc-600">/ {stats.totalUsers}</span></p>
           </div>
        </div>
      </div>

      {/* --- CHARTS & KPIs SECTION --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN CHART (Vendas Semanais) */}
        <div className="lg:col-span-2 bg-zinc-900/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> Fluxo de Caixa
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Vendas aprovadas (Últimos 7 dias)
              </p>
            </div>
            <Link href="/admin/financeiro" className="text-xs text-emerald-500 hover:underline">Ver Detalhes</Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#71717a" }} dy={10} />
                <Tooltip 
                    formatter={(value: RechartsValue) => [`R$ ${Number(value || 0).toFixed(2)}`, "Vendas"]}
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "12px" }} 
                    itemStyle={{ color: "#fff" }} 
                />
                <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE COLUMN KPIs */}
        <div className="space-y-6">
          
          {/* Members by Plan (Pie Chart) */}
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex items-center gap-5 relative overflow-hidden">
             {/* Efeito visual de fundo */}
             <div className="absolute -right-5 -top-5 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl"></div>

            <div className="relative w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={45} paddingAngle={5} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#27272a'} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-lg font-black text-white">{stats.totalUsers > 0 ? ((stats.activeMembers / stats.totalUsers) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Adesão Sócios</p>
              <div className="flex justify-between text-xs"><span className="text-zinc-300">Ativos</span><span className="font-bold text-white">{stats.activeMembers}</span></div>
              <div className="flex justify-between text-xs"><span className="text-zinc-500">Total Base</span><span className="font-bold text-zinc-500">{stats.totalUsers}</span></div>
            </div>
          </div>

          {/* Pending Orders Alert */}
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 relative group hover:border-yellow-500/50 transition cursor-pointer">
             <Link href="/admin/loja">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Pedidos Pendentes</p>
                    <ShoppingBag size={14} className="text-yellow-500"/>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white">{stats.pendingOrders}</span>
                    <span className="text-xs text-zinc-500 mb-1">aguardando aprovação</span>
                </div>
                {stats.pendingOrders > 0 && (
                    <div className="mt-3 w-full bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-center text-xs font-bold text-yellow-500 animate-pulse">
                        Resolver Agora
                    </div>
                )}
             </Link>
          </div>

        </div>
      </section>

      {/* --- SECTION: RANKINGS & TOP PRODUTOS --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TOP PRODUTOS */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <Package size={18} className="text-blue-500" /> Mais Vendidos
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase bg-zinc-800 px-2 py-1 rounded">Geral</p>
              </div>
              
              <div className="space-y-4">
                  {topProducts.length > 0 ? topProducts.map((prod, i) => (
                      <div key={i} className="group relative">
                          <div className="flex justify-between items-center mb-1 relative z-10">
                              <span className="text-xs font-bold text-white flex items-center gap-3">
                                  <span className={`w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-[10px] ${i === 0 ? 'text-yellow-500' : 'text-zinc-500'}`}>#{i+1}</span> 
                                  {prod.name}
                              </span>
                              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{prod.count} un</span>
                          </div>
                          {/* Barra Visual */}
                          <div className="w-full bg-black h-1.5 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-zinc-700'}`} style={{ width: `${(prod.count / (topProducts[0].count || 1)) * 100}%` }}></div>
                          </div>
                      </div>
                  )) : (
                    <div className="text-center py-10 text-zinc-600 text-xs">Sem vendas registradas ainda.</div>
                  )}
              </div>
          </div>

          {/* TOP PERFIS */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <Crown size={18} className="text-purple-500" /> Tubarões do Rank
                  </h3>
                  <Link href="/ranking" className="text-xs text-purple-500 hover:underline">Ver Todos</Link>
              </div>
              <div className="space-y-3">
                  {users.slice(0, 5).map((u, i) => (
                      <div key={u.id} className="flex items-center gap-4 p-3 bg-black/40 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-900/10 transition group">
                          <div className="relative">
                              <img src={u.foto || "https://github.com/shadcn.png"} alt={u.nome} className="w-10 h-10 rounded-full border-2 border-zinc-800 group-hover:border-purple-500 transition object-cover"/>
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700 ${i === 0 ? 'bg-yellow-500 text-black' : 'bg-zinc-900'}`}>
                                {i + 1}
                              </div>
                          </div>
                          <div className="flex-1">
                              <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition flex items-center gap-2">
                                {u.nome}
                                {u.tier && <span className="text-[9px] bg-zinc-800 px-1.5 rounded text-zinc-400 uppercase">{u.tier}</span>}
                              </h4>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">{u.role === 'admin' ? 'Administrador' : 'Membro'}</p>
                          </div>
                          <div className="text-right bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <Star size={12} className="text-purple-500 fill-purple-500"/> 
                                  {u.xp || 0} XP
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

      </section>

      {/* COACH DASHBOARD */}
      {canManageTrainings && (
        <section>
          <Link
            href="/admin/treinos"
            className="relative overflow-hidden bg-gradient-to-r from-emerald-900 to-[#050505] p-8 rounded-[2rem] border border-emerald-500/30 flex items-center justify-between group hover:scale-[1.01] transition-all shadow-2xl shadow-emerald-900/20"
          >
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            <div className="flex items-center gap-6 relative z-10">
              <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(16,185,129,0.5)] group-hover:rotate-6 transition">
                <BarChart3 size={36} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="font-black text-white text-3xl uppercase italic tracking-tighter mb-2">
                  Dashboard do Treinador
                </h2>
                <p className="text-emerald-300 font-medium flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1"><Trophy size={16} /> Rankings</span>
                  <span className="flex items-center gap-1"><ShieldAlert size={16} /> Faltas</span>
                  <span className="flex items-center gap-1"><ListChecks size={16} /> Chamada</span>
                </p>
              </div>
            </div>
            <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/50 group-hover:bg-emerald-500 group-hover:text-black transition relative z-10">
              <ArrowRight size={24} />
            </div>
          </Link>
        </section>
      )}

      {/* CONTROL CENTER */}
      {canManageEvents && (
        <section>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter italic mb-6 flex items-center gap-3">
            <Settings size={24} className="text-zinc-500" /> Central de Controle
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AdminCard icon={<Calendar size={24} />} title="Eventos" subtitle="Festas e Jogos" href="/admin/eventos" color="text-blue-400" bgColor="bg-blue-500/10" borderColor="border-blue-500/30" />
            <AdminCard icon={<ShoppingBag size={24} />} title="Loja" subtitle="Produtos e Estoque" href="/admin/loja" color="text-yellow-400" bgColor="bg-yellow-500/10" borderColor="border-yellow-500/30" />
            <AdminCard icon={<Users size={24} />} title="Usuários" subtitle="Gestão de Sócios" href="/admin/usuarios" />
            <AdminCard icon={<ShieldAlert size={24} />} title="Denúncias" subtitle="Moderação" href="/admin/denuncias" color="text-red-500" bgColor="bg-red-500/10" borderColor="border-red-500/30" />

            <AdminCard icon={<Gamepad2 size={24} />} title="Arena Games" subtitle="Torneios E-Sports" href="/admin/games" color="text-purple-400" bgColor="bg-purple-500/10" borderColor="border-purple-500/30" />
            <AdminCard icon={<Trophy size={24} />} title="Gym Champ" subtitle="Campeonatos Gym" href="/admin/gym" color="text-orange-400" bgColor="bg-orange-500/10" borderColor="border-orange-500/30" />
            <AdminCard icon={<Star size={24} />} title="Fidelidade" subtitle="Recompensas XP" href="/admin/fidelidade" color="text-yellow-500" bgColor="bg-yellow-500/10" borderColor="border-yellow-500/30" />
            <AdminCard icon={<Medal size={24} />} title="Conquistas" subtitle="Medalhas e Badges" href="/admin/conquistas" color="text-yellow-500" bgColor="bg-yellow-500/10" borderColor="border-yellow-500/30" />

            <AdminCard icon={<Crown size={24} />} title="Planos" subtitle="Preços e Benefícios" href="/admin/planos" color="text-emerald-400" bgColor="bg-emerald-500/10" borderColor="border-emerald-500/30" />
            <AdminCard icon={<Megaphone size={24} />} title="Parceiros" subtitle="Clube de Benefícios" href="/admin/parceiros" color="text-pink-400" bgColor="bg-pink-500/10" borderColor="border-pink-500/30" />
            <AdminCard icon={<History size={24} />} title="Histórico" subtitle="Linha do Tempo" href="/admin/historico" />
            <AdminCard icon={<BookOpen size={24} />} title="Guia do App" subtitle="Tutoriais de Ajuda" href="/admin/guia" />
            <AdminCard icon={<Settings size={24} />} title="Configurações" subtitle="App & Menus" href="/admin/configuracoes" color="text-zinc-300" bgColor="bg-zinc-800" borderColor="border-zinc-700" />
          </div>
        </section>
      )}

      {/* PRESIDENCY AREA */}
      {canManageAdmins && (
        <section className="mt-12 pt-10 border-t border-white/5">
          <h2 className="text-lg font-black text-red-500 uppercase tracking-tighter italic mb-6 flex items-center gap-3">
            <Lock size={24} /> Zona de Perigo
          </h2>
          <Link
            href="/admin/permissoes"
            className="bg-red-950/30 p-6 rounded-[2rem] border border-red-900/50 flex items-center justify-between group hover:bg-red-900/40 hover:border-red-500/50 transition-all"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] group-hover:scale-110 transition">
                <UserPlus size={28} />
              </div>
              <div>
                <h3 className="font-black text-white text-xl uppercase tracking-tighter">
                  Gerenciar Admins
                </h3>
                <p className="text-sm text-red-300 font-medium">
                  Promover ou rebaixar cargos de acesso.
                </p>
              </div>
            </div>
            <div className="bg-red-600/20 p-4 rounded-full text-red-500 group-hover:bg-red-600 group-hover:text-white transition">
              <ArrowRight size={24} />
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}

// Reusable Card Component
interface AdminCardProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    href: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
}

function AdminCard({
  icon, title, subtitle, href, 
  color = "text-zinc-400", 
  bgColor = "bg-zinc-900", 
  borderColor = "border-zinc-800",
}: AdminCardProps) {
  return (
    <Link
      href={href}
      className={`group ${bgColor} p-5 rounded-3xl border ${borderColor} flex flex-col justify-between h-40 relative overflow-hidden hover:scale-[1.02] transition-all hover:shadow-xl`}
    >
      <div className={`absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-20 transition-opacity scale-150 ${color}`}>{icon}</div>
      <div className={`p-3 rounded-2xl bg-black/50 w-fit mb-4 backdrop-blur-md border border-white/5 ${color} group-hover:bg-white/10 transition-colors`}>{icon}</div>
      <div>
        <h3 className="font-black text-white text-lg uppercase tracking-tight leading-none mb-1">{title}</h3>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{subtitle}</p>
      </div>
      <div className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 ${color}`}><ArrowRight size={20} /></div>
    </Link>
  );
}