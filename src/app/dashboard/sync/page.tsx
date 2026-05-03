"use client";
import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle, Loader2, FolderSync, FileText, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SyncPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [syncStats, setSyncStats] = useState<{ synced: number; new: number; updated: number } | null>(null);
  const [dedupStats, setDedupStats] = useState<{ before: number; after: number; deleted: number } | null>(null);
  const [isDeduping, setIsDeduping] = useState(false);

  const handleSync = async () => {
    setLoading(true);
    setStatus("idle");
    setSyncStats(null);
    setDedupStats(null);
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

  const handleDeduplicate = async () => {
    setIsDeduping(true);
    setStatus("idle");
    setDedupStats(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/vault/deduplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error("Error al deduplicar");
      const data = await response.json();
      setStatus("success");
      setMessage(data.message || "Limpieza semántica completada.");
      setDedupStats({ before: data.total_before, after: data.total_after, deleted: data.deleted });
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Error en la limpieza semántica.");
    } finally {
      setIsDeduping(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold">Vault <span className="emerald-text-gradient">Maintenance</span></h1>
        <p className="text-gray-500 mt-1">Sincroniza y mantén tu base de conocimiento limpia y libre de duplicados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sync Section */}
        <div className="glass p-8 flex flex-col items-center text-center space-y-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
            loading ? "bg-[#10b981]/20 scale-110" : "bg-white/5"
          }`}>
            <RefreshCw className={`w-8 h-8 ${loading ? "text-[#10b981] animate-spin" : "text-gray-400"}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1">Obsidian Sync</h2>
            <p className="text-xs text-gray-500">Exporta todas las notas generadas a tu vault local de Obsidian.</p>
          </div>
          <button
            onClick={handleSync}
            disabled={loading || isDeduping}
            className="btn-emerald w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderSync className="w-4 h-4" />}
            {loading ? "Sincronizando..." : "Sincronizar Vault"}
          </button>
        </div>

        {/* Deduplication Section */}
        <div className="glass p-8 flex flex-col items-center text-center space-y-6">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all ${
            isDeduping ? "bg-purple-500/20 scale-110" : "bg-white/5"
          }`}>
            <Sparkles className={`w-8 h-8 ${isDeduping ? "text-purple-400 animate-pulse" : "text-gray-400"}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1">Limpieza Semántica</h2>
            <p className="text-xs text-gray-500">Detecta y elimina automáticamente fragmentos de información redundante.</p>
          </div>
          <button
            onClick={handleDeduplicate}
            disabled={loading || isDeduping}
            className="w-full bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeduping ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isDeduping ? "Limpiando..." : "Ejecutar Deduplicación"}
          </button>
        </div>
      </div>

      {(status === "success" || status === "error") && (
        <div className={cn(
          "w-full p-6 border rounded-2xl animate-in zoom-in-95 duration-300",
          status === "success" ? "bg-[#10b981]/5 border-[#10b981]/20 text-[#10b981]" : "bg-red-500/5 border-red-500/20 text-red-400"
        )}>
          <div className="flex items-center gap-3 mb-4">
            {status === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-bold">{message}</span>
          </div>

          {syncStats && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: syncStats.synced },
                { label: "Nuevas", value: syncStats.new },
                { label: "Actualizadas", value: syncStats.updated },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{value}</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}

          {dedupStats && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Antes", value: dedupStats.before },
                { label: "Después", value: dedupStats.after },
                { label: "Eliminados", value: dedupStats.deleted, color: "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/5 rounded-xl p-4 text-center">
                  <div className={cn("text-2xl font-bold", color)}>{value}</div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60 mt-1">{label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
