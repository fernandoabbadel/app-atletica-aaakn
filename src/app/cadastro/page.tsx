"use client";

import React, { useState, useEffect } from "react";
import { User, Hash, Instagram, FileText, Phone, Save, Loader2, ShieldAlert, Eye, EyeOff, CheckCircle2 } from "lucide-react";
// 🦈 CORREÇÃO DE ROTA: Saindo de 'cadastro', saindo de 'app', entrando em 'context'
import { useAuth } from "../../context/AuthContext"; 
import { useRouter } from "next/navigation";
import Image from "next/image";

// 🦈 Configuração das Turmas (Agora COMPLETA)
const TURMAS = [
  { id: "T1", nome: "Turma I - Jacaré", img: "/turma1.jpeg" },
  { id: "T2", nome: "Turma II - Cavalo Marinho", img: "/turma2.jpeg" },
  { id: "T3", nome: "Turma III - Tartaruga", img: "/turma3.jpeg" },
  { id: "T4", nome: "Turma IV - Baleia", img: "/turma4.jpeg" },
  { id: "T5", nome: "Turma V - Pinguim", img: "/turma5.jpeg" }, 
  { id: "T6", nome: "Turma VI - Lagosta", img: "/turma6.jpeg" },
  { id: "T7", nome: "Turma VII - Urso Polar", img: "/turma7.jpeg" },
  { id: "T8", nome: "Turma VIII - Calouro", img: "/turma8.jpeg" },
  { id: "T9", nome: "Turma IX", img: "/turma9.jpeg" },
];

