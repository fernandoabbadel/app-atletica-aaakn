import { db } from "./firebase"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type ActionType = 
  | "CREATE" 
  | "UPDATE" 
  | "DELETE" 
  | "LOGIN" 
  | "ERROR" 
  | "LIKE"       
  | "QUIZ"       
  | "FOLLOW"     
  | "UNFOLLOW"
  | "GAME_CYCLE"; // <--- ADICIONADO PARA O SHARKROUND

export const logActivity = async (
  userId: string,
  userName: string, 
  action: ActionType,
  resource: string, 
  details: any
) => {
  try {
    const detailsString = typeof details === 'object' ? JSON.stringify(details) : String(details);

    await addDoc(collection(db, "activity_logs"), {
      userId,
      userName: userName || "Anônimo",
      action,
      resource,
      details: detailsString,
      timestamp: serverTimestamp(),
    });
    
    if (process.env.NODE_ENV === 'development') {
        console.log(`🦈 [LOG]: ${userName} realizou ${action} em ${resource}`);
    }
  } catch (error) {
    console.error("Erro ao salvar log:", error);
  }
};