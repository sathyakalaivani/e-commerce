import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { FiCheckCircle, FiPackage, FiTruck, FiHome, FiXCircle } from "react-icons/fi";

const steps = ["Processing", "Shipped", "Out for Delivery", "Delivered"];
const stepIcons = { Processing: <FiPackage />, Shipped: <FiTruck />, "Out for Delivery": <FiTruck />, Delivered: <FiHome /> };

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => api.get(`/orders/${id}`).then((res) => setOrder(res.data.order)).finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Loading order...</div>;
  if (!order) return <div className="max-w-4xl mx-auto px-4 py-16 text-center text-gray-500">Order not found.</div>;

  const currentStepIndex = steps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs items={[{ label: "My Orders", to: "/orders" }, { label: `#${order._id.slice(-8).toUpperCase()}` }]} />
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Order #{order._id.slice(-8).toUpperCase()}</h1>
        {!isCancelled && !["Delivered"].includes(order.orderStatus) && (
          <button onClick={cancelOrder} className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
            Cancel Order
          </button>
        )}
      </div>

      {/* Tracking */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 mb-6">
        {isCancelled ? (
          <div className="flex items-center gap-3 text-red-600">
            <FiXCircle size={24} /> <span className="font-medium">This order was cancelled.</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex-1 flex flex-col items-center text-center relative">
                {i > 0 && <div className={`absolute top-4 -left-1/2 w-full h-0.5 ${i <= currentStepIndex ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"}`} />}
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm relative z-10 ${i <= currentStepIndex ? "bg-primary-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"}`}>
                  {i <= currentStepIndex ? <FiCheckCircle /> : stepIcons[s]}
                </div>
                <p className="text-xs mt-2 font-medium">{s}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold mb-4">Items</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <img src={item.image || "https://via.placeholder.com/60"} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}</p>
                  </div>
                  <p className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Tracking History</h2>
            <div className="space-y-3">
              {order.trackingHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="text-sm flex justify-between">
                  <span className="font-medium">{h.status} {h.note && `— ${h.note}`}</span>
                  <span className="text-gray-500">{new Date(h.date).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Shipping Address</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 && `, ${order.shippingAddress.line2}`}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}<br />
              Phone: {order.shippingAddress.phone}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
            <h2 className="font-semibold mb-3">Payment Summary</h2>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Method</span><span className="capitalize">{order.payment.method}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize">{order.payment.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Items</span><span>₹{order.itemsPrice.toLocaleString("en-IN")}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount.toLocaleString("en-IN")}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shippingPrice === 0 ? "Free" : `₹${order.shippingPrice}`}</span></div>
              <div className="flex justify-between font-bold border-t border-gray-100 dark:border-gray-700 pt-2 mt-1"><span>Total</span><span>₹{order.totalAmount.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
