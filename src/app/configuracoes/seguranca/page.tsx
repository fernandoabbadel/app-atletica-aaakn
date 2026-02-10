"use client";

import React, { useState } from "react";
import { ArrowLeft, Lock, Key } from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import {
  getAuth,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
} from "firebase/auth";
import { app } from "../../../lib/firebase";

export default function SecurityPage() {
  const { addToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [saving, setSaving] = useState(false);

  const handleUpdatePassword = async () => {
    if (saving) return;

    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      addToast("Voce precisa estar logado para alterar a senha.", "error");
      return;
    }

    if (!user.email) {
      addToast("Sua conta nao tem e-mail. Troca de senha por aqui nao e suportada.", "error");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      addToast("Preencha todos os campos.", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("Senha nova muito curta (minimo 6 caracteres).", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      addToast("A confirmacao da senha nao confere.", "error");
      return;
    }

    if (newPassword === currentPassword) {
      addToast("A senha nova deve ser diferente da atual.", "info");
      return;
    }

    setSaving(true);

    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      addToast("Senha atualizada com sucesso!", "success");
    } catch (error: unknown) {
      console.error("Erro ao mudar senha:", error);
      const err = error as { code?: string; message?: string };
      const msg = String(err.code || err.message || "");

      if (msg.includes("auth/wrong-password")) {
        addToast("A senha atual esta incorreta.", "error");
      } else if (msg.includes("auth/too-many-requests")) {
        addToast("Muitas tentativas. Aguarde um pouco.", "error");
      } else if (msg.includes("auth/requires-recent-login")) {
        addToast("Por seguranca, faca login novamente antes de trocar a senha.", "error");
      } else {
        addToast("Falha ao atualizar senha. Tente novamente.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-10 border-b border-zinc-900">
        <Link href="/configuracoes" className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-900 transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter">Seguranca</h1>
      </header>

      <main className="p-6 max-w-md mx-auto space-y-6">
        <div className="space-y-4">
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

              <div className="w-full h-px bg-zinc-800 my-2" />

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
              className={`w-full mt-4 font-black py-3 rounded-lg text-xs uppercase tracking-widest transition flex items-center justify-center gap-2 ${
                saving
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
              }`}
            >
              {saving ? "Processando..." : "Atualizar Senha"}
            </button>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 opacity-60">
            <h3 className="font-bold text-zinc-400 mb-2 flex items-center gap-2">
              <Lock size={18} /> Autenticacao em Dois Fatores
            </h3>
            <p className="text-xs text-zinc-500">
              Recurso de seguranca avancada em breve disponivel para todos os socios.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

