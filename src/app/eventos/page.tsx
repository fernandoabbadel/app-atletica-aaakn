"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Filter,
  Music,
  Trophy,
  ExternalLink,
  ChevronRight,
  Heart,
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

// --- TIPOS ---
export interface Lote {
  nome: string;
  preco: string;
  status: "ativo" | "encerrado";
  vendidos?: number;
  total?: number;
}

export interface EventoStats {
  confirmados: number;
  talvez: number;
  likes: number;
}

export interface Evento {
  id: number;
  tipo: "festa" | "esportes";
  titulo: string;
  data: string;
  local: string;
  mapsUrl: string;
  imagem: string;
  stats: EventoStats;
  destaque: string;
  lotes: Lote[];
  vendasTotais?: { vendidos: number; total: number }; // Novo campo
}

// --- COMPONENTE MODAL DE LISTA DE PRESENÇA ---
function AttendanceModal({
  isOpen,
  onClose,
  eventTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
}) {
  if (!isOpen) return null;

  // Mock de usuários
  const attendees = [
    {
      name: "Ana Clara",
      turma: "T1",
      avatar: "https://i.pravatar.cc/150?u=ana",
    },
    {
      name: "Pedro Silva",
      turma: "T3",
      avatar: "https://i.pravatar.cc/150?u=pedro",
    },
    {
      name: "João Vitor",
      turma: "T5",
      avatar: "https://i.pravatar.cc/150?u=joao",
    },
    {
      name: "Mariana",
      turma: "T2",
      avatar: "https://i.pravatar.cc/150?u=mari",
    },
    { name: "Lucas", turma: "T4", avatar: "https://i.pravatar.cc/150?u=lucas" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Quem vai em {eventTitle}</h3>
          <button onClick={onClose}>
            <X size={20} className="text-zinc-400" />
          </button>
        </div>
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {attendees.map((person, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <img
                src={person.avatar}
                className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-white">{person.name}</p>
                <p className="text-xs text-zinc-500">Turma {person.turma}</p>
              </div>
            </div>
          ))}
          <p className="text-center text-xs text-zinc-500 pt-2">
            E mais 195 pessoas...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EventosPage() {
  const [filtro, setFiltro] = useState<"todos" | "festas" | "esportes">(
    "todos"
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<string>("");

  const openAttendance = (e: React.MouseEvent, title: string) => {
    e.preventDefault(); // Evita abrir o link do card
    e.stopPropagation();
    setSelectedEvent(title);
    setModalOpen(true);
  };

  // --- DADOS MOCKADOS ATUALIZADOS ---
  const eventos: Evento[] = [
    {
      id: 1,
      tipo: "festa",
      titulo: "INTERMED 2026",
      data: "12 OUT - 15 OUT",
      local: "Arena XP, São Paulo",
      mapsUrl: "https://google.com/maps",
      imagem:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80",
      stats: { confirmados: 289, talvez: 67, likes: 512 },
      destaque: "OPEN BAR",
      vendasTotais: { vendidos: 450, total: 600 },
      lotes: [
        { nome: "Promocional", preco: "R$ 60,00", status: "encerrado" },
        { nome: "Lote 1", preco: "R$ 75,00", status: "encerrado" },
        {
          nome: "Lote 2",
          preco: "R$ 85,00",
          status: "ativo",
          vendidos: 178,
          total: 300,
        },
      ],
    },
    {
      id: 2,
      tipo: "esportes",
      titulo: "Tubarões vs. Engenharia",
      data: "20 JAN • 14:00",
      local: "Ginásio Municipal",
      mapsUrl: "https://google.com/maps",
      imagem:
        "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
      stats: { confirmados: 45, talvez: 12, likes: 89 },
      destaque: "FINAL",
      vendasTotais: { vendidos: 120, total: 500 },
      lotes: [
        {
          nome: "Entrada Franca",
          preco: "GRÁTIS",
          status: "ativo",
          vendidos: 450,
          total: 500,
        },
      ],
    },
  ];

  const eventosFiltrados =
    filtro === "todos"
      ? eventos
      : eventos.filter(
          (e) => e.tipo === (filtro === "festas" ? "festa" : "esportes")
        );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 selection:bg-emerald-500/30">
      <AttendanceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventTitle={selectedEvent}
      />

      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full z-30 bg-[#050505]/90 backdrop-blur-xl border-b border-white/5">
        <div className="p-4 flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-white/10 group"
            >
              <ArrowLeft
                size={24}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </Link>
            <h1 className="font-bold text-lg tracking-tight text-white">
              Agenda do Tubarão
            </h1>
          </div>
          <button className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="h-20"></div>

      <main className="p-4 space-y-8 max-w-2xl mx-auto">
        {/* FILTROS */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 pt-2">
          <FilterButton
            label="Todos"
            active={filtro === "todos"}
            onClick={() => setFiltro("todos")}
          />
          <FilterButton
            label="Festas"
            icon={<Music size={12} />}
            active={filtro === "festas"}
            onClick={() => setFiltro("festas")}
            color="purple"
          />
          <FilterButton
            label="Esportes"
            icon={<Trophy size={12} />}
            active={filtro === "esportes"}
            onClick={() => setFiltro("esportes")}
            color="orange"
          />
        </div>

        {/* LISTA DE EVENTOS */}
        <div className="space-y-8">
          {eventosFiltrados.length > 0 ? (
            eventosFiltrados.map((evento) => (
              <Link
                href={`/eventos/${evento.id}`}
                key={evento.id}
                className="block group"
              >
                <EventoCard
                  evento={evento}
                  onOpenAttendance={(e) => openAttendance(e, evento.titulo)}
                />
              </Link>
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500">
              <p>Nenhum evento encontrado para esta categoria.</p>
            </div>
          )}
        </div>

        <div className="h-10 text-center">
          <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-widest">
            Fim da Agenda
          </p>
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTES ---

function FilterButton({
  label,
  icon,
  active,
  onClick,
  color = "emerald",
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  const activeClasses = {
    purple:
      "bg-purple-600 text-white border-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.4)]",
    orange:
      "bg-orange-600 text-white border-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)]",
    emerald:
      "bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]",
  };

  const baseClass = `px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border flex items-center gap-2`;
  const inactiveClass =
    "bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700";

  return (
    <button
      onClick={onClick}
      className={`${baseClass} ${
        active
          ? `${activeClasses[color as keyof typeof activeClasses]} scale-105`
          : inactiveClass
      }`}
    >
      {icon} {label}
    </button>
  );
}

function EventoCard({
  evento,
  onOpenAttendance,
}: {
  evento: Evento;
  onOpenAttendance: (e: React.MouseEvent) => void;
}) {
  const pctVendas = evento.vendasTotais
    ? (evento.vendasTotais.vendidos / evento.vendasTotais.total) * 100
    : 0;

  return (
    <div className="bg-zinc-900/50 rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl hover:border-zinc-700 transition duration-500 group relative">
      {/* IMAGEM */}
      <div className="h-64 relative overflow-hidden">
        <img
          src={evento.imagem}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
          alt={evento.titulo}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>

        {/* Tag Destaque */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md shadow-lg ${
              evento.tipo === "festa" ? "bg-purple-600" : "bg-orange-600"
            }`}
          >
            {evento.destaque}
          </span>
        </div>

        {/* Info Principal */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2 drop-shadow-lg">
            {evento.titulo}
          </h3>
          <div className="flex items-center gap-2 text-zinc-300 text-xs font-medium bg-black/40 w-fit px-3 py-1 rounded-lg backdrop-blur-md border border-white/10">
            <Calendar size={14} className="text-emerald-500" /> {evento.data}
          </div>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div className="p-5 space-y-4">
        {/* Local e Link Mapa */}
        <div className="flex items-start justify-between">
          <a
            href={evento.mapsUrl}
            target="_blank"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition"
          >
            <MapPin size={16} className="text-emerald-500" />
            <span className="text-sm font-bold">{evento.local}</span>
            <ExternalLink size={12} />
          </a>
          <div className="bg-zinc-800 p-2 rounded-full text-zinc-400 group-hover:bg-emerald-500 group-hover:text-black transition">
            <ChevronRight size={16} />
          </div>
        </div>

        {/* QUEM VAI (Clicável para abrir modal) */}
        <div
          className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800 cursor-pointer hover:border-zinc-600 transition"
          onClick={onOpenAttendance}
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full border-2 border-zinc-950 flex items-center justify-center text-[8px] text-white font-bold ${
                    i === 2 ? "bg-zinc-500" : "bg-zinc-700"
                  }`}
                >
                  {i === 2 ? "+" + (evento.stats.confirmados - 2) : ""}
                </div>
              ))}
            </div>
            <div className="text-xs">
              <span className="text-white font-bold block">
                Ver lista de presença
              </span>
              <span className="text-zinc-500">
                {evento.stats.confirmados} vão • {evento.stats.talvez} talvez
              </span>
            </div>
          </div>
          <Users size={16} className="text-zinc-500" />
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA (RSVP) */}
        <div className="grid grid-cols-4 gap-2">
          <RsvpButton
            icon={<Heart size={18} />}
            label={evento.stats.likes.toString()}
          />
          <RsvpButton
            icon={<CheckCircle size={18} />}
            label="Vou"
            color="emerald"
          />
          <RsvpButton
            icon={<HelpCircle size={18} />}
            label="Talvez"
            color="yellow"
          />
          <RsvpButton icon={<XCircle size={18} />} label="Não" color="red" />
        </div>

        {/* Lotes Resumidos & Vendas Totais */}
        <div className="pt-2 border-t border-zinc-800 space-y-3">
          {/* Barra de Vendas Totais */}
          {evento.vendasTotais && (
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-bold text-zinc-500 uppercase">
                <span>Vendas Totais</span>
                <span>
                  {evento.vendasTotais.vendidos}/{evento.vendasTotais.total}
                </span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${pctVendas}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-xs text-zinc-400">Lote Atual:</p>
            <p className="text-sm font-black text-emerald-400">
              {evento.lotes.find((l) => l.status === "ativo")?.preco ||
                "Esgotado"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RsvpButton({
  icon,
  label,
  color = "zinc",
}: {
  icon: React.ReactNode;
  label: string;
  color?: string;
}) {
  const colors = {
    emerald:
      "hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10",
    red: "hover:border-red-500 hover:text-red-500 hover:bg-red-500/10",
    yellow:
      "hover:border-yellow-500 hover:text-yellow-500 hover:bg-yellow-500/10",
    zinc: "hover:border-zinc-500 hover:text-white hover:bg-zinc-800",
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }} // Evita abrir o card
      className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 transition group ${
        colors[color as keyof typeof colors]
      }`}
    >
      <span className="group-active:scale-110 transition">{icon}</span>
      <span className="text-[9px] font-bold uppercase">{label}</span>
    </button>
  );
}
