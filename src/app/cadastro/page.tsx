// src/app/cadastro/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { 
  User, Hash, Instagram, FileText, Phone, Save, Loader2, ShieldAlert, 
  Eye, EyeOff, CheckCircle2, MapPin, Calendar, Heart, Trophy, PawPrint, 
  ArrowLeft, BadgeCheck, Lock, Camera, UploadCloud 
} from "lucide-react";
import { useAuth } from "../../context/AuthContext"; 
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db, storage } from "../../lib/firebase"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc } from "firebase/firestore"; // Importado para ID 1
import { useToast } from "../../context/ToastContext"; 

// --- DADOS ---
const TURMAS = [
  { id: "T1", nome: "Turma I - Jacaré", img: "/turma1.jpeg" },
  { id: "T2", nome: "Turma II - Cavalo Marinho", img: "/turma2.jpeg" },
  { id: "T3", nome: "Turma III - Tartaruga", img: "/turma3.jpeg" },
  { id: "T4", nome: "Turma IV - Baleia", img: "/turma4.jpeg" },
  { id: "T5", nome: "Turma V - Pinguim", img: "/turma5.jpeg" }, 
  { id: "T6", nome: "Turma VI - Lagosta", img: "/turma6.jpeg" },
  { id: "T7", nome: "Turma VII - Urso Polar", img: "/turma7.jpeg" },
  { id: "T8", nome: "Turma VIII - Calouro", img: "/turma8.jpeg" },
  { id: "T9", nome: "Turma IX", img: "/turma9.jpeg" },
];

const STATUS_RELACIONAMENTO = ["Solteiro(a)", "Namorando", "Casado(a)", "Enrolado(a)", "No QG da Atlética 🦈"];

const ESPORTES_OPTIONS = [
    { id: "futebol", label: "Futebol", icon: "⚽" },
    { id: "futsal", label: "Futsal", icon: "👟" },
    { id: "volei", label: "Vôlei", icon: "🏐" },
    { id: "basquete", label: "Basquete", icon: "🏀" },
    { id: "handball", label: "Handball", icon: "🤾" },
    { id: "rugby", label: "Rugby", icon: "🏉" },
    { id: "baseball", label: "Baseball", icon: "⚾" },
    { id: "futevolei", label: "Futevôlei", icon: "🦶" },
    { id: "beach_tennis", label: "Beach Tennis", icon: "🏖️" },
    { id: "tenis", label: "Tênis", icon: "🎾" },
    { id: "frescobol", label: "Frescobol", icon: "🏓" },
    { id: "taco", label: "Taco (Bets)", icon: "🏏" },
    { id: "peteca", label: "Peteca", icon: "🏸" },
    { id: "surf", label: "Surf", icon: "🏄" },
    { id: "natacao", label: "Natação", icon: "🏊" },
    { id: "canoagem", label: "Canoagem", icon: "🛶" },
    { id: "skate", label: "Skate", icon: "🛹" },
    { id: "dog_walking", label: "Dog Walking", icon: "🐕" },
    { id: "truco", label: "Truco", icon: "🃏" },
    { id: "sinuca", label: "Sinuca", icon: "🎱" },
];

const PETS_OPTIONS = [
    { id: "cachorro", label: "Cachorro", icon: "🐶" },
    { id: "gato", label: "Gato", icon: "🐱" },
    { id: "ambos", label: "Ambos", icon: "🐶🐱" },
    { id: "nenhum", label: "Sem Pet", icon: "🚫" },
];

