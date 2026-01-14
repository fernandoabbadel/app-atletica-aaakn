"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Trophy,
  Users,
  Check,
  Plus,
  Download,
  ShieldAlert,
  Share2,
  Heart,
  CheckCircle,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/src/context/AuthContext";
import { useToast } from "@/src/context/ToastContext";

// --- DADOS MOCKADOS ---
const TREINOS_DATA = [
  {
    id: 1,
    esporte: "Futsal",
    categoria: "Masculino",
    dia: "Segunda-feira",
    horario: "22:00",
    local: "Ginásio Municipal",
    mapsUrl: "https://maps.google.com/?q=Ginasio+Municipal",
    responsavel: "Dudu",
    responsavel_id: "dudu_med",
    responsavel_foto: "https://i.pravatar.cc/150?u=dudu",
    descricao:
      "Treino focado em posicionamento defensivo e transição rápida. Faremos coletivo nos últimos 30 minutos.",
    img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80",
    cor: "bg-emerald-600",
    confirmados: 18,
    turmas_destaque: [
      { turma: "T5", count: 8, color: "bg-emerald-500", logo: "/turma5.jpeg" },
      { turma: "T1", count: 5, color: "bg-yellow-500", logo: "/turma1.jpeg" },
    ],
    participantes: [
      {
        id: 101,
        nome: "João Silva",
        turma: "T5",
        avatar: "https://i.pravatar.cc/150?u=joao",
        handle: "joaosilva",
        status: "presente",
      },
      {
        id: 102,
        nome: "Pedro Santos",
        turma: "T1",
        avatar: "https://i.pravatar.cc/150?u=pedro",
        handle: "pedros",
        status: "pendente",
      },
    ],
  },
  // ... outros treinos
];

