"use client";

import React, { useState } from "react";
import { ArrowLeft, Store, Mail, Lock, FileText, Phone, Tag, Image as ImageIcon, CheckCircle, ChevronRight, Crown, Star, Shield, User, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

const PLANOS = [
    { id: 'ouro', nome: 'Ouro', valor: 'R$ 500', icon: Crown, color: 'text-yellow-500', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
    { id: 'prata', nome: 'Prata', valor: 'R$ 250', icon: Star, color: 'text-zinc-300', border: 'border-zinc-500/50', bg: 'bg-zinc-500/10' },
    { id: 'standard', nome: 'Standard', valor: 'Grátis', icon: Shield, color: 'text-emerald-500', border: 'border-emerald-500/50', bg: 'bg-emerald-500/10' },
];

export default function CompanyRegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  // 1: Planos, 2: Dados, 3: Perfil
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  
  // ATUALIZADO: Adicionado responsavel e cpf
  const [formData, setFormData] = useState({
    nome: "", cnpj: "", 
    responsavel: "", cpf: "", // NOVOS CAMPOS
    categoria: "Alimentação", email: "", telefone: "", senha: "", confirmSenha: "",
    descricao: "", endereco: "", horario: ""
  });

  const handleSelectPlan = (planId: string) => {
      setSelectedPlan(planId);
      setStep(2);
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação básica
    if (!formData.nome || !formData.cnpj) return addToast("Preencha os dados da empresa.", "error");
    if (!formData.responsavel || !formData.cpf) return addToast("Preencha os dados do responsável.", "error");
    if (formData.senha !== formData.confirmSenha) return addToast("As senhas não conferem.", "error");
    
    setIsLoading(true);
    setTimeout(() => {
        setIsLoading(false);
        setStep(3); 
        addToast("Dados salvos! Última etapa.", "success");
    }, 1000);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setTimeout(() => {
          setIsLoading(false);
          addToast("Cadastro enviado para aprovação!", "success");
          router.push("/empresa"); 
      }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
        
        {/* Background Animado */}
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <Link href="/cadastro" className="absolute top-6 left-6 text-zinc-500 hover:text-white flex items-center gap-2 transition z-50 font-bold uppercase text-xs tracking-wider">
            <ArrowLeft size={18}/> Voltar
        </Link>

        <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-[2rem] shadow-2xl relative z-10 my-10">
            
            {/* LOGO FLUTUANTE */}
            <div className="text-center mb-8">
                <div className="relative w-24 h-24 mx-auto mb-4 group animate-float-slow">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full group-hover:bg-emerald-500/50 transition duration-500"></div>
                    <img src="/logo.png" alt="AAAKN" className="w-full h-full object-contain relative z-10 drop-shadow-2xl transition transform group-hover:scale-105" />
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Parceria Tubarão</h1>
                
                {/* BREADCRUMBS */}
                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    <span className={step >= 1 ? "text-emerald-500" : ""}>1. Planos</span>
                    <ChevronRight size={10}/>
                    <span className={step >= 2 ? "text-emerald-500" : ""}>2. Dados</span>
                    <ChevronRight size={10}/>
                    <span className={step >= 3 ? "text-emerald-500" : ""}>3. Perfil</span>
                </div>
                {/* Barra de Progresso */}
                <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-500 transition-all duration-500 ease-out`} style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
                </div>
            </div>

            {/* PASSO 1: ESCOLHA DE PLANO */}
            {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right duration-300">
                    <h3 className="text-white font-bold text-center mb-4 text-sm uppercase">Escolha seu Plano</h3>
                    <div className="space-y-3">
                        {PLANOS.map((plano) => (
                            <div key={plano.id} onClick={() => handleSelectPlan(plano.id)} className={`p-4 rounded-2xl border cursor-pointer transition hover:scale-[1.02] flex justify-between items-center ${plano.bg} ${plano.border}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full bg-black/20 ${plano.color}`}><plano.icon size={20}/></div>
                                    <div>
                                        <h4 className={`font-black text-sm uppercase ${plano.color}`}>{plano.nome}</h4>
                                        <span className="text-[10px] text-zinc-400">Benefícios exclusivos</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-black text-white">{plano.valor}</span>
                                    <span className="text-[9px] text-zinc-500 uppercase bg-black/40 px-2 py-1 rounded">Selecionar</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PASSO 2: DADOS CADASTRAIS */}
            {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in slide-in-from-right duration-300">
                    
                    {/* DADOS DA EMPRESA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="text" placeholder="Nome Fantasia" className="input-field pl-14" required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                        </div>
                        <div className="relative">
                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="text" placeholder="CNPJ" className="input-field pl-14" required value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
                        </div>
                    </div>

                    {/* DADOS DO RESPONSÁVEL (NOVO) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="text" placeholder="Nome Responsável" className="input-field pl-14" required value={formData.responsavel} onChange={e => setFormData({...formData, responsavel: e.target.value})} />
                        </div>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="text" placeholder="CPF Responsável" className="input-field pl-14" required value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} />
                        </div>
                    </div>
                    
                    {/* CATEGORIA */}
                    <div className="relative">
                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                        <select className="input-field pl-14 appearance-none text-zinc-400" required value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                            <option>Alimentação</option><option>Saúde</option><option>Lazer</option><option>Serviços</option>
                        </select>
                    </div>

                    {/* CONTATO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="email" placeholder="Email Comercial" className="input-field pl-14" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="tel" placeholder="WhatsApp" className="input-field pl-14" required value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} />
                        </div>
                    </div>

                    {/* SENHAS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="password" placeholder="Senha" className="input-field pl-14" required value={formData.senha} onChange={e => setFormData({...formData, senha: e.target.value})} />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={18} />
                            <input type="password" placeholder="Confirmar" className="input-field pl-14" required value={formData.confirmSenha} onChange={e => setFormData({...formData, confirmSenha: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-emerald-500 transition active:scale-95 flex justify-center items-center gap-2 mt-6">
                        {isLoading ? "Validando..." : "Próximo Passo"} <ChevronRight size={18}/>
                    </button>
                </form>
            )}

            {/* PASSO 3: PERFIL VISUAL */}
            {step === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-4 animate-in slide-in-from-right duration-300">
                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 mb-4 text-center">
                        <p className="text-xs text-zinc-400">Complete as informações que aparecerão no App.</p>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase mt-1 block">Plano Selecionado: {PLANOS.find(p => p.id === selectedPlan)?.nome}</span>
                    </div>

                    <textarea placeholder="Descreva sua empresa e benefícios..." rows={3} className="input-field px-4 pt-3" value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})}/>
                    
                    <input type="text" placeholder="Endereço Completo" className="input-field px-4" value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})}/>
                    <input type="text" placeholder="Horário de Funcionamento" className="input-field px-4" value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})}/>
                    
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button type="button" className="bg-black/40 border border-dashed border-zinc-600 p-4 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 text-center transition flex flex-col items-center gap-2 group">
                            <ImageIcon size={24} className="group-hover:text-emerald-500"/>
                            Upload Logo
                        </button>
                        <button type="button" className="bg-black/40 border border-dashed border-zinc-600 p-4 rounded-xl text-xs text-zinc-400 hover:border-emerald-500 text-center transition flex flex-col items-center gap-2 group">
                            <ImageIcon size={24} className="group-hover:text-emerald-500"/>
                            Upload Capa
                        </button>
                    </div>

                    <button type="submit" disabled={isLoading} className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-emerald-500 transition active:scale-95 flex justify-center items-center gap-2 mt-6">
                        {isLoading ? "Enviando..." : "Finalizar Cadastro"} <CheckCircle size={18}/>
                    </button>
                </form>
            )}
        </div>

        <style jsx>{`
            .input-field { 
                width: 100%; 
                background-color: rgba(0,0,0,0.4); 
                border: 1px solid #27272a; 
                border-radius: 0.75rem; 
                padding-top: 1rem;
                padding-bottom: 1rem;
                padding-right: 1rem;
                color: white; 
                outline: none; 
                transition: all 0.3s; 
                font-size: 0.875rem; 
            }
            .input-field:focus { 
                border-color: #10b981; 
                background-color: rgba(0,0,0,0.8); 
            }
            .animate-float-slow { animation: float 6s ease-in-out infinite; }
            @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>
    </div>
  );
}