// // src/components/certificates/CertificateTemplate.jsx
'use client';

import { logo } from '@/public/img';
import Image from 'next/image';

// export default function CertificateTemplate({ certificateData, program }) {
//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return '24TH DAY OF APRIL 2024';
//     const date = new Date(dateString);
//     const day = date.getDate();
//     const month = date.toLocaleString('default', { month: 'long' });
//     const year = date.getFullYear();
    
//     const getOrdinal = (n) => {
//       const s = ['th', 'st', 'nd', 'rd'];
//       const v = n % 100;
//       return n + (s[(v - 20) % 10] || s[v] || s[0]);
//     };
    
//     return `${getOrdinal(day).toUpperCase()} DAY OF ${month.toUpperCase()} ${year}`;
//   };

//   return (
//     <div className="relative bg-white border-[12px] border-[#8B1A1A] rounded-lg shadow-2xl overflow-hidden">
//       {/* Decorative Border Pattern */}
//       <div className="absolute inset-0 border-4 border-[#8B1A1A]/20 rounded-sm pointer-events-none"></div>
//       <div className="absolute inset-[6px] border-2 border-[#8B1A1A]/10 rounded-sm pointer-events-none"></div>
      
//       {/* Decorative Corner Elements */}
//       <div className="absolute top-3 left-3 w-8 h-8 border-t-4 border-l-4 border-[#8B1A1A]/30 rounded-tl-lg pointer-events-none"></div>
//       <div className="absolute top-3 right-3 w-8 h-8 border-t-4 border-r-4 border-[#8B1A1A]/30 rounded-tr-lg pointer-events-none"></div>
//       <div className="absolute bottom-3 left-3 w-8 h-8 border-b-4 border-l-4 border-[#8B1A1A]/30 rounded-bl-lg pointer-events-none"></div>
//       <div className="absolute bottom-3 right-3 w-8 h-8 border-b-4 border-r-4 border-[#8B1A1A]/30 rounded-br-lg pointer-events-none"></div>

//       <div className="p-8 md:p-12 lg:p-16 relative">
//         {/* Logo Section */}
//         <div className="flex justify-center mb-4">
//           <div className="w-20 h-20 md:w-25 md:h-25 relative">
//             <Image
//               src={logo} // Replace with your actual logo path
//               alt="Institute Logo"
//               width={100}
//               height={100}
//               className="object-contain"
//             />
//           </div>
//         </div>

//         {/* Header - Institute Name */}
//         {/* <div className="text-center mb-3">
//           <h1 className="text-xl md:text-2xl lg:text-3xl font-serif font-bold text-[#8B1A1A] tracking-[0.15em] uppercase">
//             THE
//           </h1>
//           <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#8B1A1A] tracking-[0.15em] uppercase">
//             INTERNATIONAL
//           </h1>
//           <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#8B1A1A] tracking-[0.15em] uppercase">
//             INSTITUTE OF
//           </h1>
//           <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#8B1A1A] tracking-[0.15em] uppercase">
//             INTERIOR DESIGN
//           </h1>
//         </div> */}

//         {/* Decorative Line */}
//         <div className="flex items-center justify-center gap-6 my-3">
//           <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-[#8B1A1A]/40"></div>
//           <div className="w-2 h-2 bg-[#8B1A1A] rounded-full"></div>
//           <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-[#8B1A1A]/40"></div>
//         </div>

//         {/* Diploma Certificate Title */}
//         <div className="text-center mb-6">
//           <h2 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#8B1A1A] tracking-[0.2em] uppercase">
//             DIPLOMA CERTIFICATE
//           </h2>
//         </div>

//         {/* This is to certify that */}
//         <div className="text-center mb-2">
//           <p className="text-sm md:text-base text-gray-600 uppercase tracking-[0.15em] font-medium">
//             THIS IS TO CERTIFY THAT
//           </p>
//         </div>

//         {/* Recipient Name */}
//         <div className="text-center mb-4">
//           <div className="inline-block">
//             <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-[#8B1A1A] px-8 py-1 border-b-2 border-[#8B1A1A]/30">
//               {certificateData?.full_name || 'Recipient Name'}
//             </h3>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="text-center max-w-2xl mx-auto mb-4">
//           <p className="text-sm md:text-base text-gray-700 leading-relaxed">
//             has successfully completed the diploma program in
//           </p>
//         </div>

//         {/* Course/Program Name */}
//         <div className="text-center mb-6">
//           <h4 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#8B1A1A]">
//             {certificateData?.course_title || program?.title || 'Interior Design'}
//           </h4>
//           <p className="text-sm text-gray-600 mt-2 max-w-lg mx-auto">
//             and is hereby awarded this diploma in recognition of their academic accomplishments.
//           </p>
//         </div>

//         {/* Award Date */}
//         <div className="text-center mb-8">
//           <p className="text-sm md:text-base font-medium text-[#8B1A1A] tracking-[0.05em]">
//             AWARDED THIS {formatDate(certificateData?.issued_at)}
//           </p>
//         </div>

//         {/* Signatures Section */}
//         <div className="grid grid-cols-2 gap-12 max-w-md mx-auto">
//           {/* Left Signature - Signed */}
//           <div className="text-center">
//             <div className="h-[2px] w-full max-w-[140px] mx-auto bg-gray-300 mb-1"></div>
//             <div className="h-12 border-b border-gray-400 mb-1 mx-auto max-w-[140px]"></div>
//             <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">SIGNED</p>
//             <p className="text-[10px] text-gray-400 uppercase tracking-wider">Signature</p>
//             <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mt-1">Registrar</p>
//           </div>

//           {/* Right Signature - Director */}
//           <div className="text-center">
//             <div className="h-[2px] w-full max-w-[140px] mx-auto bg-gray-300 mb-1"></div>
//             <div className="h-12 border-b border-gray-400 mb-1 mx-auto max-w-[140px]"></div>
//             <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">DIRECTOR</p>
//             <p className="text-[10px] text-gray-400 uppercase tracking-wider">Signature</p>
//             <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold mt-1">Director</p>
//           </div>
//         </div>

//         {/* Certificate Verification Footer */}
//         <div className="mt-8 pt-4 border-t border-[#8B1A1A]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
//           <div className="flex items-center gap-2">
//             <svg className="w-4 h-4 text-[#8B1A1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//             </svg>
//             <span>Verified Certificate</span>
//           </div>
          
//           {certificateData?.certificate_code && (
//             <div className="flex items-center gap-2">
//               <span className="text-gray-400">Certificate Code:</span>
//               <span className="font-mono text-[#8B1A1A] font-medium text-xs bg-[#8B1A1A]/5 px-2 py-0.5 rounded">
//                 {certificateData.certificate_code}
//               </span>
//             </div>
//           )}
          
//           <div className="flex items-center gap-2">
//             <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//             </svg>
//             <span>Authentic</span>
//           </div>
//         </div>

//         {/* Watermark Text */}
//         <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
//           <div className="text-8xl md:text-9xl font-serif font-bold text-[#8B1A1A] rotate-[-15deg] select-none">
//             {certificateData?.full_name?.charAt(0) || 'D'}
//           </div>
//         </div>

//         {/* Background Pattern - Subtle Lines */}
//         <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
//           <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-[#8B1A1A] rounded-full"></div>
//           <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 border-2 border-[#8B1A1A] rounded-full"></div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";

