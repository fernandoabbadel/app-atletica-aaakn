"use client";

import React, { useState } from "react";
import { 
  User, Mail, Phone, Lock, GraduationCap, 
  IdCard, ArrowLeft, Loader2, AlertCircle, 
  CheckCircle2, ShieldCheck, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

// --- TIPOS ---
type FormData = {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
  telefone: string;
  curso: string;
  turma: string;
  matricula: string;
};

// --- DADOS DAS TURMAS (MOCK) ---
const TURMAS = [
    { id: "T1", nome: "Turma I", logo: "/turma1.jpeg" },
    { id: "T2", nome: "Turma II", logo: "/turma2.jpeg" },
    { id: "T3", nome: "Turma III", logo: "/turma3.jpeg" },
    { id: "T4", nome: "Turma IV", logo: "/turma4.jpeg" },
    { id: "T5", nome: "Turma V", logo: "/turma5.jpeg" },
    { id: "T6", nome: "Turma VI", logo: "/turma6.jpeg" },
    { id: "T7", nome: "Turma VII", logo: "/turma7.jpeg" },
    { id: "T8", nome: "Turma VIII", logo: "/turma8.jpeg" },
    { id: "T9", nome: "Turma IX", logo: "/turma9.jpeg" },
];

// --- ETAPAS ---
const STEPS = [
  { id: 1, title: "Acesso", icon: <Lock size={18}/> },
  { id: 2, title: "Pessoal", icon: <User size={18}/> },
  { id: 3, title: "Acadêmico", icon: <GraduationCap size={18}/> },
];

export default function CadastroPage() {
  const { addToast } = useToast();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    nome: "", email: "", senha: "", confirmarSenha: "",
    telefone: "", curso: "Medicina", turma: "", matricula: ""
  });

  // --- VALIDAÇÕES POR ETAPA ---
  const validateStep = (step: number) => {
    switch(step) {
      case 1: // Acesso
        if (!formData.email || !formData.email.includes("@")) { addToast("Email inválido!", "error"); return false; }
        if (formData.senha.length < 6) { addToast("Senha muito curta (min 6).", "error"); return false; }
        if (formData.senha !== formData.confirmarSenha) { addToast("Senhas não conferem.", "error"); return false; }
        return true;
      case 2: // Pessoal
        if (!formData.nome) { addToast("Nome é obrigatório.", "error"); return false; }
        // Regex Telefone: 55 + 2 digitos DDD + 9 digitos numero = 13 digitos
        const phoneRegex = /^55\d{11}$/;
        if (!phoneRegex.test(formData.telefone)) { 
            setPhoneError("Obrigatório: 55 + DDD + 9 números"); 
            addToast("Arrume o telefone!", "error");
            return false; 
        }
        return true;
      case 3: // Acadêmico
        if (!formData.matricula) { addToast("Matrícula é obrigatória.", "error"); return false; }
        if (!formData.turma) { addToast("Selecione sua turma!", "error"); return false; }
        return true;
      default: return false;
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Simulação de API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Sucesso
      addToast("Bem-vindo à Alcatéia! Cadastro realizado. 🦈", "success");
      router.push("/login");
    } catch (error) {
      addToast("Erro ao criar conta. Tente novamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-900/10 to-transparent"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        
        {/* CABEÇALHO COM LOGO ANIMADO */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
             {/* Efeito de Aura/Glow atrás do logo */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
             
             {/* Logo Flutuante */}
             <img 
                src="/logo.png" 
                alt="Logo AAAKN" 
                className="w-32 h-32 object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] animate-in zoom-in duration-700 hover:scale-105 transition-transform"
             />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white">
            Cadastro <span className="text-emerald-500">AAAKN</span>
          </h1>
          <p className="text-zinc-500 text-xs mt-1">Junte-se à maior do litoral.</p>
        </div>

        {/* --- INDICADOR DE PASSOS (STEPS) --- */}
        <div className="flex justify-between mb-8 px-4">
            {STEPS.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-2 relative z-10 w-1/3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        currentStep >= step.id 
                        ? "bg-emerald-500 border-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-600"
                    }`}>
                        {currentStep > step.id ? <CheckCircle2 size={18}/> : step.icon}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${currentStep >= step.id ? "text-emerald-500" : "text-zinc-600"}`}>
                        {step.title}
                    </span>
                    {/* Linha conectora */}
                    {index < STEPS.length - 1 && (
                        <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-10 transition-colors duration-500 ${currentStep > step.id ? "bg-emerald-500" : "bg-zinc-800"}`}></div>
                    )}
                </div>
            ))}
        </div>

        {/* --- FORMULÁRIO --- */}
        <form onSubmit={handleNext} className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-6 rounded-[2rem] shadow-2xl relative">
          
          {/* STEP 1: CREDENCIAIS */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-white">Dados de Acesso</h2>
                    <p className="text-xs text-zinc-500">Seu email será seu login.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input 
                                type="email" 
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                placeholder="exemplo@aaakn.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Senha</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input 
                                type="password" 
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                placeholder="Mínimo 6 caracteres"
                                value={formData.senha}
                                onChange={e => setFormData({...formData, senha: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Confirmar Senha</label>
                        <div className="relative">
                            <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input 
                                type="password" 
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                placeholder="Repita a senha"
                                value={formData.confirmarSenha}
                                onChange={e => setFormData({...formData, confirmarSenha: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            </div>
          )}

          {/* STEP 2: PESSOAL */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-white">Sobre Você</h2>
                    <p className="text-xs text-zinc-500">Para te identificarmos na atlética.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Nome Completo</label>
                        <div className="relative">
                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
                            <input 
                                type="text" 
                                className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                placeholder="Seu nome"
                                value={formData.nome}
                                onChange={e => setFormData({...formData, nome: e.target.value})}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">WhatsApp</label>
                        <div className="relative">
                            <Phone size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 ${phoneError ? 'text-red-500' : 'text-zinc-500'}`}/>
                            <input 
                                type="text" 
                                className={`w-full bg-black border ${phoneError ? 'border-red-500 text-red-100' : 'border-zinc-800 text-white'} rounded-xl py-3.5 pl-12 pr-4 text-sm focus:border-emerald-500 outline-none transition-all`}
                                placeholder="5512999999999"
                                value={formData.telefone}
                                onChange={e => {
                                    setPhoneError("");
                                    setFormData({...formData, telefone: e.target.value.replace(/\D/g, '')});
                                }}
                                maxLength={13}
                            />
                        </div>
                        {phoneError ? (
                            <p className="text-[10px] text-red-500 pl-2 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {phoneError}</p>
                        ) : (
                            <p className="text-[9px] text-zinc-600 pl-2 mt-1">Formato: 55 + DDD + 9 Dígitos (Apenas números)</p>
                        )}
                    </div>
                </div>
            </div>
          )}

          {/* STEP 3: ACADÊMICO (SELEÇÃO DE TURMA VISUAL) */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-bold text-white">Dados Acadêmicos</h2>
                    <p className="text-xs text-zinc-500">Para carteirinha e eventos.</p>
                </div>

                <div className="space-y-4">
                    
                    {/* Curso e Matrícula */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Curso</label>
                            <div className="relative">
                                <select 
                                    className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 px-4 text-sm text-zinc-300 focus:border-emerald-500 outline-none transition-all appearance-none"
                                    value={formData.curso}
                                    onChange={e => setFormData({...formData, curso: e.target.value})}
                                >
                                    <option value="Medicina">Medicina</option>
                                    <option value="Enfermagem">Enfermagem</option>
                                    <option value="Psicologia">Psicologia</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">▼</div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Matrícula</label>
                            <div className="relative">
                                <IdCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"/>
                                <input 
                                    type="text" 
                                    className="w-full bg-black border border-zinc-800 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-emerald-500 outline-none transition-all"
                                    placeholder="000000"
                                    value={formData.matricula}
                                    onChange={e => setFormData({...formData, matricula: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SELEÇÃO DE TURMA (GRID VISUAL) */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Selecione sua Turma</label>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                            {TURMAS.map((t) => (
                                <div 
                                    key={t.id}
                                    onClick={() => setFormData({...formData, turma: t.id})}
                                    className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center gap-2 transition-all hover:bg-zinc-800/50 ${
                                        formData.turma === t.id 
                                        ? "bg-emerald-950/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)] scale-105" 
                                        : "bg-black border-zinc-800 hover:border-zinc-600"
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-zinc-700 bg-zinc-900">
                                        <img src={t.logo} alt={t.nome} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase ${formData.turma === t.id ? "text-emerald-400" : "text-zinc-400"}`}>
                                        {t.id}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
          )}

          {/* --- NAVEGAÇÃO --- */}
          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
                <button 
                    type="button" 
                    onClick={handleBack}
                    className="w-14 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-xl flex items-center justify-center transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
            )}
            
            <button 
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                    <Loader2 size={20} className="animate-spin"/>
                ) : (
                    currentStep === 3 ? "Finalizar Cadastro" : "Próximo Passo"
                )}
                {!isLoading && currentStep < 3 && <ChevronRight size={20}/>}
            </button>
          </div>

        </form>

        <p className="text-center text-zinc-500 text-xs mt-8">
          Já faz parte? <Link href="/login" className="text-emerald-500 font-bold hover:underline">Faça login</Link>
        </p>
      </div>
    </div>
  );
}