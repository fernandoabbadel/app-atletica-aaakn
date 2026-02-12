import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

admin.initializeApp();

const db = admin.firestore();

const MAX_PERMISSION_USER_RESULTS = 500;
const MAX_ADMIN_REPORT_RESULTS = 300;
const MAX_USER_SUPPORT_RESULTS = 120;
const MAX_TREINO_MODALIDADES = 40;
const DEFAULT_TREINO_MODALIDADES = ["Futsal", "Volei"];

const MASTER_ONLY_ROLES = new Set<string>(["master"]);
const ADMIN_PANEL_ROLES = new Set<string>([
  "master",
  "admin_geral",
  "admin_gestor",
]);
const TREINO_ADMIN_ROLES = new Set<string>([
  "master",
  "admin_geral",
  "admin_gestor",
  "admin_treino",
]);

type UnknownRecord = Record<string, unknown>;
type PermissionMatrix = Record<string, string[]>;
type SupportCategory =
  | "geral"
  | "financeiro"
  | "conta"
  | "bug"
  | "denuncia"
  | "outro";

interface PermissionUserRecord {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  role?: string;
}

interface CallerIdentity {
  uid: string;
  role: string;
}

const asObject = (value: unknown): UnknownRecord | null => {
  if (typeof value !== "object" || value === null) return null;
  return value as UnknownRecord;
};

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
};

const normalizePositiveInt = (value: unknown, maxAllowed: number): number => {
  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) return maxAllowed;

  const floored = Math.floor(numericValue);
  if (floored < 1) return 1;
  if (floored > maxAllowed) return maxAllowed;
  return floored;
};

const clampText = (value: unknown, maxLen: number, fallback = ""): string =>
  asString(value, fallback).trim().slice(0, maxLen);

const toMillis = (value: unknown): number => {
  if (value instanceof Date) return value.getTime();
  if (value instanceof admin.firestore.Timestamp) return value.toMillis();

  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const obj = asObject(value);
  const toDate = obj?.toDate;
  if (typeof toDate === "function") {
    const date = toDate.call(value) as Date;
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  return 0;
};

const sanitizeSupportCategory = (value: unknown): SupportCategory => {
  const normalized = asString(value).trim().toLowerCase();
  if (
    normalized === "geral" ||
    normalized === "financeiro" ||
    normalized === "conta" ||
    normalized === "bug" ||
    normalized === "denuncia" ||
    normalized === "outro"
  ) {
    return normalized;
  }
  return "geral";
};

const sanitizeTreinoModalidades = (value: unknown): string[] => {
  const unique = new Set<string>();
  asStringArray(value).forEach((entry) => {
    const clean = entry.trim().slice(0, 40);
    if (clean) unique.add(clean);
  });

  const normalized = Array.from(unique).slice(0, MAX_TREINO_MODALIDADES);
  return normalized.length > 0 ? normalized : [...DEFAULT_TREINO_MODALIDADES];
};

const sanitizePermissionMatrix = (value: unknown): PermissionMatrix => {
  const matrixRaw = asObject(value);
  if (!matrixRaw) return {};

  const sanitized: PermissionMatrix = {};

  Object.entries(matrixRaw).forEach(([path, roles]) => {
    const cleanPath = path.trim();
    if (!cleanPath.startsWith("/")) return;

    const cleanRoles = asStringArray(roles)
      .map((role) => role.trim())
      .filter(Boolean);

    if (!cleanRoles.length) return;
    sanitized[cleanPath] = Array.from(new Set(cleanRoles));
  });

  return sanitized;
};

const getRoleByUserId = async (uid: string): Promise<string> => {
  const snap = await db.collection("users").doc(uid).get();
  if (!snap.exists) return "";

  const data = asObject(snap.data());
  return asString(data?.role).trim().toLowerCase();
};

const getCallerIdentity = async (
  context: functions.https.CallableContext
): Promise<CallerIdentity> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Autenticacao obrigatoria."
    );
  }

  const role = await getRoleByUserId(uid);
  return {uid, role};
};

const assertRoleAllowed = async (
  context: functions.https.CallableContext,
  allowedRoles: Set<string>,
  message: string
): Promise<CallerIdentity> => {
  const caller = await getCallerIdentity(context);
  if (!allowedRoles.has(caller.role)) {
    throw new functions.https.HttpsError("permission-denied", message);
  }
  return caller;
};

