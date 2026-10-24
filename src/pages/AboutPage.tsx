import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Cpu, ArrowRight, Award, MapPin, Mail, Phone, Clock } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark-950 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
            ENGINEERED FOR EXCELLENCE
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2 mb-4 font-heading">
            About 3D FormX
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Pioneering industrial-grade additive manufacturing hardware, aerospace composite filaments, and optical metrology solutions across India.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 font-heading">
              Transforming Indian Rapid Prototyping
            </h2>
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <p>
                Founded by additive manufacturing engineers, 3D FormX was created to solve a persistent challenge in India’s hardware ecosystem: the lack of accessible, high-speed industrial 3D printing equipment capable of running high-temperature engineering polymers without frequent failures or costly import delays.
              </p>
              <p>
                Today, our flagship <strong className="text-white">Apex-7 CoreXY</strong> machines, <strong className="text-white">AeroCarbon™ PEEK</strong> spools, and <strong className="text-white">Phantasm 8K</strong> SLA systems power prototyping divisions at leading aerospace labs, automotive tier-1 suppliers, robotics ventures, and dental clinics throughout India.
              </p>
              <p>
                Every unit sold is backed by our dedicated testing facility, ensuring immediate local spare part availability, doorstep technical support, and authentic product certification.
              </p>
            </div>

            <div className="pt-6">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors"
              >
                <span>Explore Our Catalog</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl overflow-hidden border border-slate-800 bg-dark-900 p-2 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1000&q=80"
                alt="FormX Lab Facility"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Pillars / Core Commitments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 rounded-2xl bg-dark-900 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center mb-5">
              <Cpu size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-heading">
              Sub-Micron Calibration
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Our hardware utilizes precision ground linear guide rails and dual LiDAR active leveling to guarantee 0.005mm mechanical repeatability.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-dark-900 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center mb-5">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-heading">
              Traceable Materials
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every spool of AeroCarbon and TitanPoly includes technical TDS/MSDS certifications and RFID calibration tags for zero guesswork.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-dark-900 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center mb-5">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-heading">
              1-Year India Warranty
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Direct technical troubleshooting by Indian hardware engineers with fast warranty turnaround and genuine spare stock.
            </p>
          </div>
        </div>

        {/* Contact & Facility Location Card */}
        <div className="rounded-3xl bg-dark-900 border border-slate-800 p-8 sm:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
                HEADQUARTERS & DISTRIBUTION
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-4 font-heading">
                Visit or Contact Our Technical Center
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Have high-volume batch requirements, corporate procurement inquiries, or custom filament compounding needs? Reach out to our engineers.
              </p>

              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-brand-orange mt-0.5 flex-shrink-0" />
                  <span>Siddharthnagar, Mysore - 570029, Karnataka</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-brand-orange flex-shrink-0" />
                  <a
                    href="https://wa.me/916363204351"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    +91 6363204351
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-brand-orange flex-shrink-0" />
                  <a
                    href="mailto:support@3dformx.in"
                    className="hover:text-white transition-colors"
                  >
                    support@3dformx.in
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-brand-orange flex-shrink-0" />
                  <span>Monday - Saturday: 9:30 AM to 6:30 PM IST</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-850 border border-slate-800 text-center flex flex-col items-center justify-center">
              <h3 className="text-lg font-bold text-white mb-2 font-heading">
                Need an Enterprise Fleet Quote?
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                We provide pilot batch deployment, on-site staff training, and custom pricing for 5+ machines.
              </p>
              <a
                href="mailto:support@3dformx.in"
                className="px-6 py-3 rounded-xl bg-brand-orange text-black font-extrabold text-xs uppercase tracking-wider hover:bg-brand-orange-hover transition-colors shadow-lg shadow-brand-orange/20"
              >
                Request Enterprise Pricing
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
