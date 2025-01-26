import express from "express";
import {
  createProject,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getRecommendedProducts,
  getProductCategory,
  toggleFeaturedProduct
} from "../controller/product.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectedRoute, adminRoute, createProject);
router.patch("/:id", protectedRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", protectedRoute, adminRoute, deleteProduct);

export default router;
