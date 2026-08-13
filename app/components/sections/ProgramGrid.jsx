"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import Link from 'next/link';

const ProgramGrid = ({ programs = [] }) => {
  const [hoveredId, setHoveredId] = useState(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef(null);

  // Check scroll position for arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
    }
  };

  // Scroll function
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Check scroll position on mount and resize
  useEffect(() => {
    checkScrollPosition();
    window.addEventListener('resize', checkScrollPosition);
    return () => window.removeEventListener('resize', checkScrollPosition);
  }, [programs]);

  if (!programs || programs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="text-center py-20"
      >
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 mb-6">
          <Award className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-light text-gray-700 mb-2">No Programs Available</h3>
        <p className="text-gray-400">Check back later for new programs.</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3 }}
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 
            bg-white/90 backdrop-blur-sm hover:bg-white 
            shadow-lg hover:shadow-xl p-2 md:p-3 
            border border-gray-200 
            transition-all duration-300 
            -ml-2 md:-ml-4 hover:scale-105 
            flex items-center justify-center
            w-8 h-8 md:w-10 md:h-10
            rounded-full"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-[#CC0000]" />
        </motion.button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 
            bg-white/90 backdrop-blur-sm hover:bg-white 
            shadow-lg hover:shadow-xl p-2 md:p-3 
            border border-gray-200 
            transition-all duration-300 
            -mr-2 md:-mr-4 hover:scale-105 
            flex items-center justify-center
            w-8 h-8 md:w-10 md:h-10
            rounded-full"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-[#CC0000]" />
        </motion.button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex gap-0 max-sm:gap-2 overflow-x-auto scroll-smooth hide-scrollbar pb-4 px-2 max-sm:flex-wrap lg:flex-nowrap max-sm:justify-start lg:justify-center"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {programs.map((program, index) => {
          const isHovered = hoveredId === program.id;
          const isLastCard = index === programs.length - 1;
          
          // Calculate border classes based on index
          const getBorderClasses = () => {
            let classes = '';
            
            // For 4-column layout (xl screens)
            if ((index + 1) % 5 === 0) {
              
              classes += ' xl:border-r-0';
            }
            
            // For 3-column layout (lg screens)
            if ((index + 1) % 4 === 0) {
              console.log(index)
              classes += ' lg:border-r-0';
            }
            
            // For 2-column layout (sm screens)
            if ((index + 1) % 4 === 0) {
              classes += ' sm:border-r-0';
            }
            
            // Last card should never have right border
            if (isLastCard) {
              classes += ' border-r-0';
            }
            
            return classes;
          };

          return (
            <motion.div 
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group w-full lg:w-[420px] max-w-[420px] md:w-[350px] shrink-0"
              onMouseEnter={() => setHoveredId(program.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`
                pt-10 pb-20
                bg-white overflow-hidden transition-all duration-300 h-full flex flex-col
                ${isHovered ? 'shadow-xl shadow-gray-200/50' : 'shadow-sm shadow-gray-100'}
                border-r border-black max-sm:border-0
                ${getBorderClasses()}
              `}>
                {/* Header - "Certificate Program" Tag */}
                <div className="bg-[#CC0000] w-70 mx-auto px-2 py-2 shrink-0">
                  <span className="text-base font-medium text-white tracking-widest text-center flex justify-center items-center gap-2">
                    Certificate Program
                  </span>
                </div>

                {/* Content Section - Centered */}
                <div className="px-6 py-5 flex-1 flex flex-col justify-between">
                  {/* Top Content */}
                  <div>
                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-black leading-snug mb-4 text-center">
                      {program.title}
                    </h3>

                    {/* Duration */}
                    <div className="text-base text-gray-600 mb-1 text-center">
                      <span className="font-medium">Duration</span> {program.duration}.
                    </div>

                    {/* Mode */}
                    <div className="text-base text-gray-600 mb-5 text-center">
                      <span className="font-medium">Mode:</span> <span className="capitalize">{program.mode}</span>
                    </div>

                    {/* Assessment Section */}
                    <div className="mb-5 text-center">
                      <p className="text-base font-bold text-gray-700 mb-2">Assessment</p>
                      <div className="flex flex-col items-center gap-1 text-base text-gray-600">
                        <span>Work Experience</span>
                        <span>Work Portfolio</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content - Fee & Apply Button */}
                  <div className="pt-5">
                    <div className="text-center mx-auto flex flex-col justify-center items-center">
                      <p className="text-xs text-gray-400 tracking-wider underline capitalize font-medium mb-1.5">Course Fee</p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-xl font-light text-gray-800">
                          Rs. {parseInt(program.final_price || program.original_price) || '79.00'}
                        </span>
                      </div>
                      
                      <Link href={`/programs/${program.id}`}>
                        <div className={`
                          px-4 py-2 text-base w-fit font-medium gap-2 transition-all duration-300 flex justify-center items-center
                          ${isHovered 
                            ? 'border border-[#CC0000] bg-[#CC0000] text-white' 
                            : 'border border-[#CC0000] bg-transparent text-[#CC0000] hover:border-[#CC0000] hover:text-[#CC0000]'
                          }
                        `}>
                          Apply <ChevronRight size={20}/>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgramGrid;