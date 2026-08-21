"use client";

import { Calendar, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-pink-50 pb-2 pt-10 overflow-hidden"
    >
      <div className="relative z-10 max-w-4xl bg-white py-16 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-light"
          >
            Live Online Courses
          </motion.h1>
          <div className="w-full flex justify-center content-center py-7">
            <div className="w-20 h-0.5 self-center bg-black"></div>
          </div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base text-[#fffff] mb-6"
          >
            Learn at your own pace with professionally recorded video lectures and comprehensive written study material. Every module is designed for flexible, self-paced learning — so you can revisit lessons, review key concepts, and progress on your own schedule, from anywhere.
          </motion.p>

      
        </div>
      </div>
    </motion.section>
  );
}
