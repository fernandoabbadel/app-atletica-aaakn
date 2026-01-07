"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft,
  Instagram,
  Link as LinkIcon,
  Save,
  Camera,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditarPerfilPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estado do Formulário atualizado com o campo matricula
  const [formData, setFormData] = useState({
    nomeCompleto: "Fernando Silva", // Bloqueado por padrão
    matricula: "202301045", // Novo campo adicionado
    curso: "Medicina",
    turma: "T5",
    biografia: "Apaixonado por esportes e vida universitária!",
    instagram: "@seuusuario",
    strava: "https://strava.com/athletes/...",
    foto: "https://i.pravatar.cc/300?u=fernando",
  });

  const handleSave = () => {
    // Lógica para salvar os dados
    alert("Alterações salvas com sucesso!");
    router.push("/perfil");
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#ededed] font-sans pb-10">
      {/* HEADER: Voltar ao Perfil */}
      <header className="p-6">
        <Link
          href="/perfil"
          className="flex items-center gap-2 text-[#4ade80] hover:opacity-80 transition font-medium"
        >
          <ArrowLeft size={18} />
          <span>Voltar ao perfil</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6">
        {/* SEÇÃO: ALTERAR FOTO */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={handlePhotoClick}
            className="relative w-28 h-28 cursor-pointer group"
          >
            <div className="w-full h-full rounded-full border-2 border-[#4ade80] overflow-hidden p-1 bg-[#1a1a1a]">
              <img
                src={formData.foto}
                alt="Profile"
                className="w-full h-full rounded-full object-cover group-hover:brightness-50 transition"
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <Camera className="text-white" size={24} />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
            />
          </div>
          <p className="text-[10px] text-zinc-500 mt-2 font-bold uppercase tracking-widest">
            Toque para alterar foto
          </p>
        </div>

        {/* GRUPO 1: INFORMAÇÕES ACADÊMICAS */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-5 mb-5 shadow-xl">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Nome completo *
            </label>
            <input
              type="text"
              value={formData.nomeCompleto}
              disabled
              className="w-full bg-[#1a1a1a] border border-zinc-800 p-3 rounded-xl text-zinc-500 cursor-not-allowed italic"
            />
          </div>

          {/* NOVO CAMPO: MATRÍCULA */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Matrícula / RA *
            </label>
            <input
              type="text"
              value={formData.matricula}
              onChange={(e) =>
                setFormData({ ...formData, matricula: e.target.value })
              }
              className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none transition font-mono"
              placeholder="Digite sua matrícula"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              Curso
            </label>
            <input
              type="text"
              value={formData.curso}
              onChange={(e) =>
                setFormData({ ...formData, curso: e.target.value })
              }
              className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none transition"
            />
          </div>

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
                className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl appearance-none focus:border-[#4ade80] outline-none transition pr-10"
              >
                <option value="T1">Turma I - Pioneiros</option>
                <option value="T2">Turma II - Resilientes</option>
                <option value="T3">Turma III - Tartaruga</option>
                <option value="T5">Turma V - Fenomenais</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
                size={18}
              />
            </div>
          </div>

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
              rows={3}
              value={formData.biografia}
              onChange={(e) =>
                setFormData({ ...formData, biografia: e.target.value })
              }
              className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none transition resize-none text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* GRUPO 2: REDES SOCIAIS (Opcional) */}
        <div className="bg-[#161616] border border-zinc-800 rounded-2xl p-5 space-y-5 shadow-xl">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-2">
            Redes Sociais (opcional)
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
              placeholder="@seuusuario"
              value={formData.instagram}
              onChange={(e) =>
                setFormData({ ...formData, instagram: e.target.value })
              }
              className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none transition"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[#4ade80] mb-1">
              <LinkIcon size={14} />
              <span className="text-[10px] font-black uppercase">
                Strava (URL)
              </span>
            </div>
            <input
              type="text"
              placeholder="https://strava.com/..."
              value={formData.strava}
              onChange={(e) =>
                setFormData({ ...formData, strava: e.target.value })
              }
              className="w-full bg-[#1a1a1a] border border-zinc-700 p-3 rounded-xl focus:border-[#4ade80] outline-none transition text-xs"
            />
          </div>
        </div>

        {/* BOTÃO SALVAR */}
        <button
          onClick={handleSave}
          className="w-full mt-8 bg-gradient-to-r from-[#2d5a42] to-[#4ade80] text-black font-black py-4 rounded-2xl flex items-center justify-center gap-3 uppercase italic tracking-tighter shadow-[0_0_25px_rgba(74,222,128,0.2)] active:scale-[0.98] transition-all"
        >
          <Save size={20} />
          Salvar Alterações
        </button>

        <p className="text-center text-[9px] text-zinc-600 mt-4 font-bold uppercase">
          * Campo obrigatório
        </p>
      </main>
    </div>
  );
}
