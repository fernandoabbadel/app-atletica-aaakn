"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Lista de Poses (Estática é ok, pois é configuração visual)
const DAILY_POSES = [
  { emoji: "💪", title: "Flexão de Bíceps", desc: "Mostre a força do braço!" },
  { emoji: "👊", title: "Toca Aqui", desc: "Batida de mão clássica." },
  { emoji: "🤳", title: "Selfie Monstra", desc: "A clássica no espelho." },
];

export default function CheckinPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  
  // Pose do Dia
  const today = new Date().getDate();
  const poseOfTheDay = DAILY_POSES[today % DAILY_POSES.length] || DAILY_POSES[0];

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
      // Fallback silencioso ou alerta
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
        const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.8); // Compressão leve (0.8)
        processPhoto(dataUrl);
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if(typeof reader.result === 'string') processPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative overflow-hidden">
      {/* HEADER */}
      <header className="absolute top-0 w-full p-4 flex items-center justify-between z-20 bg-gradient-to-b from-black/80 to-transparent">
        <Link href="/gym" className="p-3 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 active:scale-95 transition">
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
        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        
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

      {/* CONTROLES */}
      <div className="bg-black p-8 pb-12 flex items-center justify-between relative z-20 px-10">
        <div className="w-12"></div>
        <button onClick={takePhoto} className="w-20 h-20 rounded-full border-[6px] border-white/30 flex items-center justify-center relative group transition-all active:scale-95">
          <div className="w-16 h-16 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.5)] group-hover:scale-90 transition-all duration-300"></div>
        </button>
        <div className="relative">
          <button onClick={() => fileInputRef.current?.click()} className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition active:scale-95">
            <ImageIcon size={20} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />
        </div>
      </div>
    </div>
  );
}