import { create } from "zustand";

export const WORKSPACE_TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/employees": "Employees",
  "/app/contracts": "Contracts",
  "/app/attendance": "Attendance",
  "/app/time-off": "Time Off",
  "/app/payruns": "Payruns",
  "/app/payslips": "Payslips",
  "/app/structures": "Salary Structures",
  "/app/rules": "Salary Rules",
  "/app/reports": "Reports",
  "/app/settings": "Settings",
  "/app/users/approvals": "Approvals",
  "/app/users": "Users",
  "/app/profile": "Profile",
};

export type WindowMode = "tab" | "float" | "minimized";

export type WorkspaceTab = {
  id: string;
  href: string;
  title: string;
  dirty: boolean;
  mode: WindowMode;
  closing: boolean;
  z: number;
  x: number;
  y: number;
  w: number;
  h: number;
};

type WorkspaceState = {
  tabs: WorkspaceTab[];
  zTop: number;
  openTab: (tab: { id: string; href: string; title: string }) => void;
  closeTab: (id: string) => boolean;
  finishClose: (id: string) => void;
  popOut: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  focusWindow: (id: string) => void;
  markDirty: (id: string, dirty: boolean) => void;
};

function nextOffset(count: number) {
  return 56 + count * 28;
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  tabs: [],
  zTop: 20,
  openTab: (tab) => {
    set((state) => {
      if (state.tabs.some((item) => item.id === tab.id && !item.closing)) {
        return state;
      }
      return {
        tabs: [
          ...state.tabs.filter((item) => item.id !== tab.id),
          {
            ...tab,
            dirty: false,
            mode: "tab",
            closing: false,
            z: 1,
            x: nextOffset(state.tabs.length),
            y: nextOffset(state.tabs.length),
            w: 760,
            h: 520,
          },
        ],
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
    if (tab.mode === "minimized") {
      set((state) => ({ tabs: state.tabs.filter((item) => item.id !== id) }));
      return true;
    }
    set((state) => ({
      tabs: state.tabs.map((item) => (item.id === id ? { ...item, closing: true } : item)),
    }));
    return true;
  },
  finishClose: (id) => {
    set((state) => ({ tabs: state.tabs.filter((item) => item.id !== id) }));
  },
  popOut: (id) => {
    const zTop = get().zTop + 1;
    set((state) => ({
      zTop,
      tabs: state.tabs.map((item) =>
        item.id === id
          ? {
              ...item,
              mode: "float",
              z: zTop,
              x: item.x || nextOffset(state.tabs.filter((row) => row.mode === "float").length),
              y: item.y || nextOffset(state.tabs.filter((row) => row.mode === "float").length),
            }
          : item,
      ),
    }));
  },
  minimize: (id) => {
    set((state) => ({
      tabs: state.tabs.map((item) => (item.id === id ? { ...item, mode: "minimized" } : item)),
    }));
  },
  restore: (id) => {
    const zTop = get().zTop + 1;
    set((state) => ({
      zTop,
      tabs: state.tabs.map((item) =>
        item.id === id ? { ...item, mode: "float", z: zTop, closing: false } : item,
      ),
    }));
  },
  moveWindow: (id, x, y) => {
    set((state) => ({
      tabs: state.tabs.map((item) => (item.id === id ? { ...item, x, y } : item)),
    }));
  },
  focusWindow: (id) => {
    const zTop = get().zTop + 1;
    set((state) => ({
      zTop,
      tabs: state.tabs.map((item) => (item.id === id ? { ...item, z: zTop } : item)),
    }));
  },
  markDirty: (id, dirty) => {
    set((state) => ({
      tabs: state.tabs.map((item) => (item.id === id ? { ...item, dirty } : item)),
    }));
  },
}));
