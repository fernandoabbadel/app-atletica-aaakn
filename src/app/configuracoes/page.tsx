"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft, User, Bell, Shield, LogOut, ChevronRight, HelpCircle,
  FileText, Smartphone, Volume2, MessageSquarePlus, Settings,
  Trash2, Lock, Power, PowerOff, AlertTriangle, Loader2 // <--- Loader2 Adicionado
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { db, auth } from "../../lib/firebase";
import { doc, onSnapshot, updateDoc, deleteField } from "firebase/firestore"; // <--- deleteField Adicionado
import { deleteUser } from "firebase/auth";
import { logActivity } from "../../lib/logger";

const ICON_MAP: Record<string, any> = { 
    User, Shield, Wallet: Smartphone, Bell, Volume2, 
    MessageSquare: MessageSquarePlus, HelpCircle, FileText, 
    Settings, Smartphone, Lock 
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
      const unsub = onSnapshot(doc(db, "app_config", "menu"), (snap) => {
          if (snap.exists()) {
              setSections(snap.data().sections || []);
          }
          setLoading(false);
      });
      return () => unsub();
  }, []);

  // --- AÇÃO 1: DESATIVAR (Pausar) ---
  const handleToggleAccount = async () => {
    if (!user) return;
    const isActive = user.status === 'ativo';
    const confirmMsg = isActive 
        ? "⏸️ PAUSAR CONTA?\n\nVocê ficará como 'Convidado'. Seus dados, XP e histórico serão mantidos, mas você perderá acesso a descontos e áreas exclusivas até reativar."
        : "▶️ REATIVAR CONTA?\n\nSeus privilégios originais serão restaurados imediatamente.";

    if (!window.confirm(confirmMsg)) return;

    try {
        setActionLoading(true);
        const userRef = doc(db, "users", user.uid);
        
        if (isActive) {
            await updateDoc(userRef, {
                status: 'paused',
                role: 'guest',
                saved_role: user.role, // Salva o cargo para restaurar depois
                updatedAt: new Date()
            });
            await logActivity(user.uid, user.nome, "UPDATE", "Configurações", "Pausou a conta");
            addToast("Conta pausada. Modo Convidado ativado. 💤", "info");
        } else {
            const roleToRestore = user.saved_role || 'user';
            await updateDoc(userRef, {
                status: 'ativo',
                role: roleToRestore,
                saved_role: null,
                updatedAt: new Date()
            });
            await logActivity(user.uid, user.nome, "UPDATE", "Configurações", "Reativou a conta");
            addToast("Conta reativada! Bem-vindo de volta! 🦈", "success");
        }
    } catch (e) {
        addToast("Erro ao atualizar status.", "error");
    } finally {
        setActionLoading(false);
    }
  };

  // --- AÇÃO 2: LOGOUT ---
  const handleLogout = async () => {
    if (window.confirm("Sair do aplicativo?")) {
      await logout();
      router.push("/");
    }
  };

  // --- AÇÃO 3: EXCLUIR CONTA (Soft Delete + Anonimização) ---
  const handleDeleteAccount = async () => {
    const confirmText = prompt("🚨 ATENÇÃO: EXCLUSÃO DEFINITIVA\n\nEssa ação é irreversível. Seus dados pessoais serão apagados, mas seus comentários e histórico financeiro permanecerão como 'Usuário Excluído' para auditoria.\n\nPara confirmar, digite DELETAR:");
    
    if (confirmText !== "DELETAR") return addToast("Ação cancelada.", "info");
    if (!user || !auth.currentUser) return;

    try {
        setActionLoading(true);

        // 1. Soft Delete no Firestore (Anonimização)
        await updateDoc(doc(db, "users", user.uid), {
            nome: "Usuário Excluído",
            email: "excluido@aaakn.com",
            foto: "https://github.com/shadcn.png", // Avatar padrão
            status: "deleted",
            role: "banned",
            turma: "N/A",
            deletedAt: new Date(),
            // Removemos dados sensíveis usando deleteField()
            cpf: deleteField(), 
            telefone: deleteField()
        });

        await logActivity(user.uid, "Ex-Usuário", "DELETE", "Conta", "Excluiu a própria conta (Soft Delete)");

        // 2. Exclusão no Auth (Impede login futuro)
        await deleteUser(auth.currentUser);

        addToast("Sua conta foi excluída. Até logo! 👋", "info");
        router.push("/");
        
    } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
            addToast("Por segurança, faça login novamente para excluir.", "error");
            await logout?.();
            router.push("/login");
        } else {
            console.error(error);
            addToast("Erro ao excluir. Tente novamente.", "error");
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

        {/* ZONA DE PERIGO */}
        <div className="space-y-3 pt-4 border-t border-zinc-900 mt-6">
            <h3 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.2em] mb-2 px-1 flex items-center gap-2"><AlertTriangle size={10}/> Zona de Risco</h3>
            
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
                className="w-full bg-red-950/10 p-4 rounded-2xl border border-red-900/20 flex items-center justify-center gap-2 text-red-500/70 font-bold uppercase text-xs tracking-widest hover:bg-red-900/20 hover:text-red-500 transition active:scale-[0.98]"
            >
                {actionLoading ? <Loader2 className="animate-spin" size={16}/> : <><Trash2 size={16} /> Excluir Permanentemente</>}
            </button>
            
            <p className="text-center text-[10px] text-zinc-700 font-mono pt-2">AAAKN App v1.4 • ID: {user?.uid.slice(0,6)}</p>
        </div>

      </main>
    </div>
  );
}