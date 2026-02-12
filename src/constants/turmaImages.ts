const TURMA_IMAGE_BY_ID: Record<string, string> = {
  T1: "/turma1.jpeg",
  T2: "/turma2.jpeg",
  T3: "/turma3.jpeg",
  T4: "/turma4.jpeg",
  T5: "/turma5.jpeg",
  T6: "/turma6.jpeg",
  T7: "/turma7.jpeg",
  T8: "/turma8.jpg",
  T9: "/turma9.jpg",
};

export { TURMA_IMAGE_BY_ID };

export function getTurmaImage(turma?: string, fallback = "/logo.png"): string {
  if (!turma) return fallback;

  const normalized = turma.trim().toUpperCase();
  if (TURMA_IMAGE_BY_ID[normalized]) {
    return TURMA_IMAGE_BY_ID[normalized];
  }

  const digits = normalized.replace(/\D/g, "");
  if (!digits) return fallback;

  const byDigits = TURMA_IMAGE_BY_ID[`T${digits}`];
  return byDigits || fallback;
}
