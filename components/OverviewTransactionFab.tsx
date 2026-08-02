"use client";

import { useEffect, useState } from "react";
import { Banknote, CreditCard, Globe2, Plus, WalletCards, X } from "lucide-react";
import type { LineItem } from "@/types/financial";

type TransactionType = "cash" | "amer" | "pay_card" | "portal";

export function OverviewTransactionFab({
  onAdd,
}: {
  onAdd: (item: Omit<LineItem, "id" | "sn" | "net_profit">) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<TransactionType>("cash");
  const [description, setDescription] = useState("");
  const [received, setReceived] = useState("");
  const [cost, setCost] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const amount = Number(received) || 0;
  const serviceCost = type === "cash" ? 0 : Number(cost) || 0;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (amount <= 0 || saving) return;
    setSaving(true);
    await onAdd({
      description: description.trim() || `${type === "pay_card" ? "Pay Card" : type[0].toUpperCase() + type.slice(1)} transaction`,
      cash_received: amount,
      amer_cost: type === "amer" ? serviceCost : 0,
      pay_card: type === "pay_card" ? serviceCost : 0,
      portal_cost: type === "portal" ? serviceCost : 0,
      category: type,
    });
    setDescription("");
    setReceived("");
    setCost("");
    setSaving(false);
    setOpen(false);
  };

  return <>
    <button type="button" onClick={() => setOpen(true)} aria-label="Add transaction" className="focus-ring fixed bottom-20 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-indigo-600 px-5 font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-indigo-700 lg:bottom-7 lg:right-7">
      <Plus className="h-5 w-5"/><span className="hidden sm:inline">Add transaction</span>
    </button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="overview-add-title" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex items-start justify-between bg-slate-900 px-5 py-4 text-white"><div><h2 id="overview-add-title" className="font-black">Add transaction</h2><p className="mt-1 text-xs text-slate-300">Enter today&apos;s transaction without leaving Overview.</p></div><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-white/10"><X className="h-5 w-5"/></button></header>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{([ ["cash","Cash",Banknote], ["amer","Amer",WalletCards], ["pay_card","Pay Card",CreditCard], ["portal","Portal",Globe2] ] as const).map(([value,label,Icon]) => <button key={value} type="button" onClick={() => { setType(value); setCost(""); }} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border-2 text-xs font-extrabold ${type === value ? "border-indigo-600 bg-indigo-50 text-indigo-800" : "border-slate-200 text-slate-600"}`}><Icon className="h-5 w-5"/>{label}</button>)}</div>
          <label className="block text-xs font-extrabold uppercase text-slate-600">Description<input autoFocus value={description} onChange={event => setDescription(event.target.value)} placeholder="Ticket or service description" className="mt-1.5 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold normal-case outline-none focus:border-indigo-500"/></label>
          <div className={`grid gap-3 ${type === "cash" ? "" : "sm:grid-cols-2"}`}><label className="text-xs font-extrabold uppercase text-emerald-700">Cash received<input required type="number" min="0.01" step="0.01" value={received} onChange={event => setReceived(event.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-right font-mono text-lg outline-none"/></label>{type !== "cash" && <label className="text-xs font-extrabold uppercase text-rose-700">Service cost<input type="number" min="0" step="0.01" value={cost} onChange={event => setCost(event.target.value)} placeholder="0.00" className="mt-1.5 w-full rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-right font-mono text-lg outline-none"/></label>}</div>
        </div>
        <footer className="flex justify-end gap-2 border-t bg-slate-50 px-5 py-4"><button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold">Cancel</button><button type="submit" disabled={amount <= 0 || saving} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-black text-white disabled:opacity-40">{saving ? "Saving…" : "Add transaction"}</button></footer>
      </form>
    </div>}
  </>;
}
