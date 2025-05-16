import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { getProductById } from '../data/products';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = React.useState(1);
  
  const product = id ? getProductById(id) : null;
  
  if (!product) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container-custom">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
            <p className="text-gray-600 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const incrementQuantity = () => {
    setQuantity(prevQuantity => prevQuantity + 1);
  };
  
  const decrementQuantity = () => {
    setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container-custom py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
          <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-primary-600 transition">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </button>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-600 hover:text-primary-600 transition">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="animate-fade-in">
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden shadow-lg">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-accent-500 text-secondary-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category}
              </div>
            </div>
          </div>
          
          {/* Product Info */}
          <div className="animate-slide-up">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-baseline mb-6">
              <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
              <span className="ml-2 text-sm text-gray-500">per bag</span>
            </div>
            
            <p className="text-gray-700 mb-6">{product.description}</p>
            
            {/* Nutrient Content */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Nutrient Content</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-blue-500 font-bold text-2xl mb-1">{product.nutrients.nitrogen}%</div>
                  <div className="text-gray-600 text-sm">Nitrogen (N)</div>
                </div>
                <div className="text-center">
                  <div className="text-green-500 font-bold text-2xl mb-1">{product.nutrients.phosphorus}%</div>
                  <div className="text-gray-600 text-sm">Phosphorus (P)</div>
                </div>
                <div className="text-center">
                  <div className="text-purple-500 font-bold text-2xl mb-1">{product.nutrients.potassium}%</div>
                  <div className="text-gray-600 text-sm">Potassium (K)</div>
                </div>
              </div>
              
              {product.nutrients.otherNutrients && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-md font-medium mb-2">Micronutrients:</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(product.nutrients.otherNutrients).map(([name, value]) => (
                      <div key={name} className="text-sm">
                        <span className="font-medium">{name.charAt(0).toUpperCase() + name.slice(1)}:</span> {value}%
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Benefits */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Benefits</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                    <span className="ml-2 text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Application Method */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Application Method</h3>
              <p className="text-gray-700">{product.applicationMethod}</p>
            </div>
            
            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={decrementQuantity}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={quantity}
                  readOnly
                  className="w-12 text-center border-0 focus:outline-none text-gray-900"
                  aria-label="Quantity"
                />
                <button
                  onClick={incrementQuantity}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <button className="btn btn-primary flex-1">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
              
              <button className="btn btn-outline">
                Get Quote
              </button>
            </div>
            
            {/* Availability */}
            <div className="mt-6 flex items-center">
              <div className={`h-3 w-3 rounded-full ${product.stockAvailability ? 'bg-success-500' : 'bg-error-500'} mr-2`}></div>
              <span className={product.stockAvailability ? 'text-success-700' : 'text-error-700'}>
                {product.stockAvailability ? 'In stock' : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;