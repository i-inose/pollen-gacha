"use client";

import { motion } from "framer-motion";

interface GachaButtonProps {
  onClick: () => void;
  disabled?: boolean;
  pollenLevel: number;
}

export default function GachaButton({
  onClick,
  disabled,
  pollenLevel,
}: GachaButtonProps) {
  const glowIntensity = pollenLevel * 4;

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: [
          `0 0 ${glowIntensity}px rgba(255, 200, 0, 0.3)`,
          `0 0 ${glowIntensity * 2}px rgba(255, 200, 0, 0.6)`,
          `0 0 ${glowIntensity}px rgba(255, 200, 0, 0.3)`,
        ],
      }}
      transition={{
        boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
      }}
      className="relative w-64 h-64 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white font-bold text-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute inset-2 rounded-full border-4 border-dashed border-white/30"
      />
      <div className="relative z-10 flex flex-col items-center gap-2">
        <span className="text-4xl">🌸</span>
        <span className="text-xl font-bold tracking-wider">ガチャを引く</span>
      </div>
    </motion.button>
  );
}
