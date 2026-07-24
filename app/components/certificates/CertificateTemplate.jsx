// // src/components/certificates/CertificateTemplate.jsx
'use client';

import { logo,stamp } from '@/public/img';
import Image from 'next/image';


const CertificateTemplate = ({ certificateData, program }) => {
  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Get full name from certificate data or fallback
  const fullName = certificateData?.full_name || certificateData?.user?.name || "Recipient";
  
  // Get course title from certificate data or program
  const courseTitle = certificateData?.course_title || program?.title || "Course";
  
  // Get certificate code
  const certificateCode = certificateData?.certificate_code || certificateData?.code || "";
  
  // Get issued date
  const issuedDate = certificateData?.issued_at || certificateData?.issued_date || new Date().toISOString();

  return (
    <div className="min-h-screen bg-[#e8ddd0] flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-[#FCFAF8] shadow-2xl p-5 relative">
        {/* Decorative border frame */}
        <div className="border-4 border-[#c9a84c] p-8 relative">
          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-[#c9a84c]"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-[#c9a84c]"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-[#c9a84c]"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-[#c9a84c]"></div>

          <div className="text-center relative">
            {/* Logo Section */}
            <div className="flex justify-start mb-4">
              <div className="w-[300px] relative">
                <Image
                  src={logo}
                  alt="Institute Logo"
                  width={300}
                  height={300}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Certificate ID Badge */}
            {certificateCode && (
              <div className="inline-block bg-[#8B1A1A]/10 text-[#8B1A1A] text-xs px-4 py-1 rounded-full mb-4 font-mono">
                Certificate #{certificateCode}
              </div>
            )}

            {/* Decorative line with diamonds */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[1px] w-12 bg-[#c9a84c]"></div>
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45"></div>
              <div className="h-[1px] w-8 bg-[#c9a84c]"></div>
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45"></div>
              <div className="h-[1px] w-12 bg-[#c9a84c]"></div>
            </div>

            {/* DIPLOMA CERTIFICATE */}
            <p className="text-4xl tracking-[0.13em]  text-[#000] font-sans font-bold mb-6">
              DIPLOMA CERTIFICATE
            </p>

            {/* THIS IS TO CERTIFY THAT */}
            <p className="text-sm tracking-[0.19em] text-[#2c1810] font-sans mb-4">
              THIS IS TO CERTIFY THAT
            </p>

            {/* Recipient Name - with underline */}
            <div className="mb-4">
              <p className="text-3xl md:text-4xl merienda-600 text-[#1a0f0a]  border-b-2 border-[#c9a84c] inline-block px-12 pb-2">
                {fullName}
              </p>
            </div>

            {/* has successfully completed the diploma program in */}
            <p className="text-base tracking-[0.1em] text-[#2c1810] font-serif mb-1">
              has successfully completed the diploma program in
            </p>

            {/* Course Title */}
            <p className="text-2xl md:text-2xl font-serif text-[#2c1810] tracking-[0.1em] mb-4">
              {courseTitle}
            </p>

            {/* and is hereby awarded this diploma in recognition of their academic accomplishments. */}
            <p className="text-base tracking-[0.05em] text-[#2c1810] font-serif leading-relaxed max-w-xl mx-auto mb-6">
              and is hereby awarded this diploma in recognition of their
              academic accomplishments.
            </p>

            {/* AWARDED THIS DATE */}
            <p className="text-sm tracking-[0.15em] text-[#8b6b2c] font-serif mb-8">
              AWARDED THIS {formatDate(issuedDate).toUpperCase()}
            </p>

            {/* SIGNED */}
            <p className="text-sm hidden tracking-[0.2em] text-[#2c1810] font-serif mb-6">
              SIGNED
            </p>

            {/* Signatures with Stamp Overlay */}
            <div className="relative py-10">
              <div className="flex justify-center items-start gap-20 relative">
                {/* Registrar */}
                <div className="text-center hidden">
                  <div className="w-40 border-b border-[#2c1810] mb-1 h-12 flex items-end justify-center">
                    <span className="font-serif text-[#2c1810] text-sm tracking-widest italic">
                      Signature
                    </span>
                  </div>
                  <p className="text-xs tracking-[0.2em] text-[#2c1810] font-serif uppercase">
                    Registrar
                  </p>
                </div>

                {/* Stamp - Positioned in the center between signatures */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-[990px] h-30 relative opacity-70">
                    <Image
                      src={stamp}
                      alt="Institute Stamp"
                      fill
                      className="object-contain"
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                </div>

                {/* Director */}
                <div className="text-center hidden">
                  <div className="w-40 border-b border-[#2c1810] mb-1 h-12 flex items-end justify-center">
                    <span className="font-serif text-[#2c1810] text-sm tracking-widest italic">
                      Signature
                    </span>
                  </div>
                  <p className="text-xs tracking-[0.2em] text-[#2c1810] font-serif uppercase">
                    Director
                  </p>
                </div>
              </div>
            </div>

            {/* DIRECTOR (second line) */}
            <div className="text-center hidden mt-1">
              <p className="text-xs tracking-[0.2em] text-[#2c1810] font-serif uppercase">
                DIRECTOR
              </p>
            </div>

            {/* Footer with verification link */}
            {certificateCode && (
              <div className="mt-8 pt-4 border-t border-[#c9a84c]/30 text-center">
                <p className="text-[10px] text-gray-400 tracking-wider">
                  Verify at: {typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/{certificateCode}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;