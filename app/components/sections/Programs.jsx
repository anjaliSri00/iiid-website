'use client'

import Card from '../ui/Card'
import { programs } from '../../../data/programsData'
import { ChevronRight } from 'lucide-react'

export default function Programs() {
  return (
    <section id="programs" className="py-16 md:py-20 bg-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl montserrat-600 lg:text-5xl text-gray-900 mb-6">
            Programs
          </h2>
          <p className="text-base montserrat-400 md:text-lg lg:text-xl text-black max-w-4xl mx-auto leading-relaxed">
            IIID offers a flexible training and certification program primarily based on the assessment of professional experience and competence, with limited structured learning modules. The program focuses on evaluating existing knowledge, practical expertise, and industry experience in alignment with professional standards.
          </p>
        </div>
        
        {/* Programs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {programs.map((program) => (
            <Card key={program.id} className="hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full">
              <Card.Body className="p-5 md:p-6 flex flex-col h-full">
                {/* Category Badge and Title - Top Section */}
                <div className="mb-4 flex gap-2 flex-col">
                  <span className="text-white montserrat-600  bg-red-600 text-center px-4 py-2 font-semibold text-xs uppercase tracking-wider rounded">
                    {program.category}
                  
                  </span>
                  <h3 className="text-xl montserrat-600  mx-auto font-bold text-center text-gray-900">
                    {program.title}
                      <br/>
                    Interior Design
                  </h3>
                </div>
                
                {/* Course Details - Middle Section (pushes button down) */}
                <div className="flex-1 montserrat-600 ">
                  <div className="space-y-3 text-sm mb-4">
                    <div className="flex justify-center gap-2 items-center">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold text-gray-900">{program.duration}</span>
                    </div>
                    
                    <div className="flex justify-center gap-2 items-center">
                      <span className="text-gray-600">Mode:</span>
                      <span className="font-semibold text-gray-900">{program.mode}</span>
                    </div>
                    
                    <div className="pt-2 text-center">
                      <span className="text-gray-600 block mb-1 font-medium">Assessment</span>
                      <div className="space-y-1">
                        {program.assessment.map((item, idx) => (
                          <p key={idx} className="text-gray-800 text-sm font-medium">
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Fee and Apply Button - Bottom Section (always at bottom) */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="mb-3 text-center">
                    <span className="text-gray-500 text-xs uppercase tracking-wider">Course Fee</span>
                    <p className="text-xl montserrat-500 text-black mt-1">
                      {program.fee}
                    </p>
                  </div>
                  
                  <button className="w-full montserrat-500 bg-transparent border border-red-600 text-red-600 px-4 py-2 rounded-md hover:bg-red-600 hover:text-white transition-all duration-300 flex items-center justify-between group">
                    <span>Apply</span>
                    <span className="group-hover:translate-x-1 transition-transform">
                        <ChevronRight/>
                    </span>
                  </button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}