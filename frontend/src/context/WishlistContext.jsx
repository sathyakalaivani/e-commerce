import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState({ products: [] });

  const fetchWishlist = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/wishlist");
      setWishlist(data.wishlist);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchWishlist();
    else setWishlist({ products: [] });
  }, [user, fetchWishlist]);

  const isInWishlist = (productId) => wishlist.products.some((p) => p._id === productId);

  const toggleWishlist = async (productId) => {
    if (!user) {
      toast.error("Please login to use your wishlist");
      return;
    }
    try {
      if (isInWishlist(productId)) {
        const { data } = await api.delete(`/wishlist/${productId}`);
        setWishlist(data.wishlist);
        toast.success("Removed from wishlist");
      } else {
        const { data } = await api.post("/wishlist", { productId });
        setWishlist(data.wishlist);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      toast.error("Could not update wishlist");
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, fetchWishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
