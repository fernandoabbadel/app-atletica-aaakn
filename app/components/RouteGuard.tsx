"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const publicPaths = ["/login", "/", "/historico", "/cadastro"];
    const path = pathname.split("?")[0];

    // 1. Bloqueio de Visitante (Login obrigatório para páginas internas)
    if (!user && !publicPaths.includes(path)) {
      setAuthorized(false);
      router.push("/login");
      return;
    }

    // 2. Bloqueio de Admin (Segurança da Área Restrita)
    if (path.startsWith("/admin")) {
      // Se não tem usuário OU o papel é apenas 'user' ou 'guest'
      if (!user || user.role === "user" || user.role === "guest") {
        setAuthorized(false);
        router.push("/"); // Manda de volta pra casa
        return;
      }
    }

    setAuthorized(true);
  }, [user, pathname, router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-emerald-500 font-bold text-xs uppercase tracking-widest animate-pulse">
            Verificando Acesso...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
