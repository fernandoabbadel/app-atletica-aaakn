"use client";

import React, { useCallback, useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft, Plus, Trash2, Edit, Tag, ShoppingBag,
  Package, UploadCloud, X, PieChart,
  MessageSquare, Star, CheckCircle, ExternalLink, XCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import { uploadImage } from "../../../lib/upload";
import {
  approveStoreOrder,
  createStoreCategory,
  deleteStoreProduct,
  fetchAdminStoreBundle,
  setStoreOrderStatus,
  setStoreReviewStatus,
  upsertStoreProduct,
} from "../../../lib/storeService";
import {
  Timestamp,
} from "firebase/firestore";

// --- TIPAGEM ---
interface Variante {
  id: string; tamanho: string; cor: string; estoque: number;
}

interface ProdutoAdmin {
  id: string; nome: string; preco: number; precoAntigo?: number;
  categoria: string; img: string; vendidos: number; cliques: number;
  variantes: Variante[]; lote: string; descricao: string;
  caracteristicas: string[]; estoque?: number;
  tagLabel?: string; tagColor?: string; tagEffect?: "pulse" | "shine" | "none";
}

interface Pedido {
    id: string;
    userId: string; userName: string; productId: string; productName: string;
    price: number; status: 'pendente' | 'approved' | 'rejected';
    createdAt?: Timestamp | null; approvedBy?: string;
}

interface Review {
    id: string; productId: string; userId: string; userName: string;
    rating: number; comment: string; approved: boolean; createdAt?: Timestamp | null;
    status: 'pending' | 'approved' | 'rejected';
}

// Interface para Categorias do Firestore
interface CategoriaData {
    id: string;
    nome: string;
}

const DEFAULT_CATEGORIES = ["VestuÃ¡rio", "AcessÃ³rios", "Kits", "Ingressos"];

export default function AdminLojaPage() {
  const { addToast } = useToast();
  const { user } = useAuth(); // Admin Logado

  // Estados
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categorias, setCategorias] = useState<CategoriaData[]>([]);
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "produtos" | "pedidos" | "reviews">("dashboard");
  const [showModalProduto, setShowModalProduto] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Produto
  const [formData, setFormData] = useState<Partial<ProdutoAdmin>>({});
  const [featuresInput, setFeaturesInput] = useState("");
  const [variantesTemp, setVariantesTemp] = useState<Variante[]>([]);
  const [novaVariante, setNovaVariante] = useState({ tamanho: "", cor: "", estoque: 0 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Categorias
  const [showModalCategoria, setShowModalCategoria] = useState(false);
  const [categoriaNome, setCategoriaNome] = useState("");
  const [savingCategoria, setSavingCategoria] = useState(false);
  const tabs = [
    { id: 'dashboard', label: 'VisÃ£o Geral', icon: PieChart },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'pedidos', label: 'Pedidos Pendentes', icon: ShoppingBag },
    { id: 'reviews', label: 'AvaliaÃ§Ãµes', icon: MessageSquare },
  ] as const;

    const loadStoreData = useCallback(async (forceRefresh = true) => {
      try {
          const bundle = await fetchAdminStoreBundle({
              productsLimit: 500,
              categoriesLimit: 300,
              ordersLimit: 1200,
              reviewsLimit: 900,
              forceRefresh,
          });

          setProdutos(bundle.produtos as unknown as ProdutoAdmin[]);
          setCategorias(bundle.categorias as unknown as CategoriaData[]);

          const ordersList = (bundle.pedidos as unknown as Pedido[]).sort(
              (left, right) =>
                  ((right.createdAt as Timestamp | undefined)?.seconds || 0) -
                  ((left.createdAt as Timestamp | undefined)?.seconds || 0)
          );
          setPedidos(ordersList);

          const reviewsList = (bundle.reviews as unknown as Review[]).sort(
              (left, right) =>
                  ((right.createdAt as Timestamp | undefined)?.seconds || 0) -
                  ((left.createdAt as Timestamp | undefined)?.seconds || 0)
          );
          setReviews(reviewsList);
      } catch (error: unknown) {
          console.error(error);
          addToast("Erro ao carregar loja admin.", "error");
      }
  }, [addToast]);

  useEffect(() => {
      void loadStoreData(true);
  }, [loadStoreData]);

  // --- ACTIONS ---

    const handleAprovarPedido = async (pedido: Pedido) => {
      if(!confirm(`Confirmar pagamento de ${pedido.userName}?`)) return;
      
      try {
          await approveStoreOrder({
              orderId: pedido.id,
              userId: pedido.userId,
              userName: pedido.userName,
              productName: pedido.productName,
              price: pedido.price || 0,
              approvedBy: user?.uid || "admin",
          });

          addToast("Pedido aprovado e pontos creditados!", "success");
          await loadStoreData(true);
      } catch (error: unknown) {
          console.error(error);
          addToast("Erro ao aprovar pedido.", "error");
      }
  };

    const handleReviewAction = async (reviewId: string, action: 'approved' | 'rejected') => {
      try {
          await setStoreReviewStatus({
              reviewId,
              status: action,
          });
          addToast(`Review ${action === 'approved' ? 'aprovada' : 'rejeitada'}.`, "info");
          await loadStoreData(true);
      } catch (error: unknown) {
          console.error(error);
          addToast("Erro.", "error");
      }
  };

  // --- HELPER FUNCS ---
  const allCategories = useMemo(() => {
    const map = new Map<string, string>();
    DEFAULT_CATEGORIES.forEach((c) => map.set(c.toLowerCase(), c));
    categorias.forEach((c) => map.set(c.nome.toLowerCase(), c.nome));
    return Array.from(map.values());
  }, [categorias]);

  // Handlers de Produto
    const handleSaveProduto = async () => {
      if (saving) return;
      setSaving(true);
      try {
          const payload = { 
              ...formData, 
              variantes: variantesTemp, 
              caracteristicas: featuresInput.split(",").map(s=>s.trim()).filter(Boolean),
              estoque: variantesTemp.reduce((a,b)=>a+Number(b.estoque),0),
              updatedAt: new Date().toISOString() 
          };
          await upsertStoreProduct({
              productId: isEditing ? formData.id : undefined,
              data: payload,
          });
          setShowModalProduto(false);
          addToast("Salvo com sucesso!", "success");
          await loadStoreData(true);
      } catch (error: unknown) {
          console.error(error);
          addToast("Erro ao salvar.", "error");
      }
      setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if(file) {
          setUploading(true);
          const { url } = await uploadImage(file, "produtos");
          if(url) setFormData(p => ({...p, img: url}));
          setUploading(false);
      }
  };

  const handleAddVariante = () => {
      if(!novaVariante.tamanho || !novaVariante.cor) return;
      setVariantesTemp([...variantesTemp, { id: `sku-${Date.now()}`, ...novaVariante }]);
      setNovaVariante({ tamanho: "", cor: "", estoque: 0 });
  };

  // --- GESTÃƒO CATEGORIAS ---
    const handleCreateCategoria = async () => {
      if(!categoriaNome) return;
      setSavingCategoria(true);
      try {
          await createStoreCategory(categoriaNome);
          setCategoriaNome("");
          addToast("Categoria criada!", "success");
          await loadStoreData(true);
      } catch (error: unknown) {
          console.error(error);
          addToast("Erro.", "error");
      }
      finally { setSavingCategoria(false); }
  };

  const stats = useMemo(() => {
    const totalEstoque = produtos.reduce((acc, p) => acc + (p.variantes?.reduce((a,v) => a + Number(v.estoque),0) || 0), 0);
    const valorEstoque = produtos.reduce((acc, p) => acc + ((p.variantes?.reduce((a,v) => a + Number(v.estoque),0) || 0) * Number(p.preco)), 0);
    const vendasTotal = produtos.reduce((acc, p) => acc + (p.vendidos || 0), 0);
    return { totalEstoque, valorEstoque, vendasTotal };
  }, [produtos]);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">GestÃ£o da Loja</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModalCategoria(true)} className="bg-zinc-800 border border-zinc-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-zinc-700 transition"><Tag size={16} /> Categoria</button>
          <button onClick={() => { setFormData({}); setIsEditing(false); setShowModalProduto(true); }} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95"><Plus size={16} /> Novo Produto</button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        <div className="flex border-b border-zinc-800 gap-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-3 text-sm font-bold border-b-2 transition capitalize flex items-center gap-2 ${activeTab === tab.id ? "border-emerald-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p className="text-xs text-zinc-500 font-bold uppercase">Total Vendas</p><p className="text-3xl font-black text-emerald-400 mt-2">R$ {pedidos.filter(p=>p.status==='approved').reduce((a,b)=>a+(b.price || 0),0).toLocaleString('pt-BR')}</p></div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p className="text-xs text-zinc-500 font-bold uppercase">Pedidos Pendentes</p><p className="text-3xl font-black text-yellow-500 mt-2">{pedidos.filter(p=>p.status==='pendente').length}</p></div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800"><p className="text-xs text-zinc-500 font-bold uppercase">Valor em GÃ´ndola</p><p className="text-3xl font-black text-blue-400 mt-2">R$ {stats.valorEstoque.toLocaleString('pt-BR')}</p></div>
            </div>
        )}

        {/* PRODUTOS TAB */}
        {activeTab === "produtos" && (
          <div className="grid grid-cols-1 gap-3 animate-in fade-in">
            {produtos.map((prod) => (
                <div key={prod.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-center group hover:border-zinc-700 transition">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-lg bg-black overflow-hidden border border-zinc-800"><Image src={prod.img} alt={prod.nome} fill className="object-cover" unoptimized/></div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{prod.nome}</h3>
                      <p className="text-emerald-400 font-bold text-sm mt-1">R$ {Number(prod.preco).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/loja/${prod.id}`} target="_blank" className="p-2.5 bg-zinc-800 rounded-lg text-blue-400 hover:bg-zinc-700"><ExternalLink size={18}/></Link>
                    <button onClick={() => { setFormData(prod); setFeaturesInput(prod.caracteristicas?.join(", ") || ""); setVariantesTemp(prod.variantes || []); setIsEditing(true); setShowModalProduto(true); }} className="p-2.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700"><Edit size={18}/></button>
                    <button onClick={async () => { if(confirm("Deletar?")) { await deleteStoreProduct(prod.id); await loadStoreData(true); } }} className="p-2.5 bg-zinc-800 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10"><Trash2 size={18}/></button>
                  </div>
                </div>
            ))}
          </div>
        )}

        {/* PEDIDOS TAB */}
        {activeTab === "pedidos" && (
            <div className="space-y-4 animate-in fade-in">
                {pedidos.filter(o => o.status === 'pendente').map(order => (
                    <div key={order.id} className="bg-zinc-900 border border-yellow-500/30 p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-yellow-500/30">Pendente</span>
                                <span className="text-zinc-500 text-xs font-mono">{order.id.substring(0,8)}</span>
                            </div>
                            <h4 className="font-bold text-white">{order.productName}</h4>
                            <p className="text-xs text-zinc-400">Comprador: <Link href={`/admin/usuarios/${order.userId}`} className="text-blue-400 hover:underline">{order.userName}</Link></p>
                            <p className="text-sm font-black text-emerald-400 mt-1">R$ {(order.price || 0).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => handleAprovarPedido(order)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-emerald-500 flex items-center gap-2 shadow-lg"><CheckCircle size={14}/> Aprovar Pagamento</button>
                            <button onClick={async () => { await setStoreOrderStatus({ orderId: order.id, status: "rejected" }); await loadStoreData(true); }} className="bg-red-900/20 text-red-500 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-red-900/40 flex items-center gap-2"><XCircle size={14}/> Rejeitar</button>
                        </div>
                    </div>
                ))}
                
                <h3 className="text-xs font-bold text-zinc-500 uppercase mt-8 mb-2">HistÃ³rico Recente</h3>
                <div className="space-y-2 opacity-60">
                    {pedidos.filter(o => o.status !== 'pendente').slice(0, 5).map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 bg-zinc-950 rounded-lg border border-zinc-900">
                            <div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded mr-2 ${order.status === 'approved' ? 'bg-emerald-900 text-emerald-500' : 'bg-red-900 text-red-500'}`}>{order.status}</span>
                                <span className="text-xs text-zinc-400">{order.productName}</span>
                            </div>
                            {order.status === 'approved' && order.approvedBy && (
                                <Link href={`/admin/usuarios/${order.approvedBy}`} className="text-[9px] text-zinc-600 hover:text-blue-500 flex items-center gap-1">
                                    Aprovado por: Admin <ExternalLink size={8}/>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
            <div className="space-y-4 animate-in fade-in">
                {reviews.map(rev => (
                    <div key={rev.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex text-yellow-500">{[...Array(5)].map((_, i) => <Star key={i} size={10} className={i < rev.rating ? "fill-current" : "text-zinc-700"}/>)}</div>
                                <span className="text-xs font-bold text-white">{rev.userName}</span>
                            </div>
                            <p className="text-zinc-400 text-sm italic">&quot;{rev.comment}&quot;</p>
                            <Link href={`/loja/${rev.productId}`} target="_blank" className="text-[10px] text-zinc-500 hover:text-white mt-1 block">Ver produto relacionado</Link>
                        </div>
                        <div className="flex flex-col gap-2">
                             {rev.status === 'pending' || !rev.status ? (
                                <>
                                    <button onClick={() => handleReviewAction(rev.id, 'approved')} className="px-3 py-1.5 bg-emerald-900/30 text-emerald-500 rounded text-[10px] font-bold uppercase hover:bg-emerald-500 hover:text-black">Aprovar</button>
                                    <button onClick={() => handleReviewAction(rev.id, 'rejected')} className="px-3 py-1.5 bg-red-900/30 text-red-500 rounded text-[10px] font-bold uppercase hover:bg-red-500 hover:text-white">Rejeitar</button>
                                </>
                             ) : (
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${rev.status === 'approved' ? 'text-emerald-500 bg-emerald-900/20' : 'text-red-500 bg-red-900/20'}`}>{rev.status}</span>
                             )}
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>

      {/* MODAL PRODUTO (Simplificado visualmente para caber) */}
      {showModalProduto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-950 w-full max-w-3xl rounded-2xl border border-zinc-800 p-6 space-y-6 my-10 shadow-2xl relative animate-in zoom-in-95">
             <div className="flex justify-between border-b border-zinc-800 pb-4"><h2 className="font-bold text-white text-xl">Produto</h2><button onClick={() => setShowModalProduto(false)}><X size={24} className="text-zinc-500"/></button></div>
             
             <div className="grid grid-cols-2 gap-6">
                 <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-zinc-700 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-emerald-500 relative overflow-hidden">
                     <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload}/>
                     {uploading ? <span className="text-xs animate-pulse text-emerald-500">Enviando...</span> : formData.img ? <Image src={formData.img} alt="Preview" fill className="object-contain" unoptimized/> : <div className="text-center"><UploadCloud size={32}/><span className="text-xs uppercase font-bold">Foto</span></div>}
                 </div>
                 <div className="space-y-3">
                     <input type="text" placeholder="Nome" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white" value={formData.nome || ""} onChange={e => setFormData({...formData, nome: e.target.value})}/>
                     <div className="flex gap-2">
                         <input type="number" placeholder="PreÃ§o" className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white" value={formData.preco || ""} onChange={e => setFormData({...formData, preco: Number(e.target.value)})}/>
                         <select className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-400" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                             {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                         </select>
                     </div>
                 </div>
             </div>

             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                 <div className="flex justify-between items-center mb-3 text-[10px] font-bold uppercase text-zinc-500"><span>Variantes</span></div>
                 <div className="flex gap-2 mb-3">
                   <input type="text" placeholder="Tam" className="w-16 bg-black border border-zinc-700 rounded p-2 text-xs text-white uppercase" value={novaVariante.tamanho} onChange={(e) => setNovaVariante({ ...novaVariante, tamanho: e.target.value })} />
                   <input type="text" placeholder="Cor" className="flex-1 bg-black border border-zinc-700 rounded p-2 text-xs text-white" value={novaVariante.cor} onChange={(e) => setNovaVariante({ ...novaVariante, cor: e.target.value })} />
                   <input type="number" placeholder="Qtd" className="w-16 bg-black border border-zinc-700 rounded p-2 text-xs text-white" value={novaVariante.estoque || ""} onChange={(e) => setNovaVariante({ ...novaVariante, estoque: Number(e.target.value) })} />
                   <button onClick={handleAddVariante} className="bg-emerald-600 px-3 rounded text-white font-bold hover:bg-emerald-500"><Plus size={16} /></button>
                 </div>
                 <div className="space-y-1 max-h-24 overflow-y-auto">{variantesTemp.map((v) => (<div key={v.id} className="flex justify-between text-xs bg-black p-2 rounded border border-zinc-800"><span>{v.tamanho} - {v.cor}</span><span className="text-emerald-400 font-bold">{v.estoque} un</span></div>))}</div>
             </div>

             <button onClick={handleSaveProduto} disabled={saving} className="w-full py-4 bg-emerald-600 rounded-xl font-black uppercase text-sm hover:bg-emerald-500 transition">{saving ? "Salvando..." : "Salvar Produto"}</button>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA (MANTIDO) */}
      {showModalCategoria && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4">
            <div className="bg-zinc-950 p-6 rounded-xl border border-zinc-800 w-full max-w-sm">
                <h3 className="text-white font-bold mb-4">Categorias</h3>
                <div className="flex gap-2 mb-4">
                    <input type="text" className="flex-1 bg-black border border-zinc-700 rounded p-2 text-white" value={categoriaNome} onChange={e => setCategoriaNome(e.target.value)}/>
                    <button onClick={handleCreateCategoria} disabled={savingCategoria} className="bg-emerald-600 px-4 rounded text-white font-bold">{savingCategoria ? "..." : "Add"}</button>
                </div>
                <button onClick={() => setShowModalCategoria(false)} className="w-full text-zinc-500 text-xs">Fechar</button>
            </div>
        </div>
      )}
    </div>
  );
}


