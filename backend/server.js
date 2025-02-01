import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentsRoutes from "./routes/payments.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const __dirname = path.resolve();
connectDB();

// app.use(
//   cors({
//     origin: ["https://e-commerce-mern-fullstack-app.onrender.com"],
//     credentials: true
//   })
// );

// localhost --- for development enviroment , 
// app.use(
//   cors({
//     origin: "http://localhost:5173", // ✅ Allow frontend
//     credentials: true, // ✅ Required for authentication cookies
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );

// For Production :// ✅ Enable CORS
app.use(
  cors({
    origin: "https://e-commerce-mern-fullstack-app.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Authentication

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  // ✅ Prevent API Calls from Being Redirected to React App
  app.get("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });
  
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is up and Running on http://localhost:${PORT}`);
  // connectDB();
});
