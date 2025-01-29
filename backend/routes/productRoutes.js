import express from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  fetchProductsByCategory,
  toggleFeaturedProduct
} from "../controller/product.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", fetchProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectedRoute, adminRoute, createProduct);
router.patch("/:id", protectedRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectedRoute, adminRoute, deleteProduct);

export default router;
