"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  LineItem,
  DailyRecord,
  DailyTotals,
  DailySummary,
  getTodayDateString,
  calculateDailyTotals,
  calculateDailySummary,
  createEmptyLineItem,
} from "@/types/financial";
import {
  saveDailyRecord,
  getDailyRecord,
} from "@/lib/firebase";
import { HeaderNav } from "@/components/HeaderNav";
import { SidebarNav } from "@/components/SidebarNav";
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionTable } from "@/components/TransactionTable";
import { ReconciliationPanel } from "@/components/ReconciliationPanel";
import { PrintReportModal } from "@/components/PrintReportModal";
import { DailyCopySummary } from "@/components/DailyCopySummary";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function TransactionsPage() {
  // 1. Current Selected Date (default: today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    if (typeof window === "undefined") return getTodayDateString();
    const requestedDate = new URLSearchParams(window.location.search).get("date");
    return requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) ? requestedDate : getTodayDateString();
  });

  // 2. Core Financial State
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [expenses, setExpenses] = useState<number>(0);
  const [preBalance, setPreBalance] = useState<number>(1200);
  const [currentBankBalance, setCurrentBankBalance] = useState<number>(0);

  // 3. UI & Modal states
  const [syncStatus, setSyncStatus] = useState<"saved" | "saving" | "error" | "offline">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [hydratedDate, setHydratedDate] = useState<string | null>(null);
  const loadRequestRef = useRef(0);
  const editVersionRef = useRef(0);

  const markEdited = useCallback(() => {
    editVersionRef.current += 1;
  }, []);

  // 4. Calculate real-time financial formulas & totals
  const totals: DailyTotals = useMemo(
    () => calculateDailyTotals(lineItems),
    [lineItems]
  );

  const summary: DailySummary = useMemo(
    () => calculateDailySummary(totals, expenses, preBalance, currentBankBalance),
    [totals, expenses, preBalance, currentBankBalance]
  );

  const currentRecord: DailyRecord = useMemo(
    () => ({
      id: selectedDate,
      date: selectedDate,
      line_items: lineItems,
      totals,
      summary,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }),
    [selectedDate, lineItems, totals, summary]
  );

  // 5. Load Record for Selected Date (from Firestore or fallback to localStorage)
  const loadRecordForDate = useCallback(async (dateStr: string) => {
    const requestId = ++loadRequestRef.current;
    const editVersionAtStart = editVersionRef.current;
    setHydratedDate(null);

    const canApplyLoadedRecord = () =>
      requestId === loadRequestRef.current &&
      editVersionAtStart === editVersionRef.current;

    const finishLoading = () => {
      if (requestId === loadRequestRef.current) {
        setHydratedDate(dateStr);
      }
    };

    try {
      setSyncStatus("saving");
      const remoteRecord = await getDailyRecord(dateStr);

      if (remoteRecord) {
        if (canApplyLoadedRecord()) {
          setLineItems(remoteRecord.line_items || []);
          setExpenses(remoteRecord.summary?.expenses || 0);
          setPreBalance(remoteRecord.summary?.petty_cash?.pre_balance ?? 0);
          setCurrentBankBalance(
            remoteRecord.summary?.bank_balance?.current_balance ?? 0
          );
        }
        finishLoading();
        setSyncStatus("saved");
        return;
      }

      // Check localStorage fallback
      const localKey = `dailytrax_record_${dateStr}`;
      const cached = localStorage.getItem(localKey);
      if (cached) {
        try {
          const parsed: DailyRecord = JSON.parse(cached);
          if (canApplyLoadedRecord()) {
            setLineItems(parsed.line_items || []);
            setExpenses(parsed.summary?.expenses || 0);
            setPreBalance(parsed.summary?.petty_cash?.pre_balance ?? 0);
            setCurrentBankBalance(
              parsed.summary?.bank_balance?.current_balance ?? 0
            );
          }
          finishLoading();
          setSyncStatus("saved");
          return;
        } catch {
          // ignore invalid json
        }
      }

      // Otherwise initialize a fresh day; transactions are added through the popup.
      if (canApplyLoadedRecord()) {
        setLineItems([]);
        setExpenses(0);
        setPreBalance(1200);
        setCurrentBankBalance(0);
      }
      finishLoading();
      setSyncStatus("saved");
    } catch (error) {
      console.warn("Firestore offline or inaccessible, switching to Local Mode:", error);
      setSyncStatus("offline");
      // Check localStorage fallback
      const localKey = `dailytrax_record_${dateStr}`;
      const cached = localStorage.getItem(localKey);
      if (cached) {
        try {
          const parsed: DailyRecord = JSON.parse(cached);
          if (canApplyLoadedRecord()) {
            setLineItems(parsed.line_items || []);
            setExpenses(parsed.summary?.expenses || 0);
            setPreBalance(parsed.summary?.petty_cash?.pre_balance ?? 0);
            setCurrentBankBalance(
              parsed.summary?.bank_balance?.current_balance ?? 0
            );
          }
          finishLoading();
          return;
        } catch {
          // ignore
        }
      }
      if (canApplyLoadedRecord()) {
        setLineItems([]);
        setExpenses(0);
        setPreBalance(1200);
        setCurrentBankBalance(0);
      }
      finishLoading();
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => loadRecordForDate(selectedDate), 0);
    return () => window.clearTimeout(timer);
  }, [selectedDate, loadRecordForDate]);

  // 6. Save current record to Firestore + localStorage
  const saveCurrentRecord = useCallback(
    async (showNotify = false) => {
      const recordToSave = {
        ...currentRecord,
        updated_at: new Date().toISOString(),
      };

      // Always update localStorage fallback immediately
      try {
        localStorage.setItem(
          `dailytrax_record_${selectedDate}`,
          JSON.stringify(recordToSave)
        );
      } catch (err) {
        console.error("Local storage error:", err);
      }

      try {
        setSyncStatus("saving");
        await saveDailyRecord(recordToSave);
        setSyncStatus("saved");
        const nowTime = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        setLastSavedTime(nowTime);
        if (showNotify) {
          setNotification({
            type: "success",
            message: `Ledger for ${selectedDate} saved to Firestore cloud successfully.`,
          });
        }
      } catch (error) {
        console.warn("Save failed, stored locally:", error);
        setSyncStatus("offline");
        if (showNotify) {
          setNotification({
            type: "success",
            message: `Saved locally (Offline Mode active for ${selectedDate}).`,
          });
        }
      }
    },
    [currentRecord, selectedDate]
  );

  // Debounced Auto-save when items change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hydratedDate === selectedDate) {
        saveCurrentRecord(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [lineItems, expenses, preBalance, currentBankBalance, hydratedDate, selectedDate, saveCurrentRecord]);

  // Auto hide notification
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // 7. CRUD Operations for Line Items
  const handleAddRow = (
    transaction: Omit<LineItem, "id" | "sn" | "net_profit">
  ) => {
    markEdited();
    const nextSN = lineItems.length + 1;
    const newRow = {
      ...createEmptyLineItem(nextSN),
      ...transaction,
      net_profit: Number(
        (
          transaction.cash_received -
          (transaction.amer_cost + transaction.pay_card + transaction.portal_cost)
        ).toFixed(2)
      ),
    };
    setLineItems((prev) => [...prev, newRow]);
  };

  const handleUpdateRow = (id: string, updates: Partial<LineItem>) => {
    markEdited();
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        const cash = Number(updated.cash_received) || 0;
        const amer = Number(updated.amer_cost) || 0;
        const card = Number(updated.pay_card) || 0;
        const portal = Number(updated.portal_cost) || 0;
        const profit = Number((cash - (amer + card + portal)).toFixed(2));
        return {
          ...updated,
          cash_received: cash,
          amer_cost: amer,
          pay_card: card,
          portal_cost: portal,
          net_profit: profit,
        };
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    markEdited();
    setLineItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      // re-index serial numbers
      return filtered.map((item, idx) => ({
        ...item,
        sn: idx + 1,
      }));
    });
  };

  const handleDuplicateRow = (id: string) => {
    markEdited();
    setLineItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;
      const nextSN = prev.length + 1;
      const copy: LineItem = {
        ...target,
        id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sn: nextSN,
      };
      return [...prev, copy];
    });
  };

  const handleMoveRow = (id: string, direction: "up" | "down") => {
    markEdited();
    setLineItems((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.length - 1) return prev;

      const newItems = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      const [moved] = newItems.splice(index, 1);
      newItems.splice(targetIndex, 0, moved);

      return newItems.map((item, idx) => ({
        ...item,
        sn: idx + 1,
      }));
    });
  };

  const handleRenumberSn = () => {
    markEdited();
    setLineItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        sn: idx + 1,
      }))
    );
  };

  const handleClearAllRows = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all transactions for this day? This cannot be undone."
      )
    ) {
      markEdited();
      setLineItems([]);
      setExpenses(0);
    }
  };

  // 9. CSV Export Utility
  const handleExportCsv = () => {
    if (lineItems.length === 0) return;

    const headers = [
      "SN",
      "Description",
      "Cash Received (+)",
      "Amer Cost (-)",
      "Pay Card (-)",
      "Portal Cost (-)",
      "Net Profit (=)",
    ];

    const rows = lineItems.map((item) => [
      item.sn,
      `"${item.description.replace(/"/g, '""')}"`,
      item.cash_received.toFixed(2),
      item.amer_cost.toFixed(2),
      item.pay_card.toFixed(2),
      item.portal_cost.toFixed(2),
      item.net_profit.toFixed(2),
    ]);

    // Footer row with totals
    rows.push([
      "",
      '"TOTALS"',
      totals.total_cash_received.toFixed(2),
      totals.total_amer_cost.toFixed(2),
      totals.total_pay_card.toFixed(2),
      totals.total_portal_cost.toFixed(2),
      totals.total_net_profit.toFixed(2),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `DailyTrax_HabatAlRimal_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen text-slate-900 font-sans antialiased lg:pl-56">
      <SidebarNav />
      {/* 1. TOP STICKY HEADER & TOOLBAR */}
      <HeaderNav
        selectedDate={selectedDate}
        onDateChange={(newDate) => setSelectedDate(newDate)}
        syncStatus={syncStatus}
        lastSavedTime={lastSavedTime}
        onOpenPrint={() => setIsPrintOpen(true)}
        onExportCsv={handleExportCsv}
        onManualSave={() => saveCurrentRecord(true)}
      />

      {/* NOTIFICATION TOAST (if active) */}
      {notification && (
        <div className="app-shell px-4 sm:px-6 w-full pt-3">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border shadow-sm text-xs font-semibold ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-rose-50 text-rose-900 border-rose-300"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* 2. MAIN LEDGER WORKSPACE */}
      <main className="app-shell px-4 sm:px-6 w-full pb-24 lg:pb-12 space-y-5">
        <div className="pt-7 pb-1 flex items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-indigo-600 mb-1">Daily ledger</p>
            <h2 className="text-2xl sm:text-[28px] font-bold tracking-tight text-slate-900">Transactions</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Auto-save
          </div>
        </div>
        {/* KPI Summary Cards & Daily Formula Breakdown Banner */}
        <SummaryCards
          totals={totals}
          summary={summary}
          expenses={expenses}
          onExpensesChange={(newExp) => {
            markEdited();
            setExpenses(newExp);
          }}
        />

        <DailyCopySummary
          date={selectedDate}
          lineItems={lineItems}
          totals={totals}
          summary={summary}
        />

        {/* Transaction Spreadsheet Ledger Table */}
        <div id="transactions" className="scroll-mt-24">
          <TransactionTable
            lineItems={lineItems}
            totals={totals}
            onAddRow={handleAddRow}
            onUpdateRow={handleUpdateRow}
            onDeleteRow={handleDeleteRow}
            onDuplicateRow={handleDuplicateRow}
            onMoveRow={handleMoveRow}
            onClearAll={handleClearAllRows}
            onRenumberSn={handleRenumberSn}
          />
        </div>

        {/* Petty Cash & Bank Reconciliation Formula Panel */}
        <div id="reconciliation" className="scroll-mt-24">
          <ReconciliationPanel
            summary={summary}
            onPreBalanceChange={(val) => {
              markEdited();
              setPreBalance(val);
            }}
            onCurrentBankBalanceChange={(val) => {
              markEdited();
              setCurrentBankBalance(val);
            }}
          />
        </div>
      </main>

      {/* 4. FORMAL PRINT REPORT MODAL */}
      <PrintReportModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        record={currentRecord}
      />
    </div>
  );
}
