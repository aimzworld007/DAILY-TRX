"use client";

import React from "react";
import { X, Printer, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { DailyRecord } from "@/types/financial";

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: DailyRecord;
}

export function PrintReportModal({
  isOpen,
  onClose,
  record,
}: PrintReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isProfitable = (record.summary?.net_income || 0) >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Bar (hidden when printing) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Habat Al Rimal Typing • Formal Daily Ledger Report
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE AREA */}
        <div className="p-8 space-y-6 text-slate-900 font-sans print:p-0">
          {/* Company & Header Information */}
          <div className="flex items-start justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-900 text-white rounded-md flex items-center justify-center font-black text-xl tracking-wider">
                HR
              </div>
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
                  Habat Al Rimal Typing & Document Clearing
                </h1>
                <p className="text-xs text-slate-600 font-mono">
                  TRN / REG: UAE-DXB-HABAT-2025 • GENERAL FINANCIAL LEDGER
                </p>
                <p className="text-xs text-slate-500">
                  Amer, Tasheel, Emirates ID, Medical & PRO Clearing Services
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-bold uppercase tracking-wider mb-1">
                Official Daily Statement
              </div>
              <p className="text-sm font-mono font-bold text-slate-900">
                DATE: {record.date}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Report Generated: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* KPI High Level Overview Table */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Total Revenue (+)
              </span>
              <span className="text-base font-bold text-slate-900">
                AED {record.totals.total_cash_received.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Direct Costs (-)
              </span>
              <span className="text-base font-bold text-rose-600">
                AED {record.totals.total_costs.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Daily Expense (-)
              </span>
              <span className="text-base font-bold text-rose-600">
                AED {record.summary.expenses.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">
                Net Daily Income
              </span>
              <span
                className={`text-lg font-black ${
                  isProfitable ? "text-emerald-700" : "text-rose-700"
                }`}
              >
                AED {record.summary.net_income.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Transactions Table */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Transaction Line Items ({record.line_items.length} Entries)
            </h2>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800 text-white font-mono text-[10px] uppercase">
                  <th className="py-2 px-2.5 w-12 text-center border-r border-slate-700">
                    SN
                  </th>
                  <th className="py-2 px-3 border-r border-slate-700">
                    Description
                  </th>
                  <th className="py-2 px-2.5 text-right w-24 border-r border-slate-700">
                    Cash (+)
                  </th>
                  <th className="py-2 px-2.5 text-right w-20 border-r border-slate-700">
                    Amer (-)
                  </th>
                  <th className="py-2 px-2.5 text-right w-20 border-r border-slate-700">
                    Pay Card
                  </th>
                  <th className="py-2 px-2.5 text-right w-20 border-r border-slate-700">
                    Portal
                  </th>
                  <th className="py-2 px-3 text-right w-24 bg-indigo-900">
                    Net Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {record.line_items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-1.5 px-2.5 text-center text-slate-500 font-bold">
                      {String(item.sn).padStart(2, "0")}
                    </td>
                    <td className="py-1.5 px-3 font-sans font-medium text-slate-800">
                      {item.description}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-emerald-700 font-bold">
                      {item.cash_received.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-rose-600">
                      {item.amer_cost.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-rose-600">
                      {item.pay_card.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-2.5 text-right text-rose-600">
                      {item.portal_cost.toFixed(2)}
                    </td>
                    <td className="py-1.5 px-3 text-right font-bold bg-indigo-50/50 text-indigo-900">
                      {item.net_profit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-mono font-bold text-xs">
                <tr>
                  <td
                    colSpan={2}
                    className="py-2 px-3 text-right uppercase tracking-wider text-slate-600"
                  >
                    Total Line Values:
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-900">
                    {record.totals.total_cash_received.toFixed(2)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-900">
                    {record.totals.total_amer_cost.toFixed(2)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-900">
                    {record.totals.total_pay_card.toFixed(2)}
                  </td>
                  <td className="py-2 px-2.5 text-right text-slate-900">
                    {record.totals.total_portal_cost.toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-right bg-indigo-200 text-indigo-950">
                    {record.totals.total_net_profit.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Cash Box & Bank Reconciliation Summary Box */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded border border-slate-300 font-mono text-xs space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-sans">
                1. Petty Cash Box Reconciliation
              </p>
              <div className="flex justify-between">
                <span className="text-slate-600">Pre Balance:</span>
                <span className="font-bold text-slate-800">
                  AED {record.summary.petty_cash.pre_balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Daily Expense (-):</span>
                <span className="text-rose-600">
                  AED {record.summary.expenses.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-1 font-bold">
                <span className="text-slate-800">Petty Cash New Balance:</span>
                <span className="text-indigo-700">
                  AED {record.summary.petty_cash.new_balance.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-300 font-mono text-xs space-y-1.5">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider font-sans">
                2. Bank Account Reconciliation
              </p>
              <div className="flex justify-between">
                <span className="text-slate-600">Current Bank Balance:</span>
                <span className="font-bold text-slate-800">
                  AED {record.summary.bank_balance.current_balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Petty Cash Box (-):</span>
                <span className="text-amber-700">
                  AED {record.summary.petty_cash.new_balance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-1 font-bold">
                <span className="text-slate-800">Net Bank Balance:</span>
                <span className="text-emerald-700">
                  AED {record.summary.bank_balance.net_balance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Signature & Auditing Block */}
          <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-300 text-xs">
            <div className="space-y-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Prepared By (Typing Officer)
              </span>
              <div className="border-b border-slate-400 pb-1 font-mono text-slate-700">
                Sign: ____________________
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Checked By (Accountant)
              </span>
              <div className="border-b border-slate-400 pb-1 font-mono text-slate-700">
                Sign: ____________________
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Approved By (General Manager)
              </span>
              <div className="border-b border-slate-400 pb-1 font-mono text-slate-700">
                Sign: ____________________
              </div>
            </div>
          </div>

          <div className="text-center pt-4 text-[10px] text-slate-400 uppercase font-mono">
            Habat Al Rimal Typing Center • UAE • System Ledger Record #{record.date}
          </div>
        </div>
      </div>
    </div>
  );
}
