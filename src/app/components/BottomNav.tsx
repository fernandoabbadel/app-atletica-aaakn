"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image"; // 🦈 Importação do Image
import {
  Home, Calendar, Dumbbell, CreditCard, Menu, X, Wallet,
  Trophy, Gamepad2, ShoppingBag, Settings, HelpCircle, LogOut,
  ChevronRight, Handshake, Clock, CalendarRange, MessageCircle, MapPin,
  Crown, Medal, Star, ShieldCheck, User, Ghost, LogIn, Layout, Camera,
  Target, GraduationCap, Users, Lock, Bell, Fish, Swords, Zap, Gem,
  Skull, Rocket, Heart, ThumbsUp, LayoutGrid, UserPlus
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";

// --- TIPAGEM ATUALIZADA 🦈 ---

// Interface auxiliar para datas do Firestore
interface FirestoreTimestamp {
    toDate: () => Date;
}

interface UserData {
    uid: string;
    nome: string;
    foto?: string;
    turma?: string;
    tier?: 'bicho' | 'atleta' | 'lenda' | 'standard'; 
    level?: number;
    role?: 'admin_geral' | 'admin_gestor' | 'master' | 'user';
    
    // Novos campos dinâmicos (Visual)
    plano?: string;
    plano_cor?: string;
    plano_icon?: string;
    
    patente?: string;
    patente_icon?: string;
    patente_cor?: string;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: FirestoreTimestamp | Date | null;
}

interface NavItemProps {
    id: string;
    label: string;
    path?: string;
    icon: React.ReactNode; 
    action?: () => void;
    isMain?: boolean;
    badge?: string;
}

interface BannerProps {
    tier: string;
    closeMenu: () => void;
    router: ReturnType<typeof useRouter>;
}

// Mapa de Turmas
const TURMA_IMAGENS: Record<string, string> = {
    "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
    "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
    "T7": "/turma7.jpeg", "T8": "/turma8.jpeg"
};

// 🦈 CONSTANTE DE CORES
const PLAN_COLORS: Record<string, string> = {
    yellow: "text-yellow-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    blue: "text-blue-400",
    red: "text-red-500",
    zinc: "text-zinc-400"
};

// 🦈 COMPONENTE VISUAL INTELIGENTE
const UserBadges = ({ userData }: { userData: UserData }) => {
    // Verifica Admin
    const isAdmin = userData?.role === 'master' || userData?.role === 'admin_geral' || userData?.role === 'admin_gestor';
    
    // 1. Tratamento do Ícone do PLANO
    const rawPlanIcon = userData?.plano_icon || 'user';
    const planIconName = String(rawPlanIcon).toLowerCase().trim();

    // 2. Tratamento do Ícone da PATENTE
    const rawPatentIcon = userData?.patente_icon || 'fish';
    const patentIconName = String(rawPatentIcon).toLowerCase().trim();
    
    // 3. Tratamento das Cores (SEPARADAS)
    const rawPlanColor = userData?.plano_cor || "text-zinc-400";
    const planColorClass = rawPlanColor.startsWith('text-') ? rawPlanColor : (PLAN_COLORS[rawPlanColor] || "text-zinc-400");

    const rawPatentColor = userData?.patente_cor || "text-zinc-400";
    const patentColorClass = rawPatentColor.startsWith('text-') ? rawPatentColor : (PLAN_COLORS[rawPatentColor] || "text-zinc-400");

    // Mapa Visual Completo Tipado
    const icons: Record<string, React.ElementType> = { 
        ghost: Ghost, star: Star, crown: Crown, fish: Fish, 
        trophy: Trophy, gem: Gem, zap: Zap, swords: Swords, 
        skull: Skull, rocket: Rocket, medal: Medal, heart: Heart,
        thumbsup: ThumbsUp, layoutgrid: LayoutGrid, userplus: UserPlus, 
        target: Target, user: User 
    };
    
    const PlanIcon = icons[planIconName] || User;
    const PatentIcon = icons[patentIconName] || Fish;

    // Tooltip
    const tooltipText = `${userData?.patente || 'Novato'} • ${userData?.plano || 'Visitante'}`;

    return (
        <div className="flex items-center gap-1.5" title={tooltipText}>
            
            {/* 1. Ícone de Admin */}
            {isAdmin && (
                <span className="flex items-center bg-red-500/10 p-0.5 rounded border border-red-500/20">
                    <ShieldCheck size={12} className="text-red-500" />
                </span>
            )}

            {/* 2. Ícone do Plano */}
            <span className={`flex items-center opacity-80 ${planColorClass}`}>
                <PlanIcon size={14} />
            </span>

            {/* 3. Ícone da Patente (Sem duplicar se for igual) */}
            {planIconName !== patentIconName && (
                <span className={`flex items-center ${patentColorClass}`}>
                    <PatentIcon size={16} className="drop-shadow-sm" />
                </span>
            )}
        </div>
    );
};

// Ícone de Nível (Gamification)
const LevelIcon = ({ level }: { level: number }) => {
    if (level === 1) return <Fish className="text-orange-400" size={12} />; 
    if (level === 2) return <Swords className="text-blue-400" size={12} />;
    if (level >= 5) return <Crown className="text-yellow-400" size={12} />;
    return <Fish className="text-zinc-500" size={12} />;
};

// Banner Dourado
const SocioGrowthBanner = ({ tier, closeMenu, router }: BannerProps) => {
    if (tier === 'lenda') return null;
    return (
        <button onClick={() => { closeMenu(); router.push('/planos'); }} className="w-full group relative overflow-hidden rounded-2xl mb-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-xl border border-yellow-400/30">
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
  const { user, logout } = useAuth();
  const currentUser = user as unknown as UserData;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bannedMessagesCount, setBannedMessagesCount] = useState(0); 
  const lastScrollY = useRef(0);

  const isAdmin = currentUser?.role === 'master' || currentUser?.role === 'admin_geral' || currentUser?.role === 'admin_gestor';

  // --- 1. SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => {
        const currentScrollY = window.scrollY;
        setIsVisible(currentScrollY <= lastScrollY.current || currentScrollY <= 20);
        lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- 2. NOTIFICAÇÕES (USUÁRIO) ---
  useEffect(() => {
      if (!user) return;
      const q = query(collection(db, "notifications"), where("userId", "==", user.uid));
      
      const unsub = onSnapshot(q, (snap) => {
          const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
          list.sort((a, b) => {
              const dateA = (a.createdAt && 'toDate' in a.createdAt) ? a.createdAt.toDate().getTime() : 0;
              const dateB = (b.createdAt && 'toDate' in b.createdAt) ? b.createdAt.toDate().getTime() : 0;
              return dateB - dateA;
          });
          setNotifications(list.slice(0, 20)); 
          setUnreadCount(list.filter(n => !n.read).length);
      });
      return () => unsub();
  }, [user]);

  // 🔥 3. NOTIFICAÇÕES (ADMIN - BANNED APPEALS) ---
  useEffect(() => {
      if (!isAdmin) return;
      const q = query(collection(db, "banned_appeals"), where("readByAdmin", "==", false));
      const unsub = onSnapshot(q, (snap) => {
          setBannedMessagesCount(snap.size);
      });
      return () => unsub();
  }, [isAdmin]);

  // --- FUNÇÕES AUXILIARES ---
  const handleNotificationClick = async (notif: Notification) => {
      if (!notif.read) await updateDoc(doc(db, "notifications", notif.id), { read: true });
      if (notif.link) { router.push(notif.link); setShowNotifications(false); setIsSidebarOpen(false); }
  };

  const formatTimeAgo = (ts: FirestoreTimestamp | Date | null | undefined) => {
      if (!ts) return "";
      const date = (ts && 'toDate' in ts) ? ts.toDate() : new Date(ts as Date);
      const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
      if (diff < 1) return "agora";
      if (diff < 60) return `${diff}min`;
      const hours = Math.floor(diff / 60);
      if (hours < 24) return `${hours}h`;
      return `${Math.floor(hours / 24)}d`;
  };

  const handleNavigation = (path: string) => { setIsSidebarOpen(false); router.push(path); };
  const handleLogout = () => { if (logout) logout(); setIsSidebarOpen(false); router.push("/"); };

  // --- 4. VERIFICAÇÃO DE ROTA ---
  const isHiddenRoute = ["/", "/login", "/cadastro", "/banned"].includes(pathname || "") || pathname?.startsWith("/empresa") || pathname?.startsWith("/admin");
  
  if (isHiddenRoute) return null;

  // --- ITENS DE MENU ---
  const bottomItems: NavItemProps[] = [
      { id: 'home', label: 'Início', icon: <Home size={22}/>, path: '/dashboard' },
      { id: 'eventos', label: 'Eventos', icon: <Calendar size={22}/>, path: '/eventos' },
      { id: 'gym', label: 'Gym Rats', icon: <Dumbbell size={28}/>, path: '/em-breve', isMain: true },
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
      { id: 'arena', label: 'Arena Games', icon: <Gamepad2 size={18} />, path: '/em-breve', badge: "Em Breve" },
      { id: 'shark_round', label: 'Shark Round', icon: <Target size={18} />, path: '/sharkround' },
      { id: 'ranking', label: 'Ranking', icon: <Trophy size={18} />, path: '/em-breve', badge: "Em Breve" },
      { id: 'gym_side', label: 'Treinando com Tubarão', icon: <Dumbbell size={18} />, path: '/em-breve', badge: "Em Breve" },
  ];

  const sidebarItemsInfo: NavItemProps[] = [
      { id: 'ligas', label: 'Área das Ligas', icon: <Users size={18} />, path: '/ligas_unitau' },
      { id: 'avaliacao', label: 'Avaliação Profs', icon: <GraduationCap size={18} />, path: '/avaliacao' },
      { id: 'conquistas', label: 'Conquistas', icon: <Medal size={18} />, path: '/conquistas' },
      { id: 'fidelidade', label: 'Fidelidade', icon: <Star size={18} />, path: '/fidelidade' },
      { id: 'guia', label: 'Guia', icon: <HelpCircle size={18} />, path: '/guia' },
      { id: 'historico', label: 'Nossa História', icon: <Clock size={18} />, path: '/historico' },
  ];

  const userTurmaImg = currentUser?.turma ? TURMA_IMAGENS[currentUser.turma] : null;

  return (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[60] transition-opacity duration-500 ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} onClick={() => setIsSidebarOpen(false)}/>
      
      <div className={`fixed top-0 left-0 h-full w-[85%] max-w-[320px] bg-[#09090b] border-r border-zinc-800 z-[70] transform transition-transform duration-500 flex flex-col shadow-2xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* HEADER: LOGO AAAKN + NOTIFICAÇÕES */}
        <div className="p-6 pb-4 border-b border-zinc-800 bg-black/40 backdrop-blur-sm flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-900/20 relative">
                    <Image src="/logo.png" alt="Logo" fill className="object-contain p-1" unoptimized/>
                </div>
                <div>
                    <h2 className="text-lg font-black italic uppercase text-white leading-none">AAAKN</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">App Oficial</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition relative">
                    <Bell size={18}/>
                    {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-900 animate-pulse"></span>}
                </button>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition"><X size={18}/></button>
            </div>
        </div>

        {/* ÁREA DE NOTIFICAÇÕES */}
        {showNotifications && (
            <div className="absolute top-[72px] left-0 w-full h-[calc(100%-72px)] bg-zinc-950 z-20 overflow-y-auto animate-in slide-in-from-top-2 border-t border-zinc-800">
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Notificações</h3>
                        <button onClick={() => setShowNotifications(false)} className="text-[10px] text-emerald-500 font-bold">Fechar</button>
                    </div>
                    {notifications.length === 0 && <p className="text-center text-xs text-zinc-600 py-4">Tudo limpo por aqui.</p>}
                    {notifications.map(n => (
                        <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-3 rounded-xl border cursor-pointer transition flex flex-col gap-1 ${n.read ? "bg-zinc-900/50 border-zinc-800 opacity-60" : "bg-zinc-900 border-emerald-500/30"}`}>
                            <div className="flex justify-between items-start w-full">
                                <h4 className={`text-xs font-bold ${n.read ? "text-zinc-400" : "text-white"}`}>{n.title}</h4>
                                <div className="flex items-center gap-2"><span className="text-[9px] text-zinc-600 font-mono">{formatTimeAgo(n.createdAt)}</span>{!n.read && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>}</div>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-snug">{n.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* CONTEÚDO SCROLLÁVEL */}
        {!showNotifications && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
                
                {/* 🦈 BOX DE PERFIL (COM BADGE DINÂMICA) */}
                {currentUser && (
                    <div onClick={() => handleNavigation('/perfil')} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-2xl border border-zinc-800 mb-4 cursor-pointer hover:bg-zinc-900 hover:border-emerald-500/30 transition group">
                        {/* Foto */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full bg-black overflow-hidden border-2 border-zinc-700 group-hover:border-emerald-500 transition relative">
                                <Image src={currentUser.foto || "https://github.com/shadcn.png"} alt="User" fill className="object-cover" unoptimized/>
                            </div>
                            {userTurmaImg && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border border-zinc-900 overflow-hidden shadow-sm relative" title={`Turma ${currentUser.turma}`}>
                                    <Image src={userTurmaImg} alt="Turma" fill className="object-cover" unoptimized/>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser.nome?.split(" ")[0]}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5" title={`Nível ${currentUser.level || 1}`}>
                                    <LevelIcon level={currentUser.level || 1} />
                                    <span className="text-[9px] font-mono text-zinc-400">Nv.{currentUser.level || 1}</span>
                                </div>
                                {/* 🦈 Badge Dinâmica Aqui */}
                                <div className="flex items-center h-5 bg-black/40 rounded border border-white/5 px-1.5">
                                    <UserBadges userData={currentUser} />
                                </div>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-zinc-600 group-hover:text-emerald-500 transition"/>
                    </div>
                )}

                {/* Banner de Upgrade */}
                <SocioGrowthBanner tier={currentUser?.tier || 'bicho'} closeMenu={() => setIsSidebarOpen(false)} router={router} />

                {/* Menus */}
                <div className="px-2 pt-2 pb-2"><h3 className="text-[10px] font-black text-zinc-500 uppercase flex items-center gap-2"><Layout size={10}/> Menu Principal</h3></div>
                <div className="space-y-1">
                    {sidebarItemsGeneral.map((item) => (
                        <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                            <div className={`p-1.5 rounded-lg ${pathname === item.path ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/70"}`}>{item.icon}</div>
                            <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </div>

                <div className="px-2 pt-6 pb-2 border-t border-zinc-800/50 mt-2"><h3 className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-2 tracking-widest"><Dumbbell size={10}/> Área do Atleta</h3></div>
                <div className="space-y-1">
                    {sidebarItemsAtleta.map((item) => (
                        <button key={item.id} onClick={() => handleNavigation(item.path!)} className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${pathname === item.path ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${pathname === item.path ? "text-emerald-400" : "text-zinc-500 group-hover:text-emerald-500/70"}`}>{item.icon}</div>
                                <span className="text-xs font-bold uppercase tracking-wide">{item.label}</span>
                            </div>
                            {item.badge && <span className="bg-emerald-900/30 text-emerald-500 border border-emerald-500/20 text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1"><Lock size={8}/> {item.badge}</span>}
                        </button>
                    ))}
                </div>

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
        )}

        <div className="p-4 border-t border-zinc-800 bg-zinc-950 space-y-3">
            {isAdmin && (
                <button onClick={() => handleNavigation('/admin')} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/30 hover:text-red-400 transition relative">
                    <ShieldCheck size={16}/>
                    <span className="text-xs font-black uppercase tracking-widest">Painel Admin</span>
                    {/* 🔴 BOLINHA VERMELHA (NOVA) */}
                    {bannedMessagesCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#09090b] animate-bounce">{bannedMessagesCount}</span>}
                </button>
            )}
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
      `}</style>
    </>
  );
}