"use client";

import React from "react";
// Import icons
import {
  Users,
  Calendar,
  ShoppingBag,
  ShieldAlert,
  Settings,
  Activity,
  Dumbbell,
  Trophy,
  History,
  Lock,
  UserPlus,
  BarChart3,
  Megaphone,
  Gamepad2,
  Star,
  Crown,
  BookOpen,
  Medal,
  TrendingUp,
  DollarSign,
  UserCheck,
  ArrowRight,
  CheckCircle,
  ListChecks,
  Plus,
  Globe,
  MousePointerClick,
  Eye,
  Smartphone
} from "lucide-react";
// Import charts
import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
} from "recharts";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

// --- MOCK DATA ORIGINAL ---
const dataArea = [
  { name: "Jan", uv: 4000, pv: 2400 },
  { name: "Fev", uv: 3000, pv: 1398 },
  { name: "Mar", uv: 2000, pv: 9800 },
  { name: "Abr", uv: 2780, pv: 3908 },
  { name: "Mai", uv: 1890, pv: 4800 },
  { name: "Jun", uv: 2390, pv: 3800 },
  { name: "Jul", uv: 3490, pv: 4300 },
  { name: "Ago", uv: 4000, pv: 2400 },
  { name: "Set", uv: 3000, pv: 1398 },
  { name: "Out", uv: 2000, pv: 9800 },
];

const dataBar = [
  { name: "S", value: 20 },
  { name: "T", value: 50 },
  { name: "Q", value: 40 },
  { name: "Q", value: 70 },
  { name: "S", value: 30 },
  { name: "S", value: 60 },
  { name: "D", value: 35 },
];

const dataFunnel = [
  { value: 100, name: "Qualificação", fill: "#dbeafe" },
  { value: 80, name: "Análise", fill: "#93c5fd" },
  { value: 50, name: "Proposta", fill: "#3b82f6" },
  { value: 20, name: "Negociação", fill: "#1d4ed8" },
];

const dataPie = [
  { name: "Novos", value: 400 },
  { name: "Qualif.", value: 300 },
  { name: "Análise", value: 300 },
  { name: "Fechados", value: 200 },
];
const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#f87171"];

// --- NOVOS DADOS (RANKINGS E ACESSOS) ---
const topPages = [
    { name: "Gym Rats (Treino)", path: "/gym", views: 12540, growth: "+12%" },
    { name: "Carteirinha Digital", path: "/carteirinha", views: 9850, growth: "+5%" },
    { name: "Loja Oficial", path: "/loja", views: 8400, growth: "+22%" },
    { name: "Calendário Eventos", path: "/eventos", views: 6200, growth: "-2%" },
    { name: "Ranking Geral", path: "/ranking", views: 4100, growth: "+8%" },
];

