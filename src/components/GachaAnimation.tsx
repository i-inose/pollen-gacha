"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Character, Rarity } from "@/types";
import { rarityGradients } from "@/lib/gacha";
import { useState, useEffect } from "react";

interface GachaAnimationProps {
  character: Character | null;
  isPlaying: boolean;
  onComplete: () => void;
}

// レアリティごとのパーティクル色
const rarityParticleColors: Record<Rarity, string[]> = {
  N: ["#9E9E9E", "#BDBDBD", "#E0E0E0"],
  R: ["#2196F3", "#64B5F6", "#90CAF9"],
  SR: ["#FF9800", "#FF5722", "#FFC107"],
  SSR: ["#FFD700", "#FFA000", "#FFEB3B", "#FF6F00"],
};

function Particles({ rarity }: { rarity: Rarity }) {
  const colors = rarityParticleColors[rarity];
  const count = rarity === "SSR" ? 30 : rarity === "SR" ? 20 : 12;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const distance = 100 + Math.random() * 150;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: x,
              y: y,
              scale: [0, 1.5, 0],
            }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.02 }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor:
                colors[Math.floor(Math.random() * colors.length)],
              left: "50%",
              top: "50%",
            }}
          />
        );
      })}
    </>
  );
}

function ScreenFlash({ rarity }: { rarity: Rarity }) {
  if (rarity !== "SR" && rarity !== "SSR") return null;

  const flashColor =
    rarity === "SSR" ? "rgba(255, 215, 0, 0.6)" : "rgba(255, 152, 0, 0.4)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.5, times: [0, 0.3, 1] }}
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ backgroundColor: flashColor }}
    />
  );
}

export default function GachaAnimation({
  character,
  isPlaying,
  onComplete,
}: GachaAnimationProps) {
  const [phase, setPhase] = useState<"capsule" | "reveal" | "done">("capsule");

  useEffect(() => {
    if (!isPlaying) {
      setPhase("capsule");
      return;
    }

    // カプセル回転 → 開封演出
    const timer1 = setTimeout(() => setPhase("reveal"), 1500);
    const timer2 = setTimeout(() => {
      setPhase("done");
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isPlaying, onComplete]);

  if (!isPlaying || !character) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      >
        <ScreenFlash rarity={character.rarity} />

        {/* カプセル回転フェーズ */}
        {phase === "capsule" && (
          <motion.div
            initial={{ y: -300, rotate: 0 }}
            animate={{ y: 0, rotate: 720 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-8xl"
          >
            🔮
          </motion.div>
        )}

        {/* 開封演出フェーズ */}
        {(phase === "reveal" || phase === "done") && (
          <div className="relative flex flex-col items-center">
            <Particles rarity={character.rarity} />

            {/* レアリティバッジ */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className={`mb-4 px-6 py-2 rounded-full text-white font-bold text-2xl bg-gradient-to-r ${rarityGradients[character.rarity]} shadow-lg`}
            >
              {character.rarity}
            </motion.div>

            {/* キャラ画像 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 12,
                delay: 0.2,
              }}
              className="w-48 h-48 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-8xl mb-4 overflow-hidden"
            >
              {/* S3画像がない場合のフォールバック絵文字 */}
              <span>
                {character.rarity === "SSR"
                  ? "👹"
                  : character.rarity === "SR"
                    ? "👾"
                    : character.rarity === "R"
                      ? "👻"
                      : "🌿"}
              </span>
            </motion.div>

            {/* キャラ名 */}
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2"
            >
              {character.name}
            </motion.h2>

            {/* セリフ */}
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg text-white/80 italic"
            >
              「{character.quote}」
            </motion.p>

            {/* 閉じるヒント */}
            {phase === "done" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1] }}
                transition={{ delay: 0.5, duration: 2, repeat: Infinity }}
                className="mt-8 text-white/50 text-sm"
              >
                タップして閉じる
              </motion.p>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
