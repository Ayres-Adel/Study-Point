"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Button } from "@/components/ui/button";
import { Star, LogOut, Loader2, Sun, Moon, Flame, Trophy } from "lucide-react";
import { apiGetProfile, apiLogout, apiUpgradePlan } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";
import { type Language } from "@/lib/i18n";

export default function ProfilePage() {
  const user = useStore((s) => s.user);
  const points = useStore((s) => s.points);
  const streak = useStore((s) => s.streak);
  const longestStreak = useStore((s) => s.longestStreak);
  const hydrateFromProfile = useStore((s) => s.hydrateFromProfile);
  const logout = useStore((s) => s.logout);
  const accessToken = useStore((s) => s.accessToken);
  const setPlan = useStore((s) => s.setPlan);
  const isLightMode = useStore((s) => s.isLightMode);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const setLanguage = useStore((s) => s.setLanguage);
  const { t, language } = useTranslation();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const data = await apiGetProfile(accessToken);
        hydrateFromProfile(data);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [accessToken, hydrateFromProfile]);

  const handleLogout = async () => {
    if (accessToken) {
      try {
        await apiLogout(accessToken);
      } catch (err) {
        console.error("Logout API failed (ignoring locally):", err);
      }
    }
    logout();
    router.push("/");
  };

  const handleUpgrade = async () => {
    if (!accessToken) return;
    setUpgrading(true);
    try {
      await apiUpgradePlan(accessToken);
      setPlan("premium");
    } catch (err) {
      console.error("Upgrade failed:", err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <PageTransition>
        <AnimatedBackground />
        <div className="flex h-screen overflow-hidden">
          <AppSidebar />
          <main className="flex-1 flex flex-col items-center justify-center relative z-10">
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative z-10 p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="w-full max-w-4xl mx-auto my-auto bg-surface/60 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Left Column */}
              <div className="flex flex-col">
                {/* Avatar + Name */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center text-3xl font-bold text-gold shadow-lg shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-foreground mb-1">{user?.name || "Student"}</h1>
                    <p className="text-sm text-muted-foreground">{user?.phone}</p>
                    {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-surface/80 border border-white/5 rounded-2xl p-4 text-center shadow-inner hover:border-gold/30 transition-colors">
                    <p className="text-2xl font-bold text-gold">{points}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.profile.points}</p>
                  </div>
                  <div className="bg-surface/80 border border-white/5 rounded-2xl p-4 text-center shadow-inner hover:border-white/20 transition-colors">
                    <p className="text-2xl font-bold text-foreground">{streak}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.profile.streak}</p>
                  </div>
                  <div className="bg-surface/80 border border-white/5 rounded-2xl p-4 text-center truncate px-2 shadow-inner hover:border-white/20 transition-colors">
                    <p className="text-2xl font-bold text-foreground truncate">{user?.level || "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.profile.level}</p>
                  </div>
                </div>

                <div className="flex-1" />

                {/* Logout (Desktop Bottom Left) */}
                <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors py-6 rounded-2xl border border-transparent hover:border-red-400/20 text-sm mt-auto hidden lg:flex" onClick={handleLogout}>
                  <LogOut className="w-5 h-5 mr-2" />
                  {t.profile.logout}
                </Button>
              </div>

              {/* Right Column */}
              <div className="flex flex-col space-y-5">
                {/* Study Profile */}
                <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <h3 className="text-xs font-semibold text-foreground mb-4 uppercase tracking-widest text-muted-foreground">{t.profile.studyProfile}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t.profile.level}</span>
                      <span className="text-foreground font-medium bg-white/5 px-3 py-1.5 rounded-lg">{user?.level || t.profile.notSet}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t.profile.goal}</span>
                      <span className="text-foreground font-medium bg-white/5 px-3 py-1.5 rounded-lg">{user?.goal || t.profile.notSet}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t.profile.dailyTime}</span>
                      <span className="text-foreground font-medium bg-white/5 px-3 py-1.5 rounded-lg">{user?.dailyTime || t.profile.notSet}</span>
                    </div>
                  </div>
                </div>

                {/* Streak Stats */}
                {(() => {
                  const MILESTONES = [7, 14, 30, 100];
                  const nextMilestone = MILESTONES.find((m) => m > streak) ?? null;
                  const prevMilestone = nextMilestone
                    ? MILESTONES[MILESTONES.indexOf(nextMilestone) - 1] ?? 0
                    : MILESTONES[MILESTONES.length - 1];
                  const progress = nextMilestone
                    ? Math.min(((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100, 100)
                    : 100;
                  return (
                    <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 shadow-inner">
                      <h3 className="text-xs font-semibold mb-4 uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        {t.profile.streakStats.title}
                      </h3>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-amber-400 flex items-center justify-center gap-1">
                            <Flame className="w-5 h-5" />{streak}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.profile.streakStats.current}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                          <p className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                            <Trophy className="w-5 h-5 text-gold" />{longestStreak}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.profile.streakStats.longest}</p>
                        </div>
                      </div>
                      {nextMilestone ? (
                        <div>
                          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>{t.profile.streakStats.next} <span className="text-amber-400 font-semibold">{nextMilestone} {t.profile.streakStats.dayMilestone}</span></span>
                            <span>{streak}/{nextMilestone}</span>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${progress}%`,
                                background: "linear-gradient(90deg, #f97316, #f2c94c)",
                                boxShadow: "0 0 8px rgba(249,115,22,0.4)",
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-center text-amber-400 font-semibold">
                          {t.profile.streakStats.legend}
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* Plan */}
                <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
                        {user?.plan === "premium" ? t.profile.plan.premium : t.profile.plan.free} {t.profile.plan.title}
                        {user?.plan === "premium" && <Star className="w-4 h-4 text-gold fill-gold" />}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {user?.plan === "premium" ? t.profile.plan.unlocked : t.profile.plan.cap}
                      </p>
                    </div>
                    {user?.plan !== "premium" && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleUpgrade}
                        disabled={upgrading}
                        className="w-full sm:w-auto bg-gold text-navy hover:bg-gold-bright transition-all"
                      >
                        {upgrading ? t.profile.plan.upgrading : t.profile.plan.upgrade}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Appearance */}
                <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-widest text-muted-foreground">{t.profile.appearance}</h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isLightMode ? <Sun className="w-4 h-4 text-gold" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
                      <span className="text-sm text-foreground">{isLightMode ? t.profile.lightMode : t.profile.darkMode}</span>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                        isLightMode ? "bg-gold" : "bg-surface-elevated border border-white/20"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                          isLightMode ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Language */}
                <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-widest text-muted-foreground">{t.profile.language}</h3>
                  <div className="flex items-center gap-2">
                    {(["en", "ar", "fr"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`flex-1 py-2 text-sm rounded-xl font-medium transition-colors border ${
                          language === lang
                            ? "bg-gold/20 text-gold border-gold/40"
                            : "text-muted-foreground border-border hover:bg-foreground/5"
                        }`}
                      >
                        {lang === "en" ? "🇬🇧 English" : lang === "ar" ? "🇩🇿 عربية" : "🇫🇷 Français"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reminder */}
                <div className="bg-surface/80 border border-white/5 rounded-2xl p-5 shadow-inner">
                  <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-widest text-muted-foreground">{t.profile.reminder}</h3>
                  <select className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-gold/50 transition-colors shadow-sm cursor-pointer">
                    <option>8:00 AM</option>
                    <option>9:00 AM</option>
                    <option>6:00 PM</option>
                    <option>8:00 PM</option>
                    <option>Off</option>
                  </select>
                </div>
              </div>
              
              {/* Logout (Mobile Bottom) */}
              <Button variant="ghost" className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors py-6 rounded-2xl border border-transparent hover:border-red-400/20 text-sm lg:hidden mt-2" onClick={handleLogout}>
                <LogOut className="w-5 h-5 mr-2" />
                {t.profile.logout}
              </Button>
            </div>
          </div>
        </main>
      <PointsToast />
    </div>
    </PageTransition>
  );
}
