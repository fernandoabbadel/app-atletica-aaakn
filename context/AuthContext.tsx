"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// --- NÍVEIS DE ACESSO (ROLES) ---
// Atualizado para incluir os tipos que causavam erro na Landing Page
export type UserRole =
  | "guest"         // Visitante
  | "user"          // Sócio Padrão (Atleta)
  | "treinador"     // Novo: Treinador
  | "empresa"       // Novo: Parceiro Comercial
  | "admin_treino"  // Admin 3 (Coach Legacy)
  | "admin_geral"   // Admin 1 (Diretoria)
  | "admin_gestor"  // Admin 2 (Presidência)
  | "master";       // Você (Super Admin)

// Definição COMPLETA do usuário
export interface User {
  uid?: string; // Adicionado para compatibilidade com Firebase
  nome: string;
  handle: string;
  matricula: string;
  turma: string;
  turmaPhoto?: string; // Opcional para o Dashboard
  
  // Gamificação Base
  level: number;
  xp: number;
  heroPower?: number; // Poder do Herói (Arena)
  rankingPosition?: number; // Posição Geral
  dailyMatchesPlayed?: number; // Controle de partidas
  
  // Perfil Social
  foto: string;
  instagram: string;
  bio: string;
  curso: string;
  seguidores: number;
  seguindo: number;
  role: UserRole;
  
  // --- CAMPOS VISUAIS ---
  plano?: string;       // Ex: "Tubarão Rei", "Lenda do Bar"
  patente?: string;     // Ex: "Megalodon", "Barracuda"
  plano_badge?: string; // Legado (VIP)
}

interface AuthContextType {
  user: User | null;
  loading: boolean; // ADICIONADO: Essencial para evitar redirects errados
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  login: (userData: User) => void;
  logout: () => void;
  checkPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true); // Começa carregando
  
  // Usuário inicial MOCKADO (Atualizado com dados para o Dashboard funcionar)
  const [user, setUser] = useState<User | null>({
    uid: "user_123",
    nome: "Maria Eduarda",
    handle: "@duda_med",
    matricula: "2023001",
    turma: "T5",
    turmaPhoto: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=1000",
    
    // Gamificação
    level: 7,
    xp: 620,
    heroPower: 8450,
    rankingPosition: 12,
    dailyMatchesPlayed: 1,

    // Social
    foto: "https://i.pravatar.cc/300?u=maria",
    instagram: "@duda_medicina",
    bio: "Futura Doutora 🩺 | Shark Team 🦈",
    curso: "Medicina",
    seguidores: 154,
    seguindo: 89,
    role: "master", // Teste mudando aqui para 'empresa' ou 'treinador' para testar os redirects
    
    // Visual
    plano: "Tubarão Rei",    
    patente: "Megalodon",    
    plano_badge: "VIP"       
  });

  useEffect(() => {
    // Simula verificação de sessão (localStorage ou Firebase)
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("tubarao_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Erro ao ler usuário do cache", e);
          localStorage.removeItem("tubarao_user");
        }
      }
    }
    setLoading(false); // Fim do carregamento inicial
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("tubarao_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tubarao_user");
    // Opcional: router.push('/login');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...data };
      setUser(newUser);
      localStorage.setItem("tubarao_user", JSON.stringify(newUser));
    }
  };

  const checkPermission = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "master") return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        loading, // Exportando o estado
        setUser, 
        updateUser, 
        login, 
        logout, 
        checkPermission 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return context;
};