import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'ASIM Super NPK',
    category: 'Macronutrient',
    description: 'ASIM Super NPK is a premium balanced fertilizer providing essential macronutrients for all-round crop development. It ensures robust stem and root growth, improved flowering, and higher crop yields. Ideal for most field crops including wheat, rice, maize, and vegetables.',
    shortDescription: 'Balanced NPK formula for optimal crop growth and yield.',
    imageUrl: 'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1200,
    nutrients: {
      nitrogen: 15,
      phosphorus: 15,
      potassium: 15
    },
    applicationMethod: 'Apply 2-3 kg per acre directly to soil before sowing or as top dressing.',
    benefits: [
      'Balanced nutrition for all growth stages',
      'Improved root and shoot development',
      'Enhanced flowering and fruiting',
      'Higher yield potential'
    ],
    stockAvailability: true
  },
  {
    id: '2',
    name: 'ASIM Nitrogen Plus',
    category: 'Macronutrient',
    description: 'ASIM Nitrogen Plus is a high-nitrogen fertilizer designed to boost vegetative growth and leaf development. With enhanced nitrogen efficiency, it provides sustained release for longer availability to plants. Perfect for leafy vegetables, cereal crops, and during early growth stages.',
    shortDescription: 'High-nitrogen formula for lush vegetative growth.',
    imageUrl: 'https://images.pexels.com/photos/2286895/pexels-photo-2286895.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 950,
    nutrients: {
      nitrogen: 46,
      phosphorus: 0,
      potassium: 0
    },
    applicationMethod: 'Apply 1-2 kg per acre as top dressing during vegetative growth phase.',
    benefits: [
      'Rapid green-up of crops',
      'Enhanced leaf development',
      'Increased protein content in grains',
      'Improved overall growth'
    ],
    stockAvailability: true
  },
  {
    id: '3',
    name: 'ASIM Phosphate Gold',
    category: 'Macronutrient',
    description: 'ASIM Phosphate Gold is a premium phosphorus-rich fertilizer that promotes strong root development and energy transfer in plants. It enhances flowering, fruiting, and seed formation, leading to improved crop quality and yield. Especially beneficial for fruit trees, flowering crops, and root vegetables.',
    shortDescription: 'Phosphorus-rich formula for strong roots and abundant fruits.',
    imageUrl: 'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1100,
    nutrients: {
      nitrogen: 0,
      phosphorus: 45,
      potassium: 0
    },
    applicationMethod: 'Apply 2 kg per acre before sowing or transplanting, ensuring good soil incorporation.',
    benefits: [
      'Enhanced root development',
      'Improved flowering and fruit set',
      'Better seed quality',
      'Enhanced disease resistance'
    ],
    stockAvailability: true
  },
  {
    id: '4',
    name: 'ASIM Micronutrient Mix',
    category: 'Micronutrient',
    description: 'ASIM Micronutrient Mix is a carefully formulated blend of essential micronutrients including zinc, iron, manganese, copper, boron, and molybdenum. It prevents and corrects micronutrient deficiencies to ensure optimal plant metabolism and enzymatic functions. Suitable for all crops, especially in soils with known micronutrient deficiencies.',
    shortDescription: 'Complete micronutrient blend for preventing deficiencies.',
    imageUrl: 'https://images.pexels.com/photos/4505168/pexels-photo-4505168.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1500,
    nutrients: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 0,
      otherNutrients: {
        zinc: 4,
        iron: 3.5,
        manganese: 2.5,
        copper: 1,
        boron: 0.5,
        molybdenum: 0.1
      }
    },
    applicationMethod: 'Apply 0.5-1 kg per acre as foliar spray or soil application as preventive or at first signs of deficiency.',
    benefits: [
      'Prevention of micronutrient deficiencies',
      'Enhanced chlorophyll formation',
      'Improved metabolic processes',
      'Better crop quality and yield'
    ],
    stockAvailability: true
  },
  {
    id: '5',
    name: 'ASIM Potash Supreme',
    category: 'Macronutrient',
    description: 'ASIM Potash Supreme is a concentrated potassium fertilizer designed to enhance crop quality, stress tolerance, and disease resistance. It improves water regulation, sugar transport, and starch formation in plants. Ideal for fruits, vegetables, and crops in flowering and fruiting stages.',
    shortDescription: 'Potassium-rich formula for quality and stress tolerance.',
    imageUrl: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1050,
    nutrients: {
      nitrogen: 0,
      phosphorus: 0,
      potassium: 60
    },
    applicationMethod: 'Apply 1-2 kg per acre as side dressing or through irrigation systems during flowering and fruiting stages.',
    benefits: [
      'Improved fruit quality and size',
      'Enhanced drought and disease resistance',
      'Better storage life of produce',
      'Increased efficiency of other nutrients'
    ],
    stockAvailability: true
  },
  {
    id: '6',
    name: 'ASIM Organic All-Purpose',
    category: 'Organic',
    description: 'ASIM Organic All-Purpose is a certified organic fertilizer made from premium plant and animal sources. It provides balanced nutrition while improving soil health and microbial activity. The slow-release formula ensures nutrients are available throughout the growing season. Perfect for organic farming and all types of crops.',
    shortDescription: 'Certified organic fertilizer for sustainable farming.',
    imageUrl: 'https://images.pexels.com/photos/4207466/pexels-photo-4207466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    price: 1800,
    nutrients: {
      nitrogen: 5,
      phosphorus: 5,
      potassium: 5
    },
    applicationMethod: 'Apply 5-10 kg per acre to soil before planting or as top dressing during growing season.',
    benefits: [
      'Improved soil structure and health',
      'Enhanced microbial activity',
      'Slow-release nutrition throughout season',
      'Environmentally sustainable'
    ],
    stockAvailability: true
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getAllCategories = (): string[] => {
  return [...new Set(products.map(product => product.category))];
};