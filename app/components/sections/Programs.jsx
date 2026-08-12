// 'use client'

// import { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
// import ProgramGrid from './ProgramGrid';
// import { Loader2, RefreshCw, BookOpen, Sparkles } from 'lucide-react';
// import fetchApiResponse from '@/helper/api_data_store';
// import { motion } from 'framer-motion';


// export default function Programs() {
//   const { data: session } = useSession();
//   const [programs, setPrograms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchPrograms();
//   }, []);

//   const fetchPrograms = async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await fetchApiResponse(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/list?status=published`,
//         {
//           method: "GET",
//           headers: {
//             "Access-Token": session?.accessToken,
//             "Refresh-Token": session?.refreshToken,
//           },
//         }
//       );

//       if (response.meta?.status === 200 && response.data) {
//         const courses = Array.isArray(response.data) ? response.data : [];
        
//         // Transform the data to match the expected format
//         const formattedPrograms = courses.map(course => ({
//           id: course.id,
//           title: course.title,
//           category: course.category,
//           duration: course.duration,
//           mode: course.mode || 'Online',
//           fee: `₹${course.final_price || course.original_price}`,
//           original_price: course.original_price,
//           discount: course.discount,
//           final_price: course.final_price,
//           description: course.description,
//           thumbnail_url: course.thumbnail_url,
//           status: course.status,
//           level: course.level,
//           is_purchased: course.is_purchased || false, 
//           course_code: course.course_code,
//           assessment: getAssessmentForCategory(course.category),
//         }));
        
//         setPrograms(formattedPrograms);
//       } else {
//         setError(response.meta?.message || "Failed to fetch programs");
//       }
//     } catch (error) {
//       console.error("Error fetching programs:", error);
//       setError("Failed to load programs. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper function to get assessment based on category
//   const getAssessmentForCategory = (category) => {
//     const assessments = {
//       'Web Development': ['Project-Based Assessment', 'Technical Interview'],
//       'Data Science': ['Case Study', 'Technical Assessment'],
//       'Interior Design': ['Portfolio Review', 'Design Challenge'],
//     };
//     return assessments[category] || ['Project Work', 'Final Assessment'];
//   };

//   // Retry function
//   const handleRetry = () => {
//     fetchPrograms();
//   };

//   return (
//     <section id="programs" className="py-16 md:py-20 bg-[#FDF8F0]">
//       <div className="max-w-screen-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Section Header */}
//         <div className="text-center mb-12">
        
//           <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
//             Programs
//           </h2>
          
//           <p className="text-base md:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed max-sm:text-justify">
//             IIID offers a flexible training and certification program primarily based on the assessment 
//             of professional experience and competence, with limited structured learning modules. 
//             The program focuses on evaluating existing knowledge, practical expertise, and industry 
//             experience in alignment with professional standards.
//           </p>
//         </div>
        
//         {/* Loading State */}
//         {loading && (
//           <div className="flex flex-col justify-center items-center py-16">
//             <div className="relative">
//               <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
//               <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#8B0000] rounded-full animate-spin"></div>
//             </div>
//             <p className="mt-4 text-gray-600 font-medium">Loading programs...</p>
//           </div>
//         )}

//         {/* Error State */}
//         {error && !loading && (
//           <div className="text-center py-16 bg-white shadow-sm border border-[#D4A574]/30 max-w-2xl mx-auto">
//             <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B0000]/10 rounded-full mb-4">
//               <BookOpen className="w-8 h-8 text-[#8B0000]" />
//             </div>
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Programs</h3>
//             <p className="text-gray-600 mb-6">{error}</p>
//             <button
//               onClick={handleRetry}
//               className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-white hover:shadow-lg transition-all duration-300 font-medium"
//             >
//               <RefreshCw className="w-4 h-4" />
//               Retry
//             </button>
//           </div>
//         )}

//         {/* Programs Grid */}
//         {!loading && !error && (
//           <ProgramGrid programs={programs} />
//         )}
//       </div>
//     </section>
//   );
// }

'use client'

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProgramGrid from './ProgramGrid';
import { Loader2, RefreshCw, BookOpen, Sparkles } from 'lucide-react';
import fetchApiResponse from '@/helper/api_data_store';
import { motion } from 'framer-motion';


export default function Programs() {
  const { data: session } = useSession();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchApiResponse(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/courses/list?status=published`,
        {
          method: "GET",
          headers: {
            "Access-Token": session?.accessToken,
            "Refresh-Token": session?.refreshToken,
          },
        }
      );

      if (response.meta?.status === 200 && response.data) {
        const courses = Array.isArray(response.data) ? response.data : [];
        
        // Transform the data to match the expected format
        const formattedPrograms = courses.map(course => ({
          id: course.id,
          title: course.title,
          category: course.category,
          duration: course.duration,
          mode: course.mode || 'Online',
          fee: `₹${course.final_price || course.original_price}`,
          original_price: course.original_price,
          discount: course.discount,
          final_price: course.final_price,
          description: course.description,
          thumbnail_url: course.thumbnail_url,
          status: course.status,
          level: course.level,
          is_purchased: course.is_purchased || false, 
          course_code: course.course_code,
          assessment: getAssessmentForCategory(course.category),
        }));
        
        setPrograms(formattedPrograms);
      } else {
        setError(response.meta?.message || "Failed to fetch programs");
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
      setError("Failed to load programs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get assessment based on category
  const getAssessmentForCategory = (category) => {
    const assessments = {
      'Web Development': ['Project-Based Assessment', 'Technical Interview'],
      'Data Science': ['Case Study', 'Technical Assessment'],
      'Interior Design': ['Portfolio Review', 'Design Challenge'],
    };
    return assessments[category] || ['Project Work', 'Final Assessment'];
  };

  // Retry function
  const handleRetry = () => {
    fetchPrograms();
  };

  return (
    <section id="programs" className="py-16 md:py-20 bg-pink-50">
      <div className="max-w-screen-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          
          {/* Title with animation */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
          >
            Programs
          </motion.h2>
          
          {/* Description with animation */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-base md:text-lg lg:text-xl text-gray-700 max-w-4xl mx-auto leading-relaxed max-sm:text-justify"
          >
            IIID offers a flexible training and certification program primarily based on the assessment 
            of professional experience and competence, with limited structured learning modules. 
            The program focuses on evaluating existing knowledge, practical expertise, and industry 
            experience in alignment with professional standards.
          </motion.p>
        </div>
        
        {/* Loading State */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col justify-center items-center py-16"
          >
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#8B0000] rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading programs...</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center py-16 bg-white shadow-sm border border-[#D4A574]/30 max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8B0000]/10 rounded-full mb-4">
              <BookOpen className="w-8 h-8 text-[#8B0000]" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Programs</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B0000] to-[#A52A2A] text-white hover:shadow-lg transition-all duration-300 font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </motion.div>
        )}

        {/* Programs Grid with animation */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <ProgramGrid programs={programs} />
          </motion.div>
        )}
      </div>
    </section>
  );
}