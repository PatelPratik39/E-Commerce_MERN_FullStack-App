import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res) => {
  try {
    console.log("🔹 Fetching coupon for user:", req.user?._id); 
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true
    });
    console.log("🔹 Coupon found:", coupon);
    res.json(coupon || null);
  } catch (error) {
    console.log("🚨 Error in getCoupon controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    console.log("🔹 Incoming Coupon Validation Request:", req.body);
    console.log("🔹 Authenticated User:", req.user);

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res.status(404).json({ message: "Coupon expired ⁉️" });
    }
    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage
    });
  } catch (error) {
    console.log("Error in validateCoupon controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
