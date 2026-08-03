export interface LineItem {
  id: string;
  sn: number;
  description: string;
  cash_received: number; // Revenue (+)
  amer_cost: number;     // Direct Cost (-)
  pay_card: number;      // Card Cost (-)
  portal_cost: number;   // Portal Fee (-)
  net_profit: number;    // Cash - (Amer + PayCard + Portal)
  category?: string;
}

export interface DailyTotals {
  total_cash_received: number;
  total_amer_cost: number;
  total_pay_card: number;
  total_portal_cost: number;
  total_net_profit: number;
  total_costs: number;       // Amer + Pay Card + Portal
  gross_profit: number;      // Revenue - Total Costs
}

export interface DailySummary {
  expenses: number;
  net_income: number;        // Gross Profit - Expenses
  total_amount: number;      // Ticket + Card Paid + Amer/Tahseel + Gross Profit - Expense
  petty_cash: {
    pre_balance: number;     // User-entered previous day's petty cash balance
    new_balance: number;     // Pre Balance + Total Amount
  };
  bank_balance: {
    current_balance: number; // User-entered cash physically counted today
    net_balance: number;     // Current Balance - New Balance
  };
}

export interface DailyRecord {
  date: string;              // YYYY-MM-DD
  line_items: LineItem[];
  totals: DailyTotals;
  summary: DailySummary;
  created_at: string;        // ISO string
  updated_at?: string;
  notes?: string;
  status?: 'draft' | 'audited' | 'closed';
}

/**
 * Calculates net profit for an individual line item:
 * Cash Received - (Amer Cost + Pay Card + PORTAL)
 */
export function calculateLineProfit(item: {
  cash_received: number;
  amer_cost: number;
  pay_card: number;
  portal_cost: number;
}): number {
  const cash = Number(item.cash_received) || 0;
  const amer = Number(item.amer_cost) || 0;
  const card = Number(item.pay_card) || 0;
  const portal = Number(item.portal_cost) || 0;
  return Number((cash - (amer + card + portal)).toFixed(2));
}

/**
 * Performs all daily summary formulas according to Habat Al Rimal rules:
 * - Total Ticket / Revenue = Sum of Cash Received
 * - Credit Card Paid = Sum of Pay Card
 * - Amer/Tahseel Cost = Sum of Amer Cost
 * - Total Costs = Amer Cost + Pay Card + PORTAL
 * - Gross Profit = Revenue - Total Costs
 * - Net Income = Gross Profit - Daily Expense
 * - Total Amount = Total Ticket + Credit Card Paid + Amer/Tahseel Cost + Net Income - Expense
 * - New Balance = Pre Balance + Total Amount
 * - Net Balance = Current Balance - New Balance
 */
export function calculateFinancials(
  lineItems: LineItem[],
  expenses: number,
  preBalance: number,
  currentBankBalance: number
): {
  totals: DailyTotals;
  summary: DailySummary;
} {
  const total_cash_received = lineItems.reduce(
    (sum, item) => sum + (Number(item.cash_received) || 0),
    0
  );
  const total_amer_cost = lineItems.reduce(
    (sum, item) => sum + (Number(item.amer_cost) || 0),
    0
  );
  const total_pay_card = lineItems.reduce(
    (sum, item) => sum + (Number(item.pay_card) || 0),
    0
  );
  const total_portal_cost = lineItems.reduce(
    (sum, item) => sum + (Number(item.portal_cost) || 0),
    0
  );
  const total_net_profit = lineItems.reduce(
    (sum, item) => sum + calculateLineProfit(item),
    0
  );

  const total_costs =
    total_amer_cost + total_pay_card + total_portal_cost;
  const gross_profit = total_cash_received - total_costs;

  const validExpenses = Number(expenses) || 0;
  const validPreBalance = Number(preBalance) || 0;
  const validBankBalance = Number(currentBankBalance) || 0;

  const net_income = gross_profit - validExpenses;
  const total_amount =
    total_cash_received + total_pay_card + total_amer_cost + gross_profit - validExpenses;
  const petty_new_balance = validPreBalance + total_amount;
  const bank_net_balance = validBankBalance - petty_new_balance;

  return {
    totals: {
      total_cash_received: Number(total_cash_received.toFixed(2)),
      total_amer_cost: Number(total_amer_cost.toFixed(2)),
      total_pay_card: Number(total_pay_card.toFixed(2)),
      total_portal_cost: Number(total_portal_cost.toFixed(2)),
      total_net_profit: Number(total_net_profit.toFixed(2)),
      total_costs: Number(total_costs.toFixed(2)),
      gross_profit: Number(gross_profit.toFixed(2)),
    },
    summary: {
      expenses: Number(validExpenses.toFixed(2)),
      net_income: Number(net_income.toFixed(2)),
      total_amount: Number(total_amount.toFixed(2)),
      petty_cash: {
        pre_balance: Number(validPreBalance.toFixed(2)),
        new_balance: Number(petty_new_balance.toFixed(2)),
      },
      bank_balance: {
        current_balance: Number(validBankBalance.toFixed(2)),
        net_balance: Number(bank_net_balance.toFixed(2)),
      },
    },
  };
}

/**
 * Helper to get today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createEmptyLineItem(sn: number = 1): LineItem {
  return {
    id: `row_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    sn,
    description: "",
    cash_received: 0,
    amer_cost: 0,
    pay_card: 0,
    portal_cost: 0,
    net_profit: 0,
  };
}

export function calculateDailyTotals(lineItems: LineItem[]): DailyTotals {
  const { totals } = calculateFinancials(lineItems, 0, 0, 0);
  return totals;
}

export function calculateDailySummary(
  totals: DailyTotals,
  expenses: number,
  preBalance: number,
  currentBankBalance: number
): DailySummary {
  const validExpenses = Number(expenses) || 0;
  const validPre = Number(preBalance) || 0;
  const validBank = Number(currentBankBalance) || 0;
  const net_income = totals.gross_profit - validExpenses;
  const total_amount =
    totals.total_cash_received +
    totals.total_pay_card +
    totals.total_amer_cost +
    totals.gross_profit -
    validExpenses;
  const new_balance = validPre + total_amount;
  const net_balance = validBank - new_balance;

  return {
    expenses: Number(validExpenses.toFixed(2)),
    net_income: Number(net_income.toFixed(2)),
    total_amount: Number(total_amount.toFixed(2)),
    petty_cash: {
      pre_balance: Number(validPre.toFixed(2)),
      new_balance: Number(new_balance.toFixed(2)),
    },
    bank_balance: {
      current_balance: Number(validBank.toFixed(2)),
      net_balance: Number(net_balance.toFixed(2)),
    },
  };
}
