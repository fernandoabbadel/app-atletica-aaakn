"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  // Função que verifica a permissão SEM navegar
  const checkAccess = () => {
    if (!user) return false;
    if (user.role === 'master') return true; // Master entra em tudo

    // 1. Pega as regras do cache (mesma lógica do RouteGuard)
    const cachedRules = localStorage.getItem("shark_permissions");
    if (!cachedRules) return true; // Se não tem regra carregada, assume liberado (ou bloqueado, depende da sua política)

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