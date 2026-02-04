
import { SiteContent } from './types';

export const INITIAL_CONTENT: SiteContent = {
  heroTitle: "Liquid Artistry",
  heroSubtitle: "Premium mixology experiences where Hot Pink vibrance meets Gold sophistication.",
  aboutTitle: "Book The Xperiance!",
  aboutImage: "/Barbae Founder.png",
  aboutText1: "Welcome to the Barbae Xperience Booking Form, your gateway to bringing an exclusive, unforgettable experience. No matter the occasion - whether it is a private event, wedding reception, or corporate gathering - our skilled bartenders from Barbae are poised to enhance your experience with their expertise in crafting signature cocktails and delivering impeccable service.",
  aboutText2: "Utilize our streamlined booking form for a hassle-free process in securing bartending services for your event and let the Barbae team take care of the rest. We can't wait to cater to you and make your event truly memorable!",
  aboutText3: "",
  missionStatement: "The Spirit Behind Barbae\n\nAt Barbae LLC, we believe a great drink can bring people together but it's the experience that makes it unforgettable. We're more than bartenders; we're hosts, listeners, and vibe curators who take pride in delivering top tier service every time.\n\nWhether it's a wedding, birthday, or corporate gathering, we bring style, professionalism, and a friendly face behind the bar.\n\nGreat Drinks. Good Vibes. Spectacular Service.\n\nThat's the Barbae Experience!",
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
      name: "Khadine Walker",
      event: "Wedding",
      timeframe: "2 weeks ago",
      text: "We couldn't be happier with the bartender we had for our wedding! She was absolutely amazing—professional, efficient, and genuinely kind. She handled the bar effortlessly, kept lines moving, and always had a smile on her face. Our guests repeatedly told us how pleasant she was and how much they enjoyed interacting with her. She truly added to the overall experience of our wedding, and we would highly recommend her to anyone looking for a top-notch bartender."
    },
    {
      name: "Crystal Clarke",
      event: "Graduation Dinner Party",
      timeframe: "4 months ago",
      text: "Fantastic! Remarkable! Professional! Impeccable communication skills. Her mannerism is one to talk about. Very sweet and humble. Very attentive to the guests. Don't get me started on the way she designed my signature drink menu which included unique names for each one of them. I enjoyed planning my graduation dinner party with Rene. I look forward to working with you again. You made it fun and easy. See you soon!"
    },
    {
      name: "Carole Pierre",
      event: "40th Birthday Celebration",
      timeframe: "3 months ago",
      text: "I cannot say enough amazing things about these bartenders! They made my 40th birthday unforgettable. They created a custom drink menu with my specialty drinks, incorporated my green color scheme, and even added my picture - such a thoughtful, personal touch! Throughout the event, they were professional, quick, and consistent with every order. They genuinely cared about keeping the energy high and the good vibes flowing all night long. They didn't just serve drinks - they helped create an atmosphere that made my celebration truly special. If you're looking for talented, reliable bartenders who bring amazing energy, book them immediately. They are phenomenal! Thank you for making my milestone birthday unforgettable!"
    }
  ],
  plans: [
    {
      id: 'classic',
      name: 'Classic',
      description: '',
      price: 300,
      features: [
        'Up to 50 Guest',
        '4 Hours of Service',
        '1 Bartender',
        'Custom Drink Menu (3 Options)',
        'Cups, Napkins, Straws',
        'Garnishes (3)'
      ],
      serving: [
        'Signature Cocktails',
        'Craft Mocktails',
        'Frozen Slushies'
      ]
    },
    {
      id: 'signature',
      name: 'Signature',
      description: '',
      price: 550,
      popular: true,
      features: [
        'Up to 100 Guest',
        '5 Hours of Service',
        '2 Bartenders',
        'Custom Drink Menu (4 Options)',
        'Cups, Napkins, Straws',
        'Garnishes (4)',
        'Mixers (2)',
        'Mobile Bar'
      ]
    },
    {
      id: 'elite',
      name: 'Elite',
      description: '',
      price: 750,
      features: [
        'Up to 175 Guest',
        '5 Hours of Service',
        '3 Bartenders',
        'Custom Drink Menu (5 Options)',
        'Cups, Napkins, Straws',
        'Garnishes (5)',
        'Mixers (5)',
        'Ice',
        'Mobile Bar',
        'Bar Setup/Cleanup'
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
  privacyPolicy: "At Barbae Xperiance, we value your privacy. We only collect essential information required to fulfill your bespoke mixology inquiries. Your data is never sold to third parties and is used exclusively for internal booking and communication purposes.",
  termsAndConditions: "All Barbae Xperiance bookings require a 50% deposit to secure your date. Full payment is due 7 days prior to the event. Cancellations made within 48 hours of the event are non-refundable due to the custom nature of our artisanal preparations."
};
