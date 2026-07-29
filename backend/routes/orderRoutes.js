import express from "express";
import {
  createPaymentIntent,
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  updateRefundStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.post("/create-payment-intent", createPaymentIntent);
router.post("/", createOrder);
router.get("/my-orders", getMyOrders);
router.get("/", admin, getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id/status", admin, updateOrderStatus);
router.put("/:id/cancel", cancelOrder);
router.put("/:id/refund", admin, updateRefundStatus);

export default router;
