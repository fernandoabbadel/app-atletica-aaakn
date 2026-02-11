"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Crown,
  Download,
  ExternalLink,
  Loader2,
  Save,
  X,
  Ban,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useToast } from "@/context/ToastContext";
import {
  deleteAdminUser,
  fetchAdminUsersPage,
  setAdminUserStatus,
  updateAdminUser,
} from "@/lib/adminUsersService";

interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  turma: string;
  matricula: string;
  status: "ativo" | "inadimplente" | "pendente" | "bloqueado";
  plano: "lenda" | "atleta" | "cardume" | "bicho";
  foto: string;
  xp?: number;
  role?: string;
}

const PAGE_SIZE = 20;

const mergeUniqueUsers = (current: Usuario[], next: Usuario[]): Usuario[] => {
  if (!next.length) return current;

  const ids = new Set(current.map((item) => item.id));
  const merged = [...current];

  next.forEach((item) => {
    if (ids.has(item.id)) return;
    ids.add(item.id);
    merged.push(item);
  });

  return merged;
};

export default function AdminUsuariosPage() {
  const { addToast } = useToast();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroPlano, setFiltroPlano] = useState<string>("Todos");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const loadUsuarios = useCallback(
    async (options?: {
      reset?: boolean;
      forceRefresh?: boolean;
      cursorId?: string | null;
    }) => {
      const reset = options?.reset ?? false;
      const forceRefresh = options?.forceRefresh ?? false;
      const cursorId = options?.cursorId ?? null;

      if (reset) setLoading(true);
      else setLoadingMore(true);

      try {
        const result = await fetchAdminUsersPage({
          pageSize: PAGE_SIZE,
          cursorId: reset ? null : cursorId,
          forceRefresh,
        });

        const nextRows = result.users as Usuario[];
        if (reset) setUsuarios(nextRows);
        else setUsuarios((prev) => mergeUniqueUsers(prev, nextRows));

        setCursor(result.nextCursor);
        setHasMore(result.hasMore);
      } catch (error: unknown) {
        console.error(error);
        addToast("Erro ao carregar usuarios.", "error");
        if (reset) {
          setUsuarios([]);
          setCursor(null);
          setHasMore(false);
        }
      } finally {
        if (reset) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [addToast]
  );

  useEffect(() => {
    void loadUsuarios({ reset: true, forceRefresh: true });
  }, [loadUsuarios]);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const ativos = usuarios.filter((u) => u.status === "ativo").length;
    const pendentes = usuarios.filter((u) => u.status === "pendente").length;

    const distPlanos = {
      lenda: usuarios.filter((u) => u.plano === "lenda").length,
      atleta: usuarios.filter((u) => u.plano === "atleta").length,
      cardume: usuarios.filter((u) => u.plano === "cardume").length,
      bicho: usuarios.filter((u) => u.plano === "bicho" || !u.plano).length,
    };

    return { total, ativos, pendentes, distPlanos };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    const term = busca.trim().toLowerCase();
    return usuarios.filter((u) => {
      const matchBusca =
        u.nome.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.matricula.toLowerCase().includes(term);

      const matchPlano =
        filtroPlano === "Todos" ? true : u.plano === filtroPlano.toLowerCase();

      return matchBusca && matchPlano;
    });
  }, [usuarios, busca, filtroPlano]);

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      await updateAdminUser({
        userId: editingUser.id,
        nome: editingUser.nome,
        telefone: editingUser.telefone,
        matricula: editingUser.matricula,
        turma: editingUser.turma,
        status: editingUser.status,
        plano: editingUser.plano,
      });
      await loadUsuarios({ reset: true, forceRefresh: true });
      addToast("Dados atualizados!", "success");
      setEditingUser(null);
    } catch (error: unknown) {
      console.error(error);
      addToast("Erro ao atualizar.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleBlockUser = async (user: Usuario) => {
    const newStatus = user.status === "bloqueado" ? "ativo" : "bloqueado";
    const action = user.status === "bloqueado" ? "desbloquear" : "bloquear";

    if (!confirm(`Tem certeza que deseja ${action} o acesso de ${user.nome}?`)) {
      return;
    }

    try {
      await setAdminUserStatus({ userId: user.id, status: newStatus });
      await loadUsuarios({ reset: true, forceRefresh: true });
      addToast(
        `Usuario ${newStatus === "bloqueado" ? "bloqueado" : "liberado"}!`,
        "info"
      );
    } catch (error: unknown) {
      console.error(error);
      addToast("Erro ao alterar status.", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "ATENCAO: Isso apagara o usuario permanentemente. Confirmar exclusao?"
      )
    ) {
      return;
    }

    try {
      await deleteAdminUser(id);
      await loadUsuarios({ reset: true, forceRefresh: true });
      addToast("Usuario deletado.", "info");
    } catch (error: unknown) {
      console.error(error);
      addToast("Erro ao deletar.", "error");
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,Nome,Email,Telefone,Turma,Matricula,Plano,Status\n";
    const rows = usuariosFiltrados
      .map(
        (u) =>
          `${u.id},"${u.nome}",${u.email},${u.telefone},${u.turma},${u.matricula},${u.plano},${u.status}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `socios_aaakn_${new Date().toISOString().split("T")[0]}.csv`;
    anchor.click();
  };

  const handleLoadMore = async () => {
    if (!hasMore || !cursor || loadingMore) return;
    await loadUsuarios({
      reset: false,
      forceRefresh: false,
      cursorId: cursor,
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "ativo") {
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    }
    if (status === "inadimplente") {
      return "text-red-500 bg-red-500/10 border-red-500/20";
    }
    if (status === "bloqueado") {
      return "text-zinc-500 bg-zinc-900 border-zinc-700 line-through";
    }
    return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  };

  const getPlanColor = (plan: string) => {
    if (plan === "lenda") {
      return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    }
    if (plan === "atleta") {
      return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    }
    if (plan === "cardume") {
      return "text-blue-400 border-blue-500/30 bg-blue-500/10";
    }
    return "text-zinc-500 border-zinc-700 bg-zinc-900";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"
          >
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">
            Gestao de Socios
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="bg-zinc-900 border border-zinc-700 px-4 py-2 rounded-xl text-zinc-300 hover:text-white transition text-xs font-bold uppercase flex items-center gap-2"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">
                  Socios Lenda
                </p>
                <h3 className="text-2xl font-black text-yellow-500">
                  {stats.distPlanos.lenda}
                </h3>
              </div>
              <Crown className="text-yellow-500/20" size={32} />
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-yellow-500 h-full"
                style={{
                  width:
                    stats.total > 0
                      ? `${(stats.distPlanos.lenda / stats.total) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">
                  Ativos na Tela
                </p>
                <h3 className="text-2xl font-black text-emerald-500">
                  {stats.ativos}
                </h3>
              </div>
              <CheckCircle className="text-emerald-500/20" size={32} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">
              {stats.total > 0 ? Math.round((stats.ativos / stats.total) * 100) : 0}
              % da lista carregada
            </p>
          </div>

          <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-zinc-500 uppercase">Pendentes</p>
                <h3 className="text-2xl font-black text-red-500">{stats.pendentes}</h3>
              </div>
              <AlertCircle className="text-red-500/20" size={32} />
            </div>
            <p className="text-[10px] text-zinc-500 mt-2">Aguardando aprovacao</p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Buscar tubarao..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-emerald-500 outline-none transition"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {["Todos", "Lenda", "Atleta", "Bicho"].map((plano) => (
                <button
                  key={plano}
                  onClick={() => setFiltroPlano(plano)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition border ${
                    filtroPlano === plano
                      ? "bg-white text-black border-white"
                      : "bg-zinc-900 text-zinc-500 border-zinc-800 hover:text-zinc-300"
                  }`}
                >
                  {plano}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-black/40 text-zinc-500 font-bold uppercase">
                  <tr>
                    <th className="p-4">Aluno</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4 text-center">Turma</th>
                    <th className="p-4 text-center">Plano</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 text-zinc-300">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center">
                        <Loader2 className="animate-spin mx-auto text-emerald-500" />
                      </td>
                    </tr>
                  ) : usuariosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-10 text-center text-zinc-500">
                        Nenhum usuario encontrado.
                      </td>
                    </tr>
                  ) : (
                    usuariosFiltrados.map((user) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-zinc-800/50 transition ${
                          user.status === "bloqueado" ? "opacity-50" : ""
                        }`}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700 shrink-0 relative">
                              <Image
                                src={user.foto || "https://github.com/shadcn.png"}
                                alt={user.nome}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div>
                              <p className="font-bold text-white">{user.nome}</p>
                              {user.role === "master" && (
                                <span className="text-[8px] font-black uppercase text-red-500 bg-red-900/10 px-1 rounded border border-red-900/30">
                                  Admin Master
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-zinc-400">{user.email}</p>
                          {user.telefone && (
                            <Link
                              href={`https://wa.me/${user.telefone}`}
                              target="_blank"
                              className="text-emerald-500 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              {user.telefone} <ExternalLink size={8} />
                            </Link>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-zinc-950 px-2 py-1 rounded border border-zinc-800 font-mono">
                            {user.turma}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-1 rounded text-[9px] font-black uppercase border ${getPlanColor(user.plano)}`}
                          >
                            {user.plano}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div
                            className={`px-2 py-1 rounded-full border text-[9px] font-bold uppercase inline-flex items-center gap-1 ${getStatusColor(user.status)}`}
                          >
                            {user.status}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setEditingUser(user)}
                              className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded transition"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => toggleBlockUser(user)}
                              className={`p-2 rounded transition ${
                                user.status === "bloqueado"
                                  ? "text-emerald-500 hover:bg-emerald-500/10"
                                  : "text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                              }`}
                              title={user.status === "bloqueado" ? "Desbloquear" : "Bloquear acesso"}
                            >
                              {user.status === "bloqueado" ? (
                                <ShieldCheck size={16} />
                              ) : (
                                <Ban size={16} />
                              )}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="text-zinc-400 hover:text-red-500 p-2 hover:bg-zinc-800 rounded transition"
                              title="Deletar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {!loading && hasMore && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="w-full bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wide text-zinc-200 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Carregar mais usuarios
                </>
              )}
            </button>
          )}
        </section>
      </main>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Edit size={18} className="text-emerald-500" /> Gerenciar Socio
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">
                  Nome
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white"
                  value={editingUser.nome}
                  onChange={(event) =>
                    setEditingUser({ ...editingUser, nome: event.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">
                    Plano
                  </label>
                  <select
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                    value={editingUser.plano}
                    onChange={(event) =>
                      setEditingUser({
                        ...editingUser,
                        plano: event.target.value as Usuario["plano"],
                      })
                    }
                  >
                    <option value="lenda">Socio Lenda</option>
                    <option value="atleta">Socio Atleta</option>
                    <option value="cardume">Cardume</option>
                    <option value="bicho">Bicho Solto</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">
                    Status
                  </label>
                  <select
                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500"
                    value={editingUser.status}
                    onChange={(event) =>
                      setEditingUser({
                        ...editingUser,
                        status: event.target.value as Usuario["status"],
                      })
                    }
                  >
                    <option value="ativo">Ativo</option>
                    <option value="pendente">Pendente</option>
                    <option value="inadimplente">Inadimplente</option>
                    <option value="bloqueado">Bloqueado</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">
                  Turma
                </label>
                <input
                  type="text"
                  className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white"
                  value={editingUser.turma}
                  onChange={(event) =>
                    setEditingUser({ ...editingUser, turma: event.target.value })
                  }
                />
              </div>
            </div>

            <button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs uppercase transition shadow-lg flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Salvar alteracoes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
