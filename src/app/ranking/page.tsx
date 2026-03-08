"use client";

import { useState, useEffect } from "react";
import { RankingEntry } from "@/types";
import { fetchRanking } from "@/lib/api";
import RankingList from "@/components/RankingList";
import { motion } from "framer-motion";

export default function RankingPage() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRanking("tokyo");
        setRanking(data);
      } catch {
        // フォールバック
        const { getLocalRanking } = await import("@/lib/storage");
        setRanking(getLocalRanking());
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <h1 className="text-xl font-bold text-gray-800">🏆 ランキング</h1>
        <a
          href="/"
          className="px-4 py-2 text-sm bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          🌸 ガチャに戻る
        </a>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 w-full max-w-md"
      >
        <RankingList entries={ranking} title="今日のレアリティランキング" />
      </motion.div>
    </div>
  );
}
