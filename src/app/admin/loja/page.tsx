"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft, Plus, Trash2, Edit, Tag, DollarSign, ShoppingBag, 
  Package, TrendingUp, AlertCircle, Search, UploadCloud, X, 
  User, Star, ChevronRight, Filter, MessageCircle, EyeOff, Send, Check,
  PieChart, BarChart3, Clock, Calendar, Truck, CheckCircle2, XCircle, UserCheck, CornerDownRight
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---

interface Variante {
    id: string;
    tamanho: string;
    cor: string;
    estoque: number;
}

interface ProdutoAdmin {
    id: number;
    nome: string;
    preco: number;
    precoAntigo?: number;
    categoria: string;
    img: string;
    vendidos: number;
    variantes: Variante[];
    lote: string;
    descricao: string;
}

interface VendaItem {
    id: string; 
    itemId: string;
    // Dados de Pagamento
    statusPagamento: "Aprovado" | "Pendente";
    dataPagamento?: string; // Formato "DD/MM/YY HH:MM"
    
    // Dados do Comprador e Produto
    comprador: string;
    compradorHandle: string;
    produto: string;
    tamanho: string;
    cor: string;
    qtd: number;
    valorUnitario: number;
    valorTotal: number;
    
    // Dados de Logística
    statusEntrega: "Entregue" | "Aguardando Retirada";
    dataEntrega?: string; // Formato "DD/MM/YY HH:MM"
    entreguePor?: string;
}

interface Avaliacao {
    id: number;
    usuario: string;
    produto: string;
    nota: number;
    comentario: string;
    data: string;
    respondido: boolean;
    respostaAdmin?: string;
    respostaData?: string;
    respostaAutor?: string;
    oculto: boolean;
}

// --- DADOS MOCKADOS ---

const PRODUTOS_MOCK: ProdutoAdmin[] = [
  { 
    id: 1, 
    nome: "Samba Canção Tubarão", 
    preco: 45.00, 
    precoAntigo: 60.00,
    categoria: "Vestuário", 
    img: "https://images.unsplash.com/photo-1594932224011-04104046d482?w=400", 
    vendidos: 120, 
    lote: "Lote 1/26", 
    descricao: "Samba oficial.",
    variantes: [
        { id: "sku-1a", tamanho: "P", cor: "Azul", estoque: 12 },
        { id: "sku-1b", tamanho: "M", cor: "Azul", estoque: 8 }, 
        { id: "sku-1c", tamanho: "G", cor: "Azul", estoque: 25 },
    ]
  },
  { 
    id: 2, 
    nome: "Caneca Alumínio 850ml", 
    preco: 35.00, 
    categoria: "Acessórios", 
    img: "https://images.unsplash.com/photo-1577937927133-66ef06ac992a?w=400", 
    vendidos: 450, 
    lote: "Lote Extra", 
    descricao: "Térmica.",
    variantes: [
        { id: "sku-2a", tamanho: "Único", cor: "Prata", estoque: 5 }, 
        { id: "sku-2b", tamanho: "Único", cor: "Preto Fosco", estoque: 40 },
    ]
  },
];

const VENDAS_MOCK: VendaItem[] = [
    { 
        id: "9021", itemId: "item-1", 
        comprador: "João Silva", compradorHandle: "joaosilva", 
        produto: "Samba Canção", tamanho: "M", cor: "Azul", 
        qtd: 1, valorUnitario: 45.00, valorTotal: 45.00, 
        statusPagamento: "Aprovado", dataPagamento: "12/10/26 14:31",
        statusEntrega: "Aguardando Retirada"
    },
    { 
        id: "9022", itemId: "item-2", 
        comprador: "Maria Souza", compradorHandle: "marias", 
        produto: "Caneca Alumínio", tamanho: "Único", cor: "Prata", 
        qtd: 2, valorUnitario: 35.00, valorTotal: 70.00, 
        statusPagamento: "Aprovado", dataPagamento: "12/10/26 15:45",
        statusEntrega: "Entregue", dataEntrega: "13/10/26 10:00", entreguePor: "Admin Dudu"
    },
    { 
        id: "9023", itemId: "item-3", 
        comprador: "Pedro H.", compradorHandle: "pedroh", 
        produto: "Kit Calouro", tamanho: "G", cor: "Verde", 
        qtd: 1, valorUnitario: 180.00, valorTotal: 180.00, 
        statusPagamento: "Pendente", dataPagamento: "-", // Pendente não tem data ainda
        statusEntrega: "Aguardando Retirada"
    },
];

