"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Banknote, Check, CreditCard, Globe2, Plus, Scale, WalletCards, X } from "lucide-react";
import { getTodayDateString, type DailySummary, type LineItem } from "@/types/financial";

type TransactionType = "cash" | "amer" | "pay_card" | "portal";
type EntryMode = "transaction" | "reconciliation";

export function OverviewTransactionFab({
  onAdd,
  summary,
}: {
  onAdd: (
    item: Omit<LineItem, "id" | "sn" | "net_profit"> | null,
    balances: { expenses: number; preBalance: number; currentBalance: number },
    date: string
  ) => Promise<void>;
  summary: DailySummary;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<EntryMode>("transaction");
  const [type, setType] = useState<TransactionType>("cash");
  const [description, setDescription] = useState("");
  const [received, setReceived] = useState("");
  const [cost, setCost] = useState("");
  const [expenses, setExpenses] = useState("");
  const [preBalance, setPreBalance] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [entryDate, setEntryDate] = useState(getTodayDateString());

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const amount = Number(received) || 0;
  const serviceCost = type === "cash" ? 0 : Number(cost) || 0;
  const expenseAmount = Number(expenses) || 0;
  const previousAmount = Number(preBalance) || 0;
  const currentAmount = Number(currentBalance) || 0;

  const openPopup = (nextMode: EntryMode) => {
    setEntryDate(getTodayDateString());
    setExpenses(summary.expenses ? String(summary.expenses) : "");
    setPreBalance(summary.petty_cash.pre_balance ? String(summary.petty_cash.pre_balance) : "");
    setCurrentBalance(summary.bank_balance.current_balance ? String(summary.bank_balance.current_balance) : "");
    setMode(nextMode);
    setError("");
    setOpen(true);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    if (mode === "transaction" && amount <= 0) {
      setError("Enter a cash received amount greater than zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onAdd(mode === "transaction" ? {
        description: description.trim() || `${type === "pay_card" ? "Pay Card" : type[0].toUpperCase() + type.slice(1)} transaction`,
        cash_received: amount,
        amer_cost: type === "amer" ? serviceCost : 0,
        pay_card: type === "pay_card" ? serviceCost : 0,
        portal_cost: type === "portal" ? serviceCost : 0,
        category: type,
      } : null,
      { expenses: expenseAmount, preBalance: previousAmount, currentBalance: currentAmount },
      entryDate
      );
      setDescription("");
      setReceived("");
      setCost("");
      setOpen(false);
    } catch {
      setError("We could not save this entry. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return <>
    <div className="flex items-center gap-2" aria-label="Overview actions">
      <button type="button" onClick={() => openPopup("transaction")} className="focus-ring flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700">
        <Plus className="h-5 w-5"/>
        <span className="hidden sm:inline">New entry</span>
      </button>
      <button type="button" onClick={() => openPopup("reconciliation")} aria-label="Daily cash reconciliation" title="Daily cash reconciliation" className="focus-ring grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50">
        <Scale className="h-5 w-5"/>
      </button>
    </div>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="overview-add-title" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="flex items-start justify-between border-b border-slate-100 px-5 py-4"><div className="flex gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">{mode === "transaction" ? <Plus className="h-5 w-5"/> : <Scale className="h-5 w-5"/>}</span><div><h2 id="overview-add-title" className="font-black text-slate-900">{mode === "transaction" ? "New transaction" : "Daily cash reconciliation"}</h2><p className="mt-1 text-xs text-slate-500">{mode === "transaction" ? "Add a ledger entry without leaving Overview." : "Update the day&apos;s cash and bank balances."}</p></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-5 w-5"/></button></header>
        <div className="space-y-4 p-5">
          <label className="block text-xs font-extrabold uppercase text-slate-600">Entry date
            <input type="date" required max={getTodayDateString()} value={entryDate} onChange={event => setEntryDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold normal-case outline-none focus:border-indigo-500"/>
          </label>
          {entryDate < getTodayDateString() && <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-3 text-xs font-bold text-amber-800">Warning: You are entering data for a previous date ({new Date(`${entryDate}T00:00:00`).toLocaleDateString()}). It will update that day&apos;s record.</div>}
          {mode === "transaction" ? <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([ ["cash","Cash",Banknote], ["amer","Amer",WalletCards], ["pay_card","Pay Card",CreditCard], ["portal","Portal",Globe2] ] as const).map(([value,label,Icon]) => <button key={value} type="button" onClick={() => { setType(value); setCost(""); }} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 text-xs font-extrabold ${type === value ? "border-indigo-600 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-600"}`}><Icon className="h-5 w-5"/>{label}</button>)}</div>
          <label className="block text-xs font-extrabold uppercase text-slate-600">Description<input autoFocus value={description} onChange={event => setDescription(event.target.value)} placeholder="Ticket or service description" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold normal-case outline-none focus:border-indigo-500"/></label>
          <div className={`grid gap-3 ${type === "cash" ? "" : "sm:grid-cols-2"}`}><label className="text-xs font-extrabold uppercase text-emerald-700">Cash received<input required type="number" min="0.01" step="0.01" value={received} onChange={event => { setReceived(event.target.value); setError(""); }} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-right font-mono text-lg outline-none focus:ring-3 focus:ring-emerald-100"/></label>{type !== "cash" && <label className="text-xs font-extrabold uppercase text-rose-700">Service cost<input type="number" min="0" step="0.01" value={cost} onChange={event => setCost(event.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-right font-mono text-lg outline-none"/></label>}</div>
          </> : <div><div className="grid gap-3 sm:grid-cols-3">
            <label className="text-xs font-extrabold uppercase text-rose-700">Expense<input type="number" min="0" step="0.01" value={expenses} onChange={event => setExpenses(event.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-right font-mono text-base outline-none focus:border-rose-500"/></label>
            <label className="text-xs font-extrabold uppercase text-slate-600">Pre balance<input type="number" min="0" step="0.01" value={preBalance} onChange={event => setPreBalance(event.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-right font-mono text-base outline-none focus:border-indigo-500"/></label>
            <label className="text-xs font-extrabold uppercase text-emerald-700">Current balance<input type="number" min="0" step="0.01" value={currentBalance} onChange={event => setCurrentBalance(event.target.value)} placeholder="Cash counted" className="mt-1.5 w-full rounded-xl border border-emerald-400 bg-emerald-50 px-3 py-2.5 text-right font-mono text-base font-bold outline-none focus:border-emerald-600"/></label>
          </div><p className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-[11px] font-semibold text-slate-600">New balance = Pre balance + Total balance · Net balance = Current balance − New balance</p></div>}
          {error && <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0"/>{error}</p>}
        </div>
        <footer className="flex justify-end gap-2 border-t bg-slate-50 px-5 py-4"><button type="button" onClick={() => setOpen(false)} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200">Cancel</button><button type="submit" disabled={saving} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-indigo-700 disabled:opacity-40">{!saving && <Check className="h-4 w-4"/>}{saving ? "Saving…" : mode === "transaction" ? "Add transaction" : "Save reconciliation"}</button></footer>
      </form>
    </div>}
  </>;
}
