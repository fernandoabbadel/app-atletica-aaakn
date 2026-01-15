"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, X, MousePointer2, Package, Check } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { collection, doc, increment, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";

interface Variante {
  id: string;
  tamanho: string;
  cor: string;
  estoque: number;
}

interface ProdutoLoja {
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
  tagLabel?: string;
  tagColor?: string;
  tagEffect?: "pulse" | "shine" | "none";
}

type CartItem = {
  productId: string;
  variantId: string;
  nome: string;
  preco: number;
  img: string;
  tamanho: string;
  cor: string;
  qtd: number;
};

const getTagColorClass = (color?: string) => {
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
      return "bg-zinc-700";
  }
};

export default function LojaPage() {
  const { addToast } = useToast();

  const [produtos, setProdutos] = useState<ProdutoLoja[]>([]);
  const [loading, setLoading] = useState(true);

  const [openProduto, setOpenProduto] = useState<ProdutoLoja | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [qtd, setQtd] = useState<number>(1);

  useEffect(() => {
    const q = query(collection(db, "produtos"), orderBy("nome"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        })) as ProdutoLoja[];
        setProdutos(lista);
        setLoading(false);
      },
      () => {
        setProdutos([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const produtosComEstoque = useMemo(() => {
    return produtos.map((p) => {
      const estoqueTotal = p.variantes?.reduce((acc, v) => acc + Number(v.estoque || 0), 0) || 0;
      return { ...p, estoqueTotal } as ProdutoLoja & { estoqueTotal: number };
    });
  }, [produtos]);

  const selectedVariant = useMemo(() => {
    if (!openProduto) return null;
    return openProduto.variantes?.find((v) => v.id === selectedVariantId) || null;
  }, [openProduto, selectedVariantId]);

  const selectedVariantStock = useMemo(() => {
    if (!selectedVariant) return 0;
    return Number(selectedVariant.estoque || 0);
  }, [selectedVariant]);

  const applyLocalClickIncrement = (productId: string) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === productId ? ({ ...p, cliques: Number(p.cliques || 0) + 1 } as any) : p))
    );

    setOpenProduto((prev) => {
      if (!prev) return prev;
      if (prev.id !== productId) return prev;
      return { ...prev, cliques: Number(prev.cliques || 0) + 1 };
    });
  };

  const handleOpenProduto = async (p: ProdutoLoja) => {
    setOpenProduto(p);
    setQtd(1);

    const firstVariant = p.variantes?.[0]?.id || "";
    setSelectedVariantId(firstVariant);

    if (!p.id) return;

    applyLocalClickIncrement(p.id);

    try {
      await updateDoc(doc(db, "produtos", p.id), { cliques: increment(1) });
    } catch (e: any) {
      addToast(
        "Não consegui gravar o clique no Firestore. Verifique regras (permission-denied) e autenticação.",
        "error"
      );
    }
  };

  const closeModal = () => {
    setOpenProduto(null);
    setSelectedVariantId("");
    setQtd(1);
  };

  const addToCart = () => {
    if (!openProduto) return;
    if (!selectedVariant) {
      addToast("Selecione uma variante (tamanho/cor).", "error");
      return;
    }
    if (qtd < 1) {
      addToast("Quantidade inválida.", "error");
      return;
    }
    if (qtd > selectedVariantStock) {
      addToast("Quantidade maior que o estoque da variante.", "error");
      return;
    }

    const item: CartItem = {
      productId: openProduto.id,
      variantId: selectedVariant.id,
      nome: openProduto.nome,
      preco: Number(openProduto.preco || 0),
      img: openProduto.img,
      tamanho: selectedVariant.tamanho,
      cor: selectedVariant.cor,
      qtd,
    };

    try {
      const raw = localStorage.getItem("cart");
      const cart: CartItem[] = raw ? JSON.parse(raw) : [];
      const idx = cart.findIndex((x) => x.productId === item.productId && x.variantId === item.variantId);

      if (idx >= 0) {
        cart[idx].qtd = Math.min(cart[idx].qtd + item.qtd, selectedVariantStock);
      } else {
        cart.push(item);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      addToast("Adicionado ao carrinho!", "success");
    } catch {
      addToast("Não foi possível salvar no carrinho.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition">
            <ArrowLeft size={20} className="text-zinc-400" />
          </Link>
          <div>
            <h1 className="text-lg font-black text-white uppercase tracking-tighter">Loja</h1>
            <p className="text-xs text-zinc-500 font-bold uppercase">Produtos oficiais</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/carrinho"
            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95"
          >
            <ShoppingBag size={16} /> Carrinho
          </Link>
        </div>
      </header>

      <main className="p-6">
        {loading && <div className="text-zinc-500 text-sm">Carregando produtos</div>}

        {!loading && !produtosComEstoque.length && (
          <div className="text-zinc-500 text-sm">Nenhum produto disponível ainda.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {produtosComEstoque.map((p: any) => {
            const emEstoque = Number(p.estoqueTotal || 0) > 0;

            return (
              <button
                key={p.id}
                onClick={() => handleOpenProduto(p)}
                className="text-left bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition group"
              >
                <div className="relative h-44 bg-black overflow-hidden">
                  <img
                    src={p.img}
                    className="w-full h-full object-cover opacity-95 group-hover:scale-[1.02] transition"
                  />

                  {!!p.tagLabel && (
                    <div
                      className={`absolute top-3 left-3 px-3 py-1 rounded text-white text-[10px] font-black uppercase ${getTagColorClass(
                        p.tagColor
                      )} ${p.tagEffect === "pulse" ? "animate-pulse" : ""}`}
                    >
                      {p.tagLabel}
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-bold uppercase text-zinc-200 flex items-center gap-1">
                      <Package size={14} /> {Number(p.estoqueTotal || 0)}
                    </span>
                    <span className="px-2 py-1 rounded bg-black/60 border border-white/10 text-[10px] font-bold uppercase text-zinc-200 flex items-center gap-1">
                      <MousePointer2 size={14} /> {Number(p.cliques || 0)}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-white">{p.nome}</h3>
                    <span className="text-[10px] font-bold uppercase text-zinc-500">{p.categoria}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-emerald-400 font-black text-lg">
                      R$ {Number(p.preco || 0).toFixed(2)}
                    </span>
                    {!!p.precoAntigo && Number(p.precoAntigo) > 0 && (
                      <span className="text-zinc-500 text-xs line-through font-bold">
                        R$ {Number(p.precoAntigo).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] font-bold uppercase">
                    {emEstoque ? (
                      <span className="text-emerald-500">Em estoque</span>
                    ) : (
                      <span className="text-red-500">Esgotado</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {openProduto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 p-6 space-y-6 my-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-black border border-zinc-800">
                  <img src={openProduto.img} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-black text-white text-lg">{openProduto.nome}</h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">
                    {openProduto.categoria} • {openProduto.lote || "Lote"}
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 rounded-xl overflow-hidden bg-black border border-zinc-800">
                  <img src={openProduto.img} className="w-full h-full object-cover" />
                </div>

                {!!openProduto.descricao && (
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                    <p className="text-sm text-zinc-200">{openProduto.descricao}</p>
                  </div>
                )}

                {!!openProduto.caracteristicas?.length && (
                  <div className="bg-black/30 border border-white/5 rounded-xl p-4 space-y-2">
                    <p className="text-[10px] font-black uppercase text-zinc-400">Características</p>
                    <div className="flex flex-wrap gap-2">
                      {openProduto.caracteristicas.map((c, idx) => (
                        <span
                          key={`${c}-${idx}`}
                          className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-300"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-5">
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Preço</p>
                      <p className="text-2xl font-black text-emerald-400">
                        R$ {Number(openProduto.preco || 0).toFixed(2)}
                      </p>
                    </div>

                    {!!openProduto.precoAntigo && Number(openProduto.precoAntigo) > 0 && (
                      <p className="text-sm font-bold text-zinc-500 line-through">
                        R$ {Number(openProduto.precoAntigo).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <p className="text-[10px] text-zinc-500 font-black uppercase">Selecione a variante</p>

                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {(openProduto.variantes || []).map((v) => {
                      const active = v.id === selectedVariantId;
                      const stock = Number(v.estoque || 0);

                      return (
                        <button
                          key={v.id}
                          onClick={() => {
                            setSelectedVariantId(v.id);
                            setQtd(1);
                          }}
                          className={`flex items-center justify-between p-3 rounded-lg border text-left transition ${
                            active
                              ? "bg-emerald-600/10 border-emerald-500 text-white"
                              : "bg-black/30 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase bg-zinc-900 border border-zinc-800 px-2 py-1 rounded">
                              {v.tamanho}
                            </span>
                            <span className="text-xs font-bold">{v.cor}</span>
                          </div>
                          <span className={`text-xs font-black ${stock > 0 ? "text-emerald-400" : "text-red-500"}`}>
                            {stock} un
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {!openProduto.variantes?.length && (
                    <p className="text-xs text-zinc-500">Produto sem variantes cadastradas.</p>
                  )}
                </div>

                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-zinc-500 font-black uppercase">Quantidade</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">
                      Estoque variante: {selectedVariantStock}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQtd((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg bg-black/30 border border-zinc-800 hover:border-zinc-700 transition font-black"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={qtd}
                      min={1}
                      max={Math.max(1, selectedVariantStock)}
                      onChange={(e) => setQtd(Number(e.target.value || 1))}
                      className="flex-1 h-10 rounded-lg bg-black/30 border border-zinc-800 px-3 text-white font-bold outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => setQtd((q) => Math.min(Math.max(1, selectedVariantStock), q + 1))}
                      className="w-10 h-10 rounded-lg bg-black/30 border border-zinc-800 hover:border-zinc-700 transition font-black"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={addToCart}
                    disabled={!selectedVariant || selectedVariantStock <= 0}
                    className={`w-full py-4 rounded-xl font-black text-xs uppercase transition flex items-center justify-center gap-2 ${
                      !selectedVariant || selectedVariantStock <= 0
                        ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                    }`}
                  >
                    <Check size={18} /> Adicionar ao carrinho
                  </button>

                  <p className="text-[10px] text-zinc-500">
                    O clique é gravado com increment no Firestore (contador atômico).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
