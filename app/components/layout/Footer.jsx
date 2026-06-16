'use client'
import Link from 'next/link'
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'
import {  Mail, Phone, MapPin, ChevronRight, PhoneCall, MailIcon, MapPinIcon } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="max-w-screen-3xl w-full">
      {/* Main Footer */}
      <div className="py-12 md:py-16 px-4 ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1 - Brand Info */}
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-serif font-bold">
              IIID
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              International Institute of Interior Designers
            </p>
            <p className="text-gray-600 text-sm">
              Professional certification recognizing your expertise and experience in interior design.
            </p>
            {/* Social Links */}
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="text-gray-600 hover:text-accent transition-colors">
                <FaFacebook size={20} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-accent transition-colors">
                <FaTwitter size={20} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-accent transition-colors">
                <FaLinkedin size={20} />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-accent transition-colors">
                <FaInstagram size={20} />
              </Link>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Quick Links
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#home" className="text-gray-600 hover:text-accent transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Home
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-accent transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Programs
                </a>
              </li>
              <li>
                <a href="#about" className="text-gray-600 hover:text-accent transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  About IIID
                </a>
              </li>
              <li>
                <a href="#certification" className="text-gray-600 hover:text-accent transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  Certification
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-accent transition-colors flex items-center group">
                  <ChevronRight size={16} className="mr-2 group-hover:translate-x-1 transition-transform" />
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3 - Programs */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Our Programs
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#programs" className="text-gray-600 hover:text-accent transition-colors block">
                  Residential Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-accent transition-colors block">
                  Workplace Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-accent transition-colors block">
                  Retail Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-600 hover:text-accent transition-colors block">
                  Diploma in Hospitality Design
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Contact Us
            </h4>
            <div className="space-y-3">
              {/* <div className="flex items-start space-x-3 group">
                <MapPinIcon size={18} className="text-accent mt-0.5 shrink-0" />
                <p className="text-gray-600 text-sm">
                  C-153, Block C, Sushant Lok2, Gurugram, Haryana  
                </p>
              </div> */}
              
              <div className="flex items-center space-x-3 group">
                <MailIcon size={18} className="text-accent shrink-0" />
                <Link href="mailto:support@iiid.institute" className="text-gray-600 hover:text-accent transition-colors text-sm">      
support@iiid.institute
                </Link>
              </div>
              
              <div className="flex items-center space-x-3 group">
                <PhoneCall size={18} className="text-accent shrink-0" />
                <Link href="tel:+15551234567" className="text-gray-600 hover:text-accent transition-colors text-sm">
                  +1 (555) 123-4567
                </Link>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="pt-4">
              <h5 className="text-sm font-semibold mb-2">Newsletter</h5>
              <form className="flex flex-col sm:flex-row gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-1 px-3 py-2 text-sm rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-accent"
                />
                <button 
                  type="submit"
                  className="bg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-opacity-90 transition-colors"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-gray-500 text-sm text-center md:text-left">
              <p>&copy; {new Date().getFullYear()} IIID - International Institute of Interior Designers. All rights reserved.</p>
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <a href="#" className="text-gray-500 hover:text-accent transition-colors">
                Privacy Policy
              </a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-500 hover:text-accent transition-colors">
                Terms of Service
              </a>
              <span className="text-gray-600">|</span>
              <a href="#" className="text-gray-500 hover:text-accent transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}