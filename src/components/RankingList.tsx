"use client";

import { motion } from "framer-motion";
import { RankingEntry, Rarity } from "@/types";
import { rarityColors } from "@/lib/gacha";

interface RankingListProps {
  entries: RankingEntry[];
  title: string;
}

const medalEmojis = ["🥇", "🥈", "🥉"];

export default function RankingList({ entries, title }: RankingListProps) {
  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <h3 className="text-white font-bold text-lg text-center">{title}</h3>
      </div>

      <div className="p-4">
        {entries.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
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
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl w-8 text-center">
                  {index < 3 ? medalEmojis[index] : `${index + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">
                    {entry.nickname}
                  </p>
                  <p className="text-sm text-gray-500">{entry.characterName}</p>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-bold text-white"
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
