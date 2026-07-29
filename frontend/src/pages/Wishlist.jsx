import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function Wishlist() {
  const { wishlist } = useWishlist();

  if (wishlist.products.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-6">Save items you love for later.</p>
        <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="text-2xl font-bold mb-6">My Wishlist ({wishlist.products.length})</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {wishlist.products.map((p) => <ProductCard key={p._id} product={p} />)}
      </div>
    </div>
  );
}
