"use client";

import { motion } from "framer-motion";
import { Character, PollenLevel } from "@/types";
import { rarityGradients, rarityColors } from "@/lib/gacha";
import { pollenLevelLabels, pollenLevelEmojis } from "@/data/pollen";

interface GachaResultCardProps {
  character: Character;
  pollenLevel: PollenLevel;
  onShare: (platform: "x" | "facebook") => void;
  onRetry: () => void;
}

export default function GachaResultCard({
  character,
  pollenLevel,
  onShare,
  onRetry,
}: GachaResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
    >
      {/* ヘッダー */}
      <div
        className={`bg-gradient-to-r ${rarityGradients[character.rarity]} p-4 text-center text-white`}
      >
        <span className="text-sm font-medium opacity-80">GET!</span>
        <span className="ml-2 px-3 py-1 rounded-full bg-white/20 text-sm font-bold">
          {character.rarity}
        </span>
      </div>

      {/* キャラ情報 */}
      <div className="p-6 flex flex-col items-center">
        {/* キャラ画像（フォールバック） */}
        <div
          className="w-32 h-32 rounded-xl flex items-center justify-center text-6xl mb-4"
          style={{
            backgroundColor: `${rarityColors[character.rarity]}15`,
            border: `2px solid ${rarityColors[character.rarity]}40`,
          }}
        >
          {character.rarity === "SSR"
            ? "👹"
            : character.rarity === "SR"
              ? "👾"
              : character.rarity === "R"
                ? "👻"
                : "🌿"}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {character.name}
        </h2>
        <p className="text-sm text-gray-500 mb-2">{character.motif}</p>
        <p className="text-gray-600 italic mb-1">「{character.quote}」</p>
        <p className="text-sm text-gray-500 text-center mb-4">
          {character.description}
        </p>

        <div className="text-xs text-gray-400">
          花粉レベル: {pollenLevelEmojis[pollenLevel]}{" "}
          {pollenLevelLabels[pollenLevel]}
        </div>
      </div>

      {/* アクションボタン */}
      <div className="px-6 pb-6 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => onShare("x")}
            className="flex-1 py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors cursor-pointer"
          >
            Xでシェア
          </button>
          <button
            onClick={() => onShare("facebook")}
            className="flex-1 py-3 px-4 bg-[#1877F2] text-white rounded-xl font-medium hover:bg-[#1565C0] transition-colors cursor-pointer"
          >
            Facebookでシェア
          </button>
        </div>
        <button
          onClick={onRetry}
          className="w-full py-3 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer"
        >
          🌸 もう一回引く！
        </button>
      </div>
    </motion.div>
  );
}
