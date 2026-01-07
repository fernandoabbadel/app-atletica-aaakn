"use client";

import React from "react";
import {
  Home,
  Calendar,
  Dumbbell,
  Users,
  CreditCard,
  Bell,
  Menu,
  Search,
  MapPin,
  Gamepad2,
  Zap,
  Star,
  Trophy,
  ShoppingBag,
  MessageSquare,
  Heart,
  MoreHorizontal,
  Flag,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const userTurmaImage = "/turma5.jpeg";

  // Dados dos parceiros (Devem ser os mesmos da sua ParceirosPage para manter consistência)
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

  const proximosEventos = [
    {
      id: 1,
      titulo: "Intermed 2026",
      data: "12 OUT",
      local: "Arena XP",
      tipo: "OPEN BAR",
      cor: "bg-purple-600",
      imagem:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      lote: "Lote 2",
      preco: "R$ 85,00",
      vendidos: 178,
      total: 300,
    },
    {
      id: 2,
      titulo: "Tubarões vs Engenharia",
      data: "20 JAN",
      local: "Ginásio Municipal",
      tipo: "FINAL",
      cor: "bg-orange-600",
      imagem:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
      lote: "Entrada Franca",
      preco: "GRÁTIS",
      vendidos: 450,
      total: 500,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32 font-sans selection:bg-emerald-500/30">
      <header className="bg-black/90 backdrop-blur-md p-4 sticky top-0 z-20 flex justify-between items-center border-b border-zinc-900">
        <Link href="/perfil" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-[#0a2e23] relative overflow-hidden group-active:scale-95 transition">
            <img
              src="https://github.com/shadcn.png"
              className="w-full h-full object-cover"
              alt="Perfil"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"></div>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight text-white group-hover:text-emerald-400 transition">
              Olá, Tubarão!
            </h1>
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span>
              Sócio Ativo • T5
            </span>
          </div>
        </Link>
        <div className="flex gap-2">
          <button className="p-2 bg-zinc-900 rounded-full text-white relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
        </div>
      </header>

      <main className="p-4 space-y-8">
        {/* SEÇÃO PARCEIROS COM LINKS FUNCIONAIS */}
        <section>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              Parceiros Oficiais
            </h2>
            <Link
              href="/parceiros"
              className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter"
            >
              Ver Clube
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {parceirosOficiais.map((parceiro) => (
              <Link
                key={parceiro.id}
                href={`/parceiros/${parceiro.id}`}
                className="min-w-[80px] h-12 bg-zinc-900/50 rounded-lg border border-zinc-800 flex items-center justify-center grayscale hover:grayscale-0 hover:border-emerald-500/50 transition cursor-pointer"
              >
                <span className="text-[9px] font-black text-zinc-600 tracking-tighter uppercase px-2 text-center">
                  {parceiro.nome}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* STATUS DO HERÓI */}
        <section className="bg-gradient-to-r from-zinc-900 to-black p-4 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">
              Status do Avatar
            </h2>
            <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">
              <Star size={10} fill="currentColor" /> LVL 7
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-500">
                <span>XP</span>
                <span>62%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500"
                  style={{ width: "62%" }}
                ></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-500">
                <span>HP</span>
                <span>140</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] uppercase font-bold text-zinc-500">
                <span>Energia</span>
                <span>5/5</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* ATALHOS PRINCIPAIS */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href="/games"
            className="bg-gradient-to-br from-[#1a3a2a] to-black p-4 rounded-2xl border border-emerald-900/50 flex flex-col items-start gap-3 hover:scale-[1.02] transition shadow-lg group"
          >
            <div className="w-10 h-10 bg-emerald-500 text-black rounded-full flex items-center justify-center group-hover:rotate-12 transition">
              <Gamepad2 size={20} />
            </div>
            <div>
              <span className="font-bold text-white text-md tracking-tight">
                Arena Tubarão
              </span>
              <p className="text-[10px] text-emerald-200/70 uppercase font-black">
                Lutar Agora
              </p>
            </div>
          </Link>
          <Link
            href="/gym"
            className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex flex-col items-start gap-3 hover:scale-[1.02] transition"
          >
            <div className="w-10 h-10 bg-zinc-800 text-emerald-500 rounded-full flex items-center justify-center">
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
          </Link>
        </section>

        {/* CARTEIRINHA */}
        <Link
          href="/carteirinha"
          className="block relative group overflow-hidden rounded-[2rem] border border-emerald-900/30"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-black/90 z-10"></div>
          <img
            src={userTurmaImage}
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
            alt="Turma"
          />
          <div className="relative z-20 p-6 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                Minha Carteirinha
              </h3>
              <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest">
                Acesso & Benefícios Sócio
              </p>
            </div>
            <CreditCard
              size={32}
              className="text-white/20 group-hover:text-emerald-400 transition-colors"
            />
          </div>
        </Link>

        {/* LOJA */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-black uppercase italic tracking-tighter underline decoration-emerald-500 decoration-4 underline-offset-4">
              Loja K.N.
            </h2>
            <Link
              href="/loja"
              className="text-[10px] text-emerald-500 font-black uppercase tracking-widest"
            >
              Ver Catálogo
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {itensLoja.map((item) => (
              <Link
                key={item.id}
                href="/loja"
                className="min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-3 group"
              >
                <div className="h-32 bg-zinc-800 rounded-xl mb-3 overflow-hidden relative">
                  <img
                    src={item.img}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    alt={item.nome}
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-emerald-400">
                    {item.preco}
                  </div>
                </div>
                <h3 className="text-[11px] font-bold uppercase text-zinc-300 leading-tight">
                  {item.nome}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        {/* EVENTOS */}
        <section>
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              Próximos Rolês
            </h2>
            <Link
              href="/eventos"
              className="text-[10px] text-emerald-500 font-black uppercase tracking-widest"
            >
              Ver Tudo
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
            {proximosEventos.map((evento) => (
              <Link
                key={evento.id}
                href="/eventos"
                className="min-w-[280px] snap-center block bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 relative group transition shadow-lg"
              >
                <div className="h-40 relative">
                  <img
                    src={evento.imagem}
                    className="w-full h-full object-cover opacity-80"
                    alt={evento.titulo}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                  <div
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-black uppercase text-white ${evento.cor}`}
                  >
                    {evento.tipo}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-black text-white uppercase truncate mb-3">
                    {evento.titulo}
                  </h3>
                  <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* COMUNIDADE */}
        <section className="bg-zinc-900/30 rounded-[2rem] p-6 border border-zinc-800/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase italic tracking-tighter">
              Comunidade
            </h2>
            <Link
              href="/comunidade"
              className="p-2 bg-zinc-800 rounded-lg text-emerald-500"
            >
              <MessageSquare size={18} />
            </Link>
          </div>
          {postsComunidade.map((post) => (
            <div key={post.id} className="space-y-4">
              <div className="flex justify-between items-start">
                <Link
                  href="/perfil/abbade"
                  className="flex items-center gap-3 group"
                >
                  <img
                    src={post.avatar}
                    className="w-10 h-10 rounded-full border border-emerald-500/30 group-hover:border-emerald-500 transition"
                    alt="User"
                  />
                  <div>
                    <h4 className="text-sm font-bold group-hover:text-emerald-400 transition">
                      {post.user}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-bold">
                      {post.handle}
                    </span>
                  </div>
                </Link>
                <button className="text-zinc-600">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                {post.content}
              </p>
              <div className="flex items-center gap-6 pt-2">
                <button className="flex items-center gap-1.5 text-zinc-500 hover:text-red-500 transition group">
                  <Heart
                    size={18}
                    className="group-active:scale-125 transition"
                  />
                  <span className="text-xs font-bold">{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5 text-zinc-500 hover:text-emerald-400 transition">
                  <MessageSquare size={18} />
                  <span className="text-xs font-bold">{post.comments}</span>
                </button>
                <button
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-orange-500 transition ml-auto"
                  title="Denunciar"
                >
                  <Flag size={16} />
                </button>
              </div>
            </div>
          ))}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-lg border-t border-zinc-900 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20">
        <NavItem icon={<Home size={22} />} label="Início" active />
        <Link href="/eventos">
          <NavItem icon={<Calendar size={22} />} label="Eventos" />
        </Link>
        <div className="-mt-8">
          <Link
            href="/games"
            className="bg-[#1a3a2a] p-4 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.4)] text-[#4ade80] border-4 border-[#050505] hover:scale-110 transition flex items-center justify-center"
          >
            <Gamepad2 size={26} />
          </Link>
        </div>
        <Link href="/ranking">
          <NavItem icon={<Trophy size={22} />} label="Ranking" />
        </Link>
        <Link href="/menu">
          <NavItem icon={<Menu size={22} />} label="Mais" />
        </Link>
      </nav>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1 ${
        active
          ? "text-[#4ade80]"
          : "text-zinc-600 hover:text-zinc-400 transition"
      }`}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-tight">
        {label}
      </span>
    </button>
  );
}
