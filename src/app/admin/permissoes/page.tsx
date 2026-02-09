"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Search, Shield, User, Briefcase, 
  Dumbbell, Crown, Lock, Save, CheckSquare, 
  LayoutList, Users, DollarSign, Ghost, Loader2,
  AlertTriangle, Settings, Zap, UserX
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; 
import { useToast } from "@/context/ToastContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { logActivity } from "@/lib/logger"; 
import { APP_PAGES } from "@/lib/appRoutes"; // Usando a lista centralizada
import { isFirebasePermissionError } from "@/lib/firebaseErrors";

// --- 1. DEFINIÇÃO DE CARGOS ---
const ROLES = [
    { id: 'master', label: 'Master', icon: Crown, color: 'text-red-500' },
    
    // Admins Específicos
    { id: 'admin_geral', label: 'Admin Geral', icon: Shield, color: 'text-emerald-500' },
    { id: 'admin_gestor', label: 'Gestor', icon: Settings, color: 'text-blue-500' },
    { id: 'admin_treino', label: 'Adm Treino', icon: Zap, color: 'text-orange-600' },
    
    // Operacional
    { id: 'vendas', label: 'Vendas', icon: DollarSign, color: 'text-yellow-400' },
    { id: 'treinador', label: 'Coach', icon: Dumbbell, color: 'text-orange-500' },
    { id: 'empresa', label: 'Empresa', icon: Briefcase, color: 'text-cyan-400' },
    
    // Base
    { id: 'user', label: 'Membro', icon: User, color: 'text-zinc-400' },
    { id: 'guest', label: 'Visitante', icon: Ghost, color: 'text-zinc-600' },
    
    // Inativos
    { id: 'inactive', label: 'Inativo', icon: UserX, color: 'text-zinc-700' }
];

interface UserData {
    id: string;
    nome: string;
    email: string;
    foto?: string;
    role?: string;
}