export default function CadastroPage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Estado do Formulário
  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    turma: "",
    instagram: "",
    telefone: "",
    whatsappPublico: true,
    bio: ""
  });

  // Carregar dados se já existirem (Edição)
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || "",
        matricula: user.matricula || "",
        turma: user.turma || "",
        instagram: user.instagram || "",
        telefone: user.telefone || "",
        whatsappPublico: user.whatsappPublico ?? true,
        bio: user.bio || ""
      });
    }
  }, [user]);

  // 🛡️ MÁSCARA DE TELEFONE
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); 
    if (value.length > 11) value = value.slice(0, 11); 
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 9)}-${value.slice(9)}`;
    setFormData({ ...formData, telefone: value });
  };

  // 🛡️ VALIDAÇÃO E ENVIO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.nome.trim().length < 3) return setError("Nome de guerra muito curto!");
    if (!formData.turma) return setError("Selecione seu Cardume (Turma)!");
    if (formData.telefone.length < 14) return setError("Telefone inválido.");
    if (formData.matricula.length < 5) return setError("Matrícula suspeita.");
    
    setLoading(true);

    try {
      const cleanInsta = formData.instagram.replace("@", "").trim();

      await updateUser({
        nome: formData.nome.trim(),
        matricula: formData.matricula.trim(),
        turma: formData.turma,
        instagram: `@${cleanInsta}`,
        telefone: formData.telefone,
        whatsappPublico: formData.whatsappPublico,
        bio: formData.bio.trim(),
        role: user?.role === 'guest' ? 'user' : user?.role 
      });

      router.push("/dashboard");

    } catch (error) {
      console.error("Erro no cadastro:", error);
      setError("Erro ao salvar no QG.");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !user) { router.push("/"); return null; }

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-y-auto overflow-x-hidden">
        
        {/* LOGO GIGANTE FLUTUANTE (FUNDO) */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none opacity-5 z-0 animate-pulse-slow">
            <Image src="/logo.png" alt="Logo Fundo" fill className="object-contain" />
        </div>

        {/* Efeitos de Luz */}
        <div className="fixed top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="fixed bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-2xl bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-6 md:p-10 rounded-[2rem] shadow-2xl relative z-10 my-10 animate-in fade-in zoom-in-95 duration-500">
            
            {/* CABEÇALHO */}
            <div className="text-center mb-8">
                <div className="relative w-28 h-28 mx-auto mb-4 group">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full group-hover:bg-emerald-500/40 transition duration-500"></div>
                    <img 
                        src={user?.foto || "https://github.com/shadcn.png"} 
                        alt="Avatar" 
                        className="w-full h-full object-cover rounded-full border-4 border-[#09090b] relative z-10 shadow-xl" 
                    />
                </div>
                
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                    Ficha do <span className="text-emerald-500">Tubarão</span>
                </h1>
                <p className="text-zinc-400 text-sm font-medium mt-1">
                    Complete seus dados para nadar com a elite.
                </p>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl flex items-center gap-3 text-sm font-bold animate-pulse">
                    <ShieldAlert size={18} />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. DADOS PESSOAIS */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 border-b border-zinc-800 w-full block pb-2">Dados de Combate</label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition" size={18} />
                            <input type="text" placeholder="Nome Completo" className="input-field pl-12" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} maxLength={60} required />
                        </div>

                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition" size={18} />
                            <input type="text" placeholder="Nº Matrícula" className="input-field pl-12" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value.replace(/\D/g, "").slice(0, 20)})} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* TELEFONE COM TOGGLE */}
                        <div className="relative group flex gap-2">
                            <div className="relative flex-1">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition" size={18} />
                                <input type="tel" placeholder="(XX) 99999-9999" className="input-field pl-12" value={formData.telefone} onChange={handlePhoneChange} required />
                            </div>
                            
                            {/* Botão do Olhinho (Whatsapp Público) */}
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, whatsappPublico: !formData.whatsappPublico})}
                                className={`w-14 rounded-xl border flex items-center justify-center transition-all ${
                                    formData.whatsappPublico 
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" 
                                    : "bg-zinc-800 border-zinc-700 text-zinc-500"
                                }`}
                                title={formData.whatsappPublico ? "Visível para todos" : "Oculto no perfil"}
                            >
                                {formData.whatsappPublico ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>

                        <div className="relative group">
                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition" size={18} />
                            <input type="text" placeholder="@seu.insta" className="input-field pl-12" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value.slice(0, 30)})} maxLength={30} />
                        </div>
                    </div>
                </div>

                {/* 2. LISTA DE TURMAS */}
                <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 border-b border-zinc-800 w-full block pb-2">Selecione seu Cardume</label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {TURMAS.map((t) => (
                            <div 
                                key={t.id}
                                onClick={() => setFormData({...formData, turma: t.id})}
                                className={`cursor-pointer rounded-xl border p-4 flex items-center justify-between transition-all duration-300 ${
                                    formData.turma === t.id 
                                    ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/50 translate-x-1" 
                                    : "bg-black/40 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-800/50"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                                        <Image 
                                            src={t.img} 
                                            alt={t.nome} 
                                            fill 
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-zinc-600 z-[-1]">
                                            {t.id}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-bold uppercase ${formData.turma === t.id ? "text-emerald-400" : "text-zinc-400"}`}>
                                        {t.nome}
                                    </span>
                                </div>
                                {formData.turma === t.id && <CheckCircle2 className="text-emerald-500 animate-in zoom-in" size={20} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. BIO */}
                <div className="space-y-2 pt-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 border-b border-zinc-800 w-full block pb-2">Grito de Guerra</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 text-zinc-500 group-focus-within:text-emerald-500 transition" size={18} />
                        <textarea placeholder="Uma frase que define você..." className="input-field pl-12 min-h-[80px] resize-none py-3" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} maxLength={100} />
                        <span className="absolute right-4 bottom-2 text-[10px] text-zinc-600 font-mono">{formData.bio.length}/100</span>
                    </div>
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-emerald-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 mt-6">
                    {loading ? <Loader2 className="animate-spin"/> : <Save size={20} />}
                    {loading ? "Salvando Dados..." : "Confirmar e Entrar"}
                </button>

            </form>
        </div>

        <style jsx>{`
            .input-field { width: 100%; background-color: rgba(9, 9, 11, 0.6); border: 1px solid #27272a; border-radius: 0.75rem; color: white; outline: none; transition: all 0.3s; font-size: 0.875rem; height: 3.5rem; }
            .input-field:focus { border-color: #10b981; background-color: rgba(0,0,0,0.8); box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1); }
            textarea.input-field { height: auto; }
            .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 4px; }
        `}</style>
    </div>
  );
}