const CertificateTemplate = ({ certificateData, program }) => {
  return (
    <div className="min-h-screen bg-[#e8ddd0] flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-white shadow-2xl p-5 relative">
        {/* Decorative border frame */}
        <div className="border-4 border-[#c9a84c] p-8 relative">
          {/* Corner decorations */}
          <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-[#c9a84c]"></div>
          <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-[#c9a84c]"></div>
          <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-[#c9a84c]"></div>
          <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-[#c9a84c]"></div>

          <div className="text-center">

             <div className="relative">
       {/* Logo Section */}
         <div className="flex justify-start mb-4">
          <div className="w-[200px] relative">
           <Image
           src={logo} // Replace with your actual logo path
              alt="Institute Logo"
                             width={200}
               height={200}
          className="object-contain"           />
         </div>
     </div>
            {/* THE */}
            {/* <p className="text-sm tracking-[0.5em] text-[#2c1810] font-serif mb-1">
              THE
            </p> */}

            {/* INTERNATIONAL */}
            {/* <p className="text-2xl md:text-3xl tracking-[0.3em] text-[#2c1810] font-serif font-bold">
              INTERNATIONAL
            </p> */}

            {/* INSTITUTE OF */}
            {/* <p className="text-xl md:text-2xl tracking-[0.3em] text-[#2c1810] font-serif font-bold">
              INSTITUTE OF
            </p> */}

            {/* INTERIOR DESIGN */}
            {/* <p className="text-2xl md:text-3xl tracking-[0.15em] text-[#2c1810] font-serif font-bold mb-4">
              INTERIOR DESIGN
            </p> */}

            {/* Decorative line with diamonds */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[1px] w-12 bg-[#c9a84c]"></div>
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45"></div>
              <div className="h-[1px] w-8 bg-[#c9a84c]"></div>
              <div className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45"></div>
              <div className="h-[1px] w-12 bg-[#c9a84c]"></div>
            </div>

            {/* DIPLOMA CERTIFICATE */}
            <p className="text-xl md:text-2xl tracking-[0.4em] text-[#8b6b2c] font-serif mb-6">
              DIPLOMA CERTIFICATE
            </p>

            {/* THIS IS TO CERTIFY THAT */}
            <p className="text-sm tracking-[0.2em] text-[#2c1810] font-serif mb-4">
              THIS IS TO CERTIFY THAT
            </p>

            {/* Recipient Name - with underline */}
            <div className="mb-4">
              <p className="text-3xl md:text-4xl font-serif text-[#1a0f0a] tracking-widest border-b-2 border-[#c9a84c] inline-block px-12 pb-1">
                Recipient Name
              </p>
            </div>

            {/* has successfully completed the diploma program in */}
            <p className="text-sm tracking-[0.1em] text-[#2c1810] font-serif mb-1">
              has successfully completed the diploma program in
            </p>

            {/* Interior Design */}
            <p className="text-xl md:text-2xl font-serif text-[#2c1810] tracking-[0.2em] mb-4">
              Interior Design
            </p>

            {/* and is hereby awarded this diploma in recognition of their academic accomplishments. */}
            <p className="text-sm tracking-[0.05em] text-[#2c1810] font-serif leading-relaxed max-w-xl mx-auto mb-6">
              and is hereby awarded this diploma in recognition of their
              academic accomplishments.
            </p>

            {/* AWARDED THIS 24TH DAY OF APRIL 2024 */}
            <p className="text-sm tracking-[0.15em] text-[#2c1810] font-serif mb-8">
              AWARDED THIS 24TH DAY OF APRIL 2024
            </p>

            {/* SIGNED */}
            <p className="text-sm tracking-[0.2em] text-[#2c1810] font-serif mb-6">
              SIGNED
            </p>

            {/* Signatures */}
            <div className="flex justify-center items-start gap-20">
              {/* Registrar */}
              <div className="text-center">
                <div className="w-40 border-b border-[#2c1810] mb-1 h-12 flex items-end justify-center">
                  <span className="font-serif text-[#2c1810] text-sm tracking-widest italic">
                    Signature
                  </span>
                </div>
                <p className="text-xs tracking-[0.2em] text-[#2c1810] font-serif uppercase">
                  Registrar
                </p>
              </div>

              {/* Director */}
              <div className="text-center">
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

            {/* DIRECTOR (second line) */}
            <div className="text-center mt-1">
              <p className="text-xs tracking-[0.2em] text-[#2c1810] font-serif uppercase">
                DIRECTOR
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default CertificateTemplate;