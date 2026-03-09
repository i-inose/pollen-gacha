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
  const glowIntensity = pollenLevel * 6;
  // 花粉レベルが高いほど赤紫にシフト
  const glowColor = pollenLevel >= 4
    ? `rgba(200, 80, 200, ${0.3 + pollenLevel * 0.05})`
    : pollenLevel >= 3
    ? `rgba(255, 160, 50, ${0.3 + pollenLevel * 0.05})`
    : `rgba(110, 231, 183, ${0.3 + pollenLevel * 0.05})`;

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* 外側装飾リング 1 - 逆回転 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        className="absolute inset-0 rounded-full border border-emerald-400/20"
        style={{ borderStyle: "dashed" }}
      />

      {/* 外側装飾リング 2 */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
        className="absolute inset-3 rounded-full border-2 border-amber-300/15"
        style={{ borderStyle: "dotted" }}
      />

      {/* 外側装飾リング 3 - 逆回転 */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="absolute inset-6 rounded-full border border-emerald-300/10"
      />

      {/* メインボタン（召喚オーブ） */}
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          boxShadow: [
            `0 0 ${glowIntensity}px ${glowColor}`,
            `0 0 ${glowIntensity * 2.5}px ${glowColor}`,
            `0 0 ${glowIntensity}px ${glowColor}`,
          ],
        }}
        transition={{
          boxShadow: { repeat: Infinity, duration: 2, ease: "easeInOut" },
        }}
        className="relative w-48 h-48 rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: "radial-gradient(circle at 35% 35%, rgba(110,231,183,0.5), rgba(16,120,80,0.8), rgba(6,50,30,0.95))",
          border: "2px solid rgba(110,231,183,0.3)",
        }}
      >
        {/* 内側の光沢 */}
        <div
          className="absolute inset-2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent 60%)",
          }}
        />

        {/* 中央ダイヤモンド + テキスト */}
        <div className="relative z-10 flex flex-col items-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="w-10 h-10 rotate-45 bg-linear-to-br from-emerald-300 to-amber-200"
            style={{
              boxShadow: "0 0 20px rgba(110,231,183,0.6), 0 0 40px rgba(110,231,183,0.3)",
            }}
          />
          <span className="text-lg font-bold text-white tracking-[0.15em]" style={{ textShadow: "0 0 10px rgba(110,231,183,0.5)" }}>
            ガチャを引く
          </span>
        </div>
      </motion.button>
    </div>
  );
}
