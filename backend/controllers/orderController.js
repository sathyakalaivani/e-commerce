import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// @desc Create Stripe payment intent for the current cart
// @route POST /api/orders/create-payment-intent
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  let itemsPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.coupon?.discountPercent
    ? (itemsPrice * cart.coupon.discountPercent) / 100
    : 0;
  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const totalAmount = Math.round((itemsPrice - discount + shippingPrice) * 100) / 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100), // cents/paise
    currency: "inr",
    metadata: { userId: req.user._id.toString() },
  });

  res.status(200).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    itemsPrice,
    discount,
    shippingPrice,
    totalAmount,
  });
});

// @desc Create order after successful payment (or COD)
// @route POST /api/orders
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, stripePaymentIntentId } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ success: false, message: "Cart is empty" });
  }

  const itemsPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = cart.coupon?.discountPercent ? (itemsPrice * cart.coupon.discountPercent) / 100 : 0;
  const shippingPrice = itemsPrice > 999 ? 0 : 49;
  const totalAmount = Math.round((itemsPrice - discount + shippingPrice) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    items: cart.items.map((item) => ({
      product: item.product._id,
      title: item.product.title,
      image: item.product.images?.[0]?.url || "",
      price: item.price,
      quantity: item.quantity,
    })),
    shippingAddress,
    payment: {
      method: paymentMethod || "stripe",
      status: paymentMethod === "cod" ? "pending" : "paid",
      stripePaymentIntentId,
      paidAt: paymentMethod === "cod" ? undefined : new Date(),
    },
    itemsPrice,
    shippingPrice,
    discount,
    totalAmount,
    trackingHistory: [{ status: "Processing", note: "Order placed successfully" }],
  });

  // Decrease stock and increase sold count
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    });
  }

  // Clear the cart
  cart.items = [];
  cart.coupon = { code: "", discountPercent: 0 };
  await cart.save();

  res.status(201).json({ success: true, order });
});

// @desc Get logged-in user's orders
// @route GET /api/orders/my-orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.status(200).json({ success: true, orders });
});

// @desc Get single order (owner or admin)
// @route GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized to view this order" });
  }

  res.status(200).json({ success: true, order });
});

// @desc Get all orders (admin)
// @route GET /api/orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email").sort("-createdAt");
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc Update order status (admin)
// @route PUT /api/orders/:id/status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.orderStatus = status;
  order.trackingHistory.push({ status, note: note || "" });
  if (status === "Delivered") order.deliveredAt = new Date();

  await order.save();
  res.status(200).json({ success: true, order });
});

// @desc Cancel order (user or admin)
// @route PUT /api/orders/:id/cancel
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  if (["Delivered", "Cancelled"].includes(order.orderStatus)) {
    return res.status(400).json({ success: false, message: `Cannot cancel a ${order.orderStatus} order` });
  }

  order.orderStatus = "Cancelled";
  order.cancelledAt = new Date();
  order.trackingHistory.push({ status: "Cancelled", note: "Order cancelled" });

  // Restock items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, sold: -item.quantity } });
  }

  await order.save();
  res.status(200).json({ success: true, order });
});

// @desc Update refund status (admin)
// @route PUT /api/orders/:id/refund
export const updateRefundStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.payment.status = "refunded";
  order.trackingHistory.push({ status: "Refunded", note: req.body.note || "Refund processed" });
  await order.save();

  res.status(200).json({ success: true, order });
});
