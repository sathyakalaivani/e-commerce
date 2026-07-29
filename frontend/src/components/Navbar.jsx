import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiMenu, FiX, FiSun, FiMoon, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?keyword=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link to="/" className="text-xl font-extrabold text-primary-600 shrink-0">
            Shop<span className="text-gray-900 dark:text-white">MERN</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands and more..."
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <FiSearch />
              </button>
            </div>
          </form>

          <nav className="hidden md:flex items-center gap-5">
            <Link to="/products" className="text-sm font-medium hover:text-primary-600">Shop</Link>
            <button onClick={toggleTheme} aria-label="Toggle dark mode" className="text-lg hover:text-primary-600">
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
            <Link to="/wishlist" className="relative text-lg hover:text-primary-600">
              <FiHeart />
            </Link>
            <Link to="/cart" className="relative text-lg hover:text-primary-600">
              <FiShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1 text-sm font-medium">
                  <FiUser /> {user.name.split(" ")[0]}
                </button>
                <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Profile</Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">My Orders</Link>
                  {user.role === "admin" && (
                    <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Admin Dashboard</Link>
                  )}
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-semibold bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700">
                Login
              </Link>
            )}
          </nav>

          <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2"><FiSearch /></button>
          </form>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="block py-1">Shop</Link>
          <Link to="/wishlist" onClick={() => setMenuOpen(false)} className="block py-1">Wishlist</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)} className="block py-1">Cart ({cartCount})</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)} className="block py-1">Profile</Link>
              <Link to="/orders" onClick={() => setMenuOpen(false)} className="block py-1">My Orders</Link>
              {user.role === "admin" && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="block py-1">Admin Dashboard</Link>
              )}
              <button onClick={() => { logout(); setMenuOpen(false); }} className="block py-1 text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-1 font-semibold text-primary-600">Login</Link>
          )}
          <button onClick={toggleTheme} className="flex items-center gap-2 py-1">
            {darkMode ? <FiSun /> : <FiMoon />} {darkMode ? "Light" : "Dark"} Mode
          </button>
        </div>
      )}
    </header>
  );
}
