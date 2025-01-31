import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
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

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("festured_products");
    if (featuredProducts) {
      return res.json(JSON.parse(featuredProducts));
    }
    // if not in redis, fetch it from mongoDb Database
    // .lean() returns plain javascript object insted of mongodb document
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res
        .status(404)
        .json({ message: "No Featured Products found!!! " });
    }
    // store in redis for feature quick access
    await redis.set("featured_products", JSON.stringify(featuredProducts));

    res.json(featuredProducts);
  } catch (error) {
    console.log("Error in getFeaturedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category, isFeatured } = req.body;
    let cloudinaryResponse = null;
    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products"
      });
    }
    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url
        ? cloudinaryResponse.secure_url
        : "",
      category
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0]; // this will get the id of the image so it can be deleted

      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
        console.log("Image is deleted from cloudinary");
      } catch (error) {
        console.log("error deleting image from cloudinary", error);
      }
    }
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully!!! ✅" });
  } catch (error) {
    console.log("Error in deleteProduct controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// recommanded product -> aggregation pipeline
export const getRecommendedProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      {
        $sample: { size: 3 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1
        }
      }
    ]);

    res.json(products);
  } catch (error) {
    console.log("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

export const fetchProductsByCategory = async (req, res) => {
  // console.log("Category API Hit:", req.params.category);
  const category = req.params.category;
  try {
    const products = await Product.find({ category }); 
    console.log("Products Found:", products);
    res.json({products})
    // console.log({ products });
  } catch (error) {
    console.log("Error in getProductCategory controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// select featured

export const toggleFeaturedProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updatedFeaturedProductCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

async function updatedFeaturedProductCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("feature Product", JSON.stringify(featuredProducts));
  } catch (error) {
    console.log("Error in updatedFeaturedProductCache Function", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
}
