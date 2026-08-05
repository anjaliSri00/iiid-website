import Hero from './components/sections/Hero'
import Programs from './components/sections/Programs'
import About from './components/sections/About'
import HowItWorksSection from './apply-online/components/HowItWorksSection'
import { Suspense } from 'react'
import CertificateSection from './components/sections/Certification'
import { getFAQs } from '@/helper/lib/faq'
import FaqList from './components/ui/FaqList'

export default async function page() {
   const result = await getFAQs(1);
    const faqs = result?.props?.faqs || [];

  return (
    <>
    <div className='max-w-screen-3xl overflow-x-hidden w-full min-h-screen h-full'>
      <Hero />
    <Programs />
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
              <HowItWorksSection />
            </Suspense>
            <CertificateSection/>
         <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
         {/* FAQ Section */}
                {faqs && faqs.length > 0 && (
               <section className="pt-10 bg-white">
                 <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                   <FaqList faqs={faqs} loading={false} />
                 </div>
               </section>
                )}
</Suspense>
      </div>
    </>
  )
}