"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/store/useStore";
import { Flame, X, Trophy } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export function StreakMilestoneModal() {
  const milestone = useStore((s) => s.streakMilestone);
  const clearStreakMilestone = useStore((s) => s.clearStreakMilestone);
  const streak = useStore((s) => s.streak);
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") clearStreakMilestone();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [clearStreakMilestone]);

  if (!milestone) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) clearStreakMilestone();
      }}
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-sm bg-surface border border-white/10 rounded-3xl p-8 shadow-2xl text-center"
        style={{
          animation: "milestoneEntrance 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >
        {/* Dismiss button */}
        <button
          onClick={clearStreakMilestone}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-white/10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated flame burst */}
        <div className="relative mx-auto w-24 h-24 mb-5 flex items-center justify-center">
          {/* Outer glow ring */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(251,146,60,0.35) 0%, transparent 70%)",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          {/* Inner badge */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Flame className="w-10 h-10 text-amber-400" style={{ filter: "drop-shadow(0 0 8px rgba(251,146,60,0.7))" }} />
          </div>
        </div>

        {/* Confetti dots */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: ["#f2c94c", "#14b8a6", "#a855f7", "#f97316", "#ec4899"][i % 5],
                left: `${10 + (i * 7) % 80}%`,
                top: `${5 + (i * 13) % 50}%`,
                animation: `confettiFall ${0.8 + (i * 0.15)}s ease-out ${i * 0.06}s both`,
                opacity: 0,
              }}
            />
          ))}
        </div>

        {/* Title */}
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
          {t.modals.milestone.title}
        </p>

        {/* Badge name */}
        <h2 className="text-2xl font-bold text-foreground mb-1">{milestone.badge}</h2>

        {/* Streak number */}
        <p className="text-sm text-muted-foreground mb-6">
          <span className="text-amber-400 font-bold">{streak}</span> {t.modals.milestone.days}
        </p>

        {/* Points earned */}
        <div className="flex items-center justify-center gap-2 bg-teal-500/10 border border-teal-500/30 rounded-2xl py-3 px-5 mb-6 mx-auto w-fit">
          <Trophy className="w-4 h-4 text-teal-400" />
          <span className="text-teal-400 font-bold text-xl">+{milestone.points}</span>
          <span className="text-teal-300/70 text-sm font-medium">{t.modals.milestone.bonus}</span>
        </div>

        {/* Close button */}
        <button
          onClick={clearStreakMilestone}
          className="w-full py-3 px-6 rounded-2xl font-bold text-sm transition-all duration-200 text-navy"
          style={{
            background: "linear-gradient(135deg, #f2c94c, #f97316)",
            boxShadow: "0 4px 20px rgba(242,201,76,0.3)",
          }}
        >
          {t.modals.milestone.button}
        </button>
      </div>

      <style>{`
        @keyframes milestoneEntrance {
          from { opacity: 0; transform: scale(0.7) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes confettiFall {
          from { opacity: 0; transform: translateY(-10px) rotate(0deg); }
          50%  { opacity: 1; }
          to   { opacity: 0; transform: translateY(40px) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
