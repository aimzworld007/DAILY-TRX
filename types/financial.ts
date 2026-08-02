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
  petty_cash: {
    pre_balance: number;
    new_balance: number;     // Pre Balance - Expenses
  };
  bank_balance: {
    current_balance: number;
    net_balance: number;     // Current Bank Balance - New Petty Cash Balance
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

export interface ServicePreset {
  label: string;
  category: string;
  defaultRevenue: number;
  defaultAmer: number;
  defaultPayCard: number;
  defaultPortal: number;
}

export const TYPING_SERVICE_PRESETS: ServicePreset[] = [
  {
    label: "Visa Renewal / Residence Stamping",
    category: "Visa Services",
    defaultRevenue: 850,
    defaultAmer: 310,
    defaultPayCard: 18,
    defaultPortal: 25,
  },
  {
    label: "Emirates ID Typing (New / Renew)",
    category: "Emirates ID",
    defaultRevenue: 380,
    defaultAmer: 170,
    defaultPayCard: 8,
    defaultPortal: 15,
  },
  {
    label: "Amer Service - Family Sponsorship",
    category: "Amer",
    defaultRevenue: 1250,
    defaultAmer: 420,
    defaultPayCard: 25,
    defaultPortal: 35,
  },
  {
    label: "Tasheel Labor Contract Submission",
    category: "Tasheel",
    defaultRevenue: 620,
    defaultAmer: 180,
    defaultPayCard: 12,
    defaultPortal: 20,
  },
  {
    label: "Medical Fitness Test Application",
    category: "Medical",
    defaultRevenue: 410,
    defaultAmer: 260,
    defaultPayCard: 10,
    defaultPortal: 10,
  },
  {
    label: "PRO Services - Sponsor Transfer",
    category: "PRO Services",
    defaultRevenue: 1500,
    defaultAmer: 350,
    defaultPayCard: 30,
    defaultPortal: 50,
  },
  {
    label: "Legal Translation (Per Page)",
    category: "Translation",
    defaultRevenue: 120,
    defaultAmer: 0,
    defaultPayCard: 0,
    defaultPortal: 5,
  },
  {
    label: "Fine Settlement / Visa Grace Period",
    category: "Fine Settlement",
    defaultRevenue: 500,
    defaultAmer: 100,
    defaultPayCard: 15,
    defaultPortal: 25,
  },
  {
    label: "Trade License Renewal Typing",
    category: "License",
    defaultRevenue: 2200,
    defaultAmer: 650,
    defaultPayCard: 45,
    defaultPortal: 60,
  },
  {
    label: "Golden Visa Application Typing",
    category: "Golden Visa",
    defaultRevenue: 3500,
    defaultAmer: 1100,
    defaultPayCard: 75,
    defaultPortal: 100,
  },
];

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
 * - Petty Cash New Balance = Pre Balance - Daily Expense
 * - Net Balance = Current Bank Balance - Petty Cash New Balance
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
  const petty_new_balance = validPreBalance - validExpenses;
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

/**
 * Generates sample demo transactions for Habat Al Rimal Typing center
 */
export function getDemoDailyRecord(dateStr: string): DailyRecord {
  const sampleItems: LineItem[] = [
    {
      id: "demo-1",
      sn: 1,
      description: "Emirates ID Typing - Ahmed Al Mansoori",
      cash_received: 380,
      amer_cost: 170,
      pay_card: 8,
      portal_cost: 15,
      net_profit: 187,
      category: "Emirates ID",
    },
    {
      id: "demo-2",
      sn: 2,
      description: "Amer Service - Residence Visa Renewal (2 Yrs)",
      cash_received: 850,
      amer_cost: 310,
      pay_card: 18,
      portal_cost: 25,
      net_profit: 497,
      category: "Visa Services",
    },
    {
      id: "demo-3",
      sn: 3,
      description: "Tasheel Labor Contract Submission - Al Safa Trading",
      cash_received: 620,
      amer_cost: 180,
      pay_card: 12,
      portal_cost: 20,
      net_profit: 408,
      category: "Tasheel",
    },
    {
      id: "demo-4",
      sn: 4,
      description: "Medical Fitness Test VIP - Fatima Zahra",
      cash_received: 410,
      amer_cost: 260,
      pay_card: 10,
      portal_cost: 10,
      net_profit: 130,
      category: "Medical",
    },
    {
      id: "demo-5",
      sn: 5,
      description: "Legal Translation (Arabic to English - 3 Pages)",
      cash_received: 360,
      amer_cost: 0,
      pay_card: 5,
      portal_cost: 15,
      net_profit: 340,
      category: "Translation",
    },
    {
      id: "demo-6",
      sn: 6,
      description: "Trade License Renewal Typing - Habat Al Rimal Partner",
      cash_received: 2200,
      amer_cost: 650,
      pay_card: 45,
      portal_cost: 60,
      net_profit: 1445,
      category: "License",
    },
  ];

  const expenses = 420; // e.g., Courier, Stationery, Coffee, Parking
  const preBalance = 5000;
  const currentBankBalance = 48500;

  const { totals, summary } = calculateFinancials(
    sampleItems,
    expenses,
    preBalance,
    currentBankBalance
  );

  return {
    date: dateStr,
    line_items: sampleItems,
    totals,
    summary,
    created_at: new Date().toISOString(),
    notes: "Habat Al Rimal Daily Typing Ledger - Normal Business Hours",
    status: "audited",
  };
}

export const HABAT_SERVICE_PRESETS = TYPING_SERVICE_PRESETS;

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
  const new_balance = validPre - validExpenses;
  const net_balance = validBank - new_balance;

  return {
    expenses: Number(validExpenses.toFixed(2)),
    net_income: Number(net_income.toFixed(2)),
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

