"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Landmark, Receipt, TrendingUp, Wallet } from "lucide-react";
import { DailyCopySummary } from "@/components/DailyCopySummary";
import { PageShell } from "@/components/PageShell";
import { getDailyRecord } from "@/lib/firebase";
import { calculateDailySummary, calculateDailyTotals, getTodayDateString, type DailyRecord, type DailyTotals } from "@/types/financial";

const zeroTotals: DailyTotals = { total_cash_received: 0, total_amer_cost: 0, total_pay_card: 0, total_portal_cost: 0, total_net_profit: 0, total_costs: 0, gross_profit: 0 };

export default function SummaryPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (date: string) => {
    setLoading(true);
    let cached: DailyRecord | null = null;
    try { cached = JSON.parse(localStorage.getItem(`dailytrax_record_${date}`) || "null"); } catch { /* Ignore an invalid local cache. */ }
    try { setRecord((await getDailyRecord(date)) || cached); }
    catch { setRecord(cached); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(() => load(selectedDate), 0); return () => window.clearTimeout(timer); }, [load, selectedDate]);

  const totals = useMemo(() => record?.totals || (record ? calculateDailyTotals(record.line_items || []) : zeroTotals), [record]);
  const summary = useMemo(() => record?.summary || calculateDailySummary(totals, 0, 0, 0), [record, totals]);
  const money = (value: number) => `AED ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const cards = [
    { label: "Gross revenue", value: totals.total_cash_received, note: `${record?.line_items?.length || 0} transactions`, icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50" },
    { label: "Direct costs", value: totals.total_costs, note: "Amer, card & portal", icon: Receipt, tone: "text-rose-600 bg-rose-50" },
    { label: "Gross profit", value: totals.gross_profit, note: "Revenue minus costs", icon: Wallet, tone: "text-indigo-600 bg-indigo-50" },
    { label: "Net income", value: summary.net_income, note: `${money(summary.expenses)} expenses`, icon: Landmark, tone: summary.net_income >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50" },
  ];

  return <PageShell eyebrow="Daily performance" title="Summary" description="Review the complete financial summary for any ledger date.">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><CalendarDays className="h-5 w-5"/></span><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Summary date</p><p className="text-sm font-semibold text-slate-700">Choose a day to review</p></div></div>
      <input type="date" aria-label="Summary date" value={selectedDate} onChange={event => event.target.value && setSelectedDate(event.target.value)} className="focus-ring rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700" />
    </div>

    {loading ? <div className="surface-card p-12 text-center text-sm text-slate-400">Loading summary…</div> : <>
      <section aria-label="Financial summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({label,value,note,icon:Icon,tone}) => <article key={label} className="surface-card p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}><Icon className="h-5 w-5"/></span><p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-2xl font-black tracking-tight">{money(value)}</p><p className="mt-2 text-xs text-slate-500">{note}</p></article>)}
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2">
        <article className="surface-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Petty cash</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Previous balance</span><strong>{money(summary.petty_cash.pre_balance)}</strong></div><div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">New balance</span><strong className="text-indigo-700">{money(summary.petty_cash.new_balance)}</strong></div></div></article>
        <article className="surface-card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bank reconciliation</p><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-slate-500">Current bank balance</span><strong>{money(summary.bank_balance.current_balance)}</strong></div><div className="flex justify-between border-t border-slate-100 pt-3"><span className="text-slate-500">Net balance</span><strong className="text-indigo-700">{money(summary.bank_balance.net_balance)}</strong></div></div></article>
      </section>

      {!record && <p className="mt-5 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">No saved transactions for this date. Summary values are shown as zero.</p>}
      {record && <div className="mt-5"><DailyCopySummary date={selectedDate} lineItems={record.line_items || []} totals={totals} summary={summary}/></div>}
    </>}
  </PageShell>;
}
