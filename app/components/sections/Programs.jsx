'use client'

import ProgramGrid from './ProgramGrid'

export default function Programs() {
  return (
    <section id="programs" className="py-16 md:py-20 bg-red-50">
      <div className="max-w-screen-3xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl montserrat-600 lg:text-5xl text-gray-900 mb-6">
            Programs
          </h2>
          <p className="text-base montserrat-400 md:text-lg lg:text-xl text-black max-w-4xl mx-auto leading-relaxed max-sm:text-justify">
            IIID offers a flexible training and certification program primarily based on the assessment of professional experience and competence, with limited structured learning modules. The program focuses on evaluating existing knowledge, practical expertise, and industry experience in alignment with professional standards.
          </p>
        </div>
        
        {/* Programs Grid */}
       <ProgramGrid/>
      </div>
    </section>
  )
}