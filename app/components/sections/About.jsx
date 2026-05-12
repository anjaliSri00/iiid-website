export default function About() {
  return (
    <section id="about" className="py-16 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:gap-12 justify-center items-center">
          {/* Text Content */}
          <div className="flex flex-col justify-center items-center text-center">
          <h2 className="text-3xl md:text-4xl montserrat-600 lg:text-5xl text-gray-900 mb-6">
              About IIID
            </h2>
            <p className="text-black montserrat-400 text-base md:text-lg lg:text-xl max-w-4xl mx-auto mb-6 md:mb-8 leading-8">
              IIID provides professional development training programs designed for experienced professionals, focusing on advanced skills, evolving industry practices, and practical application to support continuous learning and professional excellence.
            </p>
            
            <h3 className="text-xl md:text-2xl montserrat-600 text-gray-900 mb-4 md:mb-6 text-center">
              Professional Certifications - Knowledge Based Certifications
            </h3>
            
            <p className="text-black montserrat-400 text-base md:text-lg lg:text-xl mx-auto mb-6 leading-relaxed text-left">
              <span className="montserrat-600 text-black">Knowledge-based certifications</span> are market-driven education and certification programs designed to ensure that individuals possess the required knowledge and understanding of International Institute of Interior Designers (IIID) standards. These certifications typically involve focused learning and validate conceptual and foundational knowledge of specific frameworks and practices.
            </p>
            
            <p className="text-black montserrat-400 text-base md:text-lg lg:text-xl mx-auto mb-6 leading-relaxed text-left">
              <span className="montserrat-600 text-black">IIID Certification Credentials,</span> in contrast, are experience-based certifications that recognize an individual's professional practice and industry expertise. Certification is awarded primarily through a structured assessment of professional experience, with minimal formal learning requirements and no traditional classroom lectures or examinations.
            </p>
          </div>
          
          {/* Certificate Image at Bottom */}
          <div className="w-full max-w-4xl mx-auto mt-6 md:mt-8">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg p-6 md:p-8 flex items-center justify-center border border-gray-200">
              <div className="text-center">
                {/* Certificate Icon/Image Placeholder */}
                <div className="mb-4">
                  <svg className="w-20 h-20 md:w-24 md:h-24 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Certificate of Excellence</h4>
                <p className="text-gray-600 text-sm md:text-base">Internationally Recognized Certification</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-12 h-0.5 bg-red-600"></div>
                  <div className="w-12 h-0.5 bg-gray-300"></div>
                  <div className="w-12 h-0.5 bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}