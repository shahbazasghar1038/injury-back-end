import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import User from "../models/userModel";
import { Op } from "sequelize";
import Case from "../models/caseModel";

// Stripe initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: process.env.STRIPE_API_VERSION as "2025-04-30.basil",
});

// 1. Create Payment Intent
export async function createPaymentIntent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { amount } = req.body; // amount passed from the frontend

  try {
    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // amount in cents
      currency: "usd",
    });

    // Return the client secret to the frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error.message);
    next(error);
  }
}

// 2. Handle Payment Success and Update User Case Limit
export async function handlePaymentSuccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> {
  const { paymentIntentId, userId } = req.body; // PaymentIntent ID and User ID from the frontend

  try {
    // Fetch the payment intent status from Stripe
    const paymentIntent: Stripe.PaymentIntent =
      await stripe.paymentIntents.retrieve(paymentIntentId);

    // Check the payment status
    if (paymentIntent.status === "succeeded") {
      // Payment was successful, update the user's case count
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Increment the user's case limit if they have not exceeded their limit
      if (user.usercaseCount == user.usercaseLimit) {
        user.usercaseCount += 1;
        await user.save();

        return res.status(200).json({
          message: "Payment succeeded. User case limit updated.",
          updatedUser: user,
        });
      } else {
        return res.status(400).json({
          error: "User has already reached the case limit.",
        });
      }
    } else if (paymentIntent.status === "requires_action") {
      // Handle the case where additional action is required (e.g., 3D Secure)
      return res
        .status(400)
        .json({ error: "Payment requires additional action" });
    } else {
      // Handle other payment states like pending, failed, etc.
      return res.status(400).json({ error: "Payment failed or is pending" });
    }
  } catch (error: any) {
    console.error("Error processing payment success:", error.message);
    return res.status(500).json({ error: error.message });
  }
}
