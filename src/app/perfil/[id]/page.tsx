"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Edit3, Instagram, MessageCircle, Crown, 
  Star, Ghost, Fish, Swords, Share2, ShieldCheck, Loader2, 
  UserPlus, UserCheck, X, PawPrint, Users, Lock, Heart,
  Zap, Gem, Trophy, ShoppingBag, Medal 
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext"; 
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { 
  doc, getDoc, collection, query, getDocs, setDoc, deleteDoc, 
  addDoc, serverTimestamp, orderBy, onSnapshot 
} from "firebase/firestore";
import Link from "next/link";

// --- TIPAGEM BLINDADA ---
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
  tier?: 'bicho' | 'atleta' | 'lenda';
  
  level?: number;
  xp?: number;
  pets?: string;
  statusRelacionamento?: string;
  stats?: {
    arenaWins?: number;
    arenaLosses?: number;
    [key: string]: number | undefined;
  };
  
  [key: string]: string | number | boolean | undefined | null | object | string[];
}

interface FollowerUser {
    uid: string;
    nome: string;
    foto: string;
    turma: string;
}

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

// 🦈 BADGE DE NÍVEL (SOMENTE ÍCONE COM TOOLTIP)
const LevelBadge = ({ xp }: { xp: number }) => {
    const [patentes, setPatentes] = useState<any[]>([]);

    useEffect(() => {
        const q = query(collection(db, "patentes_config"), orderBy("minXp", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => d.data());
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
    
    // Borda baseada na cor
    let borderClass = "border-zinc-700";
    if (colorClass.includes("orange")) borderClass = "border-orange-500/50";
    if (colorClass.includes("blue")) borderClass = "border-blue-500/50";
    if (colorClass.includes("purple")) borderClass = "border-purple-500/50";
    if (colorClass.includes("emerald")) borderClass = "border-emerald-500/50";
    if (colorClass.includes("yellow")) borderClass = "border-yellow-500/50";
    if (colorClass.includes("red")) borderClass = "border-red-500/50";

    return (
        <div className={`relative group cursor-help p-3 rounded-full bg-zinc-900 border ${borderClass} shadow-lg transition-transform hover:scale-110`}>
            <IconComp size={20} className={colorClass} />
            
            {/* TOOLTIP */}
            <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-3 py-2 bg-black/95 text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-zinc-800 pointer-events-none z-50 shadow-2xl flex flex-col items-center min-w-[80px]">
                <span className={`uppercase tracking-wider ${colorClass} mb-0.5`}>{currentBadge.titulo}</span>
                <span className="text-zinc-500 font-mono text-[9px]">{xp} XP</span>
                <div className="w-2 h-2 bg-black border-r border-b border-zinc-800 absolute -bottom-1 rotate-45"></div>
            </div>
        </div>
    );
};

// 🦈 BADGE DE PLANO (SOMENTE ÍCONE COM TOOLTIP)
const PlanBadge = ({ nome, cor, iconName }: { nome?: string, cor?: string, iconName?: string }) => {
    const IconMap: Record<string, React.ElementType> = {
        'ghost': Ghost, 'star': Star, 'crown': Crown, 'fish': Fish,
        'zap': Zap, 'gem': Gem, 'trophy': Trophy, 'shopping': ShoppingBag
    };

    const IconComponent = (iconName && IconMap[iconName]) ? IconMap[iconName] : Ghost;
    const title = nome || "Bicho Solto";

    const getBadgeStyle = (c?: string) => {
        switch(c) {
            case 'yellow': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            case 'emerald': return 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10';
            case 'zinc': return 'text-zinc-400 border-zinc-500/50 bg-zinc-500/10';
            case 'purple': return 'text-purple-400 border-purple-500/50 bg-purple-500/10';
            case 'blue': return 'text-blue-400 border-blue-500/50 bg-blue-500/10';
            case 'red': return 'text-red-500 border-red-500/50 bg-red-500/10';
            default: return 'text-zinc-500 border-zinc-700 bg-zinc-900'; 
        }
    };

    const styleClass = getBadgeStyle(cor);

    return (
        <div className={`relative group cursor-help p-3 rounded-full border shadow-lg transition-transform hover:scale-110 ${styleClass}`}>
            <IconComponent size={20} className="animate-pulse-slow" />
            
            {/* TOOLTIP */}
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
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<FollowerUser[]>([]);
  const [followingList, setFollowingList] = useState<FollowerUser[]>([]);
  
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [activeListType, setActiveListType] = useState<'followers' | 'following'>('followers');

  const isOwnProfile = user?.uid === params.id;

  useEffect(() => {
    if (!params.id) return;
    const uid = params.id as string;

    const fetchProfile = async () => {
        try {
            const docRef = doc(db, "users", uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfile({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
                
                const followersSnap = await getDocs(collection(db, "users", uid, "followers"));
                setFollowersCount(followersSnap.size);

                const followingSnap = await getDocs(collection(db, "users", uid, "following"));
                setFollowingCount(followingSnap.size);

                if (user) {
                    const amIFollowing = followersSnap.docs.some(d => d.id === user.uid);
                    setIsFollowing(amIFollowing);
                }
            } else {
                addToast("Tubarão não encontrado.", "error");
                router.push("/dashboard");
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };
    fetchProfile();
  }, [params.id, user]);

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

              await addDoc(collection(db, "notifications"), {
                  userId: profile.uid, title: "Novo Seguidor! 🦈",
                  message: `${user.nome} começou a te seguir.`,
                  link: `/perfil/${user.uid}`, read: false, type: "social",
                  createdAt: serverTimestamp()
              });
              setIsFollowing(true);
              setFollowersCount(p => p + 1);
              addToast("Seguindo!", "success");
          }
      } catch { addToast("Erro ao seguir.", "error"); }
  };

  const handleOpenList = async (type: 'followers' | 'following') => {
      if (!profile) return;
      setActiveListType(type);
      setShowFollowersModal(true);
      
      const colName = type === 'followers' ? 'followers' : 'following';
      const q = query(collection(db, "users", profile.uid, colName));
      const snap = await getDocs(q);
      
      if (type === 'followers') setFollowersList(snap.docs.map(d => d.data() as FollowerUser));
      else setFollowingList(snap.docs.map(d => d.data() as FollowerUser));
  };

  // 🦈 Helper para definir badge
  const getBadgeProps = () => {
      if (!profile) return { nome: 'Carregando...', cor: 'zinc', iconName: 'ghost' };
      if (profile.plano) {
          return { nome: profile.plano, cor: profile.plano_cor, iconName: profile.plano_icon };
      }
      if (profile.tier === 'atleta') return { nome: 'Atleta', cor: 'emerald', iconName: 'zap' };
      if (profile.tier === 'lenda') return { nome: 'Lenda', cor: 'yellow', iconName: 'crown' };
      return { nome: 'Bicho Solto', cor: 'zinc', iconName: 'ghost' };
  };

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" size={40}/></div>;
  if (!profile) return null;

  const getIdade = () => {
      if (profile.dataNascimento) {
          const birth = new Date(profile.dataNascimento);
          const today = new Date();
          let age = today.getFullYear() - birth.getFullYear();
          const m = today.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
          return age;
      }
      return null;
  };

  const showAge = isOwnProfile || profile.idadePublica;
  const showWhatsapp = isOwnProfile || profile.whatsappPublico;
  const showRelacionamento = isOwnProfile || profile.relacionamentoPublico;
  const badgeProps = getBadgeProps();
  
  // 🦈 IMAGEM DA TURMA (FALLBACK)
  const turmaImage = `/turma${profile.turma?.replace('T','') || '1'}.jpeg`;

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
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-zinc-800 to-zinc-900 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <img src={profile.foto || "https://github.com/shadcn.png"} className="w-full h-full rounded-full object-cover border-4 border-[#050505]"/>
                </div>
                {/* 🦈 FOTO DA TURMA NO CÍRCULO PEQUENO */}
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-black rounded-full border-2 border-[#050505] flex items-center justify-center shadow-lg z-30 overflow-hidden">
                    <img src={turmaImage} className="w-full h-full object-cover"/>
                </div>
            </div>

            <div className="text-center space-y-1 mb-4">
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center justify-center gap-2">
                    {profile.apelido || profile.nome.split(" ")[0]}
                    {profile.role === 'master' && <ShieldCheck size={18} className="text-red-500" />}
                </h1>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">{profile.nome}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300">{profile.turma || "Sem Turma"}</span>
                    {showAge && getIdade() !== null && (
                        <div className="relative group/age">
                            <span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300 flex items-center gap-1">
                                {getIdade()} Anos
                                {profile.idadePublica === false && isOwnProfile && <Lock size={8} className="text-zinc-500"/>}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-6 mb-6 justify-center w-full">
                
                {/* 🦈 Badge do Plano (Somente Ícone) */}
                <PlanBadge 
                    nome={badgeProps.nome} 
                    cor={badgeProps.cor} 
                    iconName={badgeProps.iconName}
                />
                
                {isOwnProfile ? (
                    <Link href="/cadastro" className="px-8 py-2 bg-zinc-800 rounded-full text-xs font-bold uppercase border border-zinc-700 hover:bg-zinc-700 hover:border-emerald-500 transition shadow-lg flex items-center gap-2"><Edit3 size={14}/> Editar Perfil</Link>
                ) : (
                    <button onClick={handleFollow} className={`px-8 py-2 rounded-full text-xs font-bold uppercase border transition shadow-lg flex items-center gap-2 ${isFollowing ? 'bg-zinc-900 border-zinc-700 text-zinc-400' : 'bg-emerald-600 border-emerald-500 text-white hover:scale-105'}`}>{isFollowing ? <UserCheck size={14}/> : <UserPlus size={14}/>} {isFollowing ? "Seguindo" : "Seguir"}</button>
                )}
                
                {/* 🦈 Badge de Nível (Somente Ícone) */}
                <LevelBadge xp={profile.xp || 0} />
            </div>

            <div className="grid grid-cols-3 gap-3 w-full max-w-sm mb-8">
                <button onClick={() => handleOpenList('followers')} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition active:scale-95">
                    <span className="text-xl font-black text-white">{followersCount}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Seguidores</span>
                </button>
                <button onClick={() => handleOpenList('following')} className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center hover:bg-zinc-800 transition active:scale-95">
                    <span className="text-xl font-black text-white">{followingCount}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Seguindo</span>
                </button>
                <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center">
                    <span className="text-xl font-black text-white">{profile.xp || 0}</span>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">XP Total</span>
                </div>
            </div>
            
            {profile.bio && <div className="w-full max-w-sm bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-2xl mb-6 backdrop-blur-sm"><p className="text-sm text-zinc-300 text-center italic leading-relaxed">"{profile.bio}"</p></div>}

             <div className="flex gap-3 mb-8 justify-center w-full">
                {profile.instagram && <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-purple-500/20"><Instagram size={24}/></a>}
                
                {profile.telefone && (
                    <div className="relative">
                        {showWhatsapp ? (
                            <a href={`https://wa.me/55${profile.telefone.replace(/\D/g,'')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-green-500/20"><MessageCircle size={24}/></a>
                        ) : (
                            <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center text-zinc-600 border border-zinc-800 cursor-not-allowed" title="Privado"><Lock size={20}/></div>
                        )}
                        {profile.whatsappPublico === false && isOwnProfile && <div className="absolute -top-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700"><Lock size={10} className="text-zinc-400"/></div>}
                    </div>
                )}
                <button className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition"><Share2 size={22}/></button>
            </div>
            
            <div className="w-full max-w-sm space-y-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">Ficha Técnica</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><MapPin size={16}/></div>
                        <div><p className="text-[9px] text-zinc-500 uppercase font-bold">Origem</p><p className="text-xs font-bold text-white">{profile.cidadeOrigem || "N/A"}</p></div>
                    </div>
                    
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Heart size={16}/></div>
                        <div>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold">Status</p>
                            <div className="flex items-center gap-1">
                                <p className="text-xs font-bold text-white uppercase truncate max-w-[80px]">
                                    {showRelacionamento ? (profile.statusRelacionamento || "N/A") : "Privado"}
                                </p>
                                {profile.relacionamentoPublico === false && isOwnProfile && <Lock size={10} className="text-zinc-500"/>}
                                {!isOwnProfile && !showRelacionamento && <Lock size={10} className="text-zinc-600"/>}
                            </div>
                        </div>
                    </div>

                    {profile.pets && (
                        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3 col-span-2">
                            <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><PawPrint size={16}/></div>
                            <div><p className="text-[9px] text-zinc-500 uppercase font-bold">Mascote</p><p className="text-xs font-bold text-white uppercase">{profile.pets}</p></div>
                        </div>
                    )}
                </div>

                {profile.esportes && profile.esportes.length > 0 && (
                    <div className="pt-4">
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-blue-500 mb-3">Modalidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.esportes.map((sport: any, i: number) => {
                                const info = getSportInfo(sport);
                                return <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border border-white/5 shadow-sm ${info.color}`}><span className="text-sm">{info.emoji}</span> {info.label}</span>;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {showFollowersModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-zinc-950 w-full max-w-sm rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                      <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                          <Users size={16} className="text-emerald-500"/> 
                          {activeListType === 'followers' ? `Seguidores (${followersList.length})` : `Seguindo (${followingList.length})`}
                      </h3>
                      <button onClick={() => setShowFollowersModal(false)} className="p-1 text-zinc-500 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {(activeListType === 'followers' ? followersList : followingList).length === 0 ? (
                          <div className="text-center py-10 text-zinc-600"><Ghost size={32} className="mx-auto mb-2 opacity-50"/><p className="text-xs">Nada por aqui.</p></div>
                      ) : (
                          (activeListType === 'followers' ? followersList : followingList).map((f: any) => (
                              <Link href={`/perfil/${f.uid}`} key={f.uid} onClick={() => setShowFollowersModal(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800">
                                  <div className="w-10 h-10 rounded-full bg-black overflow-hidden border border-zinc-700"><img src={f.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover"/></div>
                                  <div><p className="text-sm font-bold text-white">{f.nome}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{f.turma || "Bicho"}</p></div>
                              </Link>
                          ))
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}