"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDownAZ, ArrowUpAZ, CalendarDays, ChevronRight, RefreshCw, Search } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { fetchHistoryRecords } from "@/lib/firebase";
import type { DailyRecord } from "@/types/financial";

export default function HistoryPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [query, setQuery] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setNotice("");
    const local = Object.keys(localStorage).filter(k=>k.startsWith("dailytrax_record_")).map(k=>{ try { return JSON.parse(localStorage.getItem(k) || "") as DailyRecord; } catch { return null; } }).filter((r): r is DailyRecord => Boolean(r));
    try {
      const cloud = await fetchHistoryRecords(200);
      setRecords(Array.from(new Map([...cloud, ...local].map(r=>[r.date,r])).values()));
    } catch { setRecords(local); setNotice("Cloud history is unavailable. Showing records saved on this device."); }
    finally { setLoading(false); }
  }, []);
  useEffect(()=>{ const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); },[load]);

  const shown = useMemo(()=>records.filter(r=>r.date.includes(query) || r.notes?.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)),[records,query,newestFirst]);

  return <PageShell eyebrow="Ledger records" title="Date-wise history" description="Find, sort and open any saved working day independently from the dashboard.">
    <div className="surface-card p-4 flex flex-col sm:flex-row gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by date (YYYY-MM-DD) or note" className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-500"/></div><button onClick={()=>setNewestFirst(v=>!v)} className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">{newestFirst?<ArrowDownAZ className="h-4 w-4"/>:<ArrowUpAZ className="h-4 w-4"/>}{newestFirst?"Newest first":"Oldest first"}</button><button onClick={load} className="focus-ring rounded-xl border border-slate-200 p-2.5 text-slate-600" title="Refresh"><RefreshCw className={`h-5 w-5 ${loading?"animate-spin":""}`}/></button></div>
    {notice && <p className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">{notice}</p>}
    <div className="mt-5 space-y-3">{!loading && shown.length===0 && <div className="surface-card py-16 text-center text-slate-500"><CalendarDays className="mx-auto mb-3 h-9 w-9 text-slate-300"/><p className="font-bold text-slate-700">No saved days found</p><p className="text-sm">Save a ledger day and it will appear here.</p></div>}{shown.map(record=><Link key={record.date} href={`/?date=${record.date}`} className="surface-card group grid gap-4 p-5 sm:grid-cols-[1.3fr_repeat(3,1fr)_auto] sm:items-center hover:border-indigo-300"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Working day</p><p className="mt-1 font-black text-slate-900">{new Date(`${record.date}T00:00:00`).toLocaleDateString(undefined,{weekday:"short",day:"2-digit",month:"long",year:"numeric"})}</p></div><Metric label="Revenue" value={record.totals?.total_cash_received}/><Metric label="Expenses" value={record.summary?.expenses} negative/><Metric label="Net income" value={record.summary?.net_income}/><span className="flex items-center gap-1 text-sm font-bold text-indigo-600">Open <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1"/></span></Link>)}</div>
  </PageShell>;
}

function Metric({label,value,negative}:{label:string;value?:number;negative?:boolean}) { return <div><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className={`mt-1 text-sm font-black ${negative?"text-rose-600":"text-slate-800"}`}>AED {(value||0).toFixed(2)}</p></div>; }
