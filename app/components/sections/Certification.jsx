"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Award,
  Shield,
  Globe,
  CheckCircle,
  Star,
  Users,
  Clock,
  ExternalLink,
  Sparkles,
  Verified,
  BadgeCheck,
  Building,
  FileCheck,
  TrendingUp,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { certificate } from "@/public/img";

export default function CertificateSection() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: <Globe className="w-5 h-5" />,
      text: "Internationally Recognized",
      color: "text-[#CC0000]",
      bg: "bg-[#CC0000]/10",
    },
    {
      icon: <Verified className="w-5 h-5" />,
      text: "Industry Validated",
      color: "text-[#CC0000]",
      bg: "bg-[#CC0000]/10",
    },
    {
      icon: <BadgeCheck className="w-5 h-5" />,
      text: "Globally Accepted",
      color: "text-[#CC0000]",
      bg: "bg-[#CC0000]/10",
    },
    {
      icon: <Building className="w-5 h-5" />,
      text: "Government Approved",
      color: "text-[#CC0000]",
      bg: "bg-[#CC0000]/10",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#CC0000] text-white text-sm font-medium  mb-4">
              Professional Certification
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Get <span className="text-[#CC0000]">Certified</span> by IIID
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            Earn an internationally recognized professional certification
          </motion.p>
        </div>

        <div className="grid max-lg:grid-cols-1 grid-cols-2 gap-12 items-center">
          {/* Left Side - Certificate Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div 
              className="relative overflow-hidden shadow-2xl shadow-gray-200/50 transition-all duration-500 bg-gray-100"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative w-full aspect-[4/3] bg-gray-100">
                <Image
                  src={certificate.src}
                  alt="IIID Professional Certification"
                  fill
                  className={`object-contain transition-all duration-500 ${
                    isHovered ? 'scale-[1.02]' : 'scale-100'
                  }`}
                  priority
                />
              </div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                Professional Certification in Interior Design
              </h3>
              <p className="text-gray-500 leading-relaxed">
                Earn a globally recognized certification that validates your expertise 
                in professional interior design standards and practices.
              </p>
            </div>

            {/* Feature Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className={`${feature.bg} p-3 flex items-center gap-2 transition-all duration-300 hover:scale-105`}
                >
                  <div className={feature.color}>{feature.icon}</div>
                  <span className="text-xs font-medium text-gray-700">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="space-y-2 border-t border-gray-100 pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CC0000] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Career Advancement</p>
                  <p className="text-xs text-gray-500">Boost your career prospects with professional certification</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CC0000] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Industry Recognition</p>
                  <p className="text-xs text-gray-500">Gain recognition from leading industry professionals</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-[#CC0000] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">Global Opportunities</p>
                  <p className="text-xs text-gray-500">Open doors to international career opportunities</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/programs">
                <button className="w-full bg-[#CC0000] text-white py-3  font-semibold flex items-center justify-center gap-2 hover:bg-[#B30000] transition-all duration-300 shadow-lg shadow-[#CC0000]/20 hover:shadow-xl">
                  Get Certified Now
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom Section - Matching Timeline Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 pt-12 border-t-2 hidden border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-14 h-14 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#CC0000] group-hover:text-white transition-all duration-300">
                <FileCheck className="w-6 h-6 text-[#CC0000] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Verification</h4>
              <p className="text-xs text-gray-400">Easily verify your certification online</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#CC0000] group-hover:text-white transition-all duration-300">
                <Shield className="w-6 h-6 text-[#CC0000] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Lifetime Validity</h4>
              <p className="text-xs text-gray-400">Your certification never expires</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#CC0000] group-hover:text-white transition-all duration-300">
                <TrendingUp className="w-6 h-6 text-[#CC0000] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Career Growth</h4>
              <p className="text-xs text-gray-400">Accelerate your professional journey</p>
            </div>
            <div className="text-center group">
              <div className="w-14 h-14 bg-[#CC0000]/10 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#CC0000] group-hover:text-white transition-all duration-300">
                <Award className="w-6 h-6 text-[#CC0000] group-hover:text-white transition-colors" />
              </div>
              <h4 className="text-sm font-semibold text-gray-800">Industry Standard</h4>
              <p className="text-xs text-gray-400">Aligned with professional standards</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}