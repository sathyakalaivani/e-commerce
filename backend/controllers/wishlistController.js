import Wishlist from "../models/Wishlist.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate("products");
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  res.status(200).json({ success: true, wishlist });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });

  if (!wishlist.products.includes(productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  wishlist = await wishlist.populate("products");
  res.status(200).json({ success: true, wishlist });
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) return res.status(404).json({ success: false, message: "Wishlist not found" });

  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();

  const populated = await wishlist.populate("products");
  res.status(200).json({ success: true, wishlist: populated });
});
