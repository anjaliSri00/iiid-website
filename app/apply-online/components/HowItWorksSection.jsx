"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Mail,
  PlayCircle,
  BookOpen,
  ClipboardCheck,
  Trophy,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Apply Online",
      description: "Complete our simple online application form.",
      time: "5 minutes",
      color: "#CC0000",
      bg: "bg-[#CC0000]",
      lightBg: "bg-[#CC0000]/10",
    },
    {
      icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Get Confirmed",
      description: "Receive your confirmation and login credentials.",
      time: "24 hours",
      color: "#DC2626",
      bg: "bg-[#DC2626]",
      lightBg: "bg-[#DC2626]/10",
    },
    {
      icon: <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Access Course Content",
      description: "Watch high-quality video lessons learning resources anytime, anywhere.",
      time: "Self-paced",
      color: "#CC0000",
      bg: "bg-[#CC0000]",
      lightBg: "bg-[#CC0000]/10",
    },
    {
      icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Track Your Progress",
      description: "Mark lessons complete and monitor your advancement.",
      time: "Ongoing",
      color: "#DC2626",
      bg: "bg-[#DC2626]",
      lightBg: "bg-[#DC2626]/10",
    },
    {
      icon: <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Final Assessment",
      description: "Complete the comprehensive course assessment.",
      time: "1 hour",
      color: "#CC0000",
      bg: "bg-[#CC0000]",
      lightBg: "bg-[#CC0000]/10",
    },
    {
      icon: <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />,
      title: "Earn Your Certificate",
      description: "Receive your professional certification instantly.",
      time: "Instant",
      color: "#CC0000",
      bg: "bg-gradient-to-r from-[#CC0000] to-[#DC2626]",
      lightBg: "bg-gradient-to-r from-[#CC0000]/10 to-[#DC2626]/10",
    }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-[#CC0000] text-white text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              Simple Process
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4"
          >
            How It <span className="text-[#CC0000]">Works</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4"
          >
            Your path to certification in six simple steps
          </motion.p>
        </div>

        {/* Timeline - Mobile First */}
        <div className="relative px-2">
          {/* Vertical Line - Hidden on mobile, visible on tablet+ */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#CC0000]/20 transform -translate-x-1/2"></div>
          
          {/* Mobile Vertical Line */}
          <div className="md:hidden absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-[#CC0000]/20"></div>

          <div className="space-y-6 sm:space-y-8 md:space-y-0 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`md:flex md:items-center ${
                  index % 2 === 0 ? '' : 'md:flex-row-reverse'
                } relative`}
              >
                {/* Timeline Dot - Desktop */}
                <div className="hidden md:flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white border-4 border-[#CC0000] shadow-lg z-10 absolute left-1/2 transform -translate-x-1/2">
                  <div className="absolute inset-0 bg-[#CC0000] rounded-full animate-ping opacity-20"></div>
                  <div className="relative z-10 text-[#CC0000]">
                    {step.icon}
                  </div>
                </div>

                {/* Mobile Dot */}
                <div className="md:hidden absolute left-4 sm:left-6 top-6 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-[#CC0000] border-2 border-white shadow-lg z-10">
                  <div className="absolute inset-0 bg-[#CC0000] rounded-full animate-ping opacity-20"></div>
                </div>

                {/* Content - Mobile First */}
                <div className={`md:w-5/12 ${
                  index % 2 === 0 ? 'md:pr-8 lg:pr-16 md:text-right' : 'md:pl-8 lg:pl-16'
                }`}>
                  <div className="bg-white p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-[#CC0000]/20 ml-8 sm:ml-10 md:ml-0">
                    {/* Step Number & Time */}
                    <div className={`flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 ${
                      index % 2 === 0 ? 'md:justify-end' : ''
                    }`}>
                      <span className="text-[10px] sm:text-xs font-bold text-white bg-[#CC0000] px-2 sm:px-3 py-0.5 sm:py-1">
                        Step {index + 1}
                      </span>
                      <span className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        {step.time}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800 mb-1 sm:mb-2">
                      {step.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Mobile Icon */}
                    <div className="md:hidden absolute left-0 top-1/2 transform -translate-y-1/2 -ml-6 sm:-ml-8 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white shadow-lg">
                      <div className="scale-75 sm:scale-100">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Empty spacer for alignment - Desktop only */}
                <div className="hidden md:block md:w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-10 sm:mt-12 md:mt-16"
        >
          <Link href="/apply-online">
            <button className="bg-[#CC0000] text-white px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 text-sm sm:text-base md:text-lg font-semibold inline-flex items-center gap-2 sm:gap-3">
              Start Your Journey
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}