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
    <div className="min-h-screen flex flex-col items-center p-4 relative z-10">
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <h1 className="text-xl font-bold bg-linear-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg tracking-wider">
          ランキング
        </h1>
        <a
          href="/"
          className="game-btn game-btn-primary px-4 py-2 text-sm no-underline"
        >
          ガチャに戻る
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
