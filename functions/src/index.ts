import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

admin.initializeApp();

const db = admin.firestore();

const MAX_PERMISSION_USER_RESULTS = 500;
const MAX_ADMIN_REPORT_RESULTS = 300;
const MAX_USER_SUPPORT_RESULTS = 120;
const MAX_TREINO_MODALIDADES = 40;
const MAX_FOLLOW_RECOUNT_BATCH = 220;
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
const ALBUM_DEFAULT_AVATAR_URL = "https://github.com/shadcn.png";
const ALBUM_SUMMARY_COLLECTION = "album_summary";

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

const normalizeTurmaCode = (value: unknown): string => {
  const turma = asString(value).trim().toUpperCase();
  if (!turma) return "OUTROS";
  return /^T\d{1,2}$/.test(turma) ? turma : "OUTROS";
};

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
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem acessar a matriz de permissoes."
    );

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

export const notificationsMarkRead = functions.https.onCall(
  async (data, context) => {
    const caller = await getCallerIdentity(context);
    const payload = asObject(data);
    const notificationId = asString(payload?.notificationId).trim();

    if (!notificationId) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "notificationId obrigatorio."
      );
    }

    const notificationRef = db.collection("notifications").doc(notificationId);
    const snap = await notificationRef.get();
    if (!snap.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Notificacao nao encontrada."
      );
    }

    const notification = asObject(snap.data()) || {};
    const ownerId = asString(notification.userId).trim();
    const canModerate = ADMIN_PANEL_ROLES.has(caller.role);

    if (!canModerate && ownerId !== caller.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Sem permissao para alterar essa notificacao."
      );
    }

    await notificationRef.update({
      read: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {ok: true};
  }
);

