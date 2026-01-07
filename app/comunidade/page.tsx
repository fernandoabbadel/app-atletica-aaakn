"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Search,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Plus,
  Flame,
  Image as ImageIcon,
  ShieldCheck,
  Pin,
} from "lucide-react";
import Link from "next/link";

export default function ComunidadePage() {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const toggleLike = (id: number) => {
    if (likedPosts.includes(id)) {
      setLikedPosts(likedPosts.filter((p) => p !== id));
    } else {
      setLikedPosts([...likedPosts, id]);
    }
  };

  // --- STORIES ---
  const stories = [
    { id: 0, user: "Novo", img: "", isAdd: true },
    {
      id: 1,
      user: "Diretoria",
      img: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=200&q=80",
      active: true,
    },
    {
      id: 2,
      user: "Bateria",
      img: "https://images.unsplash.com/photo-1519861531473-920026393112?w=200&q=80",
      active: true,
    },
    {
      id: 3,
      user: "Cheer",
      img: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?w=200&q=80",
      active: true,
    },
    {
      id: 4,
      user: "Natação",
      img: "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=200&q=80",
      active: false,
    },
  ];

  // --- POSTS ---
  const posts = [
    {
      id: 1,
      user: "Diretoria AAAKN",
      handle: "@diretoria",
      avatar: "/logo.png", // Seu logo
      tempo: "Fixado",
      texto:
        "🚨 **PLANTÃO DO TUBARÃO** 🚨\n\nGalera, os kits do Intermed começam a ser entregues AMANHÃ no pátio central das 12h às 14h.\n\nNão esqueçam a carteirinha digital para retirar!",
      imagem: null,
      likes: 342,
      comentarios: 56,
      verificado: true,
      fixado: true,
    },
    {
      id: 2,
      user: "Pedro Residente",
      handle: "@pedro_med",
      avatar: "https://i.pravatar.cc/150?u=pedro",
      tempo: "2h",
      texto:
        "Aquele treino pós-plantão pra desestressar. Quem anima pagar umas flexões? 🦈💪 #GymRats",
      imagem:
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
      likes: 89,
      comentarios: 12,
      verificado: false,
      fixado: false,
    },
    {
      id: 3,
      user: "Luiza T6",
      handle: "@luiza_t6",
      avatar: "https://i.pravatar.cc/150?u=luiza",
      tempo: "4h",
      texto:
        "Alguém achou um estetoscópio Littmann vinho na sala 4? 🤡 Perdi minha vida lá.",
      imagem: null,
      likes: 15,
      comentarios: 8,
      verificado: false,
      fixado: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-900 flex justify-between items-center">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">Resenha Tubarão</h1>
        <button className="p-2 -mr-2 text-zinc-400 hover:text-white">
          <Search size={24} />
        </button>
      </header>

      <main>
        {/* STORIES */}
        <section className="pt-4 pb-2 border-b border-zinc-900">
          <div className="flex gap-4 overflow-x-auto px-4 scrollbar-hide">
            {stories.map((story) => (
              <div
                key={story.id}
                className="flex flex-col items-center gap-1 min-w-[64px] cursor-pointer group"
              >
                {story.isAdd ? (
                  <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border-2 border-dashed border-zinc-700 group-hover:border-emerald-500 transition relative">
                    <Plus size={24} className="text-emerald-500" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#050505] flex items-center justify-center">
                      <Plus size={12} className="text-black stroke-[3]" />
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-16 h-16 rounded-full p-[2px] ${
                      story.active
                        ? "bg-gradient-to-tr from-emerald-500 to-cyan-500"
                        : "bg-zinc-800"
                    }`}
                  >
                    <div className="w-full h-full rounded-full border-2 border-[#050505] overflow-hidden">
                      <img
                        src={story.img}
                        className="w-full h-full object-cover hover:scale-110 transition"
                      />
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-zinc-400 truncate w-16 text-center font-medium">
                  {story.user}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* FEED */}
        <div className="flex flex-col">
          {/* Caixa de Postar */}
          <div className="p-4 flex gap-3 border-b border-zinc-900/50 bg-[#0a0a0a]">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
              <img
                src="https://github.com/shadcn.png"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="No que você está pensando?"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none h-10"
              />
              <div className="flex justify-between items-center mt-2">
                <button className="text-emerald-500 hover:text-emerald-400 transition p-2 hover:bg-emerald-500/10 rounded-full">
                  <ImageIcon size={18} />
                </button>
                <button className="bg-emerald-600 text-black text-xs font-bold px-4 py-1.5 rounded-full hover:bg-emerald-500 transition">
                  Publicar
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Posts */}
          {posts.map((post) => (
            <div
              key={post.id}
              className="border-b border-zinc-900 pb-2 last:border-0 hover:bg-zinc-900/20 transition duration-300"
            >
              {/* Aviso de Fixado */}
              {post.fixado && (
                <div className="px-12 pt-3 flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <Pin size={10} className="fill-zinc-500" /> Fixado pela
                  Diretoria
                </div>
              )}

              <div className="p-4 flex gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                  <img
                    src={post.avatar}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  {/* Header do Post */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <h3 className="font-bold text-sm text-white">
                          {post.user}
                        </h3>
                        {post.verificado && (
                          <ShieldCheck
                            size={14}
                            className="text-emerald-500 fill-emerald-500/20"
                          />
                        )}
                        <span className="text-zinc-500 text-xs font-normal">
                          {post.handle} · {post.tempo}
                        </span>
                      </div>
                    </div>
                    <button className="text-zinc-500 hover:text-white">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>

                  {/* Texto */}
                  <p className="text-sm text-zinc-200 mt-1 whitespace-pre-line leading-relaxed">
                    {post.texto}
                  </p>

                  {/* Imagem (Se houver) */}
                  {post.imagem && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-zinc-800 relative group">
                      <img
                        src={post.imagem}
                        className="w-full object-cover max-h-80"
                      />
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex items-center justify-between mt-4 pr-4">
                    <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-emerald-400 transition group">
                      <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                        <MessageCircle size={16} />
                      </div>
                      {post.comentarios}
                    </button>

                    <button
                      onClick={() => toggleLike(post.id)}
                      className={`flex items-center gap-2 text-xs transition group ${
                        likedPosts.includes(post.id)
                          ? "text-red-500"
                          : "text-zinc-500 hover:text-red-500"
                      }`}
                    >
                      <div
                        className={`p-1.5 rounded-full group-hover:bg-red-500/10`}
                      >
                        <Heart
                          size={16}
                          className={
                            likedPosts.includes(post.id) ? "fill-red-500" : ""
                          }
                        />
                      </div>
                      {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                    </button>

                    <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-orange-500 transition group">
                      <div className="p-1.5 rounded-full group-hover:bg-orange-500/10">
                        <Flame size={16} />
                      </div>
                    </button>

                    <button className="flex items-center gap-2 text-xs text-zinc-500 hover:text-emerald-400 transition group">
                      <div className="p-1.5 rounded-full group-hover:bg-emerald-500/10">
                        <Share2 size={16} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FAB (Botão Flutuante) */}
      <button className="fixed bottom-24 right-4 bg-emerald-500 text-black p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-110 transition active:scale-95 z-30 group">
        <Plus
          size={24}
          strokeWidth={3}
          className="group-hover:rotate-90 transition duration-300"
        />
      </button>
    </div>
  );
}
