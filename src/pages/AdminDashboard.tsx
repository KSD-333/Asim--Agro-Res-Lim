// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit, updateDoc, getDoc, setDoc, where, onSnapshot } from 'firebase/firestore';
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
  X,
  Mail,
  CheckCircle,
  Clock,
  LayoutDashboard,
  FileText
} from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { auth } from '../firebase';

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

interface Order {
  id: string;
  status: string;
  userEmail: string;
  items: { name: string; size: string; quantity: number; image: string }[];
  estimatedDeliveryDate: Timestamp;
  adminNotes?: string;
}

interface OrderMessage {
  id: string;
  orderId: string;
  userId: string;
  type: 'complaint' | 'return';
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: any;
  adminResponse?: string;
  userName: string;
}

interface ContactForm {
  id: string;
  type: 'message' | 'getStarted';
  name: string;
  email: string;
  phone: string;
  message: string;
  businessType?: string;
  location?: string;
  status: 'pending' | 'in_progress' | 'resolved';
  createdAt: any;
  userId: string;
  userName: string;
  userEmail: string;
  adminResponse?: string;
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
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newDeliveryDate, setNewDeliveryDate] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [orderMessages, setOrderMessages] = useState<OrderMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<OrderMessage | null>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [savingResponse, setSavingResponse] = useState(false);
  const [contactForms, setContactForms] = useState<ContactForm[]>([]);
  const [selectedForm, setSelectedForm] = useState<ContactForm | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductData, setEditProductData] = useState<any>({});
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);

        // Fetch recent users for stats
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsers = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch orders
        const ordersSnapshot = await getDocs(collection(db, 'orders'));
        const recentOrdersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
        const recentOrders = recentOrdersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

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
          recentOrders,
          recentUsers
        });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (error.code === 'permission-denied') {
          setError('Permission denied. Please check your admin privileges.');
        } else {
          setError('Error loading data. Please refresh the page.');
        }
      }
    } catch (error: any) {
      console.error('Error in fetchDashboardData:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to order messages
    const messagesRef = collection(db, 'orderMessages');
    const unsubscribe = onSnapshot(messagesRef, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as OrderMessage[];
      setOrderMessages(messages);
    });

    // Subscribe to contact forms
    const formsRef = collection(db, 'contactForms');
    const unsubscribeForms = onSnapshot(formsRef, (snapshot) => {
      const forms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactForm[];
      setContactForms(forms);
    });

    return () => {
      unsubscribe();
      unsubscribeForms();
    };
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

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        adminNotes: adminNotes
      });
      setStats(prevStats => ({
        ...prevStats,
        recentOrders: prevStats.recentOrders.map(order =>
          order.id === orderId
            ? { ...order, status, adminNotes }
            : order
        )
      }));
      setSelectedOrder(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const handleUpdateDeliveryDate = async (orderId: string) => {
    try {
      const newDate = new Date(newDeliveryDate);
      await updateDoc(doc(db, 'orders', orderId), {
        estimatedDeliveryDate: Timestamp.fromDate(newDate)
      });
      setStats(prevStats => ({
        ...prevStats,
        recentOrders: prevStats.recentOrders.map(order =>
          order.id === orderId
            ? { ...order, estimatedDeliveryDate: Timestamp.fromDate(newDate) }
            : order
        )
      }));
      setSelectedOrder(null);
      setNewDeliveryDate('');
    } catch (error) {
      console.error('Error updating delivery date:', error);
      setError('Failed to update delivery date');
    }
  };

  const handleEmailUser = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleUpdateMessageStatus = async (messageId: string, newStatus: OrderMessage['status']) => {
    try {
      await updateDoc(doc(db, 'orderMessages', messageId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const handleSaveResponse = async () => {
    if (!selectedMessage || !adminResponse.trim()) return;

    setSavingResponse(true);
    try {
      await updateDoc(doc(db, 'orderMessages', selectedMessage.id), {
        adminResponse: adminResponse.trim(),
        status: 'resolved'
      });
      setSelectedMessage(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSavingResponse(false);
    }
  };

  const handleUpdateFormStatus = async (formId: string, newStatus: ContactForm['status']) => {
    try {
      await updateDoc(doc(db, 'contactForms', formId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating form status:', error);
    }
  };

  const handleSaveFormResponse = async () => {
    if (!selectedForm || !adminResponse.trim()) return;

    setSavingResponse(true);
    try {
      await updateDoc(doc(db, 'contactForms', selectedForm.id), {
        adminResponse: adminResponse.trim(),
        status: 'resolved'
      });
      setSelectedForm(null);
      setAdminResponse('');
    } catch (error) {
      console.error('Error saving response:', error);
    } finally {
      setSavingResponse(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (isDeletingUser) return; // Prevent multiple deletions
    
    try {
      setIsDeletingUser(true);
      // Get current user's admin status
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError('You must be logged in to perform this action');
        return;
      }

      // Check if current user is admin
      const adminDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!adminDoc.exists() || adminDoc.data().role !== 'admin') {
        setError('You do not have permission to delete users');
        return;
      }

      // First, check if the user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        setError('User not found');
        return;
      }

      // Prevent self-deletion
      if (userId === currentUser.uid) {
        setError('You cannot delete your own account');
        return;
      }

      // Get all collections that might have user data
      const collections = ['orders', 'reviews', 'contactForms', 'orderMessages', 'feedback'];
      
      // Delete user data from all collections
      for (const collectionName of collections) {
        try {
          const q = query(
            collection(db, collectionName),
            where('userId', '==', userId)
          );
          const querySnapshot = await getDocs(q);
          
          // Delete all documents in the collection that belong to this user
          const deletePromises = querySnapshot.docs.map(doc => 
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);
        } catch (collectionError) {
          console.warn(`Error deleting from ${collectionName}:`, collectionError);
          // Continue with other collections even if one fails
        }
      }

      // Finally, delete the user document
      await deleteDoc(doc(db, 'users', userId));
      
      // Update the stats to remove the deleted user
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers - 1,
        recentUsers: prevStats.recentUsers.filter(user => user.id !== userId)
      }));

      setError('User deleted successfully');
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      if (error.code === 'permission-denied') {
        setError('Permission denied. Please check your admin privileges and Firebase security rules.');
      } else if (error.code === 'not-found') {
        setError('User not found in the database.');
      } else {
        setError(`Failed to delete user: ${error.message}`);
      }
    } finally {
      setIsDeletingUser(false);
      setUserToDelete(null);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditProductData({ ...product, sizes: product.sizes.join(', ') });
    setShowEditModal(true);
  };

  const handleEditProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditProductData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEditProduct = async () => {
    if (!editingProduct) return;
    try {
      const sizesArray = editProductData.sizes.split(',').map((s: string) => s.trim());
      await updateDoc(doc(db, 'products', editingProduct.id), {
        name: editProductData.name,
        description: editProductData.description,
        sizes: sizesArray,
        category: editProductData.category,
        imageUrl: editProductData.imageUrl,
        nitrogen: editProductData.nitrogen ? Number(editProductData.nitrogen) : undefined,
        phosphorus: editProductData.phosphorus ? Number(editProductData.phosphorus) : undefined,
        potassium: editProductData.potassium ? Number(editProductData.potassium) : undefined,
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...editProductData, sizes: sizesArray }
            : p
        )
      );
      setShowEditModal(false);
      setEditingProduct(null);
    } catch (error) {
      setError('Failed to update product.');
    }
  };

  const quickLinks = [
    {
      name: 'Analytics Overview',
      href: '/admin/analytics',
      icon: <BarChart2 className="h-6 w-6" />,
      color: 'bg-blue-500'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <Package className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'bg-green-500'
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-yellow-500'
    },
    {
      name: 'Forms',
      href: '/admin/forms',
      icon: <FileText className="h-6 w-6" />,
      color: 'bg-indigo-500'
    },
    {
      name: 'Messages',
      href: '/admin/messages',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'bg-pink-500'
    }
  ];

  const renderOrderManagement = () => {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Orders Management</h2>
        <div className="space-y-4">
          {stats.recentOrders.map((order) => {
            // Safely handle timestamps
            const createdAt = order.createdAt?.toDate ? 
              order.createdAt.toDate().toLocaleDateString('en-GB') : 
              'Date not available';
            
            const estimatedDelivery = order.estimatedDeliveryDate?.toDate ? 
              order.estimatedDeliveryDate.toDate().toLocaleDateString('en-GB') : 
              'Date not available';

            return (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">{createdAt}</p>
                    <p className="text-sm text-gray-600">
                      Customer: {order.userEmail}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <button
                      onClick={() => handleEmailUser(order.userEmail)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Email Customer"
                    >
                      <Mail className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item: { name: string; size: string; quantity: number; image: string }, index: number) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Size: {item.size} | Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">
                        Estimated Delivery: {estimatedDelivery}
                      </p>
                      {order.adminNotes && (
                        <p className="text-sm text-gray-600 mt-1">
                          Note: {order.adminNotes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Update Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Order #{selectedOrder.id.slice(0, 8)}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Status
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about the order..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Delivery Date
                  </label>
                  <input
                    type="date"
                    value={newDeliveryDate}
                    onChange={(e) => setNewDeliveryDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  {newDeliveryDate && (
                    <button
                      onClick={() => handleUpdateDeliveryDate(selectedOrder.id)}
                      className="mt-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Update Delivery Date
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/admin/analytics':
        return (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {stats.recentOrders.length} new orders this month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {stats.recentUsers.length} new users this month
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    Across {products.length} categories
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Messages</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{orderMessages.filter(m => m.status !== 'resolved').length}</p>
                  </div>
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    {orderMessages.filter(m => m.status === 'pending').length} pending responses
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity and Statistics */}
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
                  {stats.recentOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.id.slice(0, 8)}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt?.toDate()).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{order.totalAmount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Messages */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
                  <button
                    onClick={() => navigate('/admin/messages')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {orderMessages.slice(0, 5).map((message) => (
                    <div key={message.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          {message.type === 'complaint' ? 'Complaint' : 'Return Request'}
                        </p>
                        <p className="text-sm text-gray-600">
                          From: {message.userName}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          message.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {message.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Order Status Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h2>
                <div className="space-y-4">
                  {['pending', 'processing', 'delivered', 'delayed', 'cancelled'].map((status) => {
                    const count = stats.recentOrders.filter(order => order.status === status).length;
                    const percentage = (count / stats.recentOrders.length) * 100 || 0;
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{status}</span>
                          <span className="text-gray-900">{count} orders</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(status)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Message Type Distribution */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Type Distribution</h2>
                <div className="space-y-4">
                  {['complaint', 'return'].map((type) => {
                    const count = orderMessages.filter(message => message.type === type).length;
                    const percentage = (count / orderMessages.length) * 100 || 0;
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{type}</span>
                          <span className="text-gray-900">{count} messages</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              type === 'complaint' ? 'bg-red-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case '/admin/users':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Users Management</h2>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600">
                {error}
                <button 
                  onClick={() => fetchDashboardData()}
                  className="ml-4 text-red-700 underline hover:text-red-800"
                >
                  Retry
                </button>
              </div>
            )}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {users.length === 0 ? (
                  <p className="text-gray-600">No users found.</p>
                ) : (
                  (users as any[]).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'No Name'}</p>
                        <p className="text-sm text-gray-600">{user.email || 'No Email'}</p>
                        <p className="text-xs text-gray-500">Role: {user.role || 'user'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => setUserToDelete(user.id)}
                            disabled={isDeletingUser}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeletingUser && userToDelete === user.id ? 'Deleting...' : 'Delete'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Delete Confirmation Dialog */}
            {userToDelete && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this user? This action cannot be undone.
                  </p>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => setUserToDelete(null)}
                      disabled={isDeletingUser}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userToDelete)}
                      disabled={isDeletingUser}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeletingUser ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case '/admin/orders':
        return renderOrderManagement();

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
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="absolute top-2 right-12 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition duration-300"
                    >
                      Edit
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

      case '/admin/forms':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Forms</h2>
            <div className="space-y-4">
              {contactForms.length === 0 ? (
                <p className="text-gray-600">No forms submitted yet.</p>
              ) : (
                contactForms.map((form) => (
                  <div key={form.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          {form.type === 'message' ? (
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          ) : (
                            <Mail className="h-5 w-5 text-green-500" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {form.type === 'message' ? 'Contact Message' : 'Get Started Form'}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          From: {form.name} ({form.email})
                        </p>
                        {form.type === 'getStarted' && (
                          <p className="text-sm text-gray-600">
                            Business: {form.businessType} | Location: {form.location}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={form.status}
                          onChange={(e) => handleUpdateFormStatus(form.id, e.target.value as ContactForm['status'])}
                          className="text-sm border rounded-md px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedForm(form);
                            setAdminResponse(form.adminResponse || '');
                          }}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-700">{form.message}</p>
                    </div>
                    {form.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-600">Admin Response:</p>
                        <p className="text-gray-700">{form.adminResponse}</p>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      Submitted: {form.createdAt?.toDate().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );

      case '/admin/messages':
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Messages</h2>
            <div className="space-y-4">
              {orderMessages.length === 0 ? (
                <p className="text-gray-600">No messages found.</p>
              ) : (
                orderMessages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          {message.type === 'complaint' ? (
                            <AlertCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <Package className="h-5 w-5 text-blue-500" />
                          )}
                          <h3 className="font-medium text-gray-900">
                            {message.type === 'complaint' ? 'Complaint' : 'Return Request'}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Order #{message.orderId.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          From: {message.userName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={message.status}
                          onChange={(e) => handleUpdateMessageStatus(message.id, e.target.value as OrderMessage['status'])}
                          className="text-sm border rounded-md px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button
                          onClick={() => {
                            setSelectedMessage(message);
                            setAdminResponse(message.adminResponse || '');
                          }}
                          className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Respond
                        </button>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-gray-700">{message.message}</p>
                    </div>
                    {message.adminResponse && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm text-gray-600">Admin Response:</p>
                        <p className="text-gray-700">{message.adminResponse}</p>
                      </div>
                    )}
                    <div className="mt-2 text-sm text-gray-500">
                      Submitted: {message.createdAt?.toDate().toLocaleDateString('en-GB')}
                    </div>
                  </div>
                ))
              )}
            </div>
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
                  onClick={() => navigate(link.href)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{link.name}</p>
                    </div>
                    <div className={`${link.color} p-3 rounded-lg`}>
                      {link.icon}
                    </div>
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
                          {new Date(order.createdAt?.toDate()).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{order.totalAmount}</span>
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
          <h1 className="text-3xl font-bold text-gray-900 p-2 mt-8 text-center text-green-700">Dashboard</h1>
        </div>

        {renderContent()}
      </div>

      {/* Response Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Respond to {selectedForm.type === 'message' ? 'Contact Message' : 'Get Started Form'}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Original Message:</p>
              <p className="text-gray-700">{selectedForm.message}</p>
            </div>
            <textarea
              value={adminResponse}
              onChange={(e) => setAdminResponse(e.target.value)}
              className="w-full h-32 px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your response..."
            />
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => {
                  setSelectedForm(null);
                  setAdminResponse('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFormResponse}
                disabled={savingResponse || !adminResponse.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
              >
                {savingResponse ? 'Saving...' : 'Send Response'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Product</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={editProductData.name}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Product Name"
              />
              <textarea
                name="description"
                value={editProductData.description}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Description"
              />
              <input
                type="text"
                name="sizes"
                value={editProductData.sizes}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Sizes (comma-separated)"
              />
              <input
                type="text"
                name="category"
                value={editProductData.category}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Category"
              />
              <input
                type="text"
                name="imageUrl"
                value={editProductData.imageUrl}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Image URL"
              />
              <input
                type="number"
                name="nitrogen"
                value={editProductData.nitrogen || ''}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Nitrogen (N) %"
              />
              <input
                type="number"
                name="phosphorus"
                value={editProductData.phosphorus || ''}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Phosphorus (P) %"
              />
              <input
                type="number"
                name="potassium"
                value={editProductData.potassium || ''}
                onChange={handleEditProductChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Potassium (K) %"
              />
            </div>
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditProduct}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
