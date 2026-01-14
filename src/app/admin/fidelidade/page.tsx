"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  Star,
  Gift,
  LayoutDashboard,
  ScrollText,
  Save,
  Users,
  TrendingUp,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// ============================================================================
// 1. DADOS MOCKADOS (O que viria do Banco de Dados)
// ============================================================================

// Top alunos acumuladores (As "Baleias" do sistema)
const MOCK_TOP_USERS = [
  {
    id: 1,
    name: "Ana Clara",
    handle: "@ana.med",
    selos: 9,
    totalResgates: 2,
    avatar: "https://i.pravatar.cc/150?u=ana",
    status: "quase-la",
  },
  {
    id: 2,
    name: "Mariana S.",
    handle: "@mari.fit",
    selos: 10,
    totalResgates: 5,
    avatar: "https://i.pravatar.cc/150?u=mari",
    status: "resgate-pronto",
  },
  {
    id: 3,
    name: "Pedro H.",
    handle: "@pedrao",
    selos: 7,
    totalResgates: 0,
    avatar: "https://i.pravatar.cc/150?u=pedro",
    status: "farmando",
  },
  {
    id: 4,
    name: "João Silva",
    handle: "@jao.t5",
    selos: 5,
    totalResgates: 1,
    avatar: "https://i.pravatar.cc/150?u=joao",
    status: "farmando",
  },
];

// Recompensas atuais
const MOCK_REWARDS = [
  {
    id: 1,
    titulo: "Copo 850ml + Tirante",
    custo: 1000,
    estoque: 15,
    imagem:
      "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=800",
  },
  {
    id: 2,
    titulo: "Boné Aba Reta AAAKN",
    custo: 2000,
    estoque: 3,
    imagem:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
  }, // Estoque baixo
  {
    id: 3,
    titulo: "Entrada VIP Intermed",
    custo: 5000,
    estoque: 1,
    imagem:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
  }, // Crítico
];

// Regras visíveis no App
const MOCK_RULES_TEXT = [
  "A cada {XP} XP ganhos em treinos ou eventos, você recebe 1 Selo.",
  "Complete 10 Selos para desbloquear o nível de resgate.",
  "Os prêmios são limitados ao estoque disponível.",
  "O resgate deve ser validado presencialmente na Lojinha.",
];

// ============================================================================
// 2. COMPONENTE PRINCIPAL
// ============================================================================

