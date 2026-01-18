"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Ghost, Star, Crown, Copy, QrCode, Loader2, Upload, Image as ImageIcon, ShoppingBag, Clock } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext"; // Importante para pegar o ID do user
import { db, storage } from "../../../lib/firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Ícones locais
const ICONS_MAP: any = { ghost: Ghost, star: Star, crown: Crown, shopping: ShoppingBag };

export default function AdesaoPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast();
  const { user } = useAuth();
  
  const planId = searchParams.get('plano');
  const [plano, setPlano] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Upload State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
      const fetchPlan = async () => {
          if (!planId) return;
          const docRef = doc(db, "planos", planId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
              setPlano({ id: snap.id, ...snap.data() });
          }
          setFetching(false);
      };
      fetchPlan();
  }, [planId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setReceiptFile(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  const handleFinish = async () => {
      if (!receiptFile || !user || !plano) {
          addToast("Por favor, anexe o comprovante.", "error");
          return;
      }

      setLoading(true);
      try {
          // 1. Upload do Comprovante
          const storageRef = ref(storage, `comprovantes/${user.uid}_${Date.now()}`);
          await uploadBytes(storageRef, receiptFile);
          const downloadUrl = await getDownloadURL(storageRef);

          // 2. Criar Solicitação Pendente
          await addDoc(collection(db, "solicitacoes_adesao"), {
              userId: user.uid,
              userName: user.nome || "Aluno",
              userTurma: user.turma || "T??",
              planoId: plano.id,
              planoNome: plano.nome,
              valor: plano.precoVal,
              comprovanteUrl: downloadUrl,
              dataSolicitacao: serverTimestamp(),
              status: "pendente" // O segredo está aqui
          });

          setStep(3); // Tela de Sucesso/Espera
          addToast("Comprovante enviado para análise!", "success");

      } catch (error) {
          console.error(error);
          addToast("Erro ao enviar. Tente novamente.", "error");
      } finally {
          setLoading(false);
      }
  };

  if (fetching) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500"><Loader2 className="animate-spin"/></div>;
  if (!plano) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Plano não encontrado.</div>;

  const Icon = ICONS_MAP[plano.icon] || Star;
  const colorClass = plano.cor === 'yellow' ? 'text-yellow-500' : plano.cor === 'zinc' ? 'text-purple-500' : 'text-emerald-500';

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        
        {/* Background Animado */}
        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <Link href="/planos" className="absolute top-6 left-6 text-zinc-500 hover:text-white flex items-center gap-2 transition z-50 font-bold uppercase text-xs tracking-wider">
            <ArrowLeft size={18}/> Cancelar
        </Link>

        <div className="w-full max-w-lg bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-[2rem] shadow-2xl relative z-10 my-10 animate-in zoom-in-95 duration-300">
            
            {/* HEADER DO CARD */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto bg-black rounded-full border border-zinc-700 flex items-center justify-center mb-4 shadow-xl">
                    <Icon size={32} className={colorClass}/>
                </div>
                <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Adesão {plano.nome}</h1>
                <p className="text-zinc-400 text-xs font-medium mt-2">Passo {step} de 3</p>
                <div className="w-full h-1 bg-zinc-800 mt-4 rounded-full overflow-hidden">
                    <div className={`h-full bg-emerald-500 transition-all duration-500 ease-out`} style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}></div>
                </div>
            </div>

            {/* PASSO 1: CONFIRMAÇÃO */}
            {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right">
                    <div className="bg-black/40 p-4 rounded-xl border border-zinc-700 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Plano Selecionado</span>
                            <span className="text-white font-bold">{plano.nome}</span>
                        </div>
                        <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                            <span className="text-zinc-300 font-bold uppercase">Total</span>
                            <span className="text-emerald-400 font-black text-xl">R$ {plano.preco}</span>
                        </div>
                    </div>
                    <button onClick={() => setStep(2)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95 flex justify-center items-center gap-2">
                        Ir para Pagamento <ArrowLeft size={18} className="rotate-180"/>
                    </button>
                </div>
            )}

            {/* PASSO 2: PIX + UPLOAD */}
            {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right text-center">
                    
                    {/* ÁREA PIX */}
                    <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700">
                        <p className="text-xs text-zinc-400 mb-3 uppercase font-bold tracking-widest">1. Faça o Pix</p>
                        <div className="bg-white p-2 rounded-xl inline-block mb-3">
                            <QrCode size={120} className="text-black"/>
                        </div>
                        <div className="bg-black p-3 rounded-lg flex items-center justify-between border border-zinc-700 cursor-pointer hover:border-emerald-500 transition" onClick={() => addToast("Chave Pix Copiada!", "success")}>
                            <span className="text-xs text-zinc-300 font-mono truncate max-w-[200px]">00020126580014br.gov.bcb.pix...</span>
                            <Copy size={14} className="text-emerald-500"/>
                        </div>
                    </div>

                    {/* ÁREA UPLOAD */}
                    <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700">
                        <p className="text-xs text-zinc-400 mb-3 uppercase font-bold tracking-widest">2. Envie o Comprovante</p>
                        
                        <label className="block w-full cursor-pointer group">
                            <div className={`border-2 border-dashed border-zinc-600 rounded-xl h-32 flex flex-col items-center justify-center transition group-hover:border-emerald-500 group-hover:bg-emerald-500/5 ${previewUrl ? 'border-emerald-500 bg-black' : ''}`}>
                                {previewUrl ? (
                                    <img src={previewUrl} className="h-full w-full object-contain rounded-lg"/>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-zinc-500 group-hover:text-emerald-500 mb-2"/>
                                        <span className="text-[10px] text-zinc-400 uppercase font-bold">Toque para selecionar</span>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange}/>
                        </label>
                    </div>

                    <button onClick={handleFinish} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="animate-spin"/> : "Enviar para Análise"}
                    </button>
                </div>
            )}

            {/* PASSO 3: AGUARDANDO APROVAÇÃO */}
            {step === 3 && (
                <div className="space-y-6 animate-in zoom-in text-center py-6">
                    <div className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(234,179,8,0.2)] border border-yellow-500/50 animate-pulse">
                        <Clock size={48} className="text-yellow-500"/>
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase italic">EM ANÁLISE!</h2>
                        <p className="text-zinc-400 mt-2 text-sm max-w-xs mx-auto">Recebemos seu comprovante. O Tubarão Financeiro vai conferir e liberar seu acesso em breve.</p>
                    </div>

                    <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700 text-left">
                        <p className="text-xs text-zinc-300 mb-2">ℹ️ <span className="font-bold text-white">O que acontece agora?</span></p>
                        <ul className="text-xs text-zinc-400 space-y-2 list-disc pl-4">
                            <li>Seu perfil será atualizado automaticamente.</li>
                            <li>Sua carteirinha mudará de cor.</li>
                            <li>Você será notificado (em breve).</li>
                        </ul>
                    </div>

                    <button onClick={() => router.push('/menu')} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black uppercase py-4 rounded-xl shadow-lg transition active:scale-95 border border-zinc-700">
                        Voltar ao Menu
                    </button>
                </div>
            )}

        </div>
    </div>
  );
}