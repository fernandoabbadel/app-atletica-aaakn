import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface UploadResult {
  url: string | null;
  error: string | null;
}

export async function uploadImage(file: File, path: string): Promise<UploadResult> {
  if (!file) return { url: null, error: "Nenhum arquivo" };

  try {
    const filename = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, error: null };
  } catch (error: any) {
    console.error("Erro Upload:", error);
    return { url: null, error: error.message };
  }
}