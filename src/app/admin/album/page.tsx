"use client";

import Link from "next/link";
import { ArrowLeft, Medal, ShieldCheck, Trophy } from "lucide-react";

const menuItems = [
  {
    href: "/admin/album/caca_calouro",
    title: "Caca Calouro",
    description: "Predadores de bixos T8",
    icon: ShieldCheck,
    color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  },
  {
    href: "/admin/album/pontua_calouro",
    title: "Pontua Calouro",
    description: "Ranking interno dos calouros",
    icon: Medal,
    color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    href: "/admin/album/pontua_geral",
    title: "Pontua Geral",
    description: "Top geral de capturas",
    icon: Trophy,
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
] as const;

export default function AdminAlbumMenuPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <header className="sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800 px-6 py-5">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="p-2 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800">
            <ArrowLeft size={18} className="text-zinc-300" />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Admin Album</h1>
            <p className="text-[11px] text-zinc-500 font-bold">Rotas separadas para reduzir leitura por tela</p>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${item.color}`}>
                  <Icon size={18} />
                </div>
                <h2 className="mt-4 text-sm font-black uppercase">{item.title}</h2>
                <p className="mt-2 text-xs text-zinc-400">{item.description}</p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
