"use client";

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function SwiperCard({ onSlideChange }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Sample slide data with detailed content
  const slides = [
    {
      id: 1,
      title: "Professional Interior Design",
      description: "Transform spaces with expert knowledge",
      mainTitle: "Professional Certification for Interior Designers",
      mainDescription: "Get certified and recognized for your expertise in residential, commercial, and hospitality design.",
      ctaText: "Explore Programs",
      image: "/images/slide1.jpg",
      bgColor: "bg-gradient-to-r from-blue-900 to-purple-900"
    },
    {
      id: 2,
      title: "Industry Recognition",
      description: "Get certified by international standards",
      mainTitle: "Internationally Recognized Certification",
      mainDescription: "Join a global community of certified interior design professionals and stand out in your career.",
      ctaText: "Learn More",
      image: "/images/slide2.jpg",
      bgColor: "bg-gradient-to-r from-green-900 to-teal-900"
    },
    {
      id: 3,
      title: "Flexible Learning",
      description: "Online programs designed for professionals",
      mainTitle: "Flexible Online Learning",
      mainDescription: "Study at your own pace with our 30-day online programs designed for working professionals.",
      ctaText: "Apply Now",
      image: "/images/slide3.jpg",
      bgColor: "bg-gradient-to-r from-red-900 to-orange-900"
    },
    {
      id: 4,
      title: "Expert Faculty",
      description: "Learn from industry leaders",
      mainTitle: "Learn from Industry Experts",
      mainDescription: "Get mentored by leading interior designers and industry professionals with years of experience.",
      ctaText: "View Courses",
      image: "/images/slide4.jpg",
      bgColor: "bg-gradient-to-r from-indigo-900 to-pink-900"
    },
    {
      id: 5,
      title: "Global Community",
      description: "Join designers worldwide",
      mainTitle: "Join a Global Community",
      mainDescription: "Connect with interior designers from around the world and expand your professional network.",
      ctaText: "Join Now",
      image: "/images/slide5.jpg",
      bgColor: "bg-gradient-to-r from-yellow-900 to-amber-900"
    }
  ];

  const handleSlideChange = (swiper) => {
    const index = swiper.realIndex;
    setActiveIndex(index);
    if (onSlideChange) {
      onSlideChange(slides[index]);
    }
  };

  return (
    <Swiper
      pagination={{
        dynamicBullets: true,
        clickable: true,
      }}
      navigation={true}
      autoplay={{
        delay: 5000,
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
          <div className={`relative w-full h-full ${slide.bgColor} flex items-center justify-center`}>
            {slide.image && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            )}
            
            <div className="relative z-10 text-center text-white px-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl text-gray-200">
                {slide.description}
              </p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}