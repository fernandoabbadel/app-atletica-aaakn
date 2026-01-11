"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  CalendarDays,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Lista Atualizada de Poses (Emojis da Emojipedia)
const DAILY_POSES = [
  { emoji: "💪", title: "Flexão de Bíceps", desc: "Mostre a força do braço!" },
  { emoji: "🦾", title: "Braço Biônico", desc: "Modo máquina ativado." },
  {
    emoji: "🙌",
    title: "Mãos ao Alto",
    desc: "Celebrando a vitória do treino.",
  },
  { emoji: "👏", title: "Aplausos", desc: "Parabéns pelo esforço de hoje!" },
  {
    emoji: "🫶",
    title: "Coração de Mão",
    desc: "Amor pelo esporte (ou pela dor).",
  },
  {
    emoji: "🤝",
    title: "Parceria",
    desc: "Cumprimento de quem treinou junto.",
  },
  { emoji: "👍", title: "Joinha", desc: "Tudo certo, treino pago." },
  {
    emoji: "👎",
    title: "Dislike no Sedentarismo",
    desc: "Diga não à preguiça.",
  },
  { emoji: "👌", title: "Perfeito", desc: "Execução técnica impecável." },
  { emoji: "✌️", title: "Paz e Amor", desc: "Vibe boa pós-treino." },
  {
    emoji: "🤞",
    title: "Dedos Cruzados",
    desc: "Sorte para não estar dolorido amanhã.",
  },
  { emoji: "🤟", title: "Love You", desc: "Estilo rockstar na academia." },
  { emoji: "🤘", title: "Rock On", desc: "Treino pesado pede heavy metal." },
  {
    emoji: "🤙",
    title: "Hang Loose",
    desc: "Tranquilidade de quem já treinou.",
  },
  { emoji: "👊", title: "Toca Aqui", desc: "Batida de mão clássica." },
  { emoji: "✊", title: "Resistência", desc: "Foco, força e fé." },
  { emoji: "🤜", title: "Punho Direito", desc: "Preparado para o combate." },
  { emoji: "🤛", title: "Punho Esquerdo", desc: "Cumprimento dos brothers." },
  {
    emoji: "👐",
    title: "Mãos Abertas",
    desc: "Recebendo a energia do treino.",
  },
  { emoji: "🤲", title: "Oferenda", desc: "Agradecendo pelo pump de hoje." },
  {
    emoji: "🙏",
    title: "Gratidão",
    desc: "Namastê ou apenas recuperando o fôlego.",
  },
  { emoji: "☝️", title: "Número Um", desc: "Foco no topo do ranking." },
  { emoji: "👇", title: "Aqui e Agora", desc: "O foco é no momento presente." },
  {
    emoji: "👉",
    title: "Aquele Ali",
    desc: "Apontando para o próximo exercício.",
  },
  { emoji: "👈", title: "Eu Mesmo", desc: "Quem treinou? Eu!" },
];

// Gera histórico fictício dos últimos 20 dias
const PAST_EMOJIS = Array.from({ length: 20 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (i + 1));
  return {
    date: date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    emoji: DAILY_POSES[date.getDate() % DAILY_POSES.length].emoji,
  };
});

export default function CheckinPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Pose do Dia Atual
  const today = new Date().getDate();
  const poseOfTheDay = DAILY_POSES[today % DAILY_POSES.length];

  // Iniciar Câmera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error("Erro câmera:", err);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Processar e Salvar Foto
  const processPhoto = (dataUrl: string) => {
    localStorage.setItem("tempCheckinPhoto", dataUrl);
    router.push("/gym/checkin/details");
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        processPhoto(dataUrl);
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        processPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden">
      {/* HEADER */}
      <header className="absolute top-0 w-full p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link
          href="/gym"
          className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <span className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
            <span className="text-xl">{poseOfTheDay.emoji}</span> Pose do Dia
          </span>
        </div>
        <div className="w-12"></div>
      </header>

      {/* VIEWFINDER */}
      <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        {!isStreaming && (
          <p className="text-zinc-500 animate-pulse text-xs font-bold uppercase tracking-widest z-10">
            Carregando câmera...
          </p>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* OVERLAY DA POSE */}
        {isStreaming && (
          <div className="absolute bottom-32 left-0 w-full text-center p-6 pointer-events-none z-10">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter drop-shadow-2xl text-white mb-2 leading-none">
              {poseOfTheDay.title}
            </h2>
            <div className="inline-block bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl">
              <p className="text-xs font-bold text-white/90 uppercase tracking-wide">
                {poseOfTheDay.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* CONTROLES INFERIORES */}
      <div className="bg-black p-8 pb-12 flex items-center justify-between relative z-20 px-10">
        {/* BOTÃO HISTÓRICO (ESQUERDA) */}
        <button
          onClick={() => setShowHistory(true)}
          className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95"
        >
          <CalendarDays size={20} />
        </button>

        {/* BOTÃO DISPARO (CENTRO) */}
        <button
          onClick={takePhoto}
          className="w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center relative group transition-all active:scale-95"
        >
          <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-90 transition-all duration-300"></div>
        </button>

        {/* BOTÃO GALERIA (DIREITA) */}
        <div className="relative">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95"
          >
            <ImageIcon size={20} />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleGalleryUpload}
          />
        </div>
      </div>

      {/* MODAL HISTÓRICO DE EMOJIS */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#111] w-full max-w-sm h-[80vh] sm:h-auto sm:rounded-3xl rounded-t-3xl border-t sm:border border-zinc-800 p-6 relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-white text-lg uppercase italic tracking-tighter">
                Histórico de Poses
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 bg-zinc-900 rounded-full text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 overflow-y-auto pb-4">
              {PAST_EMOJIS.map((item, i) => (
                <div
                  key={i}
                  className="aspect-square bg-zinc-900 rounded-2xl flex flex-col items-center justify-center border border-zinc-800"
                >
                  <span className="text-2xl mb-1">{item.emoji}</span>
                  <span className="text-[9px] font-bold text-zinc-500">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
