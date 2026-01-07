"use client";

import React, { useState } from "react";
import {
  Trophy,
  Flame,
  MessageCircle,
  ArrowLeft,
  MoreVertical,
  Calendar as CalendarIcon,
  Share2,
  Plus,
  User,
  BarChart2,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";

// --- DADOS INICIAIS ---

const CALENDARIO_DEZEMBRO = Array.from({ length: 31 }, (_, i) => {
  const dia = i + 1;
  const temTreino = [
    5, 6, 10, 11, 12, 15, 16, 18, 20, 22, 23, 25, 27, 29,
  ].includes(dia);
  return {
    dia,
    temTreino,
    foto: temTreino ? `https://picsum.photos/100/100?random=${dia}` : null,
  };
});

const RANKING_DATA = [
  {
    id: 1,
    pos: 1,
    nome: "Julia de Souza Felinto",
    pontos: 85,
    avatar: "https://i.pravatar.cc/150?u=julia",
  },
  {
    id: 2,
    pos: 2,
    nome: "Maria Gabriela dos Santos",
    pontos: 82,
    avatar: "https://i.pravatar.cc/150?u=maria",
  },
  {
    id: 3,
    pos: 3,
    nome: "Matheus Negreiros",
    pontos: 82,
    avatar: "https://i.pravatar.cc/150?u=matheus",
  },
  {
    id: 4,
    pos: 4,
    nome: "Maria Eduarda Cantelmo",
    pontos: 50,
    avatar: "https://i.pravatar.cc/150?u=eduarda",
  },
  {
    id: 5,
    pos: 5,
    nome: "Laura de Goes Gomes",
    pontos: 45,
    avatar: "https://i.pravatar.cc/150?u=laura",
  },
];

const INITIAL_POSTS = [
  {
    id: 1,
    usuarioId: 101,
    usuarioNome: "Maria Eduarda Cantelmo",
    usuarioAvatar: "https://i.pravatar.cc/150?u=eduarda",
    legenda: "Pose do dia - Tá pago! 💪",
    tempo: "7:32 am",
    foto: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
    emoji: "💪",
    validado: true, // Já validado
  },
  {
    id: 2,
    usuarioId: 102,
    usuarioNome: "Atlética Medicina AAAKN",
    usuarioAvatar: "https://github.com/shadcn.png",
    legenda: "Pose do dia 29: Duplo Bíceps! Valendo 50pts.",
    tempo: "1:45 am",
    foto: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500&q=80",
    isChallenge: true,
    emoji: "🔥",
    validado: true,
  },
  {
    id: 3,
    usuarioId: 103,
    usuarioNome: "João Calouro T1",
    usuarioAvatar: "https://i.pravatar.cc/150?u=joao",
    legenda: "Primeiro treino do ano! Foco total.",
    tempo: "10:00 am",
    foto: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
    emoji: "🏋️",
    validado: false, // Ainda não validado (para testar o admin)
  },
];

export default function GymPage() {
  const [activeTab, setActiveTab] = useState<"feed" | "ranking" | "stats">(
    "feed"
  );

  // Estado para os posts (para permitir validação dinâmica)
  const [posts, setPosts] = useState(INITIAL_POSTS);

  // Estado SIMULADO de Admin (para você testar o botão de validar)
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Função para validar treino (Admin)
  const toggleValidacao = (postId: number) => {
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId ? { ...post, validado: !post.validado } : post
      )
    );
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-emerald-500 selection:text-white">
      {/* HEADER SUPERIOR FIXO */}
      <header className="px-4 py-3 flex items-center justify-between sticky top-0 z-30 bg-black/95 backdrop-blur-md border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-sm text-white">Desafio de Férias</h1>
          <p className="text-[10px] text-zinc-500">dez. 12 - jan. 10</p>
        </div>

        {/* Botão de Opções (Simula menu admin) */}
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          className={`p-2 -mr-2 rounded-full transition ${
            isAdminMode
              ? "text-emerald-500 bg-emerald-500/10"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          {isAdminMode ? <ShieldAlert size={24} /> : <MoreVertical size={24} />}
        </button>
      </header>

      {/* Aviso de Modo Admin (Apenas para desenvolvimento) */}
      {isAdminMode && (
        <div className="bg-emerald-900/30 border-b border-emerald-900 p-2 text-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
          Modo Admin Ativado: Clique para validar treinos
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL */}
      <main className="animate-in fade-in duration-300">
        {/* --- ABA 1: FEED --- */}
        {activeTab === "feed" && (
          <div className="space-y-4 p-4">
            {/* BANNER DO DESAFIO */}
            <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-lg border border-zinc-800 relative group">
              <div className="h-32 bg-gradient-to-r from-emerald-900 to-black relative">
                <img
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80"
                  className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <h2 className="font-black text-2xl italic text-emerald-400 uppercase tracking-tighter drop-shadow-md">
                    DESAFIO MEDCOF
                  </h2>
                  <p className="text-[10px] text-zinc-300 bg-black/50 px-2 py-1 rounded mt-1 backdrop-blur-sm">
                    Tubarões treinando nas férias
                  </p>
                </div>
              </div>

              {/* Stats do Banner */}
              <div className="p-4 flex justify-between items-center bg-zinc-900 text-white">
                <div className="flex flex-col items-center w-1/3">
                  <div className="flex items-center gap-1">
                    <img
                      src="https://i.pravatar.cc/150?u=julia"
                      className="w-5 h-5 rounded-full border border-zinc-700"
                    />
                    <span className="font-bold text-lg">85</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">
                    Líder
                  </span>
                </div>
                <div className="flex flex-col items-center w-1/3 border-l border-r border-zinc-800">
                  <div className="w-6 h-6 bg-emerald-900 rounded-full flex items-center justify-center mb-1 text-xs shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    🦈
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">
                    Você: 0 pts
                  </span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  <span className="font-bold text-lg flex items-center gap-1">
                    <CalendarIcon size={14} className="text-zinc-400" /> 12
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-bold">
                    Dias Rest.
                  </span>
                </div>
              </div>
            </div>

            <h3 className="text-zinc-500 text-[10px] uppercase font-bold pl-1 mt-6 mb-2">
              Feed Diário
            </h3>

            {/* LISTA DE POSTS */}
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-zinc-900 rounded-2xl p-3 border border-zinc-800 mb-3 relative overflow-hidden"
              >
                <div className="flex gap-3">
                  {/* Foto do Usuário (Clicável -> Perfil) */}
                  <div className="flex-shrink-0 relative">
                    <Link href={`/perfil/${post.usuarioId}`}>
                      <img
                        src={post.usuarioAvatar}
                        className="w-10 h-10 rounded-full object-cover border border-zinc-700 hover:border-emerald-500 transition"
                      />
                    </Link>
                    <span className="absolute -bottom-1 -right-1 text-sm">
                      {post.emoji}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header do Post */}
                    <div className="flex justify-between items-start">
                      <Link href={`/perfil/${post.usuarioId}`}>
                        <h4 className="font-bold text-xs text-zinc-200 truncate pr-2 hover:underline decoration-emerald-500 underline-offset-2">
                          {post.usuarioNome}
                        </h4>
                      </Link>

                      <div className="flex items-center gap-2">
                        {/* TIMESTAMP */}
                        <span className="text-[10px] text-zinc-600 whitespace-nowrap">
                          {post.tempo}
                        </span>

                        {/* ÍCONE DE VALIDADO (TUBARÃO) */}
                        {post.validado ? (
                          <div
                            className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1"
                            title="Treino Validado pela Moderação"
                          >
                            <span className="text-xs">🦈</span>
                            <span className="text-emerald-500 font-bold hidden sm:inline">
                              Validado
                            </span>
                          </div>
                        ) : (
                          isAdminMode && (
                            <button
                              onClick={() => toggleValidacao(post.id)}
                              className="bg-zinc-800 hover:bg-emerald-900 text-zinc-400 hover:text-emerald-400 text-[9px] px-2 py-1 rounded border border-zinc-700 transition"
                            >
                              Validar
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Foto do Treino */}
                    <div className="mt-2 mb-2 rounded-lg overflow-hidden h-40 bg-black relative border border-zinc-800 group">
                      <img
                        src={post.foto}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition"
                      />

                      {/* Se for Admin, pode clicar na foto pra validar também */}
                      {isAdminMode && !post.validado && (
                        <div
                          className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          onClick={() => toggleValidacao(post.id)}
                        >
                          <span className="text-emerald-400 font-bold border border-emerald-400 px-3 py-1 rounded-full bg-black/50">
                            Aprovar Treino
                          </span>
                        </div>
                      )}

                      {post.isChallenge && (
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-white border border-emerald-500/30 flex items-center gap-1">
                          <Flame
                            size={10}
                            className="text-orange-500 fill-orange-500"
                          />{" "}
                          Desafio
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-zinc-400">{post.legenda}</p>

                    {/* Ações Sociais (Like/Comentar) */}
                    <div className="flex gap-4 mt-3 border-t border-zinc-800/50 pt-2">
                      <button className="flex items-center gap-1 text-zinc-500 hover:text-red-500 transition group">
                        <div className="group-hover:scale-110 transition">
                          ♡
                        </div>
                        <span className="text-[10px] font-medium">Curtir</span>
                      </button>
                      <button className="flex items-center gap-1 text-zinc-500 hover:text-blue-400 transition">
                        <MessageCircle size={14} />
                        <span className="text-[10px] font-medium">
                          Comentar
                        </span>
                      </button>
                      <button className="flex items-center gap-1 text-zinc-500 hover:text-yellow-500 transition ml-auto">
                        <ShieldAlert size={14} />
                        <span className="text-[10px] font-medium">
                          Denunciar
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- ABA 2: RANKING --- */}
        {activeTab === "ranking" && (
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <div className="bg-zinc-800 rounded-full h-3 w-full overflow-hidden">
                <div className="bg-[#E53935] h-full w-[65%] rounded-full shadow-[0_0_10px_#E53935]"></div>
              </div>
              <div className="flex justify-between text-[10px] text-zinc-500 font-medium">
                <span>Início: dez 12</span>
                <span>Fim: jan 10</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-zinc-400">
              <Share2 size={16} />
              <span className="text-xs font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                XGPHDTEN
              </span>
              <span className="text-xs text-[#E53935] font-bold ml-auto cursor-pointer hover:underline">
                Convidar
              </span>
            </div>

            <div>
              <h3 className="font-bold text-sm text-zinc-300 mb-4">
                Classificações
              </h3>
              <div className="space-y-1">
                {RANKING_DATA.map((user) => (
                  <Link
                    href={`/perfil/${user.id}`}
                    key={user.id}
                    className="flex items-center justify-between py-3 border-b border-zinc-900/50 hover:bg-zinc-900/30 px-2 -mx-2 rounded transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                      />
                      <div>
                        <p className="font-bold text-xs text-zinc-200">
                          {user.nome}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {user.pontos} pontos
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        user.pos === 1 ? "text-yellow-500" : "text-zinc-500"
                      }`}
                    >
                      {user.pos}º
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- ABA 3: PERFIL (Stats) --- */}
        {activeTab === "stats" && (
          <div className="p-4 text-center animate-in slide-in-from-right-4 duration-300">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto bg-zinc-900 rounded-full p-1 border border-zinc-800 mb-3 relative group cursor-pointer">
                <img
                  src="https://github.com/shadcn.png"
                  className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-100 transition"
                />
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className="bg-zinc-950 text-[10px] px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">
                    AAAKN
                  </span>
                </div>
              </div>
              <h2 className="font-bold text-base text-white">
                Atlética Medicina Caragua
              </h2>

              <div className="flex justify-center gap-8 mt-6">
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-white">33</span>
                  <span className="text-[9px] text-zinc-500 uppercase">
                    Check-ins
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-white">27</span>
                  <span className="text-[9px] text-zinc-500 uppercase">
                    Dias ativos
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg text-white">2h 58m</span>
                  <span className="text-[9px] text-zinc-500 uppercase">
                    Tempo ativo
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-full p-1 flex mb-8 mx-4">
              <button className="flex-1 py-1.5 rounded-full bg-zinc-800 text-xs font-bold text-zinc-200 flex items-center justify-center gap-1 shadow-sm">
                <Trophy size={12} /> Melhores
              </button>
              <button className="flex-1 py-1.5 text-xs font-medium text-zinc-500 flex items-center justify-center gap-1">
                <Flame size={12} /> Stats
              </button>
              <button className="flex-1 py-1.5 text-xs font-medium text-zinc-500 flex items-center justify-center gap-1">
                <Clock size={12} /> Metas
              </button>
            </div>

            <div className="bg-black rounded-xl">
              <h3 className="font-bold text-sm text-white mb-4 capitalize">
                Dezembro 2025
              </h3>

              <div className="grid grid-cols-7 mb-2 text-zinc-600 text-[10px] uppercase font-bold">
                <div>dom</div>
                <div>seg</div>
                <div>ter</div>
                <div>qua</div>
                <div>qui</div>
                <div>sex</div>
                <div>sáb</div>
              </div>

              <div className="grid grid-cols-7 gap-y-4 gap-x-1">
                <div></div>
                <div></div>

                {CALENDARIO_DEZEMBRO.map((dia) => (
                  <div
                    key={dia.dia}
                    className="flex flex-col items-center justify-center h-10 w-10 mx-auto"
                  >
                    {dia.temTreino ? (
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-zinc-800 relative group cursor-pointer transition transform hover:scale-110 shadow-lg shadow-emerald-900/20">
                        <img
                          src={dia.foto!}
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-black"></div>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-700 font-medium">
                        {dia.dia}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button className="bg-zinc-900/50 text-zinc-500 text-xs py-2 px-6 rounded-full mt-8 border border-zinc-800 hover:bg-zinc-900 transition">
              Ver todos os check-ins
            </button>
          </div>
        )}
      </main>

      {/* FAB - NOVO CHECK-IN */}
      <button className="fixed bottom-24 right-5 bg-[#E53935] w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(229,57,53,0.4)] text-white hover:scale-105 active:scale-95 transition z-40 border-2 border-black">
        <Plus size={30} strokeWidth={2.5} />
      </button>

      {/* MENU INFERIOR */}
      <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-zinc-900 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-[80px]">
        <button
          onClick={() => setActiveTab("feed")}
          className={`flex flex-col items-center gap-1.5 transition ${
            activeTab === "feed" ? "text-white" : "text-zinc-600"
          }`}
        >
          <div
            className={`p-1 rounded-lg ${
              activeTab === "feed" ? "bg-zinc-900" : ""
            }`}
          >
            <Share2 size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-bold">Detalhes</span>
        </button>

        <button
          onClick={() => setActiveTab("ranking")}
          className={`flex flex-col items-center gap-1.5 transition ${
            activeTab === "ranking" ? "text-white" : "text-zinc-600"
          }`}
        >
          <div
            className={`p-1 rounded-lg ${
              activeTab === "ranking" ? "bg-zinc-900" : ""
            }`}
          >
            <Trophy size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-bold">Classificações</span>
        </button>

        <button
          onClick={() => setActiveTab("stats")}
          className={`flex flex-col items-center gap-1.5 transition ${
            activeTab === "stats" ? "text-white" : "text-zinc-600"
          }`}
        >
          <div
            className={`p-1 rounded-lg ${
              activeTab === "stats" ? "bg-zinc-900" : ""
            }`}
          >
            <User size={22} strokeWidth={2} />
          </div>
          <span className="text-[10px] font-bold">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
