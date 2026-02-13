import { httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db, functions } from "./firebase";
import { getFirebaseErrorCode } from "./firebaseErrors";

const DEFAULT_AVATAR_URL = "https://github.com/shadcn.png";
const ALBUM_SCAN_CALLABLE = "albumRegisterCapture";
const MAX_RANKING_RESULTS = 100;
const MAX_USERS_PER_CLASS = 150;

const asString = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const asNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const boundedLimit = (requested: number, max: number): number => {
  if (!Number.isFinite(requested)) return max;
  if (requested < 1) return 1;
  if (requested > max) return max;
  return Math.floor(requested);
};

export interface AlbumRankingEntry {
  id: string;
  userId: string;
  nome: string;
  foto: string;
  turma: string;
  totalColetado: number;
  scansT8: number;
}

export interface AlbumUserEntry {
  id: string;
  nome: string;
  turma: string;
  foto?: string;
  apelido?: string;
  dataNascimento?: string;
  idadePublica?: boolean;
  esportes?: string[];
  pets?: string;
  cidadeOrigem?: string;
  relacionamentoPublico?: boolean;
  statusRelacionamento?: string;
  bio?: string;
  instagram?: string;
}

export interface AlbumCmsData {
  capa: string;
  titulo: string;
  subtitulo: string;
}

export interface AlbumCollector {
  uid: string;
  nome: string;
  turma?: string;
  foto?: string;
}

export type AlbumCaptureStatus = "ok" | "duplicate" | "invalid-target";

export interface AlbumCaptureResult {
  status: AlbumCaptureStatus;
  targetName?: string;
  targetTurma?: string;
}

const toRankingEntry = (
  docId: string,
  raw: Record<string, unknown>
): AlbumRankingEntry => ({
  id: docId,
  userId: asString(raw.userId, docId),
  nome: asString(raw.nome, "Sem nome"),
  foto: asString(raw.foto, DEFAULT_AVATAR_URL),
  turma: asString(raw.turma, ""),
  totalColetado: asNumber(raw.totalColetado, 0),
  scansT8: asNumber(raw.scansT8, 0),
});

const toUserEntry = (docId: string, raw: Record<string, unknown>): AlbumUserEntry => ({
  id: docId,
  nome: asString(raw.nome, "Sem nome"),
  turma: asString(raw.turma, ""),
  foto: asString(raw.foto) || undefined,
  apelido: asString(raw.apelido) || undefined,
  dataNascimento: asString(raw.dataNascimento) || undefined,
  idadePublica:
    typeof raw.idadePublica === "boolean" ? raw.idadePublica : undefined,
  esportes: Array.isArray(raw.esportes)
    ? raw.esportes.filter((item): item is string => typeof item === "string")
    : undefined,
  pets: asString(raw.pets) || undefined,
  cidadeOrigem: asString(raw.cidadeOrigem) || undefined,
  relacionamentoPublico:
    typeof raw.relacionamentoPublico === "boolean"
      ? raw.relacionamentoPublico
      : undefined,
  statusRelacionamento: asString(raw.statusRelacionamento) || undefined,
  bio: asString(raw.bio) || undefined,
  instagram: asString(raw.instagram) || undefined,
});

const toAlbumConfig = (raw: Record<string, unknown>): AlbumCmsData => ({
  capa: asString(raw.capa),
  titulo: asString(raw.titulo),
  subtitulo: asString(raw.subtitulo),
});

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

export async function fetchAlbumRankings(
  maxResults = MAX_RANKING_RESULTS
): Promise<AlbumRankingEntry[]> {
  const q = query(
    collection(db, "album_rankings"),
    orderBy("totalColetado", "desc"),
    limit(boundedLimit(maxResults, MAX_RANKING_RESULTS))
  );
  const snap = await getDocs(q);

  return snap.docs.map((row) =>
    toRankingEntry(row.id, row.data() as Record<string, unknown>)
  );
}

export async function fetchUsersByTurma(
  turma: string,
  maxResults = MAX_USERS_PER_CLASS
): Promise<AlbumUserEntry[]> {
  const turmaCode = turma.trim();
  if (!turmaCode) return [];

  const q = query(
    collection(db, "users"),
    where("turma", "==", turmaCode),
    limit(boundedLimit(maxResults, MAX_USERS_PER_CLASS))
  );
  const snap = await getDocs(q);

  const users = snap.docs.map((row) =>
    toUserEntry(row.id, row.data() as Record<string, unknown>)
  );

  users.sort((a, b) => {
    const left = (a.apelido || a.nome).toLocaleLowerCase("pt-BR");
    const right = (b.apelido || b.nome).toLocaleLowerCase("pt-BR");
    return left.localeCompare(right, "pt-BR");
  });

  return users;
}

