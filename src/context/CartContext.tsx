import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
  nutrients?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    otherNutrients?: Record<string, number>;
  };
}

interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (shippingAddress: Order['shippingAddress']) => Promise<string>;
  getOrders: () => Promise<Order[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Load cart from Firestore
      const loadCart = async () => {
        const cartDoc = await getDoc(doc(db, 'carts', user.uid));
        if (cartDoc.exists()) {
          setItems(cartDoc.data().items);
        }
      };
      loadCart();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Save cart to Firestore
      const saveCart = async () => {
        await setDoc(doc(db, 'carts', user.uid), { items });
      };
      saveCart();
    }
  }, [items, user]);

  const addItem = (item: CartItem) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id && i.size === item.size);
      if (existingItem) {
        return prevItems.map(i =>
          i.id === item.id && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prevItems, item];
    });
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const createOrder = async (shippingAddress: Order['shippingAddress']): Promise<string> => {
    if (!user) throw new Error('User must be logged in to create an order');

    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);

    const order: Omit<Order, 'id'> = {
      userId: user.uid,
      items,
      totalAmount,
      status: 'pending',
      createdAt: new Date(),
      shippingAddress
    };

    const orderRef = await addDoc(collection(db, 'orders'), order);
    clearCart();
    return orderRef.id;
  };

  const getOrders = async (): Promise<Order[]> => {
    if (!user) throw new Error('User must be logged in to view orders');

    const ordersSnapshot = await getDoc(doc(db, 'orders', user.uid));
    if (!ordersSnapshot.exists()) return [];

    const orders = ordersSnapshot.data().orders as Order[];
    return orders;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        createOrder,
        getOrders
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 