
import React from 'react';
import { Plan } from '../types';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  isSelected: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect, isSelected }) => {
  return (
    <div 
      className={`card-border p-8 rounded-2xl bg-zinc-950/50 flex flex-col h-full relative transition-all duration-500 ${
        plan.popular ? 'md:scale-105 border-pink-500/50 shadow-[0_0_30px_rgba(255,105,180,0.1)]' : ''
      } ${isSelected ? 'ring-2 ring-[#FF69B4]' : ''}`}
    >
      {plan.popular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FF69B4] text-white text-[10px] font-bold py-1.5 px-6 rounded-full uppercase tracking-widest shadow-lg">
          Exclusive Selection
        </div>
      )}
      
      <h3 className="text-2xl font-serif text-white mb-4 group-hover:text-[#FF69B4] transition-colors">{plan.name}</h3>
      <p className="text-gray-400 mb-6 text-sm flex-grow font-light leading-relaxed">{plan.description}</p>
      
      <div className="text-4xl font-bold mb-8 font-serif pink-gold-text">
        ${plan.price.toLocaleString()}
      </div>
      
      <ul className="text-left text-sm text-gray-400 space-y-4 mb-10">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <span className="text-[#D4AF37] mr-3 mt-1">✦</span>
            {feature}
          </li>
        ))}
      </ul>
      
      <button 
        onClick={() => onSelect(plan)}
        className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all duration-300 ${
          plan.popular 
            ? 'btn-hotpink' 
            : 'border border-[#FF69B4]/40 text-[#FF69B4] hover:bg-[#FF69B4] hover:text-white'
        }`}
      >
        {isSelected ? 'Inquiry Started' : 'Select Experience'}
      </button>
    </div>
  );
};