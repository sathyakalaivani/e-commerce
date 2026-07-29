import Product from "../models/Product.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc Create a review for a product
// @route POST /api/reviews/:productId
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) {
    return res.status(400).json({ success: false, message: "You already reviewed this product" });
  }

  product.reviews.push({ user: req.user._id, name: req.user.name, rating, comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;

  await product.save();
  res.status(201).json({ success: true, reviews: product.reviews });
});

// @desc Update own review
// @route PUT /api/reviews/:productId/:reviewId
export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const review = product.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });
  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  if (rating) review.rating = rating;
  if (comment) review.comment = comment;

  product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
  await product.save();

  res.status(200).json({ success: true, reviews: product.reviews });
});

// @desc Delete a review (owner or admin)
// @route DELETE /api/reviews/:productId/:reviewId
export const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });

  const review = product.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });

  if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  product.reviews = product.reviews.filter((r) => r._id.toString() !== req.params.reviewId);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  await product.save();
  res.status(200).json({ success: true, reviews: product.reviews });
});

// @desc Get all reviews across products (admin)
// @route GET /api/reviews
export const getAllReviews = asyncHandler(async (req, res) => {
  const products = await Product.find({ "reviews.0": { $exists: true } }).select("title reviews");
  const reviews = products.flatMap((p) =>
    p.reviews.map((r) => ({ ...r.toObject(), productId: p._id, productTitle: p.title }))
  );
  res.status(200).json({ success: true, count: reviews.length, reviews });
});
