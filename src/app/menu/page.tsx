"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Bell,
  Shield,
  Moon,
  Crown,
  Wallet,
  History,
  Trophy,
  QrCode,
  ShoppingBag,
  Gift,
  Map,
  Store,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function MenuPage() {
  const [notificacoes, setNotificacoes] = useState(true);

  // DADOS DO USUÁRIO (MOCK)
  const socio = {
    nome: "Maria Eduarda Cantelmo",
    curso: "Medicina",
    turma: "T5",
    matricula: "2024.1.0042",
    foto: "https://i.pravatar.cc/300?u=eduarda_med_final",
    status: "ATIVO",
    plano: "OURO", // Plano atual
    saldo: "R$ 45,90",
    pontos: 2450,
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex items-center gap-3 border-b border-zinc-900">
        <Link
          href="/"
          className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-bold text-lg">Central do Sócio</h1>
      </header>

      <main className="p-4 space-y-6">
        {/* 1. CARTÃO DE PERFIL + PLANO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-[2rem] p-5">
          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-emerald-500 to-emerald-900">
                <img
                  src={socio.foto}
                  alt="Perfil"
                  className="w-full h-full rounded-full object-cover border-4 border-[#050505]"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1.5 rounded-full border-4 border-[#050505]">
                <Crown size={12} strokeWidth={3} />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="font-black text-xl text-white leading-none mb-1">
                {socio.nome}
              </h2>
              <p className="text-xs text-zinc-400 font-medium mb-3">
                {socio.curso} • {socio.turma}
              </p>

              {/* BARRA DO PLANO ATUAL */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider flex items-center gap-1">
                  <Crown size={10} strokeWidth={3} />
                  PLANO {socio.plano}
                </span>
                <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                  {socio.status}
                </span>
              </div>

              <Link
                href="/carteirinha"
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 transition px-3 py-1.5 rounded-lg border border-white/10 group"
              >
                <QrCode size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-zinc-300 group-hover:text-white uppercase tracking-wider">
                  Abrir Carteirinha
                </span>
              </Link>
            </div>
          </div>

          {/* Background Decorativo */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        </section>

        {/* 2. BOTÃO DE UPGRADE DE PLANO (NOVO!) */}
        <section>
          <Link
            href="/planos"
            className="block w-full bg-gradient-to-r from-purple-900 to-purple-600 rounded-2xl p-4 border border-purple-500/30 relative overflow-hidden group"
          >
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Zap size={16} className="text-yellow-400 fill-yellow-400" />
                  Faça Upgrade do seu Plano
                </h3>
                <p className="text-[10px] text-purple-200 mt-1 w-3/4 leading-tight">
                  Tenha acesso a mais festas, descontos turbinados e kits
                  exclusivos.
                </p>
              </div>
              <div className="bg-white text-purple-700 p-2 rounded-full shadow-lg group-hover:scale-110 transition">
                <ChevronRight size={20} />
              </div>
            </div>
            {/* Efeito de brilho */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
          </Link>
        </section>

        {/* 3. RESUMO FINANCEIRO E GAMIFICATION */}
        <section className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Wallet size={12} /> Saldo Atual
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {socio.saldo}
              </span>
            </div>
            <div className="relative z-10">
              <span className="text-[9px] text-emerald-500 font-bold cursor-pointer hover:underline">
                Adicionar Saldo
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-emerald-500/10 rounded-full group-hover:scale-150 transition duration-500"></div>
          </div>

          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex flex-col justify-between h-28 relative overflow-hidden group">
            <div className="relative z-10">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Trophy size={12} className="text-amber-500" /> Pontos XP
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {socio.pontos}
              </span>
            </div>
            <div className="relative z-10">
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-amber-500 w-[70%]"></div>
              </div>
              <span className="text-[9px] text-zinc-500 mt-1 block">
                Nível Ouro
              </span>
            </div>
          </div>
        </section>

        {/* 4. ATALHOS RÁPIDOS */}
        <section className="grid grid-cols-4 gap-2">
          <Link
            href="/conquistas"
            className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover:scale-110 transition">
              <Trophy size={18} />
            </div>
            <span className="text-[9px] font-bold text-zinc-300">
              Conquistas
            </span>
          </Link>

          <Link
            href="/fidelidade"
            className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition">
              <Gift size={18} />
            </div>
            <span className="text-[9px] font-bold text-zinc-300">
              Fidelidade
            </span>
          </Link>

          <Link
            href="/loja"
            className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition">
              <ShoppingBag size={18} />
            </div>
            <span className="text-[9px] font-bold text-zinc-300">Loja</span>
          </Link>

          <Link
            href="/guia"
            className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition">
              <Map size={18} />
            </div>
            <span className="text-[9px] font-bold text-zinc-300">Guia</span>
          </Link>
        </section>

        {/* 5. MENU DE NAVEGAÇÃO */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">
              Minha Conta
            </h3>
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              <MenuItem
                icon={<User size={18} />}
                label="Dados Pessoais"
                desc="Atualizar cadastro"
              />
              <MenuItem
                icon={<History size={18} />}
                label="Histórico de Pedidos"
                desc="Ingressos e produtos"
              />
              <MenuItem
                icon={<CreditCard size={18} />}
                label="Pagamentos"
                desc="Cartões salvos"
              />
              <Link href="/parceiros" className="block">
                <MenuItem
                  icon={<Store size={18} />}
                  label="Clube de Parceiros"
                  desc="Descontos exclusivos"
                  badge="Novo"
                />
              </Link>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-2">
              Preferências
            </h3>
            <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
              <div className="w-full flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition">
                <div className="flex items-center gap-3 text-zinc-400">
                  <Bell size={18} />
                  <div className="text-left">
                    <span className="text-sm font-medium text-zinc-200 block">
                      Notificações
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setNotificacoes(!notificacoes)}
                  className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${
                    notificacoes ? "bg-emerald-500" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${
                      notificacoes ? "left-6" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>

              <MenuItem icon={<Shield size={18} />} label="Privacidade" />
              <MenuItem
                icon={<Moon size={18} />}
                label="Aparência"
                badge="Dark"
              />
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800">
            <MenuItem icon={<HelpCircle size={18} />} label="Ajuda e Suporte" />

            <button className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 transition group border-t border-zinc-800">
              <div className="flex items-center gap-3">
                <LogOut size={18} className="text-red-500" />
                <span className="text-sm font-bold text-red-500">
                  Sair da Conta
                </span>
              </div>
              <span className="text-[10px] text-zinc-600">v1.0.5</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  desc,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  desc?: string;
  badge?: string;
}) {
  return (
    <button className="w-full flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 hover:bg-zinc-800/50 transition group">
      <div className="flex items-center gap-3 text-zinc-400 group-hover:text-white transition">
        {icon}
        <div className="text-left">
          <span className="text-sm font-medium text-zinc-200 group-hover:text-white block leading-tight">
            {label}
          </span>
          {desc && (
            <span className="text-[10px] text-zinc-500 font-normal">
              {desc}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-md border border-zinc-700">
            {badge}
          </span>
        )}
        <ChevronRight
          size={16}
          className="text-zinc-600 group-hover:text-zinc-400"
        />
      </div>
    </button>
  );
}