const topProfiles = [
    { name: "Duda Med", role: "Sócio Lenda", views: 1204, foto: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
    { name: "João Engenharia", role: "Sócio Atleta", views: 980, foto: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    { name: "Ana Direito", role: "Diretoria", views: 850, foto: "https://i.pravatar.cc/150?u=a04258114e29026302d" },
    { name: "Pedro Bixo", role: "Sócio Bicho", views: 620, foto: "https://i.pravatar.cc/150?u=a04258a2462d826712d" },
];

export default function AdminDashboard() {
  const { checkPermission } = useAuth();

  // Permissions
  const canManageEvents = checkPermission([
    "admin_geral",
    "admin_gestor",
    "master",
  ]);
  const canManageTrainings = checkPermission(["admin_treino", "master"]);
  const canManageAdmins = checkPermission(["admin_gestor", "master"]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
            Dashboard
          </h1>
          <p className="text-zinc-400 text-sm">
            Visão geral do desempenho da Atlética.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Timeframe buttons - non-functional mock */}
          <button className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-bold hover:text-white transition">
            7 Dias
          </button>
          <button className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold shadow-lg shadow-emerald-500/10">
            30 Dias
          </button>
          <button className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-400 font-bold hover:text-white transition">
            3 Meses
          </button>
        </div>
      </div>

      {/* --- CHARTS & KPIs SECTION --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAIN CHART (Engagement & Sales) */}
        <div className="lg:col-span-2 bg-zinc-900/80 backdrop-blur-md p-6 rounded-3xl border border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Activity size={18} className="text-emerald-500" /> Performance
                Geral
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                Comparativo Acessos vs Vendas
              </p>
            </div>
            {/* Legend */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] text-zinc-300 font-bold">
                  Acessos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"></span>
                <span className="text-[10px] text-zinc-300 font-bold">
                  Vendas
                </span>
              </div>
            </div>
          </div>

          {/* Area Chart using Recharts */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dataArea}
                margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#27272a"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#71717a" }}
                  dy={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="uv"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                />
                <Area
                  type="monotone"
                  dataKey="pv"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPv)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SIDE COLUMN KPIs */}
        <div className="space-y-6">
          {/* Sales Funnel (Event Revenue) */}
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-start mb-1">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Receita Evento (Funil)
              </p>
              <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                +15%
              </span>
            </div>
            {/* Funnel Chart */}
            <div className="flex-1 min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Funnel dataKey="value" data={dataFunnel} isAnimationActive>
                    <LabelList
                      position="right"
                      fill="#fff"
                      stroke="none"
                      dataKey="name"
                      fontSize={10}
                    />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Members by Plan (Pie Chart) */}
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex items-center gap-5">
            <div className="relative w-24 h-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-white">1.2k</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">
                Sócios Ativos
              </p>
              {dataPie.slice(0, 2).map((entry, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index] }}
                    ></div>
                    <span className="text-zinc-300">{entry.name}</span>
                  </div>
                  <span className="font-bold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products (Bar Chart) */}
          <div className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Vendas Semanais
              </p>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBar}>
                  <Bar
                    dataKey="value"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#71717a" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#27272a" }}
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* --- NOVA SEÇÃO: INTELIGÊNCIA & RANKINGS (ADICIONADA AQUI) --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* RANKING DE PÁGINAS MAIS ACESSADAS */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <Globe size={18} className="text-blue-500" /> Top Páginas
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-black uppercase bg-zinc-800 px-2 py-1 rounded">Hoje</p>
              </div>
              
              <div className="space-y-5">
                  {topPages.map((page, i) => (
                      <div key={i} className="group relative">
                          <div className="flex justify-between items-end mb-1 relative z-10">
                              <span className="text-xs font-bold text-white flex items-center gap-3">
                                  <span className={`w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-[10px] ${i === 0 ? 'text-yellow-500' : 'text-zinc-500'}`}>#{i+1}</span> 
                                  {page.name}
                              </span>
                              <div className="text-right flex items-center gap-2">
                                  <span className={`text-[10px] font-bold ${page.growth.includes('+') ? 'text-emerald-500' : 'text-red-500'}`}>{page.growth}</span>
                                  <span className="text-[10px] font-mono text-zinc-400 block">{page.views.toLocaleString()}</span>
                              </div>
                          </div>
                          {/* Barra de Progresso */}
                          <div className="w-full bg-black h-2 rounded-full overflow-hidden relative">
                              <div 
                                  className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 'bg-zinc-700'}`} 
                                  style={{ width: `${(page.views / 15000) * 100}%` }}
                              ></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* PERFIS MAIS ACESSADOS (STALKERS) */}
          <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white text-lg flex items-center gap-2">
                      <MousePointerClick size={18} className="text-purple-500" /> Perfis Popstars
                  </h3>
              </div>
              <div className="space-y-3">
                  {topProfiles.map((profile, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-black/40 rounded-2xl border border-white/5 hover:border-purple-500/30 hover:bg-purple-900/10 transition group">
                          <div className="relative">
                              <img src={profile.foto} className="w-12 h-12 rounded-full border-2 border-zinc-800 group-hover:border-purple-500 transition"/>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-900 rounded-full flex items-center justify-center text-[10px] font-bold text-white border border-zinc-700">#{i+1}</div>
                          </div>
                          <div className="flex-1">
                              <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition">{profile.name}</h4>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wide">{profile.role}</p>
                          </div>
                          <div className="text-right bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                  <Eye size={12} className="text-purple-500"/> 
                                  {profile.views}
                              </span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

      </section>

      {/* COACH DASHBOARD (ADMIN 3) */}
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
                  <span className="flex items-center gap-1">
                    <Trophy size={16} /> Rankings
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldAlert size={16} /> Faltas
                  </span>
                  <span className="flex items-center gap-1">
                    <ListChecks size={16} /> Chamada
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-emerald-500/20 p-4 rounded-full border border-emerald-500/50 group-hover:bg-emerald-500 group-hover:text-black transition relative z-10">
              <ArrowRight size={24} />
            </div>
          </Link>
        </section>
      )}

      {/* CONTROL CENTER (BUTTONS) */}
      {canManageEvents && (
        <section>
          <h2 className="text-lg font-black text-white uppercase tracking-tighter italic mb-6 flex items-center gap-3">
            <Settings size={24} className="text-zinc-500" /> Central de Controle
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Row 1: Core Management */}
            <AdminCard
              icon={<Calendar size={24} />}
              title="Eventos"
              subtitle="Festas e Jogos"
              href="/admin/eventos"
              color="text-blue-400"
              bgColor="bg-blue-500/10"
              borderColor="border-blue-500/30"
            />
            <AdminCard
              icon={<ShoppingBag size={24} />}
              title="Loja"
              subtitle="Produtos e Estoque"
              href="/admin/loja"
              color="text-yellow-400"
              bgColor="bg-yellow-500/10"
              borderColor="border-yellow-500/30"
            />
            <AdminCard
              icon={<Users size={24} />}
              title="Usuários"
              subtitle="Gestão de Sócios"
              href="/admin/usuarios"
            />
            <AdminCard
              icon={<ShieldAlert size={24} />}
              title="Denúncias"
              subtitle="Moderação"
              href="/admin/denuncias"
              color="text-red-500"
              bgColor="bg-red-500/10"
              borderColor="border-red-500/30"
            />

            {/* Row 2: Gamification */}
            <AdminCard
              icon={<Gamepad2 size={24} />}
              title="Arena Games"
              subtitle="Torneios E-Sports"
              href="/admin/games"
              color="text-purple-400"
              bgColor="bg-purple-500/10"
              borderColor="border-purple-500/30"
            />
            <AdminCard
              icon={<Trophy size={24} />}
              title="Gym Champ"
              subtitle="Campeonatos Gym"
              href="/admin/gym"
              color="text-orange-400"
              bgColor="bg-orange-500/10"
              borderColor="border-orange-500/30"
            />
            <AdminCard
              icon={<Star size={24} />}
              title="Fidelidade"
              subtitle="Recompensas XP"
              href="/admin/fidelidade"
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
              borderColor="border-yellow-500/30"
            />
            <AdminCard
              icon={<Medal size={24} />}
              title="Conquistas"
              subtitle="Medalhas e Badges"
              href="/admin/conquistas"
              color="text-yellow-500"
              bgColor="bg-yellow-500/10"
              borderColor="border-yellow-500/30"
            />

            {/* Row 3: Institutional & Config (NOVO BOTÃO AQUI) */}
            <AdminCard
              icon={<Crown size={24} />}
              title="Planos"
              subtitle="Preços e Benefícios"
              href="/admin/planos"
              color="text-emerald-400"
              bgColor="bg-emerald-500/10"
              borderColor="border-emerald-500/30"
            />
            <AdminCard
              icon={<Megaphone size={24} />}
              title="Parceiros"
              subtitle="Clube de Benefícios"
              href="/admin/parceiros"
              color="text-pink-400"
              bgColor="bg-pink-500/10"
              borderColor="border-pink-500/30"
            />
            <AdminCard
              icon={<History size={24} />}
              title="Histórico"
              subtitle="Linha do Tempo"
              href="/admin/historico"
            />
            <AdminCard
              icon={<BookOpen size={24} />}
              title="Guia do App"
              subtitle="Tutoriais de Ajuda"
              href="/admin/guia"
            />
            {/* BOTÃO DE CONFIGURAÇÕES ADICIONADO AQUI */}
            <AdminCard
              icon={<Settings size={24} />}
              title="Configurações"
              subtitle="App & Menus"
              href="/admin/configuracoes"
              color="text-zinc-300"
              bgColor="bg-zinc-800"
              borderColor="border-zinc-700"
            />
          </div>
        </section>
      )}

      {/* PRESIDENCY AREA (ADMIN 2) */}
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
function AdminCard({
  icon,
  title,
  subtitle,
  href,
  color = "text-zinc-400",
  bgColor = "bg-zinc-900",
  borderColor = "border-zinc-800",
}: any) {
  return (
    <Link
      href={href}
      className={`group ${bgColor} p-5 rounded-3xl border ${borderColor} flex flex-col justify-between h-40 relative overflow-hidden hover:scale-[1.02] transition-all hover:shadow-xl`}
    >
      <div
        className={`absolute top-0 right-0 p-5 opacity-5 group-hover:opacity-20 transition-opacity scale-150 ${color}`}
      >
        {icon}
      </div>

      <div
        className={`p-3 rounded-2xl bg-black/50 w-fit mb-4 backdrop-blur-md border border-white/5 ${color} group-hover:bg-white/10 transition-colors`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-black text-white text-lg uppercase tracking-tight leading-none mb-1">
          {title}
        </h3>
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
          {subtitle}
        </p>
      </div>
      <div
        className={`absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 ${color}`}
      >
        <ArrowRight size={20} />
      </div>
    </Link>
  );
}