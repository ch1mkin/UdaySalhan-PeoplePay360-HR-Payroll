import { create } from "zustand";

type LoaderState = {
  count: number;
  start: () => void;
  stop: () => void;
};

export const useAppLoader = create<LoaderState>((set) => ({
  count: 0,
  start: () => set((state) => ({ count: state.count + 1 })),
  stop: () => set((state) => ({ count: Math.max(0, state.count - 1) })),
}));
