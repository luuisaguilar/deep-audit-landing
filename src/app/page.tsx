"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Zap,
  Database,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Video,
  Globe,
  Search,
  BookOpen,
  Menu,
  X
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import CountUp from "react-countup";
import GalaxyBackground from "@/components/GalaxyBackground";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <main className="min-h-screen text-white relative overflow-x-hidden">
      <GalaxyBackground />
      {/* Background Glows */}
      <div className="emerald-glow-bg top-[-100px] left-[-100px] opacity-30" />
      <div className="emerald-glow-bg bottom-[100px] right-[-100px] opacity-20" />

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5">
        <div className="py-4 px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center">
              <Zap className="text-[#0e1117] w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Deep Audit</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#beneficios" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Beneficios</Link>
            <Link href="#precios" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Precios</Link>
            <Link href="#faq" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">FAQ</Link>
            <Link href="/auth" className="btn-emerald">Sign In</Link>
          </div>

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 px-8 py-4 flex flex-col gap-4 bg-[#0e1117]/95 backdrop-blur-sm">
            <Link href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2">Beneficios</Link>
            <Link href="#precios" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2">Precios</Link>
            <Link href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors py-2">FAQ</Link>
            <Link href="/auth" className="btn-emerald text-center">Sign In</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-sm font-medium text-[#10b981]">Versión 2.0: Emerald Edition</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 max-w-4xl tracking-tight leading-tight">
          Desbloquea el <span className="emerald-text-gradient">Conocimiento Invisible</span> de tu Empresa
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          Transformamos horas de video, documentación y código en un ecosistema semántico autónomo. No más datos perdidos, solo inteligencia ejecutable en Obsidian.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth" className="btn-emerald flex items-center gap-2">
            Empezar ahora <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="#beneficios" className="btn-outline-emerald">Ver demo interactiva</Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 w-full max-w-5xl">
          {[
            { label: "Videos Indexados", value: 1250, suffix: "+" },
            { label: "Tokens Procesados", value: 50, suffix: "M" },
            { label: "Tiempo Ahorrado", value: 85, suffix: "%" },
            { label: "Precisión RAG", value: 99.4, suffix: "%" },
          ].map((stat, idx) => (
            <div key={idx} className="glass p-6 text-center" data-aos="fade-up" data-aos-delay={idx * 100}>
              <h3 className="text-3xl font-bold text-[#10b981]">
                <CountUp end={stat.value} duration={3} decimals={stat.value % 1 !== 0 ? 1 : 0} />
                {stat.suffix}
              </h3>
              <p className="text-gray-500 text-sm mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="beneficios" className="py-32 px-8 bg-black/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Ventajas Corporativas</h2>
            <p className="text-gray-400">Diseñado para líderes que no permiten que el conocimiento se evapore.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 group hover:border-[#10b981]/30 transition-all" data-aos="fade-right">
              <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center mb-6 text-[#10b981]">
                <ShieldCheck />
              </div>
              <h3 className="text-xl font-bold mb-4">Preservación Institucional</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                No permitas que el conocimiento de tus expertos se pierda en silos. Deep Audit crea una base de datos viva y permanente.
              </p>
            </div>

            <div className="glass p-8 group hover:border-[#10b981]/30 transition-all" data-aos="fade-up">
              <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center mb-6 text-[#10b981]">
                <Zap />
              </div>
              <h3 className="text-xl font-bold mb-4">Onboarding Acelerado</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Reduce la curva de aprendizaje de nuevos empleados de semanas a días con una base de conocimiento semántica y consultable.
              </p>
            </div>

            <div className="glass p-8 group hover:border-[#10b981]/30 transition-all" data-aos="fade-left">
              <div className="w-12 h-12 bg-[#10b981]/10 rounded-xl flex items-center justify-center mb-6 text-[#10b981]">
                <Database />
              </div>
              <h3 className="text-xl font-bold mb-4">Ahorro de Costos</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Elimina la duplicidad de esfuerzos y el tiempo perdido buscando información crítica. Todo está a un comando de distancia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="precios" className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Emerald Tiers</h2>
            <p className="text-gray-400">Escala tu inteligencia según tus necesidades.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Explorer */}
            <div className="glass p-8 border border-white/5" data-aos="fade-up">
              <h4 className="text-gray-500 font-bold mb-2">EXPLORER</h4>
              <div className="text-4xl font-bold mb-6">$0 <span className="text-sm font-normal text-gray-500">/mes</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> 1 Agente de voz</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> 5 videos de YouTube /mes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> 100k tokens procesados</li>
                <li className="flex items-center gap-2 opacity-50"><CheckCircle2 className="w-4 h-4" /> DocGrab recursivo</li>
              </ul>
              <Link href="/auth" className="w-full btn-outline-emerald text-sm text-center block">Empezar gratis</Link>
            </div>

            {/* Strategist */}
            <div className="glass p-8 border-2 border-[#10b981] relative transform scale-105 z-10" data-aos="zoom-in">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#10b981] text-[#0e1117] text-[10px] font-black px-3 py-1 rounded-full">MOST POPULAR</div>
              <h4 className="text-[#10b981] font-bold mb-2">STRATEGIST</h4>
              <div className="text-4xl font-bold mb-6">$49 <span className="text-sm font-normal text-gray-500">/mes</span></div>
              <ul className="space-y-4 mb-8 text-sm text-gray-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Multi-agente ilimitado</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> DocGrab recursivo (Sitemaps)</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Supabase Auth Integration</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Soporte prioritario</li>
              </ul>
              <Link href="/auth" className="w-full btn-emerald text-sm text-center block">Suscribirse ahora</Link>
            </div>

            {/* Overlord */}
            <div className="glass p-8 border border-white/5" data-aos="fade-up">
              <h4 className="text-gray-500 font-bold mb-2">OVERLORD</h4>
              <div className="text-4xl font-bold mb-6">Custom</div>
              <ul className="space-y-4 mb-8 text-sm text-gray-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Despliegue en Proxmox local</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> SLA Dedicado</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Personalización total</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#10b981]" /> Cloudflare Tunnel Setup</li>
              </ul>
              <a href="mailto:luisaguilaraguila@gmail.com" className="w-full btn-outline-emerald text-sm text-center block">Contactar ventas</a>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-8 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold">Preguntas Frecuentes</h2>
          </div>
          
          <div className="space-y-6">
            {[
              { q: "¿Es seguro para datos corporativos?", a: "Absolutamente. Si eliges el plan Overlord, los datos nunca salen de tu infraestructura local (Proxmox)." },
              { q: "¿Qué fuentes de datos soporta?", a: "YouTube, GitHub, Documentación Web mediante Sitemaps y archivos locales .txt, .pdf y .md." },
              { q: "¿Cómo se sincroniza con Obsidian?", a: "Generamos una estructura de carpetas compatible con Obsidian que puedes sincronizar mediante Git o Cloud Storage." },
            ].map((item, idx) => (
              <div key={idx} className="glass p-6" data-aos="fade-up">
                <h4 className="text-lg font-bold mb-2 text-[#10b981]">{item.q}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-sm space-y-2">
        <p>&copy; 2026 Deep Audit Knowledge Engine. Desarrollado con cuidado por Antigravity AI.</p>
        <p>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">Aviso de Privacidad</Link>
          {" "}&middot;{" "}
          <Link href="/terms" className="hover:text-gray-400 transition-colors">Terminos de Servicio</Link>
          {" "}&middot;{" "}
          <a href="mailto:luisaguilaraguila@gmail.com" className="hover:text-gray-400 transition-colors">Contacto</a>
        </p>
      </footer>
    </main>
  );
}
