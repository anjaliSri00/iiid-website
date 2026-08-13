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
            I&apos;m a paragraph. Click here to add your own text and edit me. It&apos;s
            easy. Just click “Edit Text” or double click me to add your own
            content and make changes to the font.
          </motion.p>

      
        </div>
      </div>
    </motion.section>
  );
}
