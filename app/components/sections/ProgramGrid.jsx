// "use client";

// import React, { useState } from 'react';
// import Card from '../ui/Card';
// import { 
//   ChevronRight, 
//   Clock, 
//   GraduationCap, 
//   BookOpen, 
//   TrendingDown,
//   Star,
//   Video
// } from 'lucide-react';
// import Link from 'next/link';
// import Image from 'next/image';

// const ProgramGrid = ({ programs = [] }) => {
//   const [hoveredId, setHoveredId] = useState(null);
//   // console.log(programs)

//   if (!programs || programs.length === 0) {
//     return (
//       <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
//         <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
//           <BookOpen className="w-10 h-10 text-gray-400" />
//         </div>
//         <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Available</h3>
//         <p className="text-gray-500">Check back later for new programs.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
//       {programs.map((program) => {
//         const isHovered = hoveredId === program.id;
//         const hasDiscount = program.discount > 0;
//         const savedAmount = hasDiscount ? program.original_price - program.final_price : 0;

//         return (
//           <Link 
//             href={`/programs/${program.id}`} 
//             key={program.id}
//             className="block transition-all duration-300 hover:-translate-y-1 h-full"
//             onMouseEnter={() => setHoveredId(program.id)}
//             onMouseLeave={() => setHoveredId(null)}
//           >
//             <Card className={`
//               hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full cursor-pointer
//               ${isHovered ? 'shadow-xl border-red-200' : 'shadow-md'}
//             `}>
//               {/* Thumbnail Image Section - Fixed height */}
//               <div className="relative w-full h-44 md:h-48 bg-linear-to-r from-red-50 to-gray-100 overflow-hidden shrink-0">
//                 {program.thumbnail_url ? (
//                   <Image 
//                     src={program.thumbnail_url} 
//                     alt={program.title}
//                     fill
//                     className="w-full h-full object-cover transition-transform duration-500"
//                     style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
//                     sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
//                    priority={false}
//                    quality={85}
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-50 to-red-100">
//                     <BookOpen className="w-16 h-16 text-red-300" />
//                   </div>
//                 )}
                

//                 {/* Discount Badge */}
//                 {hasDiscount && (
//                   <div className="absolute top-3 left-3">
//                        <span className="px-3 py-1 bg-[#CC0000] text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
//                           <TrendingDown className="w-3 h-3" />
//                       {program.discount} Rs. OFF
//                     </span>
//                   </div>
//                 )}
//                  <div className="absolute top-3 right-3">
//                     <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#CC0000] text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
//                       <Video className="w-3 h-3" />
//                       {program.mode || 'Online'}
//                     </span>
//                   </div>

//                 {/* Category Badge - Bottom Left */}
//                 <div className="absolute bottom-3 left-3">
//                   <span className="px-3 py-1 bg-[#CC0000] text-white text-xs font-semibold rounded-full shadow-md">
//                     {program.category || 'General'}
//                   </span>
//                 </div>
//               </div>
              
//               <Card.Body className="flex flex-col flex-1">
//                 {/* Title Section - Fixed height */}
//                 <div className="mb-2 min-h-12.5">
//                   <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
//                     {program.title}
//                   </h3>
//                   {program.course_code && (
//                     <p className="text-xs text-gray-400 mt-0.5">#{program.course_code}</p>
//                   )}
//                 </div>
                
//                 {/* Course Details - Compact */}
//                 <div className="space-y-1.5 text-sm flex-1">
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-500 flex items-center gap-1.5 text-xs">
//                       <Clock className="w-3.5 h-3.5" />
//                       Duration
//                     </span>
//                     <span className="font-semibold text-gray-900 text-sm">{program.duration}</span>
//                   </div>
                  
//                   <div className="flex justify-between items-center">
//                     <span className="text-gray-500 flex items-center gap-1.5 text-xs">
//                       <GraduationCap className="w-3.5 h-3.5" />
//                       Mode
//                     </span>
//                     <span className="font-semibold text-gray-900 text-sm capitalize">{program.mode}</span>
//                   </div>

//                   {/* Only show level if available */}
//                   {program.level && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-gray-500 flex items-center gap-1.5 text-xs">
//                         <BookOpen className="w-3.5 h-3.5" />
//                         Level
//                       </span>
//                       <span className="font-semibold text-gray-900 text-sm capitalize">{program.level}</span>
//                     </div>
//                   )}
//                 </div>
                
