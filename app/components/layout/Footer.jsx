'use client'
import Link from 'next/link'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import { 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  PhoneCall, 
  MailIcon, 
  MapPinIcon,
  Sparkles,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react'
import { motion } from 'framer-motion'
import { logo } from '@/public/img'
import Image from 'next/image'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="max-w-screen-3xl w-full bg-[#FDF8F0] border-t border-[#D4A574]/30">
      {/* Main Footer */}
      <div className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1 - Brand Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
 <Link href="/" className="flex items-center group">
              <div className="relative h-10 md:h-12 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                <Image
                  src={logo}
                  alt="IIID - International Institute of Interior Design" 
                  width={180} 
                  height={48}
                  className="object-contain h-full w-auto"
                  priority
                />
              </div>
            </Link>
            </div>
            {/* <p className="text-gray-700 text-sm leading-relaxed font-medium">
              International Institute of Interior Designers
            </p> */}
            <p className="text-gray-600 text-sm leading-relaxed">
              Professional certification recognizing your expertise and experience in interior design.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <Link 
                href="#" 
                className="w-10 h-10 bg-[#CC0000]/10 text-[#CC0000] rounded-lg flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all duration-300"
              >
                <FaFacebook size={18} />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-[#CC0000]/10 text-[#CC0000] rounded-lg flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all duration-300"
              >
                <FaLinkedin size={18} />
              </Link>
              <Link 
                href="#" 
                className="w-10 h-10 bg-[#CC0000]/10 text-[#CC0000] rounded-lg flex items-center justify-center hover:bg-[#CC0000] hover:text-white transition-all duration-300"
              >
                <FaInstagram size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Column 2 - Quick Links */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#CC0000]">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 hover:text-[#CC0000] transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 text-[#D4A574] group-hover:translate-x-1 transition-transform" />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/apply-online" className="text-gray-600 hover:text-[#CC0000] transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 text-[#D4A574] group-hover:translate-x-1 transition-transform" />
                  Apply Online
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-600 hover:text-[#CC0000] transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 text-[#D4A574] group-hover:translate-x-1 transition-transform" />
                  About IIID
                </Link>
              </li>
              <li>
                <Link href="/certificates" className="text-gray-600 hover:text-[#CC0000] transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 text-[#D4A574] group-hover:translate-x-1 transition-transform" />
                  Certification
                </Link>
              </li>
              <li>
                <Link href="/contact-us" className="text-gray-600 hover:text-[#CC0000] transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 text-[#D4A574] group-hover:translate-x-1 transition-transform" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Column 3 - Programs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#CC0000]">
              Our Programs
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#programs" className="text-gray-600 hover:text-[#CC0000] transition-colors  group flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full group-hover:bg-[#CC0000] transition-colors"></span>
                  Residential Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-[#CC0000] transition-colors  group flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full group-hover:bg-[#CC0000] transition-colors"></span>
                  Workplace Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-[#CC0000] transition-colors  group flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full group-hover:bg-[#CC0000] transition-colors"></span>
                  Retail Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-[#CC0000] transition-colors  group flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#D4A574] rounded-full group-hover:bg-[#CC0000] transition-colors"></span>
                  Diploma in Hospitality Design
                </a>
              </li>
            </ul>
          </motion.div>

          {/* Column 4 - Contact Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h4 className="text-lg font-semibold text-gray-900 relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#CC0000]">
              Contact Us
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 group">
                <div className="w-9 h-9 bg-[#CC0000]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#CC0000] transition-colors">
                  <MailIcon size={16} className="text-[#CC0000] group-hover:text-white transition-colors" />
                </div>
                <Link 
                  href="mailto:support@iiid.institute" 
                  className="text-gray-600 hover:text-[#CC0000] transition-colors text-sm"
                >
                  support@iiid.institute
                </Link>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <div className="w-9 h-9 bg-[#CC0000]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#CC0000] transition-colors">
                  <PhoneCall size={16} className="text-[#CC0000] group-hover:text-white transition-colors" />
                </div>
                <Link 
                  href="tel:+15551234567" 
                  className="text-gray-600 hover:text-[#CC0000] transition-colors text-sm"
                >
                  +1 (555) 123-4567
                </Link>
              </div>

              <div className="flex items-center space-x-3 group">
                <div className="w-9 h-9 bg-[#CC0000]/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-[#CC0000] transition-colors">
                  <MapPinIcon size={16} className="text-[#CC0000] group-hover:text-white transition-colors" />
                </div>
                <span className="text-gray-600 text-sm">
                  123 Design Street, New York, NY 10001
                </span>
              </div>
            </div>

            {/* Newsletter Signup */}
            {/* <div className="pt-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4A574]" />
                Newsletter
              </h5>
              <form className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white border border-[#D4A574]/30 focus:outline-none focus:border-[#CC0000] focus:ring-2 focus:ring-[#CC0000]/20 transition-all text-gray-900 placeholder-gray-400"
                />
                <button 
                  type="submit"
                  className="bg-[#CC0000] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  Subscribe
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div> */}
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#D4A574]/30 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-500 text-sm text-center md:text-left">
              <p>
                &copy; {currentYear} <span className="text-[#CC0000] font-semibold">IIID</span> - International Institute of Interior Designers. 
                <span className="hidden sm:inline"> All rights reserved.</span>
              </p>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-[#CC0000] transition-colors">
                Privacy Policy
              </a>
              <span className="text-[#D4A574]/50">|</span>
              <a href="#" className="text-gray-500 hover:text-[#CC0000] transition-colors">
                Terms of Service
              </a>
              <span className="text-[#D4A574]/50">|</span>
              <a href="#" className="text-gray-500 hover:text-[#CC0000] transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}