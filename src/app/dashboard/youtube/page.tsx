﻿"use client";
import React, { useState } from "react";
import {
  Play,
  Search,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Video
} from "lucide-react";
import Link from "next/link";

export default function YoutubePage() {
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
      const response = await fetch(`${apiUrl}/analyze/youtube`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Error en el servidor de agentes");

      const data = await response.json();
      setStatus("success");
      setMessage("¡Orden enviada! El agente está procesando el video.");
      setUrl(""); // Limpiar input
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "No se pudo contactar con el Agente Python.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">YouTube <span className="emerald-text-gradient">Analysis</span></h1>
          <p className="text-gray-500 mt-1">Ingesta de video de alta fidelidad para tu base de conocimiento.</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="glass p-8">
        <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Video URL</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#10b981] transition-colors">
                <Video className="w-5 h-5" />
              </div>
              <input 
                type="url" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
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
              <>
                <Play className="w-4 h-4 fill-current" /> Analizar Video
              </>
            )}
          </button>

          {status === "success" && (
            <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-sm flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5" /> {message}
            </div>
          )}

          {status === "error" && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {message}
            </div>
          )}
        </form>
      </div>

      {/* Historial Simulado */}
      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-lg">Historial de Auditoría</h3>
          </div>
          <Link href="/dashboard/analytics" className="text-xs text-[#10b981] font-bold hover:underline">Ver todo</Link>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { title: "Building a RAG with Gemini 1.5 Pro", date: "Hace 2 horas", status: "Completado" },
            { title: "Deep Dive into Next.js 15 Turbopack", date: "Hace 5 horas", status: "Completado" },
            { title: "Obsidian for Developers 2026", date: "Ayer", status: "Error" },
          ].map((item, idx) => (
            <div key={idx} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-[#10b981]/10 transition-colors">
                  <Play className="w-4 h-4 text-gray-400 group-hover:text-[#10b981]" />
                </div>
                <div>
                  <div className="text-sm font-bold">{item.title}</div>
                  <div className="text-[10px] text-gray-500 uppercase font-black">{item.date}</div>
                </div>
              </div>
              <div className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                item.status === "Completado" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-red-500/10 text-red-400"
              }`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
