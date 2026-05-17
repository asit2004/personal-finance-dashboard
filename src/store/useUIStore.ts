import { create } from "zustand";

interface UIStore {
  // Command palette
  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // Add transaction modal
  addTransactionOpen: boolean;
  openAddTransaction: () => void;
  closeAddTransaction: () => void;

  // Sidebar (lifted from DashboardShell so any component can toggle it)
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  addTransactionOpen: false,
  openAddTransaction: () => set({ addTransactionOpen: true }),
  closeAddTransaction: () => set({ addTransactionOpen: false }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
