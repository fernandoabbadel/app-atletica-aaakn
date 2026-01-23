"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Calendar, Dumbbell, CreditCard, Menu, X, Wallet,
  Trophy, Gamepad2, ShoppingBag, Settings, HelpCircle, LogOut,
  ChevronRight, Handshake, Clock, CalendarRange, MessageCircle, MapPin,
  Crown, Medal, Star, ShieldCheck, User, Ghost, LogIn, Layout, Camera,
  Target, GraduationCap, Users, Lock // 🦈 Novos ícones importados
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// Interface do Usuário com Tier e Role
interface UserWithTier {
    uid?: string;
    nome: string;
    email: string;
    foto?: string;
    tier?: 'bicho' | 'atleta' | 'lenda' | 'standard'; 
    level?: number;
    role?: 'admin_geral' | 'admin_gestor' | 'master' | 'user'; // 🦈 Adicionado Role
}

interface NavItemProps {
    id: string;
    label: string;
    path?: string;
    icon: React.ReactNode; 
    action?: () => void;
    isMain?: boolean;
    badge?: string; // 🦈 Badge visual (ex: "Em Breve")
    badgeColor?: string; // Cor personalizada da badge
}

// 🦈 Componente de Badge de Sócio Atualizado
const TierBadge = ({ tier }: { tier: string }) => {
    switch(tier) {
        case 'lenda': return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-yellow-500/10 border-yellow-500/30 text-yellow-500"><Crown size={9}/><span className="text-[8px] font-black uppercase tracking-wider">SÓCIO LENDA</span></div>;
        case 'atleta': return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-zinc-300/10 border-zinc-300/30 text-zinc-300"><Star size={9}/><span className="text-[8px] font-black uppercase tracking-wider">SÓCIO ATLETA</span></div>;
        // 🦈 Default agora é Bicho (Bicho Solto)
        default: return <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-emerald-500/10 border-emerald-500/30 text-emerald-400"><Ghost size={9}/><span className="text-[8px] font-black uppercase tracking-wider">BICHO SOLTO</span></div>;
    }
};

