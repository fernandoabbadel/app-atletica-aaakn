"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Ticket,
  ShoppingBag,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Package,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { Timestamp } from "firebase/firestore";

import { useAuth } from "../../../context/AuthContext";
import { fetchUserOrdersByTab } from "../../../lib/settingsService";

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
}

interface PedidoUnificado {
  id: string;
  titulo: string;
  subtitulo: string;
  valor: number;
  status: "aprovado" | "rejeitado" | "pendente";
  data: Date;
  tipo: "evento" | "loja" | "plano";
}

type PedidoRaw = {
  id: string;
  dataSolicitacao?: Timestamp;
  createdAt?: Timestamp;
  data?: string;
  eventoNome?: string;
  quantidade?: number;
  loteNome?: string;
  valorTotal?: unknown;
  itens?: unknown[];
  total?: unknown;
  planoNome?: string;
  valor?: unknown;
  status?: PedidoUnificado["status"];
};

const parseCurrencyValue = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return 0;

    const sanitized = trimmed.replace(/[^\d,.-]/g, "");
    if (!sanitized) return 0;

    const lastComma = sanitized.lastIndexOf(",");
    const lastDot = sanitized.lastIndexOf(".");

    let normalized = sanitized;
    if (lastComma >= 0 && lastDot >= 0) {
      normalized =
        lastComma > lastDot
          ? sanitized.replace(/\./g, "").replace(",", ".")
          : sanitized.replace(/,/g, "");
    } else if (lastComma >= 0) {
      normalized = sanitized.replace(",", ".");
    }

    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizePedido = (item: PedidoRaw, activeTab: "eventos" | "loja" | "planos"): PedidoUnificado => {
  let titulo = "Item";
  let subtitulo = "";
  let valor = 0;
  let data = new Date();

  if (item.dataSolicitacao instanceof Timestamp) data = item.dataSolicitacao.toDate();
  else if (item.createdAt instanceof Timestamp) data = item.createdAt.toDate();
  else if (item.data) data = new Date(item.data);

  if (activeTab === "eventos") {
    titulo = item.eventoNome || "Ingresso";
    subtitulo = `${item.quantidade || 1}x ${item.loteNome || "Lote Unico"}`;
    valor = parseCurrencyValue(item.valorTotal);
  } else if (activeTab === "loja") {
    titulo = `Pedido #${item.id.slice(0, 6).toUpperCase()}`;
    subtitulo = `${item.itens?.length || 0} itens`;
    valor = parseCurrencyValue(item.total);
  } else {
    titulo = item.planoNome || "Adesao";
    subtitulo = "Anuidade";
    valor = parseCurrencyValue(item.valor);
  }

  return {
    id: item.id,
    titulo,
    subtitulo,
    valor,
    status: item.status || "pendente",
    data,
    tipo: activeTab === "eventos" ? "evento" : activeTab === "loja" ? "loja" : "plano",
  };
};

function TabButton({ label, active, onClick, icon: Icon }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center justify-center gap-2 ${
        active
          ? "border-emerald-500 text-emerald-500"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

export default function MeusPedidosPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"eventos" | "loja" | "planos">("eventos");
  const [pedidos, setPedidos] = useState<PedidoUnificado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPedidos([]);
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);

    const loadPedidos = async () => {
      try {
        const records = await fetchUserOrdersByTab(user.uid, activeTab, {
          maxResults: 90,
        });
        const rawList = records.map(
          (row) => ({ id: row.id, ...(row.data as Record<string, unknown>) }) as PedidoRaw
        );

        const listaOrdenada = rawList
          .map((item) => normalizePedido(item, activeTab))
          .sort((a, b) => b.data.getTime() - a.data.getTime());

        if (mounted) setPedidos(listaOrdenada);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadPedidos();
    return () => {
      mounted = false;
    };
  }, [user, activeTab]);

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-24 font-sans">
      <header className="p-4 sticky top-0 z-30 flex items-center gap-4 border-b border-white/5 bg-[#050505]/90 backdrop-blur-md">
        <Link
          href="/configuracoes"
          className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full transition hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">
          Meus Pedidos
        </h1>
      </header>

      <div className="flex border-b border-zinc-800 bg-black/40 sticky top-[65px] z-20">
        <TabButton
          label="Eventos"
          icon={Ticket}
          active={activeTab === "eventos"}
          onClick={() => setActiveTab("eventos")}
        />
        <TabButton
          label="Loja"
          icon={ShoppingBag}
          active={activeTab === "loja"}
          onClick={() => setActiveTab("loja")}
        />
        <TabButton
          label="Planos"
          icon={CreditCard}
          active={activeTab === "planos"}
          onClick={() => setActiveTab("planos")}
        />
      </div>

      <main className="p-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-zinc-500 text-xs flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            Carregando historico...
          </div>
        ) : pedidos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-3">
            <Package size={48} className="opacity-20" />
            <p className="text-sm font-medium">Nenhum pedido encontrado nesta categoria.</p>
          </div>
        ) : (
          pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className={`p-4 rounded-xl border flex flex-col gap-2 relative overflow-hidden transition-colors ${
                pedido.status === "aprovado"
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-black border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div
                className={`absolute left-0 top-0 h-full w-1 ${
                  pedido.status === "aprovado"
                    ? "bg-emerald-500"
                    : pedido.status === "rejeitado"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                }`}
              />

              <div className="flex justify-between items-start pl-2">
                <div>
                  <h3 className="font-bold text-sm text-white">{pedido.titulo}</h3>
                  <p className="text-xs text-zinc-400">{pedido.subtitulo}</p>
                </div>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  R$ {pedido.valor.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center mt-2 pl-2 border-t border-white/5 pt-2">
                <span className="text-[10px] text-zinc-500 font-medium">
                  {pedido.data.toLocaleDateString("pt-BR")}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded flex items-center gap-1 ${
                    pedido.status === "aprovado"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : pedido.status === "rejeitado"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-yellow-500/10 text-yellow-500"
                  }`}
                >
                  {pedido.status === "aprovado" ? (
                    <>
                      <CheckCircle size={10} /> Aprovado
                    </>
                  ) : pedido.status === "rejeitado" ? (
                    <>
                      <XCircle size={10} /> Negado
                    </>
                  ) : (
                    <>
                      <Clock size={10} /> Pendente
                    </>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
