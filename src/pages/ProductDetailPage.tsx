import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Plus, Minus, Check, AlertCircle, Star, Upload, X } from 'lucide-react';
import { doc, getDoc, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product, Review } from '../types';
import Toast from '../components/Toast';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    images: [] as File[]
  });
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is missing');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching product with ID:', id);
        const productDoc = await getDoc(doc(db, 'products', id));
        
        if (productDoc.exists()) {
          const productData = productDoc.data();
          console.log('Product data:', productData);
          // Ensure all required fields are present with default values
          const formattedProduct = {
            id: productDoc.id,
            name: productData.name || '',
            description: productData.description || '',
            shortDescription: productData.shortDescription || '',
            sizes: productData.sizes || [],
            imageUrl: productData.imageUrl || '',
            category: productData.category || '',
            price: productData.price || 0,
            nutrients: {
              nitrogen: productData.nitrogen || 0,
              phosphorus: productData.phosphorus || 0,
              potassium: productData.potassium || 0,
              otherNutrients: productData.otherNutrients || {}
            },
            applicationMethod: productData.applicationMethod || '',
            benefits: productData.benefits || [],
            stockAvailability: productData.stockAvailability || false
          };
          setProduct(formattedProduct as Product);
        } else {
          console.log('No product found with ID:', id);
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      if (!id) return;
      try {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('productId', '==', id),
          orderBy('createdAt', 'desc')
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsList = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        setReviews(reviewsList);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Don't set error state for reviews, just log it
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      size: product.sizes[0] || 'default',
      image: product.imageUrl,
      nutrients: product.nutrients
    });
    setShowToast(true);
    setToastMessage(`${product.name} added to cart`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewReview(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setNewReview(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product) return;

    setUploading(true);
    try {
      // Upload images first
      const imageUrls = await Promise.all(
        newReview.images.map(async (file) => {
          const storageRef = ref(storage, `reviews/${product.id}/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          return getDownloadURL(snapshot.ref);
        })
      );

      // Create review document
      const reviewData = {
        productId: product.id,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        images: imageUrls,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'reviews'), reviewData);
      
      // Reset form and show success message
      setNewReview({
        rating: 5,
        comment: '',
        images: []
      });
      setShowToast(true);
      setToastMessage('Review submitted successfully!');
      
      // Refresh reviews
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('productId', '==', product.id),
        orderBy('createdAt', 'desc')
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsList = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsList);
    } catch (error) {
      console.error('Error submitting review:', error);
      setShowToast(true);
      setToastMessage('Failed to submit review. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <AlertCircle className="h-16 w-16 text-error-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Error Loading Product</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="container mx-auto px-4">
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
              
              {product.nutrients.otherNutrients && Object.keys(product.nutrients.otherNutrients).length > 0 && (
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
            {product.benefits && product.benefits.length > 0 && (
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
            )}
            
            {/* Application Method */}
            {product.applicationMethod && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-2">Application Method</h3>
                <p className="text-gray-700">{product.applicationMethod}</p>
              </div>
            )}
            
            {/* Add to Cart */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
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
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                className="btn btn-primary flex-1"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </button>
            </div>
            
            {/* Availability */}
            <div className="flex items-center">
              <div className={`h-3 w-3 rounded-full ${product.stockAvailability ? 'bg-success-500' : 'bg-error-500'} mr-2`}></div>
              <span className={product.stockAvailability ? 'text-success-700' : 'text-error-700'}>
                {product.stockAvailability ? 'In stock' : 'Out of stock'}
              </span>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          
          {/* Review Form */}
          {user && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={4}
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images</label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer">
                      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 transition-colors">
                        <Upload className="h-8 w-8 text-gray-400" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <div className="flex space-x-2">
                      {newReview.images.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-32 h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={uploading}
                  className="btn btn-primary"
                >
                  {uploading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}
          
          {/* Reviews List */}
          <div className="space-y-6">
            {reviews && reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{review.userName}</h4>
                      <div className="flex items-center mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                  {review.images && review.images.length > 0 && (
                    <div className="flex space-x-2">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;