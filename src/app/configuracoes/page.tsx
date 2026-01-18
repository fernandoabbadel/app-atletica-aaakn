"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, Bell, Shield, LogOut, ChevronRight, HelpCircle,
  FileText, Smartphone, Volume2, MessageSquarePlus, Settings,
  Trash2, Lock, Power, PowerOff
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { db, auth } from "../../lib/firebase";
import { doc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
import { deleteUser, signOut } from "firebase/auth";

// Mapeamento de Ícones
const ICON_MAP: Record<string, any> = { 
    User, Shield, Wallet: Smartphone, Bell, Volume2, 
    MessageSquare: MessageSquarePlus, HelpCircle, FileText, 
    Settings, Smartphone, Lock 
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  
  // 🦈 ESTADO DINÂMICO
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Carregar Menu do Firebase
  useEffect(() => {
      const unsub = onSnapshot(doc(db, "app_config", "menu"), (snap) => {
          if (snap.exists()) {
              setSections(snap.data().sections || []);
          }
          setLoading(false);
      });
      return () => unsub();
  }, []);

  // --- AÇÃO 1: ATIVAR / DESATIVAR CONTA (MODO CONVIDADO) ---
  const handleToggleAccount = async () => {
    if (!user) return;
    
    // Verifica se está ativo
    const isActive = user.status === 'ativo';
    
    const confirmMsg = isActive 
        ? "Deseja desativar sua conta temporariamente?\n\nVocê entrará no MODO CONVIDADO (acesso limitado) até reativar."
        : "Deseja reativar sua conta?\n\nSeus acessos e privilégios originais serão restaurados.";

    if (!window.confirm(confirmMsg)) return;

    try {
        setActionLoading(true);
        const userRef = doc(db, "users", user.uid);
        
        if (isActive) {
            // DESATIVAR -> VIRA GUEST
            await updateDoc(userRef, {
                status: 'paused',
                role: 'guest',
                saved_role: user.role
            });
            addToast("Conta pausada. Modo Convidado ativado. 💤", "info");
        } else {
            // REATIVAR -> RESTAURA
            const roleToRestore = user.saved_role || 'user';
            await updateDoc(userRef, {
                status: 'ativo',
                role: roleToRestore,
                saved_role: null
            });
            addToast("Conta reativada! Bem-vindo de volta! 🦈", "success");
        }
    } catch (e) {
        console.error(e);
        addToast("Erro ao atualizar status.", "error");
    } finally {
        setActionLoading(false);
    }
  };

  // --- AÇÃO 2: LOGOUT ---
  const handleLogout = async () => {
    if (window.confirm("Tem certeza que deseja sair?") && logout) {
      await logout();
      router.push("/");
    }
  };

  // --- AÇÃO 3: EXCLUIR CONTA ---
  const handleDeleteAccount = async () => {
    const confirmText = prompt("⚠️ PERIGO: Para excluir sua conta permanentemente, digite DELETAR:");
    if (confirmText !== "DELETAR") return;

    if (!user || !auth.currentUser) return;

    try {
        setActionLoading(true);
        await deleteDoc(doc(db, "users", user.uid));
        await deleteUser(auth.currentUser);
        addToast("Conta excluída. Foi uma honra, tubarão! 🌊", "info");
        router.push("/");
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            addToast("Por segurança, faça login novamente para excluir.", "error");
            await logout?.();
            router.push("/");
        } else {
            addToast("Erro ao excluir conta.", "error");
        }
    } finally {
        setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans selection:bg-emerald-500">
      
      <header className="p-4 sticky top-0 z-30 flex items-center gap-4 border-b border-white/5 bg-[#050505]/90 backdrop-blur-md">
        <Link href="/perfil" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full transition hover:bg-zinc-900">
            <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">Configurações</h1>
      </header>

      <main className="p-4 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        
        {/* CARTÃO DE PERFIL */}
        {user && (
          <div className={`p-4 rounded-2xl border flex items-center gap-4 mb-6 relative overflow-hidden transition-colors ${user.status === 'ativo' ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-900/50 border-yellow-500/30'}`}>
            <div className={`absolute top-0 left-0 w-1 h-full ${user.status === 'ativo' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
            
            <div className="w-14 h-14 rounded-full border-2 border-zinc-700 p-0.5">
                <img src={user.foto || "https://github.com/shadcn.png"} className={`w-full h-full rounded-full object-cover ${user.status !== 'ativo' ? 'grayscale' : ''}`}/>
            </div>
            
            <div className="flex-1 min-w-0">
                <h2 className="font-bold text-lg text-white leading-tight truncate">{user.nome}</h2>
                <p className="text-xs text-zinc-400 font-medium truncate">@{user.apelido || "atleta"}</p>
                {user.status !== 'ativo' && <span className="text-[9px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2 py-0.5 rounded mt-1 inline-block">Modo Convidado</span>}
            </div>
            
            <Link href="/perfil" className="px-4 py-2 bg-black border border-zinc-700 rounded-xl text-[10px] font-bold uppercase text-white hover:border-emerald-500 transition whitespace-nowrap">
                Ver Perfil
            </Link>
          </div>
        )}

        {/* MENU DINÂMICO */}
        {loading ? (
            <div className="text-center text-zinc-500 text-xs py-10">Carregando opções...</div>
        ) : sections.map((section) => (
            <section key={section.id}>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 px-1">{section.title}</h3>
                <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 divide-y divide-zinc-800/50">
                    {section.items.map((item: any) => {
                        if (!item.active) return null;
                        const Icon = ICON_MAP[item.icon] || Settings;
                        return (
                            <Link key={item.id} href={item.path || "#"} className="flex items-center justify-between p-4 hover:bg-zinc-800 transition group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-black rounded-lg text-zinc-400 group-hover:text-white group-hover:bg-zinc-700 transition border border-zinc-800 group-hover:border-zinc-600">
                                        <Icon size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition">{item.label}</span>
                                </div>
                                <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition" />
                            </Link>
                        );
                    })}
                </div>
            </section>
        ))}

        {/* ZONA DE AÇÕES */}
        <div className="space-y-3 pt-4">
            
            <button 
                onClick={handleToggleAccount}
                disabled={actionLoading}
                className={`w-full p-4 rounded-2xl border flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest transition ${user?.status === 'ativo' ? 'bg-zinc-900 border-zinc-800 text-yellow-500 hover:bg-yellow-500/10' : 'bg-emerald-900/20 border-emerald-500/30 text-emerald-500 hover:bg-emerald-900/30'}`}
            >
                {user?.status === 'ativo' ? (
                    <><PowerOff size={16} /> Desativar Conta</>
                ) : (
                    <><Power size={16} /> Reativar Conta</>
                )}
            </button>

            <button 
                onClick={handleLogout} 
                className="w-full bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-center gap-2 text-zinc-300 font-bold uppercase text-xs tracking-widest hover:bg-zinc-800 hover:text-white transition"
            >
                <LogOut size={16} /> Sair da Conta
            </button>

            <button 
                onClick={handleDeleteAccount} 
                disabled={actionLoading}
                className="w-full bg-red-950/20 p-4 rounded-2xl border border-red-900/30 flex items-center justify-center gap-2 text-red-500 font-bold uppercase text-xs tracking-widest hover:bg-red-900/30 transition active:scale-[0.98]"
            >
                {actionLoading ? "Processando..." : <><Trash2 size={16} /> Excluir Conta</>}
            </button>
            
            <p className="text-center text-[10px] text-zinc-600 font-mono">AAAKN App v1.3 • ID: {user?.uid.slice(0,6)}</p>
        </div>

      </main>
    </div>
  );
}