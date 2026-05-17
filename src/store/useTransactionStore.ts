import { create } from "zustand";
import { mockTransactions } from "@/lib/mock-data";
import { Transaction } from "@/types";

interface TransactionFilters {
  search: string;
  type: "all" | "income" | "expense";
  category: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

interface TransactionStore {
  transactions: Transaction[];
  filters: TransactionFilters;
  isLoading: boolean;

  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  removeTransaction: (id: string) => void;
  setFilter: (key: keyof TransactionFilters, value: string | null) => void;
  resetFilters: () => void;
}

const defaultFilters: TransactionFilters = {
  search: "",
  type: "all",
  category: null,
  dateFrom: null,
  dateTo: null,
};

export const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: mockTransactions,
  filters: defaultFilters,
  isLoading: false,

  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((s) => ({ transactions: [transaction, ...s.transactions] })),

  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),

  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),

  resetFilters: () => set({ filters: defaultFilters }),
}));
