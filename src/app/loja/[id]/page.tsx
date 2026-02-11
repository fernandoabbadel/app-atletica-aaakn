// src/app/loja/[id]/page.tsx
"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    createStoreOrder,
    createStoreReview,
    fetchStoreProductDetail,
    toggleStoreProductLike,
} from "../../../lib/storeService";
import { Timestamp } from "firebase/firestore";
import {
    ArrowLeft, ShoppingBag, Heart, Star, Clock, 
    CheckCircle, AlertTriangle, Loader2 
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";

// --- TIPAGEM ---
interface Produto {
    id: string;
    nome: string;
    preco: number;
    img: string;
    descricao: string;
    likes: string[]; // Array de UIDs
    categoria: string;
}

interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    comment: string;
    createdAt: Timestamp | null;
}

interface Order {
    id: string;
    userId: string;
    userName: string;
    productId: string;
    productName: string;
    price: number;
    status: 'pendente' | 'approved' | 'rejected' | 'delivered';
    createdAt: Timestamp | null;
    updatedAt?: Timestamp | null; // Data da aprovacao
}

export default function DetalheProdutoPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { addToast } = useToast();

    // Estados
    const [produto, setProduto] = useState<Produto | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userOrder, setUserOrder] = useState<Order | null>(null); // Ultimo pedido deste produto
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'detalhes' | 'avaliacoes'>('detalhes');
    
    // Estado do formulario de review
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submittingReview, setSubmittingReview] = useState(false);

        const productId = typeof params.id === "string" ? params.id : "";

    const refreshProductData = useCallback(async (forceRefresh = true) => {
        if (!productId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const bundle = await fetchStoreProductDetail({
                productId,
                userId: user?.uid || null,
                reviewsLimit: 120,
                ordersLimit: 40,
                forceRefresh,
            });

            setProduto(bundle.produto as unknown as Produto | null);

            const reviewsList = (bundle.reviews as unknown as Review[]).sort((left, right) => {
                const leftDate = left.createdAt?.toDate ? left.createdAt.toDate().getTime() : 0;
                const rightDate = right.createdAt?.toDate ? right.createdAt.toDate().getTime() : 0;
                return rightDate - leftDate;
            });
            setReviews(reviewsList);

            const userOrders = (bundle.userOrders as unknown as Order[]).sort((left, right) => {
                const leftDate = left.createdAt?.toDate ? left.createdAt.toDate().getTime() : 0;
                const rightDate = right.createdAt?.toDate ? right.createdAt.toDate().getTime() : 0;
                return rightDate - leftDate;
            });
            setUserOrder(userOrders[0] || null);
        } catch (error: unknown) {
            console.error(error);
            addToast("Erro ao carregar produto.", "error");
        } finally {
            setLoading(false);
        }
    }, [productId, user?.uid, addToast]);

    // 1. CARREGAR DADOS
    useEffect(() => {
        void refreshProductData(true);
    }, [refreshProductData]);

    // 2. LOGICA DE PERMISSAO DE AVALIACAO (5 DIAS APOS APROVACAO)
    const canReview = useMemo(() => {
        if (!userOrder || userOrder.status !== 'approved') return false;
        
        const dateRef = userOrder.updatedAt || userOrder.createdAt;
        if (!dateRef) return false;

        const approvalDate = dateRef.toDate ? dateRef.toDate() : new Date();
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - approvalDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays <= 5; 
    }, [userOrder]);

    // FIX ID 10: Verifica se existe um pedido ATIVO que impede nova compra
    const isBlockingOrder = userOrder && (userOrder.status === 'pendente' || userOrder.status === 'approved');

    // 3. ACTIONS
        const handleLike = async () => {
        if (!user || !produto) return;
        const isLiked = produto.likes?.includes(user.uid);

        try {
            await toggleStoreProductLike({
                productId: produto.id,
                userId: user.uid,
                currentlyLiked: Boolean(isLiked),
            });

            setProduto((prev) => {
                if (!prev) return prev;
                const likes = Array.isArray(prev.likes) ? [...prev.likes] : [];
                if (isLiked) {
                    return { ...prev, likes: likes.filter((entry) => entry !== user.uid) };
                }
                return { ...prev, likes: [...likes, user.uid] };
            });
        } catch (error: unknown) {
            console.error(error);
            addToast("Erro ao curtir produto.", "error");
        }
    };

        const handleBuy = async () => {
        if (!user || !produto) return router.push("/login");

        const confirm = window.confirm(`Confirmar pedido de ${produto.nome}?`);
        if (!confirm) return;

        try {
            await createStoreOrder({
                userId: user.uid,
                userName: user.nome || "Aluno",
                productId: produto.id,
                productName: produto.nome,
                price: produto.preco,
            });

            addToast("Pedido enviado! Aguarde a liberacao.", "success");
            await refreshProductData(true);
        } catch (error: unknown) {
            console.error(error);
            addToast("Erro ao realizar pedido.", "error");
        }
    };

        const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !produto) return;
        setSubmittingReview(true);

        try {
            await createStoreReview({
                productId: produto.id,
                userId: user.uid,
                userName: user.nome || "Aluno",
                userAvatar: user.foto || "",
                rating,
                comment,
            });
            
            setComment("");
            setRating(5);
            addToast("Avaliacao enviada! +10XP", "success");
            await refreshProductData(true);
        } catch (error: unknown) {
            console.error(error);
            addToast("Erro ao avaliar.", "error");
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
    if (!produto) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white">Produto nao encontrado.</div>;

    const isLiked = produto.likes?.includes(user?.uid || "");

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-10 font-sans selection:bg-emerald-500/30">
            
          {/* HERO */}
            <div className="relative w-full h-[45vh] bg-black">
                <Image 
                    src={produto.img} 
                    alt={produto.nome}
                    fill
                    priority // Importante para LCP (Largest Contentful Paint)
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10"></div>
                <button onClick={() => router.back()} className="absolute top-6 left-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:bg-zinc-800 transition border border-white/10"><ArrowLeft size={24}/></button>
                <button onClick={handleLike} className="absolute top-6 right-6 z-20 bg-black/40 backdrop-blur-md p-3 rounded-full text-white hover:scale-110 transition border border-white/10">
                    <Heart size={24} className={isLiked ? "fill-red-500 text-red-500" : "text-white"} />
                </button>
            </div>

            {/* CONTEUDO */}
            <div className="relative z-30 -mt-10 bg-[#050505] rounded-t-[2.5rem] border-t border-white/10 p-6 shadow-2xl min-h-[60vh]">
                
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20">{produto.categoria}</span>
                        <h1 className="text-3xl font-black text-white italic uppercase mt-2 leading-none">{produto.nome}</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <Heart size={14} className="text-red-500 fill-red-500"/>
                            <span className="text-xs text-zinc-400 font-bold">{produto.likes?.length || 0} curtidas</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-emerald-400">R$ {Number(produto.preco).toFixed(2)}</p>
                    </div>
                </div>

                <div className="flex gap-4 border-b border-zinc-800 mb-6">
                    <button onClick={() => setActiveTab('detalhes')} className={`pb-3 text-sm font-bold uppercase tracking-wide transition ${activeTab === 'detalhes' ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-500'}`}>Detalhes</button>
                    <button onClick={() => setActiveTab('avaliacoes')} className={`pb-3 text-sm font-bold uppercase tracking-wide transition ${activeTab === 'avaliacoes' ? 'text-white border-b-2 border-emerald-500' : 'text-zinc-500'}`}>Avaliacoes ({reviews.length})</button>
                </div>

                {activeTab === 'detalhes' && (
                    <div className="space-y-6 animate-in fade-in">
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{produto.descricao}</p>
                        
                        {/* STATUS DO PEDIDO OU BOTAO DE COMPRA */}
                        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
                            {isBlockingOrder ? (
                                <div className="text-center animate-in zoom-in-95">
                                    {userOrder?.status === 'pendente' && (
                                        <div className="flex flex-col items-center gap-2 text-yellow-500">
                                            <Clock size={32}/>
                                            <h3 className="font-bold uppercase">Aguardando Aprovacao</h3>
                                            <p className="text-xs text-zinc-400">O admin esta verificando seu pedido.</p>
                                        </div>
                                    )}
                                    {userOrder?.status === 'approved' && (
                                        <div className="flex flex-col items-center gap-2 text-emerald-500">
                                            <CheckCircle size={32}/>
                                            <h3 className="font-bold uppercase">Compra Aprovada!</h3>
                                            <p className="text-xs text-zinc-400">Retire seu produto ou aguarde a entrega.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button 
                                    onClick={handleBuy}
                                    className="w-full py-4 bg-emerald-600 rounded-xl font-black uppercase text-sm flex items-center justify-center gap-3 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 active:scale-95 text-white"
                                >
                                    <ShoppingBag size={20}/> 
                                    {userOrder?.status === 'delivered' || userOrder?.status === 'rejected' ? "Comprar Novamente" : "Comprar Agora"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'avaliacoes' && (
                    <div className="space-y-6 animate-in fade-in">
                        {canReview ? (
                            <form onSubmit={handleSubmitReview} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-6">
                                <h3 className="text-sm font-bold text-white uppercase mb-3">Deixe sua avaliacao</h3>
                                <div className="flex gap-2 mb-4">
                                    {[1,2,3,4,5].map(star => (
                                        <button key={star} type="button" onClick={() => setRating(star)}>
                                            <Star size={24} className={star <= rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-600"}/>
                                        </button>
                                    ))}
                                </div>
                                <textarea 
                                    className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none"
                                    placeholder="O que achou do produto?"
                                    rows={3}
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    required
                                />
                                <button disabled={submittingReview} type="submit" className="w-full mt-3 bg-emerald-600 py-2 rounded-lg font-bold text-xs uppercase hover:bg-emerald-500 transition">
                                    {submittingReview ? "Enviando..." : "Publicar Avaliacao"}
                                </button>
                            </form>
                        ) : (
                            userOrder?.status === 'approved' && (
                                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-center">
                                    <AlertTriangle size={24} className="mx-auto text-red-500 mb-2"/>
                                    <p className="text-xs text-red-400 font-bold">Prazo de avaliacao expirado ou produto ainda nao aprovado.</p>
                                </div>
                            )
                        )}

                        <div className="space-y-4">
                            {reviews.length === 0 && <p className="text-zinc-500 text-xs text-center italic">Seja o primeiro a avaliar.</p>}
                            {reviews.map(rev => (
                                <div key={rev.id} className="border-b border-zinc-800 pb-4">
                                  <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 bg-zinc-800 rounded-full overflow-hidden">
                    <Image 
                        src={rev.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.userName)}`} 
                        alt={rev.userName}
                        fill
                        sizes="32px"
                        className="object-cover"
                        unoptimized
                    />
                </div>
                <span className="text-xs font-bold text-white">{rev.userName}</span>
            </div>
            <div className="flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < rev.rating ? "fill-current" : "text-zinc-700"}/>
                ))}
            </div>
     </div>
                                    <p className="text-zinc-400 text-xs leading-relaxed">{rev.comment}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
