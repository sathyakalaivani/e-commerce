import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

// Publishable key should be set via Vite env var VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

export default function Checkout() {
  const { user } = useAuth();
  const { cart, itemsPrice, discount, shippingPrice, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [clientSecret, setClientSecret] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (cart.items.length === 0) navigate("/cart");
  }, [cart, navigate]);

  const goToPayment = async (e) => {
    e.preventDefault();
    if (paymentMethod === "stripe") {
      try {
        const { data } = await api.post("/orders/create-payment-intent");
        setClientSecret(data.clientSecret);
      } catch (err) {
        toast.error("Could not initialize payment");
        return;
      }
    }
    setStep(2);
  };

  const placeCodOrder = async () => {
    try {
      const { data } = await api.post("/orders", { shippingAddress: address, paymentMethod: "cod" });
      await clearCart();
      toast.success("Order placed successfully!");
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "Cart", to: "/cart" }, { label: "Checkout" }]} />
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 && (
            <form onSubmit={goToPayment} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 space-y-4">
              <h2 className="font-semibold text-lg mb-2">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Full Name" value={address.fullName} onChange={(v) => setAddress({ ...address, fullName: v })} required />
                <Input label="Phone" value={address.phone} onChange={(v) => setAddress({ ...address, phone: v })} required />
              </div>
              <Input label="Address Line 1" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} required />
              <Input label="Address Line 2 (optional)" value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} />
              <div className="grid sm:grid-cols-3 gap-4">
                <Input label="City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} required />
                <Input label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} required />
                <Input label="Postal Code" value={address.postalCode} onChange={(v) => setAddress({ ...address, postalCode: v })} required />
              </div>
              <Input label="Country" value={address.country} onChange={(v) => setAddress({ ...address, country: v })} required />

              <h2 className="font-semibold text-lg mt-6 mb-2">Payment Method</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer">
                  <input type="radio" checked={paymentMethod === "stripe"} onChange={() => setPaymentMethod("stripe")} />
                  <span>Credit / Debit Card (Stripe)</span>
                </label>
                <label className="flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer">
                  <input type="radio" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg mt-4">
                Continue
              </button>
            </form>
          )}

          {step === 2 && paymentMethod === "stripe" && clientSecret && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Payment Details</h2>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <StripeCheckoutForm address={address} clearCart={clearCart} clientSecret={clientSecret} />
              </Elements>
            </div>
          )}

          {step === 2 && paymentMethod === "cod" && (
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Confirm Cash on Delivery Order</h2>
              <p className="text-gray-500 text-sm mb-4">You'll pay ₹{totalAmount.toLocaleString("en-IN")} when your order arrives.</p>
              <button onClick={placeCodOrder} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg">
                Place Order
              </button>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 h-fit">
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
            {cart.items.map((item) => (
              <div key={item.product._id} className="flex justify-between text-sm">
                <span className="line-clamp-1">{item.product.title} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 text-sm border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>₹{itemsPrice.toLocaleString("en-IN")}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{discount.toLocaleString("en-IN")}</span></div>}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}</span></div>
            <div className="flex justify-between font-bold text-base border-t border-gray-100 dark:border-gray-700 pt-2">
              <span>Total</span><span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
      />
    </div>
  );
}

function StripeCheckoutForm({ address, clearCart, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (error) {
      toast.error(error.message);
      setProcessing(false);
      return;
    }

    try {
      const { data } = await api.post("/orders", {
        shippingAddress: address,
        paymentMethod: "stripe",
        stripePaymentIntentId: paymentIntent.id,
      });
      await clearCart();
      toast.success("Payment successful! Order placed.");
      navigate(`/order-success/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order creation failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-4 mb-4">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>
      <button
        disabled={!stripe || processing}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
      <p className="text-xs text-gray-400 mt-2">Test card: 4242 4242 4242 4242, any future date, any CVC.</p>
    </form>
  );
}
