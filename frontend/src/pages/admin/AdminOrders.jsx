import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";

const statuses = ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = () => api.get("/orders").then((res) => setOrders(res.data.orders)).finally(() => setLoading(false));

  useEffect(() => { loadOrders(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status, note: `Status updated to ${status}` });
      toast.success("Order status updated");
      loadOrders();
    } catch (err) {
      toast.error("Could not update status");
    }
  };

  const refund = async (id) => {
    if (!window.confirm("Mark this order as refunded?")) return;
    try {
      await api.put(`/orders/${id}/refund`, { note: "Refund processed by admin" });
      toast.success("Order marked as refunded");
      loadOrders();
    } catch (err) {
      toast.error("Could not process refund");
    }
  };

  const cancelOrder = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await api.put(`/orders/${id}/cancel`);
      toast.success("Order cancelled");
      loadOrders();
    } catch (err) {
      toast.error("Could not cancel order");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Payment</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : orders.map((o) => (
              <tr key={o._id} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="p-4">#{o._id.slice(-8).toUpperCase()}</td>
                <td className="p-4">{o.user?.name}<br /><span className="text-xs text-gray-400">{o.user?.email}</span></td>
                <td className="p-4">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                <td className="p-4 capitalize">{o.payment.method} · {o.payment.status}</td>
                <td className="p-4">
                  <select
                    value={o.orderStatus}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs"
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="p-4 text-right space-x-2 whitespace-nowrap">
                  <button onClick={() => cancelOrder(o._id)} className="text-xs text-red-600 hover:underline">Cancel</button>
                  {o.payment.status === "paid" && (
                    <button onClick={() => refund(o._id)} className="text-xs text-primary-600 hover:underline">Refund</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
