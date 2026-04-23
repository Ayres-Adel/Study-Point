"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Button } from "@/components/ui/button";
import { apiGetQuizzes, apiGenerateQuiz, ApiQuiz } from "@/lib/api";
import { Plus, Brain, Trophy, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTranslation } from "@/hooks/useTranslation";

export default function QuizHistoryPage() {
  const router = useRouter();
  const accessToken = useStore((s) => s.accessToken);
  const [quizzes, setQuizzes] = useState<ApiQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (accessToken) {
      apiGetQuizzes(accessToken)
        .then((res) => {
          setQuizzes(res.quizzes || []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load quizzes", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const sessions = useStore((s) => s.sessions);
  const latestDocSession = [...sessions].sort((a,b) => Number(b.id) - Number(a.id)).find(s => s.document_url);
  const canGenerate = !!latestDocSession;

  const handleGenerateQuiz = async () => {
    if (!accessToken || !latestDocSession) return;
    setGenerating(true);
    try {
      const res = await apiGenerateQuiz(accessToken, undefined, Number(latestDocSession.id));
      if (res.quiz_id) {
        router.push(`/quiz/${res.quiz_id}`);
      }
    } catch (err) {
      console.error("Failed to generate quiz", err);
      setGenerating(false);
    }
  };

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col px-6 py-8 overflow-auto relative z-10">
          <div className="flex items-center justify-between mx-auto max-w-4xl w-full mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">{t.quiz.title}</h1>
              <p className="text-sm text-muted-foreground">{t.quiz.subtitle}</p>
            </div>
            <Button 
              onClick={handleGenerateQuiz} 
              disabled={generating || !canGenerate} 
              className={`gap-2 ${canGenerate ? 'bg-gold text-navy hover:bg-gold-bright' : 'bg-surface-elevated text-muted-foreground'}`}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {generating ? "Generating..." : !canGenerate ? "Upload PDF in Study" : "Generate New Quiz"}
            </Button>
          </div>

          <div className="mx-auto max-w-4xl w-full">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-gold animate-spin" />
              </div>
            ) : quizzes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-surface border border-white/5 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <Brain className="w-8 h-8 text-gold" />
                </div>
                <h2 className="text-lg font-medium text-foreground mb-2">{t.quiz.noQuizzes}</h2>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                  {t.quiz.noQuizzesDesc}
                </p>
                <Button onClick={() => router.push('/study')} className="bg-gold text-navy hover:bg-gold-bright">
                  Go to Study Chat
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quizzes.map((quiz, idx) => {
                  const totalScore = parseInt((quiz.score as unknown as string) || "0", 10);
                  const totalQ = parseInt((quiz.total_questions as unknown as string) || "0", 10);
                  const isPlayed = totalQ > 0;
                  
                  return (
                    <div key={quiz.id} className="bg-surface border border-white/5 shadow-xl rounded-2xl p-5 hover:border-gold/30 transition-all flex flex-col group">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-gold transition-colors">
                            Quiz #{quizzes.length - idx}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(quiz.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isPlayed ? 'bg-green-500/10 text-green-500' : 'bg-gold/10 text-gold'}`}>
                          {isPlayed ? <Trophy className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
                        </div>
                      </div>
                      
                      <div className="mt-auto">
                        {isPlayed ? (
                           <div className="flex justify-between items-end mb-4">
                              <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">{t.quiz.score}</p>
                                <p className="text-xl font-bold text-foreground">
                                  {totalScore} <span className="text-sm font-medium text-muted-foreground">/ {totalQ}</span>
                                </p>
                              </div>
                           </div>
                        ) : (
                           <p className="text-xs text-gold font-bold mb-4 pb-2 border-b border-white/10 uppercase tracking-widest">
                             {t.quiz.pending}
                           </p>
                        )}
                        
                        {isPlayed ? (
                          <Button variant="outline" disabled className="w-full border-white/10 text-muted-foreground bg-white/5 opacity-70 cursor-not-allowed">
                            Completed
                          </Button>
                        ) : (
                          <Link href={`/quiz/${quiz.id}`} className="block w-full">
                            <Button variant="default" className="w-full bg-gold text-navy hover:bg-gold-bright">
                              {t.quiz.take}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
        <PointsToast />
      </div>
    </PageTransition>
  );
}
