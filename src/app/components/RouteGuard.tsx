"use client";

// 1. CORREÇÃO DE IMPORTAÇÕES (Ajuste de pastas ../../)
import { useAuth } from "../../context/AuthContext"; 
import { db } from "../../lib/firebase"; 
import { doc, getDoc } from "firebase/firestore";

// 2. IMPORTA O COMPONENTE PURO DO TUBARÃO (Não a página loading)
import SharkLoader from "./SharkLoader"; 

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mude para false quando for para produção
const SHOW_DEBUG_ON_SCREEN = true;

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
  // 1. CARREGA AS REGRAS (CACHE PRIMEIRO, DEPOIS FIREBASE)
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchRules = async () => {
        // A. Tenta Cache Local (Velocidade Extrema)
        const cachedRules = localStorage.getItem("shark_permissions");
        if (cachedRules) {
            setPermissionMatrix(JSON.parse(cachedRules));
            setLoadingRules(false); // Libera o app imediatamente
        }

        try {
            // B. Sincroniza com Firebase em Segundo Plano
            const docSnap = await getDoc(doc(db, "settings", "permissions"));
            if (docSnap.exists()) {
                const liveRules = docSnap.data() as Record<string, string[]>;
                
                // Se o banco mudou em relação ao cache, atualiza
                if (JSON.stringify(liveRules) !== cachedRules) {
                    setPermissionMatrix(liveRules);
                    localStorage.setItem("shark_permissions", JSON.stringify(liveRules));
                }
            }
        } catch (error) {
            console.error("Erro ao atualizar regras de segurança:", error);
        } finally {
            setLoadingRules(false);
        }
    };
    fetchRules();
  }, []);

  // ------------------------------------------------------------------
  // 2. O GUARDA: ANALISA CADA ROTA
  // ------------------------------------------------------------------
  useEffect(() => {
    // Se o Auth ou as Regras ainda carregam, pausa tudo.
    if (loading || loadingRules) return;

    const path = pathname.split("?")[0]; 
    // Garante que a role seja minúscula para bater com a matriz
    const userRole = user ? (user.role || 'user').toLowerCase() : 'visitante';
    
    // --- LÓGICA DE DECISÃO ---

    // A. Rotas Públicas (Sempre liberadas, Logado ou Não)
    const publicPaths = ["/login", "/", "/historico", "/cadastro", "/termos", "/empresa/cadastro", "/banned"];
    if (publicPaths.includes(path)) {
        setAuthorized(true);
        return;
    }

    // B. Bloqueio de Não Logado
    if (!user) {
        setAuthorized(false);
        router.push("/");
        return;
    }

    // C. Bloqueio de Banidos (A Jaula)
    if ((user.status === 'banned' || user.status === 'bloqueado') && path !== '/banned') {
        router.push("/banned");
        return;
    }

    // D. Bloqueio de Guest (Cadastro Incompleto)
    if (userRole === 'guest' && path !== '/cadastro') {
        router.push("/cadastro");
        return;
    }

    // E. Matriz de Permissões (O Coração da Segurança)
    if (permissionMatrix) {
        // Master tem a Chave Mestra
        if (userRole === 'master') {
            setAuthorized(true);
            return;
        }

        // Busca a regra mais específica (Longest Prefix Match)
        // Ex: "/admin/usuarios/123" tenta achar regra para "/admin/usuarios" antes de "/admin"
        const matchedPath = Object.keys(permissionMatrix)
            .filter(rulePath => path === rulePath || path.startsWith(rulePath + '/'))
            .sort((a, b) => b.length - a.length)[0];

        if (matchedPath) {
            const allowedRoles = permissionMatrix[matchedPath].map(r => r.toLowerCase());
            
            // Atualiza o Debugger Visual
            setDebugInfo({ 
                role: userRole, 
                path: path, 
                decision: allowedRoles.includes(userRole) ? "✅ OK" : `⛔ BLOQ (Regra: ${matchedPath})` 
            });

            // O VEREDITO FINAL
            if (!allowedRoles.includes(userRole)) {
                console.warn(`⛔ ACESSO NEGADO: ${userRole} em ${path}`);
                setAuthorized(false);
                router.push("/dashboard"); // Chuta para segurança
                return;
            }
        } else {
             // Se não tem regra, a gente assume que está "Liberado" por padrão, mas avisa no debug
             setDebugInfo({ role: userRole, path, decision: "⚠️ Sem Regra (Liberado)" });
        }
    }

    // F. Regra de Empresa (Hardcoded Safety)
    if (userRole === 'empresa' && !path.startsWith('/empresa') && path !== '/dashboard') {
        router.push("/empresa");
        return;
    }

    // Se passou por tudo, libera o acesso
    setAuthorized(true);

  }, [user, loading, loadingRules, pathname, router, permissionMatrix]);

  // ------------------------------------------------------------------
  // 3. RENDERIZAÇÃO: CARREGANDO OU CONTEÚDO
  // ------------------------------------------------------------------
  
  if (loading || loadingRules || !authorized) {
    const path = pathname?.split("?")[0];
    const publicPaths = ["/login", "/", "/historico", "/cadastro", "/termos", "/empresa/cadastro", "/banned"];
    
    // EXCEÇÃO: Se for página pública e o user não estiver logado, 
    // mostramos a página (ex: Login) em vez do Loading.
    if (!user && publicPaths.includes(path)) {
       return <>{children}</>;
    }

    // MOSTRA O TUBARÃO (Cobre a tela inteira com z-index alto)
    return <SharkLoader />;
  }

  return (
    <>
        {children}
        
        {/* DEBUGGER VISUAL (Só aparece se ativado e não for Master) */}
        {SHOW_DEBUG_ON_SCREEN && user?.role !== 'master' && (
            <div className="fixed bottom-1 right-1 bg-black/90 text-[9px] font-mono text-emerald-500 p-2 rounded-lg border border-emerald-900 pointer-events-none z-[10000] shadow-xl">
               <span className="text-zinc-500">USER:</span> {debugInfo.role} <br/>
               <span className="text-zinc-500">ROTA:</span> {debugInfo.path} <br/>
               <span className="text-white font-bold">{debugInfo.decision}</span>
            </div>
        )}
    </>
  );
}