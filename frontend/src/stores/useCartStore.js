import { create } from "zustand";
// import axios from "../lib/axios";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
  cart: [],
  coupon: null,
  total: 0,
  subTotal: 0,
  isCouponApplied: false,

  getCartItems: async () => {
    try {
      const res = await axiosInstance.get("/cart");
      set({ cart: res.data });
      get().calculateTotals();
    } catch (error) {
      set({ cart: [] });
      toast.error(error.response.data.message || "An error occured", {
        id: "login"
      });
    }
  },

  // addToCart: async (product) => {
  //   try {
  //     console.log("Adding to cart:", product._id);

  //     await axios.post("/cart", { productId: product._id });

  //     if (!response.data.cartItems) {
  //       throw new Error("Cart items not returned from API");
  //     }

  //     toast.success("Product added to cart");

  //     set((prevState) => {
  //       const existingItem = prevState.cart.find(
  //         (item) => item._id.toString() === product._id.toString()
  //       );
  //       const newCart = existingItem
  //         ? prevState.cart.map((item) =>
  //             item._id === product._id
  //               ? { ...item, quantity: (item.quantity || 1) + 1 }
  //               : item
  //           )
  //         : [...prevState.cart, { ...product, quantity: 1 }];
  //       return { cart: newCart };
  //     });
  //     get().calculateTotals();
  //   } catch (error) {
  //     console.error("Cart API Error:", error);

  //     let errorMessage = "Failed to add product to cart";
  //     if (
  //       error.response &&
  //       error.response.data &&
  //       error.response.data.message
  //     ) {
  //       errorMessage = error.response.data.message;
  //     }

  //     toast.error(errorMessage, { id: "login" });
  //   }
  // },

  addToCart: async (product) => {
    try {
      await axiosInstance.post("/cart", { productId: product._id });
      toast.success("Product added to cart ");

      set((prevState) => {
        const existingItem = prevState.cart.find(
          (item) => item._id === product._id
        );
        const newCart = existingItem
          ? prevState.cart.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...prevState.cart, { ...product, quantity: 1 }];
        return { cart: newCart };
      });
      get().calculateTotals();
    } catch (error) {
      toast.error(error.response.data.message || "An error occurred");
    }
  },

  removeFromCart: async (productId) => {
    await axiosInstance.delete(`/cart`, { data: { productId } });

    set((prevState) => ({
      cart: prevState.cart.filter((item) => item._id !== productId)
    }));
    get().calculateTotals(); //recalculate the total after delete item
  },

  updateQuantity: async (productId, quantity) => {
    try {
      // console.log("Quantity Hit");
      console.log("Updating quantity for:", productId, "to", quantity);
      console.log(
        "Using axiosInstance with Base URL:",
        axiosInstance.defaults.baseURL
      );

      if (!productId) {
        console.error("Invalid productId detected:", productId);
        return; // Prevent the API call if productId is missing
      }

      if (quantity === 0) {
        get().removeFromCart(productId);
        return;
      }

      console.log(
        `Making PUT request to: ${axiosInstance.defaults.baseURL}/cart/${productId}`
      );

      const response = await axiosInstance.put(`/cart/${productId}`, {
        quantity
      });
      console.log("API response:", response.data);

      if (response.status === 200) {
        set((prevState) => ({
          cart: prevState.cart.map((item) =>
            item._id === productId ? { ...item, quantity } : item
          )
        }));
        get().calculateTotals();
        // console.log("Calculate total : ", get().calculateTotals());
        
      } else {
        console.error("Failed to update quantity:", response);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  },

  calculateTotals: () => {
    const { cart, coupon } = get();
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let total = subtotal;
    console.log("Total Subtotal : ", total);
    
    if (coupon) {
      const discount = subtotal * (coupon.discountPercentage / 100);
      total = subtotal - discount;
    }

    set({ subtotal, total });
  }
}));
