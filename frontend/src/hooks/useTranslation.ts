import { useStore } from "@/store/useStore";
import { translations } from "@/lib/i18n";

export function useTranslation() {
  const language = useStore((s) => s.language);
  const t = translations[language];
  const isRTL = language === "ar";
  return { t, language, isRTL };
}
