"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase"; 
import { useRouter, usePathname } from "next/navigation"; 
import { logActivity } from "../lib/logger"; 
// 🦈 IMPORTA SEU LOADING OFICIAL (O Tubarão)
import LoadingScreen from "../app/loading";

// --- TIPAGEM ---
// Adicionado 'vendas' que estava faltando
export type UserRole = "guest" | "user" | "treinador" | "empresa" | "admin_treino" | "admin_geral" | "admin_gestor" | "master" | "vendas";
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
  
  // Dados Completos
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
  isAdmin: boolean;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (allowedRoles: string[]) => boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false); // Controle de Hidratação
  
  const router = useRouter();
  const pathname = usePathname(); 

  // 1. PREVINE ERRO DE HIDRATAÇÃO (CLIENT-SIDE ONLY)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. MONITORAR AUTH & DADOS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          
          // Listener em tempo real dos dados do usuário
          const unsubDoc = onSnapshot(userRef, async (userSnap) => {
              if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                
                // Atualiza User e Admin Status
                setUser({ ...userData, uid: fbUser.uid });
                // Define quem é Admin (inclui master, geral e gestor)
                setIsAdmin(["master", "admin_geral", "admin_gestor"].includes(userData.role));

                // Garante status de primeiro login
                if (!userData.stats?.accountCreated) {
                    await updateDoc(userRef, { 
                        "stats.accountCreated": 1,
                        "stats.loginCount": (userData.stats?.loginCount || 0) + 1
                    });
                }

              } else {
                // Cadastro Inicial (Se não existir no Firestore)
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
                setIsAdmin(false);
                await logActivity(newUser.uid, newUser.nome, "CREATE", "Usuários", "Novo cadastro via Google");
              }
              setLoading(false);
          });

          return () => unsubDoc(); 

        } catch (error) {
          console.error("Erro no Auth:", error);
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
        }
      } else {
        // Deslogado
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. SEGURANÇA E REDIRECIONAMENTOS (Fallback do RouteGuard)
  useEffect(() => {
      if (loading || !user) return;

      // BLOQUEIO: Se user for banned e não estiver na jaula
      if ((user.status === 'banned' || user.status === 'bloqueado') && pathname !== '/banned') {
          router.replace('/banned');
      }

      // DESBLOQUEIO: Se user for ativo e estiver na jaula
      if (user.status !== 'banned' && user.status !== 'bloqueado' && pathname === '/banned') {
          router.replace('/dashboard');
      }
  }, [user, pathname, loading, router]); 

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
    setIsAdmin(false);
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
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  // 🦈 RENDERIZAÇÃO BLINDADA: Evita erro de Hidratação
  if (!mounted) return null;

  // 🦈 LOADING UNIFICADO:
  // Usa o mesmo LoadingScreen (Tubarão) do app/loading.tsx
  if (loading) {
      return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginGoogle, logout, checkPermission, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};