"use client";

import React, { useState } from "react";
import { Loader2, Store, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function EmpresaLoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Busca a empresa pelo email
      const q = query(collection(db, "parceiros"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        addToast("Empresa não encontrada.", "error");
        setLoading(false);
        return;
      }

      // 2. Valida a senha (Simples para o MVP)
      const docSnapshot = querySnapshot.docs[0];
      const docData = docSnapshot.data();
      const empresaId = docSnapshot.id;

      if (docData.senha !== senha) {
          addToast("Senha incorreta.", "error");
          setLoading(false);
          return;
      }

      // 3. Verifica Status
      if (docData.status === 'pending') {
          addToast("Seu cadastro ainda está em análise.", "info");
          setLoading(false);
          return;
      }
      if (docData.status === 'disabled') {
          addToast("Acesso desativado. Contate a Atlética.", "error");
          setLoading(false);
          return;
      }

      // 4. Sucesso -> Redireciona para a rota dinâmica
      addToast(`Bem-vindo, ${docData.nome}!`, "success");
      router.push(`/empresa/${empresaId}`);

    } catch (error) {
      console.error(error);
      addToast("Erro ao conectar ao servidor.", "error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans text-white">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        
        <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-[2rem] shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                   <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full group-hover:bg-emerald-500/50 transition duration-500"></div>
                   <img src="/logo.png" alt="AAAKN" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Portal Parceiro</h1>
                <p className="text-zinc-400 text-xs font-medium">Área restrita para empresas conveniadas.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
                    <input 
                      type="email" 
                      placeholder="Email Corporativo" 
                      className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18}/>
                    <input 
                      type="password" 
                      placeholder="Senha" 
                      className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 pl-12 text-white outline-none focus:border-emerald-500 transition"
                      value={senha}
                      onChange={e => setSenha(e.target.value)}
                      required
                    />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-emerald-500 transition active:scale-95 flex justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin"/> : "Acessar Painel"}
                </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-zinc-800">
                <p className="text-xs text-zinc-500 mb-2">Quer ser um parceiro?</p>
                <Link href="/empresa/cadastro" className="text-emerald-400 font-bold text-sm hover:underline uppercase tracking-wide">Cadastre sua Empresa</Link>
            </div>
        </div>
    </div>
  );
}