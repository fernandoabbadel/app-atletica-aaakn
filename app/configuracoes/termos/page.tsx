"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Scale, Cookie, Lock, FileText, CheckCircle } from "lucide-react";

// --- CONTEÚDO COMPLETO (BASEADO NO SEU ENVIO) ---
const DOCS = [
    { 
        id: "privacidade", 
        title: "Privacidade (LGPD)", 
        icon: Lock, 
        content: `DOCUMENTO 1 — POLÍTICA DE PRIVACIDADE (LGPD)
AAAKN APP (Versão 1.0 — 12/01/2026)

QUEM SOMOS (CONTROLADOR)
O AAAKN APP é operado por AAAKN, responsável pelas decisões sobre o tratamento de dados pessoais no aplicativo.

O QUE ESTA POLÍTICA COBRE
Esta Política explica:
a) quais dados pessoais coletamos;
b) para quais finalidades usamos;
c) com quem compartilhamos;
d) por quanto tempo armazenamos;
e) como protegemos;
f) quais são seus direitos e como exercê-los, conforme a LGPD.

QUAIS DADOS PESSOAIS COLETAMOS
3.1 Dados que você fornece ao criar/usar a conta:
a) Dados cadastrais: nome, handle/usuário, matrícula, turma, curso.
b) Dados de contato: e-mail e/ou telefone.
c) Perfil: foto, bio, Instagram.
d) Conteúdo: posts, comentários, curtidas.

3.2 Dados gerados pelo uso do app:
a) Logs: registros de acesso, IP, identificadores de sessão.
b) Gamificação: pontos, nível, experiência, conquistas.

PARA QUE USAMOS SEUS DADOS (FINALIDADES)
a) Criar e gerenciar sua conta.
b) Exibir seu perfil e permitir interação social.
c) Operar gamificação (ranking).
d) Processar compras e carteirinha digital.
e) Segurança e prevenção a fraudes.

COMPARTILHAMENTO DE DADOS
Não vendemos dados pessoais. Compartilhamos apenas com:
a) Provedores de infraestrutura (servidores).
b) Provedores de pagamento.
c) Ferramentas de analytics.

SEGURANÇA DA INFORMAÇÃO
Adotamos medidas técnicas como criptografia em trânsito e controle de acesso rigoroso.`
    },
    { 
        id: "termos", 
        title: "Termos de Uso", 
        icon: Scale, 
        content: `DOCUMENTO 2 — TERMOS DE USO
AAAKN APP (Versão 1.0 — 12/01/2026)

ACEITE
Ao acessar ou usar o AAAKN APP, você concorda com estes Termos e com a Política de Privacidade.

QUEM PODE USAR
Você declara que tem capacidade civil e fornecerá informações verdadeiras.

CONTA, SENHA E RESPONSABILIDADE
Você é responsável por manter a confidencialidade das credenciais e por toda atividade em sua conta.

REGRAS DE CONDUTA
É proibido:
a) publicar conteúdo ilegal ou violento;
b) assediar ou ameaçar;
c) fraude ou manipulação de ranking;
d) tentar acessar áreas restritas (/admin).

CONTEÚDO DO USUÁRIO
Você mantém direitos sobre o conteúdo que cria, mas concede licença para operarmos o serviço.

PROPRIEDADE INTELECTUAL
O app e seu código são de propriedade da AAAKN.

RESCISÃO
Podemos suspender contas por violação destes Termos.`
    },
    { 
        id: "cookies", 
        title: "Cookies", 
        icon: Cookie, 
        content: `DOCUMENTO 3 — POLÍTICA DE COOKIES
AAAKN APP (Versão 1.0 — 12/01/2026)

O QUE SÃO COOKIES
Arquivos armazenados no dispositivo para viabilizar funcionamento.

TIPOS DE COOKIES
a) Estritamente necessários: login, segurança.
b) Desempenho: estatísticas de uso.
c) Funcionais: lembrar escolhas.

COMO GERENCIAR
Você pode gerenciar cookies nas configurações do seu navegador ou dispositivo.`
    },
    { 
        id: "moderacao", 
        title: "Moderação", 
        icon: Shield, 
        content: `DOCUMENTO 4 — POLÍTICA DE MODERAÇÃO
AAAKN APP (Versão 1.0 — 12/01/2026)

OBJETIVO
Manter um ambiente seguro e respeitoso.

O QUE PODE SER MODERADO
Posts, comentários, perfis e fotos.

CRITÉRIOS DE AÇÃO
Violação de lei, assédio, discriminação, fraude ou spam.

MEDIDAS
Advertência, remoção de conteúdo, suspensão ou banimento.`
    }
];

export default function TermosLegaisPage() {
  const [activeDocId, setActiveDocId] = useState("privacidade");
  const activeDoc = DOCS.find(d => d.id === activeDocId);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-emerald-500 flex flex-col">
      
      {/* HEADER FIXO */}
      <header className="p-4 sticky top-0 z-30 bg-[#050505]/95 backdrop-blur-md border-b border-zinc-800 flex items-center gap-4">
          <Link href="/configuracoes" className="p-2 bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition"><ArrowLeft size={20}/></Link>
          <h1 className="text-lg font-black uppercase tracking-tight">Jurídico</h1>
      </header>

      {/* MENU SUPERIOR (TABS) */}
      <div className="sticky top-[73px] z-20 bg-[#050505] border-b border-zinc-800 px-4 py-3 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 min-w-max">
              {DOCS.map(doc => (
                  <button 
                      key={doc.id}
                      onClick={() => setActiveDocId(doc.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase transition border ${activeDocId === doc.id ? 'bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'}`}
                  >
                      <doc.icon size={14}/>
                      {doc.title}
                  </button>
              ))}
          </div>
      </div>

      {/* CONTEÚDO */}
      <main className="flex-1 p-4 pb-24 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeDoc && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20">
                          <activeDoc.icon size={24}/>
                      </div>
                      <div>
                          <h2 className="text-xl font-black uppercase leading-none">{activeDoc.title}</h2>
                          <p className="text-[10px] text-zinc-500 font-bold mt-1 uppercase">Última atualização: 12/01/2026</p>
                      </div>
                  </div>
                  
                  {/* TEXTO FORMATADO */}
                  <div className="prose prose-invert prose-sm max-w-none text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {activeDoc.content}
                  </div>

                  <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-center gap-2 text-zinc-500 text-xs font-medium opacity-60">
                      <CheckCircle size={14}/> Fim do documento
                  </div>
              </div>
          )}
      </main>
    </div>
  );
}