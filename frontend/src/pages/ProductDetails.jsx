import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import useRecentlyViewed from "../hooks/useRecentlyViewed.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { FiStar, FiHeart, FiShoppingCart, FiZoomIn, FiMinus, FiPlus } from "react-icons/fi";

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        setRelated(data.relatedProducts);
        setActiveImage(0);
        setQuantity(1);
        addRecentlyViewed(data.product);
      } catch (err) {
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to leave a review");
    setSubmittingReview(true);
    try {
      const { data } = await api.post(`/reviews/${id}`, reviewForm);
      setProduct((prev) => ({
        ...prev,
        reviews: data.reviews,
        numReviews: data.reviews.length,
        rating: data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length,
      }));
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review submitted!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Loading product...</div>;
  }
  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Product not found.</div>;
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Products", to: "/products" }, { label: product.title }]} />

      <div className="grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div>
          <div
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-zoom-in"
            onClick={() => setZoom(!zoom)}
          >
            <img
              src={product.images?.[activeImage]?.url || "https://via.placeholder.com/600"}
              alt={product.title}
              className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? "scale-150" : "scale-100"}`}
            />
            <span className="absolute bottom-3 right-3 bg-white/80 dark:bg-gray-900/80 rounded-full p-2 text-sm">
              <FiZoomIn />
            </span>
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-3 mt-4 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 ${
                    i === activeImage ? "border-primary-600" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">{product.brand}</p>
          <h1 className="text-2xl md:text-3xl font-bold mt-1">{product.title}</h1>

          <div className="flex items-center gap-2 mt-3 text-amber-500">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar key={i} className={i < Math.round(product.rating) ? "fill-current" : "text-gray-300"} />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-extrabold text-primary-600">₹{finalPrice.toLocaleString("en-IN")}</span>
            {hasDiscount && (
              <span className="text-lg text-gray-400 line-through">₹{product.price.toLocaleString("en-IN")}</span>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-300 mt-5 leading-relaxed">{product.description}</p>

          <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-3"><FiMinus /></button>
              <span className="w-10 text-center">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="p-3"><FiPlus /></button>
            </div>
            <button
              onClick={() => addToCart(product._id, quantity)}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg"
            >
              <FiShoppingCart /> Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product._id)}
              className={`p-3 rounded-lg border ${isInWishlist(product._id) ? "border-red-500 text-red-500" : "border-gray-300 dark:border-gray-700"}`}
            >
              <FiHeart className={isInWishlist(product._id) ? "fill-current" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-xl font-bold mb-6">Customer Reviews</h2>

        {user && (
          <form onSubmit={submitReview} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5 mb-8 max-w-xl">
            <p className="font-medium mb-2">Write a review</p>
            <div className="flex gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setReviewForm({ ...reviewForm, rating: r })}
                  className={r <= reviewForm.rating ? "text-amber-500" : "text-gray-300"}
                >
                  <FiStar className="fill-current" size={22} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              required
              placeholder="Share your thoughts about this product..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm mb-3"
              rows={3}
            />
            <button disabled={submittingReview} className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        <div className="space-y-4">
          {product.reviews?.length === 0 && <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>}
          {product.reviews?.map((r) => (
            <div key={r._id} className="border-b border-gray-100 dark:border-gray-700 pb-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{r.name}</p>
                <div className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FiStar key={i} size={14} className={i < r.rating ? "fill-current" : "text-gray-300"} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {related.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
