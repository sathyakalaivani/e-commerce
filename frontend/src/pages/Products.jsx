
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
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [keyword, setKeyword] = useState(
    searchParams.get("keyword") || ""
  );

  const debouncedKeyword = useDebounce(keyword, 500);

  const [priceRange, setPriceRange] = useState({
    min: "",
    max: "",
  });

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );

  const [selectedBrand, setSelectedBrand] = useState("");
  const [minRating, setMinRating] = useState("");

  const [sort, setSort] = useState(
    searchParams.get("sort") || "-createdAt"
  );

  const page = Math.max(
    1,
    Number(searchParams.get("page")) || 1
  );

  // Load categories
  useEffect(() => {
    let cancelled = false;

    const loadCategories = async () => {
      try {
        const { data } = await api.get("/categories");

        if (!cancelled) {
          setCategories(
            Array.isArray(data.categories)
              ? data.categories
              : []
          );

          console.log("Categories API response:", data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Failed to load categories:",
            err.response?.status,
            err.response?.data || err.message
          );
        }
      }
    };

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load products
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      const params = {
        page,
        sort,
        limit: 12,
      };

      if (debouncedKeyword.trim()) {
        params.keyword = debouncedKeyword.trim();
      }

      if (selectedCategory) {
        params.category = selectedCategory;
      }

      if (selectedBrand.trim()) {
        params.brand = selectedBrand.trim();
      }

      if (priceRange.min !== "") {
        params["price[gte]"] = priceRange.min;
      }

      if (priceRange.max !== "") {
        params["price[lte]"] = priceRange.max;
      }

      if (minRating) {
        params["rating[gte]"] = minRating;
      }

      if (searchParams.get("featured") === "true") {
        params.featured = true;
      }

      try {
        const { data } = await api.get("/products", {
          params,
        });

        console.log("Products API response:", data);

        if (cancelled) return;

        // Backend returns products inside data.products
        const productList = Array.isArray(data.products)
          ? data.products
          : [];

        setProducts(productList);
        setTotalPages(
          Math.max(1, Number(data.totalPages) || 1)
        );
      } catch (err) {
        console.error(
          "Failed to load products:",
          err.response?.status,
          err.response?.data || err.message
        );

        if (!cancelled) {
          setProducts([]);
          setTotalPages(1);
          setError(
            err.response?.data?.message ||
              "Unable to load products. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    debouncedKeyword,
    selectedCategory,
    selectedBrand,
    priceRange,
    minRating,
    sort,
    page,
    searchParams,
  ]);

  // Update page
  const updatePage = (p) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(p));
    setSearchParams(nextParams);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Clear filters
  const clearFilters = () => {
    setKeyword("");
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange({
      min: "",
      max: "",
    });
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
          <FiFilter />
          Filters
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <aside
          className={`${
            showFilters ? "block" : "hidden"
          } md:block md:col-span-1 space-y-6`}
        >
          <div className="flex items-center justify-between md:hidden">
            <h3 className="font-semibold">Filters</h3>

            <button
              onClick={() => setShowFilters(false)}
              aria-label="Close filters"
            >
              <FiX />
            </button>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Search
            </label>

            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Category
            </label>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Brand
            </label>

            <input
              type="text"
              value={selectedBrand}
              onChange={(e) =>
                setSelectedBrand(e.target.value)
              }
              placeholder="e.g. Nike"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {/* Price range */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Price Range (₹)
            </label>

            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    min: e.target.value,
                  }))
                }
                className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />

              <input
                type="number"
                min="0"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((prev) => ({
                    ...prev,
                    max: e.target.value,
                  }))
                }
                className="w-1/2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          {/* Minimum rating */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Minimum Rating
            </label>

            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">Any Rating</option>

              {[4, 3, 2, 1].map((rating) => (
                <option key={rating} value={rating}>
                  {rating}+ Stars
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="text-sm text-primary-600 font-medium hover:underline"
          >
            Clear all filters
          </button>
        </aside>

        {/* Products section */}
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

          {/* Loading skeletons */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          )}

          {/* API error */}
          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>

              <button
                onClick={() => {
                  setError("");
                  setLoading(true);
                  // Trigger a new request by changing the URL page.
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set("_retry", String(Date.now()));
                  setSearchParams(nextParams);
                }}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white"
              >
                Try again
              </button>
            </div>
          )}

          {/* Product cards */}
          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && products.length === 0 && (
            <p className="text-center text-gray-500 py-16">
              No products found matching your filters.
            </p>
          )}

          {/* Pagination */}
          {!loading && !error && products.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={updatePage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
