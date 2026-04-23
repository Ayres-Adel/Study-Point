"use client";

import Link from "next/link";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { StreakMilestoneModal } from "@/components/StreakMilestoneModal";
import { BookOpen, HelpCircle, Flame, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGetProfile, apiListSessions, apiGetPointsHistory, apiDeleteSession } from "@/lib/api";
import { PageTransition } from "@/components/PageTransition";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useTranslation } from "@/hooks/useTranslation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DashboardPage() {
  const user = useStore((s) => s.user);
  const points = useStore((s) => s.points);
  const streak = useStore((s) => s.streak);
  const dailyPointsEarned = useStore((s) => s.dailyPointsEarned);
  const dailyCap = useStore((s) => s.dailyCap);
  const sessions = useStore((s) => s.sessions);
  const removeSession = useStore((s) => s.removeSession);
  const setCurrentSession = useStore((s) => s.setCurrentSession);
  
  const accessToken = useStore((s) => s.accessToken);
  const hydrateFromProfile = useStore((s) => s.hydrateFromProfile);
  const setSessions = useStore((s) => s.setSessions);
  const setPointsHistory = useStore((s) => s.setPointsHistory);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSession = async () => {
    if (!sessionToDelete || !accessToken) return;
    setIsDeleting(true);
    try {
      await apiDeleteSession(accessToken, parseInt(sessionToDelete));
      removeSession(sessionToDelete);
      setSessionToDelete(null);
    } catch (err) {
      console.error("Failed to delete session:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const [profileData, sessionsData, historyData] = await Promise.all([
          apiGetProfile(accessToken),
          apiListSessions(accessToken),
          apiGetPointsHistory(accessToken)
        ]);
        hydrateFromProfile(profileData);
        if (sessionsData.sessions) {
          setSessions(
            sessionsData.sessions.map((s) => ({
              id: s.id.toString(),
              title: s.title,
              subject: s.subject,
              date: new Date(s.created_at).toLocaleDateString(),
              messages: [],
              document_url: s.document_url
            }))
          );
        }
        if (historyData.history) {
          setPointsHistory(
            historyData.history.map((h) => ({
              id: h.id.toString(),
              type: h.type as any,
              label: h.label,
              amount: h.amount,
              date: new Date(h.created_at).toLocaleDateString(),
            }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch fresh data on dashboard mount:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [accessToken, hydrateFromProfile, setSessions, setPointsHistory]);

  const mobileData = Math.floor(points / 100) * 100;

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gold animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-xl font-medium text-foreground">
              {t.dashboard.greeting(user?.name || "Student", new Date().getHours() < 12 ? t.dashboard.morning : new Date().getHours() < 18 ? t.dashboard.afternoon : t.dashboard.evening)}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              {/* Streak counter — amber when active, subtle when 0 */}
              {streak > 0 ? (
                <span className="flex items-center gap-1.5 text-sm font-semibold text-amber-400">
                  <Flame className="w-4 h-4 text-amber-400" style={{ filter: "drop-shadow(0 0 4px rgba(251,146,60,0.7))" }} />
                  {streak} <span className="font-normal text-amber-300/80">days</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-muted-foreground/60 italic">
                  🔥 Start your streak today!
                </span>
              )}
              <span className="text-sm text-gold font-medium">{points} {t.dashboard.points.toLowerCase()}</span>
              <span className="text-xs text-muted-foreground">{t.wallet.mobileData(mobileData)}</span>
            </div>
          </div>

          {/* Daily progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>{t.profile.goal}</span>
              <span>
                {dailyPointsEarned} / {dailyCap} {t.dashboard.points.toLowerCase()}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gold rounded-full animate-progress-fill"
                style={{ width: `${Math.min((dailyPointsEarned / dailyCap) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {[
              { href: "/study", icon: BookOpen, label: t.dashboard.actions.study.title },
              { href: "/quiz", icon: HelpCircle, label: t.dashboard.actions.quiz.title },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="bg-surface hover:bg-surface-hover border border-border rounded-xl p-4 flex flex-col items-center gap-2 transition-colors"
              >
                <card.icon className="w-5 h-5 text-foreground" />
                <span className="text-sm text-foreground">{card.label}</span>
              </Link>
            ))}
          </div>

          {/* Recent Sessions */}
          <div className="bg-surface/60 border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest text-muted-foreground">{t.dashboard.recentSessions}</h2>
            {sessions.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-muted-foreground/70">
                  {t.dashboard.noSessions}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.slice(0, 10).map((s) => (
                  <div key={s.id} className="group relative flex items-center">
                    <Link
                      href="/study"
                      onClick={() => setCurrentSession(s)}
                      className="flex-1 flex items-center justify-between px-4 py-3 bg-surface/40 border border-white/5 rounded-xl hover:border-gold/30 hover:bg-surface/80 transition-all pr-12"
                    >
                      <span className="text-sm font-medium text-foreground truncate">{s.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-3 bg-white/5 px-2 py-1 rounded-md">{s.date}</span>
                    </Link>
                    <button
                      onClick={() => setSessionToDelete(s.id)}
                      className="absolute right-3 p-2 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400/10 rounded-lg"
                      title={t.common.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <PointsToast />
      <StreakMilestoneModal />

      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent className="bg-surface border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.dashboard.deleteDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.dashboard.deleteDialog.desc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border hover:bg-white/5">{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSession();
              }}
              className="bg-red-500 hover:bg-red-600 text-white border-none"
              disabled={isDeleting}
            >
              {isDeleting ? t.common.deleting : t.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </PageTransition>
  );
}
