import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Info, Star } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="card h-full flex flex-col group">
      <div className="relative overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-56 object-cover transform transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 right-4 bg-accent-500 text-secondary-800 text-xs font-bold px-2 py-1 rounded">
          {product.category}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="text-xl font-semibold mb-2 text-primary-900">{product.name}</h3>
        <p className="text-gray-600 mb-4 flex-grow">{product.shortDescription}</p>
        
        <div className="flex items-center space-x-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-accent-500 fill-accent-500" />
          ))}
          <span className="text-gray-600 text-sm ml-1">5.0</span>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              N: {product.nutrients.nitrogen}%
            </span>
            <span className="text-sm font-medium text-gray-700">
              P: {product.nutrients.phosphorus}%
            </span>
            <span className="text-sm font-medium text-gray-700">
              K: {product.nutrients.potassium}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="flex h-full">
              <div 
                className="bg-blue-500"
                style={{ width: `${product.nutrients.nitrogen * 100 / (product.nutrients.nitrogen + product.nutrients.phosphorus + product.nutrients.potassium)}%` }}
              ></div>
              <div 
                className="bg-green-500"
                style={{ width: `${product.nutrients.phosphorus * 100 / (product.nutrients.nitrogen + product.nutrients.phosphorus + product.nutrients.potassium)}%` }}
              ></div>
              <div 
                className="bg-purple-500"
                style={{ width: `${product.nutrients.potassium * 100 / (product.nutrients.nitrogen + product.nutrients.phosphorus + product.nutrients.potassium)}%` }}
              ></div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          <span className="text-lg font-bold text-primary-900">₹{product.price}</span>
          <div className="flex space-x-2">
            <Link 
              to={`/products/${product.id}`}
              className="btn bg-primary-50 text-primary-600 hover:bg-primary-100 px-3 py-2"
              aria-label={`View details of ${product.name}`}
            >
              <Info className="h-5 w-5" />
            </Link>
            <button
              className="btn btn-primary px-3 py-2"
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;