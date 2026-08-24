import React, { Suspense } from 'react';
import Programs from '../components/sections/Programs';

const Programspage = () => {
  return (
    <Suspense fallback={<div className="h-64 bg-gray-50 animate-pulse"></div>}>
      <Programs/>
    </Suspense>
  );
}

export default Programspage;
