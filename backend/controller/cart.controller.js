import Product from "../models/product.model.js";

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({ _id: { $in: req.user.cartItems } });

    // add quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem.id === product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });

    res.json(cartItems);
  } catch (error) {
    console.log("Error in getCartProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    if (!user.cartItems) {
      user.cartItems = [];
    }
    console.log("🔹 Incoming request:", { userId: user._id, productId });

    const existingItem = user.cartItems.find(
      (item) => item._id.toString() === productId.toString()
    );

    // const existingItem = user.cartItems.find((item) => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
      console.log(`✅ Updated quantity: ${existingItem.quantity}`, );
    } else {
      user.cartItems.push(productId);
      console.log(`✅ Added new product to cart: ${productId}`);
    }

    await user.save();
      console.log("✅ Cart updated successfully:", user.cartItems);
    res.json(user.cartItems);
  } catch (error) {
    console.log("Error in addToCart controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter((item) => item.id !== productId);
    }
    await user.save();
    res.json(user.cartItems);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    const existingItem = user.cartItems.find((item) => item.id === productId);

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter((item) => item.id !== productId);
        await user.save();
        return res.json(user.cartItems);
      }

      existingItem.quantity = quantity;
      await user.save();
      res.json(user.cartItems);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.log("Error in updateQuantity controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// export const updateQuantity = async (req, res) => {
//   try {
//     console.log("Received request:", req.params, req.body);
//     const { id: productId } = req.params;
//     const { quantity } = req.body;

//     if (!productId) {
//       console.error("Error: Missing productId in request params");
//       return res.status(400).json({ message: "Product ID is required" });
//     }
//     if (quantity === undefined) {
//       console.error("Error: Missing quantity in request body");
//       return res.status(400).json({ message: "Quantity is required" });
//     }

//     const user = req.user;

//     // console.log("Updating quantity for:", productId, "Quantity:", quantity);
//     // console.log("User cart items:", user.cartItems);

//     const existingItem = user.cartItems.find((item) => item.id === productId);

//     if (existingItem) {
//       if (quantity === 0) {
//         user.cartItems = user.cartItems.filter((item) => item.id !== productId);
//         await user.save();
//         return res.json(user.cartItems);
//       }

//       existingItem.quantity = quantity;
//       await user.save();
//       return res.status(200).json(user.cartItems);
//       // res.json(user.cartItems);
//     } else {
//       res.status(404).json({ message: " ❌ Product not found" });
//     }
//   } catch (error) {
//     console.log("Error in updateQuantity controller", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
