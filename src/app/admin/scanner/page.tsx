'use client';

import { useState } from 'react';
import { db } from "@/lib/firebase"; // Verifique se o caminho está correto
import { collection, getDocs } from "firebase/firestore";

export default function ScannerPage() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ [key: string]: string[] }>({});

  const scanDatabase = async () => {
    setLoading(true);
    const collectionsToScan = ['usuarios', 'produtos', 'eventos', 'pedidos']; // Adicione suas coleções aqui
    const results: { [key: string]: string[] } = {};

    try {
      for (const colName of collectionsToScan) {
        const querySnapshot = await getDocs(collection(db, colName));
        const fieldsFound = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          Object.keys(doc.data()).forEach(field => fieldsFound.add(field));
        });

        results[colName] = Array.from(fieldsFound);
      }
      setReport(results);
      console.log("Aí sim! O Tubarão encontrou isso:", results);
    } catch (error) {
      console.error("Deu ruim no plantão:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-slate-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">🦈 Radar de Campos do Tubarão</h1>
      <button 
        onClick={scanDatabase}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-bold disabled:opacity-50"
      >
        {loading ? "Escanando Profundezas..." : "Iniciar Escaneamento"}
      </button>

      <div className="mt-8 space-y-4">
        {Object.entries(report).map(([col, fields]) => (
          <div key={col} className="border border-slate-700 p-4 rounded-lg bg-slate-800">
            <h2 className="text-xl font-semibold text-blue-400 capitalize">{col}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {fields.map(f => (
                <span key={f} className="bg-slate-700 px-2 py-1 rounded text-sm font-mono text-green-400">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}