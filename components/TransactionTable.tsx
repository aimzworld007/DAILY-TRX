"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  AlertCircle,
  Banknote,
  CreditCard,
  Globe,
  TrendingUp,
  SlidersHorizontal,
  RotateCcw,
  X,
  WalletCards,
} from "lucide-react";
import { LineItem, DailyTotals } from "@/types/financial";

interface TransactionTableProps {
  lineItems: LineItem[];
  totals: DailyTotals;
  onAddRow: (transaction: Omit<LineItem, "id" | "sn" | "net_profit">) => void;
  onUpdateRow: (id: string, updated: Partial<LineItem>) => void;
  onDeleteRow: (id: string) => void;
  onDuplicateRow: (id: string) => void;
  onMoveRow: (id: string, direction: "up" | "down") => void;
  onClearAll: () => void;
  onRenumberSn: () => void;
}

export function TransactionTable({
  lineItems,
  totals,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onDuplicateRow,
  onMoveRow,
  onClearAll,
  onRenumberSn,
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("add") === "1");
  const [transactionType, setTransactionType] = useState<
    "cash" | "amer" | "pay_card" | "portal"
  >("cash");
  const [description, setDescription] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [serviceCost, setServiceCost] = useState("");

  const receivedAmount = Number(cashReceived) || 0;
  const costAmount = transactionType === "cash" ? 0 : Number(serviceCost) || 0;
  const profitPreview = receivedAmount - costAmount;

  const openAddTransaction = () => {
    setTransactionType("cash");
    setDescription("");
    setCashReceived("");
    setServiceCost("");
    setShowAddTransaction(true);
  };

  const submitTransaction = (event: React.FormEvent) => {
    event.preventDefault();
    if (receivedAmount <= 0) return;

    onAddRow({
      description: description.trim() || `${transactionType === "cash" ? "Cash" : transactionType === "pay_card" ? "Pay Card" : transactionType[0].toUpperCase() + transactionType.slice(1)} transaction`,
      cash_received: receivedAmount,
      amer_cost: transactionType === "amer" ? costAmount : 0,
      pay_card: transactionType === "pay_card" ? costAmount : 0,
      portal_cost: transactionType === "portal" ? costAmount : 0,
      category: transactionType,
    });
    setDescription("");
    setCashReceived("");
    setServiceCost("");
  };

  const filteredItems = lineItems.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.sn).includes(searchTerm)
  );

  return (
    <section>
      <div className="surface-card overflow-hidden">
        {/* Table Toolbar & Search */}
        <div className="p-5 bg-white border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Transactions
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
                {lineItems.length} {lineItems.length === 1 ? "row" : "rows"}
              </span>
            </div>
            <div
              className="text-xs text-slate-500 hidden lg:flex items-center gap-1 bg-white px-2.5 py-1 rounded-md border border-slate-200"
              title="Line Item Formula: Net Profit = Cash Received - (Amer Cost + Pay Card + PORTAL)"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />

            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Search Box */}
            {lineItems.length > 5 && (
              <input
                type="text"
                placeholder="Search description or S.N..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white focus:outline-hidden focus:border-emerald-500 w-full sm:w-48"
              />
            )}

            {/* Renumber S.N */}
            {lineItems.length > 1 && (
              <button
                type="button"
                onClick={onRenumberSn}
                title="Automatically renumber Serial Numbers sequentially"
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                Renumber S.N
              </button>
            )}

            {/* Add New Blank Row Button */}
            <button
              type="button"
              onClick={openAddTransaction}
              className="focus-ring px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>

            {/* Clear All Rows */}
            {lineItems.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                title="Clear all line items"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Clear All Confirmation Alert */}
        {showClearConfirm && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">
              Clear all {lineItems.length} transaction rows from today&apos;s ledger?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-2.5 py-1 rounded-md text-xs bg-white text-slate-700 border border-slate-300 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 rounded-md text-xs bg-rose-600 text-white font-bold"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        )}

        {/* Desktop Spreadsheet Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">S.N</th>
                <th className="p-3 min-w-[240px]">Description</th>
                <th className="p-3 w-28 text-right">
                  <div className="flex items-center justify-end gap-1 text-emerald-700">
                    <TrendingUp className="w-3 h-3" />
                    <span>Cash (+)</span>
                  </div>
                </th>
                <th className="p-3 w-24 text-right">
                  <div className="flex items-center justify-end gap-1 text-rose-600">
                    <Banknote className="w-3 h-3" />
                    <span>Amer (-)</span>
                  </div>
                </th>
                <th className="p-3 w-24 text-right">
                  <div className="flex items-center justify-end gap-1 text-rose-600">
                    <CreditCard className="w-3 h-3" />
                    <span>Pay Card</span>
                  </div>
                </th>
                <th className="p-3 w-24 text-right">
                  <div className="flex items-center justify-end gap-1 text-rose-600">
                    <Globe className="w-3 h-3" />
                    <span>Portal</span>
                  </div>
                </th>
                <th className="p-3 w-28 bg-indigo-50 text-right text-indigo-700 font-bold">Net Profit</th>
                <th className="p-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[11px] font-mono divide-y divide-slate-100 overflow-y-auto">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 font-sans">
                      <SlidersHorizontal className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">
                        {lineItems.length === 0
                          ? "No transactions entered for today yet."
                          : "No transactions match your search filter."}
                      </p>
                      <button
                        type="button"
                        onClick={openAddTransaction}
                        className="mt-1 px-3 py-1.5 rounded text-[11px] font-bold text-white uppercase bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      >
                        + New Line Item
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const isProfitableRow = item.net_profit >= 0;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 group transition-colors"
                    >
                      {/* S.N */}
                      <td className="p-2 text-center text-slate-400 font-mono font-bold">
                        {String(item.sn).padStart(2, "0")}
                      </td>

                      {/* Description Input */}
                      <td className="p-2 font-sans font-medium text-slate-700">
                        <input
                          type="text"
                          value={item.description}
                          placeholder="e.g., Visa Application, Emirates ID, Amer Service..."
                          onChange={(e) =>
                            onUpdateRow(item.id, { description: e.target.value })
                          }
                          className="w-full text-xs font-medium text-slate-900 bg-transparent hover:bg-white focus:bg-white px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden transition-colors"
                        />
                      </td>

                      {/* Cash Received (+) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="any"
                          value={
                            item.cash_received === 0 ? "" : item.cash_received
                          }
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdateRow(item.id, {
                              cash_received: isNaN(val) ? 0 : val,
                            });
                          }}
                          className="w-full text-right font-mono font-bold text-emerald-600 bg-emerald-50/40 hover:bg-emerald-50 focus:bg-white px-2 py-1 rounded border border-transparent hover:border-emerald-200 focus:border-emerald-500 focus:outline-hidden transition-colors"
                        />
                      </td>

                      {/* Amer Cost (-) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="any"
                          value={item.amer_cost === 0 ? "" : item.amer_cost}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdateRow(item.id, {
                              amer_cost: isNaN(val) ? 0 : val,
                            });
                          }}
                          className="w-full text-right font-mono text-rose-500 bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-hidden transition-colors"
                        />
                      </td>

                      {/* Pay Card (-) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="any"
                          value={item.pay_card === 0 ? "" : item.pay_card}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdateRow(item.id, {
                              pay_card: isNaN(val) ? 0 : val,
                            });
                          }}
                          className="w-full text-right font-mono text-rose-500 bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-hidden transition-colors"
                        />
                      </td>

                      {/* PORTAL (-) */}
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          step="any"
                          value={item.portal_cost === 0 ? "" : item.portal_cost}
                          placeholder="0"
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            onUpdateRow(item.id, {
                              portal_cost: isNaN(val) ? 0 : val,
                            });
                          }}
                          className="w-full text-right font-mono text-rose-500 bg-transparent hover:bg-slate-100 focus:bg-white px-2 py-1 rounded border border-transparent hover:border-slate-300 focus:border-rose-500 focus:outline-hidden transition-colors"
                        />
                      </td>

                      {/* Net Profit (=) */}
                      <td className="p-2 text-right font-mono font-bold bg-indigo-50 text-indigo-900">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded ${
                            isProfitableRow
                              ? "text-indigo-900"
                              : "text-rose-700 bg-rose-100/80"
                          }`}
                        >
                          {item.net_profit.toFixed(2)}
                        </span>
                      </td>

                      {/* Row Actions */}
                      <td className="p-2 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onMoveRow(item.id, "up")}
                            disabled={index === 0}
                            title="Move Up"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onMoveRow(item.id, "down")}
                            disabled={index === lineItems.length - 1}
                            title="Move Down"
                            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateRow(item.id)}
                            title="Duplicate row"
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRow(item.id)}
                            title="Delete row"
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* TOTALS FOOTER ROW */}
            {lineItems.length > 0 && (
              <tfoot className="bg-slate-100 border-t-2 border-slate-300 text-[11px] font-mono font-bold">
                <tr>
                  <td
                    colSpan={2}
                    className="p-2 text-right uppercase tracking-wider text-slate-600"
                  >
                    Total Line Values:
                  </td>
                  <td className="p-2 text-right text-slate-900 font-mono">
                    {totals.total_cash_received.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right text-slate-900 font-mono">
                    {totals.total_amer_cost.toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-slate-900 font-mono">
                    {totals.total_pay_card.toFixed(2)}
                  </td>
                  <td className="p-2 text-right text-slate-900 font-mono">
                    {totals.total_portal_cost.toFixed(2)}
                  </td>
                  <td className="p-2 text-right bg-indigo-200 text-indigo-900 font-mono">
                    {totals.total_net_profit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Mobile / Tablet Responsive Card View */}
        <div className="md:hidden divide-y divide-slate-200">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No transactions entered yet. Tap &quot;+ Add Transaction&quot; above.
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={item.id} className="p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                    S.N #{item.sn}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onDuplicateRow(item.id)}
                      className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRow(item.id)}
                      className="p-1.5 rounded-md text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">
                    Service / Description
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    placeholder="Enter description..."
                    onChange={(e) =>
                      onUpdateRow(item.id, { description: e.target.value })
                    }
                    className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-lg border border-slate-300 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">
                      Cash Received (+)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.cash_received === 0 ? "" : item.cash_received}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateRow(item.id, {
                          cash_received: isNaN(val) ? 0 : val,
                        });
                      }}
                      className="w-full text-sm font-extrabold text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Amer Cost (-)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.amer_cost === 0 ? "" : item.amer_cost}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateRow(item.id, {
                          amer_cost: isNaN(val) ? 0 : val,
                        });
                      }}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      Pay Card (-)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.pay_card === 0 ? "" : item.pay_card}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateRow(item.id, {
                          pay_card: isNaN(val) ? 0 : val,
                        });
                      }}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">
                      PORTAL (-)
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={item.portal_cost === 0 ? "" : item.portal_cost}
                      placeholder="0"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onUpdateRow(item.id, {
                          portal_cost: isNaN(val) ? 0 : val,
                        });
                      }}
                      className="w-full text-sm font-semibold text-slate-800 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300 mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500">
                    Net Profit
                  </span>
                  <span className="text-sm font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg">
                    AED {item.net_profit.toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}

          {lineItems.length > 0 && (
            <div className="p-4 bg-slate-100 text-xs font-bold space-y-1">
              <div className="flex justify-between">
                <span>Total Cash Received:</span>
                <span className="text-emerald-800 font-extrabold">
                  AED {totals.total_cash_received.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Costs:</span>
                <span>AED {totals.total_costs.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm pt-1 border-t border-slate-300">
                <span>Total Net Profit:</span>
                <span className="text-emerald-900">
                  AED {totals.total_net_profit.toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-transaction-title"
        >
          <form
            onSubmit={submitTransaction}
            className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between bg-slate-900 px-5 py-4 text-white">
              <div>
                <h2 id="add-transaction-title" className="text-base font-black uppercase tracking-wide">
                  Add Transaction
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  Select how the transaction was processed, then enter the cash received.
                </p>
              </div>
              <button type="button" onClick={() => setShowAddTransaction(false)} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white" aria-label="Close add transaction">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <fieldset>
                <legend className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  1. Transaction type
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {([
                    ["cash", "Cash", Banknote],
                    ["amer", "Amer", WalletCards],
                    ["pay_card", "Pay Card", CreditCard],
                    ["portal", "Portal", Globe],
                  ] as const).map(([value, label, Icon]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setTransactionType(value);
                        setServiceCost("");
                      }}
                      className={`flex min-h-20 flex-col items-center justify-center gap-1.5 rounded-xl border-2 text-xs font-extrabold transition-all ${
                        transactionType === value
                          ? "border-indigo-600 bg-indigo-50 text-indigo-800 ring-2 ring-indigo-100"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="transaction-description" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
                  Description <span className="font-medium normal-case text-slate-400">(optional)</span>
                </label>
                <input id="transaction-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g., Visa application or document service" className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" autoFocus />
              </div>

              <div className={`grid gap-3 ${transactionType === "cash" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                <div>
                  <label htmlFor="cash-received" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-emerald-700">Cash received (+)</label>
                  <div className="flex rounded-xl border border-emerald-300 bg-emerald-50 focus-within:ring-2 focus-within:ring-emerald-100">
                    <span className="px-3 py-2.5 text-xs font-black text-emerald-700">AED</span>
                    <input id="cash-received" type="number" min="0.01" step="0.01" required value={cashReceived} onChange={(event) => setCashReceived(event.target.value)} placeholder="500.00" className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-right font-mono text-lg font-black text-emerald-900 outline-none" />
                  </div>
                </div>
                {transactionType !== "cash" && (
                  <div>
                    <label htmlFor="service-cost" className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-rose-700">{transactionType === "pay_card" ? "Pay Card" : transactionType[0].toUpperCase() + transactionType.slice(1)} cost (-)</label>
                    <div className="flex rounded-xl border border-rose-300 bg-rose-50 focus-within:ring-2 focus-within:ring-rose-100">
                      <span className="px-3 py-2.5 text-xs font-black text-rose-700">AED</span>
                      <input id="service-cost" type="number" min="0" step="0.01" value={serviceCost} onChange={(event) => setServiceCost(event.target.value)} placeholder="200.00" className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-right font-mono text-lg font-black text-rose-900 outline-none" />
                    </div>
                  </div>
                )}
              </div>

              {transactionType === "cash" && (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                  Cash has no direct cost. The full received amount is added to net profit.
                </p>
              )}

              <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Profit preview</span>
                <span className={`font-mono text-xl font-black ${profitPreview >= 0 ? "text-indigo-800" : "text-rose-700"}`}>AED {profitPreview.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-4">
              <button type="button" onClick={() => setShowAddTransaction(false)} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={receivedAmount <= 0} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40">
                <Plus className="h-4 w-4" /> Add Transaction
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
