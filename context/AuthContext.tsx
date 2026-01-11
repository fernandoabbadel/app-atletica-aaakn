"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// --- NÍVEIS DE ACESSO (ROLES) ---
export type UserRole =
  | "guest" // Visitante
  | "user" // Sócio Padrão
  | "admin_treino" // Admin 3 (Coach/Treinador)
  | "admin_geral" // Admin 1 (Diretoria)
  | "admin_gestor" // Admin 2 (Presidência - gere outros admins)
  | "master"; // Você (Super Admin)

// Definição COMPLETA do usuário
export interface User {
  nome: string;
  handle: string;
  matricula: string;
  turma: string;
  level: number;
  xp: number;
  plano_badge: string;
  foto: string;
  instagram: string;
  bio: string;
  curso: string;
  seguidores: number;
  seguindo: number;
  role: UserRole; // <--- NOVO CAMPO
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  login: (userData: User) => void;
  logout: () => void;
  // Função para verificar se o usuário pode acessar algo
  checkPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Usuário inicial MOCKADO como MASTER para você testar o painel
  const [user, setUser] = useState<User | null>({
    nome: "Maria Eduarda",
    handle: "@duda_med",
    matricula: "2023001",
    turma: "T5",
    level: 7,
    xp: 620,
    plano_badge: "VIP",
    foto: "https://i.pravatar.cc/300?u=maria",
    instagram: "@duda_medicina",
    bio: "Futura Doutora 🩺 | Shark Team 🦈",
    curso: "Medicina",
    seguidores: 154,
    seguindo: 89,
    role: "master", // <--- TESTE AQUI: mude para 'user' ou 'admin_treino' para testar outros
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("tubarao_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Erro ao ler usuário", e);
          localStorage.removeItem("tubarao_user");
        }
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("tubarao_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tubarao_user");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const newUser = { ...user, ...data };
      setUser(newUser);
      localStorage.setItem("tubarao_user", JSON.stringify(newUser));
    }
  };

  // Verifica se o usuário atual tem um dos cargos permitidos
  const checkPermission = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === "master") return true; // Master acessa tudo
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, updateUser, login, logout, checkPermission }}
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
