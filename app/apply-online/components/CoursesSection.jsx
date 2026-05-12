'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Monitor, Users, CheckCircle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { programs } from '@/data/programsData';

export default function CoursesSection() {
  const [expandedCourse, setExpandedCourse] = useState(null);
  
  // Enhance programs with additional details
  const coursesWithDetails = programs.map(program => ({
    ...program,
    fullTitle: `${program.title} Interior Design`,
    mode: "Live Online",
    startDate: "March 15, 2024",
    timing: "7:00 PM - 9:00 PM IST",
    seats: Math.floor(Math.random() * 30) + 10 + " seats left",
    features: ["Live Classes", "Recorded Sessions", "Portfolio Review", "Certificate", "Industry Projects"],
    syllabus: [
      "Introduction to Interior Design",
      "Space Planning & Layout",
      "Materials & Finishes",
      "Lighting Design",
      "Furniture Design",
      "Portfolio Development"
    ]
  }));

  const toggleExpand = (id) => {
    setExpandedCourse(expandedCourse === id ? null : id);
  };

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Live Online Certification Programs
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our industry-focused interior design programs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {coursesWithDetails.map((course) => (
            <div 
              key={course.id} 
              className={`border rounded-lg overflow-hidden hover:shadow-lg transition-all ${
                course.popular ? 'border-red-600 shadow-md' : 'border-gray-200'
              }`}
            >
              {course.popular && (
                <div className="bg-red-600 text-white text-center py-1.5 text-sm font-semibold">
                  🔥 Most Popular Course
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-red-600 text-sm font-semibold uppercase">{course.category}</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-1">{course.fullTitle}</h2>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{course.fee}</p>
                    <p className="text-gray-500 text-xs">One-time fee</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Starts: {course.startDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{course.timing}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Monitor className="w-4 h-4" />
                    <span className="text-sm">{course.mode}</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-semibold">{course.seats}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm font-semibold mb-2">Assessment:</p>
                  <div className="flex flex-wrap gap-2">
                    {course.assessment.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 text-sm font-semibold mb-2">What's included:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {course.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expandable Syllabus */}
                <button
                  onClick={() => toggleExpand(course.id)}
                  className="w-full flex items-center justify-between text-red-600 py-2 text-sm font-semibold hover:text-red-700 transition"
                >
                  <span>View Syllabus</span>
                  {expandedCourse === course.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedCourse === course.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-700 text-sm font-semibold mb-2">Course Syllabus:</p>
                    <ul className="space-y-1">
                      {course.syllabus.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link href="/application-form" className="block mt-6">
                  <button className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2">
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}