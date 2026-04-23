"use client";

import { useStore } from "@/store/useStore";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

export function PointsToast() {
  const toastPoints = useStore((s) => s.toastPoints);
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none">
      <AnimatePresence>
        {toastPoints !== null && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: -10 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-gold font-semibold text-lg"
          >
            +{toastPoints} {t.common.pts}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
