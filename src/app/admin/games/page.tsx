"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Trophy, LayoutDashboard, Search, X, Gamepad2, Info
} from "lucide-react";
import Link from "next/link";
import { db } from "../../../lib/firebase";
import { collection, query, getDocs, limit } from "firebase/firestore";
// 🦈 Importamos a calculadora oficial para garantir que o Admin vê a mesma coisa que o User
import { calculateUserStats } from "../../games/page"; 

export default function AdminGamesPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchUsers = async () => {
          const q = query(collection(db, "users"), limit(50));
          const snap = await getDocs(q);
          setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoading(false);
      };
      fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => u.nome?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20">
       <header className="p-6 bg-zinc-900 border-b border-zinc-800 flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-black rounded-full border border-zinc-700"><ArrowLeft size={20}/></Link>
          <h1 className="text-xl font-black uppercase text-emerald-500">Admin Arena</h1>
       </header>

       <main className="p-6">
          <div className="mb-6 flex gap-2">
             <Search className="text-zinc-500"/>
             <input type="text" placeholder="Buscar atleta..." className="bg-transparent border-none outline-none text-white w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
             {users.map(u => (
                 <div key={u.id} onClick={() => setSelectedUser(u)} className="p-4 border-b border-zinc-800 hover:bg-zinc-800 cursor-pointer flex justify-between items-center">
                     <div className="flex items-center gap-3">
                         <img src={u.foto} className="w-10 h-10 rounded-full bg-zinc-700"/>
                         <div><p className="font-bold text-white">{u.nome}</p><p className="text-xs text-zinc-500">{u.turma}</p></div>
                     </div>
                     <span className="text-xs font-mono text-emerald-500">Ver Stats &gt;</span>
                 </div>
             ))}
          </div>
       </main>

       {/* MODAL AUDITORIA */}
       {selectedUser && (
           <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
               <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 p-6 relative h-[80vh] overflow-y-auto">
                   <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4"><X/></button>
                   <h2 className="text-xl font-black text-white mb-6 uppercase">{selectedUser.nome}</h2>
                   
                   {/* TABELA DE CÁLCULO */}
                   <div className="space-y-4">
                       {Object.entries(calculateUserStats(selectedUser)).map(([stat, val]) => (
                           <div key={stat} className="bg-black p-3 rounded-xl border border-zinc-800">
                               <div className="flex justify-between mb-2">
                                   <span className="font-bold text-white uppercase">{stat}</span>
                                   <span className="text-emerald-500 font-black text-xl">{val}</span>
                               </div>
                               <p className="text-[10px] text-zinc-500">Baseado em: {JSON.stringify(selectedUser.stats || {})}</p>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
       )}
    </div>
  );
}