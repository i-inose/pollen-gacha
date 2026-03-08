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
      className="text-center text-sm text-gray-400"
    >
      <span>累計利用者数: </span>
      <motion.span
        key={count}
        initial={{ scale: 1.3, color: "#f97316" }}
        animate={{ scale: 1, color: "#9ca3af" }}
        className="font-bold"
      >
        {count.toLocaleString()}
      </motion.span>
      <span> 人</span>
    </motion.div>
  );
}
