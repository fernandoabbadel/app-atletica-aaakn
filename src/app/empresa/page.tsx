"use client";

import React, { useState, useRef } from "react";
import {
  QrCode, TrendingUp, Users, DollarSign, LogOut, Camera, X, Store,
  ArrowRight, Plus, Ticket, Edit, Save, Image as ImageIcon,
  Calendar, Clock, MapPin, Globe, Phone, Instagram, Trash2, CheckCircle, Search
} from "lucide-react";
import Link from "next/link";
import { useToast } from "../../context/ToastContext";

// --- TIPAGEM ---
interface Cupom {
    id: string;
    titulo: string;
    regra: string;
    valor: string; // Ex: "15%" ou "R$ 10,00"
    imagem: string;
}

interface ScanLog {
    id: string;
    usuario: string;
    userId: string;
    data: string;
    hora: string;
    cupom: string;
    valorEconomizado: string;
}

// --- MOCKS INICIAIS ---
const INITIAL_DATA = {
    nome: "Academia Ironberg",
    categoria: "Saúde",
    descricao: "A maior rede de academias com equipamentos de ponta e instrutores capacitados.",
    endereco: "Av. da Praia, 1000 - Centro",
    horario: "06h às 23h",
    insta: "@ironberg_caragua",
    whats: "12 99999-9999",
    site: "ironberg.com.br",
    imgCapa: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80",
    imgLogo: "https://i.pravatar.cc/150?u=iron",
    dataInicio: "10/01/2025",
    cupons: [
        { id: "c1", titulo: "15% OFF Mensalidade", regra: "Planos Semestrais", valor: "15%", imagem: "" },
        { id: "c2", titulo: "Isenção de Matrícula", regra: "Novos Alunos", valor: "R$ 100", imagem: "" }
    ]
};

const INITIAL_HISTORY: ScanLog[] = [
    { id: "SCAN-001", usuario: "João Silva", userId: "MED-0123", data: "12/01/2026", hora: "14:30", cupom: "15% OFF Mensalidade", valorEconomizado: "R$ 45,00" },
    { id: "SCAN-002", usuario: "Maria Souza", userId: "MED-0442", data: "12/01/2026", hora: "10:15", cupom: "Isenção Matrícula", valorEconomizado: "R$ 100,00" },
    { id: "SCAN-003", usuario: "Pedro Santos", userId: "MED-0099", data: "11/01/2026", hora: "19:45", cupom: "15% OFF Mensalidade", valorEconomizado: "R$ 45,00" },
];

