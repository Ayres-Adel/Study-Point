"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import { BrandLogo } from "@/components/BrandLogo";
import { apiLogout, apiDeleteSession } from "@/lib/api";
import {
  Home,
  BookOpen,
  HelpCircle,
  Wallet,
  Gift,
  Trophy,
  Settings,
  LogOut,
  MessageSquare,
  Plus,
  PanelLeft,
  Trash2,
} from "lucide-react";
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
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { type Language } from "@/lib/i18n";

const navItems = [
  { href: "/dashboard", labelKey: "home" as const, icon: Home },
  { href: "/study",     labelKey: "study" as const, icon: BookOpen },
  { href: "/quiz",      labelKey: "quiz" as const,  icon: HelpCircle },
  { href: "/wallet",    labelKey: "wallet" as const, icon: Wallet },
  { href: "/rewards",   labelKey: "rewards" as const, icon: Gift },
  { href: "/leaderboard", labelKey: "leaderboard" as const, icon: Trophy },
] as const;

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useStore((s) => s.user);
  const sessions = useStore((s) => s.sessions);
  const logout = useStore((s) => s.logout);
  const accessToken = useStore((s) => s.accessToken);
  const setCurrentSession = useStore((s) => s.setCurrentSession);
  const startNewSession = useStore((s) => s.startNewSession);
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const removeSession = useStore((s) => s.removeSession);
  const setLanguage = useStore((s) => s.setLanguage);
  const { t, language } = useTranslation();

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

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          !sidebarCollapsed ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => !sidebarCollapsed && toggleSidebar()}
      />
      
      <aside
        className={`h-screen bg-card flex flex-col z-40 transition-all duration-300 transition-colors duration-300 ease-in-out border-r border-border ${
          sidebarCollapsed ? "w-[70px] min-w-[70px] relative" : "w-[260px] min-w-[260px] absolute md:relative inset-y-0 left-0"
        }`}
      >
      {/* Header with Logo & Toggle */}
      <div className={`px-4 py-4 flex items-center justify-between overflow-hidden`}>
        {!sidebarCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <BrandLogo className="h-9 w-auto shrink-0" />
            <span className="text-sidebar-foreground font-medium text-sm">StudyPoint</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className={`p-2 rounded-lg hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-colors ${
            sidebarCollapsed ? "mx-auto" : ""
          }`}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <PanelLeft className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Nav Links */}
      <nav className={`px-2 space-y-1 mt-2`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative group ${
                isActive
                  ? "bg-gold/15 text-gold border border-gold/25"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              } ${sidebarCollapsed ? "justify-center px-0" : ""}`}
            >
              <item.icon className={`w-4 h-4 shrink-0 rtl-flip ${isActive ? "text-gold" : ""}`} />
              {!sidebarCollapsed && (
                <span className="animate-in fade-in duration-300 whitespace-nowrap">{t.nav[item.labelKey]}</span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-surface-elevated text-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-border">
                  {t.nav[item.labelKey]}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Recent Sessions */}
      {!sidebarCollapsed && (
        <div className="mt-8 px-4 flex-1 overflow-auto animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">{t.nav.recentSessions}</p>
            <button
              onClick={() => {
                startNewSession();
                router.push("/study");
              }}
              className="text-xs text-gold hover:text-gold/80 flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3 h-3" /> New
            </button>
          </div>
          <div className="space-y-1">
            {sessions.slice(0, 8).map((session) => (
              <div key={session.id} className="group relative flex items-center">
                <Link
                  href="/study"
                  onClick={() => setCurrentSession(session)}
                  className="flex-1 flex items-center gap-2 px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-colors truncate pr-8"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{session.title}</span>
                </Link>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setSessionToDelete(session.id);
                  }}
                  className="absolute right-1 p-1 text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400/10 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-xs text-muted-foreground/50 px-2 italic">{t.nav.noSessions}</p>
            )}
          </div>
        </div>
      )}

      {/* Spacer for collapsed state */}
      {sidebarCollapsed && <div className="flex-1" />}

      {/* User / Settings */}
      <div className={`px-2 py-4 space-y-1`}>
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-foreground/5 hover:text-foreground transition-all relative group ${
            sidebarCollapsed ? "justify-center px-0" : ""
          }`}
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span className="animate-in fade-in duration-300">{t.nav.settings}</span>}
          {sidebarCollapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-surface-elevated text-foreground text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-border">
              {t.nav.settings}
            </div>
          )}
        </Link>
        
        <div className={`flex items-center gap-3 px-3 py-2 ${sidebarCollapsed ? "flex-col gap-4 py-4" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-xs font-bold text-gold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0 animate-in fade-in duration-300">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title={t.profile.logout}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Language switcher (visible when expanded) */}
        {!sidebarCollapsed && (
          <div className="flex items-center gap-1 px-3 pb-2">
            {(["en", "ar", "fr"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-1 text-xs rounded-md font-medium transition-colors ${
                  language === lang
                    ? "bg-gold/20 text-gold border border-gold/30"
                    : "text-muted-foreground hover:bg-foreground/5"
                }`}
              >
                {lang === "en" ? "EN" : lang === "ar" ? "ع" : "FR"}
              </button>
            ))}
          </div>
        )}
      </div>

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
    </aside>
    </>
  );
}
