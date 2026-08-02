"use client";

import React from "react";
import {
  Archive,
  BarChart3,
  Clock3,
  FileText,
  LayoutDashboard,
  Settings,
  WalletCards,
} from "lucide-react";

interface SidebarNavProps {
  onOpenHistory: () => void;
  onOpenPrint: () => void;
}

const navItemClass =
  "focus-ring group flex items-center gap-3 rounded-xl text-sm font-semibold transition-colors";

export function SidebarNav({ onOpenHistory, onOpenPrint }: SidebarNavProps) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-56 flex-col bg-[#11182b] text-white border-r border-white/8">
        <div className="flex items-center gap-3 h-20 px-5 border-b border-white/8">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-400 to-violet-600 font-black shadow-lg shadow-indigo-950/40">
            HR
          </div>
          <div>
            <p className="font-bold tracking-tight">Daily Trax</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-[.16em]">Workspace</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Main navigation">
          <button onClick={() => scrollTo("overview")} className={`${navItemClass} w-full px-3 py-3 bg-indigo-500/16 text-indigo-200`}>
            <LayoutDashboard className="h-5 w-5" />
            Overview
          </button>
          <button onClick={() => scrollTo("transactions")} className={`${navItemClass} w-full px-3 py-3 text-slate-400 hover:bg-white/6 hover:text-white`}>
            <WalletCards className="h-5 w-5" />
            Transactions
          </button>
          <button onClick={onOpenHistory} className={`${navItemClass} w-full px-3 py-3 text-slate-400 hover:bg-white/6 hover:text-white`}>
            <Clock3 className="h-5 w-5" />
            History
          </button>
          <button onClick={onOpenHistory} className={`${navItemClass} w-full px-3 py-3 text-slate-400 hover:bg-white/6 hover:text-white`}>
            <Archive className="h-5 w-5" />
            Archive
          </button>
          <button onClick={onOpenPrint} className={`${navItemClass} w-full px-3 py-3 text-slate-400 hover:bg-white/6 hover:text-white`}>
            <FileText className="h-5 w-5" />
            Reports
          </button>
        </nav>

        <div className="p-3 border-t border-white/8">
          <button className={`${navItemClass} w-full px-3 py-3 text-slate-400 hover:bg-white/6 hover:text-white`} title="Settings coming soon">
            <Settings className="h-5 w-5" />
            Settings
          </button>
          <div className="mt-2 flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold">Habat Al Rimal</p>
              <p className="text-[10px] text-slate-500">Typing centre</p>
            </div>
          </div>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 grid grid-cols-5 rounded-2xl border border-white/10 bg-[#11182b]/95 p-1.5 text-slate-400 shadow-2xl backdrop-blur-xl" aria-label="Mobile navigation">
        <button onClick={() => scrollTo("overview")} className="focus-ring flex flex-col items-center gap-1 rounded-xl bg-indigo-500/15 py-2 text-indigo-300" aria-label="Overview"><LayoutDashboard className="h-5 w-5" /><span className="text-[9px]">Home</span></button>
        <button onClick={() => scrollTo("transactions")} className="focus-ring flex flex-col items-center gap-1 rounded-xl py-2 hover:text-white" aria-label="Transactions"><WalletCards className="h-5 w-5" /><span className="text-[9px]">Entries</span></button>
        <button onClick={onOpenHistory} className="focus-ring flex flex-col items-center gap-1 rounded-xl py-2 hover:text-white" aria-label="History"><Clock3 className="h-5 w-5" /><span className="text-[9px]">History</span></button>
        <button onClick={onOpenHistory} className="focus-ring flex flex-col items-center gap-1 rounded-xl py-2 hover:text-white" aria-label="Archive"><Archive className="h-5 w-5" /><span className="text-[9px]">Archive</span></button>
        <button className="focus-ring flex flex-col items-center gap-1 rounded-xl py-2 hover:text-white" aria-label="Settings"><Settings className="h-5 w-5" /><span className="text-[9px]">Settings</span></button>
      </nav>
    </>
  );
}
