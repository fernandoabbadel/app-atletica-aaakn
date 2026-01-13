"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

// --- TIPAGEM ---
export type UserRole = "guest" | "user" | "treinador" | "empresa" | "admin_treino" | "admin_geral" | "admin_gestor" | "master";

export interface User {
  uid: string;
  nome: string;
  email: string;
  foto: string;
  role: UserRole;
  
  // Opcionais
  matricula?: string;
  turma?: string;
  handle?: string;
  level?: number;
  xp?: number;
  heroPower?: number;
  rankingPosition?: number;
  dailyMatchesPlayed?: number;
  turmaPhoto?: string;
  
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
  // Trouxe de volta para não quebrar seu BottomNav e RouteGuard
  checkPermission: (allowedRoles: UserRole[]) => boolean;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Monitora o Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const userRef = doc(db, "users", fbUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUser(userSnap.data() as User);
          } else {
            // Cria usuário novo se não existir
            const newUser: User = {
              uid: fbUser.uid,
              nome: fbUser.displayName || "Sem Nome",
              email: fbUser.email || "",
              foto: fbUser.photoURL || "https://github.com/shadcn.png",
              role: "guest",
              level: 1,
              xp: 0,
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error("Erro ao buscar user:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- AÇÕES ---

  const loginGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login falhou:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    router.push("/");
  };

  // Função recuperada para compatibilidade com o resto do app
  const checkPermission = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "master") return true;
    return allowedRoles.includes(user.role);
  };

  // Função recuperada e conectada ao Firebase
  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, data);
      // Atualiza estado local otimista
      setUser((prev) => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginGoogle, logout, checkPermission, updateUser }}>
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-[#050505]">
            <span className="text-orange-500 font-bold animate-pulse">CARREGANDO... 🦈</span>
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