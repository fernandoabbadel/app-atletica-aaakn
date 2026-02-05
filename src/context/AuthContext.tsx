"use client";
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { 
  doc, setDoc, updateDoc, onSnapshot, collection, query, orderBy, getDocs, increment 
} from "firebase/firestore"; 
import { auth, db, googleProvider } from "../lib/firebase"; 
import { useRouter, usePathname } from "next/navigation"; 
import { logActivity } from "../lib/logger"; 
import LoadingScreen from "../app/loading";
import { DEFAULT_STATS, DEFAULT_USER_PROPS } from "../constants/userDefaults";

// --- TIPAGEM ---
export type UserRole = "guest" | "user" | "treinador" | "empresa" | "admin_treino" | "admin_geral" | "admin_gestor" | "master" | "vendas";
export type UserStatus = "ativo" | "inadimplente" | "banned" | "pendente" | "paused" | "bloqueado";

// 🦈 Interfaces Auxiliares para Cache (Fim dos any)
interface PatenteConfig {
    titulo: string;
    minXp: number;
    iconName: string;
    cor: string;
}

interface PlanoConfig {
    nome: string;
    cor: string;
    icon: string;
    descontoLoja: number;
    xpMultiplier: number;
}

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
  patente_icon?: string; 
  patente_cor?: string;  
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
  
  // 🦈 CACHES DE DADOS GLOBAIS (Tipados)
  const [patentesCache, setPatentesCache] = useState<PatenteConfig[]>([]); 
  const [planosCache, setPlanosCache] = useState<PlanoConfig[]>([]);
  
  // 🦈 REF DE CONTROLE (Evita loop de updates)
  const lastMaintenanceUid = useRef<string | null>(null);

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
                setPatentesCache(snapPatentes.docs.map(d => d.data() as PatenteConfig));
            } else {
                 // Fallback local se o banco estiver vazio
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
                setPlanosCache(snapPlanos.docs.map(d => d.data() as PlanoConfig));
            }

        } catch (e) { console.error("Erro ao carregar dados globais:", e); }
    };
    fetchData();
  }, []);

  // Helper: Calcula DADOS DA PATENTE com base no cache
  // 🦈 UseCallback para entrar na dep do useEffect sem loop
  const calculatePatenteData = useCallback((xp: number) => {
      if (patentesCache.length === 0) return null;
      const found = patentesCache.find(p => xp >= p.minXp);
      return found || patentesCache[patentesCache.length - 1]; 
  }, [patentesCache]);

  // 2. MONITORAR AUTH (SOMENTE LEITURA E SINCRONIA DE ESTADO)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      
      if (isLocalGuest) {
          setLoading(false);
          return;
      }

      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          
          // 🦈 OTIMIZAÇÃO: Listener apenas LÊ e atualiza o estado local
          // NUNCA escreve no banco aqui dentro
          const unsubDoc = onSnapshot(userRef, (userSnap) => {
              if (userSnap.exists()) {
                const userData = userSnap.data() as User;
                setUser({ ...userData, uid: fbUser.uid, isAnonymous: false });
                setIsAdmin(["master", "admin_geral", "admin_gestor"].includes(userData.role));
              } else {
                // Criação de user (ok aqui pois acontece 1 vez na vida)
                const newUser: User = {
                  ...DEFAULT_USER_PROPS,
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
                
                setDoc(userRef, newUser); // Async, não bloqueia
                setUser(newUser);
                setIsAdmin(false);
                logActivity(newUser.uid, newUser.nome, "CREATE", "Usuários", "Novo cadastro via Google");
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
            lastMaintenanceUid.current = null; // Reseta controle ao deslogar
        }
      }
    });

    return () => unsubscribe();
  }, [isLocalGuest]); 

  // 3. EFEITO DE MANUTENÇÃO (ESCRITA INTELIGENTE - 1x POR SESSÃO)
  useEffect(() => {
    const runMaintenance = async () => {
        // Condições para rodar: User logado, não é convidado local, e cache carregado
        if (!user || isLocalGuest || loading || patentesCache.length === 0) return;
        
        // 🦈 TRAVA: Se já rodamos para este usuário nesta sessão, pare.
        if (lastMaintenanceUid.current === user.uid) return;

        // Marca como executado imediatamente
        lastMaintenanceUid.current = user.uid;
        
        const userRef = doc(db, "users", user.uid);
        // 🦈 Correção de tipo: Record permite chaves dinâmicas sem 'any'
        const updates: Record<string, unknown> = {};
        let hasUpdates = false;

        // A. AUTO-CURA (Verifica dados corrompidos/antigos)
        if (user.xp === undefined) { updates.xp = DEFAULT_USER_PROPS.xp; hasUpdates = true; }
        if (user.level === undefined) { updates.level = DEFAULT_USER_PROPS.level; hasUpdates = true; }
        if (user.sharkCoins === undefined) { updates.sharkCoins = DEFAULT_USER_PROPS.sharkCoins; hasUpdates = true; }
        if (!user.patente) { updates.patente = DEFAULT_USER_PROPS.patente; hasUpdates = true; }
        
        if (!user.plano) { updates.plano = DEFAULT_USER_PROPS.plano; hasUpdates = true; }
        if (!user.plano_badge) { updates.plano_badge = DEFAULT_USER_PROPS.plano_badge; hasUpdates = true; }
        if (!user.plano_cor) { updates.plano_cor = DEFAULT_USER_PROPS.plano_cor; hasUpdates = true; }

        const currentStats = user.stats || {};
        const missingStatKeys = Object.keys(DEFAULT_STATS).some(key => currentStats[key] === undefined);
        if (!user.stats || missingStatKeys) {
            updates.stats = { ...DEFAULT_STATS, ...currentStats };
            hasUpdates = true;
        }

        // B. LOGIN DIÁRIO
        const hoje = new Date().toLocaleDateString('pt-BR');
        if (user.ultimoLoginDiario !== hoje) {
            updates["stats.loginCount"] = increment(1);
            updates.ultimoLoginDiario = hoje;
            updates.xp = (user.xp || 0) + 10;
            hasUpdates = true;
            logActivity(user.uid, user.nome, "LOGIN", "Sistema", "Check-in Diário (+10 XP)");
        }

        // C. SINCRONIA DE PATENTE
        const patenteAlvo = calculatePatenteData(user.xp || 0);
        if (patenteAlvo) {
            if (
                user.patente !== patenteAlvo.titulo ||
                user.patente_icon !== patenteAlvo.iconName ||
                user.patente_cor !== patenteAlvo.cor
            ) {
                updates.patente = patenteAlvo.titulo;
                updates.patente_icon = patenteAlvo.iconName;
                updates.patente_cor = patenteAlvo.cor;
                hasUpdates = true;
                console.log(`🦈 Patente atualizada para: ${patenteAlvo.titulo}`);
            }
        }

        // D. SINCRONIA DE PLANO
        if (user.plano && user.plano !== "Bicho Solto" && planosCache.length > 0) {
            const planoReal = planosCache.find(p => p.nome === user.plano);
            if (planoReal) {
                if (user.plano_cor !== planoReal.cor || user.plano_icon !== planoReal.icon) {
                    updates.plano_cor = planoReal.cor;
                    updates.plano_icon = planoReal.icon;
                    updates.desconto_loja = planoReal.descontoLoja;
                    updates.xpMultiplier = planoReal.xpMultiplier;
                    hasUpdates = true;
                }
            }
        }

        // 🦈 SINGLE WRITE: Se houver qualquer atualização, faz tudo em uma única chamada
        if (hasUpdates) {
            console.log(`🔧 Manutenção executada para ${user.nome}`);
            await updateDoc(userRef, updates);
        }
    };

    runMaintenance();
  }, [user, loading, patentesCache, planosCache, isLocalGuest, calculatePatenteData]); // 🦈 Dependências corrigidas

  // 4. SEGURANÇA E REDIRECIONAMENTOS
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
    lastMaintenanceUid.current = null; // Reseta controle
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