// 🦈 Banner para Upgrade (Só aparece se não for Lenda)
const SocioGrowthBanner = ({ tier, router, closeMenu }: any) => {
    if (tier === 'lenda') return null;
    return (
        <button onClick={() => { closeMenu(); router.push('/planos'); }} className="w-full group relative overflow-hidden rounded-2xl mb-6 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl border border-yellow-400/30">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/40 via-amber-700/40 to-yellow-900/40 bg-[length:200%_200%] animate-[gradient_3s_ease_infinite]"></div>
            <div className="relative p-3 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"><Crown size={16} className="text-yellow-400" /></div>
                    <div className="text-left"><h4 className="text-xs font-black italic uppercase text-white">VIRE SÓCIO LENDA</h4><p className="text-[9px] font-medium text-zinc-300">Domine o Oceano</p></div>
                </div>
                <ChevronRight size={16} className="text-yellow-500/50 group-hover:text-yellow-400 transition-colors" />
            </div>
        </button>
    );
};

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, checkPermission } = useAuth() as any;
  const currentUser = user as unknown as UserWithTier; 

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  // 🦈 Verificação de Admin para mostrar badge extra
  const isAdmin = checkPermission ? checkPermission(["admin_geral", "admin_gestor", "master"]) : false;

  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
        lastScrollY.current = currentScrollY;
    };
    
    const resetTimer = () => {
        setIsVisible(true);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (!isSidebarOpen && window.scrollY > 10) setIsVisible(false);
        }, 3000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    
    resetTimer();

    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("click", resetTimer);
        window.removeEventListener("touchstart", resetTimer);
    };
  }, [isSidebarOpen]);

  const handleNavigation = (path: string) => { setIsSidebarOpen(false); router.push(path); };
  const handleLogout = () => { if (logout) logout(); setIsSidebarOpen(false); router.push("/"); };

  // --- CONFIGURAÇÃO DOS MENUS ---

  const bottomItems: NavItemProps[] = [
      { id: 'home', label: 'Início', icon: <Home size={22}/>, path: '/dashboard' },
      { id: 'eventos', label: 'Eventos', icon: <Calendar size={22}/>, path: '/eventos' },
      { id: 'gym', label: 'Gym Rats', icon: <Dumbbell size={28}/>, path: '/em-breve', isMain: true }, // Redireciona para Em Breve
      { id: 'carteira', label: 'Carteira', icon: <Wallet size={22}/>, path: '/carteirinha' },
      { id: 'menu', label: 'Menu', icon: <Menu size={22}/>, action: () => setIsSidebarOpen(true) },
  ];
  
  const sidebarItemsGeneral: NavItemProps[] = [
      { id: 'loja', label: 'Lojinha', icon: <ShoppingBag size={18} />, path: '/loja' },
      { id: 'carteira_side', label: 'Carteirinha', icon: <CreditCard size={18} />, path: '/carteirinha' },
      { id: 'parceiros', label: 'Parceiros', icon: <Handshake size={18} />, path: '/parceiros' },
      { id: 'comunidade', label: 'Comunidade', icon: <MessageCircle size={18} />, path: '/comunidade' },
      { id: 'album', label: 'Álbum da Galera', icon: <Camera size={18} />, path: '/album' },
  ];

  const sidebarItemsAtleta: NavItemProps[] = [
      { id: 'treinos', label: 'Treinos', icon: <CalendarRange size={18} />, path: '/treinos' },
      // 🦈 ITENS TRAVADOS (EM BREVE)
      { id: 'arena', label: 'Arena Games', icon: <Gamepad2 size={18} />, path: '/em-breve', badge: "Em Breve" },
      { id: 'shark_round', label: 'Shark Round', icon: <Target size={18} />, path: '/em-breve', badge: "Em Breve" }, // 🦈 Novo Botão
      { id: 'ranking', label: 'Ranking', icon: <Trophy size={18} />, path: '/em-breve', badge: "Em Breve" },
      { id: 'gym_side', label: 'Treinando com Tubarão', icon: <Dumbbell size={18} />, path: '/em-breve', badge: "Em Breve" },
  ];

  const sidebarItemsInfo: NavItemProps[] = [
      { id: 'ligas', label: 'Área das Ligas', icon: <Users size={18} />, path: '/ligas' }, // 🦈 Novo Botão
      { id: 'avaliacao', label: 'Avaliação Profs', icon: <GraduationCap size={18} />, path: '/avaliacao' }, // 🦈 Novo Botão
      { id: 'conquistas', label: 'Conquistas', icon: <Medal size={18} />, path: '/conquistas' },
      { id: 'fidelidade', label: 'Fidelidade', icon: <Star size={18} />, path: '/fidelidade' },
      { id: 'guia', label: 'Guia', icon: <HelpCircle size={18} />, path: '/guia' },
      { id: 'historico', label: 'Nossa História', icon: <Clock size={18} />, path: '/historico' },
  ];

  // Ocultar Navbar em páginas de auth
  if (["/", "/login", "/cadastro", "/empresa/cadastro"].includes(pathname)) return null;

  return (
    <>
      {/* Overlay Escuro */}
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[60] transition-opacity duration-500 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setIsSidebarOpen(false)}/>
      
      {/* Sidebar Container */}
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#09090b] border-r border-zinc-800 z-[70] transform transition-transform duration-500 flex flex-col shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Header Sidebar */}
        <div className="p-6 pb-4 border-b border-zinc-800 bg-black/40 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20"><img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain"/></div>
                <div><h2 className="text-lg font-black italic uppercase text-white leading-none">AAAKN</h2><p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">App Oficial</p></div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition"><X size={18}/></button>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
            
            {/* Box de Perfil */}
            {currentUser ? (
                <div onClick={() => handleNavigation('/perfil')} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 mb-6 cursor-pointer hover:bg-zinc-900 hover:border-emerald-500/30 transition group">
                    <div className="w-12 h-12 rounded-full bg-black overflow-hidden border-2 border-zinc-700 group-hover:border-emerald-500 transition"><img src={currentUser.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover"/></div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{currentUser.nome?.split(" ")[0]}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            <TierBadge tier={currentUser.tier || 'bicho'}/>
                            {/* 🦈 Badge de Admin (Só aparece se tiver permissão) */}
                            {isAdmin && <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border bg-red-500/10 border-red-500/30 text-red-500"><ShieldCheck size={9}/><span className="text-[8px] font-black uppercase tracking-wider">STAFF</span></div>}
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition"/>
                </div>
            ) : null}

            <SocioGrowthBanner tier={currentUser?.tier || 'bicho'} router={router} closeMenu={() => setIsSidebarOpen(false)} />

            {/* Seção Geral */}
            <div className="px-2 pt-2 pb-2"><h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Layout size={10}/> Menu Principal</h3></div>
            <div className="space-y-1">
                {sidebarItemsGeneral.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                        <div className={`p-1.5 rounded-lg ${pathname === item.path ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/70"}`}>{item.icon}</div>
                        <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Seção Atleta */}
            <div className="px-2 pt-6 pb-2 border-t border-zinc-800/50 mt-2"><h3 className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest"><Dumbbell size={10}/> Área do Atleta</h3></div>
            <div className="space-y-1">
                {sidebarItemsAtleta.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg ${pathname === item.path ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/70"}`}>{item.icon}</div>
                            <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                        </div>
                        {/* 🦈 Badge Verde "Em Breve" ou Lock */}
                        {item.badge && <span className="bg-emerald-900/30 text-emerald-500 border border-emerald-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><Lock size={8}/> {item.badge}</span>}
                    </button>
                ))}
            </div>

            {/* Seção Info */}
            <div className="px-2 pt-6 pb-2 border-t border-zinc-800/50 mt-2"><h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2 tracking-widest"><MapPin size={10}/> Central de Info</h3></div>
            <div className="space-y-1 pb-6">
                {sidebarItemsInfo.map((item) => (
                    <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                        <div className={`p-1.5 rounded-lg ${pathname === item.path ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/70"}`}>{item.icon}</div>
                        <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-3">
            {isAdmin && <button onClick={() => handleNavigation('/admin')} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/30 hover:text-red-400 transition"><ShieldCheck size={16}/><span className="text-xs font-black uppercase tracking-widest">Painel Admin</span></button>}
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleNavigation('/configuracoes')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-white hover:bg-zinc-800 transition"><Settings size={18}/><span className="text-[8px] font-bold uppercase mt-1">Ajustes</span></button>
                {currentUser ? (
                    <button onClick={handleLogout} className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-red-900/10 transition"><LogOut size={18}/><span className="text-[8px] font-bold uppercase mt-1">Sair</span></button>
                ) : (
                    <button onClick={() => router.push('/login')} className="flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-900 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-900/10 transition"><LogIn size={18}/><span className="text-[8px] font-bold uppercase mt-1">Entrar</span></button>
                )}
            </div>
        </div>
      </div>

      {/* Bottom Nav (Mobile) */}
      <div className={`fixed bottom-6 left-0 right-0 z-40 flex justify-center transition-transform duration-500 ${isVisible && !isSidebarOpen ? "translate-y-0" : "translate-y-[200%]"}`}>
        <nav className="bg-[#09090b]/90 backdrop-blur-xl border border-white/10 rounded-3xl px-1 py-1 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center justify-between w-[92%] max-w-md relative">
            {bottomItems.map((item) => (
                item.isMain ? (
                    <div key={item.id} className="relative -top-8 mx-1 group z-20">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-40 animate-pulse"></div>
                        <button onClick={() => router.push(item.path!)} className="relative w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500 text-black shadow-2xl border-[4px] border-[#09090b] transition-transform active:scale-95 group-hover:scale-105">
                            {item.icon}
                        </button>
                    </div>
                ) : (
                    <div key={item.id} className="flex-1 h-full flex justify-center">
                        <button onClick={item.action || (() => router.push(item.path!))} className={`w-full h-[60px] flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-90 transition-colors ${pathname === item.path ? "text-emerald-400" : "text-zinc-500 hover:text-zinc-300"}`}>
                            {item.icon}
                            <span className="text-[8px] font-bold uppercase tracking-wide">{item.label}</span>
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
      `}</style>
    </>
  );
}