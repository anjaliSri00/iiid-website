"use client";

import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Video,
  CheckSquare,
  ClipboardCheck,
  Award,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Apply Online",
      description: "Fill out the application form with your details",
      bg: "bg-[#CC0000]/10",
      text: "text-[#CC0000]",
      border: "border-[#D4A574]/30",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Get Confirmed",
      description: "Receive confirmation email with joining instructions",
      bg: "bg-[#DC2626]/10",
      text: "text-[#DC2626]",
      border: "border-[#D4A574]/30",
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Watch Video Lessons",
      description: "Access high-quality video content and learn at your own pace",
      bg: "bg-[#CC0000]/10",
      text: "text-[#CC0000]",
      border: "border-[#D4A574]/30",
    },
    {
      icon: <CheckSquare className="w-6 h-6" />,
      title: "Mark Lessons Complete",
      description: "Complete all lessons and track your progress",
      bg: "bg-[#DC2626]/10",
      text: "text-[#DC2626]",
      border: "border-[#D4A574]/30",
    },
    {
      icon: <ClipboardCheck className="w-6 h-6" />,
      title: "Take Assessment",
      description: "Test your knowledge with the course assessment",
      bg: "bg-[#CC0000]/10",
      text: "text-[#CC0000]",
      border: "border-[#D4A574]/30",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Get Certified",
      description: "Earn your certificate and showcase your achievement",
      bg: "bg-gradient-to-br from-[#CC0000] to-[#DC2626]",
      text: "text-white",
      border: "border-[#CC0000]",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4 text-[#CC0000]" />
              <span className="text-sm font-medium text-[#CC0000]">Learning Journey</span>
            </div>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-serif"
          >
            How Live Online Courses Work
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg"
          >
            Your journey to certification in 6 simple steps
          </motion.p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`group relative bg-white rounded-2xl p-6 md:p-8 border ${step.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-[#CC0000] border-2 border-[#CC0000] shadow-md group-hover:scale-110 transition-transform">
                {index + 1}
              </div>

              {/* Icon */}
              <div className={`${step.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <div className={step.text}>
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#CC0000] transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Arrow indicator on hover */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <ArrowRight className="w-5 h-5 text-[#CC0000]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12 md:mt-16"
        >
          <div className="inline-flex items-center gap-4 bg-[#FDF8F0] px-6 py-3 rounded-full shadow-md border border-[#D4A574]/30">
            <span className="text-sm text-gray-600">Ready to start your journey?</span>
            <Link href="/#programs">
              <button className="bg-[#CC0000] text-white px-6 py-2 rounded-full hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 text-sm font-medium inline-flex items-center gap-2">
                Enroll Now
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}