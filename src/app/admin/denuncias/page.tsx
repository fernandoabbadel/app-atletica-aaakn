"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, CheckCircle, X, AlertTriangle, 
  MessageCircle, Dumbbell, LifeBuoy, Filter, 
  Search, Eye, Send, Bell, Edit, Clock, User, Trash2, Save
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/src/context/ToastContext";

// --- TIPAGEM ---
type ReportCategory = 'comunidade' | 'gym' | 'suporte';
type ReportStatus = 'pendente' | 'resolvida';

interface Report {
    id: string;
    autor: string; // Quem denunciou
    alvo?: string; // Quem foi denunciado (opcional no suporte)
    categoria: ReportCategory;
    motivo: string;
    descricao: string;
    data: string;
    status: ReportStatus;
    respostaAdmin?: string; // Resposta enviada na notificação
}

// --- MOCKS (DADOS FALSOS) ---
const INITIAL_REPORTS: Report[] = [
    {
        id: "1", autor: "João Silva", alvo: "Pedro Souza", categoria: "comunidade",
        motivo: "Discurso de Ódio", descricao: "O usuário xingou meu time no post sobre o intermed.",
        data: "10/01/2026 - 14:30", status: "pendente"
    },
    {
        id: "2", autor: "Maria Oliveira", categoria: "gym",
        motivo: "Foto Imprópria", descricao: "Postou foto sem camisa fora da área permitida.",
        data: "11/01/2026 - 09:15", status: "pendente"
    },
    {
        id: "3", autor: "Carlos Jr", categoria: "suporte",
        motivo: "Erro no Pagamento", descricao: "Tentei pagar o plano Lenda e deu erro no PIX.",
        data: "12/01/2026 - 10:00", status: "pendente"
    },
    {
        id: "4", autor: "Ana Lima", alvo: "Lucas Pereira", categoria: "comunidade",
        motivo: "Spam", descricao: "Fica mandando link de aposta nos comentários.",
        data: "05/01/2026 - 18:20", status: "resolvida", respostaAdmin: "Usuário advertido e comentário removido."
    }
];

