// app/contact/page.js
import FaqList from "../components/ui/FaqList";
import { getFAQs } from "@/helper/lib/faq";
import ContactForm from "./components/ContactForm";
import ContactInfo from "./components/ContactInfo";
import TrustBadges from "./components/TrustBadges";
import { Clock, Headphones } from "lucide-react";

// Server Component with SSR
export default async function ContactPage() {
  // Fetch FAQs with page_id: 2 for Contact Us page
  const result = await getFAQs(2);
    console.log("FAQs from server:", result);
  
  // Access faqs correctly - they're inside props
  const faqs = result?.props?.faqs || [];
  const error = result?.props?.error || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#8B0000] via-[#CC0000] to-[#B30000] pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center text-white">
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-serif">
              Let's Connect
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Have questions about our programs, partnerships, or anything else? 
              We're here to help and would love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Response within 24hrs</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                <Headphones className="w-4 h-4" />
                <span className="text-sm">Support 9AM - 6PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info - Client Component */}
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>

          {/* Contact Form - Client Component */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* FAQ Section with SSR Data */}
      <section className="pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FaqList 
               faqs={faqs}
            loading={false}
          />
        </div>
      </section>

      {/* Trust Badges - Client Component */}
      <TrustBadges />
    </div>
  );
}