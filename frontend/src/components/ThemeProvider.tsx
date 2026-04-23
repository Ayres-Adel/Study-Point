"use client";

import { useEffect } from "react";
import { useStore } from "@/store/useStore";

export function ThemeProvider() {
  const isLightMode = useStore((s) => s.isLightMode);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add("light-mode");
    } else {
      document.documentElement.classList.remove("light-mode");
    }
  }, [isLightMode]);

  return null;
}
