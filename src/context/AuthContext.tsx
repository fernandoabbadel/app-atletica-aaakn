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
import { useRouter } from "next/navigation";
import { logActivity } from "../lib/logger"; 

// --- TIPAGEM ---
export type UserRole = "guest" | "user" | "treinador" | "empresa" | "admin_treino" | "admin_geral" | "admin_gestor" | "master";

export type UserStatus = "ativo" | "inadimplente" | "banned" | "pendente" | "paused";

// 🦈 Interface Stats (Conquistas)
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
    arenaLoseStreak?: number;
    storeSpent?: number;
    storeItemsCount?: number;
    eventsAttended?: number;
    eventsPromo?: number;
    eventsAcademic?: number;
    solidarityCount?: number;
    accountCreated?: number; // Importante para "Primeiro Mergulho"
    [key: string]: number | undefined; 
}

export interface User {
  uid: string;
  nome: string;
  email: string;
  idade?: number;
  cidadeOrigem?: string;
  foto: string;
  role: UserRole | string; // Allow string fallback
  
  // 🦈 CONTROLE DE ACESSO (CORREÇÃO AQUI)
  status?: UserStatus;
  saved_role?: string; // Para restaurar cargo após modo convidado
  
  // Gamification & Stats
  level?: number;
  xp?: number;
  heroPower?: number;
  rankingPosition?: number;
  stats?: UserStats; 
  sharkCoins?: number;
  
  // Opcionais
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

  // Visuais
  plano?: string;
  patente?: string;
  plano_badge?: string;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          
          const unsubDoc = onSnapshot(userRef, async (userSnap) => {
              if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                
                // GATILHO DE PRIMEIRO LOGIN (CRÍTICO PARA CONQUISTAS)
                if (!userData.stats?.accountCreated) {
                    await updateDoc(userRef, { 
                        "stats.accountCreated": 1,
                        "stats.loginCount": (userData.stats?.loginCount || 0) + 1
                    });
                }

                // 🦈 Garantindo que o UID da Auth sobrescreva
                setUser({ ...userData, uid: fbUser.uid }); 
              } else {
                const newUser: User = {
                  uid: fbUser.uid,
                  nome: fbUser.displayName || "Sem Nome",
                  email: fbUser.email || "",
                  foto: fbUser.photoURL || "https://github.com/shadcn.png",
                  role: "guest",
                  status: "ativo", // Padrão
                  level: 1,
                  xp: 50,
                  stats: { accountCreated: 1, loginCount: 1 }, 
                };
                
                await setDoc(userRef, newUser);
                setUser(newUser);
                await logActivity(newUser.uid, newUser.nome, "CREATE", "Usuários", "Novo cadastro via Google");
              }
              setLoading(false);
          });

          return () => unsubDoc(); 

        } catch (error) {
          console.error("Erro ao buscar user:", error);
          setUser(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userDocRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists() && userSnap.data()?.matricula) {
        router.push("/dashboard");
      } else {
        router.push("/cadastro");
      }
    } catch (error) {
      console.error("Login falhou:", error);
    }
  };

  const logout = async () => {
    if (user) {
        await logActivity(user.uid, user.nome, "LOGIN", "Sistema", "Logout realizado");
    }
    await signOut(auth);
    router.push("/");
  };

  const checkPermission = (allowedRoles: string[]) => {
    if (!user) return false;
    if (user.role === "master") return true;
    // Conversão segura caso role venha undefined
    return allowedRoles.includes(user.role as string);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, data);
      
      const camposAlterados = Object.keys(data).join(", ");
      await logActivity(user.uid, user.nome, "UPDATE", "Perfil", `Atualizou: [${camposAlterados}]`);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      await logActivity(user.uid, user.nome, "ERROR", "Perfil", "Falha ao atualizar");
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