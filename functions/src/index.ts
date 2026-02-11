import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

admin.initializeApp();

const MAX_PERMISSION_USER_RESULTS = 500;

type UnknownRecord = Record<string, unknown>;
type PermissionMatrix = Record<string, string[]>;

interface PermissionUserRecord {
  id: string;
  nome: string;
  email: string;
  foto?: string;
  role?: string;
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
  const snap = await admin.firestore().collection("users").doc(uid).get();
  if (!snap.exists) return "";

  const data = asObject(snap.data());
  return asString(data?.role).trim().toLowerCase();
};

const assertMaster = async (
  context: functions.https.CallableContext
): Promise<string> => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Autenticacao obrigatoria."
    );
  }

  const role = await getRoleByUserId(uid);
  if (role !== "master") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Apenas usuarios master podem executar esta operacao."
    );
  }

  return uid;
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

    const snap = await admin
      .firestore()
      .collection("settings")
      .doc("permissions")
      .get();

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

    const snap = await admin
      .firestore()
      .collection("users")
      .limit(maxResults)
      .get();

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

    await admin
      .firestore()
      .collection("settings")
      .doc("permissions")
      .set(matrix);

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

    const targetRef = admin.firestore().collection("users").doc(targetUserId);
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
