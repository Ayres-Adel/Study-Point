"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Button } from "@/components/ui/button";
import { Check, Smartphone, Wifi, Gift, X, Zap, Flame } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { apiRedeemReward } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";

const REWARDS = [
  {
    id: "r1",
    name: "50 DZD Mobilis Credit",
    description: "50 DZD mobile credit added to your Mobilis number",
    cost: 50,
    icon: Smartphone,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
  },
  {
    id: "r2",
    name: "200 DZD Mobilis Credit",
    description: "200 DZD mobile credit added to your Mobilis number",
    cost: 150,
    icon: Smartphone,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
  },
  {
    id: "r3",
    name: "500 DZD Mobilis Credit",
    description: "500 DZD mobile credit added to your Mobilis number",
    cost: 400,
    icon: Gift,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
  },
  {
    id: "r4",
    name: "1 GB Mobilis Data",
    description: "1 GB of mobile data added to your Mobilis number",
    cost: 800,
    icon: Wifi,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
  },
];

export default function RewardsPage() {
  const [confirming, setConfirming] = useState<(typeof REWARDS)[0] | null>(null);
  const [redeemed, setRedeemed] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const points = useStore((s) => s.points);
  const deductPoints = useStore((s) => s.deductPoints);
  const accessToken = useStore((s) => s.accessToken);
  const { t } = useTranslation();

  // Find the next reward the user can't yet afford (progress target)
  const nextReward = REWARDS.find((r) => r.cost > points);
  const progressPercent = nextReward
    ? Math.min(100, Math.round((points / nextReward.cost) * 100))
    : 100;

  const handleConfirmRedeem = async () => {
    if (!confirming) return;
    setRedeeming(true);
    try {
      if (accessToken) {
        await apiRedeemReward(accessToken, confirming.cost, confirming.name);
      }
      deductPoints(confirming.cost, `Redeemed: ${confirming.name}`);
      setRedeemed(confirming.id);
      setConfirming(null);
      setTimeout(() => setRedeemed(null), 3000);
    } catch (err) {
      console.error("Failed to redeem reward:", err);
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto relative z-10">
          <div className="max-w-2xl mx-auto px-6 py-8">

            {/* Points balance header */}
            <div className="bg-surface/60 backdrop-blur-sm border border-white/8 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-1">{t.rewards.balance}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">{points}</span>
                    <span className="text-muted-foreground text-sm">{t.rewards.points}</span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <Zap className="w-7 h-7 text-gold" />
                </div>
              </div>

              {/* Progress bar toward next reward */}
              {nextReward ? (
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{progressPercent}% toward next reward</span>
                    <span>{nextReward.cost - points} pts needed for "{nextReward.name}"</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gold to-gold-bright rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  You can afford all rewards!
                </div>
              )}
            </div>

            {/* How to earn points */}
            <div className="mb-3 bg-white/3 border border-white/5 rounded-xl px-4 py-3 flex items-center gap-3">
              <Zap className="w-4 h-4 text-gold shrink-0" />
              <p className="text-xs text-muted-foreground">
                {t.rewards.earnDesc.split('(')[0]}
                <strong className="text-foreground">+2 pts</strong> {t.rewards.earnDesc.split('(+2 pts)')[1] || t.rewards.earnDesc.substring(t.rewards.earnDesc.indexOf('per'))}
              </p>
            </div>

            {/* How streaks work */}
            <div className="mb-6 bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
              <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <strong className="text-amber-400">{t.rewards.streakTitle}:</strong> {t.rewards.streakDesc1}
                </p>
                <p>
                  {t.rewards.streakDesc2}
                  <strong className="text-foreground ml-1">7 days (+15 pts)</strong>, 
                  <strong className="text-foreground ml-1">14 days (+30 pts)</strong>, 
                  <strong className="text-foreground ml-1">30 days (+75 pts)</strong>, 
                  <strong className="text-foreground ml-1">100 days (+200 pts)</strong>.
                </p>
              </div>
            </div>

            {/* Reward cards */}
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">{t.rewards.storeTitle}</h2>
            <div className="space-y-3">
              {REWARDS.map((reward, idx) => {
                const canAfford = points >= reward.cost;
                const isRedeemed = redeemed === reward.id;

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.07 }}
                    className={`relative bg-surface/60 border rounded-2xl p-4 flex items-center gap-4 transition-all ${
                      isRedeemed
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : canAfford
                        ? "border-white/10 hover:border-gold/30"
                        : "border-white/5 opacity-70"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${reward.iconBg} flex items-center justify-center shrink-0`}>
                      <reward.icon className={`w-6 h-6 ${reward.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{reward.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{reward.description}</p>
                      <p className="text-xs font-bold text-gold mt-1">{reward.cost} points</p>
                    </div>
                    <div className="shrink-0">
                      {isRedeemed ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
                          <Check className="w-4 h-4" />
                          Redeemed!
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!canAfford}
                          onClick={() => setConfirming(reward)}
                          className={`text-xs font-semibold rounded-lg px-4 ${
                            canAfford
                              ? "bg-purple-600 hover:bg-purple-500 text-white"
                              : "bg-white/5 text-muted-foreground cursor-not-allowed"
                          }`}
                        >
                          {canAfford ? "Redeem" : "Not enough"}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Confirmation modal */}
        <AnimatePresence>
          {confirming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4"
              onClick={() => setConfirming(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground">{t.rewards.confirm.title}</h3>
                  <button onClick={() => setConfirming(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <p className="text-sm text-foreground font-medium">{confirming.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{confirming.description}</p>
                  <p className="text-gold font-bold mt-2">{confirming.cost} {t.rewards.points}</p>
                </div>
                <p className="text-xs text-muted-foreground mb-5">
                  {t.rewards.balance}: <strong className="text-foreground">{points - confirming.cost} {t.rewards.points}</strong>
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-white/10"
                    onClick={() => setConfirming(null)}
                  >
                    {t.rewards.confirm.cancel}
                  </Button>
                  <Button
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white"
                    onClick={handleConfirmRedeem}
                    disabled={redeeming}
                  >
                    {redeeming ? "..." : t.rewards.confirm.confirm}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <PointsToast />
      </div>
    </PageTransition>
  );
}
