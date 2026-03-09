"use client";

import { motion } from "framer-motion";

interface UserCounterProps {
  count: number;
}

export default function UserCounter({ count }: UserCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center gap-2 text-sm text-white/30"
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"
        style={{ boxShadow: "0 0 6px rgba(52,211,153,0.6)" }}
      />
      <span>累計利用者数: </span>
      <motion.span
        key={count}
        initial={{ scale: 1.3, color: "#6ee7b7" }}
        animate={{ scale: 1, color: "rgba(255,255,255,0.4)" }}
        className="font-bold"
      >
        {count.toLocaleString()}
      </motion.span>
      <span> 人</span>
    </motion.div>
  );
}
