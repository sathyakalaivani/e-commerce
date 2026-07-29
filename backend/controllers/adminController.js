import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc Get admin dashboard stats
// @route GET /api/admin/dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const revenueAgg = await Order.aggregate([
    { $match: { "payment.status": "paid" } },
    { $group: { _id: null, revenue: { $sum: "$totalAmount" } } },
  ]);
  const revenue = revenueAgg[0]?.revenue || 0;

  // Sales chart data: revenue grouped by day for the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const salesChart = await Order.aggregate([
    { $match: { createdAt: { $gte: fourteenDaysAgo }, "payment.status": "paid" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSales: { $sum: "$totalAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const recentOrders = await Order.find().populate("user", "name email").sort("-createdAt").limit(5);

  res.status(200).json({
    success: true,
    stats: { totalUsers, totalProducts, totalOrders, revenue },
    salesChart,
    recentOrders,
  });
});
