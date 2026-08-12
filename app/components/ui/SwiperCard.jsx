"use client";

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { home1_Section1, home2_Section1, home3_Section1 } from '@/public/img';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function SwiperCard({ onSlideChange }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Sample slide data with detailed content
  const slides = [
    {
      id: 1,
      title: "Certification that recognizes your professional experience.",
      // title2: "your professional experience.",
      description: "Transform spaces with expert knowledge",
      mainTitle: "Professional Certification for Interior Designers",
      mainDescription: "Get certified and recognized for your expertise in residential, commercial, and hospitality design.",
      ctaText: "Explore Programs",
      image: home1_Section1.src,
      position: "left"
      // bgColor: "bg-gradient-to-r from-blue-900 to-purple-900"
    },
    {
      id: 2,
      title: "Structured learning with",
      title2: " assessment of experience.",
      description: "Get certified by international standards",
      mainTitle: "Internationally Recognized Certification",
      mainDescription: "Join a global community of certified interior design professionals and stand out in your career.",
      ctaText: "Learn More",
      image: home2_Section1.src,
       position: "center" 
      // bgColor: "bg-gradient-to-r from-green-900 to-teal-900"
    },
    {
      id: 3,
      title: "Stand equal.",
      title2: "Stay competitive.",
      description: "Online programs designed for professionals",
      mainTitle: "Flexible Online Learning",
      mainDescription: "Study at your own pace with our 30-day online programs designed for working professionals.",
      ctaText: "Apply Now",
      image: home3_Section1.src,
       position: "right"
      // bgColor: "bg-gradient-to-r from-red-900 to-orange-900"
    },
  ];

  const handleSlideChange = (swiper) => {
    const index = swiper.realIndex;
    setActiveIndex(index);
    if (onSlideChange) {
      onSlideChange(slides[index]);
    }
  };

  return (
   <div className="relative w-full h-full">
    <Swiper
      pagination={{
        dynamicBullets: true,
        clickable: true,
      }}
     navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      loop={true}
      modules={[Pagination, Autoplay, Navigation]}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
      onSlideChange={handleSlideChange}
      onInit={(swiper) => {
        if (onSlideChange) {
          onSlideChange(slides[swiper.realIndex]);
        }
      }}
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <div className={`relative w-full h-full  flex items-center justify-center`}>
            {slide.image && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            )}
            
           
          </div>
        </SwiperSlide>
      ))}
    </Swiper>

       <button 
        className="swiper-button-prev-custom absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Previous slide"
      >
        <ArrowLeft className="w-6 h-6 text-gray-700 group-hover:text-[#CC0000] transition-colors" />
      </button>
      
      <button 
        className="swiper-button-next-custom absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/80 backdrop-blur-sm hover:bg-white border border-gray-200 shadow-lg rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        aria-label="Next slide"
      >
        <ArrowRight className="w-6 h-6 text-gray-700 group-hover:text-[#CC0000] transition-colors" />
      </button>

        <style jsx global>{`
        .swiper-pagination-bullet {
          background: rgba(255, 255, 255, 0.6) !important;
          opacity: 1 !important;
          width: 10px !important;
          height: 10px !important;
          transition: all 0.3s ease !important;
        }
        .swiper-pagination-bullet-active {
          background: #CC0000 !important;
          width: 30px !important;
          border-radius: 5px !important;
        }
        .swiper-pagination {
          bottom: 30px !important;
          z-index: 30 !important;
        }
        .swiper-button-prev-custom,
        .swiper-button-next-custom {
          display: flex !important;
        }
        @media (max-width: 768px) {
          .swiper-button-prev-custom,
          .swiper-button-next-custom {
            width: 36px !important;
            height: 36px !important;
          }
          .swiper-button-prev-custom {
            left: 10px !important;
          }
          .swiper-button-next-custom {
            right: 10px !important;
          }
          .swiper-pagination-bullet {
            width: 8px !important;
            height: 8px !important;
          }
          .swiper-pagination-bullet-active {
            width: 20px !important;
          }
        }
      `}</style>

    </div>
  );
}