export async function fetchAlbumCollectedIds(
  userId: string,
  options?: { turma?: string; maxResults?: number }
): Promise<string[]> {
  if (!userId) return [];

  const turma = options?.turma?.trim();
  const maxResults = boundedLimit(
    options?.maxResults ?? MAX_USERS_PER_CLASS * 2,
    MAX_USERS_PER_CLASS * 2
  );

  const baseRef = collection(db, "users", userId, "albumColado");
  const constraints = [
    ...(turma ? [where("turma", "==", turma)] : []),
    limit(maxResults),
  ];

  const snap = await getDocs(query(baseRef, ...constraints));
  return snap.docs.map((row) => row.id);
}

export async function fetchAlbumConfig(turma: string): Promise<AlbumCmsData | null> {
  if (!turma) return null;

  const snap = await getDoc(doc(db, "album_config", turma));
  if (!snap.exists()) return null;

  return toAlbumConfig(snap.data() as Record<string, unknown>);
}

export async function saveAlbumConfig(
  turma: string,
  config: AlbumCmsData
): Promise<void> {
  await setDoc(
    doc(db, "album_config", turma),
    { ...config, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function registerAlbumCapture(payload: {
  collector: AlbumCollector;
  targetId: string;
}): Promise<AlbumCaptureResult> {
  if (!payload.targetId.trim() || payload.targetId === payload.collector.uid) {
    return { status: "invalid-target" };
  }

  try {
    const callable = httpsCallable<
      { collectorUid: string; targetUid: string },
      AlbumCaptureResult
    >(functions, ALBUM_SCAN_CALLABLE);

    const response = await callable({
      collectorUid: payload.collector.uid,
      targetUid: payload.targetId,
    });

    const status = response.data?.status;
    if (status === "duplicate" || status === "invalid-target") {
      return response.data;
    }
    return {
      status: "ok",
      targetName: response.data?.targetName,
      targetTurma: response.data?.targetTurma,
    };
  } catch (error: unknown) {
    if (!shouldFallbackToClientWrites(error)) {
      throw error;
    }
  }

  return runTransaction(db, async (transaction) => {
    const collectorUid = payload.collector.uid;
    const targetRef = doc(db, "users", payload.targetId);
    const albumRef = doc(db, "users", collectorUid, "albumColado", payload.targetId);
    const rankingRef = doc(db, "album_rankings", collectorUid);
    const collectorRef = doc(db, "users", collectorUid);
    const notificationRef = doc(collection(db, "notifications"));

    const [targetSnap, alreadyCapturedSnap] = await Promise.all([
      transaction.get(targetRef),
      transaction.get(albumRef),
    ]);

    if (!targetSnap.exists()) {
      return { status: "invalid-target" } satisfies AlbumCaptureResult;
    }

    if (alreadyCapturedSnap.exists()) {
      return { status: "duplicate" } satisfies AlbumCaptureResult;
    }

    const targetData = targetSnap.data() as Record<string, unknown>;
    const targetName = asString(targetData.nome, "Integrante");
    const targetTurma = asString(targetData.turma);
    const collectorName = payload.collector.nome || "Tubarão";

    transaction.set(albumRef, {
      dataColada: serverTimestamp(),
      nome: targetName,
      turma: targetTurma,
    });

    transaction.set(
      rankingRef,
      {
        userId: collectorUid,
        nome: collectorName,
        turma: payload.collector.turma || "",
        foto: payload.collector.foto || DEFAULT_AVATAR_URL,
        totalColetado: increment(1),
        scansT8: targetTurma === "T8" ? increment(1) : increment(0),
        ultimoScan: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(
      collectorRef,
      {
        stats: { albumCollected: increment(1) },
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(notificationRef, {
      userId: collectorUid,
      title: "Nova captura no Álbum",
      message: `${targetName} entrou para sua coleção.`,
      link: "/album",
      read: false,
      type: "album",
      createdAt: serverTimestamp(),
    });

    return { status: "ok", targetName, targetTurma } satisfies AlbumCaptureResult;
  });
}
