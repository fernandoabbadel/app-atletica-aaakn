import { db } from "./firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// --- REGRAS DE SEGURANÇA ---
const RULES = {
    POST_COOLDOWN: 60 * 1000, // 1 minuto entre posts
    LIKE_DEBOUNCE: 500, // 0.5s entre cliques de like (evita script de autoclick)
    MAX_DAILY_GYM: 1, // 1 treino por dia
};

export const Security = {
    
    // 1. Verifica se pode postar (Anti-Spam)
    async canUserPost(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) return { allowed: false, reason: "Usuário não encontrado." };
        
        const lastPost = snap.data().lastPostTime?.toDate().getTime() || 0;
        const now = Date.now();

        if (now - lastPost < RULES.POST_COOLDOWN) {
            const waitTime = Math.ceil((RULES.POST_COOLDOWN - (now - lastPost)) / 1000);
            return { allowed: false, reason: `Calma tubarão! Espere ${waitTime}s para postar novamente.` };
        }

        // Atualiza o tempo do último post se permitido
        await updateDoc(userRef, { lastPostTime: serverTimestamp() });
        return { allowed: true };
    },

    // 2. Verifica Check-in de Treino (Anti-Farm)
    async canCheckInGym(userId: string): Promise<{ allowed: boolean; reason?: string }> {
        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);
        
        if (!snap.exists()) return { allowed: false };
        
        const lastCheckIn = snap.data().lastGymCheckIn?.toDate() || new Date(0);
        const today = new Date();

        // Verifica se é o mesmo dia (DD/MM/YYYY)
        if (
            lastCheckIn.getDate() === today.getDate() &&
            lastCheckIn.getMonth() === today.getMonth() &&
            lastCheckIn.getFullYear() === today.getFullYear()
        ) {
            return { allowed: false, reason: "Você já treinou hoje! O descanso também faz parte do treino." };
        }

        return { allowed: true };
    },

    // 3. Debounce Visual (Para Likes)
    // Isso é usado direto no componente para travar o botão visualmente
    debounceLike: (lastClickTime: number) => {
        return Date.now() - lastClickTime > RULES.LIKE_DEBOUNCE;
    }
};