//                 {/* Fee and Apply Button - Fixed bottom section */}
//                 <div className="mt-3 pt-3 border-t border-gray-200 shrink-0">
//                   <div className="flex items-end justify-between mb-2">
//                     <div>
//                       <span className="text-gray-500 text-xs uppercase tracking-wider">Fee</span>
//                       <div className="flex items-baseline gap-2">
//                         <p className="text-lg font-bold text-gray-900">
//                           {program.fee}
//                         </p>
//                         {hasDiscount && program.original_price && (
//                           <span className="text-xs text-gray-400 line-through">
//                             ₹{program.original_price}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     {hasDiscount && savedAmount > 0 && (
//                       <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
//                         Save ₹{savedAmount}
//                       </span>
//                     )}
//                   </div>
                  
//                   <div className={`
//                     w-full px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-between text-sm
//                         bg-[#CC0000] hover:shadow-lg hover:bg-[#B30000]
//                      text-white shadow-md
//                   `}>
//                     <span className="font-medium">View Details</span>
//                     <span className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
//                       <ChevronRight className={`w-4 h-4 ${isHovered ? 'text-white' : 'text-red-600'}`} />
//                     </span>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Link>
//         );
//       })}
//     </div>
//   );
// }

// export default ProgramGrid;


"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronRight, 
  Clock, 
  BookOpen, 
  TrendingDown,
  Star,
  Video,
  Users,
  Calendar,
  Award,
  CheckCircle,
  ExternalLink,
  Briefcase,
  FileCheck,
  Layers,
  Zap,
  ChevronDown,
  Sparkles,
  Target,
  Shield,
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
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
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
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 mb-6">
          <BookOpen className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-2xl font-light text-gray-700 mb-2">No Programs Available</h3>
        <p className="text-gray-400">Check back later for new programs.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:shadow-xl p-2 border border-gray-200 transition-all duration-300 -ml-4 hover:scale-105"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-[#CC0000]" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:shadow-xl p-2 border border-gray-200 transition-all duration-300 -mr-4 hover:scale-105"
          aria-label="Scroll right"
        >
          <ChevronRightIcon className="w-5 h-5 text-[#CC0000]" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-4 px-1"
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

        {programs.map((program) => {
          const isHovered = hoveredId === program.id;
          const hasDiscount = program.discount > 0;

          return (
            <div 
              key={program.id}
              className="group min-w-[280px] max-w-[280px] shrink-0"
              onMouseEnter={() => setHoveredId(program.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`
                bg-white overflow-hidden transition-all duration-300 h-full flex flex-col
                ${isHovered ? 'shadow-xl shadow-gray-200/50' : 'shadow-sm shadow-gray-100'}
                border ${isHovered ? 'border-[#CC0000]/30' : 'border-gray-200'}
              `}>
                {/* Header - "Certificate Program" Tag */}
                <div className="bg-[#CC0000] px-4 py-2">
                  <span className="text-xs font-medium text-white tracking-wider uppercase text-center flex justify-center items-center gap-2">
                    <Award className="w-3.5 h-3.5" />
                    Certificate Program
                  </span>
                </div>

                {/* Content Section - Centered */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-base font-semibold text-gray-800 leading-snug mb-3 group-hover:text-[#CC0000] transition-colors text-center">
                    {program.title}
                  </h3>

                  {/* Duration - Center aligned */}
                  <div className="text-sm text-gray-600 mb-1 text-center">
                    <span className="font-medium">Duration</span> {program.duration}.
                  </div>

                  {/* Mode - Center aligned */}
                  <div className="text-sm text-gray-600 mb-4 text-center">
                    <span className="font-medium">Mode:</span> <span className="capitalize">{program.mode}</span>
                  </div>

                  {/* Assessment Section - Center aligned */}
                  <div className="mb-4 text-center">
                    <p className="text-sm font-semibold text-gray-700 mb-1.5">Assessment</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-[#CC0000]" />
                        Work Experience
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-[#CC0000]" />
                        Work Portfolio
                      </span>
                    </div>
                  </div>

                  {/* Fee & Apply Button - Center aligned */}
                  <div className="pt-3 border-t border-gray-200 mt-auto">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Course Fee</p>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-xl font-bold text-gray-800">
                          {program.fee}
                        </span>
                        {hasDiscount && program.original_price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{program.original_price}
                          </span>
                        )}
                      </div>
                      
                      <Link href={`/programs/${program.id}`}>
                        <div className={`
                          px-8 py-1.5 text-sm font-medium transition-all duration-300 inline-block
                          ${isHovered 
                            ? 'border border-[#CC0000] bg-[#CC0000] text-white' 
                            : 'border border-gray-300 bg-transparent text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
                          }
                        `}>
                          Apply
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgramGrid;