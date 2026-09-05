import { create } from "zustand";

export type WorkspaceTab = {
  id: string;
  href: string;
  title: string;
  dirty: boolean;
};

type WorkspaceState = {
  tabs: WorkspaceTab[];
  openTab: (tab: Omit<WorkspaceTab, "dirty"> & { dirty?: boolean }) => void;
  closeTab: (id: string) => boolean;
  markDirty: (id: string, dirty: boolean) => void;
};

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  tabs: [{ id: "dashboard", href: "/app", title: "Dashboard", dirty: false }],
  openTab: (tab) => {
    set((state) => {
      if (state.tabs.some((item) => item.id === tab.id)) {
        return state;
      }
      return {
        tabs: [...state.tabs, { dirty: false, ...tab }],
      };
    });
  },
  closeTab: (id) => {
    const tab = get().tabs.find((item) => item.id === id);
    if (!tab) {
      return true;
    }
    if (tab.dirty && typeof window !== "undefined") {
      const ok = window.confirm("This tab has unsaved changes. Close it anyway?");
      if (!ok) {
        return false;
      }
    }
    set((state) => ({ tabs: state.tabs.filter((item) => item.id !== id) }));
    return true;
  },
  markDirty: (id, dirty) => {
    set((state) => ({
      tabs: state.tabs.map((item) => (item.id === id ? { ...item, dirty } : item)),
    }));
  },
}));
