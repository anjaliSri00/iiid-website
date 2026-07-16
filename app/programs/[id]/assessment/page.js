import React, { Suspense } from 'react';
import AssessmentWrapper from './AssessmentWrapper';

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#FDF8F0] flex flex-col items-center justify-center">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-[#D4A574]/30 rounded-full"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[#CC0000] rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-600 font-medium">Loading assessment...</p>
  </div>
);

const AssessmentPage = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AssessmentWrapper />
    </Suspense>
  );
};

export default AssessmentPage;