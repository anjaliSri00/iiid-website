'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, MessageCircle, Phone, Loader2, CheckCircle, Sparkles, AlertCircle } from 'lucide-react';
import fetchApiResponse from '@/helper/api_data_store';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

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
      // Prepare payload
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim() || undefined,
        message: formData.message.trim(),
      };

      console.log('Submitting contact form:', payload);

      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/contact/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      console.log('Contact form response:', response);

      if (response?.meta?.status === 200 || response?.meta?.status === 201) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
      } else {
        setApiError(response?.meta?.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setApiError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError(null);
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          {/* <span className="inline-flex items-center gap-2 bg-[#CC0000]/10 px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-[#CC0000]" />
            <span className="text-sm font-medium text-[#CC0000]">Get in Touch</span>
          </span> */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
            We'd Love to Hear From You
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out and we'll get back to you within 24 hours.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div className="bg-[#FDF8F0] p-6 shadow-sm border border-[#D4A574]/30">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#CC0000]/10 rounded-lg mt-1">
                    <Mail className="w-5 h-5 text-[#CC0000]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href="mailto:iiid@gmail.com" className="text-gray-900 hover:text-[#CC0000] transition-colors">
                      iiid@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#CC0000]/10 rounded-lg mt-1">
                    <Phone className="w-5 h-5 text-[#CC0000]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href="tel:+919848987890" className="text-gray-900 hover:text-[#CC0000] transition-colors">
                      +91 98489 87890
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-[#CC0000]/10 rounded-lg mt-1">
                    <MessageCircle className="w-5 h-5 text-[#CC0000]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Response Time</p>
                    <p className="text-gray-900">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#FDF8F0] to-[#F5E6D3] rounded-2xl p-6 border border-[#D4A574]/30">
              <h4 className="font-semibold text-gray-900 mb-2">Why Contact Us?</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full"></span>
                  Questions about our programs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full"></span>
                  Partnership opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full"></span>
                  Feedback & suggestions
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#CC0000] rounded-full"></span>
                  Just say hello! 👋
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-[#D4A574]/30"
          >
            {isSubmitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent! 🎉</h3>
                <p className="text-gray-600 text-center">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* API Error */}
                {apiError && (
                  <div className="p-3 bg-[#CC0000]/10 border border-[#CC0000]/30 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#CC0000]">{apiError}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name <span className="text-[#CC0000]">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CC0000]/60" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all ${
                        errors.name ? 'border-[#CC0000] ring-2 ring-[#CC0000]/20' : 'border-[#D4A574]/30'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-[#CC0000] text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-[#CC0000]">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CC0000]/60" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all ${
                        errors.email ? 'border-[#CC0000] ring-2 ring-[#CC0000]/20' : 'border-[#D4A574]/30'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[#CC0000] text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CC0000]/60" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 border border-[#D4A574]/30 rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all"
                      placeholder="+91 99388 30890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message <span className="text-[#CC0000]">*</span>
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-3 w-4 h-4 text-[#CC0000]/60" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="4"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all resize-none ${
                        errors.message ? 'border-[#CC0000] ring-2 ring-[#CC0000]/20' : 'border-[#D4A574]/30'
                      }`}
                      placeholder="Tell us how we can help..."
                    />
                  </div>
                  {errors.message && (
                    <p className="text-[#CC0000] text-xs mt-1">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-[#CC0000] text-white rounded-xl font-semibold hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  We respect your privacy. Your information is safe with us.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}