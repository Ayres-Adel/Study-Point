"use client";

import Link from "next/link";
import {
  Users,
  FileText,
  Star,
  Zap,
  Brain,
  Trophy,
  Sparkles,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import AnimatedBackground from "@/components/AnimatedBackground";
import React, { useState, Suspense } from "react";
import { useStore } from "@/store/useStore";
import { useTranslation } from "@/hooks/useTranslation";
import { type Language } from "@/lib/i18n";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const GraduationCapsBackground = dynamic(() => import("@/components/GraduationCapsBackground"), { ssr: false });

const sectionReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
};

const containerStagger = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.12,
    },
  },
  viewport: { once: true, amount: 0.2 },
};

const itemReveal = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLightMode = useStore((s) => s.isLightMode);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const setLanguage = useStore((s) => s.setLanguage);
  const { t, language } = useTranslation();

  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const stats = [
    { icon: Users, value: "10K+", label: t.landing.stats.students },
    { icon: FileText, value: "50K+", label: t.landing.stats.docs },
    { icon: Star, value: "98%", label: t.landing.stats.passRate },
    { icon: Zap, value: "Fast", label: t.landing.stats.speed },
  ];

  const features = [
    { icon: FileText, title: t.landing.features.pdf.title, desc: t.landing.features.pdf.desc },
    { icon: Brain,    title: t.landing.features.ai.title,  desc: t.landing.features.ai.desc },
    { icon: Trophy,  title: t.landing.features.quiz.title, desc: t.landing.features.quiz.desc },
    { icon: Sparkles,title: t.landing.features.rewards.title, desc: t.landing.features.rewards.desc },
  ];

  const steps = t.landing.steps;
  const testimonials = t.landing.testimonials.quotes;

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col">
      <header className="w-full fixed top-3 left-0 z-50 flex justify-center">
        <div className="max-w-7xl w-full mx-auto px-4 py-3 flex items-center justify-between bg-foreground/5 backdrop-blur-md border border-border/50 rounded-xl shadow-sm relative">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-10 w-auto" />
            <span className="font-semibold text-lg text-foreground">StudyPoint</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#hero" className="text-sm hover:underline">
              {t.nav.home}
            </a>
            <a href="#features" className="text-sm hover:underline">
              {t.nav.study}
            </a>
            <a href="#how-it-works" className="text-sm hover:underline">
              {t.landing.howTitle} {t.landing.howHighlight}
            </a>
            <a href="#testimonials" className="text-sm hover:underline">
              {t.landing.testimonials.title}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center p-1 bg-surface border border-border/50 rounded-lg mr-2">
              {(["en", "ar", "fr"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all duration-300 ${
                    language === lang
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "ar" ? "ع" : "FR"}
                </button>
              ))}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-muted-foreground hover:bg-surface transition-colors"
              aria-label="Toggle theme"
            >
              {isLightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
            <Link href="/signup">
              <button
                className="px-4 py-2 rounded-md font-medium hidden md:inline"
                style={{ background: "#F2C94C", color: "#111827" }}
              >
                {t.nav.signUp}
              </button>
            </Link>

            <button
              onClick={() => setMobileOpen((s) => !s)}
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-md text-foreground hover:bg-foreground/10"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {mobileOpen && (
            <div className="md:hidden fixed top-20 left-0 right-0 z-40 px-4">
              <div className="max-w-7xl mx-auto bg-background/95 backdrop-blur-md border border-border/50 rounded-xl p-4 space-y-3 shadow-xl">
                <a
                  href="#hero"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium"
                >
                  {t.nav.home}
                </a>
                <a
                  href="#features"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium"
                >
                  {t.nav.study}
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium"
                >
                  {t.landing.howTitle} {t.landing.howHighlight}
                </a>
                <a
                  href="#testimonials"
                  onClick={() => setMobileOpen(false)}
                  className="block text-base font-medium"
                >
                  {t.landing.testimonials.title}
                </a>

                {/* Mobile Language Switcher */}
                <div className="pt-3 pb-1 border-t border-border/50">
                  <div className="flex items-center p-1 bg-surface border border-border/50 rounded-lg">
                    {(["en", "ar", "fr"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLanguage(lang);
                          setMobileOpen(false);
                        }}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-all duration-300 ${
                          language === lang
                            ? "bg-foreground text-background shadow-md"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {lang === "en" ? "English" : lang === "ar" ? "عربية" : "Français"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <button
                      className="w-full rounded-md px-4 py-2 font-medium"
                      style={{ background: "#F2C94C", color: "#111827" }}
                    >
                      {t.nav.signUp}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AnimatedBackground hero style={{ y: backgroundY, bottom: -200 } as any} />
      <Suspense fallback={null}>
        <GraduationCapsBackground />
      </Suspense>

      <motion.section
        id="hero"
        className="min-h-screen flex items-center justify-center px-6 text-center pt-24 select-none"
        {...sectionReveal}
      >
        <div className="max-w-3xl w-full">
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <BrandLogo className="h-20 w-auto mx-auto" />
          </motion.div>

          {/* Word-by-word heading */}
          <h1 className="mt-4 text-5xl md:text-6xl font-semibold tracking-tight leading-tight text-foreground flex justify-center flex-wrap gap-x-4">
            {["Study", "Point"].map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={i === 1 ? "text-gold text-glow" : ""}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            {t.landing.tagline}
          </motion.p>
          <motion.p
            className="mt-2 text-sm text-muted-foreground opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            {t.landing.subtitle}
          </motion.p>

          <motion.div
            className="mt-10 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Link href="/signup">
              <button
                className="rounded-lg text-white font-medium px-8 py-3 shadow-lg"
                style={{
                  background: "linear-gradient(90deg,#0B3C5D 0%, #145374 100%)",
                  boxShadow: "0 0 15px rgba(11,60,93,0.4)",
                  borderRadius: 12,
                }}
                aria-label={t.landing.getStarted}
              >
                {t.landing.getStarted}
                <ArrowRight className="inline-block w-4 h-4 ml-3" />
              </button>
            </Link>

            <Link href="/login">
              <button
                className="rounded-lg text-foreground font-medium px-8 py-3 border border-border"
                style={{
                  background: "transparent",
                  borderRadius: 12,
                }}
                aria-label={t.nav.signIn}
              >
                {t.nav.signIn}
              </button>
            </Link>
          </motion.div>

          <motion.div
            className="mt-12 flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ChevronDown className="w-8 h-8 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="stats" className="py-20" {...sectionReveal}>
        <div className="max-w-[900px] mx-auto px-6">
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center"
            variants={containerStagger}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, amount: 0.2 }}
          >
            {stats.map((s, i) => {
              const Icon = s.icon as any;
              return (
                <motion.div key={s.label} className="flex flex-col items-center" variants={itemReveal}>
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center mb-3"
                    style={{ background: "rgba(242,201,76,0.10)" }}
                  >
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div className="text-2xl font-semibold" style={{ fontSize: 30 }}>
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section id="features" className="py-20" {...sectionReveal}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold">
            {t.landing.featuresTitle} <span className="text-gold">{t.landing.featuresHighlight}</span>
          </h2>
          <p className="mt-3 text-muted-foreground max-w-[450px] mx-auto">
            {t.landing.featuresSubtitle}
          </p>
        </div>

        <motion.div
          className="mt-10 max-w-[1000px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          variants={containerStagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((f, i) => {
            const Icon = f.icon as any;
            return (
              <motion.div
                key={f.title}
                className="bg-surface/40 rounded-xl p-6 card-lift"
                variants={itemReveal}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(242,201,76,0.10)" }}
                  >
                    <Icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold" style={{ fontSize: 18 }}>
                      {f.title}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      <motion.section id="how-it-works" className="py-20" {...sectionReveal}>
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold">
            {t.landing.howTitle} <span className="text-gold">{t.landing.howHighlight}</span>
          </h2>
        </div>

        <motion.div
          className="mt-8 max-w-[900px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-6"
          variants={containerStagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
        >
          {steps.map((s, i) => (
            <motion.div key={s.title} className="bg-transparent p-4" variants={itemReveal}>
              <div
                className="text-2xl font-heading font-semibold"
                style={{ fontSize: 36, color: "rgba(242,201,76,0.2)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-bold mt-2" style={{ fontSize: 16 }}>
                {s.title}
              </div>
              <div className="text-sm text-muted-foreground mt-1">{s.desc}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section id="testimonials" className="py-20" {...sectionReveal}>
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold">
            {t.landing.testimonials.title} <span className="text-gold">{t.landing.testimonials.highlight}</span>
          </h2>
        </div>

        <motion.div
          className="mt-10 max-w-[900px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerStagger}
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((t, i) => (
            <motion.div key={t.name} className="bg-surface/40 rounded-xl p-5" variants={itemReveal}>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 text-gold" />
                ))}
              </div>
              <div className="text-sm">&ldquo;{t.quote}&rdquo;</div>
              <div className="mt-4 text-sm font-semibold">
                {t.name} <span className="mx-2">·</span>{" "}
                <span className="text-muted-foreground font-normal">{t.city}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section id="final-cta" className="py-20" {...sectionReveal}>
        <div className="max-w-[640px] mx-auto px-6">
          <div
            className="rounded-2xl p-10"
            style={{ background: "linear-gradient(90deg,#0B3C5D 0%, #145374 100%)" }}
          >
            <h3 className="text-2xl font-semibold text-white">{t.landing.cta.title}</h3>
            <p className="mt-3 text-white opacity-80 text-sm">
              {t.landing.cta.subtitle}
            </p>
            <div className="mt-6">
              <button
                className="rounded-lg font-bold px-8 py-3"
                style={{ background: "#F2C94C", color: "#1a1a2e", borderRadius: 12 }}
              >
                {t.landing.cta.button}
              </button>
            </div>
          </div>
        </div>
      </motion.section>
      {/* Footer — responsive, simple */}
      <motion.footer
        className="py-8 border-t border-border bg-transparent relative z-10"
        {...sectionReveal}
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-6 w-6" />
            <div
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              className="text-sm font-bold"
            >
              <span className="text-foreground">Study</span>
              <span className="ml-1 text-gold">
                Point
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground md:text-right">
            © {new Date().getFullYear()} StudyPoint. {t.landing.footer}
          </div>
        </div>
      </motion.footer>
    </div>
    </PageTransition>
  );
}
