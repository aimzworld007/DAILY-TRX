"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  History,
  Calendar,
  Search,
  Trash2,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { DailyRecord } from "@/types/financial";
import { fetchHistoryRecords, removeDailyRecord } from "@/lib/firebase";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  currentDate: string;
}

export function HistoryModal({
  isOpen,
  onClose,
  onSelectDate,
  currentDate,
}: HistoryModalProps) {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  const loadArchive = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHistoryRecords(50);
      setRecords(data);
    } catch (err: any) {
      setError(
        err?.message ||
          "Could not fetch historical records from Firestore. Showing local mode."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(loadArchive, 0);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredRecords = records.filter(
    (r) =>
      r.date.includes(searchTerm) ||
      (r.notes && r.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete daily financial record for ${dateStr}?`)) return;
    setDeletingDate(dateStr);
    try {
      await removeDailyRecord(dateStr);
      setRecords((prev) => prev.filter((r) => r.date !== dateStr));
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("Failed to delete record from cloud.");
    } finally {
      setDeletingDate(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Habat Al Rimal Ledger Archive
              </h3>
              <p className="text-xs text-slate-400">
                Firestore historical daily summaries
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Refresh Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by date YYYY-MM-DD..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500"
            />
          </div>
          <button
            type="button"
            onClick={loadArchive}
            disabled={loading}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Records List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && records.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Loading historical ledger from Cloud Firestore...
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              No saved records found in Firestore for this filter.
            </div>
          ) : (
            filteredRecords.map((record) => {
              const isCurrent = record.date === currentDate;
              const isProfitable = (record.summary?.net_income || 0) >= 0;

              return (
                <div
                  key={record.date}
                  onClick={() => {
                    onSelectDate(record.date);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    isCurrent
                      ? "bg-emerald-50/60 border-emerald-400 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-extrabold text-slate-900">
                        {record.date}
                      </span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(record.date, e)}
                        disabled={deletingDate === record.date}
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* KPI Mini Summary */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">
                        Revenue
                      </span>
                      <span className="font-extrabold text-slate-800">
                        AED {record.totals?.total_cash_received?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">
                        Expenses
                      </span>
                      <span className="font-semibold text-rose-600">
                        AED {record.summary?.expenses?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] uppercase block">
                        Net Income
                      </span>
                      <span
                        className={`font-black ${
                          isProfitable ? "text-emerald-700" : "text-rose-700"
                        }`}
                      >
                        AED {record.summary?.net_income?.toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {record.line_items?.length || 0} transaction rows
                    </span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Load Day <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-center text-xs text-slate-500">
          All data syncs with your Habat Al Rimal Firestore project
        </div>
      </div>
    </div>
  );
}
