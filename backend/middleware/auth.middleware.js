import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const protectedRoute = async (req, res, next) => {
  try {

    console.log("🔹 Incoming request:", req.method, req.url);
    console.log("🔹 Headers:", req.headers);
    console.log("🔹 Cookies:", req.cookies);


    const accessToken = req.cookies.accessToken;
    if (!accessToken)
      return res
        .status(401)
        .json({ message: "Unauthorized - No accessToken provided !!" });

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) return res.status(401).json({ message: "User not found" });
      console.log("✅ Authenticated User:", req.user);
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Unauthorized - Access Token Expired !! ❌" });
      }
      throw error;
    }
  } catch (error) {
    console.log("Error in protectRoute middleware", error.message);
    return res
      .status(401)
      .json({ message: "Unauthorized - Invalid access token ❌" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied - Admin only" });
  }
};
