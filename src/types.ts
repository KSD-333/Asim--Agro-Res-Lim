export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  sizes: string[];
  imageUrl: string;
  category: string;
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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: Date;
} 