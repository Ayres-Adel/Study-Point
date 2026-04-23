"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { StreakMilestoneModal } from "@/components/StreakMilestoneModal";
import { Button } from "@/components/ui/button";
import { apiSubmitQuiz, apiGetQuiz, AssessmentQuestion } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

export default function QuizPlayerPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<AssessmentQuestion[]>([]);
  
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionPoints, setSessionPoints] = useState(0);
  const addPoints = useStore((s) => s.addPoints);
  const setStreak = useStore((s) => s.setStreak);
  const setStreakMilestone = useStore((s) => s.setStreakMilestone);
  const accessToken = useStore((s) => s.accessToken);
  const { t } = useTranslation();

  useEffect(() => {
    if (!id || !accessToken) {
      if (!accessToken && id) setLoading(false); // Can't fetch if no token, might route away.
      return;
    }
    
    apiGetQuiz(accessToken, Number(id))
      .then((res) => {
        if (res.quiz && res.quiz.quiz_data) {
          // In case MySQL didn't parse automatically, we handle parsing.
          let parsedData = res.quiz.quiz_data;
          if (typeof parsedData === "string") {
            try { parsedData = JSON.parse(parsedData); } catch {}
          }
          setQuizQuestions(parsedData as AssessmentQuestion[]);
        }
      })
      .catch((err) => {
        console.error("Failed to load quiz", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, accessToken]);

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </main>
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col items-center justify-center">
          <p className="text-muted-foreground mb-4">{t.quiz.player.error}</p>
          <Button onClick={() => router.push("/quiz")}>{t.quiz.player.back}</Button>
        </main>
      </div>
    );
  }

  const q = quizQuestions[currentQ];

  const selectAnswer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);

    if (index === q.correct) {
      setScore(prev => prev + 1);
    } else {
      setShowExplanation(true);
    }

    setTimeout(() => {
      if (currentQ < quizQuestions.length - 1) {
        setCurrentQ(prev => prev + 1);
        setSelected(null);
        setShowExplanation(false);
      } else {
        const finalScore = score + (index === q.correct ? 1 : 0);
        
        if (accessToken && id) {
          apiSubmitQuiz(accessToken, Number(id), finalScore, quizQuestions.length)
             .then(res => {
                 if (res.awarded_points) {
                     setSessionPoints(res.awarded_points);
                     addPoints(res.awarded_points, "quiz_correct", "Quiz completed");
                 }
                 // Update streak in store
                 if (res.streak !== undefined) {
                     setStreak(res.streak, res.longest_streak);
                 }
                 // Show milestone modal if earned
                 if (res.streak_milestone) {
                     setStreakMilestone(res.streak_milestone);
                 }
             })
             .catch(err => console.error("Failed to submit quiz:", err));
        }

        setFinished(true);
      }
    }, 2000); 
  };

  if (finished) {
    return (
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col items-center justify-center px-4">
          <h2 className="text-3xl font-medium text-foreground mb-2">
            {score} / {quizQuestions.length}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {score >= quizQuestions.length * 0.7
              ? t.quiz.player.excellent
              : score >= quizQuestions.length * 0.5
                ? t.quiz.player.good
                : t.quiz.player.keepStudying}
          </p>
          <p className="text-gold font-medium text-lg mb-8">+{sessionPoints} {t.quiz.player.earned}</p>
          <div className="flex gap-3">
            <Link href="/quiz">
              <Button variant="outline">{t.quiz.player.back}</Button>
            </Link>
            <Button onClick={() => router.push('/exam')} className="bg-gold text-navy hover:bg-gold-bright">
              {t.quiz.player.takeFinal}
            </Button>
          </div>
        </main>
        <PointsToast />
        <StreakMilestoneModal />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 flex flex-col px-4">
        <div className="pt-6 px-2 max-w-2xl mx-auto w-full flex items-center justify-between mb-2">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={() => router.push("/quiz")}>
            ← Back
          </Button>
        </div>

        {/* Progress bar */}
        <div className="px-2 max-w-2xl mx-auto w-full">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / quizQuestions.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-muted-foreground">
              {t.quiz.player.question} {currentQ + 1} {t.quiz.player.of} {quizQuestions.length}
            </p>
            <p className="text-xs text-muted-foreground">
              {t.quiz.player.score}: {score}
            </p>
          </div>
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
          <h2 className="text-lg font-medium text-foreground text-center mb-8">{q.question}</h2>

          <div className="space-y-3 w-full">
            {q.options.map((opt, i) => {
              let borderColor = "border-border";
              if (selected !== null) {
                if (i === q.correct) borderColor = "border-success";
                else if (i === selected) borderColor = "border-error";
              }

              return (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  disabled={selected !== null}
                  className={`w-full p-4 rounded-xl border ${borderColor} bg-surface hover:bg-surface-hover text-left transition-all text-sm text-foreground disabled:cursor-default`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <p className="mt-4 text-sm text-muted-foreground max-w-lg text-center animate-in fade-in zoom-in duration-300">
              {q.explanation}
            </p>
          )}
        </div>
      </main>
      <PointsToast />
    </div>
  );
}
