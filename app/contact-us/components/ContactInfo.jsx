// app/contact/components/ContactInfo.js
"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Building,
  MapPin,
  ArrowRight,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa6";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function ContactInfo() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Quick Contact */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#CC0000]" />
          Quick Contact
        </h3>
        <div className="space-y-4">
          <a
            href="mailto:iiid@gmail.com"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#CC0000]/5 transition-all group"
          >
            <div className="p-2 bg-[#CC0000]/10 rounded-lg group-hover:bg-[#CC0000] transition-all">
              <Mail className="w-4 h-4 text-[#CC0000] group-hover:text-white transition-all" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900">iiid@gmail.com</p>
            </div>
          </a>
          <a
            href="tel:+919848987890"
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-[#CC0000]/5 transition-all group"
          >
            <div className="p-2 bg-[#CC0000]/10 rounded-lg group-hover:bg-[#CC0000] transition-all">
              <Phone className="w-4 h-4 text-[#CC0000] group-hover:text-white transition-all" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-medium text-gray-900">+91 98489 87890</p>
            </div>
          </a>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className="p-2 bg-[#CC0000]/10 rounded-lg">
              <Clock className="w-4 h-4 text-[#CC0000]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Working Hours</p>
              <p className="text-sm font-medium text-gray-900">Mon-Fri, 9AM - 6PM</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Address */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-[#CC0000]" />
          Our Office
        </h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              IIID,<br />
              Hyderabad,<br />
              Telangana, India
            </p>
          </div>
          <div className="pt-3 border-t border-gray-100">
            <Link
              href="https://maps.google.com"
              target="_blank"
              className="inline-flex items-center gap-2 text-sm text-[#CC0000] hover:text-[#B30000] font-medium"
            >
              View on Google Maps
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#CC0000]" />
          Follow Us
        </h3>
        <div className="flex gap-3">
          <Link
            href="#"
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all group"
            aria-label="Facebook"
          >
            <FaFacebook className="w-5 h-5 text-gray-600 group-hover:text-white transition-all" />
          </Link>
          <Link
            href="#"
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all group"
            aria-label="Twitter"
          >
            <FaTwitter className="w-5 h-5 text-gray-600 group-hover:text-white transition-all" />
          </Link>
          <Link
            href="#"
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all group"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="w-5 h-5 text-gray-600 group-hover:text-white transition-all" />
          </Link>
          <Link
            href="#"
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all group"
            aria-label="Instagram"
          >
            <FaInstagram className="w-5 h-5 text-gray-600 group-hover:text-white transition-all" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}