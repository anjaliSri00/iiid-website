// components/ui/PublicFAQList.js
"use client";

import { useState, useEffect } from "react";
import {
  HelpCircle,
  Search,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";
import fetchApiResponse from "@/helper/api_data_store";

const FaqList = ({ session }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPage, setSelectedPage] = useState("all");
  const [pages, setPages] = useState([]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [stats, setStats] = useState({ total: 0, pages: 0 });

  // Fetch FAQs
  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/faqs/list`,
        {
          method: "GET",
        }
      );

      if (response.meta?.status === 200 && response.data) {
        const faqData = Array.isArray(response.data) ? response.data : [];
        setFaqs(faqData);
        
        // Extract unique page names (filter out null values)
        const uniquePages = [...new Set(
          faqData
            .map(faq => faq.page_name)
            .filter(name => name !== null && name !== undefined && name !== "")
        )];
        setPages(uniquePages);

        setStats({
          total: faqData.length,
          pages: uniquePages.length,
        });
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle Expand
  const toggleExpand = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPage = selectedPage === "all" || faq.page_name === selectedPage;
    return matchesSearch && matchesPage;
  });

  // Initial fetch
  useEffect(() => {
    fetchFAQs();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-3 bg-red-50 px-4 py-2 rounded-full mb-4">
          <HelpCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium text-red-600">FAQ</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Find answers to commonly asked questions about our platform and services
        </p>
      </div>
      

      {/* FAQs List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-red-600" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No FAQs found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm || selectedPage !== "all"
              ? "Try adjusting your search or filters"
              : "Check back later for updates"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            // For public view: if is_collapsed is true, answer is hidden by default
            // User can click to expand and see the answer
            const isOpen = expandedFaq === faq.id;
            
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full text-left p-4 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      
                      <h3 className="text-base font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                    </div>
                    <div className="shrink-0 mt-1">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Answer Section - Show when user clicks to expand */}
                {isOpen && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0 border-t border-gray-100">
                    <div className="pt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FaqList;