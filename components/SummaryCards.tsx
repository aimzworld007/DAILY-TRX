"use client";

import React from "react";
import {
  TrendingUp,
  Receipt,
  Wallet,
  DollarSign,
  PieChart,
  Banknote,
  CreditCard,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
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
  const isProfitable = summary.net_income >= 0;

  return (
    <section className="mt-3">
      {/* Top 4 KPI Metric Cards in High Density Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        {/* CARD 1: Total Ticket / Revenue */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight tracking-wider">
              Gross Revenue (+)
            </p>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-mono font-bold text-slate-900 leading-tight mt-1.5">
            AED {totals.total_cash_received.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-mono text-emerald-700 mt-1">
            Sum of all Cash Received
          </p>
        </div>

        {/* CARD 2: Total Direct Costs */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight tracking-wider">
              Direct Costs (-)
            </p>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-mono font-bold text-rose-600 leading-tight mt-1.5">
            AED {totals.total_costs.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-500">
            <span>Amer: {totals.total_amer_cost}</span>
            <span>• Card: {totals.total_pay_card}</span>
            <span>• Portal: {totals.total_portal_cost}</span>
          </div>
        </div>

        {/* CARD 3: Gross Profit */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight tracking-wider">
              Gross Profit (=)
            </p>
            <DollarSign className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-mono font-bold text-indigo-900 leading-tight mt-1.5">
            AED {totals.gross_profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Revenue − Direct Costs
          </p>
        </div>

        {/* CARD 4: Daily Expenses (Editable in High Density style) */}
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-tight tracking-wider">
              Daily Expense (-)
            </p>
            <Wallet className="w-4 h-4 text-rose-500" />
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
              className="w-full text-xl font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-300 focus:border-indigo-600 focus:bg-white focus:outline-hidden transition-colors"
            />
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-1">
            Typing office daily overhead
          </p>
        </div>
      </div>

      {/* Financial Formula Card (High Density Dark Banner) */}
      <div className="bg-slate-900 text-white rounded-lg p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between shadow-lg border border-slate-800 gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Daily Summary Breakdown
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Formula: Net Income = Gross Profit ({totals.gross_profit.toFixed(2)}) − Daily Expense ({summary.expenses.toFixed(2)})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 font-mono text-sm border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase">Gross Profit</span>
            <span className="text-indigo-200 font-bold">
              + AED {totals.gross_profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-slate-400 text-[10px] uppercase">Daily Expenses</span>
            <span className="text-rose-400 font-bold">
              - AED {summary.expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/80 px-4 py-2.5 rounded-lg border border-slate-700">
            <div>
              <span className="font-bold uppercase text-[10px] tracking-widest text-slate-300 block">
                Net Daily Income
              </span>
              <span
                className={`text-lg sm:text-xl font-bold ${
                  isProfitable
                    ? "text-emerald-400 underline underline-offset-4 decoration-emerald-600"
                    : "text-rose-400 underline underline-offset-4 decoration-rose-600"
                }`}
              >
                AED {summary.net_income.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
