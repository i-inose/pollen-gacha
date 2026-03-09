"use client";

import { motion } from "framer-motion";
import { PollenLevel } from "@/types";
import {
  pollenLevelLabels,
  pollenLevelColors,
  pollenLevelEmojis,
} from "@/data/pollen";

interface PollenLevelDisplayProps {
  level: PollenLevel;
  regionName: string;
}

export default function PollenLevelDisplay({
  level,
  regionName,
}: PollenLevelDisplayProps) {
  const barWidth = (level / 5) * 100;

  return (
    <div className="w-full max-w-md game-panel p-6">
      <h3 className="text-sm text-white/50 mb-1">{regionName}</h3>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-sm font-bold px-2 py-1 rounded-sm border"
          style={{
            color: pollenLevelColors[level],
            borderColor: `${pollenLevelColors[level]}40`,
            backgroundColor: `${pollenLevelColors[level]}15`,
          }}
        >
          {pollenLevelEmojis[level]}
        </span>
        <div>
          <p className="text-lg font-bold text-white/90">
            今日の花粉レベル
          </p>
          <p
            className="text-xl font-bold"
            style={{ color: pollenLevelColors[level] }}
          >
            {pollenLevelLabels[level]}
          </p>
        </div>
      </div>

      {/* レベルバー */}
      <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: pollenLevelColors[level] }}
        />
      </div>

      {/* レア度UP表示 */}
      {level >= 3 && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-sm text-center font-medium"
          style={{ color: pollenLevelColors[level] }}
        >
          花粉レベルが高いためレア排出率UP！
        </motion.p>
      )}
    </div>
  );
}
