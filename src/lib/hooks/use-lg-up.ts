"use client";

import { useEffect, useState } from "react";

const QUERY = "(min-width: 1024px)";

export function useLgUp() {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return matches;
}
