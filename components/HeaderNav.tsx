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
  Save,
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
    <header className="sticky top-0 z-40 bg-white/95 text-slate-900 border-b border-slate-200 backdrop-blur-xl">
      <div className="app-shell px-4 sm:px-6">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between min-h-18 py-3 gap-3">
          {/* Brand & Typing Center Title */}
          <div className="flex items-center gap-3 min-w-fit">
            <div className="bg-linear-to-br from-indigo-500 to-violet-700 text-white rounded-xl shrink-0 flex items-center justify-center font-bold text-sm tracking-wider w-10 h-10 shadow-sm shadow-indigo-200">
              HR
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                  Daily Trax
                </h1>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Habat Al Rimal Typing
              </p>
            </div>
          </div>

          {/* Date Picker & Navigation Controls */}
          <div className="order-3 lg:order-none flex items-center gap-2 w-full lg:w-auto justify-center">
            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={handlePrevDay}
                title="Previous Day"
                className="focus-ring p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex items-center px-2">
                <CalendarIcon className="w-4 h-4 text-indigo-600 mr-2 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) {
                      onDateChange(e.target.value);
                    }
                  }}
                  aria-label="Selected ledger date"
                  className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                title="Next Day"
                className="focus-ring p-1.5 rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isToday && (
                <button
                  type="button"
                  onClick={() => onDateChange(getTodayDateString())}
                  className="ml-1 px-2.5 py-1 text-[10px] font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Today
                </button>
              )}
            </div>

            {/* Cloud Sync Status Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] font-medium whitespace-nowrap">
              {syncStatus === "saving" && (
                <>
                  <CloudUpload className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-amber-700">Saving...</span>
                </>
              )}
              {syncStatus === "saved" && (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-700">
                    Saved {lastSavedTime ? `at ${lastSavedTime}` : ""}
                  </span>
                </>
              )}
              {syncStatus === "error" && (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-rose-700">Sync error</span>
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
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={onOpenHistory}
              title="View archived records in Firestore"
              className="focus-ring flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
            >
              <History className="w-3 h-3 text-slate-400" />
              Archive
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              title="Export ledger to CSV spreadsheet"
              className="focus-ring hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              <FileSpreadsheet className="w-3 h-3 text-slate-400" />
              CSV
            </button>

            <button
              type="button"
              onClick={onOpenPrint}
              title="Print formal daily report & signature ledger"
              className="focus-ring hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            >
              <Printer className="w-3 h-3 text-slate-400" />
              Print
            </button>

            <button
              type="button"
              onClick={onManualSave}
              className="focus-ring flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200 shrink-0"
            >
              <Save className="w-3 h-3" />
              Save now
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
