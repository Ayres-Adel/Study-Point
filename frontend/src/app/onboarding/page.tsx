"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { apiUpdateOnboarding, ApiError } from "@/lib/api";

const questions = [
  {
    question: "What's your study level?",
    options: [
      { label: "BAC", desc: "Preparing for Baccalauréat" },
      { label: "University", desc: "University student" },
      { label: "Professional", desc: "Professional certification" },
    ],
    key: "level",
  },
  {
    question: "What's your main goal?",
    options: [
      { label: "Pass exam", desc: "Focus on passing" },
      { label: "Improve grades", desc: "Get better scores" },
      { label: "Learn new skills", desc: "Expand knowledge" },
    ],
    key: "goal",
  },
  {
    question: "How much time per day?",
    options: [
      { label: "15 min", desc: "Quick sessions" },
      { label: "30 min", desc: "Focused practice" },
      { label: "1 hour+", desc: "Deep study" },
    ],
    key: "dailyTime",
  },
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const addPoints = useStore((s) => s.addPoints);
  const accessToken = useStore((s) => s.accessToken);
  const router = useRouter();

  const currentQ = questions[step];
  const isLast = step === questions.length - 1;

  const select = async (value: string) => {
    if (loading) return;

    const newAnswers = { ...answers, [currentQ.key]: value };
    setAnswers(newAnswers);

    if (isLast) {
      setLoading(true);
      setError("");
      try {
        if (!accessToken) throw new Error("Not authenticated");

        const res = await apiUpdateOnboarding(
          accessToken,
          newAnswers.level,
          newAnswers.goal,
          newAnswers.dailyTime
        );

        completeOnboarding(newAnswers.level, newAnswers.goal, newAnswers.dailyTime);
        if (res.awarded_points > 0) {
          addPoints(res.awarded_points, "onboarding", "Completed onboarding");
        }
        router.push("/plan");
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Failed to save. Please try again.");
        }
        setLoading(false);
      }
    } else {
      setTimeout(() => setStep(step + 1), 200);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Progress dots */}
        <div className="flex gap-2 mb-12">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i <= step ? "bg-foreground" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <h2 className="text-2xl font-medium text-foreground mb-4">{currentQ.question}</h2>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm text-center max-w-md w-full">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 w-full max-w-md">
          {currentQ.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => select(opt.label)}
              disabled={loading}
              className={`w-full p-4 rounded-xl border text-left transition-colors ${
                answers[currentQ.key] === opt.label
                  ? "border-foreground bg-surface-elevated"
                  : "border-border bg-surface hover:bg-surface-hover"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <p className="text-sm font-medium text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>

        {loading && (
          <p className="mt-6 text-sm text-muted-foreground">Setting up your experience...</p>
        )}
      </main>
      <PointsToast />
    </div>
  );
}