export default function AdminDenunciaPage() {
  const { addToast } = useToast();
  
  // Estados de Filtro
  const [activeCategory, setActiveCategory] = useState<ReportCategory>("comunidade");
  const [activeStatus, setActiveStatus] = useState<ReportStatus>("pendente");
  const [searchTerm, setSearchTerm] = useState("");

  // Dados
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  
  // Modal de Ação
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isEditing, setIsEditing] = useState(false); // Para editar resposta de resolvida

  // --- LÓGICA DE FILTRAGEM ---
  const filteredReports = reports.filter(report => {
      const matchesCategory = report.categoria === activeCategory;
      const matchesStatus = report.status === activeStatus;
      const matchesSearch = report.autor.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            report.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesStatus && matchesSearch;
  });

  // --- HANDLERS ---
  const handleOpenReport = (report: Report) => {
      setSelectedReport(report);
      setResponseText(report.respostaAdmin || ""); // Carrega resposta se existir
      setIsEditing(report.status === 'resolvida'); // Se já tá resolvida, abre modo edição
  };

  const handleResolve = () => {
      if (!selectedReport) return;
      if (!responseText.trim()) {
          addToast("Escreva uma resposta para notificar o usuário!", "error");
          return;
      }

      // Atualiza o relatório
      const updatedReports = reports.map(r => 
          r.id === selectedReport.id 
          ? { ...r, status: 'resolvida' as ReportStatus, respostaAdmin: responseText }
          : r
      );

      setReports(updatedReports);
      setSelectedReport(null);
      setResponseText("");
      
      // Feedback do Tubarão
      addToast("Denúncia resolvida! O usuário recebeu o sininho 🔔", "success");
  };

  const handleEditResponse = () => {
      if (!selectedReport) return;
      
      const updatedReports = reports.map(r => 
          r.id === selectedReport.id 
          ? { ...r, respostaAdmin: responseText }
          : r
      );

      setReports(updatedReports);
      setSelectedReport(null);
      addToast("Resposta atualizada com sucesso!", "success");
  };

  const handleDelete = (id: string) => {
      if(confirm("Excluir este registro permanentemente?")) {
          setReports(reports.filter(r => r.id !== id));
          addToast("Registro apagado do sistema.", "info");
      }
  };

  // Ícones dinâmicos
  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case 'comunidade': return <MessageCircle size={18}/>;
          case 'gym': return <Dumbbell size={18}/>;
          case 'suporte': return <LifeBuoy size={18}/>;
          default: return <AlertTriangle size={18}/>;
      }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-20 font-sans selection:bg-emerald-500">
      
      {/* HEADER */}
      <header className="p-6 sticky top-0 z-30 bg-[#050505]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="bg-zinc-900 p-3 rounded-full hover:bg-zinc-800 border border-zinc-800"><ArrowLeft size={20} className="text-zinc-400" /></Link>
          <div><h1 className="text-xl font-black uppercase flex items-center gap-2"><AlertTriangle className="text-red-500" /> Tribunal do Tubarão</h1><p className="text-[11px] text-zinc-500 font-bold">Gestão de Denúncias</p></div>
        </div>

        {/* ABAS DE CATEGORIA (GRANDES) */}
        <div className="grid grid-cols-3 gap-2 mb-6">
            {(['comunidade', 'gym', 'suporte'] as const).map(cat => (
                <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${activeCategory === cat ? 'bg-zinc-800 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'}`}
                >
                    {getCategoryIcon(cat)}
                    <span className="text-[10px] font-black uppercase mt-1 tracking-wider">{cat}</span>
                </button>
            ))}
        </div>

        {/* FILTROS SECUNDÁRIOS */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Status Toggle */}
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-full md:w-auto">
                <button onClick={() => setActiveStatus('pendente')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-xs font-bold uppercase transition ${activeStatus === 'pendente' ? 'bg-red-500/20 text-red-500' : 'text-zinc-500 hover:text-white'}`}>Pendentes</button>
                <button onClick={() => setActiveStatus('resolvida')} className={`flex-1 md:flex-none px-4 py-2 rounded-md text-xs font-bold uppercase transition ${activeStatus === 'resolvida' ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-500 hover:text-white'}`}>Resolvidas</button>
            </div>

            {/* Busca */}
            <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"/>
                <input 
                    type="text" 
                    placeholder="Filtrar por nome ou motivo..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </header>

      {/* LISTA DE DENÚNCIAS */}
      <main className="p-6 max-w-4xl mx-auto">
          <div className="space-y-4">
              {filteredReports.length === 0 ? (
                  <div className="text-center py-12 text-zinc-600">
                      <CheckCircle size={48} className="mx-auto mb-3 opacity-20"/>
                      <p className="text-sm font-bold uppercase">Nenhuma denúncia {activeStatus}!</p>
                      <p className="text-xs">O mar está calmo hoje.</p>
                  </div>
              ) : (
                  filteredReports.map(report => (
                      <div key={report.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col md:flex-row gap-4 hover:border-zinc-700 transition">
                          
                          {/* Info Principal */}
                          <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase border ${report.status === 'pendente' ? 'bg-red-900/20 text-red-500 border-red-900/30' : 'bg-emerald-900/20 text-emerald-500 border-emerald-900/30'}`}>
                                      {report.status}
                                  </span>
                                  <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={10}/> {report.data}</span>
                              </div>
                              
                              <h3 className="text-white font-bold text-base mb-1">{report.motivo}</h3>
                              <p className="text-zinc-400 text-xs mb-3 line-clamp-2">"{report.descricao}"</p>
                              
                              <div className="flex items-center gap-4 text-xs text-zinc-500 border-t border-zinc-800 pt-3">
                                  <span className="flex items-center gap-1"><User size={12}/> <b>De:</b> {report.autor}</span>
                                  {report.alvo && <span className="flex items-center gap-1 text-red-400"><AlertTriangle size={12}/> <b>Alvo:</b> {report.alvo}</span>}
                              </div>
                          </div>

                          {/* Botão de Ação */}
                          <div className="flex items-center md:border-l border-zinc-800 md:pl-4">
                              <button 
                                  onClick={() => handleOpenReport(report)}
                                  className={`w-full md:w-auto px-5 py-3 rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2 transition ${report.status === 'pendente' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                              >
                                  {report.status === 'pendente' ? <><Eye size={16}/> Analisar</> : <><Edit size={16}/> Detalhes</>}
                              </button>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </main>

      {/* MODAL DE RESOLUÇÃO */}
      {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
              <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 p-6 shadow-2xl relative animate-in zoom-in-95">
                  <button onClick={() => setSelectedReport(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X size={24}/></button>
                  
                  <h2 className="font-bold text-white text-xl mb-1 flex items-center gap-2">
                      {selectedReport.status === 'pendente' ? "Resolver Caso" : "Detalhes do Caso"}
                  </h2>
                  <p className="text-xs text-zinc-500 uppercase tracking-wide mb-6">ID: #{selectedReport.id} • {selectedReport.categoria}</p>

                  <div className="bg-black/40 p-4 rounded-xl border border-zinc-800 mb-6 space-y-3">
                      <div>
                          <p className="label-admin">Acusação</p>
                          <p className="text-white font-bold text-sm">{selectedReport.motivo}</p>
                      </div>
                      <div>
                          <p className="label-admin">Descrição Completa</p>
                          <p className="text-zinc-300 text-xs italic">"{selectedReport.descricao}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div><p className="label-admin">Denunciante</p><p className="text-emerald-400 text-xs font-bold">{selectedReport.autor}</p></div>
                          {selectedReport.alvo && <div><p className="label-admin">Acusado</p><p className="text-red-400 text-xs font-bold">{selectedReport.alvo}</p></div>}
                      </div>
                  </div>

                  {/* ÁREA DE RESPOSTA */}
                  <div className="mb-6">
                      <label className="label-admin flex items-center gap-2 mb-2">
                          <Bell size={12} className="text-yellow-500"/>
                          {selectedReport.status === 'pendente' ? "Enviar Notificação de Resposta" : "Resposta Enviada (Editável)"}
                      </label>
                      <textarea 
                          className="input-admin min-h-[100px]"
                          placeholder="Digite a mensagem que aparecerá no sininho do usuário..."
                          value={responseText}
                          onChange={e => setResponseText(e.target.value)}
                      />
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                      <button onClick={() => handleDelete(selectedReport.id)} className="text-red-500 text-xs font-bold uppercase hover:bg-red-900/20 px-3 py-2 rounded-lg transition flex items-center gap-2"><Trash2 size={14}/> Excluir</button>
                      
                      {selectedReport.status === 'pendente' ? (
                          <button onClick={handleResolve} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-xs uppercase shadow-lg"><CheckCircle size={16}/> Resolver & Notificar</button>
                      ) : (
                          <button onClick={handleEditResponse} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 text-xs uppercase border border-zinc-700"><Save size={16}/> Salvar Edição</button>
                      )}
                  </div>
              </div>
          </div>
      )}

      <style jsx global>{`
        .label-admin { font-size: 10px; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 4px; display: block; }
        .input-admin { width: 100%; background: #000; border: 1px solid #27272a; border-radius: 0.5rem; padding: 0.75rem; color: white; outline: none; font-size: 0.875rem; transition: border-color 0.2s; }
        .input-admin:focus { border-color: #10b981; }
      `}</style>
    </div>
  );
}