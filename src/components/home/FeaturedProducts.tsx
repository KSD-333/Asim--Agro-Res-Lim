import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { products } from '../../data/products';
import ProductCard from '../products/ProductCard';

const FeaturedProducts: React.FC = () => {
  // Get 3 featured products
  const featuredProducts = products.slice(0, 3);

  return (
    <section className="section bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-primary-900 mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our premium fertilizers are formulated with the perfect balance of nutrients to ensure
            optimal crop growth, increased yield, and improved soil health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`animate-slide-up transition-all duration-300 delay-${index * 100}`}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition duration-200"
          >
            View All Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;