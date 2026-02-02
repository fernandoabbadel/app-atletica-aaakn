"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, setDoc, updateDoc, onSnapshot, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore"; 
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
    [key: string]: number | undefined; 
}

// 🦈 INTERFACE USER BLINDADA
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
  ultimoLoginDiario?: string;
  
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
  patente?: string; // Agora calculado dinamicamente
  tier?: 'bicho' | 'atleta' | 'lenda'; 
  plano_badge?: string;
  plano_cor?: string;
  plano_icon?: string;
  
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
  
  const [isLocalGuest, setIsLocalGuest] = useState(false);
  const [patentesCache, setPatentesCache] = useState<any[]>([]); // Cache para cálculo rápido
  
  const router = useRouter();
  const pathname = usePathname(); 

  // 1. PREVINE ERRO DE HIDRATAÇÃO E CARREGA PATENTES
  useEffect(() => {
    setMounted(true);
    // Carrega patentes uma vez para o contexto usar no cálculo
    const fetchPatentes = async () => {
        const q = query(collection(db, "patentes_config"), orderBy("minXp", "desc")); // Do maior para o menor
        const snap = await getDocs(q);
        if (!snap.empty) {
            setPatentesCache(snap.docs.map(d => d.data()));
        } else {
            // Fallback se não tiver nada no banco
             setPatentesCache([
                { titulo: "Megalodon", minXp: 50000 },
                { titulo: "Tubarão Branco", minXp: 15000 },
                { titulo: "Barracuda", minXp: 2000 },
                { titulo: "Peixe Palhaço", minXp: 500 },
                { titulo: "Plâncton", minXp: 0 }
            ]);
        }
    };
    fetchPatentes();
  }, []);

  // 🦈 Helper: Calcula Patente baseada no XP
  const calculatePatente = (xp: number) => {
      if (patentesCache.length === 0) return "Novato";
      const found = patentesCache.find(p => xp >= p.minXp);
      return found ? found.titulo : "Novato";
  };

  // 2. MONITORAR AUTH & DADOS & LOGIN DIÁRIO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      
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
                
                // --- LÓGICA DE LOGIN DIÁRIO ---
                const hoje = new Date().toLocaleDateString('pt-BR'); 
                const ultimoLogin = userData.ultimoLoginDiario || "";

                if (hoje !== ultimoLogin) {
                    console.log("🦈 Tubarão detectou: Primeiro login do dia! Contabilizando...");
                    
                    const novosStats = {
                        ...userData.stats,
                        loginCount: (userData.stats?.loginCount || 0) + 1
                    };
                    
                    await updateDoc(userRef, {
                        "stats.loginCount": novosStats.loginCount,
                        "ultimoLoginDiario": hoje,
                        "xp": (userData.xp || 0) + 10 
                    });
                    
                    await logActivity(fbUser.uid, userData.nome, "LOGIN", "Sistema", "Check-in Diário Realizado (+10 XP)");
                } 
                // ------------------------------

                // 🦈 CÁLCULO DINÂMICO DE PATENTE NO CONTEXTO
                const currentPatente = calculatePatente(userData.xp || 0);
                
                // Se a patente mudou, atualiza no banco também para ficar registrado
                if (userData.patente !== currentPatente && patentesCache.length > 0) {
                     await updateDoc(userRef, { patente: currentPatente });
                     userData.patente = currentPatente; // Atualiza localmente para renderizar já certo
                }

                setUser({ ...userData, uid: fbUser.uid, isAnonymous: false, patente: currentPatente });
                setIsAdmin(["master", "admin_geral", "admin_gestor"].includes(userData.role));

                if (!userData.stats?.accountCreated) {
                    await updateDoc(userRef, { "stats.accountCreated": 1 });
                }

              } else {
                // Cadastro Novo
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
                  patente: "Plâncton",
                  isAnonymous: false,
                  ultimoLoginDiario: new Date().toLocaleDateString('pt-BR')
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
        if (!isLocalGuest) {
            setUser(null);
            setIsAdmin(false);
            setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [isLocalGuest, patentesCache]); // Recalcula se as patentes carregarem depois

  // 3. SEGURANÇA E REDIRECIONAMENTOS
  useEffect(() => {
      if (loading || !user) return;

      if ((user.status === 'banned' || user.status === 'bloqueado') && pathname !== '/banned') {
          router.replace('/banned');
      }

      if (user.status !== 'banned' && user.status !== 'bloqueado' && pathname === '/banned') {
          router.replace('/dashboard');
      }
  }, [user, pathname, loading, router]); 

  // --- FUNÇÕES ---

  const loginGoogle = async () => {
    try {
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
        patente: "Visitante",
        level: 1,
        xp: 0
    };
    setIsLocalGuest(true);
    setUser(guestUser);
    setIsAdmin(false);
    setTimeout(() => setLoading(false), 800);
  };

  const logout = async () => {
    if (user) {
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