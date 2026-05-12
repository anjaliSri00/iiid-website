export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="animate-pulse">
        {/* Hero Loading */}
        <div className="h-[400px] bg-gradient-to-br from-red-600 to-red-800"></div>
        
        {/* Benefits Loading */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            <div className="grid md:grid-cols-4 gap-6 mt-12">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-40 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}