export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: TransactionCategory;
  date: string;
  merchant: string;
  status: "completed" | "pending" | "failed";
}

export type TransactionCategory =
  | "housing"
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "health"
  | "education"
  | "utilities"
  | "salary"
  | "freelance"
  | "investment"
  | "transfer"
  | "other";

export interface Budget {
  id: string;
  category: TransactionCategory;
  name: string;
  limit: number;
  spent: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  [key: string]: string | number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  type: "warning" | "success" | "info" | "tip";
  impact: "high" | "medium" | "low";
  category: string;
  actionLabel?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  joinDate: string;
  plan: "free" | "pro" | "enterprise";
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}
