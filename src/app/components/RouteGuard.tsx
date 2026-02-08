"use client";

// ============================================================================
// 1. IMPORTAÇÕES & CONSTANTES
// ============================================================================
import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext"; 
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import SharkLoader from "./SharkLoader";
import { usePathname, useRouter } from "next/navigation";

// Mude para false quando for para produção
const SHOW_DEBUG_ON_SCREEN = process.env.NODE_ENV === 'development';

// 🦈 ZONA SEGURA (Rotas Públicas - O RouteGuard ignora essas)
// IMPORTANTE: /banned, /em-breve e /nao-encontrado PRECISAM estar aqui
// para o usuário conseguir visualizar a página sem entrar em loop.
const PUBLIC_PATHS = [
  "/login",
  "/",
  "/historico",
  "/cadastro",
  "/configuracoes/termos",
  "/empresa/cadastro",
  "/recuperar-senha",
  "/sem-permissao", 
  "/banned",       
  "/em-breve",      
  "/nao-encontrado" 
];

// 🦈 ZONA DE OBRAS (Funcionalidades futuras)
// Se o usuário tentar acessar isso, ele cai na página /em-breve
const COMING_SOON_PATHS = [
  "/marketplace-futuro", 
  "/funcionalidade-x",
  "/shark-tv"
];

// 🦈 ZONA DE DEGUSTAÇÃO (O que o visitante sem cadastro completo vê)
const GUEST_ALLOWED_PATHS = [
  "/dashboard",
  "/perfil",
  "/loja",
  "/games",
  "/ranking",
  "/treinos",
];

interface PermissionMatrix {
  [path: string]: string[];
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useToast(); 
  const router = useRouter();
  const pathname = usePathname();

  const [authorized, setAuthorized] = useState(false);
  const [permissionMatrix, setPermissionMatrix] = useState<PermissionMatrix | null>(null);
  const [rulesLoading, setRulesLoading] = useState(true);

  // Debug Info
  const [debugInfo, setDebugInfo] = useState({
    role: "...",
    path: "",
    decision: "...",
  });

  // ============================================================================
  // 2. BUSCA DE REGRAS (CACHE + FIREBASE)
  // ============================================================================
  useEffect(() => {
    let isMounted = true;

    const fetchRules = async () => {
      // 1. Cache Local
      const cachedRules = localStorage.getItem("shark_permissions");
      if (cachedRules) {
        try {
          const parsed = JSON.parse(cachedRules);
          if (parsed && typeof parsed === 'object') {
             if (isMounted) {
                setPermissionMatrix(parsed);
                setRulesLoading(false);
             }
          }
        } catch (error) {
          localStorage.removeItem("shark_permissions");
        }
      }

      // 2. Firebase Live
      try {
        const docSnap = await getDoc(doc(db, "settings", "permissions"));
        if (docSnap.exists() && isMounted) {
          const liveRules = docSnap.data() as PermissionMatrix;
          if (JSON.stringify(liveRules) !== cachedRules) {
            setPermissionMatrix(liveRules);
            localStorage.setItem("shark_permissions", JSON.stringify(liveRules));
          }
        }
      } catch (error) {
        console.error("Erro Rules:", error);
      } finally {
        if (isMounted) setRulesLoading(false);
      }
    };

    fetchRules();
    return () => { isMounted = false; };
  }, []);

