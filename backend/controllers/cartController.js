import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Simple in-memory coupon list (in a real app this would be its own model/collection)
const COUPONS = {
  SAVE10: 10,
  SAVE20: 20,
  WELCOME5: 5,
};

export const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.status(200).json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  if (product.stock < quantity) {
    return res.status(400).json({ success: false, message: "Not enough stock available" });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.discountPrice > 0 ? product.discountPrice : product.price,
    });
  }

  await cart.save();
  const populated = await cart.populate("items.product");
  res.status(200).json({ success: true, cart: populated });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const populated = await cart.populate("items.product");
  res.status(200).json({ success: true, cart: populated });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();

  const populated = await cart.populate("items.product");
  res.status(200).json({ success: true, cart: populated });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    cart.coupon = { code: "", discountPercent: 0 };
    await cart.save();
  }
  res.status(200).json({ success: true, message: "Cart cleared" });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const discountPercent = COUPONS[code?.toUpperCase()];

  if (!discountPercent) {
    return res.status(400).json({ success: false, message: "Invalid coupon code" });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

  cart.coupon = { code: code.toUpperCase(), discountPercent };
  await cart.save();

  const populated = await cart.populate("items.product");
  res.status(200).json({ success: true, cart: populated, message: `Coupon applied: ${discountPercent}% off` });
});
