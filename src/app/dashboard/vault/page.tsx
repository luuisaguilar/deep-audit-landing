"use client";
import React from "react";
import { Database, RefreshCw, Folder, HardDrive, Share2 } from "lucide-react";

import KnowledgeGraph from "@/components/dashboard/KnowledgeGraph";

export default function VaultSyncPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Vault <span className="emerald-text-gradient">Sync</span></h1>
          <p className="text-gray-500 mt-1">Sincroniza tu base de datos semántica con Obsidian y la nube.</p>
        </div>
        <button className="btn-emerald flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Sincronizar Ahora
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-6 flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Folder className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">1,240</div>
            <div className="text-[10px] text-gray-500 font-black uppercase">Notas Generadas</div>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">45.2 MB</div>
            <div className="text-[10px] text-gray-500 font-black uppercase">Espacio en Vault</div>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-4">
          <div className="p-4 bg-[#10b981]/10 text-[#10b981] rounded-2xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold">Connected</div>
            <div className="text-[10px] text-gray-500 font-black uppercase">Obsidian Status</div>
          </div>
        </div>
      </div>

      <div className="glass overflow-hidden relative">
        <div className="absolute top-6 left-8 z-10">
          <h3 className="text-lg font-bold">Semantic Explorer</h3>
          <p className="text-xs text-gray-500">Navega por las conexiones de tu cerebro digital.</p>
        </div>
        <div className="h-[500px]">
          <KnowledgeGraph />
        </div>
        <div className="absolute bottom-6 right-8 z-10 flex gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
            <div className="w-2 h-2 rounded-full bg-[#10b981]" /> YouTube Nodes
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Document Nodes
          </div>
        </div>
      </div>
    </div>
  );
}
