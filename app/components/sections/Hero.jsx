'use client';

import { useState } from 'react';
import SwiperCard from "../ui/SwiperCard";

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState({
    mainTitle: "Certification that recognizes your professional experience",
    mainDescription: "Advance your career with internationally recognized interior design certifications",
    ctaText: "Read More"
  });

  const handleSlideChange = (slideData) => {
    setActiveSlide({
      mainTitle: slideData.mainTitle,
      mainDescription: slideData.mainDescription,
      ctaText: slideData.ctaText
    });
  };

  return (
    <section id="home" className="relative w-full text-white min-h-[600px]">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>
      
      {/* Swiper Carousel */}
      <div className="relative z-0 w-full h-[600px]">
        <SwiperCard onSlideChange={handleSlideChange} />
      </div>

      {/* Dynamic Content Overlay */}
      <div className="absolute inset-0 z-20 flex items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md md:max-w-lg lg:max-w-xl bg-black/40 backdrop-blur-sm p-6 md:p-8 rounded-lg transition-all duration-500">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 leading-tight">
            {activeSlide.mainTitle}
          </h1>
          <p className="text-sm md:text-base text-gray-200 mb-6">
            {activeSlide.mainDescription}
          </p>
          <button className="border-2 border-white text-white px-6 md:px-8 py-3 rounded-md hover:bg-white hover:text-gray-900 transition-all duration-300 font-medium">
            {activeSlide.ctaText}
          </button>
        </div>
      </div>
    </section>
  );
}