"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode, Ticket, Edit, Calendar, Store,
  Camera, LogOut, Loader2, X
} from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "../../../context/ToastContext";
import { db } from "../../../lib/firebase";
import { doc, getDoc, updateDoc, collection, addDoc, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";

// Helper Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// --- TIPAGEM ---
interface Cupom {
    titulo: string;
    valor: string;
}

interface EmpresaData {
    id: string;
    nome: string;
    imgLogo?: string;
    imgCapa?: string;
    totalScans?: number;
    cupons?: Cupom[];
    createdAt?: Timestamp;
    descricao?: string;
    insta?: string;
    whats?: string;
}

interface ScanData {
    id: string;
    empresaId: string;
    empresa: string;
    usuario: string;
    userId: string;
    cupom: string;
    valorEconomizado: string;
    data: string;
    hora: string;
    timestamp: Date;
}

interface EditFormState {
    nome?: string;
    descricao?: string;
    insta?: string;
    whats?: string;
    imgLogo?: string;
    imgCapa?: string;
}

export default function EmpresaDashboard() {
  const { addToast } = useToast();
  const router = useRouter();
  const params = useParams(); 
  const empresaId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<EmpresaData | null>(null);
  const [history, setHistory] = useState<ScanData[]>([]);
  const [scanning, setScanning] = useState(false);
  
  // Edição
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({});
  
  // Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // --- CARREGAR DADOS DO FIREBASE ---
  useEffect(() => {
    const fetchCompanyData = async () => {
        if (!empresaId) return;
        try {
            // 1. Pega dados da Empresa
            const docRef = doc(db, "parceiros", empresaId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() } as EmpresaData;
                setPartner(data);
                setEditForm(data); // Prepara form
            } else {
                addToast("Empresa não encontrada.", "error");
                router.push("/empresa");
            }

            // 2. Pega histórico de Scans dessa empresa
            const qScans = query(collection(db, "scans"), where("empresaId", "==", empresaId), orderBy("data", "desc"));
            const scanSnaps = await getDocs(qScans);
            setHistory(scanSnaps.docs.map(d => ({id: d.id, ...d.data()} as ScanData)));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    fetchCompanyData();
  }, [empresaId, addToast, router]);

  // --- AÇÕES ---

  const handleScan = async () => {
      if (!partner) return;
      setScanning(true);
      // Simulação de Scan (Num app real, abriria câmera)
      setTimeout(async () => {
          setScanning(false);
          
          try {
              // ID 61: Registra Scan no Firebase
              const newScan: Omit<ScanData, 'id'> = {
                  empresaId: empresaId,
                  empresa: partner.nome,
                  usuario: "Aluno Exemplo", // Viria do QR Code lido
                  userId: "u123",
                  cupom: partner.cupons?.[0]?.titulo || "Desconto",
                  valorEconomizado: partner.cupons?.[0]?.valor || "R$ 0,00",
                  data: new Date().toLocaleDateString('pt-BR'),
                  hora: new Date().toLocaleTimeString('pt-BR'),
                  timestamp: new Date()
              };

              const docRef = await addDoc(collection(db, "scans"), newScan);
              const scanWithId = { id: docRef.id, ...newScan } as ScanData;
              
              // Atualiza contador na empresa
              const newTotal = (partner.totalScans || 0) + 1;
              await updateDoc(doc(db, "parceiros", empresaId), {
                  totalScans: newTotal
              });

              setHistory(prev => [scanWithId, ...prev]);
              // 🦈 CORREÇÃO: Tipagem explícita para evitar erro 'implicitly has any type'
              setPartner((prev) => prev ? ({...prev, totalScans: newTotal}) : null);
              addToast("✅ Cupom Validado com Sucesso!", "success");

          } catch(error) {
              console.error(error);
              addToast("Erro ao registrar scan.", "error");
          }
      }, 2000);
  };

  const handleSaveProfile = async () => {
      try {
          const editPayload: Record<string, unknown> = { ...editForm };
          await updateDoc(doc(db, "parceiros", empresaId), editPayload);
          setPartner(prev => prev ? ({...prev, ...editForm}) : null);
          setShowEditModal(false);
          addToast("Perfil atualizado!", "success");
      } catch {
          addToast("Erro ao salvar.", "error");
      }
  };

  // Upload Simples
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      if (e.target.files?.[0]) {
          const b64 = await fileToBase64(e.target.files[0]);
          // 🦈 CORREÇÃO: Tipagem explícita para evitar erro 'implicitly has any type'
          setEditForm((prev) => ({...prev, [field]: b64}));
      }
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;
  if (!partner) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 selection:bg-emerald-500">
      
      {/* HEADER ESPECÍFICO DA EMPRESA */}
      <header className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-black border border-zinc-700 flex items-center justify-center overflow-hidden relative">
                  {/* 🦈 CORREÇÃO: Image Otimizado */}
                  {partner.imgLogo ? <Image src={partner.imgLogo} alt={partner.nome} fill className="object-cover" unoptimized/> : <Store size={20} className="text-zinc-500"/>}
              </div>
              <div>
                  <h2 className="text-lg font-black uppercase text-white leading-none">{partner.nome}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Painel de Controle</p>
              </div>
          </div>
          <button onClick={() => router.push("/empresa")} className="bg-black p-2 rounded-full text-zinc-500 hover:text-red-500 transition border border-zinc-800"><LogOut size={18}/></button>
      </header>

      <main className="p-6 space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
          
          <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
              <div>
                  <p className="text-xs text-zinc-400 font-bold uppercase">Meus Dados</p>
                  <p className="text-white font-bold text-sm">Mantenha sua página sempre atualizada.</p>
              </div>
              <button onClick={() => setShowEditModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition"><Edit size={14}/> Editar</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ESQUERDA: AÇÕES */}
            <div className="space-y-6 lg:col-span-1">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-lg">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Calendar size={10}/> Cliente Desde</p>
                        <h3 className="text-xs font-black text-white">{partner.createdAt ? partner.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}</h3>
                    </div>
                    <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-lg">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Ticket size={10}/> Total Scans</p>
                        <h3 className="text-xl font-black text-emerald-500">{partner.totalScans || 0}</h3>
                    </div>
                </div>

                <div onClick={handleScan} className="bg-gradient-to-b from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-3xl p-8 text-center cursor-pointer active:scale-95 transition shadow-lg relative overflow-hidden group">
                    <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className={`w-32 h-32 mx-auto rounded-full bg-black border-4 flex items-center justify-center mb-4 transition duration-500 relative z-10 ${scanning ? 'border-emerald-500 animate-pulse shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'border-zinc-700 group-hover:border-emerald-500'}`}>
                        <Camera size={40} className={scanning ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-emerald-500'}/>
                    </div>
                    <h3 className="text-xl font-black uppercase mb-1 relative z-10 text-white">{scanning ? "Lendo QR..." : "Ler QR Code"}</h3>
                    <p className="text-xs text-zinc-400 relative z-10">Validar desconto do aluno</p>
                </div>
            </div>

            {/* DIREITA: HISTÓRICO REAL */}
            <div className="lg:col-span-2">
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl h-full flex flex-col">
                    <div className="p-6 border-b border-zinc-800 bg-black/20">
                        <h3 className="font-bold text-white flex items-center gap-2"><QrCode size={18} className="text-emerald-500"/> Histórico de Uso</h3>
                    </div>
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-black/40 border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                                <tr><th className="p-4">Data</th><th className="p-4">Aluno</th><th className="p-4">Cupom</th><th className="p-4 text-right">Valor</th></tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                                {history.map((log) => (
                                    <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                                        <td className="p-4"><div>{log.data}</div><div className="text-[10px] text-zinc-500">{log.hora}</div></td>
                                        <td className="p-4"><div className="text-white font-medium">{log.usuario}</div><span className="text-[10px] text-zinc-500">{log.userId}</span></td>
                                        <td className="p-4 flex items-center gap-2"><Ticket size={14} className="text-emerald-500"/> {log.cupom}</td>
                                        <td className="p-4 text-right font-mono text-emerald-400 font-bold">{log.valorEconomizado}</td>
                                    </tr>
                                ))}
                                {history.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-500 text-xs">Nenhum scan registrado ainda.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

          </div>
      </main>

      {/* MODAL EDITAR (SIMPLIFICADO PARA O CONTEXTO) */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 w-full max-w-2xl rounded-2xl border border-zinc-800 p-6 shadow-2xl relative">
                <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X size={20}/></button>
                <h3 className="font-bold text-white text-lg mb-4">Editar Informações</h3>
                
                <div className="space-y-4">
                    <div><label className="text-[10px] text-zinc-500 uppercase font-bold">Descrição</label><textarea className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm" rows={3} value={editForm.descricao || ""} onChange={e => setEditForm({...editForm, descricao: e.target.value})}/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-[10px] text-zinc-500 uppercase font-bold">Instagram</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm" value={editForm.insta || ""} onChange={e => setEditForm({...editForm, insta: e.target.value})}/></div>
                        <div><label className="text-[10px] text-zinc-500 uppercase font-bold">WhatsApp</label><input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white text-sm" value={editForm.whats || ""} onChange={e => setEditForm({...editForm, whats: e.target.value})}/></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => logoInputRef.current?.click()} className="bg-zinc-800 p-3 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 border border-zinc-700">Alterar Logo</button>
                        <button onClick={() => coverInputRef.current?.click()} className="bg-zinc-800 p-3 rounded-lg text-xs text-zinc-300 hover:bg-zinc-700 border border-zinc-700">Alterar Capa</button>
                        <input type="file" hidden ref={logoInputRef} onChange={e => handleFileChange(e, 'imgLogo')}/>
                        <input type="file" hidden ref={coverInputRef} onChange={e => handleFileChange(e, 'imgCapa')}/>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white text-xs font-bold">Cancelar</button>
                    <button onClick={handleSaveProfile} className="px-6 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500">Salvar Alterações</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
