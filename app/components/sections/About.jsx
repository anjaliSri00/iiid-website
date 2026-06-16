"use client";

import { certificate } from '@/public/img';
import Image from 'next/image';
import { useState } from 'react';

export default function About() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="about" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:gap-12 justify-center items-center">
          {/* Text Content */}
          <div className="flex flex-col justify-center items-center text-center">
            <h2 className="text-3xl md:text-4xl montserrat-600 lg:text-5xl text-gray-900 mb-6">
              About IIID
            </h2>
            <p className="text-black montserrat-400 text-base md:text-lg lg:text-xl max-w-4xl mx-auto mb-6 md:mb-8 leading-8 text-justify">
              IIID provides professional development training programs designed for experienced professionals, focusing on advanced skills, evolving industry practices, and practical application to support continuous learning and professional excellence.
            </p>
            
            <h3 className="text-lg md:text-2xl montserrat-600 text-gray-900 mb-4 md:mb-6 text-center max-sm:text-left">
              Professional Certifications - Knowledge Based Certifications
            </h3>
            
            <p className="text-black montserrat-400 text-base md:text-lg lg:text-xl mx-auto mb-6 leading-relaxed text-justify">
              <span className="montserrat-600 text-black">Knowledge-based certifications</span> are market-driven education and certification programs designed to ensure that individuals possess the required knowledge and understanding of International Institute of Interior Designers (IIID) standards. These certifications typically involve focused learning and validate conceptual and foundational knowledge of specific frameworks and practices.
            </p>
            
            <p className="text-black montserrat-400 text-base md:text-lg lg:text-xl mx-auto mb-6 leading-relaxed text-justify">
              <span className="montserrat-600 text-black">IIID Certification Credentials,</span> in contrast, are experience-based certifications that recognize an individual's professional practice and industry expertise. Certification is awarded primarily through a structured assessment of professional experience, with minimal formal learning requirements and no traditional classroom lectures or examinations.
            </p>
          </div>
          
          {/* Certificate Image - Full View */}
          <div className="w-full max-w-5xl mx-auto mt-8 md:mt-12">
            <div 
              className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl  flex items-center justify-center transition-all duration-500 hover:shadow-3xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="text-center w-full">
                <div className="relative w-full">
                  <div className={`transition-all duration-500 ${isHovered ? 'scale-[1.02]' : 'scale-100'}`}>
                    <Image
                      src={certificate}
                      alt="IIID Professional Certification"
                      width={800}
                      height={600}
                      className="w-full h-auto rounded-xl shadow-xl"
                      priority
                    />
                  </div>
                  
                  {/* Badge Overlay - Top Right */}
                  <div className="absolute -top-4 -right-4 bg-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    ✦ Accredited
                  </div>
                  
                  {/* Badge Overlay - Bottom Left */}
                  <div className="absolute -bottom-4 -left-4 bg-green-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    ✓ Verified
                  </div> 
                  
                </div>
                
                {/* Certificate Info Below */}
                <div className="mt-6 pt-6 border-t-2 border-red-200">
                  <div className="flex flex-wrap items-center justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Internationally Recognized</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Industry Validated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Globally Accepted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}