// src/components/certificates/CertificateTemplate.jsx
"use client";

import { logo, stamp } from "@/public/img";
import html2canvas from "html2canvas";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const CertificateTemplate = ({ certificateData, program }) => {
  const certificateRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure component only renders on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format date from ISO string
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Get full name from certificate data or fallback
  const fullName =
    certificateData?.full_name || certificateData?.user?.name || "Recipient";

  // Get course title from certificate data or program
  const courseTitle =
    certificateData?.course_title || program?.title || "Course";

  // Get certificate code
  const certificateCode =
    certificateData?.certificate_code || certificateData?.code || "";

  // Get issued date
  const issuedDate =
    certificateData?.issued_at ||
    certificateData?.issued_date ||
    new Date().toISOString();

  // APPROACH 1: Using html2canvas with color fix
  const downloadCertificate = async () => {
    if (!certificateRef.current || !isClient) return;

    setIsDownloading(true);

    try {
      // Add a small delay to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Create a clone of the certificate with fixed colors
      const originalElement = certificateRef.current;
      const clone = originalElement.cloneNode(true);

      // Fix colors in clone
      const allElements = clone.querySelectorAll("*");
      allElements.forEach((el) => {
        // Fix inline styles
        if (el.style.color && el.style.color.includes("lab")) {
          el.style.color = "#000000";
        }
        if (
          el.style.backgroundColor &&
          el.style.backgroundColor.includes("lab")
        ) {
          el.style.backgroundColor = "#ffffff";
        }
        // Fix background
        if (el.style.background && el.style.background.includes("lab")) {
          el.style.background = "#ffffff";
        }
      });

      // Temporarily replace original with clone for rendering
      const parent = originalElement.parentNode;
      parent.replaceChild(clone, originalElement);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: 1100,
        height: 900,
        onclone: (clonedDoc) => {
          // Fix any lab() colors in cloned document
          const elements = clonedDoc.querySelectorAll("*");
          elements.forEach((el) => {
            // Check computed styles
            const computedStyle = window.getComputedStyle(el);

            // Fix color
            if (computedStyle.color && computedStyle.color.includes("lab")) {
              el.style.color = "#000000";
            }
            // Fix background color
            if (
              computedStyle.backgroundColor &&
              computedStyle.backgroundColor.includes("lab")
            ) {
              el.style.backgroundColor = "#ffffff";
            }
            // Fix border color
            if (
              computedStyle.borderColor &&
              computedStyle.borderColor.includes("lab")
            ) {
              el.style.borderColor = "#c9a84c";
            }
          });
        },
      });

      // Restore original element
      parent.replaceChild(originalElement, clone);

      // Create download link
      const link = document.createElement("a");
      link.download = `certificate-${certificateCode || "download"}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      // Fallback: Try with simpler options
      try {
        const canvas = await html2canvas(certificateRef.current, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          width: 1100,
          height: 780,
        });

        const link = document.createElement("a");
        link.download = `certificate-${certificateCode || "download"}.png`;
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
        alert(
          "Failed to download certificate. Please try using the print option (Ctrl+P) and save as PDF.",
        );
      }
    } finally {
      setIsDownloading(false);
    }
  };

  // Don't render on server to avoid hydration issues
  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#e8ddd0] flex items-center justify-center p-8">
        <div className="w-full max-w-7xl bg-[#FCFAF8] shadow-2xl p-5">
          <div className="text-center py-20">Loading certificate...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8ddd0] flex items-center justify-center p-8">
      <div className="w-full max-w-7xl bg-[#FCFAF8] shadow-2xl p-5 relative">
        {/* Download Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={downloadCertificate}
            disabled={isDownloading}
            className="bg-[#c9a84c] hover:bg-[#b8973a] text-white font-semibold py-2 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download Certificate
              </>
            )}
          </button>
        </div>

        {/* Certificate Content - with explicit colors to avoid lab() */}
        <div
          ref={certificateRef}
          className="bg-[#FCFAF8] shadow-2xl p-5 relative"
          style={{
            width: "1100px",
            maxWidth: "100%",
            backgroundColor: "#fcfaf8",
            color: "#000000",
          }}
        >
          {/* Decorative border frame */}
          <div
            className="border-4 border-[#c9a84c] p-8 relative"
            style={{ borderColor: "#c9a84c" }}
          >
            {/* Corner decorations */}
            <div
              className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-[#c9a84c]"
              style={{ borderColor: "#c9a84c" }}
            ></div>
            <div
              className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-[#c9a84c]"
              style={{ borderColor: "#c9a84c" }}
            ></div>
            <div
              className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-[#c9a84c]"
              style={{ borderColor: "#c9a84c" }}
            ></div>
            <div
              className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-[#c9a84c]"
              style={{ borderColor: "#c9a84c" }}
            ></div>

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
                    priority
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
                <div
                  className="h-[1px] w-12 bg-[#c9a84c]"
                  style={{ backgroundColor: "#c9a84c" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45"
                  style={{ backgroundColor: "#c9a84c" }}
                ></div>
                <div
                  className="h-[1px] w-8 bg-[#c9a84c]"
                  style={{ backgroundColor: "#c9a84c" }}
                ></div>
                <div
                  className="w-1.5 h-1.5 bg-[#c9a84c] rotate-45"
                  style={{ backgroundColor: "#c9a84c" }}
                ></div>
                <div
                  className="h-[1px] w-12 bg-[#c9a84c]"
                  style={{ backgroundColor: "#c9a84c" }}
                ></div>
              </div>

              {/* DIPLOMA CERTIFICATE */}
              <p
                className="text-4xl max-sm:text-2xl tracking-[0.13em] text-[#000] font-sans font-bold mb-6"
                style={{ color: "#000000" }}
              >
                DIPLOMA CERTIFICATE
              </p>

              {/* THIS IS TO CERTIFY THAT */}
              <p
                className="text-sm tracking-[0.19em] text-[#2c1810] font-sans mb-4"
                style={{ color: "#2c1810" }}
              >
                THIS IS TO CERTIFY THAT
              </p>

              {/* Recipient Name - with underline */}
              <div className="mb-4">
                <p
                  className="text-3xl md:text-2xl merienda-600 text-[#1a0f0a] border-b-2 border-[#c9a84c] inline-block px-12 pb-2"
                  style={{ color: "#1a0f0a", borderColor: "#c9a84c" }}
                >
                  {fullName}
                </p>
              </div>

              {/* has successfully completed the diploma program in */}
              <p
                className="text-base tracking-[0.1em] text-[#2c1810] font-serif mb-1"
                style={{ color: "#2c1810" }}
              >
                has successfully completed the diploma program in
              </p>

              {/* Course Title */}
              <p
                className="text-2xl md:text-2xl font-serif text-[#2c1810] tracking-[0.1em] mb-4"
                style={{ color: "#2c1810" }}
              >
                {courseTitle}
              </p>

              {/* and is hereby awarded this diploma in recognition of their academic accomplishments. */}
              <p
                className="text-base tracking-[0.05em] text-[#2c1810] font-serif leading-relaxed max-w-xl mx-auto mb-6"
                style={{ color: "#2c1810" }}
              >
                and is hereby awarded this diploma in recognition of their
                academic accomplishments.
              </p>

              {/* AWARDED THIS DATE */}
              <p
                className="text-sm tracking-[0.15em] text-[#8b6b2c] font-serif mb-8"
                style={{ color: "#8b6b2c" }}
              >
                AWARDED THIS {formatDate(issuedDate).toUpperCase()}
              </p>

              {/* Signatures with Stamp Overlay */}
              <div className="relative w-[60%] max-lg:w-full mx-auto p-4">
                <div className="flex justify-between items-center max-sm:flex-col w-full gap-20 relative">
                  {/* Registrar */}
                  <div className="text-center">
                    <p
                      className="text-sm tracking-[0.2em] mb-2 text-[#2c1810] font-serif"
                      style={{ color: "#2c1810" }}
                    >
                      SIGNED
                    </p>
                    <hr />
                    <div className="w-40 mb-2 h-12 flex items-end justify-center">
                      <span
                        className="font-serif text-[#2c1810] text-sm tracking-widest merienda-500 italic"
                        style={{ color: "#2c1810" }}
                      >
                        Signature
                      </span>
                    </div>
                    <hr />
                    <p
                      className="text-xs mt-4 tracking-[0.2em] text-[#2c1810] font-serif uppercase"
                      style={{ color: "#2c1810" }}
                    >
                      Registrar
                    </p>
                  </div>

                  {/* Stamp - Positioned in the center between signatures */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-50 max-sm:w-25 h-30 relative opacity-70">
                      <Image
                        src={stamp}
                        alt="Institute Stamp"
                        fill
                        className="object-contain"
                        style={{ objectFit: "contain" }}
                        sizes="200px"
                      />
                    </div>
                  </div>

                  {/* Director */}
                  <div className="text-center">
                    <p
                      className="text-xs tracking-[0.2em] mb-2 text-[#2c1810] font-serif uppercase"
                      style={{ color: "#2c1810" }}
                    >
                      DIRECTOR
                    </p>
                    <hr />
                    <div className="w-40 mb-2 h-12 flex items-end justify-center">
                      <span
                        className="font-serif text-[#2c1810] text-sm tracking-widest merienda-500 italic"
                        style={{ color: "#2c1810" }}
                      >
                        Signature
                      </span>
                    </div>
                    <hr />
                    <p
                      className="text-xs mt-4 tracking-[0.2em] text-[#2c1810] font-serif uppercase"
                      style={{ color: "#2c1810" }}
                    >
                      Director
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer with verification link */}
              {certificateCode && (
                <div className="mt-8 pt-4 border-t border-[#c9a84c]/30 text-center">
                  <p className="text-[10px] text-gray-400 tracking-wider">
                    Verify at:{" "}
                    {typeof window !== "undefined"
                      ? window.location.origin
                      : ""}
                    /certificates/verify/{certificateCode}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateTemplate;