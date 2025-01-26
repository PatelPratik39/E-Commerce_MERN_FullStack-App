import express from "express";
import {
  addToCart,
  getToCart,
  removeAllFromCart,
  updateQunatity
} from "../controller/cart.controller.js";
import { protectedRoute } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", protectedRoute, getToCart);
router.post("/", protectedRoute, addToCart);
router.delete("/", protectedRoute, removeAllFromCart);
router.put("/:id", protectedRoute, updateQunatity);

export default router;
