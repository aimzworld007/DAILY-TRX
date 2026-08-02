"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Printer,
  History,
  Sparkles,
  Save,
  Building2,
} from "lucide-react";
import { getTodayDateString } from "@/types/financial";

interface HeaderNavProps {
  selectedDate: string;
  onDateChange: (newDate: string) => void;
  syncStatus: "saved" | "saving" | "error" | "offline";
  lastSavedTime: string | null;
  onOpenHistory: () => void;
  onOpenPrint: () => void;
  onExportCsv: () => void;
  onLoadDemo: () => void;
  onManualSave: () => void;
}

export function HeaderNav({
  selectedDate,
  onDateChange,
  syncStatus,
  lastSavedTime,
  onOpenHistory,
  onOpenPrint,
  onExportCsv,
  onLoadDemo,
  onManualSave,
}: HeaderNavProps) {
  const isToday = selectedDate === getTodayDateString();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between py-3 gap-3">
          {/* Brand & Typing Center Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-md shrink-0 flex items-center justify-center font-bold text-sm tracking-wider w-10 h-10 shadow-xs">
              HR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight uppercase text-white">
                  Daily Trax
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-900/80 text-indigo-200 font-mono font-semibold uppercase border border-indigo-700">
                  Habat Al Rimal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wide">
                HABAT AL RIMAL TYPING • FINANCIAL ARCHITECT v1.4
              </p>
            </div>
          </div>

          {/* Date Picker & Navigation Controls */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-center">
            <div className="flex items-center bg-slate-800 rounded-md p-1 border border-slate-700">
              <button
                type="button"
                onClick={handlePrevDay}
                title="Previous Day"
                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex items-center px-2">
                <CalendarIcon className="w-3.5 h-3.5 text-indigo-400 mr-2 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      onDateChange(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-mono font-semibold text-white focus:outline-hidden cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                title="Next Day"
                className="p-1 rounded hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  type="button"
                  onClick={() => onDateChange(getTodayDateString())}
                  className="ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                >
                  Today
                </button>
              )}
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono">
              {syncStatus === "saving" && (
                <>
                  <CloudUpload className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-slate-300">Saving...</span>
                </>
              )}
              {syncStatus === "saved" && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300">
                    Sync OK {lastSavedTime ? `(${lastSavedTime})` : ""}
                  </span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-300">Sync Err</span>
                </>
              )}
              {syncStatus === "offline" && (
                <>
                  <Cloud className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400">Local Mode</span>
                </>
              )}
            </div>
          </div>

          {/* Toolbar Actions */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={onLoadDemo}
              title="Load sample Typing Center transactions for demo/testing"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-800/80 hover:bg-amber-900/80 transition-colors shrink-0"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              Demo
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              title="View archived records in Firestore"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shrink-0"
            >
              <History className="w-3 h-3 text-slate-400" />
              Archive
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              title="Export ledger to CSV spreadsheet"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shrink-0"
            >
              <FileSpreadsheet className="w-3 h-3 text-slate-400" />
              CSV
            </button>

            <button
              type="button"
              onClick={onOpenPrint}
              title="Print formal daily report & signature ledger"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors shrink-0"
            >
              <Printer className="w-3 h-3 text-slate-400" />
              Print
            </button>

            <button
              type="button"
              onClick={onManualSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs shrink-0"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