export const albumRegisterCapture = functions.https.onCall(
  async (data, context) => {
    const caller = await getCallerIdentity(context);
    const payload = asObject(data);

    const collectorUid = asString(payload?.collectorUid).trim();
    const targetUid = asString(payload?.targetUid).trim();

    if (!collectorUid || !targetUid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "collectorUid e targetUid sao obrigatorios."
      );
    }

    if (collectorUid !== caller.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Somente o proprio usuario pode registrar captura."
      );
    }

    if (collectorUid === targetUid) {
      return {status: "invalid-target"};
    }

    const collectorRef = db.collection("users").doc(collectorUid);
    const targetRef = db.collection("users").doc(targetUid);
    const albumRef = db
      .collection("users")
      .doc(collectorUid)
      .collection("albumColado")
      .doc(targetUid);
    const rankingRef = db.collection("album_rankings").doc(collectorUid);
    const summaryRef = db.collection(ALBUM_SUMMARY_COLLECTION).doc(collectorUid);
    const notificationRef = db.collection("notifications").doc();

    const result = await db.runTransaction(async (tx) => {
      const [collectorSnap, targetSnap, albumSnap] = await Promise.all([
        tx.get(collectorRef),
        tx.get(targetRef),
        tx.get(albumRef),
      ]);

      if (!targetSnap.exists) {
        return {status: "invalid-target"} as const;
      }

      if (albumSnap.exists) {
        return {status: "duplicate"} as const;
      }

      const collectorData = asObject(collectorSnap.data()) || {};
      const targetData = asObject(targetSnap.data()) || {};

      const collectorName = clampText(collectorData.nome, 120, "Tubarao");
      const collectorTurma = clampText(collectorData.turma, 30);
      const collectorFoto = clampText(
        collectorData.foto,
        1200,
        ALBUM_DEFAULT_AVATAR_URL
      );
      const targetName = clampText(targetData.nome, 120, "Integrante");
      const targetTurma = clampText(targetData.turma, 30);

      tx.set(albumRef, {
        nome: targetName,
        turma: targetTurma,
        dataColada: admin.firestore.FieldValue.serverTimestamp(),
      });

      tx.set(
        rankingRef,
        {
          userId: collectorUid,
          nome: collectorName,
          turma: collectorTurma,
          foto: collectorFoto,
          totalColetado: admin.firestore.FieldValue.increment(1),
          scansT8: admin.firestore.FieldValue.increment(
            targetTurma.toUpperCase() === "T8" ? 1 : 0
          ),
          ultimoScan: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

      tx.set(
        collectorRef,
        {
          stats: {
            albumCollected: admin.firestore.FieldValue.increment(1),
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

      const targetTurmaCode = normalizeTurmaCode(targetTurma);
      tx.set(
        summaryRef,
        {
          userId: collectorUid,
          totalCollected: admin.firestore.FieldValue.increment(1),
          [`capturedByTurma.${targetTurmaCode}`]:
            admin.firestore.FieldValue.arrayUnion(targetUid),
          lastCaptureId: targetUid,
          lastCaptureAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

      tx.set(notificationRef, {
        userId: collectorUid,
        title: "Nova captura no Album",
        message: `${targetName} entrou para sua colecao.`,
        link: "/album",
        read: false,
        type: "album",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        status: "ok" as const,
        targetName,
        targetTurma,
      };
    });

    return result;
  }
);

export const profileToggleFollow = functions.https.onCall(
  async (data, context) => {
    const caller = await getCallerIdentity(context);
    const payload = asObject(data);

    const viewerUid = asString(payload?.viewerUid).trim();
    const targetUid = asString(payload?.targetUid).trim();
    const currentlyFollowing = payload?.currentlyFollowing === true;

    if (!viewerUid || !targetUid) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "viewerUid e targetUid sao obrigatorios."
      );
    }

    if (viewerUid !== caller.uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Somente o proprio usuario pode alterar follow."
      );
    }

    if (viewerUid === targetUid) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Usuario nao pode seguir a si mesmo."
      );
    }

    const viewerDataRaw = asObject(payload?.viewerData) || {};
    const targetDataRaw = asObject(payload?.targetData) || {};

    const targetFollowerRef = db
      .collection("users")
      .doc(targetUid)
      .collection("followers")
      .doc(viewerUid);
    const viewerFollowingRef = db
      .collection("users")
      .doc(viewerUid)
      .collection("following")
      .doc(targetUid);
    const targetUserRef = db.collection("users").doc(targetUid);
    const viewerUserRef = db.collection("users").doc(viewerUid);
    const notificationRef = db.collection("notifications").doc();

    const result = await db.runTransaction(async (tx) => {
      const [targetUserSnap, viewerUserSnap, followerSnap, followingSnap] =
        await Promise.all([
          tx.get(targetUserRef),
          tx.get(viewerUserRef),
          tx.get(targetFollowerRef),
          tx.get(viewerFollowingRef),
        ]);

      if (!targetUserSnap.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Usuario alvo nao encontrado."
        );
      }

      if (!viewerUserSnap.exists) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Perfil do usuario autenticado nao encontrado."
        );
      }

      const targetUserData = asObject(targetUserSnap.data()) || {};
      const viewerUserData = asObject(viewerUserSnap.data()) || {};
      const targetStats = asObject(targetUserData.stats) || {};
      const viewerStats = asObject(viewerUserData.stats) || {};
      const readStatCount = (value: unknown): number =>
        typeof value === "number" && Number.isFinite(value) && value > 0
          ? Math.floor(value)
          : 0;

      let followersCount = readStatCount(targetStats.followersCount);
      let followingCount = readStatCount(viewerStats.followingCount);

      const isFollowingNow = followerSnap.exists && followingSnap.exists;
      const shouldUnfollow = currentlyFollowing || isFollowingNow;

      const viewerFollowData = {
        uid: viewerUid,
        nome: clampText(
          viewerDataRaw.nome,
          120,
          clampText(viewerUserData.nome, 120, "Atleta")
        ),
        foto: clampText(
          viewerDataRaw.foto,
          1200,
          clampText(viewerUserData.foto, 1200, "")
        ),
        turma: clampText(
          viewerDataRaw.turma,
          40,
          clampText(viewerUserData.turma, 40, "Geral")
        ),
      };

      const targetFollowData = {
        uid: targetUid,
        nome: clampText(
          targetDataRaw.nome,
          120,
          clampText(targetUserData.nome, 120, "Atleta")
        ),
        foto: clampText(
          targetDataRaw.foto,
          1200,
          clampText(targetUserData.foto, 1200, "")
        ),
        turma: clampText(
          targetDataRaw.turma,
          40,
          clampText(targetUserData.turma, 40, "Geral")
        ),
      };

      if (shouldUnfollow) {
        if (followerSnap.exists) tx.delete(targetFollowerRef);
        if (followingSnap.exists) tx.delete(viewerFollowingRef);
        followersCount = Math.max(0, followersCount - 1);
        followingCount = Math.max(0, followingCount - 1);
      } else {
        tx.set(targetFollowerRef, {
          ...viewerFollowData,
          followedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        tx.set(viewerFollowingRef, {
          ...targetFollowData,
          followedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        tx.set(notificationRef, {
          userId: targetUid,
          title: "Novo Seguidor!",
          message: `${viewerFollowData.nome} comecou a te seguir.`,
          link: `/perfil/${viewerUid}`,
          read: false,
          type: "social",
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        followersCount += 1;
        followingCount += 1;
      }

      tx.set(
        targetUserRef,
        {
          stats: {
            ...targetStats,
            followersCount,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

      tx.set(
        viewerUserRef,
        {
          stats: {
            ...viewerStats,
            followingCount,
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );

      return {
        isFollowing: !shouldUnfollow,
        followersCount,
        followingCount,
      };
    });

    const [followersCounterSnap, followingCounterSnap] = await Promise.all([
      targetUserRef.collection("followers").count().get(),
      viewerUserRef.collection("following").count().get(),
    ]);

    const exactFollowersCount = followersCounterSnap.data().count;
    const exactFollowingCount = followingCounterSnap.data().count;

    if (
      exactFollowersCount !== result.followersCount ||
      exactFollowingCount !== result.followingCount
    ) {
      await Promise.all([
        targetUserRef.set(
          {
            "stats.followersCount": exactFollowersCount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true}
        ),
        viewerUserRef.set(
          {
            "stats.followingCount": exactFollowingCount,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          {merge: true}
        ),
      ]);
    }

    return {
      isFollowing: result.isFollowing,
      followersCount: exactFollowersCount,
      followingCount: exactFollowingCount,
    };
  }
);

export const profileAdminRecountFollowStats = functions.https.onCall(
  async (data, context) => {
    await assertRoleAllowed(
      context,
      ADMIN_PANEL_ROLES,
      "Apenas administradores podem recontar follows."
    );

    const payload = asObject(data);
    const batchSize = normalizePositiveInt(
      payload?.batchSize,
      MAX_FOLLOW_RECOUNT_BATCH
    );
    const startAfterUid = asString(payload?.startAfterUid).trim();

    let usersQuery = db
      .collection("users")
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(batchSize);

    if (startAfterUid) {
      const startAfterSnap = await db.collection("users").doc(startAfterUid).get();
      if (startAfterSnap.exists) {
        usersQuery = usersQuery.startAfter(startAfterSnap);
      }
    }

    const usersSnap = await usersQuery.get();
    if (usersSnap.empty) {
      return {
        scanned: 0,
        updated: 0,
        hasMore: false,
        nextCursor: null as string | null,
      };
    }

    let scanned = 0;
    let updated = 0;
    let pendingWrites = 0;
    let nextCursor: string | null = null;
    let writeBatch = db.batch();

    const flushBatch = async () => {
      if (pendingWrites === 0) return;
      await writeBatch.commit();
      writeBatch = db.batch();
      pendingWrites = 0;
    };

    for (const userDoc of usersSnap.docs) {
      scanned += 1;
      nextCursor = userDoc.id;

      const [followersSnap, followingSnap] = await Promise.all([
        userDoc.ref.collection("followers").count().get(),
        userDoc.ref.collection("following").count().get(),
      ]);

      const followersCount = followersSnap.data().count;
      const followingCount = followingSnap.data().count;

      const userData = asObject(userDoc.data()) || {};
      const stats = asObject(userData.stats) || {};
      const currentFollowers =
        typeof stats.followersCount === "number" &&
        Number.isFinite(stats.followersCount)
          ? Math.max(0, Math.floor(stats.followersCount))
          : 0;
      const currentFollowing =
        typeof stats.followingCount === "number" &&
        Number.isFinite(stats.followingCount)
          ? Math.max(0, Math.floor(stats.followingCount))
          : 0;

      if (
        currentFollowers === followersCount &&
        currentFollowing === followingCount
      ) {
        continue;
      }

      writeBatch.set(
        userDoc.ref,
        {
          "stats.followersCount": followersCount,
          "stats.followingCount": followingCount,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        {merge: true}
      );
      pendingWrites += 1;
      updated += 1;

      if (pendingWrites >= 400) {
        await flushBatch();
      }
    }

    await flushBatch();

    return {
      scanned,
      updated,
      hasMore: usersSnap.size >= batchSize,
      nextCursor: usersSnap.size >= batchSize ? nextCursor : null,
    };
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
