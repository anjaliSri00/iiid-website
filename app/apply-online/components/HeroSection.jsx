'use client';

import { Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-br from-red-600 to-red-800 text-white py-16 md:py-24"
    >
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
          >
            Apply Online for Live Interior Design Courses
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-red-100 mb-6"
          >
            Get internationally recognized certification through our live online programs
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-6 py-3 inline-flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Next batch: June    15, 2026</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}