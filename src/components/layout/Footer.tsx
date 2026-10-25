import React from 'react';
import { Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-950 border-t border-slate-800/80 text-slate-300 py-12 px-4 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-3.5">
        {/* Social Icon: Instagram */}
        <div className="flex items-center justify-center mb-1">
          <a
            href="https://www.instagram.com/3dformx/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow 3D FormX on Instagram"
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40"
          >
            <Instagram size={20} className="stroke-[2.2]" />
          </a>
        </div>

        {/* Company Name in Bold */}
        <h3 className="text-base sm:text-lg font-extrabold text-white tracking-wide font-heading">
          3D FormX
        </h3>

        {/* Address */}
        <p className="text-sm text-slate-300">
          Mysuru, Karnataka - 570029
        </p>

        {/* Contact Number */}
        <p className="text-sm">
          <a
            href="tel:+916363204351"
            className="text-slate-300 hover:text-brand-orange transition-colors"
          >
            +91 6363204351
          </a>
        </p>

        {/* Copyrights */}
        <div className="pt-4 text-xs text-slate-400">
          <p>Copyrights - 2026 3D FormX - All Right Reserved.</p>
        </div>
      </div>
    </footer>
  );
};