// 🦈 ID 3: Interfaces para remover 'any'
interface IBGEUF {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

// 🦈 INTERFACE ESTRITA
interface UserFormData {
    nome: string;
    apelido: string;
    matricula: string;
    turma: string;
    instagram: string;
    telefone: string;
    whatsappPublico: boolean;
    bio: string;
    dataNascimento: string;
    idadePublica: boolean;
    cidadeOrigem: string;
    estadoOrigem: string;
    statusRelacionamento: string;
    relacionamentoPublico: boolean;
    esportes: string[];
    pets: string;
    foto: string;
}

export default function CadastroPage() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false); 
  const [error, setError] = useState("");
  
  // 🦈 ID 3: Tipagem correta
  const [ufs, setUfs] = useState<IBGEUF[]>([]);
  const [cidades, setCidades] = useState<IBGECity[]>([]);
  const [ufSelected, setUfSelected] = useState("");
  
  // 🦈 ID 1: Estado para travar localização se já existir
  const [locationLocked, setLocationLocked] = useState(false);

  // 🦈 ESTADO TIPADO
  const [formData, setFormData] = useState<UserFormData>({
    nome: "",
    apelido: "",
    matricula: "",
    turma: "",
    instagram: "",
    telefone: "",
    whatsappPublico: true,
    bio: "",
    dataNascimento: "",
    idadePublica: true,
    cidadeOrigem: "",
    estadoOrigem: "", 
    statusRelacionamento: "Solteiro(a)",
    relacionamentoPublico: true,
    esportes: [],
    pets: "nenhum",
    foto: "" 
  });

  // APIs IBGE
  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then(res => res.json()).then(data => setUfs(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (ufSelected) {
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSelected}/municipios?orderBy=nome`)
        .then(res => res.json()).then(data => setCidades(data)).catch(console.error);
      
      setFormData(prev => ({...prev, estadoOrigem: ufSelected}));
    }
  }, [ufSelected]);

  // 🦈 LOAD DE DADOS COM SANITIZAÇÃO
  useEffect(() => {
    if (user) {
      // 🦈 ID 1: Verifica se localização já existe para travar
      if (user.estadoOrigem && user.cidadeOrigem) {
          setLocationLocked(true);
          // Preenche os selects/inputs mesmo travados
          setUfSelected(String(user.estadoOrigem));
      } else if (user.estadoOrigem) {
          setUfSelected(String(user.estadoOrigem));
      }

      setFormData({
        nome: String(user.nome || ""),
        apelido: String(user.apelido || ""),
        matricula: String(user.matricula || ""),
        turma: String(user.turma || ""),
        instagram: String(user.instagram || "").replace("@", ""),
        telefone: String(user.telefone || ""),
        whatsappPublico: Boolean(user.whatsappPublico ?? true),
        bio: String(user.bio || ""),
        dataNascimento: String(user.dataNascimento || ""),
        idadePublica: Boolean(user.idadePublica ?? true),
        cidadeOrigem: String(user.cidadeOrigem || ""),
        estadoOrigem: String(user.estadoOrigem || ""),
        statusRelacionamento: String(user.statusRelacionamento || "Solteiro(a)"),
        relacionamentoPublico: Boolean(user.relacionamentoPublico ?? true),
        esportes: Array.isArray(user.esportes) ? user.esportes : [],
        pets: String(user.pets || "nenhum"),
        foto: String(user.foto || "")
      });
    }
  }, [user]);

  // 🦈 Lógica de Upload de Foto
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
          addToast("A imagem deve ter no máximo 5MB!", "error");
          return;
      }
      if (!file.type.startsWith("image/")) {
          addToast("Apenas arquivos de imagem são permitidos.", "error");
          return;
      }

      setImageLoading(true);
      try {
          const storageRef = ref(storage, `users/${user?.uid}/profile_${Date.now()}.jpg`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          setFormData(prev => ({ ...prev, foto: downloadURL }));
          addToast("Foto carregada com sucesso! 🦈", "success");

      } catch (error) {
          console.error("Erro upload:", error);
          addToast("Erro ao enviar foto. Tente novamente.", "error");
      } finally {
          setImageLoading(false);
      }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); 
    if (value.length > 11) value = value.slice(0, 11); 
    if (value.length > 2) value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    if (value.length > 9) value = `${value.slice(0, 9)}-${value.slice(9)}`;
    setFormData({ ...formData, telefone: value });
  };

  const toggleEsporte = (id: string) => {
      setFormData(prev => {
          const exists = prev.esportes.includes(id);
          const newEsportes = exists ? prev.esportes.filter(e => e !== id) : [...prev.esportes, id];
          return { ...prev, esportes: newEsportes };
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.apelido.trim()) { setLoading(false); return setError("O 'Apelido' é obrigatório, soldado!"); }
    if (!formData.matricula.trim()) { setLoading(false); return setError("A matrícula é obrigatória!"); }
    if (!formData.dataNascimento) { setLoading(false); return setError("Data de nascimento é necessária!"); }
    if (!formData.cidadeOrigem) { setLoading(false); return setError("Selecione sua cidade de origem!"); }
    if (!formData.telefone) { setLoading(false); return setError("Telefone é obrigatório para contato!"); }
    if (!formData.turma) { setLoading(false); return setError("Selecione sua turma!"); }
    
    if (!formData.foto) { setLoading(false); return setError("A foto de perfil é obrigatória!"); }

    try {
      // 1. Atualiza dados do usuário
      await updateUser({
        ...formData,
        instagram: formData.instagram ? `@${formData.instagram.replace("@", "")}` : "",
        role: user?.role === 'guest' ? 'user' : user?.role 
      });

      // 🦈 ID 1: Lógica de Perfil Completo para Gamificação
      // Verifica se todos os campos obrigatórios estão preenchidos
      const isProfileComplete = 
        formData.nome && 
        user?.email && // Email vem do Auth
        formData.turma && 
        formData.instagram && 
        formData.telefone &&
        formData.matricula && 
        formData.apelido && 
        formData.cidadeOrigem && 
        formData.estadoOrigem && 
        formData.foto;

      if (isProfileComplete && user?.uid) {
        // Define profileComplete = 1 no Firestore (usado para conquistas)
        await updateDoc(doc(db, "users", user.uid), {
            "stats.profileComplete": 1 
        });
        // Feedback visual extra (opcional, já que o toast de sucesso vem abaixo)
      }

      addToast("Perfil atualizado! Bem-vindo ao cardume. 🦈", "success");
      router.push("/perfil"); 
    } catch (err) {
      console.error(err);
      setError("Erro ao salvar no QG.");
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && !user) { router.push("/"); return null; }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 pb-20 flex flex-col items-center overflow-hidden">
        
        {/* LOGO FUNDO */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none opacity-5 z-0">
            <Image src="/logo.png" alt="Logo Fundo" fill className="object-contain" />
        </div>

        {/* BOTÃO DE RETORNO */}
        <div className="w-full max-w-3xl flex justify-start mb-4 relative z-20">
            <Link href="/perfil" className="bg-zinc-900 border border-zinc-800 p-3 rounded-full hover:bg-zinc-800 transition text-zinc-400 hover:text-white flex items-center gap-2 text-xs font-bold uppercase">
                <ArrowLeft size={18}/> Voltar ao Perfil
            </Link>
        </div>

        <div className="w-full max-w-3xl bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 p-6 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10">
            
            <div className="text-center mb-8">
                {/* 🦈 UPLOAD DE FOTO */}
                <div className="relative w-32 h-32 mx-auto mb-4 group">
                    <div className="relative w-full h-full rounded-full border-4 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)] overflow-hidden bg-zinc-800">
                        {imageLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-20">
                                <Loader2 className="animate-spin text-emerald-500" size={32}/>
                            </div>
                        ) : (
                            <img src={formData.foto || "https://github.com/shadcn.png"} alt="Avatar" className="w-full h-full object-cover" />
                        )}
                        
                        {/* Overlay de Edição */}
                        <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 backdrop-blur-[2px]">
                            <Camera className="text-white mb-1" size={24}/>
                            <span className="text-[10px] uppercase font-bold text-white tracking-widest">Alterar</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                    </div>
                    {/* Botão flutuante mobile */}
                    <label className="absolute bottom-0 right-0 bg-emerald-600 p-2 rounded-full border-2 border-[#050505] shadow-lg cursor-pointer md:hidden z-30">
                        <UploadCloud size={16} className="text-white"/>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                </div>

                <h1 className="text-3xl font-black uppercase italic tracking-tighter">Ficha do <span className="text-emerald-500">Tubarão</span></h1>
                
                {/* AVISO DE FOTO */}
                <div className="mt-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl max-w-sm mx-auto">
                    <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                        <ShieldAlert size={14}/> Atenção: Use sua foto real!
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-1">
                        Perfis com fotos fake, desenhos ou conteúdo impróprio serão <span className="text-red-400 font-bold underline">bloqueados</span> sem aviso.
                    </p>
                </div>
            </div>

            {error && <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-bold flex items-center gap-2 animate-pulse"><ShieldAlert size={18}/> {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* BLOCO 1: IDENTIDADE */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 block border-b border-zinc-800 pb-1">Identidade</label>
                    
                    {/* NOME COMPLETO (TRAVADO) */}
                    <div className="relative group opacity-60">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input type="text" placeholder="Nome Completo" className="input-field pl-14 cursor-not-allowed bg-zinc-950" value={formData.nome} readOnly title="Nome oficial não pode ser alterado aqui." />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                            <Lock size={14}/> 
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative group">
                            <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition" size={18} />
                            <input type="text" placeholder="Apelido (Como quer ser chamado)" className="input-field pl-14" value={formData.apelido} onChange={e => setFormData({...formData, apelido: e.target.value})} maxLength={20} required />
                        </div>

                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition" size={18} />
                            <input type="text" placeholder="Nº Matrícula" className="input-field pl-14" value={formData.matricula} onChange={e => setFormData({...formData, matricula: e.target.value.replace(/\D/g, "")})} required />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-2">
                             <div className="relative group flex-1">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input type="date" className="input-field pl-14" value={formData.dataNascimento} onChange={e => setFormData({...formData, dataNascimento: e.target.value})} required />
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, idadePublica: !formData.idadePublica})} 
                                className={`w-14 rounded-xl border flex items-center justify-center transition-all ${formData.idadePublica ? "bg-zinc-800 border-zinc-700 text-zinc-500" : "bg-zinc-800 border-red-500/50 text-red-400"}`}
                                title={formData.idadePublica ? "Idade Visível" : "Idade Oculta"}
                            >
                                {formData.idadePublica ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>

                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500" size={18} />
                                <select className="input-field pl-14 flex-1 appearance-none" value={formData.statusRelacionamento} onChange={e => setFormData({...formData, statusRelacionamento: e.target.value})}>
                                    {STATUS_RELACIONAMENTO.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <button type="button" onClick={() => setFormData({...formData, relacionamentoPublico: !formData.relacionamentoPublico})} className={`w-14 rounded-xl border flex items-center justify-center transition-all ${formData.relacionamentoPublico ? "bg-pink-500/20 border-pink-500/50 text-pink-500" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
                                {formData.relacionamentoPublico ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* 🦈 ID 1: LOCALIZAÇÃO - Travar se já existir */}
                    {locationLocked ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Estado Locked */}
                            <div className="relative group opacity-60">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input type="text" value={formData.estadoOrigem} className="input-field pl-14 cursor-not-allowed bg-zinc-950" readOnly title="Estado de origem já registrado." />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                                    <Lock size={14}/> 
                                </div>
                            </div>
                            {/* Cidade Locked */}
                            <div className="relative group opacity-60">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input type="text" value={formData.cidadeOrigem} className="input-field pl-14 cursor-not-allowed bg-zinc-950" readOnly title="Cidade de origem já registrada." />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600">
                                    <Lock size={14}/> 
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Adicionado 'px-4' pois este select não tem ícone, evitando que o texto cole na borda */}
                            <select className="input-field px-4" value={ufSelected} onChange={e => setUfSelected(e.target.value)} required>
                                <option value="">Estado de Origem</option>
                                {ufs.map(uf => <option key={uf.id} value={uf.sigla}>{uf.nome}</option>)}
                            </select>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <select className="input-field pl-14 appearance-none" value={formData.cidadeOrigem} onChange={e => setFormData({...formData, cidadeOrigem: e.target.value})} disabled={!ufSelected} required>
                                    <option value="">Cidade</option>
                                    {cidades.map(city => <option key={city.id} value={city.nome}>{city.nome}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                <input type="tel" placeholder="Telefone" className="input-field pl-14" value={formData.telefone} onChange={handlePhoneChange} required />
                            </div>
                            <button type="button" onClick={() => setFormData({...formData, whatsappPublico: !formData.whatsappPublico})} className={`w-14 rounded-xl border flex items-center justify-center transition-all ${formData.whatsappPublico ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-500"}`}>
                                {formData.whatsappPublico ? <Eye size={20} /> : <EyeOff size={20} />}
                            </button>
                        </div>
                        <div className="relative group">
                            <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-pink-500 transition" size={18} />
                            <input type="text" placeholder="Insta (sem @)" className="input-field pl-14" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                        </div>
                    </div>
                </div>

                {/* BLOCO 2: PETS */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 block border-b border-zinc-800 pb-1 flex items-center gap-2">
                        <PawPrint size={12} className="text-orange-500"/> Mascote do QG
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PETS_OPTIONS.map((pet) => (
                            <button
                                key={pet.id}
                                type="button"
                                onClick={() => setFormData({ ...formData, pets: pet.id })}
                                className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1 group ${
                                    formData.pets === pet.id
                                    ? "bg-orange-500/20 border-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.2)]" 
                                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700"
                                }`}
                            >
                                <span className="text-xl group-hover:scale-110 transition duration-300">{pet.icon}</span>
                                <span className={`text-[10px] font-bold uppercase ${formData.pets === pet.id ? "text-orange-400" : "text-zinc-500"}`}>{pet.label}</span>
                                {formData.pets === pet.id && <div className="absolute top-1 right-1"><CheckCircle2 size={12} className="text-orange-500"/></div>}
                            </button>
                        ))}
                    </div>
                </div>

                {/* BLOCO 3: ESPORTES */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 block border-b border-zinc-800 pb-1 flex items-center gap-2">
                        <Trophy size={12} className="text-emerald-500"/> Suas Modalidades
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {ESPORTES_OPTIONS.map((esp) => {
                            const isSelected = formData.esportes.includes(esp.id);
                            return (
                                <button
                                    key={esp.id}
                                    type="button"
                                    onClick={() => toggleEsporte(esp.id)}
                                    className={`relative p-3 rounded-xl border transition-all duration-200 flex flex-col items-center gap-1 group ${
                                        isSelected 
                                        ? "bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700"
                                    }`}
                                >
                                    <span className="text-xl group-hover:scale-110 transition duration-300">{esp.icon}</span>
                                    <span className={`text-[10px] font-bold uppercase ${isSelected ? "text-emerald-400" : "text-zinc-500"}`}>{esp.label}</span>
                                    {isSelected && <div className="absolute top-1 right-1"><CheckCircle2 size={12} className="text-emerald-500"/></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* BLOCO 4: TURMA */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 block border-b border-zinc-800 pb-1">Selecione seu Cardume</label>
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {TURMAS.map((t) => (
                            <div key={t.id} onClick={() => setFormData({...formData, turma: t.id})} className={`cursor-pointer rounded-2xl border p-4 flex items-center justify-between transition-all ${formData.turma === t.id ? "bg-emerald-500/10 border-emerald-500" : "bg-black/40 border-zinc-800 hover:bg-zinc-800"}`}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden relative">
                                        <Image src={t.img} alt={t.id} fill className="object-cover" unoptimized />
                                    </div>
                                    <span className={`text-sm font-bold uppercase ${formData.turma === t.id ? "text-emerald-400" : "text-zinc-400"}`}>{t.nome}</span>
                                </div>
                                {formData.turma === t.id && <CheckCircle2 className="text-emerald-500" size={20} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* BIO */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 block border-b border-zinc-800 pb-1">Grito de Guerra (Bio do Álbum)</label>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 text-zinc-500" size={18} />
                        <textarea placeholder="Conte algo sobre você..." className="input-field pl-14 h-24 py-3 resize-none" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} maxLength={100} />
                        <span className="absolute right-4 bottom-2 text-[10px] text-zinc-700 font-bold">{formData.bio.length}/100</span>
                    </div>
                </div>
                
                <button type="submit" disabled={loading || imageLoading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase py-5 rounded-[2rem] shadow-xl shadow-emerald-900/20 transition-all flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="animate-spin"/> : <Save size={20} />}
                    {loading ? "Gravando Ficha..." : "Finalizar & Ir pro Perfil"}
                </button>

            </form>
        </div>

        <style jsx>{`
            .input-field { 
                width: 100%; 
                background: #000; 
                border: 1px solid #27272a; 
                border-radius: 1.25rem; 
                color: white; 
                padding-right: 1rem; /* Apenas direita */
                outline: none; 
                transition: 0.3s; 
                height: 3.5rem; 
                font-size: 0.875rem; 
                font-weight: 600; 
            }
            .input-field:focus { border-color: #10b981; box-shadow: 0 0 15px rgba(16, 185, 129, 0.1); }
            textarea.input-field { height: auto; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #10b981; border-radius: 10px; }
        `}</style>
    </div>
  );
}