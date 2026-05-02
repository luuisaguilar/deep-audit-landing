"use client";
import React from "react";
import { 
  Plus, 
  TrendingUp, 
  Clock, 
  Zap, 
  Video, 
  FileText,
  ArrowUpRight,
  Cpu
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">Bienvenido, <span className="emerald-text-gradient">Luis</span></h1>
        <p className="text-gray-500 mt-1">Aquí tienes el resumen de tu ecosistema semántico.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Knowledge", value: "12,450", sub: "+12% este mes", icon: TrendingUp },
          { label: "Hours Analyzed", value: "458h", sub: "Video & Audio", icon: Clock },
          { label: "AI Tokens Used", value: "1.2M", sub: "Emerald Plan", icon: Zap },
          { label: "Active Agents", value: "3", sub: "24/7 Monitoring", icon: Cpu },
        ].map((stat, idx) => (
          <div key={idx} className="glass p-6 group hover:border-[#10b981]/20 transition-all cursor-default">
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

      {/* Quick Ingest Section */}
      <div className="glass p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#10b981]/5 blur-3xl rounded-full -mr-32 -mt-32" />
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Plus className="text-[#10b981]" /> Ingesta Rápida
          </h2>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Video className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              <input 
                type="text" 
                placeholder="Pega un link de Video o URL de documentación..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
              />
            </div>
            <button className="btn-emerald px-10 whitespace-nowrap">
              Analizar Ahora
            </button>
          </div>
          <div className="mt-4 flex gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            <span>Soporta: YouTube, GitHub, Sitemaps, PDFs</span>
          </div>
        </div>
      </div>

      {/* Recent Activity & Map Placeholder */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8">
          <h2 className="text-xl font-bold mb-6">Actividad Reciente</h2>
          <div className="space-y-6">
            {[
              { type: "Video", name: "Modern Web Architecture 2026", status: "Completed", time: "Hace 10 min" },
              { type: "DocGrab", name: "Tailwind v4 Documentation", status: "Processing", time: "En curso..." },
              { type: "Vault", name: "Sincronización de 12 nuevas notas", status: "Success", time: "Hoy, 9:45 AM" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    item.status === "Processing" ? "bg-blue-500/10 text-blue-400 animate-pulse" : "bg-white/5 text-gray-400"
                  )}>
                    {item.type === "Video" ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm group-hover:text-[#10b981] transition-colors">{item.name}</div>
                    <div className="text-[10px] text-gray-500 uppercase font-black">{item.type} • {item.time}</div>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-black uppercase",
                  item.status === "Completed" || item.status === "Success" ? "bg-[#10b981]/10 text-[#10b981]" : "bg-blue-500/10 text-blue-400"
                )}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-[#10b981]/10 rounded-full flex items-center justify-center text-[#10b981]">
            <Cpu className="w-10 h-10 animate-spin-slow" />
          </div>
          <h3 className="font-bold">Knowledge Map</h3>
          <p className="text-xs text-gray-500">Visualiza las conexiones semánticas en 3D.</p>
          <button className="text-[10px] font-black uppercase tracking-widest text-[#10b981] hover:underline">
            Abrir Visualizador
          </button>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
