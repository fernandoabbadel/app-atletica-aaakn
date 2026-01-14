"use client";

// 🦈 CAMINHO CORRIGIDO: Sai de components, sai de app, entra em context
import { useAuth } from "../../context/AuthContext"; 
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function RouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  // Casting 'as any' mantido como solicitado
  const { user, loading } = useAuth() as any; 
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // 0. Se o Firebase ainda está carregando, aguarda...
    if (loading) return;

    // Definição de rotas públicas
    const publicPaths = [
      "/login", 
      "/", 
      "/historico", 
      "/cadastro", 
      "/termos", 
      "/empresa/cadastro"
    ];
    
    // Ignora query params (ex: ?id=123)
    const path = pathname.split("?")[0];

    // 1. BLOQUEIO DE VISITANTE 🚫 (Não logado)
    if (!user) {
      if (!publicPaths.includes(path)) {
        setAuthorized(false);
        // Se tentar acessar área restrita, manda pro Login (Home)
        router.push("/"); 
      } else {
        setAuthorized(true);
      }
      return;
    }

    // A partir daqui, user existe. Pegamos a role.
    const role = (user.role || 'usuario') as string;

    // 2. LÓGICA DA EMPRESA 💼
    if (role === 'empresa') {
      if (!path.startsWith('/empresa')) {
        setAuthorized(false);
        router.push("/empresa");
        return;
      }
    }

    // 3. BLOQUEIO DE ALUNO / GUEST 🛡️
    if (role === 'usuario' || role === 'guest') {
      
      // 🦈 TRAVA DO NOVATO: Se for 'guest', SÓ PODE ir pro /cadastro
      if (role === 'guest' && path !== '/cadastro' && path !== '/' && path !== '/login') {
         router.push("/cadastro");
         return;
      }

      // Se o aluno já terminou o cadastro, mas tenta voltar pro /cadastro, joga pro dashboard
      if (role === 'usuario' && path === '/cadastro') {
         router.push("/dashboard");
         return;
      }

      // Trava de Admin para usuários comuns
      if (path.startsWith('/admin') || (path.startsWith('/empresa') && path !== '/empresa/cadastro')) {
        setAuthorized(false);
        router.push("/dashboard");
        return;
      }
    }

    // 4. REGRAS DENTRO DO ADMIN 👮‍♂️
    if (path.startsWith('/admin')) {
      // 4.1 Treinador
      if (role === 'treinador') {
        const allowedRoutes = ['/admin/treinos', '/admin/gym'];
        const isAllowed = allowedRoutes.some(p => path.startsWith(p));
        if (!isAllowed) {
          setAuthorized(false);
          router.push("/admin/treinos");
          return;
        }
      }
      // 4.2 Admin Comum
      if (role === 'admin') {
        if (path.startsWith('/admin/permissoes')) {
          setAuthorized(false);
          router.push("/admin");
          return;
        }
      }
    }

    setAuthorized(true);

  }, [user, loading, pathname, router]);

  // Spinner de carregamento
  if (loading || !authorized) {
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