export default function EmpresaPortal() {
  const { addToast } = useToast();
  const [view, setView] = useState<"login" | "dashboard">("dashboard"); 
  const [scanning, setScanning] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estado Principal
  const [partner, setPartner] = useState(INITIAL_DATA);
  const [history, setHistory] = useState(INITIAL_HISTORY);

  // Estado Temporário para Edição
  const [editForm, setEditForm] = useState(INITIAL_DATA);
  const [newCupom, setNewCupom] = useState<Cupom>({ id: "", titulo: "", regra: "", valor: "", imagem: "" });

  // Refs para Upload
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const cupomInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); addToast("Bem-vindo, Tubarão!", "success"); setView("dashboard"); };
  
  const handleScan = () => {
      setScanning(true);
      setTimeout(() => { 
          setScanning(false); 
          addToast("✅ Cupom Validado!", "success");
          // Adiciona um log fictício ao histórico
          const newLog: ScanLog = {
              id: `SCAN-${Math.floor(Math.random() * 1000)}`,
              usuario: "Aluno Teste",
              userId: "MED-TEST",
              data: new Date().toLocaleDateString('pt-BR'),
              hora: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
              cupom: partner.cupons[0]?.titulo || "Desconto Padrão",
              valorEconomizado: "R$ 0,00"
          };
          setHistory(prev => [newLog, ...prev]);
      }, 2000);
  };

  const handleOpenEdit = () => { setEditForm({ ...partner }); setShowEditModal(true); };

  const handleSaveProfile = () => {
      setPartner(editForm);
      setShowEditModal(false);
      addToast("Perfil atualizado com sucesso!", "success");
  };

  const handleAddCupom = () => {
      if (!newCupom.titulo || !newCupom.valor) return addToast("Preencha título e valor do cupom", "error");
      const cupom = { ...newCupom, id: Date.now().toString() };
      setEditForm(prev => ({ ...prev, cupons: [...prev.cupons, cupom] }));
      setNewCupom({ id: "", titulo: "", regra: "", valor: "", imagem: "" });
      addToast("Cupom adicionado à lista (Salve para confirmar)", "success");
  };

  const handleRemoveCupom = (id: string) => {
      setEditForm(prev => ({ ...prev, cupons: prev.cupons.filter(c => c.id !== id) }));
  };

  const handleFileClick = (ref: React.RefObject<HTMLInputElement | null>) => ref.current?.click();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string, isCupom = false) => {
      if (e.target.files?.[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          if (isCupom) {
              setNewCupom(prev => ({ ...prev, imagem: url }));
              addToast("Imagem do cupom carregada", "success");
          } else {
              setEditForm(prev => ({ ...prev, [field]: url }));
              addToast("Imagem carregada", "success");
          }
      }
  };

  // --- VIEW: LOGIN ---
  if (view === "login") {
      return (
          <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-emerald-600/15 blur-[120px] rounded-full pointer-events-none animate-pulse-slow"></div>
              <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 p-8 rounded-[2rem] shadow-2xl relative z-10">
                  <div className="text-center mb-8">
                      <div className="relative w-24 h-24 mx-auto mb-4 group">
                        <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full group-hover:bg-emerald-500/50 transition duration-500"></div>
                        <img src="/logo.png" alt="AAAKN" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                      </div>
                      <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">Portal Parceiro</h1>
                      <p className="text-zinc-400 text-xs font-medium">Área restrita para empresas conveniadas.</p>
                  </div>
                  <form onSubmit={handleLogin} className="space-y-4">
                      <input type="email" placeholder="Email Corporativo" className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 placeholder:text-zinc-600" required/>
                      <input type="password" placeholder="Senha" className="w-full bg-black/50 border border-zinc-700 rounded-xl p-4 text-white outline-none focus:border-emerald-500 placeholder:text-zinc-600" required/>
                      <button type="submit" className="w-full bg-emerald-600 text-white font-black uppercase py-4 rounded-xl shadow-lg hover:bg-emerald-500 transition active:scale-95">Acessar Painel</button>
                      <div className="text-center mt-6 pt-6 border-t border-zinc-800"><p className="text-xs text-zinc-500 mb-2">Ainda não é parceiro?</p><Link href="/empresa/cadastro" className="text-emerald-400 font-bold text-sm hover:text-emerald-300 hover:underline uppercase tracking-wide">Cadastre sua Empresa</Link></div>
                  </form>
              </div>
          </div>
      );
  }

  // --- VIEW: DASHBOARD ---
  return (
      <div className="min-h-screen bg-[#050505] text-white pb-20 selection:bg-emerald-500">
          
          {/* HEADER */}
          <header className="p-6 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center sticky top-0 z-30 shadow-md">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-black border border-zinc-700 flex items-center justify-center overflow-hidden">
                      <img src={partner.imgLogo} className="w-full h-full object-cover"/> 
                  </div>
                  <div>
                      <h2 className="text-lg font-black uppercase text-white leading-none">{partner.nome}</h2>
                      <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online</p>
                  </div>
              </div>
              <button onClick={() => setView("login")} className="bg-black p-2 rounded-full text-zinc-500 hover:text-red-500 transition border border-zinc-800"><LogOut size={18}/></button>
          </header>

          <main className="p-6 space-y-8 max-w-6xl mx-auto">
              
              {/* BOTÃO EDITAR PERFIL */}
              <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 backdrop-blur-sm">
                  <div>
                      <p className="text-xs text-zinc-400 font-bold uppercase">Gestão da Página</p>
                      <p className="text-white font-bold text-sm">Mantenha seus dados e cupons atualizados.</p>
                  </div>
                  <button onClick={handleOpenEdit} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-emerald-500 transition shadow-lg shadow-emerald-900/20"><Edit size={14}/> Editar Tudo</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA DA ESQUERDA: METRICAS E SCANNER */}
                <div className="space-y-6 lg:col-span-1">
                    {/* METRICAS */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-lg">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Calendar size={10}/> Parceria Desde</p>
                            <h3 className="text-sm font-black text-white">{partner.dataInicio}</h3>
                        </div>
                        <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 shadow-lg">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1 flex items-center gap-1"><Ticket size={10}/> Cupons Totais</p>
                            <h3 className="text-xl font-black text-emerald-500">{history.length}</h3>
                        </div>
                    </div>

                    {/* SCANNER */}
                    <div className="bg-gradient-to-b from-emerald-900/20 to-zinc-900 border border-emerald-500/30 rounded-3xl p-8 text-center cursor-pointer active:scale-95 transition shadow-lg relative overflow-hidden group" onClick={handleScan}>
                        <div className="absolute inset-0 bg-emerald-500/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <div className={`w-32 h-32 mx-auto rounded-full bg-black border-4 flex items-center justify-center mb-4 transition duration-500 relative z-10 ${scanning ? 'border-emerald-500 animate-pulse shadow-[0_0_40px_rgba(16,185,129,0.4)]' : 'border-zinc-700 group-hover:border-emerald-500'}`}>
                            <Camera size={40} className={scanning ? 'text-emerald-500' : 'text-zinc-500 group-hover:text-emerald-500'}/>
                        </div>
                        <h3 className="text-xl font-black uppercase mb-1 relative z-10 text-white">{scanning ? "Lendo QR..." : "Ler QR Code"}</h3>
                        <p className="text-xs text-zinc-400 relative z-10">Valide o desconto do aluno agora</p>
                    </div>
                </div>

                {/* COLUNA DA DIREITA: HISTÓRICO */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl h-full flex flex-col">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
                            <h3 className="font-bold text-white flex items-center gap-2"><QrCode size={18} className="text-emerald-500"/> Histórico de Leituras</h3>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                                <input type="text" placeholder="Buscar..." className="bg-black border border-zinc-700 rounded-full pl-9 pr-3 py-1.5 text-xs text-white outline-none focus:border-emerald-500"/>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-black/40 border-b border-zinc-800 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                                    <tr>
                                        <th className="p-4">Data</th>
                                        <th className="p-4">Aluno / ID</th>
                                        <th className="p-4">Cupom Utilizado</th>
                                        <th className="p-4 text-right">Economia</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800/50 text-sm text-zinc-300">
                                    {history.map((log) => (
                                        <tr key={log.id} className="hover:bg-zinc-800/30 transition">
                                            <td className="p-4">
                                                <div className="font-bold text-white">{log.data}</div>
                                                <div className="text-[10px] text-zinc-500">{log.hora}</div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-white font-medium">{log.usuario}</div>
                                                <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700">{log.userId}</span>
                                            </td>
                                            <td className="p-4 flex items-center gap-2">
                                                <Ticket size={14} className="text-emerald-500"/> {log.cupom}
                                            </td>
                                            <td className="p-4 text-right font-mono text-emerald-400 font-bold">{log.valorEconomizado}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

              </div>
          </main>

          {/* --- MODAL EDITAR PERFIL (CORRIGIDO E RESPONSIVO) --- */}
          {showEditModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
                  <div className="bg-zinc-900 w-full max-w-4xl rounded-3xl border border-zinc-800 p-6 shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
                      <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                      
                      <div className="flex items-center gap-3 mb-6 border-b border-zinc-800 pb-4">
                          <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500"><Store size={24}/></div>
                          <div>
                              <h2 className="font-black text-white text-xl uppercase leading-none">Editar Página</h2>
                              <p className="text-xs text-zinc-500">Atualize todas as informações visíveis aos alunos.</p>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          
                          {/* COLUNA 1: DADOS VISUAIS E GERAIS */}
                          <div className="space-y-5">
                              <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Identidade Visual</h3>
                              
                              {/* GRID DE UPLOAD CORRIGIDO PARA NÃO SAIR DA TELA */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div onClick={() => handleFileClick(logoInputRef)} className="cursor-pointer group relative aspect-square bg-black border border-dashed border-zinc-700 rounded-2xl overflow-hidden flex flex-col items-center justify-center hover:border-emerald-500 transition">
                                      {editForm.imgLogo ? <img src={editForm.imgLogo} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition"/> : <ImageIcon size={24} className="text-zinc-500 mb-2"/>}
                                      <span className="relative z-10 text-[10px] font-bold text-zinc-400 uppercase group-hover:text-emerald-500">Logo</span>
                                      <input type="file" hidden ref={logoInputRef} onChange={e => handleFileChange(e, 'imgLogo')}/>
                                  </div>
                                  <div onClick={() => handleFileClick(coverInputRef)} className="cursor-pointer group relative aspect-video sm:aspect-auto bg-black border border-dashed border-zinc-700 rounded-2xl overflow-hidden flex flex-col items-center justify-center hover:border-emerald-500 transition">
                                      {editForm.imgCapa ? <img src={editForm.imgCapa} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-30 transition"/> : <ImageIcon size={24} className="text-zinc-500 mb-2"/>}
                                      <span className="relative z-10 text-[10px] font-bold text-zinc-400 uppercase group-hover:text-emerald-500">Capa</span>
                                      <input type="file" hidden ref={coverInputRef} onChange={e => handleFileChange(e, 'imgCapa')}/>
                                  </div>
                              </div>

                              <div className="space-y-3">
                                  <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Nome Fantasia</label><input type="text" className="input-modal" value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})}/></div>
                                  <div><label className="text-[10px] font-bold text-zinc-500 uppercase">Descrição</label><textarea rows={3} className="input-modal" value={editForm.descricao} onChange={e => setEditForm({...editForm, descricao: e.target.value})}/></div>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1"><Instagram size={12}/> Instagram</label><input type="text" className="input-modal" value={editForm.insta} onChange={e => setEditForm({...editForm, insta: e.target.value})}/></div>
                                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1"><Phone size={12}/> WhatsApp</label><input type="text" className="input-modal" value={editForm.whats} onChange={e => setEditForm({...editForm, whats: e.target.value})}/></div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1"><Globe size={12}/> Site</label><input type="text" className="input-modal" value={editForm.site} onChange={e => setEditForm({...editForm, site: e.target.value})}/></div>
                                      <div><label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1"><Clock size={12}/> Horário</label><input type="text" className="input-modal" value={editForm.horario} onChange={e => setEditForm({...editForm, horario: e.target.value})}/></div>
                                  </div>
                                  <div><label className="text-[10px] font-bold text-zinc-500 uppercase flex gap-1"><MapPin size={12}/> Endereço</label><input type="text" className="input-modal" value={editForm.endereco} onChange={e => setEditForm({...editForm, endereco: e.target.value})}/></div>
                              </div>
                          </div>

                          {/* COLUNA 2: GESTÃO DE CUPONS */}
                          <div className="space-y-5 flex flex-col h-full">
                              <h3 className="text-xs font-black text-yellow-500 uppercase tracking-widest flex items-center gap-2"><Ticket size={14}/> Meus Cupons</h3>
                              
                              {/* Lista de Cupons */}
                              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2 custom-scrollbar bg-black/20 p-2 rounded-xl border border-zinc-800">
                                  {editForm.cupons.map(cupom => (
                                      <div key={cupom.id} className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl flex gap-3 items-center group">
                                          <div className="w-12 h-12 bg-black rounded-lg overflow-hidden border border-zinc-800 flex-shrink-0">
                                              {cupom.imagem ? <img src={cupom.imagem} className="w-full h-full object-cover"/> : <Ticket size={20} className="text-zinc-700 m-auto mt-3"/>}
                                          </div>
                                          <div className="flex-1">
                                              <p className="text-xs font-bold text-white">{cupom.titulo}</p>
                                              <p className="text-[10px] text-zinc-500">{cupom.regra}</p>
                                              <p className="text-[10px] text-emerald-500 font-bold">{cupom.valor}</p>
                                          </div>
                                          <button onClick={() => handleRemoveCupom(cupom.id)} className="text-zinc-600 hover:text-red-500 transition p-2"><Trash2 size={16}/></button>
                                      </div>
                                  ))}
                                  {editForm.cupons.length === 0 && <p className="text-zinc-500 text-xs text-center py-4">Nenhum cupom ativo.</p>}
                              </div>

                              {/* Adicionar Novo Cupom */}
                              <div className="bg-zinc-800/50 border border-zinc-700 p-4 rounded-2xl space-y-3">
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Adicionar Novo</p>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleFileClick(cupomInputRef)} className="bg-zinc-700 text-zinc-300 p-3 rounded-xl hover:bg-zinc-600 border border-zinc-600 flex items-center justify-center w-12 flex-shrink-0">
                                          <ImageIcon size={18}/>
                                      </button>
                                      <input type="text" placeholder="Título (ex: 15% OFF)" className="input-modal" value={newCupom.titulo} onChange={e => setNewCupom({...newCupom, titulo: e.target.value})}/>
                                      <input type="file" hidden ref={cupomInputRef} onChange={e => handleFileChange(e, '', true)}/>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                      <input type="text" placeholder="Regra (ex: Seg-Sex)" className="input-modal" value={newCupom.regra} onChange={e => setNewCupom({...newCupom, regra: e.target.value})}/>
                                      <input type="text" placeholder="Valor (ex: R$ 10)" className="input-modal" value={newCupom.valor} onChange={e => setNewCupom({...newCupom, valor: e.target.value})}/>
                                  </div>
                                  <button onClick={handleAddCupom} className="w-full bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 py-2 rounded-xl text-xs font-bold uppercase hover:bg-yellow-600 hover:text-white transition">Adicionar à Lista</button>
                              </div>
                          </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-zinc-800 flex justify-end gap-3">
                          <button onClick={() => setShowEditModal(false)} className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-400 font-bold hover:bg-zinc-800 text-xs uppercase tracking-wide">Cancelar</button>
                          <button onClick={handleSaveProfile} className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-lg text-xs uppercase tracking-wide flex items-center gap-2"><Save size={16}/> Salvar Perfil</button>
                      </div>
                  </div>
              </div>
          )}

          <style jsx global>{`
            .input-modal { width: 100%; background: #000; border: 1px solid #27272a; border-radius: 0.5rem; padding: 0.75rem; color: white; outline: none; font-size: 0.75rem; transition: border-color 0.2s; }
            .input-modal:focus { border-color: #10b981; }
            .custom-scrollbar::-webkit-scrollbar { width: 4px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #18181b; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
          `}</style>
      </div>
  );
}