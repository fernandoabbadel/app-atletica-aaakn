"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Edit3, Instagram, MessageCircle, Crown, 
  Star, Ghost, Fish, Swords, Share2, ShieldCheck, Loader2, 
  X, PawPrint, Users, Lock, Heart, UserCheck,
  Zap, Gem, Trophy, ShoppingBag, Medal, Calendar, Dumbbell, 
  ChevronRight, ThumbsUp, LayoutGrid, UserPlus, Target, User,
  Skull, Rocket, Clock, CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { 
  doc, getDoc, collection, query, getDocs, onSnapshot, where, limit 
} from "firebase/firestore";
import Link from "next/link";

// --- TIPAGEM ---
interface UserProfile {
  uid: string;
  nome: string;
  apelido?: string;
  foto?: string;
  turma?: string;
  bio?: string;
  cidadeOrigem?: string;
  dataNascimento?: string;
  instagram?: string;
  whatsappPublico?: boolean;
  idadePublica?: boolean;
  relacionamentoPublico?: boolean;
  telefone?: string;
  esportes?: string[];
  role?: string;
  
  plano?: string;        
  plano_cor?: string; 
  plano_icon?: string;
  patente?: string;
  patente_icon?: string;
  patente_cor?: string;
  tier?: 'bicho' | 'atleta' | 'lenda'; 
  
  level?: number;
  xp?: number;
  pets?: string;
  statusRelacionamento?: string;
  stats?: {
    arenaWins?: number;
    arenaLosses?: number;
    followersCount?: number;
    followingCount?: number;
    [key: string]: number | undefined;
  };
  [key: string]: string | number | boolean | undefined | null | object | string[];
}

interface FollowData {
    uid: string;
    nome: string;
    foto: string;
    turma: string;
}

const PLAN_COLORS: Record<string, string> = {
    yellow: "text-yellow-400", emerald: "text-emerald-400", purple: "text-purple-400",
    blue: "text-blue-400", red: "text-red-500", zinc: "text-zinc-400"
};

const getSportInfo = (sport: string) => {
    const map: Record<string, { emoji: string, label: string, color: string }> = {
        "futebol": { emoji: "⚽", label: "Futebol", color: "bg-green-500/20 text-green-400" },
        "futsal": { emoji: "👟", label: "Futsal", color: "bg-emerald-500/20 text-emerald-400" },
        "rugby": { emoji: "🏉", label: "Rugby", color: "bg-orange-500/20 text-orange-400" },
        "tenis": { emoji: "🎾", label: "Tênis", color: "bg-yellow-500/20 text-yellow-400" },
        "beach_tennis": { emoji: "🏖️", label: "Beach Tennis", color: "bg-yellow-600/20 text-yellow-500" },
        "natacao": { emoji: "🏊‍♂️", label: "Natação", color: "bg-cyan-500/20 text-cyan-400" },
        "surf": { emoji: "🏄‍♂️", label: "Surf", color: "bg-blue-500/20 text-blue-400" },
        "taco": { emoji: "🏏", label: "Taco", color: "bg-purple-500/20 text-purple-400" },
        "dog_walking": { emoji: "🐕", label: "Dog Walking", color: "bg-amber-800/20 text-amber-500" },
        "canoagem": { emoji: "🛶", label: "Canoagem", color: "bg-blue-800/20 text-blue-300" },
        "volei": { emoji: "🏐", label: "Vôlei", color: "bg-blue-400/20 text-blue-200" },
        "handebol": { emoji: "🤾", label: "Handebol", color: "bg-red-500/20 text-red-400" },
    };
    return map[sport.toLowerCase()] || { emoji: "🏅", label: sport, color: "bg-zinc-800 text-zinc-400" };
};

// 🦈 LEVEL BADGE
const LevelBadge = ({ xp }: { xp: number }) => {
    const [patentes, setPatentes] = useState<any[]>([]);
    useEffect(() => {
        const q = query(collection(db, "patentes_config")); 
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => d.data());
            data.sort((a, b) => a.minXp - b.minXp);
            if (data.length > 0) setPatentes(data);
            else setPatentes([{ titulo: "Plâncton", minXp: 0, cor: "text-zinc-400", iconName: "Fish" }]);
        });
        return () => unsub();
    }, []);
    const currentBadge = patentes.slice().reverse().find(p => xp >= p.minXp) || patentes[0];
    if (!currentBadge) return null;
    const IconMap: any = { Fish, Swords, Crown, Skull, Rocket, Star, Zap, Trophy, Medal, Heart };
    const IconComp = IconMap[currentBadge.iconName] || Fish;
    const colorClass = currentBadge.cor || "text-zinc-500";
    return (
        <div title={`${currentBadge.titulo} • ${xp} XP`} className={`relative group cursor-help p-2 rounded-full bg-zinc-900 border border-zinc-700 shadow-lg transition-transform hover:scale-110`}>
            <IconComp size={20} className={colorClass} />
        </div>
    );
};

// 🦈 PROFILE BADGES
const ProfileBadges = ({ userData }: { userData: UserProfile }) => {
    const isAdmin = userData?.role?.includes('admin') || userData?.role === 'master';
    const rawPlanIcon = userData?.plano_icon || 'user';
    const planIconName = String(rawPlanIcon).toLowerCase().trim();
    const rawPatentIcon = userData?.patente_icon || 'fish';
    const patentIconName = String(rawPatentIcon).toLowerCase().trim();
    const rawPlanColor = userData?.plano_cor || "text-zinc-400";
    const planColorClass = rawPlanColor.startsWith('text-') ? rawPlanColor : (PLAN_COLORS[rawPlanColor] || "text-zinc-400");
    const rawPatentColor = userData?.patente_cor || "text-zinc-400";
    const patentColorClass = rawPatentColor.startsWith('text-') ? rawPatentColor : (PLAN_COLORS[rawPatentColor] || "text-zinc-400");
    const icons: Record<string, React.ElementType> = { 
        ghost: Ghost, star: Star, crown: Crown, fish: Fish, trophy: Trophy, gem: Gem, zap: Zap, swords: Swords, 
        skull: Skull, rocket: Rocket, medal: Medal, heart: Heart, thumbsup: ThumbsUp, layoutgrid: LayoutGrid, 
        userplus: UserPlus, target: Target, user: User 
    };
    const PlanIcon = icons[planIconName] || User;
    const PatentIcon = icons[patentIconName] || Fish;

    return (
        <div className="flex items-center gap-5 bg-black/40 px-6 py-3 rounded-full border border-white/5 backdrop-blur-sm shadow-xl">
            {isAdmin && <div title="Admin" className="cursor-help transform hover:scale-110 transition-transform"><ShieldCheck size={24} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" /></div>}
            <div title={`Plano: ${userData.plano || "Visitante"}`} className={`cursor-help transform hover:scale-110 transition-transform ${planColorClass}`}><PlanIcon size={24} className="drop-shadow-sm" /></div>
            {planIconName !== patentIconName && <div className="w-px h-6 bg-zinc-700/50"></div>}
            {planIconName !== patentIconName && (<div title={`Patente: ${userData.patente || "Novato"}`} className={`cursor-help transform hover:scale-110 transition-transform ${patentColorClass}`}><PatentIcon size={28} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" /></div>)}
        </div>
    );
};

export default function MeuPerfilPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<FollowData[]>([]);
  const [followingList, setFollowingList] = useState<FollowData[]>([]);
  const [activeModal, setActiveModal] = useState<'followers' | 'following' | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'eventos' | 'treinos' | 'ligas'>('posts');
  
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [myEvents, setMyEvents] = useState<any[]>([]);
  const [myTreinos, setMyTreinos] = useState<any[]>([]);
  const [myLigas, setMyLigas] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const fetchProfile = async () => {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = { uid: docSnap.id, ...docSnap.data() } as UserProfile;
                setProfile(data);
                
                if (data.stats?.followersCount !== undefined) setFollowersCount(data.stats.followersCount);
                else { const snap = await getDocs(collection(db, "users", user.uid, "followers")); setFollowersCount(snap.size); }
                if (data.stats?.followingCount !== undefined) setFollowingCount(data.stats.followingCount);
                else { const snap = await getDocs(collection(db, "users", user.uid, "following")); setFollowingCount(snap.size); }

                // 1. POSTS
                const qPosts = query(collection(db, "posts"), where("userId", "==", user.uid), limit(20));
                getDocs(qPosts).then(snap => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
                    list.sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));
                    setRecentPosts(list.slice(0, 5));
                });

                // 2. EVENTOS
                const qEvents = query(collection(db, "eventos"), where("interessados", "array-contains", user.uid), limit(20));
                getDocs(qEvents).then(snap => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
                    list.sort((a, b) => { const da = a.data ? new Date(a.data).getTime() : 0; const db = b.data ? new Date(b.data).getTime() : 0; return da - db; });
                    setMyEvents(list.slice(0, 5));
                });

                // 3. LIGAS (ID 684)
                const qLigas = query(collection(db, "ligas_config"), where("membrosIds", "array-contains", user.uid));
                getDocs(qLigas).then(snap => setMyLigas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

                // 4. TREINOS (ID 687 - CORREÇÃO CRÍTICA)
                const qTreinos = query(collection(db, "treinos"), where("confirmados", "array-contains", user.uid), limit(20));
                getDocs(qTreinos).then(snap => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
                    // Ordenação simples por dia/horário se disponível
                    setMyTreinos(list.slice(0, 5));
                });

            } else { addToast("Perfil não encontrado.", "error"); }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchProfile();
  }, [user, authLoading, router]);

  const handleOpenList = async (type: 'followers' | 'following') => {
      if (!profile || !user) return;
      setActiveModal(type);
      const colName = type === 'followers' ? 'followers' : 'following';
      const q = query(collection(db, "users", user.uid, colName));
      const snap = await getDocs(q);
      const list = snap.docs.map(d => d.data() as FollowData);
      if(type === 'followers') setFollowersList(list);
      else setFollowingList(list);
  };

  if (loading || authLoading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;
  if (!profile) return null;

  const getIdade = () => { if (profile.dataNascimento) { const birth = new Date(profile.dataNascimento); const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--; return age; } return null; };
  const isWhatsappPrivate = profile.whatsappPublico === false;
  const isAgePrivate = profile.idadePublica === false;
  const isRelationPrivate = profile.relacionamentoPublico === false;
  const turmaImage = `/turma${profile.turma?.replace('T','') || '1'}.jpeg`;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      <div className="relative">
        <div className="h-48 w-full bg-zinc-900 overflow-hidden relative"><div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-[#050505]/50 to-[#050505] z-10"></div><img src={turmaImage} onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'} className="w-full h-full object-cover opacity-60 blur-[2px]"/><button onClick={() => router.push('/dashboard')} className="absolute top-6 left-6 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-black transition"><ArrowLeft size={20}/></button></div>
        <div className="px-6 relative z-20 -mt-16 flex flex-col items-center">
            <div className="relative mb-3 group">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-zinc-800 to-zinc-900 shadow-[0_0_40px_rgba(16,185,129,0.3)]"><img src={profile.foto || "https://github.com/shadcn.png"} className="w-full h-full rounded-full object-cover border-4 border-[#050505]"/></div>
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-black rounded-full border-2 border-[#050505] flex items-center justify-center shadow-lg z-30 overflow-hidden"><img src={turmaImage} className="w-full h-full object-cover"/></div>
            </div>
            <div className="text-center space-y-1 mb-4"><h1 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center justify-center gap-2">{profile.apelido || profile.nome.split(" ")[0]}{profile.role === 'master' && <ShieldCheck size={18} className="text-red-500" />}</h1><p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{profile.nome}</p><div className="flex items-center justify-center gap-2 mt-2"><span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300">{profile.turma || "Sem Turma"}</span>{getIdade() !== null && (<div className="relative group/age"><span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300 flex items-center gap-1">{getIdade()} Anos{isAgePrivate && <Lock size={8} className="text-zinc-500" />}</span></div>)}</div></div>
            <div className="mb-6"><ProfileBadges userData={profile} /></div>
            <div className="flex items-center gap-4 mb-6"><Link href="/cadastro" className="px-6 py-2 bg-zinc-800 rounded-full text-xs font-bold uppercase border border-zinc-700 hover:bg-zinc-700 hover:border-emerald-500 transition shadow-lg flex items-center gap-2"><Edit3 size={14}/> Editar Perfil</Link></div>
            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
                <button onClick={() => handleOpenList('followers')} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition active:scale-95"><span className="text-xl font-black text-white">{followersCount}</span><span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Seguidores</span></button>
                <button onClick={() => handleOpenList('following')} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition active:scale-95"><span className="text-xl font-black text-white">{followingCount}</span><span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Seguindo</span></button>
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center"><span className="text-xl font-black text-white">{profile.xp || 0}</span><span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">XP Total</span></div>
            </div>
            {profile.bio && <div className="w-full max-w-sm bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl mb-6 backdrop-blur-sm"><p className="text-sm text-zinc-300 text-center italic leading-relaxed">"{profile.bio}"</p></div>}
            <div className="flex gap-3 mb-8 justify-center w-full">
                {profile.instagram && <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-purple-500/20"><Instagram size={24}/></a>}
                {profile.telefone && (<div className="relative"><a href={`https://wa.me/55${profile.telefone.replace(/\D/g,'')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-green-500/20"><MessageCircle size={24}/></a>{isWhatsappPrivate && <div className="absolute -top-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700" title="Privado"><Lock size={10} className="text-zinc-400"/></div>}</div>)}
                <button className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition"><Share2 size={22}/></button>
            </div>

            <div className="w-full max-w-sm">
                <div className="flex justify-between border-b border-zinc-800 mb-4 overflow-x-auto">
                    {['posts', 'eventos', 'treinos', 'ligas'].map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === tab ? 'border-emerald-500 text-emerald-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>{tab}</button>
                    ))}
                </div>
                <div className="min-h-[200px]">
                    {/* POSTS */}
                    {activeTab === 'posts' && (
                        recentPosts.length > 0 ? (
                            <div className="space-y-2 animate-in fade-in">{recentPosts.map(p => (<div key={p.id} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl"><p className="text-xs text-zinc-300 truncate mb-1">"{p.texto}"</p><div className="flex justify-between items-center text-[10px] text-zinc-500"><div className="flex items-center gap-2"><span className="flex items-center gap-1"><Heart size={10}/> {p.likes?.length || 0}</span><span className="flex items-center gap-1"><MessageCircle size={10}/> {p.comentarios || 0}</span></div><span>{p.createdAt ? new Date(p.createdAt.toDate()).toLocaleDateString('pt-BR') : 'Hoje'}</span></div></div>))}<div className="text-center pt-2"><Link href="/comunidade" className="text-[10px] text-emerald-500 font-bold hover:underline">Ver Mais na Comunidade</Link></div></div>
                        ) : <div className="text-center text-zinc-600 text-xs py-4">Nenhum post recente.</div>
                    )}

                    {/* EVENTOS */}
                    {activeTab === 'eventos' && (
                        myEvents.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 animate-in fade-in">{myEvents.map(e => (<Link href={`/eventos/${e.id}`} key={e.id} className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-emerald-500/10"><div className="h-28 w-full bg-zinc-800 relative overflow-hidden"><img src={e.imagem || "https://placehold.co/600x400/111/333?text=Evento"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" style={{ objectPosition: `50% ${e.imagePositionY || 50}%` }}/><div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"/><div className="absolute bottom-2 left-2 right-2"><p className="text-[10px] font-black text-white uppercase truncate drop-shadow-md">{e.titulo}</p></div></div><div className="p-2 flex items-center justify-between bg-zinc-950"><div className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold uppercase"><Calendar size={10} className="text-emerald-500"/><span>{e.data || "Data à definir"}</span></div><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div></div></Link>))}</div>
                        ) : <div className="text-center text-zinc-600 text-xs py-4">Nenhum evento marcado.</div>
                    )}

                    {/* LIGAS (ID 685: Visual Grande) */}
                    {activeTab === 'ligas' && (
                        myLigas.length > 0 ? (
                            <div className="grid grid-cols-3 gap-4 animate-in fade-in">
                                {myLigas.map(l => (
                                    <Link href="/ligas_unitau" key={l.id} className="flex flex-col items-center gap-2 group">
                                        <div className="w-24 h-24 rounded-full bg-black border-2 border-zinc-800 p-0.5 group-hover:border-emerald-500 group-hover:scale-105 transition-all shadow-lg">
                                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center">
                                                {l.logoBase64 ? (
                                                    <img src={l.logoBase64} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users size={32} className="text-zinc-500"/>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider text-center line-clamp-1 w-full">{l.sigla || "Liga"}</span>
                                    </Link>
                                ))}
                            </div>
                        ) : <div className="text-center text-zinc-600 text-xs py-4">Não participa de ligas.</div>
                    )}

                    {/* TREINOS (Visual Melhorado com Foto) */}
                    {activeTab === 'treinos' && (
                        myTreinos.length > 0 ? (
                             <div className="grid gap-3 animate-in fade-in">
                                {myTreinos.map(t => (
                                    <Link href={`/treinos/${t.id}`} key={t.id} className="group flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-lg h-24">
                                        {/* Foto do Treino */}
                                        <div className="w-24 h-full bg-zinc-800 relative overflow-hidden shrink-0">
                                             <img
                                                src={t.imagem || "https://placehold.co/400x400/111/333?text=Treino"}
                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                             />
                                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900"/>
                                        </div>
                                        
                                        {/* Infos */}
                                        <div className="flex-1 p-3 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-black text-white uppercase truncate">{t.modalidade}</p>
                                                <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1">
                                                    <CheckCircle size={8}/> Eu Vou
                                                </div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-1 text-[10px] text-zinc-400 font-bold uppercase">
                                                <span className="flex items-center gap-1.5"><Calendar size={10} className="text-emerald-500"/> {t.dia}</span>
                                                <span className="flex items-center gap-1.5"><Clock size={10} className="text-emerald-500"/> {t.horario}</span>
                                                <span className="flex items-center gap-1.5"><MapPin size={10} className="text-emerald-500"/> {t.local}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                             </div>
                        ) : <div className="text-center text-zinc-600 text-xs py-4">Nenhum treino confirmado.</div>
                    )}
                </div>
            </div>

            {/* FICHA TÉCNICA */}
            <div className="w-full max-w-sm mt-8 border-t border-zinc-800 pt-6">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-zinc-500 mb-3">Ficha Técnica</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><MapPin size={16}/></div><div><p className="text-[9px] text-zinc-500 uppercase font-bold">Origem</p><p className="text-xs font-bold text-white">{profile.cidadeOrigem || "N/A"}</p></div></div>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Heart size={16}/></div><div><p className="text-[9px] text-zinc-500 uppercase font-bold">Status</p><div className="flex items-center gap-1"><p className="text-xs font-bold text-white uppercase">{profile.statusRelacionamento || "N/A"}</p>{isRelationPrivate && <span title="Privado"><Lock size={10} className="text-zinc-500"/></span>}</div></div></div>
                    {profile.pets && (<div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3 col-span-2"><div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><PawPrint size={16}/></div><div><p className="text-[9px] text-zinc-500 uppercase font-bold">Mascote</p><p className="text-xs font-bold text-white uppercase">{profile.pets}</p></div></div>)}
                </div>
                {profile.esportes && profile.esportes.length > 0 && (
                    <div className="pt-4"><h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-blue-500 mb-3">Modalidades</h3><div className="flex flex-wrap gap-2">{profile.esportes.map((sport, i) => { const info = getSportInfo(sport); return <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border border-white/5 shadow-sm ${info.color}`}><span className="text-sm">{info.emoji}</span> {info.label}</span>; })}</div></div>
                )}
            </div>
        </div>
      </div>
      {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-zinc-950 w-full max-w-sm rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                      <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">{activeModal === 'followers' ? <Users size={16} className="text-emerald-500"/> : <UserCheck size={16} className="text-blue-500"/>} {activeModal === 'followers' ? `Seguidores (${followersList.length})` : `Seguindo (${followingList.length})`}</h3>
                      <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-500 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {(activeModal === 'followers' ? followersList : followingList).length === 0 ? <div className="text-center py-10 text-zinc-600"><Ghost size={32} className="mx-auto mb-2 opacity-50"/><p className="text-xs">Nada por aqui.</p></div> : (activeModal === 'followers' ? followersList : followingList).map(f => (<Link href={`/perfil/${f.uid}`} key={f.uid} onClick={() => setActiveModal(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800"><div className="w-10 h-10 rounded-full bg-black overflow-hidden border border-zinc-700"><img src={f.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover"/></div><div><p className="text-sm font-bold text-white">{f.nome}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{f.turma || "Bicho"}</p></div></Link>))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}