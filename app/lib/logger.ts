// app/lib/logger.ts
import { db } from "./firebase"; // Certifique-se que o caminho está certo
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Tipos de ações para padronizar
export type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "ERROR";

export const logActivity = async (
  userId: string,
  userName: string,
  action: ActionType,
  resource: string, // Ex: "Eventos", "Loja", "Usuários"
  details: string
) => {
  try {
    await addDoc(collection(db, "activity_logs"), {
      userId,
      userName,
      action,
      resource,
      details,
      timestamp: serverTimestamp(), // Pega a hora exata do servidor do Google
    });
    console.log(`[LOG] ${userName} - ${action} em ${resource}`);
  } catch (error) {
    console.error("Erro ao salvar log:", error);
  }
};