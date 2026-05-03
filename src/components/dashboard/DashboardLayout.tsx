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
  X,
  CheckCircle2,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

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
  const [inlineResults, setInlineResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Realtime Notifications for Agent completion (L-2)
  useEffect(() => {
    let channel: any;
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      channel = supabase
        .channel('ingestions_status')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'ingestions',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const { new: newRecord, old: oldRecord } = payload;
            
            // Solo notificar si el estado cambió a success o failed
            if (oldRecord.status === 'processing' && (newRecord.status === 'success' || newRecord.status === 'failed')) {
              const id = Date.now();
              const newNotif = {
                id,
                title: newRecord.title || "Agente Finalizado",
                status: newRecord.status,
                type: newRecord.source_type
              };
              
              setNotifications(prev => [newNotif, ...prev]);
              
              // Auto-remover después de 5 segundos
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
              }, 5000);
            }
          }
        )
        .subscribe();
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Debounced search logic for Topbar
  useEffect(() => {
    if (searchQuery.length < 3) {
      setInlineResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const response = await fetch(`${apiUrl}/search/knowledge-base?query=${encodeURIComponent(searchQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setInlineResults(data);
        }
      } catch (err) {
        console.error("Error inline search:", err);
      } finally {
        setLoadingSearch(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
          "w-64 glass flex flex-col border-r border-white/5",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:relative lg:translate-x-0 lg:inset-auto lg:z-auto lg:m-4 lg:mr-0 lg:transition-none"
        )}
        aria-label="Navegación principal"
      >
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
          <Link
            href="/dashboard/sync"
            className="flex items-center gap-3 px-4 w-full text-gray-400 hover:bg-white/5 hover:text-white rounded-xl transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10b981]"
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 w-full text-red-400/70 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
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
          <div className="relative flex-1 max-w-sm lg:max-w-md hidden sm:block group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#10b981] transition-colors" />
            <input
              type="text"
              placeholder="Search knowledge (RAG)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.length > 2) setIsSearching(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  router.push("/dashboard/analytics?q=" + encodeURIComponent(searchQuery.trim()));
                  setIsSearching(false);
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#10b981]/50 transition-all"
            />

            {/* Inline Results Dropdown */}
            {isSearching && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsSearching(false)} 
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#161b22] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] flex flex-col">
                  <div className="p-3 border-b border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Resultados en tiempo real</span>
                    {loadingSearch && <RefreshCw className="w-3 h-3 animate-spin text-[#10b981] mr-2" />}
                  </div>
                  
                  <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {inlineResults.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {inlineResults.map((res: any, idx: number) => (
                          <div 
                            key={idx}
                            className="p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group/item"
                            onClick={() => {
                              router.push("/dashboard/search?q=" + encodeURIComponent(searchQuery));
                              setIsSearching(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center text-[#10b981] shrink-0 group-hover/item:bg-[#10b981] group-hover/item:text-[#0e1117] transition-all">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold truncate text-gray-200 group-hover/item:text-white">{res.source_title}</p>
                                <p className="text-[10px] text-gray-500 truncate">{res.source_path}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !loadingSearch && (
                        <div className="p-8 text-center">
                          <p className="text-sm text-gray-500">No se encontraron fragmentos exactos.</p>
                          <p className="text-[10px] text-gray-600 mt-1">Presiona Enter para una búsqueda profunda.</p>
                        </div>
                      )
                    )}
                  </div>

                  <div 
                    className="p-3 bg-white/5 border-t border-white/5 text-center cursor-pointer hover:bg-[#10b981]/10 transition-colors"
                    onClick={() => {
                      router.push("/dashboard/search?q=" + encodeURIComponent(searchQuery));
                      setIsSearching(false);
                    }}
                  >
                    <span className="text-xs font-bold text-[#10b981]">Ver respuesta completa de IA</span>
                  </div>
                </div>
              </>
            )}
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

      {/* Notifications Overlay (Toasts) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {notifications.map((notif) => (
          <div 
            key={notif.id}
            className={cn(
              "p-4 rounded-2xl shadow-2xl border pointer-events-auto flex items-center gap-4 animate-in slide-in-from-right-4 duration-300",
              notif.status === 'success' 
                ? "bg-[#0e1117]/90 border-[#10b981]/30 backdrop-blur-md" 
                : "bg-[#0e1117]/90 border-red-500/30 backdrop-blur-md"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              notif.status === 'success' ? "bg-[#10b981]/10 text-[#10b981]" : "bg-red-500/10 text-red-500"
            )}>
              {notif.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{notif.title}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-0.5">
                {notif.type} • {notif.status === 'success' ? "Completado" : "Fallido"}
              </p>
            </div>
            <button 
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
              className="text-gray-600 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
