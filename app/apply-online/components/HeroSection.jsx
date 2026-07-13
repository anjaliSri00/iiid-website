'use client';

import { Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gradient-to-br from-[#CC0000] via-[#DC2626] to-[#B30000] text-white py-16 md:py-24 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A574] rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D4A574] rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-[#ffff]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-[#D4A574]/30"
          >
            <Sparkles className="w-4 h-4 text-[#ffff]" />
            <span className="text-sm font-medium text-[#ffff]">Internationally Recognized</span>
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 font-serif"
          >
            Apply Online for Live Interior Design Courses
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-[#fffff] mb-6"
          >
            Get internationally recognized certification through our live online programs
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <div className="bg-[#fff]/20 backdrop-blur-sm rounded-lg px-6 py-3 inline-flex items-center gap-2 border border-[#D4A574]/30">
              <Calendar className="w-5 h-5 text-[#fffff]" />
              <span className="font-semibold text-[#ffff]">Next batch: June 15, 2026</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}