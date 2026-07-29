import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import ProductCard from "../components/ProductCard.jsx";
import ProductCardSkeleton from "../components/ProductCardSkeleton.jsx";
import Pagination from "../components/Pagination.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import useDebounce from "../hooks/useDebounce.js";
import { FiFilter, FiX } from "react-icons/fi";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const debouncedKeyword = useDebounce(keyword, 500);

  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sort, setSort] = useState(searchParams.get("sort") || "-createdAt");
  const page = Number(searchParams.get("page")) || 1;

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = { page, sort, limit: 12 };
      if (debouncedKeyword) params.keyword = debouncedKeyword;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedBrand) params.brand = selectedBrand;
      if (priceRange.min) params["price[gte]"] = priceRange.min;
      if (priceRange.max) params["price[lte]"] = priceRange.max;
      if (minRating) params["rating[gte]"] = minRating;
      if (searchParams.get("featured")) params.featured = true;

      try {
        const { data } = await api.get("/products", { params });
        setProducts(data.products);
        setTotalPages(data.totalPages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword, selectedCategory, selectedBrand, priceRange, minRating, sort, page]);

  const updatePage = (p) => {
    searchParams.set("page", p);
    setSearchParams(searchParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({ min: "", max: "" });
    setMinRating("");
    setSort("-createdAt");
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Products" }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">All Products</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-lg text-sm"
        >
          <FiFilter /> Filters
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? "block" : "hidden"} md:block md:col-span-1 space-y-6`}>
          <div className="flex items-center justify-between md:hidden">
            <h3 className="font-semibold">Filters</h3>
            <button onClick={() => setShowFilters(false)}><FiX /></button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            <input
              type="text"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              placeholder="e.g. Nike"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price Range (₹)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">Any Rating</option>
              {[4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r}+ Stars</option>
              ))}
            </select>
          </div>

          <button onClick={clearFilters} className="text-sm text-primary-600 font-medium hover:underline">
            Clear all filters
          </button>
        </aside>

        {/* Product grid */}
        <div className="md:col-span-3">
          <div className="flex items-center justify-end mb-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="-createdAt">Newest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-rating">Top Rated</option>
              <option value="-sold">Best Selling</option>
            </select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
            {loading
              ? Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>

          {!loading && products.length === 0 && (
            <p className="text-center text-gray-500 py-16">No products found matching your filters.</p>
          )}

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={updatePage} />
        </div>
      </div>
    </div>
  );
}
