"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ArrowLeft, Trophy, Users, Save, ImageIcon, 
  Edit3, Layout, BarChart3, Loader2, UploadCloud, Link as LinkIcon 
} from "lucide-react";
import Link from "next/link";
import { db, storage } from "../../../lib/firebase"; // 🦈 Certifique-se que storage está exportado
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // 🦈 Imports do Storage
import Image from "next/image";

// Configuração inicial das turmas
const LISTA_TURMAS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];

// Mapeamento de Logos (Hardcoded ou vindo do banco se preferir)
const TURMA_LOGOS: Record<string, string> = {
  "T1": "/turma1.jpeg", "T2": "/turma2.jpeg", "T3": "/turma3.jpeg",
  "T4": "/turma4.jpeg", "T5": "/turma5.jpeg", "T6": "/turma6.jpeg",
  "T7": "/turma7.jpeg", "T8": "/turma8.jpeg"
};

export default function AdminAlbumPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "cms">("dashboard");
  const [hunters, setHunters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DO CMS ---
  const [cmsTurma, setCmsTurma] = useState("T8");
  const [cmsData, setCmsData] = useState({ capa: "", titulo: "", subtitulo: "" });
  const [savingCms, setSavingCms] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Carregar Rankings em Tempo Real
  useEffect(() => {
    const q = query(collection(db, "album_rankings"), orderBy("totalColetado", "desc"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setHunters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Carregar Config da Turma (CMS)
  useEffect(() => {
    const fetchConfig = async () => {
        const docRef = doc(db, "album_config", cmsTurma);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
            setCmsData(snap.data() as any);
        } else {
            setCmsData({ capa: "", titulo: `TURMA ${cmsTurma} - Calouros`, subtitulo: "Álbum Oficial" });
        }
    };
    fetchConfig();
  }, [cmsTurma]);

  // 3. Upload de Imagem (Capa)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingImg(true);

    try {
        const storageRef = ref(storage, `capas_turmas/${cmsTurma}_${Date.now()}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        setCmsData(prev => ({ ...prev, capa: url }));
        alert("Capa enviada para a nuvem! Não esqueça de Salvar a página.");
    } catch (error) {
        console.error(error);
        alert("Erro no upload da imagem.");
    } finally {
        setUploadingImg(false);
    }
  };

  // 4. Salvar CMS
  const handleSaveCms = async () => {
    setSavingCms(true);
    try {
        await setDoc(doc(db, "album_config", cmsTurma), { ...cmsData, updatedAt: new Date() });
        alert(`Página da ${cmsTurma} atualizada com sucesso! 🦈`);
    } catch (e) {
        alert("Erro ao salvar config.");
    } finally {
        setSavingCms(false);
    }
  };

  // --- LÓGICA DOS 3 RANKINGS ---

  // 1. Predadores de Bixos: Alunos (QUALQUER TURMA) que mais escanearam T8
  // Precisa do campo 'scansT8' no banco. Se não tiver, assume 0.
  const rankingPredadoresT8 = useMemo(() => {
    return [...hunters].sort((a, b) => (b.scansT8 || 0) - (a.scansT8 || 0)).slice(0, 10);
  }, [hunters]);

  // 2. Bixos Caçadores: Apenas T8, ordenados por total coletado
  const rankingCalouros = useMemo(() => {
    return hunters.filter(h => h.turma === "T8").sort((a, b) => b.totalColetado - a.totalColetado).slice(0, 10);
  }, [hunters]);

  // 3. Ranking Geral Absoluto: Todo mundo, ordenado por total
  const rankingGeral = useMemo(() => {
    return [...hunters].sort((a, b) => b.totalColetado - a.totalColetado).slice(0, 10);
  }, [hunters]);


  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-black animate-pulse">CARREGANDO QG...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 pb-20">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20}/></Link>
          <div>
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">Comando do Álbum</h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Gestão de Caça & Conteúdo</p>
          </div>
        </div>

        <div className="flex bg-zinc-900 p-1 rounded-xl w-full md:w-auto">
            <button onClick={() => setActiveTab("dashboard")} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === "dashboard" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"}`}>
                <BarChart3 size={16}/> Rankings
            </button>
            <button onClick={() => setActiveTab("cms")} className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === "cms" ? "bg-emerald-600 text-white shadow-lg" : "text-zinc-500 hover:text-white"}`}>
                <Edit3 size={16}/> Editor (CMS)
            </button>
        </div>
      </header>

      {/* === ABA 1: DASHBOARD & RANKINGS === */}
      {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
              
              {/* RANKING 1: PREDADORES DE BIXOS (Geral -> T8) */}
              <RankingSection 
                title="🏆 Quem mais caçou Calouros (T8)" 
                data={rankingPredadoresT8} 
                metricKey="scansT8"
                metricLabel="Bixos Capturados"
                color="text-yellow-500"
                icon={<Trophy size={18} className="text-yellow-500"/>}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* RANKING 2: CALOUROS CAÇADORES (T8 -> Geral) */}
                  <RankingSection 
                    title="🦈 Calouros que mais pontuaram" 
                    data={rankingCalouros} 
                    metricKey="totalColetado"
                    metricLabel="Scans Totais"
                    color="text-blue-500"
                    icon={<Trophy size={18} className="text-blue-500"/>}
                  />

                  {/* RANKING 3: GERAL (Geral -> Geral) */}
                  <RankingSection 
                    title="🌍 Ranking Global da Faculdade" 
                    data={rankingGeral} 
                    metricKey="totalColetado"
                    metricLabel="Total Scans"
                    color="text-emerald-500"
                    icon={<Trophy size={18} className="text-emerald-500"/>}
                  />
              </div>
          </div>
      )}

      {/* === ABA 2: CMS (EDITOR) === */}
      {activeTab === "cms" && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-right duration-500">
              <div className="bg-zinc-900/80 border border-zinc-800 p-8 rounded-[2.5rem]">
                  <h2 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2"><Layout size={20} className="text-emerald-500"/> Editor de Capas</h2>
                  
                  <div className="space-y-6">
                      {/* SELETOR DE TURMA */}
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                          {LISTA_TURMAS.map(t => (
                              <button key={t} onClick={() => setCmsTurma(t)} className={`px-4 py-2 rounded-lg font-black text-xs transition-all ${cmsTurma === t ? "bg-emerald-600 text-white scale-105" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"}`}>
                                  {t}
                              </button>
                          ))}
                      </div>

                      <div className="space-y-4 bg-black/40 p-6 rounded-3xl border border-zinc-800">
                          {/* UPLOAD DE CAPA */}
                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Imagem de Capa</label>
                              <div className="flex gap-4 items-start">
                                  <div className="relative w-32 h-20 bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 shrink-0">
                                      {cmsData.capa ? (
                                        <Image src={cmsData.capa} fill className="object-cover" alt="Preview" unoptimized/>
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImageIcon size={24}/></div>
                                      )}
                                  </div>
                                  <div className="flex-1">
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={handleImageUpload}
                                      />
                                      <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingImg}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 transition"
                                      >
                                          {uploadingImg ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>}
                                          {uploadingImg ? "Enviando..." : "Fazer Upload"}
                                      </button>
                                      <p className="text-[10px] text-zinc-600 mt-2">Recomendado: 1200x400px (JPG/PNG)</p>
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Título Principal</label>
                              <input type="text" placeholder="Ex: TURMA VIII" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none font-bold" value={cmsData.titulo} onChange={e => setCmsData({...cmsData, titulo: e.target.value})} />
                          </div>

                          <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Frase / Descrição</label>
                              <input type="text" placeholder="Ex: Álbum Oficial" className="w-full bg-zinc-900 border border-zinc-700 rounded-xl py-3 px-4 text-sm text-white focus:border-emerald-500 outline-none" value={cmsData.subtitulo} onChange={e => setCmsData({...cmsData, subtitulo: e.target.value})} />
                          </div>
                      </div>

                      <button onClick={handleSaveCms} disabled={savingCms} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
                          {savingCms ? <Loader2 className="animate-spin"/> : <Save size={20}/>}
                          {savingCms ? "Salvando..." : "Salvar Alterações"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
      `}</style>
    </div>
  );
}

// 🦈 COMPONENTE DE RANKING REUTILIZÁVEL PARA LIMPAR O CÓDIGO
function RankingSection({ title, data, metricKey, metricLabel, color, icon }: any) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] overflow-hidden">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
                <h3 className="font-black uppercase italic flex items-center gap-2">{icon} {title}</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase font-black text-zinc-500 bg-zinc-950/50 sticky top-0 backdrop-blur-sm z-10">
                        <tr>
                            <th className="p-4 w-16">#</th>
                            <th className="p-4">Caçador</th>
                            <th className="p-4">Cardume</th>
                            <th className="p-4 text-right">{metricLabel}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {data.map((h: any, i: number) => (
                            <tr key={h.id} className="hover:bg-white/5 transition group">
                                <td className="p-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black italic text-xs ${i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : i === 1 ? 'bg-zinc-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                                        {i + 1}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border-2 border-zinc-700 group-hover:border-emerald-500 transition relative">
                                            <Image src={h.foto || "https://github.com/shadcn.png"} alt={h.nome} fill className="object-cover" unoptimized/>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm text-white truncate max-w-[120px] md:max-w-xs">{h.nome}</span>
                                            {/* 🦈 LINK PARA O ADMIN USER */}
                                            <Link href={`/admin/users/${h.userId}`} className="text-[10px] text-zinc-500 hover:text-emerald-500 flex items-center gap-1 uppercase font-bold mt-0.5">
                                                <LinkIcon size={10}/> Ver Perfil
                                            </Link>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden relative">
                                            <Image src={TURMA_LOGOS[h.turma] || "/logo.png"} alt={h.turma} fill className="object-cover" unoptimized/>
                                        </div>
                                        <span className="bg-zinc-800 text-[10px] px-2 py-1 rounded font-black text-zinc-400 uppercase">{h.turma}</span>
                                    </div>
                                </td>
                                <td className={`p-4 text-right font-black text-lg ${color}`}>
                                    {h[metricKey] || 0}
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-zinc-600 font-bold uppercase italic">Nenhum predador encontrado...</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}