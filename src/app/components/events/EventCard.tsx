'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, Heart, CheckCircle, HelpCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
// import { useToast } from '@/hooks/useToast'; // Supondo que você tenha seu hook de toast

// Interface local para as props
interface EventCardProps {
  id: string;
  title: string;
  category: 'Festa' | 'Esporte' | 'Acadêmico';
  lote: 'Promocional' | '1º Lote' | '2º Lote' | 'Esgotado' | 'Gratuito';
  date: string;
  location: string;
  image: string;
  initialLikes: number;
  initialGoing: number;
  initialUserInteraction: 'like' | 'going' | 'maybe' | null;
}

export function EventCard({
  id,
  title,
  category,
  lote,
  date,
  location,
  image,
  initialLikes,
  initialGoing,
  initialUserInteraction
}: EventCardProps) {
  const { user } = useAuth();
  // const { toast } = useToast(); 

  // Estados Locais (UX Instantânea)
  const [interaction, setInteraction] = useState(initialUserInteraction);
  const [goingCount, setGoingCount] = useState(initialGoing);
  const [isLoading, setIsLoading] = useState(false);

  // Cores Dinâmicas
  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'Festa': return 'bg-purple-600';
      case 'Esporte': return 'bg-orange-500';
      case 'Acadêmico': return 'bg-cyan-600';
      default: return 'bg-gray-600';
    }
  };

  const getLoteColor = (lote: string) => {
    switch(lote) {
      case 'Promocional': return 'bg-green-500';
      case '1º Lote': return 'bg-blue-500';
      case 'Esgotado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // --- LÓGICA DO "VOU" ---
  const handleTogglePresence = async () => {
    if (isLoading) return;
    if (!user) {
        alert("Opa! Precisa do crachá (login) pra marcar presença!"); // Trocar por Toast
        return;
    }

    setIsLoading(true);

    // 1. Guardar estado anterior (para rollback em caso de erro)
    const previousInteraction = interaction;
    const previousCount = goingCount;

    // 2. Atualização Otimista (O Tubarão é rápido)
    const isConfirming = interaction !== 'going'; // Se não era 'going', agora vai ser
    
    setInteraction(isConfirming ? 'going' : null);
    setGoingCount(prev => isConfirming ? prev + 1 : prev - 1);

    try {
      // 3. Simulação de Chamada ao Firebase (Aqui entra sua função real)
      // await eventService.toggleAttendance(eventId, user.uid, isConfirming);
      
      // Simulando delay de rede
      await new Promise(resolve => setTimeout(resolve, 800));

      // 4. Sucesso! Feedback do Tubarão
      if (isConfirming) {
        console.log("Aí sim! O Tubarão aprovou! 🦈 Presença confirmada.");
        // toast.success("Presença confirmada! O Tubarão vai invadir! 🦈");
      } else {
        console.log("O Tubarão voltou pro mar... 🌊 Presença cancelada.");
        // toast.info("Presença cancelada. Volte logo pro cardume! 🐟");
      }

    } catch (error) {
      // 5. Deu Ruim! Rollback
      console.error("Erro ao marcar presença:", error);
      setInteraction(previousInteraction);
      setGoingCount(previousCount);
      // toast.error("Deu ruim no plantão! 🚨 Não consegui confirmar sua presença.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 flex flex-col">
      
      {/* Imagem + Badges */}
      <div className="relative h-48 w-full">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wide ${getCategoryColor(category)}`}>
          {category}
        </span>

        <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm uppercase tracking-wide ${getLoteColor(lote)}`}>
          {lote}
        </span>

        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-3 pt-8">
            <p className="text-white font-bold text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-400" /> {date}
            </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col gap-3">
        <div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{title}</h3>
            <p className="text-gray-500 text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {location}
            </p>
        </div>

        <div className="h-px w-full bg-gray-100" />

        {/* --- BARRA DE AÇÕES --- */}
        <div className="flex items-center justify-between">
            
            <div className="flex gap-4">
                {/* LIKE (Só visual por enquanto) */}
                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-2 rounded-full bg-gray-50 group-hover:bg-red-50 text-gray-400 group-hover:text-red-500 transition-colors">
                        <Heart className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">{initialLikes}</span>
                </button>

                {/* --- BOTÃO VOU (O PRINCIPAL) --- */}
                <button 
                    onClick={handleTogglePresence}
                    disabled={isLoading}
                    className="flex flex-col items-center gap-1 group relative"
                >
                    <div className={`
                        p-2 rounded-full transition-all duration-300 transform group-active:scale-90
                        ${interaction === 'going' 
                            ? 'bg-green-100 text-green-600 shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                            : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-500'}
                    `}>
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <CheckCircle className={`h-5 w-5 ${interaction === 'going' ? 'fill-current' : ''}`} />
                        )}
                    </div>
                    <span className={`text-[10px] font-bold ${interaction === 'going' ? 'text-green-600' : 'text-gray-400'}`}>
                        {goingCount} Vou
                    </span>
                </button>

                {/* TALVEZ */}
                <button className="flex flex-col items-center gap-1 group">
                    <div className="p-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <HelpCircle className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-medium text-gray-400">Talvez</span>
                </button>
            </div>

            {/* Avatares dos Tubarões que vão */}
            {goingCount > 0 && (
                <div className="flex items-center -space-x-2">
                    {[...Array(Math.min(3, goingCount))].map((_, i) => (
                        <div key={i} className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                            <img src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="User" />
                        </div>
                    ))}
                    {goingCount > 3 && (
                        <div className="h-6 w-6 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center text-[8px] text-white font-bold">
                            +{goingCount - 3}
                        </div>
                    )}
                </div>
            )}

        </div>
      </div>
    </div>
  );
}