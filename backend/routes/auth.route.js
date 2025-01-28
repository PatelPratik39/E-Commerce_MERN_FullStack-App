import express from "express";
import {
  login,
  logout,
  signup,
  refreshToken,
  getProfile
} from "../controller/auth.controller.js";
import { protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.get("/profile", protectedRoute, getProfile);

export default router;
