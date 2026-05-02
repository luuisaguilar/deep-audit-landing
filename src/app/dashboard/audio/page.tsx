"use client";
import React, { useState, useRef } from "react";
import { Mic, Upload, CheckCircle2, AlertCircle, Loader2, History, FileAudio } from "lucide-react";

export default function AudioPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped && (dropped.type.startsWith("audio/") || dropped.name.endsWith(".mp3") || dropped.name.endsWith(".wav"))) {
      setFile(dropped);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setStatus("idle");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${apiUrl}/analyze/audio`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Error procesando el audio");
      setStatus("success");
      setMessage(`¡Audio "${file.name}" encolado! El agente está transcribiendo y analizando.`);
      setFile(null);
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
        <h1 className="text-3xl font-bold">Audio <span className="emerald-text-gradient">Analyzer</span></h1>
        <p className="text-gray-500 mt-1">Transcribe y analiza podcasts, entrevistas o cualquier archivo de audio.</p>
      </div>

      <div className="glass p-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-[#10b981]/40 rounded-2xl p-12 text-center cursor-pointer transition-all group"
          >
            <input
              ref={inputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.m4a,.ogg"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="space-y-2">
                <FileAudio className="w-12 h-12 text-[#10b981] mx-auto" />
                <p className="font-bold text-white">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-gray-600 mx-auto group-hover:text-[#10b981] transition-colors" />
                <p className="text-gray-400 font-medium">Arrastra un archivo de audio aquí</p>
                <p className="text-xs text-gray-600">MP3, WAV, M4A, OGG — máx. 100 MB</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="btn-emerald w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <><Mic className="w-4 h-4" /> Analizar Audio</>
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
          <h3 className="font-bold text-lg">Audios Procesados</h3>
        </div>
        <div className="p-6 text-center text-gray-600 text-sm">
          Los audios analizados aparecerán aquí.
        </div>
      </div>
    </div>
  );
}
