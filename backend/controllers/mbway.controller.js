import { ApiResponse } from "../utils/ApiResponse.js";
import { stripe } from "../config/stripe.config.js";

export const createPaymentIntent = async (req, res) => {
  console.log("hello world");
  const { amount, customerPhone, metadata = {} } = req.body;

  if (!amount || typeof amount !== "number" || amount < 50) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "Invalid amount. Must be a number in cents, minimum 50 (€0.50)",
        ),
      );
  }

  if (!customerPhone) {
    return res
      .status(400)
      .json(
        new ApiResponse(
          400,
          {},
          "customerPhone is required for MB WAY payments",
        ),
      );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "eur",
      payment_method_types: ["mb_way"],
      payment_method_data: {
        type: "mb_way",
        billing_details: {
          phone: customerPhone,
        },
      },
      confirm: true,
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

export const getPaymentStatus = async (req, res) => {
  const { paymentIntentId } = req.params;

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    console.log(paymentIntent);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          status: paymentIntent.status,
          id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
        "Payment Status Retrieved Successfully",
      ),
    );
  } catch (error) {
    console.error("[MBWay] Retrieve PaymentIntent error:", error.message);
    return res
      .status(501)
      .json(
        new ApiResponse(500, {}, `Internal Server error: ${error.message}`),
      );
  }
};

export const createFullRefund = async (req, res) => {
  const { paymentIntentId, reason = "requested_by_customer" } = req.body;

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: "paymentIntentId is required",
    });
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason,
    });

    const mbwayRef = refund.destination_details?.mb_way?.reference ?? null;
    const mbwayRefStatus =
      refund.destination_details?.mb_way?.reference_status ?? null;

    return res.status(200).json({
      success: true,
      message: "Refund initiated successfully",
      data: {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        currency: refund.currency,
        paymentIntentId: refund.payment_intent,
        mbwayReference: mbwayRef,
        mbwayReferenceStatus: mbwayRefStatus,
        reason: refund.reason,
        createdAt: refund.created,
      },
    });
  } catch (error) {
    console.error("[Refund] Full refund error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};
