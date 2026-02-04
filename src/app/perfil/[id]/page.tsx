// ARQUIVO: src/app/perfil/[id]/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Edit3, Instagram, MessageCircle, Crown, 
  Star, Ghost, Fish, Swords, Share2, ShieldCheck, Loader2, 
  UserPlus, UserCheck, X, PawPrint, Users, Lock, Heart,
  Zap, Gem, Trophy, ShoppingBag, Medal, Calendar, Dumbbell, Clock, CheckCircle, EyeOff
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext"; 
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { 
  doc, getDoc, collection, query, getDocs, setDoc, deleteDoc, 
  addDoc, serverTimestamp, orderBy, onSnapshot, where, limit 
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
  status?: string; // 🦈 Adicionado para controle de pausa
  
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

// --- COMPONENTES VISUAIS ---

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
    const IconMap: any = { Fish, Swords, Crown, Skull: Ghost, Rocket: Star, Star, Zap, Trophy, Medal, Heart };
    const IconComp = IconMap[currentBadge.iconName] || Fish;
    const colorClass = currentBadge.cor || "text-zinc-500";
    let borderClass = "border-zinc-700";
    if (colorClass.includes("orange")) borderClass = "border-orange-500/50";
    else if (colorClass.includes("red")) borderClass = "border-red-500/50";
    else if (colorClass.includes("emerald")) borderClass = "border-emerald-500/50";
    else if (colorClass.includes("blue")) borderClass = "border-blue-500/50";
    else if (colorClass.includes("yellow")) borderClass = "border-yellow-500/50";

    return (
        <div title={`${currentBadge.titulo} • ${xp} XP`} className={`relative group cursor-help p-3 rounded-full bg-zinc-900 border ${borderClass} shadow-lg transition-transform hover:scale-110`}>
            <IconComp size={20} className={colorClass} />
        </div>
    );
};

const PlanBadge = ({ nome, cor, iconName }: { nome?: string, cor?: string, iconName?: string }) => {
    const IconMap: Record<string, React.ElementType> = {
        'ghost': Ghost, 'star': Star, 'crown': Crown, 'fish': Fish,
        'zap': Zap, 'gem': Gem, 'trophy': Trophy, 'shopping': ShoppingBag, 'user': Users
    };
    const IconComponent = (iconName && IconMap[iconName]) ? IconMap[iconName] : Ghost;
    const title = nome || "Bicho Solto";
    let styleClass = 'text-zinc-500 border-zinc-700 bg-zinc-900';
    if(cor === 'yellow') styleClass = 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
    else if(cor === 'emerald') styleClass = 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
    else if(cor === 'zinc') styleClass = 'text-zinc-400 border-zinc-500/50 bg-zinc-500/10';
    else if(cor === 'purple') styleClass = 'text-purple-400 border-purple-500/50 bg-purple-500/10';
    else if(cor === 'blue') styleClass = 'text-blue-400 border-blue-500/50 bg-blue-500/10';
    else if(cor === 'red') styleClass = 'text-red-500 border-red-500/50 bg-red-500/10';

    return (
        <div className={`relative group cursor-help p-3 rounded-full border shadow-lg transition-transform hover:scale-110 ${styleClass}`}>
            <IconComponent size={20} className="animate-pulse-slow" />
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/95 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-800 pointer-events-none z-50 shadow-2xl">
                <span className="uppercase tracking-wider">Plano {title}</span>
                <div className="w-2 h-2 bg-black border-r border-b border-zinc-800 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45"></div>
            </div>
        </div>
    );
};

