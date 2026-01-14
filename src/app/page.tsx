"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Eye, Waves, Sparkles, Users, 
  MapPin, Mail, Phone, Instagram, ShieldCheck, Dumbbell, Star, Rocket, Crown
} from "lucide-react";

// 🦈 IMPORTS CORRIGIDOS (Caminho Relativo ../)
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { db } from "../lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

// --- HOOK: Contadores Animados ---
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end > 0 ? end / (duration / 60) : 0;
    if (end === 0) return;
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

// --- COMPONENTE: Card de Estatística ---
const StatCard = ({ icon: Icon, value, label, color, suffix = "" }: any) => {
  const count = useCounter(value);

  const styles: any = {
    emerald: {
      border: "hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]",
      iconBg: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      iconColor: "text-emerald-400"
    },
    blue: {
      border: "hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]",
      iconBg: "bg-blue-500/10 group-hover:bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    amber: {
      border: "hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]",
      iconBg: "bg-amber-500/10 group-hover:bg-amber-500/20",
      iconColor: "text-amber-400"
    }
  };

  const activeStyle = styles[color] || styles.emerald;

  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md transition-all group min-w-[110px] ${activeStyle.border}`}>
      <div className={`p-3 rounded-full mb-3 group-hover:scale-110 transition duration-300 ${activeStyle.iconBg}`}>
        <Icon className={`w-6 h-6 ${activeStyle.iconColor}`} />
      </div>
      <span className="text-3xl font-black text-white tracking-tight">
        {count}{suffix}
      </span>
      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1 text-center">{label}</span>
    </div>
  );
};

// --- COMPONENTE: Card de Depoimento ---
const ReviewCard = ({ name, role, text, img }: any) => (
  <div className="flex flex-col gap-4 p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl min-w-[300px] max-w-[300px] hover:border-emerald-500/30 hover:translate-y-[-5px] transition-all shadow-lg hover:shadow-emerald-900/20">
    <div className="flex items-center gap-3">
        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-zinc-800">
            <Image src={img} alt={name} fill className="object-cover" />
        </div>
        <div>
            <h4 className="text-white font-bold text-sm leading-tight">{name}</h4>
            <span className="text-zinc-500 text-[10px] uppercase font-bold">{role}</span>
        </div>
    </div>
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
    </div>
    <p className="text-zinc-300 text-xs italic leading-relaxed line-clamp-4">"{text}"</p>
  </div>
);

// --- COMPONENTE: Card de Planos ---
const PlanCard = ({ title, price, features, recommended = false, onClick }: any) => (
    <div className={`relative p-6 rounded-3xl border flex flex-col h-full transition-all duration-300 hover:-translate-y-2 ${recommended ? 'bg-zinc-900/80 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'}`}>
        {recommended && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                Mais Popular
            </div>
        )}
        <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
        <div className="mb-6">
            <span className="text-3xl font-black text-white">R$ {price}</span>
            <span className="text-zinc-500 text-xs">/ano</span>
        </div>
        <ul className="space-y-3 mb-8 flex-1">
            {features.map((feat: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {feat}
                </li>
            ))}
        </ul>
        <button onClick={onClick} className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${recommended ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}>
            Escolher Plano
        </button>
    </div>
);

// --- PÁGINA PRINCIPAL ---
export default function LandingPage() {
  const router = useRouter();
  const { user, loginGoogle, loading } = useAuth();
  const { addToast } = useToast();

  const [stats, setStats] = useState({ users: 120, posts: 340, partners: 12 });
  const [activeTab, setActiveTab] = useState<"aluno" | "empresa">("aluno");

  // 🔒 Redirecionamento de Segurança
  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  // 📡 Busca Dados Reais
  useEffect(() => {
    const fetchStats = async () => {
        try {
            const usersColl = collection(db, "users");
            const snapshot = await getCountFromServer(usersColl);
            const realUsers = snapshot.data().count;
            if (realUsers > 0) {
                setStats(prev => ({ ...prev, users: realUsers }));
            }
        } catch (error) {
            console.log("Usando stats base.");
        }
    };
    fetchStats();
  }, []);

  const handleGoogleLogin = async () => {
    try { await loginGoogle(); } catch (e) { addToast("Erro no login Google", "error"); }
  };

  const handleGuest = () => {
    addToast("Modo Visitante Ativado! 🦈", "info");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#030a08] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      
      {/* 🌊 Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
         <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] bg-teal-600/5 rounded-full blur-[120px] animate-pulse-slow delay-700" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <main className="relative z-10 container mx-auto px-4 pt-10 pb-20 lg:pt-20 lg:flex lg:items-center lg:gap-16">
        
        {/* ESQUERDA: Texto & Stats */}
        <div className="flex-1 text-center lg:text-left space-y-8">
            
            {/* Logo Gigante Responsiva */}
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto lg:mx-0 animate-float-slow group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] rounded-full scale-75 group-hover:scale-90 transition-transform duration-700" />
                <Image 
                    src="/logo.png" 
                    alt="Logo AAAKN" 
                    width={256} 
                    height={256} 
                    className="relative z-10 object-contain drop-shadow-[0_0_35px_rgba(16,185,129,0.4)] hover:scale-105 transition duration-500"
                    priority
                />
            </div>

            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse mx-auto lg:mx-0">
                    <Sparkles size={12} /> Gestão Esportiva 2.0
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9]">
                    SEJA UM <br className="hidden lg:block"/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-emerald-500 animate-text-shimmer bg-[length:200%_auto]">
                        TUBARÃO REI
                    </span>
                </h1>
                
                <p className="text-zinc-400 text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    Centralize sua vida universitária. Carteirinha digital, Loja, Eventos e o Ranking da Arena em uma única plataforma.
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mx-auto lg:mx-0">
                <StatCard icon={Users} value={stats.users} label="Sócios Ativos" color="emerald" />
                <StatCard icon={Dumbbell} value={stats.posts} label="Treinos Postados" color="blue" />
                <StatCard icon={Rocket} value={stats.partners} label="Parceiros" color="amber" />
                
                {/* Turma Líder (Card Especial) */}
                <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1 bg-amber-500 text-zinc-900 text-[8px] font-black uppercase">Líder</div>
                    <div className="relative w-8 h-8 mb-2 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800">
                        {/* Placeholder caso a imagem t5.png não exista */}
                        <div className="w-full h-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs">T5</div>
                        <Crown size={12} className="absolute -top-1 -right-1 text-amber-400 fill-amber-400 animate-bounce" />
                    </div>
                    <span className="text-xl font-black text-white">T-V</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">Medicina</span>
                </div>
            </div>
        </div>

        {/* DIREITA: Login Card */}
        <div className="flex-1 max-w-md w-full mx-auto mt-12 lg:mt-0 perspective-1000">
            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-zinc-800 p-8 shadow-2xl shadow-emerald-900/20 relative group hover:border-emerald-500/30 transition-all duration-500">
                
                {/* Abas */}
                <div className="flex p-1.5 bg-zinc-950/60 rounded-xl mb-6 border border-zinc-800/50">
                    <button onClick={() => setActiveTab("aluno")} className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${activeTab === "aluno" ? "bg-zinc-800 text-white shadow-md scale-100" : "text-zinc-500 hover:text-zinc-300 scale-95"}`}>
                        Sou Aluno
                    </button>
                    <button onClick={() => setActiveTab("empresa")} className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${activeTab === "empresa" ? "bg-zinc-800 text-white shadow-md scale-100" : "text-zinc-500 hover:text-zinc-300 scale-95"}`}>
                        Parceiro
                    </button>
                </div>

                {activeTab === "aluno" ? (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h2 className="text-2xl font-black text-white mb-1">Entrar no App</h2>
                            <p className="text-zinc-500 text-xs font-medium">Use seu e-mail institucional ou pessoal.</p>
                        </div>

                        <button 
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="relative w-full group bg-white hover:bg-zinc-200 text-zinc-900 font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                             {loading ? <Waves className="animate-spin w-5 h-5"/> : (
                                <>
                                    <Image src="https://www.google.com/favicon.ico" alt="G" width={20} height={20} />
                                    <span>Continuar com Google</span>
                                </>
                             )}
                        </button>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-zinc-800"></div>
                            <span className="flex-shrink-0 mx-4 text-zinc-600 text-[10px] uppercase font-bold">Ou acesso rápido</span>
                            <div className="flex-grow border-t border-zinc-800"></div>
                        </div>

                        <button onClick={handleGuest} className="w-full py-3.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition border border-zinc-800 hover:border-zinc-600 flex items-center justify-center gap-2 group/guest">
                            <Eye size={16} /> Entrar como Visitante
                        </button>
                    </div>
                ) : (
                    <form className="space-y-4 animate-fade-in" onSubmit={(e) => { e.preventDefault(); addToast("Em breve!", "info") }}>
                        <div className="text-center mb-4">
                            <h2 className="text-xl font-bold text-white">Área Corporativa</h2>
                            <p className="text-zinc-500 text-xs">Acesso administrativo.</p>
                        </div>
                        <input type="email" placeholder="E-mail" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition" />
                        <input type="password" placeholder="Senha" className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition" />
                        <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl uppercase text-xs tracking-wider shadow-lg shadow-blue-900/20 transition hover:shadow-blue-500/20">
                            Acessar Painel
                        </button>
                    </form>
                )}
            </div>
        </div>
      </main>

      {/* ================= PLANOS SECTION ================= */}
      <section className="py-20 bg-zinc-950/50 border-y border-zinc-900 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-black text-white mb-2">ESCOLHA SEU NÍVEL</h2>
                <p className="text-zinc-500 text-sm">Faça parte da maior atlética da região.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <PlanCard 
                    title="Visitante" 
                    price="00" 
                    features={["Acesso à Loja", "Visualizar Eventos", "Notícias"]} 
                    onClick={handleGuest} 
                />
                <PlanCard 
                    title="Sócio Tubarão" 
                    price="120" 
                    features={["Carteirinha Digital", "Desconto em Festas", "Clube de Vantagens", "Participar do Ranking"]} 
                    recommended={true}
                    onClick={() => { addToast("Redirecionando para pagamento...", "success"); router.push("/cadastro") }}
                />
                <PlanCard 
                    title="Atleta Elite" 
                    price="180" 
                    features={["Tudo do Sócio", "Uniforme de Treino", "Isenção em Treinos", "Votação na Diretoria"]} 
                    onClick={() => router.push("/cadastro")}
                />
            </div>
        </div>
      </section>

      {/* ================= DEPOIMENTOS ================= */}
      <section className="py-20 container mx-auto px-4 overflow-hidden">
        <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <Star className="text-emerald-500 fill-emerald-500" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">O Cardume Aprova</h3>
        </div>
        
        {/* Scroll Horizontal */}
        <div className="flex gap-6 overflow-x-auto pb-8 px-4 scrollbar-hide snap-x md:grid md:grid-cols-3 md:overflow-visible">
            <ReviewCard 
                name="Amanda S." role="Medicina T5" 
                img="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                text="O aplicativo facilitou demais a entrada nas festas. Não preciso mais andar com dinheiro ou carteirinha de papel." 
            />
            <ReviewCard 
                name="Pedro H." role="Diretoria de Esportes" 
                img="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                text="A gestão dos treinos mudou da água pro vinho. O ranking motiva a galera a comparecer em peso!" 
            />
            <ReviewCard 
                name="Lucas M." role="Calouro T8" 
                img="https://i.pravatar.cc/150?u=a048581f4e29026704d"
                text="Cheguei agora e já me senti parte da turma. O app mostra onde vai ser o rolê e quem vai." 
            />
        </div>
      </section>

      {/* ================= FOOTER COMPLETO ================= */}
      <footer className="bg-zinc-950 pt-16 pb-8 border-t border-zinc-900">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                
                {/* Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Waves className="text-emerald-500 w-5 h-5" />
                        </div>
                        <span className="font-black text-xl text-white">SPOT CONNECT</span>
                    </div>
                    <p className="text-zinc-500 text-xs leading-relaxed">
                        A plataforma definitiva para gestão de atléticas universitárias. 
                        Tecnologia e paixão pelo esporte andando juntos.
                    </p>
                    <div className="flex gap-4">
                        <button className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-emerald-500 hover:text-white transition"><Instagram size={16}/></button>
                        <button className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-blue-500 hover:text-white transition"><Mail size={16}/></button>
                    </div>
                </div>

                {/* Links */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Acesso Rápido</h4>
                    <ul className="space-y-2 text-xs text-zinc-500">
                        <li className="hover:text-emerald-400 cursor-pointer">Login Aluno</li>
                        <li className="hover:text-emerald-400 cursor-pointer">Login Empresa</li>
                        <li className="hover:text-emerald-400 cursor-pointer">Calendário</li>
                        <li className="hover:text-emerald-400 cursor-pointer">Loja Virtual</li>
                    </ul>
                </div>

                {/* Contato */}
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Suporte & Local</h4>
                    <ul className="space-y-3 text-xs text-zinc-500">
                        <li className="flex items-center gap-2"><MapPin size={14} className="text-emerald-600"/> Campus Medicina - Bloco C</li>
                        <li className="flex items-center gap-2"><Mail size={14} className="text-emerald-600"/> suporte@aaakn.com.br</li>
                        <li className="flex items-center gap-2"><Phone size={14} className="text-emerald-600"/> (12) 99999-9999</li>
                    </ul>
                </div>

                {/* Infos Legais */}
                <div>
                     <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Legal</h4>
                     <ul className="space-y-2 text-xs text-zinc-500">
                        <li className="hover:text-white cursor-pointer">Termos de Uso</li>
                        <li className="hover:text-white cursor-pointer">Privacidade</li>
                        <li className="hover:text-white cursor-pointer">LGPD</li>
                     </ul>
                </div>
            </div>

            <div className="pt-8 border-t border-zinc-900 text-center text-[10px] text-zinc-600">
                <p>&copy; 2026 Atletica SPOT Connect. Todos os direitos reservados.</p>
                <p className="mt-1">Desenvolvido com 🦈 pelo Tubarão Dev.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}