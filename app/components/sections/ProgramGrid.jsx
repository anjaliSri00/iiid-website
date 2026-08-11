// // "use client";

// // import React, { useState, useRef, useEffect } from 'react';
// // import { 
// //   ChevronRight, 
// //   Clock, 
// //   BookOpen, 
// //   TrendingDown,
// //   Star,
// //   Video,
// //   Users,
// //   Calendar,
// //   Award,
// //   CheckCircle,
// //   ExternalLink,
// //   Briefcase,
// //   FileCheck,
// //   Layers,
// //   Zap,
// //   ChevronDown,
// //   Sparkles,
// //   Target,
// //   Shield,
// //   ChevronLeft,
// //   ChevronRight as ChevronRightIcon
// // } from 'lucide-react';
// // import Link from 'next/link';

// // const ProgramGrid = ({ programs = [] }) => {
// //   const [hoveredId, setHoveredId] = useState(null);
// //   const [showLeftArrow, setShowLeftArrow] = useState(false);
// //   const [showRightArrow, setShowRightArrow] = useState(true);
// //   const scrollContainerRef = useRef(null);

// //   // Check scroll position for arrows
// //   const checkScrollPosition = () => {
// //     if (scrollContainerRef.current) {
// //       const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
// //       setShowLeftArrow(scrollLeft > 0);
// //       setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
// //     }
// //   };

// //   // Scroll function
// //   const scroll = (direction) => {
// //     if (scrollContainerRef.current) {
// //       const scrollAmount = 320;
// //       const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
// //       scrollContainerRef.current.scrollTo({
// //         left: newScrollLeft,
// //         behavior: 'smooth'
// //       });
// //     }
// //   };

// //   // Check scroll position on mount and resize
// //   useEffect(() => {
// //     checkScrollPosition();
// //     window.addEventListener('resize', checkScrollPosition);
// //     return () => window.removeEventListener('resize', checkScrollPosition);
// //   }, [programs]);

// //   if (!programs || programs.length === 0) {
// //     return (
// //       <div className="text-center py-20">
// //         <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 mb-6">
// //           <BookOpen className="w-12 h-12 text-gray-400" />
// //         </div>
// //         <h3 className="text-2xl font-light text-gray-700 mb-2">No Programs Available</h3>
// //         <p className="text-gray-400">Check back later for new programs.</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="relative">
// //       {/* Left Arrow */}
// //       {showLeftArrow && (
// //         <button
// //           onClick={() => scroll('left')}
// //           className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:shadow-xl p-2 border border-gray-200 transition-all duration-300 -ml-4 hover:scale-105"
// //           aria-label="Scroll left"
// //         >
// //           <ChevronLeft className="w-5 h-5 text-[#CC0000]" />
// //         </button>
// //       )}

// //       {/* Right Arrow */}
// //       {showRightArrow && (
// //         <button
// //           onClick={() => scroll('right')}
// //           className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:shadow-xl p-2 border border-gray-200 transition-all duration-300 -mr-4 hover:scale-105"
// //           aria-label="Scroll right"
// //         >
// //           <ChevronRightIcon className="w-5 h-5 text-[#CC0000]" />
// //         </button>
// //       )}

// //       <div
// //         ref={scrollContainerRef}
// //         onScroll={checkScrollPosition}
// //         className="flex gap-6 overflow-x-auto scroll-smooth hide-scrollbar pb-4 px-1"
// //         style={{
// //           scrollbarWidth: 'none',
// //           msOverflowStyle: 'none',
// //         }}
// //       >
// //         <style jsx>{`
// //           .hide-scrollbar::-webkit-scrollbar {
// //             display: none;
// //           }
// //         `}</style>

// //         {programs.map((program) => {
// //           const isHovered = hoveredId === program.id;
// //           const hasDiscount = program.discount > 0;

// //           return (
// //             <div 
// //               key={program.id}
// //               className="group min-w-[280px] max-w-[280px] shrink-0"
// //               onMouseEnter={() => setHoveredId(program.id)}
// //               onMouseLeave={() => setHoveredId(null)}
// //             >
// //               <div className={`
// //                 bg-white overflow-hidden transition-all duration-300 h-full flex flex-col
// //                 ${isHovered ? 'shadow-xl shadow-gray-200/50' : 'shadow-sm shadow-gray-100'}
// //                 border ${isHovered ? 'border-[#CC0000]/30' : 'border-gray-200'}
// //               `}>
// //                 {/* Header - "Certificate Program" Tag */}
// //                 <div className="bg-[#CC0000] px-4 py-2">
// //                   <span className="text-xs font-medium text-white tracking-wider uppercase text-center flex justify-center items-center gap-2">
// //                     <Award className="w-3.5 h-3.5" />
// //                     Certificate Program
// //                   </span>
// //                 </div>

// //                 {/* Content Section - Centered */}
// //                 <div className="p-5 flex-1 flex flex-col">
// //                   {/* Title */}
// //                   <h3 className="text-base font-semibold text-gray-800 leading-snug mb-3 group-hover:text-[#CC0000] transition-colors text-center">
// //                     {program.title}
// //                   </h3>

// //                   {/* Duration - Center aligned */}
// //                   <div className="text-sm text-gray-600 mb-1 text-center">
// //                     <span className="font-medium">Duration</span> {program.duration}.
// //                   </div>

// //                   {/* Mode - Center aligned */}
// //                   <div className="text-sm text-gray-600 mb-4 text-center">
// //                     <span className="font-medium">Mode:</span> <span className="capitalize">{program.mode}</span>
// //                   </div>

// //                   {/* Assessment Section - Center aligned */}
// //                   <div className="mb-4 text-center">
// //                     <p className="text-sm font-semibold text-gray-700 mb-1.5">Assessment</p>
// //                     <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
// //                       <span className="flex items-center gap-1.5">
// //                         <Briefcase className="w-3.5 h-3.5 text-[#CC0000]" />
// //                         Work Experience
// //                       </span>
// //                       <span className="flex items-center gap-1.5">
// //                         <Layers className="w-3.5 h-3.5 text-[#CC0000]" />
// //                         Work Portfolio
// //                       </span>
// //                     </div>
// //                   </div>

// //                   {/* Fee & Apply Button - Center aligned */}
// //                   <div className="pt-3 border-t border-gray-200 mt-auto">
// //                     <div className="text-center">
// //                       <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Course Fee</p>
// //                       <div className="flex items-center justify-center gap-2 mb-3">
// //                         <span className="text-xl font-bold text-gray-800">
// //                           {program.fee}
// //                         </span>
// //                         {hasDiscount && program.original_price && (
// //                           <span className="text-xs text-gray-400 line-through">
// //                             ₹{program.original_price}
// //                           </span>
// //                         )}
// //                       </div>
                      
// //                       <Link href={`/programs/${program.id}`}>
// //                         <div className={`
// //                           px-8 py-1.5 text-sm font-medium transition-all duration-300 inline-block
// //                           ${isHovered 
// //                             ? 'border border-[#CC0000] bg-[#CC0000] text-white' 
// //                             : 'border border-gray-300 bg-transparent text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
// //                           }
// //                         `}>
// //                           Apply
// //                         </div>
// //                       </Link>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           );
// //         })}
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProgramGrid;


// "use client";

// import React, { useState, useRef, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { 
//   ChevronRight, 
//   Clock, 
//   BookOpen, 
//   TrendingDown,
//   Star,
//   Video,
//   Users,
//   Calendar,
//   Award,
//   CheckCircle,
//   ExternalLink,
//   Briefcase,
//   FileCheck,
//   Layers,
//   Zap,
//   ChevronDown,
//   Sparkles,
//   Target,
//   Shield,
//   ChevronLeft,
//   ChevronRight as ChevronRightIcon
// } from 'lucide-react';
// import Link from 'next/link';

// const ProgramGrid = ({ programs = [] }) => {
//   const [hoveredId, setHoveredId] = useState(null);
//   const [showLeftArrow, setShowLeftArrow] = useState(false);
//   const [showRightArrow, setShowRightArrow] = useState(true);
//   const scrollContainerRef = useRef(null);

//   // Check scroll position for arrows
//   const checkScrollPosition = () => {
//     if (scrollContainerRef.current) {
//       const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
//       setShowLeftArrow(scrollLeft > 0);
//       setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
//     }
//   };

//   // Scroll function
//   const scroll = (direction) => {
//     if (scrollContainerRef.current) {
//       const scrollAmount = 320;
//       const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
//       scrollContainerRef.current.scrollTo({
//         left: newScrollLeft,
//         behavior: 'smooth'
//       });
//     }
//   };

//   // Check scroll position on mount and resize
//   useEffect(() => {
//     checkScrollPosition();
//     window.addEventListener('resize', checkScrollPosition);
//     return () => window.removeEventListener('resize', checkScrollPosition);
//   }, [programs]);

//   if (!programs || programs.length === 0) {
//     return (
//       <motion.div 
//         initial={{ opacity: 0 }}
//         whileInView={{ opacity: 1 }}
//         transition={{ duration: 0.5 }}
//         viewport={{ once: true }}
//         className="text-center py-20"
//       >
//         <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 mb-6">
//           <BookOpen className="w-12 h-12 text-gray-400" />
//         </div>
//         <h3 className="text-2xl font-light text-gray-700 mb-2">No Programs Available</h3>
//         <p className="text-gray-400">Check back later for new programs.</p>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="relative">
//       {/* Left Arrow */}
//       {showLeftArrow && (
//         <motion.button
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.3 }}
//           onClick={() => scroll('left')}
//           className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:shadow-xl p-2 border border-gray-200 transition-all duration-300 -ml-4 hover:scale-105"
//           aria-label="Scroll left"
//         >
//           <ChevronLeft className="w-5 h-5 text-[#CC0000]" />
//         </motion.button>
//       )}

//       {/* Right Arrow */}
//       {showRightArrow && (
//         <motion.button
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.3 }}
//           onClick={() => scroll('right')}
//           className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg hover:shadow-xl p-2 border border-gray-200 transition-all duration-300 -mr-4 hover:scale-105"
//           aria-label="Scroll right"
//         >
//           <ChevronRightIcon className="w-5 h-5 text-[#CC0000]" />
//         </motion.button>
//       )}

//       <div
//         ref={scrollContainerRef}
//         onScroll={checkScrollPosition}
//         className="flex gap-6 overflow-x-auto justify-center scroll-smooth hide-scrollbar pb-4 px-1"
//         style={{
//           scrollbarWidth: 'none',
//           msOverflowStyle: 'none',
//         }}
//       >
//         <style jsx>{`
//           .hide-scrollbar::-webkit-scrollbar {
//             display: none;
//           }
//         `}</style>

//         {programs.map((program, index) => {
//           const isHovered = hoveredId === program.id;
//           const hasDiscount = program.discount > 0;

//           return (
//             <motion.div 
//               key={program.id}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               viewport={{ once: true }}
//               className="group min-w-[280px] max-w-[280px] shrink-0"
//               onMouseEnter={() => setHoveredId(program.id)}
//               onMouseLeave={() => setHoveredId(null)}
//             >
//               <div className={`
//                 bg-white overflow-hidden transition-all duration-300 h-full flex flex-col
//                 ${isHovered ? 'shadow-xl shadow-gray-200/50' : 'shadow-sm shadow-gray-100'}
//                 border ${isHovered ? 'border-[#CC0000]/30' : 'border-gray-200'}
//               `}>
//                 {/* Header - "Certificate Program" Tag */}
//                 <div className="bg-[#CC0000] px-4 py-2">
//                   <span className="text-xs font-medium text-white tracking-wider uppercase text-center flex justify-center items-center gap-2">
//                     <Award className="w-3.5 h-3.5" />
//                     Certificate Program
//                   </span>
//                 </div>

//                 {/* Content Section - Centered */}
//                 <div className="p-5 flex-1 flex flex-col">
//                   {/* Title */}
//                   <h3 className="text-base font-semibold text-gray-800 leading-snug mb-3 group-hover:text-[#CC0000] transition-colors text-center">
//                     {program.title}
//                   </h3>

//                   {/* Duration - Center aligned */}
//                   <div className="text-sm text-gray-600 mb-1 text-center">
//                     <span className="font-medium">Duration</span> {program.duration}.
//                   </div>

//                   {/* Mode - Center aligned */}
//                   <div className="text-sm text-gray-600 mb-4 text-center">
//                     <span className="font-medium">Mode:</span> <span className="capitalize">{program.mode}</span>
//                   </div>

