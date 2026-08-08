import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import useRecentlyViewed from "../hooks/useRecentlyViewed.js";
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw } from "react-icons/fi";

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { recentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    const load = async () => {
      try {
        const [cat, feat, arr, best] = await Promise.all([
          api.get("/categories"),
          api.get("/products/featured/list"),
          api.get("/products/new-arrivals/list"),
          api.get("/products/best-sellers/list"),
        ]);
        setCategories(cat.data.categories);
        setFeatured(feat.data.products);
        setNewArrivals(arr.data.products);
        setBestSellers(best.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 items-center gap-10">
          <div>
            <span className="inline-block bg-white/20 text-xs font-semibold px-3 py-1 rounded-full mb-4">
              New Season Sale — Up to 40% Off
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4">
              Discover Products You'll Love
            </h1>
            <p className="text-white/90 mb-8 max-w-md">
              Shop the latest in electronics, fashion, home essentials and more — with fast delivery and easy returns.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors"
            >
              Shop Now <FiArrowRight />
            </Link>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?w=700"
              alt="Shopping"
              className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 dark:divide-gray-700">
          {[
            { icon: <FiTruck />, title: "Free Shipping", desc: "On orders over ₹999" },
            { icon: <FiShield />, title: "Secure Payment", desc: "100% protected checkout" },
            { icon: <FiRefreshCw />, title: "Easy Returns", desc: "7-day return policy" },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 p-5">
              <span className="text-2xl text-primary-600">{b.icon}</span>
              <div>
                <p className="font-semibold text-sm">{b.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${cat._id}`}
              className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-3">
                <img
                  src={cat.image?.url || "https://placehold.co/200?text=" + cat.name}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <p className="text-sm font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <ProductSection title="Featured Products" products={featured} loading={loading} link="/products?featured=true" />

      {/* New Arrivals */}
      <ProductSection title="New Arrivals" products={newArrivals} loading={loading} link="/products?sort=-createdAt" />

      {/* Best Sellers */}
      <ProductSection title="Best Sellers" products={bestSellers} loading={loading} link="/products?sort=-sold" />

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-2xl font-bold mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recentlyViewed.map((p) => (
              <Link key={p._id} to={`/products/${p._id}`} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md">
                <img src={p.image} alt={p.title} className="w-full aspect-square object-cover" />
                <p className="text-xs p-2 line-clamp-1">{p.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductSection({ title, products, loading, link }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={link} className="text-sm font-medium text-primary-600 flex items-center gap-1 hover:underline">
          View all <FiArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}
