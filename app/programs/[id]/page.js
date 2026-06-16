"use client";

import { useParams } from 'next/navigation';
import { programs } from '@/data/programsData';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, BookOpen } from 'lucide-react';

const ProgramDetailPage = () => {
  const params = useParams();
  const programId = Number(params.id);
  
  // Find the program by ID
  const program = programs.find(p => p.id === programId);
  
  // If program not found, show error
  if (!program) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h2>
          <Link href="/#programs" className="text-red-600 hover:text-red-700">
            <ArrowLeft className="inline mr-2" size={20} />
            Back to Programs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-red-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link 
          href="/#programs" 
          className="inline-flex items-center text-gray-600 hover:text-red-600 transition-colors mb-8"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Programs
        </Link>

        {/* Program Details Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Category Badge */}
          <div className="bg-red-600 px-6 py-3">
            <span className="text-white montserrat-600 font-semibold text-sm uppercase tracking-wider">
              {program.category}
            </span>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8">
            <h1 className="text-3xl md:text-4xl montserrat-600 font-bold text-gray-900 mb-2">
              {program.title}
              <br />
              Interior Design
            </h1>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-8">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="font-semibold text-gray-900">{program.duration}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Mode</p>
                  <p className="font-semibold text-gray-900">{program.mode}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <BookOpen className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Course Fee</p>
                  <p className="font-semibold text-gray-900">{program.fee}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="text-red-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Assessment</p>
                  <div className="font-semibold text-gray-900">
                    {program.assessment.map((item, idx) => (
                      <span key={idx} className="block text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Program Description */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-xl montserrat-600 font-semibold text-gray-900 mb-4">
                Program Overview
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The {program.title} program offers a comprehensive curriculum designed to 
                develop expertise in interior design. This program is ideal for professionals 
                looking to enhance their skills and advance their careers in the design industry.
              </p>
            </div>

            {/* Apply Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <Link href={`/programs/${program.id}/apply`}>
              <button className="w-full md:w-auto bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors font-semibold">
                Apply Now
              </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailPage;