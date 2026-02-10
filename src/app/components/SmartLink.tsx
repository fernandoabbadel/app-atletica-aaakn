"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { Lock } from "lucide-react";

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showLockIcon?: boolean;
}

const parsePermissionMatrix = (
  raw: string
): Record<string, string[]> | null => {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null) return null;

    const normalized: Record<string, string[]> = {};
    for (const [path, roles] of Object.entries(parsed)) {
      if (!Array.isArray(roles)) continue;

      const safeRoles = roles.filter(
        (entry): entry is string => typeof entry === "string"
      );
      if (!safeRoles.length) continue;

      normalized[path] = safeRoles;
    }

    return normalized;
  } catch {
    return null;
  }
};

export default function SmartLink({
  href,
  children,
  className,
  showLockIcon = false,
}: SmartLinkProps) {
  const { user } = useAuth();
  const { addToast } = useToast();

  const checkAccess = () => {
    if (typeof window === "undefined") return true;

    if (!user) return false;
    if (user.role === "master") return true;

    const cachedRules = localStorage.getItem("shark_permissions");
    if (!cachedRules) return true;

    try {
      const permissionMatrix = parsePermissionMatrix(cachedRules);
      if (!permissionMatrix) return true;

      const path = href.toString().split("?")[0];
      const userRole = (user.role || "user").toLowerCase();

      const matchedPath = Object.keys(permissionMatrix)
        .filter(
          (rulePath) => path === rulePath || path.startsWith(`${rulePath}/`)
        )
        .sort((a, b) => b.length - a.length)[0];

      if (matchedPath) {
        const allowedRoles = permissionMatrix[matchedPath].map((r) =>
          r.toLowerCase()
        );
        return allowedRoles.includes(userRole);
      }
    } catch (error: unknown) {
      console.error("Erro ao verificar permissão no SmartLink", error);
      return true;
    }

    return true;
  };

  const hasPermission = checkAccess();

  const handleClick = (e: React.MouseEvent) => {
    if (!hasPermission) {
      e.preventDefault();
      addToast(
        "Acesso Bloqueado: Você não tem permissão para essa área.",
        "error"
      );
    }
  };

  if (!hasPermission && showLockIcon) {
    return (
      <div
        className={`${className} opacity-50 cursor-not-allowed flex items-center gap-2`}
        onClick={handleClick}
      >
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
