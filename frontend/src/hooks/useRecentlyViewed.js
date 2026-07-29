import { useState, useCallback } from "react";

const KEY = "recentlyViewed";
const MAX_ITEMS = 8;

// Tracks recently viewed products in localStorage (lightweight client-side feature)
export default function useRecentlyViewed() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  const addRecentlyViewed = useCallback((product) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      const updated = [
        { _id: product._id, title: product.title, price: product.price, discountPrice: product.discountPrice, image: product.images?.[0]?.url },
        ...filtered,
      ].slice(0, MAX_ITEMS);
      localStorage.setItem(KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { recentlyViewed: items, addRecentlyViewed };
}
