import { ApiResponse } from "../utils/ApiResponse.js";
import { stripe } from "../config/stripe.config.js";

export const createPaymentIntent = async (req, res) => {
  console.log("hello world");
  const { amount, customerPhone, metadata = {} } = req.body;

  if (!amount || typeof amount !== "number" || amount < 50) {
    return res.status(400).json({
      error: "Invalid amount. Must be a number in cents, minimum 50 (€0.50)",
    });
  }

  if (!customerPhone) {
    return res.status(400).json({
      error: "customerPhone is required for MB WAY payments",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["mb_way"],
      metadata: { ...metadata, customerPhone },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
        "Payment Intent Created Successfully",
      ),
    );
  } catch (error) {
    console.error("[MBWay] Create PaymentIntent error:", error.message);
    return res
      .status(501)
      .json(
        new ApiResponse(500, {}, `Internal Server error: ${error.message}`),
      );
  }
};
