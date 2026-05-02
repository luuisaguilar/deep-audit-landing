"use client";
import React, { useState, useEffect } from "react";
import {
  Plus,
  TrendingUp,
  Zap,
  Video,
  FileText,
  ArrowUpRight,
  Cpu,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Ingestion {
  id: number;
  source_type: string;
  title: string;
  source_url: string;
  status: string;
  processed_at: string;
  prompt_tokens: number;
  completion_tokens: number;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  return `Hace ${Math.floor(hrs / 24)}d`;
}

function cn(...inputs: unknown[]): string {
  return (inputs.filter(Boolean) as string[]).join(" ");
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [ingestions, setIngestions] = useState<Ingestion[]>([]);
  const [stats, setStats] = useState({ total: 0, tokens: 0, activeAgents: 0, successful: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let query = supabase
        .from("ingestions")
        .select("*")
        .order("processed_at", { ascending: false })
        .limit(50);
      if (user) query = query.eq("user_id", user.id);
      const { data } = await query;
      const rows = (data || []) as Ingestion[];
      setIngestions(rows);

      const types = new Set(rows.map((r) => r.source_type));
      const tokens = rows.reduce(
        (s, r) => s + (r.prompt_tokens || 0) + (r.completion_tokens || 0),
        0
      );
      const successful = rows.filter((r) => r.status === "success").length;
      setStats({ total: rows.length, tokens, activeAgents: types.size, successful });
    } finally {
      setLoading(false);
    }
  };

  const recent = ingestions.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold">
          Bienvenido, <span className="emerald-text-gradient">Luis</span>
        </h1>
        <p className="text-gray-500 mt-1">Aqui tienes el resumen de tu ecosistema semantico.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Ingestas", value: stats.total.toLocaleString("es-MX"), sub: "Documentos procesados", icon: TrendingUp },
          { label: "Exitosas", value: stats.successful.toLocaleString("es-MX"), sub: "Completadas sin error", icon: CheckCircle2 },
          { label: "AI Tokens Usados", value: formatTokens(stats.tokens), sub: "Emerald Plan", icon: Zap },
          { label: "Active Agents", value: String(stats.activeAgents), sub: "Tipos de fuente activos", icon: Cpu },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="glass p-6 group hover:border-[#10b981]/20 transition-all cursor-default"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#10b981]/10 rounded-xl text-[#10b981]">
                <stat.icon className="w-5 h-5" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-[#10b981] transition-colors" />
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</div>
            <div className="text-[10px] text-[#10b981] mt-2 font-bold">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="glass p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="text-[#10b981]" /> Ingesta Rapida
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="Pega un link de Video o URL de documentacion..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
              />
            </div>
            <button className="btn-emerald px-10 whitespace-nowrap">Analizar Ahora</button>
          </div>
          <div className="mt-4 flex gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Soporta: YouTube, GitHub, Sitemaps, PDFs</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Actividad Reciente</h2>
            <a href="/dashboard/analytics" className="text-xs text-[#10b981] font-bold hover:underline">
              Ver todo
            </a>
          </div>
          {recent.length === 0 ? (
            <div className="text-center text-gray-600 text-sm py-8">
              No hay actividad aun. Usa cualquier agente para comenzar.
            </div>
          ) : (
            <div className="space-y-6">
              {recent.map((item) => (
                <div key={item.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        item.status === "processing"
                          ? "bg-blue-500/10 text-blue-400 animate-pulse"
                          : "bg-white/5 text-gray-400"
                      )}
                    >
                      {item.source_type === "youtube" || item.source_type === "chef" ? (
                        <Video className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm group-hover:text-[#10b981] transition-colors truncate max-w-xs">
                        {item.title || item.source_url}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-black">
                        {item.source_type}
                        {item.processed_at ? " • " + relativeTime(item.processed_at) : ""}
                      </div>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase shrink-0 ml-4",
                      item.status === "success"
                        ? "bg-[#10b981]/10 text-[#10b981]"
                        : "bg-red-500/10 text-red-400"
                    )}
                  >
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center text-[#10b981]">
            <Cpu className="w-10 h-10 animate-spin-slow" />
          </div>
          <h3 className="font-bold">Knowledge Map</h3>
          <p className="text-xs text-gray-500">Visualiza las conexiones semanticas en 3D.</p>
          <button className="text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:underline">
            Abrir Visualizador
          </button>
        </div>
      </div>
    </div>
  );
}
