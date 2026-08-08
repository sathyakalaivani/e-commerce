import { Link } from "react-router-dom";
import { FiFacebook, FiInstagram, FiTwitter, FiMail } from "react-icons/fi";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed! Check your inbox for confirmation.");
    setEmail("");
  };

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-extrabold text-white mb-3">StyleStreet</h3>
          <p className="text-sm text-gray-400">Your one-stop shop for electronics, fashion, home essentials and more — delivered fast.</p>
          <div className="flex gap-3 mt-4 text-lg">
            <a href="#" aria-label="Facebook" className="hover:text-primary-400"><FiFacebook /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary-400"><FiInstagram /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary-400"><FiTwitter /></a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/products?sort=-createdAt" className="hover:text-white">New Arrivals</Link></li>
            <li><Link to="/products?featured=true" className="hover:text-white">Featured</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/orders" className="hover:text-white">Track Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white mb-3">Newsletter</h4>
          <p className="text-sm text-gray-400 mb-3">Get updates on new arrivals and exclusive offers.</p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 px-3 py-2 rounded-l-md text-sm text-gray-900 focus:outline-none"
              required
            />
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 px-3 rounded-r-md">
              <FiMail className="text-white" />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopMERN. All rights reserved.
      </div>
    </footer>
  );
}
