import React from 'react';
import About from '../components/sections/About';
import { getFAQs } from '@/helper/lib/faq';
import FaqList from '../components/ui/FaqList';

const Aboutpage = async () => {
  const result = await getFAQs(2);
    const faqs = result?.props?.faqs || [];
  
  return (
    <div>
      <About/>
        {faqs && faqs.length > 0 && (
       <section className=" bg-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FaqList faqs={faqs} loading={false} />
        </div>
      </section>
        )}

    </div>
  );
}

export default Aboutpage;
