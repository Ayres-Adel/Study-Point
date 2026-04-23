"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

type Props = { hero?: boolean; style?: React.CSSProperties };

const GOLD = "#F2C94C";
const NAVY = "#0B3C5D";
const LIGHT_GOLD = "#EBD590";
const LIGHT_NAVY = "#1A5276";

export default function AnimatedBackground({ hero = false, style }: Props) {
  const mainOrbs = [
    {
      id: "orb-1",
      size: 384,
      color: GOLD,
      opacity: 0.08,
      blur: 48,
      style: { top: "10%", right: "10%" },
      animate: { scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] },
      transition: {
        duration: 8,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut",
        delay: 0,
      },
    },
    {
      id: "orb-2",
      size: 288,
      color: NAVY,
      opacity: 0.08,
      blur: 48,
      style: { bottom: "20%", left: "5%" },
      animate: { scale: [1, 1.3, 1], x: [0, -20, 0], y: [0, 30, 0] },
      transition: {
        duration: 10,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut",
        delay: 2,
      },
    },
    {
      id: "orb-3",
      size: 320,
      color: LIGHT_GOLD,
      opacity: 0.04,
      blur: 48,
      style: { top: "50%", left: "30%" },
      animate: { scale: [1, 1.4, 1], x: [0, 40, 0], y: [0, 0, 0] },
      transition: {
        duration: 12,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut",
        delay: 1,
      },
    },
    {
      id: "orb-4",
      size: 256,
      color: LIGHT_NAVY,
      opacity: 0.03,
      blur: 48,
      style: { top: "20%", left: "60%" },
      animate: { scale: [1, 1.2, 1], x: [0, 0, 0], y: [0, -40, 0] },
      transition: {
        duration: 9,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut",
        delay: 3,
      },
    },
  ];

  const heroOrbs = [
    {
      id: "hero-1",
      size: 256,
      color: GOLD,
      opacity: 0.04,
      blur: 32,
      style: { left: "50%", top: "50%", transform: "translate(-50%, -50%)" },
      animate: { scale: [1, 1.5, 1] },
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut",
      },
    },
    {
      id: "hero-2",
      size: 192,
      color: LIGHT_NAVY,
      opacity: 0.06,
      blur: 32,
      style: { top: "8%", right: "12%" },
      animate: { scale: [1, 1.3, 1], rotate: [0, 90, 0] },
      transition: {
        duration: 15,
        repeat: Infinity,
        repeatType: "mirror" as const,
        ease: "easeInOut",
      },
    },
  ];

  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => {
      const size = Math.round(2 + Math.random() * 4);
      const isGold = i % 3 === 0;
      return {
        id: `p-${i}`,
        size,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        color: isGold ? GOLD : NAVY,
        opacity: isGold ? 0.35 : 0.2,
        duration: 4 + Math.random() * 4,
        delay: Math.random() * 5,
      };
    });
  }, []);

  return (
    <motion.div aria-hidden className="ambient-light" role="presentation" style={style}>
      {mainOrbs.map((o) => (
        <motion.div
          key={o.id}
          className="orb"
          style={{
            position: "absolute",
            width: o.size,
            height: o.size,
            borderRadius: "50%",
            background: o.color,
            opacity: o.opacity,
            filter: `blur(${o.blur}px)`,
            ...o.style,
            willChange: "transform, opacity",
            pointerEvents: "none",
          }}
          animate={o.animate}
          transition={o.transition as any}
        />
      ))}

      {hero &&
        heroOrbs.map((o) => (
          <motion.div
            key={o.id}
            className="orb"
            style={{
              position: "absolute",
              width: o.size,
              height: o.size,
              borderRadius: "50%",
              background: o.color,
              opacity: o.opacity,
              filter: `blur(${o.blur}px)`,
              ...o.style,
              willChange: "transform, opacity",
              pointerEvents: "none",
            }}
            animate={o.animate}
            transition={o.transition as any}
          />
        ))}

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="particle"
          style={{
            position: "absolute",
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
            borderRadius: "50%",
            background: p.color,
            opacity: p.opacity,
            willChange: "transform, opacity",
            pointerEvents: "none",
            filter: "blur(0.5px)",
          }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" } as any}
        />
      ))}
    </motion.div>
  );
}
