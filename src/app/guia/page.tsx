"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bus,
  Map,
  Phone,
  ExternalLink,
  Landmark,
  GraduationCap,
  BookOpen,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

// Definição das Categorias para Mapeamento
const CATEGORIAS_CONFIG: any = {
  academico: { label: "Acadêmico", icon: <GraduationCap size={18} />, color: "text-emerald-500" },
  transporte: { label: "Transporte", icon: <Bus size={18} />, color: "text-orange-500" },
  turismo: { label: "Turismo", icon: <Landmark size={18} />, color: "text-blue-500" },
  emergencia: { label: "Emergência", icon: <Phone size={18} />, color: "text-red-500" },
};

export default function GuiaPage() {
  const [guiaData, setGuiaData] = useState<any>({
    academico: [],
    transporte: [],
    turismo: [],
    emergencia: []
  });
  const [loading, setLoading] = useState(true);

  // 1. Buscar Dados em Tempo Real
  useEffect(() => {
    const q = query(collection(db, "guia_data"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newData = { academico: [], transporte: [], turismo: [], emergencia: [] } as any;
      
      snapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as any;
        if (newData[item.categoria]) {
          newData[item.categoria].push(item);
        }
      });

      setGuiaData(newData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-emerald-500 gap-4">
        <Loader2 className="animate-spin" size={48} />
        <p className="text-xs font-black uppercase tracking-widest animate-pulse">Carregando o Manual...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      <header className="p-4 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-lg uppercase tracking-wide flex items-center gap-2">
          <BookOpen size={20} className="text-emerald-500" /> Guia do Bixo
        </h1>
      </header>

      <main className="p-4 space-y-8">
        
        {/* ACADÊMICO */}
        {guiaData.academico.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${CATEGORIAS_CONFIG.academico.color}`}>
              {CATEGORIAS_CONFIG.academico.icon} {CATEGORIAS_CONFIG.academico.label}
            </h2>
            <div className="grid gap-3 grid-cols-1">
              {guiaData.academico.map((item: any) => (
                <LinkButton key={item.id} texto={item.titulo} url={item.url} />
              ))}
            </div>
          </section>
        )}

        {/* TRANSPORTE */}
        {guiaData.transporte.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${CATEGORIAS_CONFIG.transporte.color}`}>
              {CATEGORIAS_CONFIG.transporte.icon} {CATEGORIAS_CONFIG.transporte.label}
            </h2>
            <div className="grid gap-3 grid-cols-1">
              {guiaData.transporte.map((item: any) => (
                <div key={item.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 space-y-3 hover:border-zinc-700 transition">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                    <span className="font-bold text-white">{item.nome}</span>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500">
                      Horários
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 font-mono bg-black/30 p-2 rounded border border-zinc-800">{item.horario}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{item.detalhe}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TURISMO */}
        {guiaData.turismo.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${CATEGORIAS_CONFIG.turismo.color}`}>
              {CATEGORIAS_CONFIG.turismo.icon} {CATEGORIAS_CONFIG.turismo.label}
            </h2>
            <div className="grid gap-3 grid-cols-2">
              {guiaData.turismo.map((item: any) => (
                <CardTurismo key={item.id} nome={item.nome} desc={item.descricao} img={item.foto} />
              ))}
            </div>
          </section>
        )}

        {/* EMERGÊNCIA */}
        {guiaData.emergencia.length > 0 && (
          <section>
            <h2 className={`text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${CATEGORIAS_CONFIG.emergencia.color}`}>
              {CATEGORIAS_CONFIG.emergencia.icon} {CATEGORIAS_CONFIG.emergencia.label}
            </h2>
            <div className="grid gap-3 grid-cols-2">
              {guiaData.emergencia.map((item: any) => (
                <div key={item.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl text-center hover:bg-zinc-900 transition cursor-pointer">
                  <span className={`block font-black text-2xl mb-1 ${item.cor === 'red' ? 'text-red-500' : 'text-zinc-400'}`}>
                    {item.numero}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                    {item.nome}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

// Componentes Auxiliares
function LinkButton({ texto, url }: { texto: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex justify-between items-center bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 transition rounded-xl p-4 group"
    >
      <span className="font-bold text-white group-hover:text-emerald-400 transition">{texto}</span>
      <ExternalLink size={18} className="text-zinc-600 group-hover:text-emerald-500 transition" />
    </a>
  );
}

function CardTurismo({ nome, desc, img }: { nome: string; desc: string; img: string }) {
  return (
    <div className="relative h-32 rounded-xl overflow-hidden group cursor-pointer border border-zinc-800 hover:border-emerald-500/50 transition">
      <img
        src={img || "https://via.placeholder.com/150"}
        className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition duration-700"
        alt={nome}
        onError={(e) => e.currentTarget.src = "https://via.placeholder.com/150?text=Sem+Foto"}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      <div className="absolute bottom-3 left-3 right-3">
        <span className="block text-white font-bold text-sm mb-0.5 group-hover:text-emerald-400 transition">{nome}</span>
        <span className="block text-zinc-400 text-[10px] font-medium truncate">{desc}</span>
      </div>
    </div>
  );
}