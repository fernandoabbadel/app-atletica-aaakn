"use client";

import React from "react";
import Link from "next/link";
// 🦈 CORREÇÃO: Removi a importação do useRouter pois não é usada
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Lock } from "lucide-react";

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showLockIcon?: boolean; // Mostra um cadeado se bloqueado?
}

export default function SmartLink({ href, children, className, showLockIcon = false }: SmartLinkProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  // 🦈 CORREÇÃO: Removi a declaração const router = useRouter();

  // Função que verifica a permissão SEM navegar
  const checkAccess = () => {
    // Se estiver rodando no servidor (SSR), não tem localStorage, então libera ou bloqueia por padrão.
    // Aqui assumimos bloqueio se não tiver usuário, mas liberado se não tiver regras carregadas ainda.
    if (typeof window === 'undefined') return true; 

    if (!user) return false;
    if (user.role === 'master') return true; // Master entra em tudo

    // 1. Pega as regras do cache (mesma lógica do RouteGuard)
    const cachedRules = localStorage.getItem("shark_permissions");
    if (!cachedRules) return true; // Se não tem regra carregada, assume liberado

    try {
        const permissionMatrix = JSON.parse(cachedRules);
        const path = href.toString().split("?")[0];
        const userRole = (user.role || 'user').toLowerCase();

        // 2. Acha a regra
        const matchedPath = Object.keys(permissionMatrix)
        .filter(rulePath => path === rulePath || path.startsWith(rulePath + '/'))
        .sort((a, b) => b.length - a.length)[0];

        // 3. Verifica
        if (matchedPath) {
            const allowedRoles = permissionMatrix[matchedPath].map((r: string) => r.toLowerCase());
            return allowedRoles.includes(userRole);
        }
    } catch (error) {
        console.error("Erro ao verificar permissão no SmartLink", error);
        return true; // Falha segura: libera se o JSON estiver quebrado
    }

    return true; // Sem regra explícita = liberado
  };

  const hasPermission = checkAccess();

  const handleClick = (e: React.MouseEvent) => {
    if (!hasPermission) {
      e.preventDefault(); // 🚫 IMPEDE A NAVEGAÇÃO
      addToast("Acesso Bloqueado: Você não tem permissão para essa área.", "error");
    }
  };

  // Se você quiser que o botão fique visualmente desabilitado ou com cadeado:
  if (!hasPermission && showLockIcon) {
      return (
          <div className={`${className} opacity-50 cursor-not-allowed flex items-center gap-2`} onClick={handleClick}>
              {children} <Lock size={14} />
          </div>
      );
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}