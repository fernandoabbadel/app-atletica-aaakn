"use client";

import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, Upload, Plus, Trash2, Save, LogOut, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from "../../context/ToastContext";
import { db } from "../../lib/firebase";
import { collection, query, getDocs, updateDoc, doc } from "firebase/firestore";

// Helper: Converter Arquivo para Base64 (Armazenamento Simples)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

interface PerguntaLiga {
    id: string; 
    texto: string; 
    imagemBase64?: string; 
    alternativas: string[]; 
    correta: number;
}

interface LigaData {
    id: string;
    nome: string;
    sigla: string;
    senha: string;
    logoBase64?: string;
    perguntas: PerguntaLiga[];
}

export default function PortalLigas() {
  const { addToast } = useToast();
  
  // Estados de Auth & Lista
  const [ligasDisponiveis, setLigasDisponiveis] = useState<{id: string, nome: string}[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  const [selectedLigaId, setSelectedLigaId] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados da Liga Logada (Edição)
  const [ligaData, setLigaData] = useState<LigaData | null>(null);
  const [perguntas, setPerguntas] = useState<PerguntaLiga[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [sigla, setSigla] = useState("");

  // --- 1. BUSCAR LIGAS DO FIREBASE (ID 27 - Lista no Login) ---
  useEffect(() => {
      const fetchLigas = async () => {
          try {
              const ligasRef = collection(db, "ligas_config");
              const snap = await getDocs(ligasRef);
              
              if (!snap.empty) {
                  const lista = snap.docs.map(d => ({
                      id: d.id,
                      nome: d.data().nome
                  }));
                  // Ordenar alfabeticamente
                  lista.sort((a, b) => a.nome.localeCompare(b.nome));
                  setLigasDisponiveis(lista);
              } else {
                  addToast("Nenhuma liga encontrada no sistema.", "info");
              }
          } catch (e) {
              console.error(e);
              addToast("Erro ao carregar lista de ligas.", "error");
          } finally {
              setIsLoadingList(false);
          }
      };
      fetchLigas();
  }, []);

  // --- LOGIN ---
  const handleLogin = async () => {
      if (!selectedLigaId) return addToast("Selecione uma liga!", "error");
      if (!senhaInput) return addToast("Digite a senha!", "error");

      setLoading(true);
      try {
          // Busca todas para validar senha (client-side simple auth)
          const q = query(collection(db, "ligas_config"));
          const snap = await getDocs(q);
          const target = snap.docs.find(d => d.id === selectedLigaId);
          
          if (target) {
              const dados = target.data();
              if (dados.senha === senhaInput) {
                  // Sucesso! Carrega dados para edição
                  setLigaData({ id: target.id, ...dados } as LigaData);
                  setPerguntas(dados.perguntas || []);
                  setLogoUrl(dados.logoBase64 || "");
                  setSigla(dados.sigla || "");
                  setIsLoggedIn(true);
                  addToast(`Bem-vindo, ${dados.nome}!`, "success");
              } else {
                  addToast("Senha incorreta.", "error");
              }
          } else {
              addToast("Liga não encontrada.", "error");
          }
      } catch (e) {
          addToast("Erro de conexão.", "error");
      } finally {
          setLoading(false);
      }
  };

  // --- UPLOAD (ID 29) ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'pergunta', pIndex?: number) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      // Validação de tamanho (max 1MB para base64)
      if (file.size > 1024 * 1024) return addToast("Imagem muito grande! Max 1MB.", "error");

      try {
          const base64 = await fileToBase64(file);
          if (type === 'logo') {
              setLogoUrl(base64);
          } else if (pIndex !== undefined) {
              const novas = [...perguntas];
              novas[pIndex].imagemBase64 = base64;
              setPerguntas(novas);
          }
          addToast("Imagem processada!", "success");
      } catch (err) {
          addToast("Erro ao processar imagem.", "error");
      }
  };

  // --- SALVAR TUDO ---
  const handleSaveAll = async () => {
      if (!ligaData) return;
      
      // ID 30: Validação de 10 perguntas
      if (perguntas.length < 10) {
          return addToast(`Faltam ${10 - perguntas.length} perguntas! Mínimo de 10 exigido.`, "error");
      }

      setLoading(true);
      try {
          await updateDoc(doc(db, "ligas_config", ligaData.id), {
              nome: ligaData.nome, // ID 28: Salva nome editado
              sigla: sigla,       // ID 34: Salva sigla
              logoBase64: logoUrl,
              perguntas: perguntas
          });
          addToast("Dados salvos com sucesso!", "success");
      } catch (e) { addToast("Erro ao salvar.", "error"); }
      setLoading(false);
  };

  // --- CRUD PERGUNTAS ---
  const addQuestion = () => setPerguntas([...perguntas, { id: Date.now().toString(), texto: "", alternativas: ["","","",""], correta: 0 }]);
  const removeQuestion = (idx: number) => setPerguntas(perguntas.filter((_, i) => i !== idx));

  // --- TELA DE LOGIN ---
  if (!isLoggedIn) {
      return (
          <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-white">
              <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl shadow-2xl">
                  <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-emerald-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-emerald-900/50"><Lock className="text-white" size={32}/></div>
                      <h1 className="text-2xl font-black text-white uppercase italic">Portal das Ligas</h1>
                      <p className="text-sm text-zinc-500">Área Restrita aos Representantes</p>
                  </div>
                  
                  <div className="space-y-4">
                      {/* ID 27: Select Dinâmico */}
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Selecione sua Liga</label>
                          <div className="relative">
                              <select 
                                className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none appearance-none disabled:opacity-50"
                                value={selectedLigaId}
                                onChange={(e) => setSelectedLigaId(e.target.value)}
                                disabled={isLoadingList}
                              >
                                  <option value="">{isLoadingList ? "Carregando ligas..." : "Selecione..."}</option>
                                  {ligasDisponiveis.map(l => (
                                      <option key={l.id} value={l.id}>{l.nome}</option>
                                  ))}
                              </select>
                              {isLoadingList && <div className="absolute right-3 top-3"><Loader2 className="animate-spin text-emerald-500" size={16}/></div>}
                          </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Senha de Acesso</label>
                          <input type="password" value={senhaInput} onChange={e => setSenhaInput(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-xl p-3 text-white focus:border-emerald-500 outline-none" placeholder="******"/>
                      </div>

                      <button onClick={handleLogin} disabled={loading || !selectedLigaId} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2">
                          {loading ? "Verificando..." : <>Acessar Painel <ArrowRight size={18}/></>}
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  // --- DASHBOARD ---
  return (
      <div className="min-h-screen bg-black text-white p-4 font-sans pb-24">
          <header className="flex justify-between items-center mb-8 bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
              <div>
                  <h1 className="text-lg font-black uppercase text-white">{ligaData?.nome}</h1>
                  <p className="text-xs text-zinc-500">Gestão de Conteúdo</p>
              </div>
              <button onClick={() => setIsLoggedIn(false)} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"><LogOut size={18}/></button>
          </header>

          <div className="max-w-3xl mx-auto space-y-8">
              
              {/* ID 28 (Nome Editável) & ID 34 (Sigla) */}
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 grid md:grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase">Nome da Liga (Editável)</label>
                      <input type="text" value={ligaData?.nome} onChange={e => setLigaData(prev => prev ? ({...prev, nome: e.target.value}) : null)} className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-white font-bold"/>
                  </div>
                  <div>
                      <label className="text-xs font-bold text-zinc-500 uppercase">Sigla (ID 34)</label>
                      <input type="text" value={sigla} onChange={e => setSigla(e.target.value)} maxLength={6} className="w-full mt-1 bg-black border border-zinc-700 rounded-lg p-2 text-white font-bold uppercase" placeholder="Ex: LAEM"/>
                  </div>
                  
                  {/* ID 29: Upload Logo via Botão */}
                  <div className="md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Logo da Liga</label>
                      <div className="flex items-center gap-4">
                          <label className="w-20 h-20 bg-black rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center cursor-pointer hover:border-emerald-500 overflow-hidden relative group">
                              {logoUrl ? <img src={logoUrl} className="w-full h-full object-cover"/> : <Upload size={20} className="text-zinc-600"/>}
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')}/>
                          </label>
                          <div className="text-xs text-zinc-500">
                              <p>Clique no círculo para enviar.</p>
                              <p>Recomendado: 500x500px.</p>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Perguntas */}
              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold uppercase text-white flex items-center gap-2">
                          Banco de Questões 
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${perguntas.length >= 10 ? 'border-emerald-500 text-emerald-500' : 'border-red-500 text-red-500'}`}>
                              {perguntas.length}/10 (Mínimo ID 30)
                          </span>
                      </h3>
                      <button onClick={addQuestion} className="text-xs bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold hover:bg-emerald-500 flex items-center gap-1"><Plus size={14}/> Add</button>
                  </div>

                  <div className="space-y-4">
                      {perguntas.map((p, idx) => (
                          <div key={idx} className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 relative group">
                              <button onClick={() => removeQuestion(idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition"><Trash2 size={16}/></button>
                              
                              <div className="mb-4 pr-8">
                                  {/* ID 33: Limite Caracteres Pergunta */}
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Enunciado (Max 140)</label>
                                  <input 
                                    type="text" 
                                    maxLength={140} 
                                    value={p.texto} 
                                    onChange={e => {const n=[...perguntas]; n[idx].texto=e.target.value; setPerguntas(n)}} 
                                    className="w-full bg-transparent border-b border-zinc-700 focus:border-emerald-500 outline-none py-1 text-sm font-medium"
                                    placeholder="Digite a pergunta..."
                                  />
                                  <span className="text-[9px] text-zinc-600 block text-right">{p.texto.length}/140</span>
                              </div>

                              <div className="mb-4">
                                  <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 p-2 rounded-lg border border-zinc-800 hover:border-emerald-500 w-fit">
                                      <ImageIcon size={14} className="text-emerald-500"/>
                                      <span className="text-xs font-bold text-zinc-400">Adicionar Foto (ID 29)</span>
                                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'pergunta', idx)}/>
                                  </label>
                                  {p.imagemBase64 && <img src={p.imagemBase64} className="mt-2 h-24 w-auto rounded-lg border border-zinc-700 object-cover"/>}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {p.alternativas.map((alt, aIdx) => (
                                      <div key={aIdx} className="flex items-center gap-2">
                                          <input type="radio" name={`q-${idx}`} checked={p.correta === aIdx} onChange={() => {const n=[...perguntas]; n[idx].correta=aIdx; setPerguntas(n)}} className="accent-emerald-500 cursor-pointer"/>
                                          {/* ID 33: Limite Caracteres Resposta */}
                                          <input 
                                            type="text" 
                                            maxLength={50} 
                                            value={alt} 
                                            onChange={e => {const n=[...perguntas]; n[idx].alternativas[aIdx]=e.target.value; setPerguntas(n)}} 
                                            className={`flex-1 bg-black rounded p-2 text-xs border ${p.correta === aIdx ? 'border-emerald-500 text-emerald-400' : 'border-zinc-800 text-zinc-400'}`} 
                                            placeholder={`Opção ${aIdx+1}`}
                                          />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Botão Flutuante de Salvar */}
              <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-20">
                  <button onClick={handleSaveAll} disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 px-8 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-2 transition transform hover:scale-105 active:scale-95">
                      {loading ? <><Loader2 className="animate-spin"/> Salvando...</> : <><Save size={20}/> SALVAR DADOS</>}
                  </button>
              </div>

          </div>
      </div>
  );
}