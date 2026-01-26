"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Edit3, Instagram, MessageCircle, Crown, 
  Star, Ghost, Fish, Swords, Share2, ShieldCheck, Loader2, 
  X, PawPrint, Users, Lock, Heart, UserCheck
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { 
  doc, getDoc, collection, query, getDocs 
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
  tier?: 'bicho' | 'atleta' | 'lenda';
  level?: number;
  xp?: number;
  pets?: string;
  statusRelacionamento?: string;
  stats?: {
    arenaWins?: number;
    arenaLosses?: number;
  };
}

interface FollowData {
    uid: string;
    nome: string;
    foto: string;
    turma: string;
}

// --- EMOJIS ---
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

// --- BADGES ---
const LevelBadge = ({ level }: { level: number }) => {
    let icon = <Fish size={14} />;
    let color = "text-zinc-400";
    let title = "Plâncton";
    if (level >= 1) { icon = <Fish size={14} />; color = "text-orange-400"; title = "Peixe Palhaço"; }
    if (level >= 2) { icon = <Swords size={14} />; color = "text-blue-400"; title = "Barracuda"; }
    if (level >= 5) { icon = <Crown size={14} />; color = "text-yellow-400"; title = "Tubarão Rei"; }
    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 ${color} shadow-lg relative group cursor-help`}>
            {icon}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-zinc-800 pointer-events-none z-50">Nível {level}: {title}</span>
        </div>
    );
};

const PlanBadge = ({ tier }: { tier?: string }) => {
    let icon = <Ghost size={14} />;
    let color = "text-emerald-400";
    let title = "Bicho Solto";
    if (tier === 'atleta') { icon = <Star size={14} />; color = "text-zinc-300"; title = "Sócio Atleta"; }
    if (tier === 'lenda') { icon = <Crown size={14} />; color = "text-yellow-500"; title = "Sócio Lenda"; }
    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 ${color} shadow-lg relative group cursor-help`}>
            {icon}
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[9px] font-bold rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap border border-zinc-800 pointer-events-none z-50">{title}</span>
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

  // FETCH DATA
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push("/login"); return; }

    const fetchProfile = async () => {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setProfile({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
                
                const followersSnap = await getDocs(collection(db, "users", user.uid, "followers"));
                setFollowersCount(followersSnap.size);

                const followingSnap = await getDocs(collection(db, "users", user.uid, "following"));
                setFollowingCount(followingSnap.size);
            } else {
                addToast("Perfil não encontrado.", "error");
            }
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

  const isWhatsappPrivate = profile.whatsappPublico === false;
  const isAgePrivate = profile.idadePublica === false;
  const isRelationPrivate = profile.relacionamentoPublico === false;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24">
      
      {/* CAPA + FOTO */}
      <div className="relative">
        <div className="h-48 w-full bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 via-[#050505]/50 to-[#050505] z-10"></div>
            <img src={`/turma${profile.turma?.replace('T','') || '1'}.jpeg`} onError={(e) => e.currentTarget.src = 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438'} className="w-full h-full object-cover opacity-60 blur-[2px]"/>
            <button onClick={() => router.push('/dashboard')} className="absolute top-6 left-6 z-20 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 hover:bg-white hover:text-black transition"><ArrowLeft size={20}/></button>
        </div>

        <div className="px-6 relative z-20 -mt-16 flex flex-col items-center">
            <div className="relative mb-3 group">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-500 via-zinc-800 to-zinc-900 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                    <img src={profile.foto || "https://github.com/shadcn.png"} className="w-full h-full rounded-full object-cover border-4 border-[#050505]"/>
                </div>
                <div className="absolute bottom-1 right-1 w-10 h-10 bg-black rounded-full border-2 border-[#050505] flex items-center justify-center shadow-lg z-20">
                    <img src="/logo.png" className="w-6 h-6 object-contain"/>
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
                    {getIdade() !== null && (
                        <div className="relative group/age">
                            <span className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-[10px] font-black uppercase text-zinc-300 flex items-center gap-1">
                                {getIdade()} Anos
                                {isAgePrivate && <Lock size={8} className="text-zinc-500" />}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <PlanBadge tier={profile.tier || 'bicho'} />
                <Link href="/cadastro" className="px-8 py-2 bg-zinc-800 rounded-full text-xs font-bold uppercase border border-zinc-700 hover:bg-zinc-700 hover:border-emerald-500 transition shadow-lg flex items-center gap-2"><Edit3 size={14}/> Editar Perfil</Link>
                <LevelBadge level={profile.level || 1} />
            </div>

            {/* STATS ROW */}
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

            {/* REDES SOCIAIS */}
            <div className="flex gap-3 mb-8">
                {profile.instagram && <a href={`https://instagram.com/${profile.instagram.replace('@','')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-purple-500/20"><Instagram size={24}/></a>}
                
                {profile.telefone && (
                    <div className="relative">
                        <a href={`https://wa.me/55${profile.telefone.replace(/\D/g,'')}`} target="_blank" className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg hover:scale-110 transition hover:shadow-green-500/20"><MessageCircle size={24}/></a>
                        {isWhatsappPrivate && <div className="absolute -top-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-zinc-700" title="Privado"><Lock size={10} className="text-zinc-400"/></div>}
                    </div>
                )}
                
                <button className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 border border-zinc-700 hover:text-white hover:border-zinc-500 transition"><Share2 size={22}/></button>
            </div>

            {/* FICHA TÉCNICA */}
            <div className="w-full max-w-sm space-y-4">
                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-emerald-500">Ficha Técnica</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><MapPin size={16}/></div>
                        <div><p className="text-[9px] text-zinc-500 uppercase font-bold">Origem</p><p className="text-xs font-bold text-white">{profile.cidadeOrigem || "N/A"}</p></div>
                    </div>
                    
                    {/* Status de Relacionamento - CORRIGIDO */}
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-lg text-emerald-500"><Heart size={16}/></div>
                        <div>
                            <p className="text-[9px] text-zinc-500 uppercase font-bold">Status</p>
                            <div className="flex items-center gap-1">
                                <p className="text-xs font-bold text-white uppercase">{profile.statusRelacionamento || "N/A"}</p>
                                {/* Removido 'title' do componente Lock para evitar erro TS */}
                                {isRelationPrivate && <span title="Privado"><Lock size={10} className="text-zinc-500"/></span>}
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

                {/* Esportes */}
                {profile.esportes && profile.esportes.length > 0 && (
                    <div className="pt-4">
                        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest pl-2 border-l-2 border-blue-500 mb-3">Modalidades</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.esportes.map((sport, i) => {
                                const info = getSportInfo(sport);
                                return <span key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border border-white/5 shadow-sm ${info.color}`}><span className="text-sm">{info.emoji}</span> {info.label}</span>;
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* MODAL LISTAS */}
      {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in">
              <div className="bg-zinc-950 w-full max-w-sm rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                      <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
                          {activeModal === 'followers' ? <Users size={16} className="text-emerald-500"/> : <UserCheck size={16} className="text-blue-500"/>}
                          {activeModal === 'followers' ? `Seguidores (${followersList.length})` : `Seguindo (${followingList.length})`}
                      </h3>
                      <button onClick={() => setActiveModal(null)} className="p-1 text-zinc-500 hover:text-white"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {(activeModal === 'followers' ? followersList : followingList).length === 0 ? (
                          <div className="text-center py-10 text-zinc-600"><Ghost size={32} className="mx-auto mb-2 opacity-50"/><p className="text-xs">Nada por aqui.</p></div>
                      ) : (
                          (activeModal === 'followers' ? followersList : followingList).map(f => (
                              <Link href={`/perfil/${f.uid}`} key={f.uid} onClick={() => setActiveModal(null)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-900 transition border border-transparent hover:border-zinc-800">
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