"use client";

import { useEffect } from "react";
import { Toaster } from "sonner";
import { useStore } from "@/store/useStore";

export function ClientProviders() {
  const isLightMode = useStore((s) => s.isLightMode);
  const language = useStore((s) => s.language);

  useEffect(() => {
    const html = document.documentElement;
    // Theme
    if (isLightMode) html.classList.add("light-mode");
    else html.classList.remove("light-mode");
    // Language / RTL
    html.setAttribute("lang", language);
    html.setAttribute("dir", language === "ar" ? "rtl" : "ltr");
  }, [isLightMode, language]);

  return (
    <Toaster
      position={language === "ar" ? "bottom-left" : "bottom-right"}
      theme={isLightMode ? "light" : "dark"}
    />
  );
}