const assertMaster = async (
  context: functions.https.CallableContext
): Promise<string> => {
  const caller = await assertRoleAllowed(
    context,
    MASTER_ONLY_ROLES,
    "Apenas usuarios master podem executar esta operacao."
  );
  return caller.uid;
};

export const sanitizarPedido = functions.firestore
  .document("pedidos/{pedidoId}")
  .onWrite(async (change, context) => {
    if (!change.after.exists) return null;

    const dadosAtuais = change.after.data();
    const dadosAnteriores = change.before.data();
    if (!dadosAtuais) return null;

    let valorCorrigido = dadosAtuais.valor;
    let houveMudanca = false;

    if (typeof dadosAtuais.valor === "string") {
      const valorLimpo = dadosAtuais.valor
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim();

      valorCorrigido = parseFloat(valorLimpo);
      houveMudanca = true;
    }

    if (Number.isNaN(valorCorrigido)) {
      valorCorrigido = 0;
      houveMudanca = true;
    }

    if (!houveMudanca && dadosAnteriores?.valor === valorCorrigido) {
      return null;
    }

    if (houveMudanca) {
      functions.logger.info(
        `TUBARAO_SANITIZADOR: corrigindo valor do pedido ${context.params.pedidoId}`
      );

      return change.after.ref.update({
        valor: valorCorrigido,
        _sanityCheck: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return null;
  });

export const permissionsAdminGetMatrix = functions.https.onCall(
  async (_data, context) => {
    await assertMaster(context);

    const snap = await db.collection("settings").doc("permissions").get();

    if (!snap.exists) {
      return {matrix: null as PermissionMatrix | null};
    }

    const sanitized = sanitizePermissionMatrix(snap.data());
    return {matrix: sanitized};
  }
);

export const permissionsAdminListUsers = functions.https.onCall(
  async (data, context) => {
    await assertMaster(context);

    const payload = asObject(data);
    const maxResults = normalizePositiveInt(
      payload?.maxResults,
      MAX_PERMISSION_USER_RESULTS
    );

    const snap = await db.collection("users").limit(maxResults).get();

    const users = snap.docs
      .map((row) => {
        const dataRow = asObject(row.data());
        if (!dataRow) return null;

        const foto = asString(dataRow.foto).trim();
        const role = asString(dataRow.role).trim();

        const mapped: PermissionUserRecord = {
          id: row.id,
          nome: asString(dataRow.nome, "Sem nome").trim() || "Sem nome",
          email: asString(dataRow.email).trim(),
        };

        if (foto) mapped.foto = foto;
        if (role) mapped.role = role;
        return mapped;
      })
      .filter((entry): entry is PermissionUserRecord => entry !== null)
      .sort((left, right) => left.nome.localeCompare(right.nome, "pt-BR"));

    return {users};
  }
);

export const permissionsAdminSaveMatrix = functions.https.onCall(
  async (data, context) => {
    await assertMaster(context);

    const payload = asObject(data);
    const matrix = sanitizePermissionMatrix(payload?.matrix);

    await db.collection("settings").doc("permissions").set(matrix);

    return {ok: true};
  }
);

export const permissionsAdminUpdateUserRole = functions.https.onCall(
  async (data, context) => {
    const callerUid = await assertMaster(context);
    const payload = asObject(data);

    const targetUserId = asString(payload?.targetUserId).trim();
    const role = asString(payload?.role).trim().toLowerCase();

    if (!targetUserId || !role) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "targetUserId e role sao obrigatorios."
      );
    }

    if (targetUserId === callerUid && role !== "master") {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Nao e permitido remover o proprio papel de master."
      );
    }

    const targetRef = db.collection("users").doc(targetUserId);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Usuario alvo nao encontrado."
      );
    }

    await targetRef.update({role});
    return {ok: true};
  }
);

export const adminUsersUpdateProfile = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem atualizar usuarios."
    );

    const payload = asObject(data);
    const userId = asString(payload?.userId).trim();
    if (!userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "userId obrigatorio."
      );
    }

    const targetRef = db.collection("users").doc(userId);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      throw new functions.https.HttpsError("not-found", "Usuario nao encontrado.");
    }

    await targetRef.update({
      nome: clampText(payload?.nome, 120, "Sem Nome"),
      telefone: clampText(payload?.telefone, 30),
      matricula: clampText(payload?.matricula, 40),
      turma: clampText(payload?.turma, 30),
      status: clampText(payload?.status, 20, "pendente"),
      tier: clampText(payload?.tier, 20, "bicho"),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {ok: true};
  }
);

