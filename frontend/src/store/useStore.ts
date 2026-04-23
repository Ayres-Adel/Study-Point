import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type ProfileResponse, apiAddPoints } from "@/lib/api";
import { type Language } from "@/lib/i18n";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}

interface Session {
  id: string;
  title: string;
  subject: string;
  date: string;
  messages: Message[];
  document_url?: string;
}

interface PointEntry {
  id: string;
  type: "quiz" | "exam" | "streak" | "login" | "onboarding" | "study" | "quiz_correct" | "exam_bonus" | "streak_bonus" | "redemption";
  label: string;
  amount: number;
  date: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface AppState {
  // Auth
  isAuthenticated: boolean;
  hasOnboarded: boolean;
  accessToken: string | null;
  user: {
    id: number;
    name: string;
    phone: string;
    email: string;
    level: string;
    goal: string;
    dailyTime: string;
    plan: "free" | "premium" | "weekly" | "monthly" | "yearly";
  } | null;

  // Points
  points: number;
  dailyPointsEarned: number;
  dailyCap: number;
  streak: number;
  longestStreak: number;
  streakMilestone: { badge: string; points: number } | null;
  pointsHistory: PointEntry[];

  // Sessions
  sessions: Session[];
  currentSession: Session | null;

  // Sidebar
  sidebarCollapsed: boolean;

  // Toast
  toastPoints: number | null;

  // App UI State
  isNewSessionMode: boolean;
  adWatchesToday: number;
  isLightMode: boolean;
  language: Language;

  // Actions
  setAuth: (user: { id: number; name: string; phone: string; email: string }, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  hydrateFromProfile: (profile: ProfileResponse) => void;
  login: (phone: string, name: string) => void;
  logout: () => void;
  completeOnboarding: (level: string, goal: string, dailyTime: string) => void;
  setPlan: (plan: "free" | "premium" | "weekly" | "monthly" | "yearly") => void;
  addPoints: (amount: number, type: PointEntry["type"], label: string) => void;
  deductPoints: (amount: number, label: string) => void;
  showPointsToast: (amount: number) => void;
  clearToast: () => void;
  setPointsHistory: (history: PointEntry[]) => void;
  startNewSession: () => void;
  createSession: (title: string, subject: string, id?: string) => Session;
  setSessions: (sessions: Session[]) => void;
  setCurrentSession: (session: Session | null) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  addMessage: (sessionId: string, message: Message) => void;
  removeSession: (sessionId: string) => void;
  incrementStreak: () => void;
  setStreak: (streak: number, longestStreak?: number) => void;
  setStreakMilestone: (milestone: { badge: string; points: number }) => void;
  clearStreakMilestone: () => void;
  toggleSidebar: () => void;
  incrementAdWatch: () => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      hasOnboarded: false,
      accessToken: null,
      user: null,
      points: 0,
      dailyPointsEarned: 0,
      dailyCap: 100,
      streak: 0,
      longestStreak: 0,
      streakMilestone: null,
      pointsHistory: [],
      sessions: [],
      currentSession: null,
      isNewSessionMode: false,
      sidebarCollapsed: false,
      toastPoints: null,
      adWatchesToday: 0,
      isLightMode: false,
      language: "en" as Language,

      setAuth: (user, accessToken) =>
        set({
          isAuthenticated: true,
          accessToken,
          user: { ...user, level: "", goal: "", dailyTime: "", plan: "free" },
        }),

      setAccessToken: (token) => set({ accessToken: token }),

      hydrateFromProfile: (profile) =>
        set((state) => ({
          points: profile.points,
          streak: profile.current_streak ?? profile.daily_streak ?? 0,
          longestStreak: profile.longest_streak ?? 0,
          hasOnboarded: !!(profile.level && profile.goal && profile.daily_time_commitment),
          user: state.user
            ? {
                ...state.user,
                name: profile.name,
                phone: profile.phone,
                email: profile.email,
                level: profile.level || "",
                goal: profile.goal || "",
                dailyTime: profile.daily_time_commitment || "",
                plan: profile.plan,
              }
            : {
                id: profile.id,
                name: profile.name,
                phone: profile.phone,
                email: profile.email,
                level: profile.level || "",
                goal: profile.goal || "",
                dailyTime: profile.daily_time_commitment || "",
                plan: profile.plan,
              },
        })),

      login: (phone, name) =>
        set({
          isAuthenticated: true,
          user: { id: 0, name, phone, email: "", level: "", goal: "", dailyTime: "", plan: "free" },
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          hasOnboarded: false,
          accessToken: null,
          user: null,
          points: 0,
          dailyPointsEarned: 0,
          streak: 0,
          longestStreak: 0,
          streakMilestone: null,
          pointsHistory: [],
          sessions: [],
          currentSession: null,
          isNewSessionMode: false,
        }),

      completeOnboarding: (level, goal, dailyTime) =>
        set((state) => ({
          hasOnboarded: true,
          user: state.user ? { ...state.user, level, goal, dailyTime } : null,
        })),

      setPlan: (plan: "free" | "premium" | "weekly" | "monthly" | "yearly") =>
        set((state) => ({
          user: state.user ? { ...state.user, plan } : null,
        })),

      addPoints: (amount, type, label) => {
        const state = get();
        // No daily cap — backend is source of truth for points
        if (amount <= 0) return;

        const entry: PointEntry = {
          id: Date.now().toString(),
          type,
          label,
          amount,
          date: new Date().toLocaleDateString(),
        };

        set({
          points: state.points + amount,
          dailyPointsEarned: state.dailyPointsEarned + amount,
          pointsHistory: [entry, ...state.pointsHistory],
          toastPoints: amount,
        });

        setTimeout(() => set({ toastPoints: null }), 1500);
      },

      deductPoints: (amount, label) => {
        const state = get();
        if (state.points < amount) return;

        const entry: PointEntry = {
          id: Date.now().toString(),
          type: "redemption" as PointEntry["type"],
          label,
          amount: -amount,
          date: new Date().toLocaleDateString(),
        };

        set({
          points: state.points - amount,
          pointsHistory: [entry, ...state.pointsHistory],
        });
      },

      showPointsToast: (amount) => {
        set({ toastPoints: amount });
        setTimeout(() => set({ toastPoints: null }), 1500);
      },

      clearToast: () => set({ toastPoints: null }),

      setPointsHistory: (history) => set({ pointsHistory: history }),

      setSessions: (sessions) => set({ sessions }),

      startNewSession: () => set({ currentSession: null, isNewSessionMode: true }),

      createSession: (title, subject, id) => {
        const session: Session = {
          id: id || Date.now().toString(),
          title,
          subject,
          date: new Date().toLocaleDateString(),
          messages: [],
        };
        set((state) => ({
          sessions: [session, ...state.sessions],
          currentSession: session,
          isNewSessionMode: false,
        }));
        return session;
      },

      setCurrentSession: (session) => set({ currentSession: session, isNewSessionMode: false }),

      setMessages: (sessionId, messages) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, messages } : s,
          ),
          currentSession:
            state.currentSession?.id === sessionId
              ? { ...state.currentSession, messages }
              : state.currentSession,
        })),

      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === sessionId ? { ...s, messages: [...s.messages, message] } : s,
          ),
          currentSession:
            state.currentSession?.id === sessionId
              ? { ...state.currentSession, messages: [...state.currentSession.messages, message] }
              : state.currentSession,
        })),

      removeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== sessionId),
          currentSession: state.currentSession?.id === sessionId ? null : state.currentSession,
        })),
      incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
      setStreak: (streak, longestStreak) =>
        set((state) => ({
          streak,
          longestStreak: longestStreak !== undefined ? longestStreak : Math.max(state.longestStreak, streak),
        })),
      setStreakMilestone: (milestone) => set({ streakMilestone: milestone }),
      clearStreakMilestone: () => set({ streakMilestone: null }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      incrementAdWatch: () => set((state) => ({ adWatchesToday: state.adWatchesToday + 1 })),
      toggleTheme: () => set((state) => ({ isLightMode: !state.isLightMode })),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "study-points-store",
    }
  )
);
