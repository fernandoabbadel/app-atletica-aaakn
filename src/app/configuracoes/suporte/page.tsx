"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, Key } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { app } from "../../../lib/firebase";

export default function SecurityPage() {
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [saving, setSaving] = useState(false);

  // 🦈 Monitora Auth State para evitar crash se der F5
  useEffect(() => {
    const auth = getAuth(app);
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        // Se deslogar, o middleware ou o contexto geralmente cuidam do redirect
        // Mas deixamos o listener ativo para garantir integridade
      }
    });
    return () => unsub();
  }, []);

  const handleUpdatePassword = async () => {
    if (saving) return;

    const auth = getAuth(app);
    const user = auth.currentUser;

    // Travas de Segurança Básicas
    if (!user) {
      addToast("Você precisa estar logado para alterar a senha.", "error");
      return;
    }

    if (!user.email) {
      addToast("Sua conta não tem e-mail. Troca de senha por aqui não é suportada.", "error");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      addToast("Preencha todos os campos.", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Senha nova muito curta (mínimo 6 caracteres).", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      addToast("A confirmação da senha não confere.", "error");
      return;
    }

    if (newPassword === currentPassword) {
      addToast("A senha nova deve ser diferente da atual.", "info");
      return;
    }

    setSaving(true);

    try {
      // 1. Reautenticação Obrigatória (Segurança do Firebase)
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);

      // 2. Atualização
      await updatePassword(user, newPassword);

      // 3. Limpeza e Sucesso
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      addToast("Senha atualizada com sucesso! 🔒", "success");
    } catch (error: unknown) {
      console.error("Erro ao mudar senha:", error);
      
      // 🦈 Tratamento seguro de erro sem 'any'
      const err = error as { code?: string; message?: string };
      const msg = String(err?.code || err?.message || "");
      
      if (msg.includes("auth/wrong-password")) {
        addToast("A senha atual está incorreta.", "error");
      } else if (msg.includes("auth/too-many-requests")) {
        addToast("Muitas tentativas. Aguarde um pouco.", "error");
      } else if (msg.includes("auth/requires-recent-login")) {
        addToast("Por segurança, faça login novamente antes de trocar a senha.", "error");
      } else {
        addToast("Falha ao atualizar senha. Tente novamente.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <Link href="/configuracoes" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter">Segurança</h1>
      </header>

      {/* CONTEÚDO */}
      <main className="p-6 max-w-md mx-auto space-y-6">
        <div className="space-y-4">
          
          {/* CARD ALTERAR SENHA */}
          <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Key size={18} className="text-emerald-500" /> Alterar Senha
            </h3>

            <div className="space-y-3">
                <input
                  type="password"
                  placeholder="Senha Atual"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition placeholder:text-zinc-600"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  maxLength={128}
                  autoComplete="current-password"
                />
                
                <div className="w-full h-px bg-zinc-800 my-2"></div>

                <input
                  type="password"
                  placeholder="Nova Senha"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition placeholder:text-zinc-600"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  maxLength={128}
                  autoComplete="new-password"
                />
                <input
                  type="password"
                  placeholder="Confirmar Nova Senha"
                  className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-sm text-white focus:border-emerald-500 outline-none transition placeholder:text-zinc-600"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  maxLength={128}
                  autoComplete="new-password"
                />
            </div>

            <button
              onClick={handleUpdatePassword}
              disabled={saving}
              className={`w-full mt-4 font-black py-3 rounded-lg text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 ${saving ? "bg-zinc-700 text-zinc-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"}`}
            >
              {saving ? "Processando..." : "Atualizar Senha"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}