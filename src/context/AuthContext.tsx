"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase"; 
import { useRouter, usePathname } from "next/navigation"; 
import { logActivity } from "../lib/logger"; 

// --- TIPAGEM ---
export type UserRole = "guest" | "user" | "treinador" | "empresa" | "admin_treino" | "admin_geral" | "admin_gestor" | "master";

// 🦈 STATUS CORRIGIDOS
export type UserStatus = "ativo" | "inadimplente" | "banned" | "pendente" | "paused" | "bloqueado";

export interface UserStats {
    loginCount?: number;
    postsCount?: number;
    commentsCount?: number;
    likesReceived?: number;
    validReports?: number;
    loginStreak?: number;
    gymCheckins?: number;
    gymEarlyBird?: number;
    gymNightOwl?: number;
    gymStreak?: number;
    arenaMatches?: number;
    arenaWins?: number;
    arenaLosses?: number;
    arenaLoseStreak?: number;
    storeSpent?: number;
    albumCollected?: number;
    storeItemsCount?: number;
    eventsAttended?: number;
    eventsPromo?: number;
    eventsAcademic?: number;
    solidarityCount?: number;
    accountCreated?: number;
    [key: string]: number | undefined; 
}

export interface User {
  uid: string;
  nome: string;
  email: string;
  idade?: number;
  cidadeOrigem?: string;
  foto: string;
  role: UserRole | string;
  
  // Controle
  status?: UserStatus;
  saved_role?: string;
  
  // Gamification
  level?: number;
  xp?: number;
  heroPower?: number;
  rankingPosition?: number;
  stats?: UserStats; 
  sharkCoins?: number;
  
  // Dados
  matricula?: string;
  turma?: string;
  handle?: string;
  telefone?: string;
  instagram?: string;
  bio?: string;
  dailyMatchesPlayed?: number;
  turmaPhoto?: string;
  whatsappPublico?: boolean;
  statusRelacionamento?: string;
  relacionamentoPublico?: boolean;
  dataNascimento?: string;
  esportes?: string[];
  pets?: string;
  apelido?: string;
  idadePublica?: boolean;

  // Visual
  plano?: string;
  patente?: string;
  plano_badge?: string;
  tier?: 'bicho' | 'atleta' | 'lenda'; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (allowedRoles: string[]) => boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          
          const unsubDoc = onSnapshot(userRef, async (userSnap) => {
              if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                
                // 🦈 1. BLOQUEIO (SEM LOOP):
                // Se estiver bloqueado, forçamos a rota /banned.
                // IMPORTANTE: NÃO setamos user=null aqui, senão o app acha que deslogou e causa loop.
                // O router.replace segura o usuário na jaula.
                if (userData.status === 'banned' || userData.status === 'bloqueado') {
                    if (pathname !== '/banned') {
                        router.replace('/banned'); 
                    }
                    setUser({ ...userData, uid: fbUser.uid }); // Mantém user para evitar logout loop
                    setLoading(false);
                    return; 
                }

                // 2. DESBLOQUEIO: Se estava na jaula e foi solto
                if (userData.status !== 'banned' && userData.status !== 'bloqueado' && pathname === '/banned') {
                    router.replace('/dashboard');
                }

                // 3. PRIMEIRO LOGIN (STATS)
                if (!userData.stats?.accountCreated) {
                    await updateDoc(userRef, { 
                        "stats.accountCreated": 1,
                        "stats.loginCount": (userData.stats?.loginCount || 0) + 1
                    });
                }

                setUser({ ...userData, uid: fbUser.uid }); 
              } else {
                // 4. CADASTRO INICIAL
                const newUser: User = {
                  uid: fbUser.uid,
                  nome: fbUser.displayName || "Sem Nome",
                  email: fbUser.email || "",
                  foto: fbUser.photoURL || "https://github.com/shadcn.png",
                  role: "guest",
                  status: "ativo",
                  level: 1,
                  xp: 50,
                  stats: { accountCreated: 1, loginCount: 1 }, 
                  plano: "Bicho Solto",
                  tier: "bicho"
                };
                
                await setDoc(userRef, newUser);
                setUser(newUser);
                await logActivity(newUser.uid, newUser.nome, "CREATE", "Usuários", "Novo cadastro via Google");
              }
              setLoading(false);
          });

          return () => unsubDoc(); 

        } catch (error) {
          console.error("Erro no Auth:", error);
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login falhou:", error);
    }
  };

  const logout = async () => {
    if (user) {
        await logActivity(user.uid, user.nome, "LOGIN", "Sistema", "Logout realizado");
    }
    await signOut(auth);
    setUser(null);
    router.push("/");
  };

  const checkPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    if (user.role === "master") return true;
    return allowedRoles.includes(user.role as string);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, data);
      const campos = Object.keys(data).join(", ");
      await logActivity(user.uid, user.nome, "UPDATE", "Perfil", `Atualizou: [${campos}]`);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginGoogle, logout, checkPermission, updateUser }}>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
            <span className="text-emerald-500 font-bold animate-pulse text-xl tracking-widest uppercase">Carregando Cardume... 🦈</span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};