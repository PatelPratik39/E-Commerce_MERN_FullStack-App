import express from "express";
import { protectedRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession } from "../controller/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectedRoute, createCheckoutSession);

export default router;
