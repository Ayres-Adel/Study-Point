"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { Sparkles, Play, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";

interface UnlockUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export function UnlockUploadModal({ isOpen, onClose, onUnlocked }: UnlockUploadModalProps) {
  const adWatchesToday = useStore((s) => s.adWatchesToday);
  const incrementAdWatch = useStore((s) => s.incrementAdWatch);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  const handleWatchAd = () => {
    if (adWatchesToday >= 3) return;
    setIsWatchingAd(true);
    // Simulate ad watching
    setTimeout(() => {
      setIsWatchingAd(false);
      incrementAdWatch();
      onUnlocked();
      onClose();
    }, 5000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            {t.modals.unlock.title}
          </DialogTitle>
          <DialogDescription>
            {t.modals.unlock.desc}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-3">
            <div className="bg-gold/10 border border-gold/20 rounded-xl p-4 flex flex-col gap-2">
              <h3 className="font-semibold text-gold">{t.modals.unlock.upgradeTitle}</h3>
              <p className="text-xs text-muted-foreground">{t.modals.unlock.upgradeDesc}</p>
              <Button className="mt-2 bg-gold hover:bg-gold/90 text-black border-none" onClick={() => router.push("/profile")}>
                {t.modals.unlock.upgradeBtn}
              </Button>
            </div>

            <div className="bg-white/5 border border-border rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-foreground">{t.modals.unlock.adTitle}</h3>
                <span className="text-xs text-muted-foreground">{3 - adWatchesToday} {t.modals.unlock.adLeft}</span>
              </div>
              <p className="text-xs text-muted-foreground">{t.modals.unlock.adDesc}</p>
              <Button
                variant="outline"
                className="mt-2 border-border hover:bg-white/5"
                disabled={adWatchesToday >= 3 || isWatchingAd}
                onClick={handleWatchAd}
              >
                {isWatchingAd ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.modals.unlock.adWatching}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    {t.modals.unlock.adBtn}
                  </>
                )}
              </Button>
              {adWatchesToday >= 3 && (
                <p className="text-[10px] text-red-400 mt-1 text-center">{t.modals.unlock.adLimit}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
