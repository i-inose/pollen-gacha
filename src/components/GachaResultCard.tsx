"use client";

import { motion } from "framer-motion";
import { Character, PollenLevel } from "@/types";
import { rarityGradients, rarityColors } from "@/lib/gacha";
import { pollenLevelLabels, pollenLevelEmojis } from "@/data/pollen";

interface GachaResultCardProps {
  character: Character;
  pollenLevel: PollenLevel;
  onShare: (platform: "x" | "facebook") => void;
}

const rarityFrameClass: Record<string, string> = {
  N: "rarity-frame-n",
  R: "rarity-frame-r",
  SR: "rarity-frame-sr",
  SSR: "rarity-frame-ssr",
};

export default function GachaResultCard({
  character,
  pollenLevel,
  onShare,
}: GachaResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full max-w-md game-panel ${rarityFrameClass[character.rarity]}`}
    >
      {/* ヘッダー */}
      <div
        className={`bg-linear-to-r ${rarityGradients[character.rarity]} p-4 text-center text-white`}
      >
        <span className="text-xs tracking-[0.15em] uppercase font-medium opacity-80">GET!</span>
        <span className="ml-2 px-3 py-1 rounded-full bg-white/20 text-sm font-bold">
          {character.rarity}
        </span>
      </div>

      {/* キャラ情報 */}
      <div className="p-6 flex flex-col items-center">
        {/* キャラ画像 */}
        <div
          className="w-32 h-32 rounded-lg flex items-center justify-center mb-4 overflow-hidden"
          style={{
            backgroundColor: `${rarityColors[character.rarity]}15`,
            border: `2px solid ${rarityColors[character.rarity]}40`,
          }}
        >
          <img
            src={character.imageUrl}
            alt={character.name}
            className="w-full h-full object-contain p-2"
          />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 tracking-wide">
          {character.name}
        </h2>
        <p className="text-sm text-white/40 mb-2">{character.motif}</p>
        <p className="text-white/70 italic mb-1">「{character.quote}」</p>
        <p className="text-sm text-white/40 text-center mb-4">
          {character.description}
        </p>

        <div className="text-xs text-white/30">
          花粉レベル: {pollenLevelEmojis[pollenLevel]}{" "}
          {pollenLevelLabels[pollenLevel]}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="px-6 pb-6 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => onShare("x")}
            className="game-btn flex-1 py-3 px-4 text-sm"
          >
            Xでシェア
          </button>
          <button
            onClick={() => onShare("facebook")}
            className="game-btn flex-1 py-3 px-4 text-sm"
          >
            Facebookでシェア
          </button>
        </div>
        <p className="text-center text-xs text-white/30 mt-2">
          次のガチャは明日引けます
        </p>
      </div>
    </motion.div>
  );
}