export default function AdminPermissoesPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'users' | 'matrix'>('matrix');
  const [loading, setLoading] = useState(true);
  const [usersList, setUsersList] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, string[]>>({});
  const [savingMatrix, setSavingMatrix] = useState(false);

  const isMaster = checkPermission(["master"]);

  useEffect(() => {
      if (!isMaster && !loading) {
          router.push('/dashboard');
          return;
      }

      const fetchData = async () => {
          try {
              const snapUsers = await getDocs(collection(db, "users"));
              setUsersList(snapUsers.docs.map(d => ({ id: d.id, ...d.data() } as UserData)));

              const docRef = doc(db, "settings", "permissions");
              const docSnap = await getDoc(docRef);
              
              if (docSnap.exists()) {
                  setPermissionMatrix(docSnap.data() as Record<string, string[]>);
              } else {
                  const defaultMatrix: Record<string, string[]> = {};
                  APP_PAGES.forEach(p => defaultMatrix[p.path] = ['master']);
                  setPermissionMatrix(defaultMatrix);
              }

          } catch (error: unknown) {
              if (isFirebasePermissionError(error)) {
                  addToast("Sem permissão para abrir o painel de permissões.", "error");
                  router.push("/sem-permissao");
                  return;
              }
              console.error(error);
              addToast("Deu ruim ao carregar os dados do cardume!", "error");
          } finally {
              setLoading(false);
          }
      };

      if (isMaster) fetchData();
  }, [isMaster, loading, router, addToast]);

  const handleUpdateRole = async (targetUserId: string, newRole: string) => {
      try {
          const adminName = typeof user?.displayName === "string" ? user.displayName : "Admin Master";
          await updateDoc(doc(db, "users", targetUserId), { role: newRole });
          setUsersList(prev => prev.map(u => u.id === targetUserId ? { ...u, role: newRole } : u));
          
          await logActivity(
            user?.uid || 'sistema',
            adminName,
            "UPDATE",
            "Permissões - Usuários",
            `Alterou cargo do usuário ${targetUserId} para ${newRole}`
          );
          
          addToast(`Cargo atualizado para ${newRole.toUpperCase()}! 🦈`, "success");
      } catch (error: unknown) {
          if (isFirebasePermissionError(error)) {
              addToast("Sem permissão para alterar cargo.", "error");
              return;
          }
          console.error(error);
          addToast("Erro ao trocar a patente do peixe.", "error");
      }
  };

  const filteredUsers = usersList.filter(u => 
      (u.nome || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePermission = (path: string, roleId: string) => {
      setPermissionMatrix(prev => {
          const currentRoles = prev[path] || [];
          const hasAccess = currentRoles.includes(roleId);
          let newRoles;
          if (hasAccess) newRoles = currentRoles.filter(r => r !== roleId);
          else newRoles = [...currentRoles, roleId];
          return { ...prev, [path]: newRoles };
      });
  };

  const saveMatrix = async () => {
      setSavingMatrix(true);
      try {
          const adminName = typeof user?.displayName === "string" ? user.displayName : "Admin Master";
          await setDoc(doc(db, "settings", "permissions"), permissionMatrix);
          
          await logActivity(
            user?.uid || 'sistema',
            adminName,
            "UPDATE",
            "Permissões - Matriz",
            "Atualizou a Matriz de Acesso Global"
          );
          
          addToast("As leis do oceano foram atualizadas! 🦈", "success");
      } catch (error: unknown) {
          if (isFirebasePermissionError(error)) {
              addToast("Sem permissão para salvar a matriz.", "error");
              return;
          }
          console.error(error);
          addToast("Erro ao salvar as regras.", "error");
      } finally {
          setSavingMatrix(false);
      }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500 w-10 h-10"/></div>;
  if (!isMaster) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans">
      
      <header className="p-6 border-b border-zinc-800 bg-[#09090b]/95 backdrop-blur sticky top-0 z-30 flex justify-between items-center">
          <div className="flex items-center gap-4">
              <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20}/></Link>
              <div>
                  <h1 className="text-xl font-black uppercase flex items-center gap-2"><Shield className="text-red-600"/> Controle de Acesso</h1>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Área Restrita do Master</p>
              </div>
          </div>
      </header>

      <div className="p-6 max-w-[95vw] mx-auto overflow-hidden">
          
          <div className="flex justify-center mb-8">
              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                  <button onClick={() => setActiveTab('matrix')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase transition ${activeTab === 'matrix' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><LayoutList size={14}/> Matriz de Acesso</button>
                  <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase transition ${activeTab === 'users' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}><Users size={14}/> Gerenciar Usuários</button>
              </div>
          </div>

          {activeTab === 'matrix' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="text-yellow-500 shrink-0" size={20}/>
                      <div>
                          <h3 className="text-sm font-bold text-yellow-500 uppercase">Atenção, Master!</h3>
                          <p className="text-xs text-zinc-400 mt-1">
                              Esta matriz controla quem pode ver o quê. <b>Lembre-se de liberar a rota &apos;/configuracoes&apos; para o cargo &apos;Inativo&apos;!</b>
                          </p>
                      </div>
                  </div>

                  <div className="overflow-auto max-h-[70vh] rounded-xl border border-zinc-800 shadow-2xl bg-[#0a0a0a] relative">
                      <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-900 sticky top-0 z-40 shadow-md">
                              <tr>
                                  <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-wider sticky left-0 top-0 z-50 bg-zinc-900 min-w-[220px] shadow-[2px_0_5px_rgba(0,0,0,0.5)] border-b border-zinc-800">
                                      Página / Rota
                                  </th>
                                  {ROLES.map(role => (
                                      <th key={role.id} className="p-4 min-w-[90px] text-center bg-zinc-900/95 backdrop-blur border-l border-zinc-800/50 sticky top-0 z-40 border-b border-zinc-800">
                                          <div className="flex flex-col items-center gap-1.5">
                                              <div className={`p-2 rounded-full bg-black/50 ${role.color}`}>
                                                  <role.icon size={16}/>
                                              </div>
                                              <span className={`text-[9px] font-black uppercase ${role.color}`}>{role.label}</span>
                                          </div>
                                      </th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody className="bg-black">
                              {APP_PAGES.map((page, idx) => {
                                  const isAdmin = page.path.startsWith('/admin');
                                  const prevPage = idx > 0 ? APP_PAGES[idx - 1] : null;
                                  const prevIsAdmin = prevPage ? prevPage.path.startsWith('/admin') : isAdmin;
                                  const showSeparator = prevPage && isAdmin !== prevIsAdmin;

                                  return (
                                      <React.Fragment key={page.path}>
                                          {showSeparator && (
                                              <tr>
                                                  <td colSpan={ROLES.length + 1} className="h-4 bg-zinc-900/50 border-y border-zinc-800"></td>
                                              </tr>
                                          )}

                                          <tr className={`group hover:bg-zinc-900/30 transition ${idx !== APP_PAGES.length -1 ? 'border-b border-zinc-800/50' : ''} ${isAdmin ? 'bg-red-950/5 hover:bg-red-900/10' : ''}`}>
                                              <td className={`p-4 text-xs font-bold text-white sticky left-0 z-30 group-hover:bg-zinc-900 transition border-r border-zinc-800 shadow-[2px_0_5px_rgba(0,0,0,0.5)] ${isAdmin ? 'bg-[#0f0505]' : 'bg-black'}`}>
                                                  <div className="flex flex-col">
                                                      <span className={`text-sm flex items-center gap-2 ${isAdmin ? 'text-red-200' : 'text-zinc-200'}`}>
                                                        {page.label}
                                                      </span>
                                                      <span className="text-[10px] text-zinc-600 font-mono mt-0.5">{page.path}</span>
                                                  </div>
                                              </td>
                                              {ROLES.map(role => {
                                                  const isAllowed = (permissionMatrix[page.path] || []).includes(role.id) || role.id === 'master';
                                                  return (
                                                      <td key={`${page.path}-${role.id}`} className="p-4 text-center border-l border-zinc-800/30">
                                                          <button 
                                                              onClick={() => togglePermission(page.path, role.id)}
                                                              disabled={role.id === 'master'}
                                                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${isAllowed ? 'bg-emerald-500 text-black shadow-lg scale-100' : 'bg-zinc-900 text-zinc-700 border border-zinc-800 scale-90 grayscale'} ${role.id === 'master' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                                                          >
                                                              {isAllowed ? <CheckSquare size={16} strokeWidth={3}/> : <Lock size={14}/>}
                                                          </button>
                                                      </td>
                                                  );
                                              })}
                                          </tr>
                                      </React.Fragment>
                                  );
                              })}
                          </tbody>
                      </table>
                  </div>

                  <div className="fixed bottom-6 right-6 z-50">
                      <button 
                          onClick={saveMatrix} 
                          disabled={savingMatrix}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-8 rounded-full flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 border-4 border-[#050505]"
                      >
                          {savingMatrix ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                          SALVAR ALTERAÇÕES
                      </button>
                  </div>
              </div>
          )}

          {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in">
                  <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center gap-2 sticky top-24 z-20 shadow-lg">
                      <Search className="text-zinc-500" size={18}/>
                      <input 
                          type="text" 
                          placeholder="Buscar usuário por nome ou email..." 
                          className="bg-transparent outline-none text-sm text-white w-full placeholder:text-zinc-600"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                      />
                  </div>

                  <div className="grid gap-3 pb-20">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map(u => (
                          <div key={u.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 group hover:border-zinc-700 transition">
                              <div className="flex items-center gap-4 w-full md:w-auto">
                                  <div className="w-12 h-12 rounded-full border-2 border-zinc-800 overflow-hidden relative">
                                    <Image src={u.foto || "https://github.com/shadcn.png"} alt="User" fill className="object-cover" unoptimized/>
                                  </div>
                                  <div>
                                      <p className="font-bold text-sm text-white flex items-center gap-2">
                                          {u.nome || "Sem Nome"}
                                          {u.id === user?.uid && <span className="text-[9px] bg-emerald-500/20 text-emerald-500 px-2 rounded-full border border-emerald-500/30">VOCÊ</span>}
                                      </p>
                                      <p className="text-xs text-zinc-500">{u.email}</p>
                                  </div>
                              </div>

                              <div className="flex items-center gap-3 w-full md:w-auto bg-black p-1.5 rounded-lg border border-zinc-800">
                                  <label className="text-[10px] text-zinc-500 uppercase font-bold pl-2">Cargo:</label>
                                  <select 
                                      value={u.role || 'guest'} 
                                      onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                                      className="bg-zinc-900 text-white text-xs rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer uppercase font-bold w-full md:w-40 border border-zinc-700"
                                      disabled={u.id === user?.uid}
                                  >
                                      {ROLES.map(role => (
                                          <option key={role.id} value={role.id}>{role.label}</option>
                                      ))}
                                  </select>
                              </div>
                          </div>
                        ))
                      ) : (
                          <div className="text-center py-12 text-zinc-500">
                              <Ghost size={40} className="mx-auto mb-3 opacity-20"/>
                              <p className="text-sm">Nenhum tubarão encontrado.</p>
                          </div>
                      )}
                  </div>
              </div>
          )}

      </div>
    </div>
  );
}
