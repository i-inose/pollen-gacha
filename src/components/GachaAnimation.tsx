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

const rarityParticleColors: Record<Rarity, string[]> = {
  N: ["#9E9E9E", "#BDBDBD", "#E0E0E0"],
  R: ["#2196F3", "#64B5F6", "#90CAF9"],
  SR: ["#FF9800", "#FF5722", "#FFC107"],
  SSR: ["#FFD700", "#FFA000", "#FFEB3B", "#FF6F00"],
};

function Particles({ rarity }: { rarity: Rarity }) {
  const colors = rarityParticleColors[rarity];
  const count = rarity === "SSR" ? 50 : rarity === "SR" ? 25 : 12;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (360 / count) * i;
        const distance = 100 + Math.random() * 150;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;
        // パーティクル形状のバリエーション
        const isSquare = i % 4 === 0;
        const isStreak = i % 5 === 0;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: x,
              y: y,
              scale: [0, isStreak ? 2 : 1.5, 0],
            }}
            transition={{ duration: 1.2, delay: 0.3 + i * 0.02 }}
            className="absolute"
            style={{
              width: isStreak ? "2px" : "12px",
              height: isStreak ? "16px" : "12px",
              borderRadius: isSquare ? "2px" : "50%",
              transform: isSquare ? "rotate(45deg)" : undefined,
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

// SSR用の降り注ぐスパークル
function FallingSparkles() {
  return (
    <>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{
            opacity: 0,
            x: Math.random() * 300 - 150,
            y: -100,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: 300,
            x: Math.random() * 300 - 150,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 3,
            repeat: Infinity,
          }}
          className="absolute w-1 h-1 rounded-full bg-amber-300"
          style={{ left: "50%", top: "50%" }}
        />
      ))}
    </>
  );
}

function ScreenFlash({ rarity }: { rarity: Rarity }) {
  if (rarity !== "SR" && rarity !== "SSR") return null;

  const flashColor =
    rarity === "SSR" ? "rgba(255, 215, 0, 0.7)" : "rgba(255, 152, 0, 0.4)";

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

// 画面揺れエフェクト
function ScreenShake({ rarity }: { rarity: Rarity }) {
  if (rarity !== "SR" && rarity !== "SSR") return null;
  const intensity = rarity === "SSR" ? 8 : 4;

  return (
    <motion.div
      className="fixed inset-0 z-30 pointer-events-none"
      animate={{
        x: [0, -intensity, intensity, -intensity, intensity, 0],
        y: [0, intensity, -intensity, intensity, -intensity, 0],
      }}
      transition={{ duration: 0.4, delay: 0.1 }}
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      >
        <ScreenFlash rarity={character.rarity} />
        <ScreenShake rarity={character.rarity} />

        {/* カプセル回転フェーズ - CSSオーブ + 放射光 */}
        {phase === "capsule" && (
          <div className="relative flex items-center justify-center">
            {/* 放射光 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute w-64 h-64"
              style={{
                background: "conic-gradient(from 0deg, transparent, rgba(110,231,183,0.15), transparent, rgba(110,231,183,0.15), transparent)",
              }}
            />
            {/* オーブ本体 */}
            <motion.div
              initial={{ y: -300, rotate: 0, scale: 0.3 }}
              animate={{ y: 0, rotate: 720, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-24 h-24 rounded-full relative"
              style={{
                background: "radial-gradient(circle at 40% 40%, rgba(110,231,183,0.9), rgba(16,185,129,0.7), rgba(6,78,59,0.9))",
                boxShadow: "0 0 40px rgba(110,231,183,0.5), 0 0 80px rgba(16,185,129,0.3), 0 0 120px rgba(110,231,183,0.15)",
              }}
            >
              {/* 光沢 */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 50%)",
                }}
              />
            </motion.div>
          </div>
        )}

        {/* 開封演出フェーズ */}
        {(phase === "reveal" || phase === "done") && (
          <div className="relative flex flex-col items-center">
            <Particles rarity={character.rarity} />
            {character.rarity === "SSR" && <FallingSparkles />}

            {/* レアリティバッジ - 六角形 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className={`mb-4 px-8 py-3 text-white font-bold text-2xl bg-linear-to-r ${rarityGradients[character.rarity]} tracking-wider`}
              style={{
                clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
                textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              }}
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
              className="w-48 h-48 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mb-4 overflow-hidden relative"
            >
              {/* SSR虹オーラ */}
              {character.rarity === "SSR" && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(45deg, rgba(255,0,0,0.1), rgba(255,136,0,0.1), rgba(255,255,0,0.1), rgba(0,255,0,0.1), rgba(0,136,255,0.1), rgba(136,0,255,0.1))",
                    backgroundSize: "400% 400%",
                    animation: "rainbow-shift 3s ease infinite",
                  }}
                />
              )}
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-full object-contain p-3 relative z-10"
              />
            </motion.div>

            {/* キャラ名 */}
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-3xl font-bold text-white mb-2 tracking-wider"
              style={{ textShadow: "0 0 20px rgba(110,231,183,0.4)" }}
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
                className="mt-8 text-white/40 text-xs tracking-[0.3em]"
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
