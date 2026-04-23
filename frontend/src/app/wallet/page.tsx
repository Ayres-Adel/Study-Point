"use client";

import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { BookOpen, HelpCircle, Flame, LogIn, Award, Zap } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTranslation } from "@/hooks/useTranslation";

const iconMap: Record<string, React.ElementType> = {
  quiz: HelpCircle,
  exam: Award,
  quiz_correct: HelpCircle,
  exam_bonus: Award,
  streak: Flame,
  streak_bonus: Flame,
  login: LogIn,
  onboarding: Award,
  study: BookOpen,
  redemption: Zap,
};

// Color classes per type
function getEntryStyle(type: string): { accent: string; amount: string; border: string } {
  if (type === "streak_bonus") {
    return {
      accent: "text-purple-400",
      amount: "text-purple-400",
      border: "border-l-2 border-purple-500 bg-purple-500/5",
    };
  }
  if (type === "quiz_correct" || type === "exam_bonus" || type === "quiz" || type === "exam") {
    return {
      accent: "text-teal-400",
      amount: "text-teal-400",
      border: "border-l-2 border-teal-500 bg-teal-500/5",
    };
  }
  // default: gold
  return {
    accent: "text-gold",
    amount: "text-gold",
    border: "",
  };
}

export default function WalletPage() {
  const points = useStore((s) => s.points);
  const dailyPointsEarned = useStore((s) => s.dailyPointsEarned);
  const dailyCap = useStore((s) => s.dailyCap);
  const pointsHistory = useStore((s) => s.pointsHistory);
  const { t } = useTranslation();

  const mobileData = Math.floor(points / 100) * 100;
  const nextReward = 100 - (points % 100);

  return (
    <>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
      <main className="flex-1 overflow-auto relative z-10">
        <div className="max-w-2xl mx-auto px-6 py-8">
          {/* Balance */}
          <div className="text-center mb-8">
            <p className="text-4xl font-semibold text-gold mb-1">{points}</p>
            <p className="text-sm text-muted-foreground">{t.wallet.mobileData(mobileData)}</p>
          </div>

          {/* Progress to next reward */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{t.wallet.nextReward}</span>
              <span>{nextReward} {t.wallet.ptsToGo}</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full"
                style={{ width: `${((100 - nextReward) / 100) * 100}%` }}
              />
            </div>
          </div>

          {/* Daily cap */}
          <div className="bg-surface border border-border rounded-xl p-4 mb-8 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="text-gold font-medium">{dailyPointsEarned}</span> {t.wallet.of}{" "}
              <span className="text-foreground">{dailyCap}</span> {t.wallet.earnedToday}
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" /> Quiz &amp; Exam</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400 inline-block" /> Streak Bonus</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gold inline-block" /> Other</span>
          </div>

          {/* History */}
          <div>
            <h2 className="text-sm text-muted-foreground mb-3">{t.wallet.history}</h2>
            {pointsHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground/50">
                {t.wallet.noHistory}
              </p>
            ) : (
              <div className="space-y-1">
                {pointsHistory.map((entry) => {
                  const Icon = iconMap[entry.type] || BookOpen;
                  const style = getEntryStyle(entry.type);
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${style.border}`}
                    >
                      <Icon className={`w-4 h-4 ${style.accent} shrink-0`} />
                      <span className="text-sm text-foreground flex-1">{entry.label}</span>
                      <span className={`text-sm font-medium ${style.amount}`}>
                        {entry.amount > 0 ? "+" : ""}{entry.amount}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
      <PointsToast />
    </div>
    </>
  );
}
