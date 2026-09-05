"use client";

import { useLayoutEffect, useState } from "react";

const PREFIX = "peoplepay360-ui:";

function read(key: string) {
  try {
    return window.localStorage.getItem(`${PREFIX}${key}`);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, value);
  } catch {
    // Ignore blocked storage.
  }
}

export function usePersistedState(key: string, initial: string) {
  const [value, setValue] = useState(initial);

  useLayoutEffect(() => {
    const stored = read(key);
    if (stored !== null) {
      setValue(stored);
    }
  }, [key]);

  function update(next: string | ((current: string) => string)) {
    setValue((current) => {
      const resolved = typeof next === "function" ? next(current) : next;
      write(key, resolved);
      return resolved;
    });
  }

  return [value, update] as const;
}
