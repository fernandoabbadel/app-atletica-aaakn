import { httpsCallable } from "firebase/functions";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db, functions } from "./firebase";
import { getFirebaseErrorCode } from "./firebaseErrors";

type CacheEntry<T> = {
  cachedAt: number;
  value: T;
};

const ADMIN_REPORT_CACHE_TTL_MS = 45_000;
const USER_SUPPORT_CACHE_TTL_MS = 30_000;

const MAX_ADMIN_REPORT_RESULTS = 240;
const MAX_USER_SUPPORT_RESULTS = 80;

const SUBMIT_SUPPORT_CALLABLE = "supportSubmitRequest";
const RESOLVE_BANNED_CALLABLE = "adminResolveBannedAppeal";
const RESOLVE_SUPPORT_CALLABLE = "adminResolveSupportRequest";
const DELETE_BANNED_CALLABLE = "adminDeleteBannedAppeal";
const DELETE_SUPPORT_CALLABLE = "adminDeleteSupportRequest";

type ReportStatus = "pendente" | "resolvida";

export type AdminReportOrigin = "banned_appeals" | "support_requests";

export interface AdminReportRecord {
  id: string;
  autor: string;
  alvo?: string;
  categoria: "banidos" | "suporte";
  motivo: string;
  descricao: string;
  data: string;
  createdAtMs: number;
  status: ReportStatus;
  respostaAdmin?: string;
  originCollection: AdminReportOrigin;
  reporterId?: string;
}

export type SupportCategory =
  | "geral"
  | "financeiro"
  | "conta"
  | "bug"
  | "denuncia"
  | "outro";

export interface SupportTicketRecord {
  id: string;
  category: SupportCategory;
  subject: string;
  message: string;
  status: "pending" | "resolved";
  response?: string;
  createdAtMs: number;
  createdAtLabel: string;
}

const adminReportsCache = new Map<string, CacheEntry<AdminReportRecord[]>>();
const userSupportCache = new Map<string, CacheEntry<SupportTicketRecord[]>>();

const asObject = (value: unknown): Record<string, unknown> | null => {
  if (typeof value !== "object" || value === null) return null;
  return value as Record<string, unknown>;
};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const boundedLimit = (requested: number, maxAllowed: number): number => {
  if (!Number.isFinite(requested)) return maxAllowed;
  if (requested < 1) return 1;
  if (requested > maxAllowed) return maxAllowed;
  return Math.floor(requested);
};

const getCachedValue = <T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  ttlMs: number
): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > ttlMs) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCachedValue = <T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  value: T
): void => {
  cache.set(key, { cachedAt: Date.now(), value });
};

const clearReportsCache = (): void => {
  adminReportsCache.clear();
  userSupportCache.clear();
};

const shouldFallbackToClientWrites = (error: unknown): boolean => {
  const code = getFirebaseErrorCode(error)?.toLowerCase();
  if (!code) return true;

  return (
    code.includes("functions/not-found") ||
    code.includes("functions/unavailable") ||
    code.includes("functions/internal") ||
    code.includes("functions/deadline-exceeded") ||
    code.includes("functions/cancelled") ||
    code.includes("functions/unknown")
  );
};

const isIndexRequiredError = (error: unknown): boolean => {
  const code = getFirebaseErrorCode(error)?.toLowerCase();
  if (code?.includes("failed-precondition")) return true;

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return message.includes("index") && message.includes("query");
  }
  return false;
};

async function callWithFallback<TReq, TRes>(
  callableName: string,
  payload: TReq,
  fallbackFn: () => Promise<TRes>
): Promise<TRes> {
  try {
    const callable = httpsCallable<TReq, TRes>(functions, callableName);
    const response = await callable(payload);
    return response.data;
  } catch (error: unknown) {
    if (shouldFallbackToClientWrites(error)) {
      return fallbackFn();
    }
    throw error;
  }
}

const toMillis = (value: unknown): number => {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "object" && value !== null) {
    const toDate = (value as { toDate?: unknown }).toDate;
    if (typeof toDate === "function") {
      const date = toDate.call(value) as Date;
      if (date instanceof Date) return date.getTime();
    }
  }
  return 0;
};

const toDateLabel = (value: unknown): string => {
  const ms = toMillis(value);
  if (!ms) return "Data desconhecida";
  return new Date(ms).toLocaleString("pt-BR");
};

const toReportStatus = (value: unknown): ReportStatus => {
  const status = asString(value).toLowerCase();
  if (status === "resolved" || status === "resolvida") return "resolvida";
  return "pendente";
};

const normalizeSupportCategory = (value: unknown): SupportCategory => {
  const category = asString(value).toLowerCase();
  if (
    category === "geral" ||
    category === "financeiro" ||
    category === "conta" ||
    category === "bug" ||
    category === "denuncia" ||
    category === "outro"
  ) {
    return category;
  }
  return "geral";
};

