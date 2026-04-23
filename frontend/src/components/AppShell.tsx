"use client";

import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import AnimatedBackground from "@/components/AnimatedBackground";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto relative">
        <AnimatedBackground />
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </main>
      <PointsToast />
    </div>
  );
}
