import { Router } from "express";
import {
  createPaymentIntent,
  handlePaymentSuccess,
} from "../controllers/paymentController";

const router = Router();

// Route to create payment intent
router.post("/create-payment-intent", createPaymentIntent);

// Route to handle payment success and update user case limit
router.post("/payment-success", handlePaymentSuccess);

export default router;
