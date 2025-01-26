import Product from "../models/product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); //find All Products
    res.json({ products });
  } catch (error) {
    console.error("Error getting All Products", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
