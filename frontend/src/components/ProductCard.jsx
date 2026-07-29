import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => toggleWishlist(product._id)}
        className={`absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/90 shadow ${
          isInWishlist(product._id) ? "text-red-500" : "text-gray-400"
        }`}
        aria-label="Toggle wishlist"
      >
        <FiHeart className={isInWishlist(product._id) ? "fill-current" : ""} />
      </button>

      {hasDiscount && (
        <span className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          -{discountPct}%
        </span>
      )}

      <Link to={`/products/${product._id}`}>
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={product.images?.[0]?.url || "https://via.placeholder.com/400x400?text=No+Image"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{product.brand}</p>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-medium text-sm mt-1 line-clamp-2 hover:text-primary-600">{product.title}</h3>
        </Link>

        <div className="flex items-center gap-1 mt-1 text-amber-500 text-xs">
          <FiStar className="fill-current" />
          <span>{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-gray-400">({product.numReviews || 0})</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-primary-600">₹{finalPrice.toLocaleString("en-IN")}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₹{product.price.toLocaleString("en-IN")}</span>
          )}
        </div>

        <button
          onClick={() => addToCart(product._id, 1)}
          disabled={product.stock === 0}
          className="mt-3 w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          <FiShoppingCart /> {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
