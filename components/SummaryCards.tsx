"use client";

import React from "react";
import {
  TrendingUp,
  Receipt,
  Wallet,
  DollarSign,
  PieChart,
} from "lucide-react";
import { DailyTotals, DailySummary } from "@/types/financial";

interface SummaryCardsProps {
  totals: DailyTotals;
  summary: DailySummary;
  expenses: number;
  onExpensesChange: (newExpenses: number) => void;
}

export function SummaryCards({
  totals,
  summary,
  expenses,
  onExpensesChange,
}: SummaryCardsProps) {
  const isProfitable = summary.total_amount >= 0;

  return (
    <section>
      {/* Top 4 KPI Metric Cards in High Density Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* CARD 1: Total Ticket / Revenue */}
        <div className="surface-card p-5 flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 leading-tight">
              Gross Revenue (+)
            </p>
            <TrendingUp className="w-5 h-5 text-emerald-600 bg-emerald-50 p-0.5 rounded" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-slate-900 leading-tight mt-4">
            AED {totals.total_cash_received.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-700 mt-1">
            Sum of all Cash Received
          </p>
        </div>

        {/* CARD 2: Total Direct Costs */}
        <div className="surface-card p-5 flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 leading-tight">
              Direct Costs (-)
            </p>
            <Receipt className="w-5 h-5 text-rose-500 bg-rose-50 p-0.5 rounded" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-rose-600 leading-tight mt-4">
            AED {totals.total_costs.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span>Amer: {totals.total_amer_cost}</span>
            <span>• Card: {totals.total_pay_card}</span>
            <span>• Portal: {totals.total_portal_cost}</span>
          </div>
        </div>

        {/* CARD 3: Gross Profit */}
        <div className="surface-card p-5 flex flex-col justify-between min-h-36">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 leading-tight">
              Gross Profit (=)
            </p>
            <DollarSign className="w-5 h-5 text-indigo-600 bg-indigo-50 p-0.5 rounded" />
          </div>
          <p className="text-2xl font-bold tracking-tight text-indigo-900 leading-tight mt-4">
            AED {totals.gross_profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Revenue − Direct Costs
          </p>
        </div>

        {/* CARD 4: Daily Expenses (Editable in High Density style) */}
        <div className="surface-card p-5 flex flex-col justify-between min-h-36 ring-1 ring-indigo-100">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 leading-tight">
              Daily Expense (-)
            </p>
            <Wallet className="w-5 h-5 text-amber-600 bg-amber-50 p-0.5 rounded" />
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs font-mono font-bold text-slate-400">AED</span>
            <input
              type="number"
              min="0"
              step="any"
              value={expenses === 0 ? "" : expenses}
              placeholder="0.00"
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onExpensesChange(isNaN(val) ? 0 : val);
              }}
              aria-label="Daily expenses in AED"
              className="w-full text-xl font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 focus:bg-white focus:outline-hidden transition-all"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Typing office daily overhead
          </p>
        </div>
      </div>

      {/* Financial Formula Card (High Density Dark Banner) */}
      <div className="rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-stretch md:items-center justify-between shadow-lg shadow-indigo-950/10 border border-indigo-900 gap-5 bg-linear-to-r from-slate-950 to-indigo-950 text-white">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Today’s total amount
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Net Ticket + Credit Card Paid + Amer/Tahseel Cost + Net Income.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-sm border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase">Net Ticket + Card + Amer + Net Income</span>
            <span className="text-indigo-200 font-bold">
              AED {(totals.total_portal_cost + totals.total_pay_card + totals.total_amer_cost + summary.net_income).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-xl border border-white/10">
            <div>
              <span className="font-bold uppercase text-[10px] tracking-widest text-slate-300 block">
                Total Amount
              </span>
              <span
                className={`text-lg sm:text-xl font-bold ${
                  isProfitable
                    ? "text-emerald-400 underline underline-offset-4 decoration-emerald-600"
                    : "text-rose-400 underline underline-offset-4 decoration-rose-600"
                }`}
              >
                AED {summary.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
