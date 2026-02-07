"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Users, MapPin, Mail, Phone, Instagram, 
  Dumbbell, Star, Rocket, Crown, ArrowRight, CheckCircle,
  Zap, TicketPercent, ShieldAlert, Ghost, ShoppingBag, Trophy, Gem, Fish,
  Eye // 🦈 CORREÇÃO: Ícone Eye importado corretamente
} from "lucide-react";

// 🦈 IMPORTS DO SISTEMA (Caminhos relativos corrigidos)
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getCountFromServer, query, orderBy, getDocs } from "firebase/firestore";

// --- TIPAGEM ---
interface Plano {
  id: string;
  nome: string;
  preco: string;
  precoVal: number;
  parcelamento: string;
  descricao: string;
  cor: string;
  icon: string;
  destaque: boolean;
  beneficios: string[];
  xpMultiplier: number;    
  nivelPrioridade: number; 
  descontoLoja: number;    
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

interface ReviewConfig {
  id: string;
  name: string;
  role: string;
  text: string;
  profileUrl: string;
}

interface LandingConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroHighlight: string;
  tagline: string;
  taglineColor: string;
  titleColor: string;
  gradientStart: string;
  gradientEnd: string;
  statUsers: number;
  statPosts: number;
  statPartners: number;
  plansSectionTitle: string;
  plansSectionSubtitle: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  socialLinks: SocialLink[];
  reviews: ReviewConfig[];
}

// --- CONFIG PADRÃO (Fallback anti-crash) ---
const DEFAULT_CONFIG: LandingConfig = {
  heroTitle: "SEJA UM",
  heroSubtitle: "Centralize sua vida universitária. Carteirinha, Loja e Eventos.",
  heroHighlight: "TUBARÃO REI",
  tagline: "GESTÃO ESPORTIVA 2.0",
  taglineColor: "#10b981",
  titleColor: "#ffffff",
  gradientStart: "#34d399",
  gradientEnd: "#10b981",
  statUsers: 120,
  statPosts: 340,
  statPartners: 12,
  plansSectionTitle: "ESCOLHA SEU NÍVEL",
  plansSectionSubtitle: "Faça parte da maior atlética da região.",
  address: "Campus Medicina - Bloco C",
  phone: "(12) 99999-9999",
  whatsapp: "5512999999999",
  email: "suporte@aaakn.com.br",
  socialLinks: [],
  reviews: []
};