const AVALIACOES_MOCK: Avaliacao[] = [
    { id: 1, usuario: "Pedro Santos", produto: "Samba Canção", nota: 5, comentario: "Muito confortável! O tecido é top.", data: "10/10/26", respondido: false, oculto: false },
    { id: 2, usuario: "Ana Costa", produto: "Caneca", nota: 3, comentario: "Achei que conservava mais o gelo.", data: "09/10/26", respondido: true, respostaAdmin: "Oi Ana! Nossa caneca mantém gelado por até 4h.", respostaData: "09/10/26 14:00", respostaAutor: "Admin Bia", oculto: false },
];

// --- DONUT CHART ---
const ModernDonutChart = () => {
    const data = [
        { label: "Vestuário", value: 45, color: "#10b981" }, // Emerald
        { label: "Acessórios", value: 35, color: "#3b82f6" }, // Blue
        { label: "Kits", value: 20, color: "#a855f7" }, // Purple
    ];
    
    const radius = 35;
    const strokeWidth = 20;
    const center = 50;
    const circumference = 2 * Math.PI * radius; 
    let cumulativePercent = 0;

    return (
        <div className="flex flex-col items-center justify-center py-4 w-full">
            <div className="relative w-48 h-48 shrink-0 mb-6">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                    <g transform={`rotate(-90 ${center} ${center})`}>
                        {data.map((item, i) => {
                            const percent = item.value / 100;
                            const strokeLength = percent * circumference;
                            const dashOffset = -cumulativePercent * circumference;
                            const angle = (cumulativePercent + percent / 2) * 2 * Math.PI; 
                            cumulativePercent += percent;

                            return (
                                <circle
                                    key={i} r={radius} cx={center} cy={center}
                                    fill="transparent" stroke={item.color} strokeWidth={strokeWidth}
                                    strokeDasharray={`${strokeLength} ${circumference}`} strokeDashoffset={dashOffset}
                                    className="transition-all duration-1000 ease-out hover:opacity-90 cursor-pointer"
                                />
                            );
                        })}
                    </g>
                    {data.map((item, i) => {
                        let localCumulative = 0;
                        for(let j=0; j<i; j++) localCumulative += data[j].value/100;
                        const percentMiddle = localCumulative + (item.value/100)/2;
                        const angle = (percentMiddle * 2 * Math.PI) - (Math.PI / 2); 
                        const x = center + (radius) * Math.cos(angle);
                        const y = center + (radius) * Math.sin(angle);
                        return <text key={`t-${i}`} x={x} y={y} fill="white" fontSize="4" fontWeight="bold" textAnchor="middle" dominantBaseline="central" className="pointer-events-none drop-shadow-md">{item.value}%</text>
                    })}
                    <text x="50%" y="45%" dominantBaseline="central" textAnchor="middle" className="text-[6px] fill-zinc-400 font-bold uppercase tracking-widest">Mix</text>
                    <text x="50%" y="55%" dominantBaseline="central" textAnchor="middle" className="text-[8px] fill-white font-black uppercase tracking-widest">Vendas</text>
                </svg>
            </div>
            <div className="flex gap-6 bg-black/40 p-3 rounded-2xl border border-white/5">
                {data.map((item, i) => (
                    <div key={i} className="flex flex-col items-center min-w-[60px]">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-[10px] text-zinc-400 font-bold uppercase">{item.label}</span>
                        </div>
                        <span className="text-xl font-black text-white">{item.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export default function AdminLojaPage() {
  const { addToast } = useToast();
  
  // Estados Globais
  const [produtos, setProdutos] = useState<ProdutoAdmin[]>(PRODUTOS_MOCK);
  const [vendas, setVendas] = useState<VendaItem[]>(VENDAS_MOCK);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>(AVALIACOES_MOCK);
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "produtos" | "vendas" | "avaliacoes">("dashboard");
  const [filtroEstoqueCritico, setFiltroEstoqueCritico] = useState(false);
  const [filtroAvaliacao, setFiltroAvaliacao] = useState<"todas" | "pendentes" | "respondidas">("todas");
  
  // Modais e Controles
  const [showModalProduto, setShowModalProduto] = useState(false);
  const [showModalResposta, setShowModalResposta] = useState<Avaliacao | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [textoResposta, setTextoResposta] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Produto
  const [formData, setFormData] = useState<Partial<ProdutoAdmin>>({ nome: "", preco: 0, precoAntigo: 0, categoria: "Vestuário", img: "", lote: "", descricao: "" });
  const [variantesTemp, setVariantesTemp] = useState<Variante[]>([]);
  const [novaVariante, setNovaVariante] = useState({ tamanho: "", cor: "", estoque: 0 });

  // Estoque "Flattened"
  const inventarioExpandido = useMemo(() => {
      const lista: any[] = [];
      const produtosFiltrados = filtroEstoqueCritico ? produtos.filter(p => p.variantes.some(v => v.estoque < 10)) : produtos;
      produtosFiltrados.forEach(prod => {
          prod.variantes.forEach(variant => {
              if (filtroEstoqueCritico && variant.estoque >= 10) return;
              lista.push({
                  uniqueId: `${prod.id}-${variant.id}`, ...variant,
                  produtoId: prod.id, nome: prod.nome, img: prod.img,
                  categoria: prod.categoria, preco: prod.preco, lote: prod.lote
              });
          });
      });
      return lista;
  }, [produtos, filtroEstoqueCritico]);

  const avaliacoesDisplay = avaliacoes.filter(av => {
      if (filtroAvaliacao === 'pendentes') return !av.respondido;
      if (filtroAvaliacao === 'respondidas') return av.respondido;
      return true;
  });

  // --- ACTIONS ---

  const handleOpenCreate = () => {
      setFormData({ nome: "", preco: 0, precoAntigo: 0, categoria: "Vestuário", img: "", lote: "", descricao: "" });
      setVariantesTemp([]);
      setIsEditing(false);
      setShowModalProduto(true);
  }

  const handleOpenEdit = (produtoId: number) => {
      const prod = produtos.find(p => p.id === produtoId);
      if(!prod) return;
      setFormData(prod);
      setVariantesTemp(prod.variantes);
      setIsEditing(true);
      setShowModalProduto(true);
  }

  const handleAddVariante = () => {
      if(!novaVariante.tamanho || !novaVariante.cor) return;
      setVariantesTemp([...variantesTemp, { id: `sku-${Date.now()}`, ...novaVariante }]);
      setNovaVariante({ tamanho: "", cor: "", estoque: 0 });
  };

  const handleRemoveVariante = (id: string) => {
      setVariantesTemp(prev => prev.filter(v => v.id !== id));
  };

  const handleSaveProduto = () => {
      if (!formData.nome || !formData.preco) { addToast("Preencha campos obrigatórios!", "error"); return; }
      
      const produtoFinal: ProdutoAdmin = {
          id: isEditing ? formData.id! : Date.now(),
          nome: formData.nome!,
          preco: Number(formData.preco),
          precoAntigo: Number(formData.precoAntigo),
          categoria: formData.categoria!,
          img: formData.img || "https://github.com/shadcn.png",
          vendidos: isEditing ? formData.vendidos! : 0,
          lote: formData.lote || "",
          descricao: formData.descricao || "",
          variantes: variantesTemp,
          estoque: variantesTemp.reduce((acc, curr) => acc + Number(curr.estoque), 0)
      };

      if (isEditing) {
          setProdutos(prev => prev.map(p => p.id === produtoFinal.id ? produtoFinal : p));
          addToast("Produto atualizado!", "success");
      } else {
          setProdutos(prev => [...prev, produtoFinal]);
          addToast("Produto criado!", "success");
      }
      setShowModalProduto(false);
  };

  const handleToggleEntrega = (itemId: string) => {
      setVendas(prev => prev.map(v => {
          if (v.itemId === itemId) {
              if (v.statusEntrega === "Entregue") {
                  return { ...v, statusEntrega: "Aguardando Retirada", dataEntrega: undefined, entreguePor: undefined };
              } else {
                  return {
                      ...v,
                      statusEntrega: "Entregue",
                      dataEntrega: new Date().toLocaleString('pt-BR'),
                      entreguePor: "Admin Tubarão"
                  };
              }
          }
          return v;
      }));
      addToast("Logística atualizada.", "success");
  };

  const handleOcultarAvaliacao = (id: number) => {
      setAvaliacoes(prev => prev.map(av => av.id === id ? { ...av, oculto: !av.oculto } : av));
      addToast("Visibilidade alterada.", "info");
  };

  const handleEnviarResposta = () => {
      if(!showModalResposta || !textoResposta) return;
      const novaResposta = {
          respondido: true,
          respostaAdmin: textoResposta,
          respostaData: new Date().toLocaleString('pt-BR'),
          respostaAutor: "Admin Tubarão"
      };
      setAvaliacoes(prev => prev.map(av => av.id === showModalResposta.id ? { ...av, ...novaResposta } : av));
      setShowModalResposta(null);
      setTextoResposta("");
      addToast("Resposta publicada!", "success");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (ev) => setFormData({ ...formData, img: ev.target?.result as string });
    }
  };

  const handleDeleteProduto = (id: number) => {
      if(confirm("Excluir produto?")) {
          setProdutos(prev => prev.filter(p => p.id !== id));
      }
  }

  const getDesconto = () => {
      if(formData.precoAntigo && formData.preco && formData.precoAntigo > formData.preco) {
          const off = ((formData.precoAntigo - formData.preco) / formData.precoAntigo) * 100;
          return `-${off.toFixed(0)}%`;
      }
      return null;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestão da Loja</h1>
        </div>
        <div className="flex gap-2">
            <button className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl text-zinc-300 hover:text-white transition text-xs font-bold uppercase flex items-center gap-2">
                <Tag size={14}/> Nova Categoria
            </button>
            <button onClick={handleOpenCreate} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
                <Plus size={16} /> Novo Produto
            </button>
        </div>
      </header>

      <main className="p-6 space-y-8">
        
        {/* ABAS */}
        <div className="flex border-b border-zinc-800 gap-4 overflow-x-auto">
            {["dashboard", "produtos", "vendas", "avaliacoes"].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-4 py-3 text-sm font-bold border-b-2 transition capitalize flex items-center gap-2 ${activeTab === tab ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                    {tab === 'dashboard' && <PieChart size={16}/>}
                    {tab === 'produtos' && <Package size={16}/>}
                    {tab === 'vendas' && <DollarSign size={16}/>}
                    {tab === 'avaliacoes' && <MessageCircle size={16}/>}
                    {tab}
                </button>
            ))}
        </div>

        {/* --- 1. DASHBOARD --- */}
        {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><DollarSign size={20}/></div>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">+15%</span>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Faturamento Mês</p>
                        <p className="text-2xl font-black text-white">R$ 12.450</p>
                    </div>
                    
                    <div 
                        className={`bg-zinc-900 p-5 rounded-2xl border cursor-pointer transition group ${filtroEstoqueCritico ? 'border-red-500 bg-red-950/10' : 'border-zinc-800 hover:border-red-500/50'}`}
                        onClick={() => { setFiltroEstoqueCritico(!filtroEstoqueCritico); setActiveTab("produtos"); }}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><AlertCircle size={20}/></div>
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition"/>
                        </div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Estoque Crítico</p>
                        <p className="text-2xl font-black text-white flex items-center gap-2">
                            {inventarioExpandido.filter(i => i.estoque < 10).length} <span className="text-sm font-normal text-zinc-500">SKUs</span>
                        </p>
                    </div>

                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col justify-between cursor-pointer hover:border-blue-500/30 transition" onClick={() => setActiveTab('vendas')}>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 w-fit"><ShoppingBag size={20}/></div>
                        <p className="text-xs text-zinc-500 font-bold uppercase mt-4">Vendas Hoje</p>
                        <p className="text-2xl font-black text-white">24</p>
                    </div>

                    <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800">
                        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 w-fit mb-4"><Star size={20}/></div>
                        <p className="text-xs text-zinc-500 font-bold uppercase">Avaliação Média</p>
                        <p className="text-2xl font-black text-white">4.8</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gráfico Donut Moderno */}
                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 flex flex-col items-center justify-center">
                        <h3 className="text-sm font-bold text-white mb-2 w-full flex items-center gap-2"><PieChart size={16} className="text-emerald-500"/> Categorias</h3>
                        <ModernDonutChart />
                    </div>

                    <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800">
                        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2"><BarChart3 size={16} className="text-blue-500"/> Top Produtos</h3>
                        <div className="space-y-4">
                            {produtos.sort((a,b) => b.vendidos - a.vendidos).slice(0, 3).map((prod, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <span className="text-lg font-black text-zinc-700 w-4">#{i+1}</span>
                                    <img src={prod.img} className="w-10 h-10 rounded-lg object-cover bg-black"/>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-white font-bold">{prod.nome}</span>
                                            <span className="text-zinc-400">{prod.vendidos} un</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${(prod.vendidos/500)*100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- 2. TABELA DE PRODUTOS --- */}
        {activeTab === 'produtos' && (
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                {filtroEstoqueCritico && <div className="bg-red-500/10 p-3 flex justify-between items-center text-xs text-red-400 font-bold border-b border-red-500/20"><span><AlertCircle size={14} className="inline mr-2"/> Filtro: Estoque Crítico (&lt;10 un)</span> <button onClick={() => setFiltroEstoqueCritico(false)} className="underline hover:text-white">Limpar</button></div>}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-black/40 text-zinc-500 font-bold uppercase text-[10px]">
                            <tr>
                                <th className="p-4">Produto</th>
                                <th className="p-4 text-center">Tam</th>
                                <th className="p-4 text-center">Cor</th>
                                <th className="p-4">Categoria</th>
                                <th className="p-4 text-right">Preço Unit.</th>
                                <th className="p-4 text-center">Estoque</th>
                                <th className="p-4 text-right">Total (R$)</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {inventarioExpandido.map((item, idx) => (
                                <tr key={idx} className="hover:bg-zinc-800/50 transition">
                                    <td className="p-4 flex items-center gap-3">
                                        <img src={item.img} className="w-8 h-8 rounded bg-black object-cover"/>
                                        <div>
                                            <span className="font-bold text-white text-xs block">{item.nome}</span>
                                            <span className="text-[9px] text-zinc-500">{item.lote}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center text-xs font-bold bg-black/20">{item.tamanho}</td>
                                    <td className="p-4 text-center text-xs">{item.cor}</td>
                                    <td className="p-4 text-xs"><span className="bg-zinc-800 px-2 py-1 rounded text-[10px] uppercase font-bold">{item.categoria}</span></td>
                                    <td className="p-4 text-right text-emerald-400 font-bold">R$ {item.preco.toFixed(2)}</td>
                                    <td className="p-4 text-center"><span className={`px-2 py-1 rounded font-bold text-xs ${item.estoque < 10 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{item.estoque}</span></td>
                                    <td className="p-4 text-right font-mono text-zinc-400">R$ {(item.preco * item.estoque).toFixed(2)}</td>
                                    <td className="p-4 text-right flex justify-end gap-1">
                                        <button onClick={() => handleOpenEdit(item.produtoId)} className="text-zinc-400 hover:text-white p-2 hover:bg-zinc-800 rounded"><Edit size={16}/></button>
                                        <button onClick={() => handleDeleteProduto(item.produtoId)} className="text-zinc-400 hover:text-red-500 p-2 hover:bg-zinc-800 rounded"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- 3. HISTÓRICO DE VENDAS (COLUNAS SEPARADAS) --- */}
        {activeTab === 'vendas' && (
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-black/40 text-zinc-500 font-bold uppercase">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Data Pagto</th>
                                <th className="p-3">Hora</th>
                                <th className="p-3">Comprador</th>
                                <th className="p-3">Produto</th>
                                <th className="p-3 text-center">Tam.</th>
                                <th className="p-3 text-center">Cor</th>
                                <th className="p-3 text-center">Qtd</th>
                                <th className="p-3 text-right">Unitário</th>
                                <th className="p-3 text-right">Total</th>
                                <th className="p-3 text-center">Status Pagto</th>
                                <th className="p-3 text-center">Status Retirada</th>
                                <th className="p-3 text-center">Quem Entregou</th>
                                <th className="p-3 text-center">Data Entrega</th>
                                <th className="p-3 text-center">Hora Entrega</th>
                                <th className="p-3 text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {vendas.map(venda => {
                                const [dataPag, horaPag] = venda.dataPagamento ? venda.dataPagamento.split(' ') : ['-', '-'];
                                const [dataEnt, horaEnt] = venda.dataEntrega ? venda.dataEntrega.split(' ') : ['-', '-'];
                                
                                return (
                                    <tr key={venda.itemId} className="hover:bg-zinc-800/50 transition">
                                        <td className="p-3 font-mono text-zinc-500">#{venda.id}</td>
                                        <td className="p-3 text-white font-bold">{dataPag}</td>
                                        <td className="p-3 text-zinc-500">{horaPag}</td>
                                        
                                        <td className="p-3">
                                            <Link href={`/perfil/${venda.compradorHandle}`} className="flex items-center gap-2 group hover:text-emerald-400 transition">
                                                <span className="font-bold text-white underline">{venda.comprador}</span>
                                            </Link>
                                        </td>

                                        <td className="p-3 text-white font-medium">{venda.produto}</td>
                                        <td className="p-3 text-center bg-zinc-950 rounded">{venda.tamanho}</td>
                                        <td className="p-3 text-center">{venda.cor}</td>
                                        <td className="p-3 text-center font-bold text-white">{venda.qtd}</td>
                                        
                                        <td className="p-3 text-right text-zinc-400">R$ {venda.valorUnitario.toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold text-emerald-400">R$ {venda.valorTotal.toFixed(2)}</td>

                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${venda.statusPagamento === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                                {venda.statusPagamento}
                                            </span>
                                        </td>

                                        <td className="p-3 text-center">
                                            <span className={`px-2 py-1 rounded text-[9px] font-bold ${venda.statusEntrega === 'Entregue' ? 'text-blue-400' : 'text-zinc-500'}`}>
                                                {venda.statusEntrega}
                                            </span>
                                        </td>

                                        <td className="p-3 text-center text-zinc-400">{venda.entreguePor || "-"}</td>
                                        <td className="p-3 text-center text-zinc-400">{dataEnt}</td>
                                        <td className="p-3 text-center text-zinc-400">{horaEnt}</td>

                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => handleToggleEntrega(venda.itemId)}
                                                className={`p-2 rounded-lg transition border ${venda.statusEntrega === 'Entregue' 
                                                    ? 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-red-400' 
                                                    : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-lg shadow-blue-900/20'}`}
                                                title={venda.statusEntrega === 'Entregue' ? "Desfazer entrega" : "Marcar como entregue"}
                                            >
                                                {venda.statusEntrega === 'Entregue' ? <XCircle size={14}/> : <Truck size={14}/>}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- 4. AVALIAÇÕES --- */}
        {activeTab === 'avaliacoes' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex gap-2 mb-4">
                    {['todas', 'pendentes', 'respondidas'].map(f => (
                        <button key={f} onClick={() => setFiltroAvaliacao(f as any)} className={`text-xs px-3 py-1.5 rounded-full capitalize border transition ${filtroAvaliacao === f ? 'bg-white text-black border-white' : 'bg-black text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}>{f}</button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {avaliacoesDisplay.map(av => (
                        <div key={av.id} className={`p-5 rounded-2xl border transition ${av.oculto ? 'bg-zinc-950 border-zinc-900 opacity-50' : 'bg-zinc-900 border-zinc-800'}`}>
                            <div className="flex justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-black border border-zinc-800 flex items-center justify-center font-bold text-zinc-500">{av.usuario.charAt(0)}</div>
                                    <div><p className="text-sm font-bold text-white">{av.usuario}</p><p className="text-[10px] text-zinc-500">Comprou: {av.produto}</p></div>
                                </div>
                                <div className="flex text-yellow-500"><Star size={14} fill="currentColor"/> <span className="ml-1 text-sm font-bold">{av.nota}</span></div>
                            </div>
                            <div className="bg-black/20 p-3 rounded-xl border border-zinc-800/50 mb-3"><p className={`text-sm ${av.oculto ? 'line-through text-zinc-600' : 'text-zinc-300'}`}>"{av.comentario}"</p></div>
                            {av.respondido && (
                                <div className="ml-4 mb-3 pl-3 border-l-2 border-emerald-500/50">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase flex items-center gap-1"><CornerDownRight size={10}/> {av.respostaAutor}</p>
                                        <p className="text-[9px] text-zinc-600">{av.respostaData}</p>
                                    </div>
                                    <p className="text-xs text-zinc-400">{av.respostaAdmin}</p>
                                </div>
                            )}
                            <div className="flex justify-between items-center pt-3 border-t border-zinc-800">
                                <span className="text-[10px] text-zinc-600">Postado em: {av.data}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handleOcultarAvaliacao(av.id)} className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-white px-3 py-1.5 rounded-lg bg-zinc-800 transition"><EyeOff size={12}/> {av.oculto ? "Exibir" : "Ocultar"}</button>
                                    {!av.respondido && <button onClick={() => setShowModalResposta(av)} className="flex items-center gap-1 text-[10px] font-bold text-white px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition"><MessageCircle size={12}/> Responder</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>

      {/* --- MODAIS --- */}
      {showModalResposta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-zinc-900 w-full max-w-md rounded-2xl border border-zinc-800 p-6 space-y-4">
                  <h3 className="font-bold text-white text-lg">Responder {showModalResposta.usuario}</h3>
                  <textarea className="w-full h-32 bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white resize-none outline-none focus:border-emerald-500" placeholder="Escreva sua resposta..." value={textoResposta} onChange={(e) => setTextoResposta(e.target.value)}></textarea>
                  <div className="flex gap-2"><button onClick={() => setShowModalResposta(null)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase">Cancelar</button><button onClick={handleEnviarResposta} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase flex items-center justify-center gap-2"><Send size={16}/> Enviar</button></div>
              </div>
          </div>
      )}

      {showModalProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-800 p-6 space-y-6 my-10 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4"><h2 className="font-bold text-white text-lg flex items-center gap-2"><ShoppingBag size={20} className="text-emerald-500" /> {isEditing ? "Editar Produto" : "Novo Produto"}</h2><button onClick={() => setShowModalProduto(false)}><X size={20} className="text-zinc-500 hover:text-white"/></button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center cursor-pointer hover:border-emerald-500/50 transition relative h-40 flex items-center justify-center bg-black/20" onClick={() => fileInputRef.current?.click()}><input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />{formData.img ? <img src={formData.img} className="max-h-full object-contain" /> : <div className="flex flex-col items-center gap-2 text-zinc-500"><UploadCloud size={32}/><span className="text-xs font-bold uppercase">Foto</span></div>}</div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Preço (R$)</label><input type="number" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={formData.preco} onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })} /></div>
                        <div className="relative"><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Preço Antigo</label><input type="number" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={formData.precoAntigo} onChange={(e) => setFormData({ ...formData, precoAntigo: Number(e.target.value) })} />{getDesconto() && <span className="absolute top-8 right-2 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold shadow-md">{getDesconto()}</span>}</div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Nome do Produto</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Categoria</label><select className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400 outline-none focus:border-emerald-500" value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}><option>Vestuário</option><option>Acessórios</option><option>Kits</option></select></div>
                        <div><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Lote</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500" value={formData.lote} onChange={(e) => setFormData({ ...formData, lote: e.target.value })} /></div>
                    </div>
                    <div className="bg-black/30 border border-zinc-800 rounded-xl p-3">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase mb-2 block">Estoque por Variação</label>
                        <div className="flex gap-2 mb-2"><input type="text" placeholder="Tam (P)" className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" value={novaVariante.tamanho} onChange={e => setNovaVariante({...novaVariante, tamanho: e.target.value})}/><input type="text" placeholder="Cor (Azul)" className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" value={novaVariante.cor} onChange={e => setNovaVariante({...novaVariante, cor: e.target.value})}/><input type="number" placeholder="Qtd" className="w-16 bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none" value={novaVariante.estoque || ''} onChange={e => setNovaVariante({...novaVariante, estoque: Number(e.target.value)})}/><button onClick={handleAddVariante} className="bg-zinc-800 px-3 rounded-lg text-white font-bold hover:bg-emerald-600 transition"><Plus size={14}/></button></div>
                        <div className="max-h-32 overflow-y-auto space-y-1">{variantesTemp.map((v) => (<div key={v.id} className="flex justify-between items-center text-xs bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800"><span className="text-white">{v.tamanho} - {v.cor}</span><div className="flex items-center gap-2"><span className="text-emerald-400 font-bold">{v.estoque} un</span><X size={12} className="text-zinc-600 hover:text-red-500 cursor-pointer" onClick={() => handleRemoveVariante(v.id)}/></div></div>))}{variantesTemp.length === 0 && <p className="text-[10px] text-zinc-600 italic text-center py-2">Nenhuma variação adicionada.</p>}</div>
                    </div>
                    <div><label className="text-[10px] text-zinc-500 font-bold uppercase mb-1 block">Descrição</label><textarea className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white outline-none focus:border-emerald-500 h-20 resize-none" value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}></textarea></div>
                </div>
            </div>
            <div className="flex gap-3 pt-2 border-t border-zinc-800"><button onClick={() => setShowModalProduto(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800">Cancelar</button><button onClick={handleSaveProduto} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-900/20">{isEditing ? 'Atualizar' : 'Cadastrar'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}