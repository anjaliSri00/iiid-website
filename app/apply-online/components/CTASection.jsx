'use client';

import Link from 'next/link';
import { ArrowRight, Headphones, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <motion.section 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-16 bg-red-600"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="text-red-100 mb-8 max-w-2xl mx-auto">
          Limited seats available. Apply now to secure your spot and get early bird benefits!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/application-form">
            <button className="bg-white text-red-600 px-8 py-3 rounded-md hover:bg-gray-100 transition font-semibold flex items-center gap-2 mx-auto">
              Apply Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-red-100">
          <div className="flex items-center gap-2 justify-center">
            <Headphones className="w-4 h-4" />
            <span>24/7 Student Support</span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Shield className="w-4 h-4" />
            <span>100% Secure Payments</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}