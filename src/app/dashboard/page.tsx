'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Swords, 
  Heart, 
  CheckCircle, 
  HelpCircle, 
  MapPin, 
  Calendar,
  Gamepad2,
  Loader2
} from 'lucide-react';

// ✅ Caminho relativo correto (Volta 2 pastas)
import { useAuth } from '../../context/AuthContext'; 
import Link from 'next/link';

// ✅ CORREÇÃO AQUI: Aspas duplas ou simples, mas tem que ter!
import { db } from '../../lib/firebase'; 
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// ... resto do código continua igual
// --- TIPAGEM ---
interface Evento {
  id: string;
  title: string;
  category: 'Festa' | 'Esporte' | 'Acadêmico';
  lote: 'Promocional' | '1º Lote' | '2º Lote' | 'Esgotado' | 'Gratuito';
  date: string;
  location: string;
  image: string;
  likes: number;
  going: number;
  userInteraction: 'like' | 'going' | 'maybe' | null;
}

// --- SUB-COMPONENTE INTERNO (CARD DARK - MANTIDO IGUAL) ---
const EventCardItem = ({ evt }: { evt: Evento }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [interaction, setInteraction] = useState(evt.userInteraction);
  const [goingCount, setGoingCount] = useState(evt.going);

  // Cores das Badges (MANTIDAS)
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
      case '2º Lote': return 'bg-yellow-500';
      case 'Esgotado': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const handleTogglePresence = async () => {
    if (isLoading) return;
    setIsLoading(true);

    const isJoining = interaction !== 'going';
    setInteraction(isJoining ? 'going' : null);
    setGoingCount(prev => isJoining ? prev + 1 : prev - 1);
    
    // TODO: Aqui a gente chama o Firebase para salvar a presença de verdade no futuro
    
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 flex flex-col">
      <div className="relative h-48 w-full">
        <img src={evt.image} alt={evt.title} className="w-full h-full object-cover opacity-90" />
        <span className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md uppercase tracking-wide border border-white/20 ${getCategoryColor(evt.category)}`}>{evt.category}</span>
        <span className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-md uppercase tracking-wide border border-white/20 ${getLoteColor(evt.lote)}`}>{evt.lote}</span>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent p-4 pt-10">
          <p className="text-white font-bold text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-orange-400" /> {evt.date}</p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="font-bold text-xl text-white leading-tight mb-1">{evt.title}</h3>
          <p className="text-gray-400 text-sm flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {evt.location}</p>
        </div>
        <div className="h-px w-full bg-gray-800" />
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-3">
            <button className="flex flex-col items-center gap-1 group">
              <div className={`p-2.5 rounded-full transition-colors ${evt.userInteraction === 'like' ? 'bg-red-500/20 text-red-500' : 'bg-gray-800 text-gray-500 hover:bg-red-500/20 hover:text-red-500'}`}><Heart className={`h-5 w-5 ${evt.userInteraction === 'like' ? 'fill-current' : ''}`} /></div>
              <span className="text-[10px] font-bold text-gray-500">{evt.likes}</span>
            </button>
            <button onClick={handleTogglePresence} disabled={isLoading} className="flex flex-col items-center gap-1 group relative">
              <div className={`p-2.5 rounded-full transition-all duration-300 transform active:scale-95 ${interaction === 'going' ? 'bg-green-500/20 text-green-500 ring-1 ring-green-500/50' : 'bg-gray-800 text-gray-500 hover:bg-green-500/20 hover:text-green-500'}`}>
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className={`h-5 w-5 ${interaction === 'going' ? 'fill-current' : ''}`} />}
              </div>
              <span className={`text-[10px] font-bold ${interaction === 'going' ? 'text-green-500' : 'text-gray-500'}`}>{goingCount} Vou</span>
            </button>
            <button className="flex flex-col items-center gap-1 group">
              <div className="p-2.5 rounded-full bg-gray-800 text-gray-500 hover:bg-blue-500/20 hover:text-blue-500 transition-colors"><HelpCircle className="h-5 w-5" /></div>
              <span className="text-[10px] font-bold text-gray-500">Talvez</span>
            </button>
          </div>
          {goingCount > 0 && (
            <div className="flex items-center -space-x-2.5">
              {[...Array(Math.min(3, goingCount))].map((_, i) => (
                <div key={i} className="h-7 w-7 rounded-full bg-gray-700 border-2 border-gray-900 overflow-hidden"><img src={`https://i.pravatar.cc/100?img=${15 + i}`} alt="User" className="w-full h-full object-cover" /></div>
              ))}
              {goingCount > 3 && <div className="h-7 w-7 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[9px] text-white font-bold">+{goingCount - 3}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL (DASHBOARD) ---
export default function DashboardPage() {
  const { user, loading } = useAuth();
  
  // 🦈 ESTADO REAL DE EVENTOS
  const [events, setEvents] = useState<Evento[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // 🦈 BUSCA NO FIREBASE (MOTOR LIGADO)
  useEffect(() => {
    async function fetchEvents() {
        try {
            const q = query(collection(db, "events"), orderBy("date", "asc"), limit(5));
            const querySnapshot = await getDocs(q);
            
            const eventsData: Evento[] = [];
            querySnapshot.forEach((doc) => {
                // Aqui a gente converte os dados do banco pro formato da tela
                eventsData.push({ id: doc.id, ...doc.data() } as Evento);
            });

            // Se o banco estiver vazio, mantém o mock (pra não ficar feio na demo)
            if (eventsData.length === 0) {
                setEvents([
                    {
                      id: '1', title: 'Intermed - O Início', category: 'Festa', lote: '1º Lote', date: '20/10 - 22h', location: 'Arena Sharks', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000', likes: 124, going: 89, userInteraction: null
                    },
                    {
                      id: '2', title: 'Sutura & Trauma', category: 'Acadêmico', lote: 'Esgotado', date: '22/10 - 14h', location: 'Auditório Principal', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000', likes: 45, going: 200, userInteraction: 'going'
                    }
                ]);
            } else {
                setEvents(eventsData);
            }

        } catch (error) {
            console.error("Erro ao buscar eventos:", error);
        } finally {
            setLoadingEvents(false);
        }
    }

    fetchEvents();
  }, []);

  if (loading || loadingEvents) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#050505]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 text-orange-500 animate-spin" />
          <p className="text-orange-500 font-bold animate-pulse">O Tubarão está acordando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // DADOS VISUAIS (Mantidos do seu design)
  const turmaRanking = 6; 
  const matchesPlayed = user.dailyMatchesPlayed || 0;
  const remainingMatches = Math.max(0, 5 - matchesPlayed);
  // Usa a foto da turma cadastrada (T1.jpeg, T2.jpeg...) ou fallback
  const classPhotoSrc = `/turma${user.turma?.replace('T', '')}.jpeg` || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94';

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 max-w-md mx-auto w-full bg-[#050505] min-h-screen text-white">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Fala, {user.nome.split(' ')[0]}! 🦈</h1>
          <p className="text-gray-400 text-sm font-medium">Pronto para dominar o oceano?</p>
        </div>
        {/* Agora clica na foto e vai pro Perfil */}
        <Link href="/dashboard/perfil">
            <div className="h-14 w-14 rounded-full bg-gray-900 flex items-center justify-center border-2 border-orange-500 p-0.5 shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform">
                <img src={user.foto} alt="Perfil" className="w-full h-full rounded-full object-cover" />
            </div>
        </Link>
      </div>

      {/* --- GRID DE AÇÃO --- */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* BOTÃO GYMRATS -> Vai para /gym/details */}
        <Link href="/gym/details" className="group relative h-48 w-full overflow-hidden rounded-2xl bg-gray-900 shadow-xl transition-all active:scale-95 border border-red-900/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-red-900/50 via-gray-900 to-black" />

          {/* Conteúdo Centralizado */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white z-10">
            
            {/* Badge Topo */}
            <div className="absolute top-3 flex items-center gap-2 bg-red-900/30 px-3 py-1 rounded-full backdrop-blur-sm border border-red-500/20">
              <Trophy className="h-3 w-3 text-red-400" />
              <span className="font-bold tracking-wide uppercase text-[10px] text-red-100">GymRats</span>
            </div>
            
            {/* Ranking Geral do Usuário */}
            <div className="flex flex-col items-center mt-2">
                <div className="text-4xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                #{user.rankingPosition || '-'}
                </div>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Geral</span>
            </div>

            {/* INFO DA TURMA (Com imagem dinâmica da T1, T2...) */}
            <div className="mt-3 flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-red-500/30 shadow-lg backdrop-blur-sm">
                <div className="h-6 w-6 rounded-full border border-red-500 overflow-hidden shrink-0">
                    <img src={classPhotoSrc} alt="Turma" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')}/>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-white">{turmaRanking}º</span>
                    <span className="text-[8px] text-gray-300 uppercase">Turma</span>
                </div>
            </div>

          </div>
        </Link>

        {/* BOTÃO ARENA GAMES -> Vai para /games */}
        <Link href="/games" className="group relative h-48 w-full overflow-hidden rounded-2xl bg-gray-900 shadow-xl transition-all active:scale-95 border border-purple-500/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/40 via-gray-900 to-black" />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white z-10">
            
            {/* Badge Topo */}
            <div className="absolute top-3 flex items-center gap-2 bg-purple-900/30 px-3 py-1 rounded-full backdrop-blur-sm border border-purple-500/20">
              <Gamepad2 className="h-3 w-3 text-purple-500" />
              <span className="font-bold tracking-wide uppercase text-[10px] text-purple-100">Arena</span>
            </div>

            {/* Level */}
            <div className="flex flex-col items-center mt-2">
              <span className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">Level</span>
              <span className="text-4xl font-black text-white drop-shadow-lg">{user.level || 1}</span>
            </div>

            {/* Poder do Herói */}
            <div className="mt-3 w-full px-4">
               <div className="bg-black/40 w-full rounded-lg py-1 px-2 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                 <div className="flex flex-col items-center">
                    <span className="text-[8px] text-purple-300/80 uppercase font-bold tracking-wider mb-px">Poder</span>
                    <span className="text-lg font-bold text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] animate-pulse leading-none">
                    ⚡ {user.xp || 0}
                    </span>
                 </div>
               </div>
            </div>
          </div>
        </Link>
      </div>

      {/* --- PARTIDAS RESTANTES (Mantido) --- */}
      <div className="bg-gray-900 p-5 rounded-2xl shadow-lg border border-gray-800">
        <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-wide">
                <Swords className="h-5 w-5 text-orange-500" />
                Partidas Restantes
            </h3>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded border border-gray-700">Reseta às 00h</span>
        </div>
        
        <div className="flex gap-1.5 mb-3">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i} 
                    className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${
                        i < matchesPlayed
                        ? 'bg-gray-700'
                        : 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]'
                    }`}
                />
            ))}
        </div>
        <p className="text-sm text-center text-gray-400 font-medium">
            Você ainda pode jogar <strong className="text-orange-500 text-lg">{remainingMatches}</strong> partidas hoje!
        </p>
      </div>

      {/* --- LISTA DE EVENTOS --- */}
      <div>
        <h2 className="text-lg font-extrabold text-white mb-4 px-1 flex items-center gap-2">
          Próximos Eventos <span className="text-xs font-normal text-gray-300 bg-gray-800 px-2 py-0.5 rounded-full border border-gray-700">{events.length}</span>
        </h2>
        <div className="flex flex-col gap-5">
          {events.map((evt) => (
            <EventCardItem key={evt.id} evt={evt} />
          ))}
        </div>
      </div>
    </div>
  );
}