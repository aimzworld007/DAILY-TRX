"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Banknote, CalendarDays, CircleHelp, CreditCard, Globe2, ReceiptText, TrendingUp, WalletCards } from "lucide-react";
import { SidebarNav } from "@/components/SidebarNav";
import { OverviewTransactionFab } from "@/components/OverviewTransactionFab";
import { fetchHistoryRecords, getDailyRecord, saveDailyRecord } from "@/lib/firebase";
import { calculateDailySummary, calculateDailyTotals, calculateLineProfit, getTodayDateString, type DailyRecord, type DailyTotals, type LineItem } from "@/types/financial";

const zeroTotals: DailyTotals = { total_cash_received: 0, total_amer_cost: 0, total_pay_card: 0, total_portal_cost: 0, total_net_profit: 0, total_costs: 0, gross_profit: 0 };

export default function OverviewPage() {
  const today = getTodayDateString();
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [recent, setRecent] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let local: DailyRecord | null = null;
    try { const raw = localStorage.getItem(`dailytrax_record_${today}`); local = raw ? JSON.parse(raw) : null; } catch { /* ignore invalid cache */ }
    try {
      const [todayRecord, history] = await Promise.all([getDailyRecord(today), fetchHistoryRecords(6)]);
      setRecord(todayRecord || local);
      setRecent(history.slice(0, 5));
    } catch {
      setRecord(local);
      const cached = Object.keys(localStorage).filter(k => k.startsWith("dailytrax_record_")).map(k => { try { return JSON.parse(localStorage.getItem(k) || "") as DailyRecord; } catch { return null; } }).filter((item): item is DailyRecord => Boolean(item)).sort((a,b) => b.date.localeCompare(a.date));
      setRecent(cached.slice(0, 5));
    } finally { setLoading(false); }
  }, [today]);
  useEffect(() => { const timer = window.setTimeout(load, 0); return () => window.clearTimeout(timer); }, [load]);

  const totals = record?.totals || (record ? calculateDailyTotals(record.line_items || []) : zeroTotals);
  const summary = calculateDailySummary(
    totals,
    record?.summary?.expenses || 0,
    record?.summary?.petty_cash?.pre_balance || 0,
    record?.summary?.bank_balance?.current_balance || 0
  );
  const addTransaction = async (
    values: Omit<LineItem, "id" | "sn" | "net_profit"> | null,
    balances: { expenses: number; preBalance: number; currentBalance: number },
    entryDate: string
  ) => {
    let targetRecord = entryDate === today ? record : null;
    if (!targetRecord) {
      try { const raw = localStorage.getItem(`dailytrax_record_${entryDate}`); targetRecord = raw ? JSON.parse(raw) as DailyRecord : null; } catch { /* ignore invalid cache */ }
      try { targetRecord = await getDailyRecord(entryDate) || targetRecord; } catch { /* use local record */ }
    }
    const lineItems = [...(targetRecord?.line_items || [])];
    if (values) {
      lineItems.push({ ...values, id: `row_${Date.now()}`, sn: lineItems.length + 1, net_profit: calculateLineProfit(values) });
    }
    const nextTotals = calculateDailyTotals(lineItems);
    const savedBalances = values && targetRecord?.summary ? {
      expenses: targetRecord.summary.expenses,
      preBalance: targetRecord.summary.petty_cash.pre_balance,
      currentBalance: targetRecord.summary.bank_balance.current_balance,
    } : balances;
    const nextSummary = calculateDailySummary(nextTotals, savedBalances.expenses, savedBalances.preBalance, savedBalances.currentBalance);
    const nextRecord: DailyRecord = { date: entryDate, line_items: lineItems, totals: nextTotals, summary: nextSummary, created_at: targetRecord?.created_at || new Date().toISOString(), updated_at: new Date().toISOString() };
    if (entryDate === today) setRecord(nextRecord);
    setRecent(current => [nextRecord, ...current.filter(item => item.date !== entryDate)].sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5));
    localStorage.setItem(`dailytrax_record_${entryDate}`, JSON.stringify(nextRecord));
    try { await saveDailyRecord(nextRecord); } catch { /* The local copy is already saved for offline use. */ }
  };
  const ratio = useCallback((value: number) => totals.total_cash_received > 0 ? (value / totals.total_cash_received) * 100 : 0, [totals.total_cash_received]);
  const kpis = useMemo(() => [
    { label: "Total sales", value: totals.total_cash_received, icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50", help: "Total cash received across today's transactions." },
    { label: "Gross profit", value: totals.gross_profit, icon: Banknote, tone: "text-indigo-600 bg-indigo-50", help: "Sales remaining after Amer, card and portal costs." },
    { label: "Amer", value: totals.total_amer_cost, ratio: ratio(totals.total_amer_cost), icon: WalletCards, tone: "text-amber-600 bg-amber-50", help: "Amer cost and its share of total sales." },
    { label: "Card", value: totals.total_pay_card, ratio: ratio(totals.total_pay_card), icon: CreditCard, tone: "text-sky-600 bg-sky-50", help: "Card cost and its share of total sales." },
    { label: "Portal", value: totals.total_portal_cost, ratio: ratio(totals.total_portal_cost), icon: Globe2, tone: "text-violet-600 bg-violet-50", help: "Portal cost and its share of total sales." },
    { label: "Net income", value: summary.net_income, icon: ReceiptText, tone: summary.net_income >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50", help: "Gross profit after daily expenses." },
  ], [ratio, summary.net_income, totals]);

  return <div className="min-h-screen lg:pl-56"><SidebarNav />
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur"><div className="app-shell flex items-center justify-between gap-4 px-4 py-5 sm:px-6"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600"><CalendarDays className="h-4 w-4"/><span>{new Date(`${today}T00:00:00`).toLocaleDateString(undefined,{weekday:"long",day:"numeric",month:"long"})}</span></div><h1 className="mt-1 text-2xl font-black sm:text-3xl">Good day, here&apos;s your ledger</h1><p className="mt-1 hidden text-sm text-slate-500 sm:block">A clear snapshot of today&apos;s sales, costs and balance.</p></div><OverviewTransactionFab onAdd={addTransaction} summary={summary}/></div></header>
    <main className="app-shell px-4 py-6 pb-28 sm:px-6 lg:pb-10">
      <section aria-label="Daily performance" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{loading ? Array.from({length:6},(_,index) => <div key={index} className="surface-card h-40 animate-pulse bg-white p-5"><div className="h-9 w-9 rounded-xl bg-slate-100"/><div className="mt-5 h-3 w-20 rounded bg-slate-100"/><div className="mt-3 h-7 w-36 rounded bg-slate-100"/></div>) : kpis.map(({label,value,ratio:share,icon:Icon,tone,help}) => <article key={label} className="surface-card interactive-card p-5"><div className="flex items-center justify-between"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5"/></span><button type="button" title={help} aria-label={`About ${label}`} className="rounded-full p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"><CircleHelp className="h-4 w-4"/></button></div><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-black tracking-tight">AED {value.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</p>{share !== undefined && <div className="mt-3 flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{width:`${Math.min(share,100)}%`}}/></div><span className="text-xs font-bold text-slate-500">{share.toFixed(1)}%</span></div>}</article>)}</section>
      <section className="mt-6 surface-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-black">Recent activity</h2><p className="mt-0.5 text-xs text-slate-400">Your five latest ledger days</p></div><Link href="/history" className="rounded-lg px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50">View all</Link></div><div className="divide-y divide-slate-100">{loading && Array.from({length:3},(_,index) => <div key={index} className="flex animate-pulse justify-between px-5 py-5"><div className="space-y-2"><div className="h-3 w-28 rounded bg-slate-100"/><div className="h-2 w-20 rounded bg-slate-100"/></div><div className="h-4 w-24 rounded bg-slate-100"/></div>)}{!loading && recent.length===0 && <div className="p-10 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400"><ReceiptText className="h-5 w-5"/></span><p className="mt-3 text-sm font-bold text-slate-600">No saved activity yet</p><p className="mt-1 text-xs text-slate-400">Create your first entry to start today&apos;s ledger.</p></div>}{!loading && recent.map(item => <Link key={item.date} href={`/transactions?date=${item.date}`} className="group flex items-center justify-between gap-4 px-5 py-4 hover:bg-slate-50"><div><p className="text-sm font-bold">{new Date(`${item.date}T00:00:00`).toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"})}</p><p className="text-xs text-slate-400">{item.line_items?.length || 0} transactions</p></div><div className="flex items-center gap-3"><p className="text-right text-sm font-black">AED {(item.totals?.total_cash_received || 0).toFixed(2)}</p><ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-indigo-600"/></div></Link>)}</div></section>
    </main>
  </div>;
}
