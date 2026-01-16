"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase"; // Caminho relativo ajustado
import { useRouter } from "next/navigation";
import { logActivity } from "../lib/logger"; // 🦈 O Caderno do Tubarão entra aqui!

// --- TIPAGEM ---
export type UserRole = "guest" | "user" | "treinador" | "empresa" | "admin_treino" | "admin_geral" | "admin_gestor" | "master";

export interface User {
  uid: string;
  nome: string;
  email: string;
  idade?: number;          // 🦈 Adicionado
  cidadeOrigem?: string;   // 🦈 Adicionado
  foto: string;
  role: UserRole;
  
  
  // Opcionais
  matricula?: string;
  turma?: string;
  handle?: string;
  telefone?: string; // <--- Voltou!
  instagram?: string;
  bio?: string;
  level?: number;
  xp?: number;
  heroPower?: number;
  rankingPosition?: number;
  dailyMatchesPlayed?: number;
  turmaPhoto?: string;
  whatsappPublico?: boolean;
  statusRelacionamento?: string; // Adicionado
  relacionamentoPublico?: boolean; // Adicionado
  dataNascimento?: string; // Adicionado
  esportes?: string[];
  pets?: string; // 🦈 Novo campo adicionado
  apelido?: string; // 🦈 Novo campo
  idadePublica?: boolean; // 🦈 Novo campo

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
            // USUÁRIO EXISTENTE
            const userData = userSnap.data() as User;
            setUser(userData);
            
            // 🦈 Log de Entrada (Sessão Iniciada)
            // Nota: Isso roda sempre que dá refresh, bom para auditoria de acesso
            /* Se achar que está gerando muito log, pode comentar essa linha,
               mas para segurança é bom manter.
            */
            // await logActivity(userData.uid, userData.nome, "LOGIN", "Sistema", "Acesso detectado (Refresh/Login)");

          } else {
            // NOVO USUÁRIO (PRIMEIRO ACESSO)
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

            // 🦈 Log de Criação de Conta
            await logActivity(
              newUser.uid, 
              newUser.nome, 
              "CREATE", 
              "Usuários", 
              "Novo cadastro realizado via Google"
            );
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
      const result = await signInWithPopup(auth, googleProvider);
      
      // 🦈 Verificação de Segurança:
      // Vamos olhar no banco se esse tubarão já tem a "Matrícula" preenchida.
      const userDocRef = doc(db, "users", result.user.uid);
      const userSnap = await getDoc(userDocRef);

      // Se o usuário existe E já tem matrícula => Dashboard
      if (userSnap.exists() && userSnap.data()?.matricula) {
        console.log("🦈 Tubarão Veterano detectado! Indo pro Dashboard...");
        router.push("/dashboard");
      } else {
        // Se é novo ou não tem matrícula => Cadastro
        console.log("🦈 Tubarão Novato! Indo pra Recepção (Cadastro)...");
        router.push("/cadastro");
      }

    } catch (error) {
      console.error("Login falhou:", error);
    }
  };

  const logout = async () => {
    if (user) {
        // 🦈 Log de Saída
        await logActivity(user.uid, user.nome, "LOGIN", "Sistema", "Usuário realizou Logout");
    }
    await signOut(auth);
    router.push("/");
  };

  const checkPermission = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "master") return true;
    return allowedRoles.includes(user.role);
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, data);
      
      // Atualiza estado local otimista
      setUser((prev) => prev ? { ...prev, ...data } : null);

      // 🦈 Log de Atualização
      // Aqui a gente registra EXATAMENTE o que mudou
      const camposAlterados = Object.keys(data).join(", ");
      await logActivity(
        user.uid, 
        user.nome, 
        "UPDATE", 
        "Perfil", 
        `Atualizou os campos: [${camposAlterados}]`
      );

    } catch (error) {
      console.error("Erro ao atualizar:", error);
      // Se der erro, loga o erro também (opcional, mas recomendado)
      await logActivity(user.uid, user.nome, "ERROR", "Perfil", "Falha ao tentar atualizar dados");
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