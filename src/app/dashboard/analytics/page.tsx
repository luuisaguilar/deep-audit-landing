"use client";
import React, { useState, useEffect } from "react";
import { BarChart2, TrendingUp, CheckCircle2, XCircle, Clock, Zap, Loader2 } from "lucide-react";
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

interface Stats {
  total: number;
  success: number;
  failed: number;
  total_tokens: number;
  by_type: Record<string, number>;
}

export default function AnalyticsPage() {
  const [ingestions, setIngestions] = useState<Ingestion[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();

      let query = supabase
        .from("ingestions")
        .select("*")
        .order("processed_at", { ascending: false })
        .limit(50);

      if (user) query = query.eq("user_id", user.id);

      const { data, error: err } = await query;
      if (err) throw err;

      const rows = (data || []) as Ingestion[];
      setIngestions(rows);

      const byType: Record<string, number> = {};
      let totalTokens = 0;
      let success = 0;
      let failed = 0;

      for (const r of rows) {
        byType[r.source_type] = (byType[r.source_type] || 0) + 1;
        totalTokens += (r.prompt_tokens || 0) + (r.completion_tokens || 0);
        if (r.status === "success") success++;
        else failed++;
      }

      setStats({ total: rows.length, success, failed, total_tokens: totalTokens, by_type: byType });
    } catch (err: any) {
      setError(err.message || "Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const typeColor: Record<string, string> = {
    youtube: "text-red-400",
    github: "text-purple-400",
    web: "text-blue-400",
    chef: "text-orange-400",
    rss: "text-yellow-400",
    audio: "text-pink-400",
    docgrab: "text-cyan-400",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#10b981]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold"><span className="emerald-text-gradient">Analytics</span></h1>
          <p className="text-gray-500 mt-1">Métricas reales de tu Knowledge Engine desde Supabase.</p>
        </div>
        <button
          onClick={loadData}
          className="text-xs font-bold text-[#10b981] hover:underline flex items-center gap-1"
        >
          <TrendingUp className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Ingestas", value: stats.total, icon: BarChart2, color: "text-[#10b981]" },
            { label: "Exitosas", value: stats.success, icon: CheckCircle2, color: "text-green-400" },
            { label: "Fallidas", value: stats.failed, icon: XCircle, color: "text-red-400" },
            { label: "Tokens Usados", value: stats.total_tokens.toLocaleString(), icon: Zap, color: "text-yellow-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass p-6">
              <div className={`mb-3 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-2xl font-bold">{value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {stats && Object.keys(stats.by_type).length > 0 && (
        <div className="glass p-6">
          <h3 className="font-bold text-lg mb-4">Ingestas por Agente</h3>
          <div className="space-y-3">
            {Object.entries(stats.by_type)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} className="flex items-center gap-4">
                  <span className={`text-xs font-bold uppercase w-20 ${typeColor[type] || "text-gray-400"}`}>
                    {type}
                  </span>
                  <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-[#10b981] rounded-full transition-all"
                      style={{ width: `${(count / stats.total) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="font-bold text-lg">Últimas Ingestas</h3>
        </div>
        {ingestions.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">
            No hay ingestas registradas aún. Comienza usando cualquier agente.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {ingestions.map((item) => (
              <div key={item.id} className="p-4 hover:bg-white/5 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`text-[10px] font-black uppercase px-2 py-1 rounded-full bg-white/5 shrink-0 ${typeColor[item.source_type] || "text-gray-400"}`}>
                    {item.source_type}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate">{item.title || item.source_url}</div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(item.processed_at).toLocaleString("es-MX")}
                      {" · "}{((item.prompt_tokens || 0) + (item.completion_tokens || 0)).toLocaleString()} tokens
                    </div>
                  </div>
                </div>
                <div className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase shrink-0 ml-4 ${
                  item.status === "success"
                    ? "bg-[#10b981]/10 text-[#10b981]"
                    : "bg-red-500/10 text-red-400"
                }`}>
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
