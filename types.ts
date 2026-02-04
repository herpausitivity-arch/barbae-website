
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
  serving?: string[];
}

export interface GalleryImage {
  url: string;
  title: string;
  size: string;
}

export interface SocialPost {
  id: number;
  url: string;
  likes: string;
  comments: string;
}

export interface Testimonial {
  name: string;
  event: string;
  text: string;
  timeframe?: string;
}

export interface CocktailRecipe {
  name: string;
  image: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle: string;
  aboutImage: string;
  aboutText1: string;
  aboutText2: string;
  aboutText3: string;
  missionStatement: string;
  gallery: GalleryImage[];
  socialFeed: SocialPost[];
  testimonials: Testimonial[];
  plans: Plan[];
  recipe: CocktailRecipe;
  privacyPolicy: string;
  termsAndConditions: string;
}

export interface Inquiry {
  id: string;
  timestamp: string;
  fullName: string;
  email: string;
  eventName: string;
  startTime: string;
  category: string;
  capacity: string;
  budget: string;
  description: string;
  eventDate: string;
  notes?: string;
}

export interface QuoteData {
  clientName: string;
  email: string;
  phone: string;
  eventType: string;
  guestCount: number;
  selectedPlan: Plan | null;
}
