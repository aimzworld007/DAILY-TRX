"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Sparkles,
  ChevronDown,
  HelpCircle,
  AlertCircle,
  Banknote,
  CreditCard,
  Globe,
  TrendingUp,
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";
import {
  LineItem,
  DailyTotals,
  TYPING_SERVICE_PRESETS,
  ServicePreset,
} from "@/types/financial";

interface TransactionTableProps {
  lineItems: LineItem[];
  totals: DailyTotals;
  onAddRow: (preset?: ServicePreset) => void;
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
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredItems = lineItems.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(item.sn).includes(searchTerm)
  );

  return (
    <section className="mt-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar & Search */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Daily Transactions Ledger
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
              <span>
                Net Profit = Cash (+) − [Amer + Card + Portal] (−)
              </span>
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

            {/* Quick Service Presets Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetDropdown(!showPresetDropdown)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                Quick Service Preset
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {showPresetDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 max-h-80 overflow-y-auto">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Habat Al Rimal Typing Presets
                  </div>
                  {TYPING_SERVICE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        onAddRow(preset);
                        setShowPresetDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-emerald-50 text-slate-700 transition-colors flex flex-col gap-0.5 border-b border-slate-100 last:border-none"
                    >
                      <div className="font-bold text-slate-800">
                        {preset.label}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Rev: AED {preset.defaultRevenue}</span>
                        <span>Amer: {preset.defaultAmer}</span>
                        <span>Portal: {preset.defaultPortal}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Blank Row Button */}
            <button
              type="button"
              onClick={() => onAddRow()}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs flex items-center gap-1.5"
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
              Clear all {lineItems.length} transaction rows from today's ledger?
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
            <thead className="sticky top-0 bg-slate-800 text-white text-[10px] uppercase font-semibold">
              <tr>
                <th className="p-2 w-12 border-r border-slate-700 text-center">S.N</th>
                <th className="p-2 border-r border-slate-700 min-w-[240px]">Description</th>
                <th className="p-2 w-28 border-r border-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1 text-emerald-300">
                    <TrendingUp className="w-3 h-3" />
                    <span>Cash (+)</span>
                  </div>
                </th>
                <th className="p-2 w-24 border-r border-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1 text-rose-300">
                    <Banknote className="w-3 h-3" />
                    <span>Amer (-)</span>
                  </div>
                </th>
                <th className="p-2 w-24 border-r border-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1 text-rose-300">
                    <CreditCard className="w-3 h-3" />
                    <span>Pay Card</span>
                  </div>
                </th>
                <th className="p-2 w-24 border-r border-slate-700 text-right">
                  <div className="flex items-center justify-end gap-1 text-rose-300">
                    <Globe className="w-3 h-3" />
                    <span>Portal</span>
                  </div>
                </th>
                <th className="p-2 w-28 bg-indigo-900 text-right text-indigo-100 font-bold">Net Profit</th>
                <th className="p-2 w-24 text-center">Actions</th>
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
                        onClick={() => onAddRow()}
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
    </section>
  );
}
