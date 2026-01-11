"use client";

import React, { useEffect, useState } from "react";
import {
  Bell,
  Gamepad2,
  Star,
  Dumbbell,
  CreditCard,
  MessageSquare,
  Heart,
  MoreHorizontal,
  Flag,
  LogIn,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Redireciona se estiver logado mas não tiver completado o cadastro (sem nome)
    if (user && !user.nome) {
      router.push("/cadastro");
    }
  }, [user, router]);

  const isGuest = !user;
  const activeUser = user || {
    nome: "Visitante",
    turma: "---",
    foto: "https://github.com/shadcn.png",
    level: 1,
  };

  // Classe que deixa tudo cinza e bloqueia cliques se for visitante
  const guestBlockClass = isGuest
    ? "opacity-20 grayscale pointer-events-none blur-[2px] select-none"
    : "";

  // --- DADOS ESTÁTICOS ---
  const parceirosOficiais = [
    { id: 1, nome: "Ironberg", slug: "ironberg" },
    { id: 2, nome: "Monstro", slug: "acai-do-monstro" },
    { id: 3, nome: "Bar Facul", slug: "bar-da-faculdade" },
    { id: 4, nome: "Cópia&Cia", slug: "copia-cia" },
    { id: 5, nome: "Saúde+", slug: "saude-mais" },
  ];

  const itensLoja = [
    {
      id: 1,
      nome: "Samba Canção Tubarão",
      preco: "R$ 45,00",
      img: "https://images.unsplash.com/photo-1594932224011-04104046d482?w=400",
    },
    {
      id: 2,
      nome: "Caneca Alumínio 850ml",
      preco: "R$ 35,00",
      img: "https://images.unsplash.com/photo-1577937927133-66ef06ac992a?w=400",
    },
    {
      id: 3,
      nome: "Tirante Bordado",
      preco: "R$ 15,00",
      img: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400",
    },
  ];

  const proximosEventos = [
    {
      id: 1,
      titulo: "Intermed 2026",
      imagem:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      tipo: "OPEN BAR",
      cor: "bg-purple-600",
    },
    {
      id: 2,
      titulo: "Tubarões vs Engenharia",
      imagem:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
      tipo: "FINAL",
      cor: "bg-orange-600",
    },
  ];

  const postsComunidade = [
    {
      id: 1,
      user: "Fernando Abbade",
      handle: "@abbade",
      avatar: "https://github.com/shadcn.png",
      content:
        "Alguém sabe se o treino de futsal hoje vai ser no Ginásio Municipal ou na Arena? 🦈⚽",
      likes: 12,
      comments: 4,
    },
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans relative selection:bg-emerald-500/30">
      {/* HEADER (Sempre ativo para permitir o Login) */}
      <header className="glass p-4 sticky top-0 z-40 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
        <Link
          href={isGuest ? "/login" : "/perfil"}
          className="flex items-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full border-2 border-[#0a2e23] relative overflow-hidden group-active:scale-95 transition shadow-lg">
            <img
              src={activeUser.foto}
              className="w-full h-full object-cover"
              alt="Perfil"
            />
            {!isGuest && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"></div>
            )}
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white group-hover:text-emerald-400 transition">
              Olá, {activeUser.nome.split(" ")[0]}!
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              {isGuest ? "Modo Visitante" : `Sócio ${activeUser.turma}`}
            </p>
          </div>
        </Link>

        {isGuest ? (
          <button
            onClick={() => router.push("/login")}
            className="bg-emerald-600 px-4 py-2 rounded-full text-xs font-black flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            <LogIn size={16} /> ENTRAR
          </button>
        ) : (
          <button className="p-2 bg-zinc-900/50 rounded-full text-white relative hover:bg-zinc-800 transition">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}
      </header>

      {/* OVERLAY DE BLOQUEIO PARA VISITANTES */}
      {isGuest && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-6 bg-black/20 pointer-events-none">
          <div className="bg-zinc-900/95 border border-emerald-500/30 p-8 rounded-[2.5rem] text-center pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md max-w-sm w-full">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/50 shadow-inner">
              <Lock size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-3 text-white tracking-tighter">
              Área Restrita
            </h2>
            <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-medium">
              O cardume está esperando por você! Faça login para desbloquear a
              Arena Games, Gym Rats e sua Carteirinha.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-2xl uppercase tracking-tighter hover:bg-emerald-400 transition shadow-[0_0_25px_rgba(16,185,129,0.3)] active:scale-95"
            >
              Começar Agora
            </button>
          </div>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL (BLOQUEÁVEL) */}
      <main className={`p-4 space-y-8 ${guestBlockClass}`}>
        {/* PARCEIROS */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Parceiros Oficiais
            </h2>
            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">
              Ver Clube
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {parceirosOficiais.map((parceiro) => (
              <div
                key={parceiro.id}
                className="min-w-[80px] h-12 glass rounded-xl border border-white/5 flex items-center justify-center grayscale"
              >
                <span className="text-[9px] font-black text-zinc-400 tracking-tighter uppercase px-2 text-center">
                  {parceiro.nome}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* STATUS */}
        <section className="glass p-5 rounded-3xl border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
              Status do Avatar
            </h2>
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-400">
              <Star size={10} fill="currentColor" /> LVL {activeUser.level}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5 text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-500">
                XP
              </span>
              <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: "62%" }}
                ></div>
              </div>
            </div>
            <div className="space-y-1.5 text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-500">
                HP
              </span>
              <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-red-500"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <div className="space-y-1.5 text-center">
              <span className="text-[9px] uppercase font-bold text-zinc-500">
                Energy
              </span>
              <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* ATALHOS */}
        <section className="grid grid-cols-2 gap-3">
          <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-emerald-500 text-black rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
              <Gamepad2 size={20} />
            </div>
            <div>
              <span className="font-bold text-white text-md tracking-tight">
                Arena Tubarão
              </span>
              <p className="text-[10px] text-emerald-400 uppercase font-black">
                Lutar Agora
              </p>
            </div>
          </div>
          <div className="glass p-4 rounded-2xl border border-white/5 flex flex-col items-start gap-3">
            <div className="w-10 h-10 bg-zinc-800 text-emerald-500 rounded-xl flex items-center justify-center border border-zinc-700">
              <Dumbbell size={20} />
            </div>
            <div>
              <span className="font-bold text-white text-md tracking-tight">
                Gym Rats
              </span>
              <p className="text-[10px] text-zinc-500 uppercase font-bold">
                +XP Força
              </p>
            </div>
          </div>
        </section>

        {/* CARTEIRINHA */}
        <div className="block relative group overflow-hidden rounded-[2rem] border border-emerald-900/30 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 to-black z-10 opacity-90"></div>
          <img
            src={
              !isGuest
                ? `/turma${activeUser.turma.replace(/\D/g, "")}.jpeg`
                : "/turma5.jpeg"
            }
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
            alt="Turma"
          />
          <div className="relative z-20 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                Minha Carteirinha
              </h3>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                Acesso & Benefícios
              </p>
            </div>
            <CreditCard size={32} className="text-white/20 rotate-12" />
          </div>
        </div>

        {/* LOJA */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-black uppercase italic tracking-tighter underline decoration-emerald-500 decoration-4 underline-offset-4">
              Loja K.N.
            </h2>
            <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">
              Ver Catálogo
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {itensLoja.map((item) => (
              <div
                key={item.id}
                className="min-w-[160px] glass border border-white/5 rounded-2xl overflow-hidden p-3 transition"
              >
                <div className="h-32 bg-black/50 rounded-xl mb-3 overflow-hidden relative">
                  <img
                    src={item.img}
                    className="w-full h-full object-cover"
                    alt={item.nome}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                    {item.preco}
                  </div>
                </div>
                <h3 className="text-[11px] font-bold uppercase text-zinc-300 leading-tight">
                  {item.nome}
                </h3>
              </div>
            ))}
          </div>
        </section>

        {/* EVENTOS */}
        <section>
          <h2 className="text-xl font-black uppercase italic tracking-tighter mb-4">
            Próximos Rolês
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {proximosEventos.map((evento) => (
              <div
                key={evento.id}
                className="min-w-[280px] snap-center block glass rounded-3xl overflow-hidden border border-white/5 relative group transition"
              >
                <div className="h-40 relative">
                  <img
                    src={evento.imagem}
                    className="w-full h-full object-cover opacity-80"
                    alt={evento.titulo}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent"></div>
                  <div
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${evento.cor} shadow-lg`}
                  >
                    {evento.tipo}
                  </div>
                </div>
                <div className="p-4 relative -mt-4">
                  <h3 className="text-lg font-black text-white uppercase truncate mb-3">
                    {evento.titulo}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* COMUNIDADE */}
        <section className="glass rounded-[2rem] p-6 border border-white/5">
          <h2 className="text-xl font-black uppercase italic tracking-tighter mb-6 px-1">
            Comunidade
          </h2>
          {postsComunidade.map((post) => (
            <div key={post.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  className="w-10 h-10 rounded-full border border-emerald-500/30"
                  alt="User"
                />
                <div>
                  <h4 className="text-sm font-bold">{post.user}</h4>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-wider">
                    {post.handle}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium italic">
                "{post.content}"
              </p>
              <div className="flex items-center gap-6 pt-4 border-t border-white/5 mt-2 text-zinc-500">
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Heart size={18} /> {post.likes}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <MessageSquare size={18} /> {post.comments}
                </div>
                <Flag size={16} className="ml-auto" />
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
