"use client";
export const dynamic = "force-dynamic";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Supabase maneja el intercambio del code por sesión automáticamente
    // al detectar el hash/query en la URL. Esperamos a que la sesión esté lista.
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setStatus("error");
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    setStatus("idle");

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("success");
      setMessage("Contraseña actualizada correctamente.");
      setTimeout(() => router.push("/dashboard"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-[#0e1117] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#10b981]/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#10b981]/5 blur-[120px] rounded-full" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 bg-[#10b981] rounded-xl flex items-center justify-center shadow-lg shadow-[#10b981]/20 group-hover:scale-110 transition-transform">
              <Database className="text-[#0e1117] w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Deep Audit</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Nueva contraseña</h1>
          <p className="text-gray-500 mt-2 text-sm">Elige una contraseña segura para tu cuenta.</p>
        </div>

        <div className="glass p-8">
          {status === "success" ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-[#10b981]/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-[#10b981]" />
              </div>
              <h2 className="text-lg font-bold">Contraseña actualizada</h2>
              <p className="text-sm text-gray-400">Redirigiendo al dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Nueva contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-600 ml-1">Mínimo 6 caracteres</p>
              </div>

              {status === "error" && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="btn-emerald w-full py-4 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : !sessionReady ? (
                  <span className="text-sm">Verificando enlace...</span>
                ) : (
                  "Guardar nueva contraseña"
                )}
              </button>

              {!sessionReady && (
                <p className="text-xs text-gray-600 text-center">
                  Si este enlace ya expiró,{" "}
                  <Link href="/auth" className="text-[#10b981] hover:underline">
                    solicita uno nuevo
                  </Link>
                  .
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
