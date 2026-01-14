"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, Search, Shield, User, Briefcase, 
  Dumbbell, Crown, Filter, Lock, AlertTriangle, 
  CheckCircle, MoreVertical, ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";

// --- TIPOS DE CARGO (HIERARQUIA) ---
type UserRole = 'master' | 'admin' | 'treinador' | 'empresa' | 'usuario';

interface UserData {
    id: string;
    nome: string;
    email: string;
    foto: string;
    role: UserRole;
    status: 'ativo' | 'banido';
    ultimoAcesso: string;
}

// --- MOCK DATA (SIMULAÇÃO DO BANCO) ---
const INITIAL_USERS: UserData[] = [
    { id: "1", nome: "Gabriel Presidente", email: "presida@aaakn.com", foto: "https://github.com/shadcn.png", role: "master", status: "ativo", ultimoAcesso: "Agora" },
    { id: "2", nome: "Duda Diretoria", email: "duda@aaakn.com", foto: "https://i.pravatar.cc/150?u=a", role: "admin", status: "ativo", ultimoAcesso: "Há 2h" },
    { id: "3", nome: "Coach Marcão", email: "marcao@gym.com", foto: "https://i.pravatar.cc/150?u=b", role: "treinador", status: "ativo", ultimoAcesso: "Ontem" },
    { id: "4", nome: "Bar do Zé", email: "contato@bardoze.com", foto: "https://i.pravatar.cc/150?u=c", role: "empresa", status: "ativo", ultimoAcesso: "Há 5h" },
    { id: "5", nome: "Lucas Calouro", email: "lucas@aluno.com", foto: "https://i.pravatar.cc/150?u=d", role: "usuario", status: "ativo", ultimoAcesso: "Há 10min" },
    { id: "6", nome: "Ana Veterinária", email: "ana@aluno.com", foto: "https://i.pravatar.cc/150?u=e", role: "usuario", status: "ativo", ultimoAcesso: "Há 3 dias" },
];

