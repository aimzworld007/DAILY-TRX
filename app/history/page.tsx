"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, CreditCard, RefreshCw, ReceiptText, Ticket, TrendingUp, WalletCards } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { fetchHistoryRecords } from "@/lib/firebase";
import type { DailyRecord } from "@/types/financial";

export default function HistoryPage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [from, setFrom] = useState(`${currentMonth}-01`);
  const [to, setTo] = useState(() => { const [year, month] = currentMonth.split("-").map(Number); return new Date(year, month, 0).toISOString().slice(0, 10); });
  const [order, setOrder] = useState<"desc"|"asc">("desc");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setNotice("");
    const local = Object.keys(localStorage).filter(k=>k.startsWith("dailytrax_record_")).map(k=>{ try { return JSON.parse(localStorage.getItem(k) || "") as DailyRecord; } catch { return null; } }).filter((r): r is DailyRecord => Boolean(r));
    try { const cloud = await fetchHistoryRecords(200); setRecords(Array.from(new Map([...cloud,...local].map(r=>[r.date,r])).values())); }
    catch { setRecords(local); setNotice("Cloud unavailable — showing this device."); }
    finally { setLoading(false); }
  }, []);
  useEffect(()=>{ const timer=window.setTimeout(load,0); return()=>window.clearTimeout(timer); },[load]);
  const shown = useMemo(()=>records.filter(r=>(!from||r.date>=from)&&(!to||r.date<=to)).sort((a,b)=>order==="desc"?b.date.localeCompare(a.date):a.date.localeCompare(b.date)),[records,from,to,order]);
  const rangeTotals = useMemo(() => shown.reduce((sum, record) => ({
    sales: sum.sales + (record.totals?.total_cash_received || 0),
    tickets: sum.tickets + (record.line_items?.length || 0),
    amer: sum.amer + (record.totals?.total_amer_cost || 0),
    card: sum.card + (record.totals?.total_pay_card || 0),
    profit: sum.profit + (record.summary?.net_income ?? record.totals?.total_net_profit ?? 0),
  }), { sales: 0, tickets: 0, amer: 0, card: 0, profit: 0 }), [shown]);

  return <PageShell eyebrow="Ledger" title="History" description="Browse saved days by date.">
    <div className="surface-card grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end"><DateField label="From" value={from} onChange={setFrom}/><DateField label="To" value={to} onChange={setTo}/><label className="text-xs font-bold text-slate-500">Sort<select value={order} onChange={e=>setOrder(e.target.value as "desc"|"asc")} className="mt-1 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800"><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></label><button onClick={load} title="Refresh history" aria-label="Refresh history" className="focus-ring rounded-xl border border-slate-200 p-3 text-slate-600"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/></button></div>
    <section aria-label="Totals for selected date range" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <RangeMetric label="Total sales" value={rangeTotals.sales} icon={TrendingUp}/><RangeMetric label="Total tickets" value={rangeTotals.tickets} icon={Ticket} money={false}/><RangeMetric label="Total Amer cost" value={rangeTotals.amer} icon={WalletCards}/><RangeMetric label="Total card" value={rangeTotals.card} icon={CreditCard}/><RangeMetric label="Total profit" value={rangeTotals.profit} icon={ReceiptText}/>
    </section>
    {notice&&<p className="mt-3 text-xs font-semibold text-amber-700">{notice}</p>}
    <div className="mt-5 overflow-hidden surface-card">{!loading&&shown.length===0&&<div className="py-16 text-center text-slate-400"><CalendarDays className="mx-auto mb-3 h-8 w-8"/><p className="text-sm font-bold">No saved days</p></div>}{shown.map(record=><Link key={record.date} href={`/transactions?date=${record.date}`} className="grid gap-3 border-b border-slate-100 p-5 last:border-0 hover:bg-slate-50 sm:grid-cols-[1.5fr_repeat(3,1fr)_auto] sm:items-center"><div><p className="font-black">{new Date(`${record.date}T00:00:00`).toLocaleDateString(undefined,{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}</p><p className="text-xs text-slate-400">{record.line_items?.length||0} transactions</p></div><Metric label="Sales" value={record.totals?.total_cash_received}/><Metric label="Costs" value={record.totals?.total_costs}/><Metric label="Net" value={record.summary?.net_income}/><ChevronRight className="h-4 w-4 text-indigo-600"/></Link>)}</div>
  </PageShell>;
}
function DateField({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) { return <label className="text-xs font-bold text-slate-500">{label}<input type="date" value={value} onChange={e=>onChange(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800"/></label>; }
function Metric({label,value}:{label:string;value?:number}) { return <div><p className="text-[10px] font-bold uppercase text-slate-400">{label}</p><p className="text-sm font-black">AED {(value||0).toFixed(2)}</p></div>; }
function RangeMetric({label,value,icon:Icon,money=true}:{label:string;value:number;icon:typeof TrendingUp;money?:boolean}) { return <article className="surface-card p-4"><div className="flex items-center gap-2 text-indigo-600"><Icon className="h-4 w-4"/><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p></div><p className="mt-3 text-xl font-black">{money ? "AED " : ""}{money ? value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2}) : value.toLocaleString()}</p></article>; }
