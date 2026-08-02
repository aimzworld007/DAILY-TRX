"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { Archive, BarChart3, Clock3, FileText, LayoutDashboard, LogOut, Menu, Settings, WalletCards } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { getFirebaseAuth } from "@/lib/firebase";

const items = [
  { href: "/", label: "Overview", mobile: "Overview", icon: LayoutDashboard },
  { href: "/summary", label: "Summary", mobile: "Summary", icon: BarChart3 },
  { href: "/transactions", label: "Transactions", mobile: "Entries", icon: WalletCards },
  { href: "/history", label: "History", mobile: "History", icon: Clock3 },
  { href: "/archive", label: "Archive", mobile: "Archive", icon: Archive },
  { href: "/reports", label: "Reports", mobile: "Reports", icon: FileText },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);
  const active = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const logout = async () => { await signOut(getFirebaseAuth()); router.replace("/login"); };

  return <>
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-56 flex-col bg-[#11182b] text-white border-r border-white/8">
      <Link href="/" className="flex items-center gap-3 h-20 px-5 border-b border-white/8"><span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-400 to-violet-600 font-black">HR</span><div><p className="font-bold">Daily Trax</p><p className="text-[10px] text-slate-400 uppercase tracking-[.16em]">Workspace</p></div></Link>
      <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Main navigation">
        {items.map(({href,label,icon:Icon}) => <Link key={href} href={href} className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors ${active(href) ? "bg-indigo-500/16 text-indigo-200" : "text-slate-400 hover:bg-white/6 hover:text-white"}`}><Icon className="h-5 w-5"/>{label}</Link>)}
      </nav>
      <div className="p-3 border-t border-white/8">
        <Link href="/settings" className={`focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active("/settings") ? "bg-indigo-500/16 text-indigo-200" : "text-slate-400 hover:text-white"}`}><Settings className="h-5 w-5"/>Settings</Link>
        <div className="mt-2 flex items-center gap-2 rounded-xl bg-white/5 p-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><BarChart3 className="h-4 w-4"/></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.displayName || user?.email}</p><p className="text-[10px] text-slate-500">Signed in</p></div><button onClick={logout} title="Sign out" className="text-slate-500 hover:text-white"><LogOut className="h-4 w-4"/></button></div>
      </div>
    </aside>
    {moreOpen && <button type="button" aria-label="Close more navigation" onClick={() => setMoreOpen(false)} className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden" />}
    {moreOpen && <div className="fixed bottom-24 left-3 right-3 z-50 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl lg:hidden">
      {items.slice(3).map(({href,label,icon:Icon}) => <Link key={href} href={href} onClick={() => setMoreOpen(false)} className={`focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${active(href) ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon className="h-5 w-5"/>{label}</Link>)}
      <Link href="/settings" onClick={() => setMoreOpen(false)} className="focus-ring flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Settings className="h-5 w-5"/>Settings</Link>
    </div>}
    <nav className="lg:hidden fixed bottom-3 left-3 right-3 z-50 grid grid-cols-4 rounded-2xl border border-white/10 bg-[#11182b]/95 p-1.5 text-slate-400 shadow-2xl backdrop-blur-xl" aria-label="Mobile navigation">
      {items.slice(0, 3).map(({href,mobile,icon:Icon}) => <Link key={href} href={href} onClick={() => setMoreOpen(false)} className={`focus-ring flex flex-col items-center gap-1 rounded-xl py-2 ${active(href) ? "bg-indigo-500/15 text-indigo-300" : "hover:text-white"}`}><Icon className="h-5 w-5"/><span className="text-[9px]">{mobile}</span></Link>)}
      <button type="button" aria-expanded={moreOpen} onClick={() => setMoreOpen(open => !open)} className={`focus-ring flex flex-col items-center gap-1 rounded-xl py-2 ${moreOpen || items.slice(3).some(item => active(item.href)) ? "bg-indigo-500/15 text-indigo-300" : "hover:text-white"}`}><Menu className="h-5 w-5"/><span className="text-[9px]">More</span></button>
    </nav>
  </>;
}