  // ============================================================================
  // 3. O GUARDA: LOGICA DE PRIORIDADE (AQUI ESTÁ O SEGREDO)
  // ============================================================================
  useEffect(() => {
    const currentPath = pathname ? pathname.split("?")[0] : "/";
    
    // PRIORIDADE 1: É rota pública? Libera JÁ.
    // Isso garante que /banned e /em-breve carreguem sem travar.
    const isPublic = PUBLIC_PATHS.some(p => currentPath === p || currentPath.startsWith("/public"));
    if (isPublic) {
      setAuthorized(true);
      return; 
    }

    // Se não é pública, espera carregar auth e regras
    if (authLoading || (!permissionMatrix && rulesLoading)) return;

    // Definição de Role
    let userRole = "visitante";
    if (user) {
      if (user.isAnonymous) userRole = "guest_anon";
      else userRole = (user.role || "user").toLowerCase();
    }

    // PRIORIDADE 2: Em Breve (Antes de checar permissão)
    // Se a funcionalidade tá em obra, ninguém entra (exceto se você quiser liberar Master aqui depois)
    if (COMING_SOON_PATHS.some(p => currentPath.startsWith(p))) {
        setAuthorized(false);
        // Feedback opcional (se quiser avisar antes de trocar)
        // addToast("Ops! Estamos construindo essa parte 🚧", "info");
        router.replace("/em-breve");
        return;
    }

    // PRIORIDADE 3: Login Obrigatório
    if (!user) {
      setAuthorized(false);
      addToast("Opa! Faz login pra nadar com o cardume! 🦈", "info");
      router.replace("/login");
      return;
    }

    // PRIORIDADE 4: Jaula (Banidos)
    if ((user.status === "banned" || user.status === "bloqueado")) {
      setAuthorized(false);
      if (currentPath !== "/banned") {
          router.replace("/banned");
      }
      return;
    }

    // PRIORIDADE 5: Visitante Anônimo
    if (userRole === "guest_anon") {
      const isAllowed = GUEST_ALLOWED_PATHS.some((p) =>
        currentPath === p || currentPath.startsWith(p + "/")
      );

      if (!isAllowed) {
        setAuthorized(false);
        addToast("Essa área é exclusiva para membros oficiais! 🚫", "error");
        router.replace("/dashboard");
        return;
      }
    }

    // PRIORIDADE 6: Cadastro Pendente (Guest Google)
    if ((userRole === "guest" || !user.role) && !user.isAnonymous && currentPath !== "/cadastro") {
       setAuthorized(false);
       addToast("Quase lá! Termine seu cadastro pra liberar tudo. 📝", "info");
       router.replace("/cadastro");
       return;
    }

    // PRIORIDADE 7: Matriz de Permissões (O Grande Filtro)
    if (permissionMatrix) {
      if (userRole === "master") {
        setAuthorized(true);
        setDebugInfo({ role: userRole, path: currentPath, decision: "👑 MASTER PASS" });
        return;
      }

      const matchedRulePath = Object.keys(permissionMatrix)
        .filter((rulePath) => currentPath === rulePath || currentPath.startsWith(rulePath + "/"))
        .sort((a, b) => b.length - a.length)[0];

      if (matchedRulePath) {
        const allowedRoles = permissionMatrix[matchedRulePath].map((r) => r.toLowerCase());
        const isRoleAllowed = allowedRoles.includes(userRole);

        setDebugInfo({
          role: userRole,
          path: currentPath,
          decision: isRoleAllowed ? "✅ PERMITIDO" : "⛔ BLOQUEADO",
        });

        if (!isRoleAllowed) {
          setAuthorized(false);
          // 🦈 FEEDBACK JOVEM E DIRETO
          addToast("Eita! Você não tem a chave dessa porta, Tubarão! 🚫", "error");
          
          if (user.isAnonymous) {
            router.replace("/dashboard");
          } else {
            router.replace("/sem-permissao");
          }
          return;
        }
      } else {
        // Bloqueio padrão para /admin
        if (currentPath.startsWith("/admin")) {
            setAuthorized(false);
            addToast("Opa! Área restrita da diretoria! 👮", "error");
            router.replace("/sem-permissao");
            return;
        }
      }
    }

    // PRIORIDADE 8: Empresa
    if (userRole === "empresa" && !currentPath.startsWith("/empresa") && !["/dashboard", "/perfil"].includes(currentPath)) {
       setAuthorized(false);
       addToast("Seu painel de parceiros é por aqui! 💼", "info");
       router.replace("/empresa");
       return;
    }

    // LIBERADO!
    setAuthorized(true);

  }, [user, authLoading, rulesLoading, pathname, router, permissionMatrix, addToast]);

  // ============================================================================
  // 4. RENDERIZAÇÃO
  // ============================================================================
  
  const currentPath = pathname ? pathname.split("?")[0] : "/";
  const isPublicRenderCheck = PUBLIC_PATHS.includes(currentPath);

  // 1. Rota Pública? Renderiza JÁ (Sem loader, sem piscar)
  // Isso faz com que /banned e /em-breve apareçam instantaneamente
  if (isPublicRenderCheck) {
      return <>{children}</>;
  }

  // 2. Carregando lógica? Loader.
  if (authLoading || (rulesLoading && !permissionMatrix)) return <SharkLoader />;

  // 3. Negado ou esperando redirect? Loader.
  if (!authorized) {
      return <SharkLoader />;
  }

  return (
    <>
      {children}
      {SHOW_DEBUG_ON_SCREEN && user?.role !== "master" && (
        <div className="fixed bottom-2 right-2 bg-zinc-950/90 border border-emerald-500/30 text-[10px] text-emerald-400 p-2 rounded z-50">
           GUARD: {debugInfo.decision}
        </div>
      )}
    </>
  );
}