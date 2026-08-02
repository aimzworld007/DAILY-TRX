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
  const [copiedSection, setCopiedSection] = useState<"main" | "petty" | null>(null);

  const portalDetails = useMemo(() => {
    const details = lineItems
      .filter((item) => item.category === "portal" || item.portal_cost > 0)
      .map(
        (item) =>
          `${item.description.trim() || `Ticket ${item.sn}`} = ${money(item.portal_cost)}`
      );
    return details.length ? details.join(", ") : "None";
  }, [lineItems]);

  const totalAmount = useMemo(
    () =>
      totals.total_cash_received -
      totals.total_pay_card -
      totals.total_amer_cost -
      totals.total_portal_cost -
      summary.expenses,
    [summary.expenses, totals]
  );

  const mainSummaryText = useMemo(
    () =>
      [
        "MAIN SUMMARY:",
        `Date = ${displayDate(date)}`,
        "",
        `Total Ticket = ${money(totals.total_cash_received)}`,
        `Portal = ${portalDetails}`,
        `Credit Card Paid = ${money(totals.total_pay_card)}`,
        `Amer/Tahseel Cost = ${money(totals.total_amer_cost)}`,
        `Net Income = Total Ticket - Credit Card Paid - Amer/Tahseel Cost - Portal Cost = ${money(totals.gross_profit)}`,
        `Expense = ${money(summary.expenses)}`,
        `Total Amount = Net Income - Expense = ${money(totalAmount)}`,
      ].join("\n"),
    [date, portalDetails, summary.expenses, totalAmount, totals]
  );

  const pettyCashSummaryText = useMemo(
    () =>
      [
        "PETTY CASH SUMMARY:",
        `Pre balance = ${money(summary.petty_cash.pre_balance)}`,
        `Current balance = ${money(summary.bank_balance.current_balance)}`,
        `New balance = Pre balance + Total Amount = ${money(summary.petty_cash.new_balance)}`,
        `Net balance = Current balance - New balance = ${money(summary.bank_balance.net_balance)}`,
      ].join("\n"),
    [summary]
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
      <div className="mb-3">
        <p className="text-xs font-semibold text-indigo-600">Ready to share</p>
        <h3 id="daily-copy-summary-title" className="text-base font-bold text-slate-900">
          Daily summaries · {displayDate(date)}
        </h3>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          { id: "main" as const, title: "Main summary", text: mainSummaryText },
          { id: "petty" as const, title: "Petty cash summary", text: pettyCashSummaryText },
        ].map((section) => (
          <article key={section.id} className="surface-card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
              <h4 className="font-bold text-slate-900">{section.title}</h4>
              <button
                type="button"
                onClick={() => copySummary(section.id, section.text)}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700"
              >
                {copiedSection === section.id ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                {copiedSection === section.id ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap bg-slate-50/70 p-5 font-mono text-xs leading-6 text-slate-700 sm:text-sm">
              {section.text}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
