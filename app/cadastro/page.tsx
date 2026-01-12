"use client";

import React, { useState } from "react";
import { ArrowLeft, User, Lock, Mail, Store } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CadastroPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirmPassword) {
        alert("Senhas não conferem!");
        return;
    }
    
    // Casting 'any' para evitar erro de tipagem no User
    const userData: any = { 
        id: "user_mock_id",
        nome: isLogin ? "Usuário Teste" : formData.name, 
        email: formData.email, 
        foto: "https://github.com/shadcn.png", 
        level: 1,
        turma: "T5"
    };

    login(userData);
    router.push("/menu");
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Efeitos de Fundo */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-[2rem] shadow-2xl relative z-10">
            <div className="text-center mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4 group animate-float-slow">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full group-hover:bg-emerald-500/50 transition duration-500"></div>
                    <img src="/logo.png" alt="AAAKN" className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition transform group-hover:scale-110" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{isLogin ? "Bem-vindo de Volta" : "Crie sua Conta"}</h1>
                <p className="text-zinc-400 text-xs font-medium">Faça parte da maior Atlética.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                        <input 
                            type="text" 
                            placeholder="Nome Completo" 
                            // CORREÇÃO: pl-14 garante espaço para o ícone
                            className="input-field pl-14 pr-4 py-4" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})} 
                            required 
                        />
                    </div>
                )}
                
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    <input 
                        type="email" 
                        placeholder="Email Institucional" 
                        className="input-field pl-14 pr-4 py-4" 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        required 
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                    <input 
                        type="password" 
                        placeholder="Senha" 
                        className="input-field pl-14 pr-4 py-4" 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        required 
                    />
                </div>

                {!isLogin && (
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={20} />
                        <input 
                            type="password" 
                            placeholder="Confirmar Senha" 
                            className="input-field pl-14 pr-4 py-4" 
                            value={formData.confirmPassword} 
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})} 
                            required 
                        />
                    </div>
                )}
                
                <button type="submit" className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-emerald-500 transition active:scale-95 flex justify-center items-center gap-2">
                    {isLogin ? "Entrar na Toca" : "Cadastrar Agora"} <ArrowLeft size={18} className="rotate-180"/>
                </button>
            </form>

            <div className="text-center mt-6 space-y-6">
                <button onClick={() => setIsLogin(!isLogin)} className="text-zinc-400 text-xs hover:text-white transition underline underline-offset-4">
                    {isLogin ? "Não tem conta? Cadastre-se" : "Já tem conta? Fazer Login"}
                </button>

                <div className="border-t border-zinc-800 pt-6">
                    <Link href="/empresa/cadastro" className="flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-400 transition uppercase tracking-wide group p-2 hover:bg-zinc-800/50 rounded-lg">
                        <div className="bg-zinc-800 p-2 rounded-full group-hover:bg-emerald-500/20 transition">
                            <Store size={16} className="text-zinc-400 group-hover:text-emerald-500 transition"/>
                        </div>
                        Sou uma Empresa Parceira
                    </Link>
                </div>
            </div>
        </div>

        <style jsx>{`
            .input-field { 
                width: 100%; 
                background-color: rgba(0,0,0,0.4); 
                border: 1px solid #27272a; 
                border-radius: 0.75rem; 
                /* Padding removido daqui e controlado via Tailwind (py-4 pl-14) */
                color: white; 
                outline: none; 
                transition: all 0.3s; 
                font-size: 0.875rem; 
            }
            .input-field:focus { 
                border-color: #10b981; 
                background-color: rgba(0,0,0,0.8); 
            }
            .animate-float-slow {
                animation: float 6s ease-in-out infinite;
            }
            @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `}</style>
    </div>
  );
}