"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, BookOpen, FileText, Brain, Trophy, Sparkles } from "lucide-react";
import { apiUpgradePlan, ApiError } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

type PricingPlan = "weekly" | "monthly" | "yearly";

const pricingOptions: Record<PricingPlan, { price: string; period: string; badge: string | null; badgeColor: string; save: string | null }> = {
  weekly: {
    price: "70",
    period: "per week",
    badge: null,
    badgeColor: "",
    save: null,
  },
  monthly: {
    price: "200",
    period: "per month",
    badge: "Most Popular",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    save: null,
  },
  yearly: {
    price: "1500",
    period: "per year",
    badge: "Best Value",
    badgeColor: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    save: "Save 900 DZD vs monthly",
  },
};

const freeFeatures = [
  { icon: FileText, text: "1 PDF upload total" },
  { icon: Brain, text: "5 AI questions per document" },
  { icon: BookOpen, text: "1 quiz per document" },
  { icon: Trophy, text: "1 final exam per document" },
  { icon: Star, text: "+2 pts per correct quiz answer" },
  { icon: Zap, text: "+20 pts if exam score ≥ 70%" },
];

const premiumFeatures = [
  { icon: FileText, text: "Unlimited PDF uploads" },
  { icon: Brain, text: "Unlimited AI questions" },
  { icon: BookOpen, text: "Unlimited quizzes" },
  { icon: Trophy, text: "Unlimited final exams" },
  { icon: Star, text: "+4 pts per correct quiz answer" },
  { icon: Zap, text: "+20 pts if exam score ≥ 70%" },
];

export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan>("monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setPlan = useStore((s) => s.setPlan);
  const accessToken = useStore((s) => s.accessToken);
  const router = useRouter();

  const handleFreePlan = () => {
    setPlan("free");
    router.push("/dashboard");
  };

  const handlePremiumUpgrade = async () => {
    setLoading(true);
    setError("");
    try {
      if (!accessToken) throw new Error("Not authenticated");
      await apiUpgradePlan(accessToken, selectedPlan);
      setPlan(selectedPlan);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to upgrade plan. Please try again.");
      }
      setLoading(false);
    }
  };

  const pricing = pricingOptions[selectedPlan];

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto relative z-10 py-8 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold text-foreground mb-2">Choose Your Plan</h1>
              <p className="text-muted-foreground">
                Unlock your full learning potential with Study Points Premium
              </p>
            </div>

            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            {/* Free vs Premium cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              {/* Free Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface/60 backdrop-blur-sm border border-white/8 rounded-2xl p-6"
              >
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-foreground mb-1">Free</h2>
                  <p className="text-2xl font-bold text-foreground">
                    0 <span className="text-sm font-normal text-muted-foreground">DZD forever</span>
                  </p>
                </div>
                <ul className="space-y-3 mb-6">
                  {freeFeatures.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                        <f.icon className="w-3 h-3 text-foreground" />
                      </div>
                      {f.text}
                    </li>
                  ))}
                  <li className="text-xs text-muted-foreground/60 italic pt-1 pl-9">No payment bonus</li>
                </ul>
                <Button
                  variant="outline"
                  className="w-full border-white/10 text-muted-foreground hover:bg-white/5"
                  onClick={handleFreePlan}
                >
                  Continue with Free
                </Button>
              </motion.div>

              {/* Premium Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface/60 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 relative overflow-hidden"
              >
                {/* Glow effect */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-3xl" />

                <div className="mb-4 relative">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-foreground">Premium</h2>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>

                  {/* 2x Points highlight */}
                  <div className="inline-flex items-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-full px-3 py-1 mb-3">
                    <Zap className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs font-bold text-purple-300">2× Quiz Points vs Free Plan</span>
                  </div>

                  {/* Pricing tabs */}
                  <div className="flex gap-1 bg-white/5 rounded-xl p-1 mb-3">
                    {(["weekly", "monthly", "yearly"] as PricingPlan[]).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setSelectedPlan(plan)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                          selectedPlan === plan
                            ? "bg-purple-600 text-white shadow-lg"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-3xl font-bold text-foreground">{pricing.price} DZD</span>
                    <span className="text-sm text-muted-foreground mb-1">{pricing.period}</span>
                    {pricing.badge && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-auto mb-1 ${pricing.badgeColor}`}>
                        {pricing.badge}
                      </span>
                    )}
                  </div>
                  {pricing.save && (
                    <p className="text-xs text-amber-400 font-medium">{pricing.save}</p>
                  )}
                  <p className="text-xs text-purple-300 mt-1">✓ Includes 7-day free trial</p>
                </div>

                <ul className="space-y-3 mb-6 relative">
                  {premiumFeatures.map((f) => (
                    <li key={f.text} className="flex items-center gap-3 text-sm text-foreground">
                      <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                        <f.icon className="w-3 h-3 text-purple-400" />
                      </div>
                      {f.text}
                    </li>
                  ))}
                  <li className="text-xs text-muted-foreground/60 italic pt-1 pl-9">No payment bonus</li>
                </ul>

                <Button
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold h-11 rounded-xl shadow-lg shadow-purple-500/20"
                  onClick={handlePremiumUpgrade}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Start 7-day free trial"}
                </Button>
              </motion.div>
            </div>

            {/* Bottom note */}
            <p className="text-center text-xs text-muted-foreground">
              Cancel anytime. No hidden fees. Premium users earn <strong className="text-purple-400">2× more points</strong> on every correct quiz answer.
            </p>
          </div>
        </main>
        <PointsToast />
      </div>
    </PageTransition>
  );
}
