// 'use client';

// import { Monitor, Clock, BookOpen, Users, Award, Headphones, Sparkles } from 'lucide-react';
// import { motion } from 'framer-motion';

// const benefits = [
//   {
//     icon: <Monitor className="w-6 h-6" />,
//     title: "Live Interactive Classes",
//     description: "Learn from industry experts in real-time with Q&A sessions",
//     color: "from-[#CC0000] to-[#DC2626]"
//   },
//   {
//     icon: <Clock className="w-6 h-6" />,
//     title: "Flexible Schedule",
//     description: "Evening and weekend batches available for working professionals",
//     color: "from-[#DC2626] to-[#CC0000]"
//   },
//   {
//     icon: <BookOpen className="w-6 h-6" />,
//     title: "Recorded Sessions",
//     description: "Access recorded lectures anytime for 6 months",
//     color: "from-[#CC0000] to-[#DC2626]"
//   },
//   {
//     icon: <Users className="w-6 h-6" />,
//     title: "Peer Learning",
//     description: "Connect with fellow designers from around the world",
//     color: "from-[#DC2626] to-[#CC0000]"
//   },
//   {
//     icon: <Award className="w-6 h-6" />,
//     title: "Industry Recognition",
//     description: "Globally recognized IIID certification",
//     color: "from-[#CC0000] to-[#DC2626]"
//   },
//   {
//     icon: <Headphones className="w-6 h-6" />,
//     title: "24/7 Support",
//     description: "Dedicated student support team",
//     color: "from-[#DC2626] to-[#CC0000]"
//   }
// ];

// const containerVariants = {
//   hidden: { opacity: 0 },
//   visible: {
//     opacity: 1,
//     transition: {
//       staggerChildren: 0.1
//     }
//   }
// };

// const itemVariants = {
//   hidden: { y: 20, opacity: 0 },
//   visible: { y: 0, opacity: 1 }
// };

// export default function BenefitsSection() {
//   return (
//     <section className="py-16 md:py-20 bg-[#FDF8F0]">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
         
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
//             Why Choose Live Online Courses?
//           </h2>
//           <p className="text-gray-600 max-w-2xl mx-auto">
//             Learn from anywhere with our interactive live online platform
//           </p>
//         </div>
        
//         <motion.div 
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true }}
//           className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
//         >
//           {benefits.map((benefit, index) => (
//             <motion.div
//               key={index}
//               variants={itemVariants}
//               whileHover={{ scale: 1.03, y: -5 }}
//               className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 border border-[#D4A574]/20"
//             >
//               <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-md`}>
//                 {benefit.icon}
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
//               <p className="text-gray-600 text-sm">{benefit.description}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }


'use client';

import { Monitor, Clock, BookOpen, Users, Award, Headphones, Sparkles, Zap, Shield, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const benefits = [
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "Live Interactive Classes",
    description: "Learn from industry experts in real-time with Q&A sessions",
    gradient: "from-[#CC0000] to-[#DC2626]",
    bg: "bg-[#CC0000]/10",
    text: "text-[#CC0000]",
    delay: 0.1
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Flexible Schedule",
    description: "Evening and weekend batches available for working professionals",
    gradient: "from-[#CC0000] to-[#DC2626]",
    bg: "bg-[#CC0000]/10",
    text: "text-[#CC0000]",
    delay: 0.2
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Recorded Sessions",
    description: "Access recorded lectures anytime for 6 months",
    gradient: "from-[#CC0000] to-[#DC2626]",
    bg: "bg-[#CC0000]/10",
    text: "text-[#CC0000]",
    delay: 0.3
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Peer Learning",
    description: "Connect with fellow designers from around the world",
    gradient: "from-[#CC0000] to-[#DC2626]",
    bg: "bg-[#CC0000]/10",
    text: "text-[#CC0000]",
    delay: 0.4
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Industry Recognition",
    description: "Globally recognized IIID certification",
    gradient: "from-[#CC0000] to-[#DC2626]",
    bg: "bg-[#CC0000]/10",
    text: "text-[#CC0000]",
    delay: 0.5
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Dedicated student support team",
    gradient: "from-[#CC0000] to-[#DC2626]",
    bg: "bg-[#CC0000]/10",
    text: "text-[#CC0000]",
    delay: 0.6
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function BenefitsSection() {
  return (
    <section className="py-20 md:py-28  bg-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Matching Certificate Section Style */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 bg-[#CC0000] text-white text-sm font-medium mb-4">
              Why Choose IIID
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Learn <span className="text-[#CC0000]">Anytime,</span> Anywhere
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            Experience the future of interior design education with our live online platform
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              className="group relative bg-white p-6 md:p-8 border border-gray-100 hover:border-[#CC0000]/20 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#CC0000]/5"
            >
              {/* Step Number Badge */}
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#CC0000] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md group-hover:scale-110 transition-transform">
                {index + 1}
              </div>

              {/* Icon with Red Gradient */}
              <div className={`w-16 h-16 rounded-2xl ${benefit.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300`}>
                <div className={benefit.text}>
                  {benefit.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#CC0000] transition-colors">
                {benefit.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {benefit.description}
              </p>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#CC0000] to-[#DC2626] rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </motion.div>

        
        {/* CTA Section - Matching Other Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white px-6 py-4 shadow-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#CC0000]/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#CC0000]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">Ready to Start Learning?</p>
                <p className="text-xs text-gray-500">Join our live online courses today</p>
              </div>
            </div>
            <Link href="/programs">
              <button className="bg-[#CC0000] text-white px-8 py-3  hover:bg-[#B30000] hover:shadow-lg transition-all duration-300 text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap">
                Explore Programs
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}