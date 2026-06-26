"use client";

import React, { useState } from 'react';
import Card from '../ui/Card';
import { 
  ChevronRight, 
  Clock, 
  GraduationCap, 
  BookOpen, 
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

const ProgramGrid = ({ programs = [] }) => {
  const [hoveredId, setHoveredId] = useState(null);
  console.log(programs)

  if (!programs || programs.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-4">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Available</h3>
        <p className="text-gray-500">Check back later for new programs.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
      {programs.map((program) => {
        const isHovered = hoveredId === program.id;
        const hasDiscount = program.discount > 0;
        const discountedPrice = hasDiscount ? program.final_price : program.original_price;
        const savedAmount = hasDiscount ? program.original_price - program.final_price : 0;

        return (
          <Link 
            href={`/programs/${program.id}`} 
            key={program.id}
            className="block transition-all duration-300 hover:-translate-y-1 h-full"
            onMouseEnter={() => setHoveredId(program.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <Card className={`
              hover:shadow-xl transition-all duration-300 border border-gray-200 flex flex-col h-full cursor-pointer
              ${isHovered ? 'shadow-xl border-red-200' : 'shadow-md'}
            `}>
              {/* Thumbnail Image Section - Fixed height */}
              <div className="relative w-full h-44 md:h-48 bg-linear-to-r from-red-50 to-gray-100 overflow-hidden shrink-0">
                {program.thumbnail_url ? (
                  <img 
                    src={program.thumbnail_url} 
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500"
                    style={{ transform: isHovered ? 'scale(1.05)' : 'scale(1)' }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-red-50 to-red-100">
                    <BookOpen className="w-16 h-16 text-red-300" />
                  </div>
                )}
                

                {/* Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      {program.discount}% OFF
                    </span>
                  </div>
                )}

                {/* Category Badge - Bottom Left */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full shadow-md">
                    {program.category || 'General'}
                  </span>
                </div>
              </div>
              
              <Card.Body className="flex flex-col flex-1">
                {/* Title Section - Fixed height */}
                <div className="mb-2 min-h-12.5">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-2 hover:text-red-600 transition-colors">
                    {program.title}
                  </h3>
                  {program.course_code && (
                    <p className="text-xs text-gray-400 mt-0.5">#{program.course_code}</p>
                  )}
                </div>
                
                {/* Course Details - Compact */}
                <div className="space-y-1.5 text-sm flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      Duration
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">{program.duration}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1.5 text-xs">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Mode
                    </span>
                    <span className="font-semibold text-gray-900 text-sm capitalize">{program.mode}</span>
                  </div>

                  {/* Only show level if available */}
                  {program.level && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 flex items-center gap-1.5 text-xs">
                        <BookOpen className="w-3.5 h-3.5" />
                        Level
                      </span>
                      <span className="font-semibold text-gray-900 text-sm capitalize">{program.level}</span>
                    </div>
                  )}
                </div>
                
                {/* Fee and Apply Button - Fixed bottom section */}
                <div className="mt-3 pt-3 border-t border-gray-200 shrink-0">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wider">Fee</span>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold text-gray-900">
                          {program.fee}
                        </p>
                        {hasDiscount && program.original_price && (
                          <span className="text-xs text-gray-400 line-through">
                            ₹{program.original_price}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasDiscount && savedAmount > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                        Save ₹{savedAmount}
                      </span>
                    )}
                  </div>
                  
                  <div className={`
                    w-full px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-between text-sm bg-red-600 text-white shadow-md
                  `}>
                    <span className="font-medium">View Details</span>
                    <span className={`transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`}>
                      <ChevronRight className={`w-4 h-4 ${isHovered ? 'text-white' : 'text-red-600'}`} />
                    </span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default ProgramGrid;