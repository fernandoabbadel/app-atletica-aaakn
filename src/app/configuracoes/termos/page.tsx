"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Scale, Cookie, Lock, FileText, CheckCircle } from "lucide-react";
import { db } from "../../../lib/firebase";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";

// --- TIPAGEM ---
type DocTipo = "publico" | "interno";

type TermDoc = {
  id: string;
  title: string;
  content: string;
  icon: React.ElementType;
  tipo: DocTipo;
};

// Mapa de ícones permitidos para evitar erros de renderização
const ICONS: Record<string, React.ElementType> = {
  Lock, Scale, Cookie, Shield, FileText
};

// Helpers de segurança para dados
function safeStr(v: any, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function clampStr(s: string, max: number) {
  const t = String(s ?? "");
  return t.length > max ? t.slice(0, max) : t;
}

export default function TermosLegaisPage() {
  const [docs, setDocs] = useState<TermDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // 🦈 BUSCA DADOS NO FIREBASE (Blindado contra Loops)
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        // Query segura com limite para evitar sobrecarga
        const q = query(
            collection(db, "legal_docs"), 
            orderBy("titulo", "asc"), 
            limit(50)
        );
        
        const snap = await getDocs(q);

        const list: TermDoc[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          const tipo = safeStr(data.tipo, "publico") as DocTipo;
          
          // Filtro de segurança (apenas docs públicos neste app)
          if (tipo !== "publico") return;

          const title = clampStr(safeStr(data.titulo, "Sem título"), 120);
          const content = clampStr(safeStr(data.conteudo, ""), 80000);
          
          // Mapeia string do banco para componente de ícone real
          const iconName = safeStr(data.iconName, "FileText");
          const IconComp = ICONS[iconName] || FileText;

          list.push({
            id: d.id,
            title,
            content,
            icon: IconComp,
            tipo,
          });
        });

        if (!alive) return;

        setDocs(list);
        
        // Define o primeiro documento como ativo se nenhum estiver selecionado
        if (list.length > 0) {
             setActiveDocId((prev) => {
                 // Se já tem um selecionado que existe na lista, mantém. Se não, pega o primeiro.
                 const exists = list.find(d => d.id === prev);
                 return exists ? prev : list[0].id;
             });
        }

      } catch (error) {
        console.error("Erro ao carregar termos:", error);
        if (!alive) return;
        setDocs([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []); // 🦈 ATENÇÃO: Dependência vazia [] para rodar apenas 1 vez (Anti-Loop)

  // Seleciona o documento ativo na memória (sem nova requisição)
  const activeDoc = useMemo(() => docs.find((d) => d.id === activeDocId), [docs, activeDocId]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500 flex flex-col">
      
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-800 flex items-center gap-4">
        <Link href="/configuracoes" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-black uppercase tracking-tight">Jurídico</h1>
      </header>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="sticky top-[73px] z-20 bg-[#050505] border-b border-zinc-800 px-4 py-3 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 min-w-max">
          {docs.map((docx) => {
             const Icon = docx.icon;
             return (
                <button
                  key={docx.id}
                  onClick={() => setActiveDocId(docx.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition border ${
                    activeDocId === docx.id
                      ? "bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  <Icon size={14} />
                  {docx.title}
                </button>
             );
          })}
        </div>
      </div>

      {/* CONTEÚDO DO DOCUMENTO */}
      <main className="flex-1 p-4 pb-24 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
        {loading && (
          <div className="text-xs text-zinc-500 flex items-center gap-2 animate-pulse">
            <Shield size={14} /> Carregando documentos jurídicos...
          </div>
        )}

        {!loading && docs.length === 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-zinc-400 text-sm text-center">
            <Lock size={32} className="mx-auto mb-3 opacity-20"/>
            Nenhum documento público disponível no momento.
          </div>
        )}

        {activeDoc && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                <activeDoc.icon size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase leading-none">{activeDoc.title}</h2>
                <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Fonte: App AAAKN (Oficial)</p>
              </div>
            </div>

            <div className="prose prose-invert prose-sm max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {activeDoc.content}
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2 text-zinc-500 text-xs font-medium opacity-60">
              <CheckCircle size={14} /> Você leu até o fim
            </div>
          </div>
        )}
      </main>
    </div>
  );
}