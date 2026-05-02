"use client";
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Video,
  FileText,
  Settings,
  LogOut,
  Search,
  Database,
  GitBranch,
  Globe,
  UtensilsCrossed,
  Rss,
  Mic,
  BarChart2,
  BookOpen,
  RefreshCw,
  Menu,
  X
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
      { icon: GitBranch, label: "GitHub", href: "/dashboard/github" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInitial, setUserInitial] = useState("U");
  const [userPlan, setUserPlan] = useState("FREE");
  const [searchQuery, setSearchQuery] = useState("");

  // Cerrar sidebar al cambiar de ruta en mobile
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Cerrar con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Bloquear scroll del body cuando sidebar está abierto en mobile
  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  // Cargar inicial y plan del usuario
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      const email = user?.email || user?.user_metadata?.full_name || "";
      if (email) setUserInitial(email[0].toUpperCase());
      const plan = user?.user_metadata?.plan;
      if (plan) setUserPlan(plan.toUpperCase());
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const SidebarContent = () => (
    <>
      {/* Logo + close button (mobile) */}
      <div className="p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center shrink-0">
            <Database className="text-[#0e1117] w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Deep Audit</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 mb-1.5">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 rounded-xl transition-all group min-h-[44px]",
                    pathname === item.href
                      ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
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

      {/* Footer */}
      <div className="p-3 border-t border-white/5 space-y-0.5 shrink-0">
        <button className="flex items-center gap-3 px-4 w-full text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]">
          <Settings className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 w-full text-red-400/70 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0e1117] text-white overflow-x-hidden">

      {/* Backdrop mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — drawer en mobile, fijo en desktop */}
      <aside
        className={cn(
          // Base
          "w-64 glass flex flex-col border-r border-white/5",
          // Mobile: drawer sobre el contenido
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: en flujo normal, sin transform
          "lg:relative lg:translate-x-0 lg:inset-auto lg:z-auto lg:m-4 lg:mr-0 lg:transition-none"
        )}
        aria-label="Navegación principal"
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 lg:h-20 flex items-center justify-between px-4 lg:px-8 border-b border-white/5 shrink-0 gap-3">

          {/* Hamburger — solo mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-sm lg:max-w-md hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search knowledge..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push("/dashboard/analytics?q=" + encodeURIComponent(searchQuery.trim()));
                  setSearchQuery("");
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
            />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden sm:block bg-[#10b981]/10 text-[#10b981] text-xs font-bold px-3 py-1.5 rounded-full border border-[#10b981]/20 whitespace-nowrap">
              {userPlan}
            </span>
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-tr from-[#10b981] to-[#34d399] border-2 border-[#0e1117] shadow-lg shadow-[#10b981]/20 flex items-center justify-center font-bold text-[#0e1117] text-sm shrink-0">
              {userInitial}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
