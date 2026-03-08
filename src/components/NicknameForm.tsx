"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface NicknameFormProps {
  onSubmit: (nickname: string) => void;
}

export default function NicknameForm({ onSubmit }: NicknameFormProps) {
  const [nickname, setNickname] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed.length > 0 && trimmed.length <= 20) {
      onSubmit(trimmed);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl mb-2">🌸</h1>
          <h2 className="text-2xl font-bold text-gray-800">花粉ガチャ</h2>
          <p className="text-gray-500 mt-2 text-sm">
            今日の花粉レベルに応じてガチャを引こう！
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="nickname"
              className="block text-sm font-medium text-gray-700 mb-1"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 outline-none transition-all text-gray-800"
              autoFocus
            />
          </div>

          <motion.button
            type="submit"
            disabled={nickname.trim().length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-opacity"
          >
            はじめる！
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
