"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Calendar, Dumbbell, CreditCard, Menu, X, Wallet,
  Trophy, Gamepad2, ShoppingBag, Settings, HelpCircle, LogOut,
  ChevronRight, Handshake, Clock, CalendarRange, MessageCircle, MapPin,
  Crown, Medal, Star, ShieldCheck, User, Ghost, Sparkles, Zap, LogIn,
  Layout
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// --- 1. DEFINIÇÃO DE TIPOS ---
interface UserWithTier {
    uid?: string;
    nome: string;
    email: string;
    foto?: string;
    tier?: 'bicho' | 'atleta' | 'lenda' | 'standard'; 
    level?: number;
    role?: string;
}

interface NavItemProps {
    id: string;
    label: string;
    path?: string;
    icon: React.ReactNode; 
    action?: () => void;
    isMain?: boolean;
    highlight?: boolean;
    badge?: number;
}

// --- 2. COMPONENTES INTERNOS ---

const TierBadge = ({ tier }: { tier: string }) => {
    const getStyle = (t: string) => {
        switch(t) {
            case 'lenda': return { label: 'SÓCIO LENDA', bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30', icon: Crown };
            case 'atleta': return { label: 'SÓCIO ATLETA', bg: 'bg-zinc-300/10', text: 'text-zinc-300', border: 'border-zinc-300/30', icon: Star };
            case 'bicho': return { label: 'SÓCIO BICHO', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: Ghost };
            default: return { label: 'NÃO SÓCIO', bg: 'bg-zinc-800', text: 'text-zinc-500', border: 'border-zinc-700', icon: User };
        }
    };
    const style = getStyle(tier);
    const Icon = style.icon;
    return (
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${style.bg} ${style.border} shadow-sm backdrop-blur-md`}>
            <Icon size={10} className={style.text} />
            <span className={`text-[9px] font-black uppercase tracking-wider ${style.text}`}>{style.label}</span>
        </div>
    );
};

// BOTÃO "TUBARÃO REI" - APELATIVO E GAMIFICADO
const SocioGrowthBanner = ({ tier, router, closeMenu }: { tier: string, router: any, closeMenu: () => void }) => {
    if (tier === 'lenda') return null; 
    
    // Configuração visual PARA GERAÇÃO Z: DOURADO, OUSADO E "HYPE"
    const config = { 
        title: "VIRE TUBARÃO REI", // Mudança aqui: Mais agressivo e gamificado
        subtitle: "Domine o Oceano & Os Rolês", // Conecta a metáfora com a festa
        icon: Crown, 
        gradient: "from-yellow-600 via-amber-500 to-yellow-600", 
        border: "border-yellow-400/50",
        shadow: "shadow-[0_0_30px_rgba(234,179,8,0.5)]", // Glow mais forte
        text: "text-white",
        animation: "animate-pulse"
    };
    
    const Icon = config.icon;

    return (
        <button onClick={() => { closeMenu(); router.push('/planos'); }} className={`w-full group relative overflow-hidden rounded-2xl mb-6 transition-all duration-300 transform hover:scale-[1.03] active:scale-95 shadow-xl border ${config.border} ${config.shadow} ${config.animation}`}>
            {/* Background Dourado Animado (Flow) */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} bg-[length:200%_200%] animate-[gradient_2s_ease_infinite]`}></div>
            
            {/* Efeito de Reflexo/Brilho passando */}
            <div className="absolute inset-0 bg-white/20 -skew-x-12 translate-x-[-150%] group-hover:animate-[shine_1s_infinite] pointer-events-none"></div>

            <div className="relative p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-black/30 backdrop-blur-md border border-white/30 shadow-inner">
                        <Icon size={22} className="text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" />
                    </div>
                    <div className="text-left">
                        <h4 className={`text-base font-black italic uppercase leading-none drop-shadow-md ${config.text}`}>{config.title}</h4>
                        <p className={`text-[10px] font-bold opacity-100 mt-1 drop-shadow-sm text-yellow-100 uppercase tracking-wide`}>{config.subtitle}</p>
                    </div>
                </div>
                <ChevronRight size={20} className={`${config.text} drop-shadow-md group-hover:translate-x-1 transition-transform`} />
            </div>
        </button>
    );
};

