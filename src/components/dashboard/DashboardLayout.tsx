"use client";
import React from "react";
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  Settings, 
  LogOut, 
  Search,
  PlusCircle,
  Database
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Aquí iría la lógica de cerrar sesión con Supabase en el futuro
    router.push("/");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Video, label: "Video Analysis", href: "/dashboard/youtube" },
    { icon: FileText, label: "DocGrab", href: "/dashboard/docgrab" },
    { icon: Database, label: "Vault Sync", href: "/dashboard/vault" },
  ];

  return (
    <div className="flex min-h-screen bg-[#0e1117] text-white">
      {/* Sidebar */}
      <aside className="w-64 glass m-4 mr-0 flex flex-col border-r border-white/5">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center">
            <Database className="text-[#0e1117] w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight">Deep Audit</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                pathname === item.href 
                  ? "bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                pathname === item.href ? "text-[#10b981]" : "group-hover:text-white"
              )} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
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
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5">
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
