// "use client";

// import { motion } from "framer-motion";
// import {
//   FileText,
//   CheckCircle,
//   Video,
//   CheckSquare,
//   ClipboardCheck,
//   Award,
//   ArrowRight,
//   Sparkles,
// } from "lucide-react";
// import Link from "next/link";

// export default function HowItWorksSection() {
//   const steps = [
//     {
//       icon: <FileText className="w-6 h-6" />,
//       title: "Apply Online",
//       description: "Fill out the application form with your details",
//       bg: "bg-[#CC0000]/10",
//       text: "text-[#CC0000]",
//       border: "border-[#D4A574]/30",
//     },
//     {
//       icon: <CheckCircle className="w-6 h-6" />,
//       title: "Get Confirmed",
//       description: "Receive confirmation email with joining instructions",
//       bg: "bg-[#DC2626]/10",
//       text: "text-[#DC2626]",
//       border: "border-[#D4A574]/30",
//     },
//     {
//       icon: <Video className="w-6 h-6" />,
//       title: "Watch Video Lessons",
//       description: "Access high-quality video content and learn at your own pace",
//       bg: "bg-[#CC0000]/10",
//       text: "text-[#CC0000]",
//       border: "border-[#D4A574]/30",
//     },
//     {
//       icon: <CheckSquare className="w-6 h-6" />,
//       title: "Mark Lessons Complete",
//       description: "Complete all lessons and track your progress",
//       bg: "bg-[#DC2626]/10",
//       text: "text-[#DC2626]",
//       border: "border-[#D4A574]/30",
//     },
//     {
//       icon: <ClipboardCheck className="w-6 h-6" />,
//       title: "Take Assessment",
//       description: "Test your knowledge with the course assessment",
//       bg: "bg-[#CC0000]/10",
//       text: "text-[#CC0000]",
//       border: "border-[#D4A574]/30",
//     },
//     {
//       icon: <Award className="w-6 h-6" />,
//       title: "Get Certified",
//       description: "Earn your certificate and showcase your achievement",
//       bg: "bg-gradient-to-br from-[#CC0000] to-[#DC2626]",
//       text: "text-white",
//       border: "border-[#CC0000]",
//     },
//   ];

//   return (
//     <section className="py-15 md:py-24 bg-white">
//       <div className="max-w-screen-2xl w-full mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="text-center mb-12 md:mb-16">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             viewport={{ once: true }}
//           >
//             <div className="inline-flex items-center gap-2 bg-[#CC0000]/10 px-4 py-2 rounded-full mb-4">
//               <Sparkles className="w-4 h-4 text-[#CC0000]" />
//               <span className="text-sm font-medium text-[#CC0000]">Learning Journey</span>
//             </div>
//           </motion.div>
          
//           <motion.h2
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//             viewport={{ once: true }}
//             className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 font-serif"
//           >
//             How Live Online Courses Work
//           </motion.h2>
          
//           <motion.p
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//             viewport={{ once: true }}
//             className="text-gray-600 max-w-2xl mx-auto text-base md:text-lg"
//           >
//             Your journey to certification in 6 simple steps
//           </motion.p>
//         </div>

//         {/* Steps Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
//           {steps.map((step, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 30 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               viewport={{ once: true }}
//               className={`group relative bg-white rounded-2xl p-6 md:p-8 border ${step.border} shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
//             >
//               {/* Step Number Badge */}
//               <div className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm font-bold text-[#CC0000] border-2 border-[#CC0000] shadow-md group-hover:scale-110 transition-transform">
//                 {index + 1}
//               </div>

//               {/* Icon */}
//               <div className={`${step.bg} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
//                 <div className={step.text}>
//                   {step.icon}
//                 </div>
//               </div>

//               {/* Content */}
//               <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#CC0000] transition-colors">
//                 {step.title}
//               </h3>
//               <p className="text-gray-600 text-sm leading-relaxed">
//                 {step.description}
//               </p>

//               {/* Arrow indicator on hover */}
//               <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                 <ArrowRight className="w-5 h-5 text-[#CC0000]" />
//               </div>
//             </motion.div>
//           ))}
//         </div>

//         {/* Bottom CTA */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.6 }}
//           viewport={{ once: true }}
//           className="text-center mt-12 md:mt-16"
//         >
//           <div className="inline-flex items-center gap-4 bg-[#FDF8F0] px-6 py-3 rounded-full shadow-md border border-[#D4A574]/30">
//             <span className="text-sm text-gray-600">Ready to start your journey?</span>
//             <Link href="/#programs">
//               <button className="bg-[#CC0000] text-white px-6 py-2 rounded-full hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 text-sm font-medium inline-flex items-center gap-2">
//                 Enroll Now
//                 <ArrowRight className="w-4 h-4" />
//               </button>
//             </Link>
//           </div>
//         </motion.div>
//       </div>
//     </section>
//   );
// }

