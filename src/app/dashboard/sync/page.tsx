﻿"use client";
import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, FolderSync, FileText, Clock } from "lucide-react";

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [syncStats, setSyncStats] = useState<{ synced: number; new: number; updated: number } | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setStatus("idle");
    setSyncStats(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/sync/obsidian`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Error al sincronizar");
      const data = await response.json();
      setStatus("success");
      setMessage("¡Sincronización completada! Tu Vault de Obsidian está actualizado.");
      if (data.stats) setSyncStats(data.stats);
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
        <h1 className="text-3xl font-bold">Vault <span className="emerald-text-gradient">Sync</span></h1>
        <p className="text-gray-500 mt-1">Sincroniza todas las notas generadas por los agentes con tu Vault de Obsidian.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FolderSync, label: "Sincronización Automática", desc: "Exporta todas las notas al vault en Obsidian" },
          { icon: FileText, label: "Formatos Compatibles", desc: "YouTube, GitHub, Web, Recetas, RSS, Audio" },
          { icon: Clock, label: "Historial Completo", desc: "Fecha y autor de cada nota sincronizada" },
        ].map(({ icon: Icon, label, desc }, i) => (
          <div key={i} className="glass p-5 border border-white/10">
            <Icon className="w-6 h-6 text-[#10b981] mb-3" />
            <p className="font-bold text-sm mb-1">{label}</p>
            <p className="text-xs text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      <div className="glass p-8 flex flex-col items-center text-center space-y-6">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
          loading ? "bg-[#10b981]/20" : "bg-white/5"
        }`}>
          <RefreshCw className={`w-10 h-10 ${loading ? "text-[#10b981] animate-spin" : "text-gray-500"}`} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-1">Sincronizar con Obsidian</h2>
          <p className="text-sm text-gray-500">
            Exporta todas las notas del Knowledge Engine a tu Vault local.
          </p>
        </div>

        <button
          onClick={handleSync}
          disabled={loading}
          className="btn-emerald px-10 py-4 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          {loading ? "Sincronizando..." : "Iniciar Sincronización"}
        </button>

        {status === "success" && (
          <div className="w-full p-4 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-sm">
            <div className="flex items-center justify-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" /> {message}
            </div>
            {syncStats && (
              <div className="grid grid-cols-3 gap-4 mt-3">
                {[
                  { label: "Total", value: syncStats.synced },
                  { label: "Nuevas", value: syncStats.new },
                  { label: "Actualizadas", value: syncStats.updated },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#10b981]/10 rounded-lg p-3">
                    <div className="text-2xl font-bold">{value}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {status === "error" && (
          <div className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" /> {message}
          </div>
        )}
      </div>
    </div>
  );
}
