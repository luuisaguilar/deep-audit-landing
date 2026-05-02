﻿"use client";
import React, { useState } from "react";
import { Globe, CheckCircle2, AlertCircle, Loader2, History, FileText } from "lucide-react";

export default function WebPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setStatus("idle");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/analyze/web`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error("Error en el servidor de agentes");
      setStatus("success");
      setMessage("¡Artículo encolado! El agente está procesando el contenido web.");
      setUrl("");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "No se pudo contactar con el Agente Python.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold">Web <span className="emerald-text-gradient">Scraper</span></h1>
        <p className="text-gray-500 mt-1">Extrae y analiza el contenido de cualquier artículo o página web.</p>
      </div>

      <div className="glass p-8">
        <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">URL del Artículo</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#10b981] transition-colors">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://blog.ejemplo.com/articulo"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#10b981]/50 transition-all text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="btn-emerald w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><FileText className="w-4 h-4" /> Analizar Artículo</>
            )}
          </button>

          {status === "success" && (
            <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" /> {message}
            </div>
          )}
          {status === "error" && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" /> {message}
            </div>
          )}
        </form>
      </div>

      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-lg">Historial de Artículos</h3>
        </div>
        <div className="p-6 text-center text-gray-600 text-sm">
          Los artículos procesados aparecerán aquí.
        </div>
      </div>
    </div>
  );
}
