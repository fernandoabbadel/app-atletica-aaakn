import { 
    Fish, Rocket, Swords, Skull, ShoppingBag, Gem, PartyPopper, 
    Beer, Ticket, BookOpen, DollarSign, HeartHandshake, Heart, 
    Megaphone, ShieldAlert, Activity, Dumbbell, Flame, Crown, 
    Zap, Timer, Users, Trophy, Wallet, Gamepad2, MessageCircle,
    UserPlus, Target, Star, Ghost, Medal, LayoutGrid, CheckCircle2, ThumbsUp
} from "lucide-react";

export type AchievementCategory = "Geral" | "Gym" | "Games" | "Social" | "Loja" | "Eventos";

export interface Achievement {
    id: string;
    titulo: string;
    desc: string;
    cat: AchievementCategory;
    xp: number;
    target: number; 
    statKey: string; 
    iconName: string; 
}

export const ACHIEVEMENTS_CATALOG: Achievement[] = [
    // --- SOCIAL & INTERAÇÃO (Novos Contadores) ---
    { id: "soc_1", titulo: "Primeiro Mergulho", desc: "Criou sua conta no cardume.", cat: "Social", xp: 50, target: 1, statKey: "accountCreated", iconName: "UserPlus" },
    
    // Likes DADOS (Apoiador)
    { id: "soc_10", titulo: "Apoiador da Tropa", desc: "Deu like em 10 comentários ou posts.", cat: "Social", xp: 150, target: 10, statKey: "likesGiven", iconName: "ThumbsUp" },
    { id: "soc_11", titulo: "Mão Nervosa", desc: "Deu like em 100 comentários ou posts.", cat: "Social", xp: 800, target: 100, statKey: "likesGiven", iconName: "HeartHandshake" },

    // Likes RECEBIDOS (Fama)
    { id: "soc_6", titulo: "Notado pelo Cardume", desc: "Recebeu 10 curtidas totais.", cat: "Social", xp: 200, target: 10, statKey: "likesReceived", iconName: "Heart" },
    { id: "soc_7", titulo: "Influencer da Atlética", desc: "Recebeu 100 curtidas totais.", cat: "Social", xp: 1500, target: 100, statKey: "likesReceived", iconName: "Star" },
    { id: "soc_8", titulo: "Viralizou!", desc: "Recebeu 500 curtidas totais.", cat: "Social", xp: 5000, target: 500, statKey: "likesReceived", iconName: "Flame" },

    // Hypes DADOS
    { id: "soc_13", titulo: "Incendiário", desc: "Deu 20 Hypes em posts.", cat: "Social", xp: 300, target: 20, statKey: "hypesGiven", iconName: "Zap" },

    // Comentários
    { id: "soc_4", titulo: "Tagarela", desc: "Comentou em 20 publicações.", cat: "Social", xp: 150, target: 20, statKey: "commentsCount", iconName: "MessageCircle" },
    { id: "soc_5", titulo: "Debatedor Sênior", desc: "Comentou em 100 publicações.", cat: "Social", xp: 1000, target: 100, statKey: "commentsCount", iconName: "MessageCircle" },

    { id: "soc_2", titulo: "Tubarão Social", desc: "Fez 5 posts na comunidade.", cat: "Social", xp: 100, target: 5, statKey: "postsCount", iconName: "Megaphone" },
    { id: "soc_9", titulo: "Sentinela do Mar", desc: "Fez uma denúncia que foi aceita.", cat: "Social", xp: 200, target: 1, statKey: "validReports", iconName: "ShieldAlert" },
    
    // --- ACESSO & FIDELIDADE ---
    { id: "acc_1", titulo: "Recruta", desc: "Logou 5 vezes no aplicativo.", cat: "Geral", xp: 50, target: 5, statKey: "loginCount", iconName: "Fish" },
    { id: "acc_2", titulo: "Veterano", desc: "Logou 100 vezes no aplicativo.", cat: "Geral", xp: 1000, target: 100, statKey: "loginCount", iconName: "Fish" },
    { id: "acc_3", titulo: "Ritmo Firme", desc: "Manteve 5 dias de login seguidos.", cat: "Geral", xp: 200, target: 5, statKey: "loginStreak", iconName: "Zap" },
    { id: "acc_4", titulo: "Viciado em Resenha", desc: "Manteve 30 dias de login seguidos.", cat: "Geral", xp: 2000, target: 30, statKey: "loginStreak", iconName: "Zap" },
    { id: "acc_5", titulo: "Inabalável", desc: "Manteve 100 dias de login seguidos.", cat: "Geral", xp: 10000, target: 100, statKey: "loginStreak", iconName: "Crown" },
    { id: "acc_6", titulo: "Perfil Completo", desc: "Preencheu todos os dados do cadastro.", cat: "Geral", xp: 300, target: 1, statKey: "profileComplete", iconName: "CheckCircle2" },

    // --- GYM RATS ---
    { id: "gym_1", titulo: "Primeiro Treino", desc: "Confirmou presença em 1 treino.", cat: "Gym", xp: 100, target: 1, statKey: "gymCheckins", iconName: "Activity" },
    { id: "gym_2", titulo: "Em Evolução", desc: "Confirmou presença em 10 treinos.", cat: "Gym", xp: 400, target: 10, statKey: "gymCheckins", iconName: "Dumbbell" },
    { id: "gym_3", titulo: "Rato de Academia", desc: "Confirmou presença em 50 treinos.", cat: "Gym", xp: 2000, target: 50, statKey: "gymCheckins", iconName: "Dumbbell" },
    { id: "gym_5", titulo: "Madrugador", desc: "Treino confirmado antes das 06:30.", cat: "Gym", xp: 500, target: 1, statKey: "gymEarlyBird", iconName: "Timer" },

    // --- ARENA GAMES ---
    { id: "game_1", titulo: "Player 1", desc: "Participou de 1 partida na Arena.", cat: "Games", xp: 50, target: 1, statKey: "arenaMatches", iconName: "Gamepad2" },
    { id: "game_3", titulo: "Primeiro GG", desc: "Venceu sua primeira partida.", cat: "Games", xp: 100, target: 1, statKey: "arenaWins", iconName: "Trophy" },

    // --- LOJA ---
    { id: "shop_1", titulo: "Apoiador", desc: "Realizou sua primeira compra.", cat: "Loja", xp: 100, target: 1, statKey: "storeOrders", iconName: "ShoppingBag" },
    { id: "shop_5", titulo: "Colecionador", desc: "Comprou 10 produtos diferentes.", cat: "Loja", xp: 1000, target: 10, statKey: "storeItemsCount", iconName: "LayoutGrid" },

    // --- EVENTOS ---
    { id: "evt_1", titulo: "Rolezeiro", desc: "Fez check-in em 1 evento oficial.", cat: "Eventos", xp: 100, target: 1, statKey: "eventsAttended", iconName: "Ticket" },
    { id: "evt_3", titulo: "Tubarão de Elite", desc: "Fez check-in em 20 eventos oficiais.", cat: "Eventos", xp: 5000, target: 20, statKey: "eventsAttended", iconName: "Crown" },
];