export default function AdminPermissoesPage() {
  const { user, checkPermission } = useAuth(); // Pega o usuário logado
  const { addToast } = useToast();
  const router = useRouter();

  // Estados
  const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Permissão de Segurança: Só MASTER pode editar
  const isMaster = checkPermission(["master"]);

  // --- LÓGICA DE FILTRO ---
  const filteredUsers = users.filter(u => {
      const matchesSearch = u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === "all" ? true : 
                          filterRole === "staff" ? ["master", "admin", "treinador"].includes(u.role) :
                          u.role === filterRole;
      return matchesSearch && matchesRole;
  });

  // --- HANDLERS ---
  const handleRoleChange = (userId: string, newRole: UserRole) => {
      if (!isMaster) {
          addToast("Apenas o MASTER pode promover usuários!", "error");
          return;
      }
      
      // Simulação de update
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      
      const feedbackMsg = newRole === 'admin' ? "Novo General promovido! 🛡️" :
                          newRole === 'treinador' ? "Treinador escalado! 💪" :
                          newRole === 'empresa' ? "Conta Empresarial ativada! 💼" :
                          "Permissões atualizadas.";
      
      addToast(feedbackMsg, "success");
  };

  // Helper de Cores e Ícones
  const getRoleBadge = (role: UserRole) => {
      switch(role) {
          case 'master': return { color: "text-red-500 bg-red-500/10 border-red-500/20", icon: Crown, label: "MASTER" };
          case 'admin': return { color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", icon: Shield, label: "ADMIN" };
          case 'treinador': return { color: "text-orange-500 bg-orange-500/10 border-orange-500/20", icon: Dumbbell, label: "COACH" };
          case 'empresa': return { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: Briefcase, label: "EMPRESA" };
          default: return { color: "text-zinc-400 bg-zinc-800 border-zinc-700", icon: User, label: "MEMBRO" };
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-red-500">
      
      {/* HEADER PERIGOSO */}
      <header className="p-6 sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-md border-b border-red-900/30 flex justify-between items-center shadow-lg shadow-red-900/5">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div>
              <h1 className="text-xl font-black uppercase flex items-center gap-2 text-white">
                  <Lock size={20} className="text-red-500" /> Gestão de Acesso
              </h1>
              <p className="text-[11px] text-zinc-500 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Área Sensível
              </p>
          </div>
        </div>
        
        {!isMaster && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg border border-zinc-700">
                <AlertTriangle size={14} className="text-yellow-500"/>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Modo Visualização (Somente Master edita)</span>
            </div>
        )}
      </header>

      <main className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* FILTROS E BUSCA */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
              {/* Abas */}
              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-full md:w-auto overflow-x-auto">
                  {[
                      { id: 'all', label: 'Todos' },
                      { id: 'staff', label: 'Staff & Diretoria' },
                      { id: 'empresa', label: 'Empresas' },
                      { id: 'usuario', label: 'Membros' }
                  ].map(tab => (
                      <button 
                          key={tab.id}
                          onClick={() => setFilterRole(tab.id)}
                          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase whitespace-nowrap transition ${filterRole === tab.id ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                          {tab.label}
                      </button>
                  ))}
              </div>

              {/* Busca */}
              <div className="relative w-full md:w-64 group">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition"/>
                  <input 
                      type="text" 
                      placeholder="Buscar usuário..." 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-emerald-500 transition"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                  />
              </div>
          </div>

          {/* LISTA DE USUÁRIOS */}
          <div className="space-y-3">
              {filteredUsers.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const BadgeIcon = badge.icon;

                  return (
                      <div key={u.id} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 hover:border-zinc-700 transition group">
                          
                          {/* Avatar & Info */}
                          <div className="flex items-center gap-4 flex-1 w-full">
                              <div className="relative">
                                  <img src={u.foto} className="w-12 h-12 rounded-full border-2 border-zinc-800 object-cover"/>
                                  <div className={`absolute -bottom-1 -right-1 p-1 rounded-full bg-zinc-900 border border-zinc-800 ${badge.color.split(' ')[0]}`}>
                                      <BadgeIcon size={10}/>
                                  </div>
                              </div>
                              <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                      <h3 className="font-bold text-white text-sm truncate">{u.nome}</h3>
                                      <Link href={`/admin/usuarios/${u.id}`} className="text-zinc-600 hover:text-emerald-500 transition" title="Ver Perfil Completo">
                                          <ExternalLink size={12}/>
                                      </Link>
                                  </div>
                                  <p className="text-xs text-zinc-500 truncate">{u.email}</p>
                              </div>
                          </div>

                          {/* Cargo Atual (Badge) */}
                          <div className={`px-3 py-1 rounded-lg border flex items-center gap-2 ${badge.color} w-full md:w-auto justify-center`}>
                              <span className="text-[10px] font-black uppercase tracking-wider">{badge.label}</span>
                          </div>

                          {/* Ações (Só MASTER vê os controles) */}
                          {isMaster ? (
                              <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0 mt-2 md:mt-0">
                                  <select 
                                      className="bg-black border border-zinc-700 text-white text-xs rounded-lg px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer w-full md:w-auto"
                                      value={u.role}
                                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                      disabled={u.id === (user as any)?.id} // Não pode mudar o próprio cargo aqui pra não se trancar fora
                                  >
                                      <option value="usuario">Membro</option>
                                      <option value="treinador">Treinador</option>
                                      <option value="empresa">Empresa</option>
                                      <option value="admin">Admin</option>
                                      <option value="master">Master</option>
                                  </select>
                              </div>
                          ) : (
                              <div className="text-zinc-600 text-xs italic w-full md:w-auto text-center">
                                  Sem permissão
                              </div>
                          )}
                      </div>
                  );
              })}

              {filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                      <div className="bg-zinc-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                          <Filter size={24}/>
                      </div>
                      <p className="text-zinc-500 text-sm font-bold uppercase">Nenhum usuário encontrado</p>
                  </div>
              )}
          </div>
      </main>
    </div>
  );
}