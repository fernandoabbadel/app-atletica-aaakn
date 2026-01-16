"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ArrowLeft, QrCode, Camera, MapPin, 
  Instagram, Lock, CheckCircle2, Heart, X, Sparkles, ScanLine, PawPrint
} from "lucide-react"; 
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { collection, onSnapshot, doc, setDoc, serverTimestamp, increment } from "firebase/firestore"; // 🦈 Increment Importado
import { QRCodeSVG } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";

// Configuração Visual das Turmas
const TURMAS_DATA: Record<string, { nome: string, logo: string, capa: string }> = {
  "T1": { nome: "Turma I - Jacaré", logo: "/turma1.jpeg", capa: "/capa_t1.jpg" },
  "T2": { nome: "Turma II - Cavalo Marinho", logo: "/turma2.jpeg", capa: "/capa_t2.jpg" },
  "T3": { nome: "Turma III - Tartaruga", logo: "/turma3.jpeg", capa: "/capa_t3.jpg" },
  "T4": { nome: "Turma IV - Baleia", logo: "/turma4.jpeg", capa: "/capa_t4.jpg" },
  "T5": { nome: "Turma V - Pinguim", logo: "/turma5.jpeg", capa: "/capa_t5.jpg" },
  "T6": { nome: "Turma VI - Lagosta", logo: "/turma6.jpeg", capa: "/capa_t6.jpg" },
  "T7": { nome: "Turma VII - Urso Polar", logo: "/turma7.jpeg", capa: "/capa_t7.jpg" },
  "T8": { nome: "Turma VIII - Calouros", logo: "/turma8.jpeg", capa: "/capa_t8.jpg" },
};

const LISTA_TURMAS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];

