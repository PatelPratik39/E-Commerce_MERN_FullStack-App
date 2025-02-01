import express from "express";
import {
  getAnalyticsData,
  getDailySalesData
} from "../controller/analytics.controller.js";
import { adminRoute, protectedRoute } from "../middleware/auth.middleware.js";

const router = express.Router();
// router.get("/", protectedRoute,adminRoute, getAnalyticsData);

router.get("/", protectedRoute, adminRoute, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const analyticsData = await getAnalyticsData();
    const dailySalesData = await getDailySalesData(startDate, endDate);

    res.json({
      analyticsData,
      dailySalesData
    });
  } catch (error) {
    console.log("Error in analytics.route.js file", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
