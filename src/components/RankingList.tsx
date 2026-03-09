"use client";

import { motion } from "framer-motion";
import { RankingEntry } from "@/types";
import { rarityColors } from "@/lib/gacha";

interface RankingListProps {
  entries: RankingEntry[];
  title: string;
}

const medalStyles = [
  "bg-linear-to-br from-yellow-300 to-amber-500 text-amber-900",
  "bg-linear-to-br from-gray-200 to-gray-400 text-gray-700",
  "bg-linear-to-br from-amber-600 to-amber-800 text-amber-100",
];

export default function RankingList({ entries, title }: RankingListProps) {
  return (
    <div className="w-full max-w-md game-panel">
      <div className="bg-linear-to-r from-emerald-600/80 to-teal-600/80 p-4">
        <h3 className="text-white font-bold text-lg text-center tracking-wider">{title}</h3>
      </div>

      <div className="p-4">
        {entries.length === 0 ? (
          <p className="text-center text-white/30 py-8">
            まだデータがありません
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry, index) => (
              <motion.li
                key={`${entry.nickname}-${entry.timestamp}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-sm bg-white/5 hover:bg-white/10 transition-colors border-b border-white/5"
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${index < 3 ? medalStyles[index] : "bg-white/10 text-white/50"}`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white/90 truncate">
                    {entry.nickname}
                  </p>
                  <p className="text-sm text-white/40">{entry.characterName}</p>
                </div>
                <span
                  className="px-2 py-1 rounded-sm text-xs font-bold text-white"
                  style={{ backgroundColor: rarityColors[entry.rarity] }}
                >
                  {entry.rarity}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
