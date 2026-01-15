"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Tag,
  DollarSign,
  ShoppingBag,
  Package,
  AlertCircle,
  Search,
  UploadCloud,
  X,
  PieChart,
  BarChart3,
  Sparkles,
  Zap,
  Flame,
  Check,
  TrendingUp,
  Users,
  MousePointer2,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { uploadImage } from "../../../lib/upload";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

interface Variante {
  id: string;
  tamanho: string;
  cor: string;
  estoque: number;
}

interface ProdutoAdmin {
  id: string;
  nome: string;
  preco: number;
  precoAntigo?: number;
  categoria: string;
  img: string;
  vendidos: number;
  cliques: number;
  variantes: Variante[];
  lote: string;
  descricao: string;
  caracteristicas: string[];
  estoque?: number;
  tagLabel?: string;
  tagColor?: string;
  tagEffect?: "pulse" | "shine" | "none";
}

type CategoriaDoc = {
  id: string;
  nome: string;
  createdAt?: any;
};

type OrderDoc = {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  total?: number;
  createdAt?: any;
};

const TAG_OPTIONS = [
  { label: "Sem Etiqueta", value: "none", color: "gray" },
  { label: "OFERTA 🔥", value: "promo", color: "red", effect: "pulse" },
  { label: "NOVO ✨", value: "new", color: "emerald", effect: "shine" },
  { label: "ÚLTIMAS ⚠️", value: "last", color: "orange", effect: "pulse" },
  { label: "EXCLUSIVO 💎", value: "exclusive", color: "purple", effect: "shine" },
];

const DEFAULT_CATEGORIES = ["Vestuário", "Acessórios", "Kits", "Ingressos"];

