export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  price: number;
  nutrients: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    otherNutrients?: Record<string, number>;
  };
  applicationMethod: string;
  benefits: string[];
  stockAvailability: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  location: string;
  text: string;
  rating: number;
  photoUrl?: string;
}

export interface DealerLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}