export default function AdminFidelidadePage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "premios" | "regras"
  >("dashboard");

  // --- ESTADOS ---
  const [rewards, setRewards] = useState(MOCK_REWARDS);
  const [rulesText, setRulesText] = useState(MOCK_RULES_TEXT);
  const [xpPerStamp, setXpPerStamp] = useState(100); // Fator de Dificuldade

  // Modal de Novo Prêmio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    titulo: "",
    custo: "",
    estoque: "",
    imagem: "",
  });

  // --- AÇÕES ---

  const handleAddReward = () => {
    if (!newReward.titulo || !newReward.custo) {
      addToast("Preencha os dados obrigatórios!", "error");
      return;
    }
    setRewards([
      ...rewards,
      {
        id: Date.now(),
        titulo: newReward.titulo,
        custo: Number(newReward.custo),
        estoque: Number(newReward.estoque),
        imagem:
          newReward.imagem || "https://placehold.co/400x400/000/FFF?text=Foto",
      },
    ]);
    setIsModalOpen(false);
    setNewReward({ titulo: "", custo: "", estoque: "", imagem: "" });
    addToast("Prêmio adicionado à vitrine!", "success");
  };

  const handleDeleteReward = (id: number) => {
    if (confirm("Tem certeza? Isso removerá o item do app dos alunos.")) {
      setRewards(rewards.filter((r) => r.id !== id));
      addToast("Item removido.", "info");
    }
  };

  const handleUpdateRuleText = (index: number, value: string) => {
    const newRules = [...rulesText];
    newRules[index] = value;
    setRulesText(newRules);
  };

  const handleAddRuleLine = () => {
    setRulesText([...rulesText, "Nova regra..."]);
  };

  const handleDeleteRuleLine = (index: number) => {
    setRulesText(rulesText.filter((_, i) => i !== index));
  };

  const handleSaveConfig = () => {
    // Aqui enviaria xpPerStamp e rulesText para o Firebase
    addToast("Regras e Dificuldade atualizadas no App!", "success");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      {/* HEADER DE CONTROLE */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/admin"
            className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition border border-zinc-800"
          >
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-tighter flex items-center gap-2">
              Admin Fidelidade
            </h1>
            <p className="text-[10px] text-zinc-500">Gestão do Shark Card</p>
          </div>
        </div>

        {activeTab === "premios" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus size={16} /> Novo Prêmio
          </button>
        )}
      </header>

      {/* NAVEGAÇÃO */}
      <div className="px-6 pt-4">
        <div className="flex border-b border-zinc-800 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "dashboard"
                ? "text-emerald-500 border-emerald-500"
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            <LayoutDashboard size={16} /> Visão Geral
          </button>
          <button
            onClick={() => setActiveTab("premios")}
            className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "premios"
                ? "text-emerald-500 border-emerald-500"
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            <Gift size={16} /> Prêmios & Estoque
          </button>
          <button
            onClick={() => setActiveTab("regras")}
            className={`pb-3 text-sm font-bold uppercase transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === "regras"
                ? "text-emerald-500 border-emerald-500"
                : "text-zinc-500 border-transparent hover:text-white"
            }`}
          >
            <ScrollText size={16} /> Regras & Dificuldade
          </button>
        </div>
      </div>

      <main className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ==================================================================================== */}
        {/* ABA 1: DASHBOARD (QUEM SÃO AS BALEIAS?) */}
        {/* ==================================================================================== */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métricas Rápidas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">
                    Selos em Circulação
                  </span>
                  <Star size={16} className="text-yellow-500" />
                </div>
                <span className="text-3xl font-black text-white">1,240</span>
                <p className="text-[10px] text-emerald-500 mt-1">+12 hoje</p>
              </div>
              <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-zinc-500 text-[10px] font-bold uppercase">
                    Prêmios Entregues
                  </span>
                  <Gift size={16} className="text-purple-500" />
                </div>
                <span className="text-3xl font-black text-white">85</span>
              </div>
            </div>

            {/* Lista de Alunos (Top Selos) */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden col-span-1 lg:col-span-2">
              <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-emerald-500" /> Alunos com
                  Mais Selos
                </h3>
                <button className="text-[10px] bg-zinc-800 px-3 py-1.5 rounded-lg text-zinc-400 hover:text-white border border-zinc-700">
                  Ver Lista Completa
                </button>
              </div>
              <div className="divide-y divide-zinc-800">
                {MOCK_TOP_USERS.map((user, i) => (
                  <div
                    key={user.id}
                    className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition"
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`font-black w-6 text-center ${
                          i === 0 ? "text-yellow-500" : "text-zinc-500"
                        }`}
                      >
                        #{i + 1}
                      </span>
                      <div className="relative">
                        <img
                          src={user.avatar}
                          className="w-10 h-10 rounded-full border border-zinc-700 object-cover"
                        />
                        {user.selos >= 10 && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-zinc-500">
                          {user.handle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span
                          className={`block font-black text-lg ${
                            user.selos >= 10 ? "text-emerald-400" : "text-white"
                          }`}
                        >
                          {user.selos}/10
                        </span>
                        <span className="text-[8px] text-zinc-600 uppercase font-bold">
                          Progresso
                        </span>
                      </div>
                      {user.selos >= 10 && (
                        <div className="bg-emerald-500 text-black text-[9px] font-bold px-2 py-1 rounded uppercase animate-pulse">
                          Resgate!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 2: PRÊMIOS (VITRINE DO APP) */}
        {/* ==================================================================================== */}
        {activeTab === "premios" && (
          <div className="space-y-4">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 group hover:border-emerald-500/30 transition items-start sm:items-center"
              >
                <div className="w-full sm:w-20 h-20 bg-black rounded-xl overflow-hidden shrink-0 border border-zinc-800">
                  <img
                    src={reward.imagem}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
                  />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        {reward.titulo}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            reward.estoque <= 3
                              ? "bg-red-500/20 text-red-500 border border-red-500/30"
                              : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          }`}
                        >
                          {reward.estoque <= 3
                            ? "Estoque Crítico"
                            : "Estoque: " + reward.estoque}
                        </span>
                      </div>
                    </div>
                    <div className="bg-zinc-950 px-3 py-1 rounded text-xs font-mono font-bold text-yellow-500 border border-yellow-500/10">
                      {reward.custo} XP
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-zinc-800 sm:border-0 pt-2 sm:pt-0">
                  <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition">
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="p-2 bg-zinc-800 hover:bg-red-900/50 rounded-lg text-zinc-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================================================================================== */}
        {/* ABA 3: REGRAS & DIFICULDADE (O CÉREBRO) */}
        {/* ==================================================================================== */}
        {activeTab === "regras" && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* 1. Controle de Inflação (Dificuldade) */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <TrendingUp size={100} className="text-yellow-500" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                    <TrendingUp size={24} className="text-yellow-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      Controle de Economia (Dificuldade)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Defina quanto esforço (XP) é necessário para ganhar 1
                      selo. Aumente se o estoque estiver acabando.
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-zinc-500 uppercase">
                      Fator de Conversão
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {xpPerStamp} XP{" "}
                      <span className="text-xs text-zinc-500 font-normal align-middle">
                        = 1 Selo
                      </span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={xpPerStamp}
                    onChange={(e) => setXpPerStamp(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-3 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 font-bold mt-2 uppercase">
                    <span>Fácil (50XP)</span>
                    <span>Equilibrado (200XP)</span>
                    <span>Difícil (500XP)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Editor de Texto "Como Funciona" */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                    <Info size={24} className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">
                      Texto do App
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Edite as regras que aparecem na tela de Fidelidade.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAddRuleLine}
                  className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-lg hover:bg-zinc-700 text-white font-bold transition"
                >
                  + Nova Linha
                </button>
              </div>

              <div className="space-y-3">
                {rulesText.map((rule, idx) => (
                  <div key={idx} className="flex gap-3 items-center group">
                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center text-[10px] font-bold border border-zinc-700 shrink-0">
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={rule}
                      onChange={(e) =>
                        handleUpdateRuleText(idx, e.target.value)
                      }
                      className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-300 focus:border-emerald-500 focus:text-white outline-none transition shadow-inner"
                    />
                    <button
                      onClick={() => handleDeleteRuleLine(idx)}
                      className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl text-[11px] text-blue-300 flex gap-2 items-center">
                <Info size={14} />
                <span>
                  Dica: Use <strong>{`{XP}`}</strong> no texto para mostrar
                  automaticamente o valor da dificuldade atual.
                </span>
              </div>
            </div>

            {/* FAB SAVE BUTTON */}
            <div className="fixed bottom-6 right-6 md:right-10 z-40">
              <button
                onClick={handleSaveConfig}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-4 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.4)] transition transform hover:scale-105 flex items-center gap-3 font-bold text-lg border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
              >
                <Save size={24} /> Salvar Alterações
              </button>
            </div>
          </div>
        )}
      </main>

      {/* MODAL ADICIONAR PRÊMIO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-500 border border-emerald-500/20">
                <Gift size={24} />
              </div>
              <h3 className="font-bold text-xl text-white">
                Novo Item na Loja
              </h3>
              <p className="text-xs text-zinc-500">
                Adicione uma recompensa para os alunos.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">
                  Nome do Produto
                </label>
                <input
                  type="text"
                  placeholder="Ex: Camiseta 2026"
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition"
                  value={newReward.titulo}
                  onChange={(e) =>
                    setNewReward({ ...newReward, titulo: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">
                    Custo (XP)
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition"
                    value={newReward.custo}
                    onChange={(e) =>
                      setNewReward({ ...newReward, custo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">
                    Estoque
                  </label>
                  <input
                    type="number"
                    placeholder="10"
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition"
                    value={newReward.estoque}
                    onChange={(e) =>
                      setNewReward({ ...newReward, estoque: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase ml-1">
                  Imagem (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none transition text-xs"
                  value={newReward.imagem}
                  onChange={(e) =>
                    setNewReward({ ...newReward, imagem: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3.5 rounded-xl border border-zinc-700 text-zinc-400 font-bold uppercase text-xs hover:bg-zinc-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddReward}
                className="flex-1 py-3.5 rounded-xl bg-emerald-600 text-white font-bold uppercase text-xs hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
