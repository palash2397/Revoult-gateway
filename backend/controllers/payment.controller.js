import { ApiResponse } from "../utils/ApiResponse.js";
import { revolutClient } from "../config/revolut.config.js";

export const createCustomerHandle = async (req, res) => {
  try {
    const { full_name, business_name, email, phone, date_of_birth } = req.body;

    const response = await revolutClient.post("/api/1.0/customers", {
      full_name,
      business_name,
      email,
      phone,
      date_of_birth,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          customer_id: response.data.id,
          data: response.data,
        },
        `customer created successfully`,
      ),
    );
  } catch (error) {
    res.status(400).json({
      error: error.response?.data || error.message,
    });
  }
};

// export const payOrderHandle = async (req, res) => {
//     try {
//         const { order_id, payment_method_id } = req.body;

//         const response = await revolutClient.post(
//             `/api/orders/${order_id}/payments`, // ✅ NO 1.0 here
//             {
//                 saved_payment_method: {
//                     type: "card",
//                     id: payment_method_id,
//                     initiator: "merchant"
//                     // environment: {
//                     //     type: "browser",
//                     //     browser_url: "https://yourapp.com",
//                     //     time_zone_utc_offset: 330,
//                     //     color_depth: 24,
//                     //     screen_width: 1920,
//                     //     screen_height: 1080,
//                     //     java_enabled: false,
//                     //     challenge_window_width: 640,
//                     // },
//                 },
//             },
//         );

//         return res.status(200).json({
//             success: true,
//             data: response.data,
//         });
//     } catch (error) {
//         console.log(`error while paying order`, error);
//         return res.status(400).json({
//             error: error.response?.data || error.message,
//         });
//     }
// };

export const payOrderHandle = async (req, res) => {
  try {
    const { order_id, payment_method_id } = req.body;

    // Step 1: Initiate payment with saved card
    const paymentResponse = await revolutClient.post(
      `/api/orders/${order_id}/payments`,
      {
        saved_payment_method: {
          type: "card",
          id: payment_method_id,
          initiator: "customer",
          environment: {
            type: "browser",
            browser_url: "https://api.tapsi.pt",
            time_zone_utc_offset: 60,
            color_depth: 24,
            screen_width: 1920,
            screen_height: 1080,
            java_enabled: false,
            challenge_window_width: 640,
          },
        },
      },
    );

    const payment = paymentResponse.data;
    const paymentId = payment.id;

    console.log("Initial payment state:", payment.state);

    // Step 2: Poll payment status until we get authentication_challenge or authorised
    const acsUrl = await pollForAcsUrl(order_id, paymentId);

    if (acsUrl) {
      // 3DS required — send acs_url to frontend
      return res.status(200).json({
        success: true,
        requires_action: true,
        redirect_url: acsUrl,
      });
    }
    return res.status(200).json({
      success: true,
      requires_action: false,
      data: payment,
    });
  } catch (error) {
    console.log("error while paying order", error);
    return res.status(400).json({
      error: error.response?.data || error.message,
    });
  }
};

const pollForAcsUrl = async (orderId, paymentId, maxAttempts = 10) => {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 1000)); // wait 1 second

    const response = await revolutClient.get(`/api/payments/${paymentId}`);

    const payment = response.data;
    console.log(`Poll ${i + 1}: state = ${payment.state}`);

    if (payment.state === "authentication_challenge") {
      return payment.authentication_challenge?.acs_url;
    }

    // ✅ No 3DS needed — already passed
    if (
      payment.state === "authorised" ||
      payment.state === "authorisation_passed" ||
      payment.state === "authentication_verified"
    ) {
      return null; // no redirect needed
    }

    if (
      payment.state === "declined" ||
      payment.state === "failed" ||
      payment.state === "cancelled"
    ) {
      throw new Error(
        `Payment ${payment.state}: ${payment.decline_reason || ""}`,
      );
    }
  }

  return null;
};

