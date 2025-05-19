import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Info } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import Toast from '../Toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      quantity: 1,
      size: selectedSize,
      image: product.imageUrl
    });
    setShowToast(true);
  };

  return (
    <>
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
          <p className="text-gray-600 mb-4 flex-grow line-clamp-2">{product.description}</p>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              {product.nutrients?.nitrogen && (
                <span className="text-sm font-medium text-gray-700">
                  N: {product.nutrients.nitrogen}%
                </span>
              )}
              {product.nutrients?.phosphorus && (
                <span className="text-sm font-medium text-gray-700">
                  P: {product.nutrients.phosphorus}%
                </span>
              )}
              {product.nutrients?.potassium && (
                <span className="text-sm font-medium text-gray-700">
                  K: {product.nutrients.potassium}%
                </span>
              )}
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="flex h-full">
                {product.nutrients?.nitrogen && (
                  <div 
                    className="bg-blue-500"
                    style={{ width: `${product.nutrients.nitrogen}%` }}
                  ></div>
                )}
                {product.nutrients?.phosphorus && (
                  <div 
                    className="bg-green-500"
                    style={{ width: `${product.nutrients.phosphorus}%` }}
                  ></div>
                )}
                {product.nutrients?.potassium && (
                  <div 
                    className="bg-purple-500"
                    style={{ width: `${product.nutrients.potassium}%` }}
                  ></div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <select 
              className="form-select bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4 w-full"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              <option value="" disabled>Select Size</option>
              {product.sizes?.map((size, index) => (
                <option key={index} value={size}>{size}</option>
              ))}
            </select>
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
                onClick={handleAddToCart}
                aria-label={`Add ${product.name} to cart`}
              >
                <ShoppingCart className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={`${product.name} added to cart`}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ProductCard;