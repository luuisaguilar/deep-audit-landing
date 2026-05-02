"use client";
export const dynamic = "force-dynamic";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, GitBranch, Globe, Database, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) { setError("Escribe tu email primero."); return; }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setResetSent(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0e1117] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
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
          <h1 className="text-2xl font-bold text-white">
            {isLogin ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {isLogin ? "Accede a tu cerebro digital semántico" : "Empieza a construir tu base de conocimiento"}
          </p>
        </div>

        <div className="glass p-8 relative">
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Contraseña</label>
                {isLogin && <button type="button" onClick={handleForgotPassword} className="text-[10px] text-[#10b981] hover:underline">¿Olvidaste tu contraseña?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#10b981]/50 transition-all"
                />
              </div>
            </div>

            {resetSent && (
              <div className="p-3 bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl text-[#10b981] text-xs text-center">
                Revisa tu email — te enviamos un link para resetear tu contraseña.
              </div>
            )}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-emerald w-full py-4 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#0e1117] px-4 text-gray-600">O continuar con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="glass py-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
              <Globe className="w-4 h-4" /> <span className="text-xs font-bold">Google</span>
            </button>
            <button className="glass py-3 flex items-center justify-center gap-2 hover:bg-white/5 transition-all">
              <GitBranch className="w-4 h-4" /> <span className="text-xs font-bold">GitHub</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500">
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#10b981] font-bold hover:underline"
          >
            {isLogin ? "Regístrate gratis" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </main>
  );
}
