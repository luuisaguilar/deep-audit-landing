"use client";
import React, { useState, useEffect } from "react";
import {
  Rss,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/lib/apiClient";

interface Feed {
  id: number | string;
  url: string;
  name: string;
  articles?: number;
}

export default function RssPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    setFeedsLoading(true);
    try {
      const response = await apiFetch("/rss/feeds");
      if (!response.ok) throw new Error("no feeds");
      const data = await response.json();
      setFeeds(data || []);
    } catch {
      setFeeds([]);
    } finally {
      setFeedsLoading(false);
    }
  };

  const handleAddFeed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setStatus("idle");
    try {
      const response = await apiFetch("/rss/add-feed", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error("Error al agregar el feed");
      setStatus("success");
      setMessage("Feed agregado correctamente!");
      setUrl("");
      loadFeeds();
    } catch (err: unknown) {
      setStatus("error");
      setMessage((err as Error).message || "No se pudo contactar con el Agente Python.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFeed = async (id: number | string) => {
    try {
      const response = await apiFetch("/rss/remove-feed", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Error al eliminar el feed");
      setFeeds(feeds.filter((f) => f.id !== id));
      setStatus("success");
      setMessage("Feed eliminado correctamente.");
    } catch (err: unknown) {
      setStatus("error");
      setMessage((err as Error).message || "No se pudo eliminar el feed.");
    }
  };

  const handleFetchAll = async () => {
    setFetching(true);
    try {
      await apiFetch("/rss/fetch-all", { method: "POST", body: JSON.stringify({}) });
      setStatus("success");
      setMessage("Articulos nuevos procesados y guardados en el Vault.");
    } catch {
      setStatus("error");
      setMessage("Error al procesar los feeds.");
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">
            RSS <span className="emerald-text-gradient">Monitor</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Suscribete a feeds RSS y procesa automaticamente los articulos nuevos.
          </p>
        </div>
        <button
          onClick={handleFetchAll}
          disabled={fetching}
          className="btn-emerald px-6 py-3 flex items-center gap-2 disabled:opacity-50"
        >
          {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Procesar Todos
        </button>
      </div>

      {status !== "idle" && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            status === "success"
              ? "bg-[#10b981]/10 border border-[#10b981]/20 text-[#10b981]"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {status === "success" ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          {message}
        </div>
      )}

      <div className="glass p-8">
        <h2 className="font-bold text-lg mb-4">Agregar Feed RSS</h2>
        <form onSubmit={handleAddFeed} className="flex gap-4">
          <div className="relative flex-1 group">
            <Rss className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://ejemplo.com/feed.xml"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url}
            className="btn-emerald px-8 flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Agregar
          </button>
        </form>
      </div>

      <div className="glass overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="font-bold text-lg">Feeds Activos</h3>
        </div>
        {feedsLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#10b981]" />
          </div>
        ) : feeds.length === 0 ? (
          <div className="p-8 text-center text-gray-600 text-sm">
            No hay feeds configurados. Agrega uno arriba para empezar.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#10b981]/10 rounded-lg flex items-center justify-center">
                    <Rss className="w-4 h-4 text-[#10b981]" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{feed.name || feed.url}</div>
                    <div className="text-[10px] text-gray-500 font-mono">{feed.url}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {feed.articles != null && (
                    <span className="text-xs text-gray-500">{feed.articles} articulos</span>
                  )}
                  <button
                    onClick={() => handleRemoveFeed(feed.id)}
                    className="text-red-400/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Eliminar feed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