const supportCategoryLabel = (category: SupportCategory): string => {
  switch (category) {
    case "financeiro":
      return "Financeiro";
    case "conta":
      return "Conta";
    case "bug":
      return "Bug";
    case "denuncia":
      return "Denuncia";
    case "outro":
      return "Outro";
    default:
      return "Geral";
  }
};

const buildBannedAppealRecord = (
  id: string,
  raw: unknown
): AdminReportRecord | null => {
  const obj = asObject(raw);
  if (!obj) return null;

  return {
    id,
    autor: asString(obj.userName, "Usuario Desconhecido"),
    alvo: "Administracao",
    categoria: "banidos",
    motivo: "Solicitacao de Desbloqueio",
    descricao: asString(obj.message).slice(0, 5_000),
    data: toDateLabel(obj.createdAt),
    createdAtMs: toMillis(obj.createdAt),
    status: toReportStatus(obj.status),
    respostaAdmin: asString(obj.response) || undefined,
    originCollection: "banned_appeals",
    reporterId: asString(obj.userId) || undefined,
  };
};

const buildSupportRecord = (id: string, raw: unknown): AdminReportRecord | null => {
  const obj = asObject(raw);
  if (!obj) return null;

  const category = normalizeSupportCategory(obj.category);
  const subject = asString(obj.subject, "Suporte").trim();

  return {
    id,
    autor: asString(obj.userName, "Usuario"),
    alvo: "Suporte AAAKN",
    categoria: "suporte",
    motivo: subject || `Chamado (${supportCategoryLabel(category)})`,
    descricao: asString(obj.message).slice(0, 5_000),
    data: toDateLabel(obj.createdAt),
    createdAtMs: toMillis(obj.createdAt),
    status: toReportStatus(obj.status),
    respostaAdmin: asString(obj.response) || undefined,
    originCollection: "support_requests",
    reporterId: asString(obj.userId) || undefined,
  };
};

export async function fetchBannedAppeals(
  maxResults = 200
): Promise<AdminReportRecord[]> {
  const safeLimit = boundedLimit(maxResults, MAX_ADMIN_REPORT_RESULTS);
  const cacheKey = `banned:${safeLimit}`;
  const cached = getCachedValue(adminReportsCache, cacheKey, ADMIN_REPORT_CACHE_TTL_MS);
  if (cached) return cached;

  const q = query(
    collection(db, "banned_appeals"),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );
  const snap = await getDocs(q);
  const reports = snap.docs
    .map((row) => buildBannedAppealRecord(row.id, row.data()))
    .filter((item): item is AdminReportRecord => item !== null);

  setCachedValue(adminReportsCache, cacheKey, reports);
  return reports;
}

export async function fetchSupportReports(
  maxResults = 200
): Promise<AdminReportRecord[]> {
  const safeLimit = boundedLimit(maxResults, MAX_ADMIN_REPORT_RESULTS);
  const cacheKey = `support:${safeLimit}`;
  const cached = getCachedValue(adminReportsCache, cacheKey, ADMIN_REPORT_CACHE_TTL_MS);
  if (cached) return cached;

  const q = query(
    collection(db, "support_requests"),
    orderBy("createdAt", "desc"),
    limit(safeLimit)
  );
  const snap = await getDocs(q);
  const reports = snap.docs
    .map((row) => buildSupportRecord(row.id, row.data()))
    .filter((item): item is AdminReportRecord => item !== null);

  setCachedValue(adminReportsCache, cacheKey, reports);
  return reports;
}

