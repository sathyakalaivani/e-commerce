import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import { FiUsers, FiBox, FiShoppingBag, FiDollarSign } from "react-icons/fi";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-gray-500">Loading dashboard...</p>;

  const cards = [
    { label: "Total Users", value: data.stats.totalUsers, icon: <FiUsers />, color: "bg-blue-500" },
    { label: "Total Products", value: data.stats.totalProducts, icon: <FiBox />, color: "bg-purple-500" },
    { label: "Total Orders", value: data.stats.totalOrders, icon: <FiShoppingBag />, color: "bg-orange-500" },
    { label: "Revenue", value: `₹${data.stats.revenue.toLocaleString("en-IN")}`, icon: <FiDollarSign />, color: "bg-green-500" },
  ];

  const maxSales = Math.max(...data.salesChart.map((d) => d.totalSales), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-5">
            <div className={`h-10 w-10 rounded-lg ${c.color} text-white flex items-center justify-center mb-3`}>{c.icon}</div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Sales chart (simple bar chart, no extra dependency needed) */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-4">Sales — Last 14 Days</h2>
        {data.salesChart.length === 0 ? (
          <p className="text-sm text-gray-500">No sales data yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-48">
            {data.salesChart.map((d) => (
              <div key={d._id} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full bg-primary-500 hover:bg-primary-600 rounded-t-md transition-all"
                  style={{ height: `${(d.totalSales / maxSales) * 100}%`, minHeight: "4px" }}
                  title={`₹${d.totalSales.toLocaleString("en-IN")}`}
                />
                <span className="text-[10px] text-gray-400 mt-1 rotate-45 origin-left whitespace-nowrap">{d._id.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-6">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
                <th className="pb-2">Order ID</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o._id} className="border-b border-gray-50 dark:border-gray-700/50">
                  <td className="py-2">
                    <Link to={`/admin/orders`} className="text-primary-600 hover:underline">#{o._id.slice(-8).toUpperCase()}</Link>
                  </td>
                  <td className="py-2">{o.user?.name}</td>
                  <td className="py-2">{o.orderStatus}</td>
                  <td className="py-2 text-right">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
