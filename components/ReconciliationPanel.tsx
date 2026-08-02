"use client";

import React from "react";
import {
  Vault,
  Landmark,
  ArrowRight,
  Minus,
  Equal,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { DailySummary } from "@/types/financial";

interface ReconciliationPanelProps {
  summary: DailySummary;
  onPreBalanceChange: (val: number) => void;
  onCurrentBankBalanceChange: (val: number) => void;
}

export function ReconciliationPanel({
  summary,
  onPreBalanceChange,
  onCurrentBankBalanceChange,
}: ReconciliationPanelProps) {
  return (
    <section className="mt-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight uppercase text-white">
                Cash Box & Bank Account Reconciliation
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Live verification of Petty Cash New Balance & Net Bank Balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-800 px-2.5 py-1 rounded text-indigo-200 border border-slate-700 uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Habat Al Rimal Ledger Standard</span>
          </div>
        </div>

        {/* Two Reconciliation Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 font-mono">
          {/* LEFT: Petty Cash Reconciliation */}
          <div className="p-3 sm:p-4 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
                <Vault className="w-3.5 h-3.5 text-emerald-600" />
                1. Petty Cash Box Formula
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Pre Balance - Daily Expense = New Balance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              {/* Pre Balance Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">
                  Pre Balance
                </label>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-bold text-slate-400 mr-1">AED</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      summary.petty_cash.pre_balance === 0
                        ? ""
                        : summary.petty_cash.pre_balance
                    }
                    placeholder="0.00"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onPreBalanceChange(isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-300 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Minus Daily Expense */}
              <div className="flex flex-col items-center justify-center py-2 sm:py-0 border-t sm:border-t-0 sm:border-l sm:border-r border-slate-100">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase font-sans">
                  <Minus className="w-3 h-3 text-rose-500" />
                  <span>Daily Expense</span>
                </div>
                <div className="text-sm font-bold text-rose-600 mt-1">
                  AED {summary.expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Equals New Petty Cash Balance */}
              <div className="flex flex-col sm:text-right">
                <div className="flex items-center sm:justify-end gap-1 text-slate-500 text-[10px] font-bold uppercase font-sans">
                  <Equal className="w-3 h-3 text-emerald-600" />
                  <span>New Balance</span>
                </div>
                <div className="text-base font-bold text-emerald-700 mt-1">
                  AED {summary.petty_cash.new_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Bank Account Reconciliation */}
          <div className="p-3 sm:p-4 bg-slate-50/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-sans">
                <Landmark className="w-3.5 h-3.5 text-indigo-600" />
                2. Bank Account Formula
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                Current Bank - Petty New Balance = Net Balance
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
              {/* Current Bank Balance Input */}
              <div className="flex flex-col">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-sans">
                  Current Bank
                </label>
                <div className="flex items-center mt-1">
                  <span className="text-xs font-bold text-slate-400 mr-1">AED</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={
                      summary.bank_balance.current_balance === 0
                        ? ""
                        : summary.bank_balance.current_balance
                    }
                    placeholder="0.00"
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      onCurrentBankBalanceChange(isNaN(val) ? 0 : val);
                    }}
                    className="w-full text-sm font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-300 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Minus Petty New Balance */}
              <div className="flex flex-col items-center justify-center py-2 sm:py-0 border-t sm:border-t-0 sm:border-l sm:border-r border-slate-100">
                <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase font-sans">
                  <Minus className="w-3 h-3 text-amber-600" />
                  <span>Petty Cash Box</span>
                </div>
                <div className="text-sm font-bold text-amber-700 mt-1">
                  AED {summary.petty_cash.new_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Equals Net Balance */}
              <div className="flex flex-col sm:text-right">
                <div className="flex items-center sm:justify-end gap-1 text-slate-500 text-[10px] font-bold uppercase font-sans">
                  <Equal className="w-3 h-3 text-indigo-600" />
                  <span>Net Balance</span>
                </div>
                <div className="text-base font-bold text-indigo-900 mt-1">
                  AED {summary.bank_balance.net_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
