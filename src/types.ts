export interface Product {
  id: string;
  name: string;
  description: string;
  sizes: string[];
  imageUrl: string;
  category: string;
  nutrients?: {
    nitrogen?: number;
    phosphorus?: number;
    potassium?: number;
    otherNutrients?: {
      zinc?: number;
      iron?: number;
      manganese?: number;
      copper?: number;
      boron?: number;
      molybdenum?: number;
    };
  };
} 