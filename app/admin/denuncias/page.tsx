"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/context/ToastContext";

// Dados Mockados
const DENUNCIAS_INICIAIS = [
  {
    id: 1,
    tipo: "Comunidade",
    autor: "@joao.v",
    motivo: "Discurso de ódio",
    conteudo: "Comentário ofensivo no post...",
    data: "10/10/2026",
    status: "pendente",
  },
  {
    id: 2,
    tipo: "Gym Rats",
    autor: "@pedro.gym",
    motivo: "Foto imprópria",
    conteudo: "Foto sem camisa no espelho...",
    data: "11/10/2026",
    status: "pendente",
  },
  {
    id: 3,
    tipo: "Sugestão",
    autor: "@maria.med",
    motivo: "Spam",
    conteudo: "Venda de ingressos falsos...",
    data: "12/10/2026",
    status: "arquivado",
  },
];

export default function AdminDenunciasPage() {
  const { addToast } = useToast();
  const [denuncias, setDenuncias] = useState(DENUNCIAS_INICIAIS);
  const [filtro, setFiltro] = useState<"pendente" | "arquivado">("pendente");

  const handleArquivar = (id: number) => {
    // Não deleta, apenas muda o status para 'arquivado' (Soft Delete)
    setDenuncias((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "arquivado" } : d))
    );
    addToast("Denúncia arquivada com sucesso.", "success");
  };

  const listaFiltrada = denuncias.filter((d) => d.status === filtro);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex items-center gap-3">
        <Link
          href="/admin"
          className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"
        >
          <ArrowLeft size={20} className="text-zinc-400" />
        </Link>
        <h1 className="text-lg font-black text-white uppercase tracking-tighter">
          Central de Denúncias
        </h1>
      </header>

      <main className="p-6 space-y-6">
        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro("pendente")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
              filtro === "pendente"
                ? "bg-red-500/20 text-red-500 border border-red-500/50"
                : "bg-zinc-900 text-zinc-500"
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setFiltro("arquivado")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition ${
              filtro === "arquivado"
                ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/50"
                : "bg-zinc-900 text-zinc-500"
            }`}
          >
            Resolvidos
          </button>
        </div>

        <div className="space-y-3">
          {listaFiltrada.length === 0 ? (
            <p className="text-zinc-500 text-sm text-center py-10">
              Nenhuma denúncia encontrada.
            </p>
          ) : (
            listaFiltrada.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                      item.tipo === "Comunidade"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    {item.tipo}
                  </span>
                  <span className="text-[10px] text-zinc-500">{item.data}</span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-500" />{" "}
                    {item.motivo}
                  </h3>
                  <p className="text-zinc-400 text-xs mt-1">
                    Autor: <span className="text-zinc-200">{item.autor}</span>
                  </p>
                  <p className="text-zinc-500 text-xs mt-2 italic bg-black/30 p-2 rounded border border-white/5">
                    "{item.conteudo}"
                  </p>
                </div>

                {item.status === "pendente" && (
                  <div className="flex gap-2 mt-2 pt-3 border-t border-white/5">
                    <button className="flex-1 bg-zinc-800 text-zinc-300 py-2 rounded-lg text-xs font-bold uppercase hover:bg-zinc-700 flex items-center justify-center gap-2">
                      <Eye size={14} /> Ver Conteúdo
                    </button>
                    <button
                      onClick={() => handleArquivar(item.id)}
                      className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-emerald-500 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={14} /> Resolver
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
