﻿"use client";
import React, { useState } from "react";
import { BookOpen, CheckCircle2, AlertCircle, Loader2, Download, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

export default function NotebookLMPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [packUrl, setPackUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setStatus("idle");
    setPackUrl(null);
    try {
      const response = await apiFetch("/analyze/notebooklm", {
        method: "POST",
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) throw new Error("Error generando el pack");
      const data = await response.json();
      setStatus("success");
      setMessage("¡Pack generado! Descárgalo y súbelo a NotebookLM.");
      if (data.download_url) setPackUrl(data.download_url);
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
        <h1 className="text-3xl font-bold">NotebookLM <span className="emerald-text-gradient">Pack</span></h1>
        <p className="text-gray-500 mt-1">Genera un paquete de fuentes optimizado para importar en Google NotebookLM.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Lista de Fuentes", desc: "Markdown con todos tus recursos sobre el tema" },
          { label: "Contexto Maestro", desc: "Resumen unificado de tu Vault para NotebookLM" },
          { label: "ZIP Descargable", desc: "Todo empaquetado listo para subir" },
        ].map((feat, i) => (
          <div key={i} className="glass p-5 border border-white/10">
            <BookOpen className="w-6 h-6 text-[#10b981] mb-3" />
            <p className="font-bold text-sm mb-1">{feat.label}</p>
            <p className="text-xs text-gray-500">{feat.desc}</p>
          </div>
        ))}
      </div>

      <div className="glass p-8">
        <form onSubmit={handleGenerate} className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Tema del Pack</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="ej. Inteligencia Artificial, Cocina Italiana, Homelab..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-[#10b981]/50 transition-all text-lg"
            />
            <p className="text-xs text-gray-600">
              El agente buscará en tu Vault todas las notas relacionadas con este tema.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-emerald w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><Sparkles className="w-4 h-4" /> Generar Pack</>
            )}
          </button>

          {status === "success" && (
            <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-sm space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" /> {message}
              </div>
              {packUrl && (
                <a
                  href={packUrl}
                  className="flex items-center gap-2 text-sm font-bold hover:underline"
                >
                  <Download className="w-4 h-4" /> Descargar Pack ZIP
                </a>
              )}
            </div>
          )}
          {status === "error" && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" /> {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
