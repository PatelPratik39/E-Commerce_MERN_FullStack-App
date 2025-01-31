import { stripe } from "../lib/stripe.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import dotenv from "dotenv";

dotenv.config();

export const createCheckoutSession = async (req, res) => {
  try {
    // ✅ Ensure user is authenticated
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized. User not found." });
    }
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100);
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image]
          },
          unit_amount: amount
        },
        quantity: product.quantity || 1
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage)
            }
          ]
        : [],
      // metadata
      metadata: {
        userId: req.user._id?.toString() || "",
        couponCode: couponCode || " ",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price
          }))
        )
      }
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    console.log("🟢 Sending Checkout Session Response:", session);

    // res.json({ session });
    // res.status(200).json({ session: { id: session.id } });
    res.status(200).json({ session: session, totalAmount: totalAmount / 100 });

    // res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.log("Error processing checkout :", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message
    });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    console.log("🔹 Incoming request to /checkout-success");
    const { sessionId } = req.body;

    if (!sessionId) {
      console.log("❌ Missing session ID");
      return res.status(400).json({ error: "Missing session ID 🔴" });
    }

    console.log(`✅ Retrieving Stripe session for sessionId: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log("✅ Stripe Session Retrieved:", session);

    // ✅ Ensure metadata exists before accessing properties
    if (!session.metadata) {
      return res.status(400).json({ error: "Missing metadata in session" });
    }

    if (!session || session.payment_status === "paid") {
      console.log("❌ Invalid Stripe session");
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId
          },
          {
            isActive: false
          }
        );
      }
      // ✅ Ensure `products` metadata exists
      if (!session.metadata.products) {
        return res
          .status(400)
          .json({ error: "Missing products data in session" });
      }

      // ✅ Parse and create order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price
        })),
        totalAmout: session.amount_total / 100,
        stripSessionId: sessionId
      });
      await newOrder.save();
      res.status(200).json({
        success: true,
        message:
          "Payment successful, Order created, and coupon deactivated if used.",
        orderId: newOrder._id
      });
    }
  } catch (error) {
    console.log("Error processing successful checkout : ", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message
    });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once"
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    userId: userId
  });
  await newCoupon.save();
  return newCoupon;
}
