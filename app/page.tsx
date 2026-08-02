"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  LineItem,
  DailyRecord,
  DailyTotals,
  DailySummary,
  ServicePreset,
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
import { SummaryCards } from "@/components/SummaryCards";
import { TransactionTable } from "@/components/TransactionTable";
import { ReconciliationPanel } from "@/components/ReconciliationPanel";
import { HistoryModal } from "@/components/HistoryModal";
import { PrintReportModal } from "@/components/PrintReportModal";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function HabatAlRimalDailyTraxPage() {
  // 1. Current Selected Date (default: today YYYY-MM-DD)
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());

  // 2. Core Financial State
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [expenses, setExpenses] = useState<number>(0);
  const [preBalance, setPreBalance] = useState<number>(5000); // default starting cash box
  const [currentBankBalance, setCurrentBankBalance] = useState<number>(25000);

  // 3. UI & Modal states
  const [syncStatus, setSyncStatus] = useState<"saved" | "saving" | "error" | "offline">("saved");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPrintOpen, setIsPrintOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

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
    try {
      setSyncStatus("saving");
      const remoteRecord = await getDailyRecord(dateStr);

      if (remoteRecord) {
        setLineItems(remoteRecord.line_items || []);
        setExpenses(remoteRecord.summary?.expenses || 0);
        setPreBalance(remoteRecord.summary?.petty_cash?.pre_balance ?? 5000);
        setCurrentBankBalance(
          remoteRecord.summary?.bank_balance?.current_balance ?? 25000
        );
        setSyncStatus("saved");
        return;
      }

      // Check localStorage fallback
      const localKey = `dailytrax_record_${dateStr}`;
      const cached = localStorage.getItem(localKey);
      if (cached) {
        try {
          const parsed: DailyRecord = JSON.parse(cached);
          setLineItems(parsed.line_items || []);
          setExpenses(parsed.summary?.expenses || 0);
          setPreBalance(parsed.summary?.petty_cash?.pre_balance ?? 5000);
          setCurrentBankBalance(
            parsed.summary?.bank_balance?.current_balance ?? 25000
          );
          setSyncStatus("saved");
          return;
        } catch {
          // ignore invalid json
        }
      }

      // Otherwise initialize fresh empty day with 1 initial line item
      const initialLine = createEmptyLineItem(1);
      setLineItems([initialLine]);
      setExpenses(0);
      setPreBalance(5000);
      setCurrentBankBalance(25000);
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
          setLineItems(parsed.line_items || []);
          setExpenses(parsed.summary?.expenses || 0);
          setPreBalance(parsed.summary?.petty_cash?.pre_balance ?? 5000);
          setCurrentBankBalance(
            parsed.summary?.bank_balance?.current_balance ?? 25000
          );
          return;
        } catch {
          // ignore
        }
      }
      setLineItems([createEmptyLineItem(1)]);
      setExpenses(0);
      setPreBalance(5000);
      setCurrentBankBalance(25000);
    }
  }, []);

  useEffect(() => {
    loadRecordForDate(selectedDate);
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
      saveCurrentRecord(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [lineItems, expenses, preBalance, currentBankBalance, saveCurrentRecord]);

  // Auto hide notification
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  // 7. CRUD Operations for Line Items
  const handleAddRow = (preset?: ServicePreset) => {
    const nextSN = lineItems.length + 1;
    const newRow = createEmptyLineItem(nextSN);
    if (preset) {
      newRow.description = preset.label;
      newRow.cash_received = preset.defaultRevenue;
      newRow.amer_cost = preset.defaultAmer;
      newRow.pay_card = preset.defaultPayCard;
      newRow.portal_cost = preset.defaultPortal;
      newRow.net_profit = Number(
        (
          preset.defaultRevenue -
          (preset.defaultAmer + preset.defaultPayCard + preset.defaultPortal)
        ).toFixed(2)
      );
    }
    setLineItems((prev) => [...prev, newRow]);
  };

  const handleUpdateRow = (id: string, updates: Partial<LineItem>) => {
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
      setLineItems([createEmptyLineItem(1)]);
      setExpenses(0);
    }
  };

  // 8. Demo Data Loader (Habat Al Rimal Typing services sample)
  const handleLoadDemoDay = () => {
    const demoItems: LineItem[] = [
      {
        id: "demo_1",
        sn: 1,
        description: "Amer Family Visa Sponsorship (2 Years)",
        cash_received: 1450.0,
        amer_cost: 820.0,
        pay_card: 310.0,
        portal_cost: 50.0,
        net_profit: 270.0,
      },
      {
        id: "demo_2",
        sn: 2,
        description: "Emirates ID Biometric New Application",
        cash_received: 385.0,
        amer_cost: 270.0,
        pay_card: 15.0,
        portal_cost: 20.0,
        net_profit: 80.0,
      },
      {
        id: "demo_3",
        sn: 3,
        description: "Tasheel Labour Work Permit Renewal",
        cash_received: 850.0,
        amer_cost: 530.0,
        pay_card: 110.0,
        portal_cost: 40.0,
        net_profit: 170.0,
      },
      {
        id: "demo_4",
        sn: 4,
        description: "Dubai Health Medical Fitness Test Clearing",
        cash_received: 330.0,
        amer_cost: 210.0,
        pay_card: 10.0,
        portal_cost: 25.0,
        net_profit: 85.0,
      },
      {
        id: "demo_5",
        sn: 5,
        description: "Amer Entry Permit Change Status",
        cash_received: 680.0,
        amer_cost: 460.0,
        pay_card: 45.0,
        portal_cost: 30.0,
        net_profit: 145.0,
      },
      {
        id: "demo_6",
        sn: 6,
        description: "PRO Document Attestation & Typing Fee",
        cash_received: 250.0,
        amer_cost: 0.0,
        pay_card: 0.0,
        portal_cost: 10.0,
        net_profit: 240.0,
      },
    ];

    setLineItems(demoItems);
    setExpenses(165.0); // Daily tea, stationery, office overhead
    setPreBalance(5200.0);
    setCurrentBankBalance(28450.0);
    setNotification({
      type: "success",
      message: "Loaded sample Habat Al Rimal Typing transactions successfully.",
    });
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

  // 10. Open Archive History Modal
  const handleOpenHistory = () => {
    setIsHistoryOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 text-slate-900 font-sans antialiased">
      {/* 1. TOP STICKY HEADER & TOOLBAR */}
      <HeaderNav
        selectedDate={selectedDate}
        onDateChange={(newDate) => setSelectedDate(newDate)}
        syncStatus={syncStatus}
        lastSavedTime={lastSavedTime}
        onOpenHistory={handleOpenHistory}
        onOpenPrint={() => setIsPrintOpen(true)}
        onExportCsv={handleExportCsv}
        onLoadDemo={handleLoadDemoDay}
        onManualSave={() => saveCurrentRecord(true)}
      />

      {/* NOTIFICATION TOAST (if active) */}
      {notification && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full pt-2">
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full pb-10 space-y-4">
        {/* KPI Summary Cards & Daily Formula Breakdown Banner */}
        <SummaryCards
          totals={totals}
          summary={summary}
          expenses={expenses}
          onExpensesChange={(newExp) => setExpenses(newExp)}
        />

        {/* Transaction Spreadsheet Ledger Table */}
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

        {/* Petty Cash & Bank Reconciliation Formula Panel */}
        <ReconciliationPanel
          summary={summary}
          onPreBalanceChange={(val) => setPreBalance(val)}
          onCurrentBankBalanceChange={(val) => setCurrentBankBalance(val)}
        />
      </main>

      {/* 3. ARCHIVE HISTORY MODAL */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectDate={(dateStr) => {
          setSelectedDate(dateStr);
          setIsHistoryOpen(false);
        }}
        currentDate={selectedDate}
      />

      {/* 4. FORMAL PRINT REPORT MODAL */}
      <PrintReportModal
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        record={currentRecord}
      />
    </div>
  );
}
