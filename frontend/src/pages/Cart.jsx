import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMinus, FiPlus, FiTrash2, FiTag } from "react-icons/fi";
import { useCart } from "../context/CartContext.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, applyCoupon, itemsPrice, discount, shippingPrice, totalAmount } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const navigate = useNavigate();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Shopping Cart" }]} />
      <h1 className="text-2xl font-bold mb-6">Shopping Cart ({cart.items.length})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.product._id} className="flex gap-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
              <img
                src={item.product.images?.[0]?.url || "https://placehold.co/100"}
                alt={item.product.title}
                className="h-24 w-24 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product._id}`} className="font-medium hover:text-primary-600 line-clamp-1">
                  {item.product.title}
                </Link>
                <p className="text-sm text-gray-500 mt-1">₹{item.price.toLocaleString("en-IN")} each</p>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg">
                    <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="p-2"><FiMinus size={14} /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="p-2"><FiPlus size={14} /></button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                    <button onClick={() => removeFromCart(item.product._id)} className="text-red-500 hover:text-red-600">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 h-fit">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
            <button
              onClick={() => applyCoupon(couponCode)}
              className="px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg font-medium"
            >
              Apply
            </button>
          </div>
          {cart.coupon?.code && (
            <p className="text-xs text-green-600 mb-4">Coupon "{cart.coupon.code}" applied ({cart.coupon.discountPercent}% off)</p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{itemsPrice.toLocaleString("en-IN")}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString("en-IN")}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</span></div>
            <div className="border-t border-gray-100 dark:border-gray-700 pt-2 flex justify-between font-bold text-base">
              <span>Total</span><span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg mt-6"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
