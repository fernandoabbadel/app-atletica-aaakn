"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, ShoppingBag, Calendar, TrendingUp, 
  ArrowUpRight, Clock, ShieldAlert, Activity
} from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // 🦈 Correção: Next Image
import { db } from "../../lib/firebase";
import { collection, query, orderBy, limit, getDocs, where, getCountFromServer } from "firebase/firestore";

// --- INTERFACES (FIM DO ANY) ---
interface DashboardStats {
    totalUsers: number;
    totalEvents: number;
    totalSales: number;
    activeChamps: number;
}

interface RecentUser {
    id: string;
    nome: string;
    email: string;
    foto: string;
    turma: string;
    role: string;
    createdAt?: any;
}

interface ActivityLog {
    id: string;
    userName: string;
    action: string;
    resource: string;
    timestamp: any;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({ totalUsers: 0, totalEvents: 0, totalSales: 0, activeChamps: 0 });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
        try {
            // 1. Contadores (Usando count aggregations para performance)
            const usersColl = collection(db, "users");
            const eventsColl = collection(db, "eventos");
            const salesColl = collection(db, "store_orders"); // Assumindo coleção de vendas
            
            const usersSnapshot = await getCountFromServer(usersColl);
            const eventsSnapshot = await getCountFromServer(eventsColl);
            // Simulação de vendas se não tiver a coleção ainda
            const salesCount = 1250; 

            // 2. Usuários Recentes
            const qUsers = query(usersColl, orderBy("data_adesao", "desc"), limit(5));
            const usersSnap = await getDocs(qUsers);
            const usersData = usersSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RecentUser[];

            // 3. Logs Recentes
            const qLogs = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(5));
            const logsSnap = await getDocs(qLogs);
            const logsData = logsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ActivityLog[];

            setStats({
                totalUsers: usersSnapshot.data().count,
                totalEvents: eventsSnapshot.data().count,
                totalSales: salesCount,
                activeChamps: 2 // Mock ou fetch real
            });
            setRecentUsers(usersData);
            setRecentActivity(logsData);

        } catch (error) {
            console.error("Erro ao carregar dashboard:", error);
        } finally {
            setLoading(false);
        }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-bold animate-pulse">
            CARREGANDO BASE...
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Visão Geral</h1>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Métricas e Atividade em Tempo Real</p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Total de Atletas" 
            value={stats.totalUsers} 
            icon={<Users size={20} className="text-emerald-500"/>} 
            trend="+12% essa semana"
          />
          <StatCard 
            title="Eventos Criados" 
            value={stats.totalEvents} 
            icon={<Calendar size={20} className="text-blue-500"/>} 
            trend="3 ativos agora"
          />
          <StatCard 
            title="Vendas Loja" 
            value={`R$ ${stats.totalSales}`} 
            icon={<ShoppingBag size={20} className="text-purple-500"/>} 
            trend="Meta batida!"
          />
          <StatCard 
            title="Engajamento" 
            value="98.5%" 
            icon={<TrendingUp size={20} className="text-yellow-500"/>} 
            trend="Recorde histórico"
          />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA 1: NOVOS USUÁRIOS (2/3 da tela) */}
          <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-white uppercase flex items-center gap-2">
                      <ShieldAlert size={18} className="text-emerald-500"/> Novos Recrutas
                  </h3>
                  <Link href="/admin/usuarios" className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase flex items-center gap-1 transition">
                      Ver Todos <ArrowUpRight size={12}/>
                  </Link>
              </div>

              <div className="space-y-4">
                  {recentUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition group">
                          <div className="flex items-center gap-4">
                              <div className="relative w-10 h-10">
                                  {/* 🦈 Correção da Imagem Aqui (Linha 345 original) */}
                                  <Image 
                                    src={user.foto || "https://github.com/shadcn.png"} 
                                    alt={user.nome} 
                                    fill
                                    className="rounded-full object-cover border border-zinc-700"
                                    unoptimized
                                  />
                              </div>
                              <div>
                                  <p className="font-bold text-white text-sm group-hover:text-emerald-400 transition">{user.nome}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{user.turma} • {user.role}</p>
                              </div>
                          </div>
                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono">
                              {user.createdAt ? "Novo" : "Veterano"}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          {/* COLUNA 2: ATIVIDADE RECENTE (1/3 da tela) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
              <h3 className="font-bold text-white uppercase mb-6 flex items-center gap-2">
                  <Activity size={18} className="text-orange-500"/> Log do Sistema
              </h3>
              
              <div className="relative border-l border-zinc-800 ml-2 space-y-6">
                  {recentActivity.map((log, idx) => (
                      <div key={log.id || idx} className="pl-6 relative">
                          <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 bg-zinc-800 rounded-full border-2 border-[#050505]"></div>
                          <p className="text-[10px] text-zinc-500 font-mono mb-1 flex items-center gap-1">
                              <Clock size={10}/> {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : "Agora"}
                          </p>
                          <p className="text-xs text-zinc-300">
                              <span className="text-emerald-500 font-bold">{log.userName}</span> realizou 
                              <span className="font-bold text-white mx-1">{log.action}</span> 
                              em {log.resource}
                          </p>
                      </div>
                  ))}
                  {recentActivity.length === 0 && (
                      <p className="pl-6 text-xs text-zinc-600 italic">Nenhuma atividade recente.</p>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
}

// Componente Auxiliar para Cards
function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: any, trend: string }) {
    return (
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition">
            <div className="flex justify-between items-start mb-4">
                <span className="p-3 bg-black rounded-xl border border-zinc-800">{icon}</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded font-bold uppercase">{trend}</span>
            </div>
            <p className="text-zinc-500 text-xs font-bold uppercase">{title}</p>
            <p className="text-3xl font-black text-white mt-1">{value}</p>
        </div>
    );
}