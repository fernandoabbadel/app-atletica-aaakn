"use client";

import React, { useState, useRef } from "react";
import {
  ArrowLeft, Trophy, AlertTriangle, UserCheck, Search, Download, Plus, Edit, 
  Trash2, Calendar, MapPin, X, UploadCloud, Users, CheckCircle, XCircle, Clock, 
  CalendarRange, RefreshCw, MoreHorizontal, ExternalLink, Filter, Medal
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../../context/ToastContext";

// --- TIPOS ---
interface Aluno {
    id: number;
    nome: string;
    turma: string;
    status: "presente" | "falta" | "justificado" | "pendente";
    handle: string;
    foto?: string;
}

interface TurmaDestaque {
    turma: string;
    count: number;
    logo: string;
    color: string;
}

interface Treino {
    id: number;
    esporte: string;
    categoria: string;
    dia: string;
    horario: string;
    local: string;
    img: string;
    chamada: Aluno[];
    turmas_destaque: TurmaDestaque[];
}

// --- DADOS INICIAIS (MOCK) ---
const MODALIDADES_INICIAIS = ["Futsal", "Vôlei", "Basquete", "Handebol"];

const TREINOS_MOCK: Treino[] = [
    {
        id: 1,
        esporte: "Futsal",
        categoria: "Masculino",
        dia: "2026-10-12",
        horario: "22:00",
        local: "Ginásio Municipal",
        img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80",
        turmas_destaque: [
            { turma: "T5", count: 12, logo: "/turma5.jpeg", color: "border-emerald-500" },
            { turma: "T1", count: 8, logo: "/turma1.jpeg", color: "border-yellow-500" }
        ],
        chamada: [
            { id: 101, nome: "João Silva", turma: "T5", status: "presente", handle: "joaosilva", foto: "https://i.pravatar.cc/150?u=joao" },
            { id: 102, nome: "Pedro Santos", turma: "T1", status: "falta", handle: "pedros", foto: "https://i.pravatar.cc/150?u=pedro" },
        ]
    },
    {
        id: 2,
        esporte: "Vôlei",
        categoria: "Misto",
        dia: "2026-10-13",
        horario: "19:00",
        local: "Quadra da Orla",
        img: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&q=80",
        turmas_destaque: [
            { turma: "T3", count: 15, logo: "/turma3.jpeg", color: "border-purple-500" },
        ],
        chamada: []
    }
];

// Dados para as Tabelas de Histórico
const HISTORICO_DATA: Record<string, { dates: string[], alunos: any[] }> = {
    "Futsal": {
        dates: ["05/OUT", "12/OUT", "19/OUT", "26/OUT"],
        alunos: [
            { nome: "João Silva", turma: "T5", handle: "joaosilva", presencas: [true, true, true, false] },
            { nome: "Pedro Santos", turma: "T1", handle: "pedros", presencas: [false, true, false, true] },
        ]
    },
    "Vôlei": {
        dates: ["06/OUT", "13/OUT", "20/OUT", "27/OUT"],
        alunos: [
            { nome: "Ana Costa", turma: "T3", handle: "anacosta", presencas: [true, true, true, true] },
            { nome: "Bia Souza", turma: "T2", handle: "biasouza", presencas: [true, false, true, true] },
        ]
    },
    "Basquete": { dates: [], alunos: [] },
    "Handebol": { dates: [], alunos: [] }
};

export default function AdminTreinosPage() {
  const { addToast } = useToast();
  
  // Estados Principais
  const [treinos, setTreinos] = useState<Treino[]>(TREINOS_MOCK);
  const [modalidades, setModalidades] = useState(MODALIDADES_INICIAIS);
  const [abaAtiva, setAbaAtiva] = useState("Futsal");

  // Modais de Controle
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showChamadaModal, setShowChamadaModal] = useState<Treino | null>(null);
  const [showNovaModalidade, setShowNovaModalidade] = useState(false);

  // Inputs Temporários
  const [novaModalidadeNome, setNovaModalidadeNome] = useState("");
  const [novoTreino, setNovoTreino] = useState<Partial<Treino>>({ esporte: "Futsal", categoria: "Masculino", dia: "", horario: "", local: "", img: "" });
  const [buscaAluno, setBuscaAluno] = useState(""); 
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AÇÕES DO TUBARÃO ---

  const handleCriarModalidade = () => {
      if(!novaModalidadeNome.trim()) return;
      if(modalidades.includes(novaModalidadeNome)) {
        addToast("Essa modalidade já existe!", "error");
        return;
      }
      setModalidades([...modalidades, novaModalidadeNome]);
      HISTORICO_DATA[novaModalidadeNome] = { dates: [], alunos: [] };
      setNovaModalidadeNome("");
      setShowNovaModalidade(false);
      addToast(`Modalidade ${novaModalidadeNome} criada! Os tubarões vão dominar.`, "success");
  }

  // Renovar Agenda
  const handleRenovarAgenda = () => {
      if(!novoTreino.dia) {
          addToast("Selecione um dia de início primeiro!", "error");
          return;
      }
      if(confirm(`Criar treinos recorrentes de ${novoTreino.esporte} por 3 meses a partir de ${novoTreino.dia}?`)) {
          setShowCreateModal(false);
          addToast("Agenda renovada até Janeiro de 2027! 📅", "success");
      }
  };

  const handleSaveTreino = () => {
      if(!novoTreino.esporte || !novoTreino.dia) { 
          addToast("Ops — Faltou preencher os dados!", "error"); 
          return; 
      }
      
      const novoId = Date.now();
      
      // Criando objeto explicitamente para evitar spread de props indesejadas
      const treinoCriado: Treino = {
          id: novoId,
          esporte: novoTreino.esporte || "Futsal",
          categoria: novoTreino.categoria || "Masculino",
          dia: novoTreino.dia || "",
          horario: novoTreino.horario || "",
          local: novoTreino.local || "",
          img: novoTreino.img || "",
          chamada: [],
          turmas_destaque: []
      };

      setTreinos([...treinos, treinoCriado]);
      
      if(HISTORICO_DATA[treinoCriado.esporte]) {
          HISTORICO_DATA[treinoCriado.esporte].dates.push(treinoCriado.dia.split("-").slice(1).reverse().join("/") || "DATA");
      }

      setShowCreateModal(false);
      setNovoTreino({ esporte: "Futsal", categoria: "Masculino", dia: "", horario: "", local: "", img: "" });
      addToast("Treino agendado! Bora suar a camisa.", "success");
  };

  const handleAddAlunoChamada = () => {
      if(!showChamadaModal || !buscaAluno.trim()) return;
      
      const novoAluno: Aluno = {
          id: Date.now(),
          nome: buscaAluno,
          turma: "Avulso", 
          status: "presente", 
          handle: "user_not_found", 
          foto: "https://github.com/shadcn.png"
      };

      const treinoAtualizado = { 
          ...showChamadaModal, 
          chamada: [novoAluno, ...showChamadaModal.chamada]
      };
      
      setTreinos(prev => prev.map(t => t.id === showChamadaModal.id ? treinoAtualizado : t));
      setShowChamadaModal(treinoAtualizado);
      setBuscaAluno("");
      addToast("Atleta adicionado na lista!", "success");
  };

  const handleTogglePresenca = (alunoId: number) => {
      if(!showChamadaModal) return;
      const novaLista = showChamadaModal.chamada.map(a => 
          a.id === alunoId ? { ...a, status: a.status === 'presente' ? 'falta' : 'presente' as any } : a
      );
      const treinoAtualizado = { ...showChamadaModal, chamada: novaLista };
      setTreinos(prev => prev.map(t => t.id === showChamadaModal.id ? treinoAtualizado : t));
      setShowChamadaModal(treinoAtualizado);
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if(file.size > 2 * 1024 * 1024) { addToast("Imagem muito pesada (Max 2MB)", "error"); return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (ev) => {
            if (ev.target?.result) {
                setNovoTreino(prev => ({ ...prev, img: ev.target!.result as string }));
                addToast("Foto carregada com sucesso!", "success");
            }
        };
    }
  };

  const handleDeleteTreino = (id: number) => {
      if(confirm("Cancelar este treino?")) {
          setTreinos(prev => prev.filter(t => t.id !== id));
          addToast("Treino cancelado.", "info");
      }
  }

  const formatData = (isoDate: string) => {
      if(!isoDate) return "";
      const [ano, mes, dia] = isoDate.split("-");
      return `${dia}/${mes}`;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
      
      {/* --- HEADER --- */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">Gestão de Treinos</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowNovaModalidade(true)} className="bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition flex items-center gap-2 text-xs font-bold uppercase">
                <Trophy size={14} className="text-yellow-500" /> Nova Modalidade
            </button>
            <button onClick={() => setShowCreateModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20">
                <Plus size={16} /> Novo Treino
            </button>
        </div>
      </header>

      <main className="p-6 space-y-10">
        
        {/* 1. DASHBOARD DE KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Presença Média" value="85%" icon={<CheckCircle size={14} className="text-emerald-500"/>} color="text-white" barColor="bg-emerald-500" percent={85} />
            <KpiCard title="Modalidade Top" value="Futsal" icon={<Trophy size={14} className="text-yellow-500"/>} color="text-yellow-400" />
            <KpiCard title="Turma + Ativa" value="T5" icon={<Users size={14} className="text-blue-500"/>} color="text-white" subInfo="45 presenças" />
            <KpiCard title="Total Treinos" value="12" icon={<Calendar size={14} className="text-purple-500"/>} color="text-purple-400" subInfo="Neste mês" />
        </section>

        {/* 2. PRÓXIMOS TREINOS */}
        <section>
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calendar size={16} /> Agenda de Treinos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {treinos.map(treino => (
                    <div key={treino.id} className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden group hover:border-emerald-500/30 transition shadow-lg">
                        <div className="relative h-24 bg-black/50">
                            <img src={treino.img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                <span className="text-[10px] font-black uppercase text-white tracking-wider">{treino.esporte}</span>
                            </div>
                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                <div className="text-white">
                                    <p className="text-xs font-medium flex items-center gap-1"><Calendar size={10} className="text-emerald-500"/> {formatData(treino.dia)}</p>
                                    <p className="text-xs font-medium flex items-center gap-1"><Clock size={10} className="text-emerald-500"/> {treino.horario}</p>
                                </div>
                                <span className="text-[9px] font-bold uppercase bg-white/10 px-2 py-1 rounded text-zinc-300">{treino.categoria}</span>
                            </div>
                        </div>

                        <div className="p-4">
                            <div className="mb-4">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase mb-2">Presença por Turma</p>
                                <div className="flex items-center gap-2">
                                    {treino.turmas_destaque.length > 0 ? treino.turmas_destaque.map((td, i) => (
                                        <div key={i} className={`flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-zinc-950 border ${td.color} border-opacity-30`}>
                                            <div className="w-5 h-5 rounded-full overflow-hidden border border-zinc-700">
                                                <img src={td.logo} className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                                            </div>
                                            <span className="text-[10px] font-bold text-white">+{td.count}</span>
                                        </div>
                                    )) : (
                                        <span className="text-[10px] text-zinc-600 italic">Sem confirmações ainda</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 border-t border-zinc-800 pt-3">
                                <button onClick={() => setShowChamadaModal(treino)} className="flex-1 bg-emerald-600 text-white rounded-xl py-2 text-[10px] font-bold uppercase hover:bg-emerald-500 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                                    <UserCheck size={14}/> Chamada ({treino.chamada.length})
                                </button>
                                <button onClick={() => handleDeleteTreino(treino.id)} className="px-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition"><Trash2 size={14}/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        {/* 3. TABELA DE HISTÓRICO */}
        <section>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
                <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <CalendarRange size={16} /> Painel de Frequência
                </h2>
                
                <div className="flex flex-wrap gap-1 bg-black p-1 rounded-2xl border border-zinc-800">
                    {modalidades.map(esporte => (
                        <button 
                            key={esporte}
                            onClick={() => setAbaAtiva(esporte)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${abaAtiva === esporte ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            {esporte}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-black/40 text-zinc-500 font-bold uppercase">
                            <tr>
                                <th className="p-4 sticky left-0 bg-zinc-900 z-10 border-r border-zinc-800 min-w-[180px]">Atleta / Turma</th>
                                {HISTORICO_DATA[abaAtiva]?.dates.map((date, i) => (
                                    <th key={i} className="p-4 text-center min-w-[80px] border-r border-zinc-800/50">{date}</th>
                                ))}
                                {(!HISTORICO_DATA[abaAtiva]?.dates || HISTORICO_DATA[abaAtiva]?.dates.length === 0) && <th className="p-4 text-center text-zinc-600 font-normal normal-case italic">Nenhum treino realizado ainda.</th>}
                                <th className="p-4 text-center text-emerald-500 min-w-[80px]">% Freq.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 text-zinc-300">
                            {HISTORICO_DATA[abaAtiva]?.alunos.map((aluno, idx) => {
                                const totalPresencas = aluno.presencas.filter(Boolean).length;
                                const percent = Math.round((totalPresencas / Math.max(HISTORICO_DATA[abaAtiva].dates.length, 1)) * 100);
                                
                                return (
                                    <tr key={idx} className="hover:bg-zinc-800/40 group transition">
                                        <td className="p-4 font-bold text-white sticky left-0 bg-zinc-900 group-hover:bg-zinc-900 border-r border-zinc-800">
                                            <Link href={`/perfil/${aluno.handle}`} className="flex items-center gap-2 hover:text-emerald-400 transition">
                                                <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] border border-zinc-700">{aluno.nome.charAt(0)}</div>
                                                <div className="flex flex-col">
                                                    <span>{aluno.nome}</span>
                                                    <span className="text-[9px] text-zinc-500 font-normal uppercase">{aluno.turma}</span>
                                                </div>
                                            </Link>
                                        </td>
                                        {aluno.presencas.map((presente: boolean, i: number) => (
                                            <td key={i} className="p-4 text-center border-r border-zinc-800/30">
                                                {presente ? 
                                                    <div className="w-6 h-6 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500"><CheckCircle size={12}/></div> : 
                                                    <div className="w-6 h-6 bg-red-500/5 rounded-full flex items-center justify-center mx-auto text-red-500/50"><XCircle size={12}/></div>
                                                }
                                            </td>
                                        ))}
                                        <td className="p-4 text-center font-black text-white">{percent}%</td>
                                    </tr>
                                )
                            })}
                            {(!HISTORICO_DATA[abaAtiva]?.alunos || HISTORICO_DATA[abaAtiva]?.alunos.length === 0) && (
                                <tr><td colSpan={10} className="p-8 text-center text-zinc-600">Nenhum dado registrado para {abaAtiva}.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
      </main>

      {/* --- MODAIS --- */}

      {/* MODAL NOVA MODALIDADE */}
      {showNovaModalidade && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 space-y-4">
                  <h2 className="font-bold text-white text-lg">Criar Esporte</h2>
                  <input type="text" placeholder="Nome (ex: Natação)" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none" value={novaModalidadeNome} onChange={e => setNovaModalidadeNome(e.target.value)} />
                  <div className="flex gap-2">
                      <button onClick={() => setShowNovaModalidade(false)} className="flex-1 py-3 text-zinc-500 text-xs uppercase font-bold hover:text-white">Cancelar</button>
                      <button onClick={handleCriarModalidade} className="flex-1 bg-emerald-600 text-white rounded-xl py-3 text-xs font-bold uppercase hover:bg-emerald-500">Criar</button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CHAMADA */}
      {showChamadaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-zinc-900 w-full max-w-md h-[85vh] rounded-2xl border border-zinc-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
                  <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/40">
                      <div>
                          <h3 className="font-bold text-white text-lg flex items-center gap-2"><UserCheck size={18} className="text-emerald-500"/> Chamada</h3>
                          <p className="text-xs text-zinc-400">{showChamadaModal.esporte} • {formatData(showChamadaModal.dia)}</p>
                      </div>
                      <button onClick={() => setShowChamadaModal(null)} className="text-zinc-500 hover:text-white p-2 hover:bg-zinc-800 rounded-full"><X size={20}/></button>
                  </div>
                  
                  <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex gap-2">
                      <div className="relative flex-1">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                          <input 
                            type="text" 
                            placeholder="Buscar ou adicionar avulso..." 
                            className="w-full bg-black border border-zinc-700 rounded-xl pl-9 pr-3 py-3 text-xs text-white focus:border-emerald-500 outline-none placeholder:text-zinc-600" 
                            value={buscaAluno} 
                            onChange={e => setBuscaAluno(e.target.value)} 
                          />
                      </div>
                      <button onClick={handleAddAlunoChamada} className="bg-zinc-800 border border-zinc-700 px-3 rounded-xl hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition text-zinc-400">
                          <Plus size={18}/>
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {showChamadaModal.chamada.map(aluno => (
                          <div key={aluno.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${aluno.status === 'presente' ? 'bg-emerald-950/10 border-emerald-500/20' : 'bg-black/20 border-zinc-800/50'}`}>
                              <Link href={`/perfil/${aluno.handle}`} className="flex items-center gap-3 group flex-1">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                                      <img src={aluno.foto || "https://github.com/shadcn.png"} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1">
                                          {aluno.nome}
                                          <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                                      </p>
                                      <p className="text-[10px] text-zinc-500 font-bold uppercase">{aluno.turma}</p>
                                  </div>
                              </Link>
                              <div className="flex gap-2">
                                  <button onClick={() => handleTogglePresenca(aluno.id)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${aluno.status === 'presente' ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}>
                                      <CheckCircle size={18} />
                                  </button>
                                  <button className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${aluno.status === 'falta' ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'}`}>
                                      <XCircle size={18} />
                                  </button>
                              </div>
                          </div>
                      ))}
                      {showChamadaModal.chamada.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-2 py-10">
                              <Users size={32} className="opacity-20"/>
                              <p className="text-xs">Nenhum atleta na lista.</p>
                          </div>
                      )}
                  </div>
                  <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 backdrop-blur-sm">
                      <div className="flex justify-between items-center text-xs text-zinc-400 mb-3 px-1">
                          <span>Confirmados: <strong className="text-white">{showChamadaModal.chamada.filter(a => a.status === 'presente').length}</strong></span>
                          <span>Total: {showChamadaModal.chamada.length}</span>
                      </div>
                      <button onClick={() => { setShowChamadaModal(null); addToast("Chamada finalizada! Rankings atualizados.", "success") }} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs uppercase hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20 tracking-wide">
                          Salvar Chamada
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL CRIAR TREINO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-800 p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <h2 className="font-bold text-white text-lg">Novo Treino</h2>
            
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center cursor-pointer relative bg-black/20 group hover:border-emerald-500/50 transition" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                {novoTreino.img ? (
                    <div className="relative h-24 rounded-lg overflow-hidden group">
                        <img src={novoTreino.img} className="w-full h-full object-cover" />
                        <button onClick={(e) => { e.stopPropagation(); setNovoTreino({...novoTreino, img: ""}) }} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition"><X size={12}/></button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1 text-zinc-500 group-hover:text-emerald-500 transition">
                        <UploadCloud size={20} />
                        <span className="text-[10px] font-bold uppercase">Foto do Treino</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <select className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition" value={novoTreino.esporte} onChange={e => setNovoTreino({...novoTreino, esporte: e.target.value})}>
                    {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-zinc-400 focus:border-emerald-500 outline-none transition" value={novoTreino.categoria} onChange={e => setNovoTreino({...novoTreino, categoria: e.target.value})}>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Misto">Misto</option>
                </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
                <input 
                    type="date" 
                    className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition" 
                    value={novoTreino.dia} 
                    onChange={e => setNovoTreino({...novoTreino, dia: e.target.value})} 
                />
                <input type="text" placeholder="Horário (Ex: 22:00)" className="bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition" value={novoTreino.horario} onChange={e => setNovoTreino({...novoTreino, horario: e.target.value})} />
            </div>
            <input type="text" placeholder="Local" className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-sm text-white focus:border-emerald-500 outline-none transition" value={novoTreino.local} onChange={e => setNovoTreino({...novoTreino, local: e.target.value})} />

            <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700 flex justify-between items-center">
                <span className="text-[10px] text-zinc-400 font-bold uppercase w-1/2">Repetir por 3 meses?</span>
                <button onClick={handleRenovarAgenda} className="bg-zinc-900 border border-zinc-600 text-xs px-3 py-1.5 rounded-lg text-emerald-400 hover:text-emerald-300 hover:border-emerald-500 transition font-bold uppercase flex items-center gap-1">
                    <RefreshCw size={12}/> Renovar
                </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold text-xs uppercase hover:bg-zinc-800 transition">Cancelar</button>
              <button onClick={handleSaveTreino} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase hover:bg-emerald-500 shadow-lg shadow-emerald-900/20 transition">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Auxiliar KPI
function KpiCard({ title, value, icon, color, barColor, subInfo, percent }: any) {
    return (
        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 group hover:border-emerald-500/30 transition">
            <p className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-2">{icon} {title}</p>
            <p className={`text-2xl font-black mt-1 ${color}`}>{value}</p>
            {subInfo && <p className="text-[9px] text-zinc-500 mt-1">{subInfo}</p>}
            {percent && <div className="w-full h-1 bg-zinc-800 rounded-full mt-2 overflow-hidden"><div className={`h-full ${barColor}`} style={{ width: `${percent}%` }}></div></div>}
        </div>
    )
}