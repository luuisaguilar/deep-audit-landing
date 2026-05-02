"use client";
import React from "react";
import {
  LayoutDashboard,
  Video,
  FileText,
  Settings,
  LogOut,
  Search,
  Database,
  Github,
  Globe,
  UtensilsCrossed,
  Rss,
  Mic,
  BarChart2,
  BookOpen,
  RefreshCw
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabase";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const menuSections = [
  {
    label: "General",
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
      { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
      { icon: Search, label: "Buscador RAG", href: "/dashboard/search" },
    ],
  },
  {
    label: "Agentes de Ingesta",
    items: [
      { icon: Video, label: "YouTube", href: "/dashboard/youtube" },
      { icon: Github, label: "GitHub", href: "/dashboard/github" },
      { icon: Globe, label: "Web Scraper", href: "/dashboard/web" },
      { icon: UtensilsCrossed, label: "Chef IA", href: "/dashboard/chef" },
      { icon: Rss, label: "RSS Monitor", href: "/dashboard/rss" },
      { icon: Mic, label: "Audio", href: "/dashboard/audio" },
      { icon: FileText, label: "DocGrab", href: "/dashboard/docgrab" },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { icon: BookOpen, label: "NotebookLM", href: "/dashboard/notebooklm" },
      { icon: RefreshCw, label: "Vault Sync", href: "/dashboard/sync" },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  return (
    <div className="flex min-h-screen bg-[#0e1117] text-white">
      {/* Sidebar */}
      <aside className="w-64 glass m-4 mr-0 flex flex-col border-r border-white/5 overflow-y-auto">
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center">
            <Database className="text-[#0e1117] w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Deep Audit</span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-4">
          {menuSections.map((section) => (
            <div key={section.label}>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-600 px-4 mb-2">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group",
                      pathname === item.href
                        ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      pathname === item.href ? "text-[#10b981]" : "group-hover:text-white"
                    )} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1 shrink-0">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-400/70 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 shrink-0">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search knowledge..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-4 py-2 rounded-full border border-[#10b981]/20">
              PRO PLAN
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#10b981] to-[#34d399] border-2 border-[#0e1117] shadow-lg shadow-[#10b981]/20" />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
