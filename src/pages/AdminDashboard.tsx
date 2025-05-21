// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  MessageSquare, 
  BarChart2, 
  Settings,
  ChevronRight,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalFeedback: number;
  recentOrders: any[];
  recentUsers: any[];
}

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

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalFeedback: 0,
    recentOrders: [],
    recentUsers: []
  });
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
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);

        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);

        // Fetch products
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsList = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setProducts(productsList);

        // Fetch feedback
        const feedbackSnapshot = await getDocs(collection(db, 'feedback'));

        setStats({
          totalUsers: usersSnapshot.size,
          totalOrders: ordersSnapshot.size,
          totalProducts: productsSnapshot.size,
          totalFeedback: feedbackSnapshot.size,
          recentOrders: recentOrdersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })),
          recentUsers: recentUsersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const validateImageUrl = (url: string): boolean => {
    try {
      new URL(url);
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

  const quickLinks = [
    {
      title: 'Users Management',
      icon: <Users className="h-6 w-6" />,
      path: '/admin/users',
      color: 'bg-blue-500',
      count: stats.totalUsers
    },
    {
      title: 'Orders Management',
      icon: <ShoppingCart className="h-6 w-6" />,
      path: '/admin/orders',
      color: 'bg-green-500',
      count: stats.totalOrders
    },
    {
      title: 'Products Management',
      icon: <Package className="h-6 w-6" />,
      path: '/admin/products',
      color: 'bg-purple-500',
      count: stats.totalProducts
    },
    {
      title: 'Customer Feedback',
      icon: <MessageSquare className="h-6 w-6" />,
      path: '/admin/feedback',
      color: 'bg-yellow-500',
      count: stats.totalFeedback
    }
  ];

  const renderContent = () => {
    switch (currentPath) {
      case '/admin/users':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Users Management</h2>
            <div className="space-y-4">
              {stats.recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.displayName}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200">
                      Edit
                    </button>
                    <button className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '/admin/orders':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Orders Management</h2>
            <div className="space-y-4">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-green-100 text-green-600 rounded-md">
                      ${order.totalAmount}
                    </span>
                    <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case '/admin/products':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Products Management</h2>
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
        );

      case '/admin/feedback':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Customer Feedback</h2>
            <div className="space-y-4">
              {/* Add feedback list here */}
              <p className="text-gray-600">No feedback available yet.</p>
            </div>
          </div>
        );

      case '/admin/products/new':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Product</h2>
            {/* Add Product Form */}
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
        );

      default:
        return (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickLinks.map((link, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(link.path)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{link.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{link.count}</p>
                    </div>
                    <div className={`${link.color} p-3 rounded-lg`}>
                      {link.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-primary-600">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-medium text-gray-900">${order.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Users */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {stats.recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600">New User</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Features */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/admin/products/new')}
                    className="flex items-center justify-center p-4 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    <Package className="h-5 w-5 mr-2" />
                    Add New Product
                  </button>
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center justify-center p-4 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Process Orders
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-900">Database Connection</span>
                    </div>
                    <span className="text-sm text-green-600">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Settings className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-gray-900">System Version</span>
                    </div>
                    <span className="text-sm text-gray-600">1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to your admin control panel</p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
