'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  // {
  //   q: "Are the classes really live?",
  //   a: "Yes, all classes are conducted live by industry experts. You can interact with instructors in real-time, ask questions, and participate in discussions."
  // },
  // {
  //   q: "What if I miss a live session?",
  //   a: "All sessions are recorded and available in your dashboard for 6 months. You can watch them anytime at your convenience."
  // },
  // {
  //   q: "Will I get a certificate?",
  //   a: "Yes, you'll receive an IIID certificate upon successful completion of the program. The certificate is internationally recognized."
  // },
  // {
  //   q: "Are there any prerequisites?",
  //   a: "Basic understanding of design concepts is helpful but not mandatory. Our courses are designed for beginners and professionals alike."
  // },
  // {
  //   q: "How long will I have access to the course?",
  //   a: "You'll have access to the course materials, recordings, and resources for 6 months from the course start date."
  // },
  // {
  //   q: "Is there any placement assistance?",
  //   a: "Yes, we provide career guidance and connect you with our network of industry partners for job opportunities."
  // }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600">
            Find answers to common questions about our programs
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-red-200 transition"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left bg-white hover:bg-gray-50 transition"
              >
                <h3 className="text-lg font-semibold text-gray-900">{faq.q}</h3>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-red-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                )}
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.q,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.a
                }
              }))
            })
          }}
        />
      </div>
    </section>
  );
}