"use client";
import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
  Video,
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface Ingestion {
  id: number;
  title: string;
  source_url: string;
  status: string;
  processed_at: string;
}

export default function ChefPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<Ingestion[]>([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from("ingestions")
        .select("id, title, source_url, status, processed_at")
        .eq("source_type", "chef")
        .order("processed_at", { ascending: false })
        .limit(10);
      if (user) query = query.eq("user_id", user.id);
      const { data } = await query;
      setHistory((data || []) as Ingestion[]);
    } finally {
      setHistLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setStatus("idle");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const { data: { user } } = await supabase.auth.getUser();
      const response = await fetch(`${apiUrl}/analyze/chef`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, user_id: user?.id }),
      });
      if (!response.ok) throw new Error("Error en el servidor de agentes");
      setStatus("success");
      setMessage("Receta encolada! El Chef IA esta extrayendo los ingredientes y pasos.");
      setUrl("");
      loadHistory();
    } catch (err: unknown) {
      setStatus("error");
      setMessage((err as Error).message || "No se pudo contactar con el Agente Python.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold">
          Chef <span className="emerald-text-gradient">IA</span>
        </h1>
        <p className="text-gray-500 mt-1">
          Extrae recetas estructuradas de videos de cocina en YouTube.
        </p>
      </div>

      <div className="glass p-8">
        <form onSubmit={handleAnalyze} className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500">
              URL del Video de Cocina
            </label>
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

          <div className="grid grid-cols-3 gap-4 text-center">
            {["Ingredientes", "Pasos estructurados", "Guardado en Vault"].map((feat, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <UtensilsCrossed className="w-6 h-6 text-[#10b981] mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-medium">{feat}</p>
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || !url}
            className="btn-emerald w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <UtensilsCrossed className="w-4 h-4" /> Extraer Receta
              </>
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
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-lg">Recetas Extraidas</h3>
          </div>
          <Link href="/dashboard/analytics" className="text-xs text-[#10b981] font-bold hover:underline">
            Ver todo
          </Link>
        </div>
        {histLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" />
          </div>
        ) : history.length === 0 ? (
          <div className="p-6 text-center text-gray-600 text-sm">
            Las recetas guardadas en tu Vault apareceran aqui.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center group-hover:bg-[#10b981]/10 transition-colors">
                    <UtensilsCrossed className="w-4 h-4 text-gray-400 group-hover:text-[#10b981]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold truncate max-w-xs">
                      {item.title || item.source_url}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-black">
                      {item.processed_at
                        ? new Date(item.processed_at).toLocaleDateString("es-MX")
                        : ""}
                    </div>
                  </div>
                </div>
                <div
                  className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                    item.status === "success"
                      ? "bg-[#10b981]/10 text-[#10b981]"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
