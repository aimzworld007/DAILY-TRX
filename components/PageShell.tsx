"use client";

import { SidebarNav } from "@/components/SidebarNav";

export function PageShell({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return <div className="min-h-screen lg:pl-56"><SidebarNav/><header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="app-shell px-4 sm:px-6 py-6"><p className="text-xs font-bold uppercase tracking-widest text-indigo-600">{eyebrow}</p><h1 className="mt-1 text-3xl font-black text-slate-900">{title}</h1><p className="mt-1 text-sm text-slate-500">{description}</p></div></header><main className="app-shell px-4 sm:px-6 py-7 pb-28 lg:pb-10">{children}</main></div>;
}
