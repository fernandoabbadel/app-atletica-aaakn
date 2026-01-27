"use client";

// 1. IMPORTAÇÕES
import { useAuth } from "@/context/AuthContext"; 
import { db } from "@/lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";
import SharkLoader from "./SharkLoader"; 
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mude para false quando for para produção
const SHOW_DEBUG_ON_SCREEN = false; 

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [authorized, setAuthorized] = useState(false);
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, string[]> | null>(null);
  const [loadingRules, setLoadingRules] = useState(true);

  // Debug Info
  const [debugInfo, setDebugInfo] = useState({
    role: "...",
    path: "",
    decision: "..."
  });

  // ------------------------------------------------------------------
  // 1. CARREGA AS REGRAS (CACHE + FIREBASE)
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchRules = async () => {
        const cachedRules = localStorage.getItem("shark_permissions");
        if (cachedRules) {
            try {
                setPermissionMatrix(JSON.parse(cachedRules));
                setLoadingRules(false);
            } catch (e) { console.error(e); }
        }

        try {
            const docSnap = await getDoc(doc(db, "settings", "permissions"));
            if (docSnap.exists()) {
                const liveRules = docSnap.data() as Record<string, string[]>;
                if (JSON.stringify(liveRules) !== cachedRules) {
                    setPermissionMatrix(liveRules);
                    localStorage.setItem("shark_permissions", JSON.stringify(liveRules));
                }
            }
        } catch (error) {
            console.error("Erro regras:", error);
        } finally {
            setLoadingRules(false);
        }
    };
    fetchRules();
  }, []);

  // ------------------------------------------------------------------
  // 2. O GUARDA: A LÓGICA REFINADA 🦈
  // ------------------------------------------------------------------
  useEffect(() => {
    if (loading || loadingRules) return;

    const path = pathname ? pathname.split("?")[0] : "/"; 
    
    // 🦈 DEFINIÇÃO DE ROLE INTELIGENTE
    let userRole = 'visitante';
    if (user) {
        if (user.isAnonymous) {
            userRole = 'guest'; // É visitante anônimo
        } else {
            userRole = (user.role || 'user').toLowerCase();
        }
    }

    // --- A. ROTAS PÚBLICAS (LIBERADAS GERAL) ---
    const publicPaths = ["/login", "/", "/historico", "/cadastro", "/termos", "/empresa/cadastro", "/recuperar-senha"];
    if (publicPaths.includes(path) || path.startsWith("/public")) {
        setAuthorized(true);
        return;
    }

    // --- B. NÃO LOGADO (MANDA PRO LOGIN) ---
    if (!user) {
        setAuthorized(false);
        router.push("/login"); 
        return;
    }

    // --- C. BANIDOS (JAULA) ---
    if ((user.status === 'banned' || user.status === 'bloqueado') && path !== '/banned') {
        router.push("/banned");
        return;
    }

    // --- D. TRATAMENTO DO VISITANTE ANÔNIMO (DEGUSTAÇÃO) 🦈 ---
    if (userRole === 'guest' && user.isAnonymous) {
        // O que o visitante pode ver?
        const allowedGuestPaths = [
            '/dashboard', 
            '/perfil', 
            '/loja', 
            '/games', 
            '/ranking',
            '/treinos' // Deixamos ver a lista, mas não interagir (controlar dentro da pag)
        ]; 
        
        const isAllowed = allowedGuestPaths.some(p => path === p || path.startsWith(p + '/'));

        // Se tentar acessar Admin ou Financeiro -> Joga pro Dashboard
        if (!isAllowed && path !== '/dashboard') {
             router.push("/dashboard");
             return;
        }
        
        // Se for permitido, segue o fluxo (vai cair no final authorized=true)
    }

    // --- E. TRATAMENTO DO GUEST COM LOGIN GOOGLE (FALTA CADASTRO) ---
    // Se a role é guest mas NÃO é anônimo, ele precisa terminar o cadastro
    if (userRole === 'guest' && !user.isAnonymous && path !== '/cadastro') {
        router.push("/cadastro");
        return;
    }

    // --- F. MATRIZ DE PERMISSÕES (ADMIN E OUTROS) ---
    if (permissionMatrix) {
        if (userRole === 'master') {
            setAuthorized(true);
            return;
        }

        const matchedPath = Object.keys(permissionMatrix)
            .filter(rulePath => path === rulePath || path.startsWith(rulePath + '/'))
            .sort((a, b) => b.length - a.length)[0];

        if (matchedPath) {
            const allowedRoles = permissionMatrix[matchedPath].map(r => r.toLowerCase());
            
            setDebugInfo({ 
                role: userRole, 
                path: path, 
                decision: allowedRoles.includes(userRole) ? "✅ OK" : `⛔ BLOQ` 
            });

            if (!allowedRoles.includes(userRole)) {
                // Se for Visitante e for bloqueado, manda pro Dashboard, senão, sem permissão
                if (user.isAnonymous) {
                    router.push("/dashboard");
                } else {
                    router.push("/sem-permissao");
                }
                setAuthorized(false);
                return;
            }
        }
    }

    // --- G. EMPRESAS (SEGURANÇA EXTRA) ---
    if (userRole === 'empresa' && !path.startsWith('/empresa') && path !== '/dashboard' && path !== '/perfil') {
        router.push("/empresa");
        return;
    }

    // LIBERADO! 🚀
    setAuthorized(true);

  }, [user, loading, loadingRules, pathname, router, permissionMatrix]);

  // ------------------------------------------------------------------
  // 3. RENDERIZAÇÃO
  // ------------------------------------------------------------------
  if (loading || loadingRules) return <SharkLoader />;

  // Se não autorizado e tem user (está redirecionando), segura o loader
  if (!authorized && user) return <SharkLoader />;
  
  // Rota pública e user deslogado -> Renderiza a tela (ex: Login)
  if (!authorized && !user) {
      const path = pathname ? pathname.split("?")[0] : "/";
      const publicPaths = ["/login", "/", "/historico", "/cadastro", "/termos", "/empresa/cadastro", "/recuperar-senha"];
      if (publicPaths.includes(path)) return <>{children}</>;
      return <SharkLoader />;
  }

  return (
    <>
        {children}
        {SHOW_DEBUG_ON_SCREEN && user?.role !== 'master' && (
            <div className="fixed bottom-1 right-1 bg-black/90 text-[10px] font-mono text-emerald-500 p-2 rounded-lg z-[10000] opacity-80">
               Role: {debugInfo.role} <br/>
               Path: {debugInfo.path} <br/>
               {debugInfo.decision}
            </div>
        )}
    </>
  );
}