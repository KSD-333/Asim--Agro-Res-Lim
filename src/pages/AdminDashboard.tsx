// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { auth } from '../firebase';

interface Product {
  id: string;
  name: string;
  description: string;
  sizes: string[];
  imageUrl: string;
  category: string;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
}

const dummyProducts = [
  {
    name: "Organic Fertilizer",
    description: "High-quality organic fertilizer for better crop yield",
    sizes: ["5kg", "10kg", "25kg"],
    category: "Fertilizers",
    imageUrl: "https://images.pexels.com/photos/440731/pexels-photo-440731.jpeg"
  },
  {
    name: "Wheat Seeds",
    description: "Premium quality wheat seeds for optimal growth",
    sizes: ["1kg", "5kg", "10kg"],
    category: "Seeds",
    imageUrl: "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg"
  },
  {
    name: "Pesticide Spray",
    description: "Effective pesticide for crop protection",
    sizes: ["500ml", "1L", "5L"],
    category: "Pesticides",
    imageUrl: "https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg"
  }
];

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sizes: '',
    category: '',
    imageUrl: '',
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
    // Add dummy products if no products exist
    const checkAndAddDummyProducts = async () => {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (querySnapshot.empty) {
        addDummyProducts();
      }
    };
    checkAndAddDummyProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = auth.currentUser;
    if (!user) {
      setError('You must be logged in to add products');
      return;
    }

    if (!newProduct.imageUrl) {
      setError('Please provide an image URL');
      return;
    }

    try {
      setLoading(true);
      const sizesArray = newProduct.sizes.split(',').map(size => size.trim());
      
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        sizes: sizesArray,
        category: newProduct.category,
        imageUrl: newProduct.imageUrl,
        createdAt: new Date(),
        addedBy: user.uid,
        // Only include nutrient values if they are provided
        ...(newProduct.nitrogen && { nitrogen: Number(newProduct.nitrogen) }),
        ...(newProduct.phosphorus && { phosphorus: Number(newProduct.phosphorus) }),
        ...(newProduct.potassium && { potassium: Number(newProduct.potassium) })
      };

      const docRef = await addDoc(collection(db, 'products'), productData);
      setProducts(prevProducts => [...prevProducts, { id: docRef.id, ...productData }]);
      
      setNewProduct({
        name: '',
        description: '',
        sizes: '',
        category: '',
        imageUrl: '',
        nitrogen: '',
        phosphorus: '',
        potassium: ''
      });
      
      setError('Product added successfully!');
      setTimeout(() => {
        setError(null);
      }, 3000);

    } catch (error) {
      console.error('Error adding product:', error);
      setError(error instanceof Error ? error.message : 'Failed to add product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const addDummyProducts = async () => {
    try {
      for (const product of dummyProducts) {
        await addDoc(collection(db, 'products'), {
          ...product,
          createdAt: new Date()
        });
      }
      fetchProducts();
    } catch (error) {
      console.error('Error adding dummy products:', error);
    }
  };

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
      // Accept any valid URL, including Unsplash URLs
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setNewProduct({...newProduct, imageUrl: url});
    
    if (url && !validateImageUrl(url)) {
      setError('Please enter a valid URL');
    } else {
      setError(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24">
        <div className="container-custom">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-md p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Total Products: {products.length}</span>
          </div>
        </div>
        
        {/* Add Product Form */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h2>
          {error && (
            <div className={`mb-4 p-4 rounded-lg ${
              error.includes('successfully') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleAddProduct} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Fertilizers">Fertilizers</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Pesticides">Pesticides</option>
                  <option value="Equipment">Equipment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated)</label>
              <input
                type="text"
                value={newProduct.sizes}
                onChange={(e) => setNewProduct({...newProduct, sizes: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 5kg, 10kg, 25kg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image URL</label>
              <div className="mt-1">
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="https://images.unsplash.com/photo-..."
                  required
                />
                <div className="mt-2 text-sm text-gray-500 space-y-1">
                  <p>To get the correct Unsplash image URL:</p>
                  <ol className="list-decimal list-inside ml-2">
                    <li>Go to the Unsplash image page</li>
                    <li>Right-click on the image itself (not the page)</li>
                    <li>Select "Copy image address" or "Copy image URL"</li>
                    <li>The URL should start with "https://images.unsplash.com/"</li>
                  </ol>
                  <p className="text-red-500 mt-2">Do not use the page URL (the one that starts with "https://unsplash.com/photos/")</p>
                </div>
              </div>
              {newProduct.imageUrl && (
                <div className="mt-4">
                  <img
                    src={newProduct.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.onerror = null;
                      setError('Image failed to load. Make sure you copied the direct image URL (right-click → Copy image address)');
                    }}
                  />
                </div>
              )}
            </div>

            {/* Add Nutrient Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nitrogen (N) %</label>
                <input
                  type="number"
                  value={newProduct.nitrogen}
                  onChange={(e) => setNewProduct({...newProduct, nitrogen: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Optional"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phosphorus (P) %</label>
                <input
                  type="number"
                  value={newProduct.phosphorus}
                  onChange={(e) => setNewProduct({...newProduct, phosphorus: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Optional"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Potassium (K) %</label>
                <input
                  type="number"
                  value={newProduct.potassium}
                  onChange={(e) => setNewProduct({...newProduct, potassium: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Optional"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition duration-300">
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition duration-300"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                      >
                        {size}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Category: {product.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
