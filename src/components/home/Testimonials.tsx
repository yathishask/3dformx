import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Dr. Raghavendra Sharma',
    role: 'Lead Propulsion Engineer',
    company: 'SkyLoom Aerospace, Bengaluru',
    quote: 'The FormX Apex-7 CoreXY printer is an outstanding piece of engineering. We run AeroCarbon PEEK at 400°C continuously without heat creep or nozzle jams. The on-site setup team in Bengaluru was exceptional.',
    rating: 5,
    verified: true
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Head of Robotics Prototyping',
    company: 'VoltDynamics Labs, Pune',
    quote: 'TitanPoly PA12-CF has replaced machined aluminum in 80% of our drone arm assemblies. The matte texture hides layer lines completely, and parts withstand severe impact testing. Highly recommend 3D FormX.',
    rating: 5,
    verified: true
  },
  {
    name: 'Dr. Vikramaditya Reddy',
    role: 'Chief Prosthodontist & Implantologist',
    company: 'Apex BioDental Clinic, Hyderabad',
    quote: 'Phantasm 8K dental surgical guides print down to 24 microns with incredible repeatability. Being able to get 18% GST input credit and fast courier delivery to Hyderabad makes FormX our permanent hardware partner.',
    rating: 5,
    verified: true
  }
];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-dark-900 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
            VERIFIED INDUSTRY FEEDBACK
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
            Trusted by Indian Engineers & Labs
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Over 1,200+ machines and 15,000+ spools deployed across research institutions, aerospace start-ups, and dental centers in India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between p-7 rounded-2xl bg-dark-950/70 border border-slate-800 relative hover:border-slate-700 transition-all duration-300"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-slate-800" />
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white font-heading">{t.name}</h4>
                  {t.verified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase font-mono">
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-orange font-medium mt-0.5">{t.role}</p>
                <p className="text-xs text-slate-500">{t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