// --- 3. COMPONENTE PRINCIPAL ---

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkPermission } = useAuth();
  
  const currentUser = user as unknown as UserWithTier; 

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  const isAdmin = checkPermission ? checkPermission(["admin_geral", "admin_gestor", "master"]) : false;

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
            if (!isSidebarOpen) setIsVisible(false);
        } else {
            setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
    };
    
    const resetTimer = () => {
        setIsVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (!isSidebarOpen && window.scrollY > 50) setIsVisible(false);
        }, 3000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    resetTimer();

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("touchstart", resetTimer);
    };
  }, [isSidebarOpen]);

  const handleNavigation = (path: string) => { setIsSidebarOpen(false); router.push(path); };
  const handleLogout = () => { if (logout) logout(); setIsSidebarOpen(false); router.push("/login"); };

  // --- ITENS DA BARRA INFERIOR ---
  const bottomItems: NavItemProps[] = [
      { id: 'home', label: 'Início', icon: <Home size={22}/>, path: '/menu' },
      { id: 'eventos', label: 'Eventos', icon: <Calendar size={22}/>, path: '/eventos' },
      { id: 'gym', label: 'Gym Rats', icon: <Dumbbell size={28}/>, path: '/gym', isMain: true },
      { id: 'carteira', label: 'Carteira', icon: <Wallet size={22}/>, path: '/carteirinha' },
      { id: 'menu', label: 'Menu', icon: <Menu size={22}/>, action: () => setIsSidebarOpen(true) },
  ];

  // --- ORGANIZAÇÃO DA SIDEBAR ---
  const sidebarItemsGeneral: NavItemProps[] = [
      { id: 'loja', label: 'Lojinha', icon: <ShoppingBag size={18} />, path: '/loja' },
      { id: 'carteira_side', label: 'Carteirinha', icon: <CreditCard size={18} />, path: '/carteirinha' },
      { id: 'parceiros', label: 'Parceiros', icon: <Handshake size={18} />, path: '/parceiros' },
      { id: 'comunidade', label: 'Comunidade', icon: <MessageCircle size={18} />, path: '/comunidade' },
  ];

  const sidebarItemsAtleta: NavItemProps[] = [
      { id: 'treinos', label: 'Treinos', icon: <CalendarRange size={18} />, path: '/treinos' },
      { id: 'gym_side', label: 'Treinando com Tubarão', icon: <Dumbbell size={18} />, path: '/gym' },
      { id: 'ranking', label: 'Ranking', icon: <Trophy size={18} />, path: '/ranking' },
      { id: 'arena', label: 'Arena Games', icon: <Gamepad2 size={18} />, path: '/games' },
  ];

  const sidebarItemsInfo: NavItemProps[] = [
      { id: 'conquistas', label: 'Conquistas', icon: <Medal size={18} />, path: '/conquistas' },
      { id: 'fidelidade', label: 'Fidelidade', icon: <Star size={18} />, path: '/fidelidade' },
      { id: 'guia', label: 'Guia', icon: <HelpCircle size={18} />, path: '/guia' },
      { id: 'historico', label: 'Nossa História', icon: <Clock size={18} />, path: '/historico' },
  ];

  if (["/login", "/cadastro", "/empresa/cadastro"].includes(pathname)) return null;

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[60] transition-opacity duration-500 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setIsSidebarOpen(false)}/>

      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[340px] bg-[#09090b] border-r border-zinc-800 z-[70] transform transition-transform duration-500 flex flex-col shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-6 pb-4 border-b border-zinc-800 bg-black/40 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center"><img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain"/></div><div><h2 className="text-lg font-black italic uppercase text-white leading-none">AAAKN</h2><p className="text-[10px] font-bold text-zinc-500 uppercase">App Oficial</p></div></div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
            
            {currentUser ? (
                <div onClick={() => handleNavigation('/perfil')} className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800 mb-6 cursor-pointer hover:border-emerald-500/30 transition">
                    <div className="w-12 h-12 rounded-full bg-black overflow-hidden border-2 border-zinc-700"><img src={currentUser.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover"/></div>
                    <div className="flex-1"><p className="text-sm font-bold text-white">{currentUser.nome?.split(" ")[0]}</p><TierBadge tier={currentUser.tier || 'standard'}/></div>
                    <ChevronRight size={16} className="text-zinc-600"/>
                </div>
            ) : null}

            {/* BOTÃO GROWTH (TUBARÃO REI) */}
            <SocioGrowthBanner tier={currentUser?.tier || 'standard'} router={router} closeMenu={() => setIsSidebarOpen(false)} />

            <div className="px-2 pt-2 pb-2"><h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Layout size={10}/> Menu Principal</h3></div>
            <div className="space-y-1.5 pb-2">
                {sidebarItemsGeneral.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-900 border border-zinc-800" : "hover:bg-zinc-900/50"}`}>
                        <div className={`p-2 rounded-lg flex items-center justify-center ${pathname === item.path ? "bg-emerald-500 text-black" : "bg-zinc-900 text-zinc-500"}`}>{item.icon}</div>
                        <span className={`text-sm font-bold ${pathname === item.path ? "text-white" : "text-zinc-400"}`}>{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="px-2 pt-4 pb-2 border-t border-zinc-800/50 mt-2"><h3 className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest"><Dumbbell size={10}/> Área do Atleta</h3></div>
            <div className="space-y-1.5 pb-2">
                {sidebarItemsAtleta.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-900 border border-zinc-800" : "hover:bg-zinc-900/50"}`}>
                        <div className={`p-2 rounded-lg flex items-center justify-center ${pathname === item.path ? "bg-emerald-500 text-black" : "bg-zinc-900 text-zinc-500"}`}>{item.icon}</div>
                        <span className={`text-sm font-bold ${pathname === item.path ? "text-white" : "text-zinc-400"}`}>{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="px-2 pt-4 pb-2 border-t border-zinc-800/50 mt-2"><h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest"><MapPin size={10}/> Central de Info</h3></div>
            <div className="space-y-1.5 pb-6">
                {sidebarItemsInfo.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center gap-3 p-3.5 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-900 border border-zinc-800" : "hover:bg-zinc-900/50"}`}>
                        <div className={`p-2 rounded-lg flex items-center justify-center ${pathname === item.path ? "bg-emerald-500 text-black" : "bg-zinc-900 text-zinc-500"}`}>{item.icon}</div>
                        <span className={`text-sm font-bold ${pathname === item.path ? "text-white" : "text-zinc-400"}`}>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>

        <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-3">
            {isAdmin && <button onClick={() => handleNavigation('/admin')} className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-red-900/10 border border-red-900/30 text-red-400 hover:bg-red-900/20"><ShieldCheck size={18}/><span className="text-xs font-black uppercase">Painel Admin</span></button>}
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleNavigation('/configuracoes')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800"><Settings size={20}/><span className="text-[9px] font-bold uppercase mt-1">Ajustes</span></button>
                {currentUser ? (
                    <button onClick={handleLogout} className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900 text-zinc-400 hover:text-red-500 hover:bg-red-900/10"><LogOut size={20}/><span className="text-[9px] font-bold uppercase mt-1">Sair</span></button>
                ) : (
                    <button onClick={() => router.push('/login')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-zinc-900 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/10"><LogIn size={20}/><span className="text-[9px] font-bold uppercase mt-1">Entrar</span></button>
                )}
            </div>
        </div>
      </div>

      <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center transition-transform duration-500 ${isVisible || isSidebarOpen ? "translate-y-0" : "translate-y-[150%]"}`}>
        <nav className="bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-3xl px-1 py-1 shadow-2xl flex items-center justify-between w-[92%] max-w-md relative">
            {bottomItems.map((item) => (
                item.isMain ? (
                    <div key={item.id} className="relative -top-10 mx-1 group z-20">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        <button onClick={() => router.push(item.path!)} className="relative w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500 text-black shadow-xl border-[5px] border-[#09090b] transition-transform active:scale-95">{item.icon}</button>
                    </div>
                ) : (
                    <div key={item.id} className="flex-1 h-full flex justify-center">
                        <button onClick={item.action || (() => router.push(item.path!))} className={`w-full h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-90 ${pathname === item.path ? "text-emerald-400" : "text-zinc-500"}`}>
                            {item.icon}
                            <span className="text-[9px] font-bold uppercase">{item.label}</span>
                        </button>
                    </div>
                )
            ))}
        </nav>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        @keyframes shine { to { transform: translateX(150%) skewX(-12deg); } }
      `}</style>
    </>
  );
}