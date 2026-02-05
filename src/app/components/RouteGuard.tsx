"use client";

// ============================================================================
// 1. IMPORTAÇÕES & CONSTANTES
// ============================================================================
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import SharkLoader from "./SharkLoader";
import { usePathname, useRouter } from "next/navigation";
// 🦈 CORREÇÃO: Removido 'useMemo' que não estava sendo usado
import { useEffect, useState } from "react";

// Mude para false quando for para produção
const SHOW_DEBUG_ON_SCREEN = false; // process.env.NODE_ENV === 'development';

// 🦈 ZONA SEGURA (Rotas Públicas)
const PUBLIC_PATHS = [
  "/login",
  "/",
  "/historico",
  "/cadastro",
  "/termos",
  "/empresa/cadastro",
  "/recuperar-senha",
];

// 🦈 ZONA DE DEGUSTAÇÃO (O que o visitante anônimo pode ver)
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
  // 2. BUSCA DE REGRAS (CACHE + FIREBASE COM FAIL-SAFE)
  // ============================================================================
  useEffect(() => {
    let isMounted = true;

    const fetchRules = async () => {
      // 1. Tenta Cache Local (Velocidade do Tubarão)
      const cachedRules = localStorage.getItem("shark_permissions");
      if (cachedRules) {
        try {
          if (isMounted) {
            setPermissionMatrix(JSON.parse(cachedRules));
            setRulesLoading(false); // Libera rápido
          }
        } catch (e) {
          console.error("Erro ao ler cache de regras:", e);
        }
      }

      // 2. Busca Atualização no Oceano (Firebase)
      try {
        const docSnap = await getDoc(doc(db, "settings", "permissions"));
        if (docSnap.exists() && isMounted) {
          const liveRules = docSnap.data() as PermissionMatrix;
          
          // Só atualiza se mudou (evita re-render desnecessário)
          if (JSON.stringify(liveRules) !== cachedRules) {
            setPermissionMatrix(liveRules);
            localStorage.setItem("shark_permissions", JSON.stringify(liveRules));
          }
        }
      } catch (error) {
        console.error("🚨 Erro crítico ao buscar regras:", error);
        // Em caso de erro, mantemos o cache ou vazio, mas NÃO travamos o app
      } finally {
        if (isMounted) setRulesLoading(false);
      }
    };

    fetchRules();

    return () => {
      isMounted = false;
    };
  }, []);

  // ============================================================================
  // 3. O GUARDA: LÓGICA DE SEGURANÇA
  // ============================================================================
  useEffect(() => {
    // Se ainda está carregando Auth ou Regras, o Tubarão espera.
    if (authLoading || rulesLoading) return;

    const currentPath = pathname ? pathname.split("?")[0] : "/";

    // 🦈 DEFINIÇÃO DE ROLE
    let userRole = "visitante";
    if (user) {
      if (user.isAnonymous) {
        userRole = "guest_anon"; // Visitante Anônimo (Firebase Anon)
      } else {
        userRole = (user.role || "user").toLowerCase();
      }
    }

    // --- A. ROTAS PÚBLICAS (LIBERADAS GERAL) ---
    const isPublic = PUBLIC_PATHS.some(p => currentPath === p || currentPath.startsWith("/public"));
    if (isPublic) {
      setAuthorized(true);
      return;
    }

    // --- B. NÃO LOGADO (MANDA PRO LOGIN) ---
    if (!user) {
      setAuthorized(false);
      // Evita loop se já estiver indo pro login
      if (currentPath !== "/login") {
        router.replace("/login"); // 'replace' é melhor que 'push' para login
      }
      return;
    }

    // --- C. BANIDOS (JAULA) ---
    if ((user.status === "banned" || user.status === "bloqueado") && currentPath !== "/banned") {
      setAuthorized(false);
      router.replace("/banned");
      return;
    }

    // --- D. VISITANTE ANÔNIMO (DEGUSTAÇÃO) ---
    if (userRole === "guest_anon") {
      const isAllowed = GUEST_ALLOWED_PATHS.some((p) =>
        currentPath === p || currentPath.startsWith(p + "/")
      );

      if (!isAllowed) {
        setAuthorized(false);
        router.replace("/dashboard"); // Manda pra casa segura
        return;
      }
      // Se permitido, segue o fluxo para aprovação final
    }

    // --- E. GUEST COM LOGIN GOOGLE (FALTA CADASTRO) ---
    // Se o cara logou com Google mas não tem role definida ou é 'guest' (não anonimo)
    if ((userRole === "guest" || !user.role) && !user.isAnonymous && currentPath !== "/cadastro") {
       // Permite logout ou cadastro
       setAuthorized(false);
       router.replace("/cadastro");
       return;
    }

    // --- F. MATRIZ DE PERMISSÕES (ADMIN E OUTROS) ---
    if (permissionMatrix) {
      // MASTER: O Tubarão Rei acessa tudo
      if (userRole === "master") {
        setAuthorized(true);
        setDebugInfo({ role: userRole, path: currentPath, decision: "👑 MASTER PASS" });
        return;
      }

      // Encontra a regra mais específica para o caminho atual
      const matchedRulePath = Object.keys(permissionMatrix)
        .filter((rulePath) => currentPath === rulePath || currentPath.startsWith(rulePath + "/"))
        .sort((a, b) => b.length - a.length)[0]; // Pega a string mais longa (mais específica)

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
          // Redirecionamento inteligente
          if (user.isAnonymous) {
            router.replace("/dashboard");
          } else {
            router.replace("/sem-permissao");
          }
          return;
        }
      }
    }

    // --- G. EMPRESAS (SEGURANÇA EXTRA) ---
    if (userRole === "empresa" && !currentPath.startsWith("/empresa") && currentPath !== "/dashboard" && currentPath !== "/perfil") {
       setAuthorized(false);
       router.replace("/empresa");
       return;
    }

    // SE PASSOU POR TUDO: LIBERADO! 🚀
    setAuthorized(true);

  }, [user, authLoading, rulesLoading, pathname, router, permissionMatrix]);

  // ============================================================================
  // 4. RENDERIZAÇÃO
  // ============================================================================
  
  // 1. Carregando dados vitais? Mostra Spinner.
  if (authLoading || rulesLoading) return <SharkLoader />;

  // 2. Se o usuário está sendo redirecionado (não autorizado e tem user), segura o spinner.
  //    MAS, se a rota for pública, renderiza logo (ex: Login) para evitar travamento.
  const currentPath = pathname ? pathname.split("?")[0] : "/";
  const isPublicRenderCheck = PUBLIC_PATHS.includes(currentPath);

  if (!authorized && !isPublicRenderCheck && user) {
    return <SharkLoader />;
  }

  // 3. Se não autorizado e sem usuário, mostra loader enquanto o useEffect joga pro login.
  //    (A menos que já esteja numa rota pública, aí mostra o conteúdo, ex: tela de login)
  if (!authorized && !user && !isPublicRenderCheck) {
      return <SharkLoader />;
  }

  return (
    <>
      {children}
      
      {/* PAINEL DE DEPURAÇÃO (Visível apenas em DEV ou flag ativada) */}
      {SHOW_DEBUG_ON_SCREEN && user?.role !== "master" && (
        <div className="fixed bottom-2 right-2 bg-zinc-950/90 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 p-3 rounded-lg z-[99999] shadow-2xl backdrop-blur-sm pointer-events-none">
          <div className="font-bold text-white mb-1">🦈 SHARK GUARD</div>
          <div><span className="text-zinc-500">Role:</span> {debugInfo.role}</div>
          <div><span className="text-zinc-500">Path:</span> {debugInfo.path}</div>
          <div className="mt-1 font-bold">{debugInfo.decision}</div>
        </div>
      )}
    </>
  );
}