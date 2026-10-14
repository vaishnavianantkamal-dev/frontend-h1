import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ExternalLink, Download } from "lucide-react";
import CertificatePDF from "../assets/KPLONE & COMPANY PRIVATE LIMITED.pdf";
import RecognitionCertificate from "../assets/Certificate of Recognition.pdf";
import ISOImage from "../assets/ISO_IMAGE.png";
import StartLogo from "../assets/about_india.png";

export default function AboutUs() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <main className="pb-20">
        {/* Hero Section */}
        <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#3d8bff_0%,transparent_70%)]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                About Hobit1
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                KPLONE & COMPANY PRIVATE LIMITED (Hobit1) is India's
                fastest-growing on-demand home service platform, dedicated to
                bringing professional help to your doorstep with just a tap.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Company Description & Certificates */}
        <section className="py-20 container mx-auto px-4">
          <div className="space-y-16">
            {/* Our Story Section - Centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-slate-600 leading-relaxed text-lg">
                <p>
                  Founded with a vision to revolutionize the unorganized home
                  services sector in India, Hobit1 provides a seamless interface
                  between customers and high-quality service professionals.
                </p>
                <p>
                  Under the legal entity{" "}
                  <strong>KPLONE & COMPANY PRIVATE LIMITED</strong>, we ensure
                  that every service delivered meets our stringent quality
                  standards, providing peace of mind and reliability to
                  thousands of households.
                </p>
                <p>
                  From deep cleaning and pest control to painting, electrical,
                  plumbing and carpentry work in Nashik, we are committed to
                  making life easier for our users while creating sustainable
                  livelihood opportunities for our service partners.
                </p>
              </div>
            </motion.div>

            {/* Company Documents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-8">
                Company Documents
              </h3>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                {/* Certificate of Incorporation */}
                <div className="flex flex-col items-center space-y-4">
                  <a
                    href={CertificatePDF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full max-w-sm aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center transition-all hover:border-[#3d8bff] hover:bg-blue-50/30 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex flex-col items-center text-center p-8">
                      <div className="w-full h-64 rounded-xl overflow-hidden shadow-md transition-transform group-hover:scale-105 duration-300">
                        <img
                          src={ISOImage}
                          alt="ISO 9001:2015 Certificate"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center mt-6 px-8">
                      <h4 className="font-bold text-slate-900 mb-2 text-lg">
                        An ISO 9001:2015 Certified Company
                      </h4>
                      <p className="text-sm text-slate-500 mb-6">
                        KPLONE & COMPANY PRIVATE LIMITED (Parent Company of HOBIT)
                      </p>

                      <div className="flex items-center gap-2 text-[#3d8bff] font-semibold text-sm group-hover:underline transition-all duration-300">
                        <ExternalLink className="w-4 h-4" />
                        Click to View PDF
                      </div>
                    </div>
                  </a>
                </div>

                {/* Certificate of Recognition */}
                <div className="flex flex-col items-center space-y-4">
                  <a
                    href={RecognitionCertificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative w-full max-w-sm aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center transition-all hover:border-[#3d8bff] hover:bg-blue-50/30 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative z-10 flex flex-col items-center text-center p-8">
                      <div className="w-full h-64 rounded-xl overflow-hidden shadow-md transition-transform group-hover:scale-105 duration-300">
                        <img
                          src={StartLogo}
                          alt="Certificate of Recognition"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center text-center mt-6 px-8">
                      <h4 className="font-bold text-slate-900 mb-2 text-lg">
                        Certificate of Recognition
                      </h4>
                      <p className="text-sm text-slate-500 mb-6">
                        KPLONE & COMPANY PRIVATE LIMITED (Parent Company of HOBIT)
                      </p>

                      <div className="flex items-center gap-2 text-[#3d8bff] font-semibold text-sm group-hover:underline transition-all duration-300">
                        <ExternalLink className="w-4 h-4" />
                        Click to View PDF
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
     
    </div>
  );
}
