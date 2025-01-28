import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true });
    if (password !== confirmPassword) {
      set({ loading: false });
      return toast.error("Password do not match");
    }
    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      set({ user: res.data.user, loading: false });
    } catch (error) {
      set({ loading: false });
      toast.error(
        error.response.data.message || "An error occured, Please try again!! "
      );
    }
  },

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await axios.post("/auth/login", { email, password });
      console.log("User is here", res.data);
      set({ user: res.data, loading: false });
      toast.success(res.data.message); // Show success message from backend
    } catch (error) {
      set({ loading: false });
      const errorMessage =
        error.response?.data?.message || "An error occurred, please try again!";
      toast.error(errorMessage);
    }
  }

  //   signup: async () => {}
}));
