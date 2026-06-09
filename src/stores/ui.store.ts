import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  globalSearch: string;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalSearch: (search: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  globalSearch: "",
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setGlobalSearch: (search) => set({ globalSearch: search }),
}));