export default function TreinoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [treino, setTreino] = useState<any>(null);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [listaChamada, setListaChamada] = useState<any[]>([]);
  const [novoAluno, setNovoAluno] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    const found =
      TREINOS_DATA.find((t) => t.id === Number(params.id)) || TREINOS_DATA[0];
    setTreino(found);
    setListaChamada(found.participantes);
  }, [params.id, user, router]);

  if (!treino) return null;

  // ... (Funções Admin: adicionarAluno, etc - Mantidas do código anterior) ...
  const adicionarAluno = () => {
    // (Lógica simples para não ocupar muito espaço aqui)
    if (!novoAluno.trim()) return;
    setListaChamada([
      ...listaChamada,
      {
        id: Date.now(),
        nome: novoAluno,
        turma: "Avulso",
        status: "presente",
        avatar: "",
        handle: "",
      },
    ]);
    setNovoAluno("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      {/* HERO IMAGE */}
      <div className="relative h-72 w-full">
        <img src={treino.img} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050505]"></div>

        <Link
          href="/treinos"
          className="absolute top-4 left-4 bg-black/50 backdrop-blur-md p-3 rounded-full text-white hover:bg-zinc-800 transition z-10"
        >
          <ArrowLeft size={24} />
        </Link>
        <button
          onClick={() => setIsAdminMode(!isAdminMode)}
          className="absolute top-4 right-16 p-3 rounded-full backdrop-blur-md z-10 bg-black/50 text-zinc-400"
        >
          <ShieldAlert size={24} />
        </button>
        <button className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-full z-10">
          <Share2 size={24} />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6 flex justify-between items-end">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${treino.cor} mb-2 shadow-lg`}
            >
              {treino.categoria}
            </span>
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 drop-shadow-xl">
              {treino.esporte}
            </h1>

            {/* Responsável Clicável */}
            <Link
              href={`/perfil/${treino.responsavel_id}`}
              className="flex items-center gap-3 mt-2 group w-fit"
            >
              <img
                src={treino.responsavel_foto}
                className="w-10 h-10 rounded-full border-2 border-white/20 group-hover:border-emerald-500 transition"
              />
              <div>
                <p className="text-[10px] text-zinc-400 uppercase font-bold">
                  Responsável
                </p>
                <p className="text-sm text-white font-bold group-hover:text-emerald-400 transition">
                  {treino.responsavel}
                </p>
              </div>
            </Link>
          </div>

          {/* LOGOS DAS TURMAS (Igual Eventos) */}
          <div className="flex flex-col items-end gap-2 mb-2">
            {treino.turmas_destaque.map((t: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-black/60 backdrop-blur-md pl-1.5 pr-2 py-1.5 rounded-full border border-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-500 shrink-0">
                  <img
                    src={t.logo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement!.innerText = t.turma;
                    }}
                  />
                </div>
                <span className="text-[10px] font-bold text-white">
                  +{t.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="p-6 space-y-8 -mt-6 relative z-10">
        {/* RSVP GRID (Sem "Não") */}
        <div className="grid grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition">
            <Heart size={20} />
            <span className="text-[9px] font-bold uppercase">Curtir</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500/10 transition">
            <CheckCircle size={20} />
            <span className="text-[9px] font-bold uppercase">Vou</span>
          </button>
          <button className="flex flex-col items-center justify-center gap-1 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-yellow-500 hover:border-yellow-500 hover:bg-yellow-500/10 transition">
            <HelpCircle size={20} />
            <span className="text-[9px] font-bold uppercase">Talvez</span>
          </button>
        </div>

        {/* DESCRIÇÃO */}
        <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Trophy size={16} className="text-emerald-500" /> O que vai rolar?
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            {treino.descricao}
          </p>
        </div>

        {/* INFO GERAL (Local Link) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl flex justify-between items-center">
          <div>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">
              Horário
            </p>
            <div className="flex items-center gap-2 text-white font-black text-xl">
              <Clock size={20} className="text-emerald-500" /> {treino.horario}
            </div>
            <p className="text-xs text-zinc-400 mt-1">{treino.dia}</p>
          </div>
          <div className="h-12 w-px bg-zinc-800"></div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">
              Local
            </p>
            <a
              href={treino.mapsUrl}
              target="_blank"
              className="flex items-center gap-2 text-white font-black text-sm justify-end hover:text-emerald-400 transition"
            >
              {treino.local}{" "}
              <ExternalLink size={16} className="text-emerald-500" />
            </a>
          </div>
        </div>

        {/* LISTA DE PRESENÇA (Pública e Clicável) */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={16} /> Lista de Presença
            </h3>
            {isAdminMode && (
              <button className="bg-zinc-800 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Download size={12} /> PDF
              </button>
            )}
          </div>

          {/* Input Admin */}
          {isAdminMode && (
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={novoAluno}
                onChange={(e) => setNovoAluno(e.target.value)}
                placeholder="Adicionar aluno..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"
              />
              <button
                onClick={adicionarAluno}
                className="bg-emerald-600 text-white p-3 rounded-xl"
              >
                <Plus size={20} />
              </button>
            </div>
          )}

          {/* Lista Visual */}
          <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 max-h-80 overflow-y-auto">
            {listaChamada.map((aluno: any) => (
              <div
                key={aluno.id}
                className="flex justify-between items-center p-3 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition"
              >
                <Link
                  href={`/perfil/${aluno.handle}`}
                  className="flex items-center gap-3 group w-full"
                >
                  <img
                    src={aluno.avatar || "https://github.com/shadcn.png"}
                    className="w-10 h-10 rounded-full border border-zinc-700 group-hover:border-emerald-500 transition object-cover"
                  />
                  <div>
                    <span className="text-sm font-bold text-white block group-hover:text-emerald-400 transition">
                      {aluno.nome}
                    </span>
                    <span className="text-zinc-500 text-xs uppercase font-bold">
                      {aluno.turma}
                    </span>
                  </div>
                </Link>

                {isAdminMode ? (
                  <div className="flex gap-2">
                    {/* Botões Admin Ocultos para brevidade - Mesma lógica anterior */}
                    <span className="text-xs text-zinc-500">...</span>
                  </div>
                ) : (
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      aluno.status === "presente"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-zinc-800 text-zinc-500"
                    }`}
                  >
                    {aluno.status === "presente" ? "Confirmado" : "Pendente"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
