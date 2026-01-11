"use client";

import React, { useState } from "react";
import { ArrowLeft, Shield, Check, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

// Mock de Admins atuais
const ADMINS_MOCK = [
  { id: 1, nome: "Dudu", handle: "@dudu_med", role: "admin_treino" },
  { id: 2, nome: "Carol", handle: "@carol_dir", role: "admin_geral" },
];

export default function AdminPermissoesPage() {
  const { user, checkPermission } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [admins, setAdmins] = useState(ADMINS_MOCK);

  // Proteção Extra: Se entrar pela URL e não for gestor, chuta fora
  if (user && !checkPermission(["admin_gestor", "master"])) {
      router.push("/admin");
      return null;
  }

  const removeAdmin = (id: number) => {
      setAdmins(prev => prev.filter(a => a.id !== id));
      addToast("Privilégios removidos com sucesso.", "success");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-6 sticky top-0 z-30 bg-red-950/90 backdrop-blur-md border-b border-red-900/30 flex items-center gap-3">
        <Link href="/admin" className="bg-black/20 p-2 rounded-full hover:bg-black/40 transition"><ArrowLeft size={20} className="text-white" /></Link>
        <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gerenciar Admins</h1>
      </header>

      <main className="p-6 space-y-8">
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
            <ShieldCheck size={24} className="text-red-500 shrink-0" />
            <div>
                <h3 className="font-bold text-red-500 text-sm">Área Sensível</h3>
                <p className="text-red-200/60 text-xs mt-1">Você está editando quem tem poder sobre o aplicativo. Cuidado.</p>
            </div>
        </div>

        <div>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Admins Ativos</h2>
            <div className="space-y-3">
                {admins.map(admin => (
                    <div key={admin.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center">
                        <div>
                            <p className="font-bold text-white text-sm">{admin.nome}</p>
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{admin.role.replace("_", " ")}</p>
                        </div>
                        <button onClick={() => removeAdmin(admin.id)} className="text-xs text-red-500 font-bold hover:underline">Remover</button>
                    </div>
                ))}
            </div>
        </div>

        <button className="w-full py-4 rounded-xl border border-dashed border-zinc-700 text-zinc-500 text-sm font-bold hover:border-emerald-500 hover:text-emerald-500 transition">
            + Adicionar Novo Admin
        </button>
      </main>
    </div>
  );
}