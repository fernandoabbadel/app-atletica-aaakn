import { db } from "./firebase"; // Ajustado para achar o arquivo certo
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Tipos de ações para padronizar (Evita escrever "creat" errado)
export type ActionType = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "ERROR";

export const logActivity = async (
  userId: string,
  userName: string,
  action: ActionType,
  resource: string, // Ex: "Eventos", "Loja", "Usuários"
  details: string
) => {
  try {
    // 🦈 Tubarão anotando no caderno (Firestore)
    await addDoc(collection(db, "activity_logs"), {
      userId,
      userName,
      action,
      resource,
      details,
      timestamp: serverTimestamp(), // Hora oficial do servidor
    });
    
    // Feedback no console pra gente ver rodando (Dev Mode)
    if (process.env.NODE_ENV === 'development') {
        console.log(`🦈 [LOG]: ${userName} realizou ${action} em ${resource}`);
    }
  } catch (error) {
    // Se o log falhar, não queremos travar o app, só avisa no console
    console.error("Erro ao salvar log de atividade:", error);
  }
};