'use client';

import { Monitor, Clock, BookOpen, Users, Award, Headphones, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "Live Interactive Classes",
    description: "Learn from industry experts in real-time with Q&A sessions",
    color: "from-[#CC0000] to-[#DC2626]"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Flexible Schedule",
    description: "Evening and weekend batches available for working professionals",
    color: "from-[#DC2626] to-[#CC0000]"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Recorded Sessions",
    description: "Access recorded lectures anytime for 6 months",
    color: "from-[#CC0000] to-[#DC2626]"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Peer Learning",
    description: "Connect with fellow designers from around the world",
    color: "from-[#DC2626] to-[#CC0000]"
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Industry Recognition",
    description: "Globally recognized IIID certification",
    color: "from-[#CC0000] to-[#DC2626]"
  },
  {
    icon: <Headphones className="w-6 h-6" />,
    title: "24/7 Support",
    description: "Dedicated student support team",
    color: "from-[#DC2626] to-[#CC0000]"
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
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

export default function BenefitsSection() {
  return (
    <section className="py-16 md:py-20 bg-[#FDF8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-[#CC0000]/10 px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#CC0000]" />
            <span className="text-sm font-medium text-[#CC0000]">Why Choose Us</span>
          </motion.div> */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">
            Why Choose Live Online Courses?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Learn from anywhere with our interactive live online platform
          </p>
        </div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 border border-[#D4A574]/20"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-full flex items-center justify-center text-white mx-auto mb-4 shadow-md`}>
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
              <p className="text-gray-600 text-sm">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}