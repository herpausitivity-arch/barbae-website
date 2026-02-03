
import { SiteContent } from './types';

export const INITIAL_CONTENT: SiteContent = {
  heroTitle: "Liquid Artistry",
  heroSubtitle: "Premium mixology experiences where Hot Pink vibrance meets Gold sophistication.",
  aboutTitle: "Vibrant Mastery",
  aboutImage: "https://images.unsplash.com/photo-1574096079513-d8259312b785?auto=format&fit=crop&q=80&w=1200",
  aboutText1: "Founded in 2012, Elite Mixology was born from the desire to fuse the electric energy of high-end clubs with the meticulous craft of artisanal cocktail bars.",
  aboutText2: "Our signature Hot Pink palette represents our passion and energy, while our Gold standards ensure every client receives nothing less than perfection.",
  aboutText3: "We don't just pour drinks; we design atmosphere. From custom neon-lit bar setups to edible gold-leaf garnishes, every event is a masterpiece of modern luxury.",
  missionStatement: "To transcend the traditional bar experience by orchestrating moments of liquid brilliance through uncompromising craft and vibrant aesthetic innovation.",
  gallery: [
    { 
      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200', 
      title: 'Corporate Galas', 
      size: 'col-span-2 row-span-2' 
    },
    { 
      url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=1200', 
      title: 'Luxury Weddings', 
      size: 'col-span-2 row-span-2' 
    },
    { 
      url: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&q=80&w=1200', 
      title: 'Artisanal Craft', 
      size: 'col-span-2 row-span-2' 
    },
    { 
      url: 'https://images.unsplash.com/photo-1481653125770-b78c206c59d4?auto=format&fit=crop&q=80&w=1200', 
      title: 'Private Speakeasy', 
      size: 'col-span-2 row-span-2' 
    },
    { 
      url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&q=80&w=1200', 
      title: 'Rooftop Lounge', 
      size: 'col-span-2 row-span-2' 
    },
  ],
  socialFeed: [
    { id: 1, url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600', likes: '1.2k', comments: '45' },
    { id: 2, url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=600', likes: '890', comments: '12' },
    { id: 3, url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=600', likes: '2.1k', comments: '88' },
    { id: 4, url: 'https://images.unsplash.com/photo-1578496449938-fcc376f29f81?auto=format&fit=crop&q=80&w=600', likes: '1.5k', comments: '34' },
    { id: 5, url: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80&w=600', likes: '3.4k', comments: '120' },
    { id: 6, url: 'https://images.unsplash.com/photo-1544145945-f904253d0c71?auto=format&fit=crop&q=80&w=600', likes: '945', comments: '21' },
  ],
  testimonials: [
    {
      name: "Alexandra Vanderbilt",
      event: "High-Fashion Launch",
      text: "Elite Mixology transformed our showroom launch into a multi-sensory experience. The level of detail in their smoke-infused garnishes left our guests speechless."
    },
    {
      name: "Marcus Sterling",
      event: "Corporate Gala",
      text: "Professionalism redefined. Their mixologists aren't just bartenders; they are performers who command the room while serving world-class cocktails."
    },
    {
      name: "Sienna Richards",
      event: "Private Estate Wedding",
      text: "From the first tasting to the wedding night, the service was gold-standard. They customized every drink to match our floral theme perfectly."
    }
  ],
  plans: [
    {
      id: 'classic',
      name: 'The Classic Lounge',
      description: 'Standard 4-hour service focusing on 3 signature cocktails, wine, and beer service.',
      price: 499,
      features: [
        '1 Professional Bartender',
        'Basic Bar Tools & Setup',
        'Custom Menu Consultation'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Gala',
      description: 'Full mixology experience with artisanal syrups, garnishes, and 5 signature drinks.',
      price: 899,
      popular: true,
      features: [
        '2 Professional Bartenders',
        'Artis artisanal Ingredients',
        'Ice & Glassware Management'
      ]
    },
    {
      id: 'vip',
      name: 'VIP Black Tie',
      description: 'The ultimate experience. Unlimited cocktails, champagne toast, and smoke infusion bar.',
      price: 1499,
      features: [
        'Lead Mixologist + Bar Back',
        'Dry Ice & Smoke Effects',
        'Premium Glassware Included'
      ]
    }
  ],
  recipe: {
    name: "The Midnight Bloom",
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=1200",
    description: "Our signature seasonal cocktail. A floral-forward gin masterpiece with a deep magenta hue and a touch of gold sophistication.",
    ingredients: [
      "2.0 oz Premium London Dry Gin",
      "0.75 oz Artisanal Hibiscus Syrup",
      "0.75 oz Freshly Squeezed Lemon Juice",
      "2 dashes Orange Bitters",
      "Egg White (Optional, for texture)",
      "Edible Gold Leaf garnish"
    ],
    instructions: [
      "Combine all liquid ingredients in a cocktail shaker.",
      "If using egg white, dry shake without ice for 15 seconds to emulsify.",
      "Add high-quality large ice cubes and shake vigorously for 12 seconds until chilled.",
      "Double strain into a chilled coupe or martini glass.",
      "Gently place a fragment of edible gold leaf on the foam.",
      "Express a lemon twist over the surface and discard."
    ]
  },
  privacyPolicy: "At Elite Mixology, we value your privacy. We only collect essential information required to fulfill your bespoke mixology inquiries. Your data is never sold to third parties and is used exclusively for internal booking and communication purposes.",
  termsAndConditions: "All Elite Mixology bookings require a 50% deposit to secure your date. Full payment is due 7 days prior to the event. Cancellations made within 48 hours of the event are non-refundable due to the custom nature of our artisanal preparations."
};