export const createOrderHandle = async (req, res) => {
  try {
    const { amount, currency, customer_id } = req.body;

    const response = await revolutClient.post("/api/1.0/orders", {
      amount,
      currency,
      customer_id,
      setup_future_usage: "ON_SESSION",
    });

    // console.log("response ----->", response);
    // const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}`;
    const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}&amount=${amount}`;
    return res.status(200).json({
      order_id: response.data.id,
      status: response.data.status,
      data: response.data,
      url,
    });
  } catch (error) {
    console.log(`error while creating order`, error);
    res.status(400).json({
      error: error.response?.data || error.message,
    });
  }
};

export const createOrderCardHandle = async (req, res) => {
  try {
    const { amount, currency, customer_id } = req.body;

    const response = await revolutClient.post("/api/1.0/orders", {
      amount,
      currency,
      customer_id,
      capture_mode: "MANUAL",
      authorisation_type: "pre_authorisation",
      setup_future_usage: "ON_SESSION",
    });

    const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}&amount=${amount}&method=card`;

    return res.status(200).json({
      success: true,
      payment_method: "card",
      order_id: response.data.id,
      state: response.data.state,
      data: response.data,
      url,
    });
  } catch (error) {
    console.log("error while creating card order", error);
    return res.status(400).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

export const getOrderHandle = async (req, res) => {
  try {
    const id = req.params.id;

    const response = await revolutClient.get(`/api/1.0/orders/${id}`);

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`error getting the order`, error);
    return res
      .status(501)
      .json(new ApiResponse(500, {}, `Internal server error`));
  }
};

export const getCustomerHandle = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await revolutClient.get(`/api/1.0/customers/${id}`);

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`error getting the order`, error);
    return res
      .status(501)
      .json(new ApiResponse(500, {}, `Internal server error`));
  }
};

export const getCustomerPaymentsHandle = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await revolutClient.get(
      `/api/1.0/customers/${id}/payment-methods`,
    );

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`error getting the order`, error);
    return res
      .status(501)
      .json(new ApiResponse(500, {}, `Internal server error`));
  }
};

export const createOrderAuthHandle = async (req, res) => {
  try {
    const { amount, currency, customer_id } = req.body;

    const response = await revolutClient.post("/api/1.0/orders", {
      amount,
      currency,
      customer_id,
      capture_mode: "MANUAL",
      authorisation_type: "pre_authorisation",
      setup_future_usage: "ON_SESSION",
    });

    console.log("response ----->", response);
    const url = `${process.env.FRONTEND_BASE_URL}/checkout?order_public_id=${response.data.public_id}&amount=${amount}`;
    return res.status(200).json({
      order_id: response.data.id,
      status: response.data.status,
      data: response.data,
      url,
    });
  } catch (error) {
    console.log(`error while creating order`, error);
    res.status(400).json({
      error: error.response?.data || error.message,
    });
  }
};

export const capturePaymentHandle = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const response = await revolutClient.post(
      `/api/orders/${orderId}/capture`,
      { amount },
    );

    const message =
      reason === "user_cancelled"
        ? "Cancellation fee captured, remaining amount released to customer"
        : "Full ride payment captured successfully";

    return res.status(200).json({
      success: true,
      message,
      state: response.data.state, // will be "completed"
      captured_amount: amount,
      data: response.data,
    });
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to capture payment",
      error: error.response?.data || error.message,
    });
  }
};

export const releasePaymentHandle = async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const response = await revolutClient.post(
      `/api/1.0/orders/${orderId}/cancel`,
    );

    return res.status(200).json({
      success: true,
      message: "Payment hold released, full amount returned to customer",
      state: response.data.state, // will be "cancelled"
      data: response.data,
    });
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to release payment",
      error: error.response?.data || error.message,
    });
  }
};

// Apple Pay domain registered: {
//   status: 200,
//   applePayRegistrationId: '10155b73-2cbe-4501-b573-1a1c8da8f58a'
// }

// Registered: {
//   status: 200,
//   applePayRegistrationId: '10155b73-2cbe-4501-b573-1a1c8da8f58a'
// }
