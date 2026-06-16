'use client';

import { Monitor, Clock, BookOpen, Users, Award, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  // {
  //   icon: <Monitor className="w-6 h-6" />,
  //   title: "Live Interactive Classes",
  //   description: "Learn from industry experts in real-time with Q&A sessions"
  // },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Flexible Schedule",
    description: "Evening and weekend batches available for working professionals"
  },
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Recorded Sessions",
    description: "Access recorded lectures anytime for 6 months"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Peer Learning",
    description: "Connect with fellow designers from around the world"
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Industry Recognition",
    description: "Globally recognized IIID certification"
  },
  // {
  //   icon: <Headphones className="w-6 h-6" />,
  //   title: "24/7 Support",
  //   description: "Dedicated student support team"
  // }
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
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
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