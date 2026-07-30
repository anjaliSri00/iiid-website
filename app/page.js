import Hero from './components/sections/Hero'
import Programs from './components/sections/Programs'
import About from './components/sections/About'
import HowItWorksSection from './apply-online/components/HowItWorksSection'
import { Suspense } from 'react'
import CertificateSection from './components/sections/Certification'

export default function page() {
  return (
    <>
    <div className='max-w-screen-3xl overflow-x-hidden w-full min-h-screen h-full'>
      <Hero />
      <Programs />
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
              <HowItWorksSection />
            </Suspense>
            <CertificateSection/>
      {/* <About /> */}
      </div>
    </>
  )
}