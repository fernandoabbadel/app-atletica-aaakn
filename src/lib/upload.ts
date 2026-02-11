import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export const MAX_UPLOAD_IMAGE_MB = 5;
export const MAX_UPLOAD_IMAGE_BYTES = MAX_UPLOAD_IMAGE_MB * 1024 * 1024;

/**
 * Envia uma imagem para o Firebase Storage.
 * @param file O arquivo selecionado no input
 * @param path A pasta onde salvar (ex: 'produtos', 'eventos')
 */
export async function uploadImage(file: File, path: string): Promise<UploadResult> {
  if (!file) return { url: null, error: "Nenhum arquivo selecionado" };
  if (!file.type.startsWith("image/")) {
    return { url: null, error: "Envie apenas arquivos de imagem." };
  }
  if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
    return { url: null, error: `A imagem excede ${MAX_UPLOAD_IMAGE_MB}MB.` };
  }

  try {
    // 🦈 Sanidade do Tubarão: Remove espaços e caracteres estranhos do nome
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, "_").toLowerCase();
    const filename = `${Date.now()}-${cleanName}`;
    
    // Cria a referência no Storage
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Faz o upload dos bytes
    const snapshot = await uploadBytes(storageRef, file);
    
    // Pega o link público para salvar no Firestore
    const url = await getDownloadURL(snapshot.ref);
    
    return { url, error: null };
  } catch (error: unknown) { 
    // 🦈 CORREÇÃO: Trocamos 'any' por 'unknown'. 
    // O TypeScript prefere que assumamos que não sabemos o que é o erro, 
    // mas o console.error sabe lidar com ele.
    console.error("Erro Crítico no Upload:", error);
    return { url: null, error: "Falha ao subir imagem. Tente novamente." };
  }
}
