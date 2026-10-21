import React from 'react';
import { ShieldCheck, Truck, Receipt, Cpu, Headphones, Award } from 'lucide-react';

const PILLARS = [
  {
    icon: Truck,
    title: 'Pan-India Express Air Cargo',
    description: 'Orders placed before 2 PM dispatch same-day from Bengaluru & Mumbai logistics hubs with Bluedart Air.'
  },
  {
    icon: ShieldCheck,
    title: '1-Year Official Warranty',
    description: 'Comprehensive motherboard and motion system warranty with doorstep technician support in Tier 1 & 2 cities.'
  },
  {
    icon: Receipt,
    title: '18% GST Input Credit',
    description: 'Automatic B2B GST tax invoices provided on every order. Claim full corporate input tax credits seamlessly.'
  },
  {
    icon: Cpu,
    title: 'Sub-Micron Calibration',
    description: 'Every FormX 3D printer undergoes factory optical laser bed leveling and multi-point extrusion calibration.'
  },
  {
    icon: Headphones,
    title: 'Engineer-Led Support',
    description: 'Direct phone & WhatsApp technical consultation from additive manufacturing specialists, not bot scripts.'
  },
  {
    icon: Award,
    title: 'Aerospace Certified Polymers',
    description: 'Every composite spool is vacuum-sealed with humidity indicator cards and traceable material batch numbers.'
  }
];

export const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-20 bg-dark-950 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-orange font-mono">
            THE 3D FORMX ADVANTAGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
            Why Engineering Studios Choose FormX
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            We bridge industrial-grade additive technology with local Indian reliability, fast spare availability, and transparent pricing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={idx}
                className="flex flex-col p-6 rounded-2xl bg-dark-900/60 border border-slate-800 hover:border-slate-700 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-orange/15 border border-brand-orange/30 text-brand-orange flex items-center justify-center mb-5">
                  <IconComponent size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2 font-heading">
                  {pillar.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
