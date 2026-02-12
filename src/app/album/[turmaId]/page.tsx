"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Heart,
  Instagram,
  Lock,
  MapPin,
  PawPrint,
  QrCode,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeSVG } from "qrcode.react";

import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  fetchAlbumCollectedIds,
  fetchUsersByTurma,
  registerAlbumCapture,
} from "../../../lib/albumService";

type TurmaKey = "T1" | "T2" | "T3" | "T4" | "T5" | "T6" | "T7" | "T8";

interface UserData {
  id: string;
  nome: string;
  turma: string;
  foto?: string;
  apelido?: string;
  dataNascimento?: string;
  idadePublica?: boolean;
  esportes?: string[];
  pets?: string;
  cidadeOrigem?: string;
  relacionamentoPublico?: boolean;
  statusRelacionamento?: string;
  bio?: string;
  instagram?: string;
}

const TURMAS_DATA: Record<TurmaKey, { nome: string; logo: string; capa: string }> = {
  T1: { nome: "Turma I - Jacare", logo: "/turma1.jpeg", capa: "/capa_t1.jpg" },
  T2: { nome: "Turma II - Cavalo Marinho", logo: "/turma2.jpeg", capa: "/capa_t2.jpg" },
  T3: { nome: "Turma III - Tartaruga", logo: "/turma3.jpeg", capa: "/capa_t3.jpg" },
  T4: { nome: "Turma IV - Baleia", logo: "/turma4.jpeg", capa: "/capa_t4.jpg" },
  T5: { nome: "Turma V - Pinguim", logo: "/turma5.jpeg", capa: "/capa_t5.jpg" },
  T6: { nome: "Turma VI - Lagosta", logo: "/turma6.jpeg", capa: "/capa_t6.jpg" },
  T7: { nome: "Turma VII - Urso Polar", logo: "/turma7.jpeg", capa: "/capa_t7.jpg" },
  T8: { nome: "Turma VIII - Calouros", logo: "/turma8.jpg", capa: "/capa_t8.jpg" },
};

const parseTurmaSlug = (slug: string | undefined): TurmaKey => {
  const raw = (slug || "t8").trim().toUpperCase().replace("/", "");
  const normalized = raw.startsWith("T") ? raw : `T${raw.replace(/\D/g, "")}`;
  if (normalized in TURMAS_DATA) return normalized as TurmaKey;
  return "T8";
};

