'use client';

import { useState, useEffect } from 'react';
import SwiperCard from "../ui/SwiperCard";
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award } from 'lucide-react';

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState({
    mainTitle: "Certification that recognizes your professional experience",
    mainDescription: "Advance your career with internationally recognized interior design certifications",
    ctaText: "Read More"
  });

  const [isHovered, setIsHovered] = useState(false);

  const handleSlideChange = (slideData) => {
    setActiveSlide({
      mainTitle: slideData.mainTitle,
      mainDescription: slideData.mainDescription,
      ctaText: slideData.ctaText
    });
  };

  return (
    <section id="home" className="relative w-full text-white min-h-150 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Swiper Carousel */}
      <div className="relative z-0 w-full h-150">
        <SwiperCard onSlideChange={handleSlideChange} />
      </div>

      {/* Decorative animated gradient circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-[#CC0000] rounded-full blur-3xl z-10"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl z-10"
      />

      {/* Dynamic Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-center px-4 sm:px-6 lg:px-8">
        <motion.div 
          key={activeSlide.mainTitle}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-sm md:max-w-md lg:max-w-lg bg-white/90 backdrop-blur-md p-6 md:p-8 shadow-2xl relative overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Decorative line */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#CC0000] to-orange-500"
          />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-[#CC0000]/10 px-3 py-1.5 rounded-full mb-4"
          >
            <Award className="w-3.5 h-3.5 text-[#CC0000]" />
            <span className="text-xs font-medium text-[#CC0000]">Professional Certification</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight text-gray-900"
          >
            {activeSlide.mainTitle}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-sm md:text-base text-gray-700 mb-6 leading-relaxed"
          >
            {activeSlide.mainDescription}
          </motion.p>

          <motion.button 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.05, backgroundColor: "#CC0000", borderColor: "#CC0000", color: "#ffffff" }}
            whileTap={{ scale: 0.95 }}
            className="border-2 border-[#CC0000] text-[#CC0000] px-6 md:px-8 py-3 transition-all duration-300 font-medium inline-flex items-center gap-2 group"
          >
            {activeSlide.ctaText}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}