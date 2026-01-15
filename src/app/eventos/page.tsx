"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, Filter, Music, Trophy, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { EventCard } from "../components/events/EventCard";

export default function EventosPage() {
  const [filtro, setFiltro] = useState<"todos" | "festas" | "esportes">("todos");
  const [eventos, setEventos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🦈 LISTENER REAL
  useEffect(() => {
      const q = query(collection(db, "eventos"), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const lista = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              stats: doc.data().stats || { confirmados: 0, talvez: 0, likes: 0 }, // Garantia
              lotes: doc.data().lotes || []
          }));
          setEventos(lista);
          setLoading(false);
      });
      return () => unsubscribe();
  }, []);

  const eventosFiltrados = filtro === "todos" ? eventos : eventos.filter((e) => (e.tipo || "").toLowerCase() === (filtro === "festas" ? "festa" : "esporte"));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      
      <header className="fixed top-0 left-0 w-full z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="p-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-white/10 group"><ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" /></Link>
            <h1 className="font-bold text-lg tracking-tight text-white uppercase italic">Agenda do Tubarão 🦈</h1>
          </div>
          <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"><Filter size={20} /></button>
        </div>
      </header>

      <div className="h-20"></div>

      <main className="p-4 space-y-8 max-w-2xl mx-auto">
        {/* BANNER DE DESTAQUE */}
        <div className="relative h-40 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent flex flex-col justify-center px-6">
                <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">Próximo Rolê</span>
                <h2 className="text-2xl font-black text-white w-2/3 leading-tight uppercase italic">A Maior Integração do Ano</h2>
            </div>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
          <FilterButton label="Todos" active={filtro === "todos"} onClick={() => setFiltro("todos")} />
          <FilterButton label="Festas" icon={<Music size={12} />} active={filtro === "festas"} onClick={() => setFiltro("festas")} color="purple" />
          <FilterButton label="Esportes" icon={<Trophy size={12} />} active={filtro === "esportes"} onClick={() => setFiltro("esportes")} color="orange" />
        </div>

        <div className="space-y-8">
          {loading ? <div className="text-center py-20 text-zinc-500 animate-pulse">Carregando agenda...</div> : 
           eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((evento) => (
              <Link href={`/eventos/${evento.id}`} key={evento.id} className="block group">
                <EventCard evento={evento} />
              </Link>
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500"><p>Nenhum evento encontrado.</p></div>
          )}
        </div>

        <div className="h-10 text-center"><p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">Fim da Agenda</p></div>
      </main>
    </div>
  );
}

function FilterButton({ label, icon, active, onClick, color = "emerald" }: any) {
  const activeClasses: any = { purple: "bg-purple-600 text-white border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]", orange: "bg-orange-600 text-white border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]", emerald: "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]" };
  return (
    <button onClick={onClick} className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2 ${active ? `${activeClasses[color]} scale-105` : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700"}`}>{icon} {label}</button>
  );
}