export const adminUsersSetStatus = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem alterar status."
    );

    const payload = asObject(data);
    const userId = asString(payload?.userId).trim();
    const status = clampText(payload?.status, 20, "pendente");

    if (!userId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "userId obrigatorio."
      );
    }

    await db.collection("users").doc(userId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {ok: true};
  }
);

export const adminUsersDelete = functions.https.onCall(async (data, context) => {
  await assertRoleAllowed(
    context,
    ADMIN_PANEL_ROLES,
    "Apenas administradores podem remover usuarios."
  );

  const payload = asObject(data);
  const userId = asString(payload?.userId).trim();
  if (!userId) {
    throw new functions.https.HttpsError("invalid-argument", "userId obrigatorio.");
  }

  await db.collection("users").doc(userId).delete();
  return {ok: true};
});

export const treinoAdminGetSettings = functions.https.onCall(
  async (_data, context) => {
    await assertRoleAllowed(
      context,
      TREINO_ADMIN_ROLES,
      "Apenas administradores de treino podem acessar configuracoes."
    );

    const snap = await db.collection("settings").doc("treinos").get();
    const modalidades = snap.exists
      ? sanitizeTreinoModalidades(snap.data()?.modalidades)
      : [...DEFAULT_TREINO_MODALIDADES];

    return {modalidades};
  }
);

export const treinoAdminSaveSettings = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      TREINO_ADMIN_ROLES,
      "Apenas administradores de treino podem editar configuracoes."
    );

    const payload = asObject(data);
    const modalidades = sanitizeTreinoModalidades(payload?.modalidades);

    await db
      .collection("settings")
      .doc("treinos")
      .set(
        {
          modalidades,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

    return {ok: true, modalidades};
  }
);

export const supportSubmitRequest = functions.https.onCall(
  async (data, context) => {
    const caller = await getCallerIdentity(context);
    const payload = asObject(data);

    const userId = asString(payload?.userId).trim();
    if (!userId || userId !== caller.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Somente o proprio usuario pode abrir chamado."
      );
    }

    const docPayload = {
      userId,
      userName: clampText(payload?.userName, 80, "Usuario"),
      userEmail: clampText(payload?.userEmail, 120),
      category: sanitizeSupportCategory(payload?.category),
      subject: clampText(payload?.subject, 120),
      message: clampText(payload?.message, 5000),
      status: "pending",
      readByAdmin: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (!docPayload.subject || !docPayload.message) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Assunto e mensagem sao obrigatorios."
      );
    }

    const ref = await db.collection("support_requests").add(docPayload);

    await db.collection("notifications").add({
      userId,
      title: "Chamado recebido",
      message: "Seu pedido de suporte foi enviado para analise.",
      link: "/configuracoes/suporte",
      read: false,
      type: "support",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {id: ref.id};
  }
);

export const supportGetMyRequests = functions.https.onCall(
  async (data, context) => {
    const caller = await getCallerIdentity(context);
    const payload = asObject(data);
    const requestedUserId = asString(payload?.userId).trim();

    if (!requestedUserId || requestedUserId !== caller.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Somente o proprio usuario pode listar seus chamados."
      );
    }

    const maxResults = normalizePositiveInt(
      payload?.maxResults,
      MAX_USER_SUPPORT_RESULTS
    );

    let rows: admin.firestore.QueryDocumentSnapshot[] = [];
    try {
      const snap = await db
        .collection("support_requests")
        .where("userId", "==", requestedUserId)
        .orderBy("createdAt", "desc")
        .limit(maxResults)
        .get();
      rows = snap.docs;
    } catch {
      const snap = await db
        .collection("support_requests")
        .where("userId", "==", requestedUserId)
        .limit(maxResults)
        .get();
      rows = snap.docs;
    }

    const tickets = rows
      .map((row) => {
        const item = asObject(row.data());
        if (!item) return null;

        return {
          id: row.id,
          category: sanitizeSupportCategory(item.category),
          subject: clampText(item.subject, 120, "Sem assunto"),
          message: clampText(item.message, 5000),
          status: asString(item.status).toLowerCase() === "resolved"
            ? "resolved"
            : "pending",
          response: clampText(item.response, 2000),
          createdAtMs: toMillis(item.createdAt),
        };
      })
      .filter(
        (
          row
        ): row is {
          id: string;
          category: SupportCategory;
          subject: string;
          message: string;
          status: "pending" | "resolved";
          response: string;
          createdAtMs: number;
        } => row !== null
      )
      .sort((left, right) => right.createdAtMs - left.createdAtMs);

    return {tickets};
  }
);

