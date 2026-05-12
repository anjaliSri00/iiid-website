export default function Certification() {
  return (
    <section id="certification" className="py-20 bg-light">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Certification Process</h2>
          <p className="section-subtitle mx-auto">
            Experience-based certification recognizing professional practice and industry expertise
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Submit Application</h3>
            <p className="text-secondary">Complete your application with professional background</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Portfolio Review</h3>
            <p className="text-secondary">Submit your work portfolio for assessment</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Get Certified</h3>
            <p className="text-secondary">Receive your IIID certification credentials</p>
          </div>
        </div>
      </div>
    </section>
  );
}