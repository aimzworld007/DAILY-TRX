"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  Building2,
  Check,
  ClipboardCopy,
  Landmark,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { calculateDailyTotals, DailySummary, LineItem } from "@/types/financial";

interface DailyCopySummaryProps {
  date: string;
  lineItems: LineItem[];
  summary: DailySummary;
}

const money = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function displayDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}

function SummaryRow({ label, value, icon, emphasis = false }: { label: string; value: string; icon?: ReactNode; emphasis?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-4 rounded-xl px-3 py-3 ${emphasis ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/15" : "bg-white/75"}`}>
      <span className={`flex items-center gap-2 text-sm ${emphasis ? "font-bold" : "text-slate-500"}`}>
        {icon}
        {label}
      </span>
      <strong className="shrink-0 tabular-nums">{value}</strong>
    </div>
  );
}

function CopyButton({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/15 px-3.5 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/25"
    >
      {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function DailyCopySummary({ date, lineItems, summary }: DailyCopySummaryProps) {
  const [copiedSection, setCopiedSection] = useState<"main" | "petty" | null>(null);

  const dailyBreakdown = useMemo(() => {
    const totals = calculateDailyTotals(lineItems);
    const tickets = lineItems
      .filter((item) => Number(item.portal_cost) !== 0)
      .map((item) => ({
        label: item.description.trim() || `Ticket ${item.sn}`,
        value: Number(item.portal_cost) || 0,
      }));

    return {
      tickets,
      netTicket: totals.total_portal_cost,
      netCreditCard: totals.total_pay_card,
      netAmer: totals.total_amer_cost,
      grossIncome: totals.gross_profit,
    };
  }, [lineItems]);

  const netIncome = dailyBreakdown.grossIncome - summary.expenses;
  const dailyTotalAmount =
    dailyBreakdown.netTicket + dailyBreakdown.netCreditCard + dailyBreakdown.netAmer + netIncome;
  const dailyPettyCash = summary.petty_cash.pre_balance + dailyTotalAmount;
  const dailyNetBalance = summary.bank_balance.current_balance - dailyPettyCash;

  const mainSummaryText = useMemo(() => {
    const ticketLines = dailyBreakdown.tickets.map(
      (item, index) => `${item.label} = ${money(item.value)}${index < dailyBreakdown.tickets.length - 1 ? "," : ""}`
    );

    return [
      "MAIN SUMMARY:",
      `Date = ${displayDate(date)}`,
      "",
      ...ticketLines,
      ...(ticketLines.length ? [""] : []),
      `Total Net Ticket = ${money(dailyBreakdown.netTicket)}`,
      `Net Credit Card = ${money(dailyBreakdown.netCreditCard)}`,
      `Net Amer/Tahseel Cost = ${money(dailyBreakdown.netAmer)}`,
      `Net Income = ${money(netIncome)}`,
      `Expense = ${money(summary.expenses)}`,
      `Total Amount = ${money(dailyTotalAmount)}`,
    ].join("\n");
  }, [date, dailyBreakdown, dailyTotalAmount, netIncome, summary.expenses]);

  const pettyCashSummaryText = useMemo(
    () =>
      [
        "PETTY CASH SUMMARY:",
        `Current Balance = ${money(summary.petty_cash.pre_balance)}`,
        `Total Amount = ${money(dailyTotalAmount)}`,
        `Petty Cash = ${money(dailyPettyCash)}`,
        "",
        `Current Bank Balance = ${money(summary.bank_balance.current_balance)}`,
        `Net Balance = ${money(dailyNetBalance)}`,
      ].join("\n"),
    [dailyNetBalance, dailyPettyCash, dailyTotalAmount, summary]
  );

  const copySummary = async (section: "main" | "petty", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopiedSection(section);
    window.setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <section aria-labelledby="daily-copy-summary-title">
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Ready to share</p>
        <h3 id="daily-copy-summary-title" className="mt-1 text-xl font-black tracking-tight text-slate-900">
          Daily summaries
        </h3>
        <p className="mt-1 text-sm text-slate-500">Clean, copy-ready figures for {displayDate(date)}</p>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-b from-indigo-50/70 to-white shadow-sm">
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-indigo-700 to-violet-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><ReceiptText className="h-5 w-5" /></span>
              <div><p className="font-black">Main summary</p><p className="text-xs text-indigo-100">{displayDate(date)}</p></div>
            </div>
            <CopyButton copied={copiedSection === "main"} onClick={() => copySummary("main", mainSummaryText)} />
          </header>

          <div className="p-4 sm:p-5">
            <div className="mb-5 overflow-hidden rounded-xl border border-indigo-100 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Ticket details</span>
                <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">{dailyBreakdown.tickets.length} tickets</span>
              </div>
              {dailyBreakdown.tickets.length ? dailyBreakdown.tickets.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
                  <span className="truncate font-mono text-sm font-semibold text-slate-700">{item.label}</span>
                  <strong className="shrink-0 tabular-nums text-slate-900">{money(item.value)}</strong>
                </div>
              )) : <p className="px-4 py-5 text-center text-sm text-slate-400">No ticket entries for this date</p>}
            </div>

            <div className="space-y-2">
              <SummaryRow label="Total Net Ticket" value={money(dailyBreakdown.netTicket)} />
              <SummaryRow label="Net Credit Card" value={money(dailyBreakdown.netCreditCard)} />
              <SummaryRow label="Net Amer/Tahseel Cost" value={money(dailyBreakdown.netAmer)} />
              <SummaryRow label="Net Income" value={money(netIncome)} />
              <SummaryRow label="Expense" value={money(summary.expenses)} />
              <SummaryRow label="Total Amount" value={money(dailyTotalAmount)} icon={<ArrowDownToLine className="h-4 w-4" />} emphasis />
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/70 to-white shadow-sm">
          <header className="flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-700 to-teal-600 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/15"><WalletCards className="h-5 w-5" /></span>
              <div><p className="font-black">Petty cash</p><p className="text-xs text-emerald-100">Balance reconciliation</p></div>
            </div>
            <CopyButton copied={copiedSection === "petty"} onClick={() => copySummary("petty", pettyCashSummaryText)} />
          </header>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700"><WalletCards className="h-4 w-4 text-emerald-600" />Cash position</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-500"><span>Current balance</span><strong className="text-slate-800">{money(summary.petty_cash.pre_balance)}</strong></div>
                <div className="flex justify-between text-slate-500"><span>Total amount</span><strong className="text-slate-800">+ {money(dailyTotalAmount)}</strong></div>
                <div className="flex items-end justify-between border-t border-dashed border-emerald-200 pt-4"><span className="font-bold text-emerald-800">Petty cash</span><strong className="text-xl font-black tabular-nums text-emerald-700">{money(dailyPettyCash)}</strong></div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-900 p-4 text-white shadow-lg shadow-slate-900/10">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold"><Building2 className="h-4 w-4 text-cyan-300" />Bank position</div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-300"><span>Current bank balance</span><strong className="text-white">{money(summary.bank_balance.current_balance)}</strong></div>
                <div className="flex justify-between text-slate-300"><span>Less petty cash</span><strong className="text-white">− {money(dailyPettyCash)}</strong></div>
                <div className="flex items-end justify-between border-t border-dashed border-slate-600 pt-4"><span className="font-bold">Net balance</span><strong className="text-xl font-black tabular-nums text-cyan-300">{money(dailyNetBalance)}</strong></div>
              </div>
            </div>
            <p className="flex items-center justify-center gap-2 text-xs text-slate-400"><Landmark className="h-3.5 w-3.5" />All amounts shown in AED</p>
          </div>
        </article>
      </div>
    </section>
  );
}