export async function resolveAdminReport(payload: {
  reportId: string;
  originCollection: AdminReportOrigin;
  response: string;
  reporterId?: string;
}): Promise<void> {
  const reportId = payload.reportId.trim();
  const response = payload.response.trim().slice(0, 2_000);
  if (!reportId || !response) return;

  const callableName =
    payload.originCollection === "banned_appeals"
      ? RESOLVE_BANNED_CALLABLE
      : RESOLVE_SUPPORT_CALLABLE;

  const requestPayload = {
    reportId,
    response,
    reporterId: payload.reporterId?.trim() || "",
  };

  await callWithFallback<typeof requestPayload, { ok: boolean }>(
    callableName,
    requestPayload,
    async () => {
      await updateDoc(doc(db, payload.originCollection, reportId), {
        response,
        status: "resolved",
        readByAdmin: true,
        resolvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (payload.reporterId?.trim()) {
        await addDoc(collection(db, "notifications"), {
          userId: payload.reporterId.trim(),
          title:
            payload.originCollection === "banned_appeals"
              ? "Apelacao analisada"
              : "Chamado atualizado",
          message:
            payload.originCollection === "banned_appeals"
              ? "Sua apelacao de bloqueio recebeu resposta da diretoria."
              : "O suporte respondeu seu chamado.",
          link:
            payload.originCollection === "banned_appeals"
              ? "/banned"
              : "/configuracoes/suporte",
          read: false,
          type:
            payload.originCollection === "banned_appeals"
              ? "appeal_response"
              : "support_response",
          createdAt: serverTimestamp(),
        });
      }

      return { ok: true };
    }
  );

  clearReportsCache();
}

export async function deleteAdminReport(payload: {
  reportId: string;
  originCollection: AdminReportOrigin;
}): Promise<void> {
  const reportId = payload.reportId.trim();
  if (!reportId) return;

  const callableName =
    payload.originCollection === "banned_appeals"
      ? DELETE_BANNED_CALLABLE
      : DELETE_SUPPORT_CALLABLE;

  await callWithFallback<{ reportId: string }, { ok: boolean }>(
    callableName,
    { reportId },
    async () => {
      await deleteDoc(doc(db, payload.originCollection, reportId));
      return { ok: true };
    }
  );

  clearReportsCache();
}

export async function submitSupportRequest(payload: {
  userId: string;
  userName: string;
  userEmail?: string;
  category: SupportCategory;
  subject: string;
  message: string;
}): Promise<{ id: string }> {
  const userId = payload.userId.trim();
  if (!userId) {
    throw new Error("Usuario invalido para abrir chamado.");
  }

  const requestPayload = {
    userId,
    userName: payload.userName.trim().slice(0, 80) || "Usuario",
    userEmail: payload.userEmail?.trim().slice(0, 120) || "",
    category: normalizeSupportCategory(payload.category),
    subject: payload.subject.trim().slice(0, 120),
    message: payload.message.trim().slice(0, 5_000),
  };

  if (!requestPayload.subject || !requestPayload.message) {
    throw new Error("Assunto e mensagem sao obrigatorios.");
  }

  const result = await callWithFallback<
    typeof requestPayload,
    { id: string }
  >(SUBMIT_SUPPORT_CALLABLE, requestPayload, async () => {
    const ref = await addDoc(collection(db, "support_requests"), {
      ...requestPayload,
      status: "pending",
      readByAdmin: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "notifications"), {
      userId,
      title: "Chamado recebido",
      message: "Seu pedido de suporte foi enviado para analise.",
      link: "/configuracoes/suporte",
      read: false,
      type: "support",
      createdAt: serverTimestamp(),
    });

    return { id: ref.id };
  });

  clearReportsCache();
  return result;
}

export async function fetchUserSupportRequests(
  userId: string,
  maxResults = 25
): Promise<SupportTicketRecord[]> {
  const cleanUserId = userId.trim();
  if (!cleanUserId) return [];

  const safeLimit = boundedLimit(maxResults, MAX_USER_SUPPORT_RESULTS);
  const cacheKey = `${cleanUserId}:${safeLimit}`;
  const cached = getCachedValue(userSupportCache, cacheKey, USER_SUPPORT_CACHE_TTL_MS);
  if (cached) return cached;

  let tickets: SupportTicketRecord[] = [];

  try {
    const q = query(
      collection(db, "support_requests"),
      where("userId", "==", cleanUserId),
      orderBy("createdAt", "desc"),
      limit(safeLimit)
    );
    const snap = await getDocs(q);
    tickets = snap.docs.map((row) => {
      const data = row.data() as Record<string, unknown>;
      const createdAtMs = toMillis(data.createdAt);
      return {
        id: row.id,
        category: normalizeSupportCategory(data.category),
        subject: asString(data.subject, "Sem assunto"),
        message: asString(data.message),
        status: asString(data.status).toLowerCase() === "resolved" ? "resolved" : "pending",
        response: asString(data.response) || undefined,
        createdAtMs,
        createdAtLabel: createdAtMs
          ? new Date(createdAtMs).toLocaleString("pt-BR")
          : "Data desconhecida",
      };
    });
  } catch (error: unknown) {
    if (!isIndexRequiredError(error)) {
      throw error;
    }

    const fallbackQuery = query(
      collection(db, "support_requests"),
      where("userId", "==", cleanUserId),
      limit(safeLimit)
    );
    const snap = await getDocs(fallbackQuery);
    tickets = snap.docs
      .map((row) => {
        const data = row.data() as Record<string, unknown>;
        const createdAtMs = toMillis(data.createdAt);
        return {
          id: row.id,
          category: normalizeSupportCategory(data.category),
          subject: asString(data.subject, "Sem assunto"),
          message: asString(data.message),
          status:
            asString(data.status).toLowerCase() === "resolved"
              ? "resolved"
              : "pending",
          response: asString(data.response) || undefined,
          createdAtMs,
          createdAtLabel: createdAtMs
            ? new Date(createdAtMs).toLocaleString("pt-BR")
            : "Data desconhecida",
        } satisfies SupportTicketRecord;
      })
      .sort((left, right) => right.createdAtMs - left.createdAtMs);
  }

  setCachedValue(userSupportCache, cacheKey, tickets);
  return tickets;
}
