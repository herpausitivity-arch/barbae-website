
import React from 'react';

export const ServicesRibbon: React.FC = () => {
  const services = [
    "PRIVATE EVENTS",
    "CORPORATE EVENTS",
    "BABY SHOWERS",
    "BIRTHDAY PARTIES",
    "SPECIAL CELEBRATIONS & MORE"
  ];

  return (
    <div className="relative w-full py-16 mb-12 overflow-hidden">
      {/* Skewed Background Wrapper */}
      <div 
        className="absolute inset-0 bg-black border-y border-[#D4AF37] transform -skew-y-2 z-0 shadow-[0_0_30px_rgba(212,175,55,0.1)]"
        style={{ height: '110%', top: '-5%' }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-[#D4AF37] font-serif text-3xl md:text-4xl tracking-[0.3em] uppercase mb-8 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
          SPECIALIZE IN
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4">
          {services.map((service, index) => (
            <React.Fragment key={index}>
              <span className="text-white text-[10px] md:text-xs font-bold tracking-[0.4em] hover:text-[#FF69B4] transition-colors cursor-default">
                {service}
              </span>
              {index < services.length - 1 && (
                <div className="hidden md:block w-1.5 h-1.5 bg-[#D4AF37] rotate-45 opacity-50"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
