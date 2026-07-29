import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], coupon: { code: "", discountPercent: 0 } });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get("/cart");
      setCart(data.cart);
    } catch (err) {
      // silent - user may not have a cart yet
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchCart();
    else setCart({ items: [], coupon: { code: "", discountPercent: 0 } });
  }, [user, fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      toast.error("Please login to add items to your cart");
      return false;
    }
    try {
      const { data } = await api.post("/cart", { productId, quantity });
      setCart(data.cart);
      toast.success("Added to cart");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      setCart(data.cart);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update quantity");
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      setCart(data.cart);
      toast.success("Removed from cart");
    } catch (err) {
      toast.error("Could not remove item");
    }
  };

  const clearCart = async () => {
    try {
      await api.delete("/cart/clear");
      setCart({ items: [], coupon: { code: "", discountPercent: 0 } });
    } catch (err) {
      // ignore
    }
  };

  const applyCoupon = async (code) => {
    try {
      const { data } = await api.post("/cart/coupon", { code });
      setCart(data.cart);
      toast.success(data.message);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
      return false;
    }
  };

  const itemsPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.coupon?.discountPercent ? (itemsPrice * cart.coupon.discountPercent) / 100 : 0;
  const shippingPrice = itemsPrice > 999 || itemsPrice === 0 ? 0 : 49;
  const totalAmount = Math.max(0, itemsPrice - discount + shippingPrice);
  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        itemsPrice,
        discount,
        shippingPrice,
        totalAmount,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
