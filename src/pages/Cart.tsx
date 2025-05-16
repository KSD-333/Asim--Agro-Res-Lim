import React, { useEffect, useState } from 'react';

const Cart = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(stored);
  }, []);

  const removeItem = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="p-20 max-w-3xl mx-auto mh-auto ">
      <h1 className="text-3xl font-bold mb-6 text-center">🛒 Your Cart</h1>

      {cart.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">Your cart is empty.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-4 space-y-4 max-h-[60vh] overflow-y-auto border">
          {cart.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 p-3 border-b last:border-b-0">
              <div className="flex items-center gap-4">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md border" />
                <div>
                  <h2 className="font-semibold text-lg">{item.name}</h2>
                  <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-lg text-green-600">₹{item.subtotal}</p>
                <button
                  onClick={() => removeItem(index)}
                  className="mt-2 text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cart.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <p className="text-xl font-bold">Total: ₹{total}</p>
          <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;
