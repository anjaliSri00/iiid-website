// components/ui/PublicFAQList.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";

const FaqList = ({ faqs, loading = false, hideContactCta = false }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Set expanded FAQs based on is_collapsed field
  useEffect(() => {
    if (faqs && faqs.length > 0) {
      // Find first FAQ that is NOT collapsed (is_collapsed: false)
      const firstExpanded = faqs.find(faq => faq.is_collapsed === false);
      
      // If there's an expanded FAQ, set it as open, otherwise open the first one
      if (firstExpanded) {
        setExpandedFaq(firstExpanded.id);
      } else {
        // If all are collapsed, open the first one
        setExpandedFaq(faqs[0].id);
      }
    } else {
      setExpandedFaq(null);
    }
  }, [faqs]);

  const toggleExpand = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const isExpanded = (faqId) => {
    return expandedFaq === faqId;
  };

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

  // Check if ANY FAQ has page_id !== 2 (not on contact page)
  const showContactCta = !hideContactCta && faqs && faqs.length > 0 && !faqs.some(faq => faq.page_id === 2);

  return (
    <section className="py-10 md:py-24 ">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 px-4 py-2  mb-4">
            <ThumbsUp className="w-4 h-4 text-[#CC0000]" />
            <span className="text-sm font-medium text-[#CC0000]">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 ">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to commonly asked questions about our platform and services
          </p>
        </motion.div>

        {/* FAQs List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white ">
            <Loader2 className="w-10 h-10 animate-spin text-[#CC0000]" />
            <p className="mt-3 text-gray-500 font-medium">Loading FAQs...</p>
            <p className="text-sm text-gray-400">Please wait while we fetch the questions</p>
          </div>
        ) : !faqs || faqs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white border-2 border-dashed border-gray-200"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No FAQs Available</h4>
            <p className="text-gray-500 max-w-md mx-auto">
              Check back later for updates and new questions.
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {faqs.map((faq) => {
              const open = isExpanded(faq.id);
              
              return (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  className="bg-white  border border-gray-200 overflow-hidden hover:border-[#CC0000]/30 hover:shadow-lg transition-all duration-300"
                >
                  <button
                    onClick={() => toggleExpand(faq.id)}
                    className="w-full text-left px-6 py-4 hover:bg-gray-50/50 transition-colors duration-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {/* {faq.page_name && (
                            <span className="px-2.5 py-1 bg-[#CC0000]/10 text-[#CC0000] text-xs font-medium rounded-lg">
                              {faq.page_name}
                            </span>
                          )}
                          {faq.is_collapsed === false && (
                            <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-lg">
                              Open
                            </span>
                          )}
                          {faq.is_collapsed === true && (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-medium rounded-lg">
                              Collapsed
                            </span>
                          )} */}
                        </div>
                        <h3 className="text-base font-semibold text-gray-900 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="shrink-0 mt-1">
                        <div className={`p-2 rounded-full transition-all duration-300 ${
                          open ? "bg-[#CC0000] text-white" : "bg-gray-100 text-gray-400"
                        }`}>
                          {open ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Answer Section */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      open ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-gray-100">
                      <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Still have questions? - Show only if NOT on Contact Us page */}
        {!loading && showContactCta && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center bg-gradient-to-br from-[#FDF8F0] to-[#F5E6D3] p-6 sm:p-8 border border-[#D4A574]/30"
          >
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Still have questions?</h4>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? We're here to help.
            </p>
            <a
              href="/contact-us"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#CC0000] text-white hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              Contact Us
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FaqList;