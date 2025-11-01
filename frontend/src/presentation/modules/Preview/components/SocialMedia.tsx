"use client";

import { motion } from "framer-motion";
import { Instagram, Facebook, Linkedin, Youtube } from "lucide-react";

const icons = {
  instagram: { icon: <Instagram className="w-6 h-6 text-pink-500" />, color: "from-pink-500 to-purple-500" },
  facebook: { icon: <Facebook className="w-6 h-6 text-blue-600" />, color: "from-blue-600 to-blue-800" },
  linkedin: { icon: <Linkedin className="w-6 h-6 text-blue-500" />, color: "from-blue-500 to-cyan-500" },
  youtube: { icon: <Youtube className="w-6 h-6 text-red-600" />, color: "from-red-500 to-red-700" },
};

export function SocialIcon({ type }: { type: keyof typeof icons }) {
  const { icon, color } = icons[type] || {};

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.15, rotate: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white shadow-md hover:shadow-lg transition-all duration-200`}
    >
      {icon}
    </motion.div>
  );
}
