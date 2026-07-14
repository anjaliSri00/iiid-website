// app/contact/components/ContactForm.js
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  User,
  Mail,
  MessageCircle,
  Phone,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  MailCheck,
  MessageSquare,
} from "lucide-react";
import fetchApiResponse from "@/helper/api_data_store";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
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
      const payload = {
        full_name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.phone.trim(),
        message: formData.message.trim(),
        subject: formData.subject.trim() || undefined,
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
        setFormData({ name: "", email: "", phone: "", message: "", subject: "" });
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
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError(null);
  };

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-100">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Send Us a Message</h2>
        <p className="text-gray-500 text-sm">
          Fill in the form below and we'll get back to you within 24 hours.
        </p>
      </div>

      {isSubmitted ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center justify-center py-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Message Sent! 🎉</h3>
          <p className="text-gray-600 text-center max-w-md">
            Thank you for reaching out. We've received your message and will get back to you within 24 hours.
          </p>
          <button
            onClick={() => {
              setIsSubmitted(false);
              setFormData({ name: "", email: "", phone: "", message: "", subject: "" });
            }}
            className="mt-4 text-[#CC0000] hover:text-[#B30000] font-medium flex items-center gap-1"
          >
            Send another message
            <ChevronRight className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* API Error */}
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-[#CC0000]/10 border border-[#CC0000]/30 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-[#CC0000] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-[#CC0000]">Oops! Something went wrong</p>
                <p className="text-sm text-[#CC0000]/80">{apiError}</p>
              </div>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
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
                  required
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all ${
                    errors.name ? "border-[#CC0000] ring-2 ring-[#CC0000]/20" : "border-gray-200"
                  }`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-[#CC0000] text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
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
                    errors.email ? "border-[#CC0000] ring-2 ring-[#CC0000]/20" : "border-gray-200"
                  }`}
                  required
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-[#CC0000] text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone Number <span className="text-[#CC0000]">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CC0000]/60" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all ${
                  errors.phone ? "border-[#CC0000] ring-2 ring-[#CC0000]/20" : "border-gray-200"
                }`}
                placeholder="Enter your phone number"
              />
            </div>
            {errors.phone && (
              <p className="text-[#CC0000] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone}
              </p>
            )}
          </div>

         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message <span className="text-[#CC0000]">*</span>
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-[#CC0000]/60" />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#CC0000] focus:border-[#CC0000] outline-none transition-all resize-none ${
                  errors.message ? "border-[#CC0000] ring-2 ring-[#CC0000]/20" : "border-gray-200"
                }`}
                placeholder="Tell us how we can help you..."
              />
            </div>
            {errors.message && (
              <p className="text-[#CC0000] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#CC0000] text-white rounded-xl font-semibold hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-base"
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

          <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
            <MailCheck className="w-3 h-3" />
            We respect your privacy. Your information is safe with us.
          </p>
        </form>
      )}
    </div>
  );
}