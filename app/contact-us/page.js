// app/contact/page.js
import FaqList from "../components/ui/FaqList";
import { getFAQs } from "@/helper/lib/faq";
import ContactForm from "./components/ContactForm";
import ContactInfo from "./components/ContactInfo";
import TrustBadges from "./components/TrustBadges";
import AnimatedHeroSection from "./components/AnimatedHeroSection";

// Server Component with SSR
export default async function ContactPage() {
  const result = await getFAQs(2);
  const faqs = result?.props?.faqs || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#8B0000] via-[#CC0000] to-[#B30000] pt-24 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <AnimatedHeroSection />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ContactInfo />
          </div>
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="pt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FaqList faqs={faqs} loading={false} />
        </div>
      </section>

      <TrustBadges />
    </div>
  );
}