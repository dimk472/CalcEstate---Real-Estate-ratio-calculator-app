// ─────────────────────────────────────────────────────────────────
//  ratios.ts — Vibrant palette, category-mapped
//
//  Income        → Vermillion #E8613C  /  Fuchsia  #EC4899
//  Valuation     → Azure      #3B82F6  /  Indigo   #6366F1
//  Profitability → Amber      #F0A500  /  Jade     #10B981
//  Cash Flow     → Emerald    #22C55E
//  Return        → Violet     #A855F7  /  Jade     #10B981
//  Efficiency    → Indigo     #6366F1
//  Leverage      → Gold       #EAB308
//  Debt          → Teal       #14B8A6
//  Performance   → Sky        #0EA5E9
//  Risk          → Rose       #F43F5E
// ─────────────────────────────────────────────────────────────────

export type RatioImportance = "Critical" | "High" | "Medium";

export type RatioCategory =
  | "Income"
  | "Valuation"
  | "Profitability"
  | "Cash Flow"
  | "Debt"
  | "Return"
  | "Efficiency"
  | "Risk"
  | "Performance"
  | "Leverage";

export interface RealEstateRatio {
  id: number;
  title: string;
  description: string;
  formula: string;
  category: RatioCategory;
  importance: RatioImportance;
  icon: any;
  color: string;
  details: string;
  isLiked?: boolean;
}