export default function AlbumTurmaPage() {
  const params = useParams<{ turmaId: string }>();
  const turma = useMemo(() => parseTurmaSlug(params?.turmaId), [params]);

  const { user } = useAuth();
  const { addToast } = useToast();

  const userUid = user?.uid;
  const [usuarios, setUsuarios] = useState<UserData[]>([]);
  const [meuAlbum, setMeuAlbum] = useState<string[]>([]);
  const [showMyQr, setShowMyQr] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [loadingAlbum, setLoadingAlbum] = useState(true);
  const [loadingTurma, setLoadingTurma] = useState(true);
  const [processingScan, setProcessingScan] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingScanRef = useRef(false);

  const calcularIdade = (dataNasc?: string) => {
    if (!dataNasc) return "??";
    const hoje = new Date();
    const nasc = new Date(dataNasc);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  };

  useEffect(() => {
    if (!userUid) {
      setMeuAlbum([]);
      setLoadingAlbum(false);
      return;
    }

    let mounted = true;
    setLoadingAlbum(true);

    const loadAlbum = async () => {
      try {
        const collectedIds = await fetchAlbumCollectedIds(userUid);
        if (!mounted) return;
        setMeuAlbum(collectedIds);
      } catch {
        if (mounted) addToast("Erro ao carregar seu album.", "error");
      } finally {
        if (mounted) setLoadingAlbum(false);
      }
    };

    void loadAlbum();
    return () => {
      mounted = false;
    };
  }, [userUid, addToast]);

  useEffect(() => {
    let mounted = true;
    setLoadingTurma(true);

    const loadTurma = async () => {
      try {
        const turmaUsers = await fetchUsersByTurma(turma);
        if (!mounted) return;
        setUsuarios(turmaUsers);
      } catch {
        if (mounted) {
          addToast("Erro ao carregar turma.", "error");
          setUsuarios([]);
        }
      } finally {
        if (mounted) setLoadingTurma(false);
      }
    };

    void loadTurma();
    return () => {
      mounted = false;
    };
  }, [turma, addToast]);

  const handleFoundUser = useCallback(
    async (rawTargetId: string) => {
      if (!user || processingScanRef.current) return;

      const targetId = rawTargetId.trim();
      if (!targetId) return;

      processingScanRef.current = true;
      setProcessingScan(true);

      try {
        if (scannerRef.current?.isScanning) {
          await scannerRef.current.stop();
          scannerRef.current.clear();
          setShowScanner(false);
        }

        if (targetId === user.uid) {
          addToast("Voce nao pode se escanear.", "info");
          return;
        }

        if (meuAlbum.includes(targetId)) {
          addToast("Figurinha repetida.", "info");
          return;
        }

        const result = await registerAlbumCapture({
          collector: {
            uid: user.uid,
            nome: user.nome || "Tubarao",
            turma: user.turma,
            foto: user.foto,
          },
          targetId,
        });

        if (result.status === "invalid-target") {
          addToast("Codigo invalido ou usuario nao encontrado.", "error");
          return;
        }

        if (result.status === "duplicate") {
          addToast("Figurinha repetida.", "info");
          return;
        }

        setMeuAlbum((prev) => (prev.includes(targetId) ? prev : [...prev, targetId]));
        addToast(`Captura confirmada: ${result.targetName || "Integrante"}.`, "success");
      } catch {
        addToast("Erro ao registrar captura.", "error");
      } finally {
        processingScanRef.current = false;
        setProcessingScan(false);
      }
    },
    [user, meuAlbum, addToast]
  );

  useEffect(() => {
    if (!showScanner || scannerRef.current) return;

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
          (decodedText) => {
            void handleFoundUser(decodedText);
          },
          () => {}
        );
      } catch {
        addToast("Erro ao abrir camera.", "error");
        setShowScanner(false);
      }
    };

    void startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        void scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
            scannerRef.current = null;
          })
          .catch(() => {});
      }
    };
  }, [showScanner, handleFoundUser, addToast]);

  const statsTurma = useMemo(() => {
    const totalCadastrados = usuarios.length;
    const totalEuPeguei = usuarios.filter((u) => meuAlbum.includes(u.id)).length;
    return { pegos: totalEuPeguei, total: totalCadastrados };
  }, [usuarios, meuAlbum]);

  if (loadingAlbum || loadingTurma) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-emerald-500 font-black animate-pulse">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      <header className="p-6 sticky top-0 z-50 bg-[#050505]/95 backdrop-blur-md border-b border-white/5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/album" className="p-2 bg-zinc-900 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-black uppercase italic">Caca aos Bixos</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMyQr(true)}
            className="bg-white text-black p-3 rounded-2xl shadow-lg active:scale-95 transition"
          >
            <QrCode size={20} />
          </button>
          <button
            disabled={processingScan}
            onClick={() => setShowScanner(true)}
            className="bg-emerald-600 text-white p-3 rounded-2xl shadow-emerald-500/20 shadow-lg active:scale-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Camera size={20} />
          </button>
        </div>
      </header>

      <div className="relative h-56 w-full mb-8 overflow-hidden group">
        <Image
          src={TURMAS_DATA[turma].capa}
          fill
          className="object-cover opacity-60"
          alt="Capa Turma"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
              {TURMAS_DATA[turma].nome}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Sparkles size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                Album Oficial
              </span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 p-[1px] rounded-2xl shadow-[0_0_20px_rgba(234,179,8,0.2)]">
            <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center">
              <span className="text-[9px] font-black text-yellow-500 uppercase tracking-tighter">Capturados</span>
              <div className="text-xl font-black text-white italic leading-none mt-1">
                {statsTurma.pegos}
                <span className="text-yellow-500/50 mx-1">/</span>
                {statsTurma.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="p-4 grid grid-cols-1 gap-6 max-w-3xl mx-auto">
        {usuarios.map((u) => {
          const isColada = meuAlbum.includes(u.id);

          return (
            <div
              key={u.id}
              className={`relative rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                isColada
                  ? "bg-zinc-900/80 border-emerald-500/40 shadow-2xl"
                  : "bg-zinc-950 border-white/5 grayscale brightness-50 opacity-40"
              }`}
            >
              <div className="p-6 flex items-center gap-6">
                <div
                  className={`relative shrink-0 w-24 h-24 rounded-full border-4 transition-all duration-700 overflow-hidden ${
                    isColada ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105" : "border-zinc-800"
                  }`}
                >
                  <Image
                    src={u.foto || "https://github.com/shadcn.png"}
                    alt={u.nome}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {isColada && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-1.5 rounded-full shadow-lg z-10">
                      <CheckCircle2 size={14} fill="white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`text-xl font-black uppercase italic leading-none truncate ${isColada ? "text-white" : "text-zinc-700"}`}>
                    {u.apelido || u.nome}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[9px] font-black bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">{u.turma}</span>

                    {isColada && (
                      <>
                        <span className="text-[9px] font-black bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500 uppercase">
                          {u.idadePublica === false ? "??" : calcularIdade(u.dataNascimento)} anos
                        </span>

                        {u.pets && u.pets !== "nenhum" && (
                          <span className="text-[9px] font-black bg-orange-500/10 px-2 py-0.5 rounded text-orange-500 uppercase flex items-center gap-1">
                            <PawPrint size={10} />
                            {u.pets === "cachorro" && "Dog"}
                            {u.pets === "gato" && "Cat"}
                            {u.pets === "ambos" && "Zoo"}
                          </span>
                        )}

                        <span className="text-[9px] font-black bg-emerald-500/10 px-2 py-0.5 rounded text-emerald-500 uppercase flex items-center gap-1">
                          <MapPin size={8} /> {u.cidadeOrigem || "?"}
                        </span>

                        {u.relacionamentoPublico && u.statusRelacionamento && (
                          <span className="text-[9px] font-black bg-pink-500/10 px-2 py-0.5 rounded text-pink-500 uppercase flex items-center gap-1">
                            <Heart size={8} fill={u.statusRelacionamento !== "Solteiro(a)" ? "currentColor" : "none"} />
                            {u.statusRelacionamento}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {isColada ? (
                    <div className="mt-3">
                      <p className="text-zinc-400 text-[11px] line-clamp-2 font-medium italic">&quot;{u.bio || "..."}&quot;</p>
                      {u.instagram && (
                        <a
                          href={`https://instagram.com/${u.instagram.replace("@", "")}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 mt-2 text-pink-500 text-[10px] font-black uppercase hover:underline"
                        >
                          <Instagram size={12} /> @{u.instagram.replace("@", "")}
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-4 text-zinc-800">
                      <Lock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Bloqueado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {usuarios.length === 0 && (
          <div className="text-center text-zinc-600 font-bold uppercase py-10">Ninguem dessa turma ainda.</div>
        )}
      </main>

      {showScanner && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-500 z-50 animate-pulse" />
          <div className="flex-1 relative flex items-center justify-center bg-black">
            <div id="reader" className="w-full h-full max-w-lg overflow-hidden" />
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-emerald-500/50 rounded-3xl relative" />
            </div>
            <button
              onClick={() => setShowScanner(false)}
              className="absolute top-6 right-6 bg-black/50 text-white p-3 rounded-full backdrop-blur-md z-50 border border-white/10"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {showMyQr && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-6"
          onClick={() => setShowMyQr(false)}
        >
          <div
            className="bg-zinc-900 w-full max-w-sm rounded-[3rem] p-8 border border-emerald-500/30 text-center relative shadow-[0_0_50px_rgba(16,185,129,0.2)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setShowMyQr(false)} className="absolute top-6 right-6 text-zinc-500">
              <X size={24} />
            </button>
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 mx-auto mb-4 overflow-hidden shadow-xl relative">
              <Image
                src={user?.foto || "https://github.com/shadcn.png"}
                fill
                className="object-cover"
                alt="Meu Avatar"
                unoptimized
              />
            </div>
            <h2 className="text-2xl font-black uppercase italic mb-1 text-white">Meu Shark Code</h2>
            <div className="bg-white p-4 rounded-[2rem] inline-block my-6 shadow-inner">
              <QRCodeSVG value={user?.uid || ""} size={220} />
            </div>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 py-2 rounded-xl border border-emerald-500/20">
              ID: {user?.uid}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