export const adminGetBannedAppeals = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem listar apelacoes."
    );

    const payload = asObject(data);
    const maxResults = normalizePositiveInt(
      payload?.maxResults,
      MAX_ADMIN_REPORT_RESULTS
    );

    const snap = await db
      .collection("banned_appeals")
      .orderBy("createdAt", "desc")
      .limit(maxResults)
      .get();

    const reports = snap.docs
      .map((row) => {
        const item = asObject(row.data());
        if (!item) return null;
        return {
          id: row.id,
          userId: clampText(item.userId, 120),
          userName: clampText(item.userName, 120, "Usuario"),
          message: clampText(item.message, 5000),
          status: clampText(item.status, 20, "pending"),
          response: clampText(item.response, 2000),
          createdAtMs: toMillis(item.createdAt),
        };
      })
      .filter(
        (
          row
        ): row is {
          id: string;
          userId: string;
          userName: string;
          message: string;
          status: string;
          response: string;
          createdAtMs: number;
        } => row !== null
      );

    return {reports};
  }
);

export const adminGetSupportReports = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem listar suporte."
    );

    const payload = asObject(data);
    const maxResults = normalizePositiveInt(
      payload?.maxResults,
      MAX_ADMIN_REPORT_RESULTS
    );

    const snap = await db
      .collection("support_requests")
      .orderBy("createdAt", "desc")
      .limit(maxResults)
      .get();

    const reports = snap.docs
      .map((row) => {
        const item = asObject(row.data());
        if (!item) return null;
        return {
          id: row.id,
          userId: clampText(item.userId, 120),
          userName: clampText(item.userName, 120, "Usuario"),
          category: sanitizeSupportCategory(item.category),
          subject: clampText(item.subject, 120, "Suporte"),
          message: clampText(item.message, 5000),
          status: clampText(item.status, 20, "pending"),
          response: clampText(item.response, 2000),
          createdAtMs: toMillis(item.createdAt),
        };
      })
      .filter(
        (
          row
        ): row is {
          id: string;
          userId: string;
          userName: string;
          category: SupportCategory;
          subject: string;
          message: string;
          status: string;
          response: string;
          createdAtMs: number;
        } => row !== null
      );

    return {reports};
  }
);

export const adminResolveBannedAppeal = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem resolver apelacoes."
    );

    const payload = asObject(data);
    const reportId = asString(payload?.reportId).trim();
    const response = clampText(payload?.response, 2000);
    const reporterId = clampText(payload?.reporterId, 120);

    if (!reportId || !response) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reportId e response sao obrigatorios."
      );
    }

    await db.collection("banned_appeals").doc(reportId).update({
      response,
      status: "resolved",
      readByAdmin: true,
      resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (reporterId) {
      await db.collection("notifications").add({
        userId: reporterId,
        title: "Apelacao analisada",
        message: "Sua apelacao de bloqueio recebeu resposta da diretoria.",
        link: "/banned",
        read: false,
        type: "appeal_response",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {ok: true};
  }
);

export const adminResolveSupportRequest = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem resolver chamados."
    );

    const payload = asObject(data);
    const reportId = asString(payload?.reportId).trim();
    const response = clampText(payload?.response, 2000);
    const reporterId = clampText(payload?.reporterId, 120);

    if (!reportId || !response) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reportId e response sao obrigatorios."
      );
    }

    await db.collection("support_requests").doc(reportId).update({
      response,
      status: "resolved",
      readByAdmin: true,
      resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    if (reporterId) {
      await db.collection("notifications").add({
        userId: reporterId,
        title: "Chamado atualizado",
        message: "O suporte respondeu seu chamado.",
        link: "/configuracoes/suporte",
        read: false,
        type: "support_response",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {ok: true};
  }
);

export const adminDeleteBannedAppeal = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem excluir apelacoes."
    );

    const payload = asObject(data);
    const reportId = asString(payload?.reportId).trim();
    if (!reportId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reportId obrigatorio."
      );
    }

    await db.collection("banned_appeals").doc(reportId).delete();
    return {ok: true};
  }
);

export const adminDeleteSupportRequest = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem excluir chamados."
    );

    const payload = asObject(data);
    const reportId = asString(payload?.reportId).trim();
    if (!reportId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "reportId obrigatorio."
      );
    }

    await db.collection("support_requests").doc(reportId).delete();
    return {ok: true};
  }
);
