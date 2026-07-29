import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboardStats);

export default router;