export default function AlbumPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState("T8");
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [meuAlbum, setMeuAlbum] = useState<string[]>([]);
  const [showMyQr, setShowMyQr] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Helper: Cálculo de Idade
  const calcularIdade = (dataNasc: string) => {
    if (!dataNasc) return "??";
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  // 1. Carregar Dados
  useEffect(() => {
    if (!user) return;
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsuarios(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAlbum = onSnapshot(collection(db, "users", user.uid, "albumColado"), (snap) => {
      setMeuAlbum(snap.docs.map(d => d.id));
      setLoading(false);
    });
    return () => { unsubUsers(); unsubAlbum(); };
  }, [user]);

  // 2. Lógica de Colar (ATUALIZADA COM FOTO E INCREMENT)
  const handleFoundUser = async (targetId: string) => {
    if (!user) return;
    
    // Para o scanner se estiver rodando
    if (scannerRef.current?.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
        setShowScanner(false);
    }

    if (targetId === user.uid) return addToast("Tentando se escanear? 😂", "info");
    if (meuAlbum.includes(targetId)) return addToast("Figurinha repetida! 🦈", "info");

    const targetUser = usuarios.find(u => u.id === targetId);
    
    if (!targetUser) return addToast("Código inválido ou usuário não carregado!", "error");

    // 🦈 AQUI ESTÁ A MÁGICA: Verifica se a pessoa escaneada é da T8
    const isBixo = targetUser.turma === "T8";

    try {
      // 1. Cola a figurinha no SEU álbum pessoal
      await setDoc(doc(db, "users", user.uid, "albumColado", targetId), {
        dataColada: serverTimestamp(),
        nome: targetUser.nome,
        turma: targetUser.turma
      });

      // 2. Atualiza o SEU Placar no Ranking Geral
      await setDoc(doc(db, "album_rankings", user.uid), {
        userId: user.uid, 
        nome: user.nome, 
        turma: user.turma,
        // 🔥 AQUI: Forçamos salvar sua foto e turma atuais no ranking
        foto: user.foto || "https://github.com/shadcn.png", 
        totalColetado: meuAlbum.length + 1, // Soma no total geral
        scansT8: isBixo ? increment(1) : increment(0), // 🦈 Se for Bixo, soma +1 aqui
        ultimoScan: serverTimestamp()
      }, { merge: true });

      addToast(`CAPTURA! ${targetUser.nome} adicionado! 📸🔥`, "success");
    } catch (e) {
      console.error(e);
      addToast("Erro ao colar no banco de dados.", "error");
    }
  };

  // 3. Scanner PRO
  useEffect(() => {
    if (showScanner && !scannerRef.current) {
        const startScanner = async () => {
            try {
                const html5QrCode = new Html5Qrcode("reader");
                scannerRef.current = html5QrCode;
                await html5QrCode.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
                    (decodedText) => { handleFoundUser(decodedText); },
                    (errorMessage) => { }
                );
            } catch (err) {
                console.error(err);
                addToast("Erro ao abrir câmera.", "error");
                setShowScanner(false);
            }
        };
        startScanner();
    }
    return () => {
        if (scannerRef.current?.isScanning) {
            scannerRef.current.stop().then(() => {
                scannerRef.current?.clear();
                scannerRef.current = null;
            }).catch(console.error);
        }
    };
  }, [showScanner]);

  // 4. Contadores
  const statsTurma = useMemo(() => {
    const totalCadastrados = usuarios.filter(u => u.turma === activeTab).length;
    const totalEuPeguei = usuarios.filter(u => u.turma === activeTab && meuAlbum.includes(u.id)).length;
    return { pegos: totalEuPeguei, total: totalCadastrados };
  }, [usuarios, meuAlbum, activeTab]);

  const usersFiltered = useMemo(() => {
    return usuarios.filter(u => u.turma === activeTab);
  }, [usuarios, activeTab]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse">CARREGANDO...</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-zinc-900 rounded-full"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-black uppercase italic">Caça aos Bixos</h1>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setShowMyQr(true)} className="bg-white text-black p-3 rounded-2xl shadow-lg active:scale-95 transition"><QrCode size={20} /></button>
            <button onClick={() => setShowScanner(true)} className="bg-emerald-600 text-white p-3 rounded-2xl shadow-emerald-500/20 shadow-lg active:scale-95 transition"><Camera size={20} /></button>
        </div>
      </header>

      {/* 🦈 SELETOR (AGORA SIM: COM T8 DOURADO E PISCANDO) 🦈 */}
      <div className="flex overflow-x-auto gap-4 p-6 bg-zinc-950/50 sticky top-[81px] z-40 backdrop-blur-sm border-b border-white/5 custom-scrollbar">
        {LISTA_TURMAS.map(t => {
          const isT8 = t === "T8";
          return (
            <button key={t} onClick={() => setActiveTab(t)} className="flex flex-col items-center gap-2 shrink-0 group">
              <div className={`
                w-14 h-14 rounded-full border-2 transition-all relative
                ${isT8 
                    ? 'border-yellow-400 border-dashed animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.6)] z-10' // 👑 Destaque Dourado T8
                    : activeTab === t 
                        ? 'border-emerald-500 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                        : 'border-zinc-800 grayscale opacity-60'
                }
                ${activeTab === t && isT8 ? 'scale-125 bg-yellow-400/10' : ''}
              `}>
                 <Image src={TURMAS_DATA[t]?.logo} width={56} height={56} className="w-full h-full object-cover rounded-full" alt={t} unoptimized />
              </div>
              <span className={`text-[10px] font-black uppercase 
                ${isT8 
                    ? 'text-yellow-400 animate-pulse' // Texto Dourado T8
                    : activeTab === t ? 'text-emerald-500' : 'text-zinc-500'}
              `}>{t}</span>
            </button>
          )
        })}
      </div>

      {/* CAPA */}
      <div className="relative h-56 w-full mb-8 overflow-hidden group">
          <Image 
            src={TURMAS_DATA[activeTab]?.capa} 
            fill 
            className="object-cover opacity-60" 
            alt="Capa Turma"
            unoptimized
            onError={(e) => { 
                const target = e.target as HTMLImageElement;
                target.src = "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&q=80" 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
              <div>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{TURMAS_DATA[activeTab]?.nome}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <Sparkles size={14} className="text-emerald-500"/>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Álbum Oficial</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[1px] rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                  <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center">
                      <span className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">Capturados</span>
                      <div className="text-xl font-black text-white italic leading-none mt-1">
                          {statsTurma.pegos}<span className="text-yellow-500/50 mx-1">/</span>{statsTurma.total}
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* GRID */}
      <main className="p-4 grid grid-cols-1 gap-6 max-w-3xl mx-auto">
        {usersFiltered.map((u) => {
          const isColada = meuAlbum.includes(u.id);
          
          return (
            <div key={u.id} className={`relative rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${isColada ? 'bg-zinc-900/80 border-emerald-500/40 shadow-2xl' : 'bg-zinc-950 border-white/5 grayscale brightness-50 opacity-40'}`}>
              <div className="p-6 flex items-center gap-6">
                <div className={`relative shrink-0 w-24 h-24 rounded-full border-4 transition-all duration-700 ${isColada ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105' : 'border-zinc-800'}`}>
                   <img src={u.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover rounded-full" />
                   {isColada && <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg"><CheckCircle2 size={14} fill="white"/></div>}
                </div>
                
                {/* --- BLOCO DE INFO --- */}
                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl font-black uppercase italic leading-none truncate ${isColada ? 'text-white' : 'text-zinc-700'}`}>{u.apelido || u.nome}</h3>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{u.turma}</span>
                    
                    {isColada && (
                        <>
                            {/* IDADE */}
                            <span className="text-[9px] font-black bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500 uppercase">{u.idadePublica === false ? "??" : calcularIdade(u.dataNascimento)} ANOS</span>
                            
                            {/* ESPORTES */}
                            {u.esportes && u.esportes.length > 0 && (
                                <div className="flex gap-1 bg-blue-500/10 px-2 py-0.5 rounded">
                                    {u.esportes.slice(0, 3).map((esp: string) => {
                                        const icons: Record<string, string> = { 
                                            "futebol": "⚽", "futsal": "👟", "volei": "🏐", "basquete": "🏀", 
                                            "handball": "🤾", "rugby": "🏉", "baseball": "⚾", "futevolei": "🦶", 
                                            "beach_tennis": "🏖️", "tenis": "🎾", "frescobol": "🏓", "taco": "🏏", 
                                            "peteca": "🏸", "surf": "🏄", "natacao": "🏊", "canoagem": "🛶", 
                                            "skate": "🛹", "dog_walking": "🐕", "truco": "🃏", "sinuca": "🎱" 
                                        };
                                        return <span key={esp} title={esp}>{icons[esp] || "🏆"}</span>
                                    })}
                                    {u.esportes.length > 3 && <span className="text-[8px] text-blue-400 self-center font-bold">+{u.esportes.length - 3}</span>}
                                </div>
                            )}

                            {/* PETS */}
                            {u.pets && u.pets !== "nenhum" && (
                                <span className="text-[9px] font-black bg-orange-500/10 px-2 py-0.5 rounded text-orange-500 uppercase flex items-center gap-1">
                                    <PawPrint size={10}/>
                                    {u.pets === "cachorro" && "DOG"}
                                    {u.pets === "gato" && "CAT"}
                                    {u.pets === "ambos" && "ZOO"}
                                </span>
                            )}

                            {/* CIDADE */}
                            <span className="text-[9px] font-black bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500 uppercase flex items-center gap-1"><MapPin size={8}/> {u.cidadeOrigem || "?"}</span>
                            
                            {/* RELACIONAMENTO */}
                            {u.relacionamentoPublico && u.statusRelacionamento && (
                                <span className="text-[9px] font-black bg-pink-500/10 px-2 py-0.5 rounded text-pink-500 uppercase flex items-center gap-1">
                                    <Heart size={8} fill={u.statusRelacionamento !== 'Solteiro(a)' ? 'currentColor' : 'none'}/> {u.statusRelacionamento}
                                </span>
                            )}
                        </>
                    )}
                  </div>
                  
                  {isColada ? (
                    <div className="mt-3">
                        <p className="text-zinc-400 text-[11px] line-clamp-2 font-medium italic">"{u.bio || '...'}"</p>
                        {u.instagram && (
                            <a href={`https://instagram.com/${u.instagram.replace('@','')}`} target="_blank" className="inline-flex items-center gap-1.5 mt-2 text-pink-500 text-[10px] font-black uppercase hover:underline">
                                <Instagram size={12}/> @{u.instagram.replace('@','')}
                            </a>
                        )}
                    </div>
                  ) : (<div className="flex items-center gap-2 mt-4 text-zinc-800"><Lock size={12}/> <span className="text-[10px] font-black uppercase tracking-widest">Bloqueado</span></div>)}
                </div>
                {/* --- FIM DO BLOCO --- */}

              </div>
            </div>
          );
        })}
        {usersFiltered.length === 0 && <div className="text-center text-zinc-600 font-bold uppercase py-10">Ninguém dessa turma ainda.</div>}
      </main>

      {/* MODAL SCANNER */}
      {showScanner && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 z-50 animate-pulse"></div>
              <div className="flex-1 relative flex items-center justify-center bg-black">
                  <div id="reader" className="w-full h-full max-w-lg overflow-hidden"></div>
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-64 h-64 border-4 border-emerald-500/50 rounded-3xl relative"></div>
                  </div>
                  <button onClick={() => setShowScanner(false)} className="absolute top-6 right-6 bg-black/50 text-white p-3 rounded-full backdrop-blur-md z-50 border border-white/10"><X size={24}/></button>
              </div>
          </div>
      )}

      {/* MODAL MEU QR */}
      {showMyQr && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6" onClick={() => setShowMyQr(false)}>
              <div className="bg-zinc-900 w-full max-w-sm rounded-[3rem] p-8 border border-emerald-500/30 text-center relative shadow-[0_0_50px_rgba(16,185,129,0.2)]" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowMyQr(false)} className="absolute top-6 right-6 text-zinc-500"><X size={24}/></button>
                  <div className="w-24 h-24 rounded-full border-4 border-emerald-500 mx-auto mb-4 overflow-hidden shadow-xl"><img src={user?.foto} className="w-full h-full object-cover" /></div>
                  <h2 className="text-2xl font-black uppercase italic mb-1 text-white">Meu Shark Code</h2>
                  <div className="bg-white p-4 rounded-[2rem] inline-block my-6 shadow-inner"><QRCodeSVG value={user?.uid || ""} size={220} /></div>
                  <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">ID: {user?.uid}</p>
              </div>
          </div>
      )}
    </div>
  );
}