//                   {/* Assessment Section - Center aligned */}
//                   <div className="mb-4 text-center">
//                     <p className="text-sm font-semibold text-gray-700 mb-1.5">Assessment</p>
//                     <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
//                       <span className="flex items-center gap-1.5">
//                         <Briefcase className="w-3.5 h-3.5 text-[#CC0000]" />
//                         Work Experience
//                       </span>
//                       <span className="flex items-center gap-1.5">
//                         <Layers className="w-3.5 h-3.5 text-[#CC0000]" />
//                         Work Portfolio
//                       </span>
//                     </div>
//                   </div>

//                   {/* Fee & Apply Button - Center aligned */}
//                   <div className="pt-3 border-t border-gray-200 mt-auto">
//                     <div className="text-center">
//                       <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Course Fee</p>
//                       <div className="flex items-center justify-center gap-2 mb-3">
//                         <span className="text-xl font-bold text-gray-800">
//                           {program.fee}
//                         </span>
//                         {hasDiscount && program.original_price && (
//                           <span className="text-xs text-gray-400 line-through">
//                             ₹{program.original_price}
//                           </span>
//                         )}
//                       </div>
                      
//                       <Link href={`/programs/${program.id}`}>
//                         <motion.div 
//                           whileHover={{ scale: 1.05 }}
//                           whileTap={{ scale: 0.95 }}
//                           className={`
//                             px-8 py-1.5 text-sm font-medium transition-all duration-300 inline-block
//                             ${isHovered 
//                               ? 'border border-[#CC0000] bg-[#CC0000] text-white' 
//                               : 'border border-gray-300 bg-transparent text-gray-700 hover:border-[#CC0000] hover:text-[#CC0000]'
//                             }
//                           `}
//                         >
//                           Apply
//                         </motion.div>
//                       </Link>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default ProgramGrid;


"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

const ProgramGrid = ({ programs = [] }) => {
  const [hoveredId, setHoveredId] = useState(null);

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
    <div className="w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-full">
        {programs.map((program, index) => {
          const isHovered = hoveredId === program.id;

          return (
            <motion.div 
              key={program.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="w-full h-full"
              onMouseEnter={() => setHoveredId(program.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className={`
              pt-6 pb-15
                bg-white overflow-hidden transition-all duration-300 h-full flex flex-col
                ${isHovered ? 'shadow-xl shadow-gray-200/50' : 'shadow-sm shadow-gray-100'}
                border border-gray-200
              `}>
                {/* Header - "Certificate Program" Tag - Full Width */}
                <div className="bg-[#CC0000] w-[300px] mx-auto px-2 py-3 shrink-0">
                  <span className="text-base font-medium text-white tracking-widest text-center flex justify-center items-center gap-2">
                    {/* <Award className="w-4 h-4" /> */}
                    Certificate Program
                  </span>
                </div>

                {/* Content Section - Centered */}
                <div className="px-6 py-5 flex-1 flex flex-col justify-between">
                  {/* Top Content */}
                  <div>
                    {/* Title */}
                    <h3 className="text-2xl font-semibold text-red-600 leading-snug mb-4 text-center">
                      {program.title}
                    </h3>

                    {/* Duration - Center aligned */}
                    <div className="text-base text-gray-600 mb-1 text-center">
                      <span className="font-medium">Duration</span> {program.duration}.
                    </div>

                    {/* Mode - Center aligned */}
                    <div className="text-base text-gray-600 mb-5 text-center">
                      <span className="font-medium">Mode:</span> <span className="capitalize">{program.mode}</span>
                    </div>

                    {/* Assessment Section - Center aligned */}
                    <div className="mb-5 text-center">
                      <p className="text-base font-bold text-gray-700 mb-2">Assessment</p>
                      <div className="flex flex-col items-center gap-1 text-base text-gray-600">
                        <span>Work Experience</span>
                        <span>Work Portfolio</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Content - Fee & Apply Button */}
                  <div className="pt-5 ">
                    <div className="text-center mx-auto flex flex-col justify-center items-center ">
                      <p className="text-xs text-gray-400  tracking-wider underline capitalize font-medium mb-1.5">Course Fee</p>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-2xl font-light text-gray-800">
                          Rs. {program.final_price || program.original_price || '79.00'}
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