export default function PerfilPublicoPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileHidden, setProfileHidden] = useState(false); // 🦈 Estado para perfil oculto
  
  const [isFollowing, setIsFollowing] = useState(false);
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

  // Verifica se sou eu mesmo
  const isOwnProfile = user?.uid === params.id;

  useEffect(() => {
    if (!params.id) return;
    const uid = params.id as string;

    const fetchProfile = async () => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = { uid: docSnap.id, ...docSnap.data() } as UserProfile;

                // 🦈 VERIFICAÇÃO DE CONTA DESATIVADA 
                // Se a conta tá desativada e NÃO sou eu, bloqueia a visualização
                if ((data.role === 'inactive' || data.status === 'paused') && !isOwnProfile) {
                    setProfileHidden(true);
                    setLoading(false);
                    return; // Para a execução aqui
                }

                setProfile(data);
                
                // Seguidores
                if (data.stats?.followersCount !== undefined) setFollowersCount(data.stats.followersCount);
                else { const snap = await getDocs(collection(db, "users", uid, "followers")); setFollowersCount(snap.size); }
                if (data.stats?.followingCount !== undefined) setFollowingCount(data.stats.followingCount);
                else { const snap = await getDocs(collection(db, "users", uid, "following")); setFollowingCount(snap.size); }

                // Check Follow
                if (user) {
                    const amIFollowingRef = doc(db, "users", uid, "followers", user.uid);
                    const docFollow = await getDoc(amIFollowingRef);
                    setIsFollowing(docFollow.exists());
                }

                // 1. POSTS
                const qPosts = query(collection(db, "posts"), where("userId", "==", uid), limit(20));
                getDocs(qPosts).then(snap => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
                    list.sort((a, b) => (b.createdAt?.toDate()?.getTime() || 0) - (a.createdAt?.toDate()?.getTime() || 0));
                    setRecentPosts(list.slice(0, 5));
                });

                // 2. EVENTOS
                const qEvents = query(collection(db, "eventos"), where("interessados", "array-contains", uid), limit(20));
                getDocs(qEvents).then(snap => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
                    list.sort((a, b) => { const da = a.data ? new Date(a.data).getTime() : 0; const db = b.data ? new Date(b.data).getTime() : 0; return da - db; });
                    setMyEvents(list.slice(0, 5));
                });

                // 3. LIGAS
                const qLigas = query(collection(db, "ligas_config"), where("membrosIds", "array-contains", uid));
                getDocs(qLigas).then(snap => setMyLigas(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

                // 4. TREINOS
                const qTreinos = query(collection(db, "treinos"), where("confirmados", "array-contains", uid), limit(20));
                getDocs(qTreinos).then(snap => {
                    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
                    setMyTreinos(list.slice(0, 5));
                });

            } else {
                addToast("Usuário não encontrado.", "error");
                router.push("/dashboard");
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchProfile();
  }, [params.id, user, isOwnProfile]);

  const handleFollow = async () => {
      if (!user || !profile) return;
      const targetFollowerRef = doc(db, "users", profile.uid, "followers", user.uid);
      const myFollowingRef = doc(db, "users", user.uid, "following", profile.uid);
      try {
          if (isFollowing) {
              await deleteDoc(targetFollowerRef);
              await deleteDoc(myFollowingRef);
              setIsFollowing(false);
              setFollowersCount(p => p - 1);
              addToast("Deixou de seguir.", "info");
          } else {
              const myData = { uid: user.uid, nome: user.nome, foto: user.foto || "", turma: user.turma || "" };
              const targetData = { uid: profile.uid, nome: profile.nome, foto: profile.foto || "", turma: profile.turma || "" };
              await setDoc(targetFollowerRef, { ...myData, followedAt: serverTimestamp() });
              await setDoc(myFollowingRef, { ...targetData, followedAt: serverTimestamp() });
              await addDoc(collection(db, "notifications"), { userId: profile.uid, title: "Novo Seguidor! 🦈", message: `${user.nome} começou a te seguir.`, link: `/perfil/${user.uid}`, read: false, type: "social", createdAt: serverTimestamp() });
              setIsFollowing(true);
              setFollowersCount(p => p + 1);
              addToast("Seguindo!", "success");
          }
      } catch { addToast("Erro ao seguir.", "error"); }
  };

  const handleOpenList = async (type: 'followers' | 'following') => {
      if (!profile) return;
      setActiveModal(type);
      
      const colName = type === 'followers' ? 'followers' : 'following';
      const q = query(collection(db, "users", profile.uid, colName));
      const snap = await getDocs(q);
      
      if (type === 'followers') setFollowersList(snap.docs.map(d => d.data() as FollowData));
      else setFollowingList(snap.docs.map(d => d.data() as FollowData));
  };

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;

  // 🦈 TELA DE PERFIL OCULTO (CONTA DESATIVADA)
  if (profileHidden) {
      return (
          <div className="min-h-screen bg-[#050505] text-zinc-500 font-sans flex flex-col items-center justify-center p-6 text-center">
              <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-black border border-zinc-800 animate-pulse">
                  <Ghost size={40} className="text-zinc-700"/>
              </div>
              <h1 className="text-2xl font-black text-zinc-400 uppercase tracking-tighter mb-2">Tubarão Adormecido</h1>
              <p className="text-sm font-medium text-zinc-600 max-w-xs mb-8">
                  Esta conta foi desativada temporariamente pelo usuário e está inacessível no momento.
              </p>
              <button onClick={() => router.back()} className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-600 transition flex items-center gap-2">
                  <ArrowLeft size={14}/> Voltar para o Cardume
              </button>
          </div>
      );
  }

  if (!profile) return null;

  const getIdade = () => { if (profile.dataNascimento) { const birth = new Date(profile.dataNascimento); const today = new Date(); let age = today.getFullYear() - birth.getFullYear(); if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--; return age; } return null; };
  const showAge = isOwnProfile || profile.idadePublica;
  const showWhatsapp = isOwnProfile || profile.whatsappPublico;
  const showRelacionamento = isOwnProfile || profile.relacionamentoPublico;
  const turmaImage = `/turma${profile.turma?.replace('T','') || '1'}.jpeg`;
  const badgeProps = { nome: profile.plano, cor: profile.plano_cor, iconName: profile.plano_icon };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      {/* CAPA + FOTO */}
      <div className="relative">
        <div className="h-48 w-full bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-[#050505]/50 to-[#050505] z-10"></div>
            <img src={turmaImage} onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'} className="w-full h-full object-cover opacity-60 blur-[2px]"/>
            <button onClick={() => router.back()} className="absolute top-6 left-6 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-black transition"><ArrowLeft size={20}/></button>
        </div>
        
        <div className="px-6 relative z-20 -mt-16 flex flex-col items-center">
            
            <div className="relative mb-3 group">
                {/* 🦈 AJUSTE VISUAL: Se pausado, foto em tons de cinza */}
                <div className={`w-32 h-32 rounded-full p-1 bg-gradient-to-tr shadow-[0_0_40px_rgba(16,185,129,0.3)] ${profile.status === 'paused' ? 'from-zinc-600 via-zinc-800 to-zinc-900 grayscale opacity-80' : 'from-emerald-500 via-zinc-800 to-zinc-900'}`}>
                    <img src={profile.foto || "https://github.com/shadcn.png"} className="w-full h-full rounded-full object-cover border-4 border-[#050505]"/>
                </div>
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-black rounded-full border-2 border-[#050505] flex items-center justify-center shadow-lg z-30 overflow-hidden"><img src={turmaImage} className="w-full h-full object-cover"/></div>
            </div>

            <div className="text-center space-y-1 mb-4">
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center justify-center gap-2">
                    {profile.apelido || profile.nome.split(" ")[0]}
                    {profile.role === 'master' && <ShieldCheck size={18} className="text-red-500" />}
                </h1>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{profile.nome}</p>
                
                {/* 🦈 INDICADOR PARA O PRÓPRIO DONO SE A CONTA TÁ PAUSADA */}
                {profile.status === 'paused' && isOwnProfile && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/30 rounded-full text-[10px] font-bold text-red-400 uppercase tracking-wide">
                        <EyeOff size={10} /> Perfil Oculto (Conta Pausada)
                    </div>
                )}

                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300">{profile.turma || "Sem Turma"}</span>
                    {showAge && getIdade() !== null && (<div className="relative group/age"><span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300 flex items-center gap-1">{getIdade()} Anos{!profile.idadePublica && <Lock size={8} className="text-zinc-500"/>}</span></div>)}
                </div>
            </div>
            
            <div className="flex items-center gap-6 mb-6 justify-center w-full">
                {/* Badge Plano (Isolada) */}
                <PlanBadge nome={badgeProps.nome} cor={badgeProps.cor} iconName={badgeProps.iconName} />

                {isOwnProfile ? (
                    <Link href="/cadastro" className="px-8 py-2 bg-zinc-800 rounded-full text-xs font-bold uppercase border border-zinc-700 hover:bg-zinc-700 hover:border-emerald-500 transition shadow-lg flex items-center gap-2"><Edit3 size={14}/> Editar Perfil</Link>
                ) : (
                    <button onClick={handleFollow} className={`px-8 py-2 rounded-full text-xs font-bold uppercase border transition shadow-lg flex items-center gap-2 ${isFollowing ? 'bg-zinc-900 border-zinc-700 text-zinc-400' : 'bg-emerald-600 border-emerald-500 text-white hover:scale-105'}`}>{isFollowing ? <UserCheck size={14}/> : <UserPlus size={14}/>} {isFollowing ? "Seguindo" : "Seguir"}</button>
                )}
                
                {/* Badge Nível */}
                <LevelBadge xp={profile.xp || 0} />
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
                <button onClick={() => handleOpenList('followers')} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition active:scale-95"><span className="text-xl font-black text-white">{followersCount}</span><span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Seguidores</span></button>
                <button onClick={() => handleOpenList('following')} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition active:scale-95"><span className="text-xl font-black text-white">{followingCount}</span><span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Seguindo</span></button>
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center"><span className="text-xl font-black text-white">{profile.xp || 0}</span><span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">XP Total</span></div>
            </div>

            {profile.bio && <div className="w-full max-w-sm bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl mb-6 backdrop-blur-sm"><p className="text-sm text-zinc-300 text-center italic leading-relaxed">"{profile.bio}"</p></div>}
            
            <div className="flex gap-3 mb-8 justify-center w-full">
                {profile.instagram && <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-purple-500/20"><Instagram size={24}/></a>}
                <div className="relative">
                    {showWhatsapp ? (
                         <a href={`https://wa.me/55${profile.telefone?.replace(/\D/g,'')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-green-500/20"><MessageCircle size={24}/></a>
                    ) : (
                         <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800 cursor-not-allowed"><Lock size={20}/></div>
                    )}
                    {profile.whatsappPublico === false && isOwnProfile && <div className="absolute -top-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700"><Lock size={10} className="text-zinc-400"/></div>}
                </div>
                <button className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition"><Share2 size={22}/></button>
            </div>

            {/* ABAS */}
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
                                            <div className="w-full h-full rounded-full overflow-hidden bg-zinc-900 flex items-center justify-center relative">
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

                    {/* TREINOS (CARD COM FOTO) */}
                    {activeTab === 'treinos' && (
                        myTreinos.length > 0 ? (
                             <div className="grid gap-3 animate-in fade-in">
                                {myTreinos.map(t => (
                                    <Link href={`/treinos/${t.id}`} key={t.id} className="group flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-all shadow-lg h-24">
                                        <div className="w-24 h-full bg-zinc-800 relative overflow-hidden shrink-0">
                                             <img src={t.imagem || "https://placehold.co/400x400/111/333?text=Treino"} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"/>
                                             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-900"/>
                                        </div>
                                        <div className="flex-1 p-3 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-black text-white uppercase truncate">{t.modalidade}</p>
                                                <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase flex items-center gap-1"><CheckCircle size={8}/> Eu Vou</div>
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
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3"><div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Heart size={16}/></div><div><p className="text-[9px] text-zinc-500 uppercase font-bold">Status</p><div className="flex items-center gap-1"><p className="text-xs font-bold text-white uppercase truncate max-w-[80px]">{showRelacionamento ? (profile.statusRelacionamento || "N/A") : "Privado"}</p>{!showRelacionamento && !isOwnProfile && <Lock size={10} className="text-zinc-600"/>}{profile.relacionamentoPublico === false && isOwnProfile && <Lock size={10} className="text-zinc-500"/>}</div></div></div>
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