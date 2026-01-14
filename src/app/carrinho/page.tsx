"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Trash2,
  Ticket,
  Plus,
  Minus,
  CreditCard,
  Lock,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "../../context/ToastContext"; // <--- NOVO

interface CartItem {
  id: number;
  nome: string;
  lote: string;
  preco: number;
  imagem: string;
  quantidade: number;
}

export default function CarrinhoPage() {
  const router = useRouter();
  const { addToast } = useToast(); // <--- NOVO
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const [items, setItems] = useState<CartItem[]>([
    {
      id: 1,
      nome: "INTERMED 2026",
      lote: "Lote 2 - Open Bar",
      preco: 85.0,
      imagem:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&q=80",
      quantidade: 1,
    },
    {
      id: 2,
      nome: "Caneca Alumínio 850ml",
      lote: "Acessório",
      preco: 35.0,
      imagem:
        "https://images.unsplash.com/photo-1577937927133-66ef06ac992a?w=200&q=80",
      quantidade: 2,
    },
  ]);

  const [cupom, setCupom] = useState("");
  const [desconto, setDesconto] = useState(0);

  // --- LÓGICA DO CARRINHO ---
  const updateQuantity = (id: number, delta: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantidade + delta);
          return { ...item, quantidade: newQty };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id));
    addToast("Item removido do carrinho", "info"); // <--- TOAST AQUI
  };

  const aplicarCupom = () => {
    if (cupom.toUpperCase() === "TUBA10") {
      setDesconto(10);
      addToast("Cupom de 10% aplicado!", "success"); // <--- TOAST AQUI
    } else {
      addToast("Cupom inválido ou expirado", "error"); // <--- TOAST AQUI
    }
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.preco * item.quantidade,
    0
  );
  const taxa = subtotal * 0.1;
  const total = subtotal + taxa - subtotal * (desconto / 100);

  // --- LÓGICA DE CHECKOUT ---
  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Redireciona para a página de pagamento que criamos
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-40 selection:bg-emerald-500/30 relative">
      {/* HEADER */}
      <header className="p-4 sticky top-0 z-30 flex items-center gap-4 bg-[#050505]/90 backdrop-blur-md border-b border-white/5">
        <Link
          href="/eventos"
          className="p-2 -ml-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="font-black text-xl italic uppercase tracking-tighter text-white">
          Seu Carrinho
        </h1>
        <span className="ml-auto bg-emerald-500 text-black text-xs font-bold px-2 py-1 rounded-full">
          {items.length} itens
        </span>
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {/* LISTA DE ITENS */}
        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 shrink-0">
                  <img
                    src={item.imagem}
                    className="w-full h-full object-cover"
                    alt={item.nome}
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white uppercase leading-tight">
                      {item.nome}
                    </h3>
                    <p className="text-xs text-zinc-500">{item.lote}</p>
                  </div>
                  <div className="flex justify-between items-end">
                    <p className="font-black text-emerald-400">
                      R$ {item.preco.toFixed(2).replace(".", ",")}
                    </p>

                    <div className="flex items-center gap-3 bg-black rounded-lg p-1 border border-zinc-800">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1 hover:text-emerald-500 transition"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">
                        {item.quantidade}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1 hover:text-emerald-500 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-red-500 transition self-start p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={48} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500 mb-6">Seu carrinho está vazio.</p>
            <Link
              href="/eventos"
              className="bg-emerald-500 text-black px-6 py-3 rounded-xl font-bold uppercase text-sm hover:bg-emerald-400 transition inline-flex items-center gap-2"
            >
              <Ticket size={18} /> Ver Eventos
            </Link>
          </div>
        )}

        {/* CUPOM */}
        {items.length > 0 && (
          <div className="bg-zinc-900/30 p-4 rounded-2xl border border-zinc-800 flex gap-2">
            <div className="flex-1 relative">
              <Ticket
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="text"
                placeholder="Cupom de desconto"
                className="w-full bg-black/50 border border-zinc-700 rounded-xl py-3 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none transition uppercase text-white"
                value={cupom}
                onChange={(e) => setCupom(e.target.value)}
              />
            </div>
            <button
              onClick={aplicarCupom}
              className="px-4 font-bold text-sm bg-zinc-800 rounded-xl hover:bg-emerald-500 hover:text-black transition border border-zinc-700 hover:border-emerald-500"
            >
              Aplicar
            </button>
          </div>
        )}

        {/* RESUMO DO PEDIDO */}
        {items.length > 0 && (
          <div className="bg-zinc-900/50 p-5 rounded-3xl border border-zinc-800 space-y-3">
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Subtotal</span>
              <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Taxa de Serviço (10%)</span>
              <span>R$ {taxa.toFixed(2).replace(".", ",")}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between text-sm text-emerald-500 font-bold">
                <span>Desconto ({desconto}%)</span>
                <span>
                  - R${" "}
                  {(subtotal * (desconto / 100)).toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
            <div className="border-t border-zinc-800 my-2 pt-2 flex justify-between items-end">
              <span className="text-zinc-300 font-bold">Total</span>
              <span className="text-2xl font-black text-white">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER FIXO (CHECKOUT) */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[#050505] border-t border-zinc-800 p-4 pb-8 z-40">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={handleCheckout}
              disabled={isCheckingOut}
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                isCheckingOut
                  ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
              }`}
            >
              {isCheckingOut ? (
                <>
                  <Loader2 size={24} className="animate-spin" />{" "}
                  Redirecionando...
                </>
              ) : (
                <>
                  <CreditCard size={20} /> Finalizar Compra
                </>
              )}
            </button>
            <p className="text-center text-[10px] text-zinc-600 mt-3 flex items-center justify-center gap-1">
              <Lock size={10} /> Pagamento 100% Seguro via AAAKN Pay
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
