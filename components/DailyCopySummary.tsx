"use client";

import React, { useMemo, useState } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { DailySummary, DailyTotals, LineItem } from "@/types/financial";

interface DailyCopySummaryProps {
  date: string;
  lineItems: LineItem[];
  totals: DailyTotals;
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

export function DailyCopySummary({
  date,
  lineItems,
  totals,
  summary,
}: DailyCopySummaryProps) {
  const [copied, setCopied] = useState(false);

  const ticketDetails = useMemo(() => {
    const details = lineItems
      .filter((item) => item.description.trim() || item.portal_cost)
      .map(
        (item) =>
          `${item.description.trim() || `Ticket ${item.sn}`} = ${money(item.portal_cost)}`
      );
    return details.length ? details.join(", ") : "None";
  }, [lineItems]);

  const summaryText = useMemo(
    () =>
      [
        `Date = ${displayDate(date)}`,
        "",
        `Total Ticket = ${money(totals.total_cash_received)}`,
        `Portal / ticket description (net cost amount) = ${ticketDetails}`,
        `Credit Card Paid = ${money(totals.total_pay_card)}`,
        `Amer/Tahseel Cost = ${money(totals.total_amer_cost)}`,
        `Net Income = ${money(totals.gross_profit)}`,
        `Expense = ${money(summary.expenses)}`,
        `Total Amount = ${money(summary.net_income)}`,
        "",
        "PETTY CASH SUMMARY:",
        `Pre balance = ${money(summary.petty_cash.pre_balance)}`,
        `Current balance = ${money(summary.bank_balance.current_balance)}`,
        `New balance = Pre balance + Total Amount = ${money(summary.petty_cash.new_balance)}`,
        `Net balance = Current balance - New balance = ${money(summary.bank_balance.net_balance)}`,
      ].join("\n"),
    [date, summary, ticketDetails, totals]
  );

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = summaryText;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="surface-card overflow-hidden" aria-labelledby="daily-copy-summary-title">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-600">Ready to share</p>
          <h3 id="daily-copy-summary-title" className="text-base font-bold text-slate-900">
            Daily summary · {displayDate(date)}
          </h3>
        </div>
        <button
          type="button"
          onClick={copySummary}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
        >
          {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy summary"}
        </button>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap bg-slate-50/70 p-5 font-mono text-xs leading-6 text-slate-700 sm:text-sm">
        {summaryText}
      </pre>
    </section>
  );
}
