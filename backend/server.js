import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3001;

// Authentication

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is up and Running on http://localhost:${PORT}`);
  connectDB();
});
