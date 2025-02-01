import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import {  MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";


// const stripePromise = loadStripe(
//   "YOUR STRIP KEY"
// );
const stripePromise = loadStripe(
  "pk_test_51PDEcrCdn0HlYtcbafQKHoJTq4csJHjLZ9qYUGi08MoVaAozSbyRmi2QyCf1z02fL8sl0MkAmORyueprc8bNNYfB009lu2hpGB"
);

console.log("Stripe Key:", stripePromise);

// console.log(stripePromise);

const OrderSummary = () => {
  const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

  // const { total, subtotal } = useCartStore();
  const formattedSubtotal = subtotal.toFixed(2);
  const savings = subtotal - total;
  const formattedTotal = total.toFixed(2);
  const formattedSavings = savings.toFixed(2);

  const handlePayment = async () => {
    try {
      console.log("I am handling Payment through Stripe..");

      const stripe = await stripePromise;
      console.log("✅ Stripe Payment : ", stripe);

      const response = await axios.post("/payments/create-checkout-session", {
        products: cart,
        couponCode: coupon ? coupon.code : null
      });

      console.log("🔍 Full API Response:", response.data);

      // ✅ Check if session exists before accessing `id`
      // if (!response.data || !response.data.id) {
      //   throw new Error("Invalid session response from backend");
      // }
      if (!response.data || !response.data.session) {
        console.error(
          "❌ Backend did not return a session. Response:",
          response.data
        );
        throw new Error("Invalid session response from backend");
      }


      // ✅ Extract session from response correctly
      // const session = res.data;
      // const sessionId = response.data.id;
      const sessionId = response.data.session.id;

      console.log("✅ Stripe Session ID:", sessionId);

      // ✅ Redirect to Stripe checkout
      // const result = await stripe.redirectToCheckout({
      //   sessionId: session.id
      // });

      // ✅ Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({ sessionId: sessionId });

      if (result.error) {
        console.error("❌ Error in Payment checkout:", result.error);
      }
    } catch (error) {
      console.error("🔴 Error in handlePayment:", error);
    }
  };

  return (
    <>
      <motion.div
        className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xl font-semibold text-emerald-400">Order summary</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Original price
              </dt>
              <dd className="text-base font-medium text-white">
                ${formattedSubtotal}
              </dd>
            </dl>

            {savings > 0 && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-300">Savings</dt>
                <dd className="text-base font-medium text-emerald-400">
                  -${formattedSavings}
                </dd>
              </dl>
            )}

            {coupon && isCouponApplied && (
              <dl className="flex items-center justify-between gap-4">
                <dt className="text-base font-normal text-gray-300">
                  Coupon : ({coupon.code})
                </dt>
                <dd className="text-base font-medium text-emerald-400">
                  -{coupon.discountPercentage}%
                </dd>
              </dl>
            )}
            <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
              <dt className="text-base font-bold text-white">Total</dt>
              <dd className="text-base font-bold text-emerald-400">
                ${formattedTotal}
              </dd>
            </dl>
          </div>

          <motion.button
            className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
          >
            Proceed to Checkout
          </motion.button>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm font-normal text-gray-400">or</span>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
            >
              Continue Shopping
              <MoveRight size={16} />
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default OrderSummary;
