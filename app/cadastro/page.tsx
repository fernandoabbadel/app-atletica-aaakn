"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  Sparkles,
  Save,
  Instagram,
  ArrowLeft,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function UnifiedRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulação: Se houver dados prévios, tratamos como edição
  const isEditing = false;

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    nomeUsuario: "",
    curso: "Medicina",
    turma: "T5",
    matricula: "",
    biografia: "",
    instagram: "",
    strava: "",
    foto: null as string | null, // Começa nulo para validação
    senha: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação de campos obrigatórios
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.foto) newErrors.foto = "A foto de perfil é obrigatória";
      if (!formData.nomeCompleto.trim())
        newErrors.nomeCompleto = "Nome é obrigatório";
      if (!formData.matricula.trim())
        newErrors.matricula = "Matrícula é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      router.push("/login"); // No Step 1, volta para o login
    }
  };

  const handleFinish = () => {
    if (!formData.nomeUsuario.trim()) {
      setErrors({ nomeUsuario: "Username é obrigatório" });
      return;
    }
    router.push("/perfil");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, foto: reader.result as string });
        setErrors({ ...errors, foto: "" });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ededed] font-sans pb-10 selection:bg-[#4ade80]/30">
      {/* HEADER DINÂMICO */}
      <header className="p-6 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-[#4ade80] hover:opacity-80 transition font-medium"
        >
          <ArrowLeft size={18} />
          <span>{step === 2 ? "Voltar ao passo 1" : "Voltar ao login"}</span>
        </button>
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          Passo {step} de 2
        </span>
      </header>

      <main className="max-w-md mx-auto px-6">
        {/* SEÇÃO: FOTO OBRIGATÓRIA */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in duration-500">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative w-28 h-28 cursor-pointer group rounded-full border-2 transition-all ${
              errors.foto ? "border-red-500 animate-shake" : "border-[#4ade80]"
            }`}
          >
            <div className="w-full h-full rounded-full overflow-hidden p-1 bg-[#1a1a1a]">
              {formData.foto ? (
                <img
                  src={formData.foto}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-700">
                  <Camera size={32} />
                </div>
              )}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-full">
              <Camera className="text-white" size={24} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          <p
            className={`text-[10px] mt-2 font-bold uppercase tracking-widest ${
              errors.foto ? "text-red-500" : "text-zinc-500"
            }`}
          >
            {errors.foto || "Toque para alterar foto *"}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl">
              {/* NOME */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formData.nomeCompleto}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeCompleto: e.target.value })
                  }
                  className={`w-full bg-[#1a1a1a] border p-3 rounded-xl focus:outline-none transition ${
                    errors.nomeCompleto
                      ? "border-red-500"
                      : "border-zinc-800 focus:border-[#4ade80]"
                  }`}
                  placeholder="Nome como na matrícula"
                />
              </div>

              {/* MATRÍCULA E CURSO */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    Matrícula *
                  </label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) =>
                      setFormData({ ...formData, matricula: e.target.value })
                    }
                    className={`w-full bg-[#1a1a1a] border p-3 rounded-xl font-mono transition ${
                      errors.matricula
                        ? "border-red-500"
                        : "border-zinc-800 focus:border-[#4ade80]"
                    }`}
                    placeholder="000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    Curso
                  </label>
                  <input
                    type="text"
                    value={formData.curso}
                    className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl outline-none"
                    readOnly
                  />
                </div>
              </div>

              {/* TURMA */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Turma
                </label>
                <div className="relative">
                  <select
                    value={formData.turma}
                    onChange={(e) =>
                      setFormData({ ...formData, turma: e.target.value })
                    }
                    className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl appearance-none focus:border-[#4ade80] outline-none"
                  >
                    <option value="T1">Turma I</option>
                    <option value="T5">Turma V</option>
                    <option value="T7">Turma VII</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>

              {/* BIO */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                    Biografia
                  </label>
                  <span className="text-[10px] text-zinc-600 font-bold">
                    {formData.biografia.length}/150
                  </span>
                </div>
                <textarea
                  maxLength={150}
                  rows={2}
                  value={formData.biografia}
                  onChange={(e) =>
                    setFormData({ ...formData, biografia: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none transition resize-none text-sm"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-zinc-800 py-4 rounded-2xl font-black uppercase italic tracking-widest flex justify-center items-center gap-2 hover:bg-zinc-700 transition"
            >
              Próximo Passo <ChevronRight size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl">
              <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">
                Social & Login
              </h4>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[#4ade80] mb-1">
                  <Instagram size={14} />
                  <span className="text-[10px] font-black uppercase">
                    Instagram
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) =>
                    setFormData({ ...formData, instagram: e.target.value })
                  }
                  className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none"
                  placeholder="@handle"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Username (@ no app) *
                </label>
                <input
                  type="text"
                  value={formData.nomeUsuario}
                  onChange={(e) =>
                    setFormData({ ...formData, nomeUsuario: e.target.value })
                  }
                  className={`w-full bg-[#1a1a1a] border p-3 rounded-xl focus:outline-none ${
                    errors.nomeUsuario
                      ? "border-red-500"
                      : "border-zinc-700 focus:border-[#4ade80]"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Senha
                </label>
                <input
                  type="password"
                  placeholder="Sua senha secreta"
                  className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-[#2d5a42] to-[#4ade80] text-black font-black py-5 rounded-2xl flex items-center justify-center gap-3 uppercase italic tracking-tighter shadow-[0_0_25px_rgba(74,222,128,0.2)] active:scale-[0.98] transition-all"
            >
              <Sparkles size={20} />
              Finalizar Cadastro
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
