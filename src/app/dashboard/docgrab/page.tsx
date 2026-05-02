"use client";
import React, { useState } from "react";
import {
  Globe,
  Settings,
  Terminal,
  Play,
  Loader2,
} from "lucide-react";

export default function DocGrabPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [logs, setLogs] = useState<string[]>(["[SYSTEM] Console initialized. Awaiting target URL..."]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleStartCloning = async () => {
    if (!url) return;
    setLoading(true);
    addLog(`Initiating connection to DeepAudit-Bridge...`);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/analyze/docgrab`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) throw new Error("Connection failed");

      setIsQueued(true);
      addLog(`SUCCESS: Tarea encolada para ${url}`);
      addLog(`El agente procesara la documentacion en segundo plano.`);
    } catch {
      addLog(`ERROR: Could not reach Agent Bridge at ${process.env.NEXT_PUBLIC_API_URL || "API"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">
            DocGrab <span className="emerald-text-gradient">Agent</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Crawler inteligente para clonacion recursiva de documentacion tecnica.
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
            isQueued
              ? "border-[#10b981]/30 bg-[#10b981]/5 text-[#10b981]"
              : "border-white/5 bg-white/5 text-gray-500"
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${isQueued ? "bg-[#10b981]" : "bg-gray-700"}`} />
          <span className="text-[10px] font-black uppercase">
            {isQueued ? "Encolado" : "Agent Standby"}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass p-6 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-[#10b981]" />
              <h3 className="font-bold">Configuracion</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500">Target Root URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://docs.example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-500">Profundidad</label>
                <select className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 outline-none appearance-none">
                  <option>Nivel 1 (Pagina actual)</option>
                  <option>Nivel 3 (Recomendado)</option>
                  <option>Recursivo Total</option>
                </select>
              </div>

              <button
                onClick={handleStartCloning}
                disabled={loading || isQueued || !url}
                className="btn-emerald w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Iniciar Clonacion
                  </>
                )}
              </button>

              {isQueued && (
                <button
                  onClick={() => {
                    setIsQueued(false);
                    setUrl("");
                    setLogs(["[SYSTEM] Console initialized. Awaiting target URL..."]);
                  }}
                  className="w-full text-xs text-gray-500 hover:text-white transition-colors py-2"
                >
                  Nueva tarea
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass h-full flex flex-col overflow-hidden border-[#10b981]/10 shadow-2xl shadow-[#10b981]/5">
            <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#10b981]" />
                <span className="text-xs font-bold font-mono uppercase tracking-widest">
                  Agent Output Console
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
            </div>
            <div className="flex-1 p-6 font-mono text-[11px] overflow-y-auto space-y-2 bg-black/40">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`flex gap-3 animate-in fade-in slide-in-from-left-1 duration-300 ${
                    log.includes("ERROR")
                      ? "text-red-400"
                      : log.includes("SUCCESS")
                      ? "text-[#10b981]"
                      : "text-gray-400"
                  }`}
                >
                  <span className="opacity-30 shrink-0">{`> `}</span>
                  <span className="break-all">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
