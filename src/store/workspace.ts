import { create } from "zustand";

export const WORKSPACE_TITLES: Record<string, string> = {
  "/app": "Dashboard",
  "/app/employees": "Employees",
  "/app/contracts": "Contracts",
  "/app/schedules": "Working Schedules",
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

export function tabFromPathname(pathname: string) {
  const hrefs = Object.keys(WORKSPACE_TITLES);
  const nested = hrefs
    .filter((href) => href !== "/app")
    .sort((a, b) => b.length - a.length)
    .find((href) => pathname === href || pathname.startsWith(`${href}/`));
  if (nested) {
    return { id: nested, href: nested, title: WORKSPACE_TITLES[nested] };
  }
  if (pathname === "/app") {
    return { id: "/app", href: "/app", title: WORKSPACE_TITLES["/app"] };
  }
  return null;
}

export function isWorkspaceHrefActive(pathname: string, href: string) {
  if (href === "/app") {
    return pathname === "/app";
  }
  if (href === "/app/users") {
    return pathname === "/app/users" || /^\/app\/users\/[^/]+$/.test(pathname);
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
  ownerId: string | null;
  tabs: WorkspaceTab[];
  zTop: number;
  resetForUser: (userId: string) => void;
  clearWorkspace: () => void;
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

const STORAGE_PREFIX = "peoplepay360-workspace-v1:";

type WorkspaceSnapshot = {
  tabs: WorkspaceTab[];
  zTop: number;
};

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

function asMode(value: unknown): WindowMode {
  if (value === "float" || value === "minimized" || value === "tab") {
    return value;
  }
  return "tab";
}

function normalizeTab(value: unknown): WorkspaceTab | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || typeof row.href !== "string" || typeof row.title !== "string") {
    return null;
  }
  return {
    id: row.id,
    href: row.href,
    title: row.title,
    dirty: false,
    mode: asMode(row.mode),
    closing: false,
    z: Number(row.z) || 1,
    x: Number(row.x) || 56,
    y: Number(row.y) || 56,
    w: Number(row.w) || 760,
    h: Number(row.h) || 520,
  };
}

function readSnapshot(userId: string): WorkspaceSnapshot {
  if (typeof window === "undefined") {
    return { tabs: [], zTop: 20 };
  }
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) {
      return { tabs: [], zTop: 20 };
    }
    const parsed = JSON.parse(raw) as { tabs?: unknown; zTop?: unknown };
    const tabs = Array.isArray(parsed.tabs)
      ? parsed.tabs.map(normalizeTab).filter((tab): tab is WorkspaceTab => Boolean(tab))
      : [];
    return {
      tabs,
      zTop: typeof parsed.zTop === "number" && parsed.zTop > 0 ? parsed.zTop : 20,
    };
  } catch {
    return { tabs: [], zTop: 20 };
  }
}

function writeSnapshot(userId: string | null, tabs: WorkspaceTab[], zTop: number) {
  if (!userId || typeof window === "undefined") {
    return;
  }
  const snapshot: WorkspaceSnapshot = {
    tabs: tabs.filter((tab) => !tab.closing),
    zTop,
  };
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(snapshot));
  } catch {
    // Private mode or blocked storage should not crash tab updates.
  }
}

export const useWorkspace = create<WorkspaceState>((set, get) => ({
  ownerId: null,
  tabs: [],
  zTop: 20,
  resetForUser: (userId) => {
    if (get().ownerId === userId) {
      return;
    }
    const snapshot = readSnapshot(userId);
    set({ ownerId: userId, tabs: snapshot.tabs, zTop: snapshot.zTop });
  },
  clearWorkspace: () => set({ ownerId: null, tabs: [], zTop: 20 }),
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

useWorkspace.subscribe((state) => {
  writeSnapshot(state.ownerId, state.tabs, state.zTop);
});
