'use client'
import Link from 'next/link'
import { useState } from 'react'
import { 
  ChevronRight, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { logo2 } from '@/public/img'
import Image from 'next/image';
import { useSession } from 'next-auth/react'
import fetchApiResponse from '@/helper/api_data_store'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { data: session } = useSession()
  const isLoggedIn = !!session?.user;
  const isDesigner = session?.user?.role === "admin";

  // Contact form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Contact form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.mobile.trim()) newErrors.mobile = 'Mobile number is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  // Contact form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        message: formData.message.trim(),
        subject: 'Footer Contact Form Inquiry',
      };

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response?.meta?.status === 200 || response?.meta?.status === 201) {
        setIsSubmitted(true);
        setFormData({ firstName: '', lastName: '', email: '', mobile: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setApiError(response?.meta?.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  return (
    <footer className="w-full bg-black border-t border-[#CC0000]/20 text-white">
      {/* Main Footer */}
      <div className="py-12 md:py-16 px-10 max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">
          
          {/* Column 1 - Brand & Quick Links */}
          <div className="lg:col-span-3 grid grid-cols-2 border-r border-red-600">
            <div className="space-y-4">
              <Link href="/" className="flex items-center group">
                <div className="relative h-20 md:h-15 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                  <Image
                    src={logo2}
                    alt="IIID - International Institute of Interior Design" 
                    width={280} 
                    height={60}
                    className="object-contain h-full w-auto"
                    priority
                  />
                </div>
              </Link>
              
              <ul className="space-y-2 mt-4">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-[#CC0000] transition-colors flex items-center group text-base">
                    <ChevronRight size={14} className="mr-2 text-[#CC0000] group-hover:translate-x-1 transition-transform" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/apply-online" className="text-gray-400 hover:text-[#CC0000] transition-colors flex items-center group text-base">
                    <ChevronRight size={14} className="mr-2 text-[#CC0000] group-hover:translate-x-1 transition-transform" />
                    Apply Online
                  </Link>
                </li>
                <li>
                  <Link href="/about-us" className="text-gray-400 hover:text-[#CC0000] transition-colors flex items-center group text-base">
                    <ChevronRight size={14} className="mr-2 text-[#CC0000] group-hover:translate-x-1 transition-transform" />
                    About IIID
                  </Link>
                </li>
                {isLoggedIn && !isDesigner && (
                  <li>
                    <Link href="/certificates" className="text-gray-400 hover:text-[#CC0000] transition-colors flex items-center group text-base">
                      <ChevronRight size={14} className="mr-2 text-[#CC0000] group-hover:translate-x-1 transition-transform" />
                      Certification
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/programs" className="text-gray-400 hover:text-[#CC0000] transition-colors flex items-center group text-base">
                    <ChevronRight size={14} className="mr-2 text-[#CC0000] group-hover:translate-x-1 transition-transform" />
                    Programs
                  </Link>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-1">
            <h4 className="text-xl font-normal text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#CC0000]">
              Our Programs
            </h4>
            <ul className="space-y-2 mt-4">
              <li>
                <a href="#programs" className="text-gray-400 hover:text-[#CC0000] transition-colors group flex items-center gap-2 text-base">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full group-hover:scale-150 transition-transform"></span>
                  Residential Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-400 hover:text-[#CC0000] transition-colors group flex items-center gap-2 text-base">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full group-hover:scale-150 transition-transform"></span>
                  Workplace Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-400 hover:text-[#CC0000] transition-colors group flex items-center gap-2 text-base">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full group-hover:scale-150 transition-transform"></span>
                  Retail Interior Design
                </a>
              </li>
              <li>
                <a href="#programs" className="text-gray-400 hover:text-[#CC0000] transition-colors group flex items-center gap-2 text-base">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full group-hover:scale-150 transition-transform"></span>
                  Diploma in Hospitality Design
                </a>
              </li>
            </ul>
          </div> 
          </div>

          {/* Column 3 - Contact Form */}
          <div className="lg:col-span-2 px-4">
            <h4 className="text-xl font-normal text-white relative inline-block pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-[#CC0000]">
              Have Any Questions?
            </h4>

            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 bg-green-500/10 border border-green-500/30 p-4 text-center"
              >
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Message Sent! 🎉</p>
                <p className="text-gray-400 text-sm">We'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4">
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#CC0000]/10 border border-[#CC0000]/30 p-2 flex items-start gap-2 mb-3"
                  >
                    <AlertCircle className="w-4 h-4 text-[#CC0000] shrink-0 mt-0.5" />
                    <p className="text-[#CC0000] text-xs">{apiError}</p>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      First Name <span className="text-[#CC0000]">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className={`w-full px-0 py-2 bg-transparent border-0 border-b-2 focus:outline-none focus:border-[#CC0000] transition-colors text-sm text-white placeholder:text-gray-500 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(0,0,0,1)] ${
                        errors.firstName ? 'border-[#CC0000]' : 'border-[#CC0000]/50'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-[#CC0000] text-xs mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Last Name <span className="text-[#CC0000]">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className={`w-full px-0 py-2 bg-transparent border-0 border-b-2 focus:outline-none focus:border-[#CC0000] transition-colors text-sm text-white placeholder:text-gray-500 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(0,0,0,1)] ${
                        errors.lastName ? 'border-[#CC0000]' : 'border-[#CC0000]/50'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-[#CC0000] text-xs mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email <span className="text-[#CC0000]">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`w-full px-0 py-2 bg-transparent border-0 border-b-2 focus:outline-none focus:border-[#CC0000] transition-colors text-sm text-white placeholder:text-gray-500 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(0,0,0,1)] ${
                        errors.email ? 'border-[#CC0000]' : 'border-[#CC0000]/50'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[#CC0000] text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Mobile <span className="text-[#CC0000]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter your mobile no."
                      className={`w-full px-0 py-2 bg-transparent border-0 border-b-2 focus:outline-none focus:border-[#CC0000] transition-colors text-sm text-white placeholder:text-gray-500 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(0,0,0,1)] ${
                        errors.mobile ? 'border-[#CC0000]' : 'border-[#CC0000]/50'
                      }`}
                    />
                    {errors.mobile && (
                      <p className="text-[#CC0000] text-xs mt-1">{errors.mobile}</p>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Message <span className="text-[#CC0000]">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Type your message here..."
                    className={`w-full px-0 py-2 bg-transparent border-0 border-b-2 focus:outline-none focus:border-[#CC0000] transition-colors resize-none text-sm text-white placeholder:text-gray-500 [&:-webkit-autofill]:bg-transparent [&:-webkit-autofill]:text-white [&:-webkit-autofill]:shadow-[inset_0_0_0px_1000px_rgba(0,0,0,1)] ${
                      errors.message ? 'border-[#CC0000]' : 'border-[#CC0000]/50'
                    }`}
                  />
                  {errors.message && (
                    <p className="text-[#CC0000] text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 px-6 py-2 bg-[#CC0000] text-white hover:bg-[#B30000] transition-colors text-sm font-medium disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#CC0000]/20 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <p className="text-gray-400 text-sm text-center">
            &copy; {currentYear} by IIID.
                            <span className="hidden sm:inline"> All rights reserved.</span>
          </p>
        </div>
      </div>

      {/* Global styles for autofill */}
     <style jsx global>{`
        input[type="text"],
        input[type="email"],
        input[type="tel"],
        textarea {
          background-color: transparent !important;
          background: transparent !important;
          color: white !important;
        }
        
        input[type="text"]:-webkit-autofill,
        input[type="text"]:-webkit-autofill:hover,
        input[type="text"]:-webkit-autofill:focus,
        input[type="email"]:-webkit-autofill,
        input[type="email"]:-webkit-autofill:hover,
        input[type="email"]:-webkit-autofill:focus,
        input[type="tel"]:-webkit-autofill,
        input[type="tel"]:-webkit-autofill:hover,
        input[type="tel"]:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px black inset !important;
          -webkit-text-fill-color: white !important;
          background-color: transparent !important;
          background: transparent !important;
        }
        
        input[type="text"]::placeholder,
        input[type="email"]::placeholder,
        input[type="tel"]::placeholder,
        textarea::placeholder {
          color: #6b7280 !important;
        }
      `}</style>
    </footer>
  )
}