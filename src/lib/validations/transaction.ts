import { z } from "zod";

const CATEGORIES = [
  "housing","food","transport","entertainment","shopping",
  "health","education","utilities","salary","freelance",
  "investment","transfer","other",
] as const;

const PAYMENT_METHODS = ["upi","card","cash","netbanking","wallet"] as const;

export const createTransactionSchema = z.object({
  description: z.string().min(2, "Description required").max(200),
  merchant: z.string().max(100).optional().default(""),
  amount: z.coerce.number().positive("Amount must be positive").max(10_000_000),
  type: z.enum(["income", "expense"]),
  category: z.enum(CATEGORIES).default("other"),
  paymentMethod: z.enum(PAYMENT_METHODS).default("upi"),
  date: z.string().min(1, "Date required"),
  recurring: z.boolean().optional().default(false),
  recurringInterval: z.enum(["daily","weekly","monthly","yearly"]).optional(),
  note: z.string().max(500).optional(),
  tags: z.array(z.string()).optional().default([]),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const transactionFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.enum(CATEGORIES).optional(),
  type: z.enum(["income","expense"]).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(["date","amount","description"]).default("date"),
  sortDir: z.enum(["asc","desc"]).default("desc"),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;
