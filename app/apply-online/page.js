import { Suspense } from 'react';
import Loading from './loading';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import Programs from '../components/sections/Programs';
import HowItWorksSection from './components/HowItWorksSection';
import FaqList from './components/FaqList';
import ContactForm from './components/ContactForm';

// SEO Metadata
export const metadata = {
  title: 'Apply Online for Live Interior Design Courses | IIID Certification',
  description: 'Apply online for live interior design certification programs. 30-day online courses with flexible scheduling. Get internationally recognized IIID certification.',
  keywords: 'interior design courses, online certification, live online classes, interior design certification, IIID, apply online',
  openGraph: {
    title: 'Apply Online for Live Interior Design Courses | IIID',
    description: 'Join our live online interior design certification programs. Limited seats available.',
    url: 'https://iiid.com/apply-online',
    siteName: 'IIID - International Institute of Interior Designers',
    images: [
      {
        url: '/images/og-apply-online.jpg',
        width: 1200,
        height: 630,
        alt: 'IIID Apply Online',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apply Online for Live Interior Design Courses',
    description: 'Get certified in interior design with our live online programs.',
    images: ['/images/twitter-apply-online.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://iiid.com/apply-online',
  },
};

export default function ApplyOnline() {
  return (
    <div className="min-h-screen bg-white">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Course",
            "name": "Interior Design Certification Program",
            "description": "Professional certification in interior design through live online learning",
            "provider": {
              "@type": "Organization",
              "name": "International Institute of Interior Designers (IIID)",
              "url": "https://iiid.com"
            },
            "hasCourseInstance": {
              "@type": "CourseInstance",
              "courseMode": "Online",
              "courseWorkload": "P30D",
              "startDate": "2024-03-15",
              "instructor": {
                "@type": "Person",
                "name": "Industry Experts"
              }
            },
            "offers": {
              "@type": "Offer",
              "price": "79.00",
              "priceCurrency": "USD",
              "availability": "https://schema.org/LimitedAvailability"
            }
          })
        }}
      />

      {/* 1. Hero Section - Top of page */}
      <Suspense fallback={<Loading />}>
        <HeroSection />
      </Suspense>

      {/* 2. Benefits Section - Why choose us */}
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
        <BenefitsSection />
      </Suspense>

      {/* 3. Programs Section - Available programs */}
      {/* <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse"></div>}>
        <Programs />
      </Suspense> */}

      {/* 4. How It Works Section - Step by step guide */}
      <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
        <HowItWorksSection />
      </Suspense>

      {/* 7. FAQ Section - Frequently asked questions */}
      <Suspense fallback={<div className="h-96 bg-white animate-pulse"></div>}>
        <FaqList />
      </Suspense>
 <Suspense fallback={<div className="h-96 bg-gray-50 animate-pulse"></div>}>
        <ContactForm />
      </Suspense>
     
       
    </div>
  );
}