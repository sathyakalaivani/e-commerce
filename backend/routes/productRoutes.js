import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  bulkCreateProducts,
} from "../controllers/productController.js";

import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/featured/list", getFeaturedProducts);
router.get("/new-arrivals/list", getNewArrivals);
router.get("/best-sellers/list", getBestSellers);

// Products
router
  .route("/")
  .get(getProducts)
  .post(protect, admin, createProduct);

// Bulk product upload - Admin only
router.post("/bulk", protect, admin, bulkCreateProducts);

// Single product
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;