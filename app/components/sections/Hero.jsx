// 'use client';

// import { useState, useEffect } from 'react';
// import SwiperCard from "../ui/SwiperCard";
// import { motion } from 'framer-motion';
// import { ArrowRight, Sparkles, Award } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// export default function Hero() {
//   const router = useRouter();
//   const [activeSlide, setActiveSlide] = useState({
//     // // mainTitle: "Certification that recognizes your professional experience",
//     // mainTitle:"Stand equal.",
//     // mainTitle2:"Stand Competative.",
//     // mainDescription: "Advance your career with internationally recognized interior design certifications",
//     // ctaText: "Read More"
//   });

//   const [isHovered, setIsHovered] = useState(false);

//   const handleSlideChange = (slideData) => {
//     setActiveSlide({
//       title: slideData.title,
//       title2: slideData.title2,
//       mainDescription: slideData.mainDescription,
//       ctaText: slideData.ctaText
//     });
//   };

//   return (
//     <section id="home" className="relative w-full text-white min-h-150 overflow-hidden">
//       {/* Background Overlay */}
//       <div className="absolute inset-0 bg-white/10 z-10"></div>
      
//       {/* Swiper Carousel */}
//       <div className="relative z-0 w-full h-150">
//         <SwiperCard onSlideChange={handleSlideChange} />
//       </div>

//       {/* Decorative animated gradient circle */}
//       <motion.div
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 0.1 }}
//         transition={{ duration: 1.5, ease: "easeOut" }}
//         className="absolute bottom-0 right-0 w-96 h-96 bg-[#CC0000] rounded-full blur-3xl z-10"
//       />
//       <motion.div
//         initial={{ scale: 0, opacity: 0 }}
//         animate={{ scale: 1, opacity: 0.1 }}
//         transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
//         className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl z-10"
//       />

//       {/* Dynamic Content Overlay */}
//       <div className="absolute right-0 -translate-y-3/6 -translate-x-3/6 top-[50%] z-20 flex items-center px-4 sm:px-6 lg:px-8">
//         <motion.div 
//           key={activeSlide.mainTitle}
//           initial={{ opacity: 0, x: -50 }}
//           animate={{ opacity: 1, x: 0 }}
//           exit={{ opacity: 0, x: 50 }}
//           transition={{ duration: 0.6, ease: "easeOut" }}
//           className="w-3xl bg-white/70 backdrop-blur-md pt-6 pl-4 md:pt-8 shadow-2xl relative overflow-hidden"
//           onMouseEnter={() => setIsHovered(true)}
//           onMouseLeave={() => setIsHovered(false)}
//         >

//           <motion.h1 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="text-5xl max-sm:text-xl font-bold leading-tight text-gray-900"
//           >
//             {activeSlide.title}
//           </motion.h1>
          
//           <motion.h1 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//             className="max-sm:text-xl text-5xl font-bold mb-2 leading-tight text-gray-900"
//           >
//             {activeSlide.title2}
//           </motion.h1>
//           <div className='w-full flex justify-end items-end'>
// <motion.button 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.5 }}
//             whileHover={{ scale: 1.05, backgroundColor: "#CC0000", borderColor: "#CC0000", color: "#ffffff" }}
//             whileTap={{ scale: 0.95 }}
//             onClick ={()=> router.push("/programs")}
//             className="bg-[#CC0000] text-white px-4 py-3 transition-all duration-300 font-medium inline-flex items-center gap-2 group"
//           >
//             {activeSlide.ctaText}
//             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//           </motion.button>
//           </div>
          
//         </motion.div>
//       </div>
//     </section>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import SwiperCard from "../ui/SwiperCard";
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Hero() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState({
    title: "Stand equal.",
    title2: "Stay competitive.",
    mainDescription: "Advance your career with internationally recognized interior design certifications",
    ctaText: "Read More",
    position: "left" // left, center, right
  });

  const [isHovered, setIsHovered] = useState(false);

  const handleSlideChange = (slideData) => {
    setActiveSlide({
      title: slideData.title,
      title2: slideData.title2,
      mainDescription: slideData.mainDescription,
      ctaText: slideData.ctaText,
      position: slideData.position || "left"
    });
  };

  // Get position classes based on slide
  const getPositionClasses = () => {
    switch(activeSlide.position) {
      case "center":
        return "left-1/2 -translate-x-1/2";
      case "right":
        return "right-40";
      default: // left
        return "left-50";
    }
  };

  // Get animation direction based on position
  const getAnimationDirection = () => {
    switch(activeSlide.position) {
      case "center":
        return 0;
      case "right":
        return 50;
      default: // left
        return -50;
    }
  };

  const getPaddingClasses = () => {
    switch(activeSlide.position) {
      case "left":
        return "pl-2 pr-0";
      case "center":
        return "pl-8 pr-0";
      case "right":
        return "pl-12 "; // More padding on left when box is on right side
      default:
        return "pl-8 pr-4";
    }
  };

    const getWidthClasses = () => {
    switch(activeSlide.position) {
      case "left":
        return "w-[730px] max-w-[90vw]";
      case "center":
        return "w-[700px] max-w-3xl";
      case "right":
        return "w-[600px] max-w-[85vw]"; // Slightly smaller when on right
      default:
        return "w-[500px] max-w-[90vw]";
    }
  };


  return (
    <section id="home" className="relative w-full text-white min-h-150 overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/10 z-10"></div>
      
      {/* Swiper Carousel */}
      <div className="relative z-0 w-full h-150">
        <SwiperCard onSlideChange={handleSlideChange} />
      </div>

      {/* Decorative animated gradient circle */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute bottom-0 right-0 w-96 h-96 bg-[#CC0000] rounded-full blur-3xl z-10"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.1 }}
        transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
        className="absolute top-0 left-0 w-64 h-64 bg-orange-500 rounded-full blur-3xl z-10"
      />

      {/* Dynamic Content Overlay */}
      <div className={`absolute top-[50%] -translate-y-1/2 z-20 flex items-center px-4 sm:px-6 lg:px-8 ${getPositionClasses()}`}>
        <motion.div 
          key={activeSlide.title}
          initial={{ opacity: 0, x: getAnimationDirection() }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: getAnimationDirection() }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        className={`${getWidthClasses()} bg-white/70 backdrop-blur-md ${getPaddingClasses()} flex flex-col pt-10 justify-center items-start shadow-2xl relative overflow-hidden`}   onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-5xl max-sm:text-xl font-bold text-left tracking-tight text-gray-900"
          >
            {activeSlide.title}
          </motion.h1>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-sm:text-xl text-5xl font-bold mb-4 tracking-tight pr-10 text-gray-900"
          >
            {activeSlide.title2}
          </motion.h1>
          
          <div className='w-full flex justify-end items-end'>
            <motion.button 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ scale: 1.05, backgroundColor: "#CC0000", borderColor: "#CC0000", color: "#ffffff" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/programs")}
              className="bg-[#CC0000] text-white px-4 py-3 transition-all duration-300 font-medium inline-flex items-center gap-2 group"
            >
              {activeSlide.ctaText}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}