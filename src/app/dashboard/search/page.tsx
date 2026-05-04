﻿"use client";
import React, { useState } from "react";
import { Search, Loader2, FileText, AlertCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SearchResult {
  answer: string;
  sources?: string[];
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch(`${apiUrl}/search/rag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, user_id: user?.id }),
      });
      if (!response.ok) throw new Error("Error en la búsqueda");
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el motor de búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold">Buscador <span className="emerald-text-gradient">RAG</span></h1>
        <p className="text-gray-500 mt-1">Consulta tu base de conocimiento con lenguaje natural usando IA generativa.</p>
      </div>

      <div className="glass p-8">
        <form onSubmit={handleSearch} className="max-w-3xl mx-auto space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="¿Qué quieres saber de tu Vault?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#10b981]/50 transition-all text-lg"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {["¿Qué proyectos tengo activos?", "Resume mis notas sobre IA", "¿Qué recetas he guardado?"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setQuery(s)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-[#10b981]/30 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-emerald w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><Sparkles className="w-4 h-4" /> Buscar en el Vault</>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {result && (
        <div className="glass p-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#10b981]" />
            <h3 className="font-bold text-lg">Respuesta del Vault</h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed">
            {result.answer}
          </div>
          {result.sources && result.sources.length > 0 && (
            <div className="border-t border-white/5 pt-4">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Fuentes</p>
              <div className="space-y-2">
                {result.sources.map((src, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <FileText className="w-3 h-3 text-[#10b981]" />
                    <span className="font-mono">{src}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
