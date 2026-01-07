"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Definição do que é o usuário
interface User {
  nome: string;
  handle: string;
  matricula: string;
  turma: string;
  level: number;
  xp: number;
  plano_badge: string;
  foto: string;
  instagram: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Simulando um usuário já logado para testes no CodeSandbox
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
  });

  const updateUser = (data: Partial<User>) => {
    if (user) setUser({ ...user, ...data });
  };

  return (
    <AuthContext.Provider value={{ user, setUser, updateUser }}>
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
