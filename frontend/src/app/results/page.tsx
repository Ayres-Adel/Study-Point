"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";

function ResultsContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  
  const score = Number(searchParams.get("score")) || 0;
  const correct = Number(searchParams.get("correct")) || 0;
  const total = Number(searchParams.get("total")) || 20;
  const points = Number(searchParams.get("points")) || 0;
  const type = searchParams.get("type");

  const scoreColor = score >= 70 ? "text-success" : score >= 50 ? "text-warning" : "text-error";

  const weakAreas =
    score < 100
      ? [
          { topic: "Thermodynamics", score: "40%" },
          { topic: "Organic Chemistry", score: "50%" },
          { topic: "Calculus", score: "60%" },
        ].slice(0, score < 50 ? 3 : score < 70 ? 2 : 1)
      : [];

  return (
    <div className="max-w-md w-full text-center px-4">
      <h2 className="text-2xl font-bold text-foreground mb-1">{t.results.title}</h2>
      <p className="text-sm text-muted-foreground mb-6">{t.results.subtitle}</p>
      
      <h2 className={`text-5xl md:text-6xl font-semibold ${scoreColor} mb-2`}>{score}%</h2>
      <p className="text-sm md:text-base text-muted-foreground mb-8">
        {correct} out of {total} correct —{" "}
        {score >= 70
          ? t.results.excellent
          : score >= 50
            ? t.results.good
            : t.results.tryAgain}
      </p>

      {/* Points breakdown */}
      <div className="bg-surface border border-border rounded-xl p-4 md:p-6 mb-6 text-left shadow-sm">
        <h3 className="text-sm text-muted-foreground mb-3 font-medium">{t.results.pointsEarned}</h3>
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-foreground">{t.results.basePoints} ({correct} correct × 2)</span>
            <span className="text-gold font-bold">+{correct * 2} pts</span>
          </div>
          {type === "exam" && score >= 70 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-foreground">{t.results.scoreBonus}</span>
              <span className="text-purple-400 font-bold">+20 pts</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 flex justify-between items-center font-bold">
            <span className="text-foreground">{t.results.total}</span>
            <span className="text-gold">+{points} pts</span>
          </div>
        </div>
      </div>

      {/* Weak areas */}
      {weakAreas.length > 0 && (
        <div className="mb-8 text-left">
          <h3 className="text-sm text-muted-foreground mb-3">{t.results.areasToImprove}</h3>
          <div className="flex flex-wrap gap-2">
            {weakAreas.map((area) => (
              <span
                key={area.topic}
                className="px-3 py-1.5 bg-warning/10 text-warning border border-warning/20 rounded-full text-xs font-medium"
              >
                {area.topic} — {area.score}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/study" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">{t.results.studyButton}</Button>
        </Link>
        <Link href="/wallet" className="w-full sm:w-auto">
          <Button variant="default" className="w-full">{t.results.walletButton}</Button>
        </Link>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <PageTransition>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <AnimatedBackground />
        <main className="flex-1 flex flex-col items-center justify-center px-4 overflow-y-auto py-10 relative z-10">
          <Suspense fallback={<div className="text-muted-foreground animate-pulse">Loading results...</div>}>
            <ResultsContent />
          </Suspense>
        </main>
        <PointsToast />
      </div>
    </PageTransition>
  );
}
