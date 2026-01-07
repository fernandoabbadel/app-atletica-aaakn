"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Star,
  X,
  Minus,
  Plus,
  CheckCircle,
  Truck,
} from "lucide-react";
import Link from "next/link";

// --- TIPAGEM ---
type Produto = {
  id: number;
  nome: string;
  preco: number;
  precoAntigo?: number;
  img: string;
  tag?: string;
  categoria: string;
  descricao: string;
  caracteristicas: string[];
  tamanhos?: string[];
  cores?: string[];
  nota: number;
  avaliacoes: number;
  lote?: string; // Ex: Coleção 2025
};

export default function LojaPage() {
  const [categoria, setCategoria] = useState("todos");
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [carrinhoCount, setCarrinhoCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Estados do Modal
  const [qtd, setQtd] = useState(1);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");

  // --- DADOS DOS PRODUTOS ---
  const produtos: Produto[] = [
    {
      id: 1,
      nome: "Camiseta AAAKN Preta",
      preco: 59.9,
      precoAntigo: 79.9,
      img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80",
      tag: "DESTAQUE",
      categoria: "VESTUÁRIO",
      descricao:
        "Camiseta oficial em malha 100% algodão com logo bordado no peito. Ideal para treinos e festas.",
      caracteristicas: [
        "100% algodão penteado",
        "Estampa Silk HD",
        "Gola careca reforçada",
        "Corte tradicional unissex",
      ],
      tamanhos: ["P", "M", "G", "GG", "XG"],
      nota: 4.8,
      avaliacoes: 124,
      lote: "Coleção 2026",
    },
    {
      id: 2,
      nome: "Moletom College Verde",
      preco: 189.9,
      precoAntigo: 240.0,
      img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
      tag: "-21% OFF",
      categoria: "VESTUÁRIO",
      descricao:
        "Moletom canguru super quente para os dias frios no campus. Forro peluciado.",
      caracteristicas: [
        "Moletom 3 cabos",
        "Capuz forrado",
        "Bolso canguru",
        "Punhos em ribana",
      ],
      tamanhos: ["P", "M", "G", "GG"],
      nota: 5.0,
      avaliacoes: 89,
      lote: "Últimas Peças",
    },
    {
      id: 3,
      nome: "Kit Calouro 2026",
      preco: 180.0,
      img: "https://images.unsplash.com/photo-1576186726580-a816e8b12896?w=800&q=80",
      tag: "NOVO",
      categoria: "KITS",
      descricao:
        "O kit completo para começar o ano com o pé direito. Inclui camiseta, caneca, tirante e sacochila.",
      caracteristicas: [
        "1 Camiseta Oficial",
        "1 Caneca 850ml",
        "1 Tirante Bordado",
        "1 Sacochila Impermeável",
      ],
      tamanhos: ["P", "M", "G", "GG"],
      nota: 4.9,
      avaliacoes: 210,
      lote: "Lote 1",
    },
    {
      id: 4,
      nome: "Caneca Tirante",
      preco: 45.0,
      img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
      categoria: "ACESSÓRIOS",
      descricao:
        "Caneca de alumínio 850ml com tirante personalizado. Indispensável nos jogos.",
      caracteristicas: [
        "Alumínio térmico",
        "850ml",
        "Tirante 40mm",
        "Pintura eletrostática",
      ],
      nota: 4.7,
      avaliacoes: 340,
      lote: "Pronta Entrega",
    },
    {
      id: 5,
      nome: "Boné Trucker",
      preco: 55.0,
      img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80",
      categoria: "ACESSÓRIOS",
      descricao: "Boné estilo americano com tela atrás. Regulagem snapback.",
      caracteristicas: [
        "Aba curva",
        "Tela respirável",
        "Fecho ajustável",
        "Bordado 3D",
      ],
      nota: 4.5,
      avaliacoes: 56,
      lote: "Coleção 2026",
    },
  ];

  const filtrados =
    categoria === "todos"
      ? produtos
      : produtos.filter((p) => p.categoria === categoria);

  // --- FUNÇÕES ---
  const openModal = (produto: Produto) => {
    setSelectedProduto(produto);
    setQtd(1);
    setTamanhoSelecionado(produto.tamanhos ? produto.tamanhos[0] : "");
  };

  const closeModal = () => {
    setSelectedProduto(null);
  };

  const addToCart = () => {
    setCarrinhoCount((prev) => prev + qtd);
    setShowNotification(true);
    closeModal();

    // Esconde notificação após 3 segundos
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-10 selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-20 bg-[#050505]/90 backdrop-blur-md flex justify-between items-center border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 text-zinc-400 hover:text-white transition rounded-full hover:bg-zinc-900"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="font-bold text-lg">Loja Oficial AAAKN</h1>
        </div>
        <button className="relative p-2 bg-zinc-900 rounded-full text-emerald-500 hover:bg-emerald-500/10 transition">
          <ShoppingCart size={20} />
          {carrinhoCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full animate-bounce">
              {carrinhoCount}
            </span>
          )}
        </button>
      </header>

      {/* NOTIFICAÇÃO TOAST */}
      {showNotification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300 w-[90%] max-w-md">
          <div className="bg-zinc-800 border border-emerald-500/50 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="bg-emerald-500 rounded-full p-1">
              <CheckCircle size={16} className="text-black" />
            </div>
            <div>
              <p className="text-sm font-bold">Adicionado ao carrinho!</p>
              <p className="text-[10px] text-zinc-400">
                Continue comprando ou finalize o pedido.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-6">
        {/* BANNER PROMO */}
        <div className="w-full h-32 rounded-2xl overflow-hidden relative border border-zinc-800">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent flex flex-col justify-center px-6">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
              Oferta Relâmpago
            </span>
            <h2 className="text-2xl font-black text-white w-2/3 leading-tight">
              Vista a camisa da sua Atlética
            </h2>
          </div>
        </div>

        {/* FILTROS */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {["todos", "KITS", "VESTUÁRIO", "ACESSÓRIOS"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${
                categoria === cat
                  ? "bg-emerald-600 border-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700"
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* GRID DE PRODUTOS */}
        <div className="grid grid-cols-2 gap-4">
          {filtrados.map((item) => (
            <div
              key={item.id}
              onClick={() => openModal(item)}
              className="bg-zinc-900 rounded-[1.5rem] overflow-hidden border border-zinc-800 group hover:border-emerald-500/50 transition cursor-pointer relative"
            >
              <div className="h-40 overflow-hidden relative">
                <img
                  src={item.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700 opacity-90 group-hover:opacity-100"
                />
                {item.tag && (
                  <span
                    className={`absolute top-2 left-2 text-[9px] font-black px-2 py-1 rounded shadow-lg ${
                      item.tag.includes("%")
                        ? "bg-red-500 text-white"
                        : "bg-black/60 backdrop-blur-md text-white border border-white/10"
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">
                    {item.categoria}
                  </span>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-bold text-zinc-300">
                      {item.nota}
                    </span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-white truncate mb-2 leading-tight">
                  {item.nome}
                </h3>
                <div className="flex flex-col">
                  {item.precoAntigo && (
                    <span className="text-[10px] text-zinc-500 line-through">
                      R$ {item.precoAntigo.toFixed(2)}
                    </span>
                  )}
                  <div className="flex justify-between items-end">
                    <span className="text-emerald-400 font-black text-lg">
                      R$ {item.preco.toFixed(2)}
                    </span>
                    <div className="bg-white text-black p-1.5 rounded-full hover:bg-emerald-400 transition shadow-lg">
                      <ShoppingBag size={14} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- MODAL DE DETALHES DO PRODUTO --- */}
      {selectedProduto && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          {/* Overlay Escuro */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>

          {/* Conteúdo do Modal */}
          <div className="bg-[#0a0a0a] w-full sm:max-w-md h-[90vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2rem] sm:rounded-[2rem] border border-zinc-800 relative z-10 overflow-y-auto animate-in slide-in-from-bottom-10 duration-300 flex flex-col">
            {/* Botão Fechar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 bg-black/50 p-2 rounded-full text-white backdrop-blur-md border border-white/10 hover:bg-white hover:text-black transition"
            >
              <X size={20} />
            </button>

            {/* Imagem Grande */}
            <div className="h-72 shrink-0 relative">
              <img
                src={selectedProduto.img}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>
              <div className="absolute bottom-4 left-6">
                <span className="bg-emerald-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase mb-2 inline-block">
                  {selectedProduto.lote}
                </span>
                <h2 className="text-2xl font-black text-white leading-tight w-3/4">
                  {selectedProduto.nome}
                </h2>
              </div>
            </div>

            {/* Corpo do Modal */}
            <div className="p-6 space-y-6">
              {/* Preço e Avaliação */}
              <div className="flex justify-between items-center">
                <div>
                  {selectedProduto.precoAntigo && (
                    <span className="text-sm text-zinc-500 line-through block">
                      R$ {selectedProduto.precoAntigo.toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl font-black text-emerald-400">
                    R$ {selectedProduto.preco.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-yellow-500 justify-end">
                    <Star size={16} fill="currentColor" />
                    <span className="text-lg font-bold text-white">
                      {selectedProduto.nota}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {selectedProduto.avaliacoes} avaliações
                  </span>
                </div>
              </div>
              {/* Seleção de Tamanho (Se houver) */}
              {selectedProduto.tamanhos && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    Selecione o Tamanho
                  </span>
                  <div className="flex gap-3">
                    {selectedProduto.tamanhos.map((tam) => (
                      <button
                        key={tam}
                        onClick={() => setTamanhoSelecionado(tam)}
                        className={`w-12 h-12 rounded-xl font-bold text-sm border flex items-center justify-center transition ${
                          tamanhoSelecionado === tam
                            ? "bg-white text-black border-white"
                            : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        {tam}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {/* Descrição e Características */}
              <div className="space-y-4">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {selectedProduto.descricao}
                </p>

                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                  <h4 className="text-xs font-bold text-white mb-2 uppercase">
                    Características
                  </h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {selectedProduto.caracteristicas.map((car, i) => (
                      <li
                        key={i}
                        className="text-[11px] text-zinc-400 flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        {car}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="h-20"></div>{" "}
              {/* Espaço extra para scroll não cobrir botão */}
            </div>

            {/* Barra Fixa Inferior (Adicionar ao Carrinho) */}
            <div className="absolute bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-zinc-800 p-4 flex gap-4 items-center">
              {/* Contador */}
              <div className="flex items-center gap-3 bg-zinc-900 px-4 py-3 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setQtd(Math.max(1, qtd - 1))}
                  className="text-zinc-400 hover:text-white"
                >
                  <Minus size={18} />
                </button>
                <span className="font-bold text-white w-4 text-center">
                  {qtd}
                </span>
                <button
                  onClick={() => setQtd(qtd + 1)}
                  className="text-zinc-400 hover:text-white"
                >
                  <Plus size={18} />
                </button>
              </div>

              {/* Botão Adicionar */}
              <button
                onClick={addToCart}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm py-3.5 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition active:scale-95 flex justify-center items-center gap-2"
              >
                <ShoppingBag size={18} />
                ADICIONAR • R$ {(selectedProduto.preco * qtd).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
