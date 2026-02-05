"use client";

import React, { useState, useEffect } from "react";
import { 
  Camera, Edit2, LogOut, Award, Trophy, Zap, 
  Share2, Settings, Crown, GraduationCap, MapPin, Loader2, Save
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// 🦈 Interfaces para Tipagem
interface Badge {
  id: number;
  icon: string;
  name: string;
  desc: string;
  unlocked: boolean;
}

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  curso: string;
  semestre: string;
  bio: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  badges: Badge[];
  role?: string;
}

// Mock de Badges
const DEFAULT_BADGES: Badge[] = [
  { id: 1, icon: "/badges/shark-baby.png", name: "Baby Shark", desc: "Criou a conta", unlocked: true },
  { id: 2, icon: "/badges/party.png", name: "Inimigo do Fim", desc: "Foi em 5 festas", unlocked: false },
  { id: 3, icon: "/badges/gym.png", name: "Monstro do Lago", desc: "10 Check-ins na academia", unlocked: false },
  { id: 4, icon: "/badges/vip.png", name: "Rei do Camarote", desc: "Sócio Ouro", unlocked: false },
];

export default function PerfilPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // State para Edição
  const [formData, setFormData] = useState({
    displayName: "",
    curso: "",
    semestre: "",
    bio: ""
  });

  // 📡 Busca Dados do Perfil
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          // 🦈 O MARTELO DO TUBARÃO: "as any"
          // Isso força o TypeScript a aceitar os dados brutos do banco, permitindo nossa sanitização manual.
          const data = docSnap.data() as any; 
          
          const safeSemestre = data.semestre ? String(data.semestre) : "1º";
          const safeCurso = data.curso ? String(data.curso) : "Não informado";
          const safeBio = data.bio ? String(data.bio) : "Nadando contra a corrente...";
          const safeDisplayName = data.displayName || user.displayName || "Tubarão Anônimo";

          setProfile({
            uid: user.uid,
            displayName: safeDisplayName,
            email: user.email || "",
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(safeDisplayName)}&background=10b981&color=fff`,
            curso: safeCurso,
            semestre: safeSemestre,
            bio: safeBio,
            level: Number(data.level) || 1,
            xp: Number(data.xp) || 0,
            nextLevelXp: Number(data.nextLevelXp) || 1000,
            badges: data.badges || DEFAULT_BADGES,
            role: data.role
          });
          
          setFormData({
            displayName: safeDisplayName,
            curso: safeCurso,
            semestre: safeSemestre,
            bio: safeBio
          });
        }
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        addToast("Erro ao carregar cardume.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, addToast]); 

  // 💾 Salvar Edição
  const handleSave = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      
      const dataToUpdate = {
        displayName: formData.displayName,
        curso: formData.curso,
        semestre: formData.semestre,
        bio: formData.bio
      };

      await updateDoc(docRef, dataToUpdate);
      
      setProfile(prev => prev ? ({ ...prev, ...dataToUpdate }) : null);
      setIsEditing(false);
      addToast("Perfil atualizado! Nadando rápido! 🦈", "success");
    } catch (error) {
      console.error(error);
      addToast("Erro ao atualizar perfil.", "error");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      addToast("Tubarão retornou à base.", "info");
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (!profile) return null;

  const xpPercentage = Math.min((profile.xp / profile.nextLevelXp) * 100, 100);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500 pb-20">
      
      {/* CAPA & CABEÇALHO */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-r from-emerald-900 to-zinc-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-4 right-4 flex gap-2">
                <button onClick={() => setIsEditing(!isEditing)} className="p-2 bg-black/40 backdrop-blur-md rounded-full hover:bg-emerald-500 transition text-white">
                    {isEditing ? <LogOut size={18} className="rotate-180"/> : <Settings size={18} />}
                </button>
                <button onClick={handleLogout} className="p-2 bg-red-500/20 backdrop-blur-md rounded-full hover:bg-red-600 transition text-red-200 hover:text-white border border-red-500/30">
                    <LogOut size={18} />
                </button>
            </div>
        </div>

        <div className="px-6 relative flex flex-col items-center -mt-16">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-b from-emerald-400 to-zinc-900 shadow-2xl shadow-emerald-900/50">
                    <div className="w-full h-full rounded-full bg-zinc-950 overflow-hidden relative">
                         <Image 
                           src={profile.photoURL} 
                           alt={profile.displayName} 
                           width={128} 
                           height={128} 
                           className="object-cover w-full h-full"
                           priority
                         />
                    </div>
                </div>
                {isEditing && (
                    <button className="absolute bottom-2 right-2 bg-emerald-500 text-white p-2 rounded-full shadow-lg hover:scale-110 transition border-2 border-zinc-900">
                        <Camera size={16} />
                    </button>
                )}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-zinc-900 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-400 shadow-xl flex items-center gap-1">
                    <Crown size={12} className="fill-emerald-400" /> Lvl {profile.level}
                </div>
            </div>

            {isEditing ? (
                <div className="mt-6 w-full max-w-sm space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <input 
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-center font-bold text-white focus:border-emerald-500 outline-none"
                        placeholder="Seu Nome"
                    />
                     <div className="flex gap-2">
                        <input 
                            value={formData.curso}
                            onChange={(e) => setFormData({...formData, curso: e.target.value})}
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-center text-zinc-300 focus:border-emerald-500 outline-none"
                            placeholder="Curso (ex: Medicina)"
                        />
                        <input 
                            value={formData.semestre}
                            onChange={(e) => setFormData({...formData, semestre: e.target.value})}
                            className="w-20 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-center text-zinc-300 focus:border-emerald-500 outline-none"
                            placeholder="Sem."
                        />
                    </div>
                    <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-center text-zinc-300 focus:border-emerald-500 outline-none resize-none"
                        rows={2}
                        placeholder="Sua frase de efeito..."
                    />
                    <button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                        <Save size={18} /> Salvar Alterações
                    </button>
                </div>
            ) : (
                <div className="text-center mt-4 space-y-2">
                    <h1 className="text-2xl font-black text-white">{profile.displayName}</h1>
                    <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs uppercase font-bold tracking-wide">
                        <span className="flex items-center gap-1"><GraduationCap size={14} className="text-emerald-500"/> {profile.curso}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                        <span className="flex items-center gap-1">{profile.semestre} Semestre</span>
                    </div>
                    <p className="text-zinc-500 text-sm max-w-xs mx-auto italic">&quot;{profile.bio}&quot;</p>
                </div>
            )}
        </div>
      </div>

      {/* STATS RAPIDOS */}
      <div className="grid grid-cols-3 gap-4 px-6 mt-8">
         <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xl font-black text-white">{profile.xp}</span>
             <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Zap size={10} className="text-yellow-500 fill-yellow-500"/> XP Total</span>
         </div>
         <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xl font-black text-white">#42</span>
             <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Trophy size={10} className="text-emerald-500 fill-emerald-500"/> Ranking</span>
         </div>
         <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-2xl flex flex-col items-center">
             <span className="text-xl font-black text-white">12</span>
             <span className="text-[10px] text-zinc-500 uppercase font-bold flex items-center gap-1"><Award size={10} className="text-purple-500 fill-purple-500"/> Conquistas</span>
         </div>
      </div>

      {/* BARRA DE PROGRESSO */}
      <div className="px-6 mt-8">
        <div className="flex justify-between text-xs font-bold mb-2">
            <span className="text-emerald-400">Nível {profile.level}</span>
            <span className="text-zinc-600">{profile.xp} / {profile.nextLevelXp} XP</span>
        </div>
        <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-1000 ease-out" 
                style={{ width: `${xpPercentage}%` }}
            ></div>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2 text-center">
            Faltam <span className="text-white font-bold">{profile.nextLevelXp - profile.xp} XP</span> para o próximo nível. Bora pro treino! 🦈
        </p>
      </div>

      {/* MENU LIST */}
      <div className="px-6 mt-10 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings size={16} className="text-emerald-500" /> Configurações
        </h3>
        
        <button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group transition">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Share2 size={18}/></div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Convidar Amigos</span>
            </div>
            <span className="text-[10px] bg-emerald-500 text-black font-bold px-2 py-1 rounded-md">+50 XP</span>
        </button>

        <button className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl p-4 flex items-center justify-between group transition">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><MapPin size={18}/></div>
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white">Endereços Salvos</span>
            </div>
            <Edit2 size={16} className="text-zinc-600 group-hover:text-white"/>
        </button>
      </div>

      {/* BADGES GRID */}
      <div className="px-6 mt-10 mb-8">
         <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Award size={16} className="text-amber-500" /> Insígnias
        </h3>
        <div className="grid grid-cols-4 gap-3">
            {profile.badges.map((badge) => (
                <div key={badge.id} className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 border ${badge.unlocked ? 'bg-zinc-900 border-emerald-500/30' : 'bg-zinc-950 border-zinc-900 opacity-50 grayscale'}`}>
                    <div className="w-8 h-8 mb-1 relative">
                        {/* Como não temos as imagens reais ainda, usamos o ícone Award */}
                        <Award className={badge.unlocked ? "text-emerald-400" : "text-zinc-600"} size={32} />
                    </div>
                    <span className="text-[8px] text-center font-bold text-zinc-400 leading-tight">{badge.name}</span>
                </div>
            ))}
        </div>
      </div>

    </div>
  );
}