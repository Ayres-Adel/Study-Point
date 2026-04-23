"use client";

import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Star, Trophy, Crown, Medal, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGetLeaderboard, LeaderboardUser } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

const mockLeaders = [
  { name: "Amina B.", points: 2450, premium: true },
  { name: "Youcef M.", points: 2120, premium: false },
  { name: "Fatima Z.", points: 1980, premium: true },
  { name: "Karim H.", points: 1750, premium: false },
  { name: "Sara A.", points: 1680, premium: true },
  { name: "Mohamed L.", points: 1520, premium: false },
  { name: "Nour D.", points: 1340, premium: false },
  { name: "Rami K.", points: 1200, premium: false },
  { name: "Lina T.", points: 1050, premium: true },
  { name: "Omar S.", points: 980, premium: false },
];

const PODIUM_CONFIG = [
  { 
    rank: 2, 
    height: "h-32", 
    bg: "bg-gradient-to-t from-slate-500/20 to-slate-400/40",
    border: "border-slate-400/50", 
    text: "text-slate-300",
    shadow: "drop-shadow-[0_0_15px_rgba(203,213,225,0.4)]",
    icon: <Medal className="w-8 h-8 text-slate-300 mb-2" />
  },
  { 
    rank: 1, 
    height: "h-44", 
    bg: "bg-gradient-to-t from-amber-500/20 to-yellow-400/40",
    border: "border-yellow-400/60", 
    text: "text-yellow-400",
    shadow: "drop-shadow-[0_0_25px_rgba(250,204,21,0.6)]",
    icon: <Crown className="w-10 h-10 text-yellow-400 mb-2" />
  },
  { 
    rank: 3, 
    height: "h-24", 
    bg: "bg-gradient-to-t from-amber-700/20 to-amber-600/40",
    border: "border-amber-600/50", 
    text: "text-amber-500",
    shadow: "drop-shadow-[0_0_15px_rgba(217,119,6,0.4)]",
    icon: <Medal className="w-7 h-7 text-amber-500 mb-2" />
  }
];

export default function LeaderboardPage() {
  const user = useStore((s) => s.user);
  const points = useStore((s) => s.points);
  const accessToken = useStore((s) => s.accessToken);
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchLeaderboard() {
      if (accessToken) {
        try {
          const res = await apiGetLeaderboard(accessToken);
          if (res.leaderboard) {
            setLeaders(res.leaderboard);
          }
        } catch (err) {
          console.error("Failed to load leaderboard:", err);
        }
      }
    }
    fetchLeaderboard();
  }, [accessToken]);

  // Find user's rank
  let allPlayers = leaders.length > 0 ? [...leaders] : [
    ...mockLeaders.map(m => ({ id: 0, name: m.name, points: m.points, plan: (m.premium ? "premium" : "free") as "premium" | "free" }))
  ];

  const userInLeaderboard = allPlayers.find(p => p.name === user?.name);
  if (!userInLeaderboard && user) {
     allPlayers.push({ id: user.id || 0, name: user.name, points, plan: user.plan });
  }

  allPlayers.sort((a, b) => b.points - a.points);
  const userRank = allPlayers.findIndex((p) => p.name === (user?.name || t.leaderboard.you)) + 1;

  return (
    <PageTransition>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <AnimatedBackground />
        <main className="flex-1 overflow-auto relative z-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
            
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gold/20 shadow-[0_0_20px_rgba(242,201,76,0.15)]"
              >
                <Trophy className="w-8 h-8 text-gold" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 tracking-tight">{t.leaderboard.title}</h1>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                {t.leaderboard.resetsIn}
              </div>
            </div>

            {/* Podium */}
            <div className="flex justify-center items-end gap-3 sm:gap-6 mb-12 px-2">
              {[1, 0, 2].map((idx) => {
                const leader = allPlayers[idx];
                if (!leader) return null;
                const config = PODIUM_CONFIG[idx === 0 ? 1 : idx === 1 ? 0 : 2];
                const isFirst = idx === 0;

                return (
                  <div key={idx} className="flex flex-col items-center flex-1 max-w-[120px]">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: isFirst ? 0.3 : 0.4 }}
                      className={`flex flex-col items-center text-center ${config.shadow}`}
                    >
                      {config.icon}
                      <div className="relative">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-surface border-2 border-white/10 flex items-center justify-center text-sm sm:text-base font-bold text-foreground mb-2 overflow-hidden shadow-inner">
                          {leader.name.charAt(0)}
                        </div>
                        {leader.plan === "premium" && (
                          <div className="absolute -bottom-1 -right-1 bg-gold rounded-full p-0.5">
                            <Star className="w-3 h-3 text-navy-dark fill-navy-dark" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-foreground font-semibold line-clamp-1 break-all px-1">
                        {leader.name.split(" ")[0]}
                      </p>
                      <p className={`text-xs ${config.text} font-bold mb-3`}>
                        {leader.points} <span className="opacity-70 text-[10px]">{t.leaderboard.pts}</span>
                      </p>
                    </motion.div>
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: "100%" }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: isFirst ? 0 : 0.2 }}
                      className={`w-full ${config.height} ${config.bg} border-t border-l border-r ${config.border} rounded-t-xl sm:rounded-t-2xl relative overflow-hidden`}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer" />
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/50 font-bold text-2xl sm:text-4xl opacity-30">
                        {config.rank}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>

            {/* Full list */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-surface/40 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl"
            >
              <div className="space-y-2">
                {allPlayers.map((player, i) => {
                  if (i < 3) return null; // Skip podium players
                  const isUser = player.name === (user?.name || t.leaderboard.you);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + (i * 0.05) }}
                      key={i}
                      className={`flex items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 hover:bg-white/5 ${
                        isUser 
                          ? "bg-gold/5 border border-gold/30 shadow-[0_0_15px_rgba(242,201,76,0.1)]" 
                          : "border border-transparent hover:border-white/5"
                      }`}
                    >
                      <span className="text-sm font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isUser ? "bg-gold text-navy-dark" : "bg-white/10 text-foreground"}`}>
                        {player.name.charAt(0)}
                      </div>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm sm:text-base font-semibold truncate ${isUser ? "text-gold" : "text-foreground"}`}>
                            {player.name}
                          </span>
                          {player.plan === "premium" && <Star className="w-3.5 h-3.5 text-gold fill-gold shrink-0" />}
                        </div>
                        {isUser && <span className="text-[10px] uppercase tracking-wider text-gold/70 font-medium">{t.leaderboard.you}</span>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-base sm:text-lg font-bold ${isUser ? "text-gold" : "text-foreground"}`}>
                          {player.points}
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">{t.leaderboard.pts}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </main>
      <PointsToast />
    </div>
    </PageTransition>
  );
}