export default function AdminLojaPage() {
  const { addToast } = useToast();

  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [orders, setOrders] = useState<OrderDoc[]>([]);

  const [activeTab, setActiveTab] = useState<"dashboard" | "produtos">("dashboard");
  const [showModalProduto, setShowModalProduto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<ProdutoAdmin>>({
    nome: "",
    preco: 0,
    precoAntigo: 0,
    categoria: "Vestuário",
    img: "",
    lote: "Lote 1",
    descricao: "",
    caracteristicas: [],
    tagLabel: "",
    tagColor: "red",
    tagEffect: "none",
  });

  const [featuresInput, setFeaturesInput] = useState("");
  const [variantesTemp, setVariantesTemp] = useState<Variante[]>([]);
  const [novaVariante, setNovaVariante] = useState({ tamanho: "", cor: "", estoque: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categorias, setCategorias] = useState<CategoriaDoc[]>([]);
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [categoriaNome, setCategoriaNome] = useState("");
  const [savingCategoria, setSavingCategoria] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "produtos"), orderBy("nome"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProdutoAdmin[];
      setProdutos(lista);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "categorias"), orderBy("nome"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CategoriaDoc[];
        setCategorias(lista);
      },
      () => setCategorias([])
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as OrderDoc[];
        setOrders(lista);
      },
      () => setOrders([])
    );
    return () => unsubscribe();
  }, []);

  const allCategories = useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_CATEGORIES.forEach((c) => map.set(c.toLowerCase(), c));
    categorias.forEach((c) => {
      if (!c?.nome) return;
      const norm = String(c.nome).trim();
      if (!norm) return;
      const key = norm.toLowerCase();
      if (!map.has(key)) map.set(key, norm);
    });
    return Array.from(map.values());
  }, [categorias]);

  const stats = useMemo(() => {
    let totalEstoqueItens = 0;
    let valorFinanceiroEstoque = 0;
    const catCount: Record<string, number> = {};
    const catSales: Record<string, number> = {};

    produtos.forEach((p) => {
      const pEstoque =
        p.variantes?.reduce((acc, v) => acc + (Number(v.estoque) || 0), 0) || 0;
      totalEstoqueItens += pEstoque;
      valorFinanceiroEstoque += pEstoque * Number(p.preco || 0);

      const cat = p.categoria || "Sem categoria";
      catCount[cat] = (catCount[cat] || 0) + 1;
      catSales[cat] = (catSales[cat] || 0) + (Number(p.vendidos) || 0);
    });

    return { totalEstoqueItens, valorFinanceiroEstoque, catCount, catSales };
  }, [produtos]);

  const totalVendas = useMemo(() => {
    return produtos.reduce((a, b) => a + (Number(b.vendidos) || 0), 0);
  }, [produtos]);

  const maxCatCount = useMemo(() => {
    const values = Object.values(stats.catCount);
    return values.length ? Math.max(...values) : 1;
  }, [stats.catCount]);

  const maxCatSales = useMemo(() => {
    const values = Object.values(stats.catSales);
    return values.length ? Math.max(...values) : 1;
  }, [stats.catSales]);

  const topBuyers = useMemo(() => {
    if (!orders?.length) return [];
    const acc: Record<string, { key: string; nome: string; compras: number; total: number }> = {};

    orders.forEach((o) => {
      const key = o.userId || o.userEmail || o.userName || "desconhecido";
      const nome = o.userName || o.userEmail || "Cliente";
      const total = Number(o.total || 0);

      if (!acc[key]) acc[key] = { key, nome, compras: 0, total: 0 };
      acc[key].compras += 1;
      acc[key].total += total;
    });

    return Object.values(acc).sort((a, b) => b.total - a.total).slice(0, 6);
  }, [orders]);

  const handleOpenCreate = () => {
    setFormData({
      nome: "",
      preco: 0,
      precoAntigo: 0,
      categoria: allCategories[0] || "Vestuário",
      img: "",
      lote: "Lote 1",
      descricao: "",
      caracteristicas: [],
      tagLabel: "",
      tagColor: "red",
      tagEffect: "none",
    });
    setFeaturesInput("");
    setVariantesTemp([]);
    setIsEditing(false);
    setShowModalProduto(true);
  };

  const handleOpenEdit = (produtoId: string) => {
    const prod = produtos.find((p) => p.id === produtoId);
    if (!prod) return;

    setFormData(prod);
    setFeaturesInput(prod.caracteristicas ? prod.caracteristicas.join(", ") : "");
    setVariantesTemp(prod.variantes || []);
    setIsEditing(true);
    setShowModalProduto(true);
  };

  const handleAddVariante = () => {
    if (!novaVariante.tamanho || !novaVariante.cor) return;
    setVariantesTemp([...variantesTemp, { id: `sku-${Date.now()}`, ...novaVariante }]);
    setNovaVariante({ tamanho: "", cor: "", estoque: 0 });
  };

  const handleRemoveVariante = (id: string) => {
    setVariantesTemp((prev) => prev.filter((v) => v.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { url } = await uploadImage(file, "produtos");
      if (url) {
        setFormData((prev) => ({ ...prev, img: url }));
        addToast("Imagem carregada!", "success");
      }
    } catch {
      addToast("Falha ao subir imagem.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduto = async () => {
    if (saving) return;
    if (!formData.nome || !formData.preco) {
      addToast("Nome e Preço são obrigatórios!", "error");
      return;
    }

    setSaving(true);

    const estoqueTotal = variantesTemp.reduce((acc, curr) => acc + Number(curr.estoque || 0), 0);
    const caracteristicasArray = featuresInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s !== "");

    const produtoPayload = {
      nome: String(formData.nome),
      preco: Number(formData.preco),
      precoAntigo: Number(formData.precoAntigo || 0),
      categoria: String(formData.categoria || allCategories[0] || "Vestuário"),
      img: String(formData.img || "https://github.com/shadcn.png"),
      vendidos: isEditing ? Number(formData.vendidos || 0) : 0,
      cliques: isEditing ? Number(formData.cliques || 0) : 0,
      lote: String(formData.lote || ""),
      descricao: String(formData.descricao || ""),
      caracteristicas: caracteristicasArray,
      variantes: variantesTemp,
      estoque: estoqueTotal,
      tagLabel: String(formData.tagLabel || ""),
      tagColor: String(formData.tagColor || "gray"),
      tagEffect: (formData.tagEffect || "none") as "pulse" | "shine" | "none",
      updatedAt: serverTimestamp(),
    };

    try {
      if (isEditing && formData.id) {
        await updateDoc(doc(db, "produtos", formData.id), produtoPayload);
        addToast("Produto atualizado!", "success");
      } else {
        await addDoc(collection(db, "produtos"), { ...produtoPayload, createdAt: serverTimestamp() });
        addToast("Produto cadastrado!", "success");
      }
      setShowModalProduto(false);
    } catch {
      addToast("Erro ao salvar.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduto = async (id: string) => {
    if (!confirm("Deseja apagar este produto?")) return;
    try {
      await deleteDoc(doc(db, "produtos", id));
      addToast("Removido.", "info");
    } catch {
      addToast("Erro ao excluir.", "error");
    }
  };

  const normalizeCategoria = (s: string) => {
    const raw = String(s || "").trim();
    if (!raw) return "";
    return raw.replace(/\s+/g, " ");
  };

  const handleCreateCategoria = async () => {
    const nome = normalizeCategoria(categoriaNome);
    if (!nome) {
      addToast("Digite o nome da categoria.", "error");
      return;
    }

    const exists = allCategories.some((c) => c.toLowerCase() === nome.toLowerCase());
    if (exists) {
      addToast("Essa categoria já existe.", "info");
      return;
    }

    if (savingCategoria) return;
    setSavingCategoria(true);

    try {
      await addDoc(collection(db, "categorias"), { nome, createdAt: serverTimestamp() });
      setCategoriaNome("");
      addToast("Categoria criada!", "success");
    } catch {
      addToast("Erro ao criar categoria.", "error");
    } finally {
      setSavingCategoria(false);
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm("Deseja apagar esta categoria?")) return;

    try {
      await deleteDoc(doc(db, "categorias", id));
      addToast("Categoria removida.", "info");
    } catch {
      addToast("Erro ao remover categoria.", "error");
    }
  };

  const getTagColorClass = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-600";
      case "emerald":
        return "bg-emerald-600";
      case "orange":
        return "bg-orange-600";
      case "purple":
        return "bg-purple-600";
      default:
        return "bg-zinc-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestão da Loja</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModalCategoria(true)}
            className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-zinc-700 transition"
          >
            <Tag size={16} /> Nova Categoria
          </button>

          <button
            onClick={handleOpenCreate}
            className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <Plus size={16} /> Novo Produto
          </button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <div className="flex border-b border-zinc-800 gap-4 overflow-x-auto">
          {["dashboard", "produtos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-bold border-b-2 transition capitalize flex items-center gap-2 ${
                activeTab === tab
                  ? "border-emerald-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "dashboard" ? <PieChart size={16} /> : <Package size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Package size={48} />
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase">Itens em Estoque (Total)</p>
                <p className="text-3xl font-black text-white mt-2">
                  {stats.totalEstoqueItens}{" "}
                  <span className="text-xs text-zinc-500 font-normal uppercase">Unidades</span>
                </p>
              </div>

              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <DollarSign size={48} />
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase">Patrimônio em Gôndola</p>
                <p className="text-3xl font-black text-emerald-400 mt-2">
                  R$ {stats.valorFinanceiroEstoque.toLocaleString("pt-BR")}
                </p>
              </div>

              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp size={48} />
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase">Giro de Vendas</p>
                <p className="text-3xl font-black text-blue-400 mt-2">
                  {totalVendas}{" "}
                  <span className="text-xs text-zinc-500 font-normal uppercase">Saídas</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  <MousePointer2 size={16} className="text-blue-500" /> Mais Clicados (Desejo)
                </h3>
                <div className="space-y-4">
                  {produtos
                    .slice()
                    .sort((a, b) => (b.cliques || 0) - (a.cliques || 0))
                    .slice(0, 4)
                    .map((p, i) => (
                      <div key={p.id} className="flex items-center gap-4">
                        <span className="text-lg font-black text-zinc-800">#{i + 1}</span>
                        <div className="w-10 h-10 rounded-lg bg-black overflow-hidden">
                          <img src={p.img} className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-white">{p.nome}</p>
                          <p className="text-[10px] text-zinc-500">{p.cliques || 0} visualizações</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  <Users size={16} className="text-emerald-500" /> Tubarões VIP (Clientes)
                </h3>
                <div className="space-y-4">
                  {(topBuyers.length
                    ? topBuyers
                    : [
                        { key: "mock1", nome: "Gabriel Silva", compras: 12, total: 840 },
                        { key: "mock2", nome: "Amanda Costa", compras: 8, total: 520 },
                        { key: "mock3", nome: "Ricardo Paz", compras: 5, total: 310 },
                      ]
                  ).map((u: any, i: number) => (
                    <div
                      key={u.key || i}
                      className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold text-xs">
                          {String(u.nome || "C").charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{u.nome}</p>
                          <p className="text-[10px] text-zinc-500">{u.compras} pedidos</p>
                        </div>
                      </div>
                      <p className="text-xs font-black text-emerald-400">
                        R$ {Number(u.total || 0).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  <Zap size={16} className="text-purple-500" /> Inventário por Categoria
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.catCount)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, count]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 mb-1">
                          <span>{cat}</span>
                          <span>{count} Produtos</span>
                        </div>
                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-600"
                            style={{ width: `${(count / maxCatCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-tighter">
                  <Flame size={16} className="text-red-500" /> Top Categorias (Vendas)
                </h3>
                <div className="space-y-3">
                  {Object.entries(stats.catSales)
                    .sort((a, b) => b[1] - a[1])
                    .map(([cat, sales]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400 mb-1">
                          <span>{cat}</span>
                          <span>{sales} Vendas</span>
                        </div>
                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                          <div
                            className="h-full bg-red-600"
                            style={{ width: `${(sales / maxCatSales) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "produtos" && (
          <div className="grid grid-cols-1 gap-3 animate-in fade-in">
            {produtos.map((prod) => {
              const somaEstoque =
                prod.variantes?.reduce((a, b) => a + Number(b.estoque), 0) || 0;

              return (
                <div
                  key={prod.id}
                  className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg bg-black overflow-hidden border border-zinc-800">
                      <img src={prod.img} className="w-full h-full object-cover" />
                      {prod.tagLabel && (
                        <div
                          className={`absolute bottom-0 w-full text-[8px] font-black text-center text-white py-0.5 ${getTagColorClass(
                            prod.tagColor || "gray"
                          )}`}
                        >
                          {prod.tagLabel}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{prod.nome}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-500 mt-1 uppercase font-bold">
                        <span className="bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
                          {prod.categoria}
                        </span>
                        <span className="flex items-center gap-1">
                          Estoque:{" "}
                          <strong className={somaEstoque < 10 ? "text-red-500" : "text-emerald-500"}>
                            {somaEstoque} un
                          </strong>
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          Total:{" "}
                          <strong className="text-zinc-300">
                            R$ {(somaEstoque * prod.preco).toLocaleString("pt-BR")}
                          </strong>
                        </span>
                      </div>
                      <p className="text-emerald-400 font-bold text-sm mt-1">
                        Unitário: R$ {prod.preco.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(prod.id)}
                      className="p-2.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduto(prod.id)}
                      className="p-2.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showModalCategoria && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-xl rounded-2xl border border-zinc-800 p-6 space-y-5 my-10 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="font-bold text-white text-lg flex items-center gap-2">
                <Tag size={20} className="text-emerald-500" /> Categorias
              </h2>
              <button
                onClick={() => setShowModalCategoria(false)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 font-bold uppercase block">Nova Categoria</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none focus:border-emerald-500"
                  placeholder="Ex: Canecas"
                  value={categoriaNome}
                  onChange={(e) => setCategoriaNome(e.target.value)}
                />
                <button
                  onClick={handleCreateCategoria}
                  disabled={savingCategoria}
                  className="bg-emerald-600 text-white px-4 rounded-lg text-xs font-black uppercase hover:bg-emerald-500 transition disabled:opacity-60"
                >
                  {savingCategoria ? "Salvando..." : "Criar"}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-bold uppercase">Categorias cadastradas</p>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {categorias.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-white/5"
                  >
                    <p className="text-sm font-bold text-white">{c.nome}</p>
                    <button
                      onClick={() => handleDeleteCategoria(c.id)}
                      className="p-2 bg-zinc-900 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
                {!categorias.length && (
                  <p className="text-xs text-zinc-500">
                    Nenhuma categoria no Firestore ainda. As categorias padrão continuam disponíveis.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800">
              <button
                onClick={() => setShowModalCategoria(false)}
                className="w-full py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {showModalProduto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 p-6 space-y-6 my-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <h2 className="font-bold text-white text-xl flex items-center gap-2">
                <ShoppingBag size={24} className="text-emerald-500" /> {isEditing ? "Editar" : "Novo"} Produto
              </h2>
              <button
                onClick={() => setShowModalProduto(false)}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div
                  className="border-2 border-dashed border-zinc-700 rounded-xl h-56 flex flex-col items-center justify-center bg-black/40 hover:bg-black/60 transition cursor-pointer relative group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-emerald-500 uppercase font-black">Subindo...</span>
                    </div>
                  ) : formData.img ? (
                    <>
                      <img src={String(formData.img)} className="w-full h-full object-contain p-2" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <span className="text-xs font-bold text-white uppercase bg-black px-3 py-1 rounded-full">Trocar Foto</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover:text-emerald-500 transition">
                      <UploadCloud size={40} />
                      <span className="text-xs font-bold uppercase">Foto do Produto</span>
                    </div>
                  )}

                  {formData.tagLabel && (
                    <div
                      className={`absolute top-2 left-2 px-3 py-1 rounded shadow-lg text-white text-[10px] font-black uppercase ${getTagColorClass(
                        String(formData.tagColor || "gray")
                      )} ${formData.tagEffect === "pulse" ? "animate-pulse" : ""}`}
                    >
                      {formData.tagLabel}
                    </div>
                  )}
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <label className="text-[10px] text-emerald-500 font-bold uppercase mb-3 flex items-center gap-2">
                    <Sparkles size={12} /> Etiquetas Visuais
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TAG_OPTIONS.map((tag) => (
                      <button
                        key={tag.value}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tagLabel: tag.value === "none" ? "" : tag.label,
                            tagColor: tag.color,
                            tagEffect: (tag as any).effect,
                          })
                        }
                        className={`text-[10px] font-bold px-2 py-2 rounded border transition text-center ${
                          (formData.tagLabel === tag.label) || (tag.value === "none" && !formData.tagLabel)
                            ? "bg-zinc-800 border-emerald-500 text-white"
                            : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600"
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Preço Atual</label>
                    <input
                      type="number"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-lg font-bold text-white outline-none focus:border-emerald-500"
                      value={Number(formData.preco || 0)}
                      onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Preço Riscado</label>
                    <input
                      type="number"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-lg font-bold text-zinc-400 outline-none"
                      value={Number(formData.precoAntigo || 0)}
                      onChange={(e) => setFormData({ ...formData, precoAntigo: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Título do Produto</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                    value={String(formData.nome || "")}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Categoria</label>
                    <select
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-300 outline-none"
                      value={String(formData.categoria || allCategories[0] || "Vestuário")}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    >
                      {allCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Lote</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white outline-none"
                      placeholder="Ex: Lote 1"
                      value={String(formData.lote || "")}
                      onChange={(e) => setFormData({ ...formData, lote: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase block mb-1 text-emerald-500">
                    Detalhes Técnicos (Virgula)
                  </label>
                  <input
                    type="text"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none"
                    placeholder="100% Algodão, Unissex, Silk HD"
                    value={featuresInput}
                    onChange={(e) => setFeaturesInput(e.target.value)}
                  />
                </div>

                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center mb-3 text-[10px] font-bold uppercase text-zinc-500">
                    <span>Grade & Estoque</span>
                    <span className="text-emerald-500">
                      Total: {variantesTemp.reduce((a, b) => a + Number(b.estoque || 0), 0)}
                    </span>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Tam"
                      className="w-16 bg-black border border-zinc-700 rounded p-2 text-xs text-white text-center uppercase"
                      value={novaVariante.tamanho}
                      onChange={(e) => setNovaVariante({ ...novaVariante, tamanho: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="Cor"
                      className="flex-1 bg-black border border-zinc-700 rounded p-2 text-xs text-white"
                      value={novaVariante.cor}
                      onChange={(e) => setNovaVariante({ ...novaVariante, cor: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Qtd"
                      className="w-16 bg-black border border-zinc-700 rounded p-2 text-xs text-white text-center"
                      value={novaVariante.estoque || ""}
                      onChange={(e) => setNovaVariante({ ...novaVariante, estoque: Number(e.target.value) })}
                    />
                    <button
                      onClick={handleAddVariante}
                      className="bg-emerald-600 px-3 rounded text-white font-bold hover:bg-emerald-500 transition"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {variantesTemp.map((v) => (
                      <div
                        key={v.id}
                        className="flex justify-between items-center text-xs bg-black p-2 rounded border border-zinc-800"
                      >
                        <div className="flex items-center gap-2">
                          <span className="bg-zinc-800 px-1.5 rounded font-bold">{v.tamanho}</span>
                          <span>{v.cor}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 font-bold">{v.estoque} un</span>
                          <X
                            size={14}
                            className="cursor-pointer text-zinc-600 hover:text-red-500"
                            onClick={() => handleRemoveVariante(v.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Descrição da Vitrine</label>
                  <textarea
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-emerald-500 outline-none h-20 resize-none"
                    value={String(formData.descricao || "")}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-zinc-800">
              <button
                onClick={() => setShowModalProduto(false)}
                className="flex-1 py-4 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition"
              >
                Sair
              </button>
              <button
                onClick={handleSaveProduto}
                disabled={saving}
                className="flex-1 py-4 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition flex items-center justify-center gap-2"
              >
                {saving ? "Salvando..." : (
                  <>
                    <Check size={18} /> Finalizar Produto
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
