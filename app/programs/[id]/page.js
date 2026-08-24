import React, { Suspense } from 'react';
import Program_detail from './Program_detail';

const page = () => {
  return (
    <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
      <Program_detail/>
    </Suspense>
  );
}

export default page;
