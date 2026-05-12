'use client';

import { FileText, CheckCircle, Video, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Apply Online",
    description: "Fill out the application form with your details",
    color: "bg-blue-500"
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    title: "Get Confirmed",
    description: "Receive confirmation email with joining instructions",
    color: "bg-green-500"
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Join Live Class",
    description: "Access live online sessions and start learning",
    color: "bg-purple-500"
  },
  {
    icon: <Award className="w-6 h-6" />,
    title: "Get Certified",
    description: "Complete the course and earn your certificate",
    color: "bg-red-600"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Live Online Courses Work
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Simple 4-step process to start your learning journey
          </p>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2"></div>
          
          <div className="grid md:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center relative z-10"
              >
                <div className="relative inline-block">
                  <div className={`w-16 h-16 ${step.color} text-white rounded-full flex items-center justify-center mx-auto mb-4 relative z-10 shadow-lg`}>
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-bold text-red-600 border border-gray-200">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}