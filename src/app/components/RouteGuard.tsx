"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext"; 
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import SharkLoader from "./SharkLoader";
import { usePathname, useRouter } from "next/navigation";
import { PUBLIC_PATHS, COMING_SOON_PATHS, GUEST_ALLOWED_PATHS } from "@/lib/appRoutes";
import { isFirebasePermissionError } from "@/lib/firebaseErrors";

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

  // 1. BUSCA DE REGRAS (BLINDADA CONTRA ERROS)
  useEffect(() => {
    let isMounted = true;

    const fetchRules = async () => {
      // Tenta carregar do cache primeiro para velocidade
      const cachedRules = localStorage.getItem("shark_permissions");
      if (cachedRules) {
        try {
          const parsed = JSON.parse(cachedRules);
          if (parsed && typeof parsed === 'object' && isMounted) {
             setPermissionMatrix(parsed);
             setRulesLoading(false);
          }
        } catch {
          localStorage.removeItem("shark_permissions");
        }
      }

      // Tenta buscar do Firebase
      try {
        const docRef = doc(db, "settings", "permissions");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && isMounted) {
          const liveRules = docSnap.data() as PermissionMatrix;
          setPermissionMatrix(liveRules);
          localStorage.setItem("shark_permissions", JSON.stringify(liveRules));
        } else if (isMounted) {
           // Se nÃ£o existir doc, usa um fallback vazio para nÃ£o travar
           setPermissionMatrix({});
        }
      } catch (error: unknown) {
        if (!isFirebasePermissionError(error)) {
          console.warn("RouteGuard: usando regras locais (Firebase bloqueado ou offline).");
        }
        // Em caso de erro (ex: permissÃ£o), define vazio para liberar rotas pÃºblicas e nÃ£o travar
        if (isMounted) setPermissionMatrix({});
      } finally {
        if (isMounted) setRulesLoading(false);
      }
    };

    fetchRules();
    return () => { isMounted = false; };
  }, []); // Remove dependency on permissionMatrix to avoid loops

  // 2. LÃ“GICA DE PROTEÃ‡ÃƒO
  useEffect(() => {
    const currentPath = pathname ? pathname.split("?")[0] : "/";
    
    // ROTA PÃšBLICA: Libera Imediatamente
    const isPublic = PUBLIC_PATHS.some(p => currentPath === p || currentPath.startsWith("/public"));
    if (isPublic) {
      setAuthorized(true);
      return; 
    }

    // Se ainda estÃ¡ carregando Auth ou Regras, espera
    if (authLoading || rulesLoading) return;

    // DefiniÃ§Ã£o de Role
    let userRole = "visitante";
    if (user) {
      if (user.isAnonymous) userRole = "guest_anon";
      else userRole = (user.role || "user").toLowerCase();
    }

    // Em Breve
    if (COMING_SOON_PATHS.some(p => currentPath.startsWith(p))) {
        setAuthorized(false);
        router.replace("/em-breve");
        return;
    }

    // Login ObrigatÃ³rio
    if (!user) {
      setAuthorized(false);
      // Evita toast repetido na troca de rota rÃ¡pida
      if (currentPath !== "/login") {
          addToast("Opa! Faz login pra nadar com o cardume! ðŸ¦ˆ", "info");
          router.replace("/login");
      }
      return;
    }

    // Banidos
    if ((user.status === "banned" || user.status === "bloqueado")) {
      setAuthorized(false);
      if (currentPath !== "/banned") router.replace("/banned");
      return;
    }

    // Visitante AnÃ´nimo
    if (userRole === "guest_anon") {
      const isAllowed = GUEST_ALLOWED_PATHS.some((p) =>
        currentPath === p || currentPath.startsWith(p + "/")
      );

      if (!isAllowed) {
        setAuthorized(false);
        addToast("Essa Ã¡rea Ã© exclusiva para membros oficiais! ðŸš«", "error");
        router.replace("/dashboard");
        return;
      }
    }

    // Matriz de PermissÃµes (SÃ³ se carregou com sucesso)
    if (permissionMatrix && Object.keys(permissionMatrix).length > 0) {
      // Master Pass
      if (userRole === "master") {
        setAuthorized(true);
        return;
      }

      const matchedRulePath = Object.keys(permissionMatrix)
        .filter((rulePath) => currentPath === rulePath || currentPath.startsWith(rulePath + "/"))
        .sort((a, b) => b.length - a.length)[0];

      if (matchedRulePath) {
        const allowedRoles = permissionMatrix[matchedRulePath].map((r) => r.toLowerCase());
        const isRoleAllowed = allowedRoles.includes(userRole);

        if (!isRoleAllowed) {
          setAuthorized(false);
          addToast("Eita! VocÃª nÃ£o tem a chave dessa porta, TubarÃ£o! ðŸš«", "error");
          router.replace(user.isAnonymous ? "/dashboard" : "/sem-permissao");
          return;
        }
      } else {
        // Bloqueio padrÃ£o para /admin
        if (currentPath.startsWith("/admin")) {
            setAuthorized(false);
            addToast("Opa! Ãrea restrita da diretoria! ðŸ‘®", "error");
            router.replace("/sem-permissao");
            return;
        }
      }
    }

    // Se passou por tudo, estÃ¡ liberado
    setAuthorized(true);

  }, [user, authLoading, rulesLoading, pathname, router, permissionMatrix, addToast]);

  // 3. RENDERIZAÃ‡ÃƒO
  const currentPath = pathname ? pathname.split("?")[0] : "/";
  const isPublicRenderCheck = PUBLIC_PATHS.includes(currentPath);

  if (isPublicRenderCheck) return <>{children}</>;
  if (authLoading || rulesLoading) return <SharkLoader />;
  if (!authorized) return <SharkLoader />;

  return <>{children}</>;
}

