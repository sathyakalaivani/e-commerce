import express from "express";
import { createReview, updateReview, deleteReview, getAllReviews } from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, admin, getAllReviews);
router.post("/:productId", protect, createReview);
router.put("/:productId/:reviewId", protect, updateReview);
router.delete("/:productId/:reviewId", protect, deleteReview);

export default router;