// --- HOOK: Contadores Animados ---
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (end === 0) return;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); } 
      else { setCount(Math.ceil(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

// --- COMPONENTE: Card de Estatística ---
const StatCard = ({ icon: Icon, value, label, color, suffix = "" }: any) => {
  const count = useCounter(value);
  const colors: any = {
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20"
  };
  return (
    <div className={`flex flex-col items-center p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md transition-all hover:scale-105 ${colors[color] ? "" : "border-zinc-800"}`}>
      <div className={`p-3 rounded-full mb-3 ${colors[color] || "bg-zinc-800"}`}><Icon className="w-6 h-6" /></div>
      <span className="text-3xl font-black text-white tracking-tight">{count}{suffix}</span>
      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-1 text-center">{label}</span>
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const { user, loginGoogle, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [planos, setPlanos] = useState<Plano[]>([]);
  const [config, setConfig] = useState<LandingConfig>(DEFAULT_CONFIG);
  const [realStats, setRealStats] = useState({ users: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"aluno" | "empresa">("aluno");

  // 🔒 Redirecionamento de Segurança
  useEffect(() => {
    if (!authLoading && user) router.push("/dashboard");
  }, [user, authLoading, router]);

  // 📡 Busca Configurações & Planos Oficiais do Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Busca Planos Oficiais da coleção 'planos' gerenciada no Admin
        const qPlanos = query(collection(db, "planos"), orderBy("precoVal", "asc"));
        const planosSnap = await getDocs(qPlanos);
        const planosData = planosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plano));

        // 2. Busca Configurações Visuais da Landing
        const configRef = doc(db, "site_config", "landing_page");
        const configSnap = await getDoc(configRef);
        let configData = DEFAULT_CONFIG;
        if (configSnap.exists()) {
           const data = configSnap.data();
           configData = { 
             ...DEFAULT_CONFIG, 
             ...data,
             socialLinks: data.socialLinks || [],
             reviews: data.reviews || []
           } as LandingConfig;
        }

        // 3. Stats Reais (Contagem de Usuários no Banco)
        const usersColl = collection(db, "users");
        const usersSnap = await getCountFromServer(usersColl);
        
        setPlanos(planosData);
        setConfig(configData);
        setRealStats({ users: usersSnap.data().count });

      } catch (error) {
        console.error("Erro ao carregar Landing Page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 🦈 HELPERS VISUAIS (Mapeamento de String para Componente)
  const getIcon = (iconName: string, className: string) => {
    switch(iconName) {
      case 'crown': return <Crown className={className} />;
      case 'star': return <Star className={className} />;
      case 'ghost': return <Ghost className={className} />;
      case 'fish': return <Fish className={className} />;
      case 'zap': return <Zap className={className} />;
      case 'gem': return <Gem className={className} />;
      case 'trophy': return <Trophy className={className} />;
      case 'shopping': return <ShoppingBag className={className} />;
      default: return <Star className={className} />;
    }
  };

  const getColorClasses = (colorName: string, isDestacado: boolean) => {
    const base = isDestacado ? "scale-105 shadow-[0_0_40px_rgba(0,0,0,0.3)] z-10" : "hover:scale-105 hover:shadow-xl z-0";
    switch(colorName) {
      case 'emerald': return { card: `${base} border-emerald-500/50 bg-zinc-900/80`, text: "text-emerald-400", btn: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
      case 'yellow': return { card: `${base} border-yellow-500/50 bg-zinc-900/80`, text: "text-yellow-400", btn: "bg-yellow-500 hover:bg-yellow-400 text-black shadow-yellow-500/20", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" };
      case 'purple': return { card: `${base} border-purple-500/50 bg-zinc-900/80`, text: "text-purple-400", btn: "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-500/20", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" };
      case 'blue': return { card: `${base} border-blue-500/50 bg-zinc-900/80`, text: "text-blue-400", btn: "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20", badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
      case 'red': return { card: `${base} border-red-500/50 bg-zinc-900/80`, text: "text-red-400", btn: "bg-red-600 hover:bg-red-500 text-white shadow-red-500/20", badge: "bg-red-500/10 text-red-400 border-red-500/20" };
      default: return { card: `${base} border-zinc-700 bg-zinc-950`, text: "text-zinc-400", btn: "bg-zinc-800 hover:bg-zinc-700 text-white", badge: "bg-zinc-800 text-zinc-400 border-zinc-700" };
    }
  };

  const handleGoogleLogin = async () => { try { await loginGoogle(); } catch { addToast("Erro no login Google", "error"); } };
  const handleGuest = () => { addToast("Modo Visitante Ativado! 🦈", "info"); router.push("/dashboard"); };

  if (loading) return <div className="h-screen bg-[#030a08] flex items-center justify-center text-emerald-500 font-bold animate-pulse">CARREGANDO CARDUME...</div>;

  return (
    <div className="min-h-screen bg-[#030a08] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      
      {/* 🌊 Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[80%] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse-slow" />
         <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] bg-teal-600/5 rounded-full blur-[120px] animate-pulse-slow delay-700" />
      </div>

      {/* ================= HERO SECTION ================= */}
      <main className="relative z-10 container mx-auto px-4 pt-10 pb-20 lg:pt-20 lg:flex lg:items-center lg:gap-16">
        
        {/* ESQUERDA: Texto Dinâmico */}
        <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto lg:mx-0 animate-float-slow group">
                <div className="absolute inset-0 bg-emerald-500/20 blur-[50px] rounded-full scale-75" />
                <Image 
                    src="/logo.png" 
                    alt="Logo AAAKN" 
                    width={256} height={256} 
                    className="relative z-10 object-contain drop-shadow-[0_0_35px_rgba(16,185,129,0.4)]"
                    priority
                />
            </div>

            <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest animate-pulse mx-auto lg:mx-0" style={{ color: config.taglineColor }}>
                    <Sparkles size={12} /> {config.tagline}
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-[0.9]" style={{ color: config.titleColor }}>
                    {config.heroTitle} <br className="hidden lg:block"/>
                    <span 
                      className="text-transparent bg-clip-text animate-text-shimmer bg-[length:200%_auto]"
                      style={{ backgroundImage: `linear-gradient(to right, ${config.gradientStart}, ${config.gradientEnd}, ${config.gradientStart})` }}
                    >
                        {config.heroHighlight}
                    </span>
                </h1>
                
                <p className="text-zinc-400 text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
                    {config.heroSubtitle}
                </p>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mx-auto lg:mx-0">
                <StatCard icon={Users} value={realStats.users || config.statUsers} label="Sócios" color="emerald" />
                <StatCard icon={Dumbbell} value={config.statPosts} label="Treinos" color="blue" />
                <StatCard icon={Rocket} value={config.statPartners} label="Parceiros" color="amber" />
                
                <div className="flex flex-col items-center p-3 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border border-amber-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1 bg-amber-500 text-zinc-900 text-[8px] font-black uppercase">Líder</div>
                    <Crown size={24} className="text-amber-400 mb-1" />
                    <span className="text-xl font-black text-white">T-V</span>
                </div>
            </div>
        </div>

        {/* DIREITA: Login Card */}
        <div className="flex-1 max-w-md w-full mx-auto mt-12 lg:mt-0">
            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-[2rem] border border-zinc-800 p-8 shadow-2xl relative">
                <div className="flex p-1.5 bg-zinc-950/60 rounded-xl mb-6 border border-zinc-800/50">
                    <button onClick={() => setActiveTab("aluno")} className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${activeTab === "aluno" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500"}`}>Sou Aluno</button>
                    <button onClick={() => setActiveTab("empresa")} className={`flex-1 py-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all ${activeTab === "empresa" ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500"}`}>Parceiro</button>
                </div>

                {activeTab === "aluno" ? (
                   <div className="space-y-6">
                       <button onClick={handleGoogleLogin} className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all">
                           <Image src="https://www.google.com/favicon.ico" alt="G" width={20} height={20} />
                           {authLoading ? "Conectando..." : "Entrar com Google"}
                       </button>
                       <button onClick={handleGuest} className="w-full py-3.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2">
                           <Eye size={16} /> Entrar como Visitante
                       </button>
                   </div>
                ) : (
                   <div className="text-center py-8 text-zinc-500 text-xs">Área restrita a parceiros.</div>
                )}
            </div>
        </div>
      </main>

      {/* ================= PLANOS DINÂMICOS (OFICIAIS) ================= */}
      <section className="py-20 bg-gradient-to-b from-[#050505] to-zinc-950/50 border-t border-white/5 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4">
              {config.plansSectionTitle}
            </h2>
            <p className="text-zinc-500 font-medium">{config.plansSectionSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-start max-w-7xl mx-auto">
            {planos.map((plano) => {
               const styles = getColorClasses(plano.cor, plano.destaque);
               
               return (
                 <div key={plano.id} className={`relative flex flex-col p-6 rounded-[2rem] border transition-all duration-300 ${styles.card}`}>
                    {plano.destaque && (
                       <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-black text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                          <Crown size={12} /> Mais Popular
                       </div>
                    )}

                    <div className="mb-6 text-center">
                       <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-black/40 border border-white/5 ${styles.text}`}>
                          {getIcon(plano.icon, "w-7 h-7")}
                       </div>
                       <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">{plano.nome}</h3>
                       <p className="text-xs text-zinc-500 font-bold">{plano.descricao}</p>
                    </div>

                    <div className="text-center mb-6 pb-6 border-b border-white/5">
                       <div className="flex items-start justify-center gap-1">
                          <span className="text-xs font-bold text-zinc-500 mt-1">R$</span>
                          <span className="text-4xl font-black text-white tracking-tighter">{plano.preco}</span>
                       </div>
                       <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1">{plano.parcelamento}</p>
                    </div>

                    {/* Stats de Jogo */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${styles.badge}`}>
                           <span className="text-[10px] font-bold uppercase flex items-center gap-1"><Zap size={10}/> XP Boost</span>
                           <span className="text-lg font-black">{plano.xpMultiplier}x</span>
                        </div>
                        <div className={`flex flex-col items-center justify-center p-2 rounded-xl border ${styles.badge}`}>
                           <span className="text-[10px] font-bold uppercase flex items-center gap-1"><TicketPercent size={10}/> Loja</span>
                           <span className="text-lg font-black">{plano.descontoLoja}%</span>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                       {plano.beneficios.map((ben, i) => (
                          <li key={i} className="flex items-start gap-3 text-xs font-medium text-zinc-300">
                             <CheckCircle className={`w-4 h-4 shrink-0 ${styles.text}`} />
                             <span className="leading-tight">{ben}</span>
                          </li>
                       ))}
                    </ul>

                    <Link href={`/cadastro?plano=${plano.id}`} className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 ${styles.btn}`}>
                       Escolher Plano <ArrowRight size={14} />
                    </Link>
                 </div>
               );
            })}
          </div>
        </div>
      </section>

      {/* ================= DEPOIMENTOS ================= */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <Star className="text-emerald-500 fill-emerald-500" />
            <h3 className="text-xl font-black text-white uppercase tracking-tight">O Cardume Aprova</h3>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-8 px-4 scrollbar-hide snap-x md:grid md:grid-cols-3 md:overflow-visible">
            {(config.reviews || []).length > 0 ? config.reviews.map((review) => (
                <div key={review.id} className="flex flex-col gap-4 p-6 bg-zinc-900/80 border border-zinc-800 rounded-2xl min-w-[300px] hover:border-emerald-500/30 transition-all shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-zinc-800">
                            {/* 🦈 CORREÇÃO: Fallback local para logo e filtro cinza para depoimentos sem foto */}
                            <Image 
                                src={review.profileUrl || "/logo.png"} 
                                alt={review.name} 
                                fill 
                                className={`object-cover ${!review.profileUrl ? "grayscale opacity-50 p-1" : ""}`} 
                            />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm leading-tight">{review.name}</h4>
                            <span className="text-zinc-500 text-[10px] uppercase font-bold">{review.role}</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-zinc-300 text-xs italic leading-relaxed line-clamp-4">&quot;{review.text}&quot;</p>
                </div>
            )) : (
                <p className="text-zinc-500 text-xs italic col-span-3 text-center">Nenhum depoimento cadastrado ainda.</p>
            )}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-zinc-950 pt-16 pb-8 border-t border-zinc-900">
        <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-2"><Crown className="text-emerald-500 w-5 h-5" /><span className="font-black text-xl text-white">AAAKN</span></div>
                    <p className="text-zinc-500 text-xs leading-relaxed">Plataforma Oficial da Atlética.</p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-wider">Suporte</h4>
                    <ul className="space-y-3 text-xs text-zinc-500">
                        <li className="flex items-center gap-2"><MapPin size={14} className="text-emerald-600"/> {config.address}</li>
                        <li className="flex items-center gap-2"><Mail size={14} className="text-emerald-600"/> {config.email}</li>
                        <li className="flex items-center gap-2"><Phone size={14} className="text-emerald-600"/> {config.phone}</li>
                        
                        {(config.socialLinks || []).map(social => (
                            <li key={social.id} className="pt-2">
                                <a href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-bold capitalize">
                                    <Instagram size={14}/> {social.platform}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-zinc-900 text-center text-[10px] text-zinc-600">
                <p>&copy; {new Date().getFullYear()} AAAKN. Todos os direitos reservados.</p>
                <p className="mt-1">O Tubarão já subiu para a base. 🦈</p>
            </div>
        </div>
      </footer>
    </div>
  );
}