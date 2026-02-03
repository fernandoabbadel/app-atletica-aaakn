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
import { DEFAULT_STATS, DEFAULT_USER_PROPS } from "../constants/userDefaults";

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
  data_adesao?: string;
  
  // Gamification
  level?: number;
  xp?: number;
  xpMultiplier?: number;
  heroPower?: number;
  rankingPosition?: number;
  stats?: UserStats; 
  sharkCoins?: number;
  selos?: number;
  
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
  patente_icon?: string; // 🦈 NOVO
  patente_cor?: string;  // 🦈 NOVO
  tier?: 'bicho' | 'atleta' | 'lenda'; 
  plano_badge?: string;
  plano_cor?: string;
  plano_icon?: string;
  desconto_loja?: number;
  
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
  
  // 🦈 CACHES DE DADOS GLOBAIS
  const [patentesCache, setPatentesCache] = useState<any[]>([]); 
  const [planosCache, setPlanosCache] = useState<any[]>([]);
  
  const router = useRouter();
  const pathname = usePathname(); 

  // 1. CARREGAMENTO INICIAL UNIFICADO
  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
        try {
            // A. Buscar Patentes
            const qPatentes = query(collection(db, "patentes_config"), orderBy("minXp", "desc"));
            const snapPatentes = await getDocs(qPatentes);
            if (!snapPatentes.empty) {
                setPatentesCache(snapPatentes.docs.map(d => d.data()));
            } else {
                 // Fallback local se o banco estiver vazio (Segurança)
                 setPatentesCache([
                    { titulo: "Megalodon", minXp: 50000, iconName: "Crown", cor: "text-red-600" },
                    { titulo: "Tubarão Branco", minXp: 15000, iconName: "Fish", cor: "text-emerald-400" },
                    { titulo: "Barracuda", minXp: 2000, iconName: "Swords", cor: "text-blue-400" },
                    { titulo: "Peixe Palhaço", minXp: 500, iconName: "Fish", cor: "text-orange-400" },
                    { titulo: "Plâncton", minXp: 0, iconName: "Fish", cor: "text-zinc-400" }
                ]);
            }

            // B. Buscar Planos
            const snapPlanos = await getDocs(collection(db, "planos"));
            if (!snapPlanos.empty) {
                setPlanosCache(snapPlanos.docs.map(d => d.data()));
            }

        } catch (e) { console.error("Erro ao carregar dados globais:", e); }
    };
    fetchData();
  }, []);

  // Helper: Calcula DADOS DA PATENTE com base no cache (Retorna Objeto Completo)
  const calculatePatenteData = (xp: number) => {
      if (patentesCache.length === 0) return null;
      // Como o cache vem ordenado DESC (Megalodon -> Plâncton), o primeiro que o XP cobrir é a patente certa
      // Ex: XP 3000. Megalodon (50k)? Não. Branco (15k)? Não. Barracuda (2k)? Sim! Retorna Barracuda.
      const found = patentesCache.find(p => xp >= p.minXp);
      return found || patentesCache[patentesCache.length - 1]; // Fallback para a última (menor)
  };

  // 2. MONITORAR AUTH
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

                // 🚑 --- PROTOCOLO DE AUTO-CURA (SELF-HEALING) --- 🚑
                let needsRepair = false;
                const updates: Partial<User> & Record<string, any> = {}; 

                // 1. Checa Gamificação Básica
                if (userData.xp === undefined) { updates.xp = DEFAULT_USER_PROPS.xp; needsRepair = true; }
                if (userData.level === undefined) { updates.level = DEFAULT_USER_PROPS.level; needsRepair = true; }
                if (userData.sharkCoins === undefined) { updates.sharkCoins = DEFAULT_USER_PROPS.sharkCoins; needsRepair = true; }
                if (!userData.patente) { updates.patente = DEFAULT_USER_PROPS.patente; needsRepair = true; }
                
                // 2. Checa Plano/Visual
                if (!userData.plano) { updates.plano = DEFAULT_USER_PROPS.plano; needsRepair = true; }
                if (!userData.plano_badge) { updates.plano_badge = DEFAULT_USER_PROPS.plano_badge; needsRepair = true; }
                if (!userData.plano_cor) { updates.plano_cor = DEFAULT_USER_PROPS.plano_cor; needsRepair = true; }
                
                // 3. Checa Stats (Deep Merge)
                const currentStats = userData.stats || {};
                const missingStatKeys = Object.keys(DEFAULT_STATS).some(key => currentStats[key] === undefined);
                
                if (!userData.stats || missingStatKeys) {
                    updates.stats = {
                        ...DEFAULT_STATS, 
                        ...currentStats
                    };
                    needsRepair = true;
                }

                // APLICA A CURA SE NECESSÁRIO
                if (needsRepair) {
                    console.log(`🚑 Auto-Cura ativada para ${userData.nome}. Corrigindo perfil...`);
                    await updateDoc(userRef, updates);
                    return; 
                }
                
                // --- 1. LÓGICA DE LOGIN DIÁRIO ---
                const hoje = new Date().toLocaleDateString('pt-BR'); 
                const ultimoLogin = userData.ultimoLoginDiario || "";

                if (hoje !== ultimoLogin) {
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

                // --- 2. CÁLCULO E SINCRONIA DE PATENTE (CORE) ---
                if (patentesCache.length > 0) {
                    const patenteAlvo = calculatePatenteData(userData.xp || 0);
                    
                    if (patenteAlvo) {
                        // Verifica se precisa atualizar QUALQUER campo da patente (Nome, ícone ou cor)
                        // Isso garante que se o Admin mudar o ícone do Plâncton, o usuário atualiza no próximo login
                        if (
                            userData.patente !== patenteAlvo.titulo ||
                            userData.patente_icon !== patenteAlvo.iconName ||
                            userData.patente_cor !== patenteAlvo.cor
                        ) {
                             console.log(`🦈 Evolução/Sincronia de Patente: ${patenteAlvo.titulo}`);
                             
                             const updatesPatente = { 
                                 patente: patenteAlvo.titulo,
                                 patente_icon: patenteAlvo.iconName,
                                 patente_cor: patenteAlvo.cor
                             };

                             await updateDoc(userRef, updatesPatente);
                             
                             // Atualiza estado local imediatamente para refletir na UI sem refresh
                             userData.patente = patenteAlvo.titulo;
                             userData.patente_icon = patenteAlvo.iconName;
                             userData.patente_cor = patenteAlvo.cor;
                        }
                    }
                }

                // --- 3. AUTO-CORREÇÃO DE PLANO (MEMÓRIA) ---
                if (userData.plano && userData.plano !== "Bicho Solto" && planosCache.length > 0) {
                    const planoReal = planosCache.find(p => p.nome === userData.plano);

                    if (planoReal) {
                        if (userData.plano_cor !== planoReal.cor || userData.plano_icon !== planoReal.icon) {
                            console.log(`🦈 Sincronizando visual do plano (Cache) para ${userData.nome}...`);
                            await updateDoc(userRef, {
                                plano_cor: planoReal.cor,
                                plano_icon: planoReal.icon,
                                desconto_loja: planoReal.descontoLoja,
                                xpMultiplier: planoReal.xpMultiplier
                            });
                            userData.plano_cor = planoReal.cor;
                            userData.plano_icon = planoReal.icon;
                        }
                    }
                }

                setUser({ ...userData, uid: fbUser.uid, isAnonymous: false });
                setIsAdmin(["master", "admin_geral", "admin_gestor"].includes(userData.role));

              } else {
                // ✅ CRIAÇÃO DE NOVO USUÁRIO
                const newUser: User = {
                  ...DEFAULT_USER_PROPS, // Base Padrão
                  
                  uid: fbUser.uid,
                  nome: fbUser.displayName || "Sem Nome",
                  email: fbUser.email || "",
                  foto: fbUser.photoURL || "https://github.com/shadcn.png",
                  
                  role: "guest",
                  status: "ativo",
                  
                  stats: { ...DEFAULT_STATS },
                  
                  ultimoLoginDiario: new Date().toLocaleDateString('pt-BR'),
                  data_adesao: new Date().toISOString()
                } as User; 
                
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
  }, [isLocalGuest, patentesCache, planosCache]); 

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
        ...DEFAULT_USER_PROPS,
        uid: "guest_virtual_" + Date.now(),
        nome: "Visitante Tubarão",
        email: "visitante@aaakn.com",
        foto: "/logo.png",
        
        role: "guest",
        status: "ativo",
        isAnonymous: true,

        stats: { ...DEFAULT_STATS, loginCount: 1 },
        plano: "Visitante",
        patente: "Visitante",
        tier: "bicho",
        level: 1,
        xp: 0
    } as User;

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