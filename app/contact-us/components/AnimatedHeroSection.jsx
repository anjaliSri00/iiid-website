// app/contact/components/AnimatedHeroSection.jsx
'use client';

import { motion } from 'framer-motion';
import { Clock, Headphones, Sparkles, Mail, ArrowRight } from "lucide-react";

export default function AnimatedHeroSection() {
  return (
    <>
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"
      />
      <motion.div 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
        className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"
      />
      
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 w-20 h-20 bg-white/5 rounded-full blur-2xl"
      />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
         

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-light mb-4"
          >
            Let&apos;s Connect
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="text-lg md:text-xl max-w-2xl mx-auto"
          >
            Have questions about our programs, partnerships, or anything else? 
            We&apos;re here to help and would love to hear from you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-4 mt-6"
          >
            <motion.div 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2"
            >
              <Clock className="w-4 h-4" />
              <span className="text-sm">Response within 48hrs</span>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2"
            >
              <Headphones className="w-4 h-4" />
              <span className="text-sm">Support 9AM - 6PM (MON- SAT)</span>
            </motion.div>
          </motion.div>

          
        </div>
      </div>
    </>
  );
}