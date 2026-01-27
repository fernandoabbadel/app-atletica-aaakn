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
import LoadingScreen from "../app/loading";

// --- TIPAGEM ---
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
    // Expansão segura para números (stats geralmente são contadores)
    [key: string]: number | undefined; 
}

// 🦈 INTERFACE USER BLINDADA (SEM ANY)
export interface User {
  uid: string;
  nome: string;
  email: string;
  foto: string;
  role: UserRole | string;
  
  // Controle
  status?: UserStatus;
  isAnonymous?: boolean; 
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
  cidadeOrigem?: string;
  idade?: number;

  // Visual & Planos
  plano?: string;        
  patente?: string;
  tier?: 'bicho' | 'atleta' | 'lenda'; 
  
  // 🦈 EXPANSÃO SEGURA: Substituímos 'any' por tipos primitivos permitidos no Firestore.
  // Isso permite adicionar campos novos sem desligar o TypeScript.
  [key: string]: string | number | boolean | undefined | null | UserStats | string[] | object; 
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  loginGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (allowedRoles: string[]) => boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Estado para saber se é um visitante virtual
  const [isLocalGuest, setIsLocalGuest] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname(); 

  // 1. PREVINE ERRO DE HIDRATAÇÃO
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. MONITORAR AUTH & DADOS
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      // Se estamos no modo "Visitante Virtual", ignoramos o Firebase
      if (isLocalGuest) {
          setLoading(false);
          return;
      }

      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          
          const unsubDoc = onSnapshot(userRef, async (userSnap) => {
              if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                
                // Atualiza User e Admin Status
                setUser({ ...userData, uid: fbUser.uid, isAnonymous: false });
                setIsAdmin(["master", "admin_geral", "admin_gestor"].includes(userData.role));

                // Garante status de primeiro login
                if (!userData.stats?.accountCreated) {
                    await updateDoc(userRef, { 
                        "stats.accountCreated": 1,
                        "stats.loginCount": (userData.stats?.loginCount || 0) + 1
                    });
                }

              } else {
                // Cadastro Novo (Google)
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
                  tier: "bicho",
                  isAnonymous: false
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
        // Se não tem user Firebase e nem Guest Local -> Deslogado
        if (!isLocalGuest) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [isLocalGuest]);

  // 3. SEGURANÇA E REDIRECIONAMENTOS
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

  // --- FUNÇÕES DE LOGIN ---

  const loginGoogle = async () => {
    try {
      // Se estava como visitante local, reseta
      if (isLocalGuest) {
          setIsLocalGuest(false);
          setUser(null);
      }
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login falhou:", error);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    
    // Cria um usuário Fake na memória
    const guestUser: User = {
        uid: "guest_virtual_" + Date.now(),
        nome: "Visitante Tubarão",
        email: "visitante@aaakn.com",
        foto: "/logo.png",
        role: "guest",
        status: "ativo",
        isAnonymous: true,
        stats: { loginCount: 1 },
        tier: "bicho",       
        plano: "Visitante",
        level: 1,
        xp: 0
    };

    setIsLocalGuest(true);
    setUser(guestUser);
    setIsAdmin(false);
    
    setTimeout(() => {
        setLoading(false);
    }, 800);
  };

  const logout = async () => {
    if (user) {
        // Tenta logar saída apenas se tiver UID real
        if (!user.uid.startsWith("guest_virtual")) {
            await logActivity(user.uid, user.nome, "LOGIN", "Sistema", "Logout realizado").catch(() => {});
            await signOut(auth);
        }
    }
    
    setIsLocalGuest(false);
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
    // Proteção: Visitante virtual não grava no banco
    if (!user || isLocalGuest) {
        if (isLocalGuest && user) {
            setUser({ ...user, ...data });
        }
        return; 
    }
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  if (!mounted) return null;

  if (loading) {
      return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, loginGoogle, loginAsGuest, logout, checkPermission, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};