"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Mail,
  PlayCircle,
  BookOpen,
  ClipboardCheck,
  Trophy,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Users,
  Star
} from "lucide-react";
import Link from "next/link";

export default function HowItWorksSection() {
  const steps = [
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Apply Online",
      description: "Complete our simple online application form",
      time: "5 minutes",
      color: "#CC0000",
      bg: "bg-[#CC0000]",
      lightBg: "bg-[#CC0000]/10",
    },
    {
      icon: <Mail className="w-7 h-7" />,
      title: "Get Confirmed",
      description: "Receive your confirmation and login credentials",
      time: "24 hours",
      color: "#DC2626",
      bg: "bg-[#DC2626]",
      lightBg: "bg-[#DC2626]/10",
    },
    {
      icon: <PlayCircle className="w-7 h-7" />,
      title: "Access Course Content",
      description: "Watch high-quality video lessons at your pace",
      time: "Self-paced",
      color: "#CC0000",
      bg: "bg-[#CC0000]",
      lightBg: "bg-[#CC0000]/10",
    },
    {
      icon: <BookOpen className="w-7 h-7" />,
      title: "Track Your Progress",
      description: "Mark lessons complete and monitor your advancement",
      time: "Ongoing",
      color: "#DC2626",
      bg: "bg-[#DC2626]",
      lightBg: "bg-[#DC2626]/10",
    },
    {
      icon: <ClipboardCheck className="w-7 h-7" />,
      title: "Final Assessment",
      description: "Complete the comprehensive course assessment",
      time: "1 hour",
      color: "#CC0000",
      bg: "bg-[#CC0000]",
      lightBg: "bg-[#CC0000]/10",
    },
    {
      icon: <Trophy className="w-7 h-7" />,
      title: "Earn Your Certificate",
      description: "Receive your professional certification instantly",
      time: "Instant",
      color: "#CC0000",
      bg: "bg-gradient-to-r from-[#CC0000] to-[#DC2626]",
      lightBg: "bg-gradient-to-r from-[#CC0000]/10 to-[#DC2626]/10",
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#CC0000] text-white text-sm font-medium  mb-4">
              Simple Process
            </span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            How It <span className="text-[#CC0000]">Works</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            Your path to certification in six simple steps
          </motion.p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#CC0000]/20 transform md:-translate-x-1/2"></div>

          <div className="space-y-12 md:space-y-0 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`md:flex items-center ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
              >
                {/* Timeline Dot - Desktop */}
                <div className="hidden md:flex items-center justify-center w-16 h-16 rounded-full bg-white border-4 border-[#CC0000] shadow-lg z-10 absolute left-1/2 transform -translate-x-1/2">
                  <div className="absolute inset-0 bg-[#CC0000] rounded-full animate-ping opacity-20"></div>
                  <div className="relative z-10 text-[#CC0000]">{step.icon}</div>
                </div>

                {/* Mobile Dot */}
                <div className="md:hidden absolute left-8 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-[#CC0000] border-3 border-white shadow-lg z-10">
                  <div className="absolute inset-0 bg-[#CC0000] rounded-full animate-ping opacity-20"></div>
                </div>

                {/* Content */}
                <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:pr-16 md:text-right' : 'md:pl-16'}`}>
                  <div className="bg-white p-6 md:p-8 shadow-lg shadow-gray-100/50 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:border-[#CC0000]/20 ml-14 md:ml-0">
                    {/* Step Number */}
                    <div className="flex items-center gap-3 md:justify-end mb-3">
                      <span className="text-xs font-bold text-white bg-[#CC0000] px-3 py-1">
                        Step {index + 1}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {step.time}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {step.description}
                    </p>

                    {/* Mobile Icon */}
                    <div className="md:hidden absolute left-0 top-1/2 transform -translate-y-1/2 -ml-9 w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white shadow-lg">
                      {step.icon}
                    </div>
                  </div>
                </div>

                {/* Empty spacer for alignment */}
                <div className="hidden md:block md:w-5/12"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Link href="/#programs">
            <button className="bg-[#CC0000] text-white px-6 py-3 hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 text-lg font-semibold inline-flex items-center gap-3">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}