"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertTriangle, Info, Syringe, Stethoscope, Trophy } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

// --- FRASES DO TUBARÃO 🦈 ---
const TITLES = {
  success: [
    "Aí sim, Doutor! 🩺",
    "Receba! 🦈",
    "O Tubarão te ama! 💙",
    "Golaço do Bixo! ⚽",
    "Aprovado pelo CRM! ✅",
    "Deu Green! 🤑",
  ],
  error: [
    "Deu B.O. no plantão! 🚨",
    "Errou a dosagem? 💊",
    "Queixou, hein? 🤕",
    "Deu ruim, pô! 💀",
    "Paciente em parada! 💔",
    "Zicou o rolê... 🫠",
  ],
  info: [
    "Se liga na visão! 👀",
    "Plantão informa: 📢",
    "Bizu de prova! 📝",
    "Atenção, calouro! 👶",
    "Notícias do Mar! 🌊",
  ],
};

function getRandomTitle(type: ToastType) {
  const options = TITLES[type];
  return options[Math.floor(Math.random() * options.length)];
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    const title = getRandomTitle(type);
    
    const newToast = { id, title, message, type };
    
    setToasts((state) => [...state, newToast]);
    
    // Auto-remove mais rápido para leitura dinâmica (4s)
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* CONTAINER FLUTUANTE (Z-INDEX ALTO) */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-3 w-full max-w-md px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden flex items-start gap-4 p-5 rounded-3xl border-2 backdrop-blur-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] transition-all animate-in slide-in-from-top-full zoom-in-95 duration-300 ${
              toast.type === "success"
                ? "bg-[#050505]/95 border-emerald-500/50 shadow-emerald-900/40"
                : toast.type === "error"
                ? "bg-[#050505]/95 border-red-500/50 shadow-red-900/40"
                : "bg-[#050505]/95 border-blue-500/50 shadow-blue-900/40"
            }`}
          >
            {/* Ícone Grande */}
            <div
              className={`p-3 rounded-2xl shrink-0 ${
                toast.type === "success"
                  ? "bg-emerald-500 text-black"
                  : toast.type === "error"
                  ? "bg-red-500 text-white"
                  : "bg-blue-500 text-white"
              }`}
            >
              {toast.type === "success" && <Trophy size={24} strokeWidth={2.5} />}
              {toast.type === "error" && <Syringe size={24} strokeWidth={2.5} />}
              {toast.type === "info" && <Stethoscope size={24} strokeWidth={2.5} />}
            </div>

            {/* Texto */}
            <div className="flex-1 pt-0.5">
              <h4 className={`text-sm font-black uppercase tracking-wider mb-1 ${
                 toast.type === "success" ? "text-emerald-500" : 
                 toast.type === "error" ? "text-red-500" : "text-blue-500"
              }`}>
                {toast.title}
              </h4>
              <p className="text-zinc-300 text-sm font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>

            {/* Botão Fechar */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-white transition p-1 bg-white/5 rounded-full hover:bg-white/20"
            >
              <X size={16} />
            </button>

            {/* Barra de Progresso Visual (Opcional - Efeito estético) */}
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-30 ${
                 toast.type === "success" ? "bg-emerald-500" : 
                 toast.type === "error" ? "bg-red-500" : "bg-blue-500"
            }`}></div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context || Object.keys(context).length === 0) {
    console.warn("ToastContext não encontrado ou vazio");
    return { addToast: () => {}, removeToast: () => {} };
  }
  return context;
}