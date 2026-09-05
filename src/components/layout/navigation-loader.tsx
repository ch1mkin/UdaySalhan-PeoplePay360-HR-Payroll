"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAppLoader } from "@/store/loader";
import { LoaderOverlay } from "@/components/ui/rupee-loader";

export function NavigationLoader() {
  const pathname = usePathname();
  const count = useAppLoader((state) => state.count);
  const start = useAppLoader((state) => state.start);
  const stop = useAppLoader((state) => state.stop);
  const started = useRef(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
    if (started.current) {
      stop();
      started.current = false;
    }
  }, [pathname, stop]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      const target = (event.target as HTMLElement | null)?.closest("a");
      if (!target) {
        return;
      }
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }
      if (target.target === "_blank" || target.hasAttribute("download")) {
        return;
      }
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }
      if (`${url.pathname}${url.search}` === `${window.location.pathname}${window.location.search}`) {
        return;
      }
      if (started.current) {
        return;
      }
      timer.current = window.setTimeout(() => {
        started.current = true;
        start();
      }, 180);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  if (count <= 0) {
    return null;
  }

  return <LoaderOverlay />;
}
