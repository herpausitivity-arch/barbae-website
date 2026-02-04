
import React, { useState, useEffect } from 'react';
import { QuoteData, Plan } from '../types';

interface QuoteCalculatorProps {
  selectedPlan: Plan | null;
  onDataChange: (data: QuoteData) => void;
}

export const QuoteCalculator: React.FC<QuoteCalculatorProps> = ({ selectedPlan, onDataChange }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    email: '',
    phone: '',
    eventType: 'Private Event',
    guestCount: 50
  });

  useEffect(() => {
    onDataChange({
      ...formData,
      selectedPlan
    });
  }, [formData, selectedPlan, onDataChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'guestCount' ? parseInt(value) || 0 : value }));
  };

  const calculateTotal = () => {
    if (!selectedPlan) return 0;
    let total = selectedPlan.price;
    // Simple logic: add $5 per guest over 50
    if (formData.guestCount > 50) {
      total += (formData.guestCount - 50) * 5;
    }
    return total;
  };

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      <div className="space-y-6">
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Client Name</label>
          <input 
            type="text" 
            name="clientName"
            value={formData.clientName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-[#D4AF37] transition"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Email Address</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Event Type</label>
          <select 
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="w-full bg-zinc-900 border border-zinc-700 p-3 rounded text-white focus:outline-none focus:border-[#D4AF37] transition appearance-none"
          >
            <option>Wedding</option>
            <option>Corporate Gala</option>
            <option>Private Party</option>
            <option>Birthday Bash</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-semibold">Guest Count: {formData.guestCount}</label>
          <input 
            type="range" 
            name="guestCount"
            min="10" 
            max="300" 
            step="10"
            value={formData.guestCount}
            onChange={handleChange}
            className="w-full accent-[#D4AF37] bg-zinc-800 h-2 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <div className="bg-zinc-800 p-8 rounded-lg font-mono text-xs md:text-sm leading-relaxed border-l-4 border-[#D4AF37] shadow-2xl">
        <p className="text-[#D4AF37] mb-2 font-bold">// QUOTE LAYOUT START //</p>
        <div className="text-white space-y-1">
          <p><strong>CLIENT:</strong> {formData.clientName || '[Insert Name]'}</p>
          <p><strong>EMAIL:</strong> {formData.email || '[Insert Email]'}</p>
          <p><strong>PHONE:</strong> {formData.phone || '[Insert Phone]'}</p>
          <p><strong>EVENT TYPE:</strong> {formData.eventType}</p>
          <p><strong>GUEST COUNT:</strong> {formData.guestCount}</p>
          <p className="text-zinc-600">------------------------------------------</p>
          <p><strong>SELECTED PLAN:</strong> {selectedPlan?.name || '[None Selected]'}</p>
          <p><strong>BASE PRICE:</strong> ${selectedPlan?.price?.toLocaleString() || '0'}</p>
          <p><strong>ADD-ONS:</strong> {formData.guestCount > 50 ? `Large Group Fee (+$${((formData.guestCount - 50) * 5).toLocaleString()})` : 'None'}</p>
          <p className="text-zinc-600">------------------------------------------</p>
          <p className="text-xl mt-4 text-[#D4AF37]">
            <strong>TOTAL ESTIMATE: ${calculateTotal().toLocaleString()}</strong>
          </p>
        </div>
        <p className="text-[#D4AF37] mt-4 font-bold">// QUOTE LAYOUT END //</p>
        <p className="mt-4 text-[10px] text-zinc-500 italic">This is an automated estimation generated for Barbae Xperiance.</p>
      </div>
    </div>
  );
};