export const realEstateRatios: RealEstateRatio[] = [
  {
    id: 1,
    title: "Gross Rental Yield",
    description: "Annual rental income as percentage of property price",
    formula: "(Annual Rental Income ÷ Property Price) × 100",
    category: "Income",
    importance: "High",
    icon: "trending-up",
    color: "#E8613C", // Vermillion
    details: "Measures the basic return before expenses. Higher is better.",
    isLiked: false,
  },
  {
    id: 2,
    title: "Net Rental Yield",
    description:
      "Annual net income after expenses as percentage of property price",
    formula: "(Annual Net Income ÷ Property Price) × 100",
    category: "Income",
    importance: "High",
    icon: "trending-down",
    color: "#EC4899", // Fuchsia
    details: "Accounts for operating expenses. More accurate than gross yield.",
    isLiked: false,
  },
  {
    id: 3,
    title: "Price per m²",
    description: "Property price divided by total area in square meters",
    formula: "Property Price ÷ Total Area (m²)",
    category: "Valuation",
    importance: "Medium",
    icon: "resize",
    color: "#3B82F6", // Azure
    details: "Useful for comparing properties in same area.",
    isLiked: false,
  },
  {
    id: 4,
    title: "Monthly Rent per m²",
    description: "Monthly rental income per square meter",
    formula: "Monthly Rent ÷ Area (m²)",
    category: "Income",
    importance: "Medium",
    icon: "home",
    color: "#E8613C", // Vermillion
    details: "Helps compare rental rates across different sized properties.",
    isLiked: false,
  },
  {
    id: 5,
    title: "Net Operating Income (NOI)",
    description: "Annual income after operating expenses",
    formula: "Gross Income - Operating Expenses",
    category: "Profitability",
    importance: "High",
    icon: "cash",
    color: "#F0A500", // Amber
    details: "Key metric for evaluating property profitability.",
    isLiked: false,
  },
  {
    id: 6,
    title: "Cash Flow",
    description: "Net income after all expenses including debt service",
    formula: "NOI - Debt Service",
    category: "Cash Flow",
    importance: "Critical",
    icon: "water",
    color: "#22C55E", // Emerald
    details: "Actual cash generated each month.",
    isLiked: false,
  },
  {
    id: 7,
    title: "Operating Expense Ratio (OER)",
    description: "Operating expenses as percentage of gross income",
    formula: "(Operating Expenses ÷ Gross Income) × 100",
    category: "Efficiency",
    importance: "Medium",
    icon: "speedometer",
    color: "#6366F1", // Indigo
    details: "Lower ratio indicates better efficiency.",
    isLiked: false,
  },
  {
    id: 8,
    title: "Capitalization Rate (Cap Rate)",
    description: "Rate of return on property based on NOI",
    formula: "(NOI ÷ Property Value) × 100",
    category: "Valuation",
    importance: "High",
    icon: "pie-chart",
    color: "#3B82F6", // Azure
    details: "Used to compare different investment opportunities.",
    isLiked: false,
  },
  {
    id: 9,
    title: "Cash-on-Cash Return",
    description: "Annual pre-tax cash flow relative to cash invested",
    formula: "(Annual Cash Flow ÷ Cash Invested) × 100",
    category: "Return",
    importance: "High",
    icon: "wallet",
    color: "#A855F7", // Violet
    details: "Measures return on actual cash outlay.",
    isLiked: false,
  },
  {
    id: 10,
    title: "Loan-to-Value (LTV)",
    description: "Loan amount as percentage of property value",
    formula: "(Loan Amount ÷ Property Value) × 100",
    category: "Leverage",
    importance: "High",
    icon: "scale",
    color: "#EAB308", // Gold
    details: "Lower LTV means less risk for lenders.",
    isLiked: false,
  },
  {
    id: 11,
    title: "Debt Service Coverage Ratio (DSCR)",
    description: "Ability to cover debt payments with NOI",
    formula: "NOI ÷ Annual Debt Service",
    category: "Debt",
    importance: "Critical",
    icon: "shield-checkmark",
    color: "#14B8A6", // Teal
    details: "Lenders require minimum 1.2-1.25 ratio.",
    isLiked: false,
  },
  {
    id: 12,
    title: "Occupancy Rate",
    description: "Percentage of time property is rented",
    formula: "(Days Rented ÷ Total Days) × 100",
    category: "Performance",
    importance: "Medium",
    icon: "people",
    color: "#0EA5E9", // Sky
    details: "Higher occupancy means more stable income.",
    isLiked: false,
  },
  {
    id: 13,
    title: "Vacancy Rate",
    description: "Percentage of time property is vacant",
    formula: "(Days Vacant ÷ Total Days) × 100",
    category: "Performance",
    importance: "Medium",
    icon: "home-outline",
    color: "#0EA5E9", // Sky
    details: "Opposite of occupancy rate. Lower is better.",
    isLiked: false,
  },
  {
    id: 14,
    title: "Gross Operating Income Multiplier (GOIM)",
    description: "Years to recover purchase price from gross income",
    formula: "Property Price ÷ Annual Gross Income",
    category: "Valuation",
    importance: "Medium",
    icon: "timer",
    color: "#6366F1", // Indigo
    details: "Lower multiplier suggests better value.",
    isLiked: false,
  },
  {
    id: 15,
    title: "Debt Yield",
    description: "NOI as percentage of loan amount",
    formula: "(NOI ÷ Loan Amount) × 100",
    category: "Debt",
    importance: "Medium",
    icon: "arrow-up",
    color: "#14B8A6", // Teal
    details: "Measures lender's risk. Higher is better.",
    isLiked: false,
  },
  {
    id: 16,
    title: "Break-Even Ratio (BER)",
    description: "Percentage of income needed to cover expenses",
    formula: "(Operating Expenses + Debt Service) ÷ Gross Income",
    category: "Risk",
    importance: "High",
    icon: "warning",
    color: "#F43F5E", // Rose
    details: "Lower than 100% means positive cash flow.",
    isLiked: false,
  },
  {
    id: 17,
    title: "Rent-to-Price Ratio",
    description: "Monthly rent as percentage of property price",
    formula: "(Monthly Rent ÷ Property Price) × 100",
    category: "Valuation",
    importance: "Medium",
    icon: "calculator",
    color: "#3B82F6", // Azure
    details: "Quick valuation metric for rental properties.",
    isLiked: false,
  },
  {
    id: 18,
    title: "Return on Investment (ROI)",
    description: "Total return relative to total investment",
    formula: "(Net Profit ÷ Total Investment) × 100",
    category: "Return",
    importance: "High",
    icon: "rocket",
    color: "#A855F7", // Violet
    details: "Overall profitability including appreciation.",
    isLiked: false,
  },
  {
    id: 19,
    title: "Internal Rate of Return (IRR)",
    description: "Annualized rate of return over time",
    formula: "Complex calculation with cash flows",
    category: "Return",
    importance: "High",
    icon: "analytics",
    color: "#10B981", // Jade
    details: "Accounts for time value of money.",
    isLiked: false,
  },
  {
    id: 20,
    title: "Expense Ratio",
    description: "Operating expenses as percentage of property value",
    formula: "(Operating Expenses ÷ Property Value) × 100",
    category: "Efficiency",
    importance: "Medium",
    icon: "stats-chart",
    color: "#6366F1", // Indigo
    details: "Lower ratio indicates efficient management.",
    isLiked: false,
  },
  {
    id: 21,
    title: "Gross Margin",
    description: "Gross profit as percentage of revenue",
    formula: "(Gross Profit ÷ Revenue) × 100",
    category: "Profitability",
    importance: "Medium",
    icon: "bar-chart",
    color: "#F0A500", // Amber
    details: "Measures profitability after direct costs.",
    isLiked: false,
  },
];

export interface CalculateRatiosProps {
  id: number;
  title: string;
  description: string;
  formula: string;
  category: RatioCategory;
  importance: RatioImportance;
  icon: any;
  color: string;
  details: string;
  inputValues: { [key: string]: number | number[] };
}

export const CalculateRatiosPropsArray: CalculateRatiosProps[] = [
  {
    id: 1,
    title: "Gross Rental Yield",
    description: "Annual rental income as percentage of property price",
    formula: "(Annual Rental Income ÷ Property Price) × 100",
    category: "Income",
    importance: "High",
    icon: "trending-up",
    color: "#E8613C",
    details: "Measures the basic return before expenses.",
    inputValues: { annualRentalIncome: 0, propertyPrice: 0 },
  },
  {
    id: 2,
    title: "Net Rental Yield",
    description: "Income after expenses as percentage of property price",
    formula: "((Income − Expenses) ÷ Property Price) × 100",
    category: "Income",
    importance: "High",
    icon: "trending-down",
    color: "#EC4899",
    details: "More accurate than gross yield.",
    inputValues: { annualRentalIncome: 0, annualExpenses: 0, propertyPrice: 0 },
  },
  {
    id: 3,
    title: "Price per m²",
    description: "Property price divided by total area",
    formula: "Property Price ÷ Total Area",
    category: "Valuation",
    importance: "Medium",
    icon: "resize",
    color: "#3B82F6",
    details: "Useful for comparing similar properties.",
    inputValues: { propertyPrice: 0, totalArea: 0 },
  },
  {
    id: 4,
    title: "Monthly Rent per m²",
    description: "Monthly rental income per square meter",
    formula: "Monthly Rent ÷ Total Area",
    category: "Income",
    importance: "Medium",
    icon: "home",
    color: "#E8613C",
    details: "Helps compare rental prices.",
    inputValues: { monthlyRent: 0, totalArea: 0 },
  },
  {
    id: 5,
    title: "Net Operating Income (NOI)",
    description: "Annual income after operating expenses",
    formula: "Annual Rental Income − Operating Expenses",
    category: "Profitability",
    importance: "High",
    icon: "cash",
    color: "#F0A500",
    details: "Key profitability metric.",
    inputValues: { annualRentalIncome: 0, operatingExpenses: 0 },
  },
  {
    id: 6,
    title: "Cash Flow",
    description: "Income left after all expenses and loan payments",
    formula: "(Income − Expenses) − Loan Payments",
    category: "Cash Flow",
    importance: "Critical",
    icon: "water",
    color: "#22C55E",
    details: "Actual money in your pocket.",
    inputValues: {
      annualRentalIncome: 0,
      annualExpenses: 0,
      annualLoanPayments: 0,
    },
  },
  {
    id: 7,
    title: "Operating Expense Ratio (OER)",
    description: "Expenses as percentage of rental income",
    formula: "(Operating Expenses ÷ Income) × 100",
    category: "Efficiency",
    importance: "Medium",
    icon: "speedometer",
    color: "#6366F1",
    details: "Lower means better efficiency.",
    inputValues: { operatingExpenses: 0, annualRentalIncome: 0 },
  },
  {
    id: 8,
    title: "Capitalization Rate (Cap Rate)",
    description: "Return based on property value",
    formula: "NOI ÷ Property Value × 100",
    category: "Valuation",
    importance: "High",
    icon: "pie-chart",
    color: "#3B82F6",
    details: "Used to compare investments.",
    inputValues: { annualRentalIncome: 0, annualExpenses: 0, propertyValue: 0 },
  },
  {
    id: 9,
    title: "Cash-on-Cash Return",
    description: "Cash return compared to cash invested",
    formula: "Annual Cash Flow ÷ Cash Invested × 100",
    category: "Return",
    importance: "High",
    icon: "wallet",
    color: "#A855F7",
    details: "Shows return on your own money.",
    inputValues: {
      annualRentalIncome: 0,
      annualExpenses: 0,
      annualLoanPayments: 0,
      cashInvested: 0,
    },
  },
  {
    id: 10,
    title: "Loan-to-Value (LTV)",
    description: "Loan amount as percentage of property value",
    formula: "Loan Amount ÷ Property Value × 100",
    category: "Leverage",
    importance: "High",
    icon: "scale",
    color: "#EAB308",
    details: "Lower means less lender risk.",
    inputValues: { loanAmount: 0, propertyValue: 0 },
  },
  {
    id: 11,
    title: "Debt Service Coverage Ratio (DSCR)",
    description: "Ability to cover loan payments",
    formula: "NOI ÷ Loan Payments",
    category: "Debt",
    importance: "Critical",
    icon: "shield-checkmark",
    color: "#14B8A6",
    details: "Lenders usually require ≥ 1.2",
    inputValues: {
      annualRentalIncome: 0,
      annualExpenses: 0,
      annualLoanPayments: 0,
    },
  },
  {
    id: 12,
    title: "Occupancy Rate",
    description: "Percentage of time rented",
    formula: "Days Rented ÷ Total Days × 100",
    category: "Performance",
    importance: "Medium",
    icon: "people",
    color: "#0EA5E9",
    details: "Higher means stable income.",
    inputValues: { daysRented: 0, totalDays: 0 },
  },
  {
    id: 13,
    title: "Vacancy Rate",
    description: "Percentage of time vacant",
    formula: "Days Vacant ÷ Total Days × 100",
    category: "Performance",
    importance: "Medium",
    icon: "home-outline",
    color: "#0EA5E9",
    details: "Lower is better.",
    inputValues: { daysVacant: 0, totalDays: 0 },
  },
  {
    id: 14,
    title: "Gross Operating Income Multiplier (GOIM)",
    description: "Years to recover purchase price",
    formula: "Property Price ÷ Annual Rental Income",
    category: "Valuation",
    importance: "Medium",
    icon: "timer",
    color: "#6366F1",
    details: "Lower indicates better value.",
    inputValues: { propertyPrice: 0, annualRentalIncome: 0 },
  },
  {
    id: 15,
    title: "Debt Yield",
    description: "NOI compared to loan amount",
    formula: "NOI ÷ Loan Amount × 100",
    category: "Debt",
    importance: "Medium",
    icon: "arrow-up",
    color: "#14B8A6",
    details: "Measures lender risk.",
    inputValues: { annualRentalIncome: 0, annualExpenses: 0, loanAmount: 0 },
  },
  {
    id: 16,
    title: "Break-Even Ratio (BER)",
    description: "Income needed to cover costs",
    formula: "(Expenses + Loan Payments) ÷ Income",
    category: "Risk",
    importance: "High",
    icon: "warning",
    color: "#F43F5E",
    details: "Below 100% means positive cash flow.",
    inputValues: {
      annualRentalIncome: 0,
      operatingExpenses: 0,
      annualLoanPayments: 0,
    },
  },
  {
    id: 17,
    title: "Rent-to-Price Ratio",
    description: "Monthly rent compared to property price",
    formula: "Monthly Rent ÷ Property Price × 100",
    category: "Valuation",
    importance: "Medium",
    icon: "calculator",
    color: "#3B82F6",
    details: "Quick screening metric.",
    inputValues: { monthlyRent: 0, propertyPrice: 0 },
  },
  {
    id: 18,
    title: "Cash ROI (Simplified)",
    description: "Return based on annual cash flow",
    formula: "Annual Cash Flow ÷ Cash Invested × 100",
    category: "Return",
    importance: "High",
    icon: "rocket",
    color: "#A855F7",
    details: "Simplified ROI (cash-based).",
    inputValues: { annualCashFlow: 0, cashInvested: 0 },
  },
  {
    id: 19,
    title: "Internal Rate of Return (IRR)",
    description: "Annualized return over time",
    formula: "Calculated from cash flows",
    category: "Return",
    importance: "High",
    icon: "analytics",
    color: "#10B981",
    details: "Advanced metric considering time value of money.",
    inputValues: { cashFlows: [], initialInvestment: 0 },
  },
  {
    id: 20,
    title: "Expense Ratio",
    description: "Expenses relative to property value",
    formula: "Operating Expenses ÷ Property Value × 100",
    category: "Efficiency",
    importance: "Medium",
    icon: "stats-chart",
    color: "#6366F1",
    details: "Lower indicates efficient management.",
    inputValues: { operatingExpenses: 0, propertyValue: 0 },
  },
  {
    id: 21,
    title: "Gross Margin",
    description: "Gross profit as percentage of revenue",
    formula: "(Gross Profit ÷ Revenue) × 100",
    category: "Profitability",
    importance: "Medium",
    icon: "bar-chart",
    color: "#F0A500",
    details: "Measures profitability after direct costs.",
    inputValues: { grossProfit: 0, revenue: 0 },
  },
];
