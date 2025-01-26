import express from "express";
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQunatity
} from "../controller/cart.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, getCartProducts);
router.post("/", protectedRoute, addToCart);
router.delete("/", protectedRoute, removeAllFromCart);
router.put("/:id", protectedRoute, updateQunatity);

export default router;
