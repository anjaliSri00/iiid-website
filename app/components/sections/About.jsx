"use client";

import { certificate } from '@/public/img';
import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Award, CheckCircle, BookOpen } from 'lucide-react';

export default function About() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="about" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:gap-12 justify-center items-center">
          {/* Text Content */}
          <div className="flex flex-col justify-center items-center text-center">

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold lg:text-5xl text-gray-900 mb-6"
            >
              About IIID
            </motion.h2>

            {/* First paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="text-black montserrat-400 text-base md:text-lg lg:text-xl max-w-4xl mx-auto mb-6 md:mb-8 leading-8 text-justify"
            >
              IIID provides professional development training programs designed for experienced professionals, focusing on advanced skills, evolving industry practices, and practical application to support continuous learning and professional excellence.
            </motion.p>

            {/* Subtitle */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              viewport={{ once: true }}
              className="text-lg md:text-2xl montserrat-600 text-gray-900 mb-4 md:mb-6 text-center max-sm:text-left"
            >
              Professional Certifications - Knowledge Based Certifications
            </motion.h3>

            {/* Second paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
              className="text-black montserrat-400 text-base md:text-lg lg:text-xl mx-auto mb-6 leading-relaxed text-justify"
            >
              <span className="montserrat-600 text-black">Knowledge-based certifications</span> are market-driven education and certification programs designed to ensure that individuals possess the required knowledge and understanding of International Institute of Interior Designers (IIID) standards. These certifications typically involve focused learning and validate conceptual and foundational knowledge of specific frameworks and practices.
            </motion.p>

            {/* Third paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              viewport={{ once: true }}
              className="text-black montserrat-400 text-base md:text-lg lg:text-xl mx-auto mb-6 leading-relaxed text-justify"
            >
              <span className="montserrat-600 text-black">IIID Certification Credentials,</span> in contrast, are experience-based certifications that recognize an individual's professional practice and industry expertise. Certification is awarded primarily through a structured assessment of professional experience, with minimal formal learning requirements and no traditional classroom lectures or examinations.
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}