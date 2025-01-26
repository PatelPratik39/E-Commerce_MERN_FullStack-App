import express from "express";
import {
  createProject,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts
} from "../controller/product.controller.js";
import { protectedRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectedRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.post("/", protectedRoute, adminRoute, createProject);
router.delete("/:id", protectedRoute, adminRoute, deleteProduct);

export default router;
