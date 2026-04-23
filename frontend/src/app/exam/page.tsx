"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { StreakMilestoneModal } from "@/components/StreakMilestoneModal";
import { Button } from "@/components/ui/button";
import { Clock, Shield, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { apiSubmitExam, apiGenerateExam, AssessmentQuestion } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export default function ExamPage() {
  const [started, setStarted] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [examQuestions, setExamQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [submitted, setSubmitted] = useState(false);
  const addPoints = useStore((s) => s.addPoints);
  const setStreak = useStore((s) => s.setStreak);
  const setStreakMilestone = useStore((s) => s.setStreakMilestone);
  const { t } = useTranslation();
  const accessToken = useStore((s) => s.accessToken);
  const sessions = useStore((s) => s.sessions);
  const router = useRouter();

  useEffect(() => {
    if (!started || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started, submitted]);

  const handleSubmit = async () => {
    const correct = answers.filter((a, i) => a === examQuestions[i].correct).length;
    const score = Math.round((correct / examQuestions.length) * 100);
    
    if (accessToken) {
       try {
         const res = await apiSubmitExam(accessToken, null, examQuestions, score, examQuestions.length);
         if (res.awarded_points) {
             addPoints(res.awarded_points, "exam_bonus", `Final Exam: ${score}%`);
         }
         // Update streak in store
         if (res.streak !== undefined) {
             setStreak(res.streak, res.longest_streak);
         }
         // Show milestone modal if earned
         if (res.streak_milestone) {
             setStreakMilestone(res.streak_milestone);
         }
       } catch(err) {
         console.error("Failed to submit exam:", err);
       }
    }

    const params = new URLSearchParams({
      score: String(score),
      correct: String(correct),
      total: String(examQuestions.length),
      points: "0",
    });
    router.push(`/results?${params.toString()}`);
  };

  const selectAnswer = (index: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = index;
    setAnswers(newAnswers);

    if (currentQ < examQuestions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 400);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const startExam = async () => {
    setGenerating(true);
    try {
      const latestDocSession = [...sessions].sort((a,b) => Number(b.id) - Number(a.id)).find(s => s.document_url);
      const sessionId = latestDocSession ? Number(latestDocSession.id) : undefined;
      const res = await apiGenerateExam(accessToken || "", undefined, sessionId);
      if (res.exam_data && res.exam_data.length > 0) {
        setExamQuestions(res.exam_data);
        setAnswers(new Array(res.exam_data.length).fill(null));
        setStarted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  if (!started) {
    return (
      <PageTransition>
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <AnimatedBackground />
          {generating ? (
            <main className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 animate-spin text-gold mb-4" />
              <p className="text-muted-foreground animate-pulse">{t.exam.generating}</p>
            </main>
          ) : (
            <main className="flex-1 flex flex-col items-center justify-center px-4 relative z-10 overflow-y-auto py-10">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="max-w-md w-full bg-surface/40 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl text-center"
              >
                <div className="w-16 h-16 bg-gold/20 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <Shield className="w-8 h-8 text-gold" />
                </div>
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold text-foreground mb-2">{t.exam.title}</h2>
                  <p className="text-sm text-muted-foreground mb-8">{t.exam.subject}</p>
                </div>
                
                <div className="space-y-4 mb-8 text-left bg-white/5 p-5 rounded-2xl border border-white/5">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.exam.duration}</p>
                      <p className="text-xs text-muted-foreground">{t.exam.durationDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.exam.questionsCount}</p>
                      <p className="text-xs text-muted-foreground">{t.exam.questionsDesc}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.exam.passMark}</p>
                      <p className="text-xs text-muted-foreground">{t.exam.passDesc}</p>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="default" 
                  disabled={generating}
                  onClick={startExam}
                  className="w-full bg-gold hover:bg-gold-bright text-navy font-bold py-6 text-lg rounded-2xl shadow-[0_0_20px_rgba(242,201,76,0.3)]"
                >
                  {t.exam.beginBtn}
                </Button>
              </motion.div>
            </main>
          )}
          <PointsToast />
          <StreakMilestoneModal />
        </div>
      </PageTransition>
    );
  }

  const q = examQuestions[currentQ];
  const isLast = currentQ === examQuestions.length - 1;

  return (
    <PageTransition>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <AnimatedBackground />
        <main className="flex-1 flex flex-col px-4 relative z-10 overflow-y-auto pb-10">
          {/* Header / Timer & Progress */}
          <div className="pt-6 md:pt-8 px-2 max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-end mb-4">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">{t.exam.inProgress}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-gold font-bold text-lg md:text-xl">{t.exam.question} {currentQ + 1}</span>
                  <span className="text-muted-foreground text-sm font-medium">/ {examQuestions.length}</span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${timeLeft < 120 ? "bg-red-500/10 border-red-500/20 text-red-500 animate-pulse" : "bg-white/5 border-white/5 text-foreground"}`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
              </div>
            </div>
            
            <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
              <motion.div
                className="h-full bg-gold rounded-full shadow-[0_0_15px_rgba(242,201,76,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQ + 1) / examQuestions.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full pt-8 md:pt-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <div className="bg-surface/30 backdrop-blur-sm border border-white/5 rounded-2xl md:rounded-3xl p-5 md:p-7 mb-5 md:mb-6 shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h2 className="text-base md:text-lg font-semibold text-foreground text-center leading-relaxed">
                    {q.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-2 md:gap-2.5 w-full">
                  {q.options.map((opt, i) => {
                    const isSelected = answers[currentQ] === i;
                    
                    return (
                      <motion.button
                        key={i}
                        whileHover={{ scale: 1.005, x: 3 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => selectAnswer(i)}
                        className={`w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl border flex items-center gap-3 transition-all duration-300 text-left font-medium group ${
                          isSelected
                            ? "bg-gold/10 border-gold/40 text-gold shadow-[0_0_15px_rgba(242,201,76,0.1)]"
                            : "bg-surface/50 border-white/5 hover:border-white/20 hover:bg-white/5 text-foreground"
                        }`}
                      >
                        <span className={`w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] md:text-xs border transition-colors ${
                          isSelected
                            ? "bg-gold border-gold text-navy-dark font-bold"
                            : "bg-white/5 border-white/10 text-muted-foreground group-hover:border-gold/50 group-hover:text-gold"
                        }`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-xs md:text-base">{opt}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {isLast && answers[currentQ] !== null && (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="w-full mt-8"
              >
                <Button 
                  variant="default" 
                  className="w-full bg-gold text-navy-dark hover:bg-gold-bright h-12 rounded-xl font-bold text-base shadow-[0_0_20px_rgba(242,201,76,0.2)]"
                  onClick={handleSubmit}
                >
                  {t.exam.finalize}
                </Button>
                <p className="text-center text-[10px] text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  {t.exam.warning}
                </p>
              </motion.div>
            )}
          </div>
        </main>
        <PointsToast />
      </div>
    </PageTransition>
  );
}
