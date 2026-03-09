"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { prefectures } from "@/data/prefectures";

interface NicknameFormProps {
  onSubmit: (nickname: string, region: string) => void;
}

export default function NicknameForm({ onSubmit }: NicknameFormProps) {
  const [nickname, setNickname] = useState("");
  const [region, setRegion] = useState("tokyo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onSubmit(trimmed, region);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="game-panel p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold bg-linear-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent tracking-wider">花粉ガチャ</h2>
          <p className="text-white/50 mt-2 text-sm">
            今日の花粉レベルに応じてガチャを引こう！
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-white/60 mb-1"
            >
              ニックネーム
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="ニックネームを入力（20文字以内）"
              maxLength={20}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm text-white placeholder:text-white/30 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 outline-none transition-all"
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="region"
              className="block text-sm font-medium text-white/60 mb-1"
            >
              都道府県
            </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-sm text-white focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 outline-none transition-all appearance-none"
            >
              {prefectures.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0c2a18] text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="submit"
            disabled={nickname.trim().length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="game-btn game-btn-primary w-full py-3 text-lg"
